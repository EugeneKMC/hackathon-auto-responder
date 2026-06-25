import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import emailRoutes from '@/routes/email';
import processRoutes from '@/routes/email_processing';
import authRoutes from '@/routes/auth';
import invoiceRoutes from '@/routes/invoice';
import seatRoutes from '@/routes/seat';
import serviceRequestRoutes from '@/routes/service_request';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

const api = new Hono();

api.route('/auth', authRoutes);
api.route('/invoices', invoiceRoutes);
api.route('/seats', seatRoutes);
api.route('/service-requests', serviceRequestRoutes);
api.route('/emails', emailRoutes);
api.route('/process', processRoutes);

app.route('/api', api);

export default app;
