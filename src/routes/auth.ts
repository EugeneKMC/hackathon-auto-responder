import { Hono } from 'hono';
import { authController } from '@/controllers/auth';
import { requireAuth } from '@/middlewares/auth';

const authRoutes = new Hono();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', requireAuth, authController.me);

export default authRoutes;
