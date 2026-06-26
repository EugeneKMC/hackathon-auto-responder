import type { Context } from 'hono';
import { seatService } from '@/services/seat';
import { PaginationQuerySchema } from '@/schemas/pagination';
import { baseOk, paginate, parseSortDirection } from '@/utils/api_response';
import {
  createErrorResponse,
  createValidationErrorResponse,
} from '@/utils/error_response';
import '@/types/hono';

export const seatController = {
  async preview(c: Context) {
    try {
      const { client_id } = c.get('account');
      const { result, error } = await seatService.getSummary(client_id);
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(baseOk(result));
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

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
      const { pageNumber, pageSize, sort, search } = parsed.data;
      const direction = parseSortDirection(sort, 'desc');
      const { result, error } = await seatService.list(
        client_id,
        direction,
        search
      );
      if (error) return c.json({ error }, error.statusCode as 500);
      return c.json(
        paginate(result?.items ?? [], pageNumber, pageSize, 'OK', result?.ai)
      );
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },

  async detail(c: Context) {
    try {
      const { client_id } = c.get('account');
      const { result, error } = await seatService.getById(
        client_id,
        c.req.param('id') ?? ''
      );
      if (error) return c.json({ error }, error.statusCode as 404);
      return c.json(baseOk(result));
    } catch (err) {
      return c.json({ error: createErrorResponse(err) }, 400);
    }
  },
};
