// Web Audio API Synthesizer for Base Chain Maze retro-tech sounds
class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = false;
  private musicInterval: any = null;
  private currentStep: number = 0;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private isAudioPlaying: boolean = false;

  constructor() {
    // Lazy initialisation to prevent audio playing warnings before interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        try {
          // Create premium ambient echo/delay loop
          this.delayNode = this.ctx.createDelay(1.0);
          this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime); // 300ms delay
          
          this.delayGain = this.ctx.createGain();
          this.delayGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // feedback amount
          
          // Connect feedback loop
          this.delayNode.connect(this.delayGain);
          this.delayGain.connect(this.delayNode);
          
          // Connect delay to destination
          this.delayNode.connect(this.ctx.destination);
        } catch (e) {
          console.warn("Failed to initialize custom Web Audio delay nodes", e);
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(isMuted: boolean) {
    this.muted = isMuted;
    if (this.audio) {
      this.audio.muted = isMuted;
    }
  }

  isMuted() {
    return this.muted;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.tryPlayMP3();
    } else {
      if (this.audio) {
        this.audio.pause();
      }
      this.isAudioPlaying = false;
      this.stopMusicLoop();
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  private tryPlayMP3() {
    if (this.audio) {
      this.audio.muted = this.muted;
      this.audio.play()
        .then(() => {
          this.isAudioPlaying = true;
          this.stopMusicLoop(); // Stop synth loop to save CPU
        })
        .catch((e) => {
          console.log("MP3 play failed, falling back to Synthesizer:", e);
          this.isAudioPlaying = false;
          this.startMusicLoop();
        });
      return;
    }

    // Try multiple standard paths
    const possiblePaths = ['/music.mp3', '/tots_theme.mp3', '/assets/music.mp3', '/tots.mp3'];
    let pathIndex = 0;

    const tryNextPath = () => {
      if (pathIndex >= possiblePaths.length) {
        // All paths failed, start synthesizer
        this.isAudioPlaying = false;
        this.startMusicLoop();
        return;
      }

      const currentPath = possiblePaths[pathIndex];
      const audio = new Audio(currentPath);
      audio.loop = true;
      audio.muted = this.muted;

      // Event listeners for seamless loading & fallback
      const onCanPlay = () => {
        if (!this.musicEnabled) {
          audio.pause();
          return;
        }
        audio.play()
          .then(() => {
            this.audio = audio;
            this.isAudioPlaying = true;
            this.stopMusicLoop(); // Stop synthesizer to avoid overlap and save CPU
          })
          .catch((err) => {
            console.warn("Autoplay blocked or failed for", currentPath, err);
            // Fallback to synth if autoplay is strictly blocked
            this.isAudioPlaying = false;
            this.startMusicLoop();
          });
        
        cleanup();
      };

      const onError = () => {
        pathIndex++;
        tryNextPath();
        cleanup();
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);

      // Force load trigger
      audio.load();
    };

    tryNextPath();
  }

  private startMusicLoop() {
    if (this.musicInterval) return; // Already running
    this.init();
    
    // Play immediately on start
    this.playMusicStep();
    
    // Run loop every 240ms (125 BPM eighth notes, energetic TOTS tempo)
    this.musicInterval = window.setInterval(() => {
      this.playMusicStep();
    }, 240);
  }

  private stopMusicLoop() {
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playMusicStep() {
    if (this.muted || !this.musicEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const step = this.currentStep % 32;

    // --- SYNTHESIZED DRUM MACHINE (Kick & Clap) ---
    // 1. Kick Drum (4-on-the-floor beat)
    const playKick = () => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    };

    // 2. Clap / Snare (on beat 4, 12, 20, 28)
    const playClap = () => {
      if (!this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.1);
      } catch (e) {
        // Fallback if audio buffer creation fails
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    };

    // --- INSTRUMENTS SYNTHESIZERS ---
    // 3. Lead Synth (Super-Saw for epic soccer stadium feel)
    const playLead = (freq: number, duration: number) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Detuned dual saws for warm, wide super-saw lead sound
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq - 1.2, now);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq + 1.2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1300, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.018, now + 0.02); // safe and balanced volume
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      if (this.delayNode) {
        gain.connect(this.delayNode);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    };

    // 4. Bass Synth (Progressive driving pluck)
    const playBass = (freq: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      if (this.delayNode) {
        gain.connect(this.delayNode);
      }

      osc.start(now);
      osc.stop(now + duration);
    };

    // --- SEQUENCE CONTROLLER ---
    // Trigger Kick on every 4th step (steady EDM beat)
    if (step % 4 === 0) {
      playKick();
    }

    // Trigger Clap on beat 4, 12, 20, 28
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      playClap();
    }

    // Chord Progression Bass:
    // Steps 0-7: Em (root E2)
    // Steps 8-15: C Maj (root C2)
    // Steps 16-23: G Maj (root G2)
    // Steps 24-31: D Maj (root D2)
    let rootFreq = 82.41; // E2
    if (step >= 8 && step < 16) {
      rootFreq = 65.41; // C2
    } else if (step >= 16 && step < 24) {
      rootFreq = 98.00; // G2
    } else if (step >= 24 && step < 32) {
      rootFreq = 73.42; // D2
    }

    // Play rhythmic driving bass (alternating root and fifth octave)
    const bassFreq = (step % 2 === 0) ? rootFreq : rootFreq * 1.5;
    playBass(bassFreq, 0.2);

    // FC TOTS Theme Heroic Melody Riff (E minor progressive house motif)
    const MELODY_MAP: Record<number, number> = {
      0: 659.25,  // E5
      2: 783.99,  // G5
      4: 987.77,  // B5
      5: 880.00,  // A5
      6: 783.99,  // G5
      8: 739.99,  // F#5
      10: 587.33, // D5
      12: 659.25, // E5
      14: 739.99, // F#5
      16: 783.99, // G5
      18: 987.77, // B5
      20: 880.00, // A5
      21: 783.99, // G5
      22: 739.99, // F#5
      24: 659.25, // E5
      26: 587.33, // D5
      28: 659.25, // E5
      30: 493.88  // B4
    };

    if (MELODY_MAP[step] !== undefined) {
      const noteFreq = MELODY_MAP[step];
      const duration = (step === 5 || step === 21) ? 0.12 : 0.22;
      playLead(noteFreq, duration);
    }

    this.currentStep++;
  }

  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.25);
  }

  playPowerup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    osc2.frequency.setValueAtTime(335, now);
    osc2.frequency.exponentialRampToValueAtTime(885, now + 0.3);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const duration = 0.12;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.12, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * duration + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + 0.3);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playReset() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

export const sound = new SoundEngine();
