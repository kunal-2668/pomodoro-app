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
- Fixed native HTML `<select>` option dropdown styling across the app (Settings, Category, etc.) to match the dark glassmorphism theme (`#0f172a` background).
- Implemented full Mobile UI Optimization (Hamburger Menu, flex stacking, font/ring scaling).
- Added Screen Orientation API integration to auto-force landscape and Fullscreen when entering Zen Mode on mobile.
- Set up SEO metadata (`<meta>` tags for Title, Keywords, OpenGraph, Twitter Cards) and a `robots.txt` file for search engine indexing.
- Configured heavy client-side browser caching (1-year immutable cache) for large video and audio files via `vercel.json` to eliminate loading times on repeat visits.

## Deployment & Tracking
- Successfully hosted on Vercel (Live).
- Connected to GitHub repository for automated CI/CD deployments.
- Integrated `@vercel/analytics/react` component into `main.tsx` for production visitor tracking and page views.
