# Pomodoro Productivity Dashboard

## Tech Stack
- Frontend: React (Vite)
- Language: TypeScript
- Styling: Plain CSS with Glassmorphism (Liquid Glass) Theme
- Icons: Lucide React
- Hosting: Vercel (Live)

## Features
1. **Timer System**: 
   - Pomodoro (25m), Short Break (5m), Long Break (15m).
   - Auto-start breaks/pomodoros settings.
2. **Dynamic Aesthetic UI**: 
   - Animated liquid blobs in the background.
   - Glassmorphism effect (`backdrop-filter`) for all cards.
   - Dynamic glow depending on the active mode (Red for Pomodoro, Green for Short Break, Blue for Long Break).
3. **Dual Audio Mixer (SoundEngine)**: 
   - Channel 1 (Ambient): Rainfall (custom noise filter), Ocean, Cafe, Brown Noise, Fire.
   - Channel 2 (Lofi Music): Random playback from a downloaded array of local Lofi M4A tracks.
   - Fully controllable volumes via Range sliders.
4. **Task Management**:
   - Add, complete, and delete tasks.
   - "Focus Tasks" integrated with the Pomodoro cycles.
   - Alarm chime on task completion.
5. **Analytics Dashboard**: 
   - LocalStorage based persistence.
   - Tracks Total Focus Time, Pomodoros Done, Focus Streak.
   - 7-Day interactive Bar Chart for productivity history.
6. **Zen Mode**:
   - Distraction-free full-screen overlay.
   - Custom HD video backgrounds (Live Wallpaper).

## Recent UI Fixes & Setup
- Aligned Timer Card and Task Section heights (`align-items: stretch`).
- Adjusted mode tabs and task filters with translucent white (`rgba(255, 255, 255, 0.05)`) to match the glass style.
- Placed "made by SpecialGrade x Gaddafi" watermark aligned to the left below the timer, styled with metallic gradient, wide letter-spacing, and mono font.
- Implemented a custom noise filter (highpass + lowpass biquad filters) for natural-sounding Rain ambient audio, replacing the previous sine wave beeps.
- Initialized Git repository, created robust `.gitignore` for testing logs and cache, and successfully removed unnecessary tracking artifacts.

## Deployment
- Successfully hosted on Vercel.
- Connected to GitHub repository for automated CI/CD deployments.
