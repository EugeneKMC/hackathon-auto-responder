import { z } from 'zod';

// Backend owns the category taxonomy — these are the allowed request types.
export const SERVICE_REQUEST_CATEGORIES = [
  'Headcount Change',
  'Facilities',
  'IT Support',
  'Contract Query',
  'Access & Security',
  'Other',
] as const;

export const CreateServiceRequestSchema = z.object({
  subject: z.string().min(1),
  category: z.enum(SERVICE_REQUEST_CATEGORIES),
  priority: z.enum(['low', 'medium', 'high']),
  details: z.string().optional(), // optional extra notes
});

export const UpdateServiceRequestSchema = z
  .object({
    subject: z.string().min(1).optional(),
    category: z.enum(SERVICE_REQUEST_CATEGORIES).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['open', 'in_progress', 'resolved']).optional(),
    details: z.string().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export type CreateServiceRequestPayload = z.infer<
  typeof CreateServiceRequestSchema
>;
export type UpdateServiceRequestPayload = z.infer<
  typeof UpdateServiceRequestSchema
>;
