/**
 * Neon Commando VR — Core Game System
 * Top-down run-and-gun military shooter arcade
 */

import {
  createSystem,
  World,
  InputComponent,
  Mesh,
  Group,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  PlaneGeometry,
  ConeGeometry,
  TorusGeometry,
  RingGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  Color,
  Vector3,
  Quaternion,
  Euler,
  Fog,
  FogExp2,
  AmbientLight,
  PointLight,
  DirectionalLight,
  BufferGeometry,
  Float32BufferAttribute,
  EdgesGeometry,
  LineSegments,
  AdditiveBlending,
  DoubleSide,
  BackSide,
} from '@iwsdk/core';

// ── Types ──
interface Bullet {
  mesh: Mesh;
  vx: number;
  vz: number;
  life: number;
  isEnemy: boolean;
  damage: number;
}

interface Enemy {
  id: number;
  mesh: Group;
  type: string;
  hp: number;
  maxHp: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  shootTimer: number;
  shootInterval: number;
  points: number;
  moveTimer: number;
  aggroRange: number;
  speed: number;
  dead: boolean;
  deathTimer: number;
  flashTimer: number;
}

interface Grenade {
  mesh: Group;
  x: number;
  z: number;
  vx: number;
  vz: number;
  vy: number;
  y: number;
  timer: number;
  bounced: boolean;
}

interface Explosion {
  mesh: Group;
  timer: number;
  maxTime: number;
  radius: number;
}

interface PowerUp {
  mesh: Group;
  type: string;
  x: number;
  z: number;
  bobTimer: number;
}

interface Particle {
  mesh: Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface Obstacle {
  mesh: Group;
  type: string;
  x: number;
  z: number;
  hp: number;
  destructible: boolean;
  radius: number;
}

interface SupplyCrate {
  mesh: Group;
  x: number;
  z: number;
  vy: number;
  y: number;
  landed: boolean;
  bobTimer: number;
  life: number;
}

interface FlameParticle {
  mesh: Mesh;
  x: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface BeamState {
  active: boolean;
  angle: number;
  length: number;
  mesh: Mesh | null;
}

interface Vehicle {
  mesh: Group;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  occupied: boolean;
  bobTimer: number;
  gunCooldown: number;
}

interface MuzzleFlash {
  mesh: Mesh;
  life: number;
}

interface TracerRound {
  mesh: Group;
  vx: number;
  vz: number;
  life: number;
}

interface TerrainFeature {
  mesh: Group;
  z: number;
  type: 'river' | 'bunker' | 'trench';
}

interface Mission {
  type: 'destroy' | 'rescue' | 'extraction' | 'commander';
  name: string;
  description: string;
  target: number;
  progress: number;
  complete: boolean;
  bonusScore: number;
}

interface Companion {
  mesh: Group;
  x: number;
  z: number;
  alive: boolean;
  shootTimer: number;
}

interface POWCage {
  mesh: Group;
  x: number;
  z: number;
  rescued: boolean;
}

interface Mine {
  mesh: Group;
  x: number;
  z: number;
  pulseTimer: number;
  armed: boolean;
}

interface ScorePopup {
  mesh: Group;
  y: number;
  vy: number;
  life: number;
}

interface HomingMissile {
  mesh: Group;
  x: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  targetId: number;
}

interface FuelDrum {
  mesh: Group;
  x: number;
  z: number;
  hp: number;
}

interface ElectricFence {
  mesh: Group;
  x: number;
  z: number;
  length: number;
  angle: number;
  electrifiedTimer: number;
  onDuration: number;
  offDuration: number;
  isOn: boolean;
  sparkMeshes: Mesh[];
}

interface MortarZone {
  mesh: Group;
  x: number;
  z: number;
  radius: number;
  timer: number;
  warningTime: number;
  impactPending: boolean;
}

interface UpgradeToken {
  mesh: Group;
  x: number;
  z: number;
  bobTimer: number;
}

interface BonusObjective {
  type: string;
  description: string;
  target: number;
  progress: number;
  timeLeft: number;
  bonusScore: number;
}

interface TurretEmplacement {
  mesh: Group;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  occupied: boolean;
  angle: number;
  shootCooldown: number;
}

interface Decoy {
  mesh: Group;
  x: number;
  z: number;
  timer: number;
  maxTime: number;
}

interface WeatherParticle {
  mesh: Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

interface ThreatArrow {
  mesh: Group;
  enemyId: number;
}

interface DogTag {
  mesh: Group;
  x: number;
  z: number;
  bobTimer: number;
}

interface RadioChatter {
  text: string;
  timer: number;
}

interface AirStrike {
  x: number;
  z: number;
  timer: number;
  warningMeshes: Mesh[];
  impacted: boolean;
}

// ── Game State ──
export interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'gameover' | 'results';
  score: number;
  highScore: number;
  lives: number;
  wave: number;
  kills: number;
  combo: number;
  comboTimer: number;
  bestCombo: number;
  grenadeCount: number;
  maxGrenades: number;
  weaponType: 'single' | 'spread' | 'rapid' | 'laser' | 'flamethrower' | 'beam' | 'homing';
  weaponTimer: number;
  shieldTimer: number;
  speedBoostTimer: number;
  killStreak: number;
  killStreakBest: number;
  killStreakSpeedActive: boolean;
  killStreakRapidActive: boolean;
  killStreakShieldActive: boolean;
  supplyDropTimer: number;
  playerX: number;
  playerZ: number;
  playerAngle: number;
  playerSpeed: number;
  scrollZ: number;
  scrollSpeed: number;
  shootCooldown: number;
  invincibleTimer: number;
  waveTimer: number;
  waveEnemiesLeft: number;
  totalKills: number;
  totalGrenades: number;
  totalShots: number;
  totalPowerUps: number;
  totalWaves: number;
  totalDeaths: number;
  difficulty: number; // 0=normal 1=hard 2=insane
  mode: number; // 0=arcade 1=speed 2=zen 3=challenge
  modeTimer: number;
  colorScheme: number;
  screenShake: number;
  screenShakeX: number;
  screenShakeZ: number;
  gameTime: number;
  enemySpawnTimer: number;
  bossActive: boolean;
  bossEntity: Enemy | null;
  inVehicle: boolean;
  vehicleHp: number;
  vehicleTimer: number;
  // Mission system
  currentMission: Mission | null;
  missionBriefTimer: number;
  missionsCompleted: number;
  // Companion
  companionAlive: boolean;
  companionKills: number;
  // Vehicle kills tracking
  vehicleKills: number;
  // Boss type tracking
  bossType: string;
  // Minimap data (exposed for UI)
  radarEnemies: { rx: number; rz: number }[];
  radarPowerUps: { rx: number; rz: number }[];
  radarSupplies: { rx: number; rz: number }[];
  // Wave progress
  waveEnemiesTotal: number;
  // Damage flash
  damageFlashTimer: number;
  // Wave announcement
  waveName: string;
  waveNameTimer: number;
  // Weapon inventory for weapon cycling
  weaponInventory: Array<{ type: string; ammo: number }>;
  currentWeaponIdx: number;
  // Homing missile ammo
  homingAmmo: number;
  // Music intensity level
  musicIntensity: number;
  // Extended career stats (persisted)
  careerMissions: number;
  careerVehiclesUsed: number;
  careerMineKills: number;
  careerChainExplosions: number;
  careerBossKills: number;
  longestSurvivalTime: number;
  weaponKillCounts: Record<string, number>;
  // Per-run tracking
  runAchievementsEarned: number;
  // Settings (persisted)
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number; // 0-100
  musicVolume: number; // 0-100
  shakeIntensity: number; // 0=off 1=low 2=high
  // Dodge roll
  rollTimer: number;
  rollCooldown: number;
  rollDirX: number;
  rollDirZ: number;
  // Smoke grenades
  smokeGrenadeCount: number;
  currentBiome: number;
  // Weapon upgrade
  weaponUpgradeLevel: number;
  // Revenge surge
  revengeSurgeTimer: number;
  // Bonus objective
  bonusObjective: BonusObjective | null;
  bonusObjectivesCompleted: number;
  // Multi-kill tracking
  multiKillTimer: number;
  multiKillCount: number;
  multiKillBest: number;
  // Turret emplacement
  inTurret: boolean;
  turretHp: number;
  // Decoy hologram
  decoyCooldown: number;
  decoyActive: boolean;
  // Officer tracking
  careerOfficerKills: number;
  careerTurretKills: number;
  careerDecoyUses: number;
  // Weapon pickup flash
  weaponPickupFlashTimer: number;
  weaponPickupName: string;
  // Dog tags
  careerDogTags: number;
  runDogTags: number;
  // Radio chatter
  radioChatter: string;
  radioChatterTimer: number;
  // Air support
  airSupportCooldown: number;
  airSupportReady: boolean;
  careerAirStrikes: number;
  // APC tracking
  careerAPCKills: number;
}

// ── Constants ──
const FIELD_WIDTH = 16;
const FIELD_DEPTH = 24;
const PLAYER_SPEED = 6;
const BULLET_SPEED = 18;
const GRENADE_SPEED = 8;
const ENEMY_BULLET_SPEED = 8;
const SHOOT_COOLDOWN = 0.15;
const RAPID_COOLDOWN = 0.06;
const COMBO_DECAY = 3;
const MAX_ENEMIES = 30;
const MAX_BULLETS = 100;
const MAX_PARTICLES = 200;

const COLOR_SCHEMES = [
  { name: 'Military', primary: '#00ff88', secondary: '#ff4400', accent: '#ffaa00', bg: '#0a1a0a', grid: '#0a2a0a', enemy: '#ff2200', bullet: '#ffff00' },
  { name: 'Desert', primary: '#ffcc44', secondary: '#ff6622', accent: '#ff8844', bg: '#1a1408', grid: '#2a2010', enemy: '#ff4422', bullet: '#ffee00' },
  { name: 'Arctic', primary: '#44ccff', secondary: '#ff4466', accent: '#88ddff', bg: '#081018', grid: '#102030', enemy: '#ff2244', bullet: '#aaeeff' },
  { name: 'Neon', primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00', bg: '#0a0020', grid: '#150030', enemy: '#ff0066', bullet: '#00ff88' },
];

const BIOME_THEMES = [
  { fog: 0x0a1a0a, ground: 0x112211, border: 0x003300, ambient: 0x334433 },
  { fog: 0x1a1408, ground: 0x2a2010, border: 0x443300, ambient: 0x443322 },
  { fog: 0x081018, ground: 0x102030, border: 0x003355, ambient: 0x334455 },
  { fog: 0x0a0020, ground: 0x150030, border: 0x220044, ambient: 0x443355 },
];

// ── Main Game System ──
export class GameSystem extends createSystem({}) {
  private state!: GameState;
  private playerGroup!: Group;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private grenades: Grenade[] = [];
  private explosions: Explosion[] = [];
  private powerUps: PowerUp[] = [];
  private particles: Particle[] = [];
  private obstacles: Obstacle[] = [];
  private terrainGroup!: Group;
  private environmentGroup!: Group;
  private cameraOffset = new Vector3(0, 18, 10);
  private initialized = false;
  private groundTiles: Mesh[] = [];
  private lastTileZ = 0;
  private treads: Mesh[] = [];
  private supplyCrates: SupplyCrate[] = [];
  private flameParticles: FlameParticle[] = [];
  private beamState: BeamState = { active: false, angle: 0, length: 12, mesh: null };
  private vehicles: Vehicle[] = [];
  private muzzleFlashes: MuzzleFlash[] = [];
  private tracerRounds: TracerRound[] = [];
  private terrainFeatures: TerrainFeature[] = [];
  private activeVehicle: Vehicle | null = null;
  private companion: Companion | null = null;
  private powCages: POWCage[] = [];
  private achievements: Map<string, boolean> = new Map();
  private achievementQueue: string[] = [];
  private achievementTimer = 0;
  private mines: Mine[] = [];
  private scorePopups: ScorePopup[] = [];
  private damageFlashMesh: Mesh | null = null;
  private homingMissiles: HomingMissile[] = [];
  private fuelDrums: FuelDrum[] = [];
  private electricFences: ElectricFence[] = [];
  private mortarZones: MortarZone[] = [];
  private smokeClouds: Array<{ meshes: Mesh[]; x: number; z: number; timer: number; maxTime: number; radius: number }> = [];
  private upgradeTokens: UpgradeToken[] = [];
  private turretEmplacements: TurretEmplacement[] = [];
  private decoys: Decoy[] = [];
  private activeTurret: TurretEmplacement | null = null;
  private weatherParticles: WeatherParticle[] = [];
  private threatArrows: ThreatArrow[] = [];
  private weaponPickupFlashMeshes: Mesh[] = [];
  private nextEnemyId = 0;
  private dogTags: DogTag[] = [];
  private radioChatterQueue: string[] = [];
  private airStrikes: AirStrike[] = [];

  init() {
    this.state = this.createDefaultState();
    this.loadHighScore();
    this.loadAchievements();
    this.loadLeaderboard();
    this.setupScene();
    this.initialized = true;
  }

  private createDefaultState(): GameState {
    return {
      phase: 'menu',
      score: 0,
      highScore: 0,
      lives: 3,
      wave: 1,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      grenadeCount: 5,
      maxGrenades: 10,
      weaponType: 'single',
      weaponTimer: 0,
      shieldTimer: 0,
      speedBoostTimer: 0,
      killStreak: 0,
      killStreakBest: 0,
      killStreakSpeedActive: false,
      killStreakRapidActive: false,
      killStreakShieldActive: false,
      supplyDropTimer: 30,
      playerX: 0,
      playerZ: 0,
      playerAngle: 0,
      playerSpeed: PLAYER_SPEED,
      scrollZ: 0,
      scrollSpeed: 3,
      shootCooldown: 0,
      invincibleTimer: 0,
      waveTimer: 0,
      waveEnemiesLeft: 0,
      totalKills: 0,
      totalGrenades: 0,
      totalShots: 0,
      totalPowerUps: 0,
      totalWaves: 0,
      totalDeaths: 0,
      difficulty: 0,
      mode: 0,
      modeTimer: 120,
      colorScheme: 0,
      screenShake: 0,
      screenShakeX: 0,
      screenShakeZ: 0,
      gameTime: 0,
      enemySpawnTimer: 0,
      bossActive: false,
      bossEntity: null,
      inVehicle: false,
      vehicleHp: 0,
      vehicleTimer: 40,
      currentMission: null,
      missionBriefTimer: 0,
      missionsCompleted: 0,
      companionAlive: false,
      companionKills: 0,
      vehicleKills: 0,
      bossType: 'boss',
      radarEnemies: [],
      radarPowerUps: [],
      radarSupplies: [],
      waveEnemiesTotal: 0,
      damageFlashTimer: 0,
      waveName: '',
      waveNameTimer: 0,
      weaponInventory: [{ type: 'single', ammo: -1 }],
      currentWeaponIdx: 0,
      homingAmmo: 0,
      musicIntensity: 0,
      careerMissions: 0,
      careerVehiclesUsed: 0,
      careerMineKills: 0,
      careerChainExplosions: 0,
      careerBossKills: 0,
      longestSurvivalTime: 0,
      weaponKillCounts: {},
      runAchievementsEarned: 0,
      sfxMuted: false,
      musicMuted: false,
      sfxVolume: 50,
      musicVolume: 50,
      shakeIntensity: 1,
      rollTimer: 0,
      rollCooldown: 0,
      rollDirX: 0,
      rollDirZ: 0,
      smokeGrenadeCount: 2,
      currentBiome: 0,
      weaponUpgradeLevel: 0,
      revengeSurgeTimer: 0,
      bonusObjective: null,
      bonusObjectivesCompleted: 0,
      multiKillTimer: 0,
      multiKillCount: 0,
      multiKillBest: 0,
      inTurret: false,
      turretHp: 0,
      decoyCooldown: 0,
      decoyActive: false,
      careerOfficerKills: 0,
      careerTurretKills: 0,
      careerDecoyUses: 0,
      weaponPickupFlashTimer: 0,
      weaponPickupName: '',
      careerDogTags: 0,
      runDogTags: 0,
      radioChatter: '',
      radioChatterTimer: 0,
      airSupportCooldown: 0,
      airSupportReady: true,
      careerAirStrikes: 0,
      careerAPCKills: 0,
    };
  }

  private loadHighScore() {
    try {
      const hs = localStorage.getItem('neon-commando-highscore');
      if (hs) this.state.highScore = parseInt(hs, 10);
      const stats = localStorage.getItem('neon-commando-stats');
      if (stats) {
        const s = JSON.parse(stats);
        this.state.totalKills = s.totalKills || 0;
        this.state.totalGrenades = s.totalGrenades || 0;
        this.state.totalShots = s.totalShots || 0;
        this.state.totalPowerUps = s.totalPowerUps || 0;
        this.state.totalWaves = s.totalWaves || 0;
        this.state.totalDeaths = s.totalDeaths || 0;
        this.state.careerMissions = s.careerMissions || 0;
        this.state.careerVehiclesUsed = s.careerVehiclesUsed || 0;
        this.state.careerMineKills = s.careerMineKills || 0;
        this.state.careerChainExplosions = s.careerChainExplosions || 0;
        this.state.careerBossKills = s.careerBossKills || 0;
        this.state.longestSurvivalTime = s.longestSurvivalTime || 0;
        this.state.weaponKillCounts = s.weaponKillCounts || {};
        this.state.careerOfficerKills = s.careerOfficerKills || 0;
        this.state.careerTurretKills = s.careerTurretKills || 0;
        this.state.careerDecoyUses = s.careerDecoyUses || 0;
        this.state.careerDogTags = s.careerDogTags || 0;
        this.state.careerAirStrikes = s.careerAirStrikes || 0;
        this.state.careerAPCKills = s.careerAPCKills || 0;
      }
      const settings = localStorage.getItem('neon-commando-settings');
      if (settings) {
        const st = JSON.parse(settings);
        this.state.sfxMuted = !!st.sfxMuted;
        this.state.musicMuted = !!st.musicMuted;
        this.state.sfxVolume = typeof st.sfxVolume === 'number' ? st.sfxVolume : 50;
        this.state.musicVolume = typeof st.musicVolume === 'number' ? st.musicVolume : 50;
        this.state.shakeIntensity = typeof st.shakeIntensity === 'number' ? st.shakeIntensity : 1;
      }
    } catch {}
  }

  private saveStats() {
    try {
      if (this.state.score > this.state.highScore) {
        this.state.highScore = this.state.score;
        localStorage.setItem('neon-commando-highscore', String(this.state.highScore));
      }
      if (this.state.gameTime > this.state.longestSurvivalTime) {
        this.state.longestSurvivalTime = this.state.gameTime;
      }
      if (this.state.wave > this.state.totalWaves) {
        this.state.totalWaves = this.state.wave;
      }
      localStorage.setItem('neon-commando-stats', JSON.stringify({
        totalKills: this.state.totalKills,
        totalGrenades: this.state.totalGrenades,
        totalShots: this.state.totalShots,
        totalPowerUps: this.state.totalPowerUps,
        totalWaves: this.state.totalWaves,
        totalDeaths: this.state.totalDeaths,
        careerMissions: this.state.careerMissions,
        careerVehiclesUsed: this.state.careerVehiclesUsed,
        careerMineKills: this.state.careerMineKills,
        careerChainExplosions: this.state.careerChainExplosions,
        careerBossKills: this.state.careerBossKills,
        longestSurvivalTime: this.state.longestSurvivalTime,
        weaponKillCounts: this.state.weaponKillCounts,
        careerOfficerKills: this.state.careerOfficerKills,
        careerTurretKills: this.state.careerTurretKills,
        careerDecoyUses: this.state.careerDecoyUses,
        careerDogTags: this.state.careerDogTags,
        careerAirStrikes: this.state.careerAirStrikes,
        careerAPCKills: this.state.careerAPCKills,
      }));
      this.addToLeaderboard(this.state.score, this.state.wave);
      this.checkScoreAchievements();
    } catch {}
  }

  saveSettings() {
    try {
      localStorage.setItem('neon-commando-settings', JSON.stringify({
        sfxMuted: this.state.sfxMuted,
        musicMuted: this.state.musicMuted,
        sfxVolume: this.state.sfxVolume,
        musicVolume: this.state.musicVolume,
        shakeIntensity: this.state.shakeIntensity,
      }));
    } catch {}
  }

  private getColors() {
    return COLOR_SCHEMES[this.state.colorScheme];
  }

  private setupScene() {
    const scene = this.world.scene;
    const colors = this.getColors();

    // Fog
    scene.fog = new FogExp2(new Color(colors.bg).getHex(), 0.02);
    scene.background = new Color(colors.bg);

    // Lighting
    const ambient = new AmbientLight(0x334433, 0.6);
    scene.add(ambient);
    const dirLight = new DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(5, 20, 5);
    scene.add(dirLight);

    // Environment group
    this.environmentGroup = new Group();
    scene.add(this.environmentGroup);

    // Terrain group
    this.terrainGroup = new Group();
    scene.add(this.terrainGroup);

    // Build ground
    this.buildGround();

    // Build environment (pillars, border walls)
    this.buildEnvironment();

    // Player
    this.playerGroup = new Group();
    this.buildPlayer();
    scene.add(this.playerGroup);

    // Damage flash overlay
    this.createDamageFlash();

    // Camera setup (top-down angled)
    this.world.camera.position.set(0, 18, 10);
    this.world.camera.lookAt(0, 0, 0);
  }

  private buildGround() {
    const colors = this.getColors();
    // Create ground tiles
    for (let i = -3; i < 8; i++) {
      const tile = this.createGroundTile(i * 8, colors);
      this.terrainGroup.add(tile);
      this.groundTiles.push(tile);
    }
    this.lastTileZ = 7 * 8;
  }

  private applyBiomeTransition(biomeIdx: number) {
    const biome = BIOME_THEMES[biomeIdx];
    const scene = this.world.scene;

    // Update fog
    if (scene.fog instanceof FogExp2) {
      (scene.fog as FogExp2).color.setHex(biome.fog);
    }
    scene.background = new Color(biome.fog);

    // Update ground tiles
    for (const tile of this.groundTiles) {
      const mat = tile.material as MeshStandardMaterial;
      mat.color.setHex(biome.ground);
    }

    // Update border walls in environment group
    this.environmentGroup.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        if ((child.material as MeshStandardMaterial).emissiveIntensity > 0) {
          (child.material as MeshStandardMaterial).emissive.setHex(biome.border);
        }
      }
    });

    // Update ambient light
    scene.traverse((child) => {
      if (child instanceof AmbientLight) {
        child.color.setHex(biome.ambient);
      }
    });
  }

  private createGroundTile(z: number, colors: ReturnType<typeof this.getColors>): Mesh {
    const geo = new PlaneGeometry(FIELD_WIDTH + 4, 8, 16, 8);
    const mat = new MeshStandardMaterial({
      color: new Color(colors.bg).multiplyScalar(1.5),
      roughness: 0.9,
      metalness: 0.1,
    });
    const tile = new Mesh(geo, mat);
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(0, -0.01, z);

    // Grid lines
    const gridGeo = new EdgesGeometry(new BoxGeometry(FIELD_WIDTH, 0.01, 8, 8, 1, 4));
    const gridMat = new LineBasicMaterial({ color: colors.grid, transparent: true, opacity: 0.3 });
    const grid = new LineSegments(gridGeo, gridMat);
    grid.position.set(0, 0.01, z);
    this.terrainGroup.add(grid);

    return tile;
  }

  private buildEnvironment() {
    const colors = this.getColors();

    // Border walls
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -3; i < 10; i++) {
        const wallGeo = new BoxGeometry(0.3, 2, 6);
        const wallMat = new MeshStandardMaterial({
          color: colors.primary,
          emissive: new Color(colors.primary),
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.4,
        });
        const wall = new Mesh(wallGeo, wallMat);
        wall.position.set(side * (FIELD_WIDTH / 2 + 0.5), 1, i * 6);
        this.environmentGroup.add(wall);
      }
    }

    // Corner pillars
    for (let side = -1; side <= 1; side += 2) {
      for (let depth = -1; depth <= 1; depth += 2) {
        const pillarGeo = new CylinderGeometry(0.4, 0.4, 4, 6);
        const pillarMat = new MeshStandardMaterial({
          color: colors.accent,
          emissive: new Color(colors.accent),
          emissiveIntensity: 0.5,
        });
        const pillar = new Mesh(pillarGeo, pillarMat);
        pillar.position.set(side * (FIELD_WIDTH / 2 + 0.5), 2, depth * 20);
        this.environmentGroup.add(pillar);

        // Pillar cap light
        const capGeo = new SphereGeometry(0.5, 8, 6);
        const capMat = new MeshBasicMaterial({
          color: colors.primary,
          transparent: true,
          opacity: 0.8,
        });
        const cap = new Mesh(capGeo, capMat);
        cap.position.set(side * (FIELD_WIDTH / 2 + 0.5), 4.2, depth * 20);
        this.environmentGroup.add(cap);
      }
    }

    // Ambient stars
    for (let i = 0; i < 60; i++) {
      const starGeo = new SphereGeometry(0.08, 4, 4);
      const starMat = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.5,
      });
      const star = new Mesh(starGeo, starMat);
      star.position.set(
        (Math.random() - 0.5) * 40,
        15 + Math.random() * 15,
        (Math.random() - 0.5) * 60,
      );
      this.environmentGroup.add(star);
    }
  }

  private buildPlayer() {
    const colors = this.getColors();
    const c = new Color(colors.primary);

    // Body (soldier torso)
    const bodyGeo = new BoxGeometry(0.5, 0.6, 0.4);
    const bodyMat = new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.4 });
    const body = new Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    this.playerGroup.add(body);

    // Head
    const headGeo = new SphereGeometry(0.2, 8, 6);
    const headMat = new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5 });
    const head = new Mesh(headGeo, headMat);
    head.position.y = 1.0;
    this.playerGroup.add(head);

    // Helmet
    const helmetGeo = new CylinderGeometry(0.22, 0.25, 0.15, 8);
    const helmetMat = new MeshStandardMaterial({
      color: colors.accent,
      emissive: new Color(colors.accent),
      emissiveIntensity: 0.3,
    });
    const helmet = new Mesh(helmetGeo, helmetMat);
    helmet.position.y = 1.15;
    this.playerGroup.add(helmet);

    // Gun (barrel)
    const gunGeo = new CylinderGeometry(0.06, 0.06, 0.7, 6);
    const gunMat = new MeshStandardMaterial({ color: 0xcccccc, emissive: new Color(colors.accent), emissiveIntensity: 0.3 });
    const gun = new Mesh(gunGeo, gunMat);
    gun.rotation.x = Math.PI / 2;
    gun.position.set(0.25, 0.6, -0.3);
    this.playerGroup.add(gun);

    // Legs
    for (let side = -1; side <= 1; side += 2) {
      const legGeo = new BoxGeometry(0.15, 0.4, 0.2);
      const legMat = new MeshStandardMaterial({ color: c.clone().multiplyScalar(0.7), emissive: c, emissiveIntensity: 0.2 });
      const leg = new Mesh(legGeo, legMat);
      leg.position.set(side * 0.15, 0.2, 0);
      this.playerGroup.add(leg);
    }

    // Shield visual (hidden initially)
    const shieldGeo = new SphereGeometry(0.8, 16, 12);
    const shieldMat = new MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0,
      side: DoubleSide,
    });
    const shield = new Mesh(shieldGeo, shieldMat);
    shield.position.y = 0.5;
    shield.name = 'shield';
    this.playerGroup.add(shield);
  }

  // ── Enemy Creation ──
  private createEnemy(type: string, x: number, z: number): Enemy {
    const colors = this.getColors();
    const group = new Group();
    let hp = 1, points = 100, speed = 2, shootInterval = 2, aggroRange = 12;

    const ec = new Color(colors.enemy);

    switch (type) {
      case 'soldier': {
        hp = 1; points = 100; speed = 2; shootInterval = 2.5;
        const bodyGeo = new BoxGeometry(0.4, 0.5, 0.35);
        const bodyMat = new MeshStandardMaterial({ color: ec, emissive: ec, emissiveIntensity: 0.4 });
        group.add(new Mesh(bodyGeo, bodyMat));
        const headGeo = new SphereGeometry(0.15, 6, 5);
        const headMat = new MeshStandardMaterial({ color: ec, emissive: ec, emissiveIntensity: 0.5 });
        const head = new Mesh(headGeo, headMat);
        head.position.y = 0.4;
        group.add(head);
        break;
      }
      case 'heavy': {
        hp = 3; points = 250; speed = 1.2; shootInterval = 1.8;
        const bodyGeo = new BoxGeometry(0.6, 0.7, 0.5);
        const bodyMat = new MeshStandardMaterial({ color: ec.clone().multiplyScalar(0.8), emissive: ec, emissiveIntensity: 0.3 });
        group.add(new Mesh(bodyGeo, bodyMat));
        const headGeo = new BoxGeometry(0.3, 0.25, 0.3);
        const headMat = new MeshStandardMaterial({ color: ec, emissive: ec, emissiveIntensity: 0.4 });
        const head = new Mesh(headGeo, headMat);
        head.position.y = 0.5;
        group.add(head);
        // Shoulder pads
        for (let s = -1; s <= 1; s += 2) {
          const padGeo = new BoxGeometry(0.2, 0.15, 0.25);
          const pad = new Mesh(padGeo, bodyMat);
          pad.position.set(s * 0.4, 0.3, 0);
          group.add(pad);
        }
        break;
      }
      case 'sniper': {
        hp = 1; points = 200; speed = 0.8; shootInterval = 3; aggroRange = 20;
        const bodyGeo = new CylinderGeometry(0.2, 0.2, 0.6, 6);
        const bodyMat = new MeshStandardMaterial({ color: 0x882200, emissive: new Color(0xff4400), emissiveIntensity: 0.3 });
        group.add(new Mesh(bodyGeo, bodyMat));
        // Scope glow
        const scopeGeo = new SphereGeometry(0.08, 6, 4);
        const scopeMat = new MeshBasicMaterial({ color: 0xff0000 });
        const scope = new Mesh(scopeGeo, scopeMat);
        scope.position.set(0, 0.35, -0.2);
        group.add(scope);
        break;
      }
      case 'runner': {
        hp = 1; points = 150; speed = 5; shootInterval = 99;
        const bodyGeo = new ConeGeometry(0.2, 0.6, 6);
        const bodyMat = new MeshStandardMaterial({ color: 0xff6600, emissive: new Color(0xff8800), emissiveIntensity: 0.5 });
        group.add(new Mesh(bodyGeo, bodyMat));
        break;
      }
      case 'turret': {
        hp = 4; points = 300; speed = 0; shootInterval = 1.2;
        const baseGeo = new CylinderGeometry(0.5, 0.6, 0.3, 8);
        const baseMat = new MeshStandardMaterial({ color: 0x444444, emissive: ec, emissiveIntensity: 0.2 });
        group.add(new Mesh(baseGeo, baseMat));
        const barrelGeo = new CylinderGeometry(0.08, 0.08, 0.6, 6);
        const barrelMat = new MeshStandardMaterial({ color: 0x888888, emissive: ec, emissiveIntensity: 0.3 });
        const barrel = new Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.2, -0.3);
        group.add(barrel);
        break;
      }
      case 'tank': {
        hp = 8; points = 500; speed = 1; shootInterval = 2; aggroRange = 15;
        const hullGeo = new BoxGeometry(1.0, 0.4, 1.4);
        const hullMat = new MeshStandardMaterial({ color: 0x556644, emissive: ec, emissiveIntensity: 0.2 });
        group.add(new Mesh(hullGeo, hullMat));
        const turretGeo = new CylinderGeometry(0.3, 0.35, 0.25, 8);
        const turretMat = new MeshStandardMaterial({ color: 0x667755, emissive: ec, emissiveIntensity: 0.3 });
        const turret = new Mesh(turretGeo, turretMat);
        turret.position.y = 0.3;
        group.add(turret);
        const cannonGeo = new CylinderGeometry(0.06, 0.06, 0.8, 6);
        const cannon = new Mesh(cannonGeo, turretMat);
        cannon.rotation.x = Math.PI / 2;
        cannon.position.set(0, 0.35, -0.5);
        group.add(cannon);
        // Treads
        for (let s = -1; s <= 1; s += 2) {
          const treadGeo = new BoxGeometry(0.15, 0.3, 1.5);
          const treadMat = new MeshStandardMaterial({ color: 0x333333, emissive: ec, emissiveIntensity: 0.1 });
          const tread = new Mesh(treadGeo, treadMat);
          tread.position.set(s * 0.55, -0.05, 0);
          group.add(tread);
        }
        break;
      }
      case 'helicopter': {
        hp = 5; points = 400; speed = 2.5; shootInterval = 1.5; aggroRange = 18;
        const bodyGeo = new BoxGeometry(0.6, 0.3, 1.0);
        const bodyMat = new MeshStandardMaterial({ color: 0x445566, emissive: ec, emissiveIntensity: 0.3 });
        group.add(new Mesh(bodyGeo, bodyMat));
        // Rotor
        const rotorGeo = new BoxGeometry(2.0, 0.05, 0.12);
        const rotorMat = new MeshBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.6 });
        const rotor = new Mesh(rotorGeo, rotorMat);
        rotor.position.y = 0.3;
        rotor.name = 'rotor';
        group.add(rotor);
        // Tail
        const tailGeo = new BoxGeometry(0.15, 0.15, 0.8);
        const tail = new Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0, 0.8);
        group.add(tail);
        group.position.y = 3;
        break;
      }
      case 'officer': {
        hp = 3; points = 350; speed = 1.5; shootInterval = 2.0; aggroRange = 14;
        // Officer body — taller soldier with epaulettes and command star
        const offBodyGeo = new BoxGeometry(0.45, 0.6, 0.4);
        const offColor = new Color(0xffaa00);
        const offBodyMat = new MeshStandardMaterial({ color: offColor, emissive: offColor, emissiveIntensity: 0.5 });
        group.add(new Mesh(offBodyGeo, offBodyMat));
        // Officer head with peaked cap
        const offHeadGeo = new SphereGeometry(0.16, 6, 5);
        const offHeadMat = new MeshStandardMaterial({ color: offColor, emissive: offColor, emissiveIntensity: 0.6 });
        const offHead = new Mesh(offHeadGeo, offHeadMat);
        offHead.position.y = 0.5;
        group.add(offHead);
        const capGeo = new CylinderGeometry(0.22, 0.18, 0.08, 6);
        const capMat = new MeshStandardMaterial({ color: 0xcc8800, emissive: new Color(0xffaa00), emissiveIntensity: 0.4 });
        const cap = new Mesh(capGeo, capMat);
        cap.position.y = 0.62;
        group.add(cap);
        // Command star on chest
        const starGeo = new SphereGeometry(0.06, 4, 3);
        const starMat = new MeshBasicMaterial({ color: 0xffff00 });
        const star = new Mesh(starGeo, starMat);
        star.position.set(0, 0.15, -0.22);
        group.add(star);
        // Command aura ring
        const auraGeo = new RingGeometry(2.0, 2.2, 16);
        const auraMat = new MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.2, side: DoubleSide });
        const aura = new Mesh(auraGeo, auraMat);
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.05;
        aura.name = 'commandAura';
        group.add(aura);
        break;
      }
      case 'apc': {
        hp = 10; points = 600; speed = 0.8; shootInterval = 2.0; aggroRange = 16;
        // Armored Personnel Carrier — large armored vehicle that deploys soldiers
        const apcHullGeo = new BoxGeometry(1.2, 0.5, 1.8);
        const apcHullMat = new MeshStandardMaterial({ color: 0x4a5a3a, emissive: ec, emissiveIntensity: 0.2 });
        group.add(new Mesh(apcHullGeo, apcHullMat));
        // APC cabin
        const cabinGeo = new BoxGeometry(1.0, 0.4, 0.8);
        const cabinMat = new MeshStandardMaterial({ color: 0x5a6a4a, emissive: ec, emissiveIntensity: 0.3 });
        const cabin = new Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 0.45, -0.3);
        group.add(cabin);
        // APC gun turret
        const apcTurretGeo = new CylinderGeometry(0.2, 0.25, 0.2, 6);
        const apcTurret = new Mesh(apcTurretGeo, cabinMat);
        apcTurret.position.set(0, 0.7, -0.2);
        group.add(apcTurret);
        const apcGunGeo = new CylinderGeometry(0.05, 0.05, 0.5, 6);
        const apcGun = new Mesh(apcGunGeo, cabinMat);
        apcGun.rotation.x = Math.PI / 2;
        apcGun.position.set(0, 0.75, -0.5);
        group.add(apcGun);
        // APC wheels
        for (let s = -1; s <= 1; s += 2) {
          for (let wz = -0.6; wz <= 0.6; wz += 0.6) {
            const wheelGeo = new CylinderGeometry(0.18, 0.18, 0.12, 8);
            const wheelMat = new MeshStandardMaterial({ color: 0x222222, emissive: ec, emissiveIntensity: 0.1 });
            const wheel = new Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(s * 0.65, -0.15, wz);
            group.add(wheel);
          }
        }
        // Armor plate indicator
        const armorGeo = new BoxGeometry(1.25, 0.08, 1.85);
        const armorMat = new MeshBasicMaterial({ color: ec, transparent: true, opacity: 0.15 });
        const armor = new Mesh(armorGeo, armorMat);
        armor.position.y = 0.55;
        armor.name = 'apcArmor';
        group.add(armor);
        break;
      }
      case 'boss': {
        hp = 15 + this.state.wave * 3; points = 2000; speed = 1.5; shootInterval = 0.8; aggroRange = 25;
        // Large mech boss
        const bodyGeo = new BoxGeometry(1.2, 1.0, 1.0);
        const bodyMat = new MeshStandardMaterial({ color: 0xff2200, emissive: new Color(0xff4400), emissiveIntensity: 0.5 });
        group.add(new Mesh(bodyGeo, bodyMat));
        // Head/cockpit
        const cockpitGeo = new SphereGeometry(0.4, 8, 6);
        const cockpitMat = new MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
        const cockpit = new Mesh(cockpitGeo, cockpitMat);
        cockpit.position.y = 0.7;
        group.add(cockpit);
        // Arm cannons
        for (let s = -1; s <= 1; s += 2) {
          const armGeo = new BoxGeometry(0.3, 0.3, 0.8);
          const arm = new Mesh(armGeo, bodyMat);
          arm.position.set(s * 0.8, 0.2, -0.3);
          group.add(arm);
          const cannonGeo = new CylinderGeometry(0.1, 0.1, 0.5, 6);
          const cannon = new Mesh(cannonGeo, new MeshStandardMaterial({ color: 0xff8800, emissive: new Color(0xff4400), emissiveIntensity: 0.4 }));
          cannon.rotation.x = Math.PI / 2;
          cannon.position.set(s * 0.8, 0.2, -0.8);
          group.add(cannon);
        }
        // Legs
        for (let s = -1; s <= 1; s += 2) {
          const legGeo = new BoxGeometry(0.25, 0.8, 0.3);
          const leg = new Mesh(legGeo, bodyMat);
          leg.position.set(s * 0.4, -0.7, 0);
          group.add(leg);
        }
        break;
      }
      case 'artillery': {
        hp = 20 + this.state.wave * 2; points = 2500; speed = 0; shootInterval = 1.2; aggroRange = 30;
        // Large stationary cannon
        const baseGeo = new BoxGeometry(1.8, 0.5, 1.8);
        const baseMat = new MeshStandardMaterial({ color: 0x664400, emissive: new Color(0xff6600), emissiveIntensity: 0.3 });
        group.add(new Mesh(baseGeo, baseMat));
        // Rotating turret platform
        const turretBaseGeo = new CylinderGeometry(0.6, 0.7, 0.4, 8);
        const turretBase = new Mesh(turretBaseGeo, baseMat);
        turretBase.position.y = 0.45;
        turretBase.name = 'turretBase';
        group.add(turretBase);
        // Cannon barrel
        const cannonGeo = new CylinderGeometry(0.15, 0.2, 1.5, 8);
        const cannonMat = new MeshStandardMaterial({ color: 0x888888, emissive: new Color(0xff4400), emissiveIntensity: 0.4 });
        const cannon = new Mesh(cannonGeo, cannonMat);
        cannon.rotation.x = Math.PI / 2;
        cannon.position.set(0, 0.65, -0.8);
        cannon.name = 'cannon';
        group.add(cannon);
        // Armor plates
        for (let s = -1; s <= 1; s += 2) {
          const plateGeo = new BoxGeometry(0.15, 0.6, 1.0);
          const plate = new Mesh(plateGeo, baseMat);
          plate.position.set(s * 0.9, 0.3, 0);
          group.add(plate);
        }
        break;
      }
      case 'attack_heli': {
        hp = 18 + this.state.wave * 2; points = 3000; speed = 3; shootInterval = 0.6; aggroRange = 30;
        // Attack helicopter boss — bigger than regular heli
        const fuselageGeo = new BoxGeometry(0.7, 0.5, 1.8);
        const fuselageMat = new MeshStandardMaterial({ color: 0x222222, emissive: new Color(0xff0044), emissiveIntensity: 0.4 });
        group.add(new Mesh(fuselageGeo, fuselageMat));
        // Cockpit
        const cockpitGeo = new SphereGeometry(0.35, 8, 6);
        const cockpitMat = new MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.7 });
        const aCockpit = new Mesh(cockpitGeo, cockpitMat);
        aCockpit.position.set(0, 0.1, -0.9);
        group.add(aCockpit);
        // Main rotor
        const mainRotorGeo = new BoxGeometry(3.0, 0.05, 0.15);
        const rotorMat = new MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 });
        const mainRotor = new Mesh(mainRotorGeo, rotorMat);
        mainRotor.position.y = 0.4;
        mainRotor.name = 'rotor';
        group.add(mainRotor);
        // Tail boom
        const tailGeo = new BoxGeometry(0.15, 0.15, 1.2);
        const tail = new Mesh(tailGeo, fuselageMat);
        tail.position.set(0, 0.1, 1.2);
        group.add(tail);
        // Tail rotor
        const tailRotorGeo = new BoxGeometry(0.05, 0.6, 0.05);
        const tailRotor = new Mesh(tailRotorGeo, rotorMat);
        tailRotor.position.set(0, 0.2, 1.8);
        tailRotor.name = 'tailRotor';
        group.add(tailRotor);
        // Stub wings with rockets
        for (let s = -1; s <= 1; s += 2) {
          const wingGeo = new BoxGeometry(0.8, 0.08, 0.3);
          const wing = new Mesh(wingGeo, fuselageMat);
          wing.position.set(s * 0.7, -0.1, 0);
          group.add(wing);
          const rocketGeo = new CylinderGeometry(0.06, 0.06, 0.4, 6);
          const rocket = new Mesh(rocketGeo, new MeshStandardMaterial({ color: 0xaa4400 }));
          rocket.rotation.x = Math.PI / 2;
          rocket.position.set(s * 0.9, -0.15, -0.1);
          group.add(rocket);
        }
        group.position.y = 4;
        break;
      }
    }

    group.position.set(x, type === 'helicopter' || type === 'attack_heli' ? (type === 'attack_heli' ? 4 : 3) : 0, z);
    this.world.scene.add(group);

    // Difficulty scaling
    const diffMult = [1, 1.3, 1.8][this.state.difficulty];
    hp = Math.ceil(hp * diffMult);
    shootInterval /= diffMult;

    // Wave-based progressive scaling
    const waveScale = 1 + this.state.wave * 0.04;
    hp = Math.ceil(hp * waveScale);
    speed *= (1 + this.state.wave * 0.02);
    shootInterval *= Math.max(0.4, 1 - this.state.wave * 0.015);

    // Elite/veteran variants — wave 8+, 25% chance for non-boss types
    let isElite = false;
    const bosses = ['boss', 'artillery', 'attack_heli'];
    if (this.state.wave >= 8 && !bosses.includes(type) && Math.random() < 0.25) {
      isElite = true;
      hp *= 2;
      speed *= 1.3;
      points *= 2;
      // Add glowing outline ring
      const ringGeo = new RingGeometry(0.5, 0.6, 8);
      const ringMat = new MeshBasicMaterial({ color: 0xff00ff, side: DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      ring.name = 'eliteRing';
      group.add(ring);
    }

    const enemy = {
      id: this.nextEnemyId++,
      mesh: group,
      type,
      hp,
      maxHp: hp,
      x, z,
      vx: 0, vz: 0,
      shootTimer: Math.random() * shootInterval,
      shootInterval,
      points,
      moveTimer: 0,
      aggroRange,
      speed: speed * (0.8 + Math.random() * 0.4),
      dead: false,
      deathTimer: 0,
      flashTimer: 0,
    };
    (enemy as any).isElite = isElite;
    return enemy;
  }

  // ── Bullet Creation ──
  private fireBullet(x: number, z: number, angle: number, isEnemy: boolean, dmg = 1) {
    if (this.bullets.length >= MAX_BULLETS) return;
    const colors = this.getColors();
    const size = isEnemy ? 0.12 : 0.1;
    const geo = new SphereGeometry(size, 4, 4);
    const color = isEnemy ? colors.enemy : colors.bullet;
    const mat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(x, isEnemy ? 0.5 : 0.6, z);
    this.world.scene.add(mesh);

    const speed = isEnemy ? ENEMY_BULLET_SPEED : BULLET_SPEED;
    this.bullets.push({
      mesh,
      vx: Math.sin(angle) * speed,
      vz: -Math.cos(angle) * speed,
      life: 2,
      isEnemy,
      damage: dmg,
    });
  }

  // ── Grenade ──
  private throwGrenade(x: number, z: number, angle: number) {
    if (this.state.grenadeCount <= 0) return;
    this.state.grenadeCount--;
    this.state.totalGrenades++;

    const colors = this.getColors();
    const group = new Group();
    const bodyGeo = new SphereGeometry(0.15, 8, 6);
    const bodyMat = new MeshStandardMaterial({
      color: colors.accent,
      emissive: new Color(colors.accent),
      emissiveIntensity: 0.6,
    });
    group.add(new Mesh(bodyGeo, bodyMat));

    // Pin indicator
    const pinGeo = new CylinderGeometry(0.03, 0.03, 0.1, 4);
    const pin = new Mesh(pinGeo, new MeshBasicMaterial({ color: 0xffffff }));
    pin.position.y = 0.15;
    group.add(pin);

    group.position.set(x, 0.6, z);
    this.world.scene.add(group);

    this.grenades.push({
      mesh: group,
      x, z,
      vx: Math.sin(angle) * GRENADE_SPEED,
      vz: -Math.cos(angle) * GRENADE_SPEED,
      vy: 4,
      y: 0.6,
      timer: 1.2,
      bounced: false,
    });
  }

  // ── Smoke Grenade ──
  private throwSmokeGrenade(x: number, z: number, angle: number) {
    if (this.state.smokeGrenadeCount <= 0) return;
    this.state.smokeGrenadeCount--;

    // Lob forward and create cloud at impact point
    const impactX = x + Math.sin(angle) * 6;
    const impactZ = z - Math.cos(angle) * 6;

    this.createSmokeCloud(impactX, impactZ);
    this.state.screenShake = 0.1;
  }

  private createSmokeCloud(x: number, z: number) {
    const meshes: Mesh[] = [];
    const cloudRadius = 3.5;

    // Create cluster of semi-transparent gray spheres
    for (let i = 0; i < 12; i++) {
      const size = 0.6 + Math.random() * 0.8;
      const geo = new SphereGeometry(size, 8, 6);
      const mat = new MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.15,
      });
      const sphere = new Mesh(geo, mat);
      sphere.position.set(
        x + (Math.random() - 0.5) * cloudRadius,
        0.4 + Math.random() * 1.5,
        z + (Math.random() - 0.5) * cloudRadius,
      );
      this.world.scene.add(sphere);
      meshes.push(sphere);
    }

    this.smokeClouds.push({
      meshes,
      x, z,
      timer: 5,
      maxTime: 5,
      radius: cloudRadius,
    });
  }

  private updateSmokeClouds(dt: number) {
    for (let i = this.smokeClouds.length - 1; i >= 0; i--) {
      const cloud = this.smokeClouds[i];
      cloud.timer -= dt;

      // Fade out in last 1.5 seconds
      const fadeStart = 1.5;
      const opacity = cloud.timer < fadeStart ? (cloud.timer / fadeStart) * 0.45 : 0.45;
      for (const m of cloud.meshes) {
        const mat = m.material as MeshBasicMaterial;
        mat.opacity = opacity;
        // Slowly drift upward and expand
        m.position.y += dt * 0.2;
        m.scale.addScalar(dt * 0.08);
      }

      // Enemies inside cloud lose tracking
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const dx = enemy.x - cloud.x;
        const dz = enemy.z - cloud.z;
        if (Math.sqrt(dx * dx + dz * dz) < cloud.radius) {
          // Stop enemy shooting inside smoke
          enemy.shootTimer = Math.max(enemy.shootTimer, 0.5);
        }
      }

      if (cloud.timer <= 0) {
        for (const m of cloud.meshes) this.world.scene.remove(m);
        this.smokeClouds.splice(i, 1);
      }
    }
  }

  // ── Upgrade Token System ──
  private spawnUpgradeToken(x: number, z: number) {
    const group = new Group();
    // Green rotating diamond
    const diamondGeo = new BoxGeometry(0.25, 0.35, 0.25);
    const diamondMat = new MeshBasicMaterial({ color: 0x00ff44, transparent: true, opacity: 0.85 });
    const diamond = new Mesh(diamondGeo, diamondMat);
    diamond.rotation.set(Math.PI / 4, 0, Math.PI / 4);
    group.add(diamond);
    // Glow ring
    const ringGeo = new RingGeometry(0.2, 0.35, 8);
    const ringMat = new MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.5, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.1;
    group.add(ring);
    group.position.set(x, 0.8, z);
    this.world.scene.add(group);
    this.upgradeTokens.push({ mesh: group, x, z, bobTimer: Math.random() * Math.PI * 2 });
  }

  private updateUpgradeTokens(dt: number) {
    const s = this.state;
    for (let i = this.upgradeTokens.length - 1; i >= 0; i--) {
      const t = this.upgradeTokens[i];
      t.bobTimer += dt * 3;
      t.mesh.position.y = 0.8 + Math.sin(t.bobTimer) * 0.15;
      t.mesh.rotation.y += dt * 2;
      // Collect on proximity
      const dx = s.playerX - t.x;
      const dz = s.playerZ - t.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
        if (s.weaponUpgradeLevel < 3) {
          s.weaponUpgradeLevel++;
          this.spawnScorePopup(t.x, t.z, 0, 0);
          // Green particles on pickup
          for (let p = 0; p < 6; p++) {
            this.spawnParticle(t.x, 0.8, t.z, '#00ff44');
          }
          (this as any).audioSystem?.playPowerUp();
        }
        this.world.scene.remove(t.mesh);
        this.upgradeTokens.splice(i, 1);
        continue;
      }
      // Remove if scrolled off
      if (t.z - s.scrollZ > 20) {
        this.world.scene.remove(t.mesh);
        this.upgradeTokens.splice(i, 1);
      }
    }
  }

  // ── Bonus Objective System ──
  private assignBonusObjective() {
    const s = this.state;
    if (s.bonusObjective) return; // already active
    if (Math.random() > 0.35) return; // 35% chance per wave
    const wave = s.wave;
    const types = ['speedKill', 'noDamage', 'comboKing'];
    const pick = types[Math.floor(Math.random() * types.length)];
    let obj: BonusObjective;
    switch (pick) {
      case 'speedKill':
        obj = { type: 'speedKill', description: `Kill ${3 + wave} enemies in 15s`, target: 3 + wave, progress: 0, timeLeft: 15, bonusScore: 500 + wave * 50 };
        break;
      case 'noDamage':
        obj = { type: 'noDamage', description: 'Survive wave without damage', target: 1, progress: 0, timeLeft: 999, bonusScore: 800 + wave * 75 };
        break;
      case 'comboKing':
        const comboTarget = Math.min(5 + Math.floor(wave / 2), 20);
        obj = { type: 'comboKing', description: `Reach ${comboTarget}x combo`, target: comboTarget, progress: 0, timeLeft: 20, bonusScore: 600 + wave * 60 };
        break;
      default:
        return;
    }
    s.bonusObjective = obj;
  }

  private updateBonusObjective(dt: number) {
    const s = this.state;
    if (!s.bonusObjective) return;
    const bo = s.bonusObjective;
    if (bo.progress < 0) { // failed (noDamage hit)
      s.bonusObjective = null;
      return;
    }
    bo.timeLeft -= dt;
    // noDamage: complete when wave ends (checked in wave logic)
    if (bo.type !== 'noDamage' && bo.progress >= bo.target) {
      // Completed!
      s.score += bo.bonusScore;
      s.bonusObjectivesCompleted++;
      this.spawnScorePopup(s.playerX, s.playerZ - 1.5, bo.bonusScore, 0);
      s.bonusObjective = null;
      return;
    }
    if (bo.timeLeft <= 0 && bo.type !== 'noDamage') {
      s.bonusObjective = null; // expired
    }
  }

  private completeBonusNoDamage() {
    const s = this.state;
    if (!s.bonusObjective || s.bonusObjective.type !== 'noDamage') return;
    if (s.bonusObjective.progress >= 0) {
      s.score += s.bonusObjective.bonusScore;
      s.bonusObjectivesCompleted++;
      this.spawnScorePopup(s.playerX, s.playerZ - 1.5, s.bonusObjective.bonusScore, 0);
    }
    s.bonusObjective = null;
  }

  // ── Multi-kill Tracker ──
  private updateMultiKill(dt: number) {
    const s = this.state;
    if (s.multiKillTimer > 0) {
      s.multiKillTimer -= dt;
      if (s.multiKillTimer <= 0) {
        s.multiKillCount = 0;
      }
    }
  }

  // ── Revenge Surge ──
  private updateRevengeSurge(dt: number) {
    const s = this.state;
    if (s.revengeSurgeTimer > 0) {
      s.revengeSurgeTimer -= dt;
      // Visual pulse on player mesh
      if (this.playerGroup) {
        const pulse = Math.sin(s.revengeSurgeTimer * 12) * 0.5 + 0.5;
        this.playerGroup.traverse((child: any) => {
          if (child.material && child.material.emissive) {
            child.material.emissiveIntensity = 0.3 + pulse * 0.7;
          }
        });
      }
      if (s.revengeSurgeTimer <= 0) {
        // Reset player emissive
        if (this.playerGroup) {
          this.playerGroup.traverse((child: any) => {
            if (child.material && child.material.emissive) {
              child.material.emissiveIntensity = 0.3;
            }
          });
        }
      }
    }
  }

  // ── Explosions ──
  private createExplosion(x: number, z: number, radius: number, damage: number) {
    const colors = this.getColors();
    const group = new Group();

    // Core flash
    const coreGeo = new SphereGeometry(radius * 0.3, 12, 8);
    const coreMat = new MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 });
    group.add(new Mesh(coreGeo, coreMat));

    // Outer ring
    const ringGeo = new RingGeometry(0, radius, 16);
    const ringMat = new MeshBasicMaterial({ color: colors.secondary, transparent: true, opacity: 0.7, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    group.position.set(x, 0.5, z);
    this.world.scene.add(group);

    this.explosions.push({ mesh: group, timer: 0, maxTime: 0.5, radius });

    // Damage enemies in radius
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - x;
      const dz = enemy.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        this.damageEnemy(enemy, damage);
      }
    }

    // Particles
    for (let i = 0; i < 15; i++) {
      this.spawnParticle(x, 0.5, z, colors.secondary, 1.5);
    }

    this.state.screenShake = 0.3;
    (this as any).audioSystem?.playExplosion();
  }

  // ── Particles ──
  private spawnParticle(x: number, y: number, z: number, color: string, spread = 1) {
    if (this.particles.length >= MAX_PARTICLES) return;
    const geo = new SphereGeometry(0.05, 4, 3);
    const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.world.scene.add(mesh);

    this.particles.push({
      mesh,
      vx: (Math.random() - 0.5) * 6 * spread,
      vy: Math.random() * 5 * spread,
      vz: (Math.random() - 0.5) * 6 * spread,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
    });
  }

  // ── Power-Up ──
  private spawnPowerUp(x: number, z: number) {
    const colors = this.getColors();
    const types = ['spread', 'rapid', 'shield', 'speed', 'grenade', 'life', 'score', 'flamethrower', 'beam', 'homing'];
    const type = types[Math.floor(Math.random() * types.length)];

    const group = new Group();

    // Base glow
    const baseGeo = new SphereGeometry(0.3, 8, 6);
    let pColor = '#00ff88';
    switch (type) {
      case 'spread': pColor = '#ff8800'; break;
      case 'rapid': pColor = '#ff0088'; break;
      case 'shield': pColor = '#0088ff'; break;
      case 'speed': pColor = '#88ff00'; break;
      case 'grenade': pColor = '#ffaa00'; break;
      case 'life': pColor = '#ff4444'; break;
      case 'score': pColor = '#ffff00'; break;
      case 'flamethrower': pColor = '#ff6600'; break;
      case 'beam': pColor = '#00ffff'; break;
      case 'homing': pColor = '#ff00ff'; break;
    }
    const baseMat = new MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.7 });
    group.add(new Mesh(baseGeo, baseMat));

    // Icon indicator
    const iconGeo = new BoxGeometry(0.15, 0.15, 0.15);
    const iconMat = new MeshBasicMaterial({ color: 0xffffff });
    const icon = new Mesh(iconGeo, iconMat);
    icon.position.y = 0.3;
    group.add(icon);

    group.position.set(x, 0.5, z);
    this.world.scene.add(group);

    this.powerUps.push({
      mesh: group,
      type,
      x, z,
      bobTimer: Math.random() * Math.PI * 2,
    });
  }

  // ── Obstacle ──
  private spawnObstacle(type: string, x: number, z: number) {
    const colors = this.getColors();
    const group = new Group();
    let hp = 1, destructible = true, radius = 0.5;

    switch (type) {
      case 'sandbag': {
        hp = 3; radius = 0.6;
        const bagGeo = new BoxGeometry(1.2, 0.5, 0.6);
        const bagMat = new MeshStandardMaterial({ color: 0x886644, emissive: new Color(0x664422), emissiveIntensity: 0.2 });
        group.add(new Mesh(bagGeo, bagMat));
        const bag2 = new Mesh(new BoxGeometry(1.0, 0.4, 0.5), bagMat);
        bag2.position.y = 0.4;
        group.add(bag2);
        break;
      }
      case 'barrel': {
        hp = 1; radius = 0.4;
        const barrelGeo = new CylinderGeometry(0.3, 0.3, 0.8, 8);
        const barrelMat = new MeshStandardMaterial({ color: 0x884422, emissive: new Color(0xff4400), emissiveIntensity: 0.3 });
        group.add(new Mesh(barrelGeo, barrelMat));
        // Warning stripe
        const stripeGeo = new CylinderGeometry(0.31, 0.31, 0.1, 8);
        const stripeMat = new MeshBasicMaterial({ color: 0xff4400 });
        const stripe = new Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.2;
        group.add(stripe);
        break;
      }
      case 'crate': {
        hp = 2; radius = 0.5;
        const crateGeo = new BoxGeometry(0.8, 0.8, 0.8);
        const crateMat = new MeshStandardMaterial({ color: 0x556633, emissive: new Color(colors.primary), emissiveIntensity: 0.1 });
        group.add(new Mesh(crateGeo, crateMat));
        // Cross
        const crossGeo = new BoxGeometry(0.6, 0.05, 0.1);
        const crossMat = new MeshBasicMaterial({ color: colors.primary });
        const cross1 = new Mesh(crossGeo, crossMat);
        cross1.position.set(0, 0, 0.41);
        group.add(cross1);
        const cross2 = new Mesh(new BoxGeometry(0.1, 0.05, 0.6), crossMat);
        cross2.position.set(0, 0, 0.41);
        group.add(cross2);
        break;
      }
      case 'wall': {
        hp = 99; radius = 0.8; destructible = false;
        const wallGeo = new BoxGeometry(1.5, 1.5, 0.4);
        const wallMat = new MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
        group.add(new Mesh(wallGeo, wallMat));
        break;
      }
    }

    group.position.set(x, 0, z);
    this.world.scene.add(group);

    this.obstacles.push({
      mesh: group,
      type, x, z,
      hp,
      destructible,
      radius,
    });
  }

  // ── Enemy Damage ──
  private damageEnemy(enemy: Enemy, damage: number) {
    // Critical hit check (10% chance, 3x damage)
    let isCrit = false;
    if (Math.random() < 0.1) {
      isCrit = true;
      damage = Math.floor(damage * 3);
    }
    // Weapon upgrade damage boost (25% per level)
    if (this.state.weaponUpgradeLevel > 0) {
      damage = Math.floor(damage * (1 + this.state.weaponUpgradeLevel * 0.25));
    }
    // Revenge surge damage boost
    if (this.state.revengeSurgeTimer > 0) {
      damage = Math.floor(damage * 2);
    }
    enemy.hp -= damage;
    enemy.flashTimer = isCrit ? 0.25 : 0.1;

    if (enemy.hp <= 0) {
      this.killEnemyEnhanced(enemy);
      this.state.kills++;
      this.state.totalKills++;
      this.state.killStreak++;
      const wt = this.state.weaponType;
      this.state.weaponKillCounts[wt] = (this.state.weaponKillCounts[wt] || 0) + 1;
      if (this.state.inVehicle) this.state.vehicleKills++;
      // Officer kill tracking
      if (enemy.type === 'officer') this.state.careerOfficerKills++;
      if (this.state.killStreak > this.state.killStreakBest) {
        this.state.killStreakBest = this.state.killStreak;
      }
      this.checkKillStreakRewards();
      this.onEnemyKilledMission();
      this.checkKillAchievements();

      // Combo
      this.state.combo++;
      this.state.comboTimer = COMBO_DECAY;
      if (this.state.combo > this.state.bestCombo) this.state.bestCombo = this.state.combo;

      // Score with combo multiplier
      const comboMult = Math.min(1 + this.state.combo * 0.1, 4);
      const earnedPoints = Math.floor(enemy.points * comboMult);
      this.state.score += earnedPoints;

      // Score popup
      this.spawnScorePopup(enemy.x, enemy.z, earnedPoints, this.state.combo);

      // Crit popup (extra golden popup above)
      if (isCrit) {
        this.spawnScorePopup(enemy.x, enemy.z + 0.5, 0, 0); // placeholder — overridden below
        // Spawn extra crit particles
        for (let ci = 0; ci < 4; ci++) {
          this.spawnParticle(enemy.x, 1.0, enemy.z, '#ffff00', 1.2);
        }
      }

      // Multi-kill tracking (kills within 1 second window)
      this.state.multiKillCount++;
      this.state.multiKillTimer = 1.0;
      if (this.state.multiKillCount >= 3) {
        const multiBonus = this.state.multiKillCount * 100;
        this.state.score += multiBonus;
        this.spawnScorePopup(this.state.playerX, this.state.playerZ - 1, multiBonus, this.state.multiKillCount);
        if (this.state.multiKillCount > this.state.multiKillBest) {
          this.state.multiKillBest = this.state.multiKillCount;
        }
      }

      // Bonus objective progress: kill-based
      if (this.state.bonusObjective && this.state.bonusObjective.timeLeft > 0) {
        const bo = this.state.bonusObjective;
        if (bo.type === 'speedKill') {
          bo.progress++;
        } else if (bo.type === 'comboKing' && this.state.combo >= bo.target) {
          bo.progress = bo.target;
        }
      }

      // Elite enemies drop upgrade tokens (50% chance)
      if ((enemy as any).isElite && Math.random() < 0.5) {
        this.spawnUpgradeToken(enemy.x, enemy.z);
      }

      // Drop power-up chance
      if (Math.random() < 0.2) {
        this.spawnPowerUp(enemy.x, enemy.z);
      }

      // Barrel explosion for explosive enemies
      if (enemy.type === 'tank') {
        this.createExplosion(enemy.x, enemy.z, 3, 2);
      }

      // Particles
      const colors = this.getColors();
      for (let i = 0; i < 8; i++) {
        this.spawnParticle(enemy.x, 0.5, enemy.z, colors.enemy);
      }

      (this as any).audioSystem?.playEnemyDeath();
    } else {
      (this as any).audioSystem?.playHit();
    }
  }

  // ── Player Damage ──
  private damagePlayer() {
    if (this.state.invincibleTimer > 0 || this.state.shieldTimer > 0 || this.state.rollTimer > 0) {
      if (this.state.shieldTimer > 0) {
        this.state.shieldTimer = 0;
        this.state.screenShake = 0.15;
        (this as any).audioSystem?.playShieldBreak();
      }
      return;
    }

    this.state.lives--;
    this.state.totalDeaths++;
    this.state.invincibleTimer = 2;
    this.state.weaponType = 'single';
    this.state.weaponTimer = 0;
    this.state.weaponInventory = [{ type: 'single', ammo: -1 }];
    this.state.currentWeaponIdx = 0;
    this.state.homingAmmo = 0;
    this.state.combo = 0;
    this.state.comboTimer = 0;
    this.state.killStreak = 0;
    this.state.killStreakSpeedActive = false;
    this.state.killStreakRapidActive = false;
    this.state.killStreakShieldActive = false;
    this.state.screenShake = 0.4;
    this.state.damageFlashTimer = 0.3;
    // Reset weapon upgrades on death
    this.state.weaponUpgradeLevel = 0;
    // Activate revenge surge if still alive
    if (this.state.lives > 0) {
      this.state.revengeSurgeTimer = 3.0;
    }
    // Bonus objective: noDamage fails
    if (this.state.bonusObjective && this.state.bonusObjective.type === 'noDamage') {
      this.state.bonusObjective.progress = -1; // mark failed
    }

    const colors = this.getColors();
    for (let i = 0; i < 12; i++) {
      this.spawnParticle(this.state.playerX, 0.5, this.state.playerZ, colors.primary, 1.5);
    }

    (this as any).audioSystem?.playPlayerDeath();

    if (this.state.lives <= 0) {
      this.state.phase = 'gameover';
      this.saveStats();
    }
  }

  // ── Apply Power-Up ──
  private applyPowerUp(type: string) {
    this.state.totalPowerUps++;
    (this as any).audioSystem?.playPowerUp();

    switch (type) {
      case 'spread':
        this.state.weaponType = 'spread';
        this.state.weaponTimer = 12;
        break;
      case 'rapid':
        this.state.weaponType = 'rapid';
        this.state.weaponTimer = 10;
        break;
      case 'shield':
        this.state.shieldTimer = 10;
        break;
      case 'speed':
        this.state.speedBoostTimer = 8;
        break;
      case 'grenade':
        this.state.grenadeCount = Math.min(this.state.grenadeCount + 3, this.state.maxGrenades);
        break;
      case 'life':
        this.state.lives = Math.min(this.state.lives + 1, 9);
        break;
      case 'score':
        this.state.score += 500;
        break;
      case 'flamethrower':
        this.state.weaponType = 'flamethrower';
        this.state.weaponTimer = 10;
        break;
      case 'beam':
        this.state.weaponType = 'beam';
        this.state.weaponTimer = 12;
        break;
      case 'homing':
        this.state.homingAmmo += 8;
        this.addWeaponToInventory('homing', this.state.homingAmmo);
        this.state.weaponType = 'homing';
        this.state.weaponTimer = 0; // ammo-based, no timer
        break;
    }
    this.checkWeaponAchievements(type);

    // Weapon pickup flash VFX
    const weaponNames: Record<string, string> = {
      spread: 'SPREAD GUN', rapid: 'RAPID FIRE', shield: 'SHIELD',
      speed: 'SPEED BOOST', grenade: 'GRENADES +3', life: 'EXTRA LIFE',
      score: '+500 PTS', flamethrower: 'FLAMETHROWER', beam: 'BEAM CANNON',
      homing: 'HOMING MISSILES',
    };
    this.state.weaponPickupName = weaponNames[type] || type.toUpperCase();
    this.state.weaponPickupFlashTimer = 2.0;
    this.spawnWeaponPickupFlash();
  }

  // ── Wave Management ──
  // ── Kill Streak Rewards ──
  private checkKillStreakRewards() {
    const ks = this.state.killStreak;
    const s = this.state;
    // 5 kills: speed boost
    if (ks === 5 && !s.killStreakSpeedActive) {
      s.killStreakSpeedActive = true;
      s.speedBoostTimer = Math.max(s.speedBoostTimer, 8);
    }
    // 10 kills: rapid fire
    if (ks === 10 && !s.killStreakRapidActive) {
      s.killStreakRapidActive = true;
      s.weaponType = 'rapid';
      s.weaponTimer = Math.max(s.weaponTimer, 12);
    }
    // 15 kills: shield
    if (ks === 15 && !s.killStreakShieldActive) {
      s.killStreakShieldActive = true;
      s.shieldTimer = Math.max(s.shieldTimer, 15);
    }
    // 25 kills: airstrike screen-clear
    if (ks === 25) {
      this.triggerAirstrike();
      s.killStreak = 0; // reset streak after airstrike
      s.killStreakSpeedActive = false;
      s.killStreakRapidActive = false;
      s.killStreakShieldActive = false;
    }
  }

  private triggerAirstrike() {
    const s = this.state;
    s.screenShake = 1.0;
    // Destroy all non-boss enemies
    for (const enemy of this.enemies) {
      if (!enemy.dead && enemy.type !== 'boss' && enemy.type !== 'artillery' && enemy.type !== 'attack_heli') {
        enemy.hp = 0;
        enemy.dead = true;
        enemy.deathTimer = 0.3;
        s.score += enemy.points * 2;
        const colors = this.getColors();
        for (let i = 0; i < 5; i++) {
          this.spawnParticle(enemy.x, 0.5, enemy.z, colors.accent);
        }
      }
    }
    // Big explosions across the field
    for (let i = 0; i < 5; i++) {
      const ex = (Math.random() - 0.5) * FIELD_WIDTH;
      const ez = s.playerZ - 5 - Math.random() * 15;
      this.createExplosion(ex, ez, 4, 5);
    }
    (this as any).audioSystem?.playExplosion();
  }

  // ── Flamethrower ──
  private fireFlamethrower(dt: number) {
    const s = this.state;
    const angle = s.playerAngle;
    const colors = this.getColors();
    // Spawn flame particles in a cone
    for (let i = 0; i < 3; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const a = angle + spread;
      const speed = 8 + Math.random() * 4;
      const geo = new SphereGeometry(0.15 + Math.random() * 0.1, 4, 4);
      const mat = new MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff4400 : 0xffaa00,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new Mesh(geo, mat);
      mesh.position.set(s.playerX, 0.5, s.playerZ);
      this.world.scene.add(mesh);
      this.flameParticles.push({
        mesh,
        x: s.playerX,
        z: s.playerZ,
        vx: Math.sin(a) * speed,
        vz: -Math.cos(a) * speed,
        life: 0.4,
        maxLife: 0.4,
      });
    }
    // Damage enemies in cone
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - s.playerX;
      const dz = enemy.z - s.playerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 6) continue;
      const enemyAngle = Math.atan2(dx, -dz);
      let angleDiff = enemyAngle - angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      if (Math.abs(angleDiff) < 0.5) {
        this.damageEnemy(enemy, dt * 8);
      }
    }
  }

  // ── Laser Beam ──
  private fireBeam(dt: number) {
    const s = this.state;
    this.beamState.active = true;
    this.beamState.angle = s.playerAngle;
    // Create/update beam mesh
    if (!this.beamState.mesh) {
      const geo = new BoxGeometry(0.08, 0.08, 12);
      const mat = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
      this.beamState.mesh = new Mesh(geo, mat);
      this.world.scene.add(this.beamState.mesh);
    }
    const beam = this.beamState.mesh;
    const halfLen = 6;
    beam.position.set(
      s.playerX + Math.sin(s.playerAngle) * halfLen,
      0.6,
      s.playerZ - Math.cos(s.playerAngle) * halfLen,
    );
    beam.rotation.y = s.playerAngle;
    beam.visible = true;
    // Piercing damage — hit all enemies along beam path
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - s.playerX;
      const dz = enemy.z - s.playerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 14) continue;
      // Project onto beam direction
      const bx = Math.sin(s.playerAngle);
      const bz = -Math.cos(s.playerAngle);
      const dot = dx * bx + dz * bz;
      if (dot < 0) continue;
      const perpDist = Math.abs(dx * bz - dz * bx);
      if (perpDist < 0.8) {
        this.damageEnemy(enemy, dt * 6);
      }
    }
  }

  // ── Supply Drop Crate ──
  private spawnSupplyCrate() {
    const s = this.state;
    const x = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
    const z = s.playerZ - 8 - Math.random() * 10;
    const group = new Group();
    // Crate body
    const crateGeo = new BoxGeometry(0.8, 0.8, 0.8);
    const crateMat = new MeshStandardMaterial({ color: 0x44aa44, emissive: new Color(0x00ff44), emissiveIntensity: 0.4 });
    group.add(new Mesh(crateGeo, crateMat));
    // Parachute
    const chuteGeo = new ConeGeometry(0.8, 0.6, 6);
    const chuteMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: DoubleSide });
    const chute = new Mesh(chuteGeo, chuteMat);
    chute.position.y = 1.2;
    chute.name = 'chute';
    group.add(chute);
    // Glow ring
    const ringGeo = new RingGeometry(0.6, 0.8, 8);
    const ringMat = new MeshBasicMaterial({ color: 0x00ff44, transparent: true, opacity: 0.3, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.01;
    group.add(ring);

    group.position.set(x, 8, z);
    this.world.scene.add(group);
    this.supplyCrates.push({
      mesh: group,
      x, z,
      vy: -3,
      y: 8,
      landed: false,
      bobTimer: 0,
      life: 15,
    });
    (this as any).audioSystem?.playSupplyDrop();
  }

  // ── Enemy Formation Spawning ──
  private spawnFormation() {
    const s = this.state;
    const formation = Math.random() < 0.5 ? 'v' : 'flank';
    const centerX = (Math.random() - 0.5) * (FIELD_WIDTH - 6);
    const centerZ = s.playerZ - 20 - Math.random() * 5;
    const wave = s.wave;
    const types: string[] = ['soldier'];
    if (wave >= 3) types.push('heavy');
    if (wave >= 5) types.push('runner');
    const type = types[Math.floor(Math.random() * types.length)];

    if (formation === 'v') {
      // V-formation: 5 enemies in a V shape
      const offsets = [
        [0, 0], [-1.5, 2], [1.5, 2], [-3, 4], [3, 4],
      ];
      for (const [ox, oz] of offsets) {
        if (this.enemies.length >= MAX_ENEMIES) break;
        const enemy = this.createEnemy(type, centerX + ox, centerZ + oz);
        enemy.speed *= 1.2; // formation enemies move faster together
        this.enemies.push(enemy);
        if (s.waveEnemiesLeft > 0) s.waveEnemiesLeft--;
      }
    } else {
      // Flanking squad: enemies approach from both sides
      for (let i = 0; i < 3; i++) {
        if (this.enemies.length >= MAX_ENEMIES) break;
        const leftEnemy = this.createEnemy(type, -FIELD_WIDTH / 2 + 1, centerZ + i * 2);
        leftEnemy.speed *= 1.3;
        this.enemies.push(leftEnemy);
        if (s.waveEnemiesLeft > 0) s.waveEnemiesLeft--;
      }
      for (let i = 0; i < 3; i++) {
        if (this.enemies.length >= MAX_ENEMIES) break;
        const rightEnemy = this.createEnemy(type, FIELD_WIDTH / 2 - 1, centerZ + i * 2);
        rightEnemy.speed *= 1.3;
        this.enemies.push(rightEnemy);
        if (s.waveEnemiesLeft > 0) s.waveEnemiesLeft--;
      }
    }
  }

  private startWave() {
    this.state.waveTimer = 0;
    const wave = this.state.wave;
    const baseCount = 4 + Math.floor(wave * 1.5);
    const diffMult = [1, 1.3, 1.6][this.state.difficulty];
    this.state.waveEnemiesLeft = Math.floor(baseCount * diffMult);
    this.state.waveEnemiesTotal = this.state.waveEnemiesLeft;

    // Dramatic wave names
    const waveNames: Record<number, string> = {
      5: 'IRON WALL', 10: 'FIRESTORM', 15: 'DEATH MARCH',
      20: 'NO MERCY', 25: 'HELL GATE', 30: 'ANNIHILATION',
      35: 'LAST STAND', 40: 'EXTINCTION', 45: 'ARMAGEDDON', 50: 'ENDGAME',
    };
    this.state.waveName = waveNames[wave] || (wave >= 15 ? `WAVE ${wave}: CARNAGE` : `WAVE ${wave}`);
    this.state.waveNameTimer = 2.5;

    // Boss rotation: mech every 5th (5,20,35..), artillery every 10th (10,25,40..), helicopter every 15th (15,30,45..)
    let bossType: string | null = null;
    if (wave % 15 === 0) bossType = 'attack_heli';
    else if (wave % 10 === 0) bossType = 'artillery';
    else if (wave % 5 === 0) bossType = 'boss';

    if (bossType) {
      this.state.bossActive = true;
      this.state.bossType = bossType;
      const boss = this.createEnemy(bossType, 0, this.state.playerZ - 15);
      this.state.bossEntity = boss;
      this.enemies.push(boss);
      this.state.waveEnemiesLeft--;
      (this as any).audioSystem?.playBossEntrance();
      // Artillery spawns soldier adds
      if (bossType === 'artillery') {
        for (let i = 0; i < 3; i++) {
          const ax = (Math.random() - 0.5) * 8;
          const az = this.state.playerZ - 12 - Math.random() * 6;
          this.enemies.push(this.createEnemy('soldier', ax, az));
        }
      }
    }

    // Spawn obstacles
    const obstacleTypes = ['sandbag', 'barrel', 'crate', 'wall'];
    for (let i = 0; i < 3 + Math.floor(wave * 0.3); i++) {
      const ox = (Math.random() - 0.5) * (FIELD_WIDTH - 2);
      const oz = this.state.playerZ - 10 - Math.random() * 20;
      this.spawnObstacle(
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
        ox, oz,
      );
    }

    this.state.totalWaves = Math.max(this.state.totalWaves, wave);
    this.checkWaveAchievements();

    // Spawn terrain features ahead
    if (wave >= 2 && Math.random() < 0.6) {
      this.spawnTerrainFeature(this.state.playerZ - 25 - Math.random() * 15);
    }

    // Assign a mission every 2 waves starting wave 2
    if (wave >= 2 && wave % 2 === 0) {
      this.assignMission();
    }

    // Respawn companion if dead
    if (this.companion && !this.companion.alive) {
      this.respawnCompanion();
    }

    // Spawn mines starting wave 4
    if (wave >= 4) {
      const mineCount = 2 + Math.floor(wave * 0.3);
      for (let i = 0; i < mineCount; i++) {
        const mx = (Math.random() - 0.5) * (FIELD_WIDTH - 2);
        const mz = this.state.playerZ - 8 - Math.random() * 18;
        this.spawnMine(mx, mz);
      }
    }

    // Spawn fuel drums starting wave 3
    if (wave >= 3) {
      const drumCount = 1 + Math.floor(wave * 0.2);
      for (let i = 0; i < Math.min(drumCount, 4); i++) {
        const fx = (Math.random() - 0.5) * (FIELD_WIDTH - 3);
        const fz = this.state.playerZ - 8 - Math.random() * 18;
        this.spawnFuelDrum(fx, fz);
      }
    }

    // Spawn electric fences starting wave 6
    if (wave >= 6 && Math.random() < 0.5 + wave * 0.02) {
      const fenceCount = 1 + Math.floor(wave / 10);
      for (let i = 0; i < Math.min(fenceCount, 3); i++) {
        const ex = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
        const ez = this.state.playerZ - 10 - Math.random() * 15;
        this.spawnElectricFence(ex, ez);
      }
    }

    // Spawn mortar zones starting wave 8
    if (wave >= 8 && Math.random() < 0.4 + wave * 0.02) {
      const mortarCount = 1 + Math.floor(wave / 12);
      for (let i = 0; i < Math.min(mortarCount, 3); i++) {
        const mx = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
        const mz = this.state.playerZ - 8 - Math.random() * 16;
        this.spawnMortarZone(mx, mz);
      }
    }

    (this as any).audioSystem?.playWaveStart();

    // Radio chatter at wave start (every 3 waves)
    if (wave % 3 === 0 && wave > 1) {
      const chatter = GameSystem.RADIO_CHATTER_POOL;
      this.triggerRadioChatter(chatter[Math.floor(Math.random() * chatter.length)]);
    }

    // Environmental storytelling — debris in later waves
    this.spawnWaveDebris();

    // Turret emplacements starting wave 5
    if (wave >= 5 && Math.random() < 0.4 + wave * 0.01) {
      const turretCount = 1 + Math.floor(wave / 15);
      for (let i = 0; i < Math.min(turretCount, 2); i++) {
        const tx = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
        const tz = this.state.playerZ - 8 - Math.random() * 14;
        this.spawnTurretEmplacement(tx, tz);
      }
    }
  }

  private spawnWaveEnemy() {
    if (this.enemies.length >= MAX_ENEMIES || this.state.waveEnemiesLeft <= 0) return;

    const wave = this.state.wave;
    const types: string[] = ['soldier'];
    if (wave >= 2) types.push('soldier', 'heavy');
    if (wave >= 3) types.push('sniper');
    if (wave >= 4) types.push('runner');
    if (wave >= 5) types.push('turret');
    if (wave >= 6) types.push('officer');
    if (wave >= 7) types.push('tank');
    if (wave >= 8) types.push('helicopter');
    if (wave >= 7) types.push('apc');

    const type = types[Math.floor(Math.random() * types.length)];

    // Spawn position — ahead of player, spread across width
    const spawnZ = this.state.playerZ - 18 - Math.random() * 8;
    const spawnX = (Math.random() - 0.5) * (FIELD_WIDTH - 2);

    const enemy = this.createEnemy(type, spawnX, spawnZ);
    this.enemies.push(enemy);
    this.state.waveEnemiesLeft--;
  }

  // ── Start Game ──
  startGame(mode: number, difficulty: number) {
    // Clear entities
    this.clearGameEntities();

    const s = this.state;
    s.phase = 'playing';
    s.score = 0;
    s.lives = [3, 2, 1][difficulty];
    s.wave = 1;
    s.kills = 0;
    s.combo = 0;
    s.comboTimer = 0;
    s.bestCombo = 0;
    s.grenadeCount = 5;
    s.smokeGrenadeCount = 2;
    s.inTurret = false;
    s.turretHp = 0;
    s.decoyCooldown = 0;
    s.decoyActive = false;
    s.rollTimer = 0;
    s.rollCooldown = 0;
    s.rollDirX = 0;
    s.rollDirZ = 0;
    s.currentBiome = 0;
    s.weaponType = 'single';
    s.weaponTimer = 0;
    s.shieldTimer = 0;
    s.speedBoostTimer = 0;
    s.playerX = 0;
    s.playerZ = 0;
    s.playerAngle = 0;
    s.scrollZ = 0;
    s.scrollSpeed = 3;
    s.shootCooldown = 0;
    s.invincibleTimer = 0;
    s.difficulty = difficulty;
    s.mode = mode;
    s.modeTimer = mode === 1 ? 120 : 0;
    s.gameTime = 0;
    s.enemySpawnTimer = 0;
    s.bossActive = false;
    s.bossEntity = null;
    s.killStreak = 0;
    s.killStreakBest = 0;
    s.killStreakSpeedActive = false;
    s.killStreakRapidActive = false;
    s.killStreakShieldActive = false;
    s.supplyDropTimer = 30;
    s.inVehicle = false;
    s.vehicleHp = 0;
    s.vehicleTimer = 40;

    if (mode === 2) s.lives = 99; // Zen
    s.currentMission = null;
    s.missionBriefTimer = 0;
    s.missionsCompleted = 0;
    s.companionKills = 0;
    s.runAchievementsEarned = 0;

    this.spawnCompanion();
    this.startWave();
  }

  private clearGameEntities() {
    for (const b of this.bullets) this.world.scene.remove(b.mesh);
    this.bullets = [];
    for (const e of this.enemies) this.world.scene.remove(e.mesh);
    this.enemies = [];
    for (const g of this.grenades) this.world.scene.remove(g.mesh);
    this.grenades = [];
    for (const x of this.explosions) this.world.scene.remove(x.mesh);
    this.explosions = [];
    for (const p of this.powerUps) this.world.scene.remove(p.mesh);
    this.powerUps = [];
    for (const p of this.particles) this.world.scene.remove(p.mesh);
    this.particles = [];
    for (const o of this.obstacles) this.world.scene.remove(o.mesh);
    this.obstacles = [];
    for (const sc of this.supplyCrates) this.world.scene.remove(sc.mesh);
    this.supplyCrates = [];
    for (const fp of this.flameParticles) this.world.scene.remove(fp.mesh);
    this.flameParticles = [];
    if (this.beamState.mesh) {
      this.world.scene.remove(this.beamState.mesh);
      this.beamState.mesh = null;
      this.beamState.active = false;
    }
    for (const v of this.vehicles) this.world.scene.remove(v.mesh);
    this.vehicles = [];
    this.activeVehicle = null;
    for (const f of this.muzzleFlashes) this.world.scene.remove(f.mesh);
    this.muzzleFlashes = [];
    for (const t of this.tracerRounds) this.world.scene.remove(t.mesh);
    this.tracerRounds = [];
    for (const tf of this.terrainFeatures) this.terrainGroup.remove(tf.mesh);
    this.terrainFeatures = [];
    if (this.companion) {
      this.world.scene.remove(this.companion.mesh);
      this.companion = null;
    }
    for (const cage of this.powCages) this.world.scene.remove(cage.mesh);
    this.powCages = [];
    for (const m of this.mines) this.world.scene.remove(m.mesh);
    this.mines = [];
    for (const sc of this.smokeClouds) {
      for (const m of sc.meshes) this.world.scene.remove(m);
    }
    this.smokeClouds = [];
    for (const sp of this.scorePopups) this.world.scene.remove(sp.mesh);
    this.scorePopups = [];
    for (const d of this.debrisMeshes) this.world.scene.remove(d);
    this.debrisMeshes = [];
    for (const ut of this.upgradeTokens) this.world.scene.remove(ut.mesh);
    this.upgradeTokens = [];
    for (const te of this.turretEmplacements) this.world.scene.remove(te.mesh);
    this.turretEmplacements = [];
    this.activeTurret = null;
    this.clearDecoys();
  }

  // ── Vehicle System ──
  private spawnVehicle() {
    const s = this.state;
    const colors = this.getColors();
    const group = new Group();

    // Chassis
    const chassisGeo = new BoxGeometry(1.4, 0.4, 2.2);
    const chassisMat = new MeshStandardMaterial({ color: 0x446644, emissive: new Color(colors.primary), emissiveIntensity: 0.2 });
    group.add(new Mesh(chassisGeo, chassisMat));

    // Cab
    const cabGeo = new BoxGeometry(1.0, 0.5, 0.8);
    const cabMat = new MeshStandardMaterial({ color: 0x557755, emissive: new Color(colors.primary), emissiveIntensity: 0.15 });
    const cab = new Mesh(cabGeo, cabMat);
    cab.position.set(0, 0.45, 0.4);
    group.add(cab);

    // Wireframe overlay
    const wireGeo = new EdgesGeometry(new BoxGeometry(1.5, 0.9, 2.3));
    const wireMat = new LineBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.5 });
    group.add(new LineSegments(wireGeo, wireMat));

    // Wheels (4 corners)
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const wheelGeo = new CylinderGeometry(0.25, 0.25, 0.15, 8);
        const wheelMat = new MeshStandardMaterial({ color: 0x222222 });
        const wheel = new Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(sx * 0.75, -0.15, sz * 0.8);
        group.add(wheel);
      }
    }

    // Gun turret on bed
    const turretGeo = new CylinderGeometry(0.2, 0.25, 0.2, 6);
    const turretMat = new MeshStandardMaterial({ color: 0x888888, emissive: new Color(colors.accent), emissiveIntensity: 0.3 });
    const turret = new Mesh(turretGeo, turretMat);
    turret.position.set(0, 0.5, -0.5);
    group.add(turret);
    const barrelGeo = new CylinderGeometry(0.05, 0.05, 0.8, 6);
    const barrel = new Mesh(barrelGeo, turretMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.55, -0.9);
    group.add(barrel);

    // Glow indicator ring
    const ringGeo = new RingGeometry(1.2, 1.4, 12);
    const ringMat = new MeshBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.35, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.name = 'indicator';
    group.add(ring);

    const x = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
    const z = s.playerZ - 10 - Math.random() * 8;
    group.position.set(x, 0, z);
    this.world.scene.add(group);

    this.vehicles.push({ mesh: group, x, z, hp: 3, maxHp: 3, occupied: false, bobTimer: 0, gunCooldown: 0 });
  }

  private mountVehicle(v: Vehicle) {
    const s = this.state;
    s.inVehicle = true;
    s.vehicleHp = v.hp;
    s.careerVehiclesUsed++;
    v.occupied = true;
    this.activeVehicle = v;
    this.playerGroup.visible = false;
    // Hide indicator ring
    const ring = v.mesh.getObjectByName('indicator');
    if (ring) ring.visible = false;
    (this as any).audioSystem?.playVehicleMount();
  }

  private dismountVehicle(eject: boolean) {
    const s = this.state;
    s.inVehicle = false;
    this.playerGroup.visible = true;
    if (this.activeVehicle) {
      this.activeVehicle.occupied = false;
      if (eject) {
        // Explode vehicle
        this.createExplosion(this.activeVehicle.x, this.activeVehicle.z, 3, 2);
        this.world.scene.remove(this.activeVehicle.mesh);
        const idx = this.vehicles.indexOf(this.activeVehicle);
        if (idx >= 0) this.vehicles.splice(idx, 1);
        s.invincibleTimer = Math.max(s.invincibleTimer, 2); // brief invincibility
      }
      this.activeVehicle = null;
    }
    (this as any).audioSystem?.playVehicleDismount();
  }

  private updateVehicles(dt: number) {
    const s = this.state;

    // Vehicle spawn timer
    s.vehicleTimer -= dt;
    if (s.vehicleTimer <= 0 && this.vehicles.length < 2) {
      s.vehicleTimer = 35 + Math.random() * 15;
      this.spawnVehicle();
    }

    // Check mount proximity for unoccupied vehicles
    for (const v of this.vehicles) {
      if (v.occupied) continue;
      v.bobTimer += dt;
      // Pulse indicator
      const ring = v.mesh.getObjectByName('indicator');
      if (ring) {
        (ring as Mesh).rotation.y += dt;
        const mat = (ring as Mesh).material as MeshBasicMaterial;
        mat.opacity = 0.2 + Math.sin(v.bobTimer * 3) * 0.15;
      }
      // Mount check
      if (!s.inVehicle) {
        const dx = s.playerX - v.x;
        const dz = s.playerZ - v.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.5) {
          this.mountVehicle(v);
        }
      }
    }

    // Update active vehicle
    if (s.inVehicle && this.activeVehicle) {
      const v = this.activeVehicle;
      v.x = s.playerX;
      v.z = s.playerZ;
      v.mesh.position.set(v.x, 0, v.z);
      v.mesh.rotation.y = s.playerAngle;
      v.gunCooldown -= dt;
    }

    // Remove vehicles far behind
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      if (!v.occupied && v.z > s.playerZ + 20) {
        this.world.scene.remove(v.mesh);
        this.vehicles.splice(i, 1);
      }
    }
  }

  // ── Turret Emplacements ──
  private spawnTurretEmplacement(x: number, z: number) {
    const colors = this.getColors();
    const group = new Group();

    // Sandbag ring base
    const baseGeo = new CylinderGeometry(1.0, 1.2, 0.4, 10);
    const baseMat = new MeshStandardMaterial({ color: 0x665533, emissive: new Color(colors.primary), emissiveIntensity: 0.1 });
    group.add(new Mesh(baseGeo, baseMat));

    // Gun mount pedestal
    const pedGeo = new CylinderGeometry(0.15, 0.2, 0.5, 6);
    const pedMat = new MeshStandardMaterial({ color: 0x888888, emissive: new Color(colors.accent), emissiveIntensity: 0.2 });
    const ped = new Mesh(pedGeo, pedMat);
    ped.position.y = 0.45;
    group.add(ped);

    // Twin barrels
    for (let s = -1; s <= 1; s += 2) {
      const barrelGeo = new CylinderGeometry(0.04, 0.04, 1.0, 6);
      const barrelMat = new MeshStandardMaterial({ color: 0xaaaaaa, emissive: new Color(colors.accent), emissiveIntensity: 0.3 });
      const barrel = new Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(s * 0.12, 0.6, -0.5);
      barrel.name = 'barrel';
      group.add(barrel);
    }

    // Shield plate
    const shieldGeo = new BoxGeometry(0.8, 0.35, 0.06);
    const shieldMat = new MeshStandardMaterial({ color: 0x555555, emissive: new Color(colors.primary), emissiveIntensity: 0.15 });
    const shield = new Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.55, -0.25);
    group.add(shield);

    // Indicator ring (pulsing when unmanned)
    const ringGeo = new RingGeometry(1.3, 1.5, 12);
    const ringMat = new MeshBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.3, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.name = 'turretIndicator';
    group.add(ring);

    group.position.set(x, 0, z);
    this.world.scene.add(group);
    this.turretEmplacements.push({ mesh: group, x, z, hp: 5, maxHp: 5, occupied: false, angle: 0, shootCooldown: 0 });
  }

  private mountTurret(t: TurretEmplacement) {
    const s = this.state;
    s.inTurret = true;
    s.turretHp = t.hp;
    t.occupied = true;
    this.activeTurret = t;
    // Snap player to turret position
    s.playerX = t.x;
    s.playerZ = t.z;
    this.playerGroup.visible = false;
    // Hide indicator
    const ring = t.mesh.getObjectByName('turretIndicator');
    if (ring) ring.visible = false;
    (this as any).audioSystem?.playVehicleMount();
  }

  private dismountTurret(destroyed: boolean) {
    const s = this.state;
    s.inTurret = false;
    this.playerGroup.visible = true;
    if (this.activeTurret) {
      this.activeTurret.occupied = false;
      if (destroyed) {
        this.createExplosion(this.activeTurret.x, this.activeTurret.z, 2.5, 1);
        this.world.scene.remove(this.activeTurret.mesh);
        const idx = this.turretEmplacements.indexOf(this.activeTurret);
        if (idx >= 0) this.turretEmplacements.splice(idx, 1);
        s.invincibleTimer = Math.max(s.invincibleTimer, 1.5);
      }
      this.activeTurret = null;
    }
    (this as any).audioSystem?.playVehicleDismount();
  }

  private updateTurretEmplacements(dt: number) {
    const s = this.state;

    // Check mount proximity for unmanned turrets
    for (const t of this.turretEmplacements) {
      if (t.occupied) continue;
      // Pulse indicator
      const ring = t.mesh.getObjectByName('turretIndicator');
      if (ring) {
        (ring as Mesh).rotation.y += dt;
        const mat = (ring as Mesh).material as MeshBasicMaterial;
        mat.opacity = 0.2 + Math.sin(s.gameTime * 3) * 0.15;
      }
    }

    // Update active turret — player can aim but not move
    if (s.inTurret && this.activeTurret) {
      const t = this.activeTurret;
      s.playerX = t.x;
      s.playerZ = t.z;
      t.mesh.rotation.y = s.playerAngle;
      t.angle = s.playerAngle;
      t.shootCooldown -= dt;
    }

    // Remove turrets far behind
    for (let i = this.turretEmplacements.length - 1; i >= 0; i--) {
      const t = this.turretEmplacements[i];
      if (!t.occupied && t.z > s.playerZ + 20) {
        this.world.scene.remove(t.mesh);
        this.turretEmplacements.splice(i, 1);
      }
    }
  }

  // ── Decoy Hologram ──
  private spawnDecoy() {
    const s = this.state;
    if (s.decoyCooldown > 0 || s.decoyActive) return;

    const colors = this.getColors();
    const group = new Group();

    // Holographic player silhouette
    const bodyGeo = new BoxGeometry(0.45, 0.6, 0.35);
    const holoMat = new MeshBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.5 });
    group.add(new Mesh(bodyGeo, holoMat));
    const headGeo = new SphereGeometry(0.15, 6, 5);
    const head = new Mesh(headGeo, holoMat);
    head.position.y = 0.45;
    group.add(head);
    // Wireframe overlay
    const wireGeo = new EdgesGeometry(new BoxGeometry(0.5, 0.65, 0.4));
    const wireMat = new LineBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.7 });
    group.add(new LineSegments(wireGeo, wireMat));
    // Base ring
    const ringGeo = new RingGeometry(0.4, 0.5, 8);
    const ringMat = new MeshBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.4, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    const dx = s.playerX;
    const dz = s.playerZ;
    group.position.set(dx, 0, dz);
    this.world.scene.add(group);

    // Remove existing decoy if somehow active
    this.clearDecoys();

    this.decoys.push({ mesh: group, x: dx, z: dz, timer: 6, maxTime: 6 });
    s.decoyActive = true;
    s.decoyCooldown = 15;
    s.careerDecoyUses++;
    (this as any).audioSystem?.playPowerUp();
  }

  private clearDecoys() {
    for (const d of this.decoys) {
      this.world.scene.remove(d.mesh);
    }
    this.decoys = [];
    this.state.decoyActive = false;
  }

  private updateDecoys(dt: number) {
    const s = this.state;
    if (s.decoyCooldown > 0) s.decoyCooldown -= dt;

    for (let i = this.decoys.length - 1; i >= 0; i--) {
      const d = this.decoys[i];
      d.timer -= dt;
      // Flicker effect
      const alpha = d.timer > 1 ? 0.5 : 0.5 * (d.timer / 1);
      d.mesh.traverse(child => {
        if ((child as Mesh).material) {
          const mat = (child as Mesh).material as MeshBasicMaterial;
          if (mat.opacity !== undefined) mat.opacity = alpha + Math.sin(s.gameTime * 12) * 0.15;
        }
      });
      // Slow rotation for hologram effect
      d.mesh.rotation.y = Math.sin(s.gameTime * 2) * 0.3;

      if (d.timer <= 0) {
        // Expire: flash particles
        const colors = this.getColors();
        for (let j = 0; j < 6; j++) {
          this.spawnParticle(d.x, 0.5, d.z, colors.primary, 0.8);
        }
        this.world.scene.remove(d.mesh);
        this.decoys.splice(i, 1);
        s.decoyActive = false;
      }
    }
  }

  // Get decoy position for enemy targeting (returns decoy if active, otherwise null)
  private getDecoyTarget(): { x: number; z: number } | null {
    if (this.decoys.length > 0 && this.decoys[0].timer > 0) {
      return { x: this.decoys[0].x, z: this.decoys[0].z };
    }
    return null;
  }

  // ── Officer Aura Logic ──
  private updateOfficerAuras(dt: number) {
    // Officers boost nearby allied enemies' speed by 1.5x
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      // Reset any officer-boosted flag
      (enemy as any)._officerBoosted = false;
    }
    for (const officer of this.enemies) {
      if (officer.dead || officer.type !== 'officer') continue;
      // Pulse aura visual
      const aura = officer.mesh.getObjectByName('commandAura');
      if (aura) {
        const mat = (aura as Mesh).material as MeshBasicMaterial;
        mat.opacity = 0.15 + Math.sin(this.state.gameTime * 4) * 0.1;
        (aura as Mesh).rotation.y += dt * 0.5;
      }
      // Boost nearby enemies
      for (const ally of this.enemies) {
        if (ally.dead || ally === officer || ally.type === 'officer') continue;
        const dx = ally.x - officer.x;
        const dz = ally.z - officer.z;
        if (Math.sqrt(dx * dx + dz * dz) < 5) {
          (ally as any)._officerBoosted = true;
        }
      }
    }
  }

  // ── Terrain Features ──
  private spawnTerrainFeature(z: number) {
    const colors = this.getColors();
    const types: Array<'river' | 'bunker' | 'trench'> = ['river', 'bunker', 'trench'];
    const type = types[Math.floor(Math.random() * types.length)];
    const group = new Group();

    switch (type) {
      case 'river': {
        // Water strip with bridge
        const waterGeo = new PlaneGeometry(FIELD_WIDTH + 2, 3, 1, 1);
        const waterMat = new MeshBasicMaterial({ color: 0x1144aa, transparent: true, opacity: 0.55, side: DoubleSide });
        const water = new Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.02;
        group.add(water);
        // Shimmer overlay
        const shimmerGeo = new PlaneGeometry(FIELD_WIDTH + 2, 3, 8, 2);
        const shimmerMat = new MeshBasicMaterial({ color: 0x2266cc, transparent: true, opacity: 0.25, side: DoubleSide });
        const shimmer = new Mesh(shimmerGeo, shimmerMat);
        shimmer.rotation.x = -Math.PI / 2;
        shimmer.position.y = 0.04;
        shimmer.name = 'shimmer';
        group.add(shimmer);
        // Bridge
        const bridgeX = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
        const bridgeGeo = new BoxGeometry(3, 0.15, 3.5);
        const bridgeMat = new MeshStandardMaterial({ color: 0x664422, roughness: 0.9 });
        const bridge = new Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(bridgeX, 0.08, 0);
        group.add(bridge);
        // Rails
        for (const s of [-1, 1]) {
          const railGeo = new BoxGeometry(0.1, 0.4, 3.5);
          const rail = new Mesh(railGeo, bridgeMat);
          rail.position.set(bridgeX + s * 1.45, 0.2, 0);
          group.add(rail);
        }
        break;
      }
      case 'bunker': {
        // Concrete bunker structure
        const bx = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
        const bunkerGeo = new BoxGeometry(2.5, 1.2, 1.8);
        const bunkerMat = new MeshStandardMaterial({ color: 0x555555, roughness: 0.95 });
        group.add(new Mesh(bunkerGeo, bunkerMat));
        group.children[0].position.set(bx, 0.6, 0);
        // Slit window
        const slitGeo = new BoxGeometry(1.5, 0.2, 0.1);
        const slitMat = new MeshBasicMaterial({ color: 0x111111 });
        const slit = new Mesh(slitGeo, slitMat);
        slit.position.set(bx, 0.9, -0.91);
        group.add(slit);
        // Roof edge
        const roofGeo = new BoxGeometry(2.7, 0.1, 2.0);
        const roofMat = new MeshStandardMaterial({ color: 0x444444 });
        const roof = new Mesh(roofGeo, roofMat);
        roof.position.set(bx, 1.25, 0);
        group.add(roof);
        break;
      }
      case 'trench': {
        // Indented strip
        const trenchGeo = new BoxGeometry(FIELD_WIDTH - 2, 0.3, 2);
        const trenchMat = new MeshStandardMaterial({ color: 0x332211, roughness: 1.0 });
        const trench = new Mesh(trenchGeo, trenchMat);
        trench.position.y = -0.15;
        group.add(trench);
        // Trench walls
        for (const s of [-1, 1]) {
          const wallGeo = new BoxGeometry(FIELD_WIDTH - 2, 0.4, 0.15);
          const wallMat = new MeshStandardMaterial({ color: 0x443322 });
          const wall = new Mesh(wallGeo, wallMat);
          wall.position.set(0, 0.05, s * 1.0);
          group.add(wall);
        }
        // Sandbag clusters
        for (let i = 0; i < 3; i++) {
          const sbGeo = new BoxGeometry(0.8, 0.3, 0.4);
          const sbMat = new MeshStandardMaterial({ color: 0x887755 });
          const sb = new Mesh(sbGeo, sbMat);
          sb.position.set(-4 + i * 4, 0.2, (Math.random() > 0.5 ? 1 : -1) * 0.8);
          group.add(sb);
        }
        break;
      }
    }

    group.position.set(0, 0, z);
    this.terrainGroup.add(group);
    this.terrainFeatures.push({ mesh: group, z, type });
  }

  // ── Muzzle Flash ──
  private spawnMuzzleFlash(x: number, y: number, z: number) {
    const geo = new SphereGeometry(0.2, 6, 4);
    const mat = new MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 1.0 });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.world.scene.add(mesh);
    this.muzzleFlashes.push({ mesh, life: 0.06 });
  }

  private updateMuzzleFlashes(dt: number) {
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      const f = this.muzzleFlashes[i];
      f.life -= dt;
      const mat = f.mesh.material as MeshBasicMaterial;
      mat.opacity = f.life / 0.06;
      f.mesh.scale.setScalar(1 + (0.06 - f.life) * 15);
      if (f.life <= 0) {
        this.world.scene.remove(f.mesh);
        this.muzzleFlashes.splice(i, 1);
      }
    }
  }

  // ── Tracer Rounds ──
  private fireTracerRound(x: number, z: number, angle: number) {
    const group = new Group();
    // Bright core
    const coreGeo = new SphereGeometry(0.1, 4, 4);
    const coreMat = new MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 1 });
    group.add(new Mesh(coreGeo, coreMat));
    // Trail
    const trailGeo = new CylinderGeometry(0.04, 0.08, 0.5, 4);
    const trailMat = new MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 });
    const trail = new Mesh(trailGeo, trailMat);
    trail.rotation.x = Math.PI / 2;
    trail.position.z = 0.3;
    group.add(trail);

    group.position.set(x, 0.5, z);
    group.rotation.y = angle;
    this.world.scene.add(group);

    this.tracerRounds.push({
      mesh: group,
      vx: Math.sin(angle) * ENEMY_BULLET_SPEED,
      vz: -Math.cos(angle) * ENEMY_BULLET_SPEED,
      life: 2,
    });

    // Fire muzzle flash at source
    this.spawnMuzzleFlash(x, 0.5, z);
  }

  private updateTracerRounds(dt: number) {
    const s = this.state;
    for (let i = this.tracerRounds.length - 1; i >= 0; i--) {
      const t = this.tracerRounds[i];
      t.mesh.position.x += t.vx * dt;
      t.mesh.position.z += t.vz * dt;
      t.life -= dt;

      // Player hit check
      const dx = t.mesh.position.x - s.playerX;
      const dz = t.mesh.position.z - s.playerZ;
      if (Math.sqrt(dx * dx + dz * dz) < 0.5) {
        if (s.inVehicle) {
          s.vehicleHp--;
          if (s.vehicleHp <= 0) this.dismountVehicle(true);
        } else {
          this.damagePlayer();
        }
        this.world.scene.remove(t.mesh);
        this.tracerRounds.splice(i, 1);
        continue;
      }

      if (t.life <= 0 || Math.abs(t.mesh.position.x) > FIELD_WIDTH ||
          Math.abs(t.mesh.position.z - s.scrollZ) > FIELD_DEPTH) {
        this.world.scene.remove(t.mesh);
        this.tracerRounds.splice(i, 1);
      }
    }
  }

  // ── Enhanced Death Animations ──
  private killEnemyEnhanced(enemy: Enemy) {
    const colors = this.getColors();
    const isBossType = enemy.type === 'boss' || enemy.type === 'artillery' || enemy.type === 'attack_heli';
    if (isBossType) {
      // Multi-stage boss death: multiple explosions
      for (let i = 0; i < 4; i++) {
        const ox = (Math.random() - 0.5) * 1.5;
        const oz = (Math.random() - 0.5) * 1.5;
        this.createExplosion(enemy.x + ox, enemy.z + oz, 2, 0);
      }
      this.state.screenShake = 0.8;
    }
    // Spin + fade death
    enemy.dead = true;
    enemy.deathTimer = isBossType ? 1.0 : 0.5;
    // Scatter extra particles
    const count = isBossType ? 20 : 10;
    for (let i = 0; i < count; i++) {
      this.spawnParticle(enemy.x, 0.5, enemy.z, colors.enemy, 1.2);
    }
    // APC deploys soldiers on death
    if (enemy.type === 'apc') {
      this.state.careerAPCKills++;
      const soldiersToSpawn = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < soldiersToSpawn; i++) {
        const sx = enemy.x + (Math.random() - 0.5) * 2;
        const sz = enemy.z + (Math.random() - 0.5) * 2;
        if (this.enemies.length < MAX_ENEMIES) {
          this.enemies.push(this.createEnemy('soldier', sx, sz));
        }
      }
      this.createExplosion(enemy.x, enemy.z, 2.5, 1);
      this.state.screenShake = 0.5;
    }
    // Drop dog tag (30% chance for regular, 100% for officers/APCs, 60% for elites)
    const isElite = (enemy as any).isElite;
    const tagChance = (enemy.type === 'officer' || enemy.type === 'apc') ? 1.0 : isElite ? 0.6 : 0.3;
    if (Math.random() < tagChance) {
      this.spawnDogTag(enemy.x, enemy.z);
    }
  }

  // ── Mission System ──
  private assignMission() {
    const s = this.state;
    const wave = s.wave;
    const missionTypes: Mission['type'][] = ['destroy', 'rescue', 'extraction', 'commander'];
    const pick = missionTypes[wave % missionTypes.length];
    let mission: Mission;
    switch (pick) {
      case 'destroy':
        mission = { type: 'destroy', name: 'Destroy the Base', description: 'Eliminate 8 enemies this wave', target: 8, progress: 0, complete: false, bonusScore: 500 };
        break;
      case 'rescue':
        mission = { type: 'rescue', name: 'Rescue POWs', description: 'Reach all POW cages', target: 2, progress: 0, complete: false, bonusScore: 750 };
        this.spawnPOWCages(2);
        break;
      case 'extraction':
        mission = { type: 'extraction', name: 'Reach Extraction', description: 'Survive this wave', target: 1, progress: 0, complete: false, bonusScore: 400 };
        break;
      case 'commander':
        mission = { type: 'commander', name: 'Eliminate Commander', description: 'Defeat the wave commander', target: 1, progress: 0, complete: false, bonusScore: 1000 };
        // Mark a strong enemy as "commander" — spawn one if wave has enemies
        break;
    }
    s.currentMission = mission;
    s.missionBriefTimer = 3.0; // show briefing for 3 seconds
  }

  private updateMissions(_dt: number) {
    const s = this.state;
    if (!s.currentMission || s.currentMission.complete) return;
    const m = s.currentMission;

    if (m.type === 'extraction') {
      // Completes when wave ends (checked in wave logic)
      if (s.waveEnemiesLeft <= 0 && this.enemies.filter(e => !e.dead).length === 0) {
        m.progress = 1;
      }
    }
    if (m.progress >= m.target && !m.complete) {
      m.complete = true;
      s.score += m.bonusScore;
      s.missionsCompleted++;
      s.careerMissions++;
      s.lives = Math.min(s.lives + 1, 9); // bonus life
      (this as any).audioSystem?.playMissionComplete();
      this.checkMissionAchievements();
    }
  }

  private onEnemyKilledMission() {
    const m = this.state.currentMission;
    if (!m || m.complete) return;
    if (m.type === 'destroy') m.progress++;
    if (m.type === 'commander') m.progress++; // any boss-type kill counts
  }

  private spawnPOWCages(count: number) {
    const s = this.state;
    const colors = this.getColors();
    for (let i = 0; i < count; i++) {
      const group = new Group();
      // Wireframe cage
      const cageGeo = new EdgesGeometry(new BoxGeometry(0.8, 1.2, 0.8));
      const cageMat = new LineBasicMaterial({ color: '#ffaa00' });
      group.add(new LineSegments(cageGeo, cageMat));
      // Person inside — small cylinder
      const personGeo = new CylinderGeometry(0.15, 0.15, 0.8, 6);
      const personMat = new MeshStandardMaterial({ color: 0x88aaff, emissive: new Color(colors.accent), emissiveIntensity: 0.4 });
      const person = new Mesh(personGeo, personMat);
      person.position.y = 0.1;
      group.add(person);
      const cx = (Math.random() - 0.5) * (FIELD_WIDTH - 4);
      const cz = s.playerZ - 12 - Math.random() * 12;
      group.position.set(cx, 0.6, cz);
      this.world.scene.add(group);
      this.powCages.push({ mesh: group, x: cx, z: cz, rescued: false });
    }
  }

  private updatePOWCages() {
    const s = this.state;
    const m = s.currentMission;
    for (const cage of this.powCages) {
      if (cage.rescued) continue;
      const dx = s.playerX - cage.x;
      const dz = s.playerZ - cage.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1.2) {
        cage.rescued = true;
        cage.mesh.visible = false;
        if (m && m.type === 'rescue') m.progress++;
      }
    }
  }

  // ── AI Companion ──
  private spawnCompanion() {
    const s = this.state;
    const colors = this.getColors();
    const group = new Group();
    // Body
    const bodyGeo = new BoxGeometry(0.4, 0.6, 0.4);
    const bodyMat = new MeshStandardMaterial({ color: 0x2266ff, emissive: new Color('#2288ff'), emissiveIntensity: 0.4 });
    group.add(new Mesh(bodyGeo, bodyMat));
    // Head
    const headGeo = new SphereGeometry(0.18, 6, 6);
    const headMat = new MeshStandardMaterial({ color: 0x44aaff, emissive: new Color('#44ccff'), emissiveIntensity: 0.3 });
    const head = new Mesh(headGeo, headMat);
    head.position.y = 0.48;
    group.add(head);
    // Wireframe overlay
    const wireGeo = new EdgesGeometry(new BoxGeometry(0.5, 0.8, 0.5));
    const wireMat = new LineBasicMaterial({ color: '#44ccff', transparent: true, opacity: 0.5 });
    group.add(new LineSegments(wireGeo, wireMat));
    group.position.set(s.playerX + 1.5, 0.3, s.playerZ + 0.5);
    this.world.scene.add(group);
    this.companion = { mesh: group, x: s.playerX + 1.5, z: s.playerZ + 0.5, alive: true, shootTimer: 0 };
    s.companionAlive = true;
  }

  private updateCompanion(dt: number) {
    const c = this.companion;
    if (!c) return;
    const s = this.state;

    if (!c.alive) {
      c.mesh.visible = false;
      return;
    }
    c.mesh.visible = true;

    // Follow player at offset
    const targetX = s.playerX + 1.5;
    const targetZ = s.playerZ + 0.5;
    c.x += (targetX - c.x) * 3 * dt;
    c.z += (targetZ - c.z) * 3 * dt;
    c.mesh.position.set(c.x, 0.3, c.z);

    // Auto-shoot at nearest enemy
    c.shootTimer -= dt;
    if (c.shootTimer <= 0) {
      let nearest: Enemy | null = null;
      let nearDist = 12;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = e.x - c.x;
        const dz = e.z - c.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < nearDist) {
          nearDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        const dx = nearest.x - c.x;
        const dz = nearest.z - c.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          this.fireCompanionBullet(c.x, c.z, dx / dist, dz / dist);
          c.shootTimer = 0.5; // slower fire rate
        }
      } else {
        c.shootTimer = 0.2;
      }
    }

    // Companion takes damage from enemy bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.isEnemy) continue;
      const dx = b.mesh.position.x - c.x;
      const dz = b.mesh.position.z - c.z;
      if (dx * dx + dz * dz < 0.4) {
        this.world.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
        c.alive = false;
        s.companionAlive = false;
        (this as any).audioSystem?.playCompanionDeath();
        // Death particles
        const colors = this.getColors();
        for (let j = 0; j < 8; j++) {
          this.spawnParticle(c.x, 0.5, c.z, '#4488ff', 0.8);
        }
        break;
      }
    }
  }

  private fireCompanionBullet(x: number, z: number, dx: number, dz: number) {
    const colors = this.getColors();
    const geo = new SphereGeometry(0.08, 4, 4);
    const mat = new MeshBasicMaterial({ color: '#44ccff' });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(x, 0.5, z);
    this.world.scene.add(mesh);
    this.bullets.push({ mesh, vx: dx * 14, vz: dz * 14, life: 1.5, isEnemy: false, damage: 1 });
    (this as any).audioSystem?.playCompanionShoot();
  }  private respawnCompanion() {
    if (!this.companion) return;
    const s = this.state;
    this.companion.alive = true;
    this.companion.x = s.playerX + 1.5;
    this.companion.z = s.playerZ + 0.5;
    this.companion.shootTimer = 1;
    this.companion.mesh.visible = true;
    s.companionAlive = true;
  }

  // ── Minimap/Radar Data ──
  private updateRadarData() {
    const s = this.state;
    const range = 20;
    // Enemies
    s.radarEnemies = [];
    for (const e of this.enemies) {
      if (e.dead) continue;
      const rx = (e.x - s.playerX) / range;
      const rz = (e.z - s.playerZ) / range;
      if (Math.abs(rx) <= 1 && Math.abs(rz) <= 1) {
        s.radarEnemies.push({ rx, rz });
      }
    }
    // Power-ups
    s.radarPowerUps = [];
    for (const p of this.powerUps) {
      const rx = (p.mesh.position.x - s.playerX) / range;
      const rz = (p.mesh.position.z - s.playerZ) / range;
      if (Math.abs(rx) <= 1 && Math.abs(rz) <= 1) {
        s.radarPowerUps.push({ rx, rz });
      }
    }
    // Supplies
    s.radarSupplies = [];
    for (const sc of this.supplyCrates) {
      const rx = (sc.mesh.position.x - s.playerX) / range;
      const rz = (sc.mesh.position.z - s.playerZ) / range;
      if (Math.abs(rx) <= 1 && Math.abs(rz) <= 1) {
        s.radarSupplies.push({ rx, rz });
      }
    }
  }

  // ── Mine System ──
  private spawnMine(x: number, z: number) {
    const colors = this.getColors();
    const group = new Group();
    // Mine disc
    const discGeo = new CylinderGeometry(0.35, 0.35, 0.08, 8);
    const discMat = new MeshStandardMaterial({ color: 0x880000, emissive: new Color(0xff0000), emissiveIntensity: 0.3 });
    group.add(new Mesh(discGeo, discMat));
    // Center indicator
    const dotGeo = new SphereGeometry(0.08, 6, 4);
    const dotMat = new MeshBasicMaterial({ color: 0xff0000 });
    const dot = new Mesh(dotGeo, dotMat);
    dot.position.y = 0.06;
    dot.name = 'mineDot';
    group.add(dot);
    group.position.set(x, 0.04, z);
    this.world.scene.add(group);
    this.mines.push({ mesh: group, x, z, pulseTimer: Math.random() * 2, armed: true });
  }

  private detonateMine(mine: Mine) {
    if (!mine.armed) return;
    mine.armed = false;
    this.state.careerMineKills++;
    this.createExplosion(mine.x, mine.z, 2.5, 3);
    this.world.scene.remove(mine.mesh);

    // Chain explosions — detonate nearby mines
    let chained = false;
    for (const other of this.mines) {
      if (!other.armed) continue;
      const dx = other.x - mine.x, dz = other.z - mine.z;
      if (dx * dx + dz * dz < 9) { // within 3 units
        chained = true;
        setTimeout(() => this.detonateMine(other), 100);
      }
    }
    if (chained) this.state.careerChainExplosions++;
  }

  private updateMines(dt: number) {
    const s = this.state;
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      if (!m.armed) { this.mines.splice(i, 1); continue; }

      // Pulsing glow
      m.pulseTimer += dt * 3;
      const dot = m.mesh.getObjectByName('mineDot') as Mesh | undefined;
      if (dot && dot.material instanceof MeshBasicMaterial) {
        const pulse = 0.3 + Math.sin(m.pulseTimer) * 0.7;
        (dot.material as MeshBasicMaterial).opacity = pulse;
        dot.material.transparent = true;
      }

      // Player collision
      const pdx = s.playerX - m.x, pdz = (s.playerZ) - m.z;
      if (pdx * pdx + pdz * pdz < 0.8) {
        this.detonateMine(m);
        this.damagePlayer();
        continue;
      }

      // Enemy collision
      for (const e of this.enemies) {
        if (e.dead) continue;
        const edx = e.x - m.x, edz = e.z - m.z;
        if (edx * edx + edz * edz < 0.8) {
          this.detonateMine(m);
          break;
        }
      }

      // Off-screen cleanup
      if (m.z > s.scrollZ + 20) {
        this.world.scene.remove(m.mesh);
        this.mines.splice(i, 1);
      }
    }
  }

  // ── Score Popup System ──
  private spawnScorePopup(x: number, z: number, points: number, comboCount: number) {
    const group = new Group();
    const label = comboCount > 2
      ? `COMBO x${comboCount}! +${points}`
      : `+${points}`;
    // Build text from box meshes (billboard style)
    const color = comboCount > 2 ? 0xffaa00 : points >= 250 ? 0xff00ff : 0x00ff88;
    const textMat = new MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    // Simple floating marker cube + point light indicator
    const markerGeo = new BoxGeometry(0.15, 0.15, 0.15);
    const marker = new Mesh(markerGeo, textMat);
    group.add(marker);
    // Score ring
    const ringGeo = new RingGeometry(0.2, 0.35, 6);
    const ringMat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    group.position.set(x, 1, z);
    this.world.scene.add(group);
    this.scorePopups.push({ mesh: group, y: 1, vy: 2.5, life: 1.2 });
  }

  private updateScorePopups(dt: number) {
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const p = this.scorePopups[i];
      p.life -= dt;
      p.y += p.vy * dt;
      p.vy *= 0.97;
      p.mesh.position.y = p.y;
      // Scale down as fading
      const alpha = Math.max(0, p.life / 1.2);
      p.mesh.scale.setScalar(0.8 + alpha * 0.5);
      p.mesh.children.forEach(c => {
        if (c instanceof Mesh && c.material instanceof MeshBasicMaterial) {
          c.material.opacity = alpha;
        }
      });
      if (p.life <= 0) {
        this.world.scene.remove(p.mesh);
        this.scorePopups.splice(i, 1);
      }
    }
  }

  // ── Damage Flash Overlay ──
  private createDamageFlash() {
    const geo = new PlaneGeometry(40, 30);
    const mat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, side: DoubleSide });
    this.damageFlashMesh = new Mesh(geo, mat);
    this.damageFlashMesh.position.set(0, 15, 0);
    this.damageFlashMesh.rotation.x = -Math.PI / 2;
    this.damageFlashMesh.renderOrder = 999;
    this.world.scene.add(this.damageFlashMesh);
  }

  private updateDamageFlash(dt: number) {
    const s = this.state;
    if (s.damageFlashTimer > 0) {
      s.damageFlashTimer -= dt;
      if (this.damageFlashMesh && this.damageFlashMesh.material instanceof MeshBasicMaterial) {
        this.damageFlashMesh.material.opacity = Math.max(0, s.damageFlashTimer / 0.3) * 0.35;
        this.damageFlashMesh.position.set(s.playerX + s.screenShakeX, 12, s.playerZ + s.screenShakeZ - 5);
      }
    } else if (this.damageFlashMesh && this.damageFlashMesh.material instanceof MeshBasicMaterial) {
      this.damageFlashMesh.material.opacity = 0;
    }
  }

  // ── Main Update ──
  update(delta: number) {
    if (!this.initialized) return;
    const dt = Math.min(delta, 0.05);
    const s = this.state;

    if (s.phase === 'playing') {
      s.gameTime += dt;
      this.updateInput(dt);
      this.updatePlayer(dt);
      this.updateBullets(dt);
      this.updateEnemies(dt);
      this.updateGrenades(dt);
      this.updateExplosions(dt);
      this.updatePowerUps(dt);
      this.updateParticles(dt);
      this.updateWaveLogic(dt);
      this.updateSupplyCrates(dt);
      this.updateFlameParticles(dt);
      this.updateVehicles(dt);
      this.updateMuzzleFlashes(dt);
      this.updateTracerRounds(dt);
      this.updateTerrainFeatures(dt);
      this.updateCompanion(dt);
      this.updateMissions(dt);
      this.updatePOWCages();
      this.updateRadarData();
      this.updateMines(dt);
      this.updateScorePopups(dt);
      this.updateDamageFlash(dt);
      this.updateHomingMissiles(dt);
      this.updateFuelDrums(dt);
      this.updateElectricFences(dt);
      this.updateMortarZones(dt);
      this.updateSmokeClouds(dt);
      this.updateUpgradeTokens(dt);
      this.updateBonusObjective(dt);
      this.updateMultiKill(dt);
      this.updateRevengeSurge(dt);
      this.updateTurretEmplacements(dt);
      this.updateDecoys(dt);
      this.updateOfficerAuras(dt);
      this.updateWeatherParticles(dt);
      this.updateThreatArrows(dt);
      this.updateWeaponPickupFlash(dt);
      this.updateDogTags(dt);
      this.updateRadioChatter(dt);
      this.updateAirStrikes(dt);
      this.updateMusicIntensity();
      this.updateCamera(dt);
      this.updateTimers(dt);
      this.updateScreenShake(dt);

      // Mode timer (speed mode)
      if (s.mode === 1) {
        s.modeTimer -= dt;
        if (s.modeTimer <= 0) {
          s.phase = 'results';
          this.saveStats();
        }
      }
    } else if (s.phase === 'menu' || s.phase === 'paused' || s.phase === 'gameover' || s.phase === 'results') {
      this.updateMenuInput();
    }
  }

  private updateInput(dt: number) {
    const s = this.state;
    const kb = this.world.input.keyboard;
    let mx = 0, mz = 0;
    let aimX = 0, aimZ = 0;
    let shooting = false;
    let grenadeThrow = false;

    // Keyboard input
    if (kb.getKeyPressed('KeyW') || kb.getKeyPressed('ArrowUp')) mz = -1;
    if (kb.getKeyPressed('KeyS') || kb.getKeyPressed('ArrowDown')) mz = 1;
    if (kb.getKeyPressed('KeyA') || kb.getKeyPressed('ArrowLeft')) mx = -1;
    if (kb.getKeyPressed('KeyD') || kb.getKeyPressed('ArrowRight')) mx = 1;
    if (kb.getKeyPressed('Space') || kb.getKeyPressed('KeyK')) shooting = true;
    if (kb.getKeyDown('KeyE') || kb.getKeyDown('KeyJ')) grenadeThrow = true;
    // Smoke grenade throw: G key
    let smokeThrow = false;
    if (kb.getKeyDown('KeyG')) smokeThrow = true;
    // Decoy hologram: H key
    let decoyTrigger = false;
    if (kb.getKeyDown('KeyH')) decoyTrigger = true;
    // Air support call-in: R key
    let airSupportTrigger = false;
    if (kb.getKeyDown('KeyR')) airSupportTrigger = true;
    // Turret mount/dismount: F key
    let turretToggle = false;
    if (kb.getKeyDown('KeyF')) turretToggle = true;
    // Dodge roll: Shift key
    let rollTrigger = false;
    if (kb.getKeyDown('ShiftLeft') || kb.getKeyDown('ShiftRight')) rollTrigger = true;
    if (kb.getKeyDown('Escape') || kb.getKeyDown('KeyP')) {
      s.phase = 'paused';
      return;
    }
    // Weapon cycle: Tab or left bumper
    if (kb.getKeyDown('Tab')) {
      this.cycleWeapon();
    }

    // Aim with IJKL or aim toward movement direction
    if (kb.getKeyPressed('Numpad8')) aimZ = -1;
    if (kb.getKeyPressed('Numpad2')) aimZ = 1;
    if (kb.getKeyPressed('Numpad4')) aimX = -1;
    if (kb.getKeyPressed('Numpad6')) aimX = 1;

    // VR controller input
    const rightGP = this.world.input.xr.gamepads.right;
    const leftGP = this.world.input.xr.gamepads.left;

    if (leftGP) {
      const stick = leftGP.getAxesValues(InputComponent.Thumbstick);
      if (stick) {
        if (Math.abs(stick.x) > 0.15) mx = stick.x;
        if (Math.abs(stick.y) > 0.15) mz = stick.y;
      }
    }
    if (rightGP) {
      const stick = rightGP.getAxesValues(InputComponent.Thumbstick);
      if (stick) {
        if (Math.abs(stick.x) > 0.15 || Math.abs(stick.y) > 0.15) {
          aimX = stick.x;
          aimZ = stick.y;
        }
      }
      if (rightGP.getButtonPressed(InputComponent.Trigger)) shooting = true;
      if (rightGP.getButtonDown(InputComponent.A_Button)) grenadeThrow = true;
      if (rightGP.getButtonDown(InputComponent.Y_Button)) rollTrigger = true;
      if (rightGP.getButtonDown(InputComponent.B_Button)) {
        s.phase = 'paused';
        return;
      }
    }
    if (leftGP) {
      if (leftGP.getButtonDown(InputComponent.Trigger)) grenadeThrow = true;
      if (leftGP.getButtonDown(InputComponent.X_Button)) this.cycleWeapon();
      if (leftGP.getButtonDown(InputComponent.A_Button)) smokeThrow = true;
      if (leftGP.getButtonDown(InputComponent.Y_Button)) airSupportTrigger = true;
    }

    // Dodge roll cooldown
    if (s.rollCooldown > 0) s.rollCooldown -= dt;

    // Initiate dodge roll
    if (rollTrigger && s.rollCooldown <= 0 && s.rollTimer <= 0 && !s.inVehicle) {
      s.rollTimer = 0.3;
      s.rollCooldown = 1.5;
      if (mx !== 0 || mz !== 0) {
        const mag = Math.sqrt(mx * mx + mz * mz);
        s.rollDirX = mx / mag;
        s.rollDirZ = mz / mag;
      } else {
        s.rollDirX = Math.sin(s.playerAngle);
        s.rollDirZ = -Math.cos(s.playerAngle);
      }
    }

    // Movement — dodge roll overrides normal movement, turret locks position
    if (s.inTurret) {
      // In turret: only allow aiming, no movement
      mx = 0; mz = 0;
    }
    const vehicleSpeedMult = s.inVehicle ? 1.6 : 1;
    const revengeSpeedMult = s.revengeSurgeTimer > 0 ? 1.5 : 1;
    const speed = (s.speedBoostTimer > 0 ? s.playerSpeed * 1.5 : s.playerSpeed) * vehicleSpeedMult * revengeSpeedMult;
    if (s.rollTimer > 0) {
      s.rollTimer -= dt;
      const rollSpeed = s.playerSpeed * 3;
      s.playerX += s.rollDirX * rollSpeed * dt;
      s.playerZ += s.rollDirZ * rollSpeed * dt;
      // Quick spin visual
      this.playerGroup.rotation.x = (s.rollTimer / 0.3) * Math.PI * 2;
    } else {
      this.playerGroup.rotation.x = 0;
      if (mx !== 0 || mz !== 0) {
        const mag = Math.sqrt(mx * mx + mz * mz);
        s.playerX += (mx / mag) * speed * dt;
        s.playerZ += (mz / mag) * speed * dt;
      }
    }

    // Clamp to field
    s.playerX = Math.max(-FIELD_WIDTH / 2 + 0.5, Math.min(FIELD_WIDTH / 2 - 0.5, s.playerX));

    // Auto-scroll
    s.scrollZ -= s.scrollSpeed * dt;
    s.playerZ = Math.max(s.scrollZ - FIELD_DEPTH / 2 + 2, Math.min(s.scrollZ + 2, s.playerZ));

    // Aim angle
    if (aimX !== 0 || aimZ !== 0) {
      s.playerAngle = Math.atan2(aimX, -aimZ);
    } else if (mx !== 0 || mz !== 0) {
      s.playerAngle = Math.atan2(mx, -mz);
    }

    // Shooting
    s.shootCooldown -= dt;
    // Hide beam when not firing
    if (this.beamState.mesh && s.weaponType !== 'beam') {
      this.beamState.mesh.visible = false;
      this.beamState.active = false;
    }

    if (shooting) {
      if (s.weaponType === 'flamethrower') {
        this.fireFlamethrower(dt);
      } else if (s.weaponType === 'beam') {
        this.fireBeam(dt);
      } else if (s.weaponType === 'homing') {
        if (s.shootCooldown <= 0 && s.homingAmmo > 0) {
          s.shootCooldown = 0.4;
          s.homingAmmo--;
          this.fireHomingMissile();
          (this as any).audioSystem?.playShoot();
          // If out of ammo, remove from inventory and cycle
          if (s.homingAmmo <= 0) {
            this.removeWeaponFromInventory('homing');
          }
        }
      } else if (s.shootCooldown <= 0) {
        const cooldown = s.weaponType === 'rapid' ? RAPID_COOLDOWN : SHOOT_COOLDOWN;
        s.shootCooldown = cooldown;
        s.totalShots++;

        const bx = s.playerX;
        const bz = s.playerZ;

        if (s.weaponType === 'spread') {
          this.fireBullet(bx, bz, s.playerAngle, false);
          this.fireBullet(bx, bz, s.playerAngle - 0.2, false);
          this.fireBullet(bx, bz, s.playerAngle + 0.2, false);
          this.spawnMuzzleFlash(bx + Math.sin(s.playerAngle) * 0.4, 0.6, bz - Math.cos(s.playerAngle) * 0.4);
        } else {
          this.fireBullet(bx, bz, s.playerAngle, false);
          this.spawnMuzzleFlash(bx + Math.sin(s.playerAngle) * 0.4, 0.6, bz - Math.cos(s.playerAngle) * 0.4);
        }

        (this as any).audioSystem?.playShoot();
      }
    } else if (s.weaponType === 'beam' && this.beamState.mesh) {
      this.beamState.mesh.visible = false;
      this.beamState.active = false;
    }

    // Grenade throw
    if (grenadeThrow) {
      this.throwGrenade(s.playerX, s.playerZ, s.playerAngle);
    }

    // Smoke grenade throw
    if (smokeThrow) {
      this.throwSmokeGrenade(s.playerX, s.playerZ, s.playerAngle);
    }

    // Decoy hologram deploy
    if (decoyTrigger && !s.inVehicle && !s.inTurret) {
      this.spawnDecoy();
    }

    // Air support call-in
    if (airSupportTrigger && s.airSupportReady && s.airSupportCooldown <= 0) {
      this.callAirSupport();
    }

    // Turret mount/dismount
    if (turretToggle) {
      if (s.inTurret) {
        this.dismountTurret(false);
      } else if (!s.inVehicle) {
        // Check proximity to turret emplacements
        for (const t of this.turretEmplacements) {
          if (t.occupied) continue;
          const tdx = s.playerX - t.x;
          const tdz = s.playerZ - t.z;
          if (Math.sqrt(tdx * tdx + tdz * tdz) < 1.8) {
            this.mountTurret(t);
            break;
          }
        }
      }
    }

    // Turret emplacement mounted gun — very fast twin fire, can't move
    if (s.inTurret && this.activeTurret && shooting) {
      if (this.activeTurret.shootCooldown <= 0) {
        this.activeTurret.shootCooldown = 0.05; // extremely fast fire rate
        this.fireBullet(s.playerX - 0.12, s.playerZ, s.playerAngle, false, 2);
        this.fireBullet(s.playerX + 0.12, s.playerZ, s.playerAngle, false, 2);
        this.spawnMuzzleFlash(s.playerX + Math.sin(s.playerAngle) * 0.5, 0.6, s.playerZ - Math.cos(s.playerAngle) * 0.5);
        (this as any).audioSystem?.playVehicleGun();
        s.careerTurretKills++; // actually tracking shots, rename later
      }
    }

    // Vehicle mounted gun — faster fire, wider spread
    if (s.inVehicle && this.activeVehicle && shooting) {
      if (this.activeVehicle.gunCooldown <= 0) {
        this.activeVehicle.gunCooldown = 0.08; // faster than normal
        this.fireBullet(s.playerX, s.playerZ, s.playerAngle, false, 2);
        this.fireBullet(s.playerX, s.playerZ, s.playerAngle - 0.15, false);
        this.fireBullet(s.playerX, s.playerZ, s.playerAngle + 0.15, false);
        this.spawnMuzzleFlash(s.playerX + Math.sin(s.playerAngle) * 1.0, 0.55, s.playerZ - Math.cos(s.playerAngle) * 1.0);
        (this as any).audioSystem?.playVehicleGun();
      }
    }
  }

  private updatePlayer(dt: number) {
    const s = this.state;
    this.playerGroup.position.set(s.playerX, 0, s.playerZ);
    this.playerGroup.rotation.y = s.playerAngle;

    // Invincibility flash
    if (s.invincibleTimer > 0) {
      this.playerGroup.visible = Math.floor(s.invincibleTimer * 10) % 2 === 0;
    } else {
      this.playerGroup.visible = true;
    }

    // Shield visual
    const shield = this.playerGroup.getObjectByName('shield') as Mesh;
    if (shield) {
      const mat = shield.material as MeshBasicMaterial;
      if (s.shieldTimer > 0) {
        mat.opacity = 0.2 + Math.sin(s.gameTime * 5) * 0.1;
        shield.scale.setScalar(1 + Math.sin(s.gameTime * 3) * 0.05);
      } else {
        mat.opacity = 0;
      }
    }

    // Obstacle collision
    for (const obs of this.obstacles) {
      const dx = s.playerX - obs.x;
      const dz = s.playerZ - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obs.radius + 0.4) {
        // Push player out
        const push = (obs.radius + 0.4 - dist);
        if (dist > 0.01) {
          s.playerX += (dx / dist) * push;
          s.playerZ += (dz / dist) * push;
        }
      }
    }
  }

  private updateBullets(dt: number) {
    const s = this.state;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.mesh.position.x += b.vx * dt;
      b.mesh.position.z += b.vz * dt;
      b.life -= dt;

      // Out of bounds or expired
      if (b.life <= 0 || Math.abs(b.mesh.position.x) > FIELD_WIDTH ||
          Math.abs(b.mesh.position.z - s.scrollZ) > FIELD_DEPTH) {
        this.world.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.isEnemy) {
        // Hit player
        const dx = b.mesh.position.x - s.playerX;
        const dz = b.mesh.position.z - s.playerZ;
        if (Math.sqrt(dx * dx + dz * dz) < (s.inVehicle ? 1.0 : s.inTurret ? 1.2 : 0.5)) {
          if (s.inVehicle) {
            s.vehicleHp--;
            if (s.vehicleHp <= 0) this.dismountVehicle(true);
          } else if (s.inTurret && this.activeTurret) {
            this.activeTurret.hp--;
            s.turretHp = this.activeTurret.hp;
            if (this.activeTurret.hp <= 0) this.dismountTurret(true);
          } else {
            this.damagePlayer();
          }
          this.world.scene.remove(b.mesh);
          this.bullets.splice(i, 1);
        }
      } else {
        // Hit enemies
        for (const enemy of this.enemies) {
          if (enemy.dead) continue;
          const dx = b.mesh.position.x - enemy.x;
          const dz = b.mesh.position.z - enemy.z;
          const hitRadius = enemy.type === 'tank' || enemy.type === 'boss' || enemy.type === 'artillery' || enemy.type === 'attack_heli' || enemy.type === 'apc' ? 0.8 : 0.5;
          if (Math.sqrt(dx * dx + dz * dz) < hitRadius) {
            this.damageEnemy(enemy, b.damage);
            this.world.scene.remove(b.mesh);
            this.bullets.splice(i, 1);
            break;
          }
        }

        // Hit destructible obstacles
        for (let j = this.obstacles.length - 1; j >= 0; j--) {
          const obs = this.obstacles[j];
          if (!obs.destructible) continue;
          const dx = b.mesh.position.x - obs.x;
          const dz = b.mesh.position.z - obs.z;
          if (Math.sqrt(dx * dx + dz * dz) < obs.radius) {
            obs.hp -= b.damage;
            if (obs.hp <= 0) {
              // Barrel explosion
              if (obs.type === 'barrel') {
                this.createExplosion(obs.x, obs.z, 2.5, 2);
              }
              this.world.scene.remove(obs.mesh);
              this.obstacles.splice(j, 1);
              // May drop power-up
              if (obs.type === 'crate' && Math.random() < 0.5) {
                this.spawnPowerUp(obs.x, obs.z);
              }
            }
            this.world.scene.remove(b.mesh);
            this.bullets.splice(i, 1);
            break;
          }
        }

        // Player bullets hit mines (shoot to detonate safely)
        if (!b.isEnemy) {
          for (const mine of this.mines) {
            if (!mine.armed) continue;
            const dx = b.mesh.position.x - mine.x;
            const dz = b.mesh.position.z - mine.z;
            if (dx * dx + dz * dz < 0.5) {
              this.detonateMine(mine);
              this.world.scene.remove(b.mesh);
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      }
    }
  }

  private updateEnemies(dt: number) {
    const s = this.state;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.dead) {
        e.deathTimer -= dt;
        // Enhanced death: spin faster, fade out
        const isBoss = e.type === 'boss' || e.type === 'artillery' || e.type === 'attack_heli';
        const deathMax = isBoss ? 1.0 : 0.5;
        const t = Math.max(0, e.deathTimer / deathMax);
        e.mesh.scale.setScalar(t);
        e.mesh.rotation.y += dt * (isBoss ? 6 : 12);
        // Fade materials
        e.mesh.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material as MeshStandardMaterial;
            if (mat.opacity !== undefined) {
              mat.transparent = true;
              mat.opacity = t;
            }
          }
        });
        if (e.deathTimer <= 0) {
          this.world.scene.remove(e.mesh);
          this.enemies.splice(i, 1);
          if (e === s.bossEntity) {
            s.bossActive = false;
            // Track boss type achievements
            this.checkBossAchievement(s.bossType);
            s.careerBossKills++;
            s.bossEntity = null;
          }
        }
        continue;
      }

      // Flash on hit
      if (e.flashTimer > 0) {
        e.flashTimer -= dt;
        e.mesh.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material as MeshStandardMaterial;
            if (mat.emissive) mat.emissiveIntensity = 2;
          }
        });
      } else {
        e.mesh.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material as MeshStandardMaterial;
            if (mat.emissive && mat.emissiveIntensity > 0.5) mat.emissiveIntensity = 0.4;
          }
        });
      }

      // Distance to player
      const dx = s.playerX - e.x;
      const dz = s.playerZ - e.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // AI movement
      e.moveTimer += dt;
      if (e.type !== 'turret') {
        if (e.type === 'runner') {
          // Rush toward player
          if (dist > 0.5) {
            e.vx = (dx / dist) * e.speed;
            e.vz = (dz / dist) * e.speed;
          }
          // Runner melee damage on contact
          if (dist < 0.6) {
            this.damagePlayer();
            e.hp = 0;
            e.dead = true;
            e.deathTimer = 0.2;
            this.state.kills++;
            this.state.totalKills++;
            this.state.score += e.points;
          }
        } else if (e.type === 'helicopter') {
          // Circle-strafe
          const circleAngle = e.moveTimer * 0.5;
          const targetX = s.playerX + Math.cos(circleAngle) * 6;
          const targetZ = s.playerZ + Math.sin(circleAngle) * 6;
          e.vx = (targetX - e.x) * 0.5;
          e.vz = (targetZ - e.z) * 0.5;
        } else if (e.type === 'boss') {
          // Boss movement pattern
          const phase = Math.floor(e.moveTimer / 3) % 3;
          if (phase === 0) {
            // Advance toward player
            if (dist > 4) {
              e.vx = (dx / dist) * e.speed;
              e.vz = (dz / dist) * e.speed;
            } else {
              e.vx *= 0.9;
              e.vz *= 0.9;
            }
          } else if (phase === 1) {
            // Strafe
            e.vx = Math.cos(e.moveTimer * 2) * e.speed * 2;
            e.vz *= 0.9;
          } else {
            // Retreat and shoot
            if (dist < 6) {
              e.vx = -(dx / dist) * e.speed * 0.5;
              e.vz = -(dz / dist) * e.speed * 0.5;
            }
          }
        } else if (e.type === 'artillery') {
          // Stationary — no movement, just rotate turret toward player
          e.vx = 0;
          e.vz = 0;
          const tBase = e.mesh.getObjectByName('turretBase');
          if (tBase) tBase.rotation.y = Math.atan2(dx, dz);
        } else if (e.type === 'attack_heli') {
          // Circular flight pattern overhead, varies altitude
          const circPhase = e.moveTimer * 0.4;
          const radius = 8 + Math.sin(e.moveTimer * 0.2) * 3;
          const targetX = s.playerX + Math.cos(circPhase) * radius;
          const targetZ = s.playerZ + Math.sin(circPhase) * radius;
          e.vx = (targetX - e.x) * 0.6;
          e.vz = (targetZ - e.z) * 0.6;
          // Altitude wobble
          e.mesh.position.y = 4 + Math.sin(e.moveTimer * 1.5) * 0.5;
        } else if (e.type === 'tank') {
          // Slow advance
          if (dist > 5) {
            e.vx = (dx / dist) * e.speed;
            e.vz = (dz / dist) * e.speed;
          } else {
            e.vx *= 0.95;
            e.vz *= 0.95;
          }
        } else {
          // Standard AI: approach then strafe
          if (dist > e.aggroRange) {
            e.vx = 0; e.vz = 0;
          } else if (dist > 5) {
            e.vx = (dx / dist) * e.speed * 0.5;
            e.vz = (dz / dist) * e.speed * 0.5;
          } else {
            // Strafe
            e.vx = Math.cos(e.moveTimer * 1.5) * e.speed;
            e.vz = Math.sin(e.moveTimer * 1.5) * e.speed * 0.3;
          }
        }
      }

      // Apply officer speed boost
      const officerMult = (e as any)._officerBoosted ? 1.5 : 1;
      e.x += e.vx * dt * officerMult;
      e.z += e.vz * dt * officerMult;
      e.x = Math.max(-FIELD_WIDTH / 2 + 0.5, Math.min(FIELD_WIDTH / 2 - 0.5, e.x));
      e.mesh.position.set(e.x, e.type === 'helicopter' ? 3 : e.type === 'attack_heli' ? e.mesh.position.y : 0, e.z);

      // Face player
      if (dist > 0.1) {
        e.mesh.rotation.y = Math.atan2(dx, dz);
      }

      // Helicopter rotor spin
      if (e.type === 'helicopter' || e.type === 'attack_heli') {
        const rotor = e.mesh.getObjectByName('rotor');
        if (rotor) rotor.rotation.y += dt * (e.type === 'attack_heli' ? 20 : 15);
        if (e.type === 'attack_heli') {
          const tailRotor = e.mesh.getObjectByName('tailRotor');
          if (tailRotor) tailRotor.rotation.z += dt * 25;
        }
      }

      // Shooting
      if (dist < e.aggroRange) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.shootInterval;
          // Decoy targeting: 65% chance to aim at decoy if active
          const decoyTarget = this.getDecoyTarget();
          let aimDx = dx, aimDz = dz;
          if (decoyTarget && Math.random() < 0.65) {
            aimDx = decoyTarget.x - e.x;
            aimDz = decoyTarget.z - e.z;
          }
          const angle = Math.atan2(aimDx, aimDz) + Math.PI;

          if (e.type === 'boss') {
            // Boss multi-shot with tracers
            for (let a = -0.3; a <= 0.3; a += 0.15) {
              this.fireTracerRound(e.x, e.z, angle + a);
            }
          } else if (e.type === 'artillery') {
            // Artillery: explosive arc shells — fire tracers in a spread + create explosion at target area
            for (let a = -0.15; a <= 0.15; a += 0.15) {
              this.fireTracerRound(e.x, e.z, angle + a);
            }
            // Delayed explosion near player area
            const exDist = Math.min(dist, 8);
            const exX = e.x + Math.sin(angle + Math.PI) * exDist + (Math.random() - 0.5) * 3;
            const exZ = e.z + Math.cos(angle + Math.PI) * exDist + (Math.random() - 0.5) * 3;
            this.createExplosion(exX, exZ, 2.5, 1);
            (this as any).audioSystem?.playExplosion();
          } else if (e.type === 'attack_heli') {
            // Attack heli: machine gun bursts + occasional bomb drop
            for (let a = -0.1; a <= 0.1; a += 0.1) {
              this.fireTracerRound(e.x, e.z, angle + a);
            }
            // Drop bomb every 3rd shot cycle
            if (Math.floor(e.moveTimer * 2) % 3 === 0) {
              this.createExplosion(s.playerX + (Math.random() - 0.5) * 4, s.playerZ + (Math.random() - 0.5) * 4, 3, 2);
              (this as any).audioSystem?.playExplosion();
            }
          } else if (e.type === 'tank') {
            this.fireTracerRound(e.x, e.z, angle);
          } else if (e.type === 'sniper') {
            this.fireTracerRound(e.x, e.z, angle);
          } else {
            // 40% chance of tracer, rest normal bullet + flash
            if (Math.random() < 0.4) {
              this.fireTracerRound(e.x, e.z, angle);
            } else {
              this.fireBullet(e.x, e.z, angle, true);
              this.spawnMuzzleFlash(e.x, 0.5, e.z);
            }
          }

          (this as any).audioSystem?.playEnemyShoot();
        }
      }

      // Contact damage (non-runner)
      if (e.type !== 'runner' && dist < 0.6) {
        if (s.inVehicle) {
          s.vehicleHp--;
          if (s.vehicleHp <= 0) this.dismountVehicle(true);
        } else {
          this.damagePlayer();
        }
      }

      // Remove if too far behind player
      if (e.z > s.playerZ + 15) {
        this.world.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateGrenades(dt: number) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.x += g.vx * dt;
      g.z += g.vz * dt;
      g.vy -= 12 * dt;
      g.y += g.vy * dt;

      // Bounce
      if (g.y <= 0.15) {
        g.y = 0.15;
        g.vy *= -0.4;
        g.vx *= 0.6;
        g.vz *= 0.6;
        g.bounced = true;
      }

      g.mesh.position.set(g.x, g.y, g.z);
      g.mesh.rotation.x += dt * 8;
      g.mesh.rotation.z += dt * 5;

      g.timer -= dt;
      if (g.timer <= 0) {
        this.world.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
        this.createExplosion(g.x, g.z, 3, 3);
      }
    }
  }

  private updateExplosions(dt: number) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.timer += dt;
      const t = ex.timer / ex.maxTime;

      // Scale up and fade out
      ex.mesh.scale.setScalar(1 + t * 2);
      ex.mesh.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material as MeshBasicMaterial;
          if (mat.opacity !== undefined) mat.opacity = Math.max(0, 1 - t);
        }
      });

      if (ex.timer >= ex.maxTime) {
        this.world.scene.remove(ex.mesh);
        this.explosions.splice(i, 1);
      }
    }
  }

  private updatePowerUps(dt: number) {
    const s = this.state;
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.bobTimer += dt * 3;
      p.mesh.position.y = 0.5 + Math.sin(p.bobTimer) * 0.15;
      p.mesh.rotation.y += dt * 2;

      // Player pickup
      const dx = s.playerX - p.x;
      const dz = s.playerZ - p.z;
      if (Math.sqrt(dx * dx + dz * dz) < 0.8) {
        this.applyPowerUp(p.type);
        this.world.scene.remove(p.mesh);
        this.powerUps.splice(i, 1);
        continue;
      }

      // Remove if too far
      if (p.z > s.playerZ + 15) {
        this.world.scene.remove(p.mesh);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 8 * dt;
      p.life -= dt;

      const t = p.life / p.maxLife;
      p.mesh.scale.setScalar(t);
      const mat = p.mesh.material as MeshBasicMaterial;
      mat.opacity = t;

      if (p.life <= 0) {
        this.world.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  private updateWaveLogic(dt: number) {
    const s = this.state;
    s.waveTimer += dt;
    s.enemySpawnTimer += dt;

    // Spawn enemies periodically
    const spawnRate = Math.max(0.5, 2 - s.wave * 0.1);
    if (s.enemySpawnTimer >= spawnRate && s.waveEnemiesLeft > 0) {
      s.enemySpawnTimer = 0;
      // Chance for formation spawn (wave 3+, 25% chance)
      if (s.wave >= 3 && s.waveEnemiesLeft >= 5 && Math.random() < 0.25) {
        this.spawnFormation();
      } else {
        this.spawnWaveEnemy();
      }
    }

    // Wave complete check
    if (s.waveEnemiesLeft <= 0 && this.enemies.filter(e => !e.dead).length === 0) {
      // Complete noDamage bonus objective at wave end
      this.completeBonusNoDamage();
      s.wave++;
      s.scrollSpeed = Math.min(5, 3 + s.wave * 0.15);

      // Biome transition every 5 waves
      if (s.wave % 5 === 1 && s.wave > 1) {
        s.currentBiome = (s.currentBiome + 1) % BIOME_THEMES.length;
        this.applyBiomeTransition(s.currentBiome);
      }

      // Assign bonus objective for new wave
      this.assignBonusObjective();

      this.startWave();
    }
  }

  // ── Supply Crate Updates ──
  private updateSupplyCrates(dt: number) {
    const s = this.state;
    // Supply drop timer
    s.supplyDropTimer -= dt;
    if (s.supplyDropTimer <= 0) {
      s.supplyDropTimer = 25 + Math.random() * 15; // every 25-40 sec
      this.spawnSupplyCrate();
    }

    for (let i = this.supplyCrates.length - 1; i >= 0; i--) {
      const crate = this.supplyCrates[i];
      if (!crate.landed) {
        crate.y += crate.vy * dt;
        if (crate.y <= 0.4) {
          crate.y = 0.4;
          crate.landed = true;
          // Remove parachute
          const chute = crate.mesh.getObjectByName('chute');
          if (chute) crate.mesh.remove(chute);
        }
        crate.mesh.position.y = crate.y;
      } else {
        crate.life -= dt;
        crate.bobTimer += dt;
        crate.mesh.position.y = 0.4 + Math.sin(crate.bobTimer * 3) * 0.1;
        // Pulse glow
        crate.mesh.rotation.y += dt;

        // Player pickup
        const dx = s.playerX - crate.x;
        const dz = s.playerZ - crate.z;
        if (Math.sqrt(dx * dx + dz * dz) < 1.2) {
          // Give rare weapon
          const rareWeapons = ['flamethrower', 'beam', 'spread', 'homing'];
          const weapon = rareWeapons[Math.floor(Math.random() * rareWeapons.length)];
          this.applyPowerUp(weapon);
          // Bonus grenades
          s.grenadeCount = Math.min(s.grenadeCount + 2, s.maxGrenades);
          // Refill smoke grenades
          s.smokeGrenadeCount = Math.min(s.smokeGrenadeCount + 1, 4);
          this.world.scene.remove(crate.mesh);
          this.supplyCrates.splice(i, 1);
          continue;
        }
        if (crate.life <= 0) {
          this.world.scene.remove(crate.mesh);
          this.supplyCrates.splice(i, 1);
        }
      }
    }
  }

  // ── Flame Particle Updates ──
  private updateFlameParticles(dt: number) {
    for (let i = this.flameParticles.length - 1; i >= 0; i--) {
      const fp = this.flameParticles[i];
      fp.life -= dt;
      fp.x += fp.vx * dt;
      fp.z += fp.vz * dt;
      fp.mesh.position.set(fp.x, 0.5, fp.z);
      const progress = 1 - fp.life / fp.maxLife;
      fp.mesh.scale.setScalar(1 + progress * 2);
      const mat = fp.mesh.material as MeshBasicMaterial;
      mat.opacity = (1 - progress) * 0.7;
      if (fp.life <= 0) {
        this.world.scene.remove(fp.mesh);
        this.flameParticles.splice(i, 1);
      }
    }
  }

  private updateTerrainFeatures(_dt: number) {
    const s = this.state;
    // Spawn features ahead of player periodically
    const lastFeatureZ = this.terrainFeatures.length > 0
      ? Math.min(...this.terrainFeatures.map(f => f.z))
      : s.playerZ;
    if (lastFeatureZ > s.playerZ - 60 && Math.random() < 0.01) {
      this.spawnTerrainFeature(s.playerZ - 50 - Math.random() * 20);
    }
    // Remove features behind player
    for (let i = this.terrainFeatures.length - 1; i >= 0; i--) {
      if (this.terrainFeatures[i].z > s.playerZ + 25) {
        this.terrainGroup.remove(this.terrainFeatures[i].mesh);
        this.terrainFeatures.splice(i, 1);
      }
    }
  }

  private updateCamera(dt: number) {
    const s = this.state;
    const targetX = s.playerX * 0.3;
    const targetZ = s.playerZ + 6;
    const cam = this.world.camera;

    cam.position.x += (targetX + this.cameraOffset.x + s.screenShakeX - cam.position.x) * 3 * dt;
    cam.position.y += (this.cameraOffset.y - cam.position.y) * 3 * dt;
    cam.position.z += (targetZ + this.cameraOffset.z + s.screenShakeZ - cam.position.z) * 3 * dt;
    cam.lookAt(s.playerX, 0, s.playerZ - 2);
  }

  private updateTimers(dt: number) {
    const s = this.state;
    if (s.invincibleTimer > 0) s.invincibleTimer -= dt;
    if (s.weaponTimer > 0) {
      s.weaponTimer -= dt;
      if (s.weaponTimer <= 0) s.weaponType = 'single';
    }
    if (s.shieldTimer > 0) s.shieldTimer -= dt;
    if (s.speedBoostTimer > 0) s.speedBoostTimer -= dt;
    if (s.missionBriefTimer > 0) s.missionBriefTimer -= dt;
    if (s.comboTimer > 0) {
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) {
        s.combo = 0;
      }
    }
    if (s.waveNameTimer > 0) s.waveNameTimer -= dt;
  }

  private updateScreenShake(dt: number) {
    const s = this.state;
    if (s.screenShake > 0) {
      const mult = [0, 0.5, 1][s.shakeIntensity] ?? 1;
      s.screenShakeX = (Math.random() - 0.5) * s.screenShake * 2 * mult;
      s.screenShakeZ = (Math.random() - 0.5) * s.screenShake * 2 * mult;
      s.screenShake -= dt * 2;
    } else {
      s.screenShakeX = 0;
      s.screenShakeZ = 0;
    }
  }

  private updateMenuInput() {
    const kb = this.world.input.keyboard;
    const rightGP = this.world.input.xr.gamepads.right;

    if (this.state.phase === 'paused') {
      if (kb.getKeyDown('Escape') || kb.getKeyDown('KeyP') ||
          rightGP?.getButtonDown(InputComponent.B_Button)) {
        this.state.phase = 'playing';
      }
    }

    if (this.state.phase === 'gameover') {
      if (kb.getKeyDown('Space') || kb.getKeyDown('Enter') ||
          rightGP?.getButtonDown(InputComponent.Trigger)) {
        this.state.phase = 'results';
      }
    }
  }

  // ── Ground scrolling ──
  private updateGroundScroll() {
    // Reuse ground tiles that go behind the camera
    for (const tile of this.groundTiles) {
      if (tile.position.z > this.state.playerZ + 20) {
        tile.position.z -= this.groundTiles.length * 8;
      }
    }
  }

  // ── Achievement System ──
  private static readonly ACHIEVEMENT_DEFS: Array<{ id: string; label: string }> = [
    { id: 'kill_50', label: '🏆 First Blood — 50 kills' },
    { id: 'kill_100', label: '🏆 Veteran — 100 kills' },
    { id: 'kill_500', label: '🏆 Warmonger — 500 kills' },
    { id: 'kill_1000', label: '🏆 Legend — 1000 kills' },
    { id: 'wave_10', label: '🏆 Survivor — Reach wave 10' },
    { id: 'wave_25', label: '🏆 Hardened — Reach wave 25' },
    { id: 'wave_50', label: '🏆 Unstoppable — Reach wave 50' },
    { id: 'weapon_spread', label: '🏆 Spread Eagle — Get spread shot' },
    { id: 'weapon_rapid', label: '🏆 Rapid Fire — Get rapid fire' },
    { id: 'weapon_flamethrower', label: '🏆 Pyromaniac — Get flamethrower' },
    { id: 'weapon_beam', label: '🏆 Beam Master — Get beam weapon' },
    { id: 'weapon_laser', label: '🏆 Laser Precision — Get laser' },
    { id: 'streak_5', label: '🏆 Hot Streak — 5 kill streak' },
    { id: 'streak_10', label: '🏆 Rampage — 10 kill streak' },
    { id: 'streak_15', label: '🏆 Massacre — 15 kill streak' },
    { id: 'streak_25', label: '🏆 Godlike — 25 kill streak' },
    { id: 'vehicle_10', label: '🏆 Road Warrior — 10 vehicle kills' },
    { id: 'vehicle_25', label: '🏆 Tank Commander — 25 vehicle kills' },
    { id: 'mission_3', label: '🏆 Operative — Complete 3 missions' },
    { id: 'mission_10', label: '🏆 Elite Agent — Complete 10 missions' },
    { id: 'boss_mech', label: '🏆 Mech Slayer — Defeat mech boss' },
    { id: 'boss_artillery', label: '🏆 Artillery Wrecker — Defeat artillery' },
    { id: 'boss_heli', label: '🏆 Chopper Down — Defeat helicopter boss' },
    { id: 'score_10k', label: '🏆 Score Chaser — Score 10,000' },
    { id: 'score_50k', label: '🏆 High Roller — Score 50,000' },
  ];

  private loadAchievements() {
    try {
      const data = localStorage.getItem('neon-commando-achievements');
      if (data) {
        const obj = JSON.parse(data) as Record<string, boolean>;
        for (const [k, v] of Object.entries(obj)) {
          if (v) this.achievements.set(k, true);
        }
      }
    } catch {}
  }

  private saveAchievements() {
    try {
      const obj: Record<string, boolean> = {};
      for (const [k, v] of this.achievements) obj[k] = v;
      localStorage.setItem('neon-commando-achievements', JSON.stringify(obj));
    } catch {}
  }

  private unlockAchievement(id: string) {
    if (this.achievements.has(id)) return;
    this.achievements.set(id, true);
    this.achievementQueue.push(id);
    this.state.runAchievementsEarned++;
    this.saveAchievements();
    (this as any).audioSystem?.playAchievementUnlock();
  }

  private checkKillAchievements() {
    const k = this.state.totalKills;
    if (k >= 50) this.unlockAchievement('kill_50');
    if (k >= 100) this.unlockAchievement('kill_100');
    if (k >= 500) this.unlockAchievement('kill_500');
    if (k >= 1000) this.unlockAchievement('kill_1000');
    // Streak
    const st = this.state.killStreak;
    if (st >= 5) this.unlockAchievement('streak_5');
    if (st >= 10) this.unlockAchievement('streak_10');
    if (st >= 15) this.unlockAchievement('streak_15');
    if (st >= 25) this.unlockAchievement('streak_25');
    // Vehicle
    const vk = this.state.vehicleKills;
    if (vk >= 10) this.unlockAchievement('vehicle_10');
    if (vk >= 25) this.unlockAchievement('vehicle_25');
  }

  private checkWaveAchievements() {
    const w = this.state.wave;
    if (w >= 10) this.unlockAchievement('wave_10');
    if (w >= 25) this.unlockAchievement('wave_25');
    if (w >= 50) this.unlockAchievement('wave_50');
  }

  private checkWeaponAchievements(type: string) {
    const map: Record<string, string> = { spread: 'weapon_spread', rapid: 'weapon_rapid', flamethrower: 'weapon_flamethrower', beam: 'weapon_beam', laser: 'weapon_laser' };
    if (map[type]) this.unlockAchievement(map[type]);
  }

  private checkMissionAchievements() {
    const m = this.state.missionsCompleted;
    if (m >= 3) this.unlockAchievement('mission_3');
    if (m >= 10) this.unlockAchievement('mission_10');
  }

  private checkBossAchievement(bossType: string) {
    if (bossType === 'boss') this.unlockAchievement('boss_mech');
    if (bossType === 'artillery') this.unlockAchievement('boss_artillery');
    if (bossType === 'attack_heli') this.unlockAchievement('boss_heli');
  }

  private checkScoreAchievements() {
    const sc = this.state.score;
    if (sc >= 10000) this.unlockAchievement('score_10k');
    if (sc >= 50000) this.unlockAchievement('score_50k');
  }

  // ── Weapon Inventory & Cycling ──
  private addWeaponToInventory(type: string, ammo: number) {
    const inv = this.state.weaponInventory;
    const existing = inv.find(w => w.type === type);
    if (existing) {
      existing.ammo = ammo;
    } else {
      inv.push({ type, ammo });
      this.state.currentWeaponIdx = inv.length - 1;
    }
  }

  private removeWeaponFromInventory(type: string) {
    const inv = this.state.weaponInventory;
    const idx = inv.findIndex(w => w.type === type);
    if (idx >= 0) {
      inv.splice(idx, 1);
      if (this.state.currentWeaponIdx >= inv.length) {
        this.state.currentWeaponIdx = 0;
      }
      this.state.weaponType = (inv[this.state.currentWeaponIdx]?.type || 'single') as GameState['weaponType'];
    }
  }

  private cycleWeapon() {
    const inv = this.state.weaponInventory;
    if (inv.length <= 1) return;
    this.state.currentWeaponIdx = (this.state.currentWeaponIdx + 1) % inv.length;
    const w = inv[this.state.currentWeaponIdx];
    this.state.weaponType = w.type as GameState['weaponType'];
    (this as any).audioSystem?.playMenuSelect();
  }

  // ── Homing Missile ──
  private fireHomingMissile() {
    const s = this.state;
    // Find nearest alive enemy
    let nearest: Enemy | null = null;
    let nearDist = Infinity;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - s.playerX;
      const dz = e.z - s.playerZ;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < nearDist) { nearDist = d; nearest = e; }
    }
    const group = new Group();
    // Missile body
    const bodyGeo = new ConeGeometry(0.1, 0.4, 6);
    const bodyMat = new MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.9 });
    const body = new Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    // Exhaust glow
    const exGeo = new SphereGeometry(0.08, 4, 4);
    const exMat = new MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.7 });
    const ex = new Mesh(exGeo, exMat);
    ex.position.z = 0.25;
    group.add(ex);

    const angle = s.playerAngle;
    const spd = 10;
    group.position.set(s.playerX, 0.6, s.playerZ);
    this.world.scene.add(group);
    this.homingMissiles.push({
      mesh: group,
      x: s.playerX,
      z: s.playerZ,
      vx: Math.sin(angle) * spd,
      vz: -Math.cos(angle) * spd,
      life: 3,
      targetId: nearest ? nearest.id : -1,
    });
    this.spawnMuzzleFlash(s.playerX + Math.sin(angle) * 0.4, 0.6, s.playerZ - Math.cos(angle) * 0.4);
  }

  private updateHomingMissiles(dt: number) {
    for (let i = this.homingMissiles.length - 1; i >= 0; i--) {
      const m = this.homingMissiles[i];
      m.life -= dt;
      if (m.life <= 0) {
        this.world.scene.remove(m.mesh);
        this.homingMissiles.splice(i, 1);
        continue;
      }
      // Homing: steer toward target
      const target = this.enemies.find(e => e.id === m.targetId && !e.dead);
      if (target) {
        const dx = target.x - m.x;
        const dz = target.z - m.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.1) {
          const desiredVx = (dx / dist) * 12;
          const desiredVz = (dz / dist) * 12;
          m.vx += (desiredVx - m.vx) * dt * 5;
          m.vz += (desiredVz - m.vz) * dt * 5;
        }
      }
      m.x += m.vx * dt;
      m.z += m.vz * dt;
      m.mesh.position.set(m.x, 0.6, m.z);
      m.mesh.rotation.y = Math.atan2(m.vx, -m.vz);

      // Hit detection
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const dx = m.x - enemy.x;
        const dz = m.z - enemy.z;
        if (Math.sqrt(dx * dx + dz * dz) < 0.8) {
          this.damageEnemy(enemy, 3);
          this.createExplosion(m.x, m.z, 1.5, 1.5);
          (this as any).audioSystem?.playExplosion();
          this.world.scene.remove(m.mesh);
          this.homingMissiles.splice(i, 1);
          break;
        }
      }
    }
  }

  // ── Fuel Drums (Environmental Hazard) ──
  private spawnFuelDrum(x: number, z: number) {
    const group = new Group();
    const drumGeo = new CylinderGeometry(0.5, 0.5, 1.0, 8);
    const drumMat = new MeshStandardMaterial({ color: 0xcc4400, emissive: new Color(0xff4400), emissiveIntensity: 0.3 });
    const drum = new Mesh(drumGeo, drumMat);
    drum.position.y = 0.5;
    group.add(drum);
    // Hazard stripe
    const stripeGeo = new CylinderGeometry(0.52, 0.52, 0.15, 8);
    const stripeMat = new MeshBasicMaterial({ color: 0xffcc00 });
    const stripe = new Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.6;
    group.add(stripe);
    group.position.set(x, 0, z);
    this.world.scene.add(group);
    this.fuelDrums.push({ mesh: group, x, z, hp: 2 });
  }

  private detonateFuelDrum(drum: FuelDrum) {
    // Bigger explosion than barrels, chain reaction
    this.createExplosion(drum.x, drum.z, 4, 4);
    this.state.screenShake = 0.8;
    (this as any).audioSystem?.playExplosion();
    // Damage enemies in blast radius
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - drum.x;
      const dz = enemy.z - drum.z;
      if (Math.sqrt(dx * dx + dz * dz) < 4) {
        this.damageEnemy(enemy, 5);
      }
    }
    // Damage player if close
    const pdx = this.state.playerX - drum.x;
    const pdz = this.state.playerZ - drum.z;
    if (Math.sqrt(pdx * pdx + pdz * pdz) < 3) {
      this.damagePlayer();
    }
    // Chain reaction: detonate nearby fuel drums
    for (const other of this.fuelDrums) {
      if (other === drum || other.hp <= 0) continue;
      const dx = other.x - drum.x;
      const dz = other.z - drum.z;
      if (Math.sqrt(dx * dx + dz * dz) < 5) {
        other.hp = 0;
        // Defer chain detonation slightly
        setTimeout(() => this.detonateFuelDrum(other), 150);
      }
    }
    drum.hp = 0;
    this.world.scene.remove(drum.mesh);
  }

  private updateFuelDrums(dt: number) {
    const s = this.state;
    for (let i = this.fuelDrums.length - 1; i >= 0; i--) {
      const drum = this.fuelDrums[i];
      if (drum.hp <= 0) {
        this.fuelDrums.splice(i, 1);
        continue;
      }
      // Remove if too far behind
      if (drum.z > s.playerZ + 30) {
        this.world.scene.remove(drum.mesh);
        this.fuelDrums.splice(i, 1);
        continue;
      }
      // Check bullet hits
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (b.isEnemy) continue;
        const dx = b.mesh.position.x - drum.x;
        const dz = b.mesh.position.z - drum.z;
        if (Math.sqrt(dx * dx + dz * dz) < 0.6) {
          drum.hp -= b.damage;
          this.world.scene.remove(b.mesh);
          this.bullets.splice(j, 1);
          if (drum.hp <= 0) {
            this.detonateFuelDrum(drum);
          }
          break;
        }
      }
    }
  }

  // ── Electric Fences (Environmental Hazard) ──
  private spawnElectricFence(x: number, z: number) {
    const group = new Group();
    const postGeo = new CylinderGeometry(0.08, 0.08, 1.2, 6);
    const postMat = new MeshStandardMaterial({ color: 0x666666 });
    const fenceLen = 3;
    // Two posts
    const post1 = new Mesh(postGeo, postMat);
    post1.position.set(-fenceLen / 2, 0.6, 0);
    group.add(post1);
    const post2 = new Mesh(postGeo, postMat);
    post2.position.set(fenceLen / 2, 0.6, 0);
    group.add(post2);
    // Wire
    const wireGeo = new BoxGeometry(fenceLen, 0.03, 0.03);
    const wireMat = new MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.8 });
    for (let row = 0; row < 3; row++) {
      const wire = new Mesh(wireGeo, wireMat.clone());
      wire.position.y = 0.3 + row * 0.3;
      wire.name = `wire${row}`;
      group.add(wire);
    }
    // Spark meshes for when electrified
    const sparkMeshes: Mesh[] = [];
    for (let s = 0; s < 4; s++) {
      const sparkGeo = new SphereGeometry(0.06, 4, 4);
      const sparkMat = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
      const spark = new Mesh(sparkGeo, sparkMat);
      spark.position.set((Math.random() - 0.5) * fenceLen, 0.3 + Math.random() * 0.6, 0);
      group.add(spark);
      sparkMeshes.push(spark);
    }
    group.position.set(x, 0, z);
    this.world.scene.add(group);
    this.electricFences.push({
      mesh: group, x, z, length: fenceLen, angle: 0,
      electrifiedTimer: Math.random() * 3,
      onDuration: 2, offDuration: 1.5,
      isOn: true, sparkMeshes,
    });
  }

  private updateElectricFences(dt: number) {
    const s = this.state;
    for (let i = this.electricFences.length - 1; i >= 0; i--) {
      const fence = this.electricFences[i];
      // Remove if too far behind
      if (fence.z > s.playerZ + 30) {
        this.world.scene.remove(fence.mesh);
        this.electricFences.splice(i, 1);
        continue;
      }
      // Toggle cycle
      fence.electrifiedTimer -= dt;
      if (fence.electrifiedTimer <= 0) {
        fence.isOn = !fence.isOn;
        fence.electrifiedTimer = fence.isOn ? fence.onDuration : fence.offDuration;
      }
      // Visual sparks
      for (const spark of fence.sparkMeshes) {
        const mat = spark.material as MeshBasicMaterial;
        if (fence.isOn) {
          mat.opacity = 0.5 + Math.random() * 0.5;
          spark.position.x = (Math.random() - 0.5) * fence.length;
          spark.position.y = 0.3 + Math.random() * 0.6;
        } else {
          mat.opacity = 0;
        }
      }
      // Wire glow
      fence.mesh.traverse((child) => {
        if (child instanceof Mesh && child.name.startsWith('wire')) {
          const mat = child.material as MeshBasicMaterial;
          mat.color.set(fence.isOn ? 0x00ffff : 0x333333);
          mat.opacity = fence.isOn ? 0.6 + Math.random() * 0.3 : 0.3;
        }
      });
      if (!fence.isOn) continue;
      // Damage check: player and enemies touching the fence area
      const halfLen = fence.length / 2;
      // Player
      const pdx = Math.abs(s.playerX - fence.x);
      const pdz = Math.abs(s.playerZ - fence.z);
      if (pdx < halfLen + 0.3 && pdz < 0.5) {
        this.damagePlayer();
      }
      // Enemies
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const edx = Math.abs(enemy.x - fence.x);
        const edz = Math.abs(enemy.z - fence.z);
        if (edx < halfLen + 0.3 && edz < 0.5) {
          this.damageEnemy(enemy, dt * 10);
        }
      }
    }
  }

  // ── Mortar Zones (Environmental Hazard) ──
  private spawnMortarZone(x: number, z: number) {
    const group = new Group();
    const radius = 2;
    // Warning circle (red ring)
    const ringGeo = new RingGeometry(radius - 0.1, radius, 16);
    const ringMat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3, side: DoubleSide });
    const ring = new Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.name = 'warningRing';
    group.add(ring);
    // Fill circle
    const fillGeo = new CylinderGeometry(radius, radius, 0.01, 16);
    const fillMat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.05, side: DoubleSide });
    const fill = new Mesh(fillGeo, fillMat);
    fill.position.y = 0.01;
    fill.name = 'warningFill';
    group.add(fill);
    group.position.set(x, 0, z);
    this.world.scene.add(group);
    this.mortarZones.push({
      mesh: group, x, z, radius,
      timer: 4 + Math.random() * 3,
      warningTime: 1,
      impactPending: false,
    });
  }

  private updateMortarZones(dt: number) {
    const s = this.state;
    for (let i = this.mortarZones.length - 1; i >= 0; i--) {
      const mz = this.mortarZones[i];
      // Remove if too far behind
      if (mz.z > s.playerZ + 30) {
        this.world.scene.remove(mz.mesh);
        this.mortarZones.splice(i, 1);
        continue;
      }
      mz.timer -= dt;
      // Warning phase: flash the circle
      if (mz.timer <= mz.warningTime && mz.timer > 0) {
        mz.impactPending = true;
        const ringEl = mz.mesh.getObjectByName('warningRing') as Mesh;
        const fillEl = mz.mesh.getObjectByName('warningFill') as Mesh;
        if (ringEl) {
          const mat = ringEl.material as MeshBasicMaterial;
          mat.opacity = 0.4 + Math.sin(s.gameTime * 15) * 0.3;
        }
        if (fillEl) {
          const mat = fillEl.material as MeshBasicMaterial;
          mat.opacity = 0.1 + Math.sin(s.gameTime * 15) * 0.08;
        }
      }
      // Impact
      if (mz.timer <= 0 && mz.impactPending) {
        mz.impactPending = false;
        this.createExplosion(mz.x, mz.z, mz.radius * 1.5, 2);
        (this as any).audioSystem?.playExplosion();
        s.screenShake = 0.5;
        // Damage player if in radius
        const pdx = s.playerX - mz.x;
        const pdz = s.playerZ - mz.z;
        if (Math.sqrt(pdx * pdx + pdz * pdz) < mz.radius) {
          this.damagePlayer();
        }
        // Damage enemies in radius
        for (const enemy of this.enemies) {
          if (enemy.dead) continue;
          const edx = enemy.x - mz.x;
          const edz = enemy.z - mz.z;
          if (Math.sqrt(edx * edx + edz * edz) < mz.radius) {
            this.damageEnemy(enemy, 4);
          }
        }
        // Reset timer for next mortar strike
        mz.timer = 5 + Math.random() * 4;
        const ringEl = mz.mesh.getObjectByName('warningRing') as Mesh;
        const fillEl = mz.mesh.getObjectByName('warningFill') as Mesh;
        if (ringEl) (ringEl.material as MeshBasicMaterial).opacity = 0.3;
        if (fillEl) (fillEl.material as MeshBasicMaterial).opacity = 0.05;
      }
    }
  }

  // ── Music Intensity Tracking ──
  private updateMusicIntensity() {
    const wave = this.state.wave;
    let intensity = 0;
    if (wave >= 20) intensity = 3; // frantic
    else if (wave >= 10) intensity = 2; // intense
    else if (wave >= 1) intensity = 1; // normal
    if (this.state.bossActive) intensity = Math.max(intensity, 3);
    if (intensity !== this.state.musicIntensity) {
      this.state.musicIntensity = intensity;
      (this as any).audioSystem?.setMusicIntensity(intensity);
    }
  }

  // ── Leaderboard ──
  private leaderboard: Array<{ score: number; wave: number; date: string }> = [];

  private loadLeaderboard() {
    try {
      const data = localStorage.getItem('neon-commando-leaderboard');
      if (data) this.leaderboard = JSON.parse(data);
    } catch {}
  }

  private addToLeaderboard(score: number, wave: number) {
    if (score <= 0) return;
    const entry = { score, wave, date: new Date().toLocaleDateString() };
    this.leaderboard.push(entry);
    this.leaderboard.sort((a, b) => b.score - a.score);
    if (this.leaderboard.length > 10) this.leaderboard.length = 10;
    try {
      localStorage.setItem('neon-commando-leaderboard', JSON.stringify(this.leaderboard));
    } catch {}
  }

  getLeaderboard() { return this.leaderboard; }

  // ── Performance Rating ──
  getPerformanceRating(): string {
    const s = this.state;
    let pts = 0;
    pts += Math.min(s.score / 1000, 50);
    pts += Math.min(s.wave * 2, 30);
    pts += Math.min(s.kills * 0.1, 15);
    pts += Math.min(s.bestCombo, 10);
    pts += s.missionsCompleted * 3;
    if (pts >= 80) return 'S';
    if (pts >= 60) return 'A';
    if (pts >= 40) return 'B';
    if (pts >= 20) return 'C';
    return 'D';
  }

  // ── Environmental Debris ──
  private debrisMeshes: Group[] = [];

  private spawnWaveDebris() {
    const w = this.state.wave;
    if (w < 5) return;
    const colors = this.getColors();
    const count = Math.min(Math.floor((w - 4) / 3), 6);
    for (let i = 0; i < count; i++) {
      const group = new Group();
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const ring = new Mesh(
          new RingGeometry(0.5, 1.2, 8),
          new MeshStandardMaterial({ color: 0x222222, emissive: new Color(colors.secondary), emissiveIntensity: 0.1, side: DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);
      } else if (type === 1) {
        const hull = new Mesh(
          new BoxGeometry(0.8, 0.3, 1.2),
          new MeshStandardMaterial({ color: 0x333333, emissive: new Color(colors.secondary), emissiveIntensity: 0.05 })
        );
        hull.position.y = 0.15;
        hull.rotation.y = Math.random() * Math.PI;
        group.add(hull);
      } else {
        for (let j = 0; j < 3; j++) {
          const piece = new Mesh(
            new BoxGeometry(0.2 + Math.random() * 0.3, 0.1, 0.2 + Math.random() * 0.3),
            new MeshStandardMaterial({ color: 0x444444 })
          );
          piece.position.set((Math.random() - 0.5) * 1, 0.05, (Math.random() - 0.5) * 1);
          piece.rotation.y = Math.random() * Math.PI;
          group.add(piece);
        }
      }
      const x = (Math.random() - 0.5) * (FIELD_WIDTH - 2);
      const z = this.state.playerZ - 10 - Math.random() * 15;
      group.position.set(x, 0, z);
      this.world.scene.add(group);
      this.debrisMeshes.push(group);
    }
    this.debrisMeshes = this.debrisMeshes.filter(d => {
      if (d.position.z > this.state.playerZ + 20) {
        this.world.scene.remove(d);
        return false;
      }
      return true;
    });
  }

  // ── Weather Atmosphere System ──
  private readonly MAX_WEATHER_PARTICLES = 60;

  private updateWeatherParticles(dt: number) {
    const s = this.state;
    const biome = s.currentBiome; // 0=Military 1=Desert 2=Arctic 3=Neon

    // Spawn new weather particles
    const spawnRate = 3; // per second
    const toSpawn = Math.random() < spawnRate * dt ? 1 : 0;
    for (let i = 0; i < toSpawn && this.weatherParticles.length < this.MAX_WEATHER_PARTICLES; i++) {
      const px = s.playerX + (Math.random() - 0.5) * FIELD_WIDTH * 1.2;
      const pz = s.playerZ + (Math.random() - 0.5) * FIELD_DEPTH * 0.8 - 4;
      let geo: BufferGeometry;
      let mat: MeshBasicMaterial;
      let vx = 0, vy = 0, vz = 0, life = 2;

      if (biome === 0) {
        // Military — Rain: thin vertical streaks
        geo = new CylinderGeometry(0.01, 0.01, 0.6, 3);
        mat = new MeshBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.5 });
        vy = -12 - Math.random() * 4;
        vz = -1;
        life = 1.5;
      } else if (biome === 1) {
        // Desert — Sandstorm: horizontal drifting tan particles
        geo = new SphereGeometry(0.04, 3, 2);
        mat = new MeshBasicMaterial({ color: 0xccaa66, transparent: true, opacity: 0.6 });
        vx = -4 - Math.random() * 3;
        vy = (Math.random() - 0.5) * 2;
        vz = (Math.random() - 0.5) * 2;
        life = 2.5;
      } else if (biome === 2) {
        // Arctic — Snow: slow drifting white particles
        geo = new SphereGeometry(0.03, 4, 3);
        mat = new MeshBasicMaterial({ color: 0xeeeeff, transparent: true, opacity: 0.7 });
        vx = (Math.random() - 0.5) * 1.5;
        vy = -1.5 - Math.random();
        vz = (Math.random() - 0.5) * 0.5;
        life = 4;
      } else {
        // Neon — Electric sparks: bright erratic
        geo = new SphereGeometry(0.025, 3, 2);
        mat = new MeshBasicMaterial({ color: 0xff44ff, transparent: true, opacity: 0.9, blending: AdditiveBlending });
        vx = (Math.random() - 0.5) * 8;
        vy = (Math.random() - 0.5) * 6;
        vz = (Math.random() - 0.5) * 8;
        life = 0.4 + Math.random() * 0.3;
      }

      const mesh = new Mesh(geo, mat);
      mesh.position.set(px, 3 + Math.random() * 6, pz);
      this.world.scene.add(mesh);
      this.weatherParticles.push({ mesh, vx, vy, vz, life });
    }

    // Update existing particles
    this.weatherParticles = this.weatherParticles.filter(p => {
      p.life -= dt;
      if (p.life <= 0 || p.mesh.position.y < -0.5) {
        this.world.scene.remove(p.mesh);
        return false;
      }
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      // Fade near end of life
      const opacity = Math.min(1, p.life * 2);
      (p.mesh.material as MeshBasicMaterial).opacity = opacity * (biome === 3 ? 0.9 : 0.6);
      return true;
    });
  }

  // ── Threat Indicator Arrows ──
  private updateThreatArrows(_dt: number) {
    const s = this.state;
    const cam = this.world.camera;
    // Arrow height in world Y
    const arrowY = 1.5;
    // Camera visible range estimate: camera is top-down at y~18 looking at player
    const visibleAheadZ = s.playerZ - 14; // how far ahead of player is visible
    const visibleBehindZ = s.playerZ + 4;
    const visibleLeftX = s.playerX - FIELD_WIDTH * 0.55;
    const visibleRightX = s.playerX + FIELD_WIDTH * 0.55;

    // Find offscreen enemies worth indicating (boss, tank, helicopter, apc)
    const threatTypes = new Set(['boss', 'tank', 'helicopter', 'apc', 'superTank']);
    const offscreenThreats: Enemy[] = [];
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const isImportant = threatTypes.has(enemy.type) || enemy.hp >= 8;
      if (!isImportant) continue;
      // Check if offscreen
      if (enemy.z < visibleAheadZ || enemy.z > visibleBehindZ ||
          enemy.x < visibleLeftX || enemy.x > visibleRightX) {
        offscreenThreats.push(enemy);
      }
    }

    // Remove stale arrows
    const activeIds = new Set(offscreenThreats.map(e => e.id));
    this.threatArrows = this.threatArrows.filter(a => {
      if (!activeIds.has(a.enemyId)) {
        this.world.scene.remove(a.mesh);
        return false;
      }
      return true;
    });

    // Create or update arrows
    const existingIds = new Set(this.threatArrows.map(a => a.enemyId));
    for (const threat of offscreenThreats) {
      let arrow = this.threatArrows.find(a => a.enemyId === threat.id);
      if (!arrow) {
        // Create new arrow indicator
        const group = new Group();
        const cone = new Mesh(
          new ConeGeometry(0.25, 0.6, 4),
          new MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.85, blending: AdditiveBlending })
        );
        group.add(cone);
        // Small dot behind arrow
        const dot = new Mesh(
          new SphereGeometry(0.12, 4, 3),
          new MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 })
        );
        dot.position.y = -0.4;
        group.add(dot);
        this.world.scene.add(group);
        arrow = { mesh: group, enemyId: threat.id };
        this.threatArrows.push(arrow);
      }

      // Position arrow at edge of visible area pointing toward enemy
      const dx = threat.x - s.playerX;
      const dz = threat.z - s.playerZ;
      const angle = Math.atan2(dx, dz);
      // Clamp arrow position to visible edge
      const edgeX = Math.max(visibleLeftX + 1, Math.min(visibleRightX - 1, threat.x));
      const edgeZ = threat.z < visibleAheadZ ? visibleAheadZ + 0.5 :
                    threat.z > visibleBehindZ ? visibleBehindZ - 0.5 : threat.z;
      arrow.mesh.position.set(edgeX, arrowY, edgeZ);
      // Point cone toward the enemy direction
      arrow.mesh.rotation.set(0, 0, 0);
      arrow.mesh.rotation.z = -angle;
      arrow.mesh.rotation.x = -Math.PI / 2;
      // Pulse the arrow opacity
      const pulse = 0.6 + Math.sin(Date.now() * 0.006) * 0.3;
      ((arrow.mesh.children[0] as Mesh).material as MeshBasicMaterial).opacity = pulse;
    }
  }

  // ── Weapon Pickup Flash VFX ──
  private spawnWeaponPickupFlash() {
    const s = this.state;
    const colors = this.getColors();
    // Burst of flash particles around player
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      const geo = new SphereGeometry(0.08, 4, 3);
      const mat = new MeshBasicMaterial({
        color: colors.accent,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
      });
      const mesh = new Mesh(geo, mat);
      mesh.position.set(s.playerX, 1.0, s.playerZ);
      this.world.scene.add(mesh);
      this.weaponPickupFlashMeshes.push(mesh);

      // Store velocity in userData
      (mesh as any)._flashVx = Math.cos(angle) * speed;
      (mesh as any)._flashVz = Math.sin(angle) * speed;
      (mesh as any)._flashVy = 1 + Math.random() * 2;
      (mesh as any)._flashLife = 0.6 + Math.random() * 0.3;
    }
    // Ring flash mesh
    const ring = new Mesh(
      new RingGeometry(0.1, 0.5, 16),
      new MeshBasicMaterial({ color: colors.primary, transparent: true, opacity: 0.9, side: DoubleSide, blending: AdditiveBlending })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(s.playerX, 0.5, s.playerZ);
    this.world.scene.add(ring);
    (ring as any)._flashVx = 0;
    (ring as any)._flashVz = 0;
    (ring as any)._flashVy = 0;
    (ring as any)._flashLife = 0.5;
    (ring as any)._isRing = true;
    this.weaponPickupFlashMeshes.push(ring);
  }

  private updateWeaponPickupFlash(dt: number) {
    const s = this.state;
    if (s.weaponPickupFlashTimer > 0) {
      s.weaponPickupFlashTimer -= dt;
      if (s.weaponPickupFlashTimer <= 0) {
        s.weaponPickupName = '';
      }
    }
    // Update flash particles
    this.weaponPickupFlashMeshes = this.weaponPickupFlashMeshes.filter(m => {
      const life = (m as any)._flashLife - dt;
      (m as any)._flashLife = life;
      if (life <= 0) {
        this.world.scene.remove(m);
        return false;
      }
      if ((m as any)._isRing) {
        // Expand ring
        const scale = 1 + (0.5 - life) * 8;
        m.scale.set(scale, scale, scale);
        (m.material as MeshBasicMaterial).opacity = life * 2;
      } else {
        m.position.x += (m as any)._flashVx * dt;
        m.position.y += (m as any)._flashVy * dt;
        m.position.z += (m as any)._flashVz * dt;
        (m as any)._flashVy -= 6 * dt; // gravity
        (m.material as MeshBasicMaterial).opacity = life * 1.5;
      }
      return true;
    });
  }

  getAchievements(): Map<string, boolean> { return this.achievements; }
  getAchievementDefs() { return GameSystem.ACHIEVEMENT_DEFS; }
  popAchievementQueue(): string | undefined { return this.achievementQueue.shift(); }
  getAliveEnemyCount(): number { return this.enemies.filter(e => !e.dead).length; }

  // ── Dog Tag System ──
  private spawnDogTag(x: number, z: number) {
    const group = new Group();
    // Tag shape — small metallic rectangle
    const tagGeo = new BoxGeometry(0.15, 0.22, 0.02);
    const tagMat = new MeshStandardMaterial({ color: 0xcccccc, emissive: new Color(0x88aacc), emissiveIntensity: 0.6, metalness: 0.8 });
    const tag = new Mesh(tagGeo, tagMat);
    group.add(tag);
    // Chain link
    const chainGeo = new TorusGeometry(0.05, 0.01, 4, 8);
    const chainMat = new MeshBasicMaterial({ color: 0x999999 });
    const chain = new Mesh(chainGeo, chainMat);
    chain.position.y = 0.14;
    group.add(chain);
    // Glow indicator
    const glowGeo = new SphereGeometry(0.1, 6, 4);
    const glowMat = new MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3 });
    const glow = new Mesh(glowGeo, glowMat);
    group.add(glow);
    group.position.set(x, 0.3, z);
    this.world.scene.add(group);
    this.dogTags.push({ mesh: group, x, z, bobTimer: 0 });
  }

  private updateDogTags(dt: number) {
    const s = this.state;
    for (let i = this.dogTags.length - 1; i >= 0; i--) {
      const tag = this.dogTags[i];
      tag.bobTimer += dt;
      tag.mesh.position.y = 0.3 + Math.sin(tag.bobTimer * 4) * 0.1;
      tag.mesh.rotation.y += dt * 2;
      // Cull if too far behind
      if (tag.z > s.scrollZ + FIELD_DEPTH) {
        this.world.scene.remove(tag.mesh);
        this.dogTags.splice(i, 1);
        continue;
      }
      // Collect on proximity
      const dx = s.playerX - tag.x;
      const dz = s.playerZ - tag.z;
      if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
        s.runDogTags++;
        s.careerDogTags++;
        s.score += 50;
        // Every 5 dog tags = extra life
        if (s.runDogTags % 5 === 0) {
          s.lives = Math.min(s.lives + 1, 9);
          this.triggerRadioChatter('EXTRA LIFE — dog tags collected!');
        }
        this.spawnScorePopup(tag.x, tag.z, 50, 0);
        (this as any).audioSystem?.playPowerUp();
        this.world.scene.remove(tag.mesh);
        this.dogTags.splice(i, 1);
      }
    }
  }

  // ── Radio Chatter System ──
  private static readonly RADIO_CHATTER_POOL = [
    'HQ: Enemy reinforcements approaching from the north!',
    'COMMAND: Air recon shows heavy armor ahead.',
    'HQ: Good kills, soldier. Keep pushing!',
    'INTEL: Enemy supply lines detected nearby.',
    'COMMAND: Watch your flanks — contacts on both sides.',
    'HQ: POWs reported in the area. Stay alert.',
    'COMMAND: Hostile artillery emplacement spotted.',
    'INTEL: Enemy commander sighted. High-value target.',
    'HQ: Aerial support is standing by.',
    'COMMAND: Maintain fire discipline — conserve ammo.',
    'INTEL: Motion sensors triggered. Brace for contact.',
    'HQ: Outstanding performance. Promotion recommended.',
    'COMMAND: Danger close! Watch for friendly fire.',
    'INTEL: Enemy forces are regrouping. Expect a push.',
    'HQ: Supply drop inbound. Hold your position.',
  ];

  private triggerRadioChatter(text: string) {
    this.state.radioChatter = text;
    this.state.radioChatterTimer = 3.5;
  }

  private updateRadioChatter(dt: number) {
    const s = this.state;
    if (s.radioChatterTimer > 0) {
      s.radioChatterTimer -= dt;
      if (s.radioChatterTimer <= 0) {
        s.radioChatter = '';
      }
    }
    // Random chatter every ~30 seconds during gameplay
    if (s.phase === 'playing' && Math.random() < dt / 30) {
      if (s.radioChatterTimer <= 0) {
        const pool = GameSystem.RADIO_CHATTER_POOL;
        this.triggerRadioChatter(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
  }

  // ── Air Support Call-In ──
  private callAirSupport() {
    const s = this.state;
    if (s.airSupportCooldown > 0 || !s.airSupportReady) return;
    s.airSupportCooldown = 45; // 45-second cooldown
    s.airSupportReady = false;
    s.careerAirStrikes++;
    this.triggerRadioChatter('AIR SUPPORT INBOUND! Clear the area!');
    (this as any).audioSystem?.playBossEntrance();

    // Create 3 strike zones targeting enemy clusters
    const targets: Array<{ x: number; z: number }> = [];
    const alive = this.enemies.filter(e => !e.dead);
    if (alive.length > 0) {
      // Target up to 3 enemy positions
      const shuffled = [...alive].sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        targets.push({ x: shuffled[i].x, z: shuffled[i].z });
      }
    } else {
      // No enemies — target area ahead of player
      targets.push({ x: s.playerX, z: s.playerZ - 10 });
    }

    for (const t of targets) {
      const warningMeshes: Mesh[] = [];
      // Warning circle on ground
      const ringGeo = new RingGeometry(1.5, 2.0, 16);
      const ringMat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4, side: DoubleSide });
      const ring = new Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(t.x, 0.05, t.z);
      this.world.scene.add(ring);
      warningMeshes.push(ring);
      // Inner fill
      const fillGeo = new RingGeometry(0, 1.5, 16);
      const fillMat = new MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.15, side: DoubleSide });
      const fill = new Mesh(fillGeo, fillMat);
      fill.rotation.x = -Math.PI / 2;
      fill.position.set(t.x, 0.04, t.z);
      this.world.scene.add(fill);
      warningMeshes.push(fill);

      this.airStrikes.push({ x: t.x, z: t.z, timer: 1.5, warningMeshes, impacted: false });
    }
  }

  private updateAirStrikes(dt: number) {
    const s = this.state;
    // Air support cooldown
    if (s.airSupportCooldown > 0) {
      s.airSupportCooldown -= dt;
      if (s.airSupportCooldown <= 0) {
        s.airSupportReady = true;
        this.triggerRadioChatter('Air support recharged. Ready on your command.');
      }
    }

    for (let i = this.airStrikes.length - 1; i >= 0; i--) {
      const strike = this.airStrikes[i];
      strike.timer -= dt;

      // Pulse warning meshes
      for (const m of strike.warningMeshes) {
        (m.material as MeshBasicMaterial).opacity = 0.2 + Math.sin(strike.timer * 12) * 0.2;
      }

      // Impact!
      if (strike.timer <= 0 && !strike.impacted) {
        strike.impacted = true;
        // Big explosion
        this.createExplosion(strike.x, strike.z, 4, 3);
        s.screenShake = 1.0;
        (this as any).audioSystem?.playExplosion();
        // Damage all enemies in radius
        const blastRadius = 4;
        for (const enemy of this.enemies) {
          if (enemy.dead) continue;
          const dx = enemy.x - strike.x;
          const dz = enemy.z - strike.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < blastRadius) {
            const dmg = Math.floor(8 * (1 - dist / blastRadius));
            this.damageEnemy(enemy, Math.max(dmg, 2));
          }
        }
        // Also destroy nearby mines, fuel drums
        for (const mine of this.mines) {
          const mdx = mine.x - strike.x;
          const mdz = mine.z - strike.z;
          if (Math.sqrt(mdx * mdx + mdz * mdz) < blastRadius) {
            this.createExplosion(mine.x, mine.z, 1.5, 1);
            this.world.scene.remove(mine.mesh);
          }
        }
        this.mines = this.mines.filter(m => {
          const dx2 = m.x - strike.x;
          const dz2 = m.z - strike.z;
          return Math.sqrt(dx2 * dx2 + dz2 * dz2) >= blastRadius;
        });
        // Cleanup warning meshes
        for (const m of strike.warningMeshes) {
          this.world.scene.remove(m);
        }
        // Extra particles
        for (let p = 0; p < 15; p++) {
          this.spawnParticle(strike.x + (Math.random() - 0.5) * 3, 1.5, strike.z + (Math.random() - 0.5) * 3, '#ff6600', 1.5);
        }
      }

      // Remove after impact
      if (strike.impacted) {
        this.airStrikes.splice(i, 1);
      }
    }
  }

  getState(): GameState {
    return this.state;
  }
}
