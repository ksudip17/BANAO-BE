import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_SENDER } from '../../application/port/email-sender.port';
import type { EmailSenderPort } from '../../application/port/email-sender.port';
import {
  NotificationEvents,
  RegistrationVerificationRequested,
} from '../../application/event/notification.events';

@Injectable()
export class RegistrationVerificationListener {
  private readonly logger = new Logger(RegistrationVerificationListener.name);

  constructor(
    events: NotificationEvents,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSenderPort,
  ) {
    events.on(
      NotificationEvents.REGISTRATION_VERIFICATION_REQUESTED,
      (event: RegistrationVerificationRequested) => {
        void this.send(event);
      },
    );
  }

  private async send(event: RegistrationVerificationRequested): Promise<void> {
    try {
      await this.emailSender.send({
        to: event.recipient,
        subject: 'Verify your Banao email address',
        template: 'registration',
        context: {
          fullName: event.fullName,
          otp: event.otp,
          expiryMinutes: event.expiryMinutes,
        },
        text: `Your Banao verification code is ${event.otp}. It expires in ${event.expiryMinutes} minutes.`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send registration verification email to ${event.recipient}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
