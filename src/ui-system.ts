/**
 * Neon Commando VR — UI System
 * Wires PanelUI spatial panels using qualify events
 */

import {
  createSystem,
  World,
  PanelUI,
  PanelDocument,
  UIKitDocument,
  UIKit,
  eq,
  Entity,
  Follower,
  ScreenSpace,
  Vector3,
} from '@iwsdk/core';
import { GameSystem, GameState } from './game.js';
import { AudioSystem } from './audio.js';

const getDoc = (e: Entity) =>
  e.getValue(PanelDocument, 'document') as UIKitDocument | undefined;
const setText = (doc: UIKitDocument | undefined, id: string, text: string) =>
  (doc?.getElementById(id) as UIKit.Text | undefined)?.setProperties({ text });
const setVis = (doc: UIKitDocument | undefined, id: string, visible: boolean) =>
  (doc?.getElementById(id) as UIKit.Container | undefined)?.setProperties({
    display: visible ? 'flex' : 'none',
  });

export class UISystem extends createSystem({
  menuPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/menu.json')],
  },
  hudPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/hud.json')],
  },
  pausePanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/pause.json')],
  },
  resultsPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/results.json')],
  },
  settingsPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/settings.json')],
  },
  statsPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/stats.json')],
  },
  tutorialPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/tutorial.json')],
  },
  achievementsPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/achievements.json')],
  },
  leaderboardPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/leaderboard.json')],
  },
}) {
  private gameSystem!: GameSystem;
  private audioSystem!: AudioSystem;
  private menuEntity: Entity | null = null;
  private hudEntity: Entity | null = null;
  private pauseEntity: Entity | null = null;
  private resultsEntity: Entity | null = null;
  private settingsEntity: Entity | null = null;
  private statsEntity: Entity | null = null;
  private tutorialEntity: Entity | null = null;
  private achievementsEntity: Entity | null = null;
  private leaderboardEntity: Entity | null = null;
  private menuDoc: UIKitDocument | null = null;
  private hudDoc: UIKitDocument | null = null;
  private pauseDoc: UIKitDocument | null = null;
  private resultsDoc: UIKitDocument | null = null;
  private settingsDoc: UIKitDocument | null = null;
  private statsDoc: UIKitDocument | null = null;
  private tutorialDoc: UIKitDocument | null = null;
  private achievementsDoc: UIKitDocument | null = null;
  private leaderboardDoc: UIKitDocument | null = null;
  private selectedMode = 0;
  private selectedDifficulty = 0;
  private lastPhase = '';
  private achievementToastTimer = 0;

  init() {
    this.gameSystem = this.world.getSystem(GameSystem) as unknown as GameSystem;
    this.audioSystem = this.world.getSystem(AudioSystem) as unknown as AudioSystem;

    // Link audio to game system for SFX calls
    (this.gameSystem as any).audioSystem = this.audioSystem;

    this.createPanels();
    this.subscribePanels();
  }

  private createPanels() {
    // Menu panel — world space, in front of player
    this.menuEntity = this.world.createTransformEntity();
    this.menuEntity.object3D!.position.set(0, 3, -4);
    this.menuEntity.addComponent(PanelUI, { config: './ui/menu.json' });

    // HUD panel — head-locked
    this.hudEntity = this.world.createTransformEntity();
    this.hudEntity.addComponent(PanelUI, { config: './ui/hud.json' });
    this.hudEntity.addComponent(Follower, { target: this.world.player.head });
    this.hudEntity.addComponent(ScreenSpace, {});
    const hudOff = this.hudEntity.getVectorView(Follower, 'offsetPosition');
    hudOff[0] = 0; hudOff[1] = -0.35; hudOff[2] = -1;

    // Pause panel — world space
    this.pauseEntity = this.world.createTransformEntity();
    this.pauseEntity.object3D!.position.set(0, 3, -3);
    this.pauseEntity.addComponent(PanelUI, { config: './ui/pause.json' });

    // Results panel — world space
    this.resultsEntity = this.world.createTransformEntity();
    this.resultsEntity.object3D!.position.set(0, 3, -4);
    this.resultsEntity.addComponent(PanelUI, { config: './ui/results.json' });

    // Settings panel — world space, right side
    this.settingsEntity = this.world.createTransformEntity();
    this.settingsEntity.object3D!.position.set(3, 3, -4);
    this.settingsEntity.object3D!.rotation.y = -0.3;
    this.settingsEntity.addComponent(PanelUI, { config: './ui/settings.json' });

    // Stats panel — world space, left side
    this.statsEntity = this.world.createTransformEntity();
    this.statsEntity.object3D!.position.set(-3, 3, -4);
    this.statsEntity.object3D!.rotation.y = 0.3;
    this.statsEntity.addComponent(PanelUI, { config: './ui/stats.json' });

    // Tutorial panel — world space
    this.tutorialEntity = this.world.createTransformEntity();
    this.tutorialEntity.object3D!.position.set(0, 2, -3);
    this.tutorialEntity.addComponent(PanelUI, { config: './ui/tutorial.json' });

    // Achievements panel — world space, right side
    this.achievementsEntity = this.world.createTransformEntity();
    this.achievementsEntity.object3D!.position.set(3.5, 3, -3.5);
    this.achievementsEntity.object3D!.rotation.y = -0.35;
    this.achievementsEntity.addComponent(PanelUI, { config: './ui/achievements.json' });

    // Leaderboard panel — world space, behind menu
    this.leaderboardEntity = this.world.createTransformEntity();
    this.leaderboardEntity.object3D!.position.set(0, 3, -4.5);
    this.leaderboardEntity.addComponent(PanelUI, { config: './ui/leaderboard.json' });

  }

  private subscribePanels() {
    // Menu panel qualify
    this.queries.menuPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.menuDoc = doc;

      // Mode buttons
      const modes = ['btn-arcade', 'btn-speed', 'btn-zen', 'btn-challenge'];
      modes.forEach((id, idx) => {
        const btn = doc.getElementById(id) as UIKit.Text | undefined;
        btn?.addEventListener('click', () => {
          this.selectedMode = idx;
          this.audioSystem.playMenuSelect();
          this.updateMenuHighlights();
        });
      });

      // Difficulty buttons
      const diffs = ['btn-normal', 'btn-hard', 'btn-insane'];
      diffs.forEach((id, idx) => {
        const btn = doc.getElementById(id) as UIKit.Text | undefined;
        btn?.addEventListener('click', () => {
          this.selectedDifficulty = idx;
          this.audioSystem.playMenuSelect();
          this.updateMenuHighlights();
        });
      });

      // Start button
      const startBtn = doc.getElementById('btn-start') as UIKit.Text | undefined;
      startBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuConfirm();
        this.audioSystem.startMusic();
        this.gameSystem.startGame(this.selectedMode, this.selectedDifficulty);
      });

      // Settings button
      const settingsBtn = doc.getElementById('btn-settings') as UIKit.Text | undefined;
      settingsBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.settingsEntity, true);
      });

      // Stats button
      const statsBtn = doc.getElementById('btn-stats') as UIKit.Text | undefined;
      statsBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.updateStatsPanel();
        this.togglePanel(this.statsEntity, true);
      });

      // Tutorial button
      const tutBtn = doc.getElementById('btn-tutorial') as UIKit.Text | undefined;
      tutBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.tutorialEntity, true);
      });

      // Achievements button (reuse stats btn or add separate)
      const achBtn = doc.getElementById('btn-achievements') as UIKit.Text | undefined;
      achBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.updateAchievementsPanel();
        this.togglePanel(this.achievementsEntity, true);
      });

      // Leaderboard button
      const lbBtn = doc.getElementById('btn-leaderboard') as UIKit.Text | undefined;
      lbBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.updateLeaderboardPanel();
        this.togglePanel(this.leaderboardEntity, true);
      });

      this.updateMenuHighlights();
    });

    // HUD panel qualify
    this.queries.hudPanel.subscribe('qualify', (entity) => {
      this.hudDoc = getDoc(entity) || null;
    });

    // Pause panel qualify
    this.queries.pausePanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.pauseDoc = doc;

      const resumeBtn = doc.getElementById('btn-resume') as UIKit.Text | undefined;
      resumeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuConfirm();
        this.gameSystem.getState().phase = 'playing';
      });

      const quitBtn = doc.getElementById('btn-quit') as UIKit.Text | undefined;
      quitBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.audioSystem.stopMusic();
        this.gameSystem.getState().phase = 'menu';
      });
    });

    // Results panel qualify
    this.queries.resultsPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.resultsDoc = doc;

      const retryBtn = doc.getElementById('btn-retry') as UIKit.Text | undefined;
      retryBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuConfirm();
        this.audioSystem.startMusic();
        this.gameSystem.startGame(this.selectedMode, this.selectedDifficulty);
      });

      const menuBtn = doc.getElementById('btn-menu') as UIKit.Text | undefined;
      menuBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.audioSystem.stopMusic();
        this.gameSystem.getState().phase = 'menu';
      });
    });

    // Settings panel qualify
    this.queries.settingsPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.settingsDoc = doc;

      // Color scheme buttons
      const schemes = ['btn-military', 'btn-desert', 'btn-arctic', 'btn-neon'];
      schemes.forEach((id, idx) => {
        const btn = doc.getElementById(id) as UIKit.Text | undefined;
        btn?.addEventListener('click', () => {
          this.audioSystem.playMenuSelect();
          this.gameSystem.getState().colorScheme = idx;
        });
      });

      // SFX toggle
      const sfxBtn = doc.getElementById('btn-sfx-toggle') as UIKit.Text | undefined;
      sfxBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        const s = this.gameSystem.getState();
        s.sfxMuted = !s.sfxMuted;
        this.audioSystem.setSfxMuted(s.sfxMuted);
        setText(doc, 'btn-sfx-toggle', s.sfxMuted ? 'SFX: OFF' : 'SFX: ON');
        this.gameSystem.saveSettings();
      });

      // Music toggle
      const musicBtn = doc.getElementById('btn-music-toggle') as UIKit.Text | undefined;
      musicBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        const s = this.gameSystem.getState();
        s.musicMuted = !s.musicMuted;
        this.audioSystem.setMusicMuted(s.musicMuted);
        setText(doc, 'btn-music-toggle', s.musicMuted ? 'Music: OFF' : 'Music: ON');
        this.gameSystem.saveSettings();
      });

      // Shake intensity buttons
      const shakeIds = ['btn-shake-off', 'btn-shake-low', 'btn-shake-high'];
      shakeIds.forEach((id, idx) => {
        const btn = doc.getElementById(id) as UIKit.Text | undefined;
        btn?.addEventListener('click', () => {
          this.audioSystem.playMenuSelect();
          this.gameSystem.getState().shakeIntensity = idx;
          this.updateShakeHighlights(doc);
          this.gameSystem.saveSettings();
        });
      });

      // Close button
      const closeBtn = doc.getElementById('btn-close-settings') as UIKit.Text | undefined;
      closeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.settingsEntity, false);
      });

      // Init display state
      const s = this.gameSystem.getState();
      setText(doc, 'btn-sfx-toggle', s.sfxMuted ? 'SFX: OFF' : 'SFX: ON');
      setText(doc, 'btn-music-toggle', s.musicMuted ? 'Music: OFF' : 'Music: ON');
      this.audioSystem.setSfxMuted(s.sfxMuted);
      this.audioSystem.setMusicMuted(s.musicMuted);
      this.updateShakeHighlights(doc);
    });

    // Stats panel qualify
    this.queries.statsPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.statsDoc = doc;

      const closeBtn = doc.getElementById('btn-close-stats') as UIKit.Text | undefined;
      closeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.statsEntity, false);
      });
    });

    // Tutorial panel qualify
    this.queries.tutorialPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.tutorialDoc = doc;

      const closeBtn = doc.getElementById('btn-close-tutorial') as UIKit.Text | undefined;
      closeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.tutorialEntity, false);
      });
    });

    // Achievements panel qualify
    this.queries.achievementsPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.achievementsDoc = doc;

      const closeBtn = doc.getElementById('btn-close-achievements') as UIKit.Text | undefined;
      closeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.achievementsEntity, false);
      });
    });

    // Leaderboard panel qualify
    this.queries.leaderboardPanel.subscribe('qualify', (entity) => {
      const doc = getDoc(entity);
      if (!doc) return;
      this.leaderboardDoc = doc;

      const closeBtn = doc.getElementById('btn-close-leaderboard') as UIKit.Text | undefined;
      closeBtn?.addEventListener('click', () => {
        this.audioSystem.playMenuSelect();
        this.togglePanel(this.leaderboardEntity, false);
      });
    });
  }

  private togglePanel(entity: Entity | null, show: boolean) {
    if (!entity?.object3D) return;
    entity.object3D.visible = show;
  }

  private updateMenuHighlights() {
    if (!this.menuDoc) return;
    const modes = ['btn-arcade', 'btn-speed', 'btn-zen', 'btn-challenge'];
    const modeLabels = ['> Arcade <', 'Speed', 'Zen', 'Challenge'];
    modes.forEach((id, idx) => {
      const isSelected = idx === this.selectedMode;
      setText(this.menuDoc!, id, isSelected ? `> ${['Arcade', 'Speed', 'Zen', 'Challenge'][idx]} <` : ['Arcade', 'Speed', 'Zen', 'Challenge'][idx]);
    });

    const diffs = ['btn-normal', 'btn-hard', 'btn-insane'];
    diffs.forEach((id, idx) => {
      const isSelected = idx === this.selectedDifficulty;
      setText(this.menuDoc!, id, isSelected ? `> ${['Normal', 'Hard', 'Insane'][idx]} <` : ['Normal', 'Hard', 'Insane'][idx]);
    });
  }

  private updateStatsPanel() {
    if (!this.statsDoc) return;
    const s = this.gameSystem.getState();
    setText(this.statsDoc, 'stat-kills', `Total Kills: ${s.totalKills}`);
    setText(this.statsDoc, 'stat-grenades', `Grenades Used: ${s.totalGrenades}`);
    setText(this.statsDoc, 'stat-shots', `Shots Fired: ${s.totalShots}`);
    setText(this.statsDoc, 'stat-powerups', `Power-Ups: ${s.totalPowerUps}`);
    setText(this.statsDoc, 'stat-waves', `Best Wave: ${s.totalWaves}`);
    setText(this.statsDoc, 'stat-deaths', `Total Deaths: ${s.totalDeaths}`);
    setText(this.statsDoc, 'stat-highscore', `High Score: ${s.highScore}`);
    setText(this.statsDoc, 'stat-missions', `Missions: ${s.careerMissions}`);
    setText(this.statsDoc, 'stat-vehicles', `Vehicles Used: ${s.careerVehiclesUsed}`);
    setText(this.statsDoc, 'stat-minekills', `Mine Kills: ${s.careerMineKills}`);
    setText(this.statsDoc, 'stat-chains', `Chain Explosions: ${s.careerChainExplosions}`);
    setText(this.statsDoc, 'stat-bosskills', `Boss Kills: ${s.careerBossKills}`);
    const survMins = Math.floor(s.longestSurvivalTime / 60);
    const survSecs = Math.floor(s.longestSurvivalTime % 60);
    setText(this.statsDoc, 'stat-besttime', `Best Survival: ${survMins}:${String(survSecs).padStart(2, '0')}`);
    let favWeapon = '---';
    let maxKills = 0;
    for (const [wep, count] of Object.entries(s.weaponKillCounts)) {
      if (count > maxKills) { maxKills = count; favWeapon = wep.toUpperCase(); }
    }
    setText(this.statsDoc, 'stat-favweapon', `Top Weapon: ${favWeapon}`);
  }

  private updateAchievementsPanel() {
    if (!this.achievementsDoc) return;
    const achMap = this.gameSystem.getAchievements();
    const defs = this.gameSystem.getAchievementDefs();
    let unlocked = 0;
    for (let i = 0; i < defs.length; i++) {
      const has = achMap.has(defs[i].id);
      if (has) unlocked++;
      setText(this.achievementsDoc, `ach-${i}`, has ? defs[i].label : defs[i].label.replace('🏆', '🔒'));
    }
    setText(this.achievementsDoc, 'ach-count', `${unlocked} / ${defs.length} Unlocked`);
  }

  private updateLeaderboardPanel() {
    if (!this.leaderboardDoc) return;
    const lb = this.gameSystem.getLeaderboard();
    for (let i = 1; i <= 10; i++) {
      if (i <= lb.length) {
        const e = lb[i - 1];
        setText(this.leaderboardDoc, `lb-${i}`, `#${i}  ${e.score}  W${e.wave}  ${e.date}`);
      } else {
        setText(this.leaderboardDoc, `lb-${i}`, `#${i} ---`);
      }
    }
  }

  private updateShakeHighlights(doc: UIKitDocument) {
    const intensity = this.gameSystem.getState().shakeIntensity;
    const labels = ['Off', 'Low', 'High'];
    const ids = ['btn-shake-off', 'btn-shake-low', 'btn-shake-high'];
    ids.forEach((id, idx) => {
      setText(doc, id, idx === intensity ? `> ${labels[idx]} <` : labels[idx]);
    });
  }

  update(delta: number) {
    const s = this.gameSystem.getState();

    // Phase transitions
    if (s.phase !== this.lastPhase) {
      this.onPhaseChange(s.phase);
      this.lastPhase = s.phase;
    }

    // Update HUD
    if (s.phase === 'playing' && this.hudDoc) {
      this.updateHUD(s, delta);
    }

    // Update results
    if (s.phase === 'results' && this.resultsDoc) {
      this.updateResults(s);
    }
  }

  private onPhaseChange(phase: string) {
    this.togglePanel(this.menuEntity, phase === 'menu');
    this.togglePanel(this.pauseEntity, phase === 'paused');
    this.togglePanel(this.resultsEntity, phase === 'results' || phase === 'gameover');

    // HUD — show/hide via ScreenSpace add/remove
    if (this.hudEntity) {
      if (phase === 'playing') {
        if (!this.hudEntity.hasComponent(ScreenSpace)) {
          this.hudEntity.addComponent(ScreenSpace, {});
        }
        if (!this.hudEntity.hasComponent(Follower)) {
          this.hudEntity.addComponent(Follower, { target: this.world.player.head });
          const off = this.hudEntity.getVectorView(Follower, 'offsetPosition');
          off[0] = 0; off[1] = -0.35; off[2] = -1;
        }
      } else {
        if (this.hudEntity.hasComponent(ScreenSpace)) {
          this.hudEntity.removeComponent(ScreenSpace);
        }
        if (this.hudEntity.hasComponent(Follower)) {
          this.hudEntity.removeComponent(Follower);
        }
      }
    }

    // Hide settings/stats/tutorial when not in menu
    if (phase !== 'menu') {
      this.togglePanel(this.settingsEntity, false);
      this.togglePanel(this.statsEntity, false);
      this.togglePanel(this.tutorialEntity, false);
      this.togglePanel(this.achievementsEntity, false);
      this.togglePanel(this.leaderboardEntity, false);
    }
  }

  private updateHUD(s: GameState, delta: number) {
    if (!this.hudDoc) return;
    setText(this.hudDoc, 'hud-score', `Score: ${s.score}`);
    setText(this.hudDoc, 'hud-lives', `Lives: ${s.lives}`);
    setText(this.hudDoc, 'hud-wave', `Wave ${s.wave}`);
    setText(this.hudDoc, 'hud-grenades', `G: ${s.grenadeCount}`);

    // Wave announcement
    if (s.waveNameTimer > 0) {
      setText(this.hudDoc, 'hud-wave-announce', s.waveName);
    } else {
      setText(this.hudDoc, 'hud-wave-announce', '');
    }

    // Wave progress bar
    if (s.waveEnemiesTotal > 0) {
      const alive = this.gameSystem.getAliveEnemyCount();
      const remaining = s.waveEnemiesLeft + alive;
      const pct = Math.max(0, Math.min(100, ((s.waveEnemiesTotal - remaining) / s.waveEnemiesTotal) * 100));
      setText(this.hudDoc, 'hud-progress-label', `${s.waveEnemiesTotal - remaining}/${s.waveEnemiesTotal}`);
      const fillEl = this.hudDoc?.getElementById('hud-progress-fill') as UIKit.Container | undefined;
      fillEl?.setProperties({ width: Math.round(pct * 1.2) });
    }

    // Boss HP bar
    if (s.bossActive && s.bossEntity) {
      setVis(this.hudDoc, 'hud-boss-progress', true);
      const bossHpPct = Math.max(0, (s.bossEntity.hp / s.bossEntity.maxHp) * 100);
      setText(this.hudDoc, 'hud-boss-label', `${s.bossType.toUpperCase()} ${Math.ceil(bossHpPct)}%`);
      const bossFill = this.hudDoc?.getElementById('hud-boss-fill') as UIKit.Container | undefined;
      bossFill?.setProperties({ width: Math.round(bossHpPct * 1.2) });
    } else {
      setVis(this.hudDoc, 'hud-boss-progress', false);
    }

    // Combo display
    if (s.combo > 1) {
      setText(this.hudDoc, 'hud-combo', `${s.combo}x COMBO`);
    } else {
      setText(this.hudDoc, 'hud-combo', '');
    }

    // Weapon indicator — show name + ammo for homing, timer for timed weapons
    const wNames: Record<string, string> = {
      single: 'RIFLE', spread: 'SPREAD', rapid: 'RAPID', laser: 'LASER',
      flamethrower: 'FLAME', beam: 'BEAM', homing: 'HOMING',
    };
    const wDisp = wNames[s.weaponType] || s.weaponType.toUpperCase();
    if (s.weaponType === 'homing') {
      setText(this.hudDoc, 'hud-weapon', `${wDisp} [${s.homingAmmo}]`);
    } else if (s.weaponType !== 'single') {
      setText(this.hudDoc, 'hud-weapon', `${wDisp} ${Math.ceil(s.weaponTimer)}s`);
    } else if (s.weaponInventory.length > 1) {
      setText(this.hudDoc, 'hud-weapon', `${wDisp} [Tab]`);
    } else {
      setText(this.hudDoc, 'hud-weapon', '');
    }

    // Shield indicator
    if (s.shieldTimer > 0) {
      setText(this.hudDoc, 'hud-shield', `SHIELD ${Math.ceil(s.shieldTimer)}s`);
    } else {
      setText(this.hudDoc, 'hud-shield', '');
    }

    // Speed mode timer
    if (s.mode === 1 && s.modeTimer > 0) {
      setText(this.hudDoc, 'hud-timer', `Time: ${Math.ceil(s.modeTimer)}s`);
    } else {
      setText(this.hudDoc, 'hud-timer', '');
    }

    // Kill streak indicator
    if (s.killStreak >= 3) {
      const nextReward = s.killStreak < 5 ? 5 : s.killStreak < 10 ? 10 : s.killStreak < 15 ? 15 : s.killStreak < 25 ? 25 : 25;
      setText(this.hudDoc, 'hud-streak', `STREAK ${s.killStreak} → ${nextReward}`);
    } else {
      setText(this.hudDoc, 'hud-streak', '');
    }

    // Mission display
    const m = s.currentMission;
    if (m && !m.complete) {
      if (s.missionBriefTimer > 0) {
        setText(this.hudDoc, 'hud-mission-brief', `MISSION: ${m.description}`);
      } else {
        setText(this.hudDoc, 'hud-mission-brief', '');
      }
      setText(this.hudDoc, 'hud-mission-name', m.name);
      setText(this.hudDoc, 'hud-mission-progress', `${m.progress}/${m.target}`);
    } else if (m && m.complete) {
      setText(this.hudDoc, 'hud-mission-name', 'MISSION COMPLETE!');
      setText(this.hudDoc, 'hud-mission-progress', `+${m.bonusScore}`);
      setText(this.hudDoc, 'hud-mission-brief', '');
    } else {
      setText(this.hudDoc, 'hud-mission-name', '');
      setText(this.hudDoc, 'hud-mission-progress', '');
      setText(this.hudDoc, 'hud-mission-brief', '');
    }

    // Radar info text
    const eCount = s.radarEnemies.length;
    const pCount = s.radarPowerUps.length;
    const sCount = s.radarSupplies.length;
    setText(this.hudDoc, 'hud-radar-info', `E:${eCount} P:${pCount} S:${sCount}`);

    // Companion status
    setText(this.hudDoc, 'hud-companion', s.companionAlive ? 'ALLY: ACTIVE' : 'ALLY: DOWN');

    // Achievement toast — show latest unlock briefly
    const achPop = this.gameSystem.popAchievementQueue();
    if (achPop) {
      const defs = this.gameSystem.getAchievementDefs();
      const def = defs.find(d => d.id === achPop);
      if (def) {
        setText(this.hudDoc, 'hud-achievement', def.label);
        this.achievementToastTimer = 3;
      }
    }
    if (this.achievementToastTimer > 0) {
      this.achievementToastTimer -= delta;
      if (this.achievementToastTimer <= 0) {
        setText(this.hudDoc, 'hud-achievement', '');
      }
    }
  }

  private updateResults(s: GameState) {
    if (!this.resultsDoc) return;
    const isGameover = s.phase === 'gameover';
    setText(this.resultsDoc, 'results-title', isGameover ? 'GAME OVER' : 'MISSION COMPLETE');
    setText(this.resultsDoc, 'results-score', `Score: ${s.score}`);
    setText(this.resultsDoc, 'results-highscore', `High Score: ${s.highScore}`);
    const rating = this.gameSystem.getPerformanceRating();
    setText(this.resultsDoc, 'results-rating', `Rating: ${rating}`);
    setText(this.resultsDoc, 'results-wave', `Wave Reached: ${s.wave}`);
    setText(this.resultsDoc, 'results-kills', `Enemies Killed: ${s.kills}`);
    setText(this.resultsDoc, 'results-combo', `Best Combo: ${s.bestCombo}x`);
    setText(this.resultsDoc, 'results-time', `Time: ${Math.floor(s.gameTime / 60)}:${String(Math.floor(s.gameTime % 60)).padStart(2, '0')}`);
    setText(this.resultsDoc, 'results-missions', `Missions: ${s.missionsCompleted}`);
    setText(this.resultsDoc, 'results-achievements', `Achievements: ${s.runAchievementsEarned}`);
  }
}
