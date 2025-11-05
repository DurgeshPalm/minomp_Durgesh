import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { ErrorLogService } from '../../error-log/error-log.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private readonly errorLogService: ErrorLogService,
    // private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const skip = this.reflector.get<boolean>('skipApiLogging', context.getHandler());
    // if (skip) return next.handle();
    const request = context.switchToHttp().getRequest();
    const { url, body, method } = request;  // Extract method
    let userId = request.user?.id || null; // Extract userId (assuming it's available via JWT)

    return next.handle().pipe(
      tap(async (response) => {
        // Log successful response
        if (response?.userId) {
          userId = response.userId;  // Override userId from response if available
        }
        await this.errorLogService.logApiCall(url, method, body, response, false, userId);
      }),
      catchError(async (error) => {
        // Log failed response
        await this.errorLogService.logApiCall(url, method, body, error.message, true, userId);
        throw error; // Re-throw error so it can be handled by the exception filter
      }),
    );
  }
}
