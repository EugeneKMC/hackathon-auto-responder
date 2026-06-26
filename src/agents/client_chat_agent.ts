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

function makeExecuteTool(
  clientId: string
): (name: string, args: ToolArgs) => string {
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
