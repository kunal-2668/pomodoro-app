import React from 'react';
import { CloudRain, Waves, Radio, Coffee, VolumeX, Volume2, X, Music, Disc, Sparkles, Sliders } from 'lucide-react';
import { AmbientSoundType, MusicSoundType } from '../types';

interface AmbientSoundPlayerProps {
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbient: (sound: AmbientSoundType) => void;
  onChangeAmbientVolume: (vol: number) => void;

  musicSound: MusicSoundType;
  musicVolume: number;
  onSelectMusic: (sound: MusicSoundType) => void;
  onChangeMusicVolume: (vol: number) => void;

  onClose: () => void;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({
  ambientSound,
  ambientVolume,
  onSelectAmbient,
  onChangeAmbientVolume,
  musicSound,
  musicVolume,
  onSelectMusic,
  onChangeMusicVolume,
  onClose,
}) => {
  const ambientOptions: { id: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'rain', label: 'Rainfall', icon: <CloudRain size={20} />, desc: 'Gentle raindrops & storm mist' },
    { id: 'ocean', label: 'Ocean Waves', icon: <Waves size={20} />, desc: 'Rhythmic deep tide swells' },
    { id: 'brownNoise', label: 'Brown Noise', icon: <Radio size={20} />, desc: 'Deep warm frequency spectrum' },
    { id: 'cafe', label: 'Lo-Fi Cafe', icon: <Coffee size={20} />, desc: 'Cozy background murmur' },
  ];

  const musicOptions: { id: MusicSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'lofiBeats', label: 'Lofi Chill Beats', icon: <Disc size={20} />, desc: 'Warm 75 BPM Lofi drums & 7th Rhodes chords' },
    { id: 'lofiJazz', label: 'Midnight Jazz Lofi', icon: <Music size={20} />, desc: 'Mellow electric piano & soft brush drums' },
    { id: 'lofiCosmic', label: 'Cosmic Lofi Ambient', icon: <Sparkles size={20} />, desc: 'Lush ambient synth pads & relaxing pace' },
    { id: 'lofiRadio', label: 'Lofi Girl Music', icon: <Radio size={20} />, desc: 'Lofi Girl YouTube mix — random position every time' },
  ];

  return (
    <div className="ambient-modal-overlay" onClick={onClose}>
      <div className="ambient-modal dual-audio-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={22} className="header-icon" />
            <h3>In-App Audio Mixer & Lofi Music</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="ambient-subtitle">
          Mix background ambient soundscapes and built-in Lofi Girl music directly inside the app with separate volume controls!
        </p>

        <div className="dual-audio-layout">
          {/* SECTION 1: AMBIENT SOUNDSCAPES */}
          <div className="audio-mixer-section">
          <div className="mixer-section-header">
            <h4>🌧️ 1. Ambient Background Sounds</h4>
            {ambientSound !== 'none' && (
              <span className="channel-active-badge">Active: {ambientSound}</span>
            )}
          </div>

          <div className="sound-grid">
            {ambientOptions.map(s => {
              const isActive = ambientSound === s.id;
              return (
                <button
                  key={s.id}
                  className={`sound-card ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectAmbient(isActive ? 'none' : s.id)}
                >
                  <div className="sound-icon">{s.icon}</div>
                  <div className="sound-details">
                    <span className="sound-title">{s.label}</span>
                    <span className="sound-desc">{s.desc}</span>
                  </div>
                  {isActive && <div className="playing-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Ambient Volume Slider */}
          <div className={`channel-volume-box ${ambientSound === 'none' ? 'disabled' : ''}`}>
            <div className="volume-label">
              <span>Ambient Sound Volume</span>
              <span>{ambientVolume}%</span>
            </div>
            <div className="volume-slider-row">
              <VolumeX size={16} />
              <input
                type="range"
                min="0"
                max="100"
                value={ambientVolume}
                disabled={ambientSound === 'none'}
                onChange={e => onChangeAmbientVolume(parseInt(e.target.value))}
                className="volume-slider ambient-slider"
              />
              <Volume2 size={16} />
            </div>
          </div>
        </div>

        {/* SECTION 2: IN-APP LOFI MUSIC */}
        <div className="audio-mixer-section lofi-mixer-section">
          <div className="mixer-section-header">
            <h4>🎧 2. In-App Lofi Music & Beats</h4>
            {musicSound !== 'none' && (
              <span className="channel-active-badge lofi-badge-active">Active: {musicSound}</span>
            )}
          </div>

          <div className="sound-grid">
            {musicOptions.map(s => {
              const isActive = musicSound === s.id;
              return (
                <button
                  key={s.id}
                  className={`sound-card lofi-card ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectMusic(isActive ? 'none' : s.id)}
                >
                  <div className="sound-icon lofi-icon">{s.icon}</div>
                  <div className="sound-details">
                    <span className="sound-title">{s.label}</span>
                    <span className="sound-desc">{s.desc}</span>
                  </div>
                  {isActive && <div className="playing-pulse lofi-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Music Volume Slider */}
          <div className={`channel-volume-box ${musicSound === 'none' ? 'disabled' : ''}`}>
            <div className="volume-label">
              <span>Lofi Music Volume</span>
              <span>{musicVolume}%</span>
            </div>
            <div className="volume-slider-row">
              <VolumeX size={16} />
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                disabled={musicSound === 'none'}
                onChange={e => onChangeMusicVolume(parseInt(e.target.value))}
                className="volume-slider music-slider"
              />
              <Volume2 size={16} />
            </div>
          </div>
        </div>
        </div> {/* End dual-audio-layout */}

        <div className="modal-footer">
          <div className="mixer-status-summary">
            <span>
              {ambientSound !== 'none' || musicSound !== 'none'
                ? `Playing: ${ambientSound !== 'none' ? `🌧️ ${ambientSound}` : ''} ${musicSound !== 'none' ? `🎧 ${musicSound}` : ''}`
                : 'No audio playing'}
            </span>
          </div>
          <button className="btn-save" onClick={onClose}>
            Done Mixing
          </button>
        </div>
      </div>
    </div>
  );
};
