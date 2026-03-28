<div align="center">

# 📊 Chapter 8: Data & Excel Integration

**Your data, your format, your control.**

</div>

---

[← Commitments](./07-commitments.md) · [Back to Index](./README.md) · [Next: Theming →](./09-theming.md)

---

## Overview

Day at a Glance uses a single Excel file — `my-day-data.xlsx` — as its data source. This deliberate choice means you always own your data in a universally readable format. No databases, no proprietary formats, no vendor lock-in.

---

## 📁 The Data File

| Property | Value |
|----------|-------|
| **Filename** | `my-day-data.xlsx` |
| **Location** | `data/my-day-data.xlsx` (in the project root) |
| **Format** | Standard `.xlsx` (Excel 2007+) |
| **Sheets** | 5 required sheets (see below) |

> ⚠️ **Do not rename this file.** The API routes expect exactly `my-day-data.xlsx` in the `data/` directory.

---

## 📋 Sheet Schemas

The Excel file must contain these five sheets. Each sheet has specific columns that the parser expects.

### Sheet 1: `Schedule`

Your daily timeline — all scheduled blocks for the day.

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **Date** | YYYY-MM-DD | ✅ | 2026-03-28 |
| **Time** | HH:MM or Excel time | ✅ | 09:00 |
| **End Time** | HH:MM or Excel time | ✅ | 10:30 |
| **Title** | Text | ✅ | Q1 Budget Review |
| **Type** | meeting / task / focus / break / travel | ✅ | meeting |
| **Description** | Text | ❌ | Location: Conf Room 3 |
| **Link** | URL | ❌ | https://teams.microsoft.com/... |

### Sheet 2: `Tasks`

All tasks with priorities and status tracking.

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **Date** | YYYY-MM-DD | ✅ | 2026-03-28 |
| **Title** | Text | ✅ | Review vendor proposals |
| **Priority** | high / medium / low | ✅ | high |
| **Status** | open / done / overdue | ✅ | open |
| **Task Type** | action / deadline / followup / personal | ✅ | action |
| **Due Date** | YYYY-MM-DD | ❌ | 2026-03-29 |
| **Source** | Text | ❌ | Email from CFO |
| **Owner** | Text | ❌ | Your Name |
| **Days Open** | Number | ❌ | 3 |
| **Category** | Text | ❌ | Finance |
| **Link** | URL | ❌ | https://... |

### Sheet 3: `Meetings`

Rich meeting metadata that merges with the Schedule sheet.

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **Date** | YYYY-MM-DD | ✅ | 2026-03-28 |
| **Title** | Text | ✅ | Q1 Budget Review |
| **Time** | HH:MM | ✅ | 09:00 |
| **End Time** | HH:MM | ✅ | 10:30 |
| **Organizer** | Text | ❌ | CFO |
| **Attendees** | Text (comma-sep) | ❌ | Team A, Team B |
| **Location** | Text | ❌ | Conference Room 3 |
| **Type** | teams / in-person | ❌ | teams |
| **Link** | URL | ❌ | https://teams.microsoft.com/... |
| **Response Status** | accepted / tentative / declined / none | ❌ | accepted |

### Sheet 4: `Emails Inbox`

Incoming emails with priority and read status.

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **Date** | YYYY-MM-DD | ✅ | 2026-03-28 |
| **Time** | HH:MM | ✅ | 08:45 |
| **From** | Text | ✅ | John Smith |
| **Subject** | Text | ✅ | Re: Budget approval |
| **Summary** | Text | ✅ | Approved with minor revisions |
| **Priority** | evp / vp / high / direct / cc / normal | ❌ | direct |
| **Read Status** | unread / read | ❌ | unread |
| **Addressed** | direct / cc | ❌ | direct |
| **My Reply** | yes / no | ❌ | no |
| **Reply Summary** | Text | ❌ | |
| **Attachment** | yes / no | ❌ | yes |
| **Folder** | Text | ❌ | Inbox |
| **Link** | URL | ❌ | https://... |

### Sheet 5: `Emails Sent`

Your sent emails with commitment tracking.

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **Date** | YYYY-MM-DD | ✅ | 2026-03-28 |
| **Time** | HH:MM | ✅ | 10:15 |
| **To** | Text | ✅ | Client Name |
| **Subject** | Text | ✅ | Proposal — final version |
| **Summary** | Text | ✅ | Sent revised proposal with pricing |
| **Importance** | high / normal | ❌ | high |
| **Commitment** | yes / no | ❌ | yes |
| **Owner** | Text | ❌ | Your Name |
| **Deadline** | YYYY-MM-DD | ❌ | 2026-03-30 |
| **Attachment** | yes / no | ❌ | yes |
| **Link** | URL | ❌ | https://... |

---

## ⏰ Time Format Handling

The Excel parser is flexible with time formats:

| Input Format | Example | Parsed As |
|-------------|---------|-----------|
| HH:MM | 14:30 | 14:30 |
| HH:MM:SS | 14:30:00 | 14:30 |
| h:MM AM/PM | 2:30 PM | 14:30 |
| h AM/PM | 2 PM | 14:00 |
| Excel serial | 0.604166 | 14:30 |

> 💡 Excel sometimes stores times as serial numbers (fractions of a day). The parser handles this automatically — 0.5 = 12:00, 0.75 = 18:00, etc.

---

## 📥 Importing Data

### Method 1: File Import Modal

1. Press `I` or click the import button
2. Drag-and-drop your `.xlsx` file or click to browse
3. The parser validates all sheets and columns
4. If valid, data replaces the current view immediately

### Method 2: Direct File Placement

1. Copy your `my-day-data.xlsx` to the `data/` folder
2. Click the "Data freshness" indicator to refresh
3. Or press `R` to reload from the file

---

## 🔄 Bidirectional Sync

The dashboard doesn't just read from Excel — it writes back too:

```
┌──────────────┐                    ┌──────────────────┐
│   Dashboard   │ ── task toggle ──→│  Excel file       │
│   (browser)   │                   │  data/my-day-     │
│               │ ←── load data ────│  data.xlsx        │
│               │                   │                    │
│               │ ── add entry ────→│  (new rows added) │
└──────────────┘                    └──────────────────┘
```

| Operation | API Route | Direction |
|-----------|-----------|-----------|
| Load all data | `GET /api/load-data` | Excel → Dashboard |
| Toggle task status | `POST /api/update-task` | Dashboard → Excel |
| Add schedule item | `POST /api/add-entry` | Dashboard → Excel |
| Add task | `POST /api/add-entry` | Dashboard → Excel |
| Add commitment | `POST /api/add-entry` | Dashboard → Excel |

---

## 🛡️ Parser Validation

The Excel parser provides clear feedback:

| Check | Behavior |
|-------|----------|
| Missing sheet | Warning with sheet name — remaining sheets still parsed |
| Missing required column | Error for that sheet — other sheets unaffected |
| Invalid time format | Skipped with warning |
| Non-YYYY-MM-DD date | Warning — attempts to parse anyway |
| Empty rows | Silently skipped |
| Extra columns | Ignored (no errors) |

---

## 🏗️ Demo Data Fallback

If no `my-day-data.xlsx` exists, the dashboard loads **built-in demo data** with:

- 3 days of realistic schedule items (8–12 items per day)
- Tasks across all types and priorities
- Meetings with full metadata
- Inbox and sent emails with varying priorities
- Commitment-flagged sent emails

This ensures the dashboard is always functional and explorable, even before you import your own data.

---

[← Commitments](./07-commitments.md) · [Back to Index](./README.md) · [**Next: Theming & Design System →**](./09-theming.md)
