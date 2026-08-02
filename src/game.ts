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
  weaponType: 'single' | 'spread' | 'rapid' | 'laser';
  weaponTimer: number;
  shieldTimer: number;
  speedBoostTimer: number;
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

  init() {
    this.state = this.createDefaultState();
    this.loadHighScore();
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
      }
    } catch {}
  }

  private saveStats() {
    try {
      if (this.state.score > this.state.highScore) {
        this.state.highScore = this.state.score;
        localStorage.setItem('neon-commando-highscore', String(this.state.highScore));
      }
      localStorage.setItem('neon-commando-stats', JSON.stringify({
        totalKills: this.state.totalKills,
        totalGrenades: this.state.totalGrenades,
        totalShots: this.state.totalShots,
        totalPowerUps: this.state.totalPowerUps,
        totalWaves: this.state.totalWaves,
        totalDeaths: this.state.totalDeaths,
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
    }

    group.position.set(x, type === 'helicopter' ? 3 : 0, z);
    this.world.scene.add(group);

    // Difficulty scaling
    const diffMult = [1, 1.3, 1.8][this.state.difficulty];
    hp = Math.ceil(hp * diffMult);
    shootInterval /= diffMult;

    return {
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
    const types = ['spread', 'rapid', 'shield', 'speed', 'grenade', 'life', 'score'];
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
    enemy.hp -= damage;
    enemy.flashTimer = 0.1;

    if (enemy.hp <= 0) {
      enemy.dead = true;
      enemy.deathTimer = 0.3;
      this.state.kills++;
      this.state.totalKills++;

      // Combo
      this.state.combo++;
      this.state.comboTimer = COMBO_DECAY;
      if (this.state.combo > this.state.bestCombo) this.state.bestCombo = this.state.combo;

      // Score with combo multiplier
      const comboMult = Math.min(1 + this.state.combo * 0.1, 4);
      this.state.score += Math.floor(enemy.points * comboMult);

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
    if (this.state.invincibleTimer > 0 || this.state.shieldTimer > 0) {
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
    this.state.combo = 0;
    this.state.comboTimer = 0;
    this.state.screenShake = 0.4;

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
    }
  }

  // ── Wave Management ──
  private startWave() {
    this.state.waveTimer = 0;
    const wave = this.state.wave;
    const baseCount = 4 + Math.floor(wave * 1.5);
    const diffMult = [1, 1.3, 1.6][this.state.difficulty];
    this.state.waveEnemiesLeft = Math.floor(baseCount * diffMult);

    // Boss every 5 waves
    if (wave % 5 === 0) {
      this.state.bossActive = true;
      const boss = this.createEnemy('boss', 0, this.state.playerZ - 15);
      this.state.bossEntity = boss;
      this.enemies.push(boss);
      this.state.waveEnemiesLeft--;
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
    (this as any).audioSystem?.playWaveStart();
  }

  private spawnWaveEnemy() {
    if (this.enemies.length >= MAX_ENEMIES || this.state.waveEnemiesLeft <= 0) return;

    const wave = this.state.wave;
    const types: string[] = ['soldier'];
    if (wave >= 2) types.push('soldier', 'heavy');
    if (wave >= 3) types.push('sniper');
    if (wave >= 4) types.push('runner');
    if (wave >= 5) types.push('turret');
    if (wave >= 7) types.push('tank');
    if (wave >= 8) types.push('helicopter');

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

    if (mode === 2) s.lives = 99; // Zen

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
    if (kb.getKeyDown('Escape') || kb.getKeyDown('KeyP')) {
      s.phase = 'paused';
      return;
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
      if (rightGP.getButtonDown(InputComponent.B_Button)) {
        s.phase = 'paused';
        return;
      }
    }
    if (leftGP) {
      if (leftGP.getButtonDown(InputComponent.Trigger)) grenadeThrow = true;
    }

    // Movement
    const speed = s.speedBoostTimer > 0 ? s.playerSpeed * 1.5 : s.playerSpeed;
    if (mx !== 0 || mz !== 0) {
      const mag = Math.sqrt(mx * mx + mz * mz);
      s.playerX += (mx / mag) * speed * dt;
      s.playerZ += (mz / mag) * speed * dt;
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
    if (shooting && s.shootCooldown <= 0) {
      const cooldown = s.weaponType === 'rapid' ? RAPID_COOLDOWN : SHOOT_COOLDOWN;
      s.shootCooldown = cooldown;
      s.totalShots++;

      const bx = s.playerX;
      const bz = s.playerZ;

      if (s.weaponType === 'spread') {
        this.fireBullet(bx, bz, s.playerAngle, false);
        this.fireBullet(bx, bz, s.playerAngle - 0.2, false);
        this.fireBullet(bx, bz, s.playerAngle + 0.2, false);
      } else {
        this.fireBullet(bx, bz, s.playerAngle, false);
      }

      (this as any).audioSystem?.playShoot();
    }

    // Grenade throw
    if (grenadeThrow) {
      this.throwGrenade(s.playerX, s.playerZ, s.playerAngle);
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
        if (Math.sqrt(dx * dx + dz * dz) < 0.5) {
          this.damagePlayer();
          this.world.scene.remove(b.mesh);
          this.bullets.splice(i, 1);
        }
      } else {
        // Hit enemies
        for (const enemy of this.enemies) {
          if (enemy.dead) continue;
          const dx = b.mesh.position.x - enemy.x;
          const dz = b.mesh.position.z - enemy.z;
          const hitRadius = enemy.type === 'tank' || enemy.type === 'boss' ? 0.8 : 0.5;
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
      }
    }
  }

  private updateEnemies(dt: number) {
    const s = this.state;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.dead) {
        e.deathTimer -= dt;
        e.mesh.scale.setScalar(e.deathTimer / 0.3);
        e.mesh.rotation.y += dt * 10;
        if (e.deathTimer <= 0) {
          this.world.scene.remove(e.mesh);
          this.enemies.splice(i, 1);
          if (e === s.bossEntity) {
            s.bossActive = false;
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

      e.x += e.vx * dt;
      e.z += e.vz * dt;
      e.x = Math.max(-FIELD_WIDTH / 2 + 0.5, Math.min(FIELD_WIDTH / 2 - 0.5, e.x));
      e.mesh.position.set(e.x, e.type === 'helicopter' ? 3 : 0, e.z);

      // Face player
      if (dist > 0.1) {
        e.mesh.rotation.y = Math.atan2(dx, dz);
      }

      // Helicopter rotor spin
      if (e.type === 'helicopter') {
        const rotor = e.mesh.getObjectByName('rotor');
        if (rotor) rotor.rotation.y += dt * 15;
      }

      // Shooting
      if (dist < e.aggroRange) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.shootInterval;
          const angle = Math.atan2(dx, dz) + Math.PI;

          if (e.type === 'boss') {
            // Boss multi-shot
            for (let a = -0.3; a <= 0.3; a += 0.15) {
              this.fireBullet(e.x, e.z, angle + a, true, 2);
            }
          } else if (e.type === 'tank') {
            this.fireBullet(e.x, e.z, angle, true, 2);
          } else if (e.type === 'sniper') {
            this.fireBullet(e.x, e.z, angle, true, 2);
          } else {
            this.fireBullet(e.x, e.z, angle, true);
          }

          (this as any).audioSystem?.playEnemyShoot();
        }
      }

      // Contact damage (non-runner)
      if (e.type !== 'runner' && dist < 0.6) {
        this.damagePlayer();
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
      this.spawnWaveEnemy();
    }

    // Wave complete check
    if (s.waveEnemiesLeft <= 0 && this.enemies.filter(e => !e.dead).length === 0) {
      s.wave++;
      s.scrollSpeed = Math.min(5, 3 + s.wave * 0.15);
      this.startWave();
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
    if (s.comboTimer > 0) {
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) {
        s.combo = 0;
      }
    }
  }

  private updateScreenShake(dt: number) {
    const s = this.state;
    if (s.screenShake > 0) {
      s.screenShakeX = (Math.random() - 0.5) * s.screenShake * 2;
      s.screenShakeZ = (Math.random() - 0.5) * s.screenShake * 2;
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

  getState(): GameState {
    return this.state;
  }
}
