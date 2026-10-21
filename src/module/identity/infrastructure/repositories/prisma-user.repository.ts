import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, type User as PrismaUser } from 'src/infrastructure/prisma/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PrismaBaseRepository } from 'src/module/shared/infrastructure/database/prisma-base.repository';
import { UserStatus } from 'src/infrastructure/prisma/generated/prisma/enums';
import type { PrismaTx } from 'src/module/shared/domain/transaction.types';

import { User } from '../../domain/entity/user.entity';
import {
  EmailAlreadyExistsError,
  InvalidRegistrationError,
  UserNotFoundError,
  UserRepository,
} from '../../domain/repositories/user.repository';

type UserDelegate = PrismaService['client']['user'];

@Injectable()
export class PrismaUserRepository
  extends PrismaBaseRepository<
    User,
    Prisma.UserWhereUniqueInput,
    Prisma.UserWhereInput,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput,
    PrismaUser,
    UserDelegate
  >
  implements UserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected model(tx?: PrismaTx): UserDelegate {
    return tx ? tx.user : this.prisma.client.user;
  }

  protected toCreateInput(user: User): Prisma.UserCreateInput {
    const { properties } = user;
    return {
      id: properties.id,
      fullName: properties.fullName,
      email: properties.email,
      phone: properties.phone,
      password: properties.password,
      avatar: properties.avatar,
      userType: properties.userType,
      twoFactorAuthEnabled: properties.twoFactorAuthEnabled,
    };
  }

  protected toUpdateInput(user: User): Prisma.UserUpdateInput {
    const { properties } = user;
    return {
      fullName: properties.fullName,
      email: properties.email,
      phone: properties.phone,
      password: properties.password,
      avatar: properties.avatar,
      userType: properties.userType,
      twoFactorAuthEnabled: properties.twoFactorAuthEnabled,
      updatedAt: new Date(),};
  }

  protected whereById(id: string): Prisma.UserWhereUniqueInput {
    return { id };
  }

  protected whereByEntity(user: User): Prisma.UserWhereUniqueInput {
    return { id: user.id };
  }

  protected toDomain(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      password: raw.password,
      avatar: raw.avatar,
      status: raw.status,
      userType: raw.userType,
      twoFactorAuthEnabled: raw.twoFactorAuthEnabled,
      emailVerifiedAt: raw.emailVerifiedAt,
      phoneVerifiedAt: raw.phoneVerifiedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({ email });
  }

  async markEmailVerified(id: string): Promise<User> {
    const user = await this.prisma.client.user.update({
      where: { id },
      data: {
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      },
    });
    return this.toDomain(user);
  }

  async createCustomer(
    user: User,
    address: { label: string; fullAddress: string; latitude: number; longitude: number },
  ): Promise<User> {
    this.validateCoordinates(address.latitude, address.longitude);
    try {
      const created = await this.prisma.client.$transaction(async (tx) => {
        const customerUser = await tx.user.create({
          data: {
            ...this.toCreateInput(user),
            customer: { create: {} },
          },
          include: { customer: true },
        });

        if (!customerUser.customer) {
          throw new Error('Customer profile was not created.');
        }

        await tx.$executeRaw`
          INSERT INTO "customer_addresses"
            ("id", "customer_id", "label", "full_address", "location_geometry", "created_at", "updated_at")
          VALUES (
            ${randomUUID()},
            ${customerUser.customer.id},
            ${address.label},
            ${address.fullAddress},
            ST_SetSRID(ST_MakePoint(${address.longitude}, ${address.latitude}), 4326),
            NOW(),
            NOW()
          )
        `;

        return customerUser;
      });

      return this.toDomain(created);
    } catch (error) {
      this.mapUniqueConstraintError(error);
      throw error;
    }
  }

  async createEmployee(
    user: User,
    profile: { employeeCode: string; department: string },
  ): Promise<User> {
    return this.createRoleUser(user, { adminEmployee: { create: profile } });
  }

  async createProvider(
    user: User,
    profile: {
      experience: string;
      workingLocationAddress?: string;
      serviceRadiusKm?: number;
      hourlyRate?: number;
      workingLocationLatitude?: number;
      workingLocationLongitude?: number;
    },
  ): Promise<User> {
    const hasLatitude = profile.workingLocationLatitude !== undefined;
    const hasLongitude = profile.workingLocationLongitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      throw new InvalidRegistrationError(
        'Provider latitude and longitude must be provided together.',
      );
    }
    if (hasLatitude && hasLongitude) {
      this.validateCoordinates(
        profile.workingLocationLatitude!,
        profile.workingLocationLongitude!,
      );
    }

    try {
      const created = await this.prisma.client.$transaction(async (tx) => {
        const providerUser = await tx.user.create({
          data: {
            ...this.toCreateInput(user),
            provider: {
              create: {
                experience: profile.experience,
                workingLocationAddress: profile.workingLocationAddress,
                serviceRadiusKm: profile.serviceRadiusKm,
                hourlyRate: profile.hourlyRate,
              },
            },
          },
          include: { provider: true },
        });

        if (
          providerUser.provider &&
          profile.workingLocationLatitude !== undefined &&
          profile.workingLocationLongitude !== undefined
        ) {
          await tx.$executeRaw`
            UPDATE "providers"
            SET "working_location_geometry" =
              ST_SetSRID(ST_MakePoint(${profile.workingLocationLongitude}, ${profile.workingLocationLatitude}), 4326)
            WHERE "id" = ${providerUser.provider.id}
          `;
        }

        return providerUser;
      });

      return this.toDomain(created);
    } catch (error) {
      this.mapUniqueConstraintError(error);
      throw error;
    }
  }

  private async createRoleUser(
    user: User,
    profile: Partial<
      Pick<Prisma.UserCreateInput, 'customer' | 'adminEmployee' | 'provider'>
    >,
  ): Promise<User> {
    try {
      const created = await this.prisma.client.$transaction((tx) =>
        tx.user.create({
          data: { ...this.toCreateInput(user), ...profile },
        }),
      );
      return this.toDomain(created);
    } catch (error) {
      this.mapUniqueConstraintError(error);
      throw error;
    }
  }

  private mapUniqueConstraintError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new EmailAlreadyExistsError();
    }
  }

  private validateCoordinates(latitude: number, longitude: number): void {
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new InvalidRegistrationError('Latitude or longitude is out of range.');
    }
  }

  async updateEmail(id: string, email: string): Promise<User> {
    try {
      return await this.update({ id }, { email });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new EmailAlreadyExistsError();
        }
        if (error.code === 'P2025') {
          throw new UserNotFoundError();
        }
      }
      throw error;
    }
  }

  override async create(user: User, tx?: PrismaTx): Promise<User> {
    try {
      return await super.create(user, tx);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }
  }
}
