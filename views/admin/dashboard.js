'use strict';
const { html, raw, esc } = require('../../lib/util');
const { adminLayout } = require('./layout');

function dashboardPage({ stats, recentInquiries, flash, adminEmail, unreadCount }) {
  const body = html`
  <div class="stat-row">
    <div class="stat-box"><b>${stats.services}</b><span>Usluga</span></div>
    <div class="stat-box"><b>${stats.portfolio}</b><span>Portfolio projekata</span></div>
    <div class="stat-box"><b>${stats.testimonials}</b><span>Utisaka klijenata</span></div>
    <div class="stat-box"><b>${stats.inquiries}</b><span>Ukupno upita</span></div>
  </div>

  <div class="admin-card">
    <h2>Najnoviji upiti</h2>
    <p class="card-desc">Posljednji upiti pristigli preko kontakt forme sa sajta.</p>
    ${raw(recentInquiries.length ? renderTable(recentInquiries) : '<div class="empty-hint">Još uvijek nema upita.</div>')}
    <div style="margin-top:16px;"><a href="/admin/inquiries" class="a-btn secondary small">Svi upiti →</a></div>
  </div>

  <div class="admin-card">
    <h2>Brzi linkovi</h2>
    <p class="card-desc">Najčešće akcije.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="/admin/settings" class="a-btn secondary small">Podešavanja sajta</a>
      <a href="/admin/portfolio/new" class="a-btn secondary small">Dodaj portfolio projekat</a>
      <a href="/admin/services/new" class="a-btn secondary small">Dodaj uslugu</a>
      <a href="/admin/packages/new" class="a-btn secondary small">Dodaj paket</a>
    </div>
  </div>
  `;
  return adminLayout({ active: 'dashboard', title: 'Pregled', bodyHtml: body, flash, adminEmail, unreadCount });
}

function renderTable(rows) {
  return `<table class="a-table">
    <thead><tr><th>Ime</th><th>Kontakt</th><th>Vrsta sajta</th><th>Datum</th><th></th></tr></thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td>${esc(r.name)}</td>
          <td>${esc(r.email)}${r.phone ? '<br><span style="color:#888;font-size:12.5px;">' + esc(r.phone) + '</span>' : ''}</td>
          <td>${esc(r.site_type || '—')}</td>
          <td>${esc(new Date(r.created_at).toLocaleDateString('sr-Latn'))}</td>
          <td><a href="/admin/inquiries#inq-${r.id}" class="a-btn small secondary">Otvori</a></td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

module.exports = { dashboardPage };
