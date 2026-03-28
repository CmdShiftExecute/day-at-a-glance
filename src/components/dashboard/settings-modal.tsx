'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, MapPin, Check, BookOpen, ShieldAlert, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { UserSettings, DateFormat, TimeFormat } from '@/hooks/use-settings';

interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
  onOpenHelp?: () => void;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdate, onOpenHelp }: SettingsModalProps) {
  const hasGeoDataInit = settings.cityLat != null && settings.cityLon != null;
  const [name, setName] = useState(settings.name);
  const [cityQuery, setCityQuery] = useState(hasGeoDataInit ? settings.city : '');
  const [cityResults, setCityResults] = useState<GeoResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchingCity, setSearchingCity] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number; tz: string } | null>(
    hasGeoDataInit ? { name: settings.city, lat: settings.cityLat!, lon: settings.cityLon!, tz: settings.cityTimezone || '' } : null
  );
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.dateFormat || 'DD MMM YYYY');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(settings.timeFormat || '24h');
  const [vipEmails, setVipEmails] = useState(settings.highPriorityEmails);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityContainerRef = useRef<HTMLDivElement>(null);

  const hasVipError = /[,;]/.test(vipEmails);
  const hasCityError = !selectedCity;
  const hasAnyError = hasVipError || hasCityError;

  // Sync when modal opens
  const handleOpen = () => {
    setName(settings.name);
    // If we have geocoding data, city was properly selected before — show it as selected
    const hasGeoData = settings.cityLat != null && settings.cityLon != null;
    setCityQuery(hasGeoData ? settings.city : '');
    setSelectedCity(
      hasGeoData ? { name: settings.city, lat: settings.cityLat!, lon: settings.cityLon!, tz: settings.cityTimezone || '' } : null
    );
    setDateFormat(settings.dateFormat || 'DD MMM YYYY');
    setTimeFormat(settings.timeFormat || '24h');
    setVipEmails(settings.highPriorityEmails);
    setSaved(false);
    setCityResults([]);
    setShowResults(false);
  };

  const handleSave = () => {
    if (hasAnyError) return;
    if (!selectedCity) return;
    onUpdate({
      name: name.trim(),
      city: selectedCity.name,
      cityLat: selectedCity.lat,
      cityLon: selectedCity.lon,
      cityTimezone: selectedCity.tz,
      dateFormat,
      timeFormat,
      highPriorityEmails: vipEmails,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/upload-photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onUpdate({ photoUrl: data.url });
      }
    } catch {}
    setUploading(false);
  };

  // Geocoding search with debounce
  const searchCity = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length < 2) {
      setCityResults([]);
      setShowResults(false);
      return;
    }
    setSearchingCity(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`
        );
        const data = await res.json();
        if (data.results) {
          setCityResults(data.results);
          setShowResults(true);
        } else {
          setCityResults([]);
          setShowResults(true);
        }
      } catch {
        setCityResults([]);
      }
      setSearchingCity(false);
    }, 350);
  }, []);

  const handleCitySelect = (result: GeoResult) => {
    const fullName = result.admin1
      ? `${result.name}, ${result.admin1}, ${result.country}`
      : `${result.name}, ${result.country}`;
    setCityQuery(fullName);
    setSelectedCity({ name: result.name, lat: result.latitude, lon: result.longitude, tz: result.timezone });
    setShowResults(false);
    setCityResults([]);
  };

  // Close results when clicking outside the entire city section
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityContainerRef.current && !cityContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="glass-static rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Profile Photo */}
              <div className="mb-6">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    {settings.photoUrl ? (
                      <img
                        src={settings.photoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                        <User className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl glass-static text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-5">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-white/10 focus:border-blue-500/50 transition-colors"
                  style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Shows as &quot;{name.trim() || 'Hi there!'}&quot; in the header
                </p>
              </div>

              {/* City - Geocoding Search */}
              <div className="mb-6 relative" ref={cityContainerRef}>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3 h-3 inline mr-1" />
                  City (for timezone &amp; weather)
                </label>
                <div className="relative">
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={cityQuery}
                    onChange={e => {
                      setCityQuery(e.target.value);
                      setSelectedCity(null);
                      searchCity(e.target.value);
                    }}
                    onFocus={() => { if (cityResults.length > 0) setShowResults(true); }}
                    placeholder="Search for any city..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border transition-colors"
                    style={{
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      borderColor: (!selectedCity && cityQuery.trim().length > 0) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searchingCity ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {showResults && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-white/10 shadow-xl overflow-hidden z-10"
                    style={{ backgroundColor: 'var(--background)', backdropFilter: 'blur(24px)' }}
                  >
                    {cityResults.length > 0 ? (
                      cityResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleCitySelect(r)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <span>
                            <strong>{r.name}</strong>
                            {r.admin1 && <span style={{ color: 'var(--text-muted)' }}>, {r.admin1}</span>}
                            <span style={{ color: 'var(--text-muted)' }}>, {r.country}</span>
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {r.timezone.split('/').pop()?.replace(/_/g, ' ')}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                        No cities found. Try a different spelling.
                      </div>
                    )}
                  </div>
                )}

                {/* Selected city info */}
                {selectedCity && (
                  <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--accent-teal)' }}>
                    <Check className="w-3 h-3" />
                    {selectedCity.name} — {selectedCity.tz.replace(/_/g, ' ')}
                  </p>
                )}
                {!selectedCity && (
                  <p className="text-[10px] mt-1.5 font-medium" style={{ color: cityQuery.trim().length > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                    {cityQuery.trim().length > 0
                      ? 'Please select a city from the search results.'
                      : 'Search for your city and select it from the results.'}
                  </p>
                )}
              </div>

              {/* Date & Time Format */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={e => setDateFormat(e.target.value as DateFormat)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-white/10 focus:border-blue-500/50 transition-colors cursor-pointer"
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="DD MMM YYYY">28 Mar 2026</option>
                      <option value="MMM DD, YYYY">Mar 28, 2026</option>
                      <option value="DD/MM/YYYY">28/03/2026</option>
                      <option value="MM/DD/YYYY">03/28/2026</option>
                      <option value="YYYY-MM-DD">2026-03-28</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Time Format
                    </label>
                    <select
                      value={timeFormat}
                      onChange={e => setTimeFormat(e.target.value as TimeFormat)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-white/10 focus:border-blue-500/50 transition-colors cursor-pointer"
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="24h">14:30 (24h)</option>
                      <option value="12h">2:30 PM (12h)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  These control how dates and times are <strong>displayed</strong>. In your Excel file, dates must always be <strong style={{ color: 'var(--accent-amber)' }}>YYYY-MM-DD</strong> and times <strong>HH:MM (24h)</strong> to avoid ambiguity.
                </p>
              </div>

              {/* High-Priority Email Addresses */}
              <div className="mb-6">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  <ShieldAlert className="w-3 h-3 inline mr-1" />
                  High-Priority Senders
                </label>
                <textarea
                  value={vipEmails}
                  onChange={e => setVipEmails(e.target.value)}
                  placeholder={'Enter names or emails exactly as\nthey appear in your inbox data.\nOne per line, e.g.:\n\nJane Smith\njohn.doe@company.com'}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors resize-y font-mono"
                  style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    minHeight: '100px',
                    borderColor: hasVipError ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  }}
                />
                <p className="text-[10px] mt-1 leading-relaxed text-justify" style={{ color: 'var(--text-muted)' }}>
                  Emails from these senders will be highlighted in <span style={{ color: 'var(--accent-pink)' }}>red</span> as high priority. Enter values exactly as they appear in the <strong>&quot;from&quot; column of the Emails Inbox sheet</strong> in your Excel file. Case-insensitive. Refer to the User Guide for the full Excel format.
                </p>
                {vipEmails.trim() && !hasVipError && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {vipEmails.split('\n').filter(s => s.trim()).map((entry, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: 'rgba(244,114,182,0.15)', color: 'var(--accent-pink)' }}
                      >
                        {entry.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Banner — above save button */}
              {hasAnyError && (
                <div
                  className="mb-3 px-4 py-3 rounded-xl flex items-start gap-3 border"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                  <div className="text-xs leading-relaxed space-y-1" style={{ color: '#ef4444' }}>
                    {hasCityError && cityQuery.trim().length > 0 && <p>Select a valid city from the search results.</p>}
                    {hasCityError && cityQuery.trim().length === 0 && <p>Search for and select a city to continue.</p>}
                    {hasVipError && <p>Remove commas or semicolons from high-priority senders — enter one per line.</p>}
                  </div>
                </div>
              )}

              {/* Help link */}
              {onOpenHelp && (
                <button
                  onClick={() => { onClose(); setTimeout(onOpenHelp, 200); }}
                  className="w-full py-2 rounded-xl glass-static text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors mb-3"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  <BookOpen className="w-4 h-4" />
                  User Guide
                </button>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={hasAnyError}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))'
                    : hasAnyError
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))',
                  color: hasAnyError ? 'var(--text-muted)' : 'white',
                  cursor: hasAnyError ? 'not-allowed' : 'pointer',
                  opacity: hasAnyError ? 0.5 : 1,
                }}
              >
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
