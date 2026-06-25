export type ServiceError = {
  message: string;
  statusCode: number;
  details?: unknown;
};

export type ServiceResult<T> = {
  result: T | null;
  error: ServiceError | null;
};

export class ServiceResponse {
  static success<T>(result: T): ServiceResult<T> {
    return { result, error: null };
  }

  static badRequest(message: string, details?: unknown): ServiceResult<never> {
    return { result: null, error: { message, statusCode: 400, details } };
  }

  static unauthorized(message = 'Unauthorized'): ServiceResult<never> {
    return { result: null, error: { message, statusCode: 401 } };
  }

  static forbidden(message = 'Forbidden'): ServiceResult<never> {
    return { result: null, error: { message, statusCode: 403 } };
  }

  static notFound(message = 'Not found'): ServiceResult<never> {
    return { result: null, error: { message, statusCode: 404 } };
  }

  static internalServerError(
    message = 'Internal server error',
    details?: unknown
  ): ServiceResult<never> {
    return { result: null, error: { message, statusCode: 500, details } };
  }
}
