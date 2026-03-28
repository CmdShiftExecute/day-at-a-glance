<div align="center">

# 📖 Day at a Glance — Documentation Portal

<br/>

<img src="../public/logo-header.png" alt="Day at a Glance" width="90" />

<br/><br/>

**Your personal daily command center — unified, self-hosted, and private.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

> 🔒 **Your data never leaves your machine.** No cloud accounts. No third-party APIs storing your information. Fully self-hosted.

</div>

---

## 🧭 What Is This?

This is the complete documentation for **Day at a Glance** — a self-hosted daily dashboard that brings your schedule, tasks, meetings, emails, and commitments into one beautiful, privacy-first interface.

Whether you're setting up for the first time or diving into the architecture, this portal has you covered.

---

## 📚 Documentation Map

<table>
<thead>
<tr>
<th width="5%">#</th>
<th width="30%">Chapter</th>
<th width="15%">Audience</th>
<th width="50%">What You'll Learn</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><b>1</b></td>
<td>🚀 <a href="./01-getting-started.md">Getting Started</a></td>
<td>Everyone</td>
<td>Installation via Docker or Node.js, first launch experience, and initial setup steps</td>
</tr>
<tr>
<td align="center"><b>2</b></td>
<td>🖥️ <a href="./02-dashboard-overview.md">Dashboard Overview</a></td>
<td>Everyone</td>
<td>Layout anatomy, splash screen, panel system, summary bar, stats, and responsive design</td>
</tr>
<tr>
<td align="center"><b>3</b></td>
<td>⚙️ <a href="./03-settings.md">Settings & Personalization</a></td>
<td>Everyone</td>
<td>Name, city, photo, time/date formats, VIP senders, and how settings persist</td>
</tr>
<tr>
<td align="center"><b>4</b></td>
<td>📅 <a href="./04-schedule-timeline.md">Schedule & Timeline</a></td>
<td>Daily Users</td>
<td>Timeline panel, event types, color coding, the "Up Next" indicator, and adding items</td>
</tr>
<tr>
<td align="center"><b>5</b></td>
<td>✅ <a href="./05-tasks.md">Tasks & Productivity</a></td>
<td>Daily Users</td>
<td>Task management, priorities, carry-forward logic, status toggling, and sorting</td>
</tr>
<tr>
<td align="center"><b>6</b></td>
<td>📧 <a href="./06-emails.md">Email Intelligence</a></td>
<td>Daily Users</td>
<td>Inbox panel, sent panel, priority detection, VIP highlighting, and reply tracking</td>
</tr>
<tr>
<td align="center"><b>7</b></td>
<td>🤝 <a href="./07-commitments.md">Commitment Tracker</a></td>
<td>Daily Users</td>
<td>Follow-up tracking, deadline monitoring, ownership, and accountability workflows</td>
</tr>
<tr>
<td align="center"><b>8</b></td>
<td>📊 <a href="./08-data-excel.md">Data & Excel Integration</a></td>
<td>Power Users</td>
<td>The <code>my-day-data.xlsx</code> format, sheet schemas, importing, and live bidirectional sync</td>
</tr>
<tr>
<td align="center"><b>9</b></td>
<td>🎨 <a href="./09-theming.md">Theming & Design System</a></td>
<td>Developers</td>
<td>Dark/light modes, glassmorphism, typography system, color palette, and CSS architecture</td>
</tr>
<tr>
<td align="center"><b>10</b></td>
<td>⌨️ <a href="./10-keyboard-shortcuts.md">Keyboard Shortcuts</a></td>
<td>Power Users</td>
<td>Every keyboard shortcut for navigating, refreshing, and managing the dashboard</td>
</tr>
<tr>
<td align="center"><b>11</b></td>
<td>🏗️ <a href="./11-architecture.md">Architecture & API Reference</a></td>
<td>Developers</td>
<td>Tech stack, data flow diagrams, hooks, API routes, and full project structure</td>
</tr>
<tr>
<td align="center"><b>12</b></td>
<td>🐳 <a href="./12-deployment.md">Deployment Guide</a></td>
<td>DevOps</td>
<td>Docker multi-stage build, Compose config, volumes, environment variables, and production tips</td>
</tr>
</tbody>
</table>

---

## 🏁 Quick Navigation

> 💡 **New here?** Start with [Chapter 1: Getting Started](./01-getting-started.md)
>
> 🔧 **Already running?** Jump to [Chapter 3: Settings](./03-settings.md) to personalize
>
> 📊 **Feeding in your own data?** Head to [Chapter 8: Data & Excel](./08-data-excel.md)
>
> 🐳 **Deploying to a server?** See [Chapter 12: Deployment](./12-deployment.md)

---

## 🌟 Feature Highlights

<table>
<tbody>
<tr>
<td width="50%" valign="top">

### 📅 Unified Daily View
- Three-day navigator: **Yesterday · Today · Tomorrow**
- Schedule timeline with color-coded event types
- Real-time "Up Next" indicator
- Live weather and timezone-aware clock

</td>
<td width="50%" valign="top">

### ✅ Smart Task Management
- Priority-sorted task lists (high → medium → low)
- One-click status toggling with Excel sync
- **Auto carry-forward** of open/overdue tasks to the next day
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
- Dark and light mode with one-click toggle
- Splash screen with rotating inspirational quotes
- Staggered panel animations and counting stats

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

## 📐 At a Glance

| Metric | Value |
|--------|-------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + CSS Variables |
| **Animations** | Framer Motion |
| **Data Format** | Excel (.xlsx) |
| **Deployment** | Docker (multi-stage, standalone) |
| **Font System** | Plus Jakarta Sans · Inter · JetBrains Mono |
| **Theme** | Dark + Light with OKLCH color space |
| **Bundle** | Standalone Next.js (no node_modules in prod) |

---

<div align="center">

<br/>

*Crafted by S. Sharma*

<br/>

[![Made with Next.js](https://img.shields.io/badge/Made_with-Next.js-000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Self Hosted](https://img.shields.io/badge/Self-Hosted-10b981?style=flat-square)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-First-8b5cf6?style=flat-square)](#)

</div>

---

[**Begin Reading → Chapter 1: Getting Started**](./01-getting-started.md)
