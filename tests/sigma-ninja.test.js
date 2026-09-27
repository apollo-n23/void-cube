/**
 * Drives shipped Sigma Ninja helpers from assets/sigma-ninja/sigma-ninja.js
 * and hub markup in index.html. No rewritten movement, collision, camera,
 * walk ticker, or attack/kill rules.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const hubHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const levelHtml = fs.readFileSync(path.join(ROOT, 'sigma-ninja.html'), 'utf8');
const logicSrc = fs.readFileSync(path.join(ROOT, 'assets', 'sigma-ninja', 'sigma-ninja.js'), 'utf8');

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

function hrefForLabel(html, label) {
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const inner = m[2].replace(/<[^>]+>/g, ' ');
    if (inner.indexOf(label) < 0) continue;
    const href = /href="([^"]+)"/.exec(attrs);
    if (href) return href[1];
  }
  return null;
}

const voidHref = hrefForLabel(hubHtml, 'Void Cube');
const sigmaHref = hrefForLabel(hubHtml, 'Sigma Ninja');
check(!!voidHref, 'hub has selectable entry labeled Void Cube');
check(!!sigmaHref, 'hub has selectable entry labeled Sigma Ninja');
check(voidHref !== sigmaHref, 'Void Cube and Sigma Ninja resolve to different hrefs');
check(
  !!voidHref && fs.existsSync(path.join(ROOT, voidHref)),
  'Void Cube href resolves to in-repo file ' + voidHref
);
check(
  !!sigmaHref && fs.existsSync(path.join(ROOT, sigmaHref)),
  'Sigma Ninja href resolves to in-repo file ' + sigmaHref
);

check(levelHtml.indexOf('assets/sigma-ninja/sigma-ninja.js') >= 0, 'level loads shipped sigma-ninja.js');
check(levelHtml.indexOf('type="module"') < 0, 'level is not an ES-module page');
check(!/\bmodule\.exports\b/.test(logicSrc), 'logic has no unguarded module.exports');
check(!/\bmodule\.exports\b/.test(levelHtml), 'level html has no unguarded module.exports');
check(levelHtml.indexOf('keydown') >= 0, 'level listens for keyboard');
check(levelHtml.indexOf('handleSpaceBar') >= 0 || levelHtml.indexOf('Space') >= 0, 'level wires space bar');

const playerLevel1Concept = path.join(ROOT, 'assets', 'sigma-ninja', 'concept', 'Player Level 1.jpg');
const playerLevel1Source = path.join(ROOT, 'assets', 'sigma-ninja', 'player-level-1.jpg');
const playerLevel1Live = path.join(ROOT, 'assets', 'sigma-ninja', 'player-level-1.png');
check(fs.existsSync(playerLevel1Concept), 'Player Level 1 concept art is copied into the repo');
check(fs.existsSync(playerLevel1Source), 'Player Level 1 source jpg is copied into assets');
check(fs.statSync(playerLevel1Source).size > 500, 'Player Level 1 source jpg has non-trivial size');
check(fs.existsSync(playerLevel1Live), 'Player Level 1 live sprite exists on disk');
check(fs.statSync(playerLevel1Live).size > 500, 'Player Level 1 live sprite has non-trivial size');
check(logicSrc.indexOf('assets/sigma-ninja/player-level-1.png') >= 0, 'logic references Player Level 1 live sprite');
check(logicSrc.indexOf("PLAYER_SPRITE = 'assets/sigma-ninja/player.png'") < 0, 'live start sprite is not armored player.png');

const applySrc = extractFunction(logicSrc, 'applyArrowKey');
const clampSrc = extractFunction(logicSrc, 'clamp');
check(applySrc.indexOf('ArrowLeft') >= 0, 'extracted applyArrowKey mentions ArrowLeft');
check(applySrc.indexOf('ArrowRight') >= 0, 'extracted applyArrowKey mentions ArrowRight');
check(applySrc.indexOf('ArrowUp') >= 0, 'extracted applyArrowKey mentions ArrowUp');
check(applySrc.indexOf('ArrowDown') >= 0, 'extracted applyArrowKey mentions ArrowDown');

const sandbox = {
  window: {},
  globalThis: null
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(logicSrc + '\n' + clampSrc, sandbox);
check(typeof sandbox.SigmaNinja === 'object', 'shipped script attaches SigmaNinja');
check(typeof sandbox.SigmaNinja.applyArrowKey === 'function', 'shipped applyArrowKey is callable');
check(typeof sandbox.SigmaNinja.choose === 'function', 'shipped choose is callable');
check(typeof sandbox.SigmaNinja.cameraOffset === 'function', 'shipped cameraOffset is callable');
check(typeof sandbox.SigmaNinja.tickWalk === 'function', 'shipped tickWalk is callable');
check(typeof sandbox.SigmaNinja.handleSpaceBar === 'function', 'shipped handleSpaceBar is callable');
check(typeof sandbox.SigmaNinja.hitsBuilding === 'function', 'shipped hitsBuilding is callable');

check(
  sandbox.SigmaNinja.PLAYER_SPRITE === 'assets/sigma-ninja/player-level-1.png',
  'live PLAYER_SPRITE path is the copied Player Level 1 asset'
);
check(
  sandbox.SigmaNinja.PLAYER_SPRITE.indexOf('player.png') < 0,
  'PLAYER_SPRITE is not the armored Player Level 3 plate'
);

const winOnly = { window: {} };
vm.createContext(winOnly);
vm.runInContext(logicSrc, winOnly);
check(typeof winOnly.window.SigmaNinja === 'object', 'script attaches to window with no Node globals');
check(typeof winOnly.module === 'undefined', 'window-global load has no module');
check(typeof winOnly.require === 'undefined', 'window-global load has no require');

const moveBox = { STEP: 18, BOUNDS: { minX: 90, maxX: 870, minZ: 90, maxZ: 620 } };
vm.createContext(moveBox);
vm.runInContext(clampSrc + '\n' + applySrc, moveBox);

const origin = { x: 400, z: 400 };
const left = moveBox.applyArrowKey(origin, 'ArrowLeft', 18);
const right = moveBox.applyArrowKey(origin, 'ArrowRight', 18);
const up = moveBox.applyArrowKey(origin, 'ArrowUp', 18);
const down = moveBox.applyArrowKey(origin, 'ArrowDown', 18);
check(left.x === origin.x - 18 && left.z === origin.z, 'ArrowLeft decreases ground-plane x');
check(right.x === origin.x + 18 && right.z === origin.z, 'ArrowRight increases ground-plane x');
check(up.z === origin.z - 18 && up.x === origin.x, 'ArrowUp decreases ground-plane z');
check(down.z === origin.z + 18 && down.x === origin.x, 'ArrowDown increases ground-plane z');

const liveLeft = sandbox.SigmaNinja.applyArrowKey({ x: 400, z: 400 }, 'ArrowLeft');
check(liveLeft.x < 400 && liveLeft.z === 400, 'namespace applyArrowKey also changes x for ArrowLeft');

const SN = sandbox.SigmaNinja;
const landmarks = SN.VILLAGE_LANDMARKS;
check(Array.isArray(landmarks) && landmarks.length >= 2, 'village layout is a landmark list');
const kinds = landmarks.map(function (lm) { return lm.kind; });
check(kinds.indexOf('house') >= 0, 'village layout includes a house');
check(kinds.indexOf('inn') >= 0, 'village layout includes an inn');
const houseCount = kinds.filter(function (k) { return k === 'house'; }).length;
check(houseCount >= 2, 'village layout includes more than one house');
const solidBuildings = landmarks.filter(function (lm) {
  return lm.kind === 'house' || lm.kind === 'inn' || lm.kind === 'shop' || lm.kind === 'shrine';
});
check(solidBuildings.length >= 6, 'village has additional buildings beyond the original houses and inn');
check(kinds.indexOf('shop') >= 0 || kinds.indexOf('shrine') >= 0, 'village includes a shop or shrine building');

const decorations = landmarks.filter(function (lm) {
  return lm.kind !== 'house' && lm.kind !== 'inn';
});
check(decorations.length >= 3, 'village layout includes decoration entries (not house/inn)');

landmarks.forEach(function (lm) {
  check(typeof lm.src === 'string' && lm.src.indexOf('assets/sigma-ninja/') === 0, lm.id + ' references a village plate');
  check(fs.existsSync(path.join(ROOT, lm.src)), lm.src + ' exists on disk');
  check(fs.statSync(path.join(ROOT, lm.src)).size > 500, lm.src + ' has non-trivial size');
});

const playerSize = SN.PLAYER_SIZE;
check(playerSize && playerSize.w > 0 && playerSize.h > 0, 'PLAYER_SIZE is exported');
landmarks.filter(function (lm) { return lm.kind === 'house' || lm.kind === 'inn'; }).forEach(function (lm) {
  check(lm.w > playerSize.w && lm.h > playerSize.h, lm.id + ' footprint is larger than the player sprite');
});

check(SN.WORLD && SN.WORLD.w > 960, 'world width is wider than the 960px stage');
check(SN.BOUNDS.maxX - SN.BOUNDS.minX > 960, 'walkable world bounds are wider than the 960px stage');
check(SN.VIEWPORT.w === 960 && SN.VIEWPORT.h === 520, 'viewport matches the 960x520 stage');

const camNear = SN.cameraOffset({ x: 200, z: 200 });
const camFar = SN.cameraOffset({ x: 1700, z: 1100 });
check(typeof camNear.x === 'number' && typeof camNear.z === 'number', 'cameraOffset returns x/z');
check(camNear.x !== camFar.x || camNear.z !== camFar.z, 'camera offset changes when the player walks far across the world');
check(levelHtml.indexOf('cameraOffset') >= 0, 'level html applies shipped cameraOffset');

check(typeof SN.HILLS_TEXTURE === 'string', 'hills backdrop path is exported');
check(fs.existsSync(path.join(ROOT, SN.HILLS_TEXTURE)), 'hills backdrop exists on disk');
check(fs.statSync(path.join(ROOT, SN.HILLS_TEXTURE)).size > 500, 'hills backdrop has non-trivial size');
check(levelHtml.indexOf(SN.HILLS_TEXTURE) >= 0, 'level html paints the grassy hills backdrop');
check(levelHtml.indexOf('sn-hills') >= 0, 'level includes a hills backdrop layer');

check(typeof SN.INN_INTERIOR === 'string', 'inn interior plate is exported');
check(fs.existsSync(path.join(ROOT, SN.INN_INTERIOR)), 'inn interior plate exists');
check(typeof SN.INN_WALL === 'string', 'inn wall backdrop path is exported');
check(fs.existsSync(path.join(ROOT, SN.INN_WALL)), 'inn wall backdrop exists');
check(fs.statSync(path.join(ROOT, SN.INN_WALL)).size > 500, 'inn wall backdrop has non-trivial size');
check(fs.existsSync(path.join(ROOT, SN.INN_FLOOR)), 'inn floor texture exists');
check(Array.isArray(SN.INN_FURNITURE) && SN.INN_FURNITURE.length >= 2, 'inn interior has furniture');
SN.INN_FURNITURE.forEach(function (lm) {
  check(fs.existsSync(path.join(ROOT, lm.src)), lm.src + ' inn furniture exists');
  check(fs.statSync(path.join(ROOT, lm.src)).size > 500, lm.src + ' has non-trivial size');
});

const innDoor = SN.findInn();
const doorZone = SN.innDoorZone(innDoor);
const atDoor = { x: innDoor.x, z: doorZone.minZ + 24 };
check(SN.nearInnDoor(atDoor), 'standing in front of the inn door is in the enter zone');
check(!SN.nearInnDoor({ x: 400, z: 400 }), 'open plaza is not the inn door');
check(
  !SN.nearInnDoor({ x: innDoor.x, z: doorZone.maxZ + 40 }),
  'walking south of the porch leaves the enter zone'
);
check(
  !SN.nearInnDoor({ x: innDoor.x + 280, z: atDoor.z }),
  'standing beside the inn but not at the door is outside the enter zone'
);

const sessionAtDoor = SN.createSession();
sessionAtDoor.player.x = atDoor.x;
sessionAtDoor.player.z = atDoor.z;
const enterPrompt = SN.interactPrompt(sessionAtDoor);
check(!!enterPrompt && enterPrompt.action === 'enter', 'an enter-inn option appears at the door');
check(
  !!enterPrompt && enterPrompt.label === 'Press E to enter',
  'door prompt is Press E to enter hint text'
);
check(SN.enterInn(sessionAtDoor) === true, 'entering from the door succeeds');
check(sessionAtDoor.scene === 'inn', 'player is taken inside the inn');
check(sessionAtDoor.player.x === SN.INN_SPAWN.x && sessionAtDoor.player.z === SN.INN_SPAWN.z, 'inside spawn uses the inn spawn point');
const leavePrompt = SN.interactPrompt(sessionAtDoor);
check(!!leavePrompt && leavePrompt.action === 'exit', 'an exit option is available inside the inn');
check(SN.exitInn(sessionAtDoor) === true, 'leaving the inn succeeds');
check(sessionAtDoor.scene === 'village', 'player returns to the village');

const sessionFar = SN.createSession();
check(SN.enterInn(sessionFar) === false, 'cannot enter the inn from far away');
check(sessionFar.scene === 'village', 'failed enter leaves the scene as village');
check(levelHtml.indexOf('useInteract') >= 0 || levelHtml.indexOf('Press E to enter') >= 0, 'level surfaces the enter-inn option');
check(levelHtml.indexOf('Press E to enter') >= 0, 'level copies Press E to enter onto the overlay');
check(levelHtml.indexOf('is-hint') >= 0, 'level pops the enter hint over the player at the door');
check(levelHtml.indexOf('nearHint.textContent = \'\'') >= 0 || /nearHint\.textContent = ['"]{2}/.test(levelHtml), 'level clears the door hint after walking away');
check(levelHtml.indexOf('inn-world') >= 0, 'level mounts an inn interior world');
check(levelHtml.indexOf('sn-inn-wall') >= 0, 'level paints an inn wall backdrop above the floor');
check(levelHtml.indexOf('sn-missions') >= 0, 'level has a mission HUD at the top of the stage');
check(!!SN.getStoryNode('inn_inside'), 'inn interior story node exists');

const squareNode = SN.getStoryNode('square');
const toInnChoice = squareNode.choices.filter(function (c) { return c.id === 'to_inn'; })[0];
check(!!toInnChoice && toInnChoice.mission && toInnChoice.mission.id === 'enter_inn', 'walk-to-inn is a mission choice');
check(!toInnChoice.next, 'walk-to-inn does not skip the world by chaining a next node');
check(toInnChoice.mission.title === 'Enter the inn', 'mission title is Enter the inn');
check(SN.choose('square', 'to_inn') === null, 'story graph does not teleport into the inn from the menu');

const pinSession = SN.createSession();
const pinned = SN.selectChoice(pinSession, 'to_inn');
check(!!pinned && pinned.type === 'mission', 'clicking walk-to-inn pins a mission instead of changing scenes');
check(pinSession.storyId === 'square', 'narrative stays on the square after pinning enter-inn');
check(pinSession.scene === 'village', 'pinning enter-inn does not move the player');
const pinnedMissions = SN.activeMissions(pinSession);
check(
  pinnedMissions.length === 1 && pinnedMissions[0].title === 'Enter the inn',
  'active mission list leads with Enter the inn'
);

pinSession.player.x = atDoor.x;
pinSession.player.z = atDoor.z;
check(SN.enterInn(pinSession) === true, 'walking to the door still enters after the mission is pinned');
check(pinSession.storyId === 'inn_inside', 'entering the inn updates the bottom narrative');
check(SN.activeMissions(pinSession).length === 0, 'Enter the inn clears from the HUD after you walk in');

check(Array.isArray(SN.INN_NPCS) && SN.INN_NPCS.length >= 1, 'inn has NPC entries');
const bartender = SN.findBartender();
check(!!bartender && bartender.id === 'bartender', 'inn includes a bartender NPC');
check(fs.existsSync(path.join(ROOT, bartender.src)), 'bartender sprite exists on disk');
check(fs.statSync(path.join(ROOT, bartender.src)).size > 500, 'bartender sprite has non-trivial size');
check(levelHtml.indexOf('npc-bartender') >= 0 || levelHtml.indexOf('mountInnNpcs') >= 0, 'level mounts inn NPCs');

const talkSession = SN.createSession();
talkSession.scene = 'inn';
talkSession.player.x = 480;
talkSession.player.z = SN.bartenderTalkZone().minZ + 20;
check(SN.nearBartender(talkSession.player), 'standing in front of the counter is the bartender talk zone');
check(SN.talkBartender(talkSession) === true, 'talking to the bartender succeeds at the counter');
check(talkSession.storyId === 'inn_door', 'talking to the bartender unlocks the innkeeper narrative');

const innCam = SN.cameraOffset({ x: 400, z: 300 }, SN.VIEWPORT, SN.INN_WORLD);
check(innCam.x === 0 && innCam.z === 0, 'inn camera is fixed so the wall stays put');

const walkFrames = SN.WALK_FRAMES;
check(Array.isArray(walkFrames) && walkFrames.length >= 4, 'walk-cycle frame list is exported');
walkFrames.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' walk frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' walk frame has non-trivial size');
  check(logicSrc.indexOf(src) >= 0, src + ' is referenced by shipped logic');
});

const attackFrames = SN.ATTACK_FRAMES;
check(Array.isArray(attackFrames) && attackFrames.length >= 3, 'attack frame list is exported');
attackFrames.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' attack frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' attack frame has non-trivial size');
  check(logicSrc.indexOf(src) >= 0, src + ' is referenced by shipped logic');
});

const animRest = SN.createAnimState();
const restFrame = SN.tickWalk(animRest, false, 16);
check(restFrame === 0, 'walk ticker at rest returns frame 0');
const idleSprite = SN.playerSpriteForAnim(animRest);
check(idleSprite === SN.WALK_FRAMES[0], 'idle uses a planted walk-cycle frame so height does not pop');
const animMove = SN.createAnimState();
let tick;
for (tick = 0; tick < 24; tick++) SN.tickWalk(animMove, true, 16);
check(animMove.walkFrame !== restFrame, 'walk ticker returns a different frame after several moving ticks');
const movingSprite = SN.playerSpriteForAnim(animMove);
check(movingSprite !== idleSprite, 'moving sprite is a walk-cycle frame, not the idle plate');
check(walkFrames.indexOf(movingSprite) >= 0, 'moving sprite is one of the shipped walk frames');

check(SN.PLAYER_SPRITE_BACK === 'assets/sigma-ninja/player-level-1-back.png', 'back-facing idle sprite path is exported');
check(fs.existsSync(path.join(ROOT, SN.PLAYER_SPRITE_BACK)), 'back-facing idle sprite exists');
check(fs.statSync(path.join(ROOT, SN.PLAYER_SPRITE_BACK)).size > 500, 'back-facing idle sprite has non-trivial size');
check(typeof SN.setHeading === 'function', 'shipped setHeading is callable');
check(SN.headingFromKey('ArrowUp') === 'back', 'ArrowUp means facing away from the camera');
check(SN.headingFromKey('ArrowDown') === 'front', 'ArrowDown means facing the camera');
check(SN.headingFromDelta(-8) === 'back', 'moving up the map (toward the inn) faces away from the camera');
check(SN.headingFromDelta(8) === 'front', 'moving down the map faces the camera');
check(SN.walkDirFromKey('w') === 'ArrowUp', 'W walks away from the camera');
check(levelHtml.indexOf('headingFromMove') >= 0, 'level turns the ninja from actual walk-away movement');

const backFrames = SN.WALK_FRAMES_BACK;
check(Array.isArray(backFrames) && backFrames.length >= 4, 'back walk-cycle frame list is exported');
backFrames.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' back walk frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' back walk frame has non-trivial size');
  check(logicSrc.indexOf(src) >= 0, src + ' is referenced by shipped logic');
});

const animAwayIdle = SN.createAnimState();
SN.setHeading(animAwayIdle, 'back');
check(SN.playerSpriteForAnim(animAwayIdle) === SN.WALK_FRAMES_BACK[0], 'idle facing away uses a back walk-cycle frame');
const animAwayMove = SN.createAnimState();
SN.setHeading(animAwayMove, 'back');
for (tick = 0; tick < 24; tick++) SN.tickWalk(animAwayMove, true, 16);
const awaySprite = SN.playerSpriteForAnim(animAwayMove);
check(backFrames.indexOf(awaySprite) >= 0, 'walking away uses a back-facing walk frame');
check(walkFrames.indexOf(awaySprite) < 0, 'walking away does not use a front walk frame');

check(SN.PLAYER_SPRITE_SIDE === 'assets/sigma-ninja/player-level-1-side.png', 'side-facing idle sprite path is exported');
check(fs.existsSync(path.join(ROOT, SN.PLAYER_SPRITE_SIDE)), 'side-facing idle sprite exists');
check(fs.statSync(path.join(ROOT, SN.PLAYER_SPRITE_SIDE)).size > 500, 'side-facing idle sprite has non-trivial size');
check(SN.headingFromKey('ArrowLeft') === 'side', 'ArrowLeft means a side heading');
check(SN.headingFromKey('ArrowRight') === 'side', 'ArrowRight means a side heading');
check(SN.headingFromMove(12, 0) === 'side', 'moving right uses the side heading');
check(SN.headingFromMove(-12, 0) === 'side', 'moving left uses the side heading');
check(SN.facingFromDelta(12) === 1, 'moving right faces right');
check(SN.facingFromDelta(-12) === -1, 'moving left faces left');
check(SN.headingFromMove(0, -8) === 'back', 'pure up still faces away');
check(levelHtml.indexOf('headingFromMove') >= 0, 'level turns sideways from actual left/right movement');
check(levelHtml.indexOf('scaleX(-1)') >= 0, 'left-facing side walk is a horizontal flip of the right profile');

const sideFrames = SN.WALK_FRAMES_SIDE;
check(Array.isArray(sideFrames) && sideFrames.length >= 4, 'side walk-cycle frame list is exported');
sideFrames.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' side walk frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' side walk frame has non-trivial size');
  check(logicSrc.indexOf(src) >= 0, src + ' is referenced by shipped logic');
});

const animSideIdle = SN.createAnimState();
SN.setHeading(animSideIdle, 'side');
check(SN.playerSpriteForAnim(animSideIdle) === SN.WALK_FRAMES_SIDE[0], 'idle facing sideways uses a side walk-cycle frame');
const animSideMove = SN.createAnimState();
SN.setHeading(animSideMove, 'side');
for (tick = 0; tick < 24; tick++) SN.tickWalk(animSideMove, true, 16);
const sideSprite = SN.playerSpriteForAnim(animSideMove);
check(sideFrames.indexOf(sideSprite) >= 0, 'walking sideways uses a side walk frame');
check(walkFrames.indexOf(sideSprite) < 0, 'walking sideways does not use a front walk frame');
check(backFrames.indexOf(sideSprite) < 0, 'walking sideways does not use a back walk frame');

const openGround = { x: 400, z: 400 };
check(!SN.hitsBuilding(openGround), 'open ground at (400,400) is not inside a building AABB');
const steppedOpen = SN.applyArrowKey(openGround, 'ArrowRight');
check(steppedOpen.x > openGround.x && steppedOpen.z === openGround.z, 'a step in open ground still moves');

const inn = landmarks.filter(function (lm) { return lm.kind === 'inn'; })[0];
check(!!inn, 'inn landmark exists for collision probe');
const innBox = SN.buildingHitbox(inn);
const fromSouth = {
  x: inn.x,
  z: innBox.maxZ + PLAYER_HIT_PAD()
};
function PLAYER_HIT_PAD() {
  return SN.PLAYER_HIT_W / 2 + 2;
}
check(!SN.hitsBuilding(fromSouth), 'player standing just south of the inn is outside the AABB');
const intoInn = SN.applyArrowKey(fromSouth, 'ArrowUp', 18);
check(intoInn.x === fromSouth.x && intoInn.z === fromSouth.z, 'a step that would enter a building AABB is rejected');

const house = landmarks.filter(function (lm) { return lm.kind === 'house'; })[0];
const houseBox = SN.buildingHitbox(house);
const fromEast = { x: houseBox.maxX + PLAYER_HIT_PAD(), z: house.z };
check(!SN.hitsBuilding(fromEast), 'player standing just east of a house is outside the AABB');
const intoHouse = SN.applyArrowKey(fromEast, 'ArrowLeft', 18);
check(intoHouse.x === fromEast.x && intoHouse.z === fromEast.z, 'a step into a house AABB is rejected');

const enemies = SN.ENEMIES;
check(Array.isArray(enemies) && enemies.length >= 1, 'layout includes one enemy');
const enemySpec = enemies[0];
check(enemySpec.kind === 'enemy', 'enemy kind is enemy');
check(typeof enemySpec.src === 'string', 'enemy has a sprite path');
check(fs.existsSync(path.join(ROOT, enemySpec.src)), 'enemy sprite exists on disk');
check(fs.statSync(path.join(ROOT, enemySpec.src)).size > 500, 'enemy sprite has non-trivial size');
check(logicSrc.indexOf(enemySpec.src) >= 0, 'enemy sprite is referenced by shipped logic');
check(fs.existsSync(path.join(ROOT, 'assets', 'sigma-ninja', 'concept', 'Enemy Level 1.jpg')), 'Enemy Level 1 concept art is in the repo');

function pngSize(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
const idleSize = pngSize(SN.PLAYER_SPRITE);
const walkSize = pngSize(SN.WALK_FRAMES[0]);
const sideIdleSize = pngSize(SN.PLAYER_SPRITE_SIDE);
const sideWalkSize = pngSize(SN.WALK_FRAMES_SIDE[0]);
check(idleSize.w === walkSize.w && idleSize.h === walkSize.h, 'idle and walk canvases share the same pixel size');
check(sideIdleSize.w === sideWalkSize.w && sideIdleSize.h === sideWalkSize.h, 'side idle and side walk canvases share the same pixel size');
check(idleSize.w === sideIdleSize.w && idleSize.h === sideIdleSize.h, 'front and side player canvases share the same pixel size');

SN.ENEMY_WALK_FRAMES.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' enemy walk frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' has non-trivial size');
});
SN.ENEMY_ATTACK_FRAMES.forEach(function (src) {
  check(fs.existsSync(path.join(ROOT, src)), src + ' enemy attack frame exists');
  check(fs.statSync(path.join(ROOT, src)).size > 500, src + ' has non-trivial size');
});
const eIdle = pngSize(SN.ENEMY_SPRITE);
const eWalk = pngSize(SN.ENEMY_WALK_FRAMES[0]);
check(eIdle.w === eWalk.w && eIdle.h === eWalk.h, 'enemy idle and walk canvases share the same pixel size');

const startP = SN.createPlayer();
const startE = SN.createEnemy();
const startDist = Math.hypot(startP.x - startE.x, startP.z - startE.z);
check(startDist < 280, 'scout starts in the opening plaza with the player');

const patrol = SN.createSession();
patrol.player.x = 200;
patrol.player.z = 720;
const ex0 = patrol.enemy.x;
const ez0 = patrol.enemy.z;
let ti;
for (ti = 0; ti < 180; ti++) SN.tickEnemy(patrol, 16);
check(patrol.enemy.x !== ex0 || patrol.enemy.z !== ez0, 'enemy slowly patrols the village when the player is far');
check(patrol.player.hp === SN.PLAYER_MAX_HP, 'a distant patrol does not damage the player');

const fight = SN.createSession();
fight.player.x = fight.enemy.x;
fight.player.z = fight.enemy.z;
check(fight.player.hp === 6, 'player starts with 6 health');
for (ti = 0; ti < 9000; ti += 16) SN.tickEnemy(fight, 16);
check(fight.player.hp === 0, 'six enemy hits drain player health to zero');
check(fight.gameOver === true, 'zero health trips game over');

const mid = SN.createSession();
mid.player.x = mid.enemy.x;
mid.player.z = mid.enemy.z;
SN.tickEnemy(mid, 400);
SN.tickEnemy(mid, 16);
check(mid.player.hp === SN.PLAYER_MAX_HP - 1, 'the first close-range strike removes one pip');
check(mid.gameOver === false, 'one hit is not game over');
check(mid.player.hurtTime > 0, 'a hit starts the player hurt timer');

const pBox = SN.playerHitbox({ x: 100, z: 100 });
const eBox = SN.enemyHitbox({ x: 100, z: 100 });
check(pBox.minX === eBox.minX && pBox.maxX === eBox.maxX, 'player and enemy hitboxes share the same width');
check(pBox.minZ === eBox.minZ && pBox.maxZ === eBox.maxZ, 'player and enemy hitboxes share the same depth');

const kb = SN.createSession();
kb.player.x = 400;
kb.player.z = 400;
SN.takeDamage(kb, 1, { x: 360, z: 400 });
check(kb.player.x > 400, 'a hit knocks the player away from the attacker');
check(kb.player.hurtTime > 0, 'knockback hit also flashes the hurt timer');
check(levelHtml.indexOf('is-hurt') >= 0, 'level paints a red hurt flash on the player');

check(levelHtml.indexOf('sn-hp') >= 0, 'level draws a player health bar');
check(levelHtml.indexOf('game-over') >= 0, 'level includes a game over overlay');
check(levelHtml.indexOf('tickEnemy') >= 0, 'level ticks enemy patrol and attacks');
check(levelHtml.indexOf('sn-pad') >= 0, 'level includes on-screen walk buttons');
check(levelHtml.indexOf('placeBillboard') >= 0, 'player is a ground billboard in the village');
check(levelHtml.indexOf('restartGame') >= 0, 'level can restart after game over');

const liveEnemy = SN.createEnemy();
const overlappingPlayer = { x: liveEnemy.x, z: liveEnemy.z };
const animHit = SN.createAnimState();
SN.handleSpaceBar(overlappingPlayer, liveEnemy, animHit);
check(liveEnemy.dead === true, 'space-bar attack overlapping the enemy kills it');
check(animHit.attacking === true, 'space bar starts the attack animation state');

const missedEnemy = SN.createEnemy();
const farPlayer = { x: liveEnemy.x + 400, z: liveEnemy.z + 400 };
const animMiss = SN.createAnimState();
SN.handleSpaceBar(farPlayer, missedEnemy, animMiss);
check(missedEnemy.dead === false, 'space-bar attack with the enemy out of range leaves it alive');
check(animMiss.attacking === true, 'a miss still plays the attack animation');

const chooseSrc = extractFunction(logicSrc, 'choose');
check(chooseSrc.indexOf('STORY_NODES') >= 0, 'extracted choose reads STORY_NODES');

const letter = SN.choose('inn_door', 'read_letter');
const mountain = SN.choose('inn_door', 'follow_path');
check(!!letter && !!mountain, 'inn_door accepts two choices');
check(letter.id !== mountain.id, 'distinct choices from inn_door yield different next-node ids');
check(letter.text !== mountain.text, 'distinct choices from inn_door yield different story text');
check(letter.id === 'letter_path', 'read_letter branches to letter_path');
check(mountain.id === 'mountain_path', 'follow_path branches to mountain_path');

const start = SN.getStoryNode('square');
check(!!start && start.choices && start.choices.length >= 2, 'opening node has two or more choices');

if (failed) {
  console.error('FAILED ' + failed);
  process.exit(1);
}
console.log('ALL SIGMA NINJA CHECKS PASSED');
