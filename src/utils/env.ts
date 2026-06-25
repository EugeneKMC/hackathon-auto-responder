import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    DATABASE_URL: z.string().url().optional(),
    DIRECT_DATABASE_URL: z.string().url().optional(),

    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),

    MS_GRAPH_TENANT_ID: z.string().min(1),
    MS_GRAPH_CLIENT_ID: z.string().min(1),
    MS_GRAPH_CLIENT_SECRET: z.string().min(1).optional(),
    MS_GRAPH_USER_EMAIL: z.string().email(),

    ALLOWED_EMAIL: z.string().optional(),

    EMAIL_POLL_INTERVAL_MS: z.coerce.number().default(30000),
    POLL_LOOKBACK_HOURS: z.coerce.number().default(24),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
