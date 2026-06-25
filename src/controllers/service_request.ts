import type { Context } from 'hono';
import { serviceRequestService } from '@/services/service_request';
import { PaginationQuerySchema } from '@/schemas/pagination';
import {
  CreateServiceRequestSchema,
  UpdateServiceRequestSchema,
} from '@/schemas/service_request';
import { baseOk, paginate, parseSortDirection } from '@/utils/api_response';
import {
  createErrorResponse,
  createValidationErrorResponse,
} from '@/utils/error_response';
import '@/types/hono';

export const serviceRequestController = {
  async list(c: Context) {
    try {
      const { client_id } = c.get('account');
      const parsed = PaginationQuerySchema.safeParse(c.req.query());
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { pageNumber, pageSize, sort } = parsed.data;
      const direction = parseSortDirection(sort, 'desc');
      const { result, error } = await serviceRequestService.list(
        client_id,
        direction
      );
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(paginate(result ?? [], pageNumber, pageSize));
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async detail(c: Context) {
    try {
      const { client_id } = c.get('account');
      const { result, error } = await serviceRequestService.getById(
        client_id,
        c.req.param('id') ?? ''
      );
      if (error) return c.json({ error }, error.statusCode as 404);
      return c.json(baseOk(result));
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async create(c: Context) {
    try {
      const { client_id } = c.get('account');
      const body = await c.req.json();
      const parsed = CreateServiceRequestSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await serviceRequestService.create(
        client_id,
        parsed.data
      );
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(baseOk(result, 'Created'), 201);
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async update(c: Context) {
    try {
      const { client_id } = c.get('account');
      const body = await c.req.json();
      const parsed = UpdateServiceRequestSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          { error: createValidationErrorResponse(parsed.error) },
          400
        );
      }
      const { result, error } = await serviceRequestService.update(
        client_id,
        c.req.param('id') ?? '',
        parsed.data
      );
      if (error) return c.json({ error }, error.statusCode as 404);
      return c.json(baseOk(result, 'Updated'));
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },
};
