import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Target } from 'lucide-react';
import { TimerMode, Task } from '../types';

interface TimerDisplayProps {
  mode: TimerMode;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onSelectMode: (mode: TimerMode) => void;
  completedCycles: number;
  longBreakInterval: number;
  activeTask: Task | null;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onSelectMode,
  completedCycles,
  longBreakInterval,
  activeTask,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // SVG ring setup
  const size = 320;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const currentCycleInBlock = (completedCycles % longBreakInterval) + 1;

  const modeLabels: Record<TimerMode, string> = {
    pomodoro: 'Deep Focus',
    shortBreak: 'Short Rest',
    longBreak: 'Long Break',
  };

  return (
    <div className={`timer-container mode-${mode}`}>
      {/* Mode Switcher Tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'pomodoro' ? 'active' : ''}`}
          onClick={() => onSelectMode('pomodoro')}
        >
          <span className="mode-dot pomodoro-dot"></span>
          Pomodoro
        </button>
        <button
          className={`mode-tab ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => onSelectMode('shortBreak')}
        >
          <span className="mode-dot short-dot"></span>
          Short Break
        </button>
        <button
          className={`mode-tab ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => onSelectMode('longBreak')}
        >
          <span className="mode-dot long-dot"></span>
          Long Break
        </button>
      </div>

      {/* SVG Ring & Countdown Timer */}
      <div className="timer-ring-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="timer-svg">
          <defs>
            <linearGradient id="gradient-pomodoro" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4757" />
              <stop offset="50%" stopColor="#ff6b81" />
              <stop offset="100%" stopColor="#ff7f50" />
            </linearGradient>
            <linearGradient id="gradient-shortBreak" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2ed573" />
              <stop offset="100%" stopColor="#10ac84" />
            </linearGradient>
            <linearGradient id="gradient-longBreak" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#546de5" />
              <stop offset="100%" stopColor="#778ca3" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="ring-bg"
            strokeWidth={strokeWidth}
          />

          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="ring-progress"
            stroke={`url(#gradient-${mode})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        {/* Center Clock Display */}
        <div className="timer-center-content">
          <span className="mode-status-tag">{modeLabels[mode]}</span>
          <h1 className="timer-clock">{formatTime(timeLeft)}</h1>
          
          {/* Active Task Badge */}
          {activeTask ? (
            <div className="active-task-badge" title="Currently focusing on this task">
              <Target size={14} className="task-target-icon" />
              <span className="task-title-text">{activeTask.title}</span>
              <span className="task-pomo-count">
                ({activeTask.completedPomodoros}/{activeTask.estPomodoros} 🍅)
              </span>
            </div>
          ) : (
            <div className="active-task-placeholder">
              <span>No task selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Cycle Indicator */}
      <div className="cycle-indicator">
        <span className="cycle-text">
          Session <strong className="cycle-num">#{currentCycleInBlock}</strong> of {longBreakInterval} before long break
        </span>
        <div className="cycle-dots">
          {Array.from({ length: longBreakInterval }).map((_, i) => (
            <div
              key={i}
              className={`cycle-dot ${i < (completedCycles % longBreakInterval) ? 'filled' : ''} ${i === (completedCycles % longBreakInterval) && mode === 'pomodoro' ? 'current' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="timer-controls">
        <button
          className="control-btn secondary-btn"
          onClick={onResetTimer}
          title="Reset Timer (Hotkey: R)"
        >
          <RotateCcw size={20} />
        </button>

        <button
          className={`control-btn primary-play-btn mode-btn-${mode}`}
          onClick={onToggleTimer}
          title={isRunning ? "Pause Timer (Hotkey: Space)" : "Start Timer (Hotkey: Space)"}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
        </button>

        <button
          className="control-btn secondary-btn"
          onClick={onSkipTimer}
          title="Skip Session (Hotkey: S)"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
};
