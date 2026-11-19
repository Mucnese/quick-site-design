# Sicherheitshinweise / Security policy

## Deutsch

### Sicherheitslücken melden

Bitte melde Sicherheitslücken **nicht** in einem öffentlichen Issue. Zwei Wege:

1. **GitHub:** [Private Meldung einer Sicherheitslücke](https://github.com/Mucnese/quick-site-design/security/advisories/new)
   (Reiter „Security“ im Repository, „Report a vulnerability“).
2. **E-Mail:** info@quick-site-design.com, Betreff „Sicherheit“.

Bitte nenne: was betroffen ist (Datei, Funktion, Seite), wie man es nachstellt, welche Auswirkung du erwartest, und ob
die Lücke schon bekannt oder öffentlich ist. Du bekommst nach Möglichkeit innerhalb von **7 Tagen** eine Antwort und
wirst über den Fortgang informiert. Nach der Behebung nennen wir dich auf Wunsch im
[Änderungsprotokoll](CHANGELOG.md). Das Projekt wird von einer Einzelperson in der Freizeit betreut; Behebungszeiten
können deshalb nicht garantiert werden.

### Was als Sicherheitsproblem gilt

Alle Daten werden im Browser verarbeitet; es gibt keinen Server und kein Benutzerkonto. Relevant sind zum Beispiel:
Skripteinschleusung (XSS) über Dateien oder Eingaben, unbeabsichtigte Übertragung von Daten an Dritte, manipulierbare
Bibliotheken in `lib/`, Fehler in den Dateileser, die den Browser über das Erwartbare hinaus beeinträchtigen, oder
Schwächen in der Auslieferung (Seite, Links, Content Security Policy).

Kein Sicherheitsproblem im engeren Sinn: falsche Rechenergebnisse (bitte als normalen Fehler melden), sehr große
Dateien, die den eigenen Browser verlangsamen (die Anwendung begrenzt Größen, siehe Anleitung), Fehler in Daten Dritter.

### Unterstützte Fassungen

Unterstützt wird die jeweils **aktuelle Fassung** auf https://quick-site-design.com (Zweig `main`). Ältere Fassungen
erhalten keine Korrekturen.

### Lieferkette

Die Bibliotheken liegen lokal in `lib/` und werden nicht von Dritten nachgeladen. Ihre Prüfsummen stehen in
[`lib/SHA256SUMS`](lib/SHA256SUMS) und werden von einem Test geprüft. Herkunft und Lizenzen: [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## English

### Reporting a vulnerability

Please do **not** report vulnerabilities in a public issue. Two ways:

1. **GitHub:** [privately report a vulnerability](https://github.com/Mucnese/quick-site-design/security/advisories/new)
   (“Security” tab of the repository, “Report a vulnerability”).
2. **E-mail:** info@quick-site-design.com, subject “Security”.

Please include: what is affected (file, function, page), how to reproduce it, the impact you expect, and whether the
issue is already known or public. You get a reply within **7 days** where possible and are kept informed. After the fix
we credit you in the [changelog](CHANGELOG.en.md) if you wish. The project is maintained by one person in their spare time,
so fix times cannot be guaranteed.

### What counts as a security issue

All data is processed in the browser; there is no server and no user account. Relevant are, for example: script injection
(XSS) through files or input, unintended transmission of data to third parties, tampered libraries in `lib/`, bugs in the
file readers that affect the browser beyond what is expected, or weaknesses in delivery (page, links, content security policy).

Not a security issue in the narrow sense: wrong calculation results (report them as normal bugs), very large files that
slow down your own browser (the application limits sizes, see the guide), errors in third-party data.

### Supported versions

The **current version** at https://quick-site-design.com (branch `main`) is supported. Older versions get no fixes.

### Supply chain

The libraries are stored locally in `lib/` and are not loaded from third parties. Their checksums are in
[`lib/SHA256SUMS`](lib/SHA256SUMS) and verified by a test. Origin and licences: [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
