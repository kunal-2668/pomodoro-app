export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  title: string;
  category: 'Work' | 'Study' | 'Code' | 'Design' | 'Life';
  estPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: number;
}

export interface Settings {
  pomodoroTime: number; // in minutes
  shortBreakTime: number; // in minutes
  longBreakTime: number; // in minutes
  longBreakInterval: number; // e.g. 4 pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: 'digital' | 'bell' | 'gong' | 'chime';
  alarmVolume: number; // 0 to 100
  tickingSound: 'none' | 'clock' | 'wood';
  theme: 'dark' | 'sunset' | 'emerald' | 'cyberpunk';
  notificationEnabled: boolean;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  completedAt: number; // timestamp
  taskId?: string;
  taskTitle?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  completedPomodoros: number;
}

export interface AppStats {
  totalFocusMinutes: number;
  totalPomodoros: number;
  currentStreak: number;
  lastActiveDate: string;
  history: SessionRecord[];
  dailyStats: Record<string, DailyStats>;
}

export type AmbientSoundType = 'none' | 'rain' | 'ocean' | 'brownNoise' | 'cafe';
export type MusicSoundType = 'none' | 'lofiBeats' | 'lofiJazz' | 'lofiCosmic' | 'lofiRadio';
