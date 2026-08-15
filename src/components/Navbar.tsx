import React from 'react';
import { Settings as SettingsIcon, BarChart2, Volume2, Flame, Maximize2, Sparkles, Music } from 'lucide-react';
import { TimerMode, AmbientSoundType, MusicSoundType } from '../types';

interface NavbarProps {
  activeMode: TimerMode;
  streak: number;
  totalPomodoros: number;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onToggleAmbient: () => void;
  ambientSound: AmbientSoundType;
  musicSound: MusicSoundType;
  onToggleZen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  streak,
  totalPomodoros,
  onOpenSettings,
  onOpenAnalytics,
  onToggleAmbient,
  ambientSound,
  musicSound,
  onToggleZen,
}) => {
  const isAmbientActive = ambientSound !== 'none';
  const isMusicActive = musicSound !== 'none';
  const isAudioActive = isAmbientActive || isMusicActive;

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-logo">
          <div className={`logo-icon mode-bg-${activeMode}`}>
            <Sparkles className="icon" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">ZenPulse</span>
            <span className="brand-subtitle">Focus & Flow</span>
          </div>
        </div>
      </div>

      <div className="nav-right">
        {/* Streak Pill */}
        <div className="nav-stat-pill" title="Current Daily Focus Streak">
          <Flame size={16} className="flame-icon" />
          <span>{streak} {streak === 1 ? 'Day' : 'Days'}</span>
        </div>

        {/* Total Pomodoros Pill */}
        <div className="nav-stat-pill" title="Total Completed Pomodoros">
          <span className="pomo-dot"></span>
          <span>{totalPomodoros} Completed</span>
        </div>

        {/* Dual Audio Mixer Control */}
        <button
          className={`nav-btn ${isAudioActive ? 'active-ambient' : ''} ${isMusicActive ? 'active-lofi-btn' : ''}`}
          onClick={onToggleAmbient}
          title="Dual Audio Mixer (Ambient Sounds & Lofi Beats)"
        >
          {isMusicActive ? <Music size={18} className="lofi-music-icon" /> : <Volume2 size={18} />}
          <span className="btn-label">
            {isMusicActive ? 'Audio Mixer' : isAmbientActive ? 'Ambient' : 'Audio Mixer'}
          </span>
          {isAudioActive && <span className="pulse-indicator"></span>}
        </button>

        {/* Analytics Button */}
        <button className="nav-btn" onClick={onOpenAnalytics} title="Productivity Dashboard">
          <BarChart2 size={18} />
          <span className="btn-label">Stats</span>
        </button>

        {/* Zen Mode Button */}
        <button className="nav-btn" onClick={onToggleZen} title="Enter Distraction-Free Zen Mode">
          <Maximize2 size={18} />
          <span className="btn-label">Zen Mode</span>
        </button>

        {/* Settings Button */}
        <button className="nav-btn icon-only" onClick={onOpenSettings} title="Settings">
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
