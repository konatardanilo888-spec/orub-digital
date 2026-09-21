'use strict';
const { html, raw, esc } = require('../../lib/util');
const { adminLayout } = require('./layout');

function collectionListPage({ collectionKey, config, rows, flash, adminEmail, unreadCount }) {
  const body = html`
  <div class="admin-card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
      <div>
        <h2>${esc(config.label)}</h2>
        <p class="card-desc">Dodajte, izmijenite, sakrijte ili obrišite stavke. Redoslijed strelicama određuje redoslijed prikaza na sajtu.</p>
      </div>
      <a href="/admin/${collectionKey}/new" class="a-btn">+ Dodaj ${esc(config.singular)}</a>
    </div>
    ${raw(rows.length ? renderTable(collectionKey, config, rows) : '<div class="empty-hint">Još uvijek nema stavki. Kliknite "Dodaj ' + esc(config.singular) + '" da dodate prvu.</div>')}
  </div>
  `;
  return adminLayout({ active: collectionKey, title: config.label, bodyHtml: body, flash, adminEmail, unreadCount });
}

function renderTable(collectionKey, config, rows) {
  const imageCol = config.hasImage;
  return `<table class="a-table">
    <thead><tr>
      ${imageCol ? '<th></th>' : ''}
      <th>Naziv</th><th>Status</th><th>Redoslijed</th><th></th>
    </tr></thead>
    <tbody>
      ${rows.map((row, idx) => {
        const imgField = config.fields.find(f => f.type === 'image');
        const imgVal = imgField ? row[imgField.name] : null;
        return `
        <tr>
          ${imageCol ? `<td>${imgVal ? `<img class="thumb-sm" src="${esc(imgVal)}">` : `<div class="thumb-sm"></div>`}</td>` : ''}
          <td>${esc(config.listTitle(row) || '(bez naziva)')}</td>
          <td><span class="badge ${row.visible ? 'visible' : 'hidden'}">${row.visible ? 'Prikazano' : 'Sakriveno'}</span></td>
          <td>
            <div class="row-actions">
              <form method="POST" action="/admin/${collectionKey}/${row.id}/move"><input type="hidden" name="dir" value="up"><button class="a-btn secondary small" ${idx === 0 ? 'disabled' : ''} title="Pomjeri gore">↑</button></form>
              <form method="POST" action="/admin/${collectionKey}/${row.id}/move"><input type="hidden" name="dir" value="down"><button class="a-btn secondary small" ${idx === rows.length - 1 ? 'disabled' : ''} title="Pomjeri dole">↓</button></form>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <a href="/admin/${collectionKey}/${row.id}/edit" class="a-btn secondary small">Izmijeni</a>
              <form method="POST" action="/admin/${collectionKey}/${row.id}/toggle"><button class="a-btn secondary small">${row.visible ? 'Sakrij' : 'Prikaži'}</button></form>
              <form method="POST" action="/admin/${collectionKey}/${row.id}/delete" data-confirm="Da li ste sigurni da želite da obrišete ovu stavku?"><button class="a-btn danger small">Obriši</button></form>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function collectionFormPage({ collectionKey, config, row, flash, adminEmail, unreadCount, isNew }) {
  row = row || {};
  const fieldsHtml = config.fields.map(f => renderField(f, row)).join('');
  const body = html`
  <div class="admin-card">
    <h2>${isNew ? 'Dodaj' : 'Izmijeni'} — ${esc(config.label)}</h2>
    <p class="card-desc">Polja označena CG / EN unosite na oba jezika; posjetioci prebacuju jezik na sajtu.</p>
    <form method="POST" action="${isNew ? `/admin/${collectionKey}/new` : `/admin/${collectionKey}/${row.id}/edit`}" enctype="multipart/form-data">
      ${raw(fieldsHtml)}
      <div style="display:flex;gap:10px;margin-top:24px;">
        <button type="submit" class="a-btn">${isNew ? 'Sačuvaj' : 'Sačuvaj izmjene'}</button>
        <a href="/admin/${collectionKey}" class="a-btn secondary">Otkaži</a>
      </div>
    </form>
  </div>
  `;
  return adminLayout({ active: collectionKey, title: (isNew ? 'Dodaj' : 'Izmijeni') + ' — ' + config.label, bodyHtml: body, flash, adminEmail, unreadCount });
}

function renderField(f, row) {
  if (f.type === 'checkbox') {
    const checked = row[f.name] ? 'checked' : '';
    return `<div class="a-field"><label class="a-checkbox"><input type="checkbox" name="${f.name}" value="1" ${checked}> ${esc(f.label)}</label></div>`;
  }
  if (f.type === 'image') {
    const val = row[f.name] || '';
    const previewId = 'preview-' + f.name;
    return `
    <div class="a-field">
      <label>${esc(f.label)}</label>
      <div class="upload-row">
        <img id="${previewId}" src="${esc(val)}" class="thumb-sm" style="${val ? '' : 'display:none;'} width:70px;height:70px;">
        <input type="file" name="${f.name}_file" accept="image/*" data-preview-target="${previewId}">
      </div>
      <input type="text" name="${f.name}_url" value="${esc(val)}" placeholder="ili nalijepite link ka slici (https://...)">
      <div class="hint">Otpremite fajl sa računara ili nalijepite link ka slici. Otpremljeni fajl ima prednost.</div>
    </div>`;
  }
  if (f.bilingual) {
    const groupId = 'grp-' + f.name;
    const meVal = row[f.name + '_me'] || '';
    const enVal = row[f.name + '_en'] || '';
    const tag = f.type === 'textarea' ? 'textarea' : 'input';
    const inputMe = tag === 'textarea'
      ? `<textarea name="${f.name}_me">${esc(meVal)}</textarea>`
      : `<input type="text" name="${f.name}_me" value="${esc(meVal)}">`;
    const inputEn = tag === 'textarea'
      ? `<textarea name="${f.name}_en">${esc(enVal)}</textarea>`
      : `<input type="text" name="${f.name}_en" value="${esc(enVal)}">`;
    return `
    <div class="a-field" data-lang-tabs id="${groupId}">
      <label>${esc(f.label)}</label>
      <div class="lang-tabs">
        <button type="button" class="lang-tab-btn active" data-target="${f.name}-me">Crnogorski</button>
        <button type="button" class="lang-tab-btn" data-target="${f.name}-en">English</button>
      </div>
      <div class="lang-pane active" data-pane="${f.name}-me">${inputMe}</div>
      <div class="lang-pane" data-pane="${f.name}-en">${inputEn}</div>
    </div>`;
  }
  const val = row[f.name] || '';
  if (f.type === 'textarea') {
    return `<div class="a-field"><label>${esc(f.label)}</label><textarea name="${f.name}">${esc(val)}</textarea></div>`;
  }
  return `<div class="a-field"><label>${esc(f.label)}</label><input type="text" name="${f.name}" value="${esc(val)}"></div>`;
}

module.exports = { collectionListPage, collectionFormPage };
