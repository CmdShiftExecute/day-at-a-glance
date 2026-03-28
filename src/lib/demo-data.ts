import { DayData, DayView } from './types';
import { getDateStr } from './city-time';

function getDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

const yesterdayData: DayData = {
  date: getDateString(-1),
  schedule: [
    { id: 's-y1', time: '08:00', endTime: '08:30', title: 'Morning Review & Coffee', type: 'break' },
    { id: 's-y2', time: '08:30', endTime: '09:00', title: 'Daily Standup', type: 'meeting' },
    { id: 's-y3', time: '09:00', endTime: '10:30', title: 'Q1 Budget Review', type: 'meeting', description: 'Finance team deep-dive' },
    { id: 's-y4', time: '10:30', endTime: '12:00', title: 'Product Roadmap Planning', type: 'focus' },
    { id: 's-y5', time: '12:00', endTime: '13:00', title: 'Lunch Break', type: 'break' },
    { id: 's-y6', time: '13:00', endTime: '14:00', title: 'Design Review — Mobile App v3', type: 'meeting' },
    { id: 's-y7', time: '14:30', endTime: '15:30', title: 'Vendor RFP Evaluation', type: 'task' },
    { id: 's-y8', time: '16:00', endTime: '17:00', title: '1:1 with Engineering Lead', type: 'meeting' },
  ],
  tasks: [
    { id: 't-y1', title: 'Finalize Q1 budget presentation slides', priority: 'high', status: 'done', dueDate: getDateString(-1), source: 'Outlook To-Do: Finance', owner: 'You', daysOpen: 2, category: 'Finance', taskType: 'action' },
    { id: 't-y2', title: 'Review vendor RFP responses (3 vendors)', priority: 'high', status: 'done', source: 'Sent: RFP Review Request, Mar 20', owner: 'You', daysOpen: 3, category: 'Procurement', taskType: 'action' },
    { id: 't-y3', title: 'Send sprint retro summary to team', priority: 'medium', status: 'done', source: 'Outlook To-Do', owner: 'You', category: 'Team', taskType: 'action' },
    { id: 't-y4', title: 'Update project timeline in Jira', priority: 'medium', status: 'done', source: 'Outlook To-Do', owner: 'You', category: 'Planning', taskType: 'action' },
    { id: 't-y5', title: 'Review new hire onboarding documents', priority: 'low', status: 'open', source: 'Inbox: New Hire Starting Monday, Mar 22', owner: 'You', daysOpen: 1, category: 'HR', taskType: 'followup' },
    { id: 't-y6', title: 'Book travel for client visit next week', priority: 'medium', status: 'open', dueDate: getDateString(-1), source: 'Outlook To-Do', owner: 'You', category: 'Travel', taskType: 'deadline' },
  ],
  meetings: [
    { id: 'm-y1', title: 'Daily Standup', time: '08:30', endTime: '09:00', organizer: 'Sarah Chen', attendees: 'Sarah Chen, Mike Ross, Lisa Park, Dev Team', location: 'Teams', type: 'teams' },
    { id: 'm-y2', title: 'Q1 Budget Review', time: '09:00', endTime: '10:30', organizer: 'James Wright', attendees: 'CFO James Wright, Finance Team, Department Heads', location: 'Board Room A', type: 'in-person' },
    { id: 'm-y3', title: 'Design Review — Mobile App v3', time: '13:00', endTime: '14:00', organizer: 'Amy Torres', attendees: 'UX Lead Amy Torres, Frontend Team', location: 'Teams', type: 'teams' },
    { id: 'm-y4', title: '1:1 with Engineering Lead', time: '16:00', endTime: '17:00', organizer: 'David Kim', attendees: 'David Kim', location: 'His Office', type: 'in-person' },
  ],
  emailsInbox: [
    { id: 'ei-y1', time: '07:45', from: 'James Wright (CFO)', subject: 'Q1 Budget — Final Adjustments', folder: 'Inbox-Focused', priority: 'high', readStatus: 'read', addressed: 'direct', summary: 'Approved revised Q1 allocations with minor adjustments to cloud infrastructure line item. Needs sign-off by EOD.', myReply: 'yes', replySummary: 'Confirmed approval of revised Q1 budget allocations.', attachment: 'yes' },
    { id: 'ei-y2', time: '09:12', from: 'HR Department', subject: 'New Hire Starting Monday — Onboarding Checklist', folder: 'Inbox-Other', priority: 'normal', readStatus: 'read', addressed: 'direct', summary: 'New hire starts Monday as Senior Engineer. Please review onboarding plan and confirm mentor assignment.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-y3', time: '10:30', from: 'Sarah Chen (PM)', subject: 'Sprint 14 Velocity Report', folder: 'Inbox-Focused', priority: 'direct', readStatus: 'read', addressed: 'direct', summary: 'Team velocity increased 12% this sprint. Three stories carried over due to unexpected API changes.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-y4', time: '11:15', from: 'CloudScale Inc', subject: 'RE: RFP Response — Enterprise Plan', folder: 'Inbox-Other', priority: 'normal', readStatus: 'read', addressed: 'direct', summary: 'Revised pricing with 15% volume discount for 3-year commitment. Includes dedicated support and SLA guarantees.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-y5', time: '12:40', from: 'Lisa Park (Design)', subject: 'Mobile App v3 — Updated Mockups', folder: 'Inbox-Focused', priority: 'direct', readStatus: 'read', addressed: 'cc', summary: 'Revised mockups incorporating feedback. Key changes: simplified onboarding flow and new dashboard layout.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-y6', time: '14:00', from: 'IT Security', subject: 'Mandatory: Security Awareness Training Due', folder: 'Inbox-Other', priority: 'cc', readStatus: 'unread', addressed: 'cc', summary: 'Annual security training must be completed by end of month. Takes approximately 45 minutes.', myReply: 'no', attachment: 'no' },
    { id: 'ei-y7', time: '15:20', from: 'David Kim (Engineering)', subject: 'Engineering Headcount Planning', folder: 'Inbox-Focused', priority: 'high', readStatus: 'read', addressed: 'direct', summary: 'Need to discuss Q2 hiring priorities before leadership meeting. Proposing 3 senior engineers and 1 DevOps role.', myReply: 'no', attachment: 'no' },
  ],
  emailsSent: [
    { id: 'es-y1', time: '17:10', to: 'James Wright (CFO)', subject: 'RE: Q1 Budget — Signed Off', summary: 'Confirmed approval of revised Q1 budget allocations with cloud infrastructure adjustment.', importance: 'normal', commitment: 'no', attachment: 'no' },
    { id: 'es-y2', time: '17:30', to: 'All Hands', subject: 'Sprint 14 Wrap-Up & Wins', summary: 'Shared team accomplishments including 12% velocity increase and key deliverables shipped.', importance: 'normal', commitment: 'no', attachment: 'no' },
    { id: 'es-y3', time: '14:30', to: 'Amy Torres (UX Lead)', subject: 'Design Review Follow-Up — Action Items', summary: 'Documented action items: finalize icon set, update navigation patterns, schedule usability testing.', importance: 'normal', commitment: 'yes', owner: 'Amy Torres', deadline: getDateString(1), attachment: 'no' },
  ],
};

const todayData: DayData = {
  date: getDateString(0),
  schedule: [
    { id: 's-t1', time: '07:30', endTime: '08:00', title: 'Morning Routine & News Brief', type: 'break' },
    { id: 's-t2', time: '08:00', endTime: '08:15', title: 'Daily Standup', type: 'meeting', responseStatus: 'accepted' },
    { id: 's-t3', time: '08:15', endTime: '09:30', title: 'Deep Work — Board Deck Prep', type: 'focus', description: 'No interruptions' },
    { id: 's-t4', time: '10:00', endTime: '11:00', title: 'Sprint Planning', type: 'meeting', responseStatus: 'accepted' },
    { id: 's-t5', time: '10:30', endTime: '11:30', title: 'Vendor Selection Review', type: 'meeting', responseStatus: 'tentative', description: 'Conflict with Sprint Planning' },
    { id: 's-t5b', time: '11:00', endTime: '12:00', title: 'Product Strategy Session', type: 'meeting', description: 'Quarterly OKR alignment', responseStatus: 'accepted' },
    { id: 's-t6', time: '12:00', endTime: '13:00', title: 'Lunch with Mentor', type: 'break' },
    { id: 's-t7', time: '13:30', endTime: '14:00', title: 'Email & Slack Catch-up', type: 'task' },
    { id: 's-t8', time: '14:00', endTime: '15:00', title: '1:1 with Engineering Lead', type: 'meeting', responseStatus: 'accepted' },
    { id: 's-t8b', time: '14:30', endTime: '15:30', title: 'HR Town Hall (Optional)', type: 'meeting', responseStatus: 'declined' },
    { id: 's-t9', time: '15:30', endTime: '16:30', title: 'Technical Architecture Review', type: 'meeting', description: 'Microservices migration', responseStatus: 'accepted' },
    { id: 's-t10', time: '17:00', endTime: '18:00', title: 'Deep Work — Roadmap Document', type: 'focus' },
  ],
  tasks: [
    { id: 't-t1', title: 'Prepare board presentation deck (15 slides)', priority: 'high', status: 'open', dueDate: getDateString(0), source: 'Outlook To-Do: Executive', owner: 'You', daysOpen: 0, category: 'Executive', taskType: 'action' },
    { id: 't-t2', title: 'Review and approve sprint backlog items', priority: 'high', status: 'done', source: 'Outlook To-Do', owner: 'You', daysOpen: 0, category: 'Planning', taskType: 'action' },
    { id: 't-t3', title: 'Draft Q2 OKRs for product team', priority: 'high', status: 'open', dueDate: getDateString(0), source: 'Outlook To-Do: Strategy', owner: 'You', daysOpen: 2, category: 'Strategy', taskType: 'action' },
    { id: 't-t4', title: 'Sign off on CloudScale vendor contract', priority: 'medium', status: 'done', source: 'Inbox: Contract Ready for Signature, Mar 24', owner: 'You', daysOpen: 0, category: 'Procurement', taskType: 'action' },
    { id: 't-t5', title: 'Reply to Engineering Lead re: Headcount Planning', priority: 'high', status: 'open', source: 'Inbox: Engineering Headcount Planning, Mar 23', owner: 'You', daysOpen: 1, category: 'Hiring', taskType: 'followup' },
    { id: 't-t6', title: 'Board deck product section — review by 3 PM', priority: 'high', status: 'open', dueDate: getDateString(0), source: 'Inbox: Board Meeting Prep, Mar 24', owner: 'You', daysOpen: 0, category: 'Executive', taskType: 'deadline' },
    { id: 't-t7', title: 'Design review action items — sent 2 days ago, no confirmation', priority: 'medium', status: 'overdue', source: 'Sent: Design Review Follow-Up, Mar 22', owner: 'Amy Torres', daysOpen: 3, category: 'Design', taskType: 'followup' },
    { id: 't-t8', title: 'Complete security awareness training', priority: 'low', status: 'open', dueDate: getDateString(5), source: 'Inbox: Security Training Due, Mar 23', owner: 'You', category: 'Compliance', taskType: 'action' },
    { id: 't-t9', title: 'Book flights for NYC client visit (Mar 28)', priority: 'medium', status: 'open', dueDate: getDateString(2), source: 'Outlook To-Do', owner: 'You', daysOpen: 2, category: 'Travel', taskType: 'deadline' },
    { id: 't-t10', title: 'Gym session — 6:30 PM', priority: 'low', status: 'open', source: 'Chat', owner: 'You', category: 'Personal', taskType: 'personal' },
  ],
  meetings: [
    { id: 'm-t1', title: 'Daily Standup', time: '08:00', endTime: '08:15', organizer: 'Sarah Chen', attendees: 'Sarah Chen, Mike Ross, Lisa Park, Dev Team', location: 'Teams', type: 'teams' },
    { id: 'm-t2', title: 'Sprint Planning', time: '10:00', endTime: '11:00', organizer: 'Sarah Chen', attendees: 'Sarah Chen, Mike Ross, QA Team, Dev Team', location: 'Conference Room B', type: 'in-person' },
    { id: 'm-t3', title: 'Product Strategy Session', time: '11:00', endTime: '12:00', organizer: 'CEO Maria Lopez', attendees: 'CEO Maria Lopez, CTO Alex Rivera, Product Leads', location: 'Board Room', type: 'in-person' },
    { id: 'm-t4', title: '1:1 with Engineering Lead', time: '14:00', endTime: '15:00', organizer: 'David Kim', attendees: 'David Kim', location: 'Teams', type: 'teams' },
    { id: 'm-t5', title: 'Technical Architecture Review', time: '15:30', endTime: '16:30', organizer: 'Alex Rivera', attendees: 'Alex Rivera (CTO), Backend Team, DevOps', location: 'Teams', type: 'teams' },
  ],
  emailsInbox: [
    { id: 'ei-t1', time: '07:15', from: 'CEO Maria Lopez', subject: 'Board Meeting Prep — Urgent Review', folder: 'Inbox-Focused', priority: 'high', readStatus: 'unread', addressed: 'direct', summary: 'Need the product section of the board deck reviewed by 3 PM today. Key focus: revenue metrics, product adoption, Q2 roadmap.', myReply: 'yes', replySummary: 'Sent draft product section with updated revenue metrics and roadmap highlights.', attachment: 'yes' },
    { id: 'ei-t2', time: '07:30', from: 'CEO Maria Lopez', subject: 'FW: Investor Questions — Need Answers', folder: 'Inbox-Focused', priority: 'high', readStatus: 'unread', addressed: 'direct', summary: 'Investor board members asking about AI strategy and competitive positioning. Draft talking points by tomorrow morning.', myReply: 'no', attachment: 'no' },
    { id: 'ei-t3', time: '08:45', from: 'Sarah Chen (PM)', subject: 'Sprint 15 — Proposed Stories', folder: 'Inbox-Focused', priority: 'direct', readStatus: 'read', addressed: 'direct', summary: '47 story points total. Flagged 3 high-risk items needing technical design review first.', myReply: 'yes', replySummary: 'Approved with adjustments: moved 2 stories to next sprint, added 1 tech debt item.', attachment: 'yes' },
    { id: 'ei-t4', time: '09:00', from: 'Alex Rivera (CTO)', subject: 'Architecture Review Pre-Read', folder: 'Inbox-Focused', priority: 'high', readStatus: 'read', addressed: 'direct', summary: 'Microservices migration proposal. Key decision: event-driven vs request-response for service communication.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-t5', time: '09:30', from: 'Marketing Team', subject: 'Product Launch Campaign — Review Needed', folder: 'Inbox-Other', priority: 'cc', readStatus: 'unread', addressed: 'cc', summary: 'Campaign materials for v3 mobile app launch ready for review. Launch date: April 15.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-t6', time: '10:15', from: 'David Kim (Engineering)', subject: 'Q2 Headcount — Updated Numbers', folder: 'Inbox-Focused', priority: 'high', readStatus: 'read', addressed: 'direct', summary: 'Revised hiring plan: 4 senior engineers, 1 DevOps, 1 data engineer. Budget impact analysis attached.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-t7', time: '11:00', from: 'CloudScale Inc', subject: 'Contract Ready for Signature', folder: 'Inbox-Other', priority: 'normal', readStatus: 'read', addressed: 'direct', summary: 'Final contract: 3-year commitment, 15% discount, dedicated support. DocuSign link included.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-t8', time: '13:00', from: 'Legal Team', subject: 'NDA Review — Partner Integration', folder: 'Inbox-Focused', priority: 'direct', readStatus: 'unread', addressed: 'direct', summary: 'Please review NDA for partnership integration with DataFlow Inc. Comments due by Thursday.', myReply: 'no', attachment: 'yes' },
  ],
  emailsSent: [
    { id: 'es-t1', time: '09:45', to: 'CEO Maria Lopez', subject: 'RE: Board Meeting Prep — Product Section Draft', summary: 'Sent draft product section with updated revenue metrics, adoption rates, and roadmap highlights.', importance: 'high', commitment: 'no', attachment: 'yes' },
    { id: 'es-t2', time: '10:05', to: 'Sarah Chen (PM)', subject: 'RE: Sprint 15 — Approved with Notes', summary: 'Approved sprint backlog with adjustments: moved 2 stories to next sprint, added 1 tech debt item.', importance: 'normal', commitment: 'yes', owner: 'Sarah Chen', deadline: getDateString(0), attachment: 'no' },
    { id: 'es-t3', time: '11:20', to: 'CloudScale Inc', subject: 'Contract Signed — Welcome Aboard', summary: 'Executed the 3-year enterprise contract via DocuSign.', importance: 'normal', commitment: 'no', attachment: 'no' },
    { id: 'es-t4', time: '16:00', to: 'Team Leads', subject: 'Q2 Planning Kickoff — Agenda & Pre-Work', summary: 'Shared agenda for Q2 planning sessions next Monday. Pre-work: each team to draft top 3 OKRs.', importance: 'normal', commitment: 'yes', owner: 'Team Leads', deadline: getDateString(4), attachment: 'yes' },
  ],
};

const tomorrowData: DayData = {
  date: getDateString(1),
  schedule: [
    { id: 's-m1', time: '08:00', endTime: '08:15', title: 'Daily Standup', type: 'meeting' },
    { id: 's-m2', time: '08:30', endTime: '10:00', title: 'Deep Work — AI Strategy Document', type: 'focus', description: 'Draft investor talking points' },
    { id: 's-m3', time: '10:00', endTime: '10:30', title: 'Coffee Chat with New Hire', type: 'break' },
    { id: 's-m4', time: '11:00', endTime: '12:00', title: 'Client Demo — Enterprise Dashboard', type: 'meeting', description: 'Key prospect' },
    { id: 's-m5', time: '12:30', endTime: '13:30', title: 'Team Lunch', type: 'break' },
    { id: 's-m6', time: '14:00', endTime: '15:00', title: 'Q2 Planning Workshop — Part 1', type: 'meeting' },
    { id: 's-m7', time: '15:30', endTime: '17:00', title: 'Architecture Review — Part 2', type: 'meeting', description: 'Finalize decisions' },
  ],
  tasks: [
    { id: 't-m1', title: 'Draft AI strategy talking points for investors', priority: 'high', status: 'open', dueDate: getDateString(1), source: 'Inbox: Investor Questions, Mar 24', owner: 'You', daysOpen: 0, category: 'Strategy', taskType: 'action' },
    { id: 't-m2', title: 'Prepare client demo environment', priority: 'high', status: 'open', dueDate: getDateString(1), source: 'Outlook To-Do', owner: 'You', daysOpen: 0, category: 'Sales', taskType: 'action' },
    { id: 't-m3', title: 'Review NDA and send comments to Legal', priority: 'medium', status: 'open', dueDate: getDateString(3), source: 'Inbox: NDA Review, Mar 24', owner: 'You', daysOpen: 0, category: 'Legal', taskType: 'deadline' },
    { id: 't-m4', title: 'Reply to CEO re: Investor Questions — sent yesterday, no response yet', priority: 'high', status: 'open', source: 'Inbox: Investor Questions, Mar 24', owner: 'You', daysOpen: 1, category: 'Executive', taskType: 'followup' },
    { id: 't-m5', title: 'Confirm dinner reservation for Friday', priority: 'low', status: 'open', source: 'Chat', owner: 'You', category: 'Personal', taskType: 'personal' },
  ],
  meetings: [
    { id: 'm-m1', title: 'Daily Standup', time: '08:00', endTime: '08:15', organizer: 'Sarah Chen', attendees: 'Sarah Chen, Mike Ross, Lisa Park', location: 'Teams', type: 'teams' },
    { id: 'm-m2', title: 'Client Demo — Enterprise Dashboard', time: '11:00', endTime: '12:00', organizer: 'Rachel Green', attendees: 'Client: John Park (Acme Corp), Sales: Rachel Green, You', location: 'Teams', type: 'teams' },
    { id: 'm-m3', title: 'Q2 Planning Workshop — Part 1', time: '14:00', endTime: '15:00', organizer: 'You', attendees: 'All Product Leads, Engineering Leads, Design Leads', location: 'Conference Room A', type: 'in-person' },
  ],
  emailsInbox: [
    { id: 'ei-m1', time: '08:00', from: 'Rachel Green (Sales)', subject: 'Client Demo Prep — Acme Corp Notes', folder: 'Inbox-Focused', priority: 'direct', readStatus: 'unread', addressed: 'direct', summary: 'Key decision makers: CTO and Head of Product. Most interested in analytics dashboard and API integrations. Competitive concern: also evaluating DataFlow.', myReply: 'no', attachment: 'yes' },
    { id: 'ei-m2', time: '09:00', from: 'Alex Rivera (CTO)', subject: 'Architecture Decisions — Pre-Meeting Summary', folder: 'Inbox-Focused', priority: 'high', readStatus: 'unread', addressed: 'direct', summary: 'Event-driven communication approved, Kafka as message broker, 6-month migration timeline.', myReply: 'no', attachment: 'no' },
  ],
  emailsSent: [],
};

export function getDemoData(): Record<string, DayData> {
  return {
    [getDateString(-1)]: yesterdayData,
    [getDateString(0)]: todayData,
    [getDateString(1)]: tomorrowData,
  };
}

export function getDayDataForView(view: DayView, data: Record<string, DayData>, city: string = ''): DayData {
  const offset = view === 'yesterday' ? -1 : view === 'tomorrow' ? 1 : 0;
  const dateKey = getDateStr(city, offset);
  return data[dateKey] || {
    date: dateKey,
    schedule: [],
    tasks: [],
    meetings: [],
    emailsInbox: [],
    emailsSent: [],
  };
}

export function getDateString2(offset: number): string {
  return getDateString(offset);
}
