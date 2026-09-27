/**
 * Sigma Ninja — first-level village: ground-plane movement, landmarks, CYOA graph.
 * Classic script (no modules) so file:// and Node vm both work.
 */
(function (root) {
  'use strict';

  var PLAYER_SPRITE = 'assets/sigma-ninja/player-level-1.png';
  var PLAYER_SPRITE_BACK = 'assets/sigma-ninja/player-level-1-back.png';
  var PLAYER_SPRITE_SIDE = 'assets/sigma-ninja/player-level-1-side.png';
  var GROUND_TEXTURE = 'assets/sigma-ninja/ground.jpg';
  var SKY_TEXTURE = 'assets/sigma-ninja/sky.jpg';
  var HILLS_TEXTURE = 'assets/sigma-ninja/hills.jpg';
  var INN_INTERIOR = 'assets/sigma-ninja/inn-interior.jpg';
  var INN_WALL = 'assets/sigma-ninja/inn-wall.jpg';
  var INN_FLOOR = 'assets/sigma-ninja/inn-floor.jpg';
  var STEP = 8;
  var MOVE_SPEED = 140;
  var PLAYER_SIZE = { w: 88, h: 132 };
  var PLAYER_MAX_HP = 6;
  var CHAR_HIT_W = 32;
  var CHAR_HIT_D = 28;
  var PLAYER_HIT_W = CHAR_HIT_W;
  var PLAYER_HIT_D = CHAR_HIT_D;
  var MELEE_REACH = 14;
  var HURT_MS = 240;
  var KNOCKBACK = 28;
  var ENEMY_SIZE = { w: 78, h: 100 };
  var ENEMY_SPEED = 64;
  var ENEMY_AGGRO_RANGE = 240;
  var ENEMY_ATTACK_RANGE = 70;
  var ENEMY_ATTACK_COOLDOWN_MS = 1100;
  var ENEMY_ATTACK_HIT_FRAME = 3;
  var VIEWPORT = { w: 960, h: 520 };
  var WORLD = { w: 1920, h: 900 };
  var BOUNDS = { minX: 80, maxX: 1840, minZ: 80, maxZ: 780 };
  var INN_WORLD = { w: 960, h: 520 };
  var INN_BOUNDS = { minX: 190, maxX: 770, minZ: 210, maxZ: 350 };
  var INN_SPAWN = { x: 480, z: 328 };
  var WALK_FRAME_MS = 120;
  var ATTACK_FRAME_MS = 70;
  var ATTACK_RANGE = 72;

  var WALK_FRAMES = [
    'assets/sigma-ninja/player-walk-04.png',
    'assets/sigma-ninja/player-walk-05.png',
    'assets/sigma-ninja/player-walk-06.png',
    'assets/sigma-ninja/player-walk-07.png',
    'assets/sigma-ninja/player-walk-08.png',
    'assets/sigma-ninja/player-walk-01.png',
    'assets/sigma-ninja/player-walk-02.png',
    'assets/sigma-ninja/player-walk-03.png'
  ];

  var WALK_FRAMES_BACK = [
    'assets/sigma-ninja/player-walk-back-01.png',
    'assets/sigma-ninja/player-walk-back-02.png',
    'assets/sigma-ninja/player-walk-back-03.png',
    'assets/sigma-ninja/player-walk-back-04.png',
    'assets/sigma-ninja/player-walk-back-05.png',
    'assets/sigma-ninja/player-walk-back-06.png',
    'assets/sigma-ninja/player-walk-back-07.png',
    'assets/sigma-ninja/player-walk-back-08.png'
  ];

  var WALK_FRAMES_SIDE = [
    'assets/sigma-ninja/player-walk-side-01.png',
    'assets/sigma-ninja/player-walk-side-02.png',
    'assets/sigma-ninja/player-walk-side-03.png',
    'assets/sigma-ninja/player-walk-side-04.png',
    'assets/sigma-ninja/player-walk-side-05.png',
    'assets/sigma-ninja/player-walk-side-06.png',
    'assets/sigma-ninja/player-walk-side-07.png',
    'assets/sigma-ninja/player-walk-side-08.png'
  ];

  var ATTACK_FRAMES = [
    'assets/sigma-ninja/player-attack-01.png',
    'assets/sigma-ninja/player-attack-02.png',
    'assets/sigma-ninja/player-attack-03.png',
    'assets/sigma-ninja/player-attack-04.png',
    'assets/sigma-ninja/player-attack-05.png',
    'assets/sigma-ninja/player-attack-06.png'
  ];

  var ENEMY_SPRITE = 'assets/sigma-ninja/enemy-level-1.png';
  var ENEMY_WALK_FRAMES = [
    'assets/sigma-ninja/enemy-walk-01.png',
    'assets/sigma-ninja/enemy-walk-02.png',
    'assets/sigma-ninja/enemy-walk-03.png',
    'assets/sigma-ninja/enemy-walk-04.png',
    'assets/sigma-ninja/enemy-walk-05.png',
    'assets/sigma-ninja/enemy-walk-06.png',
    'assets/sigma-ninja/enemy-walk-07.png',
    'assets/sigma-ninja/enemy-walk-08.png'
  ];
  var ENEMY_ATTACK_FRAMES = [
    'assets/sigma-ninja/enemy-attack-01.png',
    'assets/sigma-ninja/enemy-attack-02.png',
    'assets/sigma-ninja/enemy-attack-03.png',
    'assets/sigma-ninja/enemy-attack-04.png',
    'assets/sigma-ninja/enemy-attack-05.png',
    'assets/sigma-ninja/enemy-attack-06.png'
  ];
  var ENEMY_PATROL = [
    { x: 1080, z: 410 },
    { x: 1180, z: 380 },
    { x: 1000, z: 440 },
    { x: 880, z: 400 },
    { x: 1120, z: 350 }
  ];

  var VILLAGE_LANDMARKS = [
    {
      id: 'inn',
      kind: 'inn',
      name: 'Village Inn',
      x: 960,
      z: 170,
      w: 400,
      h: 310,
      footW: 280,
      footD: 90,
      src: 'assets/sigma-ninja/inn.png'
    },
    {
      id: 'house-west',
      kind: 'house',
      name: 'West House',
      x: 200,
      z: 430,
      w: 240,
      h: 240,
      footW: 160,
      footD: 80,
      src: 'assets/sigma-ninja/house.png'
    },
    {
      id: 'house-east',
      kind: 'house',
      name: 'East House',
      x: 1680,
      z: 410,
      w: 230,
      h: 250,
      footW: 150,
      footD: 80,
      src: 'assets/sigma-ninja/house-2.png'
    },
    {
      id: 'house-south',
      kind: 'house',
      name: 'South House',
      x: 360,
      z: 680,
      w: 240,
      h: 240,
      footW: 160,
      footD: 80,
      src: 'assets/sigma-ninja/house.png'
    },
    {
      id: 'shop',
      kind: 'shop',
      name: 'Tea Shop',
      x: 620,
      z: 300,
      w: 220,
      h: 210,
      footW: 150,
      footD: 80,
      src: 'assets/sigma-ninja/house-shop.png'
    },
    {
      id: 'shrine',
      kind: 'shrine',
      name: 'Village Shrine',
      x: 1280,
      z: 250,
      w: 200,
      h: 210,
      footW: 140,
      footD: 80,
      src: 'assets/sigma-ninja/house-shrine.png'
    },
    {
      id: 'house-town',
      kind: 'house',
      name: 'Town House',
      x: 1520,
      z: 620,
      w: 220,
      h: 250,
      footW: 150,
      footD: 80,
      src: 'assets/sigma-ninja/house-town.png'
    },
    {
      id: 'house-southeast',
      kind: 'house',
      name: 'Southeast House',
      x: 1760,
      z: 700,
      w: 230,
      h: 240,
      footW: 150,
      footD: 80,
      src: 'assets/sigma-ninja/house-2.png'
    },
    {
      id: 'lantern-west',
      kind: 'lantern',
      name: 'West lantern',
      x: 720,
      z: 360,
      w: 78,
      h: 130,
      src: 'assets/sigma-ninja/decor-lantern.png'
    },
    {
      id: 'lantern-east',
      kind: 'lantern',
      name: 'East lantern',
      x: 1220,
      z: 300,
      w: 78,
      h: 130,
      src: 'assets/sigma-ninja/decor-lantern.png'
    },
    {
      id: 'bamboo',
      kind: 'bamboo',
      name: 'Bamboo grove',
      x: 1540,
      z: 620,
      w: 100,
      h: 190,
      src: 'assets/sigma-ninja/decor-bamboo.png'
    },
    {
      id: 'well',
      kind: 'well',
      name: 'Village well',
      x: 800,
      z: 450,
      w: 130,
      h: 130,
      src: 'assets/sigma-ninja/decor-well.png'
    },
    {
      id: 'tree',
      kind: 'tree',
      name: 'Pine',
      x: 140,
      z: 620,
      w: 150,
      h: 230,
      src: 'assets/sigma-ninja/decor-tree.png'
    },
    {
      id: 'cart',
      kind: 'cart',
      name: 'Handcart',
      x: 1400,
      z: 700,
      w: 150,
      h: 110,
      src: 'assets/sigma-ninja/decor-cart.png'
    }
  ];

  var INN_FURNITURE = [
    {
      id: 'counter',
      kind: 'counter',
      name: 'Inn counter',
      x: 480,
      z: 228,
      w: 340,
      h: 150,
      footW: 280,
      footD: 48,
      src: 'assets/sigma-ninja/inn-counter.png'
    },
    {
      id: 'table-left',
      kind: 'table',
      name: 'Table',
      x: 260,
      z: 318,
      w: 150,
      h: 100,
      footW: 120,
      footD: 70,
      src: 'assets/sigma-ninja/inn-table.png'
    },
    {
      id: 'table-right',
      kind: 'table',
      name: 'Table',
      x: 700,
      z: 328,
      w: 150,
      h: 100,
      footW: 120,
      footD: 70,
      src: 'assets/sigma-ninja/inn-table.png'
    }
  ];

  var INN_NPCS = [
    {
      id: 'bartender',
      kind: 'npc',
      name: 'Bartender',
      x: 678,
      z: 222,
      w: 86,
      h: 156,
      src: 'assets/sigma-ninja/npc-bartender.png'
    }
  ];

  var ENEMIES = [
    {
      id: 'scout',
      kind: 'enemy',
      name: 'Red Sigma Scout',
      x: 1048,
      z: 392,
      w: 78,
      h: 100,
      src: 'assets/sigma-ninja/enemy-level-1.png',
      dead: false
    }
  ];

  var STORY_NODES = {
    square: {
      id: 'square',
      title: 'Village square',
      text: 'Sumi the blue Sigma ninja steps onto packed earth at dawn. Tiled roofs catch the first light. An inn waits at the far end of the square; timber houses line the lanes. Villagers whisper that the red samurai Zigma passed through at midnight.',
      choices: [
        { id: 'to_inn', label: 'Walk to the inn and ask the keeper', mission: { id: 'enter_inn', title: 'Enter the inn' } },
        { id: 'to_houses', label: 'Knock on a neighbor\'s door', next: 'house_door' }
      ]
    },
    inn_door: {
      id: 'inn_door',
      title: 'The inn',
      text: 'Lanterns warm the veranda. The innkeeper wipes a cup and studies the Σ on your headband. "Travelers pay in stories," she says. "The red samurai took the mountain path at midnight. He left a sealed letter for anyone wearing blue."',
      choices: [
        { id: 'read_letter', label: 'Open the sealed letter', next: 'letter_path' },
        { id: 'follow_path', label: 'Skip the letter and follow the mountain path', next: 'mountain_path' }
      ]
    },
    house_door: {
      id: 'house_door',
      title: 'A timber house',
      text: 'An old cook opens the moon-window house. "If you hunt the red one, eat first. He buys silence with silver. The innkeeper still holds his letter — unless you would rather cut through the bamboo and guess the trail."',
      choices: [
        { id: 'go_inn', label: 'Thank her and go to the inn', mission: { id: 'enter_inn', title: 'Enter the inn' } },
        { id: 'cut_bamboo', label: 'Slip through the bamboo without the letter', next: 'mountain_path' }
      ]
    },
    letter_path: {
      id: 'letter_path',
      title: 'The sealed letter',
      text: 'The letter is a single line in red ink: "Meet me where the lanterns end, Sumi. Bring the village\'s trust or bring your sword." The innkeeper nods you toward the high path. You leave with the village watching — they chose to trust the blue ninja.',
      choices: []
    },
    inn_inside: {
      id: 'inn_inside',
      title: 'Inside the inn',
      text: 'Lantern light pools on the wooden floor. The bartender waits behind the counter. Walk up and press E to talk. The door back to the square is behind you.',
      choices: []
    },
    mountain_path: {
      id: 'mountain_path',
      title: 'The mountain path',
      text: 'You take the dark trail without the letter. Bamboo closes behind you. Somewhere ahead a red helmet waits, and the village will only hear what happens if you return. Two roads from the same square; this one is the silent one.',
      choices: []
    }
  };

  function createPlayer(x, z) {
    return {
      x: x == null ? 960 : x,
      z: z == null ? 360 : z,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      hurtTime: 0
    };
  }

  function createEnemy(spec) {
    spec = spec || ENEMIES[0];
    return {
      id: spec.id,
      kind: spec.kind,
      name: spec.name,
      x: spec.x,
      z: spec.z,
      w: spec.w == null ? ENEMY_SIZE.w : spec.w,
      h: spec.h == null ? ENEMY_SIZE.h : spec.h,
      src: spec.src || ENEMY_SPRITE,
      dead: false,
      anim: createAnimState(),
      waypointIndex: 0,
      attackCooldown: 0,
      pendingHit: false
    };
  }

  function createAnimState() {
    return {
      walkTime: 0,
      walkFrame: 0,
      moving: false,
      attacking: false,
      attackTime: 0,
      attackFrame: 0,
      facing: 1,
      heading: 'front'
    };
  }

  function setHeading(anim, heading) {
    if (heading === 'back' || heading === 'side') anim.heading = heading;
    else anim.heading = 'front';
    return anim.heading;
  }

  function headingFromKey(key) {
    if (key === 'ArrowUp') return 'back';
    if (key === 'ArrowDown') return 'front';
    if (key === 'ArrowLeft' || key === 'ArrowRight') return 'side';
    return null;
  }

  function headingFromDelta(dz) {
    if (dz < 0) return 'back';
    if (dz > 0) return 'front';
    return null;
  }

  function headingFromMove(dx, dz) {
    var adx = dx < 0 ? -dx : dx;
    var adz = dz < 0 ? -dz : dz;
    if (adx > 0 && adx >= adz) return 'side';
    if (dz < 0) return 'back';
    if (dz > 0) return 'front';
    return null;
  }

  function facingFromDelta(dx) {
    if (dx > 0) return 1;
    if (dx < 0) return -1;
    return 0;
  }

  function walkDirFromKey(key) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 'ArrowLeft';
    if (key === 'ArrowRight' || key === 'd' || key === 'D') return 'ArrowRight';
    if (key === 'ArrowUp' || key === 'w' || key === 'W') return 'ArrowUp';
    if (key === 'ArrowDown' || key === 's' || key === 'S') return 'ArrowDown';
    return null;
  }

  function clamp(n, lo, hi) {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }

  function aabbOverlap(a, b) {
    return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
  }

  function isSolidLandmark(lm) {
    if (!lm) return false;
    return lm.kind === 'house' || lm.kind === 'inn' || lm.kind === 'shop' || lm.kind === 'shrine' || lm.kind === 'counter' || lm.kind === 'table';
  }

  function buildingHitbox(lm) {
    var fw = lm.footW != null ? lm.footW : Math.round(lm.w * 0.5);
    var fd = lm.footD != null ? lm.footD : 70;
    return {
      minX: lm.x - fw / 2,
      maxX: lm.x + fw / 2,
      minZ: lm.z - fd * 0.4,
      maxZ: lm.z + fd * 0.6
    };
  }

  function actorHitbox(pos, pad) {
    pad = pad == null ? 0 : pad;
    var hw = CHAR_HIT_W / 2 + pad;
    var hd = CHAR_HIT_D / 2 + pad;
    return {
      minX: pos.x - hw,
      maxX: pos.x + hw,
      minZ: pos.z - hd,
      maxZ: pos.z + hd
    };
  }

  function playerHitbox(pos) {
    return actorHitbox(pos);
  }

  function hitsBuilding(pos, landmarks) {
    landmarks = landmarks || VILLAGE_LANDMARKS;
    var ph = playerHitbox(pos);
    var i;
    for (i = 0; i < landmarks.length; i++) {
      var lm = landmarks[i];
      if (!isSolidLandmark(lm)) continue;
      if (aabbOverlap(ph, buildingHitbox(lm))) return true;
    }
    return false;
  }

  function applyArrowKey(state, key, step, bounds, obstacles) {
    step = step == null ? STEP : step;
    bounds = bounds || BOUNDS;
    var x = state.x;
    var z = state.z;
    if (key === 'ArrowLeft') x -= step;
    else if (key === 'ArrowRight') x += step;
    else if (key === 'ArrowUp') z -= step;
    else if (key === 'ArrowDown') z += step;
    else return { x: state.x, z: state.z };
    x = clamp(x, bounds.minX, bounds.maxX);
    z = clamp(z, bounds.minZ, bounds.maxZ);
    if (!obstacles && typeof VILLAGE_LANDMARKS !== 'undefined') {
      obstacles = VILLAGE_LANDMARKS;
    }
    if (obstacles && typeof hitsBuilding === 'function' && hitsBuilding({ x: x, z: z }, obstacles)) {
      return { x: state.x, z: state.z };
    }
    return { x: x, z: z };
  }

  function cameraOffset(player, viewport, world) {
    viewport = viewport || VIEWPORT;
    world = world || WORLD;
    var maxX = Math.max(0, world.w - viewport.w);
    var maxZ = Math.max(0, world.h - viewport.h);
    if (maxX === 0 && maxZ === 0) return { x: 0, z: 0 };
    return {
      x: clamp(player.x - viewport.w / 2, 0, maxX),
      z: clamp(player.z - 320, 0, maxZ)
    };
  }

  function tickWalk(anim, moving, dt) {
    dt = dt == null ? 16 : dt;
    anim.moving = !!moving;
    if (anim.attacking) return anim.walkFrame;
    if (!moving) return anim.walkFrame;
    anim.walkTime += dt;
    anim.walkFrame = Math.floor(anim.walkTime / WALK_FRAME_MS) % WALK_FRAMES.length;
    return anim.walkFrame;
  }

  function startAttack(anim) {
    anim.attacking = true;
    anim.attackTime = 0;
    anim.attackFrame = 0;
    return anim;
  }

  function tickAttack(anim, dt, frameCount) {
    dt = dt == null ? 16 : dt;
    frameCount = frameCount == null ? ATTACK_FRAMES.length : frameCount;
    if (!anim.attacking) return anim.attackFrame;
    anim.attackTime += dt;
    var idx = Math.floor(anim.attackTime / ATTACK_FRAME_MS);
    if (idx >= frameCount) {
      anim.attacking = false;
      anim.attackTime = 0;
      anim.attackFrame = 0;
      return 0;
    }
    anim.attackFrame = idx;
    return anim.attackFrame;
  }

  function walkFramesForHeading(heading) {
    if (heading === 'back') return WALK_FRAMES_BACK;
    if (heading === 'side') return WALK_FRAMES_SIDE;
    return WALK_FRAMES;
  }

  function idleSpriteForHeading(heading) {
    var frames = walkFramesForHeading(heading);
    return frames[0];
  }

  function playerSpriteForAnim(anim) {
    var heading = anim && anim.heading;
    if (anim && anim.attacking) {
      var ai = anim.attackFrame;
      if (ai < 0) ai = 0;
      if (ai >= ATTACK_FRAMES.length) ai = ATTACK_FRAMES.length - 1;
      return ATTACK_FRAMES[ai];
    }
    var frames = walkFramesForHeading(heading);
    var wi = anim && anim.walkFrame ? anim.walkFrame % frames.length : 0;
    if (wi < 0) wi = 0;
    return frames[wi];
  }

  function enemyHitbox(enemy) {
    return actorHitbox(enemy);
  }

  function attackVolume(player) {
    return actorHitbox(player, MELEE_REACH);
  }

  function inMeleeRange(a, b) {
    if (!a || !b) return false;
    return aabbOverlap(actorHitbox(a, MELEE_REACH), actorHitbox(b));
  }

  function attackOverlapsEnemy(player, enemy) {
    if (!player || !enemy) return false;
    return inMeleeRange(player, enemy);
  }

  function resolveAttack(player, enemy) {
    if (!enemy || enemy.dead) return enemy;
    if (attackOverlapsEnemy(player, enemy)) {
      enemy.dead = true;
    }
    return enemy;
  }

  function handleSpaceBar(player, enemy, anim) {
    if (anim) startAttack(anim);
    resolveAttack(player, enemy);
    return enemy;
  }

  function dist2(a, b) {
    var dx = a.x - b.x;
    var dz = a.z - b.z;
    return dx * dx + dz * dz;
  }

  function applyKnockback(session, from, dist) {
    var p = session && session.player;
    if (!p || !from) return p;
    dist = dist == null ? KNOCKBACK : dist;
    var dx = p.x - from.x;
    var dz = p.z - from.z;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 0.001) {
      dx = 0;
      dz = 1;
      d = 1;
    }
    var bounds = sceneBounds(session.scene);
    var obstacles = sceneObstacles(session.scene);
    var nx = clamp(p.x + (dx / d) * dist, bounds.minX, bounds.maxX);
    var nz = clamp(p.z + (dz / d) * dist, bounds.minZ, bounds.maxZ);
    if (!hitsBuilding({ x: nx, z: nz }, obstacles)) {
      p.x = nx;
      p.z = nz;
      return p;
    }
    if (!hitsBuilding({ x: nx, z: p.z }, obstacles)) {
      p.x = nx;
      return p;
    }
    if (!hitsBuilding({ x: p.x, z: nz }, obstacles)) {
      p.z = nz;
    }
    return p;
  }

  function takeDamage(session, amount, from) {
    if (!session || session.gameOver) return 0;
    var p = session.player;
    if (!p) return 0;
    if (p.hurtTime > 0) return p.hp;
    amount = amount == null ? 1 : amount;
    p.hp = Math.max(0, (p.hp == null ? PLAYER_MAX_HP : p.hp) - amount);
    p.hurtTime = HURT_MS;
    if (from) applyKnockback(session, from);
    if (p.hp <= 0) session.gameOver = true;
    return p.hp;
  }

  function tickHurt(session, dt) {
    if (!session || !session.player) return 0;
    dt = dt == null ? 16 : dt;
    if (session.player.hurtTime > 0) {
      session.player.hurtTime -= dt;
      if (session.player.hurtTime < 0) session.player.hurtTime = 0;
    }
    return session.player.hurtTime;
  }

  function moveToward(pos, target, step, bounds, obstacles) {
    var dx = target.x - pos.x;
    var dz = target.z - pos.z;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 6) return { x: pos.x, z: pos.z, arrived: true, dx: 0, dz: 0 };
    var nx = pos.x + (dx / d) * step;
    var nz = pos.z + (dz / d) * step;
    bounds = bounds || BOUNDS;
    nx = clamp(nx, bounds.minX, bounds.maxX);
    nz = clamp(nz, bounds.minZ, bounds.maxZ);
    if (obstacles && hitsBuilding({ x: nx, z: nz }, obstacles)) {
      if (!hitsBuilding({ x: nx, z: pos.z }, obstacles)) {
        return { x: nx, z: pos.z, arrived: false, dx: nx - pos.x, dz: 0 };
      }
      if (!hitsBuilding({ x: pos.x, z: nz }, obstacles)) {
        return { x: pos.x, z: nz, arrived: false, dx: 0, dz: nz - pos.z };
      }
      return { x: pos.x, z: pos.z, arrived: false, dx: 0, dz: 0 };
    }
    return { x: nx, z: nz, arrived: d <= step + 2, dx: nx - pos.x, dz: nz - pos.z };
  }

  function enemySpriteForAnim(enemy) {
    if (!enemy) return ENEMY_SPRITE;
    var anim = enemy.anim;
    if (anim && anim.attacking) {
      var ai = anim.attackFrame;
      if (ai < 0) ai = 0;
      if (ai >= ENEMY_ATTACK_FRAMES.length) ai = ENEMY_ATTACK_FRAMES.length - 1;
      return ENEMY_ATTACK_FRAMES[ai];
    }
    if (anim && anim.moving) {
      var wi = anim.walkFrame % ENEMY_WALK_FRAMES.length;
      if (wi < 0) wi = 0;
      return ENEMY_WALK_FRAMES[wi];
    }
    return enemy.src || ENEMY_SPRITE;
  }

  function tickEnemy(session, dt) {
    if (!session || !session.enemy) return session && session.enemy;
    var enemy = session.enemy;
    dt = dt == null ? 16 : dt;
    tickHurt(session, dt);
    if (enemy.dead) {
      if (enemy.anim) {
        enemy.anim.moving = false;
        enemy.anim.attacking = false;
      }
      return enemy;
    }
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
    var anim = enemy.anim || (enemy.anim = createAnimState());
    var moving = false;
    var dx = 0;
    var dz = 0;
    var player = session.player;
    var inVillage = session.scene === 'village';
    var canHunt = inVillage && player && !session.gameOver;
    var range2 = ENEMY_AGGRO_RANGE * ENEMY_AGGRO_RANGE;
    var d2 = canHunt ? dist2(enemy, player) : Infinity;
    var step = ENEMY_SPEED * dt / 1000;

    if (canHunt && inMeleeRange(enemy, player)) {
      dx = player.x - enemy.x;
      dz = player.z - enemy.z;
      if (!anim.attacking && enemy.attackCooldown <= 0) {
        startAttack(anim);
        enemy.pendingHit = true;
        enemy.attackCooldown = ENEMY_ATTACK_COOLDOWN_MS;
      }
    } else if (canHunt && d2 <= range2 && !anim.attacking) {
      var chase = moveToward(enemy, player, step, BOUNDS, VILLAGE_LANDMARKS);
      enemy.x = chase.x;
      enemy.z = chase.z;
      dx = chase.dx;
      dz = chase.dz;
      moving = dx !== 0 || dz !== 0;
    } else if (!anim.attacking) {
      if (enemy.waypointIndex == null) enemy.waypointIndex = 0;
      var wp = ENEMY_PATROL[enemy.waypointIndex % ENEMY_PATROL.length];
      var walk = moveToward(enemy, wp, step, BOUNDS, VILLAGE_LANDMARKS);
      enemy.x = walk.x;
      enemy.z = walk.z;
      dx = walk.dx;
      dz = walk.dz;
      moving = dx !== 0 || dz !== 0;
      if (walk.arrived) {
        enemy.waypointIndex = (enemy.waypointIndex + 1) % ENEMY_PATROL.length;
      }
    }

    var face = facingFromDelta(dx);
    if (face) anim.facing = face;
    var head = headingFromMove(dx, dz);
    if (head) setHeading(anim, head);
    tickAttack(anim, dt, ENEMY_ATTACK_FRAMES.length);
    if (enemy.pendingHit && anim.attacking && anim.attackFrame >= ENEMY_ATTACK_HIT_FRAME) {
      enemy.pendingHit = false;
      if (canHunt && inMeleeRange(enemy, player)) takeDamage(session, 1, enemy);
    }
    if (!anim.attacking) enemy.pendingHit = false;
    tickWalk(anim, moving && !anim.attacking, dt);
    return enemy;
  }

  function getStoryNode(id) {
    return STORY_NODES[id] || null;
  }

  function findChoice(nodeId, optionId) {
    var node = STORY_NODES[nodeId];
    if (!node || !node.choices) return null;
    var i;
    for (i = 0; i < node.choices.length; i++) {
      if (node.choices[i].id === optionId) return node.choices[i];
    }
    return null;
  }

  function choose(nodeId, optionId) {
    var choice = findChoice(nodeId, optionId);
    if (!choice || !choice.next) return null;
    return STORY_NODES[choice.next] || null;
  }

  function addMission(session, mission) {
    if (!session || !mission) return null;
    if (!session.missions) session.missions = [];
    var i;
    for (i = 0; i < session.missions.length; i++) {
      if (session.missions[i].id === mission.id) {
        var existing = session.missions[i];
        if (existing.status === 'done') return existing;
        existing.title = mission.title;
        existing.status = 'active';
        session.missions.splice(i, 1);
        session.missions.unshift(existing);
        return existing;
      }
    }
    var row = { id: mission.id, title: mission.title, status: 'active' };
    session.missions.unshift(row);
    return row;
  }

  function completeMission(session, missionId) {
    if (!session || !session.missions) return null;
    var i;
    for (i = 0; i < session.missions.length; i++) {
      if (session.missions[i].id === missionId) {
        session.missions[i].status = 'done';
        return session.missions[i];
      }
    }
    return null;
  }

  function activeMissions(session) {
    if (!session || !session.missions) return [];
    var out = [];
    var i;
    for (i = 0; i < session.missions.length; i++) {
      if (session.missions[i].status === 'active') out.push(session.missions[i]);
    }
    return out;
  }

  function selectChoice(session, optionId) {
    if (!session) return null;
    var nodeId = session.storyId || 'square';
    var choice = findChoice(nodeId, optionId);
    if (!choice) return null;
    if (choice.mission) {
      addMission(session, choice.mission);
      return { type: 'mission', mission: choice.mission, node: getStoryNode(nodeId) };
    }
    if (choice.next) {
      session.storyId = choice.next;
      return { type: 'story', node: getStoryNode(choice.next) };
    }
    return null;
  }

  function createSession() {
    var p = createPlayer();
    return {
      scene: 'village',
      storyId: 'square',
      player: p,
      anim: createAnimState(),
      enemy: createEnemy(),
      savedVillage: { x: p.x, z: p.z },
      missions: [],
      flags: { talkedBartender: false },
      gameOver: false
    };
  }

  function findInn() {
    var i;
    for (i = 0; i < VILLAGE_LANDMARKS.length; i++) {
      if (VILLAGE_LANDMARKS[i].kind === 'inn') return VILLAGE_LANDMARKS[i];
    }
    return null;
  }

  function innDoorZone(inn) {
    inn = inn || findInn();
    var box = buildingHitbox(inn);
    // Doors sit slightly left of sprite center on the inn plate.
    var doorX = inn.x - 24;
    return {
      minX: doorX - 96,
      maxX: doorX + 96,
      minZ: box.maxZ - 14,
      maxZ: box.maxZ + 108
    };
  }

  function innExitZone() {
    return {
      minX: 300,
      maxX: 660,
      minZ: INN_BOUNDS.maxZ - 36,
      maxZ: INN_BOUNDS.maxZ + 8
    };
  }

  function findBartender() {
    var i;
    for (i = 0; i < INN_NPCS.length; i++) {
      if (INN_NPCS[i].id === 'bartender') return INN_NPCS[i];
    }
    return null;
  }

  function findCounter() {
    var i;
    for (i = 0; i < INN_FURNITURE.length; i++) {
      if (INN_FURNITURE[i].id === 'counter') return INN_FURNITURE[i];
    }
    return null;
  }

  function bartenderTalkZone() {
    var bar = findCounter();
    var npc = findBartender();
    var cx = bar ? bar.x : (npc ? npc.x : 480);
    var box = bar ? buildingHitbox(bar) : { maxZ: 250 };
    return {
      minX: cx - 100,
      maxX: cx + 100,
      minZ: box.maxZ,
      maxZ: box.maxZ + 54
    };
  }

  function nearBartender(pos) {
    return pointInZone(pos, bartenderTalkZone());
  }

  function pointInZone(pos, zone) {
    return pos.x >= zone.minX && pos.x <= zone.maxX && pos.z >= zone.minZ && pos.z <= zone.maxZ;
  }

  function nearInnDoor(pos) {
    return pointInZone(pos, innDoorZone());
  }

  function nearInnExit(pos) {
    return pointInZone(pos, innExitZone());
  }

  function sceneBounds(scene) {
    return scene === 'inn' ? INN_BOUNDS : BOUNDS;
  }

  function sceneObstacles(scene) {
    return scene === 'inn' ? INN_FURNITURE : VILLAGE_LANDMARKS;
  }

  function sceneWorld(scene) {
    return scene === 'inn' ? INN_WORLD : WORLD;
  }

  function atInnDoor(session) {
    return !!(session && session.scene === 'village' && nearInnDoor(session.player));
  }

  function atInnExit(session) {
    return !!(session && session.scene === 'inn' && nearInnExit(session.player));
  }

  function interactPrompt(session) {
    if (!session) return null;
    if (session.scene === 'inn') {
      if (nearBartender(session.player)) return { action: 'talk_bartender', label: 'Press E to talk' };
      if (nearInnExit(session.player)) return { action: 'exit', label: 'Press E to leave' };
      return null;
    }
    if (nearInnDoor(session.player)) return { action: 'enter', label: 'Press E to enter' };
    return null;
  }

  function enterInn(session) {
    if (!session || session.scene !== 'village') return false;
    if (!nearInnDoor(session.player)) return false;
    session.savedVillage = { x: session.player.x, z: session.player.z };
    session.scene = 'inn';
    session.player.x = INN_SPAWN.x;
    session.player.z = INN_SPAWN.z;
    completeMission(session, 'enter_inn');
    if (session.flags && session.flags.talkedBartender) session.storyId = 'inn_door';
    else session.storyId = 'inn_inside';
    if (session.anim) {
      session.anim.heading = 'front';
      session.anim.moving = false;
    }
    return true;
  }

  function exitInn(session) {
    if (!session || session.scene !== 'inn') return false;
    session.scene = 'village';
    session.player.x = session.savedVillage.x;
    session.player.z = session.savedVillage.z + 28;
    completeMission(session, 'leave_inn');
    if (session.storyId === 'inn_inside' || session.storyId === 'inn_door') session.storyId = 'square';
    if (session.anim) {
      session.anim.heading = 'front';
      session.anim.moving = false;
    }
    return true;
  }

  function talkBartender(session) {
    if (!session || session.scene !== 'inn') return false;
    if (!nearBartender(session.player)) return false;
    if (!session.flags) session.flags = {};
    session.flags.talkedBartender = true;
    session.storyId = 'inn_door';
    return true;
  }

  function useInteract(session) {
    var prompt = interactPrompt(session);
    if (!prompt) return false;
    if (prompt.action === 'enter') return enterInn(session);
    if (prompt.action === 'exit') return exitInn(session);
    if (prompt.action === 'talk_bartender') return talkBartender(session);
    return false;
  }

  function nearestLandmark(pos, landmarks) {
    landmarks = landmarks || VILLAGE_LANDMARKS;
    var best = null;
    var bestD = Infinity;
    var i;
    for (i = 0; i < landmarks.length; i++) {
      var lm = landmarks[i];
      var dx = pos.x - lm.x;
      var dz = pos.z - lm.z;
      var d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = lm;
      }
    }
    return best;
  }

  var api = {
    PLAYER_SPRITE: PLAYER_SPRITE,
    PLAYER_SPRITE_BACK: PLAYER_SPRITE_BACK,
    PLAYER_SPRITE_SIDE: PLAYER_SPRITE_SIDE,
    GROUND_TEXTURE: GROUND_TEXTURE,
    SKY_TEXTURE: SKY_TEXTURE,
    HILLS_TEXTURE: HILLS_TEXTURE,
    INN_INTERIOR: INN_INTERIOR,
    INN_WALL: INN_WALL,
    INN_FLOOR: INN_FLOOR,
    STEP: STEP,
    MOVE_SPEED: MOVE_SPEED,
    PLAYER_SIZE: PLAYER_SIZE,
    PLAYER_MAX_HP: PLAYER_MAX_HP,
    CHAR_HIT_W: CHAR_HIT_W,
    CHAR_HIT_D: CHAR_HIT_D,
    PLAYER_HIT_W: PLAYER_HIT_W,
    PLAYER_HIT_D: PLAYER_HIT_D,
    HURT_MS: HURT_MS,
    KNOCKBACK: KNOCKBACK,
    ENEMY_SIZE: ENEMY_SIZE,
    ENEMY_SPEED: ENEMY_SPEED,
    ENEMY_AGGRO_RANGE: ENEMY_AGGRO_RANGE,
    ENEMY_ATTACK_RANGE: ENEMY_ATTACK_RANGE,
    VIEWPORT: VIEWPORT,
    WORLD: WORLD,
    BOUNDS: BOUNDS,
    INN_WORLD: INN_WORLD,
    INN_BOUNDS: INN_BOUNDS,
    INN_SPAWN: INN_SPAWN,
    WALK_FRAMES: WALK_FRAMES,
    WALK_FRAMES_BACK: WALK_FRAMES_BACK,
    WALK_FRAMES_SIDE: WALK_FRAMES_SIDE,
    ATTACK_FRAMES: ATTACK_FRAMES,
    ENEMY_SPRITE: ENEMY_SPRITE,
    ENEMY_WALK_FRAMES: ENEMY_WALK_FRAMES,
    ENEMY_ATTACK_FRAMES: ENEMY_ATTACK_FRAMES,
    ENEMY_PATROL: ENEMY_PATROL,
    WALK_FRAME_MS: WALK_FRAME_MS,
    ATTACK_RANGE: ATTACK_RANGE,
    VILLAGE_LANDMARKS: VILLAGE_LANDMARKS,
    INN_FURNITURE: INN_FURNITURE,
    INN_NPCS: INN_NPCS,
    ENEMIES: ENEMIES,
    STORY_NODES: STORY_NODES,
    createPlayer: createPlayer,
    createEnemy: createEnemy,
    createAnimState: createAnimState,
    createSession: createSession,
    applyArrowKey: applyArrowKey,
    cameraOffset: cameraOffset,
    tickWalk: tickWalk,
    setHeading: setHeading,
    headingFromKey: headingFromKey,
    headingFromDelta: headingFromDelta,
    headingFromMove: headingFromMove,
    facingFromDelta: facingFromDelta,
    walkFramesForHeading: walkFramesForHeading,
    walkDirFromKey: walkDirFromKey,
    tickAttack: tickAttack,
    startAttack: startAttack,
    playerSpriteForAnim: playerSpriteForAnim,
    handleSpaceBar: handleSpaceBar,
    takeDamage: takeDamage,
    tickHurt: tickHurt,
    applyKnockback: applyKnockback,
    actorHitbox: actorHitbox,
    playerHitbox: playerHitbox,
    enemyHitbox: enemyHitbox,
    inMeleeRange: inMeleeRange,
    tickEnemy: tickEnemy,
    enemySpriteForAnim: enemySpriteForAnim,
    moveToward: moveToward,
    resolveAttack: resolveAttack,
    attackOverlapsEnemy: attackOverlapsEnemy,
    attackVolume: attackVolume,
    hitsBuilding: hitsBuilding,
    buildingHitbox: buildingHitbox,
    aabbOverlap: aabbOverlap,
    isSolidLandmark: isSolidLandmark,
    getStoryNode: getStoryNode,
    findChoice: findChoice,
    choose: choose,
    selectChoice: selectChoice,
    addMission: addMission,
    completeMission: completeMission,
    activeMissions: activeMissions,
    nearestLandmark: nearestLandmark,
    findInn: findInn,
    innDoorZone: innDoorZone,
    innExitZone: innExitZone,
    nearInnDoor: nearInnDoor,
    nearInnExit: nearInnExit,
    sceneBounds: sceneBounds,
    sceneObstacles: sceneObstacles,
    sceneWorld: sceneWorld,
    atInnDoor: atInnDoor,
    atInnExit: atInnExit,
    interactPrompt: interactPrompt,
    enterInn: enterInn,
    exitInn: exitInn,
    talkBartender: talkBartender,
    nearBartender: nearBartender,
    findBartender: findBartender,
    bartenderTalkZone: bartenderTalkZone,
    useInteract: useInteract
  };

  root.SigmaNinja = api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
