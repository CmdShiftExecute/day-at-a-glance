'use client';

import { useState, useEffect } from 'react';
import { getDisplayTime, getDisplayDateFormatted, DateFormatOption, TimeFormatOption } from '@/lib/city-time';

export function useClock(city: string, dateFormat?: string, timeFormat?: string) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!city) {
      setTime('');
      setDate('');
      setMounted(true);
      return;
    }
    function update() {
      setTime(getDisplayTime(city, (timeFormat || '24h') as TimeFormatOption));
      setDate(getDisplayDateFormatted(city, dateFormat as DateFormatOption));
    }
    update();
    setMounted(true);
    const interval = setInterval(update, 30_000); // update every 30s
    return () => clearInterval(interval);
  }, [city, dateFormat, timeFormat]);

  return { time, date, mounted };
}
