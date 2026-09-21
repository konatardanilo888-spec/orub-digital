'use strict';
const { parseCookies, setCookie, clearCookie } = require('./util');

const FLASH_COOKIE = 'orub_flash';

function setFlash(res, type, text) {
  const payload = JSON.stringify({ type, text });
  setCookie(res, FLASH_COOKIE, payload, { maxAge: 30 });
}

function readFlash(req, res) {
  const cookies = parseCookies(req);
  const raw = cookies[FLASH_COOKIE];
  if (!raw) return null;
  clearCookie(res, FLASH_COOKIE);
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

module.exports = { setFlash, readFlash };
