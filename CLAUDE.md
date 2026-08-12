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

Three files do everything:

- `index.html` (~440 lines) — all markup, sections anchored by id (`#grupy`, `#instruktorzy`, `#cennik`, `#dojo`, `#klub`, `#kontakt`).
- `css/styles.css` (~1100 lines) — design tokens in `:root`, then layout/components/media queries in one file.
- `js/script.js` — only two behaviors: group tabs (`.group-tab`/`.group-panel` with `data-tab`/`data-panel`) and scroll-reveal (`.reveal` + IntersectionObserver adds `.in`).

## Conventions (from README — don't change without reason)

- The `<body>` classes `palette-dark display-oswald hero-stacked divider-linia` are theme switches that control the whole look.
- Colors only via CSS variables (`--paper`, `--ink`, `--vermilion`, …, defined in `css/styles.css`). `:root` holds the light palette; `body.palette-dark` overrides it with the dark "limonka na grafitowej zieleni" (19a) palette — Pantone 3945 C lime on graphite green. Never delete the `:root` block.
- Kanji tooltips: `data-kanji-tip="translation"` attribute on elements containing kanji.
- In Polish text, put `&nbsp;` after short one-letter words (e.g. `w&nbsp;Pruszkowie`) to avoid orphans at line ends.
- Fonts come from Google Fonts CDN in `<head>`.

## Content source of truth

The README's "Dane na stronie" section holds the canonical schedule, pricing, address, and contact data. When updating page content, keep README and `index.html` in sync.
