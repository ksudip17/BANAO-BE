import type {
  RegisterCustomerInput,
  RegisterEmployeeInput,
  RegisterProviderInput,
  RegisterUserInput,
  RegisterUserResult,
} from '../command/register-user.input';

import { User } from '../../domain/entity/user.entity';
import { UserRegistrationService } from '../services/user-registration.service';
import { BadRequestException, Injectable } from '@nestjs/common';

import { EmployeeRegistrationStrategy } from './employee-registration.strategy';
import { ProviderRegistrationStrategy } from './provider-registration.strategy';
import { CustomerRegistrationStrategy } from './customer-registration.strategy';

import { UserType } from 'src/infrastructure/prisma/generated/prisma/enums';

export interface IRegistrationStrategy<TInput extends RegisterUserInput> {
  createProfile(user: User, input: TInput): Promise<User>;
}

export type RegistrationCommand =
  | {
      userType: typeof UserType.CUSTOMER;
      data: RegisterCustomerInput;
    }
  | {
      userType: typeof UserType.PROVIDER;
      data: RegisterProviderInput;
    }
  | {
      userType: typeof UserType.ADMIN;
      data: RegisterEmployeeInput;
    };

@Injectable()
export class RegistrationStrategy {
  constructor(
    private readonly registration: UserRegistrationService,
    private readonly employeeStrategy: EmployeeRegistrationStrategy,
    private readonly providerStrategy: ProviderRegistrationStrategy,
    private readonly customerStrategy: CustomerRegistrationStrategy,
  ) {}

  async register(
    command: RegistrationCommand,
  ): Promise<RegisterUserResult> {
    switch (command.userType) {
      case UserType.CUSTOMER:
        return this.registration.register(
          command.data,
          command.userType,
          (user) =>
            this.customerStrategy.createProfile(
              user,
              command.data,
            ),
        );

      case UserType.PROVIDER:
        return this.registration.register(
          command.data,
          command.userType,
          (user) =>
            this.providerStrategy.createProfile(
              user,
              command.data,
            ),
        );

      case UserType.ADMIN:
        return this.registration.register(
          command.data,
          command.userType,
          (user) =>
            this.employeeStrategy.createProfile(
              user,
              command.data,
            ),
        );

      default:
        throw new BadRequestException('Invalid user type');
    }
  }
}
