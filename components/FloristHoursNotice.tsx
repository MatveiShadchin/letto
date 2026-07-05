'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { FloristHoursInfo, getFloristHoursInfo } from '@/lib/florist-hours';
import { cn } from '@/lib/utils';

export function FloristHoursNotice({ className }: { className?: string }) {
  const [info, setInfo] = useState<FloristHoursInfo>(() => getFloristHoursInfo());

  useEffect(() => {
    setInfo(getFloristHoursInfo());
    const timer = window.setInterval(() => setInfo(getFloristHoursInfo()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const tone =
    info.status === 'open'
      ? 'border-[#D8E8D8] bg-[#F3FAF3] text-[#1A3D1A]'
      : 'border-[#F0DFC8] bg-[#FFF8ED] text-[#5E4037]';

  return (
    <div className={cn('rounded-2xl border px-4 py-3 sm:px-5 sm:py-4', tone, className)}>
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{info.title}</p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{info.message}</p>
          <p className="mt-2 text-xs opacity-75">Режим работы флористов: {info.workingHoursLabel}</p>
        </div>
      </div>
    </div>
  );
}
