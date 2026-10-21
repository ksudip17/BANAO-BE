import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import {
  USER_REPOSITORY,
} from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { IdentityController } from './presentation/controller/auth.controller';
import { NodeCryptoOtpService } from './infrastructure/hashing/crypto-otp.hasher';
import { Argon2PasswordHasher } from './infrastructure/hashing/argon2-password-hasher';
import { OTP_SERVICE } from './application/port/otp-service.port';
import { PASSWORD_HASHER } from './application/port/password-hasher.port';
import { AuthService } from './application/services/auth.service';
import { UserRegistrationService } from './application/services/user-registration.service';
import { EmployeeRegistrationStrategy } from './application/strategies/employee-registration.strategy';
import { ProviderRegistrationStrategy } from './application/strategies/provider-registration.strategy';
import { CustomerRegistrationStrategy } from './application/strategies/customer-registration.strategy';
import { RegistrationStrategy } from './application/strategies/registration.strategy';
import { NotificationsModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_TOKEN_SERVICE } from './application/port/jwt-token.port';
import { JwtTokenService } from './infrastructure/tokens/jwt-token.service';
import { JwtStrategy } from './infrastructure/tokens/jwt.strategy';
import { JwtAuthGuard } from './presentation/authorization/jwt-auth.guard';
import { AuthorizationGuard } from './presentation/authorization/authorization.guard';
// import { RegisterUserUseCase } from './application/usecases/register-user.use-case';


@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [IdentityController],
  providers: [
    PrismaUserRepository,
    Argon2PasswordHasher,
    JwtTokenService,
    JwtStrategy,
    JwtAuthGuard,
    AuthorizationGuard,
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: AuthorizationGuard },
    NodeCryptoOtpService,
    AuthService,
    // RegisterUserUseCase,
    UserRegistrationService,
    RegistrationStrategy,
    EmployeeRegistrationStrategy,
    ProviderRegistrationStrategy,
    CustomerRegistrationStrategy,
    { provide: USER_REPOSITORY, useExisting: PrismaUserRepository },
    {
      provide: PASSWORD_HASHER,
      useExisting: Argon2PasswordHasher,
    },
    {
      provide: JWT_TOKEN_SERVICE,
      useExisting: JwtTokenService,
    },
    {
      provide: OTP_SERVICE,
      useExisting: NodeCryptoOtpService,
    },
    // {
    //   provide: DeleteUserUseCase,
    //   useFactory: (users: UserRepository) => new DeleteUserUseCase(users),
    //   inject: [USER_REPOSITORY],
    // },
    // {
    //   provide: ChangeUserEmailUseCase,
    //   useFactory: (users: UserRepository) => new ChangeUserEmailUseCase(users),
    //   inject: [USER_REPOSITORY],
    // },
  ],
})
export class IdentityModule {}
