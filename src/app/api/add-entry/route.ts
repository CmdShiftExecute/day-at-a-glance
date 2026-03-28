import { NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import * as XLSX from 'xlsx';

const DATA_PATH = join(process.cwd(), 'data', 'my-day-data.xlsx');

/** Column headers for each sheet when creating a brand-new workbook */
const SHEET_HEADERS: Record<string, string[]> = {
  Schedule: ['date', 'time', 'endTime', 'title', 'type', 'description'],
  Tasks: ['date', 'title', 'priority', 'status', 'dueDate', 'source', 'owner', 'daysOpen', 'category', 'taskType'],
  Meetings: ['date', 'title', 'time', 'endTime', 'organizer', 'attendees', 'location', 'type'],
  'Emails Inbox': ['date', 'time', 'from', 'subject', 'folder', 'priority', 'readStatus', 'addressed', 'summary', 'myReply', 'replySummary', 'attachment'],
  'Emails Sent': ['date', 'time', 'to', 'subject', 'summary', 'importance', 'commitment', 'owner', 'deadline', 'attachment'],
};

const ALL_SHEET_NAMES = ['Schedule', 'Tasks', 'Meetings', 'Emails Inbox', 'Emails Sent'];

function createEmptyWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const name of ALL_SHEET_NAMES) {
    const headers = SHEET_HEADERS[name];
    // Create sheet with just the header row
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  return wb;
}

function findSheet(workbook: XLSX.WorkBook, targetName: string): string | undefined {
  return workbook.SheetNames.find(
    n => n.toLowerCase() === targetName.toLowerCase()
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sheet, data } = body as { sheet: string; data: Record<string, string | number> };

    if (!sheet || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: sheet, data' },
        { status: 400 }
      );
    }

    // Validate sheet name
    const validSheets = Object.keys(SHEET_HEADERS);
    if (!validSheets.some(s => s.toLowerCase() === sheet.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid sheet name: "${sheet}". Valid sheets: ${validSheets.join(', ')}` },
        { status: 400 }
      );
    }

    let workbook: XLSX.WorkBook;

    if (existsSync(DATA_PATH)) {
      // Read existing workbook
      const buffer = readFileSync(DATA_PATH);
      workbook = XLSX.read(buffer, { type: 'buffer' });

      // If the target sheet doesn't exist, add it with headers
      const existing = findSheet(workbook, sheet);
      if (!existing) {
        const headers = SHEET_HEADERS[sheet] || SHEET_HEADERS[validSheets.find(s => s.toLowerCase() === sheet.toLowerCase())!];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        XLSX.utils.book_append_sheet(workbook, ws, sheet);
      }
    } else {
      // Create brand-new workbook with all 5 sheets
      mkdirSync(dirname(DATA_PATH), { recursive: true });
      workbook = createEmptyWorkbook();
    }

    // Find the sheet (case-insensitive)
    const sheetName = findSheet(workbook, sheet)!;
    const ws = workbook.Sheets[sheetName];

    // Get existing rows
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

    // Append the new row
    rows.push(data);

    // Rebuild sheet from rows (preserves headers from the first row or uses known headers)
    const headers = SHEET_HEADERS[sheetName] || SHEET_HEADERS[sheet];
    const newWs = XLSX.utils.json_to_sheet(rows, { header: headers });
    workbook.Sheets[sheetName] = newWs;

    // Write back to disk
    const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(DATA_PATH, output);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
