import React from 'react';
import { TimerMode, TimerSettings } from '../types';
import { Flame, Coffee, Palmtree } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
  settings: TimerSettings;
  isRunning: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  settings,
  isRunning,
}) => {
  const modes: Array<{
    id: TimerMode;
    label: string;
    duration: number;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      id: 'focus',
      label: 'Focus',
      duration: settings.focusDuration,
      icon: <Flame className="w-3.5 h-3.5" />,
      activeClass: 'bg-white text-rose-700 shadow-xs border-slate-200/60',
    },
    {
      id: 'shortBreak',
      label: 'Short Break',
      duration: settings.shortBreakDuration,
      icon: <Coffee className="w-3.5 h-3.5" />,
      activeClass: 'bg-white text-emerald-700 shadow-xs border-slate-200/60',
    },
    {
      id: 'longBreak',
      label: 'Long Break',
      duration: settings.longBreakDuration,
      icon: <Palmtree className="w-3.5 h-3.5" />,
      activeClass: 'bg-white text-sky-700 shadow-xs border-slate-200/60',
    },
  ];

  return (
    <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl gap-1">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 border border-transparent ${
              isActive
                ? mode.activeClass
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span className={isActive ? 'opacity-100' : 'opacity-60'}>{mode.icon}</span>
            <span>{mode.label}</span>
            <span
              className={`text-[11px] font-tabular ${
                isActive ? 'opacity-80' : 'text-slate-400'
              }`}
            >
              {mode.duration}m
            </span>
          </button>
        );
      })}
    </div>
  );
};
