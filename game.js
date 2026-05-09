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
  touchStick: document.getElementById("touchStick"),
  touchKnob: document.getElementById("touchKnob"),
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
const touchMove = { active: false, id: null, startX: 0, startY: 0, dx: 0, dy: 0 };

const weaponDefs = {
  cleaver: { name: "Grid Cleaver", desc: "Strikes cells around you" },
  knives: { name: "Throwing Knives", desc: "Fires blades at nearby enemies" },
  fire: { name: "Fire Bottles", desc: "Drops burning tiles while moving" },
  coil: { name: "Shock Coil", desc: "Pulses electricity around you" },
  tome: { name: "Moon Tome", desc: "Rotating books carve a safe ring" },
  lightning: { name: "Lightning Rod", desc: "Calls random strikes from above" },
  chainvolt: { name: "Million Volt", desc: "A chained electric shot that jumps between enemies" },
  bat: { name: "Spirit Bat", desc: "Summons a bat that dives into enemies" },
  frost: { name: "Aqua Shot", desc: "Starts as quick water shots and grows into a pressurized stream" },
  wave: { name: "Tidal Wave", desc: "Sends a cute water burst around you" },
  shellguard: { name: "Shell Guard", desc: "Cracks a defensive shell pulse nearby" },
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
    trait: "Blade hunter. Knives and Spirit Bat skills are stronger and appear more often.",
    affinity: ["knives", "knives", "knives", "bat", "bat"],
    sprite: playerSprite,
    palette: palettes.player,
    hp: 120,
    speed: 235,
    regen: 1.2,
    damage: 6,
    might: 1,
    attackRate: 0.78,
    pickup: 92,
    bladeBonus: 1.18,
  },
  spark: {
    name: "Pikachu",
    trait: "Electric striker. Lightning Rod, Million Volt, and Sun Beam appear more often.",
    affinity: ["lightning", "lightning", "chainvolt", "chainvolt", "chainvolt", "beam", "beam"],
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
    trait: "Water defender. Aqua Shot, wave, and shell skills appear more often.",
    affinity: ["frost", "frost", "frost", "wave", "wave", "shellguard", "shellguard"],
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
    trait: "Occult mixer. Moon Tome, Poison Vial, and XP gains appear more often.",
    affinity: ["tome", "tome", "poison", "poison", "xp", "xp"],
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
  { name: "Learning Gem", text: "Experience gained +25%", weapon: "xp", apply: (game) => game.player.xpGain *= 1.25 },
];

const evolutionDefs = {
  knives: [
    { name: "Blade Rain", text: "Evolve knives into a dense multi-blade storm", apply: (game) => game.player.might *= 1.12 },
    { name: "Blood Needles", text: "Evolve knives and gain faster basic slashes", apply: (game) => game.player.attackRate *= 0.86 },
    { name: "Phantom Daggers", text: "Evolve knives and gain movement speed", apply: (game) => game.player.speed *= 1.12 },
  ],
  fire: [
    { name: "Fire Storm", text: "Evolve bottles into larger burning fields", apply: (game) => game.player.hazardBonus *= 1.08 },
    { name: "Magma Trail", text: "Evolve bottles and make zones last harder", apply: (game) => game.player.might *= 1.08 },
    { name: "Ash Bloom", text: "Evolve bottles and widen your cleave radius", apply: (game) => game.player.attackRadius += 1 },
  ],
  coil: [
    { name: "Eternal Coil", text: "Evolve coil into a massive electric pulse", apply: (game) => game.player.regen += 0.6 },
    { name: "Static Heart", text: "Evolve coil and gain weapon damage", apply: (game) => game.player.might *= 1.1 },
    { name: "Arc Reactor", text: "Evolve coil and gain pickup range", apply: (game) => game.player.pickup *= 1.18 },
  ],
  tome: [
    { name: "Moon Barrier", text: "Evolve tome into a stronger orbiting guard", apply: (game) => game.player.regen += 0.7 },
    { name: "Star Pages", text: "Evolve tome and gain more XP from gems", apply: (game) => game.player.xpGain *= 1.18 },
    { name: "Gravity Codex", text: "Evolve tome and pull gems from farther away", apply: (game) => game.player.pickup *= 1.25 },
  ],
  lightning: [
    { name: "Thunder Crown", text: "Evolve lightning into repeated sky strikes", apply: (game) => game.player.might *= 1.12 },
    { name: "Storm Step", text: "Evolve lightning and gain speed", apply: (game) => game.player.speed *= 1.1 },
    { name: "Volt Halo", text: "Evolve lightning and quicken basic attacks", apply: (game) => game.player.attackRate *= 0.9 },
  ],
  chainvolt: [
    { name: "Thunder Link", text: "Evolve Million Volt into a longer chain strike", apply: (game) => game.player.might *= 1.1 },
    { name: "Static Web", text: "Evolve Million Volt and gain attack speed", apply: (game) => game.player.attackRate *= 0.88 },
    { name: "Over Spark", text: "Evolve Million Volt and gain movement speed", apply: (game) => game.player.speed *= 1.1 },
  ],
  bat: [
    { name: "Night Flock", text: "Evolve bat into a swarm of diving spirits", apply: (game) => game.player.speed *= 1.08 },
    { name: "Vampire Wing", text: "Evolve bat and gain health regeneration", apply: (game) => game.player.regen += 0.8 },
    { name: "Echo Fang", text: "Evolve bat and increase all weapon damage", apply: (game) => game.player.might *= 1.1 },
  ],
  frost: [
    { name: "Aqua Spear", text: "Evolve Aqua Shot into a piercing water strike", apply: (game) => game.player.might *= 1.1 },
    { name: "Bubble Sniper", text: "Evolve Aqua Shot and gain pickup range", apply: (game) => game.player.pickup *= 1.2 },
    { name: "Shell Piercer", text: "Evolve Aqua Shot and gain defense", apply: (game) => { game.player.maxHp += 30; game.player.hp += 30; } },
  ],
  wave: [
    { name: "Surf Spiral", text: "Evolve wave into a wider water spiral", apply: (game) => game.player.speed *= 1.08 },
    { name: "Bubble Current", text: "Evolve wave and gain pickup range", apply: (game) => game.player.pickup *= 1.2 },
    { name: "Deep Tide", text: "Evolve wave and increase weapon damage", apply: (game) => game.player.might *= 1.08 },
  ],
  shellguard: [
    { name: "Shell Fortress", text: "Evolve shell guard into a huge defensive pulse", apply: (game) => { game.player.maxHp += 35; game.player.hp += 35; } },
    { name: "Pearl Guard", text: "Evolve shell guard and gain regeneration", apply: (game) => game.player.regen += 0.8 },
    { name: "Aqua Shell", text: "Evolve shell guard and increase damage", apply: (game) => game.player.might *= 1.08 },
  ],
  poison: [
    { name: "Plague Flask", text: "Evolve poison into huge toxic pools", apply: (game) => game.player.hazardBonus *= 1.1 },
    { name: "Gold Toxin", text: "Evolve poison and gain more XP from gems", apply: (game) => game.player.xpGain *= 1.2 },
    { name: "Rot Bloom", text: "Evolve poison and increase weapon damage", apply: (game) => game.player.might *= 1.08 },
  ],
  beam: [
    { name: "Solar Lance", text: "Evolve beam into a huge piercing ray", apply: (game) => game.player.might *= 1.12 },
    { name: "Dawn Prism", text: "Evolve beam and widen your cleaver radius", apply: (game) => game.player.attackRadius += 1 },
    { name: "Nova Line", text: "Evolve beam and gain more XP from gems", apply: (game) => game.player.xpGain *= 1.18 },
  ],
};

const ascensionDefs = {
  knives: { name: "Astral Blade Rain", text: "Ascend knives into their final form. Level jumps beyond the evolved limit.", apply: (game) => game.player.might *= 1.2 },
  fire: { name: "Inferno Storm", text: "Ascend fire into its final form. Burning zones surge harder.", apply: (game) => game.player.hazardBonus *= 1.14 },
  coil: { name: "Godspark Coil", text: "Ascend coil into its final form. Electric power and recovery rise.", apply: (game) => { game.player.might *= 1.08; game.player.regen += 0.8; } },
  tome: { name: "Lunar Singularity", text: "Ascend tome into its final form. Orbit power and XP gain rise.", apply: (game) => { game.player.might *= 1.08; game.player.xpGain *= 1.14; } },
  lightning: { name: "Heaven Breaker", text: "Ascend lightning into its final form. Strikes hit with final power.", apply: (game) => game.player.might *= 1.16 },
  chainvolt: { name: "Ten Million Volt", text: "Ascend Million Volt into its final form. Chains surge through the horde.", apply: (game) => game.player.might *= 1.18 },
  bat: { name: "Eclipse Flock", text: "Ascend bat into its final form. Speed and damage rise.", apply: (game) => { game.player.speed *= 1.08; game.player.might *= 1.08; } },
  frost: { name: "Hydro Cannon", text: "Ascend Aqua Shot into its final form. Single-target water damage peaks.", apply: (game) => game.player.might *= 1.16 },
  wave: { name: "Ocean Heart", text: "Ascend wave into its final form. Water power and speed rise.", apply: (game) => { game.player.speed *= 1.1; game.player.might *= 1.08; } },
  shellguard: { name: "Titan Shell", text: "Ascend shell guard into its final form. Defense reaches its peak.", apply: (game) => { game.player.maxHp += 60; game.player.hp += 60; game.player.regen += 0.8; } },
  poison: { name: "World Plague", text: "Ascend poison into its final form. Toxic pools and XP scaling rise.", apply: (game) => { game.player.hazardBonus *= 1.1; game.player.xpGain *= 1.12; } },
  beam: { name: "Supernova Lance", text: "Ascend beam into its final form. Light damage reaches its peak.", apply: (game) => game.player.might *= 1.16 },
};

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
      xpGain: 1,
      bladeBonus: character.bladeBonus || 1,
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
      chainvolt: 0,
      bat: 0,
      frost: 0,
      wave: 0,
      shellguard: 0,
      poison: 0,
      beam: 0,
    },
    evolved: {
      knives: false,
      fire: false,
      coil: false,
      tome: false,
      lightning: false,
      chainvolt: false,
      bat: false,
      frost: false,
      wave: false,
      shellguard: false,
      poison: false,
      beam: false,
    },
    evolutionNames: {},
    evolvedRanks: {},
    ascended: {},
    evolutionReady: {
      knives: false,
      fire: false,
      coil: false,
      tome: false,
      lightning: false,
      chainvolt: false,
      bat: false,
      frost: false,
      wave: false,
      shellguard: false,
      poison: false,
      beam: false,
    },
    evolutionStage: {
      knives: 0,
      fire: 0,
      coil: 0,
      tome: 0,
      lightning: 0,
      chainvolt: 0,
      bat: 0,
      frost: 0,
      wave: 0,
      shellguard: 0,
      poison: 0,
      beam: 0,
    },
    weaponTimers: {
      knives: 1.2,
      fire: 0.7,
      coil: 2.4,
      lightning: 2.0,
      chainvolt: 1.25,
      bat: 1.0,
      frost: 1.8,
      wave: 1.6,
      shellguard: 2.1,
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

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return entries[entries.length - 1].type;
}

function chooseEnemyType() {
  const t = state.elapsed;
  const level = state.player.level;
  const pressure = Math.max(t / 60, level * 0.55);
  const weights = [
    { type: "walker", weight: Math.max(0.35, 8 - pressure * 0.9) },
    { type: "runner", weight: t > 18 || level >= 4 ? 2.2 + pressure * 0.35 : 0 },
    { type: "brute", weight: t > 42 || level >= 7 ? 0.8 + pressure * 0.28 : 0 },
    { type: "spitter", weight: t > 115 || level >= 14 ? 0.45 + pressure * 0.18 : 0 },
  ];

  if (level >= 8) {
    weights[0].weight *= 0.55;
    weights[1].weight *= 1.2;
  }
  if (level >= 14) {
    weights[0].weight *= 0.38;
    weights[2].weight *= 1.35;
    weights[3].weight *= 1.2;
  }
  if (level >= 20) {
    weights[0].weight *= 0.24;
    weights[1].weight *= 0.9;
    weights[2].weight *= 1.55;
    weights[3].weight *= 1.55;
  }

  return weightedPick(weights.filter((entry) => entry.weight > 0));
}

function nextBossDelay() {
  const level = state.player.level;
  const pressure = state.elapsed / 60 + level * 0.35;
  return Math.max(18, 42 - pressure * 2.4);
}

function spawnEnemy(boss = false, eliteBoss = false) {
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
  const scale = eliteBoss ? 2.28 : boss ? 1.75 : rand(0.9, 1.15) * typeDef.scale;
  const baseHp = eliteBoss ? 190 : boss ? 72 : 13;
  const hpGrowth = eliteBoss ? 72 : boss ? 32 : 4.5;
  const bossPatterns = ["fan", "nova", "slam"];
  state.enemies.push({
    x: pos.x,
    y: pos.y,
    w: 21 * scale,
    h: 27 * scale,
    hp: (baseHp + minutes * hpGrowth) * typeDef.hp,
    maxHp: (baseHp + minutes * hpGrowth) * typeDef.hp,
    speed: ((eliteBoss ? 68 : boss ? 54 : rand(66, 104)) + minutes * (eliteBoss ? 5.2 : 3.5)) * typeDef.speed,
    damage: (eliteBoss ? 42 : boss ? 25 : 12) * typeDef.damage,
    xp: (eliteBoss ? 85 : boss ? 28 : 1.45) * typeDef.xp,
    boss,
    eliteBoss,
    type,
    bossPattern: boss ? bossPatterns[Math.floor(Math.random() * bossPatterns.length)] : null,
    bossSkillTimer: boss ? rand(eliteBoss ? 2.0 : 2.8, eliteBoss ? 3.4 : 4.8) : 999,
    bossCastFlash: 0,
    shootTimer: type === "spitter" ? rand(1.0, 2.2) : 999,
    hitFlash: 0,
    step: Math.random() * 10,
  });
}

function performAreaAttack() {
  const p = state.player;
  const evolved = state.evolved.cleaver;
  const radius = (44 + p.attackRadius * 24) * (evolved ? 1.2 : 1) * (p.bladeBonus > 1 ? 1.08 : 1);
  const arc = (evolved ? 1.55 : 1.2) + (p.bladeBonus > 1 ? 0.12 : 0);
  state.attacks.push({ x: p.x, y: p.y, radius, facing: p.facing, arc, evolved, shape: "arc", life: evolved ? 0.32 : 0.22, maxLife: evolved ? 0.32 : 0.22 });

  for (const enemy of state.enemies) {
    if (arcHitsActor(p.x, p.y, p.facing, radius, arc, enemy)) {
      enemy.hp -= p.damage * p.might * p.bladeBonus;
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
  const count = (evolved ? 4 : 1) + Math.floor(level / 2) + (state.ascended.knives ? 2 : 0) + (p.bladeBonus > 1 && level >= 4 ? 1 : 0);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.atan2(target.y - p.y, target.x - p.x) + (i - (count - 1) / 2) * (evolved ? 0.28 : 0.16);
    state.projectiles.push({
      x: p.x,
      y: p.y - 8,
      vx: Math.cos(angle) * 500,
      vy: Math.sin(angle) * 500,
      damage: (6 + level * 2.4) * p.might * p.bladeBonus,
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

function fireChainVolt() {
  const p = state.player;
  const level = state.weaponLevels.chainvolt;
  const target = nearestEnemy(840);
  if (!target) return;

  const evolved = state.evolved.chainvolt;
  const ascended = state.ascended.chainvolt;
  const count = (ascended ? 3 : evolved ? 2 : 1) + Math.floor(level / 5);
  for (let i = 0; i < count; i += 1) {
    const spread = (i - (count - 1) / 2) * 0.2;
    const angle = Math.atan2(target.y - p.y, target.x - p.x) + spread;
    state.projectiles.push({
      x: p.x,
      y: p.y - 8,
      vx: Math.cos(angle) * (evolved ? 580 : 490),
      vy: Math.sin(angle) * (evolved ? 580 : 490),
      damage: (8 + level * 2.8) * p.might,
      life: evolved ? 1.45 : 1.15,
      angle,
      kind: "chainvolt",
      pierce: 0,
      chains: ascended ? 6 : evolved ? 4 : 2 + Math.floor(level / 4),
      chainRange: ascended ? 280 : evolved ? 225 : 170,
      chainFalloff: ascended ? 0.82 : 0.76,
      evolved,
    });
  }
}

function chainVoltFrom(source, projectile) {
  if (!projectile.chains) return;
  if (!projectile.hitTargets) projectile.hitTargets = new Set();
  projectile.hitTargets.add(source);

  let current = source;
  let damage = projectile.damage * projectile.chainFalloff;
  for (let i = 0; i < projectile.chains; i += 1) {
    let next = null;
    let best = projectile.chainRange;
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0 || projectile.hitTargets.has(enemy)) continue;
      const distance = dist(current, enemy);
      if (distance < best) {
        best = distance;
        next = enemy;
      }
    }
    if (!next) break;

    next.hp -= damage;
    next.hitFlash = 1;
    projectile.hitTargets.add(next);
    state.hazards.push({
      x: (current.x + next.x) / 2,
      y: (current.y + next.y) / 2,
      x1: current.x,
      y1: current.y,
      x2: next.x,
      y2: next.y,
      life: 0.18,
      maxLife: 0.18,
      evolved: projectile.evolved,
      kind: "chainvolt",
    });
    addParticles(next.x, next.y, "#fff86b", 6);
    current = next;
    damage *= projectile.chainFalloff;
  }
}

function sendSpiritBat() {
  const p = state.player;
  const level = state.weaponLevels.bat;
  const target = nearestEnemy(780);
  if (!target) return;
  const evolved = state.evolved.bat;
  const count = 1 + Math.floor(level / 3) + (evolved ? 3 : 0) + (state.ascended.bat ? 2 : 0);
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

function fireAquaShot() {
  const p = state.player;
  const level = state.weaponLevels.frost;
  const target = nearestEnemy(820);
  if (!target) return;
  const evolved = state.evolved.frost;
  const ascended = state.ascended.frost;
  const stream = level >= 5 || evolved;
  const count = Math.min(9, 1 + Math.floor(level / 2) + (evolved ? 2 : 0) + (ascended ? 2 : 0));
  const speed = ascended ? 650 : evolved ? 610 : 530;
  const hitRadius = (stream ? 6 : 4) + Math.floor(level / 3) + (evolved ? 2 : 0) + (ascended ? 2 : 0);
  for (let i = 0; i < count; i += 1) {
    const spread = (i - (count - 1) / 2) * (stream ? 0.045 : 0.12);
    const angle = Math.atan2(target.y - p.y, target.x - p.x) + spread;
    const trailOffset = stream ? i * 9 : i * 4;
    const sideOffset = stream ? Math.sin(i * 1.7 + state.elapsed * 9) * 3 : 0;
    const sideX = Math.cos(angle + Math.PI / 2) * sideOffset;
    const sideY = Math.sin(angle + Math.PI / 2) * sideOffset;
    state.projectiles.push({
      x: p.x - Math.cos(angle) * trailOffset + sideX,
      y: p.y - 5 - Math.sin(angle) * trailOffset + sideY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: ((stream ? 5.2 : 8.5) + level * (stream ? 1.55 : 2.6)) * p.might,
      life: ascended ? 1.95 : evolved ? 1.75 : stream ? 1.42 : 1.15,
      angle,
      kind: "aqua",
      hitRadius,
      stream,
      evolved,
      pierce: ascended ? 5 : evolved ? 3 : level >= 6 ? 1 : 0,
    });
  }
}

function castTidalWave() {
  const p = state.player;
  const level = state.weaponLevels.wave;
  const evolved = state.evolved.wave;
  state.hazards.push({
    x: p.x,
    y: p.y,
    r: (evolved ? 118 : 68) + level * 6,
    damage: (2.4 + level * 0.9) * p.might,
    tick: 0,
    life: evolved ? 2.2 : 1.35,
    maxLife: evolved ? 2.2 : 1.35,
    evolved,
    slow: evolved ? 0.48 : 0.66,
    kind: "wave",
  });
}

function pulseShellGuard() {
  const p = state.player;
  const level = state.weaponLevels.shellguard;
  const evolved = state.evolved.shellguard;
  const radius = (evolved ? 118 : 74) + level * 7;
  const damage = (8 + level * 2.8) * p.might;
  state.hazards.push({
    x: p.x,
    y: p.y,
    r: radius,
    damage,
    tick: 0,
    life: evolved ? 0.8 : 0.55,
    maxLife: evolved ? 0.8 : 0.55,
    evolved,
    kind: "shellguard",
  });
  for (const enemy of state.enemies) {
    if (!circleHitsActor(p.x, p.y, radius, enemy)) continue;
    enemy.hp -= damage;
    enemy.hitFlash = 1;
    const angle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
    enemy.x += Math.cos(angle) * (evolved ? 18 : 10);
    enemy.y += Math.sin(angle) * (evolved ? 18 : 10);
    addParticles(enemy.x, enemy.y, "#b7f3ff", 7);
  }
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
  const widthBase = state.ascended.beam ? 34 : state.evolved.beam ? 24 : 10;
  const widthGrowth = state.ascended.beam ? 4 : state.evolved.beam ? 3 : 2.2;
  const width = widthBase + level * widthGrowth;
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

function beamCooldown(level) {
  if (state.ascended.beam) return Math.max(0.55, 1.65 - level * 0.08);
  if (state.evolved.beam) return Math.max(0.75, 2.05 - level * 0.1);
  return Math.max(0.95, 2.65 - level * 0.16);
}

function updateWeapons(dt) {
  const levels = state.weaponLevels;
  const timers = state.weaponTimers;

  if (levels.knives > 0) {
    timers.knives -= dt;
    if (timers.knives <= 0) {
      fireKnife();
      const hunterBladeRate = state.player.bladeBonus > 1 ? 0.86 : 1;
      timers.knives = Math.max(0.2, (0.98 - levels.knives * 0.095) * hunterBladeRate);
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

  if (levels.chainvolt > 0) {
    timers.chainvolt -= dt;
    if (timers.chainvolt <= 0) {
      fireChainVolt();
      timers.chainvolt = Math.max(0.36, (1.28 - levels.chainvolt * 0.075) * (state.evolved.chainvolt ? 0.86 : 1));
    }
  }

  if (levels.bat > 0) {
    timers.bat -= dt;
    if (timers.bat <= 0) {
      sendSpiritBat();
      timers.bat = Math.max(0.32, 1.34 - levels.bat * 0.095);
    }
  }

  if (levels.frost > 0) {
    timers.frost -= dt;
    if (timers.frost <= 0) {
      fireAquaShot();
      timers.frost = Math.max(0.18, (0.88 - levels.frost * 0.055) * (state.evolved.frost ? 0.78 : 1));
    }
  }

  if (levels.wave > 0) {
    timers.wave -= dt;
    if (timers.wave <= 0) {
      castTidalWave();
      timers.wave = Math.max(0.62, 1.75 - levels.wave * 0.08);
    }
  }

  if (levels.shellguard > 0) {
    timers.shellguard -= dt;
    if (timers.shellguard <= 0) {
      pulseShellGuard();
      timers.shellguard = Math.max(0.9, 2.25 - levels.shellguard * 0.1);
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
      timers.beam = beamCooldown(levels.beam);
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
      const projectileRadius = projectile.hitRadius || (projectile.kind === "chainvolt" ? 7 : 5);
      if (circleHitsActor(projectile.x, projectile.y, projectileRadius, enemy)) {
        enemy.hp -= projectile.damage;
        enemy.hitFlash = 1;
        if (projectile.kind === "chainvolt") chainVoltFrom(enemy, projectile);
        if (projectile.pierce > 0) projectile.pierce -= 1;
        else projectile.life = 0;
        const color = projectile.kind === "chainvolt" ? "#fff86b" : projectile.kind === "aqua" ? "#7fe4ff" : "#e8edf4";
        addParticles(enemy.x, enemy.y, color, projectile.kind === "aqua" ? 4 : 6);
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
    if ((hazard.kind === "fire" || hazard.kind === "poison" || hazard.kind === "frost" || hazard.kind === "wave") && hazard.tick <= 0) {
      hazard.tick = 0.32;
      for (const enemy of state.enemies) {
        if (circleHitsActor(hazard.x, hazard.y, hazard.r, enemy)) {
          enemy.hp -= hazard.damage;
          enemy.hitFlash = 1;
          if (hazard.kind === "frost" || hazard.kind === "wave") enemy.chilled = Math.max(enemy.chilled || 0, hazard.kind === "wave" ? 0.45 : 0.7);
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
  fireEnemyShot(enemy, angle, 210, 8 + state.elapsed / 60, 5, "spit", 3.2);
}

function fireEnemyShot(enemy, angle, speed, damage, radius, kind, life = 3.2) {
  state.enemyProjectiles.push({
    x: enemy.x,
    y: enemy.y - 6,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage,
    life,
    r: radius,
    kind,
  });
}

function hurtPlayer(amount, invulnerable = 0.55, color = "#d14343") {
  const p = state.player;
  if (p.invulnerable > 0) return false;
  p.hp -= amount;
  p.invulnerable = invulnerable;
  state.shake = Math.max(state.shake, 1);
  addParticles(p.x, p.y, color, 16);
  if (p.hp <= 0) endGame();
  return true;
}

function castBossPattern(enemy) {
  const p = state.player;
  const elite = enemy.eliteBoss;
  const baseDamage = elite ? 18 : 12;
  enemy.bossCastFlash = 0.45;
  state.shake = Math.max(state.shake, elite ? 1.1 : 0.7);

  if (enemy.bossPattern === "nova") {
    const count = elite ? 18 : 12;
    const offset = state.elapsed * 0.8;
    for (let i = 0; i < count; i += 1) {
      const angle = offset + (Math.PI * 2 * i) / count;
      fireEnemyShot(enemy, angle, elite ? 185 : 155, baseDamage, elite ? 7 : 6, "bossBolt", 4.2);
    }
    addParticles(enemy.x, enemy.y, elite ? "#ff8df0" : "#c05cff", elite ? 22 : 14);
  } else if (enemy.bossPattern === "slam") {
    const radius = elite ? 168 : 122;
    state.hazards.push({
      x: enemy.x,
      y: enemy.y,
      r: radius,
      life: 0.55,
      maxLife: 0.55,
      evolved: elite,
      kind: "bossSlam",
    });
    if (circleHitsActor(enemy.x, enemy.y, radius, p)) {
      hurtPlayer(elite ? 26 : 17, 0.72, "#ff78cf");
      const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
      p.x += Math.cos(angle) * (elite ? 46 : 30);
      p.y += Math.sin(angle) * (elite ? 46 : 30);
    }
    addParticles(enemy.x, enemy.y, elite ? "#ff4fd8" : "#b646ff", elite ? 28 : 18);
  } else {
    const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
    const count = elite ? 7 : 5;
    for (let i = 0; i < count; i += 1) {
      const spread = (i - (count - 1) / 2) * (elite ? 0.18 : 0.23);
      fireEnemyShot(enemy, angle + spread, elite ? 255 : 225, baseDamage + 2, elite ? 6 : 5, "bossFang", 3.0);
    }
    if (elite) {
      fireEnemyShot(enemy, angle + Math.PI * 0.5, 170, baseDamage, 5, "bossFang", 3.4);
      fireEnemyShot(enemy, angle - Math.PI * 0.5, 170, baseDamage, 5, "bossFang", 3.4);
    }
    addParticles(enemy.x, enemy.y, "#ffd1f4", elite ? 18 : 12);
  }
}

function updateEnemyProjectiles(dt) {
  const p = state.player;
  for (const shot of state.enemyProjectiles) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;

    if (p.invulnerable <= 0 && Math.hypot(shot.x - p.x, shot.y - p.y) < shot.r + actorRadius(p)) {
      hurtPlayer(shot.damage, 0.45, shot.kind && shot.kind.startsWith("boss") ? "#ff78cf" : "#8fd37d");
      shot.life = 0;
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
  p.xp += value * p.xpGain;
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

function sampleUpgradeChoices(choices, count) {
  const pool = [...choices];
  const picked = [];
  const pickedNames = new Set();
  while (pool.length && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    const choice = pool.splice(index, 1)[0];
    if (pickedNames.has(choice.name)) continue;
    picked.push(choice);
    pickedNames.add(choice.name);
    for (let i = pool.length - 1; i >= 0; i -= 1) {
      if (pool[i].name === choice.name) pool.splice(i, 1);
    }
  }
  return picked;
}

function boostCharacterUpgradeChoices(choices) {
  const character = characterDefs[state.player.character] || characterDefs.hunter;
  if (!character.affinity) return;
  for (const weapon of character.affinity) {
    const matches = choices.filter((choice) => choice.weapon === weapon);
    if (!matches.length) continue;
    choices.push(matches[Math.floor(Math.random() * matches.length)]);
  }
}

function isSignatureUpgrade(upgrade) {
  const character = characterDefs[state.player.character] || characterDefs.hunter;
  return !!upgrade.weapon && !!character.affinity && character.affinity.includes(upgrade.weapon);
}

function maxWeaponLevel(game, key) {
  if (game.ascended[key]) return 14;
  if (game.evolved[key]) return 12;
  return 8;
}

function upgradeWeaponLevel(game, key) {
  game.weaponLevels[key] = Math.min(maxWeaponLevel(game, key), game.weaponLevels[key] + 1);
}

function ascendWeapon(key, ascension) {
  if (state.ascended[key]) return;
  const firstAscension = Object.keys(state.ascended).length === 0;
  state.ascended[key] = ascension.name;
  state.evolutionNames[key] = ascension.name;
  state.weaponLevels[key] = Math.max(14, state.weaponLevels[key]);
  state.evolvedRanks[key] = (state.evolvedRanks[key] || 0) + 2;
  ascension.apply(state);
  state.flash = 0.8;
  state.shake = 1.8;
  addParticles(state.player.x, state.player.y, "#fff4a8", 70);
  state.attacks.push({ x: state.player.x, y: state.player.y, radius: 310, facing: 1, life: 0.8, maxLife: 0.8, shape: "evolve" });
  if (firstAscension) {
    spawnEnemy(true, true);
    state.bossTimer = Math.min(state.bossTimer, 22);
  }
  console.log(`ascended: ${ascension.name}`);
}

function addEvolvedUpgradeChoices(choices) {
  for (const [key, evolutionName] of Object.entries(state.evolved)) {
    if (!evolutionName || key === "cleaver") continue;
    const level = state.weaponLevels[key] || 0;
    if (level >= 12) {
      if (state.ascended[key]) continue;
      const ascension = ascensionDefs[key];
      if (!ascension) continue;
      choices.push({
        name: `Ascend: ${ascension.name}`,
        text: ascension.text,
        weapon: key,
        apply: () => ascendWeapon(key, ascension),
      });
      continue;
    }
    const rank = state.evolvedRanks[key] || 0;
    choices.push({
      name: `Empower: ${state.evolutionNames[key] || weaponDefs[key].name}`,
      text: `Evolved rank +1. ${weaponDefs[key].name} grows stronger after evolution.`,
      weapon: key,
      apply: (game) => {
        upgradeWeaponLevel(game, key);
        game.evolvedRanks[key] = rank + 1;
        game.flash = 0.28;
        addParticles(game.player.x, game.player.y, "#9ff4ff", 24);
      },
    });
  }
}

function buildUpgradePool() {
  const choices = [];
  const levels = state.weaponLevels;
  updateEvolutionReadiness();

  for (const [key, ready] of Object.entries(state.evolutionReady)) {
    if (!ready || state.evolved[key]) continue;
    for (const evolution of evolutionDefs[key] || []) {
      choices.push({
        name: `Evolve: ${evolution.name}`,
        text: evolution.text,
        weapon: key,
        apply: (game) => evolveWeapon(key, evolution),
      });
    }
  }
  addEvolvedUpgradeChoices(choices);

  if (levels.knives === 0) {
    choices.push({ name: "Unlock Throwing Knives", text: weaponDefs.knives.desc, weapon: "knives", apply: (game) => game.weaponLevels.knives = 1 });
  } else if (!state.evolved.knives) {
    choices.push({ name: "Sharpen Knives", text: "More knife damage, more blades, and faster throws", weapon: "knives", apply: (game) => upgradeWeaponLevel(game, "knives") });
  }

  if (levels.fire === 0) {
    choices.push({ name: "Unlock Fire Bottles", text: weaponDefs.fire.desc, weapon: "fire", apply: (game) => game.weaponLevels.fire = 1 });
  } else if (!state.evolved.fire) {
    choices.push({ name: "Hotter Fire", text: "Fire lasts longer and burns harder", weapon: "fire", apply: (game) => upgradeWeaponLevel(game, "fire") });
  }

  if (levels.coil === 0) {
    choices.push({ name: "Unlock Shock Coil", text: weaponDefs.coil.desc, weapon: "coil", apply: (game) => game.weaponLevels.coil = 1 });
  } else if (!state.evolved.coil) {
    choices.push({ name: "Overcharged Coil", text: "Bigger electric pulse damage", weapon: "coil", apply: (game) => upgradeWeaponLevel(game, "coil") });
  }

  if (levels.tome === 0) {
    choices.push({ name: "Unlock Moon Tome", text: weaponDefs.tome.desc, weapon: "tome", apply: (game) => game.weaponLevels.tome = 1 });
  } else if (!state.evolved.tome) {
    choices.push({ name: "More Moon Pages", text: "More orbiting books and stronger ring damage", weapon: "tome", apply: (game) => upgradeWeaponLevel(game, "tome") });
  }

  if (levels.lightning === 0) {
    choices.push({ name: "Unlock Lightning Rod", text: weaponDefs.lightning.desc, weapon: "lightning", apply: (game) => game.weaponLevels.lightning = 1 });
  } else if (!state.evolved.lightning) {
    choices.push({ name: "Charged Rod", text: "More lightning damage and faster strikes", weapon: "lightning", apply: (game) => upgradeWeaponLevel(game, "lightning") });
  }

  if (levels.chainvolt === 0) {
    choices.push({ name: "Unlock Million Volt", text: weaponDefs.chainvolt.desc, weapon: "chainvolt", apply: (game) => game.weaponLevels.chainvolt = 1 });
  } else if (!state.evolved.chainvolt) {
    choices.push({ name: "Overcharge Million Volt", text: "More chain jumps, faster shots, and stronger shock damage", weapon: "chainvolt", apply: (game) => upgradeWeaponLevel(game, "chainvolt") });
  }

  if (levels.bat === 0) {
    choices.push({ name: "Unlock Spirit Bat", text: weaponDefs.bat.desc, weapon: "bat", apply: (game) => game.weaponLevels.bat = 1 });
  } else if (!state.evolved.bat) {
    choices.push({ name: "Bigger Bat Wing", text: "More bats, more damage, and faster dives", weapon: "bat", apply: (game) => upgradeWeaponLevel(game, "bat") });
  }

  if (levels.frost === 0) {
    choices.push({ name: "Unlock Aqua Shot", text: weaponDefs.frost.desc, weapon: "frost", apply: (game) => game.weaponLevels.frost = 1 });
  } else if (!state.evolved.frost) {
    choices.push({ name: "Pressurized Shot", text: "Aqua Shot fires faster, gains more droplets, and grows into a water stream", weapon: "frost", apply: (game) => upgradeWeaponLevel(game, "frost") });
  }

  if (levels.wave === 0) {
    choices.push({ name: "Unlock Tidal Wave", text: weaponDefs.wave.desc, weapon: "wave", apply: (game) => game.weaponLevels.wave = 1 });
  } else if (!state.evolved.wave) {
    choices.push({ name: "Stronger Tide", text: "Larger water bursts and stronger slow", weapon: "wave", apply: (game) => upgradeWeaponLevel(game, "wave") });
  }

  if (levels.shellguard === 0) {
    choices.push({ name: "Unlock Shell Guard", text: weaponDefs.shellguard.desc, weapon: "shellguard", apply: (game) => game.weaponLevels.shellguard = 1 });
  } else if (!state.evolved.shellguard) {
    choices.push({ name: "Harder Shell", text: "Bigger shell pulse and more damage", weapon: "shellguard", apply: (game) => upgradeWeaponLevel(game, "shellguard") });
  }

  if (levels.poison === 0) {
    choices.push({ name: "Unlock Poison Vial", text: weaponDefs.poison.desc, weapon: "poison", apply: (game) => game.weaponLevels.poison = 1 });
  } else if (!state.evolved.poison) {
    choices.push({ name: "Toxic Mixture", text: "Longer poison pools and more damage", weapon: "poison", apply: (game) => upgradeWeaponLevel(game, "poison") });
  }

  if (levels.beam === 0) {
    choices.push({ name: "Unlock Sun Beam", text: weaponDefs.beam.desc, weapon: "beam", apply: (game) => game.weaponLevels.beam = 1 });
  } else if (!state.evolved.beam) {
    choices.push({ name: "Focused Beam", text: "Beam width, fire rate, and piercing damage grow with each level", weapon: "beam", apply: (game) => upgradeWeaponLevel(game, "beam") });
  }

  choices.push(
    ...passiveUpgrades
  );

  boostCharacterUpgradeChoices(choices);
  return sampleUpgradeChoices(choices, 3);
}

function showLevelUp() {
  paused = true;
  ui.choices.innerHTML = "";
  const pool = buildUpgradePool();

  for (const upgrade of pool) {
    const button = document.createElement("button");
    const signature = isSignatureUpgrade(upgrade);
    button.className = signature ? "choice signature-choice" : "choice";
    const badge = signature ? `<em>${characterDefs[state.player.character].name} Signature</em>` : "";
    button.innerHTML = `<strong>${upgrade.name}${badge}</strong><span>${upgrade.text}</span>`;
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

function evolveWeapon(key, evolution) {
  if (state.evolved[key]) return;
  state.evolved[key] = evolution.name;
  state.evolutionNames[key] = evolution.name;
  evolution.apply(state);
  state.flash = 0.55;
  state.shake = 1.2;
  addParticles(state.player.x, state.player.y, "#ffe2a0", 40);
  state.attacks.push({ x: state.player.x, y: state.player.y, radius: 230, facing: 1, life: 0.65, maxLife: 0.65, shape: "evolve" });
  console.log(`evolved: ${evolution.name}`);
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
  state.evolutionStage.chainvolt = evolutionStage([
    w.chainvolt >= 2,
    w.chainvolt >= 4,
    w.chainvolt >= 6,
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
  state.evolutionStage.wave = evolutionStage([
    w.wave >= 2,
    w.wave >= 4,
    w.wave >= 6,
  ]);
  state.evolutionStage.shellguard = evolutionStage([
    w.shellguard >= 2,
    w.shellguard >= 4,
    w.shellguard >= 6,
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

function setTouchStickPosition(x, y) {
  if (!ui.touchStick || !ui.touchKnob) return;
  ui.touchStick.style.left = `${x}px`;
  ui.touchStick.style.top = `${y}px`;
}

function updateTouchKnob(dx, dy) {
  if (!ui.touchKnob) return;
  ui.touchKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

function resetTouchMove() {
  touchMove.active = false;
  touchMove.id = null;
  touchMove.dx = 0;
  touchMove.dy = 0;
  if (ui.touchStick) ui.touchStick.classList.remove("active");
  updateTouchKnob(0, 0);
}

function beginTouchMove(event) {
  if (touchMove.active || event.pointerType === "mouse") return;
  if (!state || !state.running || paused || !ui.levelUp.classList.contains("hidden")) return;
  touchMove.active = true;
  touchMove.id = event.pointerId;
  touchMove.startX = event.clientX;
  touchMove.startY = event.clientY;
  touchMove.dx = 0;
  touchMove.dy = 0;
  setTouchStickPosition(event.clientX, event.clientY);
  ui.touchStick.classList.add("active");
  ui.touchStick.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function updateTouchMove(event) {
  if (!touchMove.active || event.pointerId !== touchMove.id) return;
  const max = 46;
  const rawX = event.clientX - touchMove.startX;
  const rawY = event.clientY - touchMove.startY;
  const len = Math.hypot(rawX, rawY);
  const scale = len > max ? max / len : 1;
  touchMove.dx = rawX * scale;
  touchMove.dy = rawY * scale;
  updateTouchKnob(touchMove.dx, touchMove.dy);
  event.preventDefault();
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
  if (touchMove.active) {
    dx += touchMove.dx / 46;
    dy += touchMove.dy / 46;
  }
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
    const hasAscension = Object.keys(state.ascended).length > 0;
    spawnEnemy(true, hasAscension && Math.random() < 0.65);
    if (state.elapsed > 220 || p.level >= 18) spawnEnemy(true, hasAscension && Math.random() < 0.35);
    state.bossTimer = nextBossDelay();
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
    enemy.bossCastFlash = Math.max(0, (enemy.bossCastFlash || 0) - dt);
    enemy.shootTimer -= dt;
    enemy.bossSkillTimer -= dt;

    if (enemy.type === "spitter" && enemy.shootTimer <= 0 && enemyDistance < 520) {
      fireEnemyProjectile(enemy);
      enemy.shootTimer = rand(1.7, 2.8);
    }

    if (enemy.boss && enemy.bossSkillTimer <= 0 && enemyDistance < 760) {
      castBossPattern(enemy);
      enemy.bossSkillTimer = rand(enemy.eliteBoss ? 2.3 : 3.2, enemy.eliteBoss ? 4.0 : 5.4);
      if (enemy.eliteBoss && Math.random() < 0.35) {
        enemy.bossPattern = ["fan", "nova", "slam"][Math.floor(Math.random() * 3)];
      }
    }

    if (actorsTouch(enemy, p) && p.invulnerable <= 0) {
      hurtPlayer(enemy.damage, 0.65, "#d14343");
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    if (enemy.hp <= 0) {
      state.enemies.splice(i, 1);
      state.kills += 1;
      state.gems.push({ x: enemy.x, y: enemy.y, r: enemy.eliteBoss ? 11 : enemy.boss ? 8 : 5, value: enemy.xp });
      if (p.dropBonus && Math.random() < p.dropBonus) {
        state.gems.push({ x: enemy.x + rand(-18, 18), y: enemy.y + rand(-18, 18), r: 4, value: 0.65 });
      }
      addParticles(enemy.x, enemy.y, enemy.eliteBoss ? "#ff4fd8" : enemy.boss ? "#b646ff" : "#7cdb86", enemy.eliteBoss ? 48 : enemy.boss ? 32 : 12);
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
    const marker = state.ascended[key] ? "^" : state.evolved[key] ? "*" : state.evolutionReady[key] ? "!" : "";
    const stage = state.evolutionStage[key] || 0;
    const rankText = state.ascended[key] ? " Final" : state.evolvedRanks[key] ? ` +${state.evolvedRanks[key]}` : "";
    const evoText = key === "cleaver" ? "" : state.evolved[key] ? ` ${state.evolutionNames[key] || "Evo"}${rankText}` : ` E${stage}/3`;
    chip.textContent = `${marker}${weaponDefs[key].name} ${level}${evoText}`;
    ui.weaponList.append(chip);
  }
  const regen = document.createElement("div");
  regen.className = "weapon-chip";
  regen.textContent = `Regen ${p.regen.toFixed(1)}/s`;
  ui.weaponList.append(regen);
  const xpGain = document.createElement("div");
  xpGain.className = "weapon-chip";
  xpGain.textContent = `XP ${Math.round(p.xpGain * 100)}%`;
  ui.weaponList.append(xpGain);

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

    if (hazard.kind === "fire" || hazard.kind === "poison" || hazard.kind === "frost" || hazard.kind === "wave") {
      const colors = {
        fire: ["255, 214, 91", "255, 116, 48", "95, 30, 19"],
        poison: ["185, 255, 103", "99, 190, 86", "31, 84, 45"],
        frost: ["180, 245, 255", "88, 176, 230", "22, 72, 94"],
        wave: ["190, 246, 255", "72, 172, 232", "16, 73, 118"],
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
    } else if (hazard.kind === "shellguard") {
      ctx.strokeStyle = `rgba(190, 246, 255, ${0.8 * alpha})`;
      ctx.lineWidth = hazard.evolved ? 7 : 4;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r * (1.1 - alpha * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(105, 185, 215, ${0.14 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.48 * alpha})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 + state.elapsed;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * hazard.r * 0.46, y + Math.sin(a) * hazard.r * 0.46, 7, 0, Math.PI * 2);
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
    } else if (hazard.kind === "chainvolt") {
      const x1 = hazard.x1 - state.camera.x;
      const y1 = hazard.y1 - state.camera.y;
      const x2 = hazard.x2 - state.camera.x;
      const y2 = hazard.y2 - state.camera.y;
      const midX = (x1 + x2) / 2 + Math.sin(state.elapsed * 40) * 9;
      const midY = (y1 + y2) / 2 + Math.cos(state.elapsed * 36) * 9;
      ctx.strokeStyle = hazard.evolved ? `rgba(255, 255, 255, ${0.95 * alpha})` : `rgba(255, 248, 107, ${0.9 * alpha})`;
      ctx.lineWidth = hazard.evolved ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(midX, midY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 205, 43, ${0.45 * alpha})`;
      ctx.lineWidth = hazard.evolved ? 12 : 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(midX, midY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (hazard.kind === "bossSlam") {
      ctx.strokeStyle = hazard.evolved ? `rgba(255, 79, 216, ${0.9 * alpha})` : `rgba(182, 70, 255, ${0.82 * alpha})`;
      ctx.lineWidth = hazard.evolved ? 7 : 5;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r * (1.04 - alpha * 0.12), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = hazard.evolved ? `rgba(255, 79, 216, ${0.16 * alpha})` : `rgba(182, 70, 255, ${0.13 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.34 * alpha})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2 + state.elapsed;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * hazard.r * 0.24, y + Math.sin(a) * hazard.r * 0.24);
        ctx.lineTo(x + Math.cos(a) * hazard.r, y + Math.sin(a) * hazard.r);
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
    } else if (projectile.kind === "aqua") {
      if (projectile.stream) {
        const length = projectile.evolved ? 34 : 26;
        const width = Math.max(5, projectile.hitRadius || 7);
        drawPixelRect(-length, -Math.floor(width / 2), length + 12, width, "#5ecfff");
        drawPixelRect(-length + 5, -Math.max(1, Math.floor(width / 4)), length, Math.max(2, Math.floor(width / 2)), "#d6fbff");
        drawPixelRect(6, -Math.floor(width / 2) - 2, 8, width + 4, "#ffffff");
        drawPixelRect(-length - 7, -2, 8, 4, "#2f91d1");
        if (projectile.evolved) {
          drawPixelRect(-length + 2, -Math.floor(width / 2) - 3, length - 6, 2, "#b7f3ff");
          drawPixelRect(-length + 2, Math.floor(width / 2) + 1, length - 6, 2, "#b7f3ff");
        }
      } else {
        drawPixelRect(-10, -3, 14, 6, "#6ed8ff");
        drawPixelRect(3, -5, 7, 10, "#d6fbff");
        drawPixelRect(-13, -2, 5, 4, "#2f91d1");
        drawPixelRect(-5, -1, 6, 2, "#ffffff");
      }
    } else if (projectile.kind === "chainvolt") {
      drawPixelRect(-12, -2, 16, 4, "#fff86b");
      drawPixelRect(1, -5, 8, 10, "#ffffff");
      drawPixelRect(-15, -1, 6, 2, "#ffb52b");
      drawPixelRect(-4, -7, 4, 5, "#ffd743");
      drawPixelRect(-4, 2, 4, 5, "#ffd743");
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
    const bossShot = shot.kind && shot.kind.startsWith("boss");
    const glow = shot.kind === "bossBolt" ? "255, 79, 216" : shot.kind === "bossFang" ? "255, 209, 244" : "143, 211, 125";
    ctx.fillStyle = `rgba(${glow}, ${bossShot ? 0.34 : 0.28})`;
    ctx.beginPath();
    ctx.arc(x, y, bossShot ? shot.r + 6 : 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shot.kind === "bossBolt" ? "#ff4fd8" : shot.kind === "bossFang" ? "#b646ff" : "#8fd37d";
    ctx.fillRect(x - shot.r, y - shot.r, shot.r * 2, shot.r * 2);
    ctx.fillStyle = bossShot ? "#ffffff" : "#d6ffb5";
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
  const scale = enemy.eliteBoss ? 3.25 : enemy.boss ? 2.65 : 2;
  const casting = enemy.bossCastFlash > 0 && Math.floor(performance.now() / 70) % 2;
  const body = enemy.hitFlash > 0 ? "#ffffff" : casting ? "#ffb7f4" : enemy.eliteBoss ? "#9b2f8f" : enemy.boss ? "#7542a8" : "#5f7b45";
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
  drawSprite(sprite, { ...palette, B: enemy.hitFlash > 0 ? "#ffffff" : body, P: enemy.eliteBoss ? "#ff4fd8" : palette.P, V: enemy.eliteBoss ? "#ffd1f4" : palette.V }, x, y, scale, enemy.x > state.player.x);

  if (enemy.eliteBoss) {
    ctx.strokeStyle = "rgba(255, 79, 216, 0.58)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 2, enemy.w * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (enemy.boss && enemy.bossCastFlash > 0) {
    const alpha = clamp(enemy.bossCastFlash / 0.45, 0, 1);
    ctx.strokeStyle = enemy.eliteBoss ? `rgba(255, 79, 216, ${0.7 * alpha})` : `rgba(182, 70, 255, ${0.55 * alpha})`;
    ctx.lineWidth = enemy.eliteBoss ? 4 : 3;
    ctx.beginPath();
    ctx.arc(x, y + 2, enemy.w * 0.58 + (1 - alpha) * 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (enemy.boss || enemy.hp < enemy.maxHp) {
    const w = enemy.w;
    const pct = clamp(enemy.hp / enemy.maxHp, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(enemy.x - state.camera.x - w / 2, enemy.y - state.camera.y - enemy.h * 0.78, w, 4);
    ctx.fillStyle = enemy.eliteBoss ? "#ff4fd8" : enemy.boss ? "#b646ff" : "#d14343";
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
if (ui.touchStick) {
  ui.touchStick.addEventListener("pointerdown", beginTouchMove);
  ui.touchStick.addEventListener("pointermove", updateTouchMove);
  ui.touchStick.addEventListener("pointerup", resetTouchMove);
  ui.touchStick.addEventListener("pointercancel", resetTouchMove);
  ui.touchStick.addEventListener("lostpointercapture", resetTouchMove);
}
ui.startBtn.addEventListener("click", newGame);
ui.restartBtn.addEventListener("click", newGame);
ui.pauseBtn.addEventListener("click", togglePause);
for (const card of ui.characterCards) {
  card.addEventListener("click", () => selectCharacter(card.dataset.character));
}
selectCharacter(selectedCharacter);

resize();
requestAnimationFrame(loop);
