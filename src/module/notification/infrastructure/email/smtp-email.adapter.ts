
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderFile } from 'pug';
import { resolve, sep } from 'node:path';

import type { Transporter } from 'nodemailer';
import { EmailSenderPort, SendEmailInput } from '../../application/port/email-sender.port';

@Injectable()
export class SmtpEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(
    SmtpEmailAdapter.name,
  );

  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly templatesDirectory = resolve(__dirname, 'templates');

  constructor(
    private readonly config: ConfigService,
  ) {
    const host = this.config.getOrThrow<string>('SMTP_HOST');
    const port = Number(this.config.get<string | number>('SMTP_PORT', 587));
    const secureSetting = this.config.get<string | boolean>('SMTP_SECURE');
    const secure =
      typeof secureSetting === 'boolean'
        ? secureSetting
        : secureSetting === undefined
          ? port === 465
          : secureSetting.trim().toLowerCase() === 'true';
    const user = this.config.getOrThrow<string>('SMTP_USER');
    const password = this.config.getOrThrow<string>('SMTP_PASSWORD');

    this.from = this.config.getOrThrow<string>('MAIL_FROM');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });
  }

  async send(input: SendEmailInput): Promise<void> {
    if (!/^[a-zA-Z0-9_-]+$/.test(input.template)) {
      throw new Error('Invalid email template name');
    }
    const templatePath = resolve(this.templatesDirectory, `${input.template}.pug`);
    if (
      !templatePath.startsWith(this.templatesDirectory + sep)
    ) {
      throw new Error('Invalid email template name');
    }
    const html = await renderFile(templatePath, input.context ?? {});
    const result = await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html,
    });

    this.logger.log(
      `Email accepted by transport. Message ID: ${result.messageId}`,
    );
  }
}
