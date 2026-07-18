# Handoff: Aikido Pruszków — strona sekcji

## Przegląd
Jednostronicowa wizytówka sekcji aikido w Pruszkowie (część klubu Warszawskie Centrum Aikido). Estetyka japońsko-nowoczesna: kaligrafia pędzlem (kanji), ciemna paleta „Yoru", elegancki serif Cormorant Garamond. Język: polski.

## O plikach w tym pakiecie
`index.html` w tym folderze to **gotowa wersja produkcyjna** — czysty statyczny HTML/CSS/JS bez żadnego build stepu i bez zależności od Reacta (panel wyboru wariantów został usunięty, wybrane warianty zapieczone na stałe w klasach `<body>`). Można ją wdrożyć bezpośrednio na dowolny hosting statyczny — nie trzeba jej przepisywać na framework. Jeśli jednak strona ma być częścią większego projektu (np. Next.js), potraktuj ten plik jako referencję hi-fi i odtwórz 1:1.

## Wierność
**High-fidelity** — finalne kolory, typografia, odstępy, interakcje i treść. Odtwarzać piksel w piksel.

## Struktura strony (jedna strona, sekcje w kolejności)
1. **Topbar** (sticky) — brand (kanji 合 + „Aikido Pruszków") + nawigacja kotwicowa (Grupy / Instruktorzy / Cennik / Dojo / Klub / Kontakt). Nav ukryta <720px (brak menu mobilnego — celowe).
2. **Hero** — eyebrow (令和八年 · SEZON 2026—2027 · 武道), trzy wielkie kanji 合気道 pędzlem (道 w wermilionie) z pieczęcią hanko 武, podtytuł „Aikido PRUSZKÓW", linia wymowy AI·KI·DŌ.
3. **Plan treningów** (kluczowy element!) — poster w podwójnych liniach: 3 wiersze, hierarchia: DZIEŃ TYGODNIA (największy, Cormorant 600) → godzina (mono, mała) → grupa (kanji + nazwa + romaji) → wiek. Stopka postera: adres + CTA „Pierwszy trening — bezpłatny".
4. **Season band** — marquee (animacja 40s linear infinite) z frazami PL/JP.
5. **Grupy** (一 修行) — 3 zakładki (子 Dzieci młodsze / 少 Dzieci starsze / 大 Dorośli), panel: zdjęcie 4:5 + opis z inicjałem (first-letter drop cap).
6. **Instruktorzy** (二 先生) — 2 karty pełnowymiarowe: Rafał Jaroszewski (5 dan), Adam Marcinowski (3 dan, układ lustrzany `.flip`). Portret 4:5 z kanji stopnia (五/三) w mix-blend-mode: difference.
7. **Cennik** (三 月謝) — DWIE tabele: Dzieci (200/560/1800/180-rodzinna) i Młodzież & dorośli (260/720/2300/240-rodzinna). Karta miesięczna `.featured` (indygo w dark). Notka „* zniżki nie łączą się".
8. **Lokalizacja** (四 場所) — karta adresowa („ul. Topolowa 10" wielkim serifem) + 2 CTA (Mapy — wermilion, telefon — outline) + mapa Google iframe w grayscale(1) (hover przywraca kolor) z pływającym pinpointem.
9. **Klub** (五 道場) — tekst o WCA, jedna kolumna max 760px.
10. **Footer** (#kontakt) — 2 kolumny: kontakt (合気道, telefon 530 145 350, mail, facebook) + „Pozostałe sekcje WCA" (6 linków w 2 kolumnach).

## Plan treningów (dane — źródło prawdy)
| Dzień | Godzina | Grupa | Wiek |
|---|---|---|---|
| Wtorek | 18.10 — 19.10 | Dzieci młodsze (子 Kodomo) | 8–10 lat |
| Czwartek | 18.10 — 19.10 | Dzieci starsze (少 Shōnen) | 11–14 lat |
| Wtorek i Czwartek | 19.15 — 21.00 | Dorośli (大 Otona) | od 15 lat |

Dojo: SP nr 1 im. Józefa Piłsudskiego, ul. Topolowa 10, 05-800 Pruszków.

## Cennik (dane)
**Dzieci:** 200 PLN/msc · 560 PLN/kwartał · 1800 PLN/sezon 10 msc · rodzinna 180 PLN/os
**Młodzież & dorośli:** 260 PLN/msc · 720 PLN/kwartał · 2300 PLN/sezon · rodzinna 240 PLN/os
Zniżki nie łączą się. Pierwszy trening bezpłatny.

## Design tokens (paleta Yoru — aktywna)
```css
--paper:        oklch(16% 0.014 250);  /* tło strony */
--paper-deep:   oklch(20% 0.018 250);
--ink:          oklch(94% 0.012 80);   /* tekst główny (jasny krem) */
--ink-soft:     oklch(72% 0.015 80);
--ink-faint:    oklch(50% 0.01 80);
--rule:         oklch(30% 0.015 250);  /* linie */
--indigo:       oklch(60% 0.12 260);
--indigo-deep:  oklch(45% 0.1 260);    /* karta featured w cenniku */
--vermilion:    oklch(70% 0.18 32);    /* akcent czerwony */
```
Uwaga: tokeny bazowe w `:root` to jasna paleta „Kinari"; ciemna nadpisuje je przez `body.palette-dark`. Nie usuwać `:root` — kaskada zależy od obu.

## Typografia (wszystkie z Google Fonts, licencja OFL — darmowe)
- **Display / nagłówki / dni tygodnia**: Cormorant Garamond (400–700, italic 500)
- **Kanji pędzlem**: Yuji Boku (`--font-brush`)
- **Tekst podstawowy**: IBM Plex Sans (300–600)
- **Etykiety mono**: IBM Plex Mono (300–500)
- Fallback kanji: Shippori Mincho B1, Noto Serif JP

## Interakcje
- **Zakładki grup**: klik przełącza `.active` na tab i panelu (vanilla JS, na dole pliku)
- **Scroll reveal**: IntersectionObserver dodaje `.in` do `.reveal` (fade + translateY 20px, 0.9s)
- **Tooltips kanji**: `[data-kanji-tip]` — CSS-owe dymki z tłumaczeniem na hover, tylko `@media (hover:hover) and (pointer:fine)`
- **Marquee**: `@keyframes marq` translateX(-50%), zawartość zduplikowana ×2 dla pętli
- **Mapa**: grayscale(1) → hover grayscale(0.4)
- **Wiersze planu**: hover = tło wermilion 5% + padding-left 14px

## Responsywność (breakpointy)
- 980/900px — cennik 2 kolumny; 560px — 1 kolumna
- 880px — zakładki grup poziomo (scroll), panele 1 kolumna, instruktorzy 1 kolumna
- 780px — wiersze planu w grid-areas: dzień u góry / czas+wiek / grupa; bloc-head 1 kolumna; footer 1 kolumna
- 720px — nav i „— WCA / sekcja Pruszków" ukryte
- 600px — hanko pod kanji (static), mniejsze letter-spacingi, wymowa AI·KI·DŌ łamie się na 2 linie

## Zasoby
- `assets/rafal.jpg`, `assets/adam.jpg` — portrety instruktorów
- `assets/kids.jpg`, `assets/youth.jpg`, `assets/adults.jpg` — zdjęcia grup
- Wszystkie z archiwum klubu (projekt aikido_2022)
- `ola.jpg`, `dojo.jpg`, `hero.jpg` nieużywane w wersji finalnej — pominięte w pakiecie

## Wdrożenie
Strona statyczna — GitHub Pages / Netlify / Cloudflare Pages / dowolny FTP. Bez builda. Google Fonts ładowane z CDN (wymaga internetu; dla pełnego self-hostingu pobrać woff2 i podmienić `<link>`).

## Kontakt / dane na stronie
Tel. 530 145 350 · rafal.jaroszewski@aikido.pruszkow.pl · facebook.com/aikidowpruszkowie
Sezon 2026/2027 · © Aikido Pruszków · WCA · 2010—2026

## Pliki
- `index.html` — markup strony
- `css/styles.css` — wszystkie style (tokeny, layout, komponenty, media queries)
- `js/script.js` — zakładki grup, scroll reveal, tooltips kanji
- `assets/` — zdjęcia (portrety instruktorów, zdjęcia grup)
