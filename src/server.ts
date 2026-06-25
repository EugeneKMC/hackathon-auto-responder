import app from '@/app';
import { env } from '@/utils/env';
import { startEmailPoller } from '@/jobs/email_poller';

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Server running on http://localhost:${server.port}`);

startEmailPoller();
