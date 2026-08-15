import React from 'react';
import { X, Flame, Clock, Award, Calendar, BarChart3, RotateCcw } from 'lucide-react';
import { AppStats } from '../types';

interface AnalyticsModalProps {
  stats: AppStats;
  onClose: () => void;
  onResetStats: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ stats, onClose, onResetStats }) => {
  const hours = Math.floor(stats.totalFocusMinutes / 60);
  const mins = stats.totalFocusMinutes % 60;

  // Calculate past 7 days breakdown for bar chart
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = stats.dailyStats[dateStr]?.completedPomodoros || 0;
      const focusMins = stats.dailyStats[dateStr]?.focusMinutes || 0;
      days.push({ dateStr, dayName, count, focusMins });
    }
    return days;
  };

  const weekData = getLast7Days();
  const maxPomoCount = Math.max(...weekData.map(d => d.count), 4);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={22} className="header-icon" />
            <h3>Productivity Dashboard</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Highlight Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon focus-icon">
              <Clock size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-value">
                {hours > 0 ? `${hours}h ` : ''}{mins}m
              </span>
              <span className="metric-label">Total Focus Time</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon pomo-icon">
              <Award size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-value">{stats.totalPomodoros}</span>
              <span className="metric-label">Pomodoros Done</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon streak-icon">
              <Flame size={20} />
            </div>
            <div className="metric-info">
              <span className="metric-value">{stats.currentStreak} Days</span>
              <span className="metric-label">Focus Streak</span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h4>Past 7 Days Activity</h4>
            <span className="chart-subtitle">Completed pomodoros per day</span>
          </div>

          <div className="bar-chart-container">
            {weekData.map((d, index) => {
              const heightPercent = (d.count / maxPomoCount) * 100;
              return (
                <div key={d.dateStr} className="bar-column">
                  <span className="bar-count-tooltip">{d.count}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${d.count > 0 ? 'active-fill' : ''}`}
                      style={{ height: `${Math.max(heightPercent, d.count > 0 ? 15 : 4)}%` }}
                    />
                  </div>
                  <span className="bar-day-label">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* History Log */}
        <div className="history-section">
          <h4>Recent Sessions</h4>
          {stats.history.length === 0 ? (
            <p className="no-history">No sessions logged yet. Complete a Pomodoro timer to record progress!</p>
          ) : (
            <div className="history-list">
              {stats.history.slice(0, 5).map(record => (
                <div key={record.id} className="history-item">
                  <div className="history-item-left">
                    <span className={`history-tag tag-${record.mode}`}>
                      {record.mode === 'pomodoro' ? 'Focus' : record.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </span>
                    <span className="history-task">{record.taskTitle || 'General Focus'}</span>
                  </div>
                  <div className="history-item-right">
                    <span className="history-duration">{record.durationMinutes} min</span>
                    <span className="history-time">
                      {new Date(record.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="reset-stats-btn" onClick={onResetStats}>
            <RotateCcw size={14} />
            <span>Reset Analytics Data</span>
          </button>
          <button className="btn-save" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
