# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

One-page static website for the Aikido Pruszków dojo (part of Warszawskie Centrum Aikido). Plain HTML/CSS/JS — **no framework, no build step, no npm, no tests**. All page copy is in Polish.

- Production: https://aikido.pruszkow.pl
- Staging: https://staging.aikido.pruszkow.pl

## Commands

Local preview (no build needed):

```bash
python3 -m http.server 3000   # then open http://localhost:3000
```

## Deploy model (important)

- **Push to `main` auto-deploys to staging** via GitHub Actions (`.github/workflows/deploy-staging.yml`, SFTP upload). Every push to `main` goes live on staging ~1 min later.
- **Production is manual only**: GitHub → Actions → "Deploy to production" → Run workflow. Never triggered automatically.
- Deploys only add/overwrite files (`delete_remote_files: false` — the SFTP action's delete mode is broken on this server, don't re-enable it). Files removed from the repo must be deleted from the server manually via FileZilla. Beyond being broken, delete mode would also wipe the production `.htaccess`, which lives on the server and not in this repo — there would be no way to restore it.
- **Cache busting is automatic.** Every `.html` in the repo root carries `?v=dev` on its `css/` and `js/` URLs; both deploy workflows loop over `*.html` and rewrite it to the deployed commit's short sha just before upload, failing the build if any file comes out unstamped. Never bump it by hand, and never commit a real value — a hand-edited page uploaded via FileZilla would ship `?v=dev` and stop busting caches. A new page added to the root is covered automatically; one added in a subdirectory is not.
- **Rollback**: every successful production deploy from `main` pushes a `prod-YYYYMMDD-HHMM-sha` tag. To restore an earlier version, run "Deploy to production" and pick that tag instead of `main` — the sha stamp is re-applied from the tag, so the restored HTML points at the assets it originally shipped with. Deploying a tag does not create a new tag.
- SFTP credentials live in repo Actions secrets (`SFTP_HOST`, `SFTP_USERNAME`, `SFTP_PASSWORD`) — never in files.

## Architecture

- `index.html` (~320 lines) — the one-pager, sections anchored by id (`#droga`, `#grafik`, `#instruktor`, `#cennik`, `#dojo`, `#kontakt`).
- `rodo.html` — the GDPR notice, the site's only other page. Reached from a footer link on both pages, deliberately not from the nav (which addresses sections of the one-pager). It reuses the same nine stylesheets and the `.bloc` / `.sec-head` / `.prose` scaffolding, and loads **no JavaScript at all**: it has no `.reveal`, no `.nav-toggle` and no `<details class="more">`, so neither `js/script.js` nor the inline `html.js` script belongs there. Add any of those three and both have to come back. Its topbar is the brand alone, linking home — no nav, hence no mobile panel to handle.
- `css/` — nine files, `01-fonts` … `09-utilities`. **The number in the filename is the cascade order**, matching the `<link>` order in `<head>`; reordering them changes the result. `09-utilities.css` must stay last (it holds the `prefers-reduced-motion` block).

| file | holds |
|---|---|
| `01-fonts.css` | `@font-face`, `@property --sweep` |
| `02-tokens.css` | `:root` and `body.palette-dark` — the only source of colours and scale |
| `03-base.css` | reset, background texture, base typography, `.wrap`, `.sr-only` |
| `04-topbar.css` | sticky bar, brand, "menu" button, nav (panel on mobile, row from 760px) |
| `05-hero.css` | ensō, kanji, lockup, CTA and the whole animation timeline |
| `06-sections.css` | section scaffolding: `.bloc`, `.sec-head`, `.split`, `.photo-band` |
| `07-tables.css` | schedule (`.sched`) and pricing (`#cennik`, `.fees`) |
| `08-blocks.css` | `.more` (collapsing paragraphs), portrait, facts, contact block, footer, `.legal` (rodo.html) |
| `09-utilities.css` | buttons, scroll reveal, `prefers-reduced-motion` — **must stay last** |
- `js/script.js` (~60 lines) — three behaviors: scroll-reveal (`.reveal` + IntersectionObserver adds `.in`), the mobile nav panel toggle, and stripping `open` from `<details class="more">` below 760px.

There is no `css/styles.css` any more — it was split. Don't recreate it.

## Conventions (don't change without reason)

- **Mobile-first, no exceptions.** Base styles carry the narrow layout with no media query; wider layouts are added only via `min-width`. There are exactly **two width breakpoints** in the project: `601px` and `760px`. Don't add a third without a reason. Feature queries (`hover`, `prefers-reduced-motion`) live next to the components they affect.
- The only `<body>` theme switch is `palette-dark`. The old `display-oswald`, `hero-stacked` and `divider-linia` classes were removed (two had no CSS rules at all; the third duplicated `:root`), along with the unused `palette-bw`, `palette-teal`, `display-noto` and three divider variants. Don't reintroduce variant classes speculatively.
- Colors only via CSS variables (`--paper`, `--ink`, `--vermilion`, …, defined in `css/02-tokens.css`). `:root` holds the light palette; `body.palette-dark` overrides it with the dark "limonka na grafitowej zieleni" (19a) palette — Pantone 3945 C lime on graphite green. Never delete the `:root` block.
- `--vermilion` is palette-dependent (olive `#6B6800` on light, lime on dark). When something must be lime in every palette — the 気 in the topbar, which has to match `assets/favicon.svg` — use the constant `--lime`.
- `.reveal` hides content **only under `html.js`**, a class set by a one-line script in `<head>`. If JS never runs, the content simply shows. Never move that hiding onto a bare `.reveal` — it would blank the whole page without JS. The same `html.js` gate hides `.nav-toggle`, for the same reason: without JS the button would be dead, so it isn't rendered at all.
- **Mobile nav** is a panel absolutely positioned against the sticky `.topbar` (`top: 100%`), toggled by `.nav-toggle` adding `.is-open`. Its background is **opaque** (`--paper`), not the `--glass` of the bar — it covers ~660px of page, and at `--glass` the hero copy read straight through the menu labels. The `@media (min-width: 760px)` block lists both `.nav` and `.topbar.is-open .nav` with identical declarations, so a panel left open across the breakpoint can't out-specify the desktop reset.
- **Long copy collapses on mobile** via `<details class="more" open>` around every paragraph after the first. Only section 03 (`#instruktor`) uses it — `#droga` was rewritten to two short paragraphs that stay expanded on every width, so it needs no toggle. The `open` attribute lives in the HTML and JS *removes* it below 760px — never the other way round. Adding `open` on desktop instead would shift the layout at first paint and, with JS off, hide the copy from readers and crawlers. The internal `margin-top` of `.more > p` is deliberately copied from the parent's grid `gap` (`.prose` the clamp) — change one, change the other, or a double gap opens between paragraphs one and two.
- **Prose blocks use `.prose`** (a plain grid of paragraphs, `max-width: 62ch`) — used in `#droga` and next to the portrait in `#instruktor`. The old two-column `.cols`/`.col` tiles are gone along with the per-group copy (Dorośli / Dzieci / Młodzież); the groups are listed in the `#grafik` table only.
- Kanji hover tooltips are gone (`data-kanji-tip` and its CSS). Decorative kanji get `aria-hidden="true"` when adjacent text already carries the meaning; the hero block keeps `role="img"` + `aria-label`.
- In Polish text, put `&nbsp;` after short one-letter words (e.g. `w&nbsp;Pruszkowie`) to avoid orphans at line ends.
- Fonts are **self-hosted** woff2 in `assets/fonts/` (no Google Fonts CDN, no external origins). Three are preloaded in `<head>`. The subsets are a one-off authoring step, not a build step; the `pyftsubset` recipe and the favicon outline script were dropped from the README — recover them from `git show 9844efd:README.md` if a font is ever swapped.
- Schedule hours must be set in **Barlow Condensed, not Oswald** — only it carries the `tnum` feature, without which `font-variant-numeric: tabular-nums` is a dead declaration and the digits stop lining up between rows.
- Adding a new kanji to the page means regenerating the Yuji Boku subset **and** extending `unicode-range` in `@font-face` (`css/01-fonts.css`) — otherwise the glyph falls back to a system CJK font instead of the brush face.
- Text sizes come **only** from the scale tokens `--fs-100`…`--fs-600` / `--fs-display-*`. Floor is `--fs-100` (14px), base `--fs-400` (19px). Hardcoded px is allowed only for decorative glyphs (hero kanji, price amounts).
- Never size text in `vh` — it ignores browser zoom (WCAG 2.2 SC 1.4.4). The one exception is `.kakejiku`, the decorative hero kanji.
- **The map in `#dojo` is a baked PNG-tile render** (`assets/mapa-dojo.webp`), never an `<iframe>` — the site has zero external origins and the map must not be the first. A Google Maps screenshot is not an option either (their ToS allows static images only via the paid Static Maps API); tiles come from CARTO `dark_all` on OSM data, and the `<figcaption class="map-credit">` is the licence-required attribution — don't delete it while the map is there. The dark tone is baked into the file, not a CSS filter. The Pillow regeneration recipe (tile maths, histogram stretch, marker) was dropped from the README — recover it from git history if the map ever needs redoing: `git show 9844efd:README.md`, section "Mapa".
- `#dojo` is the one section whose `.sec-head` sits **inside** `.split` (wrapped in `.dojo-intro`) instead of above it, so the map lands next to the address rather than under the copy. That's why `.dojo-intro .sec-head` zeroes the shared `margin-bottom`.
- The schedule is a real `<table>` with `scope="col"` headers, two columns only. Two columns fit down to 360px, so there is no stacked mobile reflow — don't reintroduce one.
- **`rodo.html` still has `[DO UZUPEŁNIENIA]` placeholders**, marked in the copy with `<span class="todo">` and styled loud on lime. They cover the administrator's registered details, retention periods, the hosting provider and the whole "photos of participants" point. The page must not go to production until every one is resolved; delete the `.todo` rule in `08-blocks.css` together with the last of them.

## Content source of truth

`index.html` is the only source. Schedule lives in `<table class="sched">` (`#grafik`), pricing in `<table class="fees">` (`#cennik`), address in the `#dojo` heading, contact details in `#kontakt`. The README used to carry a second copy and the two drifted apart — don't reintroduce it.
