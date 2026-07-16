import { NotifyChannel } from '@/types/notification';

export interface OrderLineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  postcardWanted?: boolean;
  postcardText?: string;
  addons?: {
    balloons?: number;
    toys?: number;
    vases?: number;
  };
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  special_wishes?: string | null;
  street?: string | null;
  house?: string | null;
  pickup_store?: string | null;
  delivery_method: 'courier' | 'pickup';
  delivery_time?: string | null;
  items: OrderLineItem[];
  items_total: number;
  delivery_cost: number;
  total: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  preferred_notify_channel?: NotifyChannel | null;
  messenger_contact?: string | null;
  telegram_chat_id?: string | null;
  vk_user_id?: string | null;
  whatsapp_phone?: string | null;
  max_chat_id?: string | null;
  created_at?: string;
}
