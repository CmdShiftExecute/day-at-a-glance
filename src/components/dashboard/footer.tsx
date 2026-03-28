'use client';

export function Footer() {
  return (
    <footer className="relative z-10 max-w-[1440px] mx-auto px-3 md:px-6 pb-8 pt-4">
      {/* Gradient divider */}
      <div
        className="h-px mb-8 mx-auto max-w-md"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent-teal), var(--accent-blue), var(--accent-teal), transparent)' }}
      />

      <div className="flex flex-col items-center gap-5">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo-header.png" alt="Day at a Glance" className="w-9 h-9" />
          <div>
            <p className="text-sm font-display font-bold tracking-wide name-gradient">Day at a Glance</p>
            <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Yesterday &middot; Today &middot; Tomorrow
            </p>
          </div>
        </div>

        {/* Developer credit */}
        <p className="text-[11px] tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Crafted by{' '}
          <span
            className="font-semibold"
            style={{ color: 'var(--accent-teal)' }}
          >
            S. Sharma
          </span>
        </p>

        {/* License */}
        <p className="text-[9px] font-mono tracking-wider uppercase" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          Open Source &middot; MIT License
        </p>
      </div>
    </footer>
  );
}
