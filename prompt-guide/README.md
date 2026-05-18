<div align="center">

# 🤖 Automate Day at a Glance with Claude

<br/>

<img src="../public/logo-header.png" alt="Day at a Glance" width="90" />

<br/><br/>

**Let an AI agent read your calendar, emails, and tasks — and populate your dashboard every morning. Automatically.**

<br/>

[![Claude](https://img.shields.io/badge/Powered_by-Claude-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Claude Code](https://img.shields.io/badge/Claude-Code-000000?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai/code)
[![Outlook](https://img.shields.io/badge/Microsoft-Outlook-0078D4?style=for-the-badge&logo=microsoftoutlook&logoColor=white)](https://outlook.cloud.microsoft)
[![Excel](https://img.shields.io/badge/Microsoft-Excel-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)](https://www.microsoft.com/excel)

</div>

---

[← Documentation Portal](../literature/README.md) · [Back to Main README](../README.md)

---

## What This Guide Is

Day at a Glance is powered by a single Excel file. You could fill that file by hand — but you don't have to. This guide shows you how to use **Claude Cowork** to run an AI agent that reads your Outlook calendar, inbox, sent items, and to-do lists every day, then writes your `my-day-data.xlsx` automatically.

Wake up to a fully-populated dashboard. Every morning. No manual data entry.

```
Your Outlook                Claude Cowork              Your Dashboard
──────────────              ─────────────              ──────────────
📅 Calendar    ──────────→  AI Agent reads             📊 Schedule
📧 Inbox       ──────────→  everything and   ───────→  ✅ Tasks
📤 Sent Items  ──────────→  writes the Excel           📧 Emails
✅ To-Do Lists ──────────→  file for you               🤝 Commitments
```

---

## 📚 Guide Chapters

<table>
<thead>
<tr>
<th width="5%">#</th>
<th width="35%">Chapter</th>
<th width="15%">Time</th>
<th width="45%">What You'll Learn</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><b>1</b></td>
<td>🧠 <a href="./01-what-is-cowork.md">What is Claude Cowork?</a></td>
<td>5 min read</td>
<td>Claude, Claude Code, Cowork, and scheduled tasks explained — no jargon</td>
</tr>
<tr>
<td align="center"><b>2</b></td>
<td>⚙️ <a href="./02-setup.md">Setting Up Cowork</a></td>
<td>15–20 min</td>
<td>Step-by-step: subscription, Claude Code installation, Chrome browser, Chrome MCP, directory mounts</td>
</tr>
<tr>
<td align="center"><b>3</b></td>
<td>📋 <a href="./03-sample-prompt.md">The Automation Prompt</a></td>
<td>Reference</td>
<td>The complete, copy-ready prompt — generalized and production-hardened with audit gates</td>
</tr>
<tr>
<td align="center"><b>4</b></td>
<td>🎛️ <a href="./04-customization.md">Customizing for Your Setup</a></td>
<td>10 min</td>
<td>Adapting the prompt: VIP people, folder names, paths, email providers, and data sources</td>
</tr>
<tr>
<td align="center"><b>5</b></td>
<td>📊 <a href="./05-excel-output.md">Understanding the Output</a></td>
<td>10 min</td>
<td>What good Excel output looks like, link capture, carry-forward, and how to validate a run</td>
</tr>
<tr>
<td align="center"><b>6</b></td>
<td>🔧 <a href="./06-troubleshooting.md">Troubleshooting</a></td>
<td>Reference</td>
<td>Chrome MCP failures, bad links, unread emails marked read, file delivery issues, and more</td>
</tr>
<tr>
<td align="center"><b>7</b></td>
<td>📎 <a href="./07-reference.md">Reference & Official Links</a></td>
<td>Reference</td>
<td>Anthropic docs, Claude Code CLI reference, Chrome MCP setup, openpyxl, and community links</td>
</tr>
</tbody>
</table>

---

## 🏁 Quick Navigation

> 💡 **New to all of this?** Start with [Chapter 1: What is Claude Cowork?](./01-what-is-cowork.md)
>
> ⚙️ **Ready to set up?** Jump to [Chapter 2: Setting Up Cowork](./02-setup.md)
>
> 📋 **Just want the prompt?** Go directly to [Chapter 3: The Automation Prompt](./03-sample-prompt.md)
>
> 🔧 **Something went wrong?** Head to [Chapter 6: Troubleshooting](./06-troubleshooting.md)

---

## What the Automation Does

Each scheduled run performs a full daily briefing cycle:

| Phase | What Happens |
|-------|-------------|
| **Setup** | Mounts your local `data/` folder and archives the previous Excel as a backup |
| **Calendar** | Reads yesterday, today, and tomorrow's calendar events |
| **Inbox** | Scans all Outlook folders for new emails; preserves unread status |
| **Sent Items** | Reviews sent emails; flags commitment language for follow-up |
| **To-Do** | Reads all Outlook To-Do lists |
| **Carry-Forward** | Rolls incomplete tasks into today with incremented days-open |
| **Audit** | Validates every link and every unread-email restoration before saving |
| **Deliver** | Writes `my-day-data.xlsx` directly into your `data/` folder |

---

## Prerequisites at a Glance

| Requirement | Details |
|-------------|---------|
| **Day at a Glance** | Running (Docker or local) — [Setup guide](../literature/01-getting-started.md) |
| **Claude subscription** | Claude.ai Pro or Max plan |
| **Claude Code** | Installed as CLI (`npm install -g @anthropic-ai/claude-code`) |
| **Chrome browser** | Chrome-based browser provided by Claude Cowork |
| **Chrome MCP extension** | Installed in the Claude Cowork Chrome browser — enables browser automation |
| **Outlook Web** | Your email accessible at `https://outlook.cloud.microsoft` |

---

<div align="center">

<br/>

*Part of the Day at a Glance documentation*

<br/>

[![Made with Claude](https://img.shields.io/badge/Automated_with-Claude-CC785C?style=flat-square)](https://claude.ai)
[![Privacy First](https://img.shields.io/badge/Privacy-First-8b5cf6?style=flat-square)](#)

</div>

---

[**Begin → Chapter 1: What is Claude Cowork?**](./01-what-is-cowork.md)
