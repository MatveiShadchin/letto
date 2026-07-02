import { Truck, Flower2, Camera, ShieldCheck } from 'lucide-react';

export const OurAdvantages = () => {
  const advantages = [
    {
      icon: <Truck className="w-8 h-8 text-[#5E4037]" strokeWidth={1.2} />,
      title: 'Доставка от 60 минут',
      description: 'Привезем букет вовремя или к точному часу'
    },
    {
      icon: <Flower2 className="w-8 h-8 text-[#5E4037]" strokeWidth={1.2} />,
      title: 'Гарантия свежести',
      description: 'Закупаем цветы каждое утро. Стойкость от 5 дней'
    },
    {
      icon: <Camera className="w-8 h-8 text-[#5E4037]" strokeWidth={1.2} />,
      title: 'Фото перед отправкой',
      description: 'Отправим фото вашего букета в мессенджер перед доставкой'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#5E4037]" strokeWidth={1.2} />,
      title: 'Два магазина в городе',
      description: 'Самовывоз с пр. Макеева или пр. Октября — без ожидания курьера'
    }
  ];

  return (
    <section className="py-16 bg-[#F3F2F1] border-t border-[#F3F2F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {advantages.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 antialiased tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed antialiased tracking-tight">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
