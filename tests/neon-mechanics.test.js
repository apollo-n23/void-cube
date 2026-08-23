/**
 * Drives shipped Neon Dash helpers extracted from the real HTML files.
 * No rewritten collision/collect/shop logic.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const voidHtml = fs.readFileSync(path.join(ROOT, 'void-cube.html'), 'utf8');
const l6Html = fs.readFileSync(path.join(ROOT, 'Level6.html'), 'utf8');

function extractFunction(src, name) {
  const needle = 'function ' + name + '(';
  const start = src.indexOf(needle);
  if (start < 0) throw new Error('missing function ' + name);
  let i = src.indexOf('{', start);
  if (i < 0) throw new Error('no body for ' + name);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const ch = src[j];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(start, j + 1);
    }
  }
  throw new Error('unclosed function ' + name);
}

function extractBetween(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  if (a < 0) throw new Error('missing marker ' + startMarker);
  const b = src.indexOf(endMarker, a + startMarker.length);
  if (b < 0) throw new Error('missing end marker ' + endMarker);
  return src.slice(a, b);
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL ' + msg);
    process.exitCode = 1;
    return false;
  }
  console.log('PASS ' + msg);
  return true;
}

let failed = 0;
function check(cond, msg) {
  if (!assert(cond, msg)) failed++;
}

// --- checkCollision from void-cube.html ---
const checkCollisionSrc = extractFunction(voidHtml, 'checkCollision');
const GROUND_Y = 418;
const collideSandbox = { GROUND_Y };
vm.createContext(collideSandbox);
vm.runInContext(checkCollisionSrc, collideSandbox);

const playerHit = { wx: 100, y: GROUND_Y - 26, w: 26, h: 26 };
const triHit = { wx: 113, h: 40 };
check(collideSandbox.checkCollision(playerHit, triHit) === true, 'overlapping AABBs still collide');

const playerMiss = { wx: 400, y: GROUND_Y - 26, w: 26, h: 26 };
check(collideSandbox.checkCollision(playerMiss, triHit) === false, 'separated AABBs do not collide');

// --- stomp vs side-death from shipped specials loop ---
const specialsBlock = extractBetween(
  voidHtml,
  '// collisions with special red monsters (AABB + height check)',
  '// collisions with monster projectiles'
);
check(specialsBlock.indexOf('pBottom > sTop + 7') >= 0, 'shipped specials use pBottom > sTop + 7 for body hit');
check(specialsBlock.indexOf("gameState = 'over'") >= 0, 'side/body overlap can still set over');

function runShippedSpecials(player, s) {
  const box = {
    specials: [s],
    player: player,
    frame: 9999,
    gameState: 'playing',
    baseScore: 0,
    score: 0,
    best: 0,
    particles: [],
    GROUND_Y: GROUND_Y,
    playShieldPop: function () {},
    playDeath: function () {},
    spawnExplosion: function () {},
    spawnDust: function () {},
    saveBest: function () {},
  };
  vm.createContext(box);
  vm.runInContext('(function(){\n' + specialsBlock + '\n})()', box);
  return box.gameState;
}
check(specialsBlock.indexOf('const sTop = s.y;') >= 0, 'sTop is enemy top in shipped source');

const enemy = { wx: 100, y: GROUND_Y - 32, w: 30, h: 32 };
const stomper = { wx: 102, y: GROUND_Y - 32 - 26, w: 26, h: 26, invulnUntil: 0, hasShield: false };
check(runShippedSpecials(stomper, Object.assign({}, enemy)) === 'playing', 'player bottom on enemy top is not a side-death');
const sider = { wx: 102, y: GROUND_Y - 32 + 10, w: 26, h: 26, invulnUntil: 0, hasShield: false };
check(runShippedSpecials(sider, Object.assign({}, enemy)) === 'over', 'deep body overlap is a kill');

// --- collect loop from void-cube.html ---
const collectSrc = extractBetween(voidHtml, '// Move and collect neon orbs', '// Move & recycle flying background rocketships');
const collectSandbox = {
  player: { wx: 100, y: GROUND_Y - 26, w: 26, h: 26 },
  neonOrbs: [{ wx: 110, y: GROUND_Y - 20, vx: 0, phase: 0, value: 1 }],
  neonScore: 0,
  frame: 0,
  particles: [],
  scrollX: 0,
  playCollect: function () {},
};
vm.createContext(collectSandbox);
vm.runInContext('(function(){\n' + collectSrc + '\n})()', collectSandbox);
check(collectSandbox.neonOrbs.length === 0, 'collect removes an orb from the shipped loop');
check(collectSandbox.neonScore === 1, 'collect increases neonScore from orb.value');

// --- leaveShop from Level6.html ---
const leaveShopSrc = extractFunction(l6Html, 'leaveShop');
check(leaveShopSrc.indexOf("gameState = 'playing'") >= 0, 'leaveShop source sets playing');
check(leaveShopSrc.indexOf("gameState = 'complete'") < 0, 'leaveShop source does not set complete');

const shopSandbox = {
  gameState: 'shop',
  shopPhase: 'browse',
  shopTimer: 10,
  shopMessage: 'x',
  shopMsgTimer: 3,
  shopVisited: false,
  player: { wx: 5000, y: 100, w: 26, h: 26, vx: 2, vy: 1, isClimbing: true, climbProgress: 0.4 },
  GROUND_Y: GROUND_Y,
  levelExit: { wx: 6100 },
  scrollX: 0,
  saveNeonScore: function () {},
  saveOwnedPowerups: function () {},
  getHydroDoorWorld: function () { return { doorL: 6080 }; },
  updateLevel3LinkVisibility: function () {},
};
vm.createContext(shopSandbox);
vm.runInContext(leaveShopSrc, shopSandbox);
shopSandbox.leaveShop();
check(shopSandbox.gameState === 'playing', "L6 shop exit leaves gameState === 'playing'");
check(shopSandbox.shopVisited === true, 'L6 shop exit marks shopVisited');

// hitbox sizes still 26 in all six shipped files
const levels = ['void-cube.html', 'level2.html', 'Level3.html', 'Level4.html', 'Leve5.html', 'Level6.html'];
for (const f of levels) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = t.match(/w:\s*26,\s*h:\s*26/);
  check(!!m, f + ' player w/h remain 26');
}

// --- spikes must never spawn on trampolines (all six levels) ---
for (const f of levels) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
  check(t.indexOf('function spikeOverlapsAnyTrampoline(') >= 0, f + ' defines spikeOverlapsAnyTrampoline');
  check(t.indexOf('function trampolineOverlapsAnySpike(') >= 0, f + ' defines trampolineOverlapsAnySpike');
  check(t.indexOf('spikeOverlapsAnyTrampoline(nextWX') >= 0, f + ' rejects spike spawn on trampolines');
  check(t.indexOf('trampolineOverlapsAnySpike(tWX, tW)') >= 0, f + ' rejects trampoline spawn on spikes');
}

const spikeHtml = fs.readFileSync(path.join(ROOT, 'void-cube.html'), 'utf8');
const spikeSandbox = { trampolines: [], obstacles: [] };
vm.createContext(spikeSandbox);
vm.runInContext(extractFunction(spikeHtml, 'spikeOverlapsAnyTrampoline'), spikeSandbox);
vm.runInContext(extractFunction(spikeHtml, 'trampolineOverlapsAnySpike'), spikeSandbox);

spikeSandbox.trampolines = [{ wx: 300, width: 40 }];
check(spikeSandbox.spikeOverlapsAnyTrampoline(320, 0) === true, 'spike centered on trampoline overlaps');
check(spikeSandbox.spikeOverlapsAnyTrampoline(500, 0) === false, 'distant spike does not overlap trampoline');

spikeSandbox.obstacles = [{ wx: 340, h: 26 }];
check(spikeSandbox.trampolineOverlapsAnySpike(326, 40) === true, 'trampoline over seeded spike overlaps');
check(spikeSandbox.trampolineOverlapsAnySpike(200, 40) === false, 'distant trampoline does not overlap spike');

spikeSandbox.trampolines = [{ wx: 400, width: 40 }];
check(spikeSandbox.spikeOverlapsAnyTrampoline(370, 13) === true, 'patrolling spike envelope hits trampoline');
check(spikeSandbox.spikeOverlapsAnyTrampoline(250, 13) === false, 'patrolling spike facing away misses trampoline');

const patrolHtml = fs.readFileSync(path.join(ROOT, 'Level6.html'), 'utf8');
const patrolSandbox = {};
vm.createContext(patrolSandbox);
vm.runInContext(extractFunction(patrolHtml, 'computeSafeTrianglePatrolAmp'), patrolSandbox);
const trampRight = [{ wx: 420, width: 40 }];
const ampRight = patrolSandbox.computeSafeTrianglePatrolAmp(400, 14, [], [], trampRight, []);
check(ampRight === 0, 'L6 patrol amp is 0 when trampoline is immediately to the right');
const trampFar = [{ wx: 520, width: 40 }];
const ampFar = patrolSandbox.computeSafeTrianglePatrolAmp(400, 14, [], [], trampFar, []);
check(ampFar >= 0 && (400 + 14 + ampFar) <= 520, 'L6 patrol stays left of a far-right trampoline');

if (failed) {
  console.error('FAILED ' + failed + ' assertion(s)');
  process.exit(1);
}
console.log('ALL MECHANICS CHECKS PASSED');
