import React, { useState } from 'react';
import { X, Sliders, Volume2, Bell, Palette, Play } from 'lucide-react';
import { Settings } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface SettingsModalProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [form, setForm] = useState<Settings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  const testAlarmSound = () => {
    soundEngine.playAlarm(form.alarmSound, form.alarmVolume);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setForm(prev => ({ ...prev, notificationEnabled: true }));
      } else {
        setForm(prev => ({ ...prev, notificationEnabled: false }));
        alert('Notification permission denied by browser settings.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={20} className="header-icon" />
            <h3>Timer Settings</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Time Durations */}
          <div className="settings-section">
            <h4><Sliders size={16} /> Timer Durations (Minutes)</h4>
            <div className="durations-grid">
              <div className="setting-input-field">
                <label>Pomodoro</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.pomodoroTime}
                  onChange={e => setForm({ ...form, pomodoroTime: Math.max(1, parseInt(e.target.value) || 1) })}
                  required
                />
              </div>

              <div className="setting-input-field">
                <label>Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={form.shortBreakTime}
                  onChange={e => setForm({ ...form, shortBreakTime: Math.max(1, parseInt(e.target.value) || 1) })}
                  required
                />
              </div>

              <div className="setting-input-field">
                <label>Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={form.longBreakTime}
                  onChange={e => setForm({ ...form, longBreakTime: Math.max(1, parseInt(e.target.value) || 1) })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Automation & Intervals */}
          <div className="settings-section">
            <h4>Intervals & Automation</h4>
            
            <div className="setting-row">
              <label>Long Break Interval</label>
              <div className="setting-control">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.longBreakInterval}
                  onChange={e => setForm({ ...form, longBreakInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="small-num-input"
                />
                <span className="setting-hint">Pomodoros before long break</span>
              </div>
            </div>

            <div className="setting-row toggle-row">
              <label htmlFor="autoStartBreaks">Auto-start Breaks</label>
              <input
                id="autoStartBreaks"
                type="checkbox"
                checked={form.autoStartBreaks}
                onChange={e => setForm({ ...form, autoStartBreaks: e.target.checked })}
                className="toggle-switch"
              />
            </div>

            <div className="setting-row toggle-row">
              <label htmlFor="autoStartPomodoros">Auto-start Pomodoros</label>
              <input
                id="autoStartPomodoros"
                type="checkbox"
                checked={form.autoStartPomodoros}
                onChange={e => setForm({ ...form, autoStartPomodoros: e.target.checked })}
                className="toggle-switch"
              />
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="settings-section">
            <h4><Bell size={16} /> Audio & Notifications</h4>

            <div className="setting-row">
              <label>Alarm Sound</label>
              <div className="sound-select-row">
                <select
                  value={form.alarmSound}
                  onChange={e => setForm({ ...form, alarmSound: e.target.value as Settings['alarmSound'] })}
                  className="sound-select"
                >
                  <option value="bell">Serene Bell</option>
                  <option value="digital">Digital Beep</option>
                  <option value="gong">Zen Gong</option>
                  <option value="chime">Sparkle Chime</option>
                </select>
                <button type="button" className="test-sound-btn" onClick={testAlarmSound} title="Play Sound Test">
                  <Play size={14} />
                  <span>Test</span>
                </button>
              </div>
            </div>

            <div className="setting-row">
              <label>Alarm Volume ({form.alarmVolume}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.alarmVolume}
                onChange={e => setForm({ ...form, alarmVolume: parseInt(e.target.value) })}
                className="volume-slider"
              />
            </div>

            <div className="setting-row toggle-row">
              <label htmlFor="notificationEnabled">Desktop Notifications</label>
              <button
                type="button"
                className={`perm-btn ${form.notificationEnabled ? 'granted' : ''}`}
                onClick={requestNotificationPermission}
              >
                {form.notificationEnabled ? 'Enabled' : 'Enable Notifications'}
              </button>
            </div>
          </div>

          {/* Color Themes */}
          <div className="settings-section">
            <h4><Palette size={16} /> Theme Palette</h4>
            <div className="theme-options-grid">
              {[
                { id: 'dark', label: 'Obsidian Neon', color: '#ff4757' },
                { id: 'sunset', label: 'Sunset Glow', color: '#ff7f50' },
                { id: 'emerald', label: 'Mint Emerald', color: '#2ed573' },
                { id: 'cyberpunk', label: 'Cyber Violet', color: '#a55eea' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-card ${form.theme === t.id ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, theme: t.id as Settings['theme'] })}
                >
                  <span className="theme-color-preview" style={{ backgroundColor: t.color }}></span>
                  <span className="theme-name">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
