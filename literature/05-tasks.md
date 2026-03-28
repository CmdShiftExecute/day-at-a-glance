<div align="center">

# ✅ Chapter 5: Tasks & Productivity

**Track, prioritize, and conquer.**

</div>

---

[← Schedule & Timeline](./04-schedule-timeline.md) · [Back to Index](./README.md) · [Next: Emails →](./06-emails.md)

---

## Overview

The Tasks panel is your productivity hub. It displays all tasks for the active day, sorted by type and priority, with one-click status toggling that syncs directly to your Excel file.

---

## 📋 Task Properties

Every task has these fields:

| Field | Type | Description |
|-------|------|-------------|
| **Title** | Text | The task description |
| **Priority** | `high` · `medium` · `low` | Urgency level — determines sort order and visual styling |
| **Status** | `open` · `done` · `overdue` | Current state — toggleable via checkbox |
| **Task Type** | `action` · `deadline` · `followup` · `personal` | Category that groups tasks in the panel |
| **Due Date** | YYYY-MM-DD | Optional deadline for overdue detection |
| **Source** | Text | Where the task originated (email, meeting, etc.) |
| **Owner** | Text | Who's responsible |
| **Days Open** | Number | How many days the task has been open (auto-incremented) |
| **Category** | Text | Optional label for grouping |
| **Link** | URL | Optional reference link |

---

## 📊 Sorting Logic

Tasks are sorted using a **two-level hierarchy**:

**Level 1 — Task Type** (groups):

| Order | Type | Description |
|-------|------|-------------|
| 1st | 🎯 **Action** | Things to do right now |
| 2nd | ⏰ **Deadline** | Time-sensitive deliverables |
| 3rd | 🔄 **Follow-up** | Items awaiting someone else's response |
| 4th | 👤 **Personal** | Non-work items |

**Level 2 — Priority** (within each group):

| Order | Priority | Visual |
|-------|----------|--------|
| 1st | 🔴 **High** | Red accent badge |
| 2nd | 🟡 **Medium** | Amber accent badge |
| 3rd | 🟢 **Low** | Green accent badge |

---

## ✅ Status Toggling

Click any task's checkbox to toggle between **open** and **done**:

```
Toggle Flow:
      │
  ┌───┴───┐
  ▼       ▼
 open → done    (checkbox fills, strikethrough text)
 done → open    (checkbox clears, text restores)
      │
      ▼
  React state updates instantly (optimistic UI)
      │
      ▼
  POST /api/update-task  (async, fire-and-forget)
      │
      ▼
  Excel file updated:
    Tasks sheet → matching row → Status column changed
```

> 💡 The update is **optimistic** — the UI changes instantly while the Excel write happens in the background. If the server is unreachable, the UI state is still correct for your session.

---

## 🔄 Task Carry-Forward

One of the most powerful features: **open and overdue tasks automatically appear on the next day.**

```
Yesterday (27 Mar)                    Today (28 Mar)
┌──────────────────────┐             ┌──────────────────────┐
│ ✅ Deploy hotfix     │             │                      │
│ ☐  Review PR #42     │ ──────────→│ ☐  Review PR #42     │
│    status: open      │  carried   │    status: open       │
│    daysOpen: 1       │  forward   │    daysOpen: 2        │
│ ☐  Update docs       │ ──────────→│ ☐  Update docs       │
│    status: overdue   │            │    status: overdue    │
│    daysOpen: 3       │            │    daysOpen: 4        │
└──────────────────────┘             └──────────────────────┘
```

**Rules:**

- Only tasks with status `open` or `overdue` carry forward
- `done` tasks stay on their original day
- `daysOpen` increments by 1 for each carry-forward
- Carried tasks appear alongside the new day's native tasks
- This works across Yesterday → Today → Tomorrow

---

## ⏰ Overdue Detection

A task becomes **overdue** when its due date has passed (compared against your city's timezone):

```
if (task.dueDate < city's current date && task.status !== 'done')
    → status: overdue
```

Overdue tasks get:

- 🔴 A red status badge
- 📊 Counted in the stats bar's overdue metric
- ⚠️ Can trigger the **alert** tone in the summary line
- 🔄 Automatically carried forward to the next day

---

## ➕ Quick Add Tasks

Click the **+** button on the tasks panel header to create a new task:

| Field | Options |
|-------|---------|
| **Title** | Free text |
| **Priority** | High, Medium, Low |
| **Task Type** | Action, Deadline, Follow-up, Personal |
| **Due Date** | Date picker (optional) |
| **Owner** | Free text (defaults to your name) |

The task is immediately added to the Excel file's **Tasks** sheet and appears in the panel.

---

## 📊 Stats Integration

Task metrics feed into the [Stats Bar](./02-dashboard-overview.md#-stats-bar):

| Metric | Counting Rule |
|--------|---------------|
| **Open** | `status === 'open'` |
| **Done** | `status === 'done'` |
| **Overdue** | `status === 'overdue'` |
| **Total** | All tasks for the active day (including carried-forward) |

These numbers animate on page load with the counting-up effect.

---

[← Schedule & Timeline](./04-schedule-timeline.md) · [Back to Index](./README.md) · [**Next: Email Intelligence →**](./06-emails.md)
