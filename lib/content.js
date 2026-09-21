'use strict';
const { db } = require('./db');

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  return obj;
}

function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, value == null ? '' : String(value));
}

function setSettings(map) {
  const tx = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [k, v] of Object.entries(map)) {
    tx.run(k, v == null ? '' : String(v));
  }
}

// Generic collection helpers -------------------------------------------------

const COLLECTIONS = {
  services: { table: 'services' },
  advantages: { table: 'advantages' },
  process_steps: { table: 'process_steps' },
  portfolio: { table: 'portfolio' },
  packages: { table: 'packages' },
  testimonials: { table: 'testimonials' },
  faq: { table: 'faq' }
};

function listAll(collection, opts = {}) {
  const table = COLLECTIONS[collection].table;
  const where = opts.onlyVisible ? 'WHERE visible = 1' : '';
  return db.prepare(`SELECT * FROM ${table} ${where} ORDER BY sort_order ASC, id ASC`).all();
}

function getById(collection, id) {
  const table = COLLECTIONS[collection].table;
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
}

function deleteById(collection, id) {
  const table = COLLECTIONS[collection].table;
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}

function toggleVisible(collection, id) {
  const table = COLLECTIONS[collection].table;
  const row = db.prepare(`SELECT visible FROM ${table} WHERE id = ?`).get(id);
  if (!row) return;
  db.prepare(`UPDATE ${table} SET visible = ? WHERE id = ?`).run(row.visible ? 0 : 1, id);
}

function moveItem(collection, id, direction) {
  const table = COLLECTIONS[collection].table;
  const items = db.prepare(`SELECT id, sort_order FROM ${table} ORDER BY sort_order ASC, id ASC`).all();
  const idx = items.findIndex(i => i.id === Number(id));
  if (idx === -1) return;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;
  const a = items[idx], b = items[swapIdx];
  db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`).run(b.sort_order, a.id);
  db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`).run(a.sort_order, b.id);
}

function nextSortOrder(collection) {
  const table = COLLECTIONS[collection].table;
  const row = db.prepare(`SELECT MAX(sort_order) AS m FROM ${table}`).get();
  return (row.m === null ? -1 : row.m) + 1;
}

function insertRow(collection, fields) {
  const table = COLLECTIONS[collection].table;
  const keys = Object.keys(fields);
  const placeholders = keys.map(() => '?').join(',');
  const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`);
  const result = stmt.run(...keys.map(k => fields[k]));
  return result.lastInsertRowid;
}

function updateRow(collection, id, fields) {
  const table = COLLECTIONS[collection].table;
  const keys = Object.keys(fields);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`);
  stmt.run(...keys.map(k => fields[k]), id);
}

module.exports = {
  getSettings, setSetting, setSettings,
  listAll, getById, deleteById, toggleVisible, moveItem, nextSortOrder,
  insertRow, updateRow
};
