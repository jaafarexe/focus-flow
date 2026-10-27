import React from 'react';
import { FocusStats, TimerSettings } from '../types';
import { formatDateKey, getTodayDateKey } from '../utils/storage';
import { Flame, Clock, Trophy, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  stats: FocusStats;
  settings: TimerSettings;
  onViewHistory: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  settings,
  onViewHistory,
}) => {
  const todayKey = getTodayDateKey();
  const todayData = stats.dailyStats[todayKey] || { sessionsCompleted: 0, focusMinutes: 0 };
  const dailyGoal = settings.dailyGoalSessions || 8;
  const goalProgress = Math.min(100, Math.round((todayData.sessionsCompleted / dailyGoal) * 100));

  // Compute 7-day activity glance
  const last7Days: Array<{ dateKey: string; dayLabel: string; sessions: number; isToday: boolean }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const count = stats.dailyStats[key]?.sessionsCompleted || 0;
    last7Days.push({
      dateKey: key,
      dayLabel,
      sessions: count,
      isToday: key === todayKey,
    });
  }

  // Format minutes into hours + minutes
  const formatMins = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Session Performance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time focus metrics and daily consistency
          </p>
        </div>
        <button
          onClick={onViewHistory}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          View Log
        </button>
      </div>

      {/* 3 Core KPI Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Metric 1: Today's Sessions */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today</span>
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-tabular">
            {todayData.sessionsCompleted}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            of {dailyGoal} goal sessions
          </div>
        </div>

        {/* Metric 2: Total Focus Minutes */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Focus Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-tabular">
            {formatMins(todayData.focusMinutes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate font-tabular">
            {formatMins(stats.totalFocusMinutes)} all-time
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-tabular flex items-baseline gap-1">
            <span>{stats.currentStreak}</span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-tabular">
            <Trophy className="w-3 h-3 text-amber-600 inline" />
            <span>Best: {stats.bestStreak}d</span>
          </div>
        </div>
      </div>

      {/* Daily Goal Progress Bar */}
      <div className="mb-5 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">Daily Target Progress</span>
          <span className="font-tabular font-bold text-slate-900">{goalProgress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>

      {/* Last 7 Days Mini Activity Glance */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">Last 7 Days</span>
          <span className="text-[11px]">Daily focus completions</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((day) => {
            const hasSessions = day.sessions > 0;
            return (
              <div
                key={day.dateKey}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-between transition-colors ${
                  day.isToday
                    ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-300'
                    : 'border-slate-200/70 bg-slate-50/50'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {day.dayLabel}
                </span>
                <div
                  className={`my-1 w-6 h-6 rounded-md flex items-center justify-center font-tabular text-xs font-bold ${
                    hasSessions
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'text-slate-300 bg-slate-200/60'
                  }`}
                >
                  {day.sessions}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
