import React from 'react';
import { Settings, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  activeSection: 'timer' | 'tasks' | 'stats' | 'history';
  onSelectSection: (section: 'timer' | 'tasks' | 'stats' | 'history') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  streak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  activeSection,
  onSelectSection,
  isMuted,
  onToggleMute,
  streak,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectSection('timer')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-rose-500 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs group-hover:bg-rose-700 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Focus Flow
            </span>
          </button>

          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-semibold text-amber-800">
              <span className="text-amber-500">🔥</span>
              <span>{streak} day streak</span>
            </div>
          )}
        </div>

        {/* Zone 2: Clean single-line nav tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onSelectSection('timer')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'timer'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => onSelectSection('tasks')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'tasks'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => onSelectSection('stats')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'stats'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => onSelectSection('history')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'history'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            History
          </button>
        </nav>

        {/* Zone 3: Primary action button + quick controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
