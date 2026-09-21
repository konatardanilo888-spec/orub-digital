'use strict';
const { html, raw, esc } = require('../../lib/util');

const NAV = [
  { group: 'Opšte', items: [
    { href: '/admin', label: 'Pregled', key: 'dashboard' },
    { href: '/admin/inquiries', label: 'Upiti klijenata', key: 'inquiries' },
    { href: '/admin/settings', label: 'Podešavanja sajta', key: 'settings' }
  ]},
  { group: 'Sadržaj sajta', items: [
    { href: '/admin/services', label: 'Usluge', key: 'services' },
    { href: '/admin/advantages', label: 'Zašto ORUB DIGITAL', key: 'advantages' },
    { href: '/admin/process_steps', label: 'Kako radimo', key: 'process_steps' },
    { href: '/admin/portfolio', label: 'Portfolio', key: 'portfolio' },
    { href: '/admin/packages', label: 'Paketi i cijene', key: 'packages' },
    { href: '/admin/testimonials', label: 'Utisci klijenata', key: 'testimonials' },
    { href: '/admin/faq', label: 'Česta pitanja', key: 'faq' }
  ]},
  { group: 'Nalog', items: [
    { href: '/admin/password', label: 'Promjena lozinke', key: 'password' }
  ]}
];

function adminLayout({ active, title, bodyHtml, flash, adminEmail, unreadCount }) {
  const navHtml = NAV.map(group => `
    <div class="group-label">${esc(group.group)}</div>
    ${group.items.map(it => `
      <a href="${it.href}" class="${it.key === active ? 'active' : ''}">${esc(it.label)}${it.key === 'inquiries' && unreadCount ? ` <span class="badge new">${unreadCount}</span>` : ''}</a>
    `).join('')}
  `).join('');

  const flashHtml = flash ? `<div class="admin-flash ${flash.type === 'error' ? 'err' : 'ok'}">${esc(flash.text)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="me">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Admin | ORUB DIGITAL</title>
<meta name="robots" content="noindex,nofollow">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body class="admin-body">
<div class="admin-shell">
  <aside class="admin-sidebar">
    <div class="brand">ORUB<span style="opacity:.5">.</span>DIGITAL<div style="font-size:11px;font-weight:600;opacity:.6;margin-top:2px;letter-spacing:.05em;">ADMIN PANEL</div></div>
    <nav class="admin-nav">${raw(navHtml)}</nav>
    <div class="sidebar-foot">
      <div style="font-size:12.5px;color:#999;margin-bottom:10px;">${esc(adminEmail || '')}</div>
      <form method="POST" action="/admin/logout"><button type="submit" class="a-btn secondary small" style="width:100%;">Odjavi se</button></form>
    </div>
  </aside>
  <div class="admin-main">
    <div class="admin-topbar">
      <h1>${esc(title)}</h1>
      <a class="view-site" href="/" target="_blank" rel="noopener">Pogledaj sajt ↗</a>
    </div>
    <div class="admin-content">
      ${raw(flashHtml)}
      ${raw(bodyHtml)}
    </div>
  </div>
</div>
<script src="/js/admin.js"></script>
</body>
</html>`;
}

module.exports = { adminLayout };
