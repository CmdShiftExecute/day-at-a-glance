'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const QUOTES = [
  {
    text: 'The key is not to prioritize what\u2019s on your schedule, but to schedule your priorities.',
    author: 'Stephen R. Covey',
  },
  {
    text: 'Simplicity boils down to two steps: identify the essential, eliminate the rest.',
    author: 'Leo Babauta',
  },
  {
    text: 'You can do anything, but not everything.',
    author: 'David Allen',
  },
];

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'var(--background)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onAnimationComplete={(def) => {
        // Only fire onComplete when the exit animation finishes
        if (def === 'exit' || (typeof def === 'object' && 'opacity' in def && (def as { opacity: number }).opacity === 0)) {
          onComplete();
        }
      }}
    >
      {/* Subtle radial glow behind the logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at center, var(--accent-blue), transparent 70%)',
          opacity: 0.08,
        }}
      />

      <div className="flex flex-col items-center gap-6 relative">
        {/* Logo — scales in with a slow continuous rotation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src="/logo-header.png"
            alt="Day at a Glance"
            className="w-20 h-20 md:w-24 md:h-24 drop-shadow-lg"
            animate={{ rotate: 360 }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* App title */}
        <motion.h1
          className="text-2xl md:text-3xl font-display font-bold tracking-wide name-gradient"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        >
          Day at a Glance
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
        >
          Yesterday &middot; Today &middot; Tomorrow
        </motion.p>

        {/* Gradient divider */}
        <motion.div
          className="h-px w-48 md:w-64 mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent-teal), var(--accent-blue), var(--accent-teal), transparent)',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
        />

        {/* Inspirational quote */}
        <motion.div
          className="max-w-md md:max-w-lg px-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: 'easeOut' }}
        >
          <p
            className="text-sm md:text-base font-display italic leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            className="mt-2 text-[10px] md:text-xs font-mono tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', opacity: 0.7 }}
          >
            &mdash; {quote.author}
          </p>
        </motion.div>

        {/* Credit line */}
        <motion.p
          className="text-[11px] tracking-wide"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          Crafted by{' '}
          <span style={{ color: 'var(--accent-teal)' }} className="font-semibold">
            S. Sharma
          </span>
        </motion.p>

        {/* Loading dots */}
        <motion.div
          className="flex gap-1.5 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent-blue)' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
