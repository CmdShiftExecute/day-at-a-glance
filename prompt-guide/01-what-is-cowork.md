<div align="center">

# 🧠 Chapter 1: What is Claude Cowork?

**AI agents, scheduled tasks, and how they power Day at a Glance — explained from first principles.**

</div>

---

[← Automation Guide Index](./README.md) · [Next: Setting Up Cowork →](./02-setup.md)

---

## The Big Picture

Before diving into setup and prompts, it helps to understand what's actually happening when you run the Day at a Glance automation. This chapter walks from Claude all the way to scheduled tasks — no jargon assumed.

---

## 🤖 What is Claude?

**Claude** is an AI assistant made by [Anthropic](https://www.anthropic.com/). Like most AI assistants, you can chat with it at [claude.ai](https://claude.ai) to answer questions, write text, and reason through problems.

What makes Claude different is its ability to **use tools** — it can browse the web, run code, read files, and interact with applications on your computer. This transforms it from a chatbot into an **agent**: software that takes actions in the real world to accomplish goals.

---

## 💻 What is Claude Code?

**Claude Code** is Claude running as a command-line agent on your local machine. Instead of chatting in a browser, Claude Code can:

- Read and write files on your filesystem
- Execute shell commands and Python scripts
- Call external APIs and browser automation tools
- Run autonomously without constant input from you

You install it via npm:

```bash
npm install -g @anthropic-ai/claude-code
```

Then start it with:

```bash
claude
```

> 📖 Official documentation: [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/overview)

---

## 🏢 What is Claude Cowork?

**Claude Cowork** is a product layer on top of Claude Code designed for running agents in a structured, managed environment. Think of it as the "always-on" version of Claude Code — it provides:

| Feature | What It Does |
|---------|-------------|
| **Scheduled Tasks** | Run a Claude agent on a cron schedule (e.g., every day at 6 AM) |
| **Directory Mounts** | Give the agent controlled access to specific folders on your machine |
| **Chrome Browser** | A Chrome-based browser provided by Claude Cowork for web automation |
| **Chrome MCP** | An extension that gives Claude structured access to web pages |
| **Session Isolation** | Each run gets its own sandbox — no bleed between executions |

Cowork is how you turn a one-off chat session into a reliable, daily, autonomous workflow.

> 📖 Official documentation: [Claude Cowork Overview](https://claude.ai/cowork)

---

## ⏰ What is a Scheduled Task?

A **scheduled task** in Claude Cowork is an instruction set (a "prompt") that Claude runs automatically on a timer — daily, hourly, or on any cron schedule.

The lifecycle of a single run looks like this:

```
┌─────────────────────────────────────────────────────────────────┐
│  Trigger fires (e.g., 6:00 AM)                                  │
│         ↓                                                        │
│  Claude wakes up in a fresh sandbox session                      │
│         ↓                                                        │
│  Reads its instructions (your prompt)                           │
│         ↓                                                        │
│  Calls tools: mounts folders, opens browser, runs Python        │
│         ↓                                                        │
│  Produces output (e.g., writes an Excel file)                   │
│         ↓                                                        │
│  Delivers output to your machine via mounted directory          │
│         ↓                                                        │
│  Session ends — sandbox cleaned up                              │
└─────────────────────────────────────────────────────────────────┘
```

No user present. No prompting required. It just runs.

---

## 🔗 How This Connects to Day at a Glance

Day at a Glance reads from a file: `data/my-day-data.xlsx`. Normally, you would populate that file yourself — by hand, or by dragging in a spreadsheet you built.

With a scheduled task, **Claude populates it for you** by:

1. Opening your Outlook Web in Chrome
2. Reading your calendar, inbox, sent items, and to-do lists
3. Writing everything into the Excel format the dashboard expects
4. Saving it directly to your `data/` folder

Your dashboard refreshes automatically. You open it in the morning and everything is already there.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   6:00 AM — Scheduled task fires                            │
│         ↓                                                    │
│   Claude reads Outlook via Chrome                    │
│         ↓                                                    │
│   Claude writes  my-day-data.xlsx  to your data/ folder     │
│         ↓                                                    │
│   You open your dashboard at 8:00 AM                        │
│         ↓                                                    │
│   Everything is there: schedule, tasks, emails, follow-ups  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧩 The Key Components

Understanding these four components will make the rest of the guide easy to follow:

<table>
<thead>
<tr>
<th width="25%">Component</th>
<th width="35%">What It Is</th>
<th width="40%">Role in the Automation</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Claude Cowork</b></td>
<td>The AI agent platform</td>
<td>Hosts the scheduled task and manages the session lifecycle</td>
</tr>
<tr>
<td><b>Chrome Browser</b></td>
<td>A Chromium-based browser managed by Cowork</td>
<td>The browser Claude uses to navigate Outlook Web — you keep it logged in</td>
</tr>
<tr>
<td><b>Chrome MCP</b></td>
<td>A browser extension for Chrome</td>
<td>Gives Claude structured DOM access to web pages (faster and more reliable than screenshots)</td>
</tr>
<tr>
<td><b>Directory Mounts</b></td>
<td>Filesystem bridges between your machine and the sandbox</td>
<td>Allow Claude to write <code>my-day-data.xlsx</code> directly to your local <code>data/</code> folder</td>
</tr>
</tbody>
</table>

---

## ⚠️ What This Is NOT

It helps to be clear about what the automation does *not* do:

| Misconception | Reality |
|--------------|---------|
| "Claude stores my emails" | No. Claude reads them during the run to extract summaries and tasks, then the session ends. Nothing is stored externally. |
| "Claude replies to emails" | No. Read-only. The automation never sends, marks, or modifies anything — except restoring unread status it temporarily disturbed by reading. |
| "My data goes to Anthropic" | The agent runs locally via Claude Code. Your email data is never uploaded to Anthropic's servers. |
| "Claude needs my Outlook password" | No. Claude uses your already-logged-in Chrome browser session. No credentials are entered or stored. |

> 🔒 All data stays on your machine. The Excel file is written locally. Nothing leaves your network.

---

## ✅ What You Need Before Continuing

| Requirement | Status to Confirm Before Chapter 2 |
|-------------|-------------------------------------|
| Claude.ai account | Pro or Max plan — free tier doesn't include Cowork |
| Day at a Glance running | Via Docker or `npm run dev` — see [Chapter 1 of the main docs](../literature/01-getting-started.md) |
| Outlook Web access | Can reach `https://outlook.cloud.microsoft` in any browser |
| Node.js 18+ | For Claude Code CLI installation |

---

[← Automation Guide Index](./README.md) · [**Next: Setting Up Cowork →**](./02-setup.md)
