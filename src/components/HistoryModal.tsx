import React from 'react';
import { SessionRecord } from '../types';
import { X, Clock, Trash2, Calendar } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionRecord[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: 'Recent', time: '' };
    }
  };

  const getBadgeClass = (mode: string) => {
    switch (mode) {
      case 'focus':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'shortBreak':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'longBreak':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Session History</h3>
              <p className="text-xs text-slate-500">{history.length} recorded focus sessions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600">No session history yet</p>
              <p className="text-xs text-slate-400 mt-1">Completed focus sessions will appear here.</p>
            </div>
          ) : (
            history.map((item) => {
              const { date, time } = formatTimestamp(item.completedAt);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeClass(
                          item.mode
                        )}`}
                      >
                        {item.mode === 'focus'
                          ? 'Focus'
                          : item.mode === 'shortBreak'
                          ? 'Short Break'
                          : 'Long Break'}
                      </span>
                      <span className="text-xs font-tabular font-bold text-slate-800">
                        {item.durationMinutes} min
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 truncate">
                      {item.taskTitle || 'Open focus session'}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-tabular shrink-0 ml-3">
                    <div>{date}</div>
                    <div className="text-[10px]">{time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl shrink-0">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your session history?')) {
                  onClearHistory();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
