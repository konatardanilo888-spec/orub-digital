'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { Router } = require('./lib/router');
const { db, hashPassword, verifyPassword } = require('./lib/db');
const { readBody, parseUrlEncoded, esc } = require('./lib/util');
const { parseMultipart } = require('./lib/multipart');
const session = require('./lib/session');
const { setFlash, readFlash } = require('./lib/flash');
const { saveUploadedImage } = require('./lib/uploads');
const content = require('./lib/content');
const { COLLECTIONS_CONFIG } = require('./lib/collections-config');

const { publicLayout } = require('./views/layout');
const { homePage } = require('./views/home');
const { loginPage } = require('./views/admin/login');
const { dashboardPage } = require('./views/admin/dashboard');
const { settingsPage } = require('./views/admin/settings');
const { passwordPage } = require('./views/admin/password');
const { inquiriesPage } = require('./views/admin/inquiries');
const { collectionListPage, collectionFormPage } = require('./views/admin/collection');

const PORT = process.env.PORT || 3000;
const router = new Router();

// ---------------------------------------------------------------------------
// Static file serving (public/)
// ---------------------------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('Forbidden'); return true; }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.css' || ext === '.js' ? 'public, max-age=300' : 'public, max-age=86400'
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

// ---------------------------------------------------------------------------
// Small response helpers
// ---------------------------------------------------------------------------
function sendHtml(res, statusCode, htmlStr) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlStr);
}
function sendJson(res, statusCode, obj) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

async function parseBody(req) {
  const contentType = req.headers['content-type'] || '';
  const buf = await readBody(req);
  if (contentType.includes('multipart/form-data')) {
    return parseMultipart(buf, contentType);
  }
  return { fields: parseUrlEncoded(buf), files: {} };
}

function isSameOriginPost(req) {
  // Basic CSRF mitigation: for state-changing admin requests, require that the
  // Origin/Referer (when present) matches this server's Host header.
  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  if (origin) {
    try { return new URL(origin).host === host; } catch (e) { return false; }
  }
  if (referer) {
    try { return new URL(referer).host === host; } catch (e) { return false; }
  }
  return true; // no Origin/Referer sent (rare) — allow, cookie SameSite=Lax already restricts cross-site POST
}

// ---------------------------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const settings = content.getSettings();
  const data = {
    settings,
    services: content.listAll('services', { onlyVisible: true }),
    advantages: content.listAll('advantages', { onlyVisible: true }),
    processSteps: content.listAll('process_steps', { onlyVisible: true }),
    portfolio: content.listAll('portfolio', { onlyVisible: true }),
    packages: content.listAll('packages', { onlyVisible: true }),
    testimonials: content.listAll('testimonials', { onlyVisible: true }),
    faq: content.listAll('faq', { onlyVisible: true })
  };
  sendHtml(res, 200, publicLayout({ settings, bodyHtml: homePage(data) }));
});

router.post('/api/contact', async (req, res) => {
  try {
    const { fields } = await parseBody(req);
    const name = (fields.name || '').trim();
    const email = (fields.email || '').trim();
    const message = (fields.message || '').trim();
    if (!name || !email || !message) {
      return sendJson(res, 400, { success: false, error: 'missing_fields' });
    }
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return sendJson(res, 400, { success: false, error: 'too_long' });
    }
    db.prepare(`INSERT INTO inquiries (name, email, phone, site_type, budget, message, created_at, is_read)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)`)
      .run(name, email, (fields.phone || '').trim(), (fields.site_type || '').trim(), (fields.budget || '').trim(), message, new Date().toISOString());
    sendJson(res, 200, { success: true });
  } catch (e) {
    console.error('contact error', e);
    sendJson(res, 500, { success: false, error: 'server_error' });
  }
});

// ---------------------------------------------------------------------------
// ADMIN — auth helpers
// ---------------------------------------------------------------------------
function requireAdmin(handler) {
  return async (req, res, params) => {
    const s = session.getSessionFromReq(req);
    if (!s) return redirect(res, '/admin/login');
    req.adminSession = s;
    return handler(req, res, params);
  };
}

function unreadCount() {
  const row = db.prepare('SELECT COUNT(*) AS c FROM inquiries WHERE is_read = 0').get();
  return row.c;
}

// ---------------------------------------------------------------------------
// ADMIN — auth routes
// ---------------------------------------------------------------------------
router.get('/admin/login', async (req, res) => {
  const s = session.getSessionFromReq(req);
  if (s) return redirect(res, '/admin');
  sendHtml(res, 200, loginPage({ error: null }));
});

router.post('/admin/login', async (req, res) => {
  const { fields } = await parseBody(req);
  const email = (fields.email || '').trim().toLowerCase();
  const password = fields.password || '';
  const admin = db.prepare('SELECT * FROM admin_users WHERE lower(email) = ?').get(email);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return sendHtml(res, 401, loginPage({ error: 'Pogrešan e-mail ili lozinka.' }));
  }
  const sess = session.createSession(admin.id);
  session.attachSessionCookie(res, sess);
  redirect(res, '/admin');
});

router.post('/admin/logout', requireAdmin(async (req, res) => {
  session.destroySession(req.adminSession.sid);
  session.clearSessionCookie(res);
  redirect(res, '/admin/login');
}));

// ---------------------------------------------------------------------------
// ADMIN — dashboard
// ---------------------------------------------------------------------------
router.get('/admin', requireAdmin(async (req, res) => {
  const flash = readFlash(req, res);
  const stats = {
    services: db.prepare('SELECT COUNT(*) c FROM services').get().c,
    portfolio: db.prepare('SELECT COUNT(*) c FROM portfolio').get().c,
    testimonials: db.prepare('SELECT COUNT(*) c FROM testimonials').get().c,
    inquiries: db.prepare('SELECT COUNT(*) c FROM inquiries').get().c
  };
  const recentInquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5').all();
  sendHtml(res, 200, dashboardPage({
    stats, recentInquiries, flash,
    adminEmail: req.adminSession.admin.email, unreadCount: unreadCount()
  }));
}));

// ---------------------------------------------------------------------------
// ADMIN — settings
// ---------------------------------------------------------------------------
router.get('/admin/settings', requireAdmin(async (req, res) => {
  const flash = readFlash(req, res);
  sendHtml(res, 200, settingsPage({ settings: content.getSettings(), flash, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount() }));
}));

router.post('/admin/settings', requireAdmin(async (req, res) => {
  if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
  const { fields } = await parseBody(req);
  content.setSettings(fields);
  setFlash(res, 'ok', 'Podešavanja su sačuvana.');
  redirect(res, '/admin/settings');
}));

// ---------------------------------------------------------------------------
// ADMIN — password / email
// ---------------------------------------------------------------------------
router.get('/admin/password', requireAdmin(async (req, res) => {
  const flash = readFlash(req, res);
  sendHtml(res, 200, passwordPage({ flash, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount() }));
}));

router.post('/admin/password', requireAdmin(async (req, res) => {
  if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
  const { fields } = await parseBody(req);
  const admin = req.adminSession.admin;
  if (!verifyPassword(fields.current_password || '', admin.password_hash)) {
    setFlash(res, 'error', 'Trenutna lozinka nije tačna.');
    return redirect(res, '/admin/password');
  }
  if (!fields.new_password || fields.new_password.length < 8) {
    setFlash(res, 'error', 'Nova lozinka mora imati najmanje 8 karaktera.');
    return redirect(res, '/admin/password');
  }
  if (fields.new_password !== fields.new_password_confirm) {
    setFlash(res, 'error', 'Nova lozinka i potvrda se ne poklapaju.');
    return redirect(res, '/admin/password');
  }
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(fields.new_password), admin.id);
  setFlash(res, 'ok', 'Lozinka je uspješno promijenjena.');
  redirect(res, '/admin/password');
}));

router.post('/admin/email', requireAdmin(async (req, res) => {
  if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
  const { fields } = await parseBody(req);
  const admin = req.adminSession.admin;
  if (!verifyPassword(fields.confirm_password || '', admin.password_hash)) {
    setFlash(res, 'error', 'Lozinka nije tačna.');
    return redirect(res, '/admin/password');
  }
  const newEmail = (fields.new_email || '').trim().toLowerCase();
  if (!newEmail || !newEmail.includes('@')) {
    setFlash(res, 'error', 'Unesite ispravnu e-mail adresu.');
    return redirect(res, '/admin/password');
  }
  const existing = db.prepare('SELECT id FROM admin_users WHERE lower(email) = ? AND id != ?').get(newEmail, admin.id);
  if (existing) {
    setFlash(res, 'error', 'Ta e-mail adresa je već u upotrebi.');
    return redirect(res, '/admin/password');
  }
  db.prepare('UPDATE admin_users SET email = ? WHERE id = ?').run(newEmail, admin.id);
  setFlash(res, 'ok', 'E-mail adresa je promijenjena.');
  redirect(res, '/admin/password');
}));

// ---------------------------------------------------------------------------
// ADMIN — inquiries
// ---------------------------------------------------------------------------
router.get('/admin/inquiries', requireAdmin(async (req, res) => {
  const flash = readFlash(req, res);
  const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  sendHtml(res, 200, inquiriesPage({ rows, flash, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount() }));
}));

router.post('/admin/inquiries/:id/toggle-read', requireAdmin(async (req, res, params) => {
  if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
  const row = db.prepare('SELECT is_read FROM inquiries WHERE id = ?').get(params.id);
  if (row) db.prepare('UPDATE inquiries SET is_read = ? WHERE id = ?').run(row.is_read ? 0 : 1, params.id);
  redirect(res, '/admin/inquiries');
}));

router.post('/admin/inquiries/:id/delete', requireAdmin(async (req, res, params) => {
  if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(params.id);
  setFlash(res, 'ok', 'Upit je obrisan.');
  redirect(res, '/admin/inquiries');
}));

// ---------------------------------------------------------------------------
// ADMIN — generic collection CRUD (services, advantages, process_steps,
// portfolio, packages, testimonials, faq)
// ---------------------------------------------------------------------------
function buildRowFieldsFromForm(config, fields, files, existingRow) {
  const out = {};
  for (const f of config.fields) {
    if (f.type === 'checkbox') {
      out[f.name] = fields[f.name] ? 1 : 0;
    } else if (f.type === 'image') {
      const uploaded = files[f.name + '_file'];
      const urlVal = (fields[f.name + '_url'] || '').trim();
      if (uploaded && uploaded.data && uploaded.data.length) {
        const savedUrl = saveUploadedImage(uploaded);
        out[f.name] = savedUrl || urlVal || (existingRow ? existingRow[f.name] : '');
      } else {
        out[f.name] = urlVal;
      }
    } else if (f.bilingual) {
      out[f.name + '_me'] = (fields[f.name + '_me'] || '').trim();
      out[f.name + '_en'] = (fields[f.name + '_en'] || '').trim();
    } else {
      out[f.name] = (fields[f.name] || '').trim();
    }
  }
  return out;
}

Object.keys(COLLECTIONS_CONFIG).forEach(key => {
  const config = COLLECTIONS_CONFIG[key];

  router.get(`/admin/${key}`, requireAdmin(async (req, res) => {
    const flash = readFlash(req, res);
    const rows = content.listAll(key);
    sendHtml(res, 200, collectionListPage({ collectionKey: key, config, rows, flash, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount() }));
  }));

  router.get(`/admin/${key}/new`, requireAdmin(async (req, res) => {
    sendHtml(res, 200, collectionFormPage({ collectionKey: key, config, row: null, flash: null, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount(), isNew: true }));
  }));

  router.post(`/admin/${key}/new`, requireAdmin(async (req, res) => {
    if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
    const { fields, files } = await parseBody(req);
    const rowFields = buildRowFieldsFromForm(config, fields, files, null);
    rowFields.sort_order = content.nextSortOrder(key);
    rowFields.visible = 1;
    content.insertRow(key, rowFields);
    setFlash(res, 'ok', 'Stavka je dodata.');
    redirect(res, `/admin/${key}`);
  }));

  router.get(`/admin/${key}/:id/edit`, requireAdmin(async (req, res, params) => {
    const row = content.getById(key, params.id);
    if (!row) return sendHtml(res, 404, 'Nije pronađeno');
    sendHtml(res, 200, collectionFormPage({ collectionKey: key, config, row, flash: null, adminEmail: req.adminSession.admin.email, unreadCount: unreadCount(), isNew: false }));
  }));

  router.post(`/admin/${key}/:id/edit`, requireAdmin(async (req, res, params) => {
    if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
    const existingRow = content.getById(key, params.id);
    if (!existingRow) return sendHtml(res, 404, 'Nije pronađeno');
    const { fields, files } = await parseBody(req);
    const rowFields = buildRowFieldsFromForm(config, fields, files, existingRow);
    content.updateRow(key, params.id, rowFields);
    setFlash(res, 'ok', 'Izmjene su sačuvane.');
    redirect(res, `/admin/${key}`);
  }));

  router.post(`/admin/${key}/:id/delete`, requireAdmin(async (req, res, params) => {
    if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
    content.deleteById(key, params.id);
    setFlash(res, 'ok', 'Stavka je obrisana.');
    redirect(res, `/admin/${key}`);
  }));

  router.post(`/admin/${key}/:id/toggle`, requireAdmin(async (req, res, params) => {
    if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
    content.toggleVisible(key, params.id);
    redirect(res, `/admin/${key}`);
  }));

  router.post(`/admin/${key}/:id/move`, requireAdmin(async (req, res, params) => {
    if (!isSameOriginPost(req)) return sendHtml(res, 403, 'Forbidden');
    const { fields } = await parseBody(req);
    content.moveItem(key, params.id, fields.dir === 'up' ? 'up' : 'down');
    redirect(res, `/admin/${key}`);
  }));
});

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url);
    const pathname = decodeURIComponent(parsed.pathname);

    if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/uploads/') || pathname === '/favicon.ico') {
      if (serveStatic(req, res, pathname)) return;
      res.writeHead(404); res.end('Not found'); return;
    }

    const match = router.match(req.method, pathname);
    if (!match) {
      sendHtml(res, 404, notFoundPage());
      return;
    }
    await match.handler(req, res, match.params);
  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      sendHtml(res, 500, '<h1>500 — Greška na serveru</h1><p>Pokušajte ponovo.</p>');
    }
  }
});

function notFoundPage() {
  return `<!DOCTYPE html><html lang="me"><head><meta charset="UTF-8"><title>404</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;background:#0A0A0A;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}
  a{color:#fff;text-decoration:underline;}</style></head>
  <body><div><h1 style="font-size:60px;margin-bottom:10px;">404</h1><p>Stranica nije pronađena. <a href="/">Nazad na početnu</a></p></div></body></html>`;
}

// Periodic cleanup of expired sessions
setInterval(() => { try { session.cleanupExpiredSessions(); } catch (e) {} }, 1000 * 60 * 60);

server.listen(PORT, () => {
  console.log(`ORUB DIGITAL server pokrenut na http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
