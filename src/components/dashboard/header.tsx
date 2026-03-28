'use client';

import { Upload, RotateCcw, RefreshCw, Settings, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { DayNavigator } from './day-navigator';
import { ThemeToggle } from './theme-toggle';
import { DayView } from '@/lib/types';
import { useWeather } from '@/hooks/use-weather';
import { useClock } from '@/hooks/use-clock';

interface HeaderProps {
  activeDay: DayView;
  onDayChange: (day: DayView) => void;
  onImportClick: () => void;
  onResetClick: () => void;
  onRefreshClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  isUsingDemo: boolean;
  isLoading?: boolean;
  displayName: string;
  photoUrl: string;
  city: string;
  dateFormat?: string;
  timeFormat?: string;
}

export function Header({
  activeDay, onDayChange, onImportClick, onResetClick, onRefreshClick, onSettingsClick, onHelpClick,
  isUsingDemo, isLoading, displayName, photoUrl, city, dateFormat, timeFormat,
}: HeaderProps) {
  const { weather } = useWeather(city);
  const { time, date, mounted: clockMounted } = useClock(city, dateFormat, timeFormat);
  const clockVisible = clockMounted && !!city && !!time;

  return (
    <motion.header
      className="z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-6 py-2 md:py-4 gap-2 md:gap-0 relative">
        {/* Left: Profile + Name + Weather/Clock */}
        <div className="flex items-center justify-between md:justify-start md:gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Profile photo */}
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl flex-shrink-0 overflow-hidden border border-white/10">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover object-top rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))' }}>
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              )}
            </div>

            {/*
              Name + Clock: CSS Grid layout.
              Grid guarantees Row 1 (name + time) and Row 2 (subtitle + date)
              share the same row heights, so text aligns perfectly across columns.
              On < lg screens: single column, clock cells hidden via display:none.
              On lg+: two columns [1fr auto], clock cells become visible.
            */}
            <div
              className={`grid${clockVisible ? ' lg:grid-cols-[1fr_auto]' : ''}`}
              style={{ rowGap: 0, columnGap: 0 }}
            >
              {/* ── Row 1, Col 1: Name ── */}
              <div className="flex items-end">
                <h1 className="text-sm md:text-lg font-display font-bold leading-tight name-gradient">{displayName}</h1>
              </div>

              {/* ── Row 1, Col 2: Time (lg+ only) ── */}
              {clockVisible && (
                <div className="hidden lg:flex items-end justify-end ml-3 pl-3 border-l border-white/10">
                  <span className="text-sm font-mono font-semibold leading-tight" style={{ color: 'var(--accent-blue)' }}>{time}</span>
                </div>
              )}

              {/* ── Row 2, Col 1: Subtitle + Weather ── */}
              <div className="flex items-start gap-2">
                <p className="text-[9px] md:text-xs font-display hidden md:block" style={{ color: 'var(--text-muted)' }}>
                  Day at a Glance
                </p>
                {city && weather && (
                  <span className="text-[9px] md:text-xs hidden md:inline-flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <span className="opacity-40">|</span>
                    <span>{weather.icon}</span>
                    <span>{weather.temp}°C</span>
                    <span className="opacity-60">{weather.city}</span>
                  </span>
                )}
                {!city && (
                  <span className="text-[9px] md:text-xs inline-flex items-center gap-1">
                    <span className="hidden md:inline opacity-40">|</span>
                    <span style={{ color: 'var(--accent-purple)', opacity: 0.8 }}>No city selected — open Settings</span>
                  </span>
                )}
              </div>

              {/* ── Row 2, Col 2: Date (lg+ only) ── */}
              {clockVisible && (
                <div className="hidden lg:flex items-start justify-end ml-3 pl-3 border-l border-white/10">
                  <span className="text-[9px] md:text-xs font-display" style={{ color: 'var(--text-muted)' }}>{date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls — mobile only */}
          <div className="flex items-center gap-1.5 md:hidden">
            {!isUsingDemo && (
              <>
                <motion.button
                  onClick={onRefreshClick}
                  className="w-7 h-7 rounded-lg glass-static flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--accent-blue)' }}
                  whileTap={{ scale: 0.9 }}
                  animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                  transition={isLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
                  title="Refresh from data folder"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  onClick={onResetClick}
                  className="w-7 h-7 rounded-lg glass-static flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  whileTap={{ scale: 0.9 }}
                  title="Reset to demo data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
              </>
            )}
            <motion.button
              onClick={onImportClick}
              className="w-7 h-7 rounded-lg glass-static flex items-center justify-center cursor-pointer"
              style={{ color: 'var(--accent-green)' }}
              whileTap={{ scale: 0.9 }}
              title="Import Excel/CSV"
            >
              <Upload className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={onSettingsClick}
              className="w-7 h-7 rounded-lg glass-static flex items-center justify-center cursor-pointer"
              style={{ color: 'var(--accent-purple)' }}
              whileTap={{ scale: 0.9 }}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              onClick={onHelpClick}
              className="w-7 h-7 rounded-lg glass-static flex items-center justify-center cursor-pointer"
              style={{ color: 'var(--accent-teal)' }}
              whileTap={{ scale: 0.9 }}
              title="User Guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </motion.button>
            <ThemeToggle />
          </div>
        </div>

        {/* Center: Day Navigator — absolute so it's truly screen-centered */}
        <div className="flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
          <DayNavigator activeDay={activeDay} onDayChange={onDayChange} city={city} dateFormat={dateFormat} />
        </div>

        {/* Right: Desktop controls */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {/* Weather badge — compact on md, hidden on lg (shown inline above) */}
          {city && weather && (
            <div className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg glass-static text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{weather.icon}</span>
              <span>{weather.temp}°C</span>
            </div>
          )}

          {!isUsingDemo && (
            <>
              <motion.button
                onClick={onRefreshClick}
                className="w-9 h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--accent-blue)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
                title="Refresh from data folder (R)"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={onResetClick}
                className="w-9 h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Reset to demo data"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </>
          )}
          <motion.button
            onClick={onImportClick}
            className="w-9 h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
            style={{ color: 'var(--accent-green)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Import Excel/CSV"
          >
            <Upload className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onSettingsClick}
            className="w-9 h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
            style={{ color: 'var(--accent-purple)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Settings (S)"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onHelpClick}
            className="w-9 h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
            style={{ color: 'var(--accent-teal)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="User Guide (H)"
          >
            <BookOpen className="w-4 h-4" />
          </motion.button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
