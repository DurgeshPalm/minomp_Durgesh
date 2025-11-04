import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../common/constants/app.constant';

@Injectable()
export class AuthGuardGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      // ✅ Verify JWT Token
      const decoded: any = jwt.verify(token, SECRET_KEY);
      // Attach user data to request (useful later)
      (request as any).user = decoded;

      // Industry-level: Ensure token belongs to the user making the request
      // Try to get userId from request (body, params, query)
      const userIdFromToken = decoded.id;
      const userIdFromRequest =
        request.body?.userid ||
        request.params?.userid ||
        request.query?.userid;

      if (userIdFromRequest && userIdFromToken !== userIdFromRequest) {
        throw new UnauthorizedException('Token does not belong to this user');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }
}
