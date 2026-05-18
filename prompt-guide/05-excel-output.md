<div align="center">

# 📊 Chapter 5: Understanding the Output

**What good output looks like — and how to spot when something went wrong.**

</div>

---

[← Customization](./04-customization.md) · [Back to Index](./README.md) · [Next: Troubleshooting →](./06-troubleshooting.md)

---

## Overview

Every run produces a single file: `my-day-data.xlsx`. This chapter explains what each of its five sheets should look like after a successful run, what the audit gates protect you from, and how to manually inspect the output to validate quality.

---

## The Five Sheets at a Glance

After a successful run, open `data/my-day-data.xlsx` and check each sheet:

| Sheet | What You Should See |
|-------|-------------------|
| **Schedule** | One row per calendar event across 3 days. Empty days have a single row with only the date filled. |
| **Tasks** | All open/overdue tasks from today. No `done` tasks. `daysOpen` incremented from previous run. |
| **Meetings** | Same calendar data as Schedule, with richer metadata (attendees, organizer, location). |
| **Emails Inbox** | Emails from the past 1–2 days across all scanned folders. VIP rows in red/amber. |
| **Emails Sent** | Sent emails from yesterday and today. Commitment rows highlighted in amber. |

---

## What "Good" Looks Like

### ✅ Schedule Sheet

```
date        | time  | endTime | title                     | type    | link
------------|-------|---------|---------------------------|---------|------------------------------------------
2026-05-17  | 09:00 | 10:00   | Q1 Budget Review          | meeting | https://outlook.cloud.microsoft/.../id/...
2026-05-17  | 11:00 | 11:30   | Focus Block               | focus   |
2026-05-18  | 08:30 | 09:00   | Standup                   | meeting | https://outlook.cloud.microsoft/.../id/...
2026-05-19  | (empty)                                                                             ← empty day placeholder
```

**Green flags:**
- Times are in `HH:MM` 24-hour format
- Types are lowercase: `meeting`, `focus`, `break`, `task`, `travel`
- Links contain `/id/` (deep links, not folder URLs)
- Tomorrow has data (the 3-day window is working)
- Empty days have a single row with only `date` filled

**Red flags:**
- Missing tomorrow entirely (calendar read failed)
- Time values like `2:30 PM` (12-hour format — should be `14:30`)
- Link column is blank for all rows (link capture failed)
- Duplicate rows for the same event

---

### ✅ Tasks Sheet

```
date        | title                           | priority | status  | daysOpen | taskType | link
------------|----------------------------------|----------|---------|----------|----------|-------------------
2026-05-18  | Review vendor proposal           | high     | open    | 3        | action   | https://...id/...
2026-05-18  | Submit Q1 report                 | high     | overdue | 7        | deadline |
2026-05-18  | Reply to CEO re: headcount       | high     | open    | 1        | followup | https://...id/...
```

**Green flags:**
- `daysOpen` is incremented from yesterday's run (tasks aging correctly)
- Overdue tasks have `status: overdue` and `priority: high`
- New tasks from today's emails have `daysOpen: 0`
- `link` column has valid Outlook deep links for tasks that came from emails
- No `status: done` rows (done tasks are dropped, not carried forward)

**Red flags:**
- `daysOpen` is 0 for all tasks (carry-forward not reading the previous file)
- `daysOpen` is blank for tasks that should be aging
- Tasks with `link: Open` or `link: N/A` (bad link capture — now caught by the Link Audit)
- Duplicate tasks (same title + owner appearing twice)

---

### ✅ Emails Inbox Sheet

```
date        | from              | subject                       | priority | readStatus | myReply | link
------------|-------------------|-------------------------------|----------|------------|---------|-------------------
2026-05-18  | Sarah Chen (CEO)  | Re: Budget approval           | evp      | read       | no      | https://...id/...
2026-05-18  | Marcus Webb       | Q1 architecture decisions     | vp       | unread     | no      | https://...id/...
2026-05-18  | James Liu         | Vendor pricing update         | direct   | read       | yes     | https://...id/...
```

**Green flags:**
- VIP rows show `priority: evp` or `priority: vp`
- `readStatus` reflects what the email was *before* Claude read it
- Unread emails should still be unread in your actual Outlook after the run
- `link` values all contain `/id/`
- `summary` is informative, not just the subject line

**Red flags:**
- All emails show `readStatus: read` even if you know some were unread (unread restoration may have failed)
- `priority` field uses `high/medium/low` instead of `evp/vp/direct/cc/normal` (wrong value set)
- Empty `summary` column (extraction failed)
- No emails at all (inbox scan failed)

---

### ✅ Emails Sent Sheet

```
date        | to              | subject               | commitment | owner       | deadline   | link
------------|-----------------|----------------------|------------|-------------|------------|-------------------
2026-05-18  | Finance Team    | Q1 numbers needed    | yes        | James Liu   | 2026-05-20 | https://...id/...
2026-05-18  | Sarah Chen      | Proposal attached    | no         |             |            | https://...id/...
```

**Green flags:**
- Commitment rows have `owner` and `deadline` filled
- Each `commitment: yes` row has a matching task in the Tasks sheet
- `link` values are deep links to the sent items

---

## How Links Work

### Why Links Matter

Every task card in the dashboard has an **"Open source"** button. Click it and Outlook opens directly to the email that generated the task. This is the feature that makes the dashboard genuinely useful rather than just informational.

### The Deep Link Pattern

A valid Outlook deep link looks like this:

```
https://outlook.cloud.microsoft/mail/inbox/id/AAQkAGJmZGUz...
https://outlook.cloud.microsoft/mail/sentitems/id/AAQkAGJm...
```

The `/id/` segment followed by a long encoded string is what makes it unique to a specific message. If the link is just `https://outlook.cloud.microsoft/mail/inbox/` without the `/id/` part, clicking it will open the inbox but not the specific email.

### What the Link Audit Does

Step 7.6 in the prompt runs a validation pass before saving. Any link that doesn't match the deep-link pattern is **replaced with an empty string** — so the dashboard simply shows no button rather than a broken one.

To check what was cleaned: look in the run log for lines like:
```
[Tasks] dropping invalid link: 'Open' on: 'Review vendor proposal'
Link audit: cleaned 3 invalid links
```

If you see many cleaned links, the link capture step needs attention — see [Chapter 6: Troubleshooting](./06-troubleshooting.md#broken-links).

---

## How Carry-Forward Works

One of the most important features of the automation is that tasks don't disappear — they age.

```
Run on Monday:
  Task: "Review vendor proposal" — daysOpen: 0, status: open

Run on Tuesday:
  Same task: daysOpen: 1, status: open

Run on Wednesday:
  Same task: daysOpen: 2, status: open

Run on Thursday (deadline was Wednesday):
  Same task: daysOpen: 3, status: overdue, priority: high

User marks it done in dashboard on Thursday:
  status: done written to Excel

Run on Friday:
  Task is GONE — done tasks are never carried forward
```

### What Carry-Forward Preserves

| Field | Behaviour |
|-------|-----------|
| `daysOpen` | Incremented by 1 each run |
| `link` | Preserved from the original capture — never replaced by empty |
| `source` | Preserved from original (e.g., which email it came from) |
| `category` | Preserved |
| `taskType` | Preserved |
| `dueDate` | Updated if fresh data has a newer date |
| `status` | Updated to reflect overdue if past deadline |
| `priority` | Promoted to `high` if overdue |

---

## Validating a Run Manually

After your first few runs, do a quick spot-check:

<table>
<tbody>
<tr>
<td>✅</td>
<td>Open <code>my-day-data.xlsx</code> and verify it has all 5 sheets</td>
</tr>
<tr>
<td>✅</td>
<td>Check the Schedule sheet — does it have today, yesterday, and tomorrow?</td>
</tr>
<tr>
<td>✅</td>
<td>Check the Tasks sheet — are <code>daysOpen</code> values > 0 for older tasks?</td>
</tr>
<tr>
<td>✅</td>
<td>Check a few link cells — do they contain <code>/id/</code>?</td>
</tr>
<tr>
<td>✅</td>
<td>Open your actual Outlook inbox — were unread emails preserved?</td>
</tr>
<tr>
<td>✅</td>
<td>Check the run log post-save summary — did all 8 pre-exit gate checks pass?</td>
</tr>
</tbody>
</table>

---

## Reading the Post-Save Summary

The run log ends with a summary like this:

```
Day at a Glance — Daily Briefing Complete
==========================================
Run date: Monday 18 May 2026
...
Audits:
  ✓ Unread preserved     — 4 emails restored
  ✓ Link audit           — 38/41 rows have valid deep links, 3 dropped
  ✓ Commitment bridge    — all commitment tasks bridged
  ✓ Pre-exit gate        — all 8 checks passed
```

| Summary Line | What to Watch For |
|-------------|------------------|
| `Unread preserved — N emails restored` | N should match how many unread emails were in your inbox during the run |
| `X/Y rows have valid deep links` | If X is much smaller than Y, link capture is failing for many items |
| `Z dropped` | How many garbage links the audit cleaned. If consistently > 5, review the link capture steps |
| `Pre-exit gate — all 8 checks passed` | If any check failed, the summary will say which one |

---

[← Customization](./04-customization.md) · [Back to Index](./README.md) · [**Next: Troubleshooting →**](./06-troubleshooting.md)
