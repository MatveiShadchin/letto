export {
  findMessengerLinksByPhone,
  notifyOrderCreated,
  notifyOrderStatusChanged,
  saveMessengerLink,
} from '@/lib/notifications/dispatch';
export { linkVkUserToOrdersByPhone, handleVkInboundMessage } from '@/lib/notifications/vk-inbound';
export { sendVkMessage } from '@/lib/notifications/channels/vk';
export {
  getChannelStatuses,
  getPublicBotLinks,
  isChannelConfigured,
  messagingConfig,
} from '@/lib/notifications/config';
export { buildNotificationText } from '@/lib/notifications/templates';
export { parseMessengerContactFromBody } from '@/lib/notifications/recipients';
