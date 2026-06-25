# Chatbot Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing CSV-backed client chat endpoint to follow the email flow's layering — shared OpenAI tool-loop, multi-turn input, structured-output response, and a ServiceResponse-returning service — while keeping the CSV dataset, `clientId` identity, and keyword fallback.

**Architecture:** Extract a generic `runStructuredToolLoop` helper from the email agent; both the email agent and the client chat agent call it with their own tools + Zod result schema. The client chat agent becomes multi-turn (`clientId` + `messages[]`) and emits a structured `ChatResult`. A new `chatService.processChat` wraps the agent and the keyword fallback, returning `ServiceResponse`. The controller validates with Zod `safeParse` and delegates to the service.

**Tech Stack:** Bun, Hono.js, TypeScript, OpenAI SDK (`beta.chat.completions.parse` structured outputs), Zod, `csv-parse`. Bun test runner.

## Global Constraints

- Prettier: single quotes, semicolons, 2-space indent, 80 char width, ES5 trailing commas.
- Use the `@/*` path alias for all `src/` imports.
- snake_case file names; PascalCase types/interfaces; camelCase vars/functions.
- Prefix unused variables with `_`; never use `any` (use `unknown` + narrowing).
- Services return `ServiceResponse.*()` and never throw. Controllers use `safeParse` (never `parse`).
- Zod schemas live in `src/schemas/`; types are inferred from schemas.
- Bun test runner; mock OpenAI (not the database/CSV).
- Run `bun run lint:fix` before each commit.

---

### Task 1: Shared structured tool-loop helper

Extract the OpenAI tool-calling loop into a generic helper and make the email agent use it (no behavior change for email).

**Files:**
- Create: `src/agents/agent_loop.ts`
- Create (test): `src/agents/agent_loop.test.ts`
- Modify: `src/agents/email_intent_agent.ts` (replace inline loop in `runEmailIntentAgent`)

**Interfaces:**
- Produces: `runStructuredToolLoop<T>(opts: RunStructuredToolLoopOptions<T>): Promise<T>` and `type ToolArgs = Record<string, unknown>`.
  - `RunStructuredToolLoopOptions<T> = { messages: ChatCompletionMessageParam[]; tools: ChatCompletionTool[]; executeTool: (name: string, args: ToolArgs) => string; schema: z.ZodType<T>; schemaName: string; maxIterations?: number }`

- [ ] **Step 1: Write the failing test**

Create `src/agents/agent_loop.test.ts`:

```typescript
import { describe, it, expect, mock } from 'bun:test';
import { z } from 'zod';

describe('runStructuredToolLoop', () => {
  it('executes tool calls then returns the parsed structured result', async () => {
    let step = 0;
    const parse = mock(async () => {
      step += 1;
      if (step === 1) {
        return {
          choices: [
            {
              message: {
                tool_calls: [
                  { id: 't1', function: { name: 'echo', arguments: '{}' } },
                ],
                parsed: null,
              },
            },
          ],
        };
      }
      return {
        choices: [{ message: { tool_calls: [], parsed: { ok: true } } }],
      };
    });

    mock.module('@/config/openai', () => ({
      getOpenAI: () => ({ beta: { chat: { completions: { parse } } } }),
    }));

    const { runStructuredToolLoop } = await import('@/agents/agent_loop');

    let executed = '';
    const result = await runStructuredToolLoop<{ ok: boolean }>({
      messages: [{ role: 'user', content: 'hi' }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'echo',
            strict: true,
            parameters: {
              type: 'object',
              additionalProperties: false,
              properties: {},
              required: [],
            },
          },
        },
      ],
      executeTool: (name) => {
        executed = name;
        return '{}';
      },
      schema: z.object({ ok: z.boolean() }),
      schemaName: 'test',
    });

    expect(executed).toBe('echo');
    expect(result).toEqual({ ok: true });
    expect(parse).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test src/agents/agent_loop.test.ts`
Expected: FAIL — `Cannot find module '@/agents/agent_loop'` (or resolve error).

- [ ] **Step 3: Create the helper**

Create `src/agents/agent_loop.ts`:

```typescript
import { zodResponseFormat } from 'openai/helpers/zod';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import type { z } from 'zod';

import { getOpenAI } from '@/config/openai';
import { env } from '@/utils/env';

export type ToolArgs = Record<string, unknown>;

export type RunStructuredToolLoopOptions<T> = {
  messages: ChatCompletionMessageParam[];
  tools: ChatCompletionTool[];
  executeTool: (name: string, args: ToolArgs) => string;
  schema: z.ZodType<T>;
  schemaName: string;
  maxIterations?: number;
};

export async function runStructuredToolLoop<T>({
  messages,
  tools,
  executeTool,
  schema,
  schemaName,
  maxIterations = 5,
}: RunStructuredToolLoopOptions<T>): Promise<T> {
  const openai = getOpenAI();

  for (let i = 0; i < maxIterations; i++) {
    const completion = await openai.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      messages,
      tools,
      response_format: zodResponseFormat(schema, schemaName),
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error('Agent returned no message');

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments) as ToolArgs;
        const result = executeTool(tc.function.name, args);
        messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
      continue;
    }

    if (msg.parsed) return msg.parsed as T;

    const refusal = msg.refusal;
    throw new Error(
      refusal
        ? `Agent refused: ${refusal}`
        : 'Agent returned no tool call and no parsed result'
    );
  }

  throw new Error(`Agent exceeded ${maxIterations} iterations`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test src/agents/agent_loop.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Refactor `email_intent_agent.ts` to use the helper**

In `src/agents/email_intent_agent.ts`:

1. Remove the now-unused imports `zodResponseFormat`, `getOpenAI`, and `env` (keep `ChatCompletionMessageParam`, `ChatCompletionTool`, the service imports, and the schema imports). Add:

```typescript
import { runStructuredToolLoop, type ToolArgs } from '@/agents/agent_loop';
```

2. Change the local `type ToolArgs = Record<string, unknown>;` line to use the imported one — delete the local declaration (it is now imported).

3. Replace the entire body of `runEmailIntentAgent` (the `const openai = ...` line through the final `throw`) with:

```typescript
export async function runEmailIntentAgent(
  email: ProcessEmailPayload
): Promise<EmailIntentResult> {
  const userMessage = `From: ${email.from.name} <${email.from.address}>
Subject: ${email.subject}

${email.body}`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userMessage },
  ];

  return runStructuredToolLoop<EmailIntentResult>({
    messages,
    tools: TOOLS,
    executeTool,
    schema: EmailIntentResultSchema,
    schemaName: 'email_intent',
  });
}
```

`TOOLS`, `executeTool`, and `buildSystemPrompt` stay as-is. `executeTool`'s signature already matches `(name: string, args: ToolArgs) => string`.

- [ ] **Step 6: Verify the whole suite + lint still pass**

Run: `bun test && bun run lint`
Expected: tests PASS, lint reports no errors. (If lint flags an unused import in `email_intent_agent.ts`, remove it.)

- [ ] **Step 7: Commit**

```bash
bun run lint:fix
git add src/agents/agent_loop.ts src/agents/agent_loop.test.ts src/agents/email_intent_agent.ts
git commit -m "refactor: extract shared runStructuredToolLoop used by email agent"
```

---

### Task 2: Chat schemas

Define the request/result Zod schemas and inferred types for the chat endpoint.

**Files:**
- Create: `src/schemas/chat.ts`
- Create (test): `src/schemas/chat.test.ts`

**Interfaces:**
- Produces:
  - `ChatMessageSchema`, `type ChatMessage = { role: 'user' | 'assistant'; content: string }`
  - `ChatRequestSchema`, `type ChatRequest = { clientId: string; messages: ChatMessage[] }`
  - `ChatResultSchema`, `type ChatResult = { reply: string; intent: 'invoice_status' | 'seat_availability' | 'service_requests' | 'general' | 'unknown'; confidence: number; requires_human: boolean; summary: string }`
  - `type ChatMode = 'agent' | 'fallback'`
  - `type ChatResponse = ChatResult & { mode: ChatMode }`

- [ ] **Step 1: Write the failing test**

Create `src/schemas/chat.test.ts`:

```typescript
import { describe, it, expect } from 'bun:test';
import { ChatRequestSchema } from '@/schemas/chat';

describe('ChatRequestSchema', () => {
  it('accepts a valid multi-turn request ending with a user message', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
        { role: 'user', content: 'is my invoice paid?' },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects when the last message is not from the user', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [{ role: 'assistant', content: 'hello' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an empty messages array', () => {
    const parsed = ChatRequestSchema.safeParse({
      clientId: 'C001',
      messages: [],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing clientId', () => {
    const parsed = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test src/schemas/chat.test.ts`
Expected: FAIL — cannot resolve `@/schemas/chat`.

- [ ] **Step 3: Create the schema file**

Create `src/schemas/chat.ts`:

```typescript
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z
  .object({
    clientId: z.string().min(1),
    messages: z.array(ChatMessageSchema).min(1),
  })
  .refine(
    (data) => data.messages[data.messages.length - 1]?.role === 'user',
    { message: 'The last message must have role "user"', path: ['messages'] }
  );

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResultSchema = z.object({
  reply: z.string(),
  intent: z.enum([
    'invoice_status',
    'seat_availability',
    'service_requests',
    'general',
    'unknown',
  ]),
  confidence: z.number(),
  requires_human: z.boolean(),
  summary: z.string(),
});

export type ChatResult = z.infer<typeof ChatResultSchema>;

export type ChatMode = 'agent' | 'fallback';

export type ChatResponse = ChatResult & { mode: ChatMode };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test src/schemas/chat.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
bun run lint:fix
git add src/schemas/chat.ts src/schemas/chat.test.ts
git commit -m "feat: add chat request/result Zod schemas"
```

---

### Task 3: Multi-turn structured client chat agent

Refactor `client_chat_agent.ts` to accept a message history, run through the shared loop, and emit a structured `ChatResult`.

**Files:**
- Modify: `src/agents/client_chat_agent.ts` (rewrite `answerWithAgent`, keep the 3 tools)
- Create (test): `src/agents/client_chat_agent.test.ts`

**Interfaces:**
- Consumes: `runStructuredToolLoop` + `ToolArgs` (Task 1); `ChatResultSchema`, `ChatResult`, `ChatMessage` (Task 2); `getClientProfile`, `getLatestInvoice`, `getSeats`, `getOpenServiceRequests`, `loadClientData` (existing `client_assistant.ts`).
- Produces: `answerWithAgent(clientId: string, history: ChatMessage[]): Promise<ChatResult>`.

- [ ] **Step 1: Write the failing test**

Create `src/agents/client_chat_agent.test.ts`:

```typescript
import { describe, it, expect, mock } from 'bun:test';

describe('answerWithAgent', () => {
  it('passes the message history to the loop and returns the structured result', async () => {
    let received: { schemaName?: string; messageCount?: number } = {};

    mock.module('@/agents/agent_loop', () => ({
      runStructuredToolLoop: async (opts: {
        schemaName: string;
        messages: unknown[];
      }) => {
        received = {
          schemaName: opts.schemaName,
          messageCount: opts.messages.length,
        };
        return {
          reply: 'You have 3 seats free.',
          intent: 'seat_availability',
          confidence: 0.9,
          requires_human: false,
          summary: 'seats',
        };
      },
    }));

    const { answerWithAgent } = await import('@/agents/client_chat_agent');
    const { loadClientData } = await import('@/services/client_assistant');
    const clientId = String(loadClientData().clients[0]!.clientId);

    const result = await answerWithAgent(clientId, [
      { role: 'user', content: 'how many seats are free?' },
    ]);

    expect(result.intent).toBe('seat_availability');
    expect(result.reply).toContain('seats');
    expect(received.schemaName).toBe('client_chat_result');
    // system prompt + 1 history message
    expect(received.messageCount).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test src/agents/client_chat_agent.test.ts`
Expected: FAIL — current `answerWithAgent` signature is `(clientId, message: string)` and returns `{ reply, toolUsed }`, so `result.intent` is undefined and `messageCount` assertion fails.

- [ ] **Step 3: Rewrite `client_chat_agent.ts`**

Replace the entire contents of `src/agents/client_chat_agent.ts` with:

```typescript
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import { runStructuredToolLoop, type ToolArgs } from '@/agents/agent_loop';
import {
  getClientProfile,
  getLatestInvoice,
  getSeats,
  getOpenServiceRequests,
  loadClientData,
} from '@/services/client_assistant';
import {
  ChatResultSchema,
  type ChatResult,
  type ChatMessage,
} from '@/schemas/chat';

// Ported from the 3am-client-assistant Express server (agent.js), now using
// the shared structured tool loop. The client is bound server-side, so the
// tools take no arguments.

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getLatestInvoice',
      description:
        "Get the client's most recent invoice (status, amount, due date).",
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSeats',
      description:
        "Get the client's seat counts: total, occupied, available, floor zone.",
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOpenServiceRequests',
      description:
        "List the client's open/in-progress service requests and how to raise a new one.",
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {},
        required: [],
      },
    },
  },
];

function makeExecuteTool(clientId: string): (
  name: string,
  args: ToolArgs
) => string {
  const data = loadClientData();
  return (name: string, _args: ToolArgs): string => {
    if (name === 'getLatestInvoice')
      return JSON.stringify(getLatestInvoice(data, clientId));
    if (name === 'getSeats') return JSON.stringify(getSeats(data, clientId));
    if (name === 'getOpenServiceRequests')
      return JSON.stringify(getOpenServiceRequests(data, clientId));
    return JSON.stringify({ error: `unknown tool ${name}` });
  };
}

export async function answerWithAgent(
  clientId: string,
  history: ChatMessage[]
): Promise<ChatResult> {
  const data = loadClientData();
  const client = getClientProfile(data, clientId);

  const system =
    `You are the client assistant for a workspace & outsourcing provider. ` +
    `You are talking to ${client ? client.companyName : 'a client'} (client_id ${clientId}). ` +
    `You can answer ONLY three topics: latest invoice status, seat availability, and open service requests. ` +
    `ALWAYS call a tool to get real data before answering — never invent numbers. ` +
    `If a tool returns null or an empty list, say so plainly. Keep answers concise and friendly. ` +
    `Amounts are in Philippine pesos (₱). ` +
    `Classify the conversation intent as one of: invoice_status, seat_availability, ` +
    `service_requests, general, unknown. Put your answer to the client in "reply".`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...history.map(
      (m): ChatCompletionMessageParam => ({
        role: m.role,
        content: m.content,
      })
    ),
  ];

  return runStructuredToolLoop<ChatResult>({
    messages,
    tools: TOOLS,
    executeTool: makeExecuteTool(clientId),
    schema: ChatResultSchema,
    schemaName: 'client_chat_result',
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test src/agents/client_chat_agent.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
bun run lint:fix
git add src/agents/client_chat_agent.ts src/agents/client_chat_agent.test.ts
git commit -m "feat: make client chat agent multi-turn with structured output"
```

---

### Task 4: Chat service with fallback

Add a `ServiceResponse`-returning service that validates the client, runs the agent, and falls back to the keyword answerer on no-key/agent error. Rename the fallback's loose result type for clarity.

**Files:**
- Create: `src/services/chat.ts`
- Create (test): `src/services/chat.service.test.ts`
- Modify: `src/services/client_assistant.ts` (rename exported type `ChatResult` -> `FallbackResult` to avoid clashing with the schema's `ChatResult`)

**Interfaces:**
- Consumes: `answerWithAgent` (Task 3); `loadClientData`, `getClientProfile`, `answerWithFallback`, `routeIntent` (existing `client_assistant.ts`); `ChatMessage`, `ChatResponse` (Task 2); `ServiceResponse` (`src/utils/service_response.ts`).
- Produces: `chatService.processChat(payload: { clientId: string; messages: ChatMessage[] }): Promise<ServiceResult<ChatResponse>>`.

- [ ] **Step 1: Rename the fallback result type**

In `src/services/client_assistant.ts`:

1. Change `export type ChatResult = { reply: string; toolUsed: string };` to:

```typescript
export type FallbackResult = { reply: string; toolUsed: string };
```

2. Update the two function return type annotations that referenced it: `answerWithFallback(...)` is declared `: ChatResult` — change to `: FallbackResult`. (It is the only function annotated with that type.) Leave the function bodies unchanged.

- [ ] **Step 2: Write the failing test**

Create `src/services/chat.service.test.ts`:

```typescript
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { ChatResult } from '@/schemas/chat';

// Mutable agent implementation so each test controls agent success/failure.
let agentImpl: (clientId: string, history: unknown[]) => Promise<ChatResult>;

mock.module('@/agents/client_chat_agent', () => ({
  answerWithAgent: (clientId: string, history: unknown[]) =>
    agentImpl(clientId, history),
}));

const { chatService } = await import('@/services/chat');
const { loadClientData } = await import('@/services/client_assistant');

const knownClientId = String(loadClientData().clients[0]!.clientId);

describe('chatService.processChat', () => {
  beforeEach(() => {
    agentImpl = async () => ({
      reply: 'Your latest invoice INV-1 is paid.',
      intent: 'invoice_status',
      confidence: 0.95,
      requires_human: false,
      summary: 'invoice paid',
    });
  });

  it('returns the agent result with mode "agent" for a known client', async () => {
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [{ role: 'user', content: 'is my invoice paid?' }],
    });
    expect(error).toBeNull();
    expect(result?.mode).toBe('agent');
    expect(result?.intent).toBe('invoice_status');
    expect(result?.reply).toContain('invoice');
  });

  it('returns notFound for an unknown clientId', async () => {
    const { result, error } = await chatService.processChat({
      clientId: 'DOES-NOT-EXIST',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(result).toBeNull();
    expect(error?.statusCode).toBe(404);
  });

  it('falls back to the keyword answerer when the agent throws', async () => {
    agentImpl = async () => {
      throw new Error('no api key');
    };
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [{ role: 'user', content: 'how many seats are available?' }],
    });
    expect(error).toBeNull();
    expect(result?.mode).toBe('fallback');
    expect(result?.intent).toBe('seat_availability');
    expect(typeof result?.reply).toBe('string');
    expect(result?.reply.length).toBeGreaterThan(0);
  });

  it('returns badRequest when there is no user message', async () => {
    const { result, error } = await chatService.processChat({
      clientId: knownClientId,
      messages: [],
    });
    expect(result).toBeNull();
    expect(error?.statusCode).toBe(400);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun test src/services/chat.service.test.ts`
Expected: FAIL — cannot resolve `@/services/chat`.

- [ ] **Step 4: Create the service**

Create `src/services/chat.ts`:

```typescript
import { ServiceResponse } from '@/utils/service_response';
import {
  loadClientData,
  getClientProfile,
  answerWithFallback,
  routeIntent,
} from '@/services/client_assistant';
import { answerWithAgent } from '@/agents/client_chat_agent';
import type { ChatMessage, ChatResponse } from '@/schemas/chat';

const FALLBACK_INTENT_MAP: Record<string, ChatResponse['intent']> = {
  invoice: 'invoice_status',
  seats: 'seat_availability',
  service: 'service_requests',
  unknown: 'general',
};

export const chatService = {
  async processChat(payload: { clientId: string; messages: ChatMessage[] }) {
    const { clientId, messages } = payload;
    try {
      const data = loadClientData();
      if (!getClientProfile(data, clientId)) {
        return ServiceResponse.notFound('Unknown clientId');
      }

      const lastUser = [...messages]
        .reverse()
        .find((m) => m.role === 'user');
      if (!lastUser) {
        return ServiceResponse.badRequest(
          'messages must contain a user message'
        );
      }

      // Try the live agent first; fall back on missing key or agent error.
      try {
        const result = await answerWithAgent(clientId, messages);
        return ServiceResponse.success<ChatResponse>({
          ...result,
          mode: 'agent',
        });
      } catch {
        // fall through to deterministic fallback below
      }

      const fb = answerWithFallback(data, clientId, lastUser.content);
      const intent =
        FALLBACK_INTENT_MAP[routeIntent(lastUser.content)] ?? 'general';
      return ServiceResponse.success<ChatResponse>({
        reply: fb.reply,
        intent,
        confidence: 0.3,
        requires_human: false,
        summary: fb.reply.slice(0, 140),
        mode: 'fallback',
      });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to process chat',
        err instanceof Error ? err.message : err
      );
    }
  },
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun test src/services/chat.service.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Run the full suite + lint**

Run: `bun test && bun run lint`
Expected: all tests PASS; lint clean. (`client_chat_agent.ts` no longer imports the renamed type, so the rename should not break it.)

- [ ] **Step 7: Commit**

```bash
bun run lint:fix
git add src/services/chat.ts src/services/chat.service.test.ts src/services/client_assistant.ts
git commit -m "feat: add chatService.processChat with agent + keyword fallback"
```

---

### Task 5: Controller wiring

Refactor the chat controller to validate with Zod `safeParse` and delegate to `chatService`, keeping the `health` and `listClients` handlers.

**Files:**
- Modify: `src/controllers/chat.ts`
- (No change needed to `src/routes/chat.ts` or `src/app.ts` — the route surface and mount are unchanged.)

**Interfaces:**
- Consumes: `ChatRequestSchema` (Task 2); `chatService.processChat` (Task 4); `createValidationErrorResponse` (`src/utils/error_response.ts`); `loadClientData` (existing).

- [ ] **Step 1: Rewrite the controller**

Replace the entire contents of `src/controllers/chat.ts` with:

```typescript
import type { Context } from 'hono';
import { loadClientData } from '@/services/client_assistant';
import { chatService } from '@/services/chat';
import { ChatRequestSchema } from '@/schemas/chat';
import { createValidationErrorResponse } from '@/utils/error_response';

export const chatController = {
  health(c: Context) {
    return c.json({ ok: true });
  },

  listClients(c: Context) {
    const data = loadClientData();
    return c.json(
      data.clients.map((cl) => ({
        clientId: cl.clientId,
        companyName: cl.companyName,
        preferredChannel: cl.preferredChannel,
      }))
    );
  },

  async chat(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: createValidationErrorResponse(parsed.error) },
        400
      );
    }

    const { result, error } = await chatService.processChat(parsed.data);
    if (error) return c.json({ error }, error.statusCode as 400);
    return c.json(result);
  },
};
```

- [ ] **Step 2: Verify build + suite + lint**

Run: `bun test && bun run lint`
Expected: all tests PASS; lint clean. (The old `answerWithAgent`/`answerWithFallback`/`env`/`USE_AGENT` imports are gone from the controller.)

- [ ] **Step 3: Manual smoke test (fallback path, no OpenAI needed)**

In one terminal: `OPENAI_API_KEY= bun run dev` (empty key forces the fallback path).
In another terminal, get a real client id and call the endpoint:

```bash
CID=$(curl -s localhost:8081/api/clients | bun -e 'const d=await Bun.stdin.json(); console.log(d[0].clientId)')
curl -s -X POST localhost:8081/api/chat \
  -H 'content-type: application/json' \
  -d "{\"clientId\":\"$CID\",\"messages\":[{\"role\":\"user\",\"content\":\"how many seats are available?\"}]}"
```

Expected: JSON like `{"reply":"...","intent":"seat_availability","confidence":0.3,"requires_human":false,"summary":"...","mode":"fallback"}`. Also verify an invalid body returns 400:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8081/api/chat \
  -H 'content-type: application/json' -d '{"clientId":"x","messages":[]}'
```

Expected: `400`. Stop the dev server (Ctrl-C).

- [ ] **Step 4: Commit**

```bash
bun run lint:fix
git add src/controllers/chat.ts
git commit -m "refactor: chat controller uses Zod safeParse + chatService"
```

---

### Task 6: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full suite**

Run: `bun test`
Expected: all tests PASS (agent_loop, chat schema, client_chat_agent, chat service).

- [ ] **Step 2: Lint the whole project**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Confirm the email flow is unaffected**

Run: `bun test src/agents/agent_loop.test.ts` and re-read `src/agents/email_intent_agent.ts` to confirm `runEmailIntentAgent` still returns `EmailIntentResult` via the shared loop. (No behavioral change to `/api/process/*`.)

---

## Notes for the implementer

- The chat endpoint surface stays `GET /api/health`, `GET /api/clients`, `POST /api/chat` (mounted via `api.route('/', chatRoutes)` in `app.ts`).
- `client_data.ts`, the CSV files under `data/`, and the lookup functions in `client_assistant.ts` are intentionally unchanged.
- Structured output requires `model` support for `response_format` — the configured `OPENAI_MODEL` (`gpt-4o-mini`) supports it.
- If `bun test` picks up an ambient `OPENAI_API_KEY`, the chat service tests still pass because they mock `answerWithAgent` directly (the real OpenAI client is never called).
