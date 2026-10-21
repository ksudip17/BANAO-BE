
import { Inject, Injectable } from '@nestjs/common';
import { NotificationPort } from '../port/notifiaction.port';
import { EMAIL_SENDER } from '../port/email-sender.port';
import type { EmailSenderPort } from '../port/email-sender.port';
import { NotificationChannel, SendNotificationInput } from '../command/send-notification.input';

@Injectable()
export class SendNotificationUseCase implements NotificationPort {
  constructor(
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
  ) {}

  async send(input: SendNotificationInput): Promise<void> {
    switch (input.channel) {
      case NotificationChannel.EMAIL:
        if (!input.subject) {
          throw new Error('Email subject is required');
        }
        if (!input.template) {
          throw new Error('Email template is required');
        }

        await this.emailSender.send({
          to: input.recipient,
          subject: input.subject,
          template: input.template,
          context: input.context,
          text: input.text,
        });
        return;

      default: {
        const exhaustiveCheck: never = input.channel;
        throw new Error(`Unsupported notification channel: ${exhaustiveCheck}`);
      }
    }
  }
}
