'use strict';
const { db } = require('./db');
const { parseCookies, setCookie, clearCookie, newId } = require('./util');

const COOKIE_NAME = 'orub_admin_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dana

function createSession(adminUserId) {
  const id = newId(32);
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare('INSERT INTO sessions (id, admin_user_id, expires_at) VALUES (?, ?, ?)').run(id, adminUserId, expiresAt);
  return { id, expiresAt };
}

function destroySession(id) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

function getSessionFromReq(req) {
  const cookies = parseCookies(req);
  const sid = cookies[COOKIE_NAME];
  if (!sid) return null;
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid);
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    destroySession(sid);
    return null;
  }
  const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(row.admin_user_id);
  if (!admin) return null;
  return { sid, admin };
}

function attachSessionCookie(res, session) {
  setCookie(res, COOKIE_NAME, session.id, { maxAge: Math.floor(SESSION_TTL_MS / 1000) });
}

function clearSessionCookie(res) {
  clearCookie(res, COOKIE_NAME);
}

function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

module.exports = {
  COOKIE_NAME,
  createSession,
  destroySession,
  getSessionFromReq,
  attachSessionCookie,
  clearSessionCookie,
  cleanupExpiredSessions
};
