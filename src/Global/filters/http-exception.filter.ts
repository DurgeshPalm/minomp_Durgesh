import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error('Exception occurred:', exception);

    // Handle DTO validation errors
    if (exception instanceof BadRequestException) {
      const errorResponse = exception.getResponse() as {
        resp_code: number;
        resp_message: string;
        errors: string[];
      };

      return response.status(HttpStatus.BAD_REQUEST).json({
        resp_code: errorResponse.resp_code || 400,
        resp_message: errorResponse.resp_message || 'Validation Failed',
        errors: errorResponse.errors || ['validation error'],
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
