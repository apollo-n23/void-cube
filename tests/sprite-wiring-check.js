'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const LEVELS = [
  { file: 'void-cube.html', theme: 'void', extra: [] },
  { file: 'level2.html', theme: 'octo', extra: ['npc'] },
  { file: 'Level3.html', theme: 'industrial', extra: [] },
  { file: 'Level4.html', theme: 'lava', extra: ['ptero', 'npc', 'build'] },
  { file: 'Leve5.html', theme: 'pink', extra: ['ptero', 'npc', 'build'] },
  { file: 'Level6.html', theme: 'water', extra: ['bubble', 'npc', 'build'] },
];

const requiredKeys = ['player', 'hazard', 'orb', 'portal'];
let failed = 0;
const lines = [];

function check(cond, msg) {
  const mark = cond ? 'PASS' : 'FAIL';
  if (!cond) failed++;
  lines.push(mark + ' ' + msg);
  console.log(mark + ' ' + msg);
}

for (const spec of LEVELS) {
  const t = fs.readFileSync(path.join(ROOT, spec.file), 'utf8');
  check(/width="960" height="520"/.test(t) || /width=.960. height=.520/.test(t), spec.file + ' canvas 960x520');
  check(t.indexOf('assets/neon/draw-sprites.js') >= 0, spec.file + ' loads draw-sprites.js');
  check(t.indexOf("NeonDashSprites.theme('" + spec.theme + "')") >= 0, spec.file + " theme('" + spec.theme + "')");
  check(/w:\s*26,\s*h:\s*26/.test(t), spec.file + ' player w/h 26');
  check(t.indexOf('function checkCollision') >= 0, spec.file + ' checkCollision present');
  check(t.indexOf('function gameLoop') >= 0 || t.indexOf('function gameLoop(') >= 0, spec.file + ' gameLoop present');
  check(t.indexOf("gameState = 'complete'") >= 0 || t.indexOf('gameState===\'complete\'') >= 0 || t.indexOf("gameState = 'over'") >= 0, spec.file + ' complete/over paths present');
  check(t.indexOf("drawSprite(ctx, 'player'") >= 0, spec.file + ' drawImage player via drawSprite');
  check(t.indexOf("drawSprite(ctx, 'hazard'") >= 0, spec.file + ' drawSprite hazard');
  check(t.indexOf("'orbGreen'") >= 0 && t.indexOf("'orb'") >= 0, spec.file + ' drawSprite orbs');
  check(t.indexOf('drawPortal(') >= 0, spec.file + ' drawPortal animated');
  check(t.indexOf('drawShot(') >= 0, spec.file + ' drawShot animated');
  if (spec.file === 'Level4.html') {
    check(t.indexOf('drawBoss(') >= 0, spec.file + ' drawBoss animated');
  }
  for (const k of spec.extra) {
    check(t.indexOf("drawSprite(ctx, '" + k + "'") >= 0, spec.file + ' drawSprite ' + k);
  }
  check(t.indexOf('function checkCollision') >= 0 && t.indexOf('isClimbing') >= 0, spec.file + ' climb/collision still in source');
}

const spriteFiles = [
  'player-void.png', 'player-octo.png', 'player-industrial.png', 'player-lava.png', 'player-pink.png', 'player-water.png',
  'hazard-void.png', 'hazard-octo.png', 'hazard-industrial.png', 'hazard-lava.png', 'hazard-pink.png', 'hazard-coral.png',
  'orb.png', 'orb-green.png',
  'portal-void.png', 'portal-industrial.png', 'portal-lava.png', 'portal-pink.png', 'portal-water.png',
  'portal-void-01.png', 'portal-void-08.png', 'portal-lava-01.png', 'portal-pink-01.png', 'portal-water-01.png', 'portal-industrial-01.png',
  'blob.png', 'blob-lava.png', 'blob-pink.png', 'blob-water.png',
  'ptero.png', 'drone.png', 'octopoop.png', 'boss.png', 'bubble.png',
  'sky-void.jpg', 'sky-octo.jpg', 'sky-industrial.jpg', 'sky-lava.jpg', 'sky-pink.jpg', 'sky-water.jpg',
  'plat-void.png', 'plat-octo.png', 'plat-industrial.png', 'plat-lava.png', 'plat-pink.png', 'plat-water.png',
  'boss-01.png', 'boss-08.png',
  'hud-plate.png', 'world-sign.png', 'shield-pickup.png', 'shield.png',
  'shield-01.png', 'shield-08.png', 'pickup-01.png', 'pickup-08.png',
  'fluid-lava.png', 'fluid-water.png', 'fluid-goo.png', 'fluid-acid.png',
  'build-neon.png', 'build-hydro.png', 'build-lava.png', 'pyramid-gold.png', 'pyramid-ice.png',
  'shot-bolt.png', 'shot-bolt-01.png', 'shot-fire.png', 'shot-fire-01.png',
  'shot-laser.png', 'shot-laser-01.png', 'shot-slime.png', 'shot-water.png', 'shot-acid.png',
  'draw-sprites.js',
];
for (const f of spriteFiles) {
  const p = path.join(ROOT, 'assets', 'neon', f);
  check(fs.existsSync(p) && fs.statSync(p).size > 100, 'exists assets/neon/' + f);
}

if (failed) {
  console.error('FAILED ' + failed);
  process.exit(1);
}
console.log('ALL SPRITE WIRING CHECKS PASSED');
fs.writeFileSync(process.env.WIRING_OUT || path.join(ROOT, 'tests', 'sprite-wiring.txt'), lines.join('\n') + '\nALL SPRITE WIRING CHECKS PASSED\n');
