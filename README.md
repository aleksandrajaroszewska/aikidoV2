# Aikido Pruszków — strona sekcji

Jednostronicowa wizytówka sekcji aikido w Pruszkowie (część klubu Warszawskie Centrum Aikido).
Czysty, statyczny HTML/CSS/JS — **bez frameworka, bez build stepu, bez npm**.

- Produkcja: https://aikido.pruszkow.pl
- Staging: https://staging.aikido.pruszkow.pl

Strona to jeden ekran hero i sześć sekcji: `#droga` · `#grafik` · `#instruktor` ·
`#cennik` · `#dojo` · `#kontakt`. Źródłem prawdy dla treści — grafiku, cennika, adresu
i kontaktu — jest `index.html`.

Podgląd lokalny:

```bash
python3 -m http.server 3000   # http://localhost:3000
```

Deploy, cofnięcie produkcji i konwencje kodu: **`CLAUDE.md`**.
