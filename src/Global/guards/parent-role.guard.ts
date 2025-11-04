import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ParentRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // This comes from AuthGuard

    if (!user || !user.role) {
      throw new UnauthorizedException('User role not found');
    }

    // Check if user has parent role ('P')
    if (user.role !== 'P') {
      throw new ForbiddenException('Only parents can access this endpoint');
    }

    return true;
  }
}