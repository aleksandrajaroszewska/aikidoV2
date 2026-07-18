# Aikido Pruszków — strona sekcji

Jednostronicowa wizytówka sekcji aikido w Pruszkowie (część klubu Warszawskie Centrum Aikido).
Czysty, statyczny HTML/CSS/JS — **bez frameworka, bez build stepu, bez npm**.

- Produkcja: https://aikido.pruszkow.pl
- Staging: https://staging.aikido.pruszkow.pl

## Struktura

- `index.html` — markup strony
- `css/styles.css` — wszystkie style (tokeny, layout, komponenty, media queries)
- `js/script.js` — zakładki grup, scroll reveal
- `assets/` — zdjęcia (portrety instruktorów, zdjęcia grup)

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

- Klasy na `<body>`: `palette-dark display-cormorant hero-stacked divider-linia` — sterują całym wyglądem.
- Kolory wyłącznie przez zmienne CSS (`--paper`, `--ink`, `--vermilion`, …) zdefiniowane w `css/styles.css`.
  `:root` ma jasną paletę „Kinari", `body.palette-dark` nadpisuje ją ciemną „Yoru" — nie usuwać `:root`.
- Tooltips kanji: atrybut `data-kanji-tip="tłumaczenie"` na elemencie z kanji.
- W polskich tekstach `&nbsp;` przed krótkimi słowami (np. `w&nbsp;Pruszkowie`), żeby nie wisiały na końcu linii.
- Fonty z Google Fonts (Cormorant Garamond, Yuji Boku, IBM Plex Sans/Mono) — ładowane z CDN w `<head>`.

## Dane na stronie (źródło prawdy)

| Dzień | Godzina | Grupa | Wiek |
|---|---|---|---|
| Wtorek | 18.10 — 19.10 | Dzieci młodsze (子 Kodomo) | 8–10 lat |
| Czwartek | 18.10 — 19.10 | Dzieci starsze (少 Shōnen) | 11–14 lat |
| Wtorek i Czwartek | 19.15 — 21.00 | Dorośli (大 Otona) | od 15 lat |

Dojo: SP nr 1 im. Józefa Piłsudskiego, ul. Topolowa 10, 05-800 Pruszków.

**Cennik** — Dzieci: 200 PLN/msc · 560 PLN/kwartał · 1800 PLN/sezon · rodzinna 180 PLN/os.
Młodzież i dorośli: 260 PLN/msc · 720 PLN/kwartał · 2300 PLN/sezon · rodzinna 240 PLN/os.
Zniżki nie łączą się. Pierwszy trening bezpłatny.

Kontakt: tel. 530 145 350 · rafal.jaroszewski@aikido.pruszkow.pl · facebook.com/aikidowpruszkowie
