'use strict';
const crypto = require('crypto');

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Marker wrapper for trusted/raw HTML that should NOT be escaped.
class Raw {
  constructor(html) { this.html = html; }
  toString() { return this.html; }
}
function raw(html) { return new Raw(html == null ? '' : String(html)); }

// Tagged template: html`<div>${userValue}</div>` auto-escapes interpolations,
// unless wrapped in raw(...) or is itself an array of strings (joined).
function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v instanceof Raw) {
      out += v.html;
    } else if (Array.isArray(v)) {
      out += v.map(item => (item instanceof Raw ? item.html : esc(item))).join('');
    } else {
      out += esc(v);
    }
    out += strings[i + 1];
  }
  return out;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    try { cookies[k] = decodeURIComponent(v); } catch (e) { cookies[k] = v; }
  });
  return cookies;
}

function setCookie(res, name, value, opts = {}) {
  let str = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`;
  if (opts.maxAge) str += `; Max-Age=${opts.maxAge}`;
  if (opts.expires) str += `; Expires=${opts.expires.toUTCString()}`;
  const existing = res.getHeader('Set-Cookie');
  const arr = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
  arr.push(str);
  res.setHeader('Set-Cookie', arr);
}

function clearCookie(res, name) {
  setCookie(res, name, '', { expires: new Date(0) });
}

function newId(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

async function readBody(req, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseUrlEncoded(buf) {
  const str = buf.toString('utf8');
  const params = new URLSearchParams(str);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

module.exports = {
  esc, raw, html, parseCookies, setCookie, clearCookie, newId, readBody, parseUrlEncoded, slugify
};
