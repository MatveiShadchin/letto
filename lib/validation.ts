import { z } from 'zod';

export const checkoutSchema = z.object({
  // Контактные данные
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(11, 'Телефон должен содержать 11 цифр').regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Неверный формат телефона'),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),

  // Доставка
  deliveryMethod: z.enum(['courier', 'pickup']),
  
  // Адрес (только для курьерской доставки)
  city: z.string().min(1, 'Город обязателен').optional(),
  street: z.string().min(1, 'Улица обязательна').optional(),
  house: z.string().min(1, 'Дом обязателен').optional(),
  apartment: z.string().optional(),
  intercom: z.string().optional(),
  comment: z.string().optional(),

  // Дата и время
  deliveryDate: z.string().min(1, 'Выберите дату доставки'),
  deliveryTime: z.string().min(1, 'Выберите время доставки'),

  // Оплата
  paymentMethod: z.enum(['cash', 'card']),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
