import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UserType } from 'src/infrastructure/prisma/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
  USER_TYPES_KEY,
  type RequiredPermission,
} from './authorization.decorator';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[AuthorizationGuard] EXECUTED');
    const userTypes = this.getMetadata<UserType[]>(USER_TYPES_KEY, context);
    const requiredRoles = this.getMetadata<string[]>(ROLES_KEY, context);
    const requiredPermissions = this.getMetadata<RequiredPermission[]>(
      PERMISSIONS_KEY,
      context,
    );

    console.log('[AuthorizationGuard] Metadata:', {
    userTypes,
    requiredRoles,
    requiredPermissions,
  });

    if (!userTypes && !requiredRoles && !requiredPermissions) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedException();

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        userRoles: {
          where: { role: { isActive: true, deletedAt: null } },
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: { module: true, action: true, deletedAt: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(user, " USER")
    if (!user) throw new UnauthorizedException();

    const types: UserType[] = [user.userType];
    const roles = user.userRoles.map(({ role }) => role.name);
    const permissions = user.userRoles.flatMap(({ role }) =>
      role.rolePermissions
        .filter(({ permission }) => permission.deletedAt === null)
        .map(({ permission }) => `${permission.module}:${permission.action}`),
    );

    if (userTypes && !userTypes.some((type) => types.includes(type))) {
      throw new ForbiddenException('Your account type cannot access this resource.');
    }
    if (requiredRoles && !requiredRoles.some((role) => roles.includes(role))) {
      throw new ForbiddenException('You do not have a required role.');
    }
    if (
      requiredPermissions?.some(
        ({ module, action }) => !permissions.includes(`${module}:${action}`),
      )
    ) {
      throw new ForbiddenException('You do not have the required permission.');
    }
    return true;
  }

  private getMetadata<T>(key: string, context: ExecutionContext): T | undefined {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
