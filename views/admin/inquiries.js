'use strict';
const { html, raw, esc } = require('../../lib/util');
const { adminLayout } = require('./layout');

function inquiriesPage({ rows, flash, adminEmail, unreadCount }) {
  const body = html`
  <div class="admin-card">
    <h2>Upiti klijenata</h2>
    <p class="card-desc">Svi upiti poslati preko kontakt forme sa javnog sajta, od najnovijeg.</p>
    ${raw(rows.length ? rows.map(renderInquiry).join('') : '<div class="empty-hint">Još uvijek nema upita.</div>')}
  </div>
  `;
  return adminLayout({ active: 'inquiries', title: 'Upiti klijenata', bodyHtml: body, flash, adminEmail, unreadCount });
}

function renderInquiry(r) {
  const date = new Date(r.created_at);
  const dateStr = date.toLocaleDateString('sr-Latn') + ' ' + date.toLocaleTimeString('sr-Latn', { hour: '2-digit', minute: '2-digit' });
  return `
  <div id="inq-${r.id}" style="border:1px solid ${r.is_read ? '#eee' : '#0A0A0A'};border-radius:8px;padding:20px 22px;margin-bottom:14px;background:${r.is_read ? '#fff' : '#fafafa'};">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;">
      <div>
        <div style="font-weight:800;font-size:15.5px;">${esc(r.name)} ${r.is_read ? '' : '<span class="badge new">Novo</span>'}</div>
        <div style="font-size:13px;color:#777;margin-top:2px;">${esc(dateStr)}</div>
      </div>
      <div class="row-actions">
        <form method="POST" action="/admin/inquiries/${r.id}/toggle-read"><button class="a-btn secondary small">${r.is_read ? 'Označi kao nepročitano' : 'Označi kao pročitano'}</button></form>
        <form method="POST" action="/admin/inquiries/${r.id}/delete" data-confirm="Obrisati ovaj upit?"><button class="a-btn danger small">Obriši</button></form>
      </div>
    </div>
    <div class="admin-grid-2" style="margin-top:14px;">
      <div><b style="font-size:12.5px;color:#888;">E-mail</b><br><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>
      <div><b style="font-size:12.5px;color:#888;">Telefon</b><br>${r.phone ? `<a href="tel:${esc(r.phone.replace(/\s+/g, ''))}">${esc(r.phone)}</a>` : '—'}</div>
      <div><b style="font-size:12.5px;color:#888;">Vrsta sajta</b><br>${esc(r.site_type || '—')}</div>
      <div><b style="font-size:12.5px;color:#888;">Budžet</b><br>${esc(r.budget || '—')}</div>
    </div>
    <div style="margin-top:14px;">
      <b style="font-size:12.5px;color:#888;">Poruka</b>
      <p style="margin:6px 0 0;white-space:pre-wrap;font-size:14.5px;line-height:1.6;">${esc(r.message)}</p>
    </div>
  </div>`;
}

module.exports = { inquiriesPage };
