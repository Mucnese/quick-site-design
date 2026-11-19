# Mitarbeit / Contributing

Danke für dein Interesse. Fehlermeldungen, Verbesserungsvorschläge, Korrekturen an den Datenquellen und Code sind
willkommen. / Thanks for your interest. Bug reports, suggestions, corrections to the data sources and code are welcome.

**Deutsch zuerst, English below.**

---

## Deutsch

### Vorab

- Alle Beiträge stehen unter der **GNU General Public License v3** wie das Projekt selbst (siehe [LICENSE](LICENSE)).
- Es gilt der [Verhaltenskodex](CODE_OF_CONDUCT.md).
- Sicherheitslücken bitte **nicht** öffentlich melden, sondern wie in [SECURITY.md](SECURITY.md) beschrieben.
- Das Werkzeug ist eine Planungshilfe und ersetzt keine Statik oder Bemessung. Änderungen an Krandaten oder
  Rechenverfahren brauchen eine Quelle (Datenblatt, Norm, Merkblatt). **Keine Werte schätzen oder erfinden.**

### Fehler melden oder etwas vorschlagen

Eröffne ein [Issue](https://github.com/Mucnese/quick-site-design/issues/new/choose) mit der passenden Vorlage. Hilfreich:
Browser und Version, was du getan hast, was passiert ist, was du erwartet hast, Fehlermeldung (Konsole mit F12).
Bitte **keine personenbezogenen Daten und keine vertraulichen Planungsdaten** in Issues einstellen; für
Geodaten genügt der Name der Datenquelle.

### Code beitragen

Das Projekt ist bewusst klein gehalten: eine HTML-Datei, vier Bibliotheken in `lib/`, kein Server, kein Framework.

1. Repository forken, Zweig anlegen.
2. Änderungen in `src/` machen. **`index.html` nie von Hand ändern**, sie entsteht aus `src/`.
3. Bauen und prüfen:

   ```bash
   python3 build.py
   node test/test.js
   node test/test-ui.js
   node test/validate-html.js
   ```

   Alle drei Prüfläufe müssen grün sein. Neue Funktionen bekommen Tests; bei Fehlern erst einen Test schreiben, der
   ihn zeigt.
4. Die Regeln in [CLAUDE.md](CLAUDE.md) beachten (Achsen, Maßstab, keine CDN-Verweise, kein `localStorage`,
   beide Sprachen mit denselben Schlüsseln, Anleitung und Kurzhilfe mitpflegen). Sie sind der Stand der Entwicklung
   des Projekts, nicht nur für Maschinen gedacht.
5. Einen Eintrag in [CHANGELOG.md](CHANGELOG.md) und [CHANGELOG.en.md](CHANGELOG.en.md) ergänzen.
6. Pull Request mit der Vorlage eröffnen. Kleine, einzelne Änderungen werden schneller geprüft als große.

**Keine neuen Abhängigkeiten ohne Absprache.** Eine neue Bibliothek bedeutet: Lizenz prüfen, `lib/` und
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) und `lib/SHA256SUMS` ergänzen, Datenschutzerklärung prüfen. Verweise auf
fremde Server (Schriften, Zähler, Kartendienste) sind nur mit Einwilligung der Nutzer und angepasster
Datenschutzerklärung denkbar.

### Herkunftsnachweis (DCO)

Mit `Signed-off-by: Name <E-Mail>` in jeder Commit-Nachricht (`git commit -s`) bestätigst du das
[Developer Certificate of Origin 1.1](https://developercertificate.org/): dass du den Beitrag selbst geschrieben hast oder
berechtigt bist, ihn unter der GPLv3 einzureichen. Es gibt keinen Lizenzvertrag (CLA); du behältst das Urheberrecht an
deinem Beitrag.

### Datenquellen und Tabellen

Die Tabelle der Geoportale in der [README](README.md) wurde Link für Link geprüft. Wer eine Änderung vorschlägt,
nennt die Seite und was dort steht (ob DGM, Format, Lizenz). Gleichzeitig ändern sich Links in `GEO_ENTRIES`
(`src/app.js`); ein Test vergleicht beides.

---

## English

### Before you start

- All contributions are under the **GNU General Public License v3**, like the project itself (see [LICENSE](LICENSE)).
- The [Code of Conduct](CODE_OF_CONDUCT.md) applies.
- Please do **not** report security issues publicly; follow [SECURITY.md](SECURITY.md).
- The tool is a planning aid and does not replace structural design. Changes to crane data or calculation methods need
  a source (data sheet, standard, guideline). **Do not estimate or invent values.**

### Reporting bugs or suggesting something

Open an [issue](https://github.com/Mucnese/quick-site-design/issues/new/choose) with the matching template. Helpful:
browser and version, what you did, what happened, what you expected, error message (console, F12). Please **do not post
personal data or confidential planning data**; for geodata the name of the data source is enough.

### Contributing code

The project is deliberately small: one HTML file, four libraries in `lib/`, no server, no framework.

1. Fork the repository and create a branch.
2. Make changes in `src/`. **Never edit `index.html` by hand**; it is generated from `src/`.
3. Build and check:

   ```bash
   python3 build.py
   node test/test.js
   node test/test-ui.js
   node test/validate-html.js
   ```

   All three test runs must be green. New features get tests; for bugs, write a test that shows the bug first.
4. Follow the rules in [CLAUDE.md](CLAUDE.md) (German; axes, scale, no CDN links, no `localStorage`, both languages with
   the same keys, keep guide and short help up to date).
5. Add an entry to [CHANGELOG.md](CHANGELOG.md) and [CHANGELOG.en.md](CHANGELOG.en.md).
6. Open a pull request using the template. Small, single changes are reviewed faster than large ones.

**No new dependencies without discussion.** A new library means: check the licence, update `lib/`,
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and `lib/SHA256SUMS`, review the privacy statement. Links to third-party
servers (fonts, counters, map services) are only conceivable with user consent and an updated privacy statement.

### Certificate of origin (DCO)

By adding `Signed-off-by: Name <email>` to every commit message (`git commit -s`) you confirm the
[Developer Certificate of Origin 1.1](https://developercertificate.org/): that you wrote the contribution or are entitled
to submit it under the GPLv3. There is no contributor licence agreement (CLA); you keep the copyright to your contribution.

### Data sources and tables

The table of geoportals in the [README](README.md) was checked link by link. If you propose a change, name the page and what it
says (whether DGM, format, licence). The links in `GEO_ENTRIES` (`src/app.js`) change at the same time; a test compares both.
