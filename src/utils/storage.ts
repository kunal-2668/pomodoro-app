import { Settings, Task, AppStats } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'zenpulse_settings_v1',
  TASKS: 'zenpulse_tasks_v1',
  STATS: 'zenpulse_stats_v1',
  ACTIVE_TASK: 'zenpulse_active_task_v1',
};

export const defaultSettings: Settings = {
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'bell',
  alarmVolume: 80,
  tickingSound: 'none',
  theme: 'dark',
  notificationEnabled: true,
};

export const defaultStats: AppStats = {
  totalFocusMinutes: 0,
  totalPomodoros: 0,
  currentStreak: 0,
  lastActiveDate: '',
  history: [],
  dailyStats: {},
};

export const loadSettings = (): Settings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [
      {
        id: '1',
        title: 'Deep Work Focus Session',
        category: 'Work',
        estPomodoros: 4,
        completedPomodoros: 1,
        completed: false,
        createdAt: Date.now(),
      },
      {
        id: '2',
        title: 'Review Project Documentation',
        category: 'Code',
        estPomodoros: 2,
        completedPomodoros: 0,
        completed: false,
        createdAt: Date.now() - 100000,
      }
    ];
  } catch (e) {
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
};

export const loadStats = (): AppStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
  } catch (e) {
    return defaultStats;
  }
};

export const saveStats = (stats: AppStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

export const loadActiveTaskId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK);
  } catch (e) {
    return null;
  }
};

export const saveActiveTaskId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK);
    }
  } catch (e) {
    console.error('Failed to save active task ID:', e);
  }
};

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};
