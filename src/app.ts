import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import emailRoutes from '@/routes/email';
import processRoutes from '@/routes/email_processing';
import chatRoutes from '@/routes/chat';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

const api = new Hono();

api.route('/emails', emailRoutes);
api.route('/process', processRoutes);
// 3am-client-assistant web chat: /api/health, /api/clients, /api/chat
api.route('/', chatRoutes);

app.route('/api', api);

export default app;
