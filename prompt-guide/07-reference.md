<div align="center">

# 📎 Chapter 7: Reference & Official Links

**Everything you need — in one place.**

</div>

---

[← Troubleshooting](./06-troubleshooting.md) · [Back to Index](./README.md)

---

## Anthropic & Claude

| Resource | Link |
|----------|------|
| **Anthropic Home** | [anthropic.com](https://www.anthropic.com/) |
| **Claude.ai** | [claude.ai](https://claude.ai) |
| **Claude Cowork** | [claude.ai/cowork](https://claude.ai/cowork) |
| **Anthropic Documentation** | [docs.anthropic.com](https://docs.anthropic.com) |
| **Claude Models Overview** | [docs.anthropic.com/en/docs/models-overview](https://docs.anthropic.com/en/docs/about-claude/models/overview) |
| **What's New (Changelog)** | [claude.ai/changelog](https://claude.ai/changelog) |
| **Anthropic Research** | [anthropic.com/research](https://www.anthropic.com/research) |
| **Anthropic Acceptable Use Policy** | [anthropic.com/legal/aup](https://www.anthropic.com/legal/aup) |

---

## Claude Code

| Resource | Link |
|----------|------|
| **Claude Code Overview** | [docs.anthropic.com/en/docs/claude-code/overview](https://docs.anthropic.com/en/docs/claude-code/overview) |
| **Getting Started with Claude Code** | [docs.anthropic.com/en/docs/claude-code/quickstart](https://docs.anthropic.com/en/docs/claude-code/quickstart) |
| **Claude Code CLI Reference** | [docs.anthropic.com/en/docs/claude-code/cli-reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference) |
| **Claude Code GitHub** | [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code) |
| **npm package** | [npmjs.com/package/@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code) |

### Install & Update

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Update to latest
npm update -g @anthropic-ai/claude-code

# Verify version
claude --version

# Authenticate
claude auth login
```

---

## Chrome MCP (Browser Automation)

| Resource | Link |
|----------|------|
| **Chrome MCP Documentation** | [docs.anthropic.com/en/docs/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp) |
| **Model Context Protocol (MCP) Spec** | [modelcontextprotocol.io](https://modelcontextprotocol.io) |
| **MCP GitHub** | [github.com/modelcontextprotocol](https://github.com/modelcontextprotocol) |

### Chrome MCP Tool Quick Reference

These are the tools the prompt uses most — useful if you're debugging a run log:

| Tool | What It Does |
|------|-------------|
| `mcp__Claude_in_Chrome__tabs_context_mcp` | Get the current tab's context — used to verify MCP is live |
| `mcp__Claude_in_Chrome__navigate` | Navigate to a URL |
| `mcp__Claude_in_Chrome__get_page_text` | Extract all visible text from the page (fast, bulk) |
| `mcp__Claude_in_Chrome__read_page` | Read page structure and content |
| `mcp__Claude_in_Chrome__javascript_tool` | Run JavaScript in the page context |
| `mcp__Claude_in_Chrome__find` | Find elements on the page |

---

## Microsoft Outlook Web

| Resource | Link |
|----------|------|
| **Outlook Web** | [outlook.cloud.microsoft](https://outlook.cloud.microsoft) |
| **Outlook Support** | [support.microsoft.com/en-us/outlook](https://support.microsoft.com/en-us/outlook) |
| **Microsoft 365 Admin Center** | [admin.microsoft.com](https://admin.microsoft.com) (if you manage your org's tenant) |

### Outlook Deep Link Pattern

Valid deep link examples by folder:

```
Inbox:
  https://outlook.cloud.microsoft/mail/inbox/id/AAQkAGJm...

Sent Items:
  https://outlook.cloud.microsoft/mail/sentitems/id/AAQkAGJm...

Specific folder:
  https://outlook.cloud.microsoft/mail/id/AAQkAGJm...

Calendar event:
  https://outlook.cloud.microsoft/calendar/item/AAMkAGJm...
```

**Validation regex:**
```
^https://outlook\.(cloud\.microsoft|office\.com)/.+/id/.+
```

---

## Python Libraries

| Library | Purpose | Link |
|---------|---------|------|
| **openpyxl** | Read and write `.xlsx` files from Python | [openpyxl.readthedocs.io](https://openpyxl.readthedocs.io) |
| **openpyxl styles** | Cell formatting, fonts, fills, borders | [openpyxl.readthedocs.io/en/stable/styles.html](https://openpyxl.readthedocs.io/en/stable/styles.html) |

### openpyxl Quick Reference

```bash
# Install
pip install openpyxl --break-system-packages -q

# Or with pip3
pip3 install openpyxl
```

```python
import openpyxl

# Read
wb = openpyxl.load_workbook('my-day-data.xlsx')
ws = wb['Tasks']
headers = [cell.value for cell in ws[1]]

# Write
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Tasks'
ws.append(['date', 'title', 'priority', 'status', 'dueDate', 'source',
           'owner', 'daysOpen', 'category', 'taskType', 'link'])
wb.save('my-day-data.xlsx')
```

---

## Day at a Glance Documentation

| Chapter | Topic |
|---------|-------|
| [01 — Getting Started](../literature/01-getting-started.md) | Installation, Docker, first launch |
| [02 — Dashboard Overview](../literature/02-dashboard-overview.md) | Layout, panels, navigation |
| [03 — Settings](../literature/03-settings.md) | Name, city, VIP senders |
| [04 — Schedule](../literature/04-schedule-timeline.md) | Timeline panel |
| [05 — Tasks](../literature/05-tasks.md) | Task management, carry-forward |
| [06 — Emails](../literature/06-emails.md) | Inbox and sent panels |
| [07 — Commitments](../literature/07-commitments.md) | Follow-up tracking |
| [08 — Data & Excel](../literature/08-data-excel.md) | Excel schema reference |
| [09 — Theming](../literature/09-theming.md) | Design system |
| [10 — Shortcuts](../literature/10-keyboard-shortcuts.md) | Keyboard shortcuts |
| [11 — Architecture](../literature/11-architecture.md) | Tech stack, API routes |
| [12 — Deployment](../literature/12-deployment.md) | Docker, production |

---

## IANA Timezone Reference

Used in the prompt's timezone configuration:

| Region | Timezone String |
|--------|----------------|
| Dubai / UAE | `Asia/Dubai` |
| Saudi Arabia | `Asia/Riyadh` |
| London | `Europe/London` |
| Paris / Frankfurt / Amsterdam | `Europe/Paris` |
| New York | `America/New_York` |
| Los Angeles | `America/Los_Angeles` |
| Chicago | `America/Chicago` |
| Toronto | `America/Toronto` |
| Mumbai | `Asia/Kolkata` |
| Singapore | `Asia/Singapore` |
| Tokyo | `Asia/Tokyo` |
| Sydney | `Australia/Sydney` |
| Auckland | `Pacific/Auckland` |

Full list: [iana.org/time-zones](https://www.iana.org/time-zones)

---

## GitHub

| Resource | Link |
|----------|------|
| **Day at a Glance Repository** | [github.com/CmdShiftExecute/day-at-a-glance](https://github.com/CmdShiftExecute/day-at-a-glance) |
| **Open an Issue** | [github.com/CmdShiftExecute/day-at-a-glance/issues](https://github.com/CmdShiftExecute/day-at-a-glance/issues) |
| **Releases** | [github.com/CmdShiftExecute/day-at-a-glance/releases](https://github.com/CmdShiftExecute/day-at-a-glance/releases) |
| **Live Demo** | [day-at-a-glance.vercel.app](https://day-at-a-glance.vercel.app) |

---

<div align="center">

<br/>

**🎉 You've reached the end of the Automation Guide!**

<br/>

[← Troubleshooting](./06-troubleshooting.md) · [**Return to Index →**](./README.md)

<br/>

---

*Part of the Day at a Glance documentation*

[![Made with Claude](https://img.shields.io/badge/Automated_with-Claude-CC785C?style=flat-square)](https://claude.ai)
[![Privacy First](https://img.shields.io/badge/Privacy-First-8b5cf6?style=flat-square)](#)
[![Self Hosted](https://img.shields.io/badge/Self-Hosted-10b981?style=flat-square)](#)

</div>
