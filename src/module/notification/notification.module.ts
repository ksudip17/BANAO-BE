
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';



import { SmtpEmailAdapter } from './infrastructure/email/smtp-email.adapter';
import { EMAIL_SENDER } from './application/port/email-sender.port';
import { SendNotificationUseCase } from './application/usecase/send-notification.use-case';
import { NOTIFICATION_PORT } from './application/port/notifiaction.port';
import { NotificationEvents } from './application/event/notification.events';
import { RegistrationVerificationListener } from './infrastructure/email/registration-verification.listener';

@Module({
  imports: [ConfigModule],

  providers: [
    SmtpEmailAdapter,
    {
      provide: EMAIL_SENDER,
      useExisting: SmtpEmailAdapter,
    },
    SendNotificationUseCase,
    NotificationEvents,
    RegistrationVerificationListener,
    {
      provide: NOTIFICATION_PORT,
      useExisting: SendNotificationUseCase,
    },
  ],
  exports: [NOTIFICATION_PORT, NotificationEvents],
})
export class NotificationsModule {}
