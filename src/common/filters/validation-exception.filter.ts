import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationErrorPayload {
  success: false;
  statusCode: number;
  errorCode: 'VALIDATION_ERROR';
  message: string;
  timestamp: string;
  path: string;
  method: string;
  validationErrors: unknown[];
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Validation failed';
    let validationErrors: unknown[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(responseObj.message)) {
        validationErrors = responseObj.message;
        message = 'Validation failed';
      } else {
        message = (responseObj.message as string) ?? exception.message;
      }
    } else {
      message = exception.message;
    }

    const errorResponse: ValidationErrorPayload = {
      success: false,
      statusCode: status,
      errorCode: 'VALIDATION_ERROR',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      validationErrors,
    };

    this.logger.warn(`${request.method} ${request.url} - ${status} - ${message}`, validationErrors);

    response.status(status).json(errorResponse);
  }
}
