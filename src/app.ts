import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import emailRoutes from '@/routes/email';
import processRoutes from '@/routes/email_processing';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

const api = new Hono();

api.route('/emails', emailRoutes);
api.route('/process', processRoutes);

app.route('/api', api);

export default app;
