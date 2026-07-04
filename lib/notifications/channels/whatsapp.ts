import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const whatsappChannel: MessengerChannelAdapter = {
  channel: 'whatsapp',

  isConfigured() {
    return Boolean(
      messagingConfig.whatsapp.accessToken && messagingConfig.whatsapp.phoneNumberId
    );
  },

  canDeliver(address: string) {
    return normalizePhone(address).length >= 10;
  },

  async send(notification: OutboundNotification): Promise<ChannelSendResult> {
    const phone = normalizePhone(notification.recipient.address);
    const phoneNumberId = messagingConfig.whatsapp.phoneNumberId;
    const token = messagingConfig.whatsapp.accessToken;

    const apiUrl =
      messagingConfig.whatsapp.apiUrl ||
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: notification.text },
      }),
    });

    const data = (await response.json()) as {
      error?: { message?: string };
      messages?: Array<{ id?: string }>;
    };

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `WhatsApp API error (${response.status})`);
    }

    return {
      status: 'sent',
      providerMessageId: data.messages?.[0]?.id,
    };
  },
};
