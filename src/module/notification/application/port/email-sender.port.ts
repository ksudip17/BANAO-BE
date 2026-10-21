
export interface SendEmailInput {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
  text?: string;
}

export interface EmailSenderPort {
  send(input: SendEmailInput): Promise<void>;
}

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');