<div align="center">

# 🚀 Chapter 1: Getting Started

**From zero to dashboard in under two minutes.**

</div>

---

[← Documentation Portal](./README.md) · [Next: Dashboard Overview →](./02-dashboard-overview.md)

---

## Prerequisites

You need **one** of the following installed:

| Tool | Version | Why |
|------|---------|-----|
| 🐳 **Docker** + **Docker Compose** | Docker 20+, Compose v2 | Recommended — one command, fully containerized |
| 🟢 **Node.js** + **npm** | Node 18+, npm 9+ | Alternative — for local development with hot reload |

> 💡 **Docker is the recommended path.** It handles everything — dependencies, build, and runtime — in a single isolated container.

---

## Option A: Docker (Recommended)

**Three commands. That's it.**

```bash
# 1. Clone the repository
git clone https://github.com/CmdShiftExecute/day-at-a-glance.git
cd day-at-a-glance

# 2. Build and launch
docker compose up --build -d

# 3. Open in your browser
open http://localhost:3000
```

### Rebuilding After Updates

```bash
docker compose down && docker compose up --build -d
```

> 📂 The `data/` folder is mounted as a Docker volume. Your settings and imported Excel data survive container rebuilds.

---

## Option B: Local Development

```bash
# 1. Clone and install
git clone https://github.com/CmdShiftExecute/day-at-a-glance.git
cd day-at-a-glance
npm install

# 2. Start development server (with hot reload)
npm run dev

# 3. Or build for production
npm run build && npm start
```

---

## 🎬 First Launch Experience

When you open the dashboard for the first time, here's the sequence:

| Step | What Happens | Duration |
|------|-------------|----------|
| **1** | Splash screen appears with spinning logo | ~0.5s |
| **2** | App title fades in: *"Day at a Glance"* | ~0.4s |
| **3** | Tagline: *Yesterday · Today · Tomorrow* | ~0.3s |
| **4** | Random inspirational quote fades in | ~0.7s |
| **5** | Splash screen fades out | ~0.6s |
| **6** | Dashboard panels slide in with staggered animation | ~0.5s |
| **7** | Stat numbers animate from 0 → final value | ~0.8s |

The dashboard loads with **demo data** — a realistic set of schedule items, tasks, meetings, and emails so you can explore every feature immediately without importing anything.

---

## ✅ First Steps After Launch

<table>
<tbody>
<tr>
<td width="5%" align="center">1️⃣</td>
<td><b>Open Settings</b> — Click the purple ⚙️ gear icon (top-right) or press <code>S</code></td>
</tr>
<tr>
<td align="center">2️⃣</td>
<td><b>Set your name and city</b> — This personalizes the greeting, clock, and weather</td>
</tr>
<tr>
<td align="center">3️⃣</td>
<td><b>Explore demo data</b> — Navigate between Yesterday, Today, and Tomorrow</td>
</tr>
<tr>
<td align="center">4️⃣</td>
<td><b>Toggle a task</b> — Click any checkbox to mark it done (syncs to Excel)</td>
</tr>
<tr>
<td align="center">5️⃣</td>
<td><b>Press <code>?</code></b> — See all keyboard shortcuts</td>
</tr>
<tr>
<td align="center">6️⃣</td>
<td><b>Import your data</b> — When ready, import your own <code>my-day-data.xlsx</code></td>
</tr>
</tbody>
</table>

---

## 📁 Project Structure

```
day-at-a-glance/
├── 📂 data/                  # Persistent storage (settings + Excel)
│   └── settings.json         # User preferences
├── 📂 literature/            # Documentation (you are here)
├── 📂 public/                # Static assets
│   ├── logo-header.png       # App logo
│   └── manifest.json         # PWA manifest
├── 📂 src/
│   ├── 📂 app/               # Next.js App Router
│   │   ├── layout.tsx        # Root layout, fonts, metadata
│   │   ├── page.tsx          # Main dashboard page
│   │   ├── globals.css       # Theme variables, glass styles
│   │   └── 📂 api/           # Server-side API routes
│   │       ├── load-data/    # GET  — reads my-day-data.xlsx
│   │       ├── settings/     # GET/POST — settings persistence
│   │       ├── add-entry/    # POST — add rows to Excel
│   │       ├── update-task/  # POST — toggle task status
│   │       └── upload-photo/ # POST — profile photo upload
│   ├── 📂 components/
│   │   ├── 📂 dashboard/     # Header, navigator, modals, splash
│   │   ├── 📂 panels/        # Timeline, tasks, meetings, emails
│   │   ├── 📂 shared/        # Reusable glass cards, badges
│   │   └── 📂 ui/            # shadcn/ui primitives
│   ├── 📂 hooks/             # React hooks
│   │   ├── use-day-data.ts   # Central data management
│   │   ├── use-settings.ts   # Settings persistence
│   │   ├── use-clock.ts      # Real-time city clock
│   │   ├── use-weather.ts    # Open-Meteo weather
│   │   └── use-theme.ts      # Dark/light toggle
│   └── 📂 lib/               # Utilities & types
│       ├── types.ts          # All TypeScript interfaces
│       ├── demo-data.ts      # Built-in sample data
│       ├── city-time.ts      # Timezone utilities
│       ├── parse-excel.ts    # Excel parser & normalizer
│       └── utils.ts          # Tailwind class merger
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # One-command orchestration
├── tailwind.config.ts        # Design system tokens
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

---

## 🛠️ Troubleshooting

<details>
<summary><b>Port 3000 already in use</b></summary>
<br/>

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```
Or for local dev: `npm run dev -- -p 3001`

</details>

<details>
<summary><b>Docker build fails with memory error</b></summary>
<br/>

Ensure Docker Desktop has at least **2 GB RAM** allocated. Check in Docker Desktop → Settings → Resources.

</details>

<details>
<summary><b>Blank page after splash screen</b></summary>
<br/>

Hard refresh with `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to clear cached assets.

</details>

<details>
<summary><b>Settings not persisting after restart</b></summary>
<br/>

Ensure the `data/` directory has write permissions. In Docker, verify the volume mount in `docker-compose.yml`:
```yaml
volumes:
  - ./data:/app/data
```

</details>

---

[← Documentation Portal](./README.md) · [**Next: Dashboard Overview →**](./02-dashboard-overview.md)
