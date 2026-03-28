'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';

interface CollapsiblePanelProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: number | string;
  badgeColor?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  gradient?: 'default' | 'blue' | 'purple' | 'green' | 'amber' | 'none';
  headerAction?: ReactNode;
}

export function CollapsiblePanel({
  id,
  title,
  icon: Icon,
  iconColor = 'var(--accent-blue)',
  badge,
  badgeColor,
  defaultExpanded = true,
  children,
  className,
  gradient = 'default',
  headerAction,
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    const stored = localStorage.getItem(`panel-${id}`);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    }
  }, [id]);

  const toggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      localStorage.setItem(`panel-${id}`, String(next));
      return next;
    });
  };

  const gradientClass =
    gradient === 'none'
      ? ''
      : gradient === 'default'
      ? 'gradient-border'
      : `gradient-border gradient-border-${gradient}`;

  return (
    <div className={cn(
      'rounded-2xl glass-static flex flex-col min-h-0 h-full',
      gradientClass,
      className,
    )}>
      {/* Header — always visible, never shrinks */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        className="w-full flex items-center justify-between p-3 md:p-4 cursor-pointer group flex-shrink-0"
        aria-expanded={isExpanded}
        aria-controls={`panel-content-${id}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 15%, transparent)` }}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: iconColor }} />
          </div>
          <h3 className="font-display font-semibold text-xs sm:text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {badge !== undefined && (
            <span
              className="text-[10px] sm:text-xs font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: badgeColor
                  ? `color-mix(in srgb, ${badgeColor} 15%, transparent)`
                  : 'var(--glass-bg)',
                color: badgeColor || 'var(--text-secondary)',
              }}
            >
              {badge}
            </span>
          )}
          {headerAction && (
            <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
              {headerAction}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-1"
        >
          <ChevronDown
            className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          />
        </motion.div>
      </div>

      {/* Content — fills remaining height, scrolls internally */}
      {isExpanded && (
        <div
          id={`panel-content-${id}`}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 md:px-4 pb-3 md:pb-4"
        >
          {children}
        </div>
      )}
    </div>
  );
}
