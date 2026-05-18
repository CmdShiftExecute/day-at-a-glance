<div align="center">

# 🔧 Chapter 6: Troubleshooting

**When things go wrong — and how to fix them.**

</div>

---

[← Understanding the Output](./05-excel-output.md) · [Back to Index](./README.md) · [Next: Reference →](./07-reference.md)

---

## How to Read a Failed Run

When a run fails or produces bad output, start here:

1. **Open the run log** in Claude Cowork — every tool call, print statement, and error is recorded
2. **Look for the first error** — most failures cascade; the root cause is usually the first red line
3. **Check the post-save summary** — if it was generated, it lists which audit gates passed and which didn't
4. **Check the backup file** — if the run crashed mid-way, `my-day-data-old.xlsx` in your archive folder is the last clean state

---

## Issue Index

| Issue | Jump To |
|-------|---------|
| Chrome MCP not connecting | [→](#chrome-mcp-not-connecting) |
| Outlook requires sign-in during run | [→](#outlook-sign-in-during-run) |
| Links are wrong, empty, or show "Open" | [→](#broken-links) |
| Unread emails are now marked read | [→](#unread-emails-marked-read) |
| File not appearing in data/ folder | [→](#file-not-saving) |
| Carry-forward not working (daysOpen always 0) | [→](#carry-forward-broken) |
| Run runs out of context before finishing | [→](#context-budget-exceeded) |
| Task duplicates in the dashboard | [→](#duplicate-tasks) |
| All emails missing from Emails Inbox | [→](#no-emails-in-output) |
| Schedule sheet is empty | [→](#empty-schedule) |
| Dates are wrong (off by one day) | [→](#wrong-dates) |
| Dashboard shows old data after run | [→](#dashboard-showing-old-data) |

---

## Chrome MCP Not Connecting

<a name="chrome-mcp-not-connecting"></a>

**Symptom:** The run log shows an error at Step 0.4, or `mcp__Claude_in_Chrome__tabs_context_mcp` returns an error.

**Causes and fixes:**

<details>
<summary><b>Extension not installed in Chrome</b></summary>
<br/>

The Chrome MCP extension must be installed in the **Claude Cowork Chrome browser** — not in your regular Chrome, Safari, or any other browser.

1. Open Chrome in Claude Cowork
2. Navigate to the Chrome Web Store
3. Install the Claude Chrome MCP extension
4. Reload Chrome
5. Start a fresh Cowork session and try again

</details>

<details>
<summary><b>Chrome browser is not running</b></summary>
<br/>

The prompt requires Chrome to be active before the scheduled task fires. 

1. Open a manual Cowork session in your browser
2. Confirm Chrome opens
3. Navigate to Outlook Web to confirm it's accessible
4. Then trigger the scheduled run

</details>

<details>
<summary><b>Extension disconnected</b></summary>
<br/>

The Chrome MCP extension occasionally loses its connection after long idle periods.

1. Click the Claude Chrome MCP extension icon in Chrome's toolbar
2. Look for a "Reconnect" or "Connect" button
3. Reload the active Outlook page
4. Retry the run

</details>

---

## Outlook Sign-In During Run

<a name="outlook-sign-in-during-run"></a>

**Symptom:** Run stops at Step 0.5 with "Outlook requires sign-in" or similar.

**Why this happens:** Your Outlook Web session in Chrome expired. Microsoft sessions typically last 1–8 hours depending on your org's security policy.

**Fix:**

1. Open Chrome in Claude Cowork
2. Navigate to `https://outlook.cloud.microsoft`
3. Complete sign-in and any MFA prompts
4. Leave the Outlook Web page open in Chrome
5. Re-run the task

**Prevention:** If your sessions expire frequently, check if your organization allows "Stay signed in" and enable it in Chrome. Some orgs enforce short session times via Conditional Access — in that case, you may need to run the task during working hours rather than overnight.

---

## Broken Links (Wrong URL, "Open", or Empty)

<a name="broken-links"></a>

**Symptom:** Tasks show no "Open source" button, or the link opens the inbox instead of the specific email.

**Explanation:** There are three types of link failures:

| Failure Type | Cause | Effect |
|-------------|-------|--------|
| Garbage value (`"Open"`) | Claude wrote the button label instead of a URL | Link audit cleans it → empty cell → no button |
| Folder URL | Claude captured the reading-pane URL, not the full-view URL | Link audit cleans it → empty cell → no button |
| Genuinely missing | Claude couldn't find the email in full view | Empty cell → no button |

**The good news:** The Link Audit (Step 7.6) catches types 1 and 2 automatically. You'll see `N dropped` in the post-save summary. The task still appears correctly — it just has no clickable link.

**How to improve link capture:**

The most common cause of missing links is Claude capturing the reading-pane URL (which is just the folder URL) instead of opening the email in full view. The prompt's Rule 3 instructs Claude to double-click each email for full view. If links are consistently missing:

1. Check the run log — did Claude open emails in full view or just click once?
2. If Outlook's layout changed, the "double-click for full view" instruction may need adjusting
3. Add this to Rule 3 in your prompt: "After double-clicking, wait 2 seconds for the URL to update before copying"

**For To-Do items specifically:** Standalone To-Do tasks (not linked to an email) will never have a link. This is expected — the side panel doesn't update the address bar. Only To-Do tasks with a linked-email chip can have a deep link.

---

## Unread Emails Marked Read

<a name="unread-emails-marked-read"></a>

**Symptom:** After a run, emails that were unread are now showing as read in your Outlook inbox.

**This is the most critical failure mode.** The prompt treats unread preservation as its highest-priority obligation.

**Immediate action:** Manually mark the affected emails as unread in Outlook.

**Why this happens:**

<details>
<summary><b>Claude read an email but didn't restore it</b></summary>
<br/>

The per-email procedure requires marking-as-unread *immediately* after reading each unread email — not batched at the end. If Claude ran out of context or skipped the step, some emails may not have been restored.

**Fix:** In your prompt, make Rule 2 even more explicit:

```
After reading each unread email, before any other action:
  1. Right-click the email row in the list (not the open email)
  2. Select "Mark as unread"
  3. Confirm the bold indicator returns
  4. ONLY THEN proceed to the next email
```

</details>

<details>
<summary><b>Email was already read before the run</b></summary>
<br/>

The rule only applies to emails that were unread before Claude read them. If an email was already read, Claude leaves it as-is.

Check your Outlook sent items — if you read those emails yourself before the run, they'll already be marked read. This isn't a failure.

</details>

<details>
<summary><b>Outlook marked the whole thread</b></summary>
<br/>

When Claude marks an email as unread, Outlook marks the entire conversation thread. This is correct — all messages in the thread will be unread again. This is expected behaviour and not a failure.

</details>

---

## File Not Saving to data/ Folder

<a name="file-not-saving"></a>

**Symptom:** The run completes but `my-day-data.xlsx` in your `data/` folder is unchanged.

**Diagnosis checklist:**

<details>
<summary><b>Check 1: Did the directory mount succeed?</b></summary>
<br/>

Look in the run log for Step 0.1. You should see a confirmation that the directory was mounted. If it failed or was skipped, the `mnt/data/` path doesn't exist in the sandbox.

Fix: Verify the path in `mcp__cowork__request_cowork_directory` matches the actual path on your machine. Run `pwd` in the `data/` folder to confirm.

</details>

<details>
<summary><b>Check 2: Did the cp command run?</b></summary>
<br/>

Look in the run log for Step 9's delivery step:
```
cp /sessions/<session>/my-day-data.xlsx /sessions/<session>/mnt/data/my-day-data.xlsx
```

If this line is missing, the run may have exited early due to an audit failure or crash before reaching Step 9.

</details>

<details>
<summary><b>Check 3: Did the verification ls show a file?</b></summary>
<br/>

The prompt runs:
```bash
ls -lh /sessions/<session>/mnt/data/my-day-data.xlsx
```

If the log shows `No such file or directory`, the cp failed. Common cause: the sandbox session path changed mid-run. The prompt uses `<session>` as a placeholder — confirm the actual session ID is being used in your prompt's paths (never hardcode a session UUID).

</details>

<details>
<summary><b>Check 4: File permissions</b></summary>
<br/>

If the data/ folder is owned by root or has restricted permissions:

```bash
ls -la /path/to/day-at-a-glance/data/
# Should show write permission for your user
chmod 755 /path/to/day-at-a-glance/data/
```

</details>

---

## Carry-Forward Not Working (daysOpen Always 0)

<a name="carry-forward-broken"></a>

**Symptom:** Every run, all tasks show `daysOpen: 0` — tasks aren't aging.

**Cause:** Step 0.6 isn't reading the previous Excel file correctly. This happens when:

| Cause | Fix |
|-------|-----|
| The mount path doesn't match where the file is written | Verify Step 0.1 path and Step 9 delivery path are the same folder |
| The file was never written on the first run | Check if a file exists at `data/my-day-data.xlsx` |
| The Tasks sheet doesn't exist in the previous file | This happens on the very first run — expected |
| Column name mismatch | Ensure the Tasks sheet has `daysOpen` (camelCase) not `days_open` or `Days Open` |

**Debug:** Add this to Step 0.6 to print what's being loaded:

```python
if wb_prev:
    tasks_sheet = None
    for sheet_name in wb_prev.sheetnames:
        if sheet_name.lower() == 'tasks':
            tasks_sheet = wb_prev[sheet_name]
    if tasks_sheet:
        headers = [c.value for c in tasks_sheet[1]]
        print(f"Previous Tasks headers: {headers}")
        print(f"Previous Tasks row count: {tasks_sheet.max_row - 1}")
    else:
        print("No Tasks sheet found in previous file")
```

---

## Context Budget Exceeded

<a name="context-budget-exceeded"></a>

**Symptom:** The run stops partway through with a context limit error, or the post-save summary is missing.

**Why this happens:** Claude's context window is finite. A large inbox with many emails, or verbose logging, can exhaust it before the Excel is built.

**Prevention:**

1. **Reduce narration** — Add this line to Rule 7: "Never print full email body to the log. Print only: subject, sender, date, 1-line summary."

2. **Tighten folder scanning** — Move more folders from Tier 2 to Tier 3, or add more to the Skip list. The most context-hungry part of the run is reading email threads.

3. **Reduce the lookback window** — If you have very high email volume, change "past 10 days" (first run) to "past 3 days".

4. **Run more frequently** — A twice-daily run processes fewer emails per run than a once-daily run that catches up on a full day's worth.

5. **Cap emails per folder** — Add this constraint to Step 2: "For each folder, process at most 20 emails. If more are present, process the most recent 20 and note the count in the summary."

---

## Duplicate Tasks

<a name="duplicate-tasks"></a>

**Symptom:** The same task appears twice in the Tasks sheet (and therefore twice in the dashboard).

**Cause:** The deduplication logic in Step 8 matches on `title + owner`. Duplicates occur when:
- The title is slightly different between two runs (`"Review Q1 report"` vs `"Review Q1 report "` with a trailing space)
- The owner field is different (`"Sarah"` vs `"Sarah Chen"`)
- A task was created from two different sources (email + To-Do) without recognizing the overlap

**Fix in the prompt:** Add normalization before deduplication:

```python
def normalize_key(title, owner):
    return (
        ' '.join(str(title or '').lower().split()),
        ' '.join(str(owner or '').lower().split())
    )
```

Then match on `normalize_key(task['title'], task['owner'])` instead of raw values.

---

## No Emails in Output

<a name="no-emails-in-output"></a>

**Symptom:** The Emails Inbox sheet has no rows (or only headers).

**Possible causes:**

| Cause | Check |
|-------|-------|
| Chrome MCP failed during Step 2 | Run log — look for errors after "Step 2" |
| Outlook folder navigation failed | Check if the run log shows folders being opened |
| All emails were already captured in a previous run | Is `readStatus` correctly being determined? |
| Date range filtering too narrow | Check the date filter in Step 2 — is `yesterday` and `today` correct? |

---

## Empty Schedule Sheet

<a name="empty-schedule"></a>

**Symptom:** The Schedule sheet has no events (or only placeholder rows).

**Causes:**
- Calendar navigation in Step 1 failed — check run log for Outlook Calendar errors
- Events exist but are in a different calendar view (Chrome was on a different date when Step 1 ran)
- Response status filtering is too strict — check if you're filtering out tentative/declined events

---

## Wrong Dates (Off by One Day)

<a name="wrong-dates"></a>

**Symptom:** Tasks or emails show up under the wrong date — yesterday's items appear as today's, or today's appear as tomorrow's.

**Cause:** The sandbox runs in UTC by default. If you're in a timezone ahead of UTC (e.g., Dubai is UTC+4), a run at 6 AM Dubai time is 2 AM UTC — which means `date.today()` in the sandbox returns yesterday's date.

**Fix:** Add the timezone configuration from [Chapter 4 — Timezone](./04-customization.md#6-timezone-and-date-window) to Step 0 of your prompt.

---

## Dashboard Showing Old Data After Run

<a name="dashboard-showing-old-data"></a>

**Symptom:** The run completed and the file was written, but the dashboard still shows yesterday's data.

**Fix options:**

1. Press `R` (keyboard shortcut) to refresh data from the file
2. Click the "Data freshness" indicator in the dashboard header
3. Hard-refresh the browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

If the dashboard shows the import dialog instead of live data, it means `my-day-data.xlsx` isn't in the correct `data/` folder path. Verify the mount path in your prompt matches where Day at a Glance is running from.

---

## Getting More Help

If your issue isn't covered here:

- **Check the run log** — Cowork logs every tool call and its output
- **Read the official docs** — See [Chapter 7: Reference](./07-reference.md) for all relevant links
- **Open a GitHub issue** — [github.com/CmdShiftExecute/day-at-a-glance/issues](https://github.com/CmdShiftExecute/day-at-a-glance/issues)
- **Anthropic support** — For Claude Cowork-specific issues, use the feedback mechanism in the Cowork UI

---

[← Understanding the Output](./05-excel-output.md) · [Back to Index](./README.md) · [**Next: Reference & Links →**](./07-reference.md)
