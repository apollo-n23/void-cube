/* Neon Dash Imagine sprite loader. Browser-only; no Node require. */
(function (global) {
  var BASE = 'assets/neon/';
  var images = {};

  function load(key, file) {
    var img = new Image();
    img.src = BASE + file;
    images[key] = img;
  }

  function drawSprite(ctx, key, x, y, w, h) {
    var img = images[key];
    if (!img || !img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img, x, y, w, h);
    return true;
  }

  var THEMES = {
    void: { player: 'player-void.png', hazard: 'hazard-void.png', portal: 'portal-void.png', enemy: 'blob.png', npc: 'octopoop.png', sky: 'sky-void.jpg', plat: 'plat-void.png' },
    octo: { player: 'player-octo.png', hazard: 'hazard-octo.png', portal: 'portal-void.png', enemy: 'blob.png', npc: 'octopoop.png', sky: 'sky-octo.jpg', plat: 'plat-octo.png' },
    industrial: { player: 'player-industrial.png', hazard: 'hazard-industrial.png', portal: 'portal-industrial.png', enemy: 'blob.png', npc: 'octopoop.png', sky: 'sky-industrial.jpg', plat: 'plat-industrial.png' },
    lava: { player: 'player-lava.png', hazard: 'hazard-lava.png', portal: 'portal-lava.png', enemy: 'blob-lava.png', npc: 'octopoop.png', ptero: 'ptero.png', boss: 'boss.png', sky: 'sky-lava.jpg', plat: 'plat-lava.png', build: 'build-lava.png' },
    pink: { player: 'player-pink.png', hazard: 'hazard-pink.png', portal: 'portal-pink.png', enemy: 'blob-pink.png', npc: 'octopoop.png', ptero: 'drone.png', sky: 'sky-pink.jpg', plat: 'plat-pink.png', build: 'build-neon.png', pyramid: 'pyramid-gold.png' },
    water: { player: 'player-water.png', hazard: 'hazard-coral.png', portal: 'portal-water.png', enemy: 'blob-water.png', npc: 'octopoop.png', bubble: 'bubble.png', sky: 'sky-water.jpg', plat: 'plat-water.png', build: 'build-hydro.png', pyramid: 'pyramid-ice.png' }
  };

  var FLUID_BY_THEME = {
    void: 'fluid-water',
    octo: 'fluid-water',
    industrial: 'fluid-acid',
    lava: 'fluid-lava',
    pink: 'fluid-goo',
    water: 'fluid-water'
  };
  var currentFluid = 'fluid-lava';

  function theme(name) {
    var t = THEMES[name] || THEMES.void;
    load('player', t.player);
    load('hazard', t.hazard);
    load('portal', t.portal);
    var portalPrefix = t.portal.replace('.png', '');
    load('enemy', t.enemy);
    load('orb', 'orb.png');
    load('orbGreen', 'orb-green.png');
    load('sky', t.sky);
    load('plat', t.plat);
    load('hud', 'hud-plate.png');
    load('sign', 'world-sign.png');
    load('pickup', 'shield-pickup.png');
    load('shield', 'shield.png');
    load('fluid-lava', 'fluid-lava.png');
    load('fluid-water', 'fluid-water.png');
    load('fluid-goo', 'fluid-goo.png');
    load('fluid-acid', 'fluid-acid.png');
    load('npc', (t.npc) ? t.npc : 'octopoop.png');
    if (t.ptero) load('ptero', t.ptero);
    if (t.boss) load('boss', t.boss);
    if (t.bubble) load('bubble', t.bubble);
    if (t.build) load('build', t.build);
    if (t.pyramid) load('pyramid', t.pyramid);
    currentFluid = FLUID_BY_THEME[name] || 'fluid-lava';
    var shotKinds = ['bolt', 'fire', 'laser', 'slime', 'water', 'acid'];
    var i, k;
    for (k = 0; k < shotKinds.length; k++) {
      load('shot-' + shotKinds[k], 'shot-' + shotKinds[k] + '.png');
    }
    for (i = 1; i <= 8; i++) {
      load('boss' + i, 'boss-0' + i + '.png');
      load('shield' + i, 'shield-0' + i + '.png');
      load('pickup' + i, 'pickup-0' + i + '.png');
      load('portal' + i, portalPrefix + '-0' + i + '.png');
      for (k = 0; k < shotKinds.length; k++) {
        load('shot-' + shotKinds[k] + i, 'shot-' + shotKinds[k] + '-0' + i + '.png');
      }
    }
  }

  function drawSky(ctx, W, H, groundY, scrollX, frame) {
    var img = images.sky;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var drift = ((scrollX * 0.12) + frame * 0.18) % img.naturalWidth;
    if (drift < 0) drift += img.naturalWidth;
    var destH = groundY;
    ctx.drawImage(img, drift, 0, img.naturalWidth - drift, img.naturalHeight, 0, 0, W * (1 - drift / img.naturalWidth), destH);
    if (drift > 2) {
      ctx.drawImage(img, 0, 0, drift, img.naturalHeight, W * (1 - drift / img.naturalWidth), 0, W * (drift / img.naturalWidth), destH);
    }
    return true;
  }

  function drawGround(ctx, W, groundY, H, scrollX) {
    var img = images.plat;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var visH = Math.min(72, H - groundY + 8);
    var tileW = Math.max(96, visH * (img.naturalWidth / img.naturalHeight));
    var step = tileW * 0.86;
    var off = (scrollX * 1.0) % step;
    if (off < 0) off += step;
    var x;
    for (x = -off; x < W + tileW; x += step) {
      ctx.drawImage(img, x, groundY - 4, tileW, visH);
    }
    return true;
  }

  function drawPlatform(ctx, x, y, w, hitH) {
    var img = images.plat;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var visH = Math.max(hitH * 2.6, 18);
    ctx.drawImage(img, x, y - 2, w, visH);
    return true;
  }

  function drawBoss(ctx, x, y, w, h, frame) {
    var idx = (Math.floor(frame / 5) % 8) + 1;
    var img = images['boss' + idx] || images.boss;
    if (!img || !img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img, x, y, w, h);
    return true;
  }

  function drawHudPlate(ctx, W, H) {
    var img = images.hud;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var pw = Math.min(W * 0.84, 720);
    var ph = pw * (img.naturalHeight / img.naturalWidth);
    ctx.drawImage(img, (W - pw) / 2, (H - ph) / 2 - 6, pw, ph);
    return true;
  }

  function drawWorldSign(ctx, x, y, w, h) {
    return drawSprite(ctx, 'sign', x, y, w, h);
  }

  function drawShield(ctx, cx, cy, bw, bh, frame) {
    var idx = (Math.floor(frame / 5) % 8) + 1;
    var img = images['shield' + idx] || images.shield;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var w = bw + 30;
    var h = bh + 36;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    return true;
  }

  function drawPickup(ctx, x, y, size, frame) {
    var idx = (Math.floor(frame / 5) % 8) + 1;
    var img = images['pickup' + idx] || images.pickup;
    if (!img || !img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    return true;
  }

  function drawPortal(ctx, cx, cy, frame) {
    var idx = (Math.floor(frame / 4) % 8) + 1;
    var img = images['portal' + idx] || images.portal;
    if (!img || !img.complete || !img.naturalWidth) return false;
    var w = 72;
    var h = 96;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    var i, ang, rad, twinkle;
    ctx.save();
    for (i = 0; i < 10; i++) {
      ang = frame * 0.09 + i * 0.628;
      rad = 26 + (i % 4) * 7;
      twinkle = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.28 + i * 1.3));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = i % 2 ? '#ffffff' : '#c8ffff';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * (rad * 1.28), 1.1 + twinkle * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  function drawShot(ctx, kind, x, y, frame, w, h, vx, vy) {
    var idx = (Math.floor(frame / 3) % 8) + 1;
    var img = images['shot-' + kind + idx] || images['shot-' + kind];
    if (!img || !img.complete || !img.naturalWidth) return false;
    w = w || 28;
    h = h || 28;
    ctx.save();
    ctx.translate(x, y);
    if (typeof vx === 'number' && typeof vy === 'number' && (vx !== 0 || vy !== 0)) {
      var ang = Math.atan2(vy, vx);
      if (kind === 'laser') ang -= Math.PI / 2;
      ctx.rotate(ang);
    }
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  var SPEECH_FILL = 'rgba(52, 8, 38, 0.94)';
  var SPEECH_STROKE = '#ff79d0';
  var SPEECH_TEXT = '#ffe6f5';

  function roundRectPath(ctx, x, y, w, h, r) {
    if (r > w / 2) r = w / 2;
    if (r > h / 2) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSpeechBubble(ctx, boxX, boxY, boxW, boxH, tailX, tailY, lines) {
    var mid = boxX + boxW / 2;
    ctx.save();
    ctx.fillStyle = SPEECH_FILL;
    ctx.strokeStyle = SPEECH_STROKE;
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mid - 8, boxY + boxH - 1);
    ctx.lineTo(mid + 8, boxY + boxH - 1);
    ctx.lineTo(tailX, tailY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SPEECH_TEXT;
    ctx.font = '11px Segoe UI, Arial';
    ctx.textAlign = 'center';
    var i;
    var n = lines && lines.length ? lines.length : 0;
    if (n === 1) {
      ctx.fillText(lines[0], mid, boxY + boxH / 2 + 4);
    } else {
      var step = (boxH - 10) / n;
      for (i = 0; i < n; i++) {
        ctx.fillText(lines[i], mid, boxY + 14 + step * i);
      }
    }
    ctx.restore();
    return true;
  }

  function drawFluid(ctx, x, y, w, h, frame) {
    var img = images[currentFluid];
    if (!img || !img.complete || !img.naturalWidth) return false;
    var tileW = Math.max(48, h * 0.85);
    var tileH = tileW * (img.naturalHeight / img.naturalWidth);
    var flow = ((frame * 0.65) % tileH);
    if (flow < 0) flow += tileH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    var ox, oy;
    for (oy = y - flow; oy < y + h + tileH; oy += tileH) {
      for (ox = x; ox < x + w + 2; ox += tileW) {
        ctx.drawImage(img, ox, oy, tileW, tileH);
      }
    }
    ctx.restore();
    return true;
  }

  global.NeonDashSprites = {
    load: load,
    drawSprite: drawSprite,
    drawSky: drawSky,
    drawGround: drawGround,
    drawPlatform: drawPlatform,
    drawBoss: drawBoss,
    drawPortal: drawPortal,
    drawHudPlate: drawHudPlate,
    drawWorldSign: drawWorldSign,
    drawShield: drawShield,
    drawPickup: drawPickup,
    drawShot: drawShot,
    drawSpeechBubble: drawSpeechBubble,
    drawFluid: drawFluid,
    theme: theme,
    images: images
  };
})(typeof window !== 'undefined' ? window : this);
