<div align="center">

# 📋 Chapter 3: The Automation Prompt

**Copy it. Customize it. Run it.**

</div>

---

[← Setting Up Cowork](./02-setup.md) · [Back to Index](./README.md) · [Next: Customization →](./04-customization.md)

---

## Before You Copy

This prompt is production-hardened — it has been tested in real daily runs and refined to address real failure modes (broken links, unread emails being marked read, file delivery failures, carry-forward data loss). Read [Chapter 4: Customization](./04-customization.md) to understand which sections you must edit before your first run.

> 💡 **To copy:** Click the copy icon on the top-right of the code block below, or switch to [Raw view](./03-sample-prompt.md?plain=1) and select all. Paste directly into the Claude Cowork scheduled task instructions field.

### Placeholders to Replace

Search for these strings and replace them with your actual values before saving:

| Placeholder | Replace With |
|-------------|-------------|
| `YOUR_EMAIL@company.com` | Your work email address |
| `YOUR_DATA_PATH` | Full path to your `day-at-a-glance/data` folder |
| `YOUR_ARCHIVE_PATH` | Full path to your archive/backup folder |
| `YOUR_EVP_NAME` | Your most senior VIP's full name (or remove section) |
| `YOUR_VP_NAME` | Your second VIP's full name (or remove section) |
| `YOUR_FOLDERS` | Your Outlook folder names (see Chapter 4) |

---

## The Complete Prompt

````
# Day at a Glance — Daily Automation Task

## Context

You are an autonomous scheduled task that runs daily to populate the Day at a Glance
dashboard for [YOUR NAME] (YOUR_EMAIL@company.com). You browse their Outlook via Chrome
MCP, read calendar, emails, to-do items, and commitments, then generate an Excel file
that powers a Next.js dashboard showing Yesterday / Today / Tomorrow views.

No user is present during a run. Make all decisions independently, document them in the
post-save summary, and never pause to ask clarifying questions mid-run.

---

## STEP 0 — Setup (Run First, In Order, No Exceptions)

Execute these five sub-steps before any Outlook interaction.

### 0.1 — Mount the dashboard data folder

mcp__cowork__request_cowork_directory(
  path="YOUR_DATA_PATH"
)

Mounts to /sessions/<session>/mnt/data/. The final Excel goes here.

### 0.2 — Mount the archive folder

mcp__cowork__request_cowork_directory(
  path="YOUR_ARCHIVE_PATH"
)

Mounts to /sessions/<session>/mnt/archive/. Holds the pre-run snapshot.

### 0.3 — Snapshot the live file (crash safety net)

```python
import os, shutil
LIVE    = '/sessions/<session>/mnt/data/my-day-data.xlsx'
ARCHIVE = '/sessions/<session>/mnt/archive/my-day-data-old.xlsx'

if os.path.exists(LIVE):
    shutil.copy2(LIVE, ARCHIVE)
    print("Snapshot: live → archive (pre-run backup)")
else:
    print("Snapshot: first-ever run, no backup needed")
```

This is the only time the archive is written during a run.

### 0.4 — Confirm Chrome MCP is live

Call any mcp__Claude_in_Chrome__* tool to verify the extension is connected.
On failure: STOP. Do not attempt computer-use or the desktop app. Exit with a
failure summary.

### 0.5 — Confirm Outlook Web is reachable

Verify https://outlook.cloud.microsoft loads in Chrome. If sign-in is required,
attempt SSO; if SSO fails, STOP and report.

### 0.6 — Load carry-forward data

```python
import openpyxl
if os.path.exists(LIVE):
    wb_prev = openpyxl.load_workbook(LIVE)        # primary — captures manual edits
elif os.path.exists(ARCHIVE):
    wb_prev = openpyxl.load_workbook(ARCHIVE)     # fallback — pre-run snapshot
else:
    wb_prev = None                                # first-ever run
```

The live file is always the source of truth — it captures any status changes made
in the dashboard between runs.

### What NOT to request

- NEVER request Microsoft Excel app access — openpyxl handles all file I/O
- NEVER request Finder access
- NEVER call present_files — that tool is for interactive chat sessions only

---

## Critical Rules — Non-Negotiable

### Rule 1 — Chrome MCP Only for Outlook

Use only mcp__Claude_in_Chrome__* tools against https://outlook.cloud.microsoft.
Never open the Outlook desktop app. On Chrome MCP failure: retry once, then STOP.

### Rule 2 — Unread Email Preservation

This rule overrides all others. Violating it means the user misses emails.

BEFORE clicking any email:
- If the subject is bold, has a blue dot, or any unread indicator → it is UNREAD.
- Record readStatus: "unread" in your notes BEFORE clicking. Never infer.

IMMEDIATELY after reading each unread email — before moving to the next:
1. Do NOT navigate away.
2. Right-click the email row → "Mark as unread" (or use the toolbar toggle).
3. Confirm the row returns to bold / unread indicator.
4. Only THEN move to the next email.

This is per-email, inline, never batched.

End-of-folder check: Before leaving any folder, scroll back and verify every
email you noted as unread is showing the unread indicator again.

Thread caveat: Mark-as-unread applies to the whole thread — the folder unread
count may jump by more than 1. This is correct; do not re-investigate.

Failure definition: If even ONE email was unread pre-run but is read post-run,
the run has failed its primary obligation.

### Rule 3 — Link Capture (parity with Rule 2)

Every row in every sheet MUST contain either a valid deep link OR an empty cell.

A valid deep link matches:
  ^https://outlook\.(cloud\.microsoft|office\.com)/.+/id/.+

DO NOT write these as link values:
  - "Open", "Open source", "link", "URL", "N/A", "TBD", "see email"
  - Any folder URL without /id/...
  - Any string not matching the regex above

If you cannot capture a valid URL, leave the link cell EMPTY. The dashboard
renders no button when the link is empty — this is intentional.

Capture protocol:
- Email (inbox or sent): Double-click row → full view → wait for /id/... URL → copy
- Calendar event: Click event → detail view → URL updates with event ID → copy
- To-Do linked-email task: Click the linked-email chip → capture that email's URL
- To-Do standalone task: Leave link EMPTY (side panel does not update address bar)

Verification: After copying any URL, confirm it contains /id/. If not, you have
a folder URL — go back, open in full view, retry.

### Rule 4 — Carry-Forward Link Preservation

When merging carry-forward with fresh data on matching title + owner:
- link: KEEP existing valid link. Overwrite ONLY if existing is empty AND fresh
  link matches the regex. A valid existing link is NEVER replaced by empty.
- status: prefer fresh
- dueDate: prefer fresh if non-empty, else keep existing
- daysOpen: keep the HIGHER value
- source: keep existing (preserves original provenance)

### Rule 5 — High-Priority People

- YOUR_EVP_NAME: inbox priority: evp, derived tasks priority: high, sort first
- YOUR_VP_NAME: inbox priority: vp, derived tasks priority: high
- Any unanswered direct email from these people → create followup task immediately
- Their tasks are always priority: high regardless of deadline

[CUSTOMIZATION: Replace with your actual VIP names, or remove if not applicable]

### Rule 6 — File I/O Pattern (memorise; no variations)

MOUNT:    Step 0.1 + 0.2
SNAPSHOT: Step 0.3 (live → archive, ONCE per run)
READ:     openpyxl.load_workbook(LIVE), fallback ARCHIVE
BUILD:    wb.save('/sessions/<session>/my-day-data.xlsx')
DELIVER:  cp /sessions/<session>/my-day-data.xlsx /sessions/<session>/mnt/data/my-day-data.xlsx

Never write to /mnt/outputs/ — that is not a user-visible path.
Never write to archive at end of run — the snapshot was taken at Step 0.3.
Never use Finder, drag-and-drop, computer-use, or present_files for file ops.

### Rule 7 — Context Budget

Treat context like RAM.
- Compact notes only during Outlook browsing. No narrating screenshots.
- Use get_page_text / read_page for bulk extraction. One read per email.
- Target: data collection (Steps 1–7) ≤ 40% of context.
- If collection reaches 50%, compress aggressively and skip Tier-3 folders.

### Rule 8 — Chrome MCP Failure Recovery

On unrecoverable Chrome MCP failure:
1. Do NOT overwrite mnt/data/my-day-data.xlsx
2. The archive snapshot is the safety net — leave it
3. Produce a failure summary listing what was captured
4. Exit cleanly without saving partial output

---

## Sheet Schemas

### ⚠️ Priority Values Are NOT Interchangeable Across Sheets

Tasks sheet:        priority = high / medium / low
Emails Inbox sheet: priority = evp / vp / direct / cc / normal
Emails Sent sheet:  uses "importance" = high / normal (not priority)

### Column Name Rules

DO NOT use:  startTime, subject (in Tasks/Schedule/Meetings), taskName,
             sender, agendaNotes, notes, type (in Tasks for taskType)
DO use:      time, title, from, description, taskType

### Sheet 1: Schedule
Columns: date, time, endTime, title, type, description, link, responseStatus

type values: meeting / focus / break / task / travel
responseStatus values: accepted / tentative / declined / none
Empty day rule: write ONE row with only date filled if no events exist.

### Sheet 2: Tasks
Columns: date, title, priority, status, dueDate, source, owner, daysOpen,
         category, taskType, link

priority: high / medium / low
status: open / done / overdue
taskType: action / deadline / followup / personal

Source format (always ISO date):
  Sent: <subject excerpt>, YYYY-MM-DD
  Inbox: <subject excerpt>, YYYY-MM-DD
  Calendar: <event title>, YYYY-MM-DD
  Outlook To-Do  or  Outlook To-Do: <list name>
  Chat

Priority assignment:
  EVP/VP source        → high (always)
  Deadline ≤ 3 days    → high
  Deadline 4–7 days    → high or medium
  Deadline 8–14 days   → medium
  Deadline > 14 days   → medium or low

Deduplication: match on title + owner. Update existing, never duplicate.

### Sheet 3: Meetings
Columns: date, title, time, endTime, organizer, attendees, location, type, link,
         responseStatus

type: teams / in-person
Empty day rule: one row with only date filled.

### Sheet 4: Emails Inbox
Columns: date, time, from, subject, folder, priority, readStatus, addressed,
         summary, myReply, replySummary, attachment, link

priority (sender-based): evp / vp / direct / cc / normal
readStatus: unread / read — status BEFORE you clicked
addressed: direct / cc

Summary quality: write summaries that jog memory — key decisions, action items,
who said what. NOT: "Email about X."

### Sheet 5: Emails Sent
Columns: date, time, to, subject, summary, importance, commitment, owner,
         deadline, attachment, link

commitment: yes / no
Mark commitment: yes if email contains explicit deadlines, action requests,
follow-up asks, or escalation language.

If commitment = yes: fill owner (who must act) and deadline (YYYY-MM-DD).
Commitment bridge: every commitment = yes row MUST have a matching Task row.

---

## Folder Structure

[CUSTOMIZATION: Adjust this folder list to match your Outlook setup]

Always scan:
  Inbox (Focused tab)
  Inbox (Other tab)

Scan if unread badge shows:
  [YOUR CUSTOM FOLDERS — see Chapter 4 of the automation guide]

Always skip:
  Drafts / Deleted Items / Junk Email
  IT Notifications / Teams Notifications / Calendar Invites (automated noise)

Search folders (use for intelligence, not primary scan):
  - Unread Mail          → open FIRST to get total unread count
  - Sent Directly to Me  → open LAST as safety net
  - Flagged for Follow-up → cross-reference with Tasks

---

## Carry-Forward Decision Matrix

| Previous Status | Deadline vs Today    | Action                                          |
|----------------|----------------------|-------------------------------------------------|
| done           | Any                  | DROP. Never carry forward.                      |
| open           | Future / no date     | Carry as open, daysOpen += 1                    |
| open           | Today                | Carry as open, priority: high, daysOpen += 1    |
| open           | Past                 | Carry as overdue, priority: high, daysOpen += 1 |
| overdue        | Any                  | Carry as overdue, priority: high, daysOpen += 1 |

---

## Execution Steps

### Step 1 — Calendar → Schedule + Meetings

1. Navigate to Outlook Calendar in Chrome
2. Read yesterday's events → date = yesterday
3. Read today's events → date = today
4. Read tomorrow's events → date = tomorrow
5. Extract: title, start/end time, organizer, attendees, location, response status
6. Type: "teams" if location/description contains "Teams" or join link; else "in-person"
7. Open event detail view → copy address bar URL → link
8. Write each event to BOTH Schedule and Meetings sheets
9. If no events on a day → one placeholder row (only date filled) in both sheets
10. Note any meeting with pre-work → flag for Step 7

### Step 2 — Inbox → Emails Inbox

Open Unread Mail search folder first — get total unread count.

Per-email procedure:
1. Note readStatus BEFORE clicking (bold = unread)
2. Double-click → full view → URL contains /id/... → copy → link
3. Read full thread (use get_page_text for bulk extraction)
4. Check To:/CC: → assign priority and addressed
5. Write summary, check for user's reply, write one row
6. If email was unread: mark-as-unread NOW (per Rule 2)
7. Verify unread indicator returned before moving on

Scan order — Tier 1 (every run):
  Inbox Focused → Inbox Other → [YOUR VIP FOLDERS] → [YOUR PRIORITY FOLDERS]

Scan order — Tier 2 (if badge shows):
  [YOUR NUMBERED/CATEGORY FOLDERS]

After all folders:
  Open "Sent Directly to Me" → safety net for missed direct emails
  Open "Flagged for Follow-up" → create tasks for anything flagged without one

### Step 3 — Sent → Emails Sent

1. Navigate to Sent Items
2. For each email sent today and yesterday: open → capture deep link → summarise
3. Detect commitments → write row → immediately create matching Tasks row

### Step 4 — 5-Day Sent Lookback → Tasks

1. Scan Sent Items for past 5 days
2. For each commitment email not yet fulfilled:
   - Not fulfilled → followup task
   - Past deadline → status: overdue
3. Deduplicate by title + owner

### Step 5 — Outlook To-Do → Tasks

1. Click the checkmark/tick icon in Outlook's left sidebar
   ⚠️ DO NOT navigate to https://outlook.cloud.microsoft/tasks/ — this URL errors
2. Read all lists: Tasks, Important, Planned, any custom lists
3. For each open item:
   - Link: click linked-email chip if present → capture email URL
   - Standalone task: leave link EMPTY
4. Write row: taskType: action, owner: [user's name]
5. Skip completed items

### Step 6 — Derive Tasks from Inbox

1. EVP/VP email, unanswered, direct → followup task, priority: high
2. Emails with specific deadlines → deadline task
3. Emails asking user to act, no reply → action task

### Step 7 — Derive Tasks from Calendar

1. Tomorrow's meetings with pre-work → action task, dueDate = today
2. Post-meeting action items from notes → action tasks

---

## Audit Gates (Cannot Be Skipped)

### Step 7.5 — Unread Restoration Audit

Before generating Excel:
1. Review notes for every email flagged readStatus: "unread"
2. Confirm each was marked-unread immediately after reading
3. Navigate back to fix any not confirmed
4. Proceed only when ALL unread emails are confirmed restored

### Step 7.6 — Link Audit

```python
import re
LINK_RE = re.compile(r'^https://outlook\.(cloud\.microsoft|office\.com)/.+/id/.+')

def audit_links(rows, sheet_name):
    fixed = 0
    for r in rows:
        link = (r.get('link') or '').strip()
        if link and not LINK_RE.match(link):
            print(f"[{sheet_name}] dropping invalid link on: {r.get('title') or r.get('subject')!r}")
            r['link'] = ''
            fixed += 1
    return fixed

total = sum(audit_links(s, name) for name, s in all_sheets.items())
print(f"Link audit: cleaned {total} invalid links")
```

### Step 8 — Merge Carry-Forward

1. Start from carry-forward list (daysOpen already incremented)
2. For each fresh task: match on title + owner
   - Match → apply Rule 4 merge (preserve valid link, prefer fresh status/dueDate)
   - No match → new task, daysOpen = 0
3. Drop all status = done tasks. Remove duplicates.
4. All output tasks: date = today

### Step 9 — Assemble, Format, Save

Sort order:
  Schedule/Meetings: time ascending
  Tasks: VIP-sourced first → priority (high→med→low) → dueDate asc → daysOpen desc
  Emails Inbox: priority (evp→vp→direct→cc→normal) → time desc
  Emails Sent: time desc

Formatting:
```python
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

HEADER_FONT     = Font(name='Arial', bold=True, size=10, color='FFFFFF')
HEADER_FILL     = PatternFill('solid', fgColor='2D3748')
DATA_FONT       = Font(name='Arial', size=10)
HIGH_FONT       = Font(name='Arial', size=10, color='CC0000')
OVERDUE_FILL    = PatternFill('solid', fgColor='FEE2E2')
COMMITMENT_FILL = PatternFill('solid', fgColor='FEF3C7')
LINK_FONT       = Font(name='Arial', size=10, color='0563C1', underline='single')
CELL_ALIGN      = Alignment(vertical='top', wrap_text=True)
```

Apply:
  Row 1: HEADER_FONT + HEADER_FILL, centered, height 24. Freeze at A2. Auto-filter.
  Tasks overdue: OVERDUE_FILL. High priority: HIGH_FONT. daysOpen >= 3: COMMITMENT_FILL.
  Commitment = yes rows in Sent: COMMITMENT_FILL.
  All link cells: LINK_FONT.

Column widths: date=12, time=8, names=22, titles=35, summaries=50, enums=8-10, link=45

Save:
```bash
# Build
wb.save('/sessions/<session>/my-day-data.xlsx')

# Deliver
cp /sessions/<session>/my-day-data.xlsx /sessions/<session>/mnt/data/my-day-data.xlsx

# Verify
ls -lh /sessions/<session>/mnt/data/my-day-data.xlsx
ls -lh /sessions/<session>/mnt/archive/my-day-data-old.xlsx
```

### Step 9.5 — Pre-Exit Gate

Confirm ALL before writing the summary. Fix any failure first.

[ ] Step 0.3 snapshot was taken
[ ] Every unread email confirmed restored (Step 7.5)
[ ] Every non-empty link matches LINK_RE (Step 7.6)
[ ] All 5 sheets exist with correct column names
[ ] Every commitment = yes sent email has a matching Tasks row
[ ] No task has status = done in output
[ ] mnt/data/my-day-data.xlsx exists with non-zero size
[ ] mnt/archive/my-day-data-old.xlsx exists (pre-run snapshot)

---

## Date & Time Format

All dates: YYYY-MM-DD only. Never DD/MM/YYYY or MM/DD/YYYY.
All times: HH:MM in 24-hour format (e.g. 14:30, not 2:30 PM).
Deadlines: YYYY-MM-DD only — no time component.

---

## Post-Save Summary

Day at a Glance — Daily Briefing Complete
==========================================
Run date:     [e.g. Monday 18 May 2026]
Date range:   [yesterday] → [today] → [tomorrow]

Schedule:     X events (Y tomorrow)
Tasks:        X total (Y high priority, Z overdue, W carried forward)
Meetings:     X total across 3 days
Emails Inbox: X emails (Y unread, Z from VIPs)
Emails Sent:  X emails (Y with commitments)
Commitments:  X active (Y overdue, Z due this week)

Audits:
  ✓ Unread preserved     — N emails restored
    (thread mark-unread may bump count >1 — expected)
  ✓ Link audit           — X/Y rows have valid deep links, Z dropped
  ✓ Commitment bridge    — all commitment tasks bridged
  ✓ Pre-exit gate        — all 8 checks passed

Files saved:
  ✓ my-day-data.xlsx     → day-at-a-glance/data/    (new run output)
  ✓ my-day-data-old.xlsx → archive/                  (pre-run snapshot)

Notable:
  - [VIP emails requiring attention]
  - [Tasks overdue >5 days]
  - [Deadlines due tomorrow]
  - [Anything unusual during the run]

---

## Post-Briefing Interaction

1. Present the summary
2. Confirm both files saved
3. Ask: "Are there additional reminders, tasks, or deadlines to add?"
4. If yes: load workbook from mnt/data/, add rows, save, re-copy to mnt/data/ only
5. Flag items aging past 5 days or with deadlines within 24 hours

---

## Quick Reference — Known Gotchas

| Situation                              | Correct behaviour                                      |
|----------------------------------------|--------------------------------------------------------|
| /tasks/ URL errors out                 | Use sidebar tick icon only                             |
| To-Do side panel doesn't update URL    | Leave link empty for standalone tasks                  |
| Mark-as-unread bumps thread count >1   | Expected; do not re-investigate                        |
| Reading-pane URL is a folder URL       | Double-click for full view; verify /id/ in URL         |
| /mnt/outputs/ exists                   | Never deliver there                                    |
| Microsoft Excel app                    | Never request access; openpyxl only                    |
| present_files                          | Never call in scheduled runs                           |
| Session folder name changes every run  | Never hardcode; always use mounted paths               |
````

---

[← Setting Up Cowork](./02-setup.md) · [Back to Index](./README.md) · [**Next: Customization →**](./04-customization.md)
