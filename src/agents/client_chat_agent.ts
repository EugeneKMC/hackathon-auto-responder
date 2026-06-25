import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import { getOpenAI } from '@/config/openai';
import { env } from '@/utils/env';
import {
  getClientProfile,
  getLatestInvoice,
  getSeats,
  getOpenServiceRequests,
  loadClientData,
  type ChatResult,
} from '@/services/client_assistant';

// Ported from the 3am-client-assistant Express server (agent.js).
// Same three read-only tools, reimplemented with OpenAI tool-calling so it
// matches the house style of email_intent_agent.ts. The client is bound
// server-side, so the tools take no arguments.

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getLatestInvoice',
      description:
        "Get the client's most recent invoice (status, amount, due date).",
      strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSeats',
      description:
        "Get the client's seat counts: total, occupied, available, floor zone.",
      strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOpenServiceRequests',
      description:
        "List the client's open/in-progress service requests and how to raise a new one.",
      strict: true,
      parameters: { type: 'object', additionalProperties: false, properties: {}, required: [] },
    },
  },
];

function runTool(clientId: string, name: string): unknown {
  const data = loadClientData();
  if (name === 'getLatestInvoice') return getLatestInvoice(data, clientId);
  if (name === 'getSeats') return getSeats(data, clientId);
  if (name === 'getOpenServiceRequests')
    return getOpenServiceRequests(data, clientId);
  return { error: `unknown tool ${name}` };
}

export async function answerWithAgent(
  clientId: string,
  message: string
): Promise<ChatResult> {
  const openai = getOpenAI();
  const data = loadClientData();
  const client = getClientProfile(data, clientId);

  const system =
    `You are the client assistant for a workspace & outsourcing provider. ` +
    `You are talking to ${client ? client.companyName : 'a client'} (client_id ${clientId}). ` +
    `You can answer ONLY three topics: latest invoice status, seat availability, and open service requests. ` +
    `ALWAYS call a tool to get real data before answering — never invent numbers. ` +
    `If a tool returns null or an empty list, say so plainly. Keep answers concise and friendly. ` +
    `Amounts are in Philippine pesos (₱).`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: message },
  ];
  let toolUsed = 'none';

  for (let turn = 0; turn < 4; turn++) {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 1024,
      messages,
      tools: TOOLS,
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error('Agent returned no message');

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        if (toolUsed === 'none') toolUsed = tc.function.name;
        const result = runTool(clientId, tc.function.name);
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    const text = (msg.content ?? '').trim();
    return {
      reply:
        text ||
        'I can help with your latest invoice, your seats, or your service requests — which would you like?',
      toolUsed,
    };
  }

  return { reply: "Sorry, I couldn't complete that request.", toolUsed };
}
