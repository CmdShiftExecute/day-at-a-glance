import { NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const DATA_PATH = join(process.cwd(), 'data', 'my-day-data.xlsx');

/**
 * Resolve the task title from a row, trying multiple column name variants
 * (same alias logic as the parser in parse-excel.ts).
 */
function getRowTitle(row: Record<string, unknown>): string {
  const keys = Object.keys(row);
  // Build a lowercase key map
  const lcMap: Record<string, string> = {};
  for (const k of keys) lcMap[k.toLowerCase().trim()] = k;

  // Try aliases in priority order
  for (const alias of ['title', 'taskname', 'task_name', 'task', 'name', 'subject']) {
    const actualKey = lcMap[alias];
    if (actualKey && row[actualKey] !== undefined && row[actualKey] !== null && row[actualKey] !== '') {
      return String(row[actualKey]);
    }
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const { date, title, newStatus } = await request.json();

    if (!date || !title || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: date, title, newStatus' },
        { status: 400 }
      );
    }

    if (!existsSync(DATA_PATH)) {
      return NextResponse.json(
        { error: 'No data file found at data/my-day-data.xlsx' },
        { status: 404 }
      );
    }

    // Read the existing workbook
    const buffer = readFileSync(DATA_PATH);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Find the Tasks sheet (case-insensitive)
    const tasksSheetName = workbook.SheetNames.find(
      n => n.toLowerCase() === 'tasks'
    );

    if (!tasksSheetName) {
      return NextResponse.json(
        { error: 'No "Tasks" sheet found in the Excel file' },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[tasksSheetName];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

    // Find the matching row by date + title (case-insensitive title match)
    let matched = false;
    const titleLower = title.toLowerCase().trim();

    for (const row of rows) {
      const rowDate = String(row.date ?? '').trim();
      const rowTitle = getRowTitle(row).toLowerCase().trim();

      // Skip rows with no title
      if (!rowTitle) continue;

      // Match by date + title (exact or substring)
      if (rowDate === date && (rowTitle === titleLower || titleLower.includes(rowTitle) || rowTitle.includes(titleLower))) {
        // Find the actual status column key (case-insensitive)
        const statusKey = Object.keys(row).find(k => k.toLowerCase().trim() === 'status') || 'status';
        (row as Record<string, unknown>)[statusKey] = newStatus;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try matching by title alone (for carried-forward tasks that may have a different date)
      for (const row of rows) {
        const rowTitle = getRowTitle(row).toLowerCase().trim();
        if (!rowTitle) continue;
        if (rowTitle === titleLower || titleLower.includes(rowTitle) || rowTitle.includes(titleLower)) {
          const statusKey = Object.keys(row).find(k => k.toLowerCase().trim() === 'status') || 'status';
          (row as Record<string, unknown>)[statusKey] = newStatus;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      return NextResponse.json(
        { error: `Task not found: "${title}" on ${date}` },
        { status: 404 }
      );
    }

    // Write the updated rows back to the sheet
    const newSheet = XLSX.utils.json_to_sheet(rows);
    workbook.Sheets[tasksSheetName] = newSheet;

    // Write back to disk
    const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(DATA_PATH, output);

    return NextResponse.json({ success: true, date, title, newStatus });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
