# NEON DASH SOUND DESIGN BIBLE
## Final Overseer / Alignment Agent

**Guiding Principle (from briefing):**  
"Neon Dash is a sci-fi abstract platformer which is a window into the mind of a nine year old boy as he day dreams about the universe."

All sound must evoke **wondrous, cosmic, playful, electronic yet soft, toy-like wonder mixed with vast space**. Non-threatening. Sparkly and bleepy for magic/collects. Gentle dissolve for 'deaths'. Triumphant but innocent for portal success. Thematic variations (lava warmth + soft crackle, ice crystalline, void glassy, neon bright) but **same sonic family**.

No real-world harshness, no scary/violent tones, no adult sci-fi drones. Think 80s/90s toy synths, chiptune softened with reverb tails and noise for space, like a child humming electronic lullabies to the stars.

---

## Overall Aesthetic (2-3 paragraphs)

The soundscape is the internal monologue of a nine-year-old's daydream: vast black velvet space filled with friendly glowing toys that bleep and sparkle when touched. Pure tones (sine/square/triangle) dominate for clarity and innocence, lightly detuned or chorused for "cosmic" feel. Noise is used sparingly and always filtered/softened — gentle hiss for dissolves, soft crackles for lava (like warm campfire in a dream), glassy bursts for ice (like wind chimes made of starlight). 

Envelopes are always soft attack + medium decay/release to avoid "clicky" or aggressive onsets; everything feels like it floats into existence and gently fades rather than punches. Durations are short (most <250ms) so they don't interrupt the dreamy flow or feel like "game feedback" — more like ambient magic responding to the child's imagination. Volumes are deliberately low and balanced (master 0.15-0.25) so the experience remains contemplative and vast rather than arcade-loud.

Continuity is sacred: the same core "family" of timbres travels with the boy across daydream levels. Void (Level 1) is glassy and distant; Level 2 adds soft organic burbles for Octopoop friends; industrial Level 3 gets subtle metallic ring but keeps it warm and toy-like; lava Level 4 introduces warm low rumbles and soft crackles but never scary fire — always cozy "volcano in a snow globe." Level 5 keeps the family with goo pops and pyramid/building hums. Level 6 (deep water) stays in-family: muffled, bubbly, slightly lower/warmer — `playBubbleChirp()` is a tiny high sine/triangle ping for air pockets, never a gasp or drowning panic. Slight filter/pitch shifts for theme only; base waveforms, envelopes, and call names identical.

---

## Canonical Sound Calls (10-14 named functions)

All functions are zero-arg (or optional simple param like type), fire-and-forget, respect global `muted` and `masterVol`.

1. **playJump()**  
   Quick rising square or sine 550→850Hz (or triangle for softness), 70-90ms duration, vol 0.18. Soft attack (5-10ms), exponential decay. Feels like a happy spring or star skipping.

2. **playLand()**  
   Short soft "plop" or low sine thud 220-320Hz + very light noise tail, 60-80ms, vol 0.12. Trigger only on true landing (vy > 0 → vy=0 transition). Warm and reassuring.

3. **playTrampoline()**  
   Variant of jump: higher start freq (750-950Hz), slightly longer 110ms, brighter triangle + quick octave up sweep. Stronger "boing" but still innocent. Vol 0.20.

4. **playCollect(isGreen = false)**  
   Bright major arpeggio ping (2-3 notes: e.g. C6-E6-G6 or similar), 40-60ms per note, short gap. Sparkly. For green (value=5): slightly lower + warmer major 3rd emphasis or add soft sine layer. Use triangle/sine. Vol 0.22. Magical pickup, like catching a firefly made of neon.

5. **playPowerup(type = 'shield' | 'ice')**  
   Layered ascending chime cluster (4-5 soft notes rising), 180-250ms total with longer tail/reverb feel via decay. Shield: cool neon blue (higher, ~900-1400Hz sine). Ice: crystalline glassy (use more triangle + light noise). Vol 0.20. Triumphant but gentle "I got a new toy!"

6. **playLadderStep()**  
   Short metallic-woodblock click or soft 900Hz tone + filtered noise burst, 35-50ms, very low vol 0.08-0.11. Play periodically during climb (e.g. every 0.08-0.12 climbProgress or every 7-9 frames). Rhythmic, reassuring "climbing the dream ladder to the stars."

7. **playLadderGrab()** (optional, on climb start)  
   Soft single low "clunk" or hollow 380Hz sine with quick noise, 80ms. Signals "now I'm climbing!"

8. **playDeath(cause = 'hazard' | 'lava' | 'acid' | 'projectile' | 'ptero')**  
   Descending major 3rd or 5th (e.g. 700Hz → 520Hz or 660→440) with soft noise tail, 280-350ms total. Very gentle dissolve — not sad, more "poof, back to imagining."  
   - Normal hazard: clean descending sine/square.  
   - Lava/acid: add warm low rumble + very soft hiss/crackle layer (lowpass noise).  
   - Ice-related or ptero: slightly higher glassy start with crystalline decay.  
   Vol 0.15-0.18. Always non-threatening; child thinks "oops, time to dream a new try."

9. **playPortal()**  
   Layered ascending whoosh (noise filtered rising) + bright chime cluster (major triad + 5th or 9th) with long soft tail 400-600ms. Triumphant but innocent — like "the stars are happy I made it!" Vol 0.22. Play exactly once on climb t>=1 / gameState='complete'.

10. **playIceBlast()**  
    High glassy cluster of tones (C7-ish + detuned +7 semitones) + short noise burst (highpassed), 120-160ms. Crystalline "shatter" that feels magical and cleansing, not destructive. Vol 0.19. Used on ArrowDown detonate.

11. **playPteroSpit()** (Level4)  
    Low soft "puff" sine or triangle 180-280Hz + gentle filtered crackle noise (warm lowpass), 90-120ms. Playful "dragon friend breathing sparkles" rather than fire. Vol 0.14. At the moment of projectile spawn from ptero.

12. **playBossStomp()** (Level4, optional)  
    Low warm thud (sine 140-200Hz) + soft body "bounce" tail, 100ms. For boss bounces and final defeat particles. Friendly giant toy monster.

13. **playShieldPop()** (on shield absorb hit)  
    Quick bright descending blip + sparkle (two notes), 90ms. Soft "ting" of protection. Vol 0.16. Reinforces the "safe toy armor" fantasy.

14. **playLavaSizzle()** (themed death or ambient near pits, optional)  
    Very low soft rumble + intermittent gentle hiss (noise with slow envelope), 300ms+ but low vol 0.08. Only for lava-themed deaths or close calls; dreamy warmth.

15. **playBubbleChirp()** (Level 6)  
    Tiny rising sine ~880–1100Hz then a quieter triangle sparkle, ~55ms + 40ms, vol 0.05–0.08. Air-pocket refill, never a gasp. Same innocence as collect, wetter and smaller.

**Additional guidelines for calls:**
- Use the exact names above for cross-file paste consistency.
- For collectibles/orbs/powerups: always call playCollect or playPowerup immediately before or after the splice/remove and particle spawn.
- Death: call playDeath right at the line that does `gameState = 'over';` (inside the else of shield checks, before/after spawnExplosion).
- Theme variations only via small param or internal ifs (e.g. playDeath('lava')) — never different base functions per level.
- Cross-level rule: **jump/land/collect base timbre identical everywhere**. Only tiny pitch shift (±3-7%) or filter tweak for lava vs neon/void (e.g. lava slightly lower and warmer lowpass).

---

## Guidelines: Volume, Duration, Synthesis, Variation

- **Master volume**: 0.15–0.25 range for all play calls. Use a `masterVol = 0.22;` const. Individual calls scale relative to it.
- **Duration caps**: Most SFX ≤ 250ms core; tails up to 500ms for portal/death only. Prevents "busy" feel.
- **Noise vs pure tones**: 70%+ pure tones (sine/triangle/square) for toy innocence. Noise only as soft layer or short burst (highpass for ice, lowpass for lava/hiss). Never raw white noise.
- **Envelope shapes**: Always soft attack (5-15ms ramp). Use exponential decay or linear fade for dreamy release. Avoid hard on/off.
- **Oscillator types** (in order of preference for dreamy): sine (softest), triangle (sparkly), square (with light lowpass filter for retro-toy), saw rarely and filtered.
- **Variation without breaking continuity**:
  - Base calls (jump, collect, death, portal, land) = identical synthesis + pitches across ALL files.
  - Theme only: slight detune, filter cutoff, or 1-2 note substitution in arpeggio/chime (lava: warmer 3rd; ice: higher + more detune; void: pure + glassy reverb sim via longer decay).
  - Random micro-variation (±2-5% freq or 5-10ms dur) on every play for liveliness, seeded from frame or Math.random() but same "family."
- **No music beds or loops** — pure event-driven SFX only. The "music" is the child's imagination + canvas visuals.
- **Performance**: Web Audio is cheap here. Create nodes per call (no pooling needed for <20 simultaneous expected). Disconnect after stop.

---

## Recommended Function Names + Reusable Sound Engine Snippet

**Exact function names** (use these verbatim in all six level files for easy alignment/merge):
- playJump
- playLand
- playTrampoline
- playCollect
- playPowerup
- playLadderStep
- playLadderGrab (optional)
- playDeath
- playPortal
- playIceBlast
- playPteroSpit
- playShieldPop (if used)
- playBossStomp (if used)
- playBubbleChirp (Level 6 air pockets only)
- L5/L6 extras where themed: playPyramidEmerge, playPyramidChat, playBuildingHum, playGooPop, playLaser, playNPCApproach, playBlock

**Small reusable sound engine** (paste-identical block in every file, after const keys = {} or near top of script, before resetGame. Also declare `let audioCtx; let muted = false; const masterVol = 0.22;` at top with other lets).

```js
// === NEON DASH DREAMY SFX ENGINE (shared across all levels) ===
// Paste this block identically into void-cube.html, level2.html, Level3.html, Level4.html, Leve5.html, Level6.html
let audioCtx;
let muted = false;
const masterVol = 0.22;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* silent fail on old browsers */ }
  }
  return audioCtx;
}

function playTone(freq, durationMs, type = 'sine', vol = 0.2, attackMs = 8, decayMs = 80) {
  const ctx = getAudioCtx();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter(); // optional soft shaping

  osc.type = type;
  osc.frequency.value = freq;

  // Soft dreamy filter for most sounds
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(2800, freq * 3.5 + 400);

  const now = ctx.currentTime;
  const dur = durationMs / 1000;

  // Soft attack
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(vol * masterVol, now + (attackMs / 1000));

  // Gentle decay/release
  const releaseStart = now + Math.max(0.01, dur - (decayMs / 1000));
  gain.gain.linearRampToValueAtTime(0.0001, now + dur + 0.08);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + dur + 0.15);
}

function playNoise(durationMs, vol = 0.15, filterHz = 1200, type = 'lowpass') {
  const ctx = getAudioCtx();
  if (!ctx || muted) return;
  const bufferSize = Math.floor(ctx.sampleRate * (durationMs / 1000));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterHz;

  const now = ctx.currentTime;
  const dur = durationMs / 1000;
  gain.gain.value = vol * masterVol;
  gain.gain.linearRampToValueAtTime(0.0001, now + dur + 0.06);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + dur + 0.1);
}

// === CANONICAL WRAPPERS (use these exact calls) ===

function playJump() {
  if (muted) return;
  playTone(620, 72, 'square', 0.18, 6, 70);
  // light sparkle tail
  setTimeout(() => playTone(880, 38, 'sine', 0.09, 4, 30), 18);
}

function playLand() {
  if (muted) return;
  playTone(280, 55, 'sine', 0.12, 5, 55);
  playNoise(48, 0.06, 900, 'lowpass');
}

function playTrampoline() {
  if (muted) return;
  playTone(780, 95, 'triangle', 0.20, 7, 90);
  setTimeout(() => playTone(1050, 55, 'sine', 0.11, 5, 45), 22);
}

function playCollect(isGreen = false) {
  if (muted) return;
  const base = isGreen ? 720 : 880;
  playTone(base, 42, 'triangle', 0.22, 3, 35);
  setTimeout(() => playTone(base * 1.25, 42, 'triangle', 0.18, 3, 35), 28);
  setTimeout(() => playTone(base * 1.5, 55, 'sine', 0.14, 4, 40), 55);
  if (isGreen) {
    setTimeout(() => playTone(base * 0.9, 60, 'sine', 0.10, 6, 50), 40);
  }
}

function playPowerup(type = 'shield') {
  if (muted) return;
  const isIce = type === 'ice';
  const notes = isIce ? [980, 1120, 1310, 1550] : [820, 980, 1150, 1380];
  notes.forEach((f, i) => {
    setTimeout(() => {
      playTone(f, 65, isIce ? 'triangle' : 'sine', isIce ? 0.17 : 0.19, 5, 55);
    }, i * 22);
  });
  // soft noise sparkle
  setTimeout(() => playNoise(90, 0.07, isIce ? 2200 : 1600, 'lowpass'), 30);
}

function playLadderStep() {
  if (muted) return;
  playTone(920, 38, 'square', 0.09, 3, 32);
  playNoise(32, 0.05, 1400, 'lowpass');
}

function playLadderGrab() {
  if (muted) return;
  playTone(410, 75, 'sine', 0.13, 8, 70);
}

function playDeath(cause = 'hazard') {
  if (muted) return;
  const base = (cause === 'lava' || cause === 'acid') ? 480 : (cause === 'ptero' || cause === 'ice' ? 780 : 650);
  playTone(base, 160, 'sine', 0.16, 12, 140);
  setTimeout(() => playTone(base * 0.75, 140, 'sine', 0.12, 10, 120), 55);
  if (cause === 'lava' || cause === 'acid') {
    playNoise(220, 0.07, 650, 'lowpass'); // warm soft crackle/hiss
  } else if (cause === 'ice' || cause === 'ptero') {
    playNoise(90, 0.05, 2800, 'highpass'); // glassy
  }
}

function playPortal() {
  if (muted) return;
  // Whoosh layer
  playNoise(320, 0.09, 1800, 'lowpass');
  // Innocent triumphant chimes (major + dreamy 9th)
  const chimes = [720, 880, 1080, 1320, 1620];
  chimes.forEach((f, i) => {
    setTimeout(() => playTone(f, 180, 'sine', 0.15 + (i === 4 ? 0.04 : 0), 15, 160), i * 18);
  });
}

function playIceBlast() {
  if (muted) return;
  // Glassy high cluster
  [1240, 1380, 1510, 1720].forEach((f, i) => {
    setTimeout(() => playTone(f, 95, 'triangle', 0.18, 4, 80), i * 7);
  });
  playNoise(75, 0.11, 2400, 'highpass');
}

function playPteroSpit() {
  if (muted) return;
  playTone(230, 85, 'triangle', 0.13, 10, 75);
  playNoise(95, 0.08, 580, 'lowpass'); // soft warm puff + crackle
}

function playShieldPop() {
  if (muted) return;
  playTone(1050, 55, 'sine', 0.15, 4, 45);
  setTimeout(() => playTone(720, 48, 'triangle', 0.10, 4, 38), 18);
}

function playBossStomp() {
  if (muted) return;
  playTone(165, 90, 'sine', 0.14, 8, 80);
  setTimeout(() => playTone(205, 55, 'sine', 0.08, 6, 45), 25);
}

// Mute toggle helper (call from key handler)
function toggleMute() {
  muted = !muted;
  // Optional: visual hint can be added in draw if desired
  console.log('[NEON DASH] Sound ' + (muted ? 'muted' : 'enabled'));
}
```

**Mute implementation standard (add identically):**
- Declare `let muted = false;` with other state lets.
- In the main `keydown` listener (the one that sets keys[e.key]=true and handles Space/R), add:
  ```js
  if (e.key === 'm' || e.key === 'M') {
    toggleMute();
    // optionally e.preventDefault(); if needed but usually not
  }
  ```
- Place AFTER the Space check but before or after R check for consistency.
- All four files MUST have the exact same key listener pattern for 'm'/'M'.
- No per-level mute vars. Global (file-scoped) is fine since separate pages.

---

## Cross-Level Continuity Rules (strict)

- **Core calls identical**: playJump, playLand, playCollect, playPortal, playDeath base synth, envelopes, and pitches MUST be byte-for-byte the same in the engine snippet pasted into all 4 files. Only the playXXX wrappers for themed (playPteroSpit, slight playDeath variant) may differ.
- Jump/land always "the same base" — only filter or ±5% pitch allowed inside the wrapper for lava vs neon (e.g. lava jump slightly warmer).
- Collect always sparkly bleep family regardless of orb color or powerup type.
- Death always gentle descending dissolve family. The `cause` param only adds a soft noise layer or slight base pitch shift — never changes the musical interval.
- Ladder climb: same step sound in every level (even if visuals differ: void metal vs lava rock).
- Volumes and masterVol identical.
- When adding SFX, insert at the **exact same relative code location** in each file (e.g. immediately after `player.vy = -11.8;` for jump; immediately before `neonOrbs.splice(i, 1);` for collect; immediately at `gameState = 'over';` lines).
- For future agents: if a level-specific action has no canonical call yet, propose addition here first and use a descriptive name following the pattern (playXXX).
- Never introduce new AudioContext or external files. Stick to this Web Audio snippet only.

---

## Implementation Notes for Level Agents & Merge

- Insert the FULL engine snippet + vars once per file (after const keys = {}; is a good spot, or near other const/let game state).
- Hook calls at mechanics (see "Immediate tasks" in overseer brief: vy changes for jump, collect ifs, every gameState='over', climbProgress block for steps + start, t>=1 for portal, detonate for ice, ptero spit moment, icePowerUp collect, powerUp collect).
- For landing: introduce a simple `let wasAirborne = false;` updated each frame. After physics, `if (landed && wasAirborne) { playLand(); } wasAirborne = !landed;`
- During climb: inside the isClimbing if, after climbProgress += , add `if (Math.floor(player.climbProgress * 12) !== Math.floor((player.climbProgress - 0.0198)*12)) playLadderStep();` (or frame % 8 ===0).
- On climb start (the if nearBase && keys up): add playLadderGrab(); right when setting isClimbing=true.
- Test subjectively against 9yo daydream: does it feel wondrous and safe? If harsh or loud, lower vol or soften attack.
- After agents implement, overseer will diff against this bible for naming, volume, hook sites, and family consistency.

This bible is the single source of truth for alignment. All sound must serve the child's universe daydream.

— Final Overseer