import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorLogService } from '../../error-log/error-log.service';
import { ThrottlerException } from '@nestjs/throttler';


@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly errorLogService: ErrorLogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

 if (exception instanceof ThrottlerException) {
  await this.errorLogService.logApiCall(
    request.url,
    request.method,
    request.body,
    'Too Many Requests',
    true,
    (request as any).user?.id || null,
  );

  return response.status(429).json({
    resp_code: 429,
    resp_message: 'Too Many Requests',
    errors: ['You have exceeded the allowed request limit. Try again later.'],
  });
}

    // Handle DTO validation errors
    if (exception instanceof BadRequestException) {
      const errorResponse = exception.getResponse() as {
        resp_code: number;
        resp_message: string;
        errors: string[];
      };

      return response.status(HttpStatus.BAD_REQUEST).json({
        resp_code: HttpStatus.BAD_REQUEST || 400,
        resp_message: errorResponse.resp_message || 'Validation Failed',
        errors: errorResponse.errors || ['validation error'],
      });
    }

    if (exception instanceof UnauthorizedException) {
      // Insert log for UnauthorizedException
      await this.errorLogService.logApiCall(
        request.url,
        request.method,
        request.body,
        'Authentication Failed',
        true,
        (request as any).user?.id || null,
      );
      return response.status(HttpStatus.UNAUTHORIZED).json({
        resp_code: HttpStatus.UNAUTHORIZED,
        resp_message: 'Authentication Failed',
        errors: ['Invalid or expired authentication token.'],
      });
    }

    if (exception instanceof ForbiddenException) {
      // Insert log for ForbiddenException
      await this.errorLogService.logApiCall(
        request.url,
        request.method,
        request.body,
        'Unauthorized Access',
        true,
        (request as any).user?.id || null,
      );
      return response.status(HttpStatus.FORBIDDEN).json({
        resp_code: HttpStatus.FORBIDDEN,
        resp_message: 'Unauthorized Access',
        errors: ['Only parents can access this endpoint'],
      });
    }
    // Handle standard HttpException errors
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.error(
        ` [${request.method}] ${request.url} - ${exception.message}`,
      );
      return response.status(status).json({
        statusCode: status,
        message: 'Something went wrong! Please try again later.',
      });
    }



    // Handle database errors (e.g., duplicate entries)
    if (exception instanceof QueryFailedError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Duplicate entry or invalid data provided.',
      });
    }

    // Default Internal Server Error
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong! Please try again later.',
    });
  }
}