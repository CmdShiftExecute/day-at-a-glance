<div align="center">

<img src="public/logo-header.png" alt="Day at a Glance" width="100" />

# Day at a Glance

**Your personal daily command center — unified, self-hosted, and private.**

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](./LICENSE)

<br/>

> **Your data never leaves your machine.** No cloud accounts. No third-party storage. Fully self-hosted.

</div>

---

A self-hosted daily dashboard that brings your schedule, tasks, meetings, emails, and commitments into one elegant interface. Navigate between yesterday, today, and tomorrow with a single click. Powered by a simple Excel file you own and control.

---

## Features

<table>
<tbody>
<tr>
<td width="50%" valign="top">

### 📅 Unified Daily View
- Three-day navigator: **Yesterday · Today · Tomorrow**
- Color-coded schedule timeline (meeting, focus, break, task, travel)
- Real-time **"Up Next"** indicator
- Live weather and timezone-aware clock

</td>
<td width="50%" valign="top">

### ✅ Smart Task Management
- Priority-sorted task lists (high → medium → low)
- One-click status toggling with Excel sync
- **Auto carry-forward** of open/overdue tasks
- Days-open tracking for aging items

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📧 Email Intelligence
- Inbox with VIP sender highlighting
- Priority detection (EVP, VP, direct, CC)
- Sent email tracking with commitment flags
- Reply status monitoring

</td>
<td width="50%" valign="top">

### 🤝 Commitment Tracking
- Follow-up items extracted from sent emails
- Deadline monitoring with overdue alerts
- Owner assignment for accountability
- Cross-day visibility

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎨 Polished UI/UX
- Glassmorphism design with animated mesh background
- Dark and light mode
- Splash screen with rotating inspirational quotes
- Staggered panel animations and counting stats
- Three-font typography system

</td>
<td width="50%" valign="top">

### 🔒 Privacy First
- Fully self-hosted — runs on your machine
- No cloud accounts or external data storage
- Excel-based data format you own and control
- Docker deployment for isolation

</td>
</tr>
</tbody>
</table>

---

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/CmdShiftExecute/day-at-a-glance.git
cd day-at-a-glance
docker compose up --build -d
```

Open **http://localhost:3000** — done.

### Local Development

```bash
git clone https://github.com/CmdShiftExecute/day-at-a-glance.git
cd day-at-a-glance
npm install
npm run dev
```

> The dashboard loads with **demo data** on first launch so you can explore every feature immediately.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React with server API routes |
| Language | TypeScript (strict) | Type safety across the codebase |
| Styling | Tailwind CSS + CSS Variables | Utility-first with OKLCH color tokens |
| Animations | Framer Motion | Splash screen, panel transitions, counting stats |
| Icons | Lucide React | Consistent, lightweight icon set |
| Data | SheetJS (xlsx) | Bidirectional Excel read/write |
| Fonts | Plus Jakarta Sans · Inter · JetBrains Mono | Display · Body · Monospace |
| Deployment | Docker (multi-stage) | Standalone production build |

---

## Documentation

Full documentation is available in the [`literature/`](./literature/) folder:

| Chapter | Topic |
|---------|-------|
| [01](./literature/01-getting-started.md) | Getting Started |
| [02](./literature/02-dashboard-overview.md) | Dashboard Overview |
| [03](./literature/03-settings.md) | Settings & Personalization |
| [04](./literature/04-schedule-timeline.md) | Schedule & Timeline |
| [05](./literature/05-tasks.md) | Tasks & Productivity |
| [06](./literature/06-emails.md) | Email Intelligence |
| [07](./literature/07-commitments.md) | Commitment Tracker |
| [08](./literature/08-data-excel.md) | Data & Excel Integration |
| [09](./literature/09-theming.md) | Theming & Design System |
| [10](./literature/10-keyboard-shortcuts.md) | Keyboard Shortcuts |
| [11](./literature/11-architecture.md) | Architecture & API Reference |
| [12](./literature/12-deployment.md) | Deployment Guide |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Navigate between days |
| `R` | Refresh data |
| `I` | Import Excel file |
| `S` | Open settings |
| `D` | Toggle dark/light mode |
| `?` | Open help |

---

## Project Structure

```
day-at-a-glance/
├── data/                  # Persistent storage (git-ignored)
├── literature/            # Documentation (12 chapters)
├── public/                # Static assets
├── src/
│   ├── app/               # Pages, layout, API routes
│   ├── components/        # Dashboard, panels, shared, UI
│   ├── hooks/             # useDayData, useSettings, useClock, useWeather, useTheme
│   └── lib/               # Types, demo data, Excel parser, timezone utils
├── Dockerfile             # Multi-stage production build
├── docker-compose.yml     # One-command orchestration
└── tailwind.config.ts     # Design system tokens
```

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

*Crafted by S. Sharma*

[![Self Hosted](https://img.shields.io/badge/Self-Hosted-10b981?style=flat-square)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-First-8b5cf6?style=flat-square)](#)

</div>
