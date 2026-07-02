'use client';

import { Truck, Flower, Camera, Heart, Shield, Star } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Доставляем цветы в течение 2 часов по городу в любое время суток'
    },
    {
      icon: Flower,
      title: 'Свежие цветы',
      description: 'Только свежесрезанные цветы от проверенных поставщиков с гарантией качества'
    },
    {
      icon: Camera,
      title: 'Фотоотчет',
      description: 'Присылаем фото готового букета перед доставкой для вашего одобрения'
    },
    {
      icon: Heart,
 title: 'Индивидуальный подход',
      description: 'Создаем уникальные букеты по вашим пожеланиям и предпочтениям'
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: 'Если цветы не понравились - вернем деньги или заменим букет'
    },
    {
      icon: Star,
      title: 'Профессионализм',
      description: 'Опытные флористы с художественным образованием и вкусом'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F9F5F0]/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#8B4513]/10 text-[#8B4513] rounded-full text-sm font-medium mb-4">
            Наши преимущества
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] mb-6">
            Почему выбирают Летто
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы заботимся о каждом клиенте и создаем цветочные композиции, 
            которые дарят настоящие эмоции
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative">
                <div className="bg-[#F9F5F0] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#8B4513] group-hover:text-white transition-colors duration-300">
                  <feature.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#8B4513] to-[#2D2D2D] rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Готовы сделать заказ?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Оставьте заявку и наш менеджер свяжется с вами в течение 5 минут для уточнения деталей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#2D2D2D] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Сделать заказ
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Позвонить нам
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
