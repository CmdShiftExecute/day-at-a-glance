import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseExcelFile } from '@/lib/parse-excel';

// Force dynamic — NEVER cache this route. The Excel file can change at any time.
export const dynamic = 'force-dynamic';

const DATA_PATH = join(process.cwd(), 'data', 'my-day-data.xlsx');

export async function GET() {
  try {
    if (!existsSync(DATA_PATH)) {
      return NextResponse.json({ empty: true });
    }

    const buffer = readFileSync(DATA_PATH);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const result = parseExcelFile(arrayBuffer as ArrayBuffer);

    if (result.errors.length > 0 && result.rowsParsed === 0) {
      return NextResponse.json({ error: result.errors.join('; ') }, { status: 400 });
    }

    return NextResponse.json({
      data: result.data,
      rowsParsed: result.rowsParsed,
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
