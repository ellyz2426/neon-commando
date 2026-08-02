/**
 * Neon Commando VR — Audio System
 * Procedural sound effects + ambient music
 */

import { createSystem, World } from '@iwsdk/core';

export class AudioSystem extends createSystem({}) {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];
  private musicPlaying = false;
  private initialized = false;
  private volume = 0.5;

  init() {
    this.initAudio();
  }

  private initAudio() {
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch {
      this.initialized = false;
    }
  }

  private ensureCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.initAudio();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.3) {
    if (!this.ctx || !this.sfxGain) return;
    this.ensureCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playShoot() {
    this.playTone(880, 0.08, 'square', 0.2);
    this.playTone(1200, 0.05, 'sawtooth', 0.1);
  }

  playEnemyShoot() {
    this.playTone(440, 0.1, 'sawtooth', 0.15);
  }

  playHit() {
    this.playTone(300, 0.1, 'triangle', 0.2);
    this.playTone(600, 0.06, 'square', 0.1);
  }

  playEnemyDeath() {
    this.playTone(200, 0.15, 'sawtooth', 0.25);
    this.playTone(100, 0.2, 'square', 0.15);
    setTimeout(() => this.playTone(80, 0.15, 'triangle', 0.1), 50);
  }

  playPlayerDeath() {
    this.playTone(400, 0.3, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.25), 100);
    setTimeout(() => this.playTone(100, 0.4, 'sawtooth', 0.2), 200);
  }

  playExplosion() {
    if (!this.ctx || !this.sfxGain) return;
    this.ensureCtx();
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    src.connect(gain);
    gain.connect(this.sfxGain);
    src.start();

    this.playTone(60, 0.3, 'sine', 0.3);
    this.playTone(40, 0.4, 'sine', 0.2);
  }

  playPowerUp() {
    this.playTone(500, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(700, 0.1, 'sine', 0.2), 50);
    setTimeout(() => this.playTone(1000, 0.15, 'sine', 0.2), 100);
  }

  playWaveStart() {
    this.playTone(400, 0.15, 'sine', 0.2);
    setTimeout(() => this.playTone(600, 0.15, 'sine', 0.2), 100);
    setTimeout(() => this.playTone(800, 0.2, 'sine', 0.25), 200);
    setTimeout(() => this.playTone(1000, 0.25, 'sine', 0.2), 300);
  }

  playShieldBreak() {
    this.playTone(1000, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(500, 0.2, 'sawtooth', 0.2), 50);
  }

  playMenuSelect() {
    this.playTone(600, 0.08, 'sine', 0.2);
  }

  playMenuConfirm() {
    this.playTone(800, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.2), 80);
  }

  playGrenade() {
    this.playTone(300, 0.1, 'triangle', 0.2);
    this.playTone(500, 0.08, 'square', 0.15);
  }

  playVehicleMount() {
    this.playTone(200, 0.15, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(350, 0.12, 'square', 0.15), 80);
    setTimeout(() => this.playTone(500, 0.1, 'sine', 0.2), 160);
  }

  playVehicleDismount() {
    this.playTone(500, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(300, 0.12, 'sawtooth', 0.15), 80);
  }

  playVehicleGun() {
    this.playTone(700, 0.05, 'square', 0.15);
    this.playTone(1000, 0.04, 'sawtooth', 0.1);
  }

  playSupplyDrop() {
    this.playTone(150, 0.2, 'sine', 0.2);
    setTimeout(() => this.playTone(200, 0.15, 'triangle', 0.15), 100);
    setTimeout(() => this.playTone(100, 0.3, 'sine', 0.25), 200);
  }

  playMissionComplete() {
    this.playTone(600, 0.15, 'sine', 0.25);
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.25), 100);
    setTimeout(() => this.playTone(1000, 0.15, 'sine', 0.25), 200);
    setTimeout(() => this.playTone(1200, 0.25, 'sine', 0.3), 300);
  }

  playAchievementUnlock() {
    this.playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(1000, 0.1, 'sine', 0.2), 70);
    setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.2), 140);
    setTimeout(() => this.playTone(1600, 0.2, 'sine', 0.3), 210);
  }

  playCompanionShoot() {
    this.playTone(660, 0.06, 'square', 0.1);
    this.playTone(900, 0.04, 'sawtooth', 0.08);
  }

  playCompanionDeath() {
    this.playTone(300, 0.2, 'triangle', 0.2);
    setTimeout(() => this.playTone(150, 0.3, 'triangle', 0.15), 100);
  }

  playBossEntrance() {
    if (!this.ctx || !this.sfxGain) return;
    this.ensureCtx();
    // Low rumble + alarm
    this.playTone(40, 0.5, 'sine', 0.3);
    this.playTone(60, 0.4, 'sawtooth', 0.15);
    setTimeout(() => {
      this.playTone(400, 0.15, 'square', 0.25);
      this.playTone(600, 0.15, 'square', 0.2);
    }, 200);
    setTimeout(() => {
      this.playTone(400, 0.15, 'square', 0.25);
      this.playTone(600, 0.15, 'square', 0.2);
    }, 500);
  }

  // Dynamic ambient music with wave-based intensity
  private musicIntensity = 0;
  private musicGainNodes: GainNode[] = [];
  private musicScheduleTimer: any = null;

  startMusic() {
    if (this.musicPlaying || !this.ctx || !this.musicGain) return;
    this.ensureCtx();
    this.musicPlaying = true;
    this.musicIntensity = 0;

    // Base layer: bass drone (always on)
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = 55;
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0.1;
    bass.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start();
    this.musicOscs.push(bass);
    this.musicGainNodes.push(bassGain);

    // Arpeggio with LFO (always on, speed varies)
    const arp = this.ctx.createOscillator();
    arp.type = 'triangle';
    arp.frequency.value = 110;
    const arpGain = this.ctx.createGain();
    arpGain.gain.value = 0.04;
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 3;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 25;
    lfo.connect(lfoGain);
    lfoGain.connect(arp.frequency);
    lfo.start();
    this.musicOscs.push(lfo);
    arp.connect(arpGain);
    arpGain.connect(this.musicGain);
    arp.start();
    this.musicOscs.push(arp);
    this.musicGainNodes.push(arpGain);

    // Pad layer (grows with intensity)
    const pad = this.ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 165;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.02;
    pad.connect(padGain);
    padGain.connect(this.musicGain);
    pad.start();
    this.musicOscs.push(pad);
    this.musicGainNodes.push(padGain);

    // Intensity layer 2: second harmony osc (waves 10+)
    const harm = this.ctx.createOscillator();
    harm.type = 'sawtooth';
    harm.frequency.value = 82.5;
    const harmGain = this.ctx.createGain();
    harmGain.gain.value = 0;
    harm.connect(harmGain);
    harmGain.connect(this.musicGain);
    harm.start();
    this.musicOscs.push(harm);
    this.musicGainNodes.push(harmGain);

    // Intensity layer 3: high tension osc (waves 20+)
    const tension = this.ctx.createOscillator();
    tension.type = 'square';
    tension.frequency.value = 220;
    const tensionGain = this.ctx.createGain();
    tensionGain.gain.value = 0;
    tension.connect(tensionGain);
    tensionGain.connect(this.musicGain);
    tension.start();
    this.musicOscs.push(tension);
    this.musicGainNodes.push(tensionGain);

    // Bass hits layer (boss fights)
    const subBass = this.ctx.createOscillator();
    subBass.type = 'sine';
    subBass.frequency.value = 35;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0;
    subBass.connect(subGain);
    subGain.connect(this.musicGain);
    subBass.start();
    this.musicOscs.push(subBass);
    this.musicGainNodes.push(subGain);
  }

  setMusicIntensity(level: number) {
    if (!this.ctx || !this.musicPlaying) return;
    this.musicIntensity = level;
    const t = this.ctx.currentTime;

    // gainNodes: [bass, arp, pad, harmony, tension, subBass]
    if (this.musicGainNodes.length < 6) return;

    // LFO is at index 0 in musicOscs, arp at index 2
    // Adjust LFO speed for tempo increase
    if (this.musicOscs.length >= 3) {
      const lfo = this.musicOscs[0]; // first osc pushed is bass, second is lfo
      const lfoFreqs = [3, 4, 6, 8]; // calm, normal, intense, frantic
      if (this.musicOscs[1]) this.musicOscs[1].frequency.linearRampToValueAtTime(lfoFreqs[level] || 3, t + 1);
    }

    // Bass: louder with intensity
    this.musicGainNodes[0].gain.linearRampToValueAtTime([0.08, 0.1, 0.14, 0.18][level] || 0.1, t + 1);
    // Arp: louder with intensity
    this.musicGainNodes[1].gain.linearRampToValueAtTime([0.03, 0.05, 0.07, 0.09][level] || 0.04, t + 1);
    // Pad: grows
    this.musicGainNodes[2].gain.linearRampToValueAtTime([0.02, 0.03, 0.05, 0.06][level] || 0.02, t + 1);
    // Harmony osc: active at level 2+
    this.musicGainNodes[3].gain.linearRampToValueAtTime(level >= 2 ? 0.04 : 0, t + 1);
    // Tension osc: active at level 3
    this.musicGainNodes[4].gain.linearRampToValueAtTime(level >= 3 ? 0.03 : 0, t + 1);
    // Sub bass: boss mode hits
    this.musicGainNodes[5].gain.linearRampToValueAtTime(level >= 3 ? 0.08 : 0, t + 1);
  }

  stopMusic() {
    for (const osc of this.musicOscs) {
      try { osc.stop(); } catch {}
    }
    this.musicOscs = [];
    this.musicGainNodes = [];
    this.musicPlaying = false;
    this.musicIntensity = 0;
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) this.masterGain.gain.value = vol;
  }

  setSfxMuted(muted: boolean) {
    if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 0.5;
  }

  setMusicMuted(muted: boolean) {
    if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 0.15;
  }

  update() {
    // Keep audio context alive
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}
