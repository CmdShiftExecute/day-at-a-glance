<div align="center">

# 📅 Chapter 4: Schedule & Timeline

**Your day, hour by hour.**

</div>

---

[← Settings](./03-settings.md) · [Back to Index](./README.md) · [Next: Tasks →](./05-tasks.md)

---

## Overview

The Schedule & Timeline is the backbone of your daily view. It presents every scheduled item — meetings, focus blocks, breaks, tasks, and travel — on an hour-by-hour timeline with color-coded event types and a real-time position indicator.

---

## 📅 Event Types

Every schedule item has a `type` that determines its color and icon:

| Type | Color | Use Case |
|------|-------|----------|
| 🔵 **Meeting** | Blue (`--accent-blue`) | Calls, standups, reviews, 1:1s |
| 🟣 **Task** | Purple (`--accent-purple`) | Scheduled work blocks for specific tasks |
| 🩷 **Focus** | Pink (`--accent-pink`) | Deep work / focus time blocks |
| 🩵 **Break** | Cyan (`--accent-cyan`) | Lunch, coffee, rest periods |
| 🟡 **Travel** | Amber (`--accent-amber`) | Commute, transit, travel time |

Each type has a distinct background tint (12% opacity), border color, and text color — making it easy to scan the timeline and understand your day's composition at a glance.

---

## ⏰ The Timeline Panel

The timeline panel shows all schedule items sorted chronologically:

```
  08:00 ─ 08:30  │  ☕ Morning Review & Coffee         [break]
  08:30 ─ 09:00  │  📱 Daily Standup                   [meeting]
  09:00 ─ 10:30  │  💰 Q1 Budget Review                [meeting]
  10:30 ─ 12:00  │  🎯 Product Roadmap Planning        [focus]
  12:00 ─ 13:00  │  🍽️ Lunch Break                     [break]
  13:00 ─ 14:00  │  🎨 Design Review — Mobile App v3   [meeting]
 ─── NOW ─── ──────────────────────────────────────────────
  14:30 ─ 15:30  │  📋 Vendor RFP Evaluation           [task]
  16:00 ─ 17:00  │  👥 1:1 with Engineering Lead       [meeting]
```

**Key features:**

- **Time range** displayed for each item (start → end)
- **Color-coded** left border matching the event type
- **Current time indicator** — a horizontal line marking "now" (only on Today view)
- **Description/location** shown as secondary text when available
- **Meeting links** — clickable when a Teams/Zoom link is attached
- **Collapsible** — click the panel header to expand or collapse

---

## 📅 The Meetings Panel

A separate dedicated panel shows **meeting-specific detail** for items that come from your calendar:

| Field | Description |
|-------|-------------|
| **Title** | Meeting subject line |
| **Time** | Start → End in your chosen format |
| **Organizer** | Who scheduled it |
| **Attendees** | Comma-separated participant names |
| **Location** | Room name or "Microsoft Teams" |
| **Type** | Teams call or in-person |
| **Link** | Clickable join link (if available) |
| **Response** | Your RSVP status: accepted, tentative, declined |

> 💡 The Meetings panel merges with the Timeline. If a meeting exists in both the Schedule sheet and the Meetings sheet of your Excel file, the data is combined — schedule provides the time slot, meetings provides the rich metadata.

---

## 📅 Up Next Indicator

The **"Up Next"** indicator appears in the [summary line](./02-dashboard-overview.md#-the-summary-line) and shows whatever is coming next on your schedule — regardless of type.

```
✨ Today: 3 meetings, 2 open tasks  │  📅 Up Next: Design Review at 13:00
```

**How it works:**

```
Current time (in your city's timezone)
      │
      ▼
Scan ALL schedule items chronologically
      │
      ├── Find first item where start time > now
      │       └── Show: "📅 Up Next: [title] at [time]"
      │
      └── No future items found
              └── Indicator hidden
```

**Key details:**

- **Includes ALL types** — meetings, focus blocks, breaks, tasks, travel
- **Only shows on the Today view** — hidden for Yesterday and Tomorrow
- **Bold red text** (`#ef4444`) with `font-extrabold` time — designed to be unmissable
- **Calendar emoji** (📅) prefix for visual anchoring

---

## ➕ Adding Schedule Items

Click the **+** button on the timeline panel header to open the Quick Add modal:

| Field | Options |
|-------|---------|
| **Title** | Free text — event name |
| **Date** | Pre-filled with the active day's date |
| **Start Time** | Time picker (HH:MM) |
| **End Time** | Time picker (HH:MM) |
| **Type** | Meeting, Task, Focus, Break, or Travel |

New items are added to the Excel file's **Schedule** sheet and appear on the timeline immediately.

---

## 🔗 Schedule + Meeting Merging

When both the **Schedule** and **Meetings** sheets contain data for the same day, the dashboard intelligently merges them:

```
Schedule sheet:                    Meetings sheet:
┌──────────────────────┐          ┌──────────────────────────┐
│ 09:00 Q1 Budget      │  ←─┐    │ Q1 Budget Review          │
│ type: meeting         │    │    │ Organizer: CFO            │
│                       │    ├──→ │ Attendees: Team A, Team B │
│                       │    │    │ Location: Conf Room 3     │
└──────────────────────┘    │    │ Link: teams.microsoft.com │
                             │    └──────────────────────────┘
                             │
                        Merged result:
                        ┌──────────────────────────────────┐
                        │ 09:00-10:30 Q1 Budget Review      │
                        │ type: meeting | 📍 Conf Room 3    │
                        │ 👤 CFO | 👥 Team A, Team B       │
                        │ 🔗 Join Teams meeting              │
                        └──────────────────────────────────┘
```

Meetings that don't appear in the Schedule sheet are added as separate timeline entries.

---

[← Settings](./03-settings.md) · [Back to Index](./README.md) · [**Next: Tasks & Productivity →**](./05-tasks.md)
