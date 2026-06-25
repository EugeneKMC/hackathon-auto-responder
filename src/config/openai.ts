import OpenAI from 'openai';
import { env } from '@/utils/env';

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env');
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}
