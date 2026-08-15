import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { TimerDisplay } from './components/TimerDisplay';
import { TaskSection } from './components/TaskSection';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ZenModeView } from './components/ZenModeView';
import { TimerMode, Task, Settings, AppStats, AmbientSoundType, MusicSoundType, SessionRecord } from './types';
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadStats,
  saveStats,
  loadActiveTaskId,
  saveActiveTaskId,
  getTodayDateString,
  defaultStats,
} from './utils/storage';
import { soundEngine } from './utils/soundEngine';

export const App: React.FC = () => {
  // Persistence state
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(loadActiveTaskId);
  const [stats, setStats] = useState<AppStats>(loadStats);

  // Timer engine state
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoroTime * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Channel 1: Ambient sound state
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(50);

  // Channel 2: Lofi Music sound state
  const [musicSound, setMusicSound] = useState<MusicSoundType>('none');
  const [musicVolume, setMusicVolume] = useState<number>(60);

  // UI Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isAmbientOpen, setIsAmbientOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  // Apply theme attribute to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Sync timer duration when settings change or mode changes
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'pomodoro') setTimeLeft(settings.pomodoroTime * 60);
      else if (mode === 'shortBreak') setTimeLeft(settings.shortBreakTime * 60);
      else if (mode === 'longBreak') setTimeLeft(settings.longBreakTime * 60);
    }
  }, [mode, settings.pomodoroTime, settings.shortBreakTime, settings.longBreakTime]);

  // Sync document title with countdown
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Rest' : 'Long Rest';
    document.title = `${timeStr} - ${modeLabel} | ZenPulse`;
  }, [timeLeft, mode]);

  // Save tasks and active task id whenever changed
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveActiveTaskId(activeTaskId);
  }, [activeTaskId]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Countdown timer tick logic
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Handle session completion
  const handleTimerComplete = () => {
    setIsRunning(false);

    // 1. Play Sound & Celebration Confetti
    soundEngine.playAlarm(settings.alarmSound, settings.alarmVolume);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // 2. Desktop Notification
    if (settings.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const msg =
        mode === 'pomodoro'
          ? 'Great work! Time for a well-deserved break.'
          : 'Break completed! Ready to dive back into focus?';
      new Notification('ZenPulse Pomodoro', {
        body: msg,
        icon: '⏱️',
      });
    }

    const todayStr = getTodayDateString();
    const durationMins =
      mode === 'pomodoro'
        ? settings.pomodoroTime
        : mode === 'shortBreak'
        ? settings.shortBreakTime
        : settings.longBreakTime;

    // 3. Update Analytics & Streak
    setStats(prev => {
      const newHistory: SessionRecord = {
        id: Date.now().toString(),
        mode,
        durationMinutes: durationMins,
        completedAt: Date.now(),
        taskId: activeTask?.id,
        taskTitle: activeTask?.title,
      };

      const existingDaily = prev.dailyStats[todayStr] || {
        date: todayStr,
        focusMinutes: 0,
        completedPomodoros: 0,
      };

      const updatedDaily = {
        ...existingDaily,
        focusMinutes: existingDaily.focusMinutes + (mode === 'pomodoro' ? durationMins : 0),
        completedPomodoros: existingDaily.completedPomodoros + (mode === 'pomodoro' ? 1 : 0),
      };

      // Calculate streak
      let streak = prev.currentStreak;
      if (mode === 'pomodoro') {
        if (prev.lastActiveDate !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (prev.lastActiveDate === yesterdayStr) {
            streak += 1;
          } else {
            streak = 1;
          }
        }
      }

      return {
        ...prev,
        totalFocusMinutes: prev.totalFocusMinutes + (mode === 'pomodoro' ? durationMins : 0),
        totalPomodoros: prev.totalPomodoros + (mode === 'pomodoro' ? 1 : 0),
        currentStreak: streak,
        lastActiveDate: todayStr,
        history: [newHistory, ...prev.history],
        dailyStats: {
          ...prev.dailyStats,
          [todayStr]: updatedDaily,
        },
      };
    });

    // 4. Update Tasks if Pomodoro mode
    if (mode === 'pomodoro') {
      const nextCycleCount = completedCycles + 1;
      setCompletedCycles(nextCycleCount);

      if (activeTaskId) {
        setTasks(prev =>
          prev.map(t =>
            t.id === activeTaskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
          )
        );
      }

      // Transition to Break
      const isLongBreakTime = nextCycleCount % settings.longBreakInterval === 0;
      const nextMode: TimerMode = isLongBreakTime ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      const nextDuration = isLongBreakTime ? settings.longBreakTime * 60 : settings.shortBreakTime * 60;
      setTimeLeft(nextDuration);

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Transition back to Pomodoro
      setMode('pomodoro');
      setTimeLeft(settings.pomodoroTime * 60);

      if (settings.autoStartPomodoros) {
        setIsRunning(true);
      }
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(prev => !prev);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSkipTimer();
      } else if (e.code === 'Escape') {
        if (isZenMode) setIsZenMode(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isAnalyticsOpen) setIsAnalyticsOpen(false);
        if (isAmbientOpen) setIsAmbientOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, isSettingsOpen, isAnalyticsOpen, isAmbientOpen]);

  // Controls Actions
  const handleToggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') setTimeLeft(settings.pomodoroTime * 60);
    else if (mode === 'shortBreak') setTimeLeft(settings.shortBreakTime * 60);
    else if (mode === 'longBreak') setTimeLeft(settings.longBreakTime * 60);
  };

  const handleSkipTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setMode('shortBreak');
      setTimeLeft(settings.shortBreakTime * 60);
    } else {
      setMode('pomodoro');
      setTimeLeft(settings.pomodoroTime * 60);
    }
  };

  const handleSelectMode = (newMode: TimerMode) => {
    if (newMode === mode) return;
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') setTimeLeft(settings.pomodoroTime * 60);
    else if (newMode === 'shortBreak') setTimeLeft(settings.shortBreakTime * 60);
    else if (newMode === 'longBreak') setTimeLeft(settings.longBreakTime * 60);
  };

  // Ambient Channel Handler
  const handleSelectAmbientSound = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    if (sound === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient(sound, ambientVolume);
    }
  };

  const handleChangeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    soundEngine.setAmbientVolume(vol);
  };

  // Music Channel Handler
  const handleSelectMusicSound = (sound: MusicSoundType) => {
    setMusicSound(sound);
    if (sound === 'none') {
      soundEngine.stopMusicSynth();
    } else {
      soundEngine.startMusicSynth(sound, musicVolume);
    }
  };

  const handleChangeMusicVolume = (vol: number) => {
    setMusicVolume(vol);
    soundEngine.setMusicVolume(vol);
  };

  // Task Handlers
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completedPomodoros' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      completedPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && !task.completed) {
        // Play success chime when marking as complete
        soundEngine.playAlarm('chime', settings.alarmVolume || 60);
      }
      return prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all analytics data?')) {
      setStats(defaultStats);
      saveStats(defaultStats);
    }
  };

  const totalModeDuration =
    mode === 'pomodoro'
      ? settings.pomodoroTime * 60
      : mode === 'shortBreak'
      ? settings.shortBreakTime * 60
      : settings.longBreakTime * 60;

  return (
    <div className="app-container">
      {/* Zen Distraction-Free View */}
      {isZenMode && (
        <ZenModeView
          mode={mode}
          timeLeft={timeLeft}
          isRunning={isRunning}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onSkipTimer={handleSkipTimer}
          onExitZen={() => setIsZenMode(false)}
          activeTask={activeTask}
        />
      )}

      {/* Main Header Navbar */}
      <Navbar
        activeMode={mode}
        streak={stats.currentStreak}
        totalPomodoros={stats.totalPomodoros}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onToggleAmbient={() => setIsAmbientOpen(true)}
        ambientSound={ambientSound}
        musicSound={musicSound}
        onToggleZen={() => setIsZenMode(true)}
      />

      {/* Main Application Layout */}
      <main className="main-grid">
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          totalDuration={totalModeDuration}
          isRunning={isRunning}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onSkipTimer={handleSkipTimer}
          onSelectMode={handleSelectMode}
          completedCycles={completedCycles}
          longBreakInterval={settings.longBreakInterval}
          activeTask={activeTask}
        />

        <TaskSection
          tasks={tasks}
          activeTaskId={activeTaskId}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onSetActiveTask={setActiveTaskId}
        />
      </main>

      {/* Dual Audio Generator & Mixer Modal */}
      {isAmbientOpen && (
        <AmbientSoundPlayer
          ambientSound={ambientSound}
          ambientVolume={ambientVolume}
          onSelectAmbient={handleSelectAmbientSound}
          onChangeAmbientVolume={handleChangeAmbientVolume}
          musicSound={musicSound}
          musicVolume={musicVolume}
          onSelectMusic={handleSelectMusicSound}
          onChangeMusicVolume={handleChangeMusicVolume}
          onClose={() => setIsAmbientOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Analytics Modal */}
      {isAnalyticsOpen && (
        <AnalyticsModal
          stats={stats}
          onClose={() => setIsAnalyticsOpen(false)}
          onResetStats={handleResetStats}
        />
      )}

      {/* Watermark */}
      <div className="watermark">
        made by SpecialGrade x Gaddafi
      </div>
    </div>
  );
};

export default App;
