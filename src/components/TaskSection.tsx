import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckCircle, Tag, Target, ChevronRight, X } from 'lucide-react';
import { Task } from '../types';

interface TaskSectionProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (task: Omit<Task, 'id' | 'completedPomodoros' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSetActiveTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('Work');
  const [newEstPomodoros, setNewEstPomodoros] = useState(2);

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      estPomodoros: Math.max(1, newEstPomodoros),
    });

    setNewTitle('');
    setNewEstPomodoros(2);
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const categories: Task['category'][] = ['Work', 'Study', 'Code', 'Design', 'Life'];

  const categoryColors: Record<Task['category'], string> = {
    Work: 'cat-work',
    Study: 'cat-study',
    Code: 'cat-code',
    Design: 'cat-design',
    Life: 'cat-life',
  };

  const totalEst = tasks.reduce((sum, t) => sum + t.estPomodoros, 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + t.completedPomodoros, 0);

  return (
    <section className="task-section">
      <div className="task-header">
        <div className="task-header-title">
          <h2>Focus Tasks</h2>
          <span className="task-summary-badge">
            {totalCompleted} / {totalEst} 🍅 Done
          </span>
        </div>

        <div className="task-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Done ({tasks.filter(t => t.completed).length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks">
            <p>No tasks in this view. Add a task to start tracking your focus!</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isActive = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`task-card ${task.completed ? 'completed' : ''} ${isActive ? 'is-active-task' : ''}`}
              >
                <div className="task-card-left">
                  <button
                    className={`checkbox-btn ${task.completed ? 'checked' : ''}`}
                    onClick={() => onToggleTask(task.id)}
                    title={task.completed ? "Mark incomplete" : "Mark completed"}
                  >
                    {task.completed && <Check size={14} />}
                  </button>

                  <div className="task-info">
                    <div className="task-title-row">
                      <span className="task-title">{task.title}</span>
                      <span className={`category-tag ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                    </div>

                    <div className="task-progress-row">
                      <span className="pomo-count-text">
                        🍅 {task.completedPomodoros} of {task.estPomodoros} Pomodoros
                      </span>
                    </div>
                  </div>
                </div>

                <div className="task-card-right">
                  {!task.completed && (
                    <button
                      className={`active-toggle-btn ${isActive ? 'active-task' : ''}`}
                      onClick={() => onSetActiveTask(isActive ? null : task.id)}
                      title={isActive ? "Unselect as active task" : "Set as active focus task"}
                    >
                      <Target size={14} />
                      <span>{isActive ? 'Focusing' : 'Focus'}</span>
                    </button>
                  )}

                  <button
                    className="delete-task-btn"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Form / Button */}
      {isAdding ? (
        <form className="add-task-form" onSubmit={handleSubmitNewTask}>
          <div className="form-row">
            <input
              type="text"
              placeholder="What are you working on?"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="task-input"
              autoFocus
              required
            />
          </div>

          <div className="form-controls-row">
            <div className="category-select-group">
              <label>Category:</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Task['category'])}
                className="category-select"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="est-pomo-group">
              <label>Est. Pomodoros:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newEstPomodoros}
                onChange={e => setNewEstPomodoros(parseInt(e.target.value) || 1)}
                className="pomo-input"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                Add Task
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button className="add-task-trigger" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          <span>Add New Task</span>
        </button>
      )}
    </section>
  );
};
