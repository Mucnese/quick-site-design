'use strict';
/* Ersetzt den Browser-DOMParser für die CityGML-Tests. Deckt nur ab, was
   parseCityGML()/readRing() tatsächlich benutzen: getElementsByTagNameNS()
   nach lokalem Namen (Namensraum-Präfix wird ignoriert) und textContent.
   Kommentare und die XML-Deklaration werden übersprungen, nicht geparst. */

class XNode {
  constructor(tagName) {
    this.tagName = tagName;
    this.localName = tagName.indexOf(':') >= 0 ? tagName.split(':').pop() : tagName;
    this.children = [];
    this.parentNode = null;
    this._text = '';
  }
  get textContent() {
    let out = this._text;
    for (let i = 0; i < this.children.length; i++) out += this.children[i].textContent;
    return out;
  }
  getElementsByTagNameNS(ns, localName) {
    const out = [];
    (function walk(node) {
      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if (c.localName === localName) out.push(c);
        walk(c);
      }
    })(this);
    return out;
  }
  getElementsByTagName(tagName) {
    const out = [];
    (function walk(node) {
      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if (c.tagName === tagName) out.push(c);
        walk(c);
      }
    })(this);
    return out;
  }
}

class XDocument extends XNode {
  constructor() { super('#document'); }
}

const TAG_RE = /<(\/?)([A-Za-z_][\w.-]*(?::[A-Za-z_][\w.-]*)?)((?:\s+[^<>]*?)?)(\/?)>|([^<]+)/g;

class DOMParser {
  parseFromString(text) {
    const doc = new XDocument();
    const stack = [doc];
    let malformed = false;
    let m;
    TAG_RE.lastIndex = 0;
    while ((m = TAG_RE.exec(text)) !== null) {
      if (m[5] !== undefined) {
        stack[stack.length - 1]._text += m[5];
        continue;
      }
      const closing = m[1] === '/';
      const tagName = m[2];
      const selfClose = m[4] === '/';
      if (closing) {
        if (!stack.length || stack[stack.length - 1].tagName !== tagName) malformed = true;
        else stack.pop();
      } else {
        const node = new XNode(tagName);
        node.parentNode = stack[stack.length - 1];
        stack[stack.length - 1].children.push(node);
        if (!selfClose) stack.push(node);
      }
    }
    if (malformed || stack.length !== 1) {
      doc.children.push(new XNode('parsererror'));
    }
    return doc;
  }
}

module.exports = { DOMParser: DOMParser };
