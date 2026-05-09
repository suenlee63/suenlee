const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  time: document.getElementById("time"),
  level: document.getElementById("level"),
  kills: document.getElementById("kills"),
  hpFill: document.getElementById("hpFill"),
  xpFill: document.getElementById("xpFill"),
  start: document.getElementById("start"),
  startBtn: document.getElementById("startBtn"),
  levelUp: document.getElementById("levelUp"),
  choices: document.getElementById("choices"),
  gameOver: document.getElementById("gameOver"),
  restartBtn: document.getElementById("restartBtn"),
  finalTime: document.getElementById("finalTime"),
  finalKills: document.getElementById("finalKills"),
  weaponList: document.getElementById("weaponList"),
  pauseBtn: document.getElementById("pauseBtn"),
  goalSurvive: document.getElementById("goalSurvive"),
  goalEvolve: document.getElementById("goalEvolve"),
  characterCards: document.querySelectorAll(".character-card"),
  menuCharacterName: document.getElementById("menuCharacterName"),
  menuCharacterTrait: document.getElementById("menuCharacterTrait"),
};

const TILE = 36;
const keys = new Set();
let state = null;
let lastTime = 0;
let paused = true;
let manualPaused = false;
let selectedCharacter = "hunter";

const weaponDefs = {
  cleaver: { name: "Grid Cleaver", desc: "Strikes cells around you" },
  knives: { name: "Throwing Knives", desc: "Fires blades at nearby enemies" },
  fire: { name: "Fire Bottles", desc: "Drops burning tiles while moving" },
  coil: { name: "Shock Coil", desc: "Pulses electricity around you" },
  tome: { name: "Moon Tome", desc: "Rotating books carve a safe ring" },
  lightning: { name: "Lightning Rod", desc: "Calls random strikes from above" },
  bat: { name: "Spirit Bat", desc: "Summons a bat that dives into enemies" },
  frost: { name: "Frost Orb", desc: "Bursts cold zones that slow enemies" },
  poison: { name: "Poison Vial", desc: "Throws toxic pools behind the horde" },
  beam: { name: "Sun Beam", desc: "Fires a piercing line of light" },
};

const spriteScale = 2;
const palettes = {
  player: {
    K: "#17151b",
    B: "#251c28",
    R: "#7f1d2d",
    r: "#b13446",
    S: "#d4a277",
    s: "#f0c095",
    W: "#d7d0bd",
    G: "#b99a55",
    D: "#5a1824",
  },
  spark: {
    K: "#2b2113",
    B: "#5b3a18",
    Y: "#e0a72b",
    y: "#ffd85a",
    S: "#ffe58a",
    R: "#d34832",
    W: "#fff6c4",
  },
  shell: {
    K: "#10212a",
    B: "#1d5a89",
    b: "#2c82b8",
    S: "#68b9e3",
    s: "#a5ddf2",
    G: "#7f9b47",
    g: "#c3d283",
    W: "#f4f1d0",
    C: "#b8744f",
    c: "#e2b079",
  },
  alchemist: {
    K: "#17151b",
    B: "#2d2740",
    P: "#604a8f",
    p: "#9270c7",
    S: "#d0a37a",
    s: "#efc09a",
    G: "#79b45c",
    g: "#b6df7a",
    W: "#e8e2c8",
    O: "#d27d3c",
  },
  zombie: {
    K: "#151818",
    A: "#26321f",
    B: "#465f35",
    b: "#6f874c",
    S: "#829c68",
    s: "#a6bd7c",
    P: "#46305d",
    p: "#74529b",
    V: "#a37bd1",
  },
};

const enemyTypeDefs = {
  walker: {
    name: "Walker",
    speed: 1,
    hp: 1,
    damage: 1,
    xp: 1,
    scale: 1,
    palette: {},
  },
  runner: {
    name: "Runner",
    speed: 1.45,
    hp: 0.72,
    damage: 0.8,
    xp: 1.1,
    scale: 0.9,
    palette: { B: "#6f7040", b: "#9a9956", S: "#b7c070", s: "#d2d889" },
  },
  brute: {
    name: "Brute",
    speed: 0.68,
    hp: 2.7,
    damage: 1.55,
    xp: 2.2,
    scale: 1.35,
    palette: { B: "#3d674e", b: "#5f8b68", S: "#8fb58a", s: "#b5d3aa" },
  },
  spitter: {
    name: "Spitter",
    speed: 0.82,
    hp: 1.15,
    damage: 0.7,
    xp: 1.7,
    scale: 1,
    palette: { B: "#4b5f76", b: "#657fa1", S: "#8aa7b8", s: "#b5d3d5" },
  },
};

const playerSprite = [
  "................",
  ".....BBBBBB.....",
  "....BBBBBBBB....",
  "...BBSSSSSSBB...",
  "...BSSssssSSB...",
  "..BSS.K..K.SSB..",
  "..BSS..SS..SSB..",
  "..BSS.DDDD.SSB..",
  "...BSSSSSSSSB...",
  "....RRRRRRRR....",
  "...RRrrrrrrRR...",
  "..RRrrWWWWrrRR..",
  "..DRrrRGGRrrRD..",
  "..D.RRRRRRRR.D..",
  "....RRRRRRRR....",
  ".....BBBBBB.....",
  ".....B.BB.B.....",
  "....BB.BB.BB....",
  "....B..BB..B....",
  "......B..B......",
  ".....BB..BB.....",
  ".....K....K.....",
  "................",
  "................",
];

const sparkSprite = [
  "................",
  "..B.........B...",
  "..YB.......BY...",
  ".YYB.......BYY..",
  ".YYYyyyyyyyyYY..",
  "YYYYYYYYYYYYYYY.",
  "YYy.K....K.yYY..",
  "YYy...SS...yYY..",
  ".YY.R....R.YY...",
  "..YYYYYYYYYY....",
  ".YYYYyyyyYYYY...",
  "YYYYYYYYYYYYYY..",
  "Y..YYYYYYYY..Y..",
  "...YY.YYYY.YY...",
  "..YY..YYYY..YY..",
  ".YY...Y..Y...YY.",
  "......Y..Y......",
  ".....YY..YY.....",
  "....KK....KK....",
  "................",
  "................",
];

const shellSprite = [
  "................",
  ".....BBBBBB.....",
  "...BBssssssBB...",
  "..BBsSSSSSSsBB..",
  "..Bs.K..K.sSB...",
  "..Bs..WW..sSB...",
  "...BssssssssB...",
  "....BbbbbbbB....",
  "...GGCCCCCCGG...",
  "..GGGccccccGGG..",
  ".GGGcCCCCCCcGGG.",
  ".G..cCCCCCCc..G.",
  "....cCCCCCCc....",
  ".....GGGGGG.....",
  "...BB.GG.GG.BB..",
  "...B..GG.GG..B..",
  "......B..B......",
  ".....BB..BB.....",
  ".....K....K.....",
  "................",
  "................",
];

const alchemistSprite = [
  "................",
  ".....BBBBBB.....",
  "....BBppppBB....",
  "...BBSSSSSSBB...",
  "...BSs.KK.sSB...",
  "...BS..SS..SB...",
  "....B.WWWW.B....",
  "...PPPPPPPPPP...",
  "..PPppPPPPppPP..",
  "..P.PGGGGGG.P...",
  "..P.PGggggG.P...",
  "....PPPPPPPP....",
  "...B.PPPPPP.B...",
  "..BB.PP..PP.BB..",
  "..B..PP..PP..B..",
  ".....B....B.....",
  "....BB....BB....",
  "....K......K....",
  "................",
  "................",
];

const characterDefs = {
  hunter: {
    name: "Crimson Hunter",
    trait: "Balanced melee starter",
    sprite: playerSprite,
    palette: palettes.player,
    hp: 120,
    speed: 235,
    regen: 1.2,
    damage: 6,
    might: 1,
    attackRate: 0.78,
    pickup: 92,
  },
  spark: {
    name: "Pikachu",
    trait: "Fast electric starter",
    sprite: sparkSprite,
    palette: palettes.spark,
    hp: 95,
    speed: 285,
    regen: 1.0,
    damage: 5,
    might: 1.08,
    attackRate: 0.68,
    pickup: 100,
  },
  shell: {
    name: "Squirtle",
    trait: "Tough water defender",
    sprite: shellSprite,
    palette: palettes.shell,
    hp: 155,
    speed: 200,
    regen: 1.7,
    damage: 6.5,
    might: 0.98,
    attackRate: 0.84,
    pickup: 86,
  },
  alchemist: {
    name: "Alchemist",
    trait: "Item drops and fire zones",
    sprite: alchemistSprite,
    palette: palettes.alchemist,
    hp: 105,
    speed: 230,
    regen: 1.25,
    damage: 5.8,
    might: 1.02,
    attackRate: 0.8,
    pickup: 125,
    dropBonus: 0.35,
    hazardBonus: 1.35,
  },
};

const zombieSprite = [
  "................",
  ".....AAAAAA.....",
  "....AASSSSAA....",
  "...AASssssSAA...",
  "..AAS.K..K.SAA..",
  "..AAS..SS..SAA..",
  "..AAS.BBBB.SAA..",
  "...AASSSSSSAA...",
  "....BBBBBBBB....",
  "...BBbbBBbbBB...",
  "..B.BBBBBBBB.B..",
  "..A..BBBB..A....",
  "..A..BbbB..A....",
  ".....B..B.......",
  "....BB..BB......",
  "...AA....AA.....",
  "...A......A.....",
  ".....B..B.......",
  "....BB..BB......",
  "....K....K......",
  "................",
];

const bossSprite = [
  "................",
  "....PPPPPPPP....",
  "...PPVVVVVVPP...",
  "..PPVVsVVVVVPP..",
  "..PVV.K..K.VVP..",
  "..PVV..VV..VVP..",
  "..PVV.PPPP.VVP..",
  "...PVVVVVVVVP...",
  "..PPPPPPPPPPPP..",
  ".PPppPPPPPPppPP.",
  ".P.PPPPPPPPPP.P.",
  ".V..PPppPP..V...",
  ".V..P.PP.P..V...",
  "....P.PP.P......",
  "...PP.PP.PP.....",
  "...P..PP..P.....",
  "......P..P......",
  ".....PP..PP.....",
  ".....K....K.....",
  "....KK....KK....",
  "................",
];

const passiveUpgrades = [
  { name: "Runner Boots", text: "Move speed +12%", apply: (game) => game.player.speed *= 1.12 },
  { name: "Field Medic", text: "Max HP +25 and heal 40", apply: (game) => { const p = game.player; p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 40); } },
  { name: "First Aid Kit", text: "Health regen +0.8 per second", apply: (game) => game.player.regen += 0.8 },
  { name: "Silver Charm", text: "All weapon damage +10%", apply: (game) => game.player.might *= 1.1 },
  { name: "Magnet Pack", text: "Pickup range +35%", apply: (game) => game.player.pickup *= 1.35 },
];

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function newGame() {
  const character = characterDefs[selectedCharacter];
  state = {
    running: true,
    elapsed: 0,
    spawnTimer: 0,
    bossTimer: 35,
    shake: 0,
    player: {
      x: 0,
      y: 0,
      w: 20,
      h: 26,
      hp: character.hp,
      maxHp: character.hp,
      regen: character.regen,
      speed: character.speed,
      level: 1,
      xp: 0,
      nextXp: 5,
      attackCooldown: 0,
      attackRate: character.attackRate,
      attackRadius: 1,
      damage: character.damage,
      might: character.might,
      pickup: character.pickup,
      dropBonus: character.dropBonus || 0,
      hazardBonus: character.hazardBonus || 1,
      invulnerable: 0,
      facing: 1,
      character: selectedCharacter,
    },
    camera: {
      x: 0,
      y: 0,
    },
    enemies: [],
    attacks: [],
    projectiles: [],
    enemyProjectiles: [],
    hazards: [],
    gems: [],
    particles: [],
    uiTimer: 0,
    flash: 0,
    weaponLevels: {
      cleaver: 1,
      knives: 0,
      fire: 0,
      coil: 0,
      tome: 0,
      lightning: 0,
      bat: 0,
      frost: 0,
      poison: 0,
      beam: 0,
    },
    evolved: {
      knives: false,
      fire: false,
      coil: false,
      tome: false,
      lightning: false,
      bat: false,
      frost: false,
      poison: false,
      beam: false,
    },
    evolutionReady: {
      knives: false,
      fire: false,
      coil: false,
      tome: false,
      lightning: false,
      bat: false,
      frost: false,
      poison: false,
      beam: false,
    },
    evolutionStage: {
      knives: 0,
      fire: 0,
      coil: 0,
      tome: 0,
      lightning: 0,
      bat: 0,
    },
    weaponTimers: {
      knives: 1.2,
      fire: 0.7,
      coil: 2.4,
      lightning: 2.0,
      bat: 1.0,
      frost: 1.8,
      poison: 1.5,
      beam: 2.8,
    },
    kills: 0,
  };
  paused = false;
  manualPaused = false;
  lastTime = performance.now();
  ui.start.classList.add("hidden");
  document.body.classList.remove("menu-open");
  ui.gameOver.classList.add("hidden");
  ui.levelUp.classList.add("hidden");
  updatePauseButton();
  updateUi();
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function tileOf(x, y) {
  return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) };
}

function chooseEnemyType() {
  const t = state.elapsed;
  const pool = ["walker"];
  if (t > 20) pool.push("runner", "runner");
  if (t > 45) pool.push("brute");
  if (t > 115) pool.push("spitter");
  if (t > 160) pool.push("brute", "spitter", "runner");
  if (t > 220) pool.push("spitter");
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnEnemy(boss = false) {
  const side = Math.floor(Math.random() * 4);
  const margin = 80;
  const cam = state.camera;
  const pos = [
    { x: cam.x + rand(-margin, innerWidth + margin), y: cam.y - margin },
    { x: cam.x + innerWidth + margin, y: cam.y + rand(-margin, innerHeight + margin) },
    { x: cam.x + rand(-margin, innerWidth + margin), y: cam.y + innerHeight + margin },
    { x: cam.x - margin, y: cam.y + rand(-margin, innerHeight + margin) },
  ][side];

  const minutes = state.elapsed / 60;
  const type = boss ? "boss" : chooseEnemyType();
  const typeDef = boss ? { speed: 1, hp: 1, damage: 1, xp: 1, scale: 1 } : enemyTypeDefs[type];
  const scale = boss ? 1.75 : rand(0.9, 1.15) * typeDef.scale;
  const baseHp = boss ? 72 : 13;
  state.enemies.push({
    x: pos.x,
    y: pos.y,
    w: 21 * scale,
    h: 27 * scale,
    hp: (baseHp + minutes * (boss ? 32 : 4.5)) * typeDef.hp,
    maxHp: (baseHp + minutes * (boss ? 32 : 4.5)) * typeDef.hp,
    speed: ((boss ? 54 : rand(66, 104)) + minutes * 3.5) * typeDef.speed,
    damage: (boss ? 25 : 12) * typeDef.damage,
    xp: (boss ? 28 : 1.45) * typeDef.xp,
    boss,
    type,
    shootTimer: type === "spitter" ? rand(1.0, 2.2) : 999,
    hitFlash: 0,
    step: Math.random() * 10,
  });
}

function performAreaAttack() {
  const p = state.player;
  const evolved = state.evolved.cleaver;
  const radius = (44 + p.attackRadius * 22) * (evolved ? 1.2 : 1);
  const arc = evolved ? 1.55 : 1.15;
  state.attacks.push({ x: p.x, y: p.y, radius, facing: p.facing, arc, evolved, shape: "arc", life: evolved ? 0.32 : 0.22, maxLife: evolved ? 0.32 : 0.22 });

  for (const enemy of state.enemies) {
    if (arcHitsActor(p.x, p.y, p.facing, radius, arc, enemy)) {
      enemy.hp -= p.damage * p.might;
      enemy.hitFlash = 1;
      addParticles(enemy.x, enemy.y, enemy.boss ? "#c05cff" : "#d5e879", enemy.boss ? 18 : 8);
    }
  }
}

function nearestEnemy(maxRange = 760) {
  const p = state.player;
  let target = null;
  let best = maxRange;
  for (const enemy of state.enemies) {
    const d = dist(p, enemy);
    if (d < best) {
      best = d;
      target = enemy;
    }
  }
  return target;
}

function actorRadius(actor) {
  return Math.max(actor.w * 0.42, actor.h * 0.3);
}

function circleHitsActor(x, y, radius, actor) {
  return Math.hypot(actor.x - x, actor.y - y) <= radius + actorRadius(actor);
}

function arcHitsActor(x, y, facing, radius, arc, actor) {
  const dx = actor.x - x;
  const dy = actor.y - y;
  const distanceToActor = Math.hypot(dx, dy);
  if (distanceToActor > radius + actorRadius(actor)) return false;
  if (distanceToActor < actorRadius(actor) + 10) return true;

  const forwardAngle = facing >= 0 ? 0 : Math.PI;
  let diff = Math.atan2(dy, dx) - forwardAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= arc + actorRadius(actor) / Math.max(24, distanceToActor);
}

function actorsTouch(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const combinedX = a.w * 0.34 + b.w * 0.34;
  const combinedY = a.h * 0.28 + b.h * 0.28;
  if (dx > combinedX || dy > combinedY) return false;
  return Math.hypot(dx / combinedX, dy / combinedY) < 1;
}

function lineHitsActor(x, y, angle, length, width, actor) {
  const dx = actor.x - x;
  const dy = actor.y - y;
  const along = dx * Math.cos(angle) + dy * Math.sin(angle);
  if (along < -actorRadius(actor) || along > length + actorRadius(actor)) return false;
  const side = Math.abs(-Math.sin(angle) * dx + Math.cos(angle) * dy);
  return side <= width + actorRadius(actor);
}

function fireKnife() {
  const level = state.weaponLevels.knives;
  const target = nearestEnemy(820);
  if (!target) return;

  const p = state.player;
  const evolved = state.evolved.knives;
  const count = (evolved ? 4 : 1) + Math.floor(level / 3);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.atan2(target.y - p.y, target.x - p.x) + (i - (count - 1) / 2) * (evolved ? 0.28 : 0.16);
    state.projectiles.push({
      x: p.x,
      y: p.y - 8,
      vx: Math.cos(angle) * 500,
      vy: Math.sin(angle) * 500,
      damage: (5 + level * 2) * p.might,
      life: 1.35,
      angle,
      kind: "knife",
    });
  }
}

function dropFire() {
  const p = state.player;
  const level = state.weaponLevels.fire;
  const tile = tileOf(p.x, p.y);
  state.hazards.push({
    x: tile.tx * TILE + TILE / 2,
    y: tile.ty * TILE + TILE / 2,
    r: ((state.evolved.fire ? 42 : 24) + level * 3) * p.hazardBonus,
    damage: (2.8 + level * 1.2) * p.might * p.hazardBonus,
    tick: 0,
    life: ((state.evolved.fire ? 4.2 : 2.6) + level * 0.35) * p.hazardBonus,
    maxLife: ((state.evolved.fire ? 4.2 : 2.6) + level * 0.35) * p.hazardBonus,
    kind: "fire",
  });
}

function pulseCoil() {
  const p = state.player;
  const level = state.weaponLevels.coil;
  const radius = (state.evolved.coil ? 130 : 88) + level * 16;
  const damage = (7 + level * 3) * p.might;
  state.hazards.push({
    x: p.x,
    y: p.y,
    r: radius,
    damage,
    tick: 999,
    life: 0.28,
    maxLife: 0.28,
    kind: "coil",
  });

  for (const enemy of state.enemies) {
    if (dist(enemy, p) <= radius) {
      enemy.hp -= damage;
      enemy.hitFlash = 1;
      addParticles(enemy.x, enemy.y, "#8be8ff", 8);
    }
  }
}

function callLightning() {
  const p = state.player;
  const level = state.weaponLevels.lightning;
  const evolved = state.evolved.lightning;
  const strikes = 1 + Math.floor(level / 3) + (evolved ? 3 : 0);
  for (let i = 0; i < strikes; i += 1) {
    const target = nearestEnemy(900);
    const x = target ? target.x + rand(-18, 18) : p.x + rand(-260, 260);
    const y = target ? target.y + rand(-18, 18) : p.y + rand(-180, 180);
    const radius = evolved ? 68 : 34;
    const damage = (12 + level * 4) * p.might;
    state.hazards.push({
      x,
      y,
      r: radius,
      damage,
      tick: 999,
      life: evolved ? 0.46 : 0.32,
      maxLife: evolved ? 0.46 : 0.32,
      evolved,
      kind: "lightning",
    });
    for (const enemy of state.enemies) {
      if (circleHitsActor(x, y, radius, enemy)) {
        enemy.hp -= damage;
        enemy.hitFlash = 1;
        addParticles(enemy.x, enemy.y, "#fff3a6", 8);
      }
    }
  }
}

function sendSpiritBat() {
  const p = state.player;
  const level = state.weaponLevels.bat;
  const target = nearestEnemy(780);
  if (!target) return;
  const evolved = state.evolved.bat;
  const count = 1 + Math.floor(level / 4) + (evolved ? 3 : 0);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.atan2(target.y - p.y, target.x - p.x) + (i - (count - 1) / 2) * 0.35;
    state.projectiles.push({
      x: p.x + Math.cos(state.elapsed * 4 + i) * 28,
      y: p.y - 16 + Math.sin(state.elapsed * 4 + i) * 18,
      vx: Math.cos(angle) * (evolved ? 470 : 390),
      vy: Math.sin(angle) * (evolved ? 470 : 390),
      damage: (7 + level * 2.4) * p.might,
      life: evolved ? 2.4 : 1.55,
      angle,
      kind: "bat",
      evolved,
      pierce: evolved ? 4 : 0,
    });
  }
}

function burstFrost() {
  const p = state.player;
  const level = state.weaponLevels.frost;
  const target = nearestEnemy(760);
  const x = target ? target.x : p.x + rand(-160, 160);
  const y = target ? target.y : p.y + rand(-120, 120);
  state.hazards.push({
    x,
    y,
    r: (state.evolved.frost ? 92 : 46) + level * 4,
    damage: (2.2 + level * 0.8) * p.might,
    tick: 0,
    life: state.evolved.frost ? 4.6 : 2.4,
    maxLife: state.evolved.frost ? 4.6 : 2.4,
    evolved: state.evolved.frost,
    slow: state.evolved.frost ? 0.42 : 0.62,
    kind: "frost",
  });
}

function throwPoison() {
  const p = state.player;
  const level = state.weaponLevels.poison;
  const target = nearestEnemy(680);
  const angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : Math.random() * Math.PI * 2;
  const distance = target ? Math.min(220, dist(target, p)) : 150;
  state.hazards.push({
    x: p.x + Math.cos(angle) * distance,
    y: p.y + Math.sin(angle) * distance,
    r: (state.evolved.poison ? 78 : 36) + level * 3,
    damage: (2.7 + level * 1.0) * p.might,
    tick: 0,
    life: (state.evolved.poison ? 5.0 : 3.2) + level * 0.18,
    maxLife: (state.evolved.poison ? 5.0 : 3.2) + level * 0.18,
    kind: "poison",
    evolved: state.evolved.poison,
  });
}

function fireSunBeam() {
  const p = state.player;
  const level = state.weaponLevels.beam;
  const target = nearestEnemy(900);
  if (!target) return;
  const angle = Math.atan2(target.y - p.y, target.x - p.x);
  const length = state.evolved.beam ? 760 : 430;
  const width = (state.evolved.beam ? 28 : 11) + level;
  const damage = (14 + level * 4) * p.might;
  state.hazards.push({
    x: p.x,
    y: p.y,
    angle,
    length,
    width,
    damage,
    tick: 999,
    life: 0.2,
    maxLife: 0.2,
    kind: "beam",
    evolved: state.evolved.beam,
  });

  for (const enemy of state.enemies) {
    if (lineHitsActor(p.x, p.y, angle, length, width, enemy)) {
      enemy.hp -= damage;
      enemy.hitFlash = 1;
      addParticles(enemy.x, enemy.y, "#fff0a8", 6);
    }
  }
}

function updateWeapons(dt) {
  const levels = state.weaponLevels;
  const timers = state.weaponTimers;

  if (levels.knives > 0) {
    timers.knives -= dt;
    if (timers.knives <= 0) {
      fireKnife();
      timers.knives = Math.max(0.34, 1.08 - levels.knives * 0.08);
    }
  }

  if (levels.fire > 0) {
    timers.fire -= dt;
    if (timers.fire <= 0) {
      dropFire();
      timers.fire = Math.max(0.36, 1.18 - levels.fire * 0.09);
    }
  }

  if (levels.coil > 0) {
    timers.coil -= dt;
    if (timers.coil <= 0) {
      pulseCoil();
      timers.coil = Math.max(1.0, 2.55 - levels.coil * 0.16);
    }
  }

  if (levels.tome > 0) {
    updateTome(dt);
  }

  if (levels.lightning > 0) {
    timers.lightning -= dt;
    if (timers.lightning <= 0) {
      callLightning();
      timers.lightning = Math.max(0.75, 2.15 - levels.lightning * 0.12);
    }
  }

  if (levels.bat > 0) {
    timers.bat -= dt;
    if (timers.bat <= 0) {
      sendSpiritBat();
      timers.bat = Math.max(0.42, 1.45 - levels.bat * 0.08);
    }
  }

  if (levels.frost > 0) {
    timers.frost -= dt;
    if (timers.frost <= 0) {
      burstFrost();
      timers.frost = Math.max(0.72, 1.9 - levels.frost * 0.1);
    }
  }

  if (levels.poison > 0) {
    timers.poison -= dt;
    if (timers.poison <= 0) {
      throwPoison();
      timers.poison = Math.max(0.55, 1.6 - levels.poison * 0.08);
    }
  }

  if (levels.beam > 0) {
    timers.beam -= dt;
    if (timers.beam <= 0) {
      fireSunBeam();
      timers.beam = Math.max(1.15, 2.85 - levels.beam * 0.12);
    }
  }
}

function updateTome(dt) {
  const p = state.player;
  const level = state.weaponLevels.tome;
  const count = Math.min(6, 1 + Math.floor(level / 2) + (state.evolved.tome ? 2 : 0));
  const radius = state.evolved.tome ? 88 : 62;
  const damage = (3.5 + level * 1.2) * p.might * dt * 8;

  for (const enemy of state.enemies) {
    const d = dist(enemy, p);
    if (d > radius - 18 && d < radius + 22) {
      enemy.hp -= damage;
      enemy.hitFlash = Math.max(enemy.hitFlash, 0.55);
      if (Math.random() < 0.08) addParticles(enemy.x, enemy.y, "#d7d0bd", 2);
    }
  }
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    for (const enemy of state.enemies) {
      if (projectile.life <= 0) continue;
      if (circleHitsActor(projectile.x, projectile.y, 5, enemy)) {
        enemy.hp -= projectile.damage;
        enemy.hitFlash = 1;
        if (projectile.pierce > 0) projectile.pierce -= 1;
        else projectile.life = 0;
        addParticles(enemy.x, enemy.y, "#e8edf4", 6);
      }
    }
  }
  const p = state.player;
  state.projectiles = state.projectiles.filter((projectile) => projectile.life > 0 && dist(projectile, p) < 1300);
  if (state.projectiles.length > 90) state.projectiles.splice(0, state.projectiles.length - 90);
}

function updateHazards(dt) {
  for (const hazard of state.hazards) {
    hazard.life -= dt;
    hazard.tick -= dt;
    if ((hazard.kind === "fire" || hazard.kind === "poison" || hazard.kind === "frost") && hazard.tick <= 0) {
      hazard.tick = 0.32;
      for (const enemy of state.enemies) {
        if (circleHitsActor(hazard.x, hazard.y, hazard.r, enemy)) {
          enemy.hp -= hazard.damage;
          enemy.hitFlash = 1;
          if (hazard.kind === "frost") enemy.chilled = Math.max(enemy.chilled || 0, 0.7);
          const color = hazard.kind === "fire" ? "#ff9a3c" : hazard.kind === "poison" ? "#9be15d" : "#9be8ff";
          addParticles(enemy.x, enemy.y, color, 3);
        }
      }
    }
  }
  const p = state.player;
  state.hazards = state.hazards.filter((hazard) => hazard.life > 0 && dist(hazard, p) < 1400);
  if (state.hazards.length > 70) state.hazards.splice(0, state.hazards.length - 70);
}

function fireEnemyProjectile(enemy) {
  const p = state.player;
  const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
  state.enemyProjectiles.push({
    x: enemy.x,
    y: enemy.y - 6,
    vx: Math.cos(angle) * 210,
    vy: Math.sin(angle) * 210,
    damage: 8 + state.elapsed / 60,
    life: 3.2,
    r: 5,
  });
}

function updateEnemyProjectiles(dt) {
  const p = state.player;
  for (const shot of state.enemyProjectiles) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;

    if (p.invulnerable <= 0 && Math.hypot(shot.x - p.x, shot.y - p.y) < shot.r + actorRadius(p)) {
      p.hp -= shot.damage;
      p.invulnerable = 0.45;
      shot.life = 0;
      state.shake = 0.7;
      addParticles(p.x, p.y, "#8fd37d", 10);
      if (p.hp <= 0) endGame();
    }
  }

  state.enemyProjectiles = state.enemyProjectiles.filter((shot) => shot.life > 0 && dist(shot, p) < 1300);
  if (state.enemyProjectiles.length > 80) state.enemyProjectiles.splice(0, state.enemyProjectiles.length - 80);
}

function addParticles(x, y, color, count) {
  if (state.particles.length > 220) return;
  const budget = Math.min(count, 240 - state.particles.length);
  for (let i = 0; i < budget; i += 1) {
    const a = rand(0, Math.PI * 2);
    const s = rand(35, 180);
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(0.22, 0.65),
      maxLife: 0.65,
      color,
    });
  }
}

function gainXp(value) {
  const p = state.player;
  p.xp += value;
  while (p.xp >= p.nextXp) {
    p.xp -= p.nextXp;
    p.level += 1;
    p.nextXp = nextLevelXp(p.level, p.nextXp);
    showLevelUp();
    break;
  }
}

function nextLevelXp(level, currentXp) {
  if (level < 13) return Math.floor(currentXp * 1.18 + 4);
  if (level < 22) return Math.floor(currentXp * 1.08 + 6);
  return Math.floor(currentXp * 1.045 + 8);
}

function buildUpgradePool() {
  const choices = [];
  const levels = state.weaponLevels;
  updateEvolutionReadiness();

  for (const [key, ready] of Object.entries(state.evolutionReady)) {
    if (!ready || state.evolved[key]) continue;
    const names = {
      knives: "Evolve: Blade Rain",
      fire: "Evolve: Fire Storm",
      coil: "Evolve: Eternal Coil",
      tome: "Evolve: Moon Barrier",
      lightning: "Evolve: Thunder Crown",
      bat: "Evolve: Night Flock",
      frost: "Evolve: Winter Star",
      poison: "Evolve: Plague Flask",
      beam: "Evolve: Solar Lance",
    };
    choices.push({ name: names[key], text: "Transform this weapon into its evolved form", apply: (game) => evolveWeapon(key, names[key].replace("Evolve: ", "")) });
  }

  if (levels.knives === 0) {
    choices.push({ name: "Unlock Throwing Knives", text: weaponDefs.knives.desc, apply: (game) => game.weaponLevels.knives = 1 });
  } else {
    choices.push({ name: "Sharpen Knives", text: "More knife damage and faster throws", apply: (game) => game.weaponLevels.knives = Math.min(8, game.weaponLevels.knives + 1) });
  }

  if (levels.fire === 0) {
    choices.push({ name: "Unlock Fire Bottles", text: weaponDefs.fire.desc, apply: (game) => game.weaponLevels.fire = 1 });
  } else {
    choices.push({ name: "Hotter Fire", text: "Fire lasts longer and burns harder", apply: (game) => game.weaponLevels.fire = Math.min(8, game.weaponLevels.fire + 1) });
  }

  if (levels.coil === 0) {
    choices.push({ name: "Unlock Shock Coil", text: weaponDefs.coil.desc, apply: (game) => game.weaponLevels.coil = 1 });
  } else {
    choices.push({ name: "Overcharged Coil", text: "Bigger electric pulse damage", apply: (game) => game.weaponLevels.coil = Math.min(8, game.weaponLevels.coil + 1) });
  }

  if (levels.tome === 0) {
    choices.push({ name: "Unlock Moon Tome", text: weaponDefs.tome.desc, apply: (game) => game.weaponLevels.tome = 1 });
  } else {
    choices.push({ name: "More Moon Pages", text: "More orbiting books and stronger ring damage", apply: (game) => game.weaponLevels.tome = Math.min(8, game.weaponLevels.tome + 1) });
  }

  if (levels.lightning === 0) {
    choices.push({ name: "Unlock Lightning Rod", text: weaponDefs.lightning.desc, apply: (game) => game.weaponLevels.lightning = 1 });
  } else {
    choices.push({ name: "Charged Rod", text: "More lightning damage and faster strikes", apply: (game) => game.weaponLevels.lightning = Math.min(8, game.weaponLevels.lightning + 1) });
  }

  if (levels.bat === 0) {
    choices.push({ name: "Unlock Spirit Bat", text: weaponDefs.bat.desc, apply: (game) => game.weaponLevels.bat = 1 });
  } else {
    choices.push({ name: "Bigger Bat Wing", text: "More bat damage and more dives", apply: (game) => game.weaponLevels.bat = Math.min(8, game.weaponLevels.bat + 1) });
  }

  if (levels.frost === 0) {
    choices.push({ name: "Unlock Frost Orb", text: weaponDefs.frost.desc, apply: (game) => game.weaponLevels.frost = 1 });
  } else {
    choices.push({ name: "Colder Frost", text: "Larger cold zones and stronger slow", apply: (game) => game.weaponLevels.frost = Math.min(8, game.weaponLevels.frost + 1) });
  }

  if (levels.poison === 0) {
    choices.push({ name: "Unlock Poison Vial", text: weaponDefs.poison.desc, apply: (game) => game.weaponLevels.poison = 1 });
  } else {
    choices.push({ name: "Toxic Mixture", text: "Longer poison pools and more damage", apply: (game) => game.weaponLevels.poison = Math.min(8, game.weaponLevels.poison + 1) });
  }

  if (levels.beam === 0) {
    choices.push({ name: "Unlock Sun Beam", text: weaponDefs.beam.desc, apply: (game) => game.weaponLevels.beam = 1 });
  } else {
    choices.push({ name: "Focused Beam", text: "Wider piercing beam and more damage", apply: (game) => game.weaponLevels.beam = Math.min(8, game.weaponLevels.beam + 1) });
  }

  choices.push(
    { name: "Faster Cleave", text: "Grid Cleaver cooldown -16%", apply: (game) => game.player.attackRate *= 0.84 },
    { name: "Heavy Cleave", text: "Grid Cleaver damage +2", apply: (game) => game.player.damage += 2 },
    { name: "Wider Cleave", text: "Grid Cleaver radius +1", apply: (game) => game.player.attackRadius += 1 },
    ...passiveUpgrades
  );

  return choices.sort(() => Math.random() - 0.5).slice(0, 3);
}

function showLevelUp() {
  paused = true;
  ui.choices.innerHTML = "";
  const pool = buildUpgradePool();

  for (const upgrade of pool) {
    const button = document.createElement("button");
    button.className = "choice";
    button.innerHTML = `<strong>${upgrade.name}</strong><span>${upgrade.text}</span>`;
    button.addEventListener("click", () => {
      upgrade.apply(state);
      updateEvolutionReadiness();
      ui.levelUp.classList.add("hidden");
      paused = manualPaused;
      lastTime = performance.now();
      updateUi();
    });
    ui.choices.append(button);
  }

  ui.levelUp.classList.remove("hidden");
}

function evolveWeapon(key, label) {
  if (state.evolved[key]) return;
  state.evolved[key] = true;
  state.flash = 0.55;
  state.shake = 1.2;
  addParticles(state.player.x, state.player.y, "#ffe2a0", 40);
  state.attacks.push({ x: state.player.x, y: state.player.y, radius: 230, facing: 1, life: 0.65, maxLife: 0.65, shape: "evolve" });
  console.log(`evolved: ${label}`);
}

function updateEvolutionReadiness() {
  const w = state.weaponLevels;
  state.evolutionStage.knives = evolutionStage([
    w.knives >= 2,
    w.knives >= 4,
    w.knives >= 6,
  ]);
  state.evolutionStage.fire = evolutionStage([
    w.fire >= 2,
    w.fire >= 4,
    w.fire >= 6,
  ]);
  state.evolutionStage.coil = evolutionStage([
    w.coil >= 2,
    w.coil >= 4,
    w.coil >= 6,
  ]);
  state.evolutionStage.tome = evolutionStage([
    w.tome >= 2,
    w.tome >= 4,
    w.tome >= 6,
  ]);
  state.evolutionStage.lightning = evolutionStage([
    w.lightning >= 2,
    w.lightning >= 4,
    w.lightning >= 6,
  ]);
  state.evolutionStage.bat = evolutionStage([
    w.bat >= 2,
    w.bat >= 4,
    w.bat >= 6,
  ]);
  state.evolutionStage.frost = evolutionStage([
    w.frost >= 2,
    w.frost >= 4,
    w.frost >= 6,
  ]);
  state.evolutionStage.poison = evolutionStage([
    w.poison >= 2,
    w.poison >= 4,
    w.poison >= 6,
  ]);
  state.evolutionStage.beam = evolutionStage([
    w.beam >= 2,
    w.beam >= 4,
    w.beam >= 6,
  ]);

  for (const key of Object.keys(state.evolutionReady)) {
    state.evolutionReady[key] = state.evolutionStage[key] >= 3;
  }
}

function evolutionStage(checks) {
  let stage = 0;
  for (const passed of checks) {
    if (!passed) break;
    stage += 1;
  }
  return stage;
}

function updatePauseButton() {
  ui.pauseBtn.textContent = manualPaused ? "Resume" : "Pause";
  ui.pauseBtn.classList.toggle("is-paused", manualPaused);
  ui.pauseBtn.setAttribute("aria-pressed", manualPaused ? "true" : "false");
}

function togglePause() {
  if (!state || !state.running || !ui.levelUp.classList.contains("hidden")) return;
  manualPaused = !manualPaused;
  paused = manualPaused;
  if (!manualPaused) lastTime = performance.now();
  updatePauseButton();
}

function selectCharacter(key) {
  selectedCharacter = key;
  const character = characterDefs[key];
  for (const card of ui.characterCards) {
    card.classList.toggle("selected", card.dataset.character === key);
  }
  ui.menuCharacterName.textContent = character.name;
  ui.menuCharacterTrait.textContent = character.trait;
  document.body.dataset.character = key;
}

function update(dt) {
  if (!state || !state.running || paused) return;

  const p = state.player;
  state.elapsed += dt;
  state.spawnTimer -= dt;
  state.bossTimer -= dt;
  state.uiTimer -= dt;
  state.flash = Math.max(0, state.flash - dt);
  state.shake = Math.max(0, state.shake - dt * 12);
  p.attackCooldown -= dt;
  p.invulnerable = Math.max(0, p.invulnerable - dt);
  if (p.hp < p.maxHp) {
    p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  }

  let dx = 0;
  let dy = 0;
  if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    p.x += (dx / len) * p.speed * dt;
    p.y += (dy / len) * p.speed * dt;
    if (Math.abs(dx) > 0.2) p.facing = Math.sign(dx);
  }
  state.camera.x += (p.x - innerWidth / 2 - state.camera.x) * Math.min(1, dt * 8);
  state.camera.y += (p.y - innerHeight / 2 - state.camera.y) * Math.min(1, dt * 8);

  const spawnRate = Math.max(0.17, 0.8 - state.elapsed / 190);
  if (state.spawnTimer <= 0) {
    const count = Math.min(5, 1 + Math.floor(state.elapsed / 50));
    for (let i = 0; i < count; i += 1) spawnEnemy(false);
    state.spawnTimer = spawnRate;
  }
  if (state.bossTimer <= 0) {
    spawnEnemy(true);
    state.bossTimer = 42;
  }

  if (p.attackCooldown <= 0) {
    performAreaAttack();
    p.attackCooldown = p.attackRate;
  }

  updateWeapons(dt);
  updateProjectiles(dt);
  updateEnemyProjectiles(dt);
  updateHazards(dt);

  for (const attack of state.attacks) attack.life -= dt;
  state.attacks = state.attacks.filter((attack) => attack.life > 0);

  for (const enemy of state.enemies) {
    const a = Math.atan2(p.y - enemy.y, p.x - enemy.x);
    const enemyDistance = dist(enemy, p);
    const moveFactor = enemy.type === "spitter" && enemyDistance < 260 ? -0.35 : 1;
    const slowFactor = enemy.chilled > 0 ? 0.55 : 1;
    enemy.chilled = Math.max(0, (enemy.chilled || 0) - dt);
    enemy.x += Math.cos(a) * enemy.speed * moveFactor * slowFactor * dt;
    enemy.y += Math.sin(a) * enemy.speed * moveFactor * slowFactor * dt;
    enemy.step += dt * enemy.speed * 0.06;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 6);
    enemy.shootTimer -= dt;

    if (enemy.type === "spitter" && enemy.shootTimer <= 0 && enemyDistance < 520) {
      fireEnemyProjectile(enemy);
      enemy.shootTimer = rand(1.7, 2.8);
    }

    if (actorsTouch(enemy, p) && p.invulnerable <= 0) {
      p.hp -= enemy.damage;
      p.invulnerable = 0.65;
      state.shake = 1;
      addParticles(p.x, p.y, "#d14343", 16);
      if (p.hp <= 0) endGame();
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    if (enemy.hp <= 0) {
      state.enemies.splice(i, 1);
      state.kills += 1;
      state.gems.push({ x: enemy.x, y: enemy.y, r: enemy.boss ? 8 : 5, value: enemy.xp });
      if (p.dropBonus && Math.random() < p.dropBonus) {
        state.gems.push({ x: enemy.x + rand(-18, 18), y: enemy.y + rand(-18, 18), r: 4, value: 0.65 });
      }
      addParticles(enemy.x, enemy.y, enemy.boss ? "#b646ff" : "#7cdb86", enemy.boss ? 32 : 12);
    } else if (dist(enemy, p) > 1800) {
      state.enemies.splice(i, 1);
    }
  }
  if (state.enemies.length > 170) {
    state.enemies.sort((a, b) => dist(a, p) - dist(b, p));
    state.enemies.length = 170;
  }

  for (const gem of state.gems) {
    const d = dist(gem, p);
    if (d < p.pickup) {
      const a = Math.atan2(p.y - gem.y, p.x - gem.x);
      const speed = 270 + (p.pickup - d) * 3.4;
      gem.x += Math.cos(a) * speed * dt;
      gem.y += Math.sin(a) * speed * dt;
    }
    if (d < 20) {
      gem.collected = true;
      gainXp(gem.value);
    }
  }
  state.gems = state.gems.filter((gem) => !gem.collected);
  state.gems = state.gems.filter((gem) => dist(gem, p) < 2200);
  if (state.gems.length > 180) {
    state.gems.sort((a, b) => dist(a, p) - dist(b, p));
    state.gems.length = 180;
  }

  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.94;
    particle.vy *= 0.94;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);

  if (state.uiTimer <= 0) {
    updateUi();
    state.uiTimer = 0.12;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateUi() {
  const p = state.player;
  ui.time.textContent = formatTime(state.elapsed);
  ui.level.textContent = p.level;
  ui.kills.textContent = state.kills;
  ui.hpFill.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
  ui.xpFill.style.width = `${clamp((p.xp / p.nextXp) * 100, 0, 100)}%`;
  ui.weaponList.innerHTML = "";
  updateEvolutionReadiness();
  for (const [key, level] of Object.entries(state.weaponLevels)) {
    if (level <= 0) continue;
    const chip = document.createElement("div");
    chip.className = "weapon-chip";
    const marker = state.evolved[key] ? "*" : state.evolutionReady[key] ? "!" : "";
    const stage = state.evolutionStage[key] || 0;
    const evoText = key === "cleaver" ? "" : state.evolved[key] ? " Evo" : ` E${stage}/3`;
    chip.textContent = `${marker}${weaponDefs[key].name} ${level}${evoText}`;
    ui.weaponList.append(chip);
  }
  const regen = document.createElement("div");
  regen.className = "weapon-chip";
  regen.textContent = `Regen ${p.regen.toFixed(1)}/s`;
  ui.weaponList.append(regen);

  ui.goalSurvive.classList.toggle("goal-done", state.elapsed >= 600);
  ui.goalSurvive.textContent = state.elapsed >= 600 ? "Done: Survive 10:00" : "Survive 10:00";
  const evolvedCount = Object.values(state.evolved).filter(Boolean).length;
  ui.goalEvolve.classList.toggle("goal-done", evolvedCount > 0);
  const readyCount = Object.values(state.evolutionReady).filter(Boolean).length;
  const bestStage = Math.max(0, ...Object.values(state.evolutionStage));
  ui.goalEvolve.textContent = evolvedCount > 0 ? `Done: ${evolvedCount} evolution` : readyCount > 0 ? "Evolution ready on level up" : `Evolve a weapon (${bestStage}/3)`;
}

function endGame() {
  state.running = false;
  paused = true;
  manualPaused = false;
  updatePauseButton();
  ui.finalTime.textContent = formatTime(state.elapsed);
  ui.finalKills.textContent = state.kills;
  ui.gameOver.classList.remove("hidden");
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawSprite(sprite, palette, x, y, scale = spriteScale, flip = false) {
  const width = sprite[0].length;
  const height = sprite.length;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const key = sprite[row][col];
      if (key === ".") continue;
      ctx.fillStyle = palette[key];
      ctx.fillRect(
        Math.round((col - width / 2) * scale),
        Math.round((row - height + 8) * scale),
        scale,
        scale
      );
    }
  }
  ctx.restore();
}

function seededNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function drawGroundDetails() {
  const startX = Math.floor(state.camera.x / TILE) * TILE;
  const startY = Math.floor(state.camera.y / TILE) * TILE;

  for (let x = startX; x < state.camera.x + innerWidth + TILE; x += TILE) {
    for (let y = startY; y < state.camera.y + innerHeight + TILE; y += TILE) {
      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);
      const n = seededNoise(tx, ty);
      const sx = x - state.camera.x;
      const sy = y - state.camera.y;

      if (n > 0.82) {
        ctx.fillStyle = "rgba(10, 12, 12, 0.18)";
        ctx.fillRect(sx + 7 + n * 5, sy + 11, 15, 3);
        ctx.fillRect(sx + 16, sy + 14, 3, 12);
      } else if (n < 0.12) {
        ctx.fillStyle = "rgba(134, 145, 110, 0.14)";
        ctx.fillRect(sx + 8, sy + 23, 4, 6);
        ctx.fillRect(sx + 13, sy + 20, 3, 9);
        ctx.fillRect(sx + 20, sy + 25, 4, 4);
      }
    }
  }
}

function drawAttacks() {
  for (const attack of state.attacks) {
    const alpha = clamp(attack.life / attack.maxLife, 0, 1);
    const x = attack.x - state.camera.x;
    const y = attack.y - state.camera.y;

    if (attack.shape !== "arc") {
      const evolved = attack.shape === "evolve";
      ctx.strokeStyle = evolved ? `rgba(255, 255, 255, ${0.7 * alpha})` : `rgba(255, 226, 144, ${0.48 * alpha})`;
      ctx.lineWidth = evolved ? 8 : 4;
      ctx.beginPath();
      ctx.arc(x, y, attack.radius * (1.04 - alpha * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = evolved ? `rgba(255, 226, 144, ${0.18 * alpha})` : `rgba(224, 179, 95, ${0.1 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, attack.radius, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(attack.facing, 1);
    ctx.strokeStyle = attack.evolved ? `rgba(255, 255, 255, ${0.8 * alpha})` : `rgba(255, 226, 144, ${0.55 * alpha})`;
    ctx.lineWidth = attack.evolved ? 5 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, attack.radius * (1.04 - alpha * 0.1), -attack.arc, attack.arc);
    ctx.stroke();
    ctx.strokeStyle = attack.evolved ? `rgba(255, 80, 120, ${0.35 * alpha})` : `rgba(224, 179, 95, ${0.28 * alpha})`;
    ctx.lineWidth = attack.evolved ? 14 : 9;
    ctx.beginPath();
    ctx.arc(0, 0, attack.radius * 0.78, -attack.arc * 0.87, attack.arc * 0.87);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHazards() {
  for (const hazard of state.hazards) {
    const x = hazard.x - state.camera.x;
    const y = hazard.y - state.camera.y;
    const alpha = clamp(hazard.life / hazard.maxLife, 0, 1);

    if (hazard.kind === "fire" || hazard.kind === "poison" || hazard.kind === "frost") {
      const colors = {
        fire: ["255, 214, 91", "255, 116, 48", "95, 30, 19"],
        poison: ["185, 255, 103", "99, 190, 86", "31, 84, 45"],
        frost: ["180, 245, 255", "88, 176, 230", "22, 72, 94"],
      }[hazard.kind];
      const grd = ctx.createRadialGradient(x, y, 4, x, y, hazard.r);
      grd.addColorStop(0, `rgba(${colors[0]}, ${0.38 * alpha})`);
      grd.addColorStop(0.45, `rgba(${colors[1]}, ${0.28 * alpha})`);
      grd.addColorStop(1, `rgba(${colors[2]}, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${colors[0]}, ${0.45 * alpha})`;
      ctx.fillRect(x - 18, y - 5, 9, 13);
      ctx.fillRect(x + 5, y - 12, 8, 18);
      ctx.fillRect(x + 17, y + 3, 7, 11);
      if (hazard.evolved) {
        ctx.strokeStyle = `rgba(${colors[0]}, ${0.65 * alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, hazard.r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, hazard.r * 1.02, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (hazard.kind === "coil") {
      ctx.strokeStyle = `rgba(139, 232, 255, ${0.78 * alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r * (1.08 - alpha * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * alpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2 + state.elapsed * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
        ctx.lineTo(x + Math.cos(a + 0.12) * hazard.r, y + Math.sin(a + 0.12) * hazard.r);
        ctx.stroke();
      }
    } else if (hazard.kind === "lightning") {
      ctx.strokeStyle = hazard.evolved ? `rgba(255, 255, 255, ${alpha})` : `rgba(255, 243, 166, ${0.9 * alpha})`;
      ctx.lineWidth = hazard.evolved ? 7 : 4;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 170);
      ctx.lineTo(x + 8, y - 94);
      ctx.lineTo(x - 5, y - 92);
      ctx.lineTo(x + 13, y - 22);
      ctx.lineTo(x - 2, y - 18);
      ctx.lineTo(x + 6, y);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 243, 166, ${0.28 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      if (hazard.evolved) {
        ctx.strokeStyle = `rgba(255, 217, 64, ${0.7 * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, hazard.r * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (hazard.kind === "beam") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(hazard.angle);
      ctx.fillStyle = hazard.evolved ? `rgba(255, 240, 168, ${0.58 * alpha})` : `rgba(255, 240, 168, ${0.42 * alpha})`;
      ctx.fillRect(0, -hazard.width, hazard.length, hazard.width * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${hazard.evolved ? 0.95 * alpha : 0.72 * alpha})`;
      ctx.fillRect(0, -Math.max(2, hazard.width * 0.25), hazard.length, Math.max(4, hazard.width * 0.5));
      if (hazard.evolved) {
        ctx.fillStyle = `rgba(255, 92, 92, ${0.28 * alpha})`;
        ctx.fillRect(0, -hazard.width * 1.6, hazard.length, hazard.width * 0.45);
        ctx.fillRect(0, hazard.width * 1.15, hazard.length, hazard.width * 0.45);
      }
      ctx.restore();
    }
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    const x = projectile.x - state.camera.x;
    const y = projectile.y - state.camera.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(projectile.angle);
    if (projectile.kind === "bat") {
      if (projectile.evolved) {
        drawPixelRect(-16, -3, 11, 6, "#12071f");
        drawPixelRect(-5, -7, 12, 14, "#6e36a8");
        drawPixelRect(7, -3, 11, 6, "#12071f");
        drawPixelRect(-2, -2, 5, 5, "#e0b3ff");
      } else {
        drawPixelRect(-10, -2, 7, 4, "#2b1740");
        drawPixelRect(-3, -5, 8, 10, "#46305d");
        drawPixelRect(5, -2, 7, 4, "#2b1740");
        drawPixelRect(-1, -1, 3, 3, "#a37bd1");
      }
    } else {
      drawPixelRect(-9, -1, 14, 3, "#d8d6ca");
      drawPixelRect(5, -2, 5, 5, "#f4d891");
      drawPixelRect(-12, -3, 4, 6, "#8b1e2d");
    }
    ctx.restore();
  }
}

function drawTomeOrbit() {
  if (!state.weaponLevels.tome) return;
  const p = state.player;
  const level = state.weaponLevels.tome;
  const count = Math.min(6, 1 + Math.floor(level / 2) + (state.evolved.tome ? 2 : 0));
  const radius = state.evolved.tome ? 88 : 62;
  const cx = p.x - state.camera.x;
  const cy = p.y - state.camera.y;

  for (let i = 0; i < count; i += 1) {
    const angle = state.elapsed * (state.evolved.tome ? 2.2 : 1.6) + (Math.PI * 2 * i) / count;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.58;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    drawPixelRect(-5, -7, 10, 14, "#d7d0bd");
    drawPixelRect(-4, -6, 4, 12, state.evolved.tome ? "#fff3a6" : "#9a6f4a");
    drawPixelRect(1, -6, 4, 12, state.evolved.tome ? "#8be8ff" : "#f0c879");
    drawPixelRect(-1, -7, 2, 14, "#251c28");
    ctx.restore();
  }

  if (state.evolved.tome) {
    ctx.strokeStyle = "rgba(255, 243, 166, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.58, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(139, 232, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.72, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawEnemyProjectiles() {
  for (const shot of state.enemyProjectiles) {
    const x = shot.x - state.camera.x;
    const y = shot.y - state.camera.y;
    ctx.fillStyle = "rgba(143, 211, 125, 0.28)";
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8fd37d";
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = "#d6ffb5";
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}

function drawPlayer(p) {
  const bob = Math.sin(state.elapsed * 10) * 1.2;
  const x = p.x - state.camera.x;
  const y = p.y - state.camera.y + bob;
  const flash = p.invulnerable > 0 && Math.floor(performance.now() / 80) % 2;

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y + 17, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const character = characterDefs[p.character] || characterDefs.hunter;
  const palette = flash
    ? Object.fromEntries(Object.entries(character.palette).map(([key]) => [key, "#fff4dc"]))
    : character.palette;
  drawSprite(character.sprite, palette, x, y, spriteScale, p.facing < 0);
}

function drawZombie(enemy) {
  const bob = Math.sin(enemy.step) * (enemy.boss ? 2 : 1.2);
  const scale = enemy.boss ? 2.65 : 2;
  const body = enemy.hitFlash > 0 ? "#ffffff" : enemy.boss ? "#7542a8" : "#5f7b45";
  const sprite = enemy.boss ? bossSprite : zombieSprite;
  const typePalette = enemy.type && enemyTypeDefs[enemy.type] ? enemyTypeDefs[enemy.type].palette : {};
  const basePalette = { ...palettes.zombie, ...typePalette };
  const palette = enemy.hitFlash > 0
    ? { ...basePalette, A: "#ffffff", B: "#ffffff", b: "#ffffff", S: "#ffffff", s: "#ffffff", P: "#ffffff", p: "#ffffff", V: "#ffffff" }
    : basePalette;
  const x = enemy.x - state.camera.x;
  const y = enemy.y - state.camera.y + bob;

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + 17 * (scale / 2), 12 * (scale / 2), 4 * (scale / 2), 0, 0, Math.PI * 2);
  ctx.fill();
  drawSprite(sprite, { ...palette, B: enemy.hitFlash > 0 ? "#ffffff" : body }, x, y, scale, enemy.x > state.player.x);

  if (enemy.boss || enemy.hp < enemy.maxHp) {
    const w = enemy.w;
    const pct = clamp(enemy.hp / enemy.maxHp, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(enemy.x - state.camera.x - w / 2, enemy.y - state.camera.y - enemy.h * 0.78, w, 4);
    ctx.fillStyle = enemy.boss ? "#b646ff" : "#d14343";
    ctx.fillRect(enemy.x - state.camera.x - w / 2, enemy.y - state.camera.y - enemy.h * 0.78, w * pct, 4);
  }
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const gradient = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
  gradient.addColorStop(0, "#111820");
  gradient.addColorStop(0.55, "#1c1b1f");
  gradient.addColorStop(1, "#121712");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  if (!state) return;

  ctx.save();
  if (state.shake > 0) ctx.translate(rand(-5, 5) * state.shake, rand(-5, 5) * state.shake);

  drawGroundDetails();
  drawHazards();
  drawAttacks();
  drawTomeOrbit();

  for (const gem of state.gems) {
    ctx.fillStyle = "#35a7ff";
    ctx.beginPath();
    ctx.moveTo(gem.x - state.camera.x, gem.y - state.camera.y - gem.r);
    ctx.lineTo(gem.x - state.camera.x + gem.r, gem.y - state.camera.y);
    ctx.lineTo(gem.x - state.camera.x, gem.y - state.camera.y + gem.r);
    ctx.lineTo(gem.x - state.camera.x - gem.r, gem.y - state.camera.y);
    ctx.closePath();
    ctx.fill();
  }

  const actors = [state.player, ...state.enemies].sort((a, b) => a.y - b.y);
  for (const actor of actors) {
    if (actor === state.player) drawPlayer(actor);
    else drawZombie(actor);
  }

  drawProjectiles();
  drawEnemyProjectiles();

  for (const particle of state.particles) {
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - state.camera.x - 2, particle.y - state.camera.y - 2, 4, 4);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 238, 184, ${Math.min(0.35, state.flash * 0.45)})`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" || event.code === "Escape") {
    event.preventDefault();
    togglePause();
    return;
  }
  keys.add(event.code);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
ui.startBtn.addEventListener("click", newGame);
ui.restartBtn.addEventListener("click", newGame);
ui.pauseBtn.addEventListener("click", togglePause);
for (const card of ui.characterCards) {
  card.addEventListener("click", () => selectCharacter(card.dataset.character));
}
selectCharacter(selectedCharacter);

resize();
requestAnimationFrame(loop);
