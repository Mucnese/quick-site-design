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
  return shellHead + '\n' + appCode + '\n\n' + uiCode + '\n\n' + bootCode +
    '\n\n</script>\n</body>\n</html>\n';
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

test('keine CDN-Verweise', function () {
  assert.ok(!/<script[^>]+src=["']https?:\/\//.test(indexHtml), 'ein <script src> zeigt auf einen fremden Server');
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
