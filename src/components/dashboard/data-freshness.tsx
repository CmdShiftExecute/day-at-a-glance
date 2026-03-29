'use client';

import { useMemo } from 'react';
import { Clock, AlertTriangle, XCircle } from 'lucide-react';

interface DataFreshnessProps {
  lastLoaded: Date | null;
  isUsingDemo: boolean;
  loadError?: string | null;
}

export function DataFreshness({ lastLoaded, isUsingDemo, loadError }: DataFreshnessProps) {
  const { text, isStale, isError } = useMemo(() => {
    if (loadError) return { text: `Load failed: ${loadError}`, isStale: false, isError: true };
    if (isUsingDemo) return { text: 'Using demo data', isStale: false, isError: false };
    if (!lastLoaded) return { text: '', isStale: false, isError: false };

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
      isError: false,
    };
  }, [lastLoaded, isUsingDemo, loadError]);

  if (!text) return null;

  const color = isError ? 'var(--accent-red, #ef4444)' : isStale ? 'var(--accent-amber)' : 'var(--text-muted)';
  const Icon = isError ? XCircle : isStale ? AlertTriangle : Clock;

  return (
    <div className="flex items-center gap-1 text-[10px] md:text-xs max-w-[200px]" style={{ color }}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}
