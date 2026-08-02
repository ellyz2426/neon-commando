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

  // Ambient military march music
  startMusic() {
    if (this.musicPlaying || !this.ctx || !this.musicGain) return;
    this.ensureCtx();
    this.musicPlaying = true;

    // Bass drone
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = 55;
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0.12;
    bass.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start();
    this.musicOscs.push(bass);

    // Arpeggio
    const arp = this.ctx.createOscillator();
    arp.type = 'triangle';
    arp.frequency.value = 110;
    const arpGain = this.ctx.createGain();
    arpGain.gain.value = 0.06;
    // LFO for arpeggio
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 4;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfoGain.connect(arp.frequency);
    lfo.start();
    this.musicOscs.push(lfo);

    arp.connect(arpGain);
    arpGain.connect(this.musicGain);
    arp.start();
    this.musicOscs.push(arp);

    // Pad
    const pad = this.ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 165;
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.04;
    pad.connect(padGain);
    padGain.connect(this.musicGain);
    pad.start();
    this.musicOscs.push(pad);
  }

  stopMusic() {
    for (const osc of this.musicOscs) {
      try { osc.stop(); } catch {}
    }
    this.musicOscs = [];
    this.musicPlaying = false;
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) this.masterGain.gain.value = vol;
  }

  update() {
    // Keep audio context alive
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}
