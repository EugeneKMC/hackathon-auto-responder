import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/*.ts',
  out: './src/config/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
