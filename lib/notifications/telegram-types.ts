export interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number; type?: string };
    from?: { id?: number; first_name?: string; username?: string; is_bot?: boolean };
    reply_to_message?: { message_id?: number };
    contact?: { phone_number?: string };
  };
}
