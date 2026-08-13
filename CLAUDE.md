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
- Deploys only add/overwrite files (`delete_remote_files: false` — the SFTP action's delete mode is broken on this server, don't re-enable it). Files removed from the repo must be deleted from the server manually via FileZilla.
- SFTP credentials live in repo Actions secrets (`SFTP_HOST`, `SFTP_USERNAME`, `SFTP_PASSWORD`) — never in files.

## Architecture

- `index.html` (~320 lines) — all markup, sections anchored by id (`#droga`, `#grafik`, `#instruktor`, `#cennik`, `#dojo`, `#kontakt`).
- `css/` — nine files, `01-fonts` … `09-utilities`. **The number in the filename is the cascade order**, matching the `<link>` order in `<head>`; reordering them changes the result. `09-utilities.css` must stay last (it holds the `prefers-reduced-motion` block). Full table in the README.
- `js/script.js` (13 lines) — one behavior only: scroll-reveal (`.reveal` + IntersectionObserver adds `.in`).

There is no `css/styles.css` any more — it was split. Don't recreate it.

## Conventions (from README — don't change without reason)

- **Mobile-first, no exceptions.** Base styles carry the narrow layout with no media query; wider layouts are added only via `min-width`. There are exactly **two width breakpoints** in the project: `601px` and `760px`. Don't add a third without a reason. Feature queries (`hover`, `prefers-reduced-motion`) live next to the components they affect.
- The only `<body>` theme switch is `palette-dark`. The old `display-oswald`, `hero-stacked` and `divider-linia` classes were removed (two had no CSS rules at all; the third duplicated `:root`), along with the unused `palette-bw`, `palette-teal`, `display-noto` and three divider variants. Don't reintroduce variant classes speculatively.
- Colors only via CSS variables (`--paper`, `--ink`, `--vermilion`, …, defined in `css/02-tokens.css`). `:root` holds the light palette; `body.palette-dark` overrides it with the dark "limonka na grafitowej zieleni" (19a) palette — Pantone 3945 C lime on graphite green. Never delete the `:root` block.
- `--vermilion` is palette-dependent (olive `#6B6800` on light, lime on dark). When something must be lime in every palette — the 気 in the topbar, which has to match `assets/favicon.svg` — use the constant `--lime`.
- `.reveal` hides content **only under `html.js`**, a class set by a one-line script in `<head>`. If JS never runs, the content simply shows. Never move that hiding onto a bare `.reveal` — it would blank the whole page without JS.
- Kanji hover tooltips are gone (`data-kanji-tip` and its CSS). Decorative kanji get `aria-hidden="true"` when adjacent text already carries the meaning; the hero block keeps `role="img"` + `aria-label`.
- In Polish text, put `&nbsp;` after short one-letter words (e.g. `w&nbsp;Pruszkowie`) to avoid orphans at line ends.
- Fonts are **self-hosted** woff2 in `assets/fonts/` (no Google Fonts CDN, no external origins). Three are preloaded in `<head>`. Regenerating a subset: see README "Fonty".
- Text sizes come **only** from the scale tokens `--fs-100`…`--fs-600` / `--fs-display-*`. Floor is `--fs-100` (14px), base `--fs-400` (19px). Hardcoded px is allowed only for decorative glyphs (hero kanji, price amounts).
- Never size text in `vh` — it ignores browser zoom (WCAG 2.2 SC 1.4.4). The one exception is `.kakejiku`, the decorative hero kanji.
- The schedule is a real `<table>` with `scope="col"` headers, two columns only. Two columns fit down to 360px, so there is no stacked mobile reflow — don't reintroduce one.

## Content source of truth

`index.html` is the only source. Schedule lives in `<table class="sched">` (`#grafik`), pricing in `<table class="fees">` (`#cennik`), address in the `#dojo` heading, contact details in `#kontakt`. The README used to carry a second copy and the two drifted apart — don't reintroduce it.
