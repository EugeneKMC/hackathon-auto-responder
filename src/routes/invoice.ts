import { Hono } from 'hono';
import { invoiceController } from '@/controllers/invoice';
import { requireAuth } from '@/middlewares/auth';

const invoiceRoutes = new Hono();

invoiceRoutes.use('*', requireAuth);
invoiceRoutes.get('/preview', invoiceController.preview);
invoiceRoutes.get('/', invoiceController.list);
invoiceRoutes.get('/:id', invoiceController.detail);

export default invoiceRoutes;
