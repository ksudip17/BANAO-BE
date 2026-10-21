import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  RegisterEmployeeInput,
  RegisterCustomerInput,
  RegisterProviderInput,
  RegisterUserResult,
} from '../command/register-user.input';
import { RegistrationStrategy } from '../strategies/registration.strategy';
import { UserType } from 'src/infrastructure/prisma/generated/prisma/enums';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { PASSWORD_HASHER } from '../port/password-hasher.port';
import type { PasswordHasher } from '../port/password-hasher.port';
import { UserStatus } from 'src/infrastructure/prisma/generated/prisma/enums';
import type { User } from '../../domain/entity/user.entity';
import { JWT_TOKEN_SERVICE } from '../port/jwt-token.port';
import type { JwtTokenServicePort } from '../port/jwt-token.port';
import { OTP_SERVICE } from '../port/otp-service.port';
import type { OtpService } from '../port/otp-service.port';
import { NotificationEvents } from 'src/module/notification/application/event/notification.events';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  // expiresIn: number;
  // refreshExpiresIn: number;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly registrationStrategy: RegistrationStrategy,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtTokenService: JwtTokenServicePort,
    @Inject(OTP_SERVICE)
    private readonly otpService: OtpService,
    private readonly notificationEvents: NotificationEvents,
  ) {}

  customerRegister(data: RegisterCustomerInput): Promise<RegisterUserResult> {
    return this.registrationStrategy.register({data, userType: UserType.CUSTOMER});
  }

  employeeRegister(data: RegisterEmployeeInput): Promise<RegisterUserResult> {
     return this.registrationStrategy.register({
      data,
      userType: UserType.ADMIN,
    });
  }

  providerRegister(data: RegisterProviderInput): Promise<RegisterUserResult> {
    return this.registrationStrategy.register({data, userType: UserType.PROVIDER});
  }

  async verifyRegistrationOtp(
    email: string,
    otp: string,
    otpHash: string,
  ): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('Invalid email or verification code.');
    }
    if (user.properties.emailVerifiedAt) {
      return user;
    }

    const isValid = await this.otpService.verifyOtp(
      normalizedEmail,
      otp,
      otpHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or verification code.');
    }

    return this.userRepository.markEmailVerified(user.id);
  }

  async resendRegistrationOtp(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user || user.properties.emailVerifiedAt) {
      throw new UnauthorizedException('Unable to resend verification code.');
    }

    const otp = this.otpService.generateOtp(6);
    const otpHash = await this.otpService.createOtpHash(normalizedEmail, otp);
    const expiryMinutes = Number(process.env.EXPIRY_MINUTES) || 10;
    this.notificationEvents.emit(
      NotificationEvents.REGISTRATION_VERIFICATION_REQUESTED,
      {
        recipient: normalizedEmail,
        fullName: user.properties.fullName,
        otp,
        expiryMinutes,
      },
    );
    return otpHash;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !(await this.passwordHasher.compare(password, user.properties.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.properties.emailVerifiedAt) {
      throw new ForbiddenException('Verify your email before logging in.');
    }
    if (user.properties.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('This account is not active.');
    }

    const tokens = await this.jwtTokenService.issueTokenPair({
      sub: user.id,
      email: user.email,
      userType: user.properties.userType
    });

    return { ...tokens, user };
  }

  async refreshTokens(refreshToken: string): Promise<LoginResult> {
    const claims = await this.jwtTokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(claims.sub);
    if (
      !user ||
      user.email !== claims.email ||
      !user.properties.emailVerifiedAt ||
      user.properties.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokens = await this.jwtTokenService.issueTokenPair({
      sub: user.id,
      email: user.email,
      userType: user.properties.userType
    });
    return { ...tokens, user };
  }

}
