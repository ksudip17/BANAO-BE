import { SendNotificationInput } from "../command/send-notification.input";


export interface NotificationPort {
  send(input: SendNotificationInput): Promise<void>;
}

export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');