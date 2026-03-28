'use client';

import { useEffect, useState } from 'react';
import { getCurrentHourFraction } from '@/lib/city-time';

interface TimeIndicatorProps {
  startHour: number;
  endHour: number;
  city?: string;
}

export function TimeIndicator({ startHour, endHour, city = '' }: TimeIndicatorProps) {
  const [currentHour, setCurrentHour] = useState(() => getCurrentHourFraction(city));

  useEffect(() => {
    setCurrentHour(getCurrentHourFraction(city));
    const interval = setInterval(() => setCurrentHour(getCurrentHourFraction(city)), 60000);
    return () => clearInterval(interval);
  }, [city]);

  const totalHours = endHour - startHour;
  const position = ((currentHour - startHour) / totalHours) * 100;

  if (position < 0 || position > 100) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${position}%` }}
    >
      <div className="relative flex items-center">
        <div
          className="absolute -left-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: '#ef4444' }}
        />
        <div
          className="w-full h-[2px]"
          style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }}
        />
        <span
          className="absolute -left-1 -top-5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
          }}
        >
          NOW
        </span>
      </div>
    </div>
  );
}
