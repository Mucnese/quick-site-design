#!/usr/bin/env python3
"""Baut index.html aus den vier Dateien in src/.

Reihenfolge: shell_head.html, app.js, ui.js, boot.js. Aus app.js und ui.js
werden die Node-Exportblöcke am Dateiende entfernt (sie dienen nur den
Tests) und alles in ein gemeinsames <script> gehängt, wie es der Browser
sieht.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
EXPORT_MARKER = "if (typeof module !== 'undefined' && module.exports) {"


def strip_export_block(code):
    idx = code.find('\n' + EXPORT_MARKER)
    if idx == -1:
        return code.rstrip('\n')
    return code[:idx].rstrip('\n')


def read(name):
    return (SRC / name).read_text(encoding='utf-8')


def main():
    shell_head = read('shell_head.html').rstrip('\n')
    app_code = strip_export_block(read('app.js'))
    ui_code = strip_export_block(read('ui.js'))
    boot_code = read('boot.js').rstrip('\n')

    html = (
        shell_head + '\n'
        + app_code + '\n\n'
        + ui_code + '\n\n'
        + boot_code + '\n\n'
        + '</script>\n</body>\n</html>\n'
    )

    out = ROOT / 'index.html'
    out.write_text(html, encoding='utf-8')
    print(f'index.html geschrieben ({len(html)} Zeichen)')


if __name__ == '__main__':
    main()
