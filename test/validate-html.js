'use strict';
/* Prüft die gebaute index.html: entspricht sie genau dem, was aus src/
   entstehen würde (kein Vergessen von "python3 build.py", keine
   Handbearbeitung), gibt es zu jedem data-i18n="key" einen Eintrag in
   beiden Sprachen, und liegen die Dateien, auf die index.html verweist,
   tatsächlich daneben. Aufruf: node test/validate-html.js */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log('  FEHL ' + name);
    console.log('        ' + e.message);
  }
}

function read(name) { return fs.readFileSync(path.join(SRC, name), 'utf8'); }

const EXPORT_MARKER = "if (typeof module !== 'undefined' && module.exports) {";
function stripExportBlock(code) {
  const idx = code.indexOf('\n' + EXPORT_MARKER);
  return (idx === -1 ? code : code.slice(0, idx)).replace(/\n+$/, '');
}

/* Baut index.html unabhängig von build.py aus src/ nach, um build.py
   selbst mit abzudecken. */
function rebuild() {
  const shellHead = read('shell_head.html').replace(/\n+$/, '');
  const appCode = stripExportBlock(read('app.js'));
  const uiCode = stripExportBlock(read('ui.js'));
  const bootCode = read('boot.js').replace(/\n+$/, '');
  // das Programm-Skript wird in der Content Security Policy über seine Prüfsumme erlaubt (wie in build.py)
  const script = '\n' + appCode + '\n\n' + uiCode + '\n\n' + bootCode + '\n\n';
  const digest = require('crypto').createHash('sha256').update(script, 'utf8').digest('base64');
  return shellHead.replace('__CSP_SCRIPT_HASH__', 'sha256-' + digest) + script + '</script>\n</body>\n</html>\n';
}

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

test('index.html entspricht genau dem, was aus src/ gebaut würde', function () {
  assert.strictEqual(indexHtml, rebuild(),
    'index.html weicht von src/ ab – bitte "python3 build.py" laufen lassen');
});

test('index.html beginnt mit <!DOCTYPE html>', function () {
  assert.ok(indexHtml.startsWith('<!DOCTYPE html>'));
});

test('genau ein eingebettetes <script>-Element (app.js+ui.js+boot.js)', function () {
  const inline = indexHtml.match(/<script>(?!\s*<\/script>)/g) || [];
  assert.strictEqual(inline.length, 1);
});

test('die drei Bibliotheken aus lib/ werden eingebunden und liegen vor', function () {
  ['lib/three.min.js', 'lib/OrbitControls.js', 'lib/geotiff.js'].forEach(function (rel) {
    assert.ok(indexHtml.indexOf('<script src="' + rel + '">') >= 0, rel + ' wird nicht eingebunden');
    assert.ok(fs.existsSync(path.join(ROOT, rel)), rel + ' fehlt im Projekt');
  });
});

test('web-ifc und laz-perf liegen lokal vor, mit Lizenztext, und stehen nicht fest im HTML', function () {
  ['lib/laz-perf.js', 'lib/laz-perf.wasm', 'lib/LICENSE-laz-perf.txt'].forEach(function (rel) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), rel + ' fehlt');
  });
  assert.ok(indexHtml.indexOf('<script src="lib/laz-perf') < 0, 'laz-perf darf nur nachgeladen werden');
  ['lib/web-ifc-api-iife.js', 'lib/web-ifc.wasm', 'lib/LICENSE-web-ifc.txt'].forEach(function (rel) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), rel + ' fehlt im Projekt');
  });
  assert.ok(indexHtml.indexOf('<script src="lib/web-ifc') < 0, 'web-ifc darf nur nachgeladen werden');
});

test('Änderungsprotokoll (Deutsch und Englisch) liegt vor und die Hilfe verlinkt es', function () {
  ['CHANGELOG.md', 'CHANGELOG.en.md'].forEach(function (rel) { assert.ok(fs.existsSync(path.join(ROOT, rel)), rel + ' fehlt'); });
  const ui = fs.readFileSync(path.join(ROOT, 'src/ui.js'), 'utf8');
  assert.ok(ui.indexOf('blob/main/CHANGELOG.md') > 0 && ui.indexOf('blob/main/CHANGELOG.en.md') > 0, 'Hilfe verlinkt das Änderungsprotokoll nicht');
});

test('Content Security Policy: kein unsafe-inline für Skripte, Prüfsumme des Programm-Skripts stimmt, nur die erlaubten Fremdserver', function () {
  const m = indexHtml.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(m, 'Content Security Policy fehlt');
  const csp = m[1];
  const script = (csp.match(/script-src ([^;]+)/) || [])[1] || '';
  assert.ok(script.indexOf('unsafe-inline') < 0 && script.indexOf("'unsafe-eval'") < 0, 'script-src darf kein unsafe-inline/unsafe-eval enthalten');
  const hash = (script.match(/'sha256-([^']+)'/) || [])[1];
  assert.ok(hash, 'Prüfsumme des Programm-Skripts fehlt');
  const inlineStart = indexHtml.lastIndexOf('<script>') + '<script>'.length;
  const inlineEnd = indexHtml.lastIndexOf('</script>');
  const digest = require('crypto').createHash('sha256').update(indexHtml.slice(inlineStart, inlineEnd), 'utf8').digest('base64');
  assert.strictEqual(hash, digest, 'Prüfsumme passt nicht zum Skript: python3 build.py ausführen');
  assert.ok(/object-src 'none'/.test(csp) && /base-uri 'none'/.test(csp) && /form-action 'none'/.test(csp));
  const hosts = (csp.match(/https:\/\/[a-z0-9.-]+/g) || []).sort();
  assert.deepStrictEqual(hosts, ['https://photon.komoot.io', 'https://tile.openstreetmap.org'], 'unerwartete Fremdserver in der Richtlinie');
  assert.ok(!/ on(click|change|input|load|error|submit)=/i.test(indexHtml.slice(0, inlineStart)), 'Inline-Ereignisse widersprechen der Richtlinie');
});

test('Bibliotheken in lib/ stimmen mit den Prüfsummen in lib/SHA256SUMS überein (Lieferkette)', function () {
  const sums = fs.readFileSync(path.join(ROOT, 'lib/SHA256SUMS'), 'utf8').trim().split('\n');
  const names = ['OrbitControls.js', 'de_adv_BETA2007.tif', 'geotiff.js', 'laz-perf.js', 'laz-perf.wasm', 'three.min.js', 'web-ifc-api-iife.js', 'web-ifc.wasm'];
  assert.deepStrictEqual(sums.map(function (l) { return l.split(/\s+/)[1]; }).sort(), names.slice().sort());
  sums.forEach(function (l) {
    const parts = l.split(/\s+/);
    const actual = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'lib', parts[1]))).digest('hex');
    assert.strictEqual(actual, parts[0], 'lib/' + parts[1] + ' weicht von der Prüfsumme ab (Bibliothek verändert?)');
  });
});

test('Dateien für Open Source liegen vor (Lizenz, Mitarbeit, Verhaltenskodex, Sicherheit, Drittlizenzen, Vorlagen)', function () {
  ['LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'THIRD-PARTY-NOTICES.md', 'CHANGELOG.md', 'CHANGELOG.en.md',
   'demo/LIESMICH.txt', 'lib/LICENSE-three.txt', 'lib/LICENSE-geotiff.txt', 'lib/LICENSE-web-ifc.txt', 'lib/LICENSE-laz-perf.txt',
   '.github/PULL_REQUEST_TEMPLATE.md', '.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/feature_request.md'].forEach(function (rel) { assert.ok(fs.existsSync(path.join(ROOT, rel)), rel + ' fehlt'); });
  const notices = fs.readFileSync(path.join(ROOT, 'THIRD-PARTY-NOTICES.md'), 'utf8');
  ['three.js', 'geotiff.js', 'web-ifc', 'laz-perf', 'OpenStreetMap', 'Photon'].forEach(function (n) { assert.ok(notices.indexOf(n) >= 0, n + ' fehlt in THIRD-PARTY-NOTICES.md'); });
});

test('keine CDN-Verweise', function () {
  assert.ok(!/<script[^>]+src=["']https?:\/\//.test(indexHtml), 'ein <script src> zeigt auf einen fremden Server');
});

test('Benutzeranleitung (Deutsch und Englisch) liegt vor, der Hilfe-Knopf verlinkt sie und die Gliederung stimmt überein', function () {
  const de = fs.readFileSync(path.join(ROOT, 'BENUTZERANLEITUNG.md'), 'utf8');
  const en = fs.readFileSync(path.join(ROOT, 'USER-GUIDE.en.md'), 'utf8');
  const ui = fs.readFileSync(path.join(ROOT, 'src/ui.js'), 'utf8');
  assert.ok(ui.indexOf('blob/main/BENUTZERANLEITUNG.md') > 0 && ui.indexOf('blob/main/USER-GUIDE.en.md') > 0, 'Hilfe verlinkt die Anleitung nicht');
  assert.ok(indexHtml.indexOf('id="help-btn"') > 0, 'Hilfe-Knopf fehlt');
  const heads = function (t) { return (t.match(/^## \d+\./gm) || []).join(','); };
  assert.strictEqual(heads(de), heads(en), 'Abschnitte von deutscher und englischer Anleitung weichen ab');
  assert.ok(/^## 11\./m.test(de));
});

test('alle Links der Anwendung öffnen in einem neuen Tab (die Planung geht sonst beim Verlassen der Seite verloren)', function () {
  const anchors = indexHtml.match(/<a\s[^>]*href=[^>]*>/g) || [];
  assert.ok(anchors.length >= 5, 'Links im Markup nicht gefunden');
  anchors.forEach(function (a) {
    assert.ok(/target="_blank"/.test(a) && /rel="noopener noreferrer"/.test(a), 'Link ohne neuen Tab: ' + a.slice(0, 90));
  });
  // Links, die ui.js erzeugt (außer dem Download der IFC-Datei, der keine href-Navigation ist)
  const ui = fs.readFileSync(path.join(ROOT, 'src/ui.js'), 'utf8');
  const made = ui.split('\n').filter(function (l, i, all) { return /createElement\('a'\)/.test(l); });
  made.forEach(function (line) {
    const i = ui.indexOf(line);
    const block = ui.slice(i, i + 600);
    if (/\.download\s*=/.test(block)) return;
    assert.ok(/target\s*=\s*'_blank'/.test(block) && /rel\s*=\s*'noopener noreferrer'/.test(block), 'erzeugter Link ohne neuen Tab: ' + line.trim());
  });
});

test('Impressum und Datenschutzerklärung liegen neben index.html', function () {
  assert.ok(fs.existsSync(path.join(ROOT, 'impressum.html')));
  assert.ok(fs.existsSync(path.join(ROOT, 'datenschutz.html')));
});

test('jedes data-i18n="key" im Markup hat einen Eintrag in STRINGS.de und STRINGS.en', function () {
  // ui.js verweist beim Laden auf app.js-Namen (MAX_GRID); Funktionsaufrufe
  // finden hier nicht statt, insofern genügt ein sehr einfacher Rahmen.
  const sandbox = {
    console: console, Math: Math, Object: Object, Array: Array, Error: Error,
    window: { innerWidth: 1024, innerHeight: 768 },
    document: { getElementById: function () { return null; } }
  };
  vm.createContext(sandbox);
  vm.runInContext(read('app.js'), sandbox, { filename: 'app.js (nur zum Auslesen von STRINGS)' });
  vm.runInContext(read('ui.js'), sandbox, { filename: 'ui.js (nur zum Auslesen von STRINGS)' });
  vm.runInContext('var __STRINGS = STRINGS;', sandbox);

  const strings = sandbox.__STRINGS;
  const keysUsed = Array.from(indexHtml.matchAll(/data-i18n="([^"]+)"/g)).map(function (m) { return m[1]; });
  assert.ok(keysUsed.length > 0, 'keine data-i18n-Attribute gefunden – Test greift ins Leere');

  const missing = [];
  keysUsed.forEach(function (key) {
    if (!(key in strings.de) || !(key in strings.en)) missing.push(key);
  });
  assert.deepStrictEqual(missing, [], 'data-i18n-Schlüssel ohne STRINGS-Eintrag: ' + missing.join(', '));
});

console.log(pass + ' bestanden, ' + fail + ' fehlgeschlagen');
process.exit(fail ? 1 : 0);
