import { ExceptionFilter, Catch, ArgumentsHost, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogService } from '../../error-log/error-log.service';

@Catch()
@Injectable()
export class LogExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogService: ErrorLogService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { url, method, body } = request;
    const userId = 2;
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.message || 'Unknown error';

    // Log the error
    await this.errorLogService.logApiCall(
      url,
      method,
      body,
      message,
      true,
      userId
    );

    // Respond with error
    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name || 'Error',
    });
  }
}