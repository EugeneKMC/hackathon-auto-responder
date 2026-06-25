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
