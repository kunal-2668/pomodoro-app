import React, { useState, useEffect } from 'react';
import { Play, Pause, Minimize2, RotateCcw, SkipForward, Target, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TimerMode, Task } from '../types';

interface ZenModeViewProps {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onExitZen: () => void;
  activeTask: Task | null;
}

const BACKGROUND_VIDEOS = [
  '/backgrounds/38d9dc3350_cozy-lofi-relaxing-rainy-day-aesthetic.mp4',
  '/backgrounds/4a57baa6cf_pixel-snow-station-wallsflow-com.mp4',
  '/backgrounds/6964bab862_misty_lakeside_pavilion_live_wallpaper_wallsflow_com.mp4',
  '/backgrounds/85aeba1a79_minecraft_river_boat_journey_live_wallpaper_wallsflow.mp4',
  '/backgrounds/9b986e9fdb_cute-frogs-terrarium-live-wallpaper-wallsflow-com.mp4',
  '/backgrounds/c8ca0376e3_cyberpunk-alley-robot_wallsflow-com.mp4',
  '/backgrounds/f8c8c2368f_charming-cat_wallsflow-com.mp4'
];

export const ZenModeView: React.FC<ZenModeViewProps> = ({
  mode,
  timeLeft,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onExitZen,
  activeTask,
}) => {
  // Select random background on initial load
  const [bgIndex, setBgIndex] = useState<number>(() => Math.floor(Math.random() * BACKGROUND_VIDEOS.length));

  const currentBgVideo = BACKGROUND_VIDEOS[bgIndex];

  const handleNextBackground = () => {
    setBgIndex(prev => (prev + 1) % BACKGROUND_VIDEOS.length);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeTitles: Record<TimerMode, string> = {
    pomodoro: 'Deep Focus Mode',
    shortBreak: 'Short Rest',
    longBreak: 'Long Break',
  };

  return (
    <div className={`zen-overlay mode-${mode}`}>
      {/* Live Video Wallpaper Background */}
      <div className="zen-video-container">
        <video
          key={currentBgVideo}
          src={currentBgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="zen-bg-video"
        />
        <div className="zen-video-overlay" />
      </div>

      {/* Action Header Buttons */}
      <div className="zen-header-actions">
        <button
          className="zen-action-btn icon-only"
          onClick={handleNextBackground}
          title="Change Live Wallpaper Background"
        >
          <ImageIcon size={20} />
        </button>

        <button className="zen-action-btn exit-btn icon-only" onClick={onExitZen} title="Exit Zen Mode (ESC)">
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Main Top-Center Timer View */}
      <div className="zen-top-center-container">
        <span className="zen-mode-tag">
          <Sparkles size={14} className="sparkle-tag" />
          {modeTitles[mode]}
        </span>

        <h1 className="zen-clock">{formatTime(timeLeft)}</h1>

        {activeTask && (
          <div className="zen-task-badge">
            <Target size={16} />
            <span>{activeTask.title}</span>
            <span className="zen-task-count">({activeTask.completedPomodoros}/{activeTask.estPomodoros} 🍅)</span>
          </div>
        )}

        <div className="zen-controls">
          <button className="zen-sub-btn" onClick={onResetTimer} title="Reset Timer (Hotkey: R)">
            <RotateCcw size={22} />
          </button>
          
          <button className={`zen-main-btn mode-btn-${mode}`} onClick={onToggleTimer} title="Play/Pause (Hotkey: Space)">
            {isRunning ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: '4px' }} />}
          </button>

          <button className="zen-sub-btn" onClick={onSkipTimer} title="Skip Session (Hotkey: S)">
            <SkipForward size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
