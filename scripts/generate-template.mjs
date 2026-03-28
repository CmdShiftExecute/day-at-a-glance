import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const today = new Date().toISOString().split('T')[0];

// ── Schedule sheet ──
const schedule = [
  { date: today, time: '07:30', endTime: '08:00', title: 'Morning Routine & News Brief', type: 'break', description: '' },
  { date: today, time: '08:00', endTime: '08:15', title: 'Daily Standup', type: 'meeting', description: '' },
  { date: today, time: '08:15', endTime: '09:30', title: 'Deep Work — Board Deck Prep', type: 'focus', description: 'No interruptions' },
  { date: today, time: '10:00', endTime: '11:00', title: 'Sprint Planning', type: 'meeting', description: '' },
  { date: today, time: '11:00', endTime: '12:00', title: 'Product Strategy Session', type: 'meeting', description: 'Quarterly OKR alignment' },
  { date: today, time: '12:00', endTime: '13:00', title: 'Lunch with Mentor', type: 'break', description: '' },
  { date: today, time: '13:30', endTime: '14:00', title: 'Email & Slack Catch-up', type: 'task', description: '' },
  { date: today, time: '14:00', endTime: '15:00', title: '1:1 with VP Engineering', type: 'meeting', description: '' },
  { date: today, time: '15:30', endTime: '16:30', title: 'Technical Architecture Review', type: 'meeting', description: 'Microservices migration' },
  { date: today, time: '17:00', endTime: '18:00', title: 'Deep Work — Roadmap Document', type: 'focus', description: '' },
];

// ── Tasks sheet ──
const tasks = [
  { date: today, title: 'Prepare board presentation deck (15 slides)', priority: 'high', completed: 'false', dueTime: '17:00', category: 'Executive' },
  { date: today, title: 'Review and approve sprint backlog items', priority: 'high', completed: 'true', dueTime: '10:00', category: 'Planning' },
  { date: today, title: 'Draft Q2 OKRs for product team', priority: 'high', completed: 'false', dueTime: '18:00', category: 'Strategy' },
  { date: today, title: 'Sign off on CloudScale vendor contract', priority: 'medium', completed: 'true', dueTime: '', category: 'Procurement' },
  { date: today, title: "Review new hire onboarding plan", priority: 'medium', completed: 'false', dueTime: '', category: 'HR' },
  { date: today, title: 'Update stakeholder communication plan', priority: 'medium', completed: 'true', dueTime: '', category: 'Planning' },
  { date: today, title: 'Complete security awareness training', priority: 'low', completed: 'false', dueTime: '', category: 'Compliance' },
  { date: today, title: 'Book flights for NYC client visit (Mar 28)', priority: 'medium', completed: 'false', dueTime: '18:00', category: 'Travel' },
];

// ── Meetings sheet ──
const meetings = [
  { date: today, title: 'Daily Standup', time: '08:00', endTime: '08:15', duration: '15 min', attendees: 'Sarah Chen, Mike Ross, Lisa Park, Dev Team', location: 'Zoom', type: 'video', description: '' },
  { date: today, title: 'Sprint Planning', time: '10:00', endTime: '11:00', duration: '60 min', attendees: 'Sarah Chen, Mike Ross, QA Team, Dev Team', location: 'Conference Room B', type: 'in-person', description: 'Sprint 15 planning' },
  { date: today, title: 'Product Strategy Session', time: '11:00', endTime: '12:00', duration: '60 min', attendees: 'CEO Maria Lopez, CTO Alex Rivera, Product Leads', location: 'Board Room', type: 'in-person', description: 'Quarterly OKR alignment' },
  { date: today, title: '1:1 with VP Engineering', time: '14:00', endTime: '15:00', duration: '60 min', attendees: 'David Kim', location: 'Google Meet', type: 'video', description: '' },
  { date: today, title: 'Technical Architecture Review', time: '15:30', endTime: '16:30', duration: '60 min', attendees: 'Alex Rivera (CTO), Backend Team, DevOps', location: 'Zoom', type: 'video', description: 'Microservices migration plan' },
];

// ── Emails Inbox sheet ──
const emailsInbox = [
  { date: today, from: 'CEO Maria Lopez', subject: 'Board Meeting Prep — Urgent Review', summary: 'Need the product section of the board deck reviewed by 3 PM today. Key focus areas: revenue metrics, product adoption rates, and Q2 roadmap highlights.', time: '07:15', priority: 'urgent', hasAttachment: 'true' },
  { date: today, from: 'CEO Maria Lopez', subject: 'FW: Investor Questions — Need Answers', summary: 'Investor board members are asking about our AI strategy and competitive positioning. Please draft talking points by tomorrow morning.', time: '07:30', priority: 'urgent', hasAttachment: 'false' },
  { date: today, from: 'Sarah Chen (PM)', subject: 'Sprint 15 — Proposed Stories', summary: 'Attached the proposed story list for Sprint 15. 47 story points total. Flagged 3 high-risk items that need technical design review first.', time: '08:45', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'Alex Rivera (CTO)', subject: 'Architecture Review Pre-Read', summary: "Sharing the microservices migration proposal for this afternoon's review. Key decision: event-driven vs request-response for service communication.", time: '09:00', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'Marketing Team', subject: 'Product Launch Campaign — Review Needed', summary: 'Campaign materials for the v3 mobile app launch are ready for your review. Launch date: April 15. Please confirm messaging and positioning.', time: '09:30', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'David Kim (VP Eng)', subject: 'Q2 Headcount — Updated Numbers', summary: 'Revised the hiring plan based on our discussion. Now proposing 4 senior engineers, 1 DevOps, and 1 data engineer. Budget impact analysis attached.', time: '10:15', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'CloudScale Inc', subject: 'Contract Ready for Signature', summary: 'Final contract with agreed terms: 3-year commitment, 15% discount, dedicated support. DocuSign link included for e-signature.', time: '11:00', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'Facilities', subject: 'Floor 3 Relocation — Your New Desk', summary: 'Your temporary desk assignment during renovation: Floor 5, Desk 5-42, near the east window. Starts Monday.', time: '11:30', priority: 'low', hasAttachment: 'false' },
  { date: today, from: 'Legal Team', subject: 'NDA Review — Partner Integration', summary: 'Please review the NDA for the upcoming partnership integration with DataFlow Inc. Comments due by Thursday.', time: '13:00', priority: 'normal', hasAttachment: 'true' },
  { date: today, from: 'Conference Bot', subject: 'TechSummit 2026 — Speaker Confirmation', summary: 'Your session "Scaling Product Teams" has been confirmed for TechSummit on April 22. Please submit your slide deck by April 10.', time: '14:30', priority: 'low', hasAttachment: 'false' },
];

// ── Emails Sent sheet ──
const emailsSent = [
  { date: today, to: 'CEO Maria Lopez', subject: 'RE: Board Meeting Prep — Product Section Draft', summary: 'Sent the draft product section with updated revenue metrics, adoption rates, and roadmap highlights for review.', time: '09:45', hasAttachment: 'true' },
  { date: today, to: 'Sarah Chen (PM)', subject: 'RE: Sprint 15 — Approved with Notes', summary: 'Approved the sprint backlog with adjustments: moved 2 stories to next sprint to reduce risk, added 1 tech debt item.', time: '10:05', hasAttachment: 'false' },
  { date: today, to: 'CloudScale Inc', subject: 'Contract Signed — Welcome Aboard', summary: 'Executed the 3-year enterprise contract via DocuSign. Looking forward to the partnership kickoff next week.', time: '11:20', hasAttachment: 'false' },
  { date: today, to: 'Team Leads', subject: 'Q2 Planning Kickoff — Agenda & Pre-Work', summary: 'Shared the agenda for Q2 planning sessions starting next Monday. Pre-work: each team to draft their top 3 OKRs.', time: '16:00', hasAttachment: 'true' },
];

// ── Reminders sheet ──
const reminders = [
  { date: today, text: 'Board deck product section — review by 3 PM', time: '15:00', type: 'deadline' },
  { date: today, text: 'Follow up on investor talking points', time: '', type: 'followup' },
  { date: today, text: 'Book flights for NYC — prices going up', time: '18:00', type: 'deadline' },
  { date: today, text: 'Reply to Legal about NDA review', time: '', type: 'followup' },
  { date: today, text: 'Gym session — 6:30 PM', time: '18:30', type: 'personal' },
];

// ── Build workbook ──
const wb = XLSX.utils.book_new();

function addSheet(name, data) {
  const ws = XLSX.utils.json_to_sheet(data);
  // Auto-width columns
  const colWidths = Object.keys(data[0]).map(key => {
    const maxLen = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLen + 2, 60) };
  });
  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, name);
}

addSheet('Schedule', schedule);
addSheet('Tasks', tasks);
addSheet('Meetings', meetings);
addSheet('Emails Inbox', emailsInbox);
addSheet('Emails Sent', emailsSent);
addSheet('Reminders', reminders);

// Write file
const outPath = process.argv[2] || './my-day-template.xlsx';
XLSX.writeFile(wb, outPath);
console.log(`Written to ${outPath}`);
console.log(`Sheets: ${wb.SheetNames.join(', ')}`);
console.log(`Total rows: ${schedule.length + tasks.length + meetings.length + emailsInbox.length + emailsSent.length + reminders.length}`);
