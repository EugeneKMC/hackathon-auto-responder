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
