'use client';

import { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface DataFreshnessProps {
  lastLoaded: Date | null;
  isUsingDemo: boolean;
}

export function DataFreshness({ lastLoaded, isUsingDemo }: DataFreshnessProps) {
  const { text, isStale } = useMemo(() => {
    if (isUsingDemo) return { text: 'Using demo data', isStale: false };
    if (!lastLoaded) return { text: '', isStale: false };

    const now = new Date();
    const diffMs = now.getTime() - lastLoaded.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeStr: string;
    if (diffMins < 1) timeStr = 'just now';
    else if (diffMins < 60) timeStr = `${diffMins}m ago`;
    else if (diffHours < 24) timeStr = `${diffHours}h ago`;
    else timeStr = `${diffDays}d ago`;

    const stale = diffHours >= 24;
    return {
      text: stale ? `Data is ${timeStr}` : `Loaded ${timeStr}`,
      isStale: stale,
    };
  }, [lastLoaded, isUsingDemo]);

  if (!text) return null;

  return (
    <div className="flex items-center gap-1 text-[10px] md:text-xs" style={{ color: isStale ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
      {isStale ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );
}
