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

    // Mock-auth JWT signing. Defaults are dev-only — override in production.
    JWT_SECRET: z.string().min(1).default('dev-mock-secret-change-me'),
    JWT_EXPIRES_IN_SECONDS: z.coerce.number().default(60 * 60 * 24 * 7),

    EMAIL_POLL_INTERVAL_MS: z.coerce.number().default(30000),
    POLL_LOOKBACK_HOURS: z.coerce.number().default(24),

    // Overrides the chatbot's CSV data directory (defaults to ./data).
    DATA_DIR: z.string().optional(),
  },
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
