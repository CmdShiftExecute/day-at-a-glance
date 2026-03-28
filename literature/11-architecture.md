<div align="center">

# 🏗️ Chapter 11: Architecture & API Reference

**Under the hood.**

</div>

---

[← Keyboard Shortcuts](./10-keyboard-shortcuts.md) · [Back to Index](./README.md) · [Next: Deployment →](./12-deployment.md)

---

## Tech Stack

<table>
<thead>
<tr>
<th>Layer</th>
<th>Technology</th>
<th>Version</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Framework</b></td>
<td>Next.js (App Router)</td>
<td>14.2</td>
<td>Full-stack React framework with server-side API routes</td>
</tr>
<tr>
<td><b>Language</b></td>
<td>TypeScript</td>
<td>Strict mode</td>
<td>Type safety across the entire codebase</td>
</tr>
<tr>
<td><b>UI Library</b></td>
<td>React</td>
<td>18</td>
<td>Component-based UI with hooks</td>
</tr>
<tr>
<td><b>Styling</b></td>
<td>Tailwind CSS</td>
<td>3.x</td>
<td>Utility-first CSS with custom design tokens</td>
</tr>
<tr>
<td><b>Animations</b></td>
<td>Framer Motion</td>
<td>12.x</td>
<td>Declarative animations — splash, panels, transitions</td>
</tr>
<tr>
<td><b>Icons</b></td>
<td>Lucide React</td>
<td>1.x</td>
<td>Consistent, lightweight icon set</td>
</tr>
<tr>
<td><b>UI Components</b></td>
<td>shadcn/ui</td>
<td>4.x</td>
<td>Accessible primitive components (tooltip, etc.)</td>
</tr>
<tr>
<td><b>Excel</b></td>
<td>SheetJS (xlsx)</td>
<td>0.18</td>
<td>Reading and writing Excel files on the server</td>
</tr>
<tr>
<td><b>Deployment</b></td>
<td>Docker</td>
<td>Multi-stage</td>
<td>Containerized standalone production build</td>
</tr>
</tbody>
</table>

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                             │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌───────────┐           │
│  │useSettings│   │useDayData │   │ useClock  │           │
│  │           │   │           │   │ useWeather│           │
│  │ name      │   │ allData   │   │ useTheme  │           │
│  │ city      │   │ activeDay │   │           │           │
│  │ format    │   │ stats     │   │ time/date │           │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘          │
│        │               │               │                 │
│        └───────────┬───┘───────────────┘                 │
│                    │                                     │
│                    ▼                                     │
│            ┌──────────────┐                              │
│            │   page.tsx    │  Main dashboard page         │
│            │  (orchestrator│  Computes meetingIndicator,  │
│            │   component)  │  enriches schedule,          │
│            │               │  manages splash state        │
│            └───────┬───────┘                              │
│                    │                                     │
│        ┌───────────┼───────────┐                         │
│        ▼           ▼           ▼                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│   │ Header  │ │ Panels  │ │ Modals  │                   │
│   │ Summary │ │ (6 data │ │ (settings│                   │
│   │ Stats   │ │  panels)│ │  help,   │                   │
│   │ Nav     │ │         │ │  import) │                   │
│   └─────────┘ └─────────┘ └─────────┘                   │
│                                                          │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP (fetch)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API)                   │
│                                                          │
│   GET /api/load-data      → reads my-day-data.xlsx      │
│   GET /api/settings       → reads data/settings.json    │
│   POST /api/settings      → writes data/settings.json   │
│   POST /api/update-task   → updates task row in Excel   │
│   POST /api/add-entry     → appends row to Excel sheet  │
│   POST /api/upload-photo  → saves profile photo         │
│                                                          │
└────────────────────────┬─────────────────────────────────┘
                         │ File I/O
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    FILE SYSTEM                            │
│                                                          │
│   data/settings.json       ← user preferences           │
│   data/my-day-data.xlsx    ← all day data               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🪝 React Hooks

### `useDayData(highPriorityEmails, city)`

The central data management hook. Handles everything from loading to mutation.

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `activeDay` | `DayView` | Current view: `'yesterday'` / `'today'` / `'tomorrow'` |
| `setActiveDay()` | Function | Switch the active day |
| `dayData` | `DayData` | Filtered data for the current day |
| `allData` | `Record<string, DayData>` | All loaded data keyed by date |
| `isUsingDemo` | `boolean` | Whether demo data is active |
| `isLoading` | `boolean` | Data loading state |
| `lastLoaded` | `Date \| null` | Timestamp of last successful load |
| `importData()` | Function | Replace data with imported Excel |
| `resetToDemo()` | Function | Revert to built-in demo data |
| `toggleTask()` | Function | Toggle task status (with Excel sync) |
| `refreshFromFolder()` | Function | Reload from the Excel file |
| `stats` | Object | Computed counts for the active day |

### `useSettings()`

Dual-persistence settings management.

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `settings` | `UserSettings` | Current settings object |
| `updateSettings()` | Function | Merge partial settings update |
| `displayName` | `string` | Greeting text (name or "Hi, there!") |
| `hasPhoto` | `boolean` | Whether a profile photo is set |
| `mounted` | `boolean` | Hydration flag for SSR safety |

### `useClock(city, dateFormat?, timeFormat?)`

| Property | Type | Description |
|----------|------|-------------|
| `time` | `string` | Formatted current time in the city's timezone |
| `date` | `string` | Formatted current date |
| `mounted` | `boolean` | Hydration flag |

Updates every 30 seconds.

### `useWeather(city)`

| Property | Type | Description |
|----------|------|-------------|
| `weather` | `{ temp, icon, label, city }` | Current weather data |
| `loading` | `boolean` | Fetch state |

Uses Open-Meteo forecast API with WMO weather code → emoji mapping.

### `useTheme()`

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `isDark` | `boolean` | Current theme state |
| `toggle()` | Function | Switch theme, persist to localStorage |
| `mounted` | `boolean` | Hydration flag |

---

## 🌐 API Routes

### `GET /api/load-data`

Reads and parses `data/my-day-data.xlsx`.

| Status | Response |
|--------|----------|
| **200** | Parsed `DayData` records keyed by date |
| **200** | `{ empty: true }` if file doesn't exist (triggers demo fallback) |
| **400** | Parse error with details |
| **500** | Server error |

### `GET /api/settings`

Returns the contents of `data/settings.json`.

| Status | Response |
|--------|----------|
| **200** | `UserSettings` object |
| **200** | `{}` if file doesn't exist |

### `POST /api/settings`

Merges new settings into `data/settings.json`.

| Body | Response |
|------|----------|
| Partial `UserSettings` | `{ success: true, settings: merged }` |

### `POST /api/update-task`

Updates a task's status in the Excel file.

| Body | Response |
|------|----------|
| `{ date, title, newStatus }` | `{ success: true, date, title, newStatus }` |

Matching logic: date + title (case-insensitive substring). Falls back to title-only matching for carried-forward tasks.

### `POST /api/add-entry`

Appends a new row to a specified Excel sheet.

| Body | Response |
|------|----------|
| `{ sheet, data }` | `{ success: true }` |

Valid sheets: `Schedule`, `Tasks`, `Meetings`, `Emails Inbox`, `Emails Sent`. Creates the workbook and missing sheets if they don't exist.

### `POST /api/upload-photo`

Handles profile photo upload.

| Body | Response |
|------|----------|
| Multipart form data (`photo` field) | `{ success: true, url }` |

---

## 📁 Component Architecture

```
src/components/
├── 📂 dashboard/              # Top-level dashboard UI
│   ├── header.tsx             # CSS Grid header with name, clock, weather
│   ├── day-navigator.tsx      # Yesterday/Today/Tomorrow switcher
│   ├── day-summary.tsx        # Colored summary banner + Up Next
│   ├── stats-bar.tsx          # Animated counting statistics
│   ├── data-freshness.tsx     # "Last loaded" / "Demo data" indicator
│   ├── keyboard-help.tsx      # Floating shortcut hint
│   ├── theme-toggle.tsx       # Dark/light mode button
│   ├── background-mesh.tsx    # Animated gradient orbs
│   ├── splash-screen.tsx      # Entry animation with quotes
│   ├── footer.tsx             # Attribution footer
│   ├── settings-modal.tsx     # Full settings form with geocoding
│   ├── help-modal.tsx         # Comprehensive help guide
│   ├── import-modal.tsx       # Excel file drag-drop import
│   ├── add-task-modal.tsx     # Quick task creation
│   ├── add-schedule-modal.tsx # Quick schedule item creation
│   └── add-commitment-modal.tsx # Commitment entry form
│
├── 📂 panels/                 # Data display panels
│   ├── timeline-panel.tsx     # Hour-by-hour schedule view
│   ├── tasks-panel.tsx        # Priority-sorted task list
│   ├── meetings-panel.tsx     # Meeting detail cards
│   ├── email-inbox-panel.tsx  # Priority-sorted inbox
│   ├── email-sent-panel.tsx   # Sent emails + commitment flags
│   └── commitment-tracker-panel.tsx  # Follow-up dashboard
│
├── 📂 shared/                 # Reusable primitives
│   ├── collapsible-panel.tsx  # Expand/collapse wrapper
│   ├── glass-card.tsx         # Frosted glass container
│   ├── status-badge.tsx       # Color-coded status pill
│   └── time-indicator.tsx     # Current time line marker
│
└── 📂 ui/                     # shadcn/ui primitives
    └── tooltip.tsx            # Accessible tooltip component
```

---

## 🧩 Key TypeScript Types

<details>
<summary><b>View all type definitions</b></summary>
<br/>

```typescript
type DayView = 'yesterday' | 'today' | 'tomorrow';

interface ScheduleItem {
  id: string;
  time: string;        // HH:MM (24h)
  endTime: string;
  title: string;
  type: 'meeting' | 'task' | 'break' | 'focus' | 'travel';
  color?: string;
  description?: string;
  link?: string;
  organizer?: string;
  attendees?: string;
  location?: string;
  meetingType?: 'teams' | 'in-person';
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'none';
}

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done' | 'overdue';
  dueDate?: string;
  source?: string;
  owner?: string;
  daysOpen?: number | null;
  category?: string;
  taskType: 'action' | 'deadline' | 'followup' | 'personal';
  link?: string;
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  endTime: string;
  organizer?: string;
  attendees: string;
  location?: string;
  type: 'teams' | 'in-person';
  link?: string;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'none';
}

interface InboxEmail {
  id: string;
  time: string;
  from: string;
  subject: string;
  folder?: string;
  priority: string;
  readStatus: 'unread' | 'read';
  addressed: 'direct' | 'cc';
  summary: string;
  myReply: 'yes' | 'no';
  replySummary?: string;
  attachment: 'yes' | 'no';
  link?: string;
}

interface SentEmail {
  id: string;
  time: string;
  to: string;
  subject: string;
  summary: string;
  importance: 'high' | 'normal';
  commitment: 'yes' | 'no';
  owner?: string;
  deadline?: string;
  attachment: 'yes' | 'no';
  link?: string;
}

interface DayData {
  date: string;
  schedule: ScheduleItem[];
  tasks: Task[];
  meetings: Meeting[];
  emailsInbox: InboxEmail[];
  emailsSent: SentEmail[];
}
```

</details>

---

[← Keyboard Shortcuts](./10-keyboard-shortcuts.md) · [Back to Index](./README.md) · [**Next: Deployment Guide →**](./12-deployment.md)
