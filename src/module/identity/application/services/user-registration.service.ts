import { Inject, Injectable } from '@nestjs/common';
import {
  EmailAlreadyExistsError,
  InvalidRegistrationError,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entity/user.entity';
import type { RegisterUserInput, RegisterUserResult } from '../command/register-user.input';
import type { UserType } from 'src/infrastructure/prisma/generated/prisma/enums';
import { OTP_SERVICE } from '../port/otp-service.port';
import type { OtpService } from '../port/otp-service.port';
import { PASSWORD_HASHER } from '../port/password-hasher.port';
import type { PasswordHasher } from '../port/password-hasher.port';
import {
  NotificationEvents,
  RegistrationVerificationRequested,
} from 'src/module/notification/application/event/notification.events';

@Injectable()
export class UserRegistrationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(OTP_SERVICE)
    private readonly otpService: OtpService,
    private readonly notificationEvents: NotificationEvents,
  ) {}

  async register(
    data: RegisterUserInput,
    userType: UserType,
    createUser: (user: User) => Promise<User>,
  ): Promise<RegisterUserResult> {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser?.properties.emailVerifiedAt) {
      throw new EmailAlreadyExistsError();
    }
    if (existingUser && existingUser.properties.userType !== userType) {
      throw new InvalidRegistrationError(
        'Registration was already started with a different account type.',
      );
    }

    const otp = this.otpService.generateOtp(6);
    const otpHash = await this.otpService.createOtpHash(email, otp);
    let registeredUser: User;
    if (existingUser) {
      registeredUser = existingUser;
    } else {
      const password = await this.passwordHasher.hash(data.password);
      const user = User.create({
        fullName: data.fullName.trim(),
        email,
        phone: data.phone.trim(),
        password,
        userType,
      });
      registeredUser = await createUser(user);
    }
    const expiryMinutes = Number(process.env.EXPIRY_MINUTES) || 10;

    this.notificationEvents.emit(
      NotificationEvents.REGISTRATION_VERIFICATION_REQUESTED,
      {
        recipient: email,
        fullName: registeredUser.properties.fullName,
        otp,
        expiryMinutes,
      } satisfies RegistrationVerificationRequested,
    );

    return { user: registeredUser, otpHash };
  }
}
