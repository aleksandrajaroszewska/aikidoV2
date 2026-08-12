# Hero: redesign z animowanym enso (wzorem plakatu)

Data: 2026-08-12
Status: zaakceptowany, gotowy do planu implementacji

## Kontekst

Referencja: `/Users/aleksandra.jaroszewska/nauka/AIKIDO/design/320_465_aikido_plakat.pdf` —
sezonowy plakat promocyjny dojo. Kluczowy motyw graficzny: pionowo ułożone kanji
`合気道` w kolorze limonkowym, wewnątrz teksturowanego, "szorstkiego" okręgu enso
(pociągnięcie pędzla) na grafitowo-zielonym tle, pod spodem duży napis `AIKIDO` +
mniejsze `PRUSZKÓW` z liniami po bokach.

Obecna sekcja hero (`index.html`, `.hero` / `css/styles.css:114-236`) ma inny układ:
kanji poziomo w stylu kakejiku (zwój), z pionowymi liniami po bokach i pieczątką
hanko w rogu, bez okręgu enso i bez żadnej animacji wejściowej. Strona dziś w ogóle
nie obsługuje `prefers-reduced-motion`.

Cel: przebudować hero tak, by wizualnie nawiązywało do plakatu — animowany, rysujący
się przy wejściu na stronę okrąg enso wokół kanji, plus dwupoziomowy tytuł
`AIKIDO` / `PRUSZKÓW` — przy zachowaniu elementów specyficznych dla strony (eyebrow
"SEZON 2026 — 2027", pieczątka hanko), które na samym plakacie nie występują.

## Decyzje z brainstormingu

1. **Zakres**: pełny redesign górnej sekcji wzorem plakatu (nie tylko dołożenie
   dekoracji do istniejącego układu).
2. **Eyebrow + hanko**: zostają oba — specyficzne dla strony, nie dublują plakatu
   (jednorazowego druku sezonowego).
3. **Styl enso**: teksturowany, wierny plakatowi — dwie nałożone ścieżki (cień +
   główna) plus filtr "szorstkości" pędzla (analogicznie do istniejącego
   `#hanko-rough`), a nie jeden czysty gładki kontur.
4. **Wyzwalanie animacji**: tylko raz, przy pierwszym załadowaniu strony — bez
   ponownego odtwarzania przy scrollu do sekcji hero.
5. **Kolor kanji**: wszystkie trzy znaki `合気道` w kolorze `var(--vermilion)`
   (limonka w trybie dark) — wiernie plakatowi. Obecny wzorzec "jeden akcent, dwa
   ink" (`nth-child(2)`, `.shu`) zostaje porzucony jako martwy kod.
6. **Tytuł**: dwupoziomowo jak na plakacie — `AIKIDO` duże w jednej linii, pod
   spodem mniejsze `— PRUSZKÓW —` z liniami flankującymi (wzorem `.hero-eyebrow .line`).

## Architektura

### DOM (`index.html`)

Wewnątrz `.hero-frame`, blok dotychczasowego `.kakejiku` zostaje opakowany w nowy
kontener `.enso-kakejiku`, łączący SVG enso i pionowy stos kanji:

```html
<div class="hero-eyebrow">
  <span class="line"></span>
  <span class="mono">SEZON 2026 — 2027</span>
  <span class="line"></span>
</div>

<div class="enso-kakejiku">
  <svg class="enso" viewBox="0 0 400 400" aria-hidden="true">
    <defs>
      <filter id="enso-rough" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/>
        <feDisplacementMap in="SourceGraphic" scale="6"/>
      </filter>
    </defs>
    <path class="enso-shadow" d="…" filter="url(#enso-rough)"/>
    <path class="enso-main" d="…" filter="url(#enso-rough)"/>
  </svg>
  <div class="kakejiku">
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
  <p><span class="pron">AI · KI · DŌ</span><span class="sep"> &nbsp;—&nbsp; </span><span class="mean">harmonia · energia · droga</span></p>
</div>
```

Uwaga: dokładne znaczniki/klasy `title-aikido`/`title-place` do doprecyzowania w
planie implementacji (np. czy `h1` zostaje jednym elementem z dwoma `span`, czy
dwoma blokami) — zachowując istniejące teksty i istniejący `<p>` z wymową bez zmian.

Reszta strony (`.schedule-poster` i dalej) — bez zmian.

### CSS (`css/styles.css`)

- **Nowy layout `.enso-kakejiku`**: `position: relative; display: grid;
  place-items: center;` — SVG `.enso` jako `position: absolute; inset: 0;`, blok
  `.kakejiku` (teraz `flex-direction: column`) jako `position: relative; z-index: 1;`
  nad SVG.
- **Kanji**: `.kchar` dostaje bazowy kolor `var(--vermilion)` wprost; usuwamy
  `.kakejiku .kchar:nth-child(2)` i `.kakejiku .kchar.shu` (martwe różnicowanie po
  redesignie — YAGNI).
- **Enso SVG**:
  - `.enso-main` → `stroke: var(--ink)`, grubszy `stroke-width`, `fill: none`,
    `stroke-linecap: round`.
  - `.enso-shadow` → `stroke: var(--ink-soft)` (lub `var(--rule)`), niższa
    `opacity`, lekko przesunięty/obrócony względem main dla efektu nakładających
    się pociągnięć pędzla.
  - Rozmiar przez `clamp()`, skalowany razem z `.kchar` (analogicznie do dzisiejszych
    `clamp()` na `.kchar`/`.hanko`).
  - Kolory wyłącznie z istniejących tokenów CSS — zero nowych magicznych wartości
    (zasada 4).
- **Tytuł `hero-subtitle h1`**: `.title-aikido` — duży display (rozmiar zbliżony do
  dzisiejszego `h1`), `.title-place` — wiersz z `.line` (reużycie wzorca z
  `.hero-eyebrow .line`) i tekstem `PRUSZKÓW` w mniejszej, letter-spaced typografii
  (analogicznie do dzisiejszego `.place-name`).
- **Sprzątanie martwego kodu**: usunięcie `body.hero-vertical` i `body.hero-single`
  (`css/styles.css:1068-1080`) — warianty nigdzie niepodpięte pod żadną klasę
  `<body>`, nieudokumentowane w README/CLAUDE.md. Nowy układ staje się bezpośrednio
  domyślnym wyglądem `hero-stacked`; nazwa klasy na `<body>` zostaje bez zmian (nie
  wymaga aktualizacji README/CLAUDE.md w części o theme switches).
- **Mobile**: nowe reguły w istniejącej sekcji "hero mobile fixes"
  (`css/styles.css:412-430`) dla `.enso-kakejiku`/`.title-aikido`/`.title-place` —
  mobile-first, bazowe style bez media query + `min-width` w górę, zgodnie z
  konwencją reszty pliku.

### Animacja

- Czyste CSS `@keyframes` na `stroke-dasharray`/`stroke-dashoffset` (pełna długość
  ścieżki → 0) dla `.enso-shadow` i `.enso-main`, odpalane automatycznie przy
  załadowaniu strony (`animation-fill-mode: forwards`, bez JS, bez
  IntersectionObserver) — spełnia wymóg "tylko raz, na starcie", niezależnie od
  scrolla.
- `.enso-shadow` startuje jako pierwszy, `.enso-main` z niewielkim opóźnieniem —
  imituje kolejność nakładania pociągnięć pędzla.
- Kanji: opcjonalny, subtelny fade-in/scale-in (`opacity`/`transform` only, zero
  wpływu na layout/CLS), zsynchronizowany tak, by pojawić się w trakcie/pod koniec
  rysowania okręgu.
- **A11y (WCAG 2.2 AA)**: cała animacja owinięta w
  `@media (prefers-reduced-motion: no-preference)`. Przy `reduce` (lub braku
  wsparcia media query) okrąg i kanji renderują się od razu w stanie końcowym —
  zero ruchu. To pierwsza obsługa `prefers-reduced-motion` w tym projekcie.
- **Progressive enhancement**: treść (kanji, tytuł) jest zawsze widoczna w DOM i w
  CSS bez zależności od JS — animacja to czysty efekt CSS na już-widocznej treści,
  nie mechanizm ukrywania (w odróżnieniu od istniejącego `.reveal` używanego przy
  scroll-reveal niżej na stronie, gdzie `opacity: 0` zależy od JS/IntersectionObserver
  — tu świadomie inne podejście, bo dotyczy głównej treści powyżej fold).

## Poza zakresem

- Zmiana treści/harmonogramu w `.schedule-poster` — bez zmian.
- Nowe warianty przełączalne (np. przywracanie `hero-vertical` jako opcji) — nie
  budujemy pod hipotetyczne przyszłe potrzeby (YAGNI).
- TypeScript / typowanie — projekt to czysty HTML/CSS/JS bez build stepu (zgodnie z
  CLAUDE.md), zasada 9 nie ma tu zastosowania.

## Ryzyka / rzeczy do zweryfikowania w implementacji

- Dokładny kształt `d="…"` ścieżek enso (przybliżenie okręgu z przerwą, dwie
  warstwy) wymaga iteracji wizualnej w przeglądarce — nie da się w pełni określić
  na etapie spec.
- Pozycja `hanko` względem nowego, bardziej kwadratowego (nie szerokiego) bloku
  `.enso-kakejiku` może wymagać przeliczenia offsetów (`right`/`bottom`) — dziś
  tuningowane pod poziomy układ kakejiku.
- Rozmiar/proporcje SVG enso względem stosu kanji na małych ekranach (mobile) — do
  sprawdzenia wizualnie, nie tylko przez `clamp()` na sztywno.
