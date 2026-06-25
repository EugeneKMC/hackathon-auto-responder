import { Hono } from 'hono';
import { emailController } from '@/controllers/email';

const emailRoutes = new Hono();

emailRoutes.get('/unread', emailController.listUnread);
emailRoutes.get('/recent', emailController.listRecent);
emailRoutes.get('/:id', emailController.getById);
emailRoutes.post('/:id/read', emailController.markAsRead);
emailRoutes.post('/:id/reply', emailController.reply);
emailRoutes.post('/send', emailController.send);

export default emailRoutes;
