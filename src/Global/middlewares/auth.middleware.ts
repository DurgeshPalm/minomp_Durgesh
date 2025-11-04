import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface CustomRequest extends Request {
  id?: string;
  startTime?: number;
  clientInfo?: {
    ip: string;
    userAgent: string;
    acceptLanguage: string;
  };
}

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestMiddleware');

  use(req: CustomRequest, res: Response, next: NextFunction) {
    // 1. Add request ID for tracking
    const requestId = uuidv4(); // Generate UUID first
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId); // Use the guaranteed string value

    // 2. Start time for performance monitoring
    req.startTime = Date.now();

    // 3. Client Information
    req.clientInfo = {
      ip: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      acceptLanguage: req.headers['accept-language'] || 'Unknown'
    };

    // 4. Security Headers
    this.addSecurityHeaders(res);

    // 5. Request Logging
    this.logRequest(req);

    // 6. Response Logging
    res.on('finish', () => {
      const duration = Date.now() - req.startTime!;
      this.logResponse(req, res, duration);
    });

    // 7. Rate Limiting Check (Basic)
    if (this.shouldRateLimit(req)) {
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    next();
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.socket.remoteAddress ||
      'Unknown'
    );
  }

  private addSecurityHeaders(res: Response): void {
    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=()');
  }

  private logRequest(req: CustomRequest): void {
    this.logger.log({
      type: 'Request',
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      body: this.sanitizeBody(req.body),
      clientInfo: req.clientInfo
    });
  }

  private logResponse(req: CustomRequest, res: Response, duration: number): void {
    this.logger.log({
      type: 'Response',
      id: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      method: req.method,
      url: req.url
    });
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private shouldRateLimit(req: Request): boolean {
    // Implement your rate limiting logic here
    // This is a basic example - you might want to use Redis or another solution for production
    const ip = this.getClientIP(req);
    const key = `ratelimit:${ip}`;
    
    // For demonstration - you should implement proper rate limiting
    // Consider using @nestjs/throttler for production
    return false;
  }
}
