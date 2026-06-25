import { Hono } from 'hono';
import { emailProcessingController } from '@/controllers/email_processing';

const processRoutes = new Hono();

processRoutes.post('/email-mock', emailProcessingController.processMock);
processRoutes.post(
  '/simulate-inbound',
  emailProcessingController.simulateInbound
);

export default processRoutes;
