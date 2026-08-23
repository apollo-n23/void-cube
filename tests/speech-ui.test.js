'use strict';
/**
 * Octopoop speech bubbles vs in-canvas help/tutorial overlays.
 * Drives shipped drawSpeechBubble from assets/neon/draw-sprites.js
 * and reads the shipped level HTML files.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

const OCTO_LEVELS = [
  {
    file: 'level2.html',
    npcs: ['mrOctopoopStart', 'mrOctopoopEnd'],
    lines: [
      "Hi! I'm Mr Octopoop!",
      'Welcome to Neon Dash.',
      'Well done! Good luck savung the cubes!',
      'Press Up to climb the ladder to the portal!',
    ],
  },
  {
    file: 'Level4.html',
    npcs: ['friendlyNPC'],
    lines: [
      'Hey, are you here to solve the mystery?',
      'Watch out for the boss!',
    ],
  },
  {
    file: 'Leve5.html',
    npcs: ['friendlyNPC', 'octopoppStart', 'octopoppMid'],
    lines: [
      'Hey, are you here to solve the mystery?',
      'The pink slime is dangerous!',
      "There's a great mystery.",
      'Why is all the neon floating away?',
      'The only way to save us is to stop the neon leak!',
    ],
  },
  {
    file: 'Level6.html',
    npcs: ['friendlyNPC'],
    lines: ['The neon is leaking! we have to stop it!'],
  },
];

const ALL_LEVELS = [
  'void-cube.html',
  'level2.html',
  'Level3.html',
  'Level4.html',
  'Leve5.html',
  'Level6.html',
];

let failed = 0;
function check(cond, msg) {
  const mark = cond ? 'PASS' : 'FAIL';
  if (!cond) failed++;
  console.log(mark + ' ' + msg);
}

const spriteSrc = fs.readFileSync(path.join(ROOT, 'assets', 'neon', 'draw-sprites.js'), 'utf8');
const sandbox = { window: {}, Math: Math };
vm.runInNewContext(spriteSrc, sandbox);
const api = sandbox.window.NeonDashSprites;
check(!!api && typeof api.drawSpeechBubble === 'function', 'shipped NeonDashSprites.drawSpeechBubble exists');

const recorded = [];
const ctx = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  save: function () {},
  restore: function () {},
  beginPath: function () {},
  closePath: function () {},
  moveTo: function () {},
  arcTo: function () {},
  lineTo: function () {},
  fill: function () {
    recorded.push({ op: 'fill', fill: this.fillStyle, stroke: this.strokeStyle });
  },
  stroke: function () {
    recorded.push({ op: 'stroke', fill: this.fillStyle, stroke: this.strokeStyle });
  },
  fillText: function (t) {
    recorded.push({ op: 'text', t: t, fill: this.fillStyle });
  },
};

const ok = api.drawSpeechBubble(ctx, 10, 20, 200, 40, 110, 80, ['Hello Octo', 'Second line']);
check(ok === true, 'drawSpeechBubble returns true');
const fills = recorded.filter(function (c) { return c.op === 'fill'; });
const strokes = recorded.filter(function (c) { return c.op === 'stroke'; });
const texts = recorded.filter(function (c) { return c.op === 'text'; });
check(fills.length > 0, 'drawSpeechBubble fills a bubble');
check(strokes.length > 0, 'drawSpeechBubble strokes a bubble');
const speechFill = fills[0].fill;
const speechStroke = strokes[0].stroke;
check(speechFill === 'rgba(52, 8, 38, 0.94)', 'speech fill is magenta-dark rgba(52, 8, 38, 0.94)');
check(speechStroke === '#ff79d0', 'speech stroke is magenta #ff79d0');
check(texts.some(function (c) { return c.t === 'Hello Octo'; }), 'drawSpeechBubble writes first line');
check(texts.some(function (c) { return c.t === 'Second line'; }), 'drawSpeechBubble writes second line');
check(texts.every(function (c) { return c.fill === '#ffe6f5'; }), 'speech text uses pink-white #ffe6f5');

function overlayStyles(html) {
  const start = html.indexOf('// === UI OVERLAYS ===');
  if (start < 0) return { fills: [], strokes: [] };
  const chunk = html.slice(start, start + 4000);
  const fills = [];
  const strokes = [];
  const fillRe = /fillStyle\s*=\s*'([^']+)'/g;
  const strokeRe = /strokeStyle\s*=\s*'([^']+)'/g;
  let m;
  while ((m = fillRe.exec(chunk))) fills.push(m[1]);
  while ((m = strokeRe.exec(chunk))) strokes.push(m[1]);
  return { fills: fills, strokes: strokes };
}

function hasDialogue(html, line) {
  return html.indexOf(line) >= 0 || html.indexOf(line.replace(/'/g, "\\'")) >= 0;
}

function countNeedle(html, needle) {
  let n = 0;
  let i = 0;
  while ((i = html.indexOf(needle, i)) >= 0) {
    n++;
    i += needle.length;
  }
  return n;
}

for (const spec of OCTO_LEVELS) {
  const html = fs.readFileSync(path.join(ROOT, spec.file), 'utf8');
  for (const npc of spec.npcs) {
    check(html.indexOf(npc) >= 0, spec.file + ' has ' + npc);
  }
  const bubbleCalls = countNeedle(html, 'drawSpeechBubble(');
  check(bubbleCalls === spec.npcs.length, spec.file + ' has ' + spec.npcs.length + ' drawSpeechBubble calls (got ' + bubbleCalls + ')');
  for (const line of spec.lines) {
    check(hasDialogue(html, line), spec.file + ' keeps dialogue ' + JSON.stringify(line));
  }
  const ov = overlayStyles(html);
  const sameFill = ov.fills.indexOf(speechFill) >= 0;
  const sameStroke = ov.strokes.indexOf(speechStroke) >= 0;
  check(!sameFill, spec.file + ' tutorial overlays do not use speech fill ' + speechFill);
  check(!sameStroke, spec.file + ' tutorial overlays do not use speech stroke ' + speechStroke);
}

for (const file of ALL_LEVELS) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  check(/width="960" height="520"/.test(html), file + ' canvas 960x520');
  check(/w:\s*26,\s*h:\s*26/.test(html), file + ' player w/h 26');
}

if (failed) {
  console.error('FAILED ' + failed);
  process.exit(1);
}
console.log('ALL SPEECH UI CHECKS PASSED');
