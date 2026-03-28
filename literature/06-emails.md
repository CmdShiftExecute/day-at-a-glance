<div align="center">

# 📧 Chapter 6: Email Intelligence

**Your inbox, distilled and prioritized.**

</div>

---

[← Tasks](./05-tasks.md) · [Back to Index](./README.md) · [Next: Commitments →](./07-commitments.md)

---

## Overview

The email system spans two panels — **Inbox** and **Sent** — giving you a complete picture of your email day. Combined with VIP sender detection and commitment flagging, it transforms raw email data into actionable intelligence.

---

## 📥 Inbox Panel

The inbox panel shows all incoming emails for the active day, sorted by priority.

### Email Properties

| Field | Description |
|-------|-------------|
| **Time** | When the email arrived (formatted per your settings) |
| **From** | Sender name or email |
| **Subject** | Email subject line |
| **Summary** | Brief description of the email's content |
| **Priority** | Calculated importance level |
| **Read Status** | `unread` or `read` — unread items are visually highlighted |
| **Addressed** | `direct` (To: you) or `cc` (CC'd) |
| **My Reply** | Whether you've responded (`yes` / `no`) |
| **Reply Summary** | What your reply said (if applicable) |
| **Attachment** | Whether the email has attachments |
| **Folder** | Email folder/label |
| **Link** | Direct link to the email (if available) |

### Priority Hierarchy

Emails are sorted by a **priority ranking system**:

| Rank | Priority Code | Meaning |
|------|--------------|---------|
| 🔴 **1st** | `evp` | Executive Vice President level |
| 🔴 **2nd** | `vp` / `high` | Vice President or high importance |
| 🟡 **3rd** | `direct` | Directly addressed to you |
| ⚪ **4th** | `cc` | You're CC'd |
| ⚪ **5th** | `normal` | Standard priority |

### VIP Sender Detection

When an email's sender matches one of your [VIP senders list](./03-settings.md#-vip--high-priority-senders), it triggers:

```
Incoming email from: boss@company.com
      │
      ▼
Check against VIP list in settings
      │
      ├── ✅ Match found
      │       ├── 🔴 Email gets special highlight in inbox
      │       ├── ⚠️ Summary line switches to "alert" tone
      │       └── 📊 "Priority email needs attention" in summary text
      │
      └── ❌ No match → normal priority sorting applies
```

---

## 📤 Sent Panel

The sent panel tracks emails you've sent, with special attention to **commitments**.

### Sent Email Properties

| Field | Description |
|-------|-------------|
| **Time** | When you sent the email |
| **To** | Recipient(s) |
| **Subject** | Email subject line |
| **Summary** | Brief description of what you wrote |
| **Importance** | `high` or `normal` |
| **Commitment** | `yes` or `no` — flags if you made a promise or follow-up commitment |
| **Owner** | Who owns the follow-up action |
| **Deadline** | When the commitment is due |
| **Attachment** | Whether you attached files |
| **Link** | Direct link to the sent email |

### Commitment Flagging

When a sent email has `commitment: 'yes'`, it means you made a promise, committed to a deliverable, or set an expectation that needs tracking. These items flow into the [Commitment Tracker](./07-commitments.md).

```
Sent email:
  To: client@external.com
  Subject: "Q1 Report — will send by Friday"
  Commitment: yes
  Owner: You
  Deadline: 2026-03-28
      │
      ▼
  Appears in Sent panel with commitment badge
      │
      ▼
  Also appears in Commitment Tracker panel
```

---

## 📊 Email Stats

Email metrics feed into the dashboard's summary and stats:

| Metric | Source | Impact |
|--------|--------|--------|
| **Total inbox** | Count of inbox emails | Shown in stats bar |
| **Unread** | `readStatus === 'unread'` | Highlighted count in stats |
| **VIP unread** | Unread + matches VIP list | Triggers alert summary tone |

---

[← Tasks](./05-tasks.md) · [Back to Index](./README.md) · [**Next: Commitment Tracker →**](./07-commitments.md)
