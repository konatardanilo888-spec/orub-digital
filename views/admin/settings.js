'use strict';
const { html, raw, esc } = require('../../lib/util');
const { adminLayout } = require('./layout');

function langField(name, label, s, type) {
  type = type || 'text';
  const tag = type === 'textarea' ? 'textarea' : 'input';
  const inputMe = tag === 'textarea' ? `<textarea name="${name}_me">${esc(s[name + '_me'] || '')}</textarea>` : `<input type="text" name="${name}_me" value="${esc(s[name + '_me'] || '')}">`;
  const inputEn = tag === 'textarea' ? `<textarea name="${name}_en">${esc(s[name + '_en'] || '')}</textarea>` : `<input type="text" name="${name}_en" value="${esc(s[name + '_en'] || '')}">`;
  return `
  <div class="a-field" data-lang-tabs>
    <label>${esc(label)}</label>
    <div class="lang-tabs">
      <button type="button" class="lang-tab-btn active" data-target="${name}-me">Crnogorski</button>
      <button type="button" class="lang-tab-btn" data-target="${name}-en">English</button>
    </div>
    <div class="lang-pane active" data-pane="${name}-me">${inputMe}</div>
    <div class="lang-pane" data-pane="${name}-en">${inputEn}</div>
  </div>`;
}

function plainField(name, label, s, opts) {
  opts = opts || {};
  return `<div class="a-field"><label>${esc(label)}</label><input type="${opts.type || 'text'}" name="${name}" value="${esc(s[name] || '')}" placeholder="${esc(opts.placeholder || '')}"></div>`;
}

function settingsPage({ settings: s, flash, adminEmail, unreadCount }) {
  const body = html`
  <form method="POST" action="/admin/settings">
  <div class="admin-card">
    <h2>Hero sekcija (naslov na vrhu sajta)</h2>
    <p class="card-desc">Prvo što posjetilac vidi kada otvori sajt.</p>
    ${raw(langField('hero_title', 'Glavni naslov', s))}
    ${raw(langField('hero_subtitle', 'Podnaslov', s, 'textarea'))}
    ${raw(langField('hero_cta', 'Tekst dugmeta', s))}
  </div>

  <div class="admin-card">
    <h2>Kratki uvodi sekcija</h2>
    <p class="card-desc">Kratak opis ispod naslova svake sekcije na sajtu.</p>
    ${raw(langField('services_intro', 'Uvod — Usluge', s, 'textarea'))}
    ${raw(langField('why_intro', 'Uvod — Zašto ORUB DIGITAL', s, 'textarea'))}
    ${raw(langField('process_intro', 'Uvod — Kako radimo', s, 'textarea'))}
    ${raw(langField('portfolio_intro', 'Uvod — Portfolio', s, 'textarea'))}
    ${raw(langField('packages_intro', 'Uvod — Paketi i cijene', s, 'textarea'))}
    ${raw(langField('testimonials_intro', 'Uvod — Utisci klijenata', s, 'textarea'))}
    ${raw(langField('faq_intro', 'Uvod — Česta pitanja', s, 'textarea'))}
    ${raw(langField('contact_intro', 'Uvod — Kontakt', s, 'textarea'))}
  </div>

  <div class="admin-card">
    <h2>Kontakt podaci</h2>
    <p class="card-desc">Prikazuju se u kontakt sekciji i footeru sajta.</p>
    <div class="admin-grid-2">
      ${raw(plainField('email', 'E-mail adresa', s, { type: 'email' }))}
      ${raw(plainField('phone', 'Telefon', s))}
      ${raw(plainField('whatsapp', 'WhatsApp broj (samo cifre, sa pozivnim brojem)', s, { placeholder: '38267000000' }))}
      ${raw(plainField('viber', 'Viber broj (samo cifre, sa pozivnim brojem)', s, { placeholder: '38267000000' }))}
      ${raw(plainField('city', 'Grad', s))}
      ${raw(plainField('country', 'Država', s))}
    </div>
  </div>

  <div class="admin-card">
    <h2>Društvene mreže</h2>
    <p class="card-desc">Ostavite prazno da se dugme ne prikazuje.</p>
    <div class="admin-grid-2">
      ${raw(plainField('social_instagram', 'Instagram link', s))}
      ${raw(plainField('social_facebook', 'Facebook link', s))}
      ${raw(plainField('social_linkedin', 'LinkedIn link', s))}
    </div>
  </div>

  <div class="admin-card">
    <h2>SEO i footer</h2>
    ${raw(langField('meta_description', 'SEO opis sajta (meta description)', s, 'textarea'))}
    ${raw(langField('footer_note', 'Kratka rečenica u footeru', s))}
  </div>

  <div class="admin-card" style="position:sticky;bottom:20px;">
    <button type="submit" class="a-btn">Sačuvaj sva podešavanja</button>
  </div>
  </form>
  `;
  return adminLayout({ active: 'settings', title: 'Podešavanja sajta', bodyHtml: body, flash, adminEmail, unreadCount });
}

module.exports = { settingsPage };
