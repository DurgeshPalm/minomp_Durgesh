import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: any; // Define 'user' property
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token required');
    }

    try {
      const decoded = jwt.verify(token, 'qwertyuiopasdfghjkl');
      req.user = decoded; 
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
