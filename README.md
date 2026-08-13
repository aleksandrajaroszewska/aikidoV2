# Aikido Pruszków — strona sekcji

Jednostronicowa wizytówka sekcji aikido w Pruszkowie (część klubu Warszawskie Centrum Aikido).
Czysty, statyczny HTML/CSS/JS — **bez frameworka, bez build stepu, bez npm**.

- Produkcja: https://aikido.pruszkow.pl
- Staging: https://staging.aikido.pruszkow.pl

## Struktura

- `index.html` — markup strony
- `css/styles.css` — wszystkie style (tokeny, layout, komponenty, media queries)
- `js/script.js` — wyłącznie scroll reveal (IntersectionObserver dodaje `.in` do `.reveal`)
- `assets/` — grafika:

| plik | rozmiar źródła | rola |
|---|---|---|
| `enso.webp` | 1500×1500 | znak ensō, 4 warstwy w hero |
| `foto-rzut.webp` | 1110×741 | pas nagłówkowy sekcji 02 |
| `foto-instruktor.webp` | 1416×1888 | portret w sekcji 03 (3:4 = proporcja pliku, zero kadrowania) |
| `foto-dojo.webp` | 2000×1335 | pas zamykający przed sekcją 06 |

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

- Klasy na `<body>`: `palette-dark display-oswald hero-stacked divider-linia` — sterują całym wyglądem.
- Kolory wyłącznie przez zmienne CSS (`--paper`, `--ink`, `--vermilion`, …) zdefiniowane w `css/styles.css`.
  `:root` ma jasną paletę, `body.palette-dark` nadpisuje ją ciemną paletą „limonka na grafitowej zieleni" (Pantone 3945 C na #0F1A09) — nie usuwać `:root`.
- Tooltips kanji: atrybut `data-kanji-tip="tłumaczenie"` na elemencie z kanji.
- W polskich tekstach `&nbsp;` przed krótkimi słowami (np. `w&nbsp;Pruszkowie`), żeby nie wisiały na końcu linii.
- Fonty **self-hostowane** z `assets/fonts/` (Oswald — nagłówki, Barlow Condensed — etykiety/nawigacja/godziny,
  Barlow — tekst, Yuji Boku — wyłącznie kanji). Bez Google Fonts CDN — zero zewnętrznych originów.
  Patrz „Fonty" niżej.
- Rozmiary tekstu **wyłącznie przez tokeny skali** `--fs-100`…`--fs-600` i `--fs-display-*` (`:root`
  w `css/styles.css`). Podłoga to `--fs-100` (14px), baza `--fs-400` (19px) — nic na stronie nie schodzi niżej.
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
do `unicode-range` w `@font-face` w `css/styles.css` — inaczej znak nie wyświetli się pędzlem.

## Dane na stronie (źródło prawdy)

| Dzień | Godzina | Grupa | Wiek |
|---|---|---|---|
| Wtorek | 18.00 — 19.00 | Dzieci młodsze | 8–10 lat |
| Czwartek | 18.00 — 19.00 | Dzieci starsze | 11–14 lat |
| Wtorek i Czwartek | 19.05 — 20.45 | Dorośli | od 15 lat |

Dojo: SP nr 1 im. Józefa Piłsudskiego, ul. Topolowa 10, 05-800 Pruszków.

**Cennik** — Dzieci: 200 PLN/msc · 570 PLN/kwartał (190 PLN/msc).
Młodzież i dorośli: 260 PLN/msc · 750 PLN/kwartał (250 PLN/msc).
Pierwszy trening bezpłatny.

Kontakt: tel. 530 145 350 · rafal.jaroszewski@aikido.pruszkow.pl · facebook.com/aikidowpruszkowie
