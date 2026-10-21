export enum NotificationChannel {
  EMAIL = 'EMAIL',
//   SMS = 'SMS',
}

// export interface SendNotificationInput {
//   channel: NotificationChannel;
//   recipient: string;
//   subject?: string;
//   text: string;
//   html?: string;
// }

export interface SendNotificationInput {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  template?: string;
  context?: Record<string, unknown>;
  text?: string;
}
