import { Hono } from 'hono';
import { chatController } from '@/controllers/chat';

// Mounted at /api — serves the 3am-client-assistant web chat.
const chatRoutes = new Hono();

chatRoutes.get('/health', chatController.health);
chatRoutes.get('/clients', chatController.listClients);
chatRoutes.post('/chat', chatController.chat);

export default chatRoutes;
