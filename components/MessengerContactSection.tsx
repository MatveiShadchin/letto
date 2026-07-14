'use client';

import { useState } from 'react';
import { ClipboardPaste, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CHECKOUT_CONTACT_OPTIONS,
  CheckoutContactChannel,
  getCheckoutContactOption,
} from '@/lib/messenger-contact';
import { getVkWriteUrl } from '@/lib/vk-community';
import { cn } from '@/lib/utils';

export interface MessengerContactFormValue {
  channel: CheckoutContactChannel;
  contact: string;
  useCustomerPhoneForWhatsapp: boolean;
}

interface MessengerContactSectionProps {
  value: MessengerContactFormValue;
  onChange: (value: MessengerContactFormValue) => void;
  customerPhone?: string;
  className?: string;
}

function applyPastedContact(raw: string): string {
  return raw.trim();
}

export function MessengerContactSection({
  value,
  onChange,
  customerPhone = '',
  className,
}: MessengerContactSectionProps) {
  const [pasteHint, setPasteHint] = useState<string | null>(null);
  const option = getCheckoutContactOption(value.channel);

  const setContact = (contact: string) => {
    setPasteHint(null);
    onChange({ ...value, contact });
  };

  const pasteFromClipboard = async () => {
    setPasteHint(null);

    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          setContact(applyPastedContact(text));
          return;
        }
      }
    } catch {
      /* fallback below */
    }

    setPasteHint('Не удалось вставить автоматически — зажмите поле и выберите «Вставить»');
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.trim()) return;

    event.preventDefault();
    setContact(applyPastedContact(pasted));
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm',
        className
      )}
    >
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">
        Как с вами связаться для уточнения заказа?
      </h2>
      <p className="text-sm text-[#1A1A1A]/60 mb-4">
        Выберите удобный мессенджер — можно вставить ссылку или @username из буфера.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {CHECKOUT_CONTACT_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() =>
              onChange({
                ...value,
                channel: item.value,
                contact: item.value === 'whatsapp' && value.useCustomerPhoneForWhatsapp
                  ? customerPhone
                  : value.contact,
              })
            }
            className={cn(
              'rounded-xl border px-3 py-3 text-left transition-colors',
              value.channel === item.value
                ? 'border-[#5E4037] bg-[#F9F5F0] text-[#1A1A1A]'
                : 'border-[#E8E4E0] bg-[#FAFAF9] text-[#1A1A1A]/80 hover:border-[#5E4037]/30'
            )}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      {value.channel === 'phone' ? (
        <p className="rounded-xl bg-[#F9F5F0] px-4 py-3 text-sm text-[#1A1A1A]/75">
          Свяжемся с вами по телефону, указанному выше.
        </p>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor="messengerContact" className="block text-sm font-medium text-[#1A1A1A] mb-2">
              {option?.hint} *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="messengerContact"
                type="text"
                inputMode="text"
                value={value.contact}
                onChange={(e) => setContact(e.target.value)}
                onPaste={handlePaste}
                placeholder={option?.placeholder}
                className="w-full flex-1 rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-[#E8E4E0] shrink-0"
                onClick={pasteFromClipboard}
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Вставить
              </Button>
            </div>
            {pasteHint && <p className="mt-2 text-xs text-[#1A1A1A]/60">{pasteHint}</p>}
          </div>

          {value.channel === 'vk' && (
            <div className="rounded-xl border border-[#C5D9F5] bg-[#F0F6FF] px-4 py-4 space-y-3">
              <p className="text-sm text-[#1A1A1A]/85 leading-relaxed">
                Чтобы получать статус во ВКонтакте, нужно один раз написать сообществу — ВК не
                разрешает писать первым только по @username. После оформления заказа мы{' '}
                <strong>откроем чат с номером заказа</strong> — останется нажать «Отправить».
              </p>
              <p className="text-xs text-[#1A1A1A]/65">
                После сообщения укажите телефон с заказа — мы привяжем чат и будем присылать
                обновления сюда.
              </p>
              <a
                href={getVkWriteUrl(
                  [
                    'Здравствуйте! Оформляю заказ на LETTO.',
                    customerPhone.trim() ? `Телефон: ${customerPhone.trim()}` : null,
                  ]
                    .filter(Boolean)
                    .join(' ')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0077FF] text-white hover:bg-[#0066DD] px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Написать сообществу ВК
              </a>
            </div>
          )}

          {value.channel === 'whatsapp' && customerPhone.trim() && (
            <label className="flex items-start gap-3 rounded-xl border border-[#E8E4E0] bg-[#FAFAF9] px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value.useCustomerPhoneForWhatsapp}
                onChange={(e) =>
                  onChange({
                    ...value,
                    useCustomerPhoneForWhatsapp: e.target.checked,
                    contact: e.target.checked ? customerPhone : value.contact,
                  })
                }
                className="mt-1 h-4 w-4 text-[#5E4037] focus:ring-[#5E4037]"
              />
              <span className="text-sm text-[#1A1A1A]/80">
                WhatsApp на том же номере: <strong>{customerPhone}</strong>
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
