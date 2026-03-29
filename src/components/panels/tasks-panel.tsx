'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { Task } from '@/lib/types';
import { ListTodo, Check, CheckSquare, Clock, Reply, Star, ChevronRight, User, ExternalLink, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getDateStr, formatDate, DateFormatOption } from '@/lib/city-time';

interface TasksPanelProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  completed: number;
  total: number;
  onAddClick?: () => void;
  city?: string;
  dateFormat?: string;
}

const taskTypeIcons: Record<Task['taskType'], typeof CheckSquare> = {
  action: CheckSquare,
  deadline: Clock,
  followup: Reply,
  personal: Star,
};

const taskTypeLabels: Record<Task['taskType'], string> = {
  action: 'Actions',
  deadline: 'Deadlines',
  followup: 'Follow-ups',
  personal: 'Personal',
};

function getDaysOpenColor(days: number | null | undefined): { bg: string; text: string } | null {
  if (days === null || days === undefined) return null;
  if (days >= 5) return { bg: 'rgba(244,114,182,0.15)', text: 'var(--accent-pink)' };
  if (days >= 3) return { bg: 'rgba(251,191,36,0.15)', text: 'var(--accent-amber)' };
  return null;
}

const AddButton = ({ onClick }: { onClick?: () => void }) => onClick ? (
  <motion.button
    onClick={onClick}
    className="w-6 h-6 rounded-lg glass-static flex items-center justify-center cursor-pointer"
    style={{ color: 'var(--accent-purple)' }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    title="Add task"
  >
    <Plus className="w-3.5 h-3.5" />
  </motion.button>
) : null;

export function TasksPanel({ tasks, onToggle, completed, total, onAddClick, city = '', dateFormat }: TasksPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Urgency score: surfaces the most critical tasks automatically
  const todayStr = getDateStr(city);
  function urgencyScore(t: Task): number {
    if (t.status === 'done') return -1000; // always at bottom
    let score = 0;
    // Priority weight
    score += t.priority === 'high' ? 30 : t.priority === 'medium' ? 15 : 5;
    // Days open escalation
    score += (t.daysOpen ?? 0) * 1.5;
    // Due today bonus
    if (t.dueDate === todayStr) score += 10;
    // Overdue penalty (highest urgency)
    if (t.status === 'overdue') score += 25;
    // Due date in the past
    if (t.dueDate && t.dueDate < todayStr) score += 20;
    return score;
  }

  // Group by taskType, sort within groups by urgency score descending
  const grouped = (['action', 'deadline', 'followup', 'personal'] as Task['taskType'][])
    .map(type => ({
      type,
      label: taskTypeLabels[type],
      Icon: taskTypeIcons[type],
      tasks: tasks
        .filter(t => t.taskType === type)
        .sort((a, b) => urgencyScore(b) - urgencyScore(a)),
    }))
    .filter(g => g.tasks.length > 0);

  const overdue = tasks.filter(t => t.status === 'overdue').length;

  return (
    <CollapsiblePanel
      id="tasks"
      title="Tasks & To-Dos"
      icon={ListTodo}
      iconColor="var(--accent-purple)"
      badge={overdue > 0 ? `${overdue} overdue` : `${completed}/${total}`}
      badgeColor={overdue > 0 ? 'var(--accent-pink)' : 'var(--accent-purple)'}
      gradient="purple"
      headerAction={<AddButton onClick={onAddClick} />}
    >
      <div className="space-y-4">
        {grouped.map(group => (
          <div key={group.type}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2">
              <group.Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {group.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                ({group.tasks.length})
              </span>
            </div>

            {/* Task cards */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {group.tasks.map((task, i) => {
                  const isExpanded = expandedId === task.id;
                  const isDone = task.status === 'done';
                  const isOverdue = task.status === 'overdue';
                  const daysColor = getDaysOpenColor(task.daysOpen);

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isDone ? 0.45 : 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.02 }}
                      className="group rounded-xl p-2.5 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isOverdue ? 'rgba(244,114,182,0.06)' : isDone ? 'rgba(52,211,153,0.04)' : 'transparent',
                        borderLeft: isOverdue ? '3px solid var(--accent-pink)' : isDone ? '3px solid var(--accent-green)' : '3px solid transparent',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : task.id)}
                      onMouseEnter={(e) => {
                        if (!isOverdue) e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isOverdue) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <motion.div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            borderColor: isDone ? 'var(--accent-green)' : isOverdue ? 'var(--accent-pink)' : 'var(--glass-border-hover)',
                            backgroundColor: isDone ? 'var(--accent-green)' : 'transparent',
                          }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task.id);
                          }}
                        >
                          <AnimatePresence>
                            {isDone && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium truncate"
                              style={{
                                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: isDone ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <StatusBadge variant={task.priority} />
                            {task.owner && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                                <User className="w-2.5 h-2.5" />
                                {task.owner.split(' ')[0]}
                              </span>
                            )}
                            {daysColor && task.daysOpen !== null && task.daysOpen !== undefined && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-medium"
                                style={{ backgroundColor: daysColor.bg, color: daysColor.text }}>
                                {task.daysOpen}d
                              </span>
                            )}
                            {task.category && (
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {task.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 mt-1"
                        >
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                        </motion.div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 pt-2 ml-8 border-t space-y-1" style={{ borderColor: 'var(--glass-border)' }}>
                              {task.source && (
                                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Source:</span> {task.source}
                                </p>
                              )}
                              {task.dueDate && (
                                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Due:</span> {formatDate(task.dueDate!, dateFormat as DateFormatOption)}
                                </p>
                              )}
                              {task.daysOpen !== null && task.daysOpen !== undefined && (
                                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Days open:</span> {task.daysOpen}
                                </p>
                              )}
                              {task.link && (
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                                  style={{ color: 'var(--accent-blue)' }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Open source
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No tasks
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
