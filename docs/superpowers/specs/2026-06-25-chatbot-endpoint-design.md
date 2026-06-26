# Chatbot Endpoint Design

**Date:** 2026-06-25
**Status:** Approved (reconciled design)

## Goal

Restructure the already-built client chat endpoint so it follows the house
layering of the email flow, while keeping the real CSV-backed client dataset it
was built on. The endpoint accepts a multi-turn conversation for a known client
and returns the agent's reply plus structured metadata.

## Context

A working chatbot already exists (ported from a "3am-client-assistant" Express
server): `client_data.ts` (CSV loader), `client_assistant.ts` (read-only
lookups + deterministic keyword fallback), `client_chat_agent.ts` (OpenAI
tool-calling agent with 3 zero-arg tools), `controllers/chat.ts`, `routes/chat.ts`,
and an `app.ts` mount. This design refactors that code toward the email flow's
conventions rather than replacing it.

## Decisions

- **Data source:** Keep the real CSV dataset (`client_data.ts`) and the
  `clientId`-based identity. Tools remain zero-arg and look up by the bound
  `clientId`.
- **Conversation model:** Multi-turn with client-supplied history. The client
  sends `clientId` plus the full `messages` array each request; the server is
  stateless.
- **Agent reuse:** Extract a generic tool-calling loop shared by the email and
  client agents. Each agent supplies its own tools + structured-output schema.
- **Response:** The assistant `reply` plus structured metadata (`intent`,
  `confidence`, `requires_human`, `summary`), using a client-domain intent enum
  (not the 8 email intents).
- **Fallback:** Keep the deterministic keyword fallback as an internal safety
  net inside the service (used when no OpenAI key is configured or the agent
  errors).

## Architecture

```
POST /api/chat -> chat route -> chat controller -> chat service
   -> client chat agent (answerWithAgent) -> shared tool loop -> OpenAI + CSV tools
                                          \-> keyword fallback (no key / agent error)
```

### 1. Shared agent core — refactor `src/agents/email_intent_agent.ts`

Extract the OpenAI tool-calling loop into a generic helper (new module, e.g.
`src/agents/agent_loop.ts`):

```ts
runStructuredToolLoop<T>({
  messages,            // ChatCompletionMessageParam[]
  tools,               // ChatCompletionTool[]
  executeTool,         // (name, args) => string (JSON)
  schema,              // Zod schema for structured output
  schemaName,          // response_format name
  maxIterations = 5,
}): Promise<T>
```

`runEmailIntentAgent` keeps its exact behavior — it builds its messages and
calls the shared loop with the email `TOOLS` + `EmailIntentResultSchema`.

### 2. Client chat agent — refactor `src/agents/client_chat_agent.ts`

- Keep the 3 zero-arg CSV tools (`getLatestInvoice`, `getSeats`,
  `getOpenServiceRequests`) and `runTool(clientId, name)`.
- Build messages from `[system(client), ...history]`.
- Call `runStructuredToolLoop` with these tools + the new
  `ChatResultSchema`, so the agent emits structured output instead of free text.
- Signature: `answerWithAgent(clientId: string, messages: ChatMessage[]): Promise<ChatResult>`.

### 3. New layers

| Layer | File | Role |
|-------|------|------|
| Schema | `src/schemas/chat.ts` | `ChatMessageSchema`, `ChatRequestSchema`, `ChatResultSchema` + inferred types |
| Service | `src/services/chat.ts` | `chatService.processChat({clientId, messages})` -> `ServiceResponse`; validates client exists, calls agent, falls back to keyword answer on no-key/agent error |
| Controller | `src/controllers/chat.ts` | `chatController.chat` -> `safeParse`, call service, map `error.statusCode`; keep `health` + `listClients` |
| Route | `src/routes/chat.ts` | `GET /health`, `GET /clients`, `POST /chat` (unchanged surface) |
| App | `src/app.ts` | `api.route('/', chatRoutes)` (already wired) |

`client_data.ts` and the lookup functions in `client_assistant.ts`
(`getClientProfile`, `getLatestInvoice`, `getSeats`, `getOpenServiceRequests`,
`answerWithFallback`, `routeIntent`) are kept as-is. The agent loop and ad-hoc
validation move out of the controller into the agent/service layers.

### 4. Request / response shape

```jsonc
// POST /api/chat
{
  "clientId": "C001",
  "messages": [
    { "role": "user", "content": "Is my latest invoice paid?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "And how many seats are free?" }
  ]
}

// 200 OK
{
  "reply": "...",
  "intent": "seat_availability",
  "confidence": 0.9,
  "requires_human": false,
  "summary": "...",
  "mode": "agent"        // "agent" | "fallback"
}
```

Validation (`ChatRequestSchema`):

- `clientId`: `z.string().min(1)`.
- `messages`: array, min length 1. Each item `{ role: 'user' | 'assistant', content: z.string().min(1) }`.
- Last message must be `role: 'user'` (via `.refine()`), else 400.

`ChatResultSchema` (structured output + response):

- `reply`: string.
- `intent`: enum `['invoice_status', 'seat_availability', 'service_requests', 'general', 'unknown']`.
- `confidence`: number.
- `requires_human`: boolean.
- `summary`: string.
- `mode` is added by the service (`agent` or `fallback`), not produced by the model.

### 5. Error handling

- `chatService` returns `ServiceResponse.*()` and never throws:
  - unknown `clientId` -> `notFound`.
  - no OpenAI key OR agent throws -> run keyword fallback, return `success` with
    `mode: 'fallback'`. The fallback's `routeIntent` value is mapped to the
    response enum: `invoice -> invoice_status`, `seats -> seat_availability`,
    `service -> service_requests`, `unknown -> general`. Fallback `confidence`
    is a fixed low value (e.g. 0.3) and `requires_human` is `false`.
  - unexpected internal failure -> `internalServerError`.
- Controller: validation failure -> 400 via `createValidationErrorResponse`;
  service error -> `c.json({ error }, error.statusCode)`.

### 6. Testing

`src/services/chat.service.test.ts` (Bun test, mock OpenAI, real CSV loader):

- valid multi-turn for a known client -> `result` has `reply` + metadata,
  `mode: 'agent'`, `error` null.
- unknown `clientId` -> `notFound`.
- OpenAI throws / no key -> `success` with `mode: 'fallback'` and a correct
  keyword answer.
- empty `messages` -> `badRequest` (defense in depth; controller also validates).

## Out of scope (YAGNI)

- No DB persistence or server-side sessions (stateless multi-turn).
- No streaming responses.
- No authentication/authorization.
- No change to the CSV schema, KEY_MAP, or dataset files.
