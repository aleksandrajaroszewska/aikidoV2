# Aikido Pruszków — strona sekcji

Jednostronicowa wizytówka sekcji aikido w Pruszkowie (część klubu Warszawskie Centrum Aikido).
Czysty, statyczny HTML/CSS/JS — **bez frameworka, bez build stepu, bez npm**.

- Produkcja: https://aikido.pruszkow.pl
- Staging: https://staging.aikido.pruszkow.pl

## Struktura

- `index.html` — markup strony
- `js/script.js` — trzy zachowania: scroll reveal (IntersectionObserver dodaje `.in` do `.reveal`),
  przełącznik panelu nawigacji na mobile, zdejmowanie `open` z `<details class="more">` poniżej 760px
- `css/` — style w dziewięciu plikach. **Numer w nazwie to kolejność kaskady** —
  taka sama jak kolejność `<link>` w `<head>`. Przestawienie ich zmienia wynik.

| plik | zawartość |
|---|---|
| `01-fonts.css` | `@font-face`, `@property --sweep` |
| `02-tokens.css` | `:root` i `body.palette-dark` — jedyne źródło kolorów i skali |
| `03-base.css` | reset, tekstura tła, typografia bazowa, `.wrap`, `.sr-only` |
| `04-topbar.css` | sticky pasek, marka, przycisk „menu", nawigacja (panel na mobile, rząd od 760px) |
| `05-hero.css` | ensō, kanji, lockup, CTA + cała oś czasu animacji |
| `06-sections.css` | rusztowanie sekcji: `.bloc`, `.sec-head`, `.split`, `.photo-band` |
| `07-tables.css` | grafik (`.sched`) i cennik (`#cennik`, `.fees`) |
| `08-blocks.css` | `.more` (zwijanie akapitów), portret, fakty, blok kontaktu, stopka |
| `09-utilities.css` | przyciski, scroll reveal, `prefers-reduced-motion` — **musi być ostatni** |

- `assets/` — grafika:

| plik | rozmiar źródła | rola |
|---|---|---|
| `enso.webp` | 1500×1500 | znak ensō, 4 warstwy w hero |
| `foto-rzut.webp` | 1110×741 | pas nagłówkowy sekcji 02 |
| `foto-instruktor.webp` | 1416×1888 | portret w sekcji 03 (3:4 = proporcja pliku, zero kadrowania) |
| `foto-dojo.webp` | 2000×1335 | pas zamykający przed sekcją 06 |
| `mapa-dojo.webp` | 1440×960 | mapa okolicy przy nagłówku sekcji 05 — patrz „Mapa" |
| `favicon.svg` | 1000×1000 | znak 気 pędzlem, limonka na grafitowej zieleni — patrz „Favicon" |

Zdjęcia czarno-białe, z sesji w dojo, wyeksportowane z JPG-ów handoffu do webp (q82, Pillow):
880 KB → 249 KB. `foto-rzut` ma tylko 1110 px szerokości, a leży na pasie na całą szerokość —
na ekranie ≥1440 px jest lekko skalowane w górę. Jeśli pojawi się oryginał w wyższej
rozdzielczości, warto go podmienić.

Strona ma jeden ekran hero i sześć sekcji w kolejności DOM:
`#droga` (01) · `#grafik` (02) · `#instruktor` (03) · `#cennik` (04) · `#dojo` (05) · `#kontakt` (06).

## Podgląd lokalny

```bash
python3 -m http.server 3000
```

i otwórz http://localhost:3000

## Cykl pracy (deploy)

1. **Edytujesz pliki** lokalnie i sprawdzasz podgląd w przeglądarce.
2. **Commit + push do `main`:**
   ```bash
   git add -A
   git commit -m "opis zmiany"
   git push
   ```
3. **Staging aktualizuje się sam** — push do `main` uruchamia workflow
   „Deploy to staging" (GitHub Actions), który wgrywa pliki po SFTP.
   Po ok. minucie zmiany widać na https://staging.aikido.pruszkow.pl
   (twardy refresh: `Cmd+Shift+R`).
4. **Produkcja — tylko ręcznie.** Gdy staging wygląda dobrze:
   GitHub → zakładka **Actions** → **„Deploy to production"** → **„Run workflow"** → gałąź `main`.
   Nic nie trafi na produkcję bez tego kliknięcia.

Dane dostępowe SFTP są w sekretach repo (`Settings → Secrets and variables → Actions`):
`SFTP_HOST`, `SFTP_USERNAME`, `SFTP_PASSWORD`. Nigdy nie wpisuj ich w plikach repo.

Uwaga: deploy **nie kasuje** plików na serwerze — tylko dodaje i nadpisuje.
Jeśli usuniesz plik z repo, jego starą kopię trzeba usunąć z serwera ręcznie (FileZilla).

## Awaryjne cofnięcie produkcji

Backup starej strony: `../backup_produkcja_2026-07-18/` (lokalnie, poza repo).
W razie problemu: FileZilla (SFTP) → `/home/aikido/domains/aikido.pruszkow.pl/private_html` →
usuń zawartość → wgraj pliki z backupu.

## Konwencje (nie zmieniać bez powodu)

- **Mobile-first.** Style bazowe opisują wąski ekran, bez żadnej media query. Szersze układy
  dokłada się wyłącznie przez `min-width`. W całym projekcie są **dwa progi**: `601px`
  (lockup hero mieści się w jednej linii) i `760px` (układy dwukolumnowe, hero na pełny ekran).
  Nie dokładaj trzeciego bez powodu. Media query na cechę (`hover`, `prefers-reduced-motion`)
  to osobna sprawa i siedzą przy swoich komponentach.
- Klasa na `<body>`: `palette-dark` — jedyny przełącznik motywu. (Wcześniej były jeszcze
  `display-oswald`, `hero-stacked` i `divider-linia`; dwie ostatnie nie miały żadnej reguły
  CSS, a `display-oswald` ustawiał tę samą wartość co `:root`. Usunięte razem z wariantami
  `palette-bw`, `palette-teal`, `display-noto` i trzema wariantami dividerów.)
- Kolory wyłącznie przez zmienne CSS (`--paper`, `--ink`, `--vermilion`, …) zdefiniowane
  w `css/02-tokens.css`. `:root` ma jasną paletę, `body.palette-dark` nadpisuje ją ciemną
  paletą „limonka na grafitowej zieleni" (Pantone 3945 C na #0F1A09) — nie usuwać `:root`.
- `--vermilion` **zmienia się z paletą** (na jasnej schodzi do oliwki #6B6800, bo limonka nie
  spełnia kontrastu jako tekst na jasnym tle). Gdy kolor ma być limonką zawsze — jak znak 気
  w topbarze, który musi zgadzać się z faviconem — użyj stałego `--lime`.
- `.reveal` chowa sekcję **tylko pod `html.js`**. Klasę ustawia jednolinijkowy skrypt w `<head>`.
  Gdy JS nie wystartuje, treść po prostu jest widoczna. Nie przenoś tego ukrywania na goły `.reveal`.
  Ta sama bramka `html.js` chowa `.nav-toggle` — bez JS-a przycisk byłby martwy, więc go nie ma.
- **Nawigacja na mobile** to panel pozycjonowany absolutnie względem sticky `.topbar` (`top: 100%`),
  otwierany klasą `.is-open`. Tło **kryjące** (`--paper`), nie `--glass` jak pasek: panel przykrywa
  ~660px strony i przy półprzezroczystym tle hero czytało się w poprzek etykiet menu. Blok
  `@media (min-width: 760px)` wymienia `.nav` **i** `.topbar.is-open .nav` z tymi samymi regułami —
  inaczej panel zostawiony otwarty przy zmianie szerokości bije desktopowy reset specyficznością.
- **Długie akapity zwijają się na mobile** przez `<details class="more" open>` wokół wszystkiego
  poza pierwszym akapitem (sekcje 01 i 03). Atrybut `open` siedzi w HTML-u, a JS go **zdejmuje**
  poniżej 760px — nigdy odwrotnie. Dokładanie `open` na desktopie dawałoby skok układu przy pierwszym
  malowaniu, a przy wyłączonym JS chowało treść przed czytelnikiem i wyszukiwarką. `margin-top`
  w `.more > p` jest świadomie przepisany z gapa rodzica (`.prose` clamp) — przy zmianie
  jednego trzeba ruszyć drugie, inaczej między akapitem pierwszym a drugim robi się podwójna dziura.
- W polskich tekstach `&nbsp;` przed krótkimi słowami (np. `w&nbsp;Pruszkowie`), żeby nie wisiały na końcu linii.
- Fonty **self-hostowane** z `assets/fonts/` (Oswald — nagłówki, Barlow Condensed — etykiety/nawigacja/godziny,
  Barlow — tekst, Yuji Boku — wyłącznie kanji). Bez Google Fonts CDN — zero zewnętrznych originów.
  Patrz „Fonty" niżej.
- Rozmiary tekstu **wyłącznie przez tokeny skali** `--fs-100`…`--fs-600` i `--fs-display-*` (`:root`
  w `css/02-tokens.css`). Podłoga to `--fs-100` (14px), baza `--fs-400` (19px) — nic na stronie nie schodzi niżej.
  Twarde wartości px zostają tylko przy glifach dekoracyjnych (wielkie kanji, kwoty).
- Rozmiar tekstu **nigdy w `vh`** — nie reaguje na zoom przeglądarki (WCAG 2.2 SC 1.4.4).
  Jedyny wyjątek to `.kakejiku`, czyli dekoracyjne kanji w hero, które ma wypełnić wysokość ekranu.
- Nagłówki sekcji mają **dwa rejestry**: `--fs-display-l` dla sekcji roboczych (03, 04, 05)
  i `--fs-display-xl` dla manifestowych (01, 02, 06). Kroki tekstowe `--fs-100`…`--fs-600` są
  celowo stałe, nie w `vw` — inaczej nie reagują na zoom, a i tak przez większość czasu siedzą
  na dolnej granicy `clamp()`.
- Tekst nie jest przygaszany przez `opacity` — kontrast niesie token (`--ink-soft`, `--ink-faint`).
- **Pasy zdjęciowe** (`.photo-band`, sekcje 02 i przed 06) idą na całą szerokość okna, więc sama
  `aspect-ratio` wiązałaby ich wysokość z szerokością ekranu bez ograniczenia (na 2560px dałaby
  ponad 1000px). Dlatego mają `max-height` — i to on, a nie proporcja, zwykle decyduje o wysokości.
  Zmieniając wysokość pasa sprawdź **oba** parametry naraz.
- Zdjęcia wtapiają się w tło, nie kończą twardą krawędzią: pasy przez `.photo-band-scrim`
  (gradient do `var(--paper)` u góry i u dołu), portret instruktora przez dwuwarstwową
  `mask-image` z `mask-composite: intersect` — bo stoi w kolumnie i musi gasnąć także po bokach.
- Kadr zdjęć: `object-position: 50% 20%`. Kadr centralny ucina głowy, a `top` przy niskim
  pasie pokazuje sam sufit sali.

## Fonty

W repo leżą **gotowe pliki `.woff2`** w `assets/fonts/` — projekt nadal nie ma build stepu.
Subsetowanie to jednorazowa czynność autorska (jak eksport `.webp`), nie krok budowania.

| Plik | Rola | Waga |
|---|---|---|
| `oswald-700.woff2` | nagłówki, kwoty, adres dojo | 700 |
| `barlow-condensed-500.woff2` | hero, dni tygodnia | 500 |
| `barlow-condensed-600.woff2` | etykiety, nawigacja, **godziny** | 600 |
| `barlow-400.woff2` | tekst | 400 |
| `barlow-500.woff2` | wyróżnienia w tekście | 500 |
| `yuji-boku-kanji.woff2` | wyłącznie kanji (9 glifów) | 400 |

Razem 78 KB (79 608 B). Yuji Boku to font japoński — oryginał ma 8,5 MB, subset do faktycznie
używanych znaków `合気道子少大場所・` waży 4,2 KB.

Po przebudowie na układ 01–06 strona używa już tylko `合気道` (hero + stopka) — subset ma
6 glifów zapasu (`子少大場所・`). Zostawione celowo: przegenerowanie oszczędziłoby ~2 KB,
a zapas przydaje się przy powrocie kanji przy nazwach grup. `unicode-range` w `@font-face`
musi wtedy zostać bez zmian.

Godziny w grafiku muszą używać **Barlow Condensed, nie Oswald** — tylko on niesie cechę
`tnum`, bez której `font-variant-numeric: tabular-nums` jest martwym zapisem i cyfry
nie ustawiają się w kolumnę między wierszami.

### Odtworzenie subsetów

```bash
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
B=https://raw.githubusercontent.com/google/fonts/main
curl -L -o /tmp/Oswald.ttf "$B/ofl/oswald/Oswald%5Bwght%5D.ttf"
/tmp/fontenv/bin/fonttools varLib.instancer /tmp/Oswald.ttf wght=700 -o /tmp/Oswald-700.ttf

LATIN="U+0000-00FF,U+0100-017F,U+2000-206F,U+2190-21FF"   # łacinka + PL + ō + interpunkcja
/tmp/fontenv/bin/pyftsubset /tmp/Oswald-700.ttf \
  --output-file=assets/fonts/oswald-700.woff2 --flavor=woff2 \
  --unicodes="$LATIN" --layout-features+=tnum --desubroutinize --no-hinting

# kanji — subset po znakach, nie po zakresach
/tmp/fontenv/bin/pyftsubset /tmp/YujiBoku.ttf \
  --output-file=assets/fonts/yuji-boku-kanji.woff2 --flavor=woff2 \
  --text='合気道子少大場所・' --desubroutinize --no-hinting
```

`--layout-features+=tnum` jest obowiązkowe dla Barlow Condensed — domyślny zestaw
pyftsubset go nie zawiera i cecha wypadłaby z pliku.

Po dołożeniu nowego kanji na stronie trzeba **przegenerować subset i dopisać codepoint**
do `unicode-range` w `@font-face` w `css/01-fonts.css` — inaczej znak nie wyświetli się pędzlem.

## Favicon

`assets/favicon.svg` to znak 気 („ki") w kroju Yuji Boku — limonka `#E1E000` na grafitowej
zieleni `#0F1A09`, ten sam znak co przy nazwie dojo w topbarze.

Glif jest wpisany jako **obrys** (`<path>`), nie jako tekst: favicon renderuje się poza stroną,
więc nie ma dostępu do jej fontów, a `<text>` trafiłby na przypadkowy systemowy font CJK.
Odtworzenie po podmianie fontu — obrys trzeba wtedy wyciągnąć od nowa:

```bash
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
/tmp/fontenv/bin/python - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
f = TTFont("assets/fonts/yuji-boku-kanji.woff2")
name = f.getBestCmap()[0x6C17]          # 気
pen = SVGPathPen(f.getGlyphSet()); f.getGlyphSet()[name].draw(pen)
g = f["glyf"][name]
cx, cy = (g.xMin + g.xMax) / 2, (g.yMin + g.yMax) / 2
s = round(780 / max(g.xMax - g.xMin, g.yMax - g.yMin), 4)   # 780/1000 = margines 11%
print(f'transform="translate(500 500) scale({s} -{s}) translate({-cx} {-cy})"')
print(pen.getCommands())
PY
```

`scale(s, -s)` odwraca oś Y — w foncie rośnie w górę, w SVG w dół.

## Mapa

`assets/mapa-dojo.webp` to **statyczny render**, nie `<iframe>` z Google Maps. Powód jest
ten sam co przy fontach: strona nie ma ani jednego zewnętrznego originu, więc nie ma też
skryptów i cookies stron trzecich do obsłużenia. Klikalne wyjście do map daje przycisk
„Otwórz w Google Maps" pod obrazkiem — sam obrazek nie jest linkiem, żeby ta sama akcja
nie występowała w drzewie dwa razy.

Zrzutu z Google Maps **nie wolno tu wstawić** — ich ToS dopuszcza statyczne obrazy tylko
przez płatne Static Maps API. Kafelki pochodzą z bazowej mapy CARTO `dark_all` na danych
OpenStreetMap; obie licencje wymagają atrybucji i to jest rola `<figcaption class="map-credit">`
— nie usuwać jej razem z jakimś porządkowaniem tekstu.

Przyciemnienie do palety jest **wypalone w pliku**, nie robione filtrem CSS. Kafelki
`dark_all` są neutralnie szare i siedzą w wąskim paśmie jasności (mediana L≈9, etykiety
L≈51), więc samo przetonowanie bez rozciągnięcia histogramu zjada ulice.

Odtworzenie (Pillow; zmiana kadru = `ZOOM`, środek = `LAT`/`LON`):

```bash
python3 - <<'PY'
import io, math, urllib.request
from PIL import Image, ImageDraw

LAT, LON, ZOOM = 52.1717382, 20.8137024, 17   # SP nr 1, ul. Topolowa 10
OUT_W, OUT_H, TILE = 1440, 960, 512           # TILE 512 = kafelki @2x
UA = "aikido-pruszkow-site/1.0 (+https://aikido.pruszkow.pl)"

n = 2 ** ZOOM
px = (LON + 180) / 360 * n * TILE
py = (1 - math.asinh(math.tan(math.radians(LAT))) / math.pi) / 2 * n * TILE
left, top = px - OUT_W / 2, py - OUT_H / 2
x0, y0 = math.floor(left / TILE), math.floor(top / TILE)
x1, y1 = math.floor((left + OUT_W) / TILE), math.floor((top + OUT_H) / TILE)

canvas = Image.new("RGB", ((x1 - x0 + 1) * TILE, (y1 - y0 + 1) * TILE))
for tx in range(x0, x1 + 1):
    for ty in range(y0, y1 + 1):
        url = f"https://basemaps.cartocdn.com/dark_all/{ZOOM}/{tx}/{ty}@2x.png"
        r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30)
        canvas.paste(Image.open(io.BytesIO(r.read())).convert("RGB"), ((tx - x0) * TILE, (ty - y0) * TILE))

ox, oy = int(left - x0 * TILE), int(top - y0 * TILE)
gray = canvas.crop((ox, oy, ox + OUT_W, oy + OUT_H)).convert("L")

# rozciągnięcie histogramu (mediana → 0, percentyl 99,9 → 1) + duotone --paper → --ink-soft
hist, total, acc, marks = gray.histogram(), gray.width * gray.height, 0, {}
for i, c in enumerate(hist):
    acc += c
    for p in (0.5, 0.999):
        if p not in marks and acc >= total * p:
            marks[p] = i
lo, hi = marks[0.5], marks[0.999]
DARK, LIGHT = (15, 26, 9), (219, 225, 203)
curve = [max(0.0, min(1.0, (v - lo) / (hi - lo))) ** 0.62 for v in range(256)]
ramp = bytes(max(0, min(255, round(DARK[c] + (LIGHT[c] - DARK[c]) * curve[i])))
             for c in range(3) for i in range(256))
img = Image.merge("RGB", [gray.point(ramp[c * 256:(c + 1) * 256]) for c in range(3)])

# znacznik w limonce --lime; pierścień, żeby nie zasłonić budynku szkoły
d = ImageDraw.Draw(img, "RGBA")
mx, my = OUT_W // 2, OUT_H // 2
d.ellipse((mx - 54, my - 54, mx + 54, my + 54), fill=(225, 224, 0, 40))
d.ellipse((mx - 34, my - 34, mx + 34, my + 34), outline=(225, 224, 0, 255), width=9)
d.ellipse((mx - 13, my - 13, mx + 13, my + 13), fill=(225, 224, 0, 255))
img.save("assets/mapa-dojo.webp", "WEBP", quality=72, method=6)
PY
```

Zoom 17 nie jest przypadkowy: kolumna boczna ma na desktopie ~460 px, więc obraz 1440 px
jest skalowany w dół ~0,32× — na zoomie 16 nazwy ulic robiły się nieczytelne.

## Dane na stronie

**Źródłem prawdy jest `index.html`, nie ten plik.** Grafik, cennik, adres i kontakt
edytuje się wyłącznie w markupie:

| dane | gdzie |
|---|---|
| grafik treningów | `<table class="sched">` w sekcji `#grafik` |
| cennik | `<table class="fees">` w sekcji `#cennik` |
| adres dojo | nagłówek sekcji `#dojo` |
| telefon, e-mail, Facebook | `<ul class="contact-links">` w sekcji `#kontakt` |

Wcześniej te same dane leżały też tutaj i obie kopie zdążyły się rozjechać
(README podawał „Dorośli od 15 lat" i przelicznik kwartalny, których na stronie nie ma).
Jedno źródło = zero synchronizacji.
