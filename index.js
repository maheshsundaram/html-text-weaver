const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const TAG_NAME = 0;
const OPEN_OFFSET = 1;
const CLOSE_OFFSET = 2;

var { document } = (typeof global === 'undefined' ? this : global);

const normalizedTagNames = {
  b: 'b',
  strong: 'b',
  em: 'i',
  i: 'i',
  h1: 'h1',
  h2: 'h2'
};

function encode(html) {

  const el = document.createElement('div');
  el.innerHTML = html;

  let text = '';
  const meta = [];

  const _walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType == ELEMENT_NODE) {
        if (child.tagName in normalizedTagNames) {
          const marker = [child.tagName, text.length, null];
          meta.push(marker);
          _walk(child);
          marker[2] = text.length;
        } else {
          _walk(child);
        }
      }
      if (child.nodeType == TEXT_NODE) {
        text += child.textContent;
      }
    }
  }

  _walk(el);

  return { text, meta };
}

function decode({ text, meta }) {

  let html = '';
  let mi = 0;

  const stack = [];

  for (i in text) {
    i = parseInt(i);
    while (meta[mi] && i == meta[mi][OPEN_OFFSET]) {
      html += `<${meta[mi][TAG_NAME]}>`;
      stack.push(meta[mi]);
      mi++;
    }
    html += escapeHTML(text[i]);
    while (stack.length && (i + 1) == stack[stack.length - 1][CLOSE_OFFSET]) {
      html += `</${stack[stack.length - 1][TAG_NAME]}>`
      stack.length = stack.length - 1;
    }
  }

  return html;
}

const escapeHTML = function (s) {
  var escaped = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\'': '&#39;',
    '"': '&quot;'
  };
  return s.replace(/[&<>'"]/g, function (m) {
    return escaped[m];
  });
};

const unescapeHTML= function (s) {
  var re = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
  var unescaped = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': '\'',
    '&#39;': '\'',
    '&quot;': '"',
    '&#34;': '"'
  };
  return s.replace(re, function (m) {
    return unescaped[m];
  });
};




module.exports = {
  decode,
  encode,
  escapeHTML,
  unescapeHTML,
}