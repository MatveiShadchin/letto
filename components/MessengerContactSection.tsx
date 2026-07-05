'use client';

import {
  CHECKOUT_CONTACT_OPTIONS,
  CheckoutContactChannel,
  getCheckoutContactOption,
} from '@/lib/messenger-contact';
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

export function MessengerContactSection({
  value,
  onChange,
  customerPhone = '',
  className,
}: MessengerContactSectionProps) {
  const option = getCheckoutContactOption(value.channel);
  const showContactField = value.channel !== 'phone';

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
        Выберите удобный мессенджер — мы напишем, если понадобится уточнить детали.
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
            <input
              id="messengerContact"
              type="text"
              value={value.contact}
              onChange={(e) => onChange({ ...value, contact: e.target.value })}
              placeholder={option?.placeholder}
              className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
              autoComplete="off"
            />
          </div>

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
