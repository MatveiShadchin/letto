import { MapPin, Phone, Clock, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { InquiryForm } from '@/components/InquiryForm';
import { ORDER_PHONES, PICKUP_STORES, VK_LABEL, VK_URL } from '@/lib/store-locations';

export default function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-[#1A1A1A]">Наши адреса</h1>
      <p className="text-[#1A1A1A]/70 mb-8">
        Два магазина в городе — забирайте букеты сами или заказывайте доставку
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {PICKUP_STORES.map((store) => {
          const phone = ORDER_PHONES.find((item) => item.storeId === store.id);

          return (
            <Card key={store.id} className="overflow-hidden rounded-2xl border-[#E8E4E0]">
              <div className="bg-[#5E4037] px-6 py-5 text-white">
                <h2 className="text-xl font-bold">{store.title}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#5E4037]" />
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Адрес</p>
                    <p className="text-[#1A1A1A]/80">{store.address}</p>
                    {phone ? (
                      <a
                        href={phone.href}
                        className="mt-1 inline-flex items-center gap-1.5 text-[#1A1A1A]/80 hover:text-[#5E4037] transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {phone.label}
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#5E4037]" />
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Самовывоз</p>
                    <p className="text-[#1A1A1A]/80">Круглосуточно</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#5E4037]" />
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Сбор заказов флористами</p>
                    <p className="text-[#1A1A1A]/80">Ежедневно с 8:00 до 20:00</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-12">
        <a
          href={VK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <Card className="rounded-2xl border-[#E8E4E0] p-5 transition-all hover:border-[#5E4037]/40 hover:shadow-md active:scale-[0.99]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0077FF]/10 text-[#0077FF]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.657 4 8.18c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.609 2.18-3.609.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0077FF]">Мы ВКонтакте</p>
                <p className="mt-1 text-lg font-bold text-[#1A1A1A]">{VK_LABEL}</p>
                <p className="mt-1 text-sm text-[#1A1A1A]/65">
                  Новинки, акции и примеры букетов
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#0077FF]">
              Открыть группу
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Card>
        </a>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">Напишите нам</h2>
        <p className="text-[#1A1A1A]/70 mb-6">
          Оставьте заявку — перезвоним и поможем с выбором букета
        </p>
        <InquiryForm />
      </div>
    </div>
  );
}
