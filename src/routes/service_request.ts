import { Hono } from 'hono';
import { serviceRequestController } from '@/controllers/service_request';
import { requireAuth } from '@/middlewares/auth';

const serviceRequestRoutes = new Hono();

serviceRequestRoutes.use('*', requireAuth);
serviceRequestRoutes.get('/', serviceRequestController.list);
serviceRequestRoutes.post('/', serviceRequestController.create);
serviceRequestRoutes.get('/:id', serviceRequestController.detail);
serviceRequestRoutes.patch('/:id', serviceRequestController.update);

export default serviceRequestRoutes;
