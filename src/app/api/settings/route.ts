import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

function ensureDataDir() {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readSettings(): Record<string, unknown> {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

/** GET — return saved settings */
export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

/** POST — merge incoming partial settings and persist */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = readSettings();
    const merged = { ...existing, ...body };

    ensureDataDir();
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8');

    return NextResponse.json({ success: true, settings: merged });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
