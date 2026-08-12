# Hero Enso Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site's hero section (`index.html` `.hero`) so the kanji `合気道` sit inside an animated, brush-textured enso circle (drawn once on page load) with a two-tier `AIKIDO` / `PRUSZKÓW` title beneath, matching the visual language of `320_465_aikido_plakat.pdf` while keeping the site-specific eyebrow and hanko elements.

**Architecture:** Pure HTML/CSS change, no JS, no build step. A new `.enso-kakejiku` wrapper stacks an inline SVG (`.enso`, two `<path>` strokes using `pathLength="100"` for trivial `stroke-dasharray` math) behind a vertical `.kakejiku` kanji stack. The draw-on animation and kanji fade-in are pure CSS `@keyframes`, gated inside `@media (prefers-reduced-motion: no-preference)` so the unanimated, fully-visible state is the default/fallback. Dead CSS (`body.hero-vertical`, `body.hero-single`) is removed as part of the same effort since the new layout replaces what they were for.

**Tech Stack:** Static HTML, CSS custom properties (design tokens in `:root`/`body.palette-dark`), inline SVG + SVG filters, CSS `@keyframes` + `prefers-reduced-motion`. No test runner exists in this repo (see `CLAUDE.md`) — every task's verification step is a concrete manual check via the documented local preview (`python3 -m http.server 3000`), not an automated test.

## Global Constraints

- No framework, no build step, no npm, no automated tests (`CLAUDE.md`) — verification is manual/visual via local preview.
- Colors only via existing CSS custom properties (`--paper`, `--ink`, `--ink-soft`, `--rule`, `--vermilion`, `--on-lime`, …) — zero new magic color values (design doc §2).
- `body.palette-dark` stays the active theme; never delete the `:root` light-palette block (`CLAUDE.md`).
- Kanji tooltips keep the `data-kanji-tip="translation"` attribute (`CLAUDE.md` conventions).
- Animation must be pure CSS, no JS dependency, and must default to the final (fully visible, undrawn-circle-absent) state outside `@media (prefers-reduced-motion: no-preference)` (design doc §3).
- Mobile-first: base styles without media query, then `min-width`/`max-width` additions follow the existing file's convention of `max-width` breakpoints for hero mobile fixes (existing pattern at `css/styles.css:412-431`).
- `.schedule-poster` and everything below it in `index.html` is out of scope — do not touch.

---

### Task 1: Remove dead hero layout variant CSS

**Files:**
- Modify: `css/styles.css:1067-1080`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (pure deletion) — confirms no other task or file references `hero-vertical`/`hero-single`.

- [ ] **Step 1: Confirm nothing else references these classes**

Run: `grep -rn "hero-vertical\|hero-single" --include="*.html" --include="*.css" --include="*.js" .`
Expected: only matches inside `css/styles.css` itself (the block being deleted). If any `<body class="...">` in `index.html` or elsewhere used these classes, STOP and re-plan — this task assumes they are dead.

- [ ] **Step 2: Delete the dead block**

In `css/styles.css`, delete this block (currently lines 1067-1080, right after the `DISPLAY FONT VARIANTS` block):

```css
  /* ─────────── HERO LAYOUT VARIANTS ─────────── */
  body.hero-vertical .kakejiku{
    flex-direction: column;
    gap: clamp(4px, 0.5vw, 12px);
  }
  body.hero-vertical .kakejiku .kchar{
    font-size: clamp(96px, 14vw, 200px);
    line-height: .9;
  }
  body.hero-vertical .kakejiku::before, body.hero-vertical .kakejiku::after{ top: 0; bottom: 0; }
  body.hero-vertical .hanko{ right: -10px; bottom: 0; }

  body.hero-single .kakejiku .kchar:not(:first-child){ display: none; }
  body.hero-single .kakejiku .kchar{ font-size: clamp(180px, 30vw, 420px); }
```

So that the file goes directly from the `DISPLAY FONT VARIANTS` block to whatever follows (the `body.palette-dark` block ends right before it; check what currently follows line 1080 and preserve it as-is).

- [ ] **Step 3: Verify the page still renders unchanged**

Run: `python3 -m http.server 3000` from the repo root, open `http://localhost:3000`.
Expected: hero section looks exactly as it did before this task (these classes were never applied to `<body>`, so this is a no-op visually). Confirm via `grep -n "hero-vertical\|hero-single" css/styles.css` returning no results.

- [ ] **Step 4: Commit**

```bash
git add css/styles.css
git commit -m "chore: remove dead hero-vertical/hero-single CSS variants

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Rebuild hero markup + static (non-animated) enso layout

**Files:**
- Modify: `index.html:39-63` (hero `<svg>` filter defs, `.hero-frame` contents)
- Modify: `css/styles.css:141-219` (`.kakejiku`, `.hanko`, `.hero-subtitle h1` and children)

**Interfaces:**
- Produces (HTML classes CSS in this task must style): `.enso-kakejiku` (wrapper), `.enso` (svg), `.enso-shadow` / `.enso-main` (paths), `.kakejiku` (now a vertical kanji stack, no more `.shu` modifier), `.title-aikido`, `.title-place`, `.title-place .line`, `.title-place .place-name`.
- Produces (for Task 3): the same `.enso-shadow` / `.enso-main` / `.kakejiku .kchar` selectors, styled here in their **final** (fully drawn / fully visible) state — Task 3 only adds the `prefers-reduced-motion` override that animates *from* a hidden state *to* this final state.
- Consumes: existing tokens `var(--ink)`, `var(--ink-soft)`, `var(--rule)`, `var(--vermilion)`, `var(--on-lime)`, `var(--font-display)`, `var(--font-brush)`, `var(--font-label)`; existing `#hanko-rough` SVG filter.

- [ ] **Step 1: Add the `#enso-rough` filter next to the existing `#hanko-rough` filter**

In `index.html`, the hero section currently opens with:

```html
<section class="hero wrap" data-screen-label="01 Hero">
  <!-- svg filter for hanko sumi-bleed -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="hanko-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="3"/>
    </filter>
  </svg>
```

Replace with:

```html
<section class="hero wrap" data-screen-label="01 Hero">
  <!-- svg filters: hanko sumi-bleed + enso brush roughness -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="hanko-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="3"/>
    </filter>
    <filter id="enso-rough" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/>
      <feDisplacementMap in="SourceGraphic" scale="6"/>
    </filter>
  </svg>
```

- [ ] **Step 2: Replace the `.hero-frame` contents**

Replace this (currently `index.html:46-64`):

```html
  <div class="hero-frame">
    <div class="hero-eyebrow">
      <span class="line"></span>
      <span class="mono">SEZON 2026 — 2027</span>
      <span class="line"></span>
    </div>

    <div class="kakejiku" aria-label="Aikido">
      <span class="kchar" data-kanji-tip="ai — harmonia">合</span>
      <span class="kchar" data-kanji-tip="ki — energia">気</span>
      <span class="kchar shu" data-kanji-tip="dō — droga">道</span>
      <div class="hanko" aria-hidden="true" data-kanji-tip="bu — wojownik">武</div>
    </div>

    <div class="hero-subtitle">
      <h1>Aikido <span class="place-name">Pruszków</span></h1>
      <p><span class="pron">AI &middot; KI &middot; DŌ</span><span class="sep"> &nbsp; — &nbsp; </span><span class="mean">harmonia &middot; energia &middot; droga</span></p>
    </div>
  </div>
```

With:

```html
  <div class="hero-frame">
    <div class="hero-eyebrow">
      <span class="line"></span>
      <span class="mono">SEZON 2026 — 2027</span>
      <span class="line"></span>
    </div>

    <div class="enso-kakejiku">
      <svg class="enso" viewBox="0 0 400 400" aria-hidden="true">
        <path class="enso-shadow" pathLength="100" filter="url(#enso-rough)" d="M 298.4 83.1 A 150 150 0 1 1 127 68.1"/>
        <path class="enso-main" pathLength="100" filter="url(#enso-rough)" d="M 272.5 74.4 A 145 145 0 1 1 150.4 63.7"/>
      </svg>
      <div class="kakejiku" aria-label="Aikido">
        <span class="kchar" data-kanji-tip="ai — harmonia">合</span>
        <span class="kchar" data-kanji-tip="ki — energia">気</span>
        <span class="kchar" data-kanji-tip="dō — droga">道</span>
      </div>
      <div class="hanko" aria-hidden="true" data-kanji-tip="bu — wojownik">武</div>
    </div>

    <div class="hero-subtitle">
      <h1>
        <span class="title-aikido">Aikido</span>
        <span class="title-place">
          <span class="line"></span>
          <span class="place-name">Pruszków</span>
          <span class="line"></span>
        </span>
      </h1>
      <p><span class="pron">AI &middot; KI &middot; DŌ</span><span class="sep"> &nbsp; — &nbsp; </span><span class="mean">harmonia &middot; energia &middot; droga</span></p>
    </div>
  </div>
```

Note: the `shu` modifier class is dropped from `道` — all three kanji now share one color, styled in Step 3.

- [ ] **Step 3: Replace the kakejiku/hanko/title CSS**

In `css/styles.css`, replace this block (currently lines 141-219, from `.kakejiku{` through the end of `.hero-subtitle h1 .place-name{...}`):

```css
  .kakejiku{
    position: relative;
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    gap: clamp(8px, 1.6vw, 28px);
    padding: 0 clamp(20px, 4vw, 60px);
    max-width: 100%;
  }
  .kakejiku::before, .kakejiku::after{
    content: ""; position: absolute; top: 8%; bottom: 8%;
    width: 2px;
    background: linear-gradient(to bottom, transparent, var(--rule) 14%, var(--rule) 86%, transparent);
  }
  .kakejiku::before{ left: 0; }
  .kakejiku::after{ right: 0; }

  .kakejiku .kchar{
    font-family: var(--font-brush);
    font-weight: 400;
    font-size: clamp(76px, 22vw, 320px);
    line-height: .88;
    color: var(--ink);
    display: inline-block;
    position: relative;
  }
  .kakejiku .kchar:nth-child(2){ color: var(--ink); opacity: .92; }
  .kakejiku .kchar.shu{ color: var(--vermilion); }

  .hanko{
    position: absolute;
    right: calc(-1 * clamp(24px, 3vw, 48px));
    bottom: clamp(20px, 3vw, 48px);
    width: clamp(56px, 6vw, 88px);
    height: clamp(56px, 6vw, 88px);
    background: var(--vermilion);
    color: var(--on-lime);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-brush);
    font-size: clamp(32px, 3.4vw, 52px);
    line-height: 1;
    transform: rotate(-4deg);
    box-shadow:
      inset 0 0 0 2px var(--vermilion-deep),
      inset 0 0 0 4px var(--vermilion),
      inset 0 0 0 5px var(--vermilion-deep);
    /* sumi-bleed feel */
    filter: url(#hanko-rough);
  }
  .hanko::after{
    content: ""; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='1'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -0.5 1.1'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    mix-blend-mode: lighten;
    opacity: .35;
    pointer-events: none;
  }

  .hero-subtitle{
    margin-top: clamp(36px, 5vw, 56px);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .hero-subtitle h1{
    display: flex; flex-direction: row; align-items: baseline; gap: 18px;
    flex-wrap: wrap; justify-content: center;
    font-family: var(--font-display);
    font-size: clamp(44px, 6vw, 76px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: .9;
  }
  .hero-subtitle h1 .place-name{
    font-family: var(--font-label);
    font-weight: 600;
    font-size: .4em;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
```

With:

```css
  .enso-kakejiku{
    position: relative;
    display: grid;
    place-items: center;
    width: clamp(220px, 34vw, 420px);
    aspect-ratio: 1 / 1;
    margin: 0 auto;
  }
  .enso-kakejiku .enso{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .enso-shadow{
    fill: none;
    stroke: var(--ink-soft);
    stroke-width: 10;
    stroke-linecap: round;
    opacity: .55;
  }
  .enso-main{
    fill: none;
    stroke: var(--ink);
    stroke-width: 14;
    stroke-linecap: round;
  }
  .enso-shadow, .enso-main{
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }

  .kakejiku{
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, .6vw, 10px);
  }

  .kakejiku .kchar{
    font-family: var(--font-brush);
    font-weight: 400;
    font-size: clamp(48px, 8vw, 108px);
    line-height: .88;
    color: var(--vermilion);
    display: inline-block;
    position: relative;
  }

  .hanko{
    position: absolute;
    right: clamp(-12px, -1.2vw, 0px);
    bottom: clamp(4px, 1vw, 16px);
    width: clamp(48px, 5vw, 72px);
    height: clamp(48px, 5vw, 72px);
    background: var(--vermilion);
    color: var(--on-lime);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-brush);
    font-size: clamp(28px, 2.8vw, 42px);
    line-height: 1;
    transform: rotate(-4deg);
    box-shadow:
      inset 0 0 0 2px var(--vermilion-deep),
      inset 0 0 0 4px var(--vermilion),
      inset 0 0 0 5px var(--vermilion-deep);
    /* sumi-bleed feel */
    filter: url(#hanko-rough);
  }
  .hanko::after{
    content: ""; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='1'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -0.5 1.1'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    mix-blend-mode: lighten;
    opacity: .35;
    pointer-events: none;
  }

  .hero-subtitle{
    margin-top: clamp(28px, 4vw, 44px);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .hero-subtitle h1{
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--ink);
    line-height: .9;
  }
  .title-aikido{
    font-size: clamp(56px, 9vw, 140px);
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }
  .title-place{
    display: flex; align-items: center; gap: 14px;
    width: 100%; max-width: 320px;
  }
  .title-place .line{ flex: 1; height: 1px; background: var(--rule); }
  .title-place .place-name{
    font-family: var(--font-label);
    font-weight: 600;
    font-size: clamp(14px, 1.8vw, 20px);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: var(--ink-soft);
    white-space: nowrap;
  }
```

(Leave `.hero-subtitle p{...}` and its `@media (max-width: 600px)` block, currently lines 220-237, untouched — they still apply to the same `<p>`.)

- [ ] **Step 4: Verify in browser at desktop width**

Run: `python3 -m http.server 3000` from the repo root, open `http://localhost:3000` at a desktop viewport (≥1280px wide).
Expected, all visible immediately (no animation yet — that's Task 3):
- A circular brush-stroke shape (enso) is visible behind the kanji, roughly centered, with a visible gap (not a closed ring).
- `合`, `気`, `道` are stacked vertically inside the circle, all in the lime/yellow accent color (not white/ink).
- Below the circle: large `AIKIDO`, then a smaller `— PRUSZKÓW —` line with thin rules on either side.
- The hanko stamp `武` still appears near the bottom-right of the circle, not badly clipped or overlapping kanji.
- Nothing else on the page moved or broke (nav, schedule poster below, footer).

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: rebuild hero with enso circle + two-tier title (static)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Add the draw-on-load animation with reduced-motion support

**Files:**
- Modify: `css/styles.css` (insert new block right after the `.hero-subtitle p` mobile media query, i.e. after the block ending at what was line 237 before Task 2's edits — locate it by searching for `.hero-subtitle p .mean{ margin-top: 2px; }` and insert after its closing `}`)

**Interfaces:**
- Consumes: `.enso-shadow`, `.enso-main`, `.kakejiku .kchar` from Task 2 (styled there in their final/visible state).
- Produces: nothing consumed by later tasks — this is a leaf enhancement.

- [ ] **Step 1: Insert the animation block**

Find this existing block in `css/styles.css` (unchanged by Task 2):

```css
  .hero-subtitle p .pron, .hero-subtitle p .mean{ display: inline; }
  @media (max-width: 600px){
    .hero-subtitle p{ white-space: normal; }
    .hero-subtitle p .sep{ display: none; }
    .hero-subtitle p .pron, .hero-subtitle p .mean{ display: block; }
    .hero-subtitle p .mean{ margin-top: 2px; }
  }
```

Immediately after its closing `}`, insert:

```css

  /* ─────────── hero: enso draw-on-load animation ─────────── */
  @media (prefers-reduced-motion: no-preference){
    .enso-shadow, .enso-main{
      stroke-dashoffset: 100;
      opacity: 0;
      animation: enso-draw 1.6s ease-out forwards;
    }
    .enso-main{ animation-duration: 1.4s; animation-delay: .25s; }

    .kakejiku .kchar{
      opacity: 0;
      transform: translateY(6px);
      animation: kanji-in .6s ease-out 1.05s forwards;
    }

    @keyframes enso-draw{
      0%{ stroke-dashoffset: 100; opacity: 0; }
      12%{ opacity: 1; }
      100%{ stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes kanji-in{
      to{ opacity: 1; transform: none; }
    }
  }
```

- [ ] **Step 2: Verify animated state in browser**

Run: `python3 -m http.server 3000`, open `http://localhost:3000` in a fresh tab (hard-reload to re-trigger, e.g. Cmd+Shift+R).
Expected: on load, the enso circle visibly "draws" itself (shadow stroke first, main stroke slightly after), and the kanji fade/settle in shortly after, ending in the exact same final visual state verified in Task 2 Step 4. Reloading again replays it (expected — it's a page-load animation, not a one-time-ever guarantee across reloads, matching the design doc's "once per page load" requirement).

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools: Cmd+Shift+P → "Show Rendering" → set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reload the page.
Expected: enso circle and kanji appear instantly, fully drawn/visible, with zero animation — identical to the Task 2 Step 4 static verification. Turn the emulation back off (or set to "No emulation") when done.

- [ ] **Step 4: Commit**

```bash
git add css/styles.css
git commit -m "feat: animate enso draw-on-load, respect prefers-reduced-motion

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Mobile responsive tuning + final cross-breakpoint QA

**Files:**
- Modify: `css/styles.css:412-431` (the `hero mobile fixes` block — line numbers will have shifted from Tasks 2-3's insertions; locate by the comment `/* ─────────── hero mobile fixes ─────────── */`)

**Interfaces:**
- Consumes: `.enso-kakejiku`, `.hanko`, `.title-place`, `.title-place .place-name`, `.hero-subtitle p`, `.hero-eyebrow .mono` from Tasks 2-3.
- Produces: nothing consumed elsewhere — final task.

- [ ] **Step 1: Replace the hero mobile fixes block**

Replace this (old selectors referenced the pre-redesign horizontal `.kakejiku` and old `.place-name` location):

```css
  /* ─────────── hero mobile fixes ─────────── */
  @media (max-width: 900px){
    .kakejiku{ gap: 4px; padding: 0 24px; }
    .hanko{ right: 4px; bottom: 4px; }
  }
  @media (max-width: 600px){
    .kakejiku{ gap: 6px; padding: 0; }
    .hanko{
      position: static;
      display: block;
      margin: 14px auto 0;
      transform: rotate(-4deg);
      width: 52px; height: 52px;
      font-size: 28px;
    }
    .hero-subtitle h1{ letter-spacing: .02em; gap: 10px; }
    .hero-subtitle h1 .place-name{ letter-spacing: .18em; }
    .hero-subtitle p{ letter-spacing: .16em; font-size: 10.5px; }
    .hero-eyebrow .mono{ letter-spacing: .18em; font-size: 10.5px; }
  }
```

With:

```css
  /* ─────────── hero mobile fixes ─────────── */
  @media (max-width: 900px){
    .enso-kakejiku{ width: clamp(180px, 46vw, 300px); }
  }
  @media (max-width: 600px){
    .enso-kakejiku{ width: clamp(160px, 58vw, 240px); }
    .hanko{
      position: static;
      display: block;
      margin: 14px auto 0;
      transform: rotate(-4deg);
      width: 52px; height: 52px;
      font-size: 28px;
    }
    .title-place{ max-width: none; }
    .title-place .place-name{ letter-spacing: .18em; }
    .hero-subtitle p{ letter-spacing: .16em; font-size: 10.5px; }
    .hero-eyebrow .mono{ letter-spacing: .18em; font-size: 10.5px; }
  }
```

- [ ] **Step 2: Final cross-breakpoint + motion QA pass**

Run: `python3 -m http.server 3000`, open `http://localhost:3000`.

Using Chrome DevTools device toolbar, check each of these and confirm no overlap/clipping/overflow in the hero section:
- **375px width** (mobile): enso + kanji stack is legible and centered, hanko sits below the circle (static, not overlapping), title and eyebrow don't wrap awkwardly, no horizontal scrollbar appears on `<body>`.
- **768px width** (tablet): enso scales up smoothly, hanko is back to absolute-positioned near the circle's edge without clipping outside the viewport.
- **≥1280px width** (desktop): matches the Task 2 Step 4 / Task 3 Step 2 verification exactly.
- Re-run the Task 3 Step 3 reduced-motion check at 375px too: static, fully-visible, no animation.
- Confirm `kchar` kanji tooltips (`data-kanji-tip`) still show on hover/focus at desktop width (unchanged behavior, just confirming the attribute survived the markup rewrite).

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "style: tune enso hero for mobile/tablet breakpoints

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Post-plan

This plan does not include pushing to `main` or deploying — per project convention (`CLAUDE.md`), pushing to `main` auto-deploys to staging, and that should only happen with explicit user confirmation. Stop after Task 4 and hand back to the user for review/push decision.
