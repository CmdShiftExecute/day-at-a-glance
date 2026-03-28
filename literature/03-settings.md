<div align="center">

# ⚙️ Chapter 3: Settings & Personalization

**Make the dashboard yours.**

</div>

---

[← Dashboard Overview](./02-dashboard-overview.md) · [Back to Index](./README.md) · [Next: Schedule & Timeline →](./04-schedule-timeline.md)

---

## Opening Settings

Two ways to access:

| Method | How |
|--------|-----|
| 🖱️ **Click** | Purple ⚙️ gear icon in the top-right header area |
| ⌨️ **Keyboard** | Press `S` anywhere on the dashboard |

---

## 🔧 All Settings Fields

### 👤 Display Name

Your personalized greeting in the header. When set, it replaces the default *"Hi, there!"* greeting.

The name renders in **gradient text** (steel blue → silver → teal) using `font-display` (Plus Jakarta Sans, bold).

### 🌍 City

Type any city name to search. Results come from the **Open-Meteo Geocoding API** with worldwide coverage.

**What selecting a city enables:**

| Feature | How City Is Used |
|---------|-----------------|
| 🕐 **Header clock** | Shows current time in the city's timezone |
| 🌡️ **Weather** | Live temperature and weather icon from Open-Meteo |
| 📅 **Date context** | "Today" is defined by the city's local date |
| ⏰ **Overdue logic** | Task deadlines compared against city's current date |
| 📅 **Up Next** | Schedule indicator uses city's current time |

> 🟣 **No city configured?** The header shows a purple hint: *"Select a city in settings"* — a deliberate nudge to set up.

<details>
<summary><b>🔍 How city search works behind the scenes</b></summary>
<br/>

```
User types "Dub..."
      │
      ├── 350ms debounce (prevents API spam)
      │
      ▼
Open-Meteo Geocoding API
  GET geocoding-api.open-meteo.com/v1/search?name=Dub&count=5
      │
      ▼
Dropdown shows matches:
  ┌─────────────────────────────────┐
  │  Dubai, United Arab Emirates     │
  │  Dublin, Ireland                 │
  │  Dubrovnik, Croatia              │
  │  Dubuque, United States          │
  └─────────────────────────────────┘
      │
      ▼
User selects → stores lat, lon, timezone
      │
      ├── registerCityTimezone("Dubai", "Asia/Dubai")
      ├── registerCityCoords("Dubai", 25.27, 55.29)
      │
      ▼
Clock + Weather update immediately
```

</details>

### 📸 Profile Photo

Upload a photo to replace the default avatar. Appears as a circular thumbnail in the header.

- **Formats:** JPG, PNG, WebP
- **Storage:** Saved on the server via `/api/upload-photo`
- **Persistence:** Survives page refreshes and container restarts

### 📧 VIP / High-Priority Senders

A newline-separated list of email addresses to flag as high-priority in the inbox panel.

```
boss@company.com
ceo@company.com
important-client@external.com
```

**What VIP emails trigger:**

- 🔴 **Alert tone** on the summary line (pink border + warning icon)
- 🏷️ **Special highlight** in the inbox panel
- 📊 **"Priority email needs attention"** text in the day summary

> ⚠️ Enter **one email per line**. Commas and semicolons are rejected by input validation.

### 📅 Date Format

| Option | Example |
|--------|---------|
| `DD MMM YYYY` | 28 Mar 2026 |
| `MMM DD, YYYY` | Mar 28, 2026 |
| `DD/MM/YYYY` | 28/03/2026 |
| `MM/DD/YYYY` | 03/28/2026 |
| `YYYY-MM-DD` | 2026-03-28 |

Affects every date display: header, tasks, emails, commitments, and the day navigator.

### 🕐 Time Format

| Option | Example |
|--------|---------|
| `24h` | 14:30 |
| `12h` | 2:30 PM |

Affects the header clock, schedule times, email timestamps, and all time-related displays.

---

## 💾 How Settings Persist

Settings use a **dual-persistence** strategy for reliability and speed:

```
                    ┌─────────────┐
  updateSettings()  │ React State │  ← instant UI update
        │           │ (in memory) │
        │           └─────────────┘
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
  ┌─────────────────┐            ┌──────────────────┐
  │  localStorage    │            │  Server JSON      │
  │  (fast cache)    │            │  data/settings.json│
  │  Key: my-day-    │            │  via POST /api/   │
  │  settings        │            │  settings         │
  └─────────────────┘            └──────────────────┘
```

### On Load (Source of Truth)

```
1. Fetch GET /api/settings
   ├── ✅ Success → server data is authoritative
   │               └── Update localStorage cache
   └── ❌ Fail    → fall back to localStorage
2. Merge with defaults for any missing fields
3. Register timezone + coordinates if city is set
```

> 🔑 **Server JSON always wins.** This prevents stale localStorage data from overwriting a cleared `settings.json` — a critical fix for data consistency.

---

## 🏁 Default Settings

| Field | Default Value |
|-------|---------------|
| Name | *(empty — shows "Hi, there!")* |
| City | *(empty — clock and weather hidden)* |
| Photo | *(none — default avatar)* |
| VIP Senders | *(empty)* |
| Date Format | `DD MMM YYYY` |
| Time Format | `24h` |

---

[← Dashboard Overview](./02-dashboard-overview.md) · [Back to Index](./README.md) · [**Next: Schedule & Timeline →**](./04-schedule-timeline.md)
