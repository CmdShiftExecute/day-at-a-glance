'use client';

import { useState, useEffect, useCallback } from 'react';
import { DateFormatOption, registerCityTimezone } from '@/lib/city-time';
import { registerCityCoords } from '@/hooks/use-weather';

export type DateFormat = DateFormatOption;
export type TimeFormat = '24h' | '12h';

export interface UserSettings {
  name: string;
  city: string;
  cityLat?: number;    // latitude from geocoding
  cityLon?: number;    // longitude from geocoding
  cityTimezone?: string; // IANA timezone from geocoding (e.g. "Asia/Dubai")
  photoUrl: string; // path to uploaded photo or empty
  highPriorityEmails: string; // newline-separated email addresses / names
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}

const STORAGE_KEY = 'my-day-settings';

const defaults: UserSettings = {
  name: '',
  city: '',
  photoUrl: '',
  highPriorityEmails: '',
  dateFormat: 'DD MMM YYYY',
  timeFormat: '24h',
};

/** Parse the newline-separated VIP list into trimmed, lowercased entries */
export function parseHighPriorityList(raw: string): string[] {
  return raw
    .split('\n')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Check if an email's `from` field matches any high-priority entry (case-insensitive substring) */
export function isHighPriorityEmail(from: string, highPriorityEmails: string): boolean {
  const entries = parseHighPriorityList(highPriorityEmails);
  if (entries.length === 0) return false;
  const fromLower = from.toLowerCase();
  return entries.some(entry => fromLower.includes(entry));
}

/** Save settings to the server JSON file (fire-and-forget) */
function persistToServer(settings: UserSettings) {
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  }).catch(() => {});
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [mounted, setMounted] = useState(false);

  // On mount: load from server JSON first, then overlay localStorage
  useEffect(() => {
    async function load() {
      let serverSettings: Partial<UserSettings> = {};
      let serverReachable = false;
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          serverSettings = await res.json();
          serverReachable = true;
        }
      } catch {}

      let localSettings: Partial<UserSettings> = {};
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) localSettings = JSON.parse(stored);
      } catch {}

      // Server JSON is the single source of truth when reachable.
      // localStorage is only a fast-load cache; it never overrides the server.
      // This prevents stale browser data from repopulating a cleared settings file.
      let merged: UserSettings;
      if (serverReachable) {
        merged = { ...defaults, ...serverSettings };
        // Sync localStorage to match server (clears stale local data)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      } else {
        // Server unreachable — fall back to localStorage cache
        const hasLocal = Object.keys(localSettings).length > 0;
        if (hasLocal) {
          merged = { ...defaults, ...localSettings };
        } else {
          merged = defaults;
        }
      }

      // Register custom city data from geocoding so timezone + weather work
      if (merged.city && merged.cityTimezone) {
        registerCityTimezone(merged.city, merged.cityTimezone);
      }
      if (merged.city && merged.cityLat != null && merged.cityLon != null) {
        registerCityCoords(merged.city, merged.cityLat, merged.cityLon);
      }

      setSettings(merged);
      setMounted(true);
    }
    load();
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      // Register custom city data if updated
      if (next.city && next.cityTimezone) {
        registerCityTimezone(next.city, next.cityTimezone);
      }
      if (next.city && next.cityLat != null && next.cityLon != null) {
        registerCityCoords(next.city, next.cityLat, next.cityLon);
      }
      // Save to both localStorage (instant) and server JSON (persistent)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      persistToServer(next);
      return next;
    });
  }, []);

  const displayName = settings.name || 'Hi, there!';
  const hasPhoto = !!settings.photoUrl && settings.photoUrl !== '';

  return { settings, updateSettings, displayName, hasPhoto, mounted };
}
