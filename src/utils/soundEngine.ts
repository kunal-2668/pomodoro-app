// Web Audio API & In-App Lofi Music Engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  
  // Channel 1: Ambient Soundscapes
  private ambientGainNode: GainNode | null = null;
  private ambientSourceNodes: AudioNode[] = [];
  private ambientTimer: number | null = null;
  private activeAmbientType: string = 'none';

  // Channel 2: In-App Lofi Music Engine
  private musicGainNode: GainNode | null = null;
  private musicSourceNodes: AudioNode[] = [];
  private musicTimer: number | null = null;
  private activeMusicType: string = 'none';
  private radioAudioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play alarm sound
  playAlarm(soundType: 'digital' | 'bell' | 'gong' | 'chime', volume: number = 80) {
    try {
      const ctx = this.getContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volume / 100) * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (soundType === 'digital') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
        });
      } else if (soundType === 'bell') {
        const baseFreq = 440;
        const harmonics = [1, 2.76, 5.4, 8.93];
        const gains = [0.5, 0.25, 0.1, 0.05];
        harmonics.forEach((h, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * h, ctx.currentTime);
          gain.gain.setValueAtTime(gains[idx], ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 2.5);
        });
      } else if (soundType === 'gong') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(120, ctx.currentTime);
        osc2.frequency.setValueAtTime(122, ctx.currentTime);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.0);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 4.0);
        osc2.stop(ctx.currentTime + 4.0);
      } else if (soundType === 'chime') {
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 1.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 1.3);
        });
      }
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  // ================= CHANNEL 1: AMBIENT SOUNDS ================= //
  startAmbient(type: string, volume: number = 50) {
    this.stopAmbient();
    if (type === 'none') return;
    this.activeAmbientType = type;

    try {
      const ctx = this.getContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volume / 100) * 0.3, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGainNode = masterGain;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      if (type === 'rain') {
        // Rain is essentially bandpassed noise (mostly pink/brown) with some highs for splashes
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2500, ctx.currentTime);
        
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(300, ctx.currentTime);

        whiteNoiseSource.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(masterGain);
        
        whiteNoiseSource.start();
        this.ambientSourceNodes.push(whiteNoiseSource, lowpass, highpass);

        // Add occasional low frequency rumble (thunder)
        const thunderInterval = window.setInterval(() => {
          if (this.activeAmbientType !== 'rain') return;
          if (Math.random() > 0.3) return; // 30% chance to thunder every interval
          
          const thunderFilter = ctx.createBiquadFilter();
          thunderFilter.type = 'lowpass';
          thunderFilter.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
          
          const thunderGain = ctx.createGain();
          thunderGain.gain.setValueAtTime(0.001, ctx.currentTime);
          thunderGain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 1.5);
          thunderGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.0);
          
          // Use another noise source for thunder
          const tNoise = ctx.createBufferSource();
          tNoise.buffer = noiseBuffer;
          
          tNoise.connect(thunderFilter);
          thunderFilter.connect(thunderGain);
          thunderGain.connect(masterGain);
          
          tNoise.start(ctx.currentTime);
          tNoise.stop(ctx.currentTime + 5.5);
          this.ambientSourceNodes.push(tNoise, thunderFilter, thunderGain);
        }, 8000); // Check every 8 seconds
        this.ambientTimer = thunderInterval;

      } else if (type === 'ocean') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        whiteNoiseSource.connect(filter);
        filter.connect(masterGain);
        lfo.start();
        whiteNoiseSource.start();
        this.ambientSourceNodes.push(whiteNoiseSource, filter, lfo, lfoGain);

      } else if (type === 'brownNoise') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        whiteNoiseSource.connect(filter);
        filter.connect(masterGain);
        whiteNoiseSource.start();
        this.ambientSourceNodes.push(whiteNoiseSource, filter);

      } else if (type === 'cafe') {
        const filter1 = ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(800, ctx.currentTime);
        filter1.Q.setValueAtTime(1.2, ctx.currentTime);
        whiteNoiseSource.connect(filter1);
        filter1.connect(masterGain);
        whiteNoiseSource.start();
        this.ambientSourceNodes.push(whiteNoiseSource, filter1);
      }
    } catch (e) {
      console.warn('Ambient sound engine notice:', e);
    }
  }

  setAmbientVolume(volume: number) {
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime((volume / 100) * 0.3, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    this.activeAmbientType = 'none';
    if (this.ambientTimer !== null) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.ambientSourceNodes.forEach(node => {
      const srcNode = node as unknown as { stop?: () => void; disconnect?: () => void };
      if (typeof srcNode.stop === 'function') { try { srcNode.stop(); } catch (e) {} }
      if (typeof srcNode.disconnect === 'function') { try { srcNode.disconnect(); } catch (e) {} }
    });
    this.ambientSourceNodes = [];
    this.ambientGainNode = null;
  }

  // ================= CHANNEL 2: IN-APP LOFI MUSIC ENGINE ================= //
  // Each option has COMPLETELY different: chords, tempo, oscillator type,
  // filter cutoff, drum patterns, note durations, and musical character.

  startMusicSynth(type: string, volume: number = 60) {
    this.stopMusicSynth();
    if (type === 'none') return;
    this.activeMusicType = type;

    // Option 4: Local Lofi Playlist (random track, random start)
    if (type === 'lofiRadio') {
      try {
        const trackNum = Math.floor(Math.random() * 5) + 1;
        const paddedNum = trackNum.toString().padStart(5, '0');
        const fileUrl = `/lofi-playlist/${paddedNum}.m4a`;

        this.radioAudioElement = new Audio(fileUrl);
        this.radioAudioElement.volume = volume / 100;
        
        // Wait for metadata to know the duration so we can seek
        this.radioAudioElement.addEventListener('loadedmetadata', () => {
          if (this.radioAudioElement) {
            // Seek to a random time (between 0 and 90% of duration)
            const randomTime = Math.random() * this.radioAudioElement.duration * 0.9;
            this.radioAudioElement.currentTime = randomTime;
            this.radioAudioElement.play().catch(e => console.warn('Lofi playlist play failed:', e));
          }
        });

        // When track ends, play another random one
        this.radioAudioElement.addEventListener('ended', () => {
           this.startMusicSynth('lofiRadio', volume);
        });

      } catch (e) {
        console.warn('Playlist error:', e);
      }
      return;
    }

    try {
      const ctx = this.getContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volume / 100) * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.musicGainNode = masterGain;

      if (type === 'lofiBeats') {
        this._startLofiBeats(ctx, masterGain);
      } else if (type === 'lofiJazz') {
        this._startLofiJazz(ctx, masterGain);
      } else if (type === 'lofiCosmic') {
        this._startLofiCosmic(ctx, masterGain);
      }
    } catch (e) {
      console.warn('Music synth notice:', e);
    }
  }

  // ---- OPTION 1: Lofi Chill Beats ----
  // Classic chillhop: punchy kick, crisp hat, muted Rhodes chords, walking bass
  private _startLofiBeats(ctx: AudioContext, masterGain: GainNode) {
    // Very subtle vinyl crackle (barely audible warmth)
    this._addVinylCrackle(ctx, masterGain, 0.005, 1400);

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    
    let beatIndex = 0;
    const interval = window.setInterval(() => {
      if (this.activeMusicType !== 'lofiBeats') return;
      const chord = chords[Math.floor(beatIndex / 8) % chords.length];
      const step = beatIndex % 8;

      // Rhodes-style chords: play on beats 0, 3, 5 (syncopated groove)
      if (step === 0 || step === 3 || step === 5) {
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filt = ctx.createBiquadFilter();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(800, ctx.currentTime);
          gain.gain.setValueAtTime(step === 0 ? 0.07 : 0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.connect(filt);
          filt.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.85);
        });
      }

      // Punchy kick on 0 and 4
      if (step === 0 || step === 4) {
        const kick = ctx.createOscillator();
        const kickG = ctx.createGain();
        kick.frequency.setValueAtTime(150, ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.1);
        kickG.gain.setValueAtTime(0.35, ctx.currentTime);
        kickG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        kick.connect(kickG);
        kickG.connect(masterGain);
        kick.start(ctx.currentTime);
        kick.stop(ctx.currentTime + 0.16);
      }

      // Closed hi-hat on every other step
      if (step % 2 === 0) {
        const bufSize = ctx.sampleRate * 0.04;
        const hatBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const hatData = hatBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) hatData[i] = (Math.random() * 2 - 1) * 0.5;
        const hat = ctx.createBufferSource();
        hat.buffer = hatBuf;
        const hatG = ctx.createGain();
        const hatF = ctx.createBiquadFilter();
        hatF.type = 'highpass';
        hatF.frequency.setValueAtTime(8000, ctx.currentTime);
        hatG.gain.setValueAtTime(0.08, ctx.currentTime);
        hatG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        hat.connect(hatF);
        hatF.connect(hatG);
        hatG.connect(masterGain);
        hat.start(ctx.currentTime);
      }

      // Snare on 2 and 6
      if (step === 2 || step === 6) {
        const snr = ctx.createOscillator();
        const snrG = ctx.createGain();
        snr.type = 'triangle';
        snr.frequency.setValueAtTime(200, ctx.currentTime);
        snrG.gain.setValueAtTime(0.1, ctx.currentTime);
        snrG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        snr.connect(snrG);
        snrG.connect(masterGain);
        snr.start(ctx.currentTime);
        snr.stop(ctx.currentTime + 0.08);
      }

      // Bass on beat 0 and 4
      if (step === 0 || step === 4) {
        const bass = ctx.createOscillator();
        const bassG = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(chord[0] / 2, ctx.currentTime);
        bassG.gain.setValueAtTime(0.15, ctx.currentTime);
        bassG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        bass.connect(bassG);
        bassG.connect(masterGain);
        bass.start(ctx.currentTime);
        bass.stop(ctx.currentTime + 0.36);
      }

      beatIndex++;
    }, 250); // 120 BPM 8th notes

    this.musicTimer = interval;
  }

  // ---- OPTION 2: Midnight Jazz Lofi ----
  // Slow jazz feel: brushed drums, sawtooth-filtered piano, walking bass, NO hi-hats
  private _startLofiJazz(ctx: AudioContext, masterGain: GainNode) {
    // Very subtle low rumble crackle (barely audible warmth)
    this._addVinylCrackle(ctx, masterGain, 0.008, 600);

    const chords = [
      [174.61, 220.00, 277.18, 349.23], // Fm7
      [155.56, 196.00, 246.94, 311.13], // Eb7
      [130.81, 164.81, 207.65, 261.63], // Cm9
      [146.83, 185.00, 233.08, 293.66], // Dbmaj7
    ];

    let beatIndex = 0;
    const interval = window.setInterval(() => {
      if (this.activeMusicType !== 'lofiJazz') return;
      const chord = chords[Math.floor(beatIndex / 6) % chords.length];
      const step = beatIndex % 6;

      // Jazz piano voicing: played on 0 and 3 with long sustain (sawtooth filtered)
      if (step === 0 || step === 3) {
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filt = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.005), ctx.currentTime); // slight detune for warmth
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(400, ctx.currentTime);
          filt.Q.setValueAtTime(2, ctx.currentTime);
          gain.gain.setValueAtTime(0.03, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
          osc.connect(filt);
          filt.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 2.3);
        });
      }

      // Brush snare (noise burst) on 1 and 4 (jazz swing)
      if (step === 1 || step === 4) {
        const bufSize = ctx.sampleRate * 0.12;
        const brushBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = brushBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
        const brush = ctx.createBufferSource();
        brush.buffer = brushBuf;
        const brushG = ctx.createGain();
        const brushF = ctx.createBiquadFilter();
        brushF.type = 'bandpass';
        brushF.frequency.setValueAtTime(3000, ctx.currentTime);
        brushF.Q.setValueAtTime(0.5, ctx.currentTime);
        brushG.gain.setValueAtTime(0.06, ctx.currentTime);
        brushG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        brush.connect(brushF);
        brushF.connect(brushG);
        brushG.connect(masterGain);
        brush.start(ctx.currentTime);
      }

      // Soft kick on 0 only
      if (step === 0) {
        const kick = ctx.createOscillator();
        const kickG = ctx.createGain();
        kick.frequency.setValueAtTime(80, ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.2);
        kickG.gain.setValueAtTime(0.2, ctx.currentTime);
        kickG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        kick.connect(kickG);
        kickG.connect(masterGain);
        kick.start(ctx.currentTime);
        kick.stop(ctx.currentTime + 0.26);
      }

      // Walking bass line: plays every beat with ascending/descending notes
      const bassNotes = [chord[0] / 2, chord[1] / 2, chord[2] / 2, chord[0] / 2, chord[3] / 2, chord[1] / 2];
      const bass = ctx.createOscillator();
      const bassG = ctx.createGain();
      const bassF = ctx.createBiquadFilter();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(bassNotes[step], ctx.currentTime);
      bassF.type = 'lowpass';
      bassF.frequency.setValueAtTime(300, ctx.currentTime);
      bassG.gain.setValueAtTime(0.12, ctx.currentTime);
      bassG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      bass.connect(bassF);
      bassF.connect(bassG);
      bassG.connect(masterGain);
      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + 0.52);

      beatIndex++;
    }, 450); // ~67 BPM swing tempo

    this.musicTimer = interval;
  }

  // ---- OPTION 3: Cosmic Lofi Ambient ----
  // Drone ambient pads: sine waves with slow evolving LFO, NO drums, long reverb-like tails
  private _startLofiCosmic(ctx: AudioContext, masterGain: GainNode) {
    // Ethereal shimmer noise layer instead of vinyl
    const bufferSize = 4 * ctx.sampleRate;
    const shimmerBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const shimmerData = shimmerBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      shimmerData[i] = (Math.random() * 2 - 1) * 0.004;
    }
    const shimmer = ctx.createBufferSource();
    shimmer.buffer = shimmerBuf;
    shimmer.loop = true;
    const shimmerF = ctx.createBiquadFilter();
    shimmerF.type = 'highpass';
    shimmerF.frequency.setValueAtTime(8000, ctx.currentTime);
    shimmer.connect(shimmerF);
    shimmerF.connect(masterGain);
    shimmer.start();
    this.musicSourceNodes.push(shimmer, shimmerF);

    // Continuous evolving drone pad
    const padNotes = [
      [130.81, 196.00, 261.63, 329.63], // C major open voicing
      [146.83, 220.00, 293.66, 369.99], // D minor aeolian
      [164.81, 246.94, 329.63, 415.30], // E phrygian
      [110.00, 164.81, 220.00, 293.66], // A minor deep
    ];

    let chordIdx = 0;

    // Play long evolving pad every 4 seconds
    const padInterval = window.setInterval(() => {
      if (this.activeMusicType !== 'lofiCosmic') return;
      const chord = padNotes[chordIdx % padNotes.length];

      chord.forEach((freq, i) => {
        // Main sine pad
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow vibrato LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.3 + i * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2 + i, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(ctx.currentTime);

        // Very slow swell envelope (2s attack, 2s decay)
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.0);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.0);
        lfo.stop(ctx.currentTime + 4.0);
      });

      // Add a single high sparkle tone on every other chord
      if (chordIdx % 2 === 0) {
        const sparkle = ctx.createOscillator();
        const sparkleG = ctx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(chord[3] * 2, ctx.currentTime);
        sparkleG.gain.setValueAtTime(0.001, ctx.currentTime);
        sparkleG.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.5);
        sparkleG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
        sparkle.connect(sparkleG);
        sparkleG.connect(masterGain);
        sparkle.start(ctx.currentTime);
        sparkle.stop(ctx.currentTime + 3.1);
      }

      chordIdx++;
    }, 4000); // Very slow: new pad every 4 seconds

    this.musicTimer = padInterval;
  }

  // Helper: Add vinyl crackle with custom volume & frequency
  private _addVinylCrackle(ctx: AudioContext, masterGain: GainNode, level: number, freq: number) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * level;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime); // Narrow band so it doesn't sound like ambient noise
    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    this.musicSourceNodes.push(noiseSource, filter);
  }

  setMusicVolume(volume: number) {
    if (this.radioAudioElement) {
      this.radioAudioElement.volume = volume / 100;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime((volume / 100) * 0.35, this.ctx.currentTime);
    }
  }

  stopMusicSynth() {
    this.activeMusicType = 'none';
    if (this.radioAudioElement) {
      try { this.radioAudioElement.pause(); this.radioAudioElement.currentTime = 0; } catch (e) {}
    }
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.musicSourceNodes.forEach(node => {
      const srcNode = node as unknown as { stop?: () => void; disconnect?: () => void };
      if (typeof srcNode.stop === 'function') { try { srcNode.stop(); } catch (e) {} }
      if (typeof srcNode.disconnect === 'function') { try { srcNode.disconnect(); } catch (e) {} }
    });
    this.musicSourceNodes = [];
    this.musicGainNode = null;
  }
}

export const soundEngine = new SoundEngine();
