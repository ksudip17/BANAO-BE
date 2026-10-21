import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

export interface RegistrationVerificationRequested {
  recipient: string;
  fullName: string;
  otp: string;
  expiryMinutes: number;
}

@Injectable()
export class NotificationEvents extends EventEmitter {
  static readonly REGISTRATION_VERIFICATION_REQUESTED =
    'notification.registration-verification-requested';
}
