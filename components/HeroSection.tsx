export function HeroSection() {
  return (
    <section 
      className="relative h-[500px] bg-cover bg-center flex items-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&h=500&fit=crop)'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            ДАРИТЕ НЕЖНОСТЬ С БУКЕТАМИ ЛЕТТО
          </h1>
          <p className="font-sans text-xl text-white mb-8">
            Самые свежие цветы и оригинальные композиции для ваших особых моментов
          </p>
          <button className="font-serif bg-[#F9F5F0] text-[#2D2D2D] px-8 py-3 rounded-xl font-semibold hover:bg-[#E8E0D5] transition-colors">
            Заказать сейчас
          </button>
        </div>
      </div>
    </section>
  );
}
