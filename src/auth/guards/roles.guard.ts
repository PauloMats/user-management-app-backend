import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Se não há roles definidos, permite o acesso (JwtAuthGuard já protegeu)
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
        throw new ForbiddenException('Você não tem permissão para acessar este recurso (papel não definido).');
    }
    
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    if (!hasRequiredRole) {
        throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
    }
    return true;
  }
}