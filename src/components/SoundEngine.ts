// Web Audio API Synthesizer for Base Chain Maze retro-tech sounds
class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = false;
  private musicInterval: any = null;
  private currentStep: number = 0;

  constructor() {
    // Lazy initialisation to prevent audio playing warnings before interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(isMuted: boolean) {
    this.muted = isMuted;
  }

  isMuted() {
    return this.muted;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  private startMusicLoop() {
    if (this.musicInterval) return; // Already running
    this.init();
    
    // Play immediately on start
    this.playMusicStep();
    
    // Run loop every 300ms (steady, relaxing tempo)
    this.musicInterval = window.setInterval(() => {
      this.playMusicStep();
    }, 300);
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
    
    // Beautiful flowing pentatonic arpeggio chords (C minor, G minor, Ab Major, Bb Major)
    const MELODY = [
      130.81, 261.63, 311.13, 392.00, 523.25, 392.00, 311.13, 261.63, // C minor
      98.00, 196.00, 233.08, 293.66, 392.00, 293.66, 233.08, 196.00,  // G minor
      103.83, 207.65, 261.63, 311.13, 415.30, 311.13, 261.63, 207.65, // Ab Major
      116.54, 233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 233.08  // Bb Major
    ];

    const freq = MELODY[this.currentStep % MELODY.length];
    
    // Play the arpeggio note (sine wave for nice mellow sound)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Warm low-pass filter to keep it subtle and atmospheric
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    // Envelope: gentle attack, nice long release
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.04); // extremely low volume background pad
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);

    // Every 8 steps (beginning of each chord measure), trigger a deep, warm sub bass note
    if (this.currentStep % 8 === 0) {
      const bassRoots = [65.41, 49.00, 51.91, 58.27]; // C2, G1, Ab1, Bb1
      const bassFreq = bassRoots[Math.floor(this.currentStep / 8) % bassRoots.length];
      
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      
      // Warm bass envelope
      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.018, now + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      
      bassOsc.start(now);
      bassOsc.stop(now + 1.2);
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
