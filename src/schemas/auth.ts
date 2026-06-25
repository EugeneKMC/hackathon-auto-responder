import { z } from 'zod';

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
