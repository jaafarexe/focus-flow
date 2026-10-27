export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type SoundEffect = 'bell' | 'chime' | 'bowl' | 'marimba' | 'digital' | 'none';

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // number of focus sessions before a long break
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundNotification: SoundEffect;
  volume: number; // 0 to 100
  enableTicking: boolean;
  enableDesktopNotifications: boolean;
  dailyGoalSessions: number;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: number;
  completedAt?: number;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  completedAt: string; // ISO date string
  taskId?: string;
  taskTitle?: string;
}

export interface DailyStats {
  [dateKey: string]: { // YYYY-MM-DD
    sessionsCompleted: number;
    focusMinutes: number;
  };
}

export interface FocusStats {
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  bestStreak: number;
  dailyStats: DailyStats;
  history: SessionRecord[];
}
