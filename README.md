# Void Cube

HTML5 canvas side-scroller. The six-level run is **Neon Dash**: gravity cube, neon orbs, exit ladders, Web Audio SFX plus looping WAV beds. No build step.

This game used to live alongside the POPCORN Prompt Synthesizer in [apollo-n23/to-understand](https://github.com/apollo-n23/to-understand). Level pages use **← HOME** to return to this hub.

## Run locally

Static files only. From the repo root:

```bash
python -m http.server 5173
```

Then open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) for the hub, or open a level HTML file directly.

The hub plays a muted looping 30s cinematic above the world select. Levels 1 and 2 start a quiet looping bed on the first click or keypress. **M** mutes SFX and music.

## Files

| Path | What it is |
|---|---|
| `index.html` | Void Cube hub — cinematic, play Level 1, jump to any world |
| `void-cube.html` | Level 1 (Void) — loops `assets/audio/L1-BG.wav` |
| `level2.html` | Level 2 (Mr Octopoop) — loops `assets/audio/L2-BG.wav` |
| `Level3.html` | Level 3 (Industrial) |
| `Level4.html` | Level 4 (Lava). End boss is 70% larger, walks with an 8-frame stomp cycle, and fires waist-high eye lasers every ~10s (jump or stand on a platform). Crush still kills; 3 stomps still win. |
| `Leve5.html` | Level 5 (Pink biosphere; filename is historical) |
| `Level6.html` | Level 6 (Deep water, oxygen, Hydro shop) |
| `assets/neon/` | Sprites, skies, tiles, HUD plates, `draw-sprites.js`, `chrome.css`. L4 extras: `boss-01`–`boss-08` walk cycle, `boss-laser.png`, `boss-eye-beam.png` |
| `assets/audio/` | Looping beds: `L#-BG.wav` (L1 and L2 wired; L3–L6 when files land) |
| `assets/video/` | Hub cutscene `hub-cutscene.mp4` (~30s, 720p) + poster |
| `tests/neon-mechanics.test.js` | Collision, collect loop, L6 `leaveShop`, spike-vs-trampoline helpers |
| `tests/sprite-wiring-check.js` | Theme/sprite wiring + asset existence |
| `tests/nav-ui.test.js` | Below-canvas level nav + chrome plates |
| `tests/speech-ui.test.js` | Octopoop speech bubbles vs in-canvas help boxes |
| `tests/sprite-wiring.txt` | Last sprite-wiring check log |
| `sound-design-bible.md` | Canonical Web Audio SFX, mute, and BGM rules |
| `vercel.json` | Minimal static config |

Level filenames are inconsistent on purpose (`level2.html` vs `Level3.html` vs `Leve5.html`) — do not rename without updating every next-level link.

Every level has a below-canvas nav (`assets/neon/chrome.css`) with real `<a href>` links. The current page gets `is-current`.

```bash
node tests/neon-mechanics.test.js
node tests/sprite-wiring-check.js
node tests/nav-ui.test.js
node tests/speech-ui.test.js
```
