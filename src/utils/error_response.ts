import type { ZodError } from 'zod';

export const createValidationErrorResponse = (error: ZodError) => ({
  message: 'Validation failed',
  details: error.flatten(),
});

export const createErrorResponse = (error: unknown) => {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Unknown error' };
};
