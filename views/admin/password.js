'use strict';
const { html, raw, esc } = require('../../lib/util');
const { adminLayout } = require('./layout');

function passwordPage({ flash, adminEmail, unreadCount }) {
  const body = html`
  <div class="admin-card" style="max-width:480px;">
    <h2>Promjena lozinke</h2>
    <p class="card-desc">Trenutno prijavljeni nalog: <b>${esc(adminEmail)}</b></p>
    <form method="POST" action="/admin/password">
      <div class="a-field">
        <label>Trenutna lozinka</label>
        <input type="password" name="current_password" required>
      </div>
      <div class="a-field">
        <label>Nova lozinka</label>
        <input type="password" name="new_password" required minlength="8">
        <div class="hint">Najmanje 8 karaktera.</div>
      </div>
      <div class="a-field">
        <label>Potvrdi novu lozinku</label>
        <input type="password" name="new_password_confirm" required minlength="8">
      </div>
      <button type="submit" class="a-btn">Sačuvaj novu lozinku</button>
    </form>
  </div>

  <div class="admin-card" style="max-width:480px;">
    <h2>Promjena e-mail adrese za prijavu</h2>
    <form method="POST" action="/admin/email">
      <div class="a-field">
        <label>Nova e-mail adresa</label>
        <input type="email" name="new_email" required value="${esc(adminEmail)}">
      </div>
      <div class="a-field">
        <label>Lozinka (radi potvrde)</label>
        <input type="password" name="confirm_password" required>
      </div>
      <button type="submit" class="a-btn secondary">Sačuvaj e-mail</button>
    </form>
  </div>
  `;
  return adminLayout({ active: 'password', title: 'Nalog', bodyHtml: body, flash, adminEmail, unreadCount });
}

module.exports = { passwordPage };
