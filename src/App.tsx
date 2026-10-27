/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TimerMode, TaskItem, TimerSettings, FocusStats } from './types';
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadStats,
  loadActiveTaskId,
  saveActiveTaskId,
  recordCompletedSession,
  saveStats,
} from './utils/storage';
import { playSound, playTick } from './utils/audio';
import { Navbar } from './components/Navbar';
import { ModeSelector } from './components/ModeSelector';
import { CircularTimer } from './components/CircularTimer';
import { TaskList } from './components/TaskList';
import { StatsPanel } from './components/StatsPanel';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { Sparkles, Command, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => loadSettings());
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => loadActiveTaskId());
  const [stats, setStats] = useState<FocusStats>(() => loadStats());

  const [mode, setMode] = useState<TimerMode>('focus');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => loadSettings().focusDuration * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(() => loadSettings().focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const [activeSection, setActiveSection] = useState<'timer' | 'tasks' | 'stats' | 'history'>('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Drift-resistant timer reference
  const targetEndTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Active task object
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Duration in seconds for a given mode
  const getDurationForMode = useCallback(
    (targetMode: TimerMode, customSettings?: TimerSettings) => {
      const cfg = customSettings || settings;
      switch (targetMode) {
        case 'focus':
          return cfg.focusDuration * 60;
        case 'shortBreak':
          return cfg.shortBreakDuration * 60;
        case 'longBreak':
          return cfg.longBreakDuration * 60;
      }
    },
    [settings]
  );

  // Update page title with remaining time
  useEffect(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeName = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = isRunning ? `(${timeStr}) ${modeName} — Focus Flow` : 'Focus Flow — Pomodoro Focus Timer';
  }, [remainingSeconds, mode, isRunning]);

  // Mode change handler
  const handleSelectMode = useCallback(
    (newMode: TimerMode, shouldAutoStart = false) => {
      setIsRunning(false);
      setMode(newMode);
      const secs = getDurationForMode(newMode);
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      targetEndTimeRef.current = null;

      if (shouldAutoStart) {
        setIsRunning(true);
        targetEndTimeRef.current = Date.now() + secs * 1000;
      }
    },
    [getDurationForMode]
  );

  // Play/Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      targetEndTimeRef.current = null;
    } else {
      setIsRunning(true);
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    }
  }, [isRunning, remainingSeconds]);

  // Reset current timer
  const handleReset = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    const secs = getDurationForMode(mode);
    setRemainingSeconds(secs);
    setTotalSeconds(secs);
  }, [getDurationForMode, mode]);

  // Handle completion of a session
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;

    // 1. Play sound
    if (!isMuted && settings.soundNotification !== 'none') {
      playSound(settings.soundNotification, settings.volume);
    }

    // 2. Confetti celebration for focus completion
    if (mode === 'focus') {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#10b981'],
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }

    // 3. Desktop Notification
    if (
      settings.enableDesktopNotifications &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      const title =
        mode === 'focus' ? 'Focus Session Complete! 🎉' : 'Break Finished! ⏰';
      const body =
        mode === 'focus'
          ? 'Great job! Time to take a breather and recharge.'
          : 'Ready to dive back into deep work?';
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch {
        // Notification failed or blocked
      }
    }

    // 4. Record session in stats and local storage
    const durationMins = Math.round(totalSeconds / 60);
    const updatedStats = recordCompletedSession(
      mode,
      durationMins,
      activeTask?.title,
      activeTask?.id
    );
    setStats(updatedStats);

    // 5. Update task completed pomodoro count if in focus mode
    if (mode === 'focus' && activeTaskId) {
      setTasks((prevTasks) => {
        const next = prevTasks.map((t) => {
          if (t.id === activeTaskId) {
            const nextCount = t.completedPomodoros + 1;
            return {
              ...t,
              completedPomodoros: nextCount,
              completed: nextCount >= t.estimatedPomodoros ? true : t.completed,
              completedAt: nextCount >= t.estimatedPomodoros ? Date.now() : t.completedAt,
            };
          }
          return t;
        });
        saveTasks(next);
        return next;
      });
    }

    // 6. Next Mode Transition
    if (mode === 'focus') {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      const isLong = nextCycle % settings.longBreakInterval === 0;
      const nextMode: TimerMode = isLong ? 'longBreak' : 'shortBreak';
      handleSelectMode(nextMode, settings.autoStartBreaks);
    } else {
      // Break finished, go to focus
      handleSelectMode('focus', settings.autoStartFocus);
    }
  }, [
    isMuted,
    settings,
    mode,
    totalSeconds,
    activeTask,
    activeTaskId,
    cycleCount,
    handleSelectMode,
  ]);

  // Skip current session
  const handleSkip = useCallback(() => {
    if (mode === 'focus') {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      const isLong = nextCycle % settings.longBreakInterval === 0;
      handleSelectMode(isLong ? 'longBreak' : 'shortBreak', false);
    } else {
      handleSelectMode('focus', false);
    }
  }, [mode, cycleCount, settings.longBreakInterval, handleSelectMode]);

  // Adjust time (+5m or -1m)
  const handleAdjustTime = useCallback(
    (deltaSeconds: number) => {
      setRemainingSeconds((prev) => {
        const next = Math.max(10, prev + deltaSeconds);
        if (next > totalSeconds) {
          setTotalSeconds(next);
        }
        if (isRunning) {
          targetEndTimeRef.current = Date.now() + next * 1000;
        }
        return next;
      });
    },
    [isRunning, totalSeconds]
  );

  // Timer interval with drift-free timestamp math
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    intervalRef.current = window.setInterval(() => {
      if (!targetEndTimeRef.current) return;
      const now = Date.now();
      const diffMs = targetEndTimeRef.current - now;
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

      // Optional ticking sound
      if (settings.enableTicking && !isMuted) {
        playTick(15);
      }

      if (diffSecs <= 0) {
        setRemainingSeconds(0);
        handleSessionComplete();
      } else {
        setRemainingSeconds(diffSecs);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, handleSessionComplete, settings.enableTicking, isMuted, remainingSeconds]);

  // Global Keyboard shortcuts (Space = Play/Pause, R = Reset, S = Skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleReset, handleSkip]);

  // Task actions
  const handleAddTask = (title: string, estimatedPomodoros: number) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      estimatedPomodoros,
      completedPomodoros: 0,
      createdAt: Date.now(),
    };
    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    saveTasks(nextTasks);

    // If no active task, set this one
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
      saveActiveTaskId(newTask.id);
    }
  };

  const handleToggleCompleteTask = (taskId: string) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : undefined,
        };
      }
      return t;
    });
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(nextTasks);
    saveTasks(nextTasks);
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      saveActiveTaskId(null);
    }
  };

  const handleUpdateTask = (taskId: string, title: string, estimatedPomodoros: number) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, title, estimatedPomodoros };
      }
      return t;
    });
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const handleClearCompleted = () => {
    const nextTasks = tasks.filter((t) => !t.completed);
    setTasks(nextTasks);
    saveTasks(nextTasks);
    if (activeTask && activeTask.completed) {
      setActiveTaskId(null);
      saveActiveTaskId(null);
    }
  };

  const handleSelectActiveTask = (id: string | null) => {
    setActiveTaskId(id);
    saveActiveTaskId(id);
  };

  // Settings update
  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);

    // If timer is not currently running, update the duration of current mode
    if (!isRunning) {
      const newSecs = getDurationForMode(mode, newSettings);
      setRemainingSeconds(newSecs);
      setTotalSeconds(newSecs);
    }
  };

  // Clear session history
  const handleClearHistory = () => {
    const updated: FocusStats = {
      ...stats,
      history: [],
    };
    setStats(updated);
    saveStats(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec === 'history') {
            setIsHistoryOpen(true);
          }
        }}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        streak={stats.currentStreak}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Timer Hero Card */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col items-center relative overflow-hidden transition-all">
              {/* Mode Selector */}
              <div className="mb-6">
                <ModeSelector
                  currentMode={mode}
                  onSelectMode={(m) => handleSelectMode(m, false)}
                  settings={settings}
                  isRunning={isRunning}
                />
              </div>

              {/* Large Circular Timer */}
              <CircularTimer
                mode={mode}
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                isRunning={isRunning}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onSkip={handleSkip}
                onAdjustTime={handleAdjustTime}
                activeTask={activeTask}
                cycleCount={cycleCount}
                longBreakInterval={settings.longBreakInterval}
              />

              {/* Keyboard shortcuts helper kicker */}
              <div className="mt-8 pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-6 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-tabular font-semibold">
                    Space
                  </kbd>
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-tabular font-semibold">
                    R
                  </kbd>
                  <span>Reset</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-tabular font-semibold">
                    S
                  </kbd>
                  <span>Skip</span>
                </div>
              </div>
            </div>

            {/* Quick Tips / Flow Guidance */}
            <div className="bg-white/70 rounded-xl border border-slate-200/70 p-4 text-xs text-slate-600 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Pomodoro Technique Pro Tip:</span>{' '}
                Focus with singular intent on your chosen task for 25 minutes. Step completely away from your screen during short breaks to maximize cognitive replenishment.
              </div>
            </div>
          </div>

          {/* Right Column: Performance Stats + Tasks Manager */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Session Stats Panel */}
            <StatsPanel
              stats={stats}
              settings={settings}
              onViewHistory={() => setIsHistoryOpen(true)}
            />

            {/* Focus Tasks List */}
            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onSelectActiveTask={handleSelectActiveTask}
              onAddTask={handleAddTask}
              onToggleCompleteTask={handleToggleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-400 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Focus Flow &middot; Deep focus pomodoro timer</span>
          <span>All data safely stored in your browser</span>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={stats.history}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
