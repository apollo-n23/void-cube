'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LEVELS = [
  { file: 'void-cube.html', current: 'void-cube.html', ids: ['level2-link'] },
  { file: 'level2.html', current: 'level2.html', ids: ['next-level-link'] },
  { file: 'Level3.html', current: 'Level3.html', ids: ['level3-link', 'next-level-link'] },
  { file: 'Level4.html', current: 'Level4.html', ids: ['level3-link', 'next-level-link'] },
  { file: 'Leve5.html', current: 'Leve5.html', ids: ['level3-link', 'next-level-link'] },
  { file: 'Level6.html', current: 'Level6.html', ids: ['level3-link'] },
];
const HREFS = [
  'void-cube.html',
  'level2.html',
  'Level3.html',
  'Level4.html',
  'Leve5.html',
  'Level6.html',
];
const PLATES = [
  'ui-header.jpg',
  'ui-nav.jpg',
  'ui-btn.jpg',
  'ui-btn-hover.jpg',
  'ui-btn-pressed.jpg',
  'ui-cta.jpg',
  'ui-key.jpg',
  'ui-frame.jpg',
];

let failed = 0;
function check(cond, msg) {
  const mark = cond ? 'PASS' : 'FAIL';
  if (!cond) failed++;
  console.log(mark + ' ' + msg);
}

const chromeCss = fs.readFileSync(path.join(ROOT, 'assets', 'neon', 'chrome.css'), 'utf8');
check(chromeCss.indexOf('url("ui-header.jpg")') >= 0, 'chrome.css references ui-header.jpg');
check(chromeCss.indexOf('url("ui-nav.jpg")') >= 0, 'chrome.css references ui-nav.jpg');
check(chromeCss.indexOf('url("ui-btn.jpg")') >= 0, 'chrome.css references ui-btn.jpg');
check(chromeCss.indexOf('url("ui-cta.jpg")') >= 0, 'chrome.css references ui-cta.jpg');
check(chromeCss.indexOf('url("ui-key.jpg")') >= 0, 'chrome.css references ui-key.jpg');
check(chromeCss.indexOf('url("ui-frame.jpg")') >= 0, 'chrome.css references ui-frame.jpg');
check(chromeCss.indexOf('url("ui-btn-hover.jpg")') >= 0, 'chrome.css references ui-btn-hover.jpg');
check(chromeCss.indexOf('url("ui-btn-pressed.jpg")') >= 0, 'chrome.css references ui-btn-pressed.jpg');

for (const plate of PLATES) {
  const p = path.join(ROOT, 'assets', 'neon', plate);
  check(fs.existsSync(p) && fs.statSync(p).size > 500, 'exists assets/neon/' + plate);
}

for (const spec of LEVELS) {
  const html = fs.readFileSync(path.join(ROOT, spec.file), 'utf8');
  check(html.indexOf('assets/neon/chrome.css') >= 0, spec.file + ' loads chrome.css');
  check(/width="960" height="520"/.test(html), spec.file + ' canvas 960x520');

  const gameIdx = html.indexOf('id="game"');
  const navIdx = html.search(/<nav\b[^>]*class="level-nav"/);
  check(gameIdx >= 0, spec.file + ' has #game');
  check(navIdx >= 0, spec.file + ' has .level-nav');
  check(gameIdx >= 0 && navIdx > gameIdx, spec.file + ' nav appears after #game in source');

  const navEnd = html.indexOf('</nav>', navIdx);
  const navChunk = navIdx >= 0 && navEnd > navIdx ? html.slice(navIdx, navEnd) : '';
  for (const href of HREFS) {
    check(
      navChunk.indexOf('href="' + href + '"') >= 0,
      spec.file + ' nav href ' + href
    );
  }

  check(
    navChunk.indexOf('href="' + spec.current + '"') >= 0 &&
      navChunk.indexOf('is-current') >= 0,
    spec.file + ' marks current level'
  );

  for (const id of spec.ids) {
    check(html.indexOf('id="' + id + '"') >= 0, spec.file + ' keeps #' + id);
  }

  check(/w:\s*26,\s*h:\s*26/.test(html), spec.file + ' player w/h 26 unchanged');
}

if (failed) {
  console.error('FAILED ' + failed);
  process.exit(1);
}
console.log('ALL NAV UI CHECKS PASSED');
