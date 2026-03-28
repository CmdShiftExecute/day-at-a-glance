'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: 'default' | 'blue' | 'purple' | 'green' | 'amber' | 'none';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

const gradientMap: Record<string, string> = {
  default: 'gradient-border',
  blue: 'gradient-border gradient-border-blue',
  purple: 'gradient-border gradient-border-purple',
  green: 'gradient-border gradient-border-green',
  amber: 'gradient-border gradient-border-amber',
  none: '',
};

export function GlassCard({
  children,
  className,
  gradient = 'default',
  hover = true,
  padding = 'md',
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-2xl',
        hover && 'cursor-pointer',
        gradientMap[gradient],
        paddingMap[padding],
        className
      )}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
