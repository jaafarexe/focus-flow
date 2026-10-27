import React, { useState } from 'react';
import { SoundEffect, TimerSettings } from '../types';
import { playSound } from '../utils/audio';
import { X, Volume2, Bell, Clock, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSaveSettings: (settings: TimerSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<TimerSettings>({ ...settings });
  const [testedSound, setTestedSound] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleTestSound = () => {
    playSound(formData.soundNotification, formData.volume);
    setTestedSound(true);
    setTimeout(() => setTestedSound(false), 1200);
  };

  const handleRequestNotif = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const res = await Notification.requestPermission();
        setNotifPermission(res);
        if (res === 'granted') {
          setFormData((prev) => ({ ...prev, enableDesktopNotifications: true }));
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const soundOptions: Array<{ id: SoundEffect; label: string }> = [
    { id: 'chime', label: 'Melodic Chime' },
    { id: 'bell', label: 'Cathedral Bell' },
    { id: 'bowl', label: 'Tibetan Singing Bowl' },
    { id: 'marimba', label: 'Acoustic Marimba' },
    { id: 'digital', label: 'Digital Chime' },
    { id: 'none', label: 'Mute (Silent)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Timer Settings</h3>
                <p className="text-xs text-slate-500">Configure durations and notification preferences</p>
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

          <div className="p-5 space-y-6">
            {/* Durations section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Durations (Minutes)</span>
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Focus</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.focusDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, focusDuration: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={formData.shortBreakDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortBreakDuration: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Long Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.longBreakDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longBreakDuration: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cycles and Goals */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Long Break Interval
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={formData.longBreakInterval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longBreakInterval: Math.max(2, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">sessions</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Target Goal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.dailyGoalSessions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyGoalSessions: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-semibold font-tabular bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">sessions</span>
                </div>
              </div>
            </div>

            {/* Sound Notifications */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Notifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alarm Sound</label>
                  <select
                    value={formData.soundNotification}
                    onChange={(e) =>
                      setFormData({ ...formData, soundNotification: e.target.value as SoundEffect })
                    }
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  >
                    {soundOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Volume</label>
                    <span className="text-xs font-tabular text-slate-500">{formData.volume}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 whitespace-nowrap"
                    >
                      {testedSound ? 'Playing...' : 'Test'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticking sound toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Soft Ticking Sound</span>
                  <p className="text-[11px] text-slate-500">Play subtle rhythm tick while timer runs</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableTicking}
                  onChange={(e) => setFormData({ ...formData, enableTicking: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Automation & System Notifications */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Automation & Desktop</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Auto-start Breaks</span>
                  <p className="text-[11px] text-slate-500">Start break countdown immediately after focus session</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoStartBreaks}
                  onChange={(e) => setFormData({ ...formData, autoStartBreaks: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Auto-start Focus Sessions</span>
                  <p className="text-[11px] text-slate-500">Start focus timer immediately after break ends</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoStartFocus}
                  onChange={(e) => setFormData({ ...formData, autoStartFocus: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Desktop notification request */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Browser Desktop Notifications</span>
                  <p className="text-[11px] text-slate-500">
                    Status: <span className="capitalize font-medium">{notifPermission}</span>
                  </p>
                </div>
                {notifPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleRequestNotif}
                    className="px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                  >
                    Enable
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Allowed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
