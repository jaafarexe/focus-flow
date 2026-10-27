import React from 'react';
import { TimerMode, TaskItem } from '../types';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus } from 'lucide-react';

interface CircularTimerProps {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  activeTask?: TaskItem | null;
  cycleCount: number;
  longBreakInterval: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  mode,
  remainingSeconds,
  totalSeconds,
  isRunning,
  onTogglePlay,
  onReset,
  onSkip,
  onAdjustTime,
  activeTask,
  cycleCount,
  longBreakInterval,
}) => {
  // SVG geometry
  const radius = 124;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, (totalSeconds - remainingSeconds) / totalSeconds)) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Formatting MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Mode-based styles
  const modeConfig = {
    focus: {
      colorName: 'rose',
      strokeColor: '#f43f5e', // rose-500
      strokeBg: '#ffe4e6', // rose-100
      accentGlow: 'rgba(244, 63, 94, 0.12)',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
      label: 'Focus Session',
      sublabel: activeTask ? activeTask.title : 'Deep work & concentration',
    },
    shortBreak: {
      colorName: 'emerald',
      strokeColor: '#10b981', // emerald-500
      strokeBg: '#d1fae5', // emerald-100
      accentGlow: 'rgba(16, 185, 129, 0.12)',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
      label: 'Short Break',
      sublabel: 'Stretch, breathe, hydrate',
    },
    longBreak: {
      colorName: 'sky',
      strokeColor: '#0284c7', // sky-600
      strokeBg: '#e0f2fe', // sky-100
      accentGlow: 'rgba(2, 132, 199, 0.12)',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200',
      label: 'Long Rest',
      sublabel: 'Take a walk, rest your eyes',
    },
  }[mode];

  // Current session number in cycle (1 to longBreakInterval)
  const currentInCycle = (cycleCount % longBreakInterval) + 1;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Active task pill or status kicker */}
      <div className="mb-4 text-center max-w-sm px-4 min-h-[30px] flex items-center justify-center">
        {activeTask ? (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-xs truncate max-w-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-500 shrink-0">Active task:</span>
            <span className="font-semibold text-slate-800 truncate">{activeTask.title}</span>
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-400">
            <span>{modeConfig.sublabel}</span>
          </div>
        )}
      </div>

      {/* Circular Timer Ring */}
      <div className="relative flex items-center justify-center">
        {/* Ambient subtle backglow when running */}
        {isRunning && (
          <div
            className="absolute inset-4 rounded-full transition-opacity duration-1000 blur-2xl pointer-events-none"
            style={{ backgroundColor: modeConfig.accentGlow }}
          />
        )}

        <svg
          className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform drop-shadow-xs"
          viewBox="0 0 280 280"
        >
          {/* Background circle track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={modeConfig.strokeBg}
            strokeWidth={strokeWidth}
          />

          {/* Animated active progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={modeConfig.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="timer-ring-circle"
          />
        </svg>

        {/* Central Display Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            {modeConfig.label}
          </span>

          {/* Massive, bold tabular time */}
          <div className="font-tabular text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-3">
            {formattedTime}
          </div>

          {/* Cycle dots indicator (4 sessions before long break) */}
          {mode === 'focus' && (
            <div className="flex items-center gap-1.5 mb-2" title={`Session ${currentInCycle} of ${longBreakInterval} in current cycle`}>
              {Array.from({ length: longBreakInterval }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentInCycle
                      ? 'bg-rose-500 scale-110'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="text-[11px] font-medium text-slate-400">
            {Math.round(progress * 100)}% complete
          </div>
        </div>
      </div>

      {/* Main Controls row */}
      <div className="mt-7 flex items-center justify-center gap-3">
        {/* Reset button */}
        <button
          onClick={onReset}
          title="Reset timer (R)"
          className="p-3 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all shadow-xs active:scale-95"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Primary Start / Pause button */}
        <button
          onClick={onTogglePlay}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2.5 transition-all shadow-md active:scale-95 ${modeConfig.btnBg}`}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>START</span>
            </>
          )}
        </button>

        {/* Skip to Next Mode button */}
        <button
          onClick={onSkip}
          title="Skip to next session (S)"
          className="p-3 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all shadow-xs active:scale-95"
          aria-label="Skip session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Fine-tuning +/- buttons */}
      <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => onAdjustTime(-60)}
          disabled={remainingSeconds <= 60}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
          title="Subtract 1 minute"
        >
          <Minus className="w-3 h-3" />
          <span>1m</span>
        </button>
        <button
          onClick={() => onAdjustTime(300)}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/70 transition-colors flex items-center gap-1"
          title="Add 5 minutes"
        >
          <Plus className="w-3 h-3" />
          <span>5m</span>
        </button>
      </div>
    </div>
  );
};
