import { Hono } from 'hono';
import { seatController } from '@/controllers/seat';
import { requireAuth } from '@/middlewares/auth';

const seatRoutes = new Hono();

seatRoutes.use('*', requireAuth);
seatRoutes.get('/preview', seatController.preview);
seatRoutes.get('/', seatController.list);
seatRoutes.get('/:id', seatController.detail);

export default seatRoutes;
