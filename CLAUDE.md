# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Small multi-page static website for the Aikido Pruszków dojo (part of Warszawskie Centrum Aikido). Plain HTML/CSS/JS — **no framework, no build step, no npm, no tests**. All page copy is in Polish.

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
- **Cache busting is automatic.** Every `.html` in the repo carries `?v=dev` on its `css/` and `js/` URLs; both deploy workflows loop over `**/*.html` (globstar, subdirectories included) and rewrite it to the deployed commit's short sha just before upload, failing the build if any file comes out unstamped. Never bump it by hand, and never commit a real value — a hand-edited page uploaded via FileZilla would ship `?v=dev` and stop busting caches. A new page is covered automatically, in the root or in a subdirectory like `pierwszy-trening/index.html`.
- **Rollback**: every successful production deploy from `main` pushes a `prod-YYYYMMDD-HHMM-sha` tag. To restore an earlier version, run "Deploy to production" and pick that tag instead of `main` — the sha stamp is re-applied from the tag, so the restored HTML points at the assets it originally shipped with. Deploying a tag does not create a new tag.
- SFTP credentials live in repo Actions secrets (`SFTP_HOST`, `SFTP_USERNAME`, `SFTP_PASSWORD`) — never in files.

## Architecture

- `index.html` — the home page and the hub: hero, `#droga`, `#zajecia` (three `.paths` tiles into the subpages), `#grafik`, `#cennik`, `#dojo`, `#kontakt`. It keeps the schedule, prices, address and contact — deliberately duplicating `grafik/`, `cennik/` and `kontakt/` — because it competes for "aikido Pruszków" (SEO decision, 11.11.2026). The instructor teaser went out: the biography has its own page. Navigation between pages never goes through a `#` anchor — every nav and footer link is a page URL; only in-page links stay anchors. The hero leads with the offer, not the season: "Pierwszy trening gratis", a CTA to `/pierwszy-trening/`, and a line with the audience, the days and the phone. Its copy is fully in by ~1.5s — keep the timeline in `05-hero.css` that short; the ensō may keep moving behind it. `#droga` ends with a `.facts` trust strip (since 2010, instructor 5 dan linking to `instruktor/`, WCA).
- Subpages, each a directory with `index.html` and `<main class="guide">`: `pierwszy-trening/`, `aikido-dla-dzieci/`, `aikido-dla-doroslych/`, `instruktor/`, `cennik/`, `grafik/`, `kontakt/`. Every path in them is **root-absolute** (`/css/…`). The full biography lives only in `instruktor/`.
- **The topbar nav and the footer are the same markup on every page with a nav** (the home page and the seven subpages) — six links, root-absolute: Dzieci, Dorośli, Pierwszy trening, Instruktor, Cennik, Kontakt. The footer's page list is longer (it adds the home page, Grafik and Dane osobowe) and must stay complete, since it is the no-JS route between pages. There is no include mechanism: a change to the nav or the footer is a change in every one of those files (the footer also in `rodo.html` and `404.html`). The current page carries `aria-current="page"`. The six labels and the brand just fit the 696px available at 760px — a seventh label or a longer one wraps the bar.
- `rodo.html` — the GDPR notice. Reached from the footer, deliberately not from the nav. It reuses the same nine stylesheets and the `.bloc` / `.sec-head` / `.prose` scaffolding, and loads **no JavaScript at all**: its topbar is the brand alone, so there is no `.nav-toggle` to drive. Give it a nav and both `js/script.js` and the inline `html.js` script have to come with it.
- `css/` — nine files, `01-fonts` … `09-utilities`. **The number in the filename is the cascade order**, matching the `<link>` order in `<head>`; reordering them changes the result. `09-utilities.css` must stay last (it holds the `prefers-reduced-motion` block). The seven subpages link eight of them — they skip `05-hero.css`, whose every rule targets the home-page hero — and preload `barlow-condensed-600` instead of the hero's `-500`.

| file | holds |
|---|---|
| `01-fonts.css` | `@font-face`, `@property --sweep` |
| `02-tokens.css` | `:root` and `body.palette-dark` — the only source of colours and scale |
| `03-base.css` | reset, background texture, base typography, `.wrap`, `.sr-only` |
| `04-topbar.css` | sticky bar, brand, "menu" button, nav (panel on mobile, row from 760px) |
| `05-hero.css` | ensō, kanji, lockup, CTA and the whole animation timeline |
| `06-sections.css` | section scaffolding: `.bloc`, `.sec-head`, `.split`, `.photo-band` |
| `07-tables.css` | schedule (`.sched`) and pricing (`.fees`) |
| `08-blocks.css` | portrait, facts, contact block, footer, `.paths` (home tiles), `.points` and `.guide` (subpages), `.legal` (rodo.html) |
| `09-utilities.css` | buttons, `.link`, `prefers-reduced-motion` — **must stay last** |
- `<main class="guide">` (all seven subpages) steps every title down to the text scale (h1 `--fs-600` at every width; h2 `--fs-500`; h3 `--fs-400` in the body face at 500) — they are pages to read, so the poster-size titles of the home page made them hard going. From 760px each `.guide .bloc` is a two-column grid: `.sec-head` on the left, exactly one body element on the right (a section with a single child spans both), so a section's copy has to be wrapped in one element — `.prose` when it is a table or paragraph plus a link. Headed paragraphs (steps, benefits, questions) use `.points`; an `<ol class="points">` gets visible step numbers from a CSS counter. Prices are on `cennik/` and the home page only (other subpages link to `/cennik/`); the schedule is restated.
- `404.html` — served by the server's `ErrorDocument` (set in the production `.htaccess`, not in this repo) at **whatever URL was missing**, `/a/b/c` included. That is why every path in it is root-absolute (`/css/…`, `/assets/…`); a relative one breaks the moment the missing URL has a slash in it. `noindex`, no JS, brand-only topbar — same build as `rodo.html`.
- `robots.txt`, `sitemap.xml` — hand-written. A new page means a new `<url>` in the sitemap in the same commit; bump `<lastmod>` of a page whose content changes. `404.html` stays out of it.
- `assets/og-aikido-pruszkow.jpg` (1200×630, the share preview) and `assets/apple-touch-icon.png` (180px) are one-off renders, like the font subsets: the first from `foto-dojo.webp` with Pillow, the second from `favicon.svg` with the rounded corners removed (iOS masks its own).
- `js/script.js` (~30 lines) — one behaviour: the mobile nav panel toggle. Loaded by every page that has the nav. The scroll-reveal (`.reveal` + IntersectionObserver) and the collapsing `<details class="more">` were removed together with their CSS — don't reintroduce either.

There is no `css/styles.css` any more — it was split. Don't recreate it.

## Conventions (don't change without reason)

- **Mobile-first, no exceptions.** Base styles carry the narrow layout with no media query; wider layouts are added only via `min-width`. There are exactly **two width breakpoints** in the project: `601px` and `760px`. Don't add a third without a reason. Feature queries (`hover`, `prefers-reduced-motion`) live next to the components they affect.
- The only `<body>` theme switch is `palette-dark`. The old `display-oswald`, `hero-stacked` and `divider-linia` classes were removed (two had no CSS rules at all; the third duplicated `:root`), along with the unused `palette-bw`, `palette-teal`, `display-noto` and three divider variants. Don't reintroduce variant classes speculatively.
- Colors only via CSS variables (`--paper`, `--ink`, `--vermilion`, …, defined in `css/02-tokens.css`). `:root` holds the light palette; `body.palette-dark` overrides it with the dark "limonka na grafitowej zieleni" (19a) palette — Pantone 3945 C lime on graphite green. Never delete the `:root` block.
- `--vermilion` is palette-dependent (olive `#6B6800` on light, lime on dark). When something must be lime in every palette — the 気 in the topbar, which has to match `assets/favicon.svg` — use the constant `--lime`.
- `.nav-toggle` is rendered **only under `html.js`**, a class set by a one-line script in `<head>` of every page with a nav: without JS the button would be dead, so it isn't shown at all. On a phone with JS off the panel therefore cannot be opened — the `.foot-nav` links in the footer are then the way between pages, so keep the footer's page list complete.
- **Mobile nav** is a panel absolutely positioned against the sticky `.topbar` (`top: 100%`), toggled by `.nav-toggle` adding `.is-open`. Its background is **opaque** (`--paper`), not the `--glass` of the bar — it covers ~660px of page, and at `--glass` the hero copy read straight through the menu labels. The `@media (min-width: 760px)` block lists both `.nav` and `.topbar.is-open .nav` with identical declarations, so a panel left open across the breakpoint can't out-specify the desktop reset.
- **Prose blocks use `.prose`** (a plain grid of paragraphs, `max-width: 62ch`) — used in `#droga`, next to the portrait in `instruktor/` and as the body column on subpages. The old two-column `.cols`/`.col` tiles are gone along with the per-group copy (Dorośli / Dzieci / Młodzież); the groups are listed in the `#grafik` table only.
- Kanji hover tooltips are gone (`data-kanji-tip` and its CSS). Decorative kanji get `aria-hidden="true"` when adjacent text already carries the meaning; the hero block keeps `role="img"` + `aria-label`.
- In Polish text, put `&nbsp;` after short one-letter words (e.g. `w&nbsp;Pruszkowie`) to avoid orphans at line ends.
- Fonts are **self-hosted** woff2 in `assets/fonts/` (no Google Fonts CDN, no external origins). Three are preloaded in `<head>`. The subsets are a one-off authoring step, not a build step; the `pyftsubset` recipe and the favicon outline script were dropped from the README — recover them from `git show 9844efd:README.md` if a font is ever swapped.
- Schedule hours must be set in **Barlow Condensed, not Oswald** — only it carries the `tnum` feature, without which `font-variant-numeric: tabular-nums` is a dead declaration and the digits stop lining up between rows.
- Adding a new kanji to the page means regenerating the Yuji Boku subset **and** extending `unicode-range` in `@font-face` (`css/01-fonts.css`) — otherwise the glyph falls back to a system CJK font instead of the brush face.
- Text sizes come **only** from the scale tokens `--fs-100`…`--fs-600` / `--fs-display-*`. Floor is `--fs-100` (14px), base `--fs-400` (19px). Hardcoded px is allowed only for decorative glyphs (hero kanji, price amounts).
- Never size text in `vh` — it ignores browser zoom (WCAG 2.2 SC 1.4.4). The one exception is `.kakejiku`, the decorative hero kanji.
- **The map in `#dojo` is a baked PNG-tile render** (`assets/mapa-dojo.webp`), never an `<iframe>` — the site has zero external origins and the map must not be the first. A Google Maps screenshot is not an option either (their ToS allows static images only via the paid Static Maps API); tiles come from CARTO `dark_all` on OSM data, and the `<figcaption class="map-credit">` is the licence-required attribution — don't delete it while the map is there. The dark tone is baked into the file, not a CSS filter. The Pillow regeneration recipe (tile maths, histogram stretch, marker) was dropped from the README — recover it from git history if the map ever needs redoing: `git show 9844efd:README.md`, section "Mapa".
- `#dojo` is the one section whose `.sec-head` sits **inside** `.split` (wrapped in `.dojo-intro`) instead of above it, so the map lands next to the address rather than under the copy. That's why `.dojo-intro .sec-head` zeroes the shared `margin-bottom`.
- The schedule is a real `<table>` with `scope="col"` headers, two columns only: group name + age range (`.sched-meta`) on the left, day + hour (`td.sched-when` → `.sched-day`, `.sched-time`) on the right — the day sits next to the hour and in ink, because "when" is what the table is scanned for. Two columns fit down to 360px, so there is no stacked mobile reflow — don't reintroduce one.
- **`rodo.html` carries the full art. 13 GDPR notice** and has no placeholders left — the `.todo` and `.legal-updated` rules went out of `08-blocks.css` with them, so don't reference either. Retention is stated as *criteria* and third parties as *categories* (art. 13(2)(a) and 13(1)(e) both allow it), deliberately: naming the hosting provider or a year count would only create copy that rots. Section 9 asserts the site itself has no cookies, no analytics and no external origins — that is a claim about the code, so adding any third-party embed, pixel or CDN means rewriting it in the same commit.

## Content source of truth

`index.html` is the source. Schedule lives in `<table class="sched">` (`#grafik`), pricing in `<table class="fees">` (`#cennik`), address in the `#dojo` heading, contact details in `#kontakt`. The JSON-LD block in `<head>` (`SportsActivityLocation` + `Person`) restates those facts for search engines — hours, prices, address, phone, coordinates — so a change to any of them is a change in two places in the same file. The schedule is restated on `grafik/` and `pierwszy-trening/` (all groups), `kontakt/` (all groups), `aikido-dla-dzieci/` (the two children's rows, also as prose in the intro `.sec-lead`) and `aikido-dla-doroslych/` (the adults' row, also in the intro); the hero's last line on the home page names the days. The phone number is in the topbar `.topbar-call` (phones only, every page with a nav), the hero, the footer (a `tel:` link on every page incl. `rodo.html` and `404.html`), the `tel:` and `sms:` links of every contact block, and the intro button of the subpages; the instructor's dates and rank are in `instruktor/` and in JSON-LD `jobTitle`; prices are restated on `cennik/` (table and meta description), and the quarterly saving ("o 30 zł taniej" — 3 × monthly minus quarterly, the same in both groups) is stated in the `#cennik` `.fees-foot` and the `cennik/` lead, so a price change means recomputing it; address and contact on `kontakt/`. Some of those facts are also restated as plain copy: the address, "Pierwszy trening gratis", the age range and "od 2010" in `<meta name="description">` and `og:description`, and the address in the footer of every page — grep for the old value before calling a change done. Coordinates are the pin of the Google Business Profile (52.1714723, 20.8142762), not the map centre of its URL. The main Facebook profile is `facebook.com/AikidoPruszkow/` — the one WCA links to; the site links to it in `#kontakt` and in `sameAs`, never to the second profile. The README used to carry a second copy and the two drifted apart — don't reintroduce it.
