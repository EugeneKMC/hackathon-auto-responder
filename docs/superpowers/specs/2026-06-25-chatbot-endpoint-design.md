# Chatbot Endpoint Design

**Date:** 2026-06-25
**Status:** Approved (design)

## Goal

Add an HTTP chatbot endpoint to the hackathon-auto-responder that mirrors the
existing email processing flow. It accepts a multi-turn conversation and returns
the agent's reply plus structured metadata, reusing the existing OpenAI intent
agent and its mock tools (invoices, seats).

## Decisions

- **Conversation model:** Multi-turn with client-supplied history. The client
  sends the full `messages` array on every request; the server is stateless
  (no DB, no sessions).
- **Response:** The assistant `reply` plus structured metadata (`intent`,
  `confidence`, `requires_human`, `summary`).
- **Agent reuse (Approach A):** Extract a shared core from the email agent and
  add a thin chat agent on top. No duplication; the email path is untouched
  behaviorally.

## Architecture

Mirrors the email layering. Request flow:

```
POST /api/chat -> chat route -> chat controller -> chat service
   -> chat agent (runChatAgent) -> shared agent core (runAgentLoop) -> OpenAI + tools
```

### 1. Shared agent core — refactor `src/agents/email_intent_agent.ts`

Export reusable pieces so both agents share them:

- `TOOLS` and `executeTool` — the invoice + seat tool definitions and dispatch.
  Unchanged.
- `runAgentLoop(messages: ChatCompletionMessageParam[]): Promise<EmailIntentResult>`
  — the existing 5-iteration tool-calling loop (`openai.beta.chat.completions.parse`
  with `TOOLS` + `EmailIntentResultSchema` response format, tool dispatch, return
  `msg.parsed`). Extracted verbatim from the current `runEmailIntentAgent` body.
- `AGENT_WORKFLOW` — a constant string holding the shared intent list and
  tool-usage rules. Consumed by two thin prompt builders:
  - `buildEmailSystemPrompt()` — current email wording (reply to client emails,
    no signature line, etc.).
  - `buildChatSystemPrompt()` — chat framing ("you are chatting with the client
    in real time"); same workflow + tool rules; instructs the agent to ask for
    the client's email if an invoice lookup is needed and none was provided.

`runEmailIntentAgent(email)` keeps its exact signature and behavior — it builds
`[system(email), user(email)]` and calls `runAgentLoop`.

### 2. New layers

| Layer | File | Role |
|-------|------|------|
| Schema | `src/schemas/chat.ts` | `ChatMessageSchema`, `ChatRequestSchema`, `ChatResponseSchema` + inferred types |
| Agent | `src/agents/chat_agent.ts` | `runChatAgent(messages, clientEmail?)` — builds `[system(chat), ...history]`, calls `runAgentLoop` |
| Service | `src/services/chat.ts` | `chatService.processChat(payload)` — returns `ServiceResponse`, maps the structured result to the response shape |
| Controller | `src/controllers/chat.ts` | `chatController.chat` — `safeParse`, call service, map `error.statusCode`, return JSON |
| Route | `src/routes/chat.ts` | `POST /` -> `chatController.chat` |
| App | `src/app.ts` | `api.route('/chat', chatRoutes)` -> `POST /api/chat` |

### 3. Request / response shape

```jsonc
// POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Do you have desks in Makati?" },
    { "role": "assistant", "content": "Yes, we have..." },
    { "role": "user", "content": "How much per month?" }
  ],
  "client_email": "jane@acme.com"   // optional
}

// 200 OK
{
  "reply": "...",
  "intent": "request_quote",
  "confidence": 0.9,
  "requires_human": false,
  "summary": "..."
}
```

Validation (`ChatRequestSchema`):

- `messages`: array, min length 1. Each item: `{ role: 'user' | 'assistant', content: string (min 1) }`.
- Last message must have `role: 'user'` (enforced via `.refine()`); otherwise 400.
- `client_email`: optional `z.string().email()`. When present it is injected so
  the invoice tool can look up the client; when absent and the user asks about
  invoices, the agent asks for it (per the chat system prompt).

Response (`ChatResponseSchema`): `reply` is the structured result's
`suggested_reply`; `intent`, `confidence`, `requires_human`, `summary` come from
the same `EmailIntentResult`. The email-specific fields (`invoice_numbers`,
`document_types`, `date_range`) are computed by the agent but omitted from the
chat response.

### 4. Error handling

Identical to the email flow:

- Service methods return `ServiceResponse.*()` and never throw. OpenAI/tool
  failures are caught and returned as `internalServerError`; empty/invalid input
  that slips past validation returns `badRequest`.
- Controller: validation failure -> 400 via `createValidationErrorResponse`;
  service error -> `c.json({ error }, error.statusCode)`; unexpected throw ->
  `createErrorResponse` 400.

### 5. Testing

`src/services/chat.service.test.ts` (Bun test, mock OpenAI — not the DB):

- valid multi-turn conversation -> `result` has `reply` + metadata, `error` null.
- empty `messages` -> `badRequest` (defense in depth; controller also validates).
- OpenAI call throws -> `internalServerError`, `result` null.

## Out of scope (YAGNI)

- No DB persistence or server-side sessions (stateless multi-turn by choice).
- No streaming responses.
- No authentication/authorization.
- No `processed_emails`-style logging of chat turns.
