export const NOTIFY_CHANNELS = ['telegram', 'vk', 'whatsapp', 'max'] as const;

export type NotifyChannel = (typeof NOTIFY_CHANNELS)[number];

export const NOTIFY_EVENTS = [
  'order_created',
  'order_status_changed',
  'order_admin_alert',
] as const;

export type NotifyEvent = (typeof NOTIFY_EVENTS)[number];

export type NotifyAudience = 'customer' | 'admin';

export type NotifyDeliveryStatus = 'sent' | 'skipped' | 'failed';

export interface OrderMessengerContact {
  preferred_notify_channel?: NotifyChannel | null;
  telegram_chat_id?: string | null;
  vk_user_id?: string | null;
  whatsapp_phone?: string | null;
  max_chat_id?: string | null;
}

export interface NotificationRecipient {
  channel: NotifyChannel;
  address: string;
}

export interface OutboundNotification {
  event: NotifyEvent;
  audience: NotifyAudience;
  orderId?: string;
  text: string;
  recipient: NotificationRecipient;
}

export interface ChannelSendResult {
  status: NotifyDeliveryStatus;
  error?: string;
  providerMessageId?: string;
}

export interface ChannelRuntimeStatus {
  channel: NotifyChannel;
  configured: boolean;
  label: string;
  notes?: string;
}

export interface NotificationLogEntry {
  id: number;
  order_id: string | null;
  channel: NotifyChannel;
  event: NotifyEvent;
  audience: NotifyAudience;
  recipient: string | null;
  status: NotifyDeliveryStatus;
  error: string | null;
  created_at: string;
}
