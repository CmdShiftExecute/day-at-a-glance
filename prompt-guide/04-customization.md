<div align="center">

# 🎛️ Chapter 4: Customizing for Your Setup

**Make the prompt yours. Every workplace is different.**

</div>

---

[← The Prompt](./03-sample-prompt.md) · [Back to Index](./README.md) · [Next: Understanding the Output →](./05-excel-output.md)

---

## Overview

The sample prompt works out of the box with standard Outlook Web. But workplaces differ — your VIPs have different names, your Outlook folder structure is unique, your timezone matters, and your task categories won't match a generic template. This chapter walks through every customization point.

---

## 1. Paths and Directory Mounts

These two paths must be accurate or the task will fail to deliver its output.

### Dashboard Data Path

Find where Day at a Glance lives on your machine:

```bash
# If you cloned the repo, find it with:
find ~ -name "my-day-data.xlsx" -not -path "*/node_modules/*" 2>/dev/null

# Or navigate there and print the path:
cd /path/to/day-at-a-glance/data && pwd
```

Replace `YOUR_DATA_PATH` in the prompt with the full absolute path. For example:

```
/Users/yourname/Projects/day-at-a-glance/data
```

### Archive Path

This folder holds crash-recovery backups. It must exist before you run:

```bash
mkdir -p ~/Documents/Claude/Scheduled/daily-briefing
```

Then replace `YOUR_ARCHIVE_PATH` with:

```
/Users/yourname/Documents/Claude/Scheduled/daily-briefing
```

> 💡 Both paths must be full absolute paths — no `~`, no relative references.

---

## 2. Your Identity

Replace `YOUR_EMAIL@company.com` and `[YOUR NAME]` in the Context section:

```
# Before
You are a task for [YOUR NAME] (YOUR_EMAIL@company.com)

# After
You are a task for Alex Johnson (alex.johnson@acmecorp.com)
```

This helps the agent understand whose calendar and inbox it is reading when filtering To/CC fields and determining ownership of tasks.

---

## 3. VIP People (High-Priority Senders)

The prompt has a Rule 5 section for prioritizing specific senders. This drives:
- `priority: evp` or `priority: vp` in the Emails Inbox sheet
- `priority: high` on all derived tasks
- EVP tasks always sorting first

### If you have VIPs

Replace the placeholders with real names:

```
# Before
- YOUR_EVP_NAME: inbox priority: evp, derived tasks priority: high
- YOUR_VP_NAME: inbox priority: vp, derived tasks priority: high

# After
- Sarah Chen (CEO): inbox priority: evp, derived tasks priority: high
- Marcus Webb (CTO): inbox priority: vp, derived tasks priority: high
```

### If you have more than two VIPs

Add additional lines. The priority tier names are fixed (`evp`, `vp`, `direct`, `cc`, `normal`) — if you need more than two tiers, use `direct` for the third level:

```
- Sarah Chen (CEO): inbox priority: evp
- Marcus Webb (CTO): inbox priority: vp
- Priya Nair (CFO): inbox priority: direct (treat as a VIP-level direct)
```

### If you have no VIP concept

Delete Rule 5 entirely and remove VIP-related references from the sort order in Step 9.

---

## 4. Outlook Folder Structure

This is the most important customization. The sample prompt's folder list is a placeholder — your Outlook will have different folder names.

### How to Find Your Folder Names

1. Open Outlook Web at `https://outlook.cloud.microsoft`
2. Expand the folder tree in the left sidebar
3. Note the exact names of every folder you want Claude to scan
4. Use these exact names (case-sensitive) in the prompt's folder list

### Tier System

Organize your folders into three tiers based on priority:

```
Always scan (Tier 1):
  - Inbox (Focused tab)    ← always present
  - Inbox (Other tab)      ← always present
  - [Your VIP folder]      ← e.g. "EVP", "CEO Mail"
  - [Your high-importance folder]   ← e.g. "TODO", "Flagged"

Scan if badge shows unread (Tier 2):
  - [Your project/client folders]
  - [Your team communication folders]

Scan if badge shows unread (Tier 3):
  - [Lower-priority folders]
  - [Informational folders]

Always skip:
  - Drafts
  - Deleted Items
  - Junk Email
  - Automated notification folders (IT alerts, system emails, etc.)
```

### Example: Generic Corporate Structure

```
Tier 1 (always):
  Inbox (Focused tab)
  Inbox (Other tab)
  Leadership
  Action Required

Tier 2 (if unread):
  Projects
  Finance
  HR
  Client: Acme Corp
  Client: Globex Industries

Tier 3 (if unread):
  Newsletters
  Reports

Skip:
  Drafts, Deleted Items, Junk Email, Clutter, IT Alerts
```

---

## 5. Task Categories

The `category` column in the Tasks sheet is a free-text label you can customize. The sample prompt derives categories from the email folder the task came from. Align your categories with your Outlook folder names:

```
# If your Outlook folder is "Finance", use:
category: Finance

# If your Outlook folder is "Client: Acme Corp", use:
category: Acme Corp

# For Outlook To-Do derived tasks, use the list name:
category: Work Tasks
```

You can also hardcode category rules in the prompt:

```
Category assignment rules:
  - Tasks from Finance folder → category: Finance
  - Tasks from Projects/* → category: [project name]
  - Tasks from EVP/CEO → category: Leadership
  - Outlook To-Do → category: [list name]
  - Personal → category: Personal
```

---

## 6. Timezone and Date Window

### Timezone

The prompt uses `today`, `yesterday`, and `tomorrow` relative to the system clock at run time. The Cowork sandbox runs in UTC by default. To ensure dates align with your local timezone, add this to Step 0:

```python
import os
os.environ['TZ'] = 'Asia/Dubai'  # Replace with your timezone
import time
time.tzset()

from datetime import date, timedelta
TODAY     = date.today()
YESTERDAY = TODAY - timedelta(days=1)
TOMORROW  = TODAY + timedelta(days=1)
print(f"Run date context: {YESTERDAY} / {TODAY} / {TOMORROW}")
```

Common timezone strings:

| Location | Timezone String |
|----------|----------------|
| Dubai (GST) | `Asia/Dubai` |
| London (GMT/BST) | `Europe/London` |
| New York (EST/EDT) | `America/New_York` |
| Singapore | `Asia/Singapore` |
| Sydney | `Australia/Sydney` |

> 📖 Full list: [IANA Timezone Database](https://www.iana.org/time-zones)

### Extending the Window

If you want a wider view (e.g., today + next 2 days instead of tomorrow only), adjust Step 1:

```
Read today's events → date = today
Read tomorrow's events → date = day+1
Read day-after-tomorrow's events → date = day+2
```

And update the date range line in the post-save summary accordingly.

---

## 7. Commitment Detection Language

The prompt marks sent emails as `commitment: yes` when it detects action-oriented language. You can tune this to match how your team communicates:

### Adding Patterns

```
Mark commitment: yes if the email contains any of:
  # English defaults
  - "by tomorrow", "due Friday", "before end of week", "by [date]"
  - "please submit", "kindly confirm", "we need to close", "please share"
  - "let me know", "please check", "awaiting your response"
  - "urgent", "priority", "ASAP"

  # Add your organization's language:
  - "kindly revert" (common in Gulf/South Asian business contexts)
  - "please action"
  - "for your necessary action"
  - "please arrange"
  - "loop closed by"
```

---

## 8. Run Schedule

Beyond daily, you can run on multiple schedules:

| Schedule | Cron | Use Case |
|----------|------|----------|
| Once a day (morning) | `0 6 * * *` | Standard daily briefing |
| Twice a day | `0 6,13 * * *` | Catch afternoon emails too |
| Weekdays only | `0 6 * * 1-5` | Skip weekends |
| Every 4 hours | `0 6,10,14,18 * * *` | High-volume inbox |

In Cowork's UI, you can typically set the schedule visually rather than writing cron syntax directly.

---

## 9. Minimal Prompt (Simpler Setup)

If the full prompt is more than you need, here's a minimal version that covers the essentials without the VIP system, advanced folder scanning, or formatting:

Change these sections to simpler versions:

**Rule 5** → Remove entirely if you have no VIP concept

**Folder structure** → Just scan Inbox (Focused) and Inbox (Other)

**Formatting block** → Remove the conditional formatting; just write clean data

**Scan tiers** → Remove Tier 2 and Tier 3; only always-scan Tier 1

This reduces run time and context usage significantly — useful for smaller inboxes or less complex workflows.

---

## Customization Checklist

<table>
<tbody>
<tr><td>✅</td><td>Data path replaced with actual local path</td></tr>
<tr><td>✅</td><td>Archive path replaced and folder created</td></tr>
<tr><td>✅</td><td>Name and email address updated</td></tr>
<tr><td>✅</td><td>VIP names updated (or Rule 5 removed)</td></tr>
<tr><td>✅</td><td>Outlook folder names verified against actual Outlook</td></tr>
<tr><td>✅</td><td>Folder scan tiers adjusted</td></tr>
<tr><td>✅</td><td>Timezone set correctly</td></tr>
<tr><td>✅</td><td>Category rules match your folder structure</td></tr>
<tr><td>✅</td><td>Commitment language tuned to your team's style</td></tr>
</tbody>
</table>

---

[← The Prompt](./03-sample-prompt.md) · [Back to Index](./README.md) · [**Next: Understanding the Output →**](./05-excel-output.md)
