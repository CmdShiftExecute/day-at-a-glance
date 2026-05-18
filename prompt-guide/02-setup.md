<div align="center">

# ⚙️ Chapter 2: Setting Up Cowork

**From a fresh machine to a running scheduled task — step by step.**

</div>

---

[← What is Cowork?](./01-what-is-cowork.md) · [Back to Index](./README.md) · [Next: The Prompt →](./03-sample-prompt.md)

---

## Overview

Setup has five phases. Each one builds on the previous. Plan for about 20–30 minutes the first time.

| Phase | What You're Doing | Time |
|-------|------------------|------|
| **A** | Get the right Claude plan | 2 min |
| **B** | Install Claude Code | 5 min |
| **C** | Set up Comet + Chrome MCP | 5 min |
| **D** | Configure directory mounts | 3 min |
| **E** | Create and test the scheduled task | 10 min |

---

## Phase A — Get the Right Claude Plan

The scheduled task feature requires a **Claude.ai Pro or Max** subscription.

1. Go to [claude.ai](https://claude.ai) and sign in
2. Navigate to **Settings → Plans**
3. Confirm you're on Pro or Max
4. Access **Claude Cowork** from the sidebar or at [claude.ai/cowork](https://claude.ai/cowork)

> 💡 If you don't see Cowork in your sidebar, it may still be rolling out. Check [Anthropic's release notes](https://www.anthropic.com/news) or the [Claude changelog](https://claude.ai/changelog) for availability.

---

## Phase B — Install Claude Code

Claude Code is the CLI that powers the agent. Install it globally:

```bash
npm install -g @anthropic-ai/claude-code
```

Verify it's working:

```bash
claude --version
```

You should see a version number. If you see `command not found`, ensure your npm global bin directory is on your `PATH`.

### Authenticate

```bash
claude auth login
```

This opens a browser window to authenticate with your Claude account. Complete the sign-in — your credentials are stored locally and never shared.

> 📖 Full CLI reference: [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)

---

## Phase C — Set Up Comet and Chrome MCP

**Comet** is a Chromium-based browser that ships with Claude Cowork. Claude uses it to navigate Outlook Web via the Chrome MCP extension.

### Step 1 — Open Comet

In Claude Cowork, find the **Comet browser** panel. Comet should launch automatically when you open a Cowork session. If it doesn't:

1. Open Claude Cowork at [claude.ai/cowork](https://claude.ai/cowork)
2. Start a new session
3. Comet will open as a side panel or separate window

### Step 2 — Install the Chrome MCP Extension in Comet

The Chrome MCP extension gives Claude structured access to web page content.

1. In Comet, navigate to the Chrome Web Store
2. Search for **"Claude Chrome MCP"** or follow the installation link from your Cowork settings
3. Click **Add to Browser** and confirm

> ⚠️ Install this extension in **Comet specifically** — not in Chrome, Safari, or any other browser. Claude only has access to Comet.

### Step 3 — Log in to Outlook in Comet

This is critical. Claude uses your existing Comet session — it never handles your password.

1. In Comet, navigate to `https://outlook.cloud.microsoft`
2. Sign in with your Microsoft account
3. Complete any MFA prompts
4. Confirm your inbox loads correctly
5. **Stay logged in** — don't sign out of Comet between runs

> 💡 Keep Outlook Web open in Comet at all times. If the session expires, the scheduled task will stop and report an authentication failure rather than proceeding without access.

---

## Phase D — Configure Directory Mounts

Directory mounts are how Claude writes files to your machine from the sandbox. You need to grant access to two folders.

### Mount 1 — Your Dashboard Data Folder

This is where `my-day-data.xlsx` lives — the file that powers your dashboard.

In your Cowork session or scheduled task settings, request access to:

```
/path/to/your/day-at-a-glance/data
```

Replace `/path/to/your/day-at-a-glance` with the actual path on your machine. For example:

```
/Users/yourname/Projects/day-at-a-glance/data
```

The prompt uses this mount as the **primary output target**.

### Mount 2 — An Archive / Backup Folder

This is where Claude saves a pre-run backup of the previous Excel file. If a run crashes or produces bad data, this archive lets you recover.

Create this folder if it doesn't exist:

```bash
mkdir -p ~/Documents/Claude/Scheduled/daily-briefing
```

Then request access to:

```
/Users/yourname/Documents/Claude/Scheduled/daily-briefing
```

> 💡 You can name this folder anything you like — just make sure the path in the prompt matches where you've created it.

### How Mounts Work in the Prompt

Inside the scheduled task, the prompt uses these paths via the `mcp__cowork__request_cowork_directory` call. Mounts translate to sandbox paths:

| Your local path | Sandbox path |
|-----------------|-------------|
| `.../day-at-a-glance/data` | `/sessions/<session>/mnt/data/` |
| `.../Claude/Scheduled/daily-briefing` | `/sessions/<session>/mnt/briefing/` |

The session path changes every run — the prompt handles this automatically.

---

## Phase E — Create the Scheduled Task

### Step 1 — Open Scheduled Tasks in Cowork

1. Go to [claude.ai/cowork](https://claude.ai/cowork)
2. Navigate to **Scheduled Tasks** (or **Routines**, depending on your UI version)
3. Click **New Scheduled Task**

### Step 2 — Set the Schedule

Configure when the task runs:

| Setting | Recommended Value |
|---------|------------------|
| **Frequency** | Daily |
| **Time** | Early morning (e.g., 05:30 or 06:00) |
| **Timezone** | Your local timezone |

> 💡 Run it before your workday starts so the dashboard is populated when you sit down. If your Outlook calendar updates frequently, you can run it again at midday.

### Step 3 — Paste the Prompt

Copy the complete prompt from [Chapter 3: The Automation Prompt](./03-sample-prompt.md), customize it for your setup (see [Chapter 4: Customization](./04-customization.md)), and paste it into the task's instruction field.

### Step 4 — Save and Test

1. Click **Save**
2. Use the **Run Now** button to trigger a manual test run
3. Watch the run log — it should show each step completing in sequence
4. When it finishes, check your `data/` folder for the updated `my-day-data.xlsx`
5. Open your dashboard and confirm the data loaded

---

## ✅ Setup Checklist

<table>
<tbody>
<tr><td>✅</td><td>Claude.ai Pro or Max plan active</td></tr>
<tr><td>✅</td><td>Claude Code installed (<code>claude --version</code> works)</td></tr>
<tr><td>✅</td><td>Authenticated with <code>claude auth login</code></td></tr>
<tr><td>✅</td><td>Comet browser open in Cowork</td></tr>
<tr><td>✅</td><td>Chrome MCP extension installed in Comet</td></tr>
<tr><td>✅</td><td>Outlook Web logged in (and staying logged in) in Comet</td></tr>
<tr><td>✅</td><td>Data folder mounted: <code>.../day-at-a-glance/data</code></td></tr>
<tr><td>✅</td><td>Archive folder mounted: <code>.../Claude/Scheduled/daily-briefing</code></td></tr>
<tr><td>✅</td><td>Prompt pasted and customized</td></tr>
<tr><td>✅</td><td>Test run completed successfully</td></tr>
<tr><td>✅</td><td>Dashboard shows today's data</td></tr>
</tbody>
</table>

---

## 🛠️ Common Setup Issues

<details>
<summary><b>Chrome MCP extension not detected by Claude</b></summary>
<br/>

- Confirm the extension is installed in **Comet specifically**, not in another browser
- Reload Comet after installing
- Start a fresh Cowork session and try again
- See [Chapter 6: Troubleshooting](./06-troubleshooting.md#chrome-mcp-not-connecting) for more steps

</details>

<details>
<summary><b>Outlook shows sign-in screen during test run</b></summary>
<br/>

Claude stops and reports the failure rather than attempting to sign in. To fix:
1. Open Comet manually
2. Navigate to `https://outlook.cloud.microsoft`
3. Sign in and complete MFA
4. Leave the page open
5. Re-run the task

</details>

<details>
<summary><b>Directory mount fails with "permission denied"</b></summary>
<br/>

When Cowork requests access to a directory, a permission dialog appears on your Mac. You must approve it. If you missed it:
1. Trigger another test run
2. Watch for the macOS permission dialog
3. Click **Allow**

The folder must exist before you can grant access — use `mkdir -p` to create it if needed.

</details>

<details>
<summary><b>File doesn't appear in data/ after test run</b></summary>
<br/>

Check the run log for the delivery step. Common causes:
- The mount path in the prompt doesn't match the actual folder path you granted access to
- The `cp` command in the prompt has the wrong sandbox session path

See [Chapter 6: Troubleshooting](./06-troubleshooting.md#file-not-saving) for a full diagnosis guide.

</details>

---

[← What is Cowork?](./01-what-is-cowork.md) · [Back to Index](./README.md) · [**Next: The Automation Prompt →**](./03-sample-prompt.md)
