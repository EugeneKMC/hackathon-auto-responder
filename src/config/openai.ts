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

// Cached liveness check: is OPENAI_API_KEY present AND accepted by OpenAI?
// Uses a cheap models.list() call (no token cost) and caches the verdict so
// health polls and chat requests don't hit the API every time.
let keyValid: boolean | null = null;

export async function isOpenAIKeyValid(): Promise<boolean> {
  if (!env.OPENAI_API_KEY) return false;
  if (keyValid !== null) return keyValid;
  try {
    await getOpenAI().models.list();
    keyValid = true;
  } catch (err) {
    console.warn(
      'OpenAI key validation failed — chat will use fallback mode:',
      err instanceof Error ? err.message : err
    );
    keyValid = false;
  }
  return keyValid;
}
