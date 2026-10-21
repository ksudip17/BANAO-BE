import { SetMetadata } from '@nestjs/common';
import type {
  Module as PermissionModule,
  UserType,
} from 'src/infrastructure/prisma/generated/prisma/enums';

export const IS_PUBLIC_KEY = 'isPublic';
export const USER_TYPES_KEY = 'userTypes';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  module: PermissionModule;
  action: string;
}

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const UserTypes = (...types: UserType[]) =>
  SetMetadata(USER_TYPES_KEY, types);
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
