<div align="center">

# 🤝 Chapter 7: Commitment Tracker

**Never drop the ball on a promise.**

</div>

---

[← Emails](./06-emails.md) · [Back to Index](./README.md) · [Next: Data & Excel →](./08-data-excel.md)

---

## Overview

The Commitment Tracker panel aggregates all follow-up items — promises you've made, deadlines you've set, and actions others owe you — into a single accountability dashboard. It scans your sent emails for commitment flags and surfaces them with deadline awareness.

---

## 🔍 How Commitments Are Detected

Commitments come from two sources:

### 1. Sent Email Commitments

When a sent email has `commitment: 'yes'` in the Excel data, it's automatically tracked:

```
Emails Sent sheet:
  ┌────────────────────────────────────────────────┐
  │ To: vendor@supplier.com                         │
  │ Subject: PO Approval — will sign by Thursday    │
  │ Commitment: yes                                 │
  │ Owner: You                                      │
  │ Deadline: 2026-03-28                            │
  └────────────────────────────────────────────────┘
                    │
                    ▼
  Commitment Tracker Panel:
  ┌────────────────────────────────────────────────┐
  │ 📋 PO Approval — will sign by Thursday         │
  │    Owner: You  │  Due: 28 Mar  │  ⚠️ Due today │
  └────────────────────────────────────────────────┘
```

### 2. Manually Added Commitments

Use the **+** button on the Commitment Tracker panel to create entries directly:

| Field | Description |
|-------|-------------|
| **Title** | What was committed |
| **Owner** | Who's responsible for the action |
| **Deadline** | When it's due |
| **Date** | Pre-filled with the active day |

---

## 📊 Commitment Properties

| Field | Type | Description |
|-------|------|-------------|
| **Title** | Text | The commitment description (from email subject or manual entry) |
| **Owner** | Text | Person responsible for follow-through |
| **Deadline** | Date | When the commitment is due |
| **Source** | Auto | Which sent email it originated from (if applicable) |

---

## ⏰ Deadline Awareness

The tracker monitors deadlines against your city's timezone:

| Status | Condition | Visual |
|--------|-----------|--------|
| 🟢 **On track** | Deadline is in the future | Standard styling |
| 🟡 **Due today** | Deadline matches today's date | Amber warning |
| 🔴 **Overdue** | Deadline has passed | Red alert styling |

---

## 🔄 Cross-Day Visibility

Commitments aren't confined to a single day. The tracker scans **all loaded data** (yesterday, today, and tomorrow) to surface relevant items:

```
Yesterday's sent email:
  "Will send the revised proposal by tomorrow"
  Deadline: today
      │
      ▼
  Shows in Today's commitment tracker as "Due today"
```

This ensures nothing falls through the cracks, even if the original email was sent days ago.

---

## 📊 Stats Integration

The commitment count appears in the [Stats Bar](./02-dashboard-overview.md#-stats-bar):

```
Tasks: 5 open · 3 done  │  Meetings: 4  │  Emails: 7  │  Commitments: 2
```

---

[← Emails](./06-emails.md) · [Back to Index](./README.md) · [**Next: Data & Excel Integration →**](./08-data-excel.md)
