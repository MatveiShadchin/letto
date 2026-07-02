import { Truck, Flower, Camera } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Доставляем цветы в течение 2 часов по городу'
    },
    {
      icon: Flower,
      title: 'Свежие цветы',
      description: 'Только свежесрезанные цветы от проверенных поставщиков'
    },
    {
      icon: Camera,
      title: 'Фотоотчет',
      description: 'Присылаем фото готового букета перед доставкой'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#2D2D2D] mb-12">
          Почему выбирают нас
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-[#F9F5F0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-[#2D2D2D]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#2D2D2D]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
