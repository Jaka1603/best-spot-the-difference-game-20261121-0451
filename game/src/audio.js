// DOUBLE LIGHT — every sound is synthesized with WebAudio.
// No audio files, no network: short oscillator blips with a gain envelope.
// The find chime climbs a little higher with each step of the streak.

// Pentatonic-ish ladder the find chime walks up as the streak grows.
const FIND_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5];

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // The context is created lazily on the first sound, which is always
  // after a user gesture, so autoplay rules stay happy.
  ensure() {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  tone(freq, seconds, type, volume, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.05);
    } catch {
      // Sound is garnish: a failure here must never break the game.
    }
  }

  click() {
    this.tone(660, 0.06, 'sine', 0.08);
  }

  // Two notes: the base note, then one a fifth up, pitched by streak.
  find(streak) {
    const base = FIND_NOTES[Math.min(Math.max(streak - 1, 0), FIND_NOTES.length - 1)];
    this.tone(base, 0.16, 'sine', 0.16);
    this.tone(base * 1.5, 0.22, 'sine', 0.12, 0.07);
  }

  wrong() {
    this.tone(150, 0.22, 'sawtooth', 0.1);
    this.tone(110, 0.25, 'sawtooth', 0.08, 0.05);
  }

  hint() {
    this.tone(880, 0.12, 'sine', 0.1);
    this.tone(1174.7, 0.18, 'sine', 0.1, 0.09);
  }

  tick() {
    this.tone(1050, 0.05, 'square', 0.05);
  }

  clear() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.12, i * 0.09));
  }

  over() {
    const notes = [392, 329.63, 261.63, 196];
    notes.forEach((n, i) => this.tone(n, 0.3, 'triangle', 0.12, i * 0.12));
  }
}
