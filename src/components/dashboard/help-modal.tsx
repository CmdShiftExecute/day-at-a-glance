'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Upload, ArrowLeftRight, RefreshCw, Settings, Keyboard,
  FileSpreadsheet, Download, ChevronDown, ChevronRight,
  ExternalLink, Sun, Moon, Zap, BarChart3, AlertTriangle,
  Plus, FolderOpen, Clock, Globe, PenLine, Mail
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
        <span className="text-sm font-semibold flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" /> : <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-xs leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KBD({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded mx-0.5"
      style={{ background: 'var(--glass-bg)', color: 'var(--accent-blue)', border: '1px solid rgba(255,255,255,0.15)' }}>
      {children}
    </kbd>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[10px] px-1 rounded" style={{ background: 'var(--glass-bg)' }}>
      {children}
    </code>
  );
}

function SheetTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="px-2 py-1.5 text-left font-semibold border-b border-white/10 whitespace-nowrap"
                style={{ color: 'var(--accent-teal)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="glass-static rounded-2xl w-full max-w-2xl max-h-[85vh] border border-white/10 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img src="/logo-header.png" alt="Day at a Glance" className="w-8 h-8 md:w-10 md:h-10" />
                  <div>
                    <h2 className="text-lg font-display font-bold name-gradient">User Guide</h2>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Everything you need to know about Day at a Glance</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">

                {/* What is Day at a Glance? */}
                <Section title="What is Day at a Glance?" icon={Zap} defaultOpen={true}>
                  <p>
                    <strong>Day at a Glance</strong> is your personal command center. It gives you a
                    clear view of yesterday, today, and tomorrow — your schedule, tasks,
                    emails, and commitments — all in one place.
                  </p>
                  <p>There are three ways to get your data in:</p>
                  <ul className="list-disc list-inside space-y-1.5 ml-1">
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>AI-powered automation</strong> — Use
                      an AI assistant with MCP connectors (Claude, ChatGPT, Gemini, or others)
                      to read your Outlook/Gmail calendar and emails, then generate the Excel
                      file automatically on a schedule.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Manual Excel</strong> — Download
                      the template, fill it in yourself, and upload or drop it into
                      the <Code>data/</Code> folder.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Quick-add from the app</strong> — Use
                      the <Plus className="w-3 h-3 inline" /> buttons on the Schedule, Tasks,
                      and Commitment panels to add items directly without touching Excel.
                    </li>
                  </ul>
                  <p>
                    You can mix and match. For example, let an AI handle your emails and
                    calendar, then quick-add personal tasks yourself.
                  </p>
                </Section>

                {/* Getting Started */}
                <Section title="Getting Started" icon={Globe}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>First-time setup:</p>
                  <ol className="list-decimal list-inside space-y-1.5 ml-1">
                    <li>Open <strong>Settings</strong> (gear icon or press <KBD>S</KBD>)</li>
                    <li>Set your name, search for your city (for timezone &amp; weather), and optionally upload a photo</li>
                    <li>Choose your preferred date format and time format (12h or 24h)</li>
                    <li>Add high-priority email senders so they&apos;re flagged in your inbox</li>
                  </ol>

                  <p className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Loading your data:</p>
                  <p>
                    Place your <Code>my-day-data.xlsx</Code> file in the <Code>data/</Code> folder
                    at the root of the project. The dashboard reads it automatically on load.
                  </p>
                  <p>
                    Alternatively, click the upload button in the header to import a file from
                    anywhere on your computer. Drag-and-drop works too.
                  </p>
                </Section>

                {/* Dashboard Layout */}
                <Section title="Dashboard Layout" icon={BarChart3}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top Row (3 panels):</p>
                  <ul className="list-disc list-inside space-y-1.5 ml-1">
                    <li>
                      <strong>Schedule</strong> — Visual timeline with time slots,
                      a &quot;NOW&quot; marker, and conflict detection for overlapping meetings.
                      Color-coded by event type.
                    </li>
                    <li>
                      <strong>Tasks</strong> — Grouped by type: Actions, Deadlines, Follow-ups,
                      Personal. Sorted by urgency. Click to mark done.
                    </li>
                    <li>
                      <strong>Inbox</strong> — Your received emails, sorted by priority. High-priority
                      senders (set in Settings) float to the top with a pink highlight.
                    </li>
                  </ul>

                  <p className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Bottom Row (2 panels):</p>
                  <ul className="list-disc list-inside space-y-1.5 ml-1">
                    <li>
                      <strong>Commitment Tracker</strong> — Deadlines you&apos;ve set or
                      accepted, grouped by urgency: overdue, 3 days, 7 days, 14 days, 30 days.
                    </li>
                    <li>
                      <strong>Sent Emails</strong> — Emails you sent, with commitment flags
                      highlighted in amber.
                    </li>
                  </ul>

                  <p className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Stats Bar:</p>
                  <p>
                    Shows tasks done/overdue, meetings, unread emails, and active commitments
                    at a glance. The email count turns red when high-priority senders have
                    unread messages.
                  </p>
                </Section>

                {/* Adding Items Manually */}
                <Section title="Adding Items Manually" icon={PenLine}>
                  <p>
                    You don&apos;t need Excel for everything. Three panels have
                    a <Plus className="w-3 h-3 inline" /> button in their header:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ml-1 mt-1">
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Schedule</strong> — Add meetings,
                      focus blocks, breaks, or tasks to your timeline. Set the time, type,
                      and optional description.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Tasks</strong> — Add new to-dos
                      with priority, type, due date, and owner. Great for quick personal
                      tasks or reminders.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Commitments</strong> — Track a
                      promise or deadline with an owner, due date, and description.
                    </li>
                  </ul>
                  <p>
                    Items you add are written to the Excel file automatically, so they persist
                    across sessions and show up when you refresh.
                  </p>
                </Section>

                {/* Email Integration */}
                <Section title="Email Integration" icon={Mail}>
                  <p>
                    Email data (inbox and sent) is designed to be populated by an AI assistant
                    that connects to your email provider through MCP (Model Context Protocol).
                  </p>
                  <p>Supported setups include:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li><strong>Claude</strong> with Outlook or Gmail MCP connectors</li>
                    <li><strong>ChatGPT</strong> with email integration plugins</li>
                    <li><strong>Gemini</strong> with Google Workspace access</li>
                    <li>Any AI tool that can read your inbox and write to Excel</li>
                  </ul>
                  <p>
                    The AI reads your inbox and sent folder, summarises each email, and
                    writes the data into the Excel sheets. You then load the file into Day at a Glance.
                  </p>
                  <p>
                    You can also fill in the email sheets manually — just follow the column
                    format described in the Excel Format section below.
                  </p>
                </Section>

                {/* Navigation */}
                <Section title="Navigation & Controls" icon={ArrowLeftRight}>
                  <p>Use the day navigator to switch between <strong>Yesterday</strong>, <strong>Today</strong>, and <strong>Tomorrow</strong>.</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
                      <span><strong>Refresh</strong> — Re-reads data from the <Code>data/</Code> folder</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                      <span><strong>Import</strong> — Upload an Excel file (drag-and-drop supported)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span><strong>Settings</strong> — Name, city, photo, date/time format, priority senders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
                      <Moon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-purple)' }} />
                      <span><strong>Theme</strong> — Toggle dark mode and light mode</span>
                    </div>
                  </div>
                </Section>

                {/* Keyboard Shortcuts */}
                <Section title="Keyboard Shortcuts" icon={Keyboard}>
                  <div className="grid grid-cols-2 gap-2">
                    <div><KBD>&larr;</KBD> <KBD>&rarr;</KBD> Switch days</div>
                    <div><KBD>R</KBD> Refresh data</div>
                    <div><KBD>S</KBD> Open settings</div>
                    <div><KBD>H</KBD> Open this help</div>
                    <div><KBD>?</KBD> Show shortcuts tooltip</div>
                  </div>
                </Section>

                {/* Data Storage */}
                <Section title="Where Your Data Lives" icon={FolderOpen}>
                  <p>
                    All your data is stored <strong>locally on your machine</strong> — nothing
                    is sent to any server or cloud service.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ml-1">
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Excel file</strong> — <Code>data/my-day-data.xlsx</Code> at
                      the project root. This is where all your schedule, tasks, emails, and
                      commitments are stored.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Settings</strong> — Saved in
                      your browser&apos;s local storage and also backed up
                      to <Code>data/settings.json</Code>.
                    </li>
                  </ul>
                  <p>
                    When you check off a task, add an item, or make changes through the app,
                    the Excel file is updated automatically. Your data persists across page
                    refreshes and browser restarts.
                  </p>
                </Section>

                {/* Smart Features */}
                <Section title="Smart Features" icon={Zap}>
                  <ul className="space-y-2">
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Task persistence</strong> — Open
                      and overdue tasks carry forward to the next day until marked done.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Urgency scoring</strong> — Tasks
                      auto-sort by priority weight + days open + due-today/overdue bonuses.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Commitment tracking</strong> — Emails
                      marked <Code>commitment: yes</Code> with a deadline are grouped by urgency.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Priority email alerts</strong> — Unread
                      emails from your VIP senders turn the stats bar indicator red.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Conflict detection</strong> — Overlapping
                      meetings appear side-by-side with a warning indicator.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Live meeting indicator</strong> — Meetings
                      happening right now show a pulsing &quot;LIVE&quot; badge on the timeline.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Day summary</strong> — A one-line
                      summary of your day: meeting load, overdue tasks, priority emails.
                    </li>
                  </ul>
                </Section>

                {/* Settings */}
                <Section title="Settings & Display" icon={Settings}>
                  <ul className="space-y-2">
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>City &amp; timezone</strong> — Search
                      for any city in the world. Your selection sets the timezone for all time
                      calculations, weather display, and the &quot;NOW&quot; marker on the timeline.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Date format</strong> — Choose how
                      dates appear: DD MMM YYYY, MMM DD YYYY, DD/MM/YYYY, MM/DD/YYYY, or
                      YYYY-MM-DD. This is display-only — data in Excel must always
                      use YYYY-MM-DD.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>Time format</strong> — Switch
                      between 24-hour (14:30) and 12-hour (2:30 PM) display.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-primary)' }}>High-priority senders</strong> — Enter
                      one sender per line (no commas or semicolons). Partial matches work
                      (e.g., &quot;John&quot; matches &quot;John Smith&quot;).
                    </li>
                  </ul>
                </Section>

                {/* Meeting Response Colors */}
                <Section title="Meeting Response Colors" icon={Calendar}>
                  <p>The timeline and meeting cards are color-coded by your response status:</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: '#22c55e' }} />
                      <span>Accepted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: '#eab308' }} />
                      <span>Tentative</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} />
                      <span>Declined</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: '#6b7280' }} />
                      <span>No response</span>
                    </div>
                  </div>
                </Section>

                {/* Date & Time Format Rules */}
                <Section title="Date & Time Rules for Excel" icon={Clock}>
                  <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
                    <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--accent-amber)' }}>
                      Important: Input formats in your Excel file
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Regardless of your display settings, your Excel data must always use these formats:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-1 mt-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      <li>
                        <strong>Dates</strong> — <strong style={{ color: 'var(--accent-amber)' }}>YYYY-MM-DD</strong> (e.g., <Code>2026-03-28</Code> for
                        March 28th). This is the only unambiguous format.
                      </li>
                      <li>
                        <strong>Times</strong> — <strong style={{ color: 'var(--accent-amber)' }}>HH:MM</strong> in
                        24-hour format (e.g., <Code>14:30</Code> for 2:30 PM).
                      </li>
                    </ul>
                    <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      Writing <Code>03/07/2026</Code> could mean March 7 or July 3 — the app
                      cannot tell the difference. The display format you choose in Settings
                      only affects how dates <em>appear</em> in the dashboard.
                    </p>
                  </div>
                </Section>

                {/* Excel Format */}
                <Section title="Excel File Format" icon={FileSpreadsheet}>
                  <p>
                    The dashboard reads a single <Code>my-day-data.xlsx</Code> file
                    with <strong>5 sheets</strong>. Each sheet uses
                    a <Code>date</Code> column (YYYY-MM-DD) to determine which day view
                    the row belongs to.
                  </p>

                  <p className="font-semibold mt-3 mb-1" style={{ color: 'var(--accent-teal)' }}>1. Schedule</p>
                  <SheetTable
                    headers={['Column', 'Required', 'Values']}
                    rows={[
                      ['date', 'Yes', 'YYYY-MM-DD'],
                      ['time', 'Yes', 'HH:MM (24h)'],
                      ['endTime', 'Yes', 'HH:MM (24h)'],
                      ['title', 'Yes', 'Event name'],
                      ['type', 'No', 'meeting | task | break | focus | travel'],
                      ['description', 'No', 'Free text'],
                      ['link', 'No', 'URL to calendar event'],
                      ['responseStatus', 'No', 'accepted | tentative | declined | none'],
                    ]}
                  />

                  <p className="font-semibold mt-3 mb-1" style={{ color: 'var(--accent-teal)' }}>2. Tasks</p>
                  <SheetTable
                    headers={['Column', 'Required', 'Values']}
                    rows={[
                      ['date', 'Yes', 'YYYY-MM-DD'],
                      ['title', 'Yes', 'Task description'],
                      ['priority', 'Yes', 'high | medium | low'],
                      ['status', 'Yes', 'open | done | overdue'],
                      ['dueDate', 'No', 'YYYY-MM-DD'],
                      ['source', 'No', 'Where this task came from'],
                      ['owner', 'No', 'Who owns this task'],
                      ['daysOpen', 'No', 'Number (days since created)'],
                      ['category', 'No', 'Department/area tag'],
                      ['taskType', 'Yes', 'action | deadline | followup | personal'],
                      ['link', 'No', 'URL to source'],
                    ]}
                  />

                  <p className="font-semibold mt-3 mb-1" style={{ color: 'var(--accent-teal)' }}>3. Meetings</p>
                  <SheetTable
                    headers={['Column', 'Required', 'Values']}
                    rows={[
                      ['date', 'Yes', 'YYYY-MM-DD'],
                      ['title', 'Yes', 'Meeting name'],
                      ['time', 'Yes', 'HH:MM (24h)'],
                      ['endTime', 'Yes', 'HH:MM (24h)'],
                      ['organizer', 'No', 'Person who created it'],
                      ['attendees', 'No', 'Comma-separated names'],
                      ['location', 'No', 'Room name or "MS Teams"'],
                      ['type', 'No', 'teams | in-person'],
                      ['link', 'No', 'URL to calendar event'],
                      ['responseStatus', 'No', 'accepted | tentative | declined | none'],
                    ]}
                  />

                  <p className="font-semibold mt-3 mb-1" style={{ color: 'var(--accent-teal)' }}>4. Emails Inbox</p>
                  <SheetTable
                    headers={['Column', 'Required', 'Values']}
                    rows={[
                      ['date', 'Yes', 'YYYY-MM-DD'],
                      ['time', 'Yes', 'HH:MM (24h)'],
                      ['from', 'Yes', 'Sender name'],
                      ['subject', 'Yes', 'Email subject'],
                      ['folder', 'No', 'Outlook/Gmail folder'],
                      ['priority', 'No', 'high | direct | cc | normal'],
                      ['readStatus', 'Yes', 'unread | read'],
                      ['addressed', 'No', 'direct | cc'],
                      ['summary', 'No', 'AI-generated summary'],
                      ['myReply', 'No', 'yes | no'],
                      ['replySummary', 'No', 'Summary of your reply'],
                      ['attachment', 'No', 'yes | no'],
                      ['link', 'No', 'URL to email'],
                    ]}
                  />

                  <p className="font-semibold mt-3 mb-1" style={{ color: 'var(--accent-teal)' }}>5. Emails Sent</p>
                  <SheetTable
                    headers={['Column', 'Required', 'Values']}
                    rows={[
                      ['date', 'Yes', 'YYYY-MM-DD'],
                      ['time', 'Yes', 'HH:MM (24h)'],
                      ['to', 'Yes', 'Recipient name(s)'],
                      ['subject', 'Yes', 'Email subject'],
                      ['summary', 'No', 'AI-generated summary'],
                      ['importance', 'No', 'high | normal'],
                      ['commitment', 'No', 'yes | no'],
                      ['owner', 'No', 'Who owns the commitment'],
                      ['deadline', 'No', 'YYYY-MM-DD'],
                      ['attachment', 'No', 'yes | no'],
                      ['link', 'No', 'URL to email'],
                    ]}
                  />
                </Section>

                {/* Download Template */}
                <Section title="Download Excel Template" icon={Download}>
                  <p>Get a pre-formatted template with sample data for all 5 sheets:</p>
                  <a
                    href="https://tinyurl.com/228xlnp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))',
                      color: 'white',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download Excel Template
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                  <p className="mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Place the filled file as <Code>my-day-data.xlsx</Code> in
                    the <Code>data/</Code> folder, or use the upload button.
                  </p>
                </Section>

                {/* Data Flow */}
                <Section title="How Data Flows" icon={RefreshCw}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Option 1: AI automation (recommended)</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                    <li>Set up a scheduled task in Claude, ChatGPT, Gemini, or another AI tool</li>
                    <li>The AI connects to your Outlook/Gmail via MCP and reads your calendar, inbox, and sent folder</li>
                    <li>It generates <Code>my-day-data.xlsx</Code> with 3 days of data</li>
                    <li>The file is saved to the <Code>data/</Code> folder</li>
                    <li>Open the dashboard — it loads automatically</li>
                    <li>Press <KBD>R</KBD> to refresh if new data arrives while you&apos;re viewing</li>
                  </ol>

                  <p className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Option 2: Manual Excel</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                    <li>Download the template (link above)</li>
                    <li>Fill in your data for yesterday, today, and/or tomorrow</li>
                    <li>Drop it in the <Code>data/</Code> folder or click the upload button</li>
                  </ol>

                  <p className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Option 3: Quick-add from the app</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                    <li>Click the <Plus className="w-3 h-3 inline" /> button on Schedule, Tasks, or Commitments</li>
                    <li>Fill in the form and submit</li>
                    <li>The item is written to your Excel file and appears immediately</li>
                  </ol>
                </Section>

                {/* Troubleshooting */}
                <Section title="Troubleshooting" icon={AlertTriangle}>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Shows &quot;Using demo data&quot;</p>
                      <p className="ml-3 mt-0.5">
                        No <Code>my-day-data.xlsx</Code> found in <Code>data/</Code>.
                        Upload a file or check your AI scheduler.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Times show as NaN</p>
                      <p className="ml-3 mt-0.5">
                        Time values must be <Code>HH:MM</Code> in 24-hour format
                        (e.g., <Code>14:30</Code>). Excel sometimes converts these to
                        decimals — format the column as &quot;Text&quot; before entering times.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tomorrow is empty</p>
                      <p className="ml-3 mt-0.5">
                        Your AI scheduler may not have tomorrow&apos;s data yet.
                        This is normal — it depends on when the scheduler last ran.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Task checkbox doesn&apos;t save</p>
                      <p className="ml-3 mt-0.5">
                        Task write-back requires the dev server (<Code>npm run dev</Code>).
                        If running as a static build, changes are session-only.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dates look wrong</p>
                      <p className="ml-3 mt-0.5">
                        Make sure your Excel uses <Code>YYYY-MM-DD</Code> for all date columns.
                        Check Settings &rarr; Date Format if the display format isn&apos;t what you expect.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weather not showing</p>
                      <p className="ml-3 mt-0.5">
                        Open Settings and search for your city. Select it from the dropdown
                        results to ensure accurate weather and timezone data.
                      </p>
                    </div>
                  </div>
                </Section>

                {/* About */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-col items-center text-center py-4">
                    <img src="/icon-192.png" alt="Day at a Glance" className="w-16 h-16 mb-3" />
                    <h3 className="text-base font-bold name-gradient">Day at a Glance</h3>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Version 1.0</p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Developed by <strong style={{ color: 'var(--text-primary)' }}>S. Sharma</strong>
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent-blue)' }}>
                      github.com/CmdShiftExecute/day-at-a-glance
                    </p>
                    <p className="text-[10px] mt-3 px-6" style={{ color: 'var(--text-muted)' }}>
                      Released under the MIT License
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
