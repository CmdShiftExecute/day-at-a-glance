import { NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as XLSX from 'xlsx';

const DATA_PATH = join(process.cwd(), 'data', 'my-day-data.xlsx');

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

    // Find the Tasks sheet
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
      const rowTitle = String(row.title ?? '').toLowerCase().trim();

      // Match by date + title substring (titles in Excel may be truncated or slightly different)
      if (rowDate === date && (rowTitle === titleLower || titleLower.includes(rowTitle) || rowTitle.includes(titleLower))) {
        (row as Record<string, unknown>).status = newStatus;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try matching by title alone (for carried-forward tasks that may have a different date)
      for (const row of rows) {
        const rowTitle = String(row.title ?? '').toLowerCase().trim();
        if (rowTitle === titleLower || titleLower.includes(rowTitle) || rowTitle.includes(titleLower)) {
          (row as Record<string, unknown>).status = newStatus;
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
