import { FocusStats, SessionRecord, TaskItem, TimerMode, TimerSettings } from '../types';

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundNotification: 'chime',
  volume: 80,
  enableTicking: false,
  enableDesktopNotifications: false,
  dailyGoalSessions: 8,
};

const STORAGE_KEYS = {
  SETTINGS: 'focusflow_settings_v1',
  TASKS: 'focusflow_tasks_v1',
  STATS: 'focusflow_stats_v1',
  ACTIVE_TASK: 'focusflow_active_task_id_v1',
};

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Complete prioritized quarterly tasks',
    completed: false,
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'task-2',
    title: 'Review codebase & write unit tests',
    completed: false,
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'task-3',
    title: 'Clear inbox and update daily sprint notes',
    completed: true,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: Date.now() - 10800000,
    completedAt: Date.now() - 1800000,
  },
];

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadActiveTaskId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK) || 'task-1';
  } catch {
    return 'task-1';
  }
}

export function saveActiveTaskId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK);
    }
  } catch (e) {
    console.error('Failed to save active task ID:', e);
  }
}

export function calculateStreaks(dailyStats: Record<string, { sessionsCompleted: number }>): {
  currentStreak: number;
  bestStreak: number;
} {
  const activeDates = new Set(
    Object.keys(dailyStats).filter((date) => dailyStats[date].sessionsCompleted > 0)
  );

  if (activeDates.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Check if today is completed
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  let checkDate = new Date();
  if (!activeDates.has(todayKey)) {
    // If not today, start checking from yesterday
    if (activeDates.has(yesterdayKey)) {
      checkDate = yesterday;
    } else {
      currentStreak = 0;
      checkDate = new Date(0); // won't loop
    }
  }

  if (checkDate.getTime() > 0) {
    while (true) {
      const key = formatDateKey(checkDate);
      if (activeDates.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak across all history
  const sortedDates = Array.from(activeDates).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const time = dateObj.getTime();

    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTime = time;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}

export function loadStats(): FocusStats {
  const todayKey = getTodayDateKey();

  // Create initial demo stats so user sees immediate value
  const initialDaily: Record<string, { sessionsCompleted: number; focusMinutes: number }> = {};
  
  // Seed today with 1 completed session (25 min)
  initialDaily[todayKey] = {
    sessionsCompleted: 1,
    focusMinutes: 25,
  };

  // Seed yesterday and day before for streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  initialDaily[yesterdayKey] = {
    sessionsCompleted: 4,
    focusMinutes: 100,
  };

  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);
  const dayBeforeKey = formatDateKey(dayBefore);
  initialDaily[dayBeforeKey] = {
    sessionsCompleted: 3,
    focusMinutes: 75,
  };

  const initialHistory: SessionRecord[] = [
    {
      id: 'session-seed-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      taskTitle: 'Clear inbox and update daily sprint notes',
    },
  ];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      const streaks = calculateStreaks(initialDaily);
      const initial: FocusStats = {
        totalSessions: 8,
        totalFocusMinutes: 200,
        currentStreak: streaks.currentStreak,
        bestStreak: Math.max(streaks.bestStreak, 5),
        dailyStats: initialDaily,
        history: initialHistory,
      };
      saveStats(initial);
      return initial;
    }

    const parsed: FocusStats = JSON.parse(raw);
    const streaks = calculateStreaks(parsed.dailyStats || {});
    return {
      ...parsed,
      currentStreak: streaks.currentStreak,
      bestStreak: Math.max(parsed.bestStreak || 0, streaks.bestStreak),
      dailyStats: parsed.dailyStats || {},
      history: parsed.history || [],
    };
  } catch {
    const streaks = calculateStreaks(initialDaily);
    return {
      totalSessions: 8,
      totalFocusMinutes: 200,
      currentStreak: streaks.currentStreak,
      bestStreak: 5,
      dailyStats: initialDaily,
      history: initialHistory,
    };
  }
}

export function saveStats(stats: FocusStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function recordCompletedSession(
  mode: TimerMode,
  durationMinutes: number,
  taskTitle?: string,
  taskId?: string
): FocusStats {
  const stats = loadStats();
  const todayKey = getTodayDateKey();

  const record: SessionRecord = {
    id: `session-${Date.now()}`,
    mode,
    durationMinutes,
    completedAt: new Date().toISOString(),
    taskTitle,
    taskId,
  };

  const updatedDaily = { ...stats.dailyStats };
  const currentDay = updatedDaily[todayKey] || { sessionsCompleted: 0, focusMinutes: 0 };

  if (mode === 'focus') {
    updatedDaily[todayKey] = {
      sessionsCompleted: currentDay.sessionsCompleted + 1,
      focusMinutes: currentDay.focusMinutes + durationMinutes,
    };
  }

  const streaks = calculateStreaks(updatedDaily);

  const updatedStats: FocusStats = {
    totalSessions: stats.totalSessions + (mode === 'focus' ? 1 : 0),
    totalFocusMinutes: stats.totalFocusMinutes + (mode === 'focus' ? durationMinutes : 0),
    currentStreak: streaks.currentStreak,
    bestStreak: Math.max(stats.bestStreak, streaks.bestStreak),
    dailyStats: updatedDaily,
    history: [record, ...(stats.history || [])].slice(0, 100),
  };

  saveStats(updatedStats);
  return updatedStats;
}
