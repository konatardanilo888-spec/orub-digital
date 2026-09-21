'use strict';
const { html, esc, raw } = require('../../lib/util');

function loginPage({ error }) {
  return `<!DOCTYPE html>
<html lang="me">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prijava — Admin | ORUB DIGITAL</title>
<meta name="robots" content="noindex,nofollow">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="admin-login-wrap">
  <div class="admin-login-card">
    <h1>ORUB<span style="opacity:.5">.</span>DIGITAL</h1>
    <p class="sub">Prijava u admin panel</p>
    ${error ? `<div class="admin-flash err">${esc(error)}</div>` : ''}
    <form method="POST" action="/admin/login">
      <div class="a-field">
        <label>E-mail</label>
        <input type="email" name="email" required autofocus>
      </div>
      <div class="a-field">
        <label>Lozinka</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit" class="a-btn" style="width:100%;justify-content:center;margin-top:8px;">Prijavi se</button>
    </form>
  </div>
</div>
</body>
</html>`;
}

module.exports = { loginPage };
