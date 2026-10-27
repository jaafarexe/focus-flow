import React, { useState } from 'react';
import { TaskItem } from '../types';
import { Plus, Check, Trash2, Edit2, Target, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  tasks: TaskItem[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string | null) => void;
  onAddTask: (title: string, estimatedPomodoros: number) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, title: string, estimatedPomodoros: number) => void;
  onClearCompleted: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onAddTask,
  onToggleCompleteTask,
  onDeleteTask,
  onUpdateTask,
  onClearCompleted,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newEst, setNewEst] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEst, setEditEst] = useState(1);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newEst);
    setNewTitle('');
    setNewEst(2);
    setIsAdding(false);
  };

  const startEdit = (task: TaskItem) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditEst(task.estimatedPomodoros);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTask(id, editTitle.trim(), editEst);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition-all">
      {/* Header zone */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Focus Tasks</span>
            <span className="text-xs font-semibold text-slate-500 font-tabular bg-slate-100 px-2 py-0.5 rounded-full">
              {completedCount}/{tasks.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a task to focus on it during your session
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Form or Trigger */}
      {isAdding ? (
        <form onSubmit={handleSubmitNew} className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task description
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Design applet navigation flow..."
              autoFocus
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Estimated Pomodoros:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewEst(num)}
                    className={`w-7 h-7 text-xs rounded-md font-semibold transition-colors ${
                      newEst === num
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-4 py-2.5 px-3 border border-dashed border-slate-300 hover:border-rose-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/30 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Focus Task</span>
        </button>
      )}

      {/* Task list items */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No tasks in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'completed'
                ? 'Complete focus sessions to check off your tasks'
                : 'Add a new task to boost your focus momentum'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = activeTaskId === task.id;
            const isEditing = editingId === task.id;

            if (isEditing) {
              return (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2.5"
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Est. Pomodoros:</span>
                      <select
                        value={editEst}
                        onChange={(e) => setEditEst(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white rounded-md"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => onToggleCompleteTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                    aria-label="Toggle task completion"
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Task title and metadata */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm tracking-tight truncate ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : isActive
                          ? 'font-semibold text-slate-900'
                          : 'font-medium text-slate-800'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* Progress indicators */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-tabular">
                        {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                      </span>
                      {isActive && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Active target
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions: active selector, edit, delete */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!task.completed && (
                    <button
                      onClick={() => onSelectActiveTask(isActive ? null : task.id)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'text-rose-600 bg-rose-100 hover:bg-rose-200'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-80 group-hover:opacity-100'
                      }`}
                      title={isActive ? 'Clear active task' : 'Set as active focus task'}
                      aria-label="Set active task"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer controls: clear completed */}
      {completedCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{completedCount} completed {completedCount === 1 ? 'task' : 'tasks'}</span>
          <button
            onClick={onClearCompleted}
            className="text-slate-500 hover:text-rose-600 transition-colors font-medium"
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
};
