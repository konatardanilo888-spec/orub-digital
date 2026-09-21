'use strict';
const { html, raw, esc } = require('../lib/util');

function publicLayout({ settings, bodyHtml, metaDescriptionOverride }) {
  const desc = metaDescriptionOverride || settings.meta_description_me;
  const wa = (settings.whatsapp || '').replace(/[^0-9]/g, '');
  const viber = (settings.viber || '').replace(/[^0-9]/g, '');

  return `<!DOCTYPE html>
<html lang="me" data-theme="light" data-lang="me">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(settings.site_name)} — ${esc('Izrada sajtova, web prodavnica i redizajn')}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0A0A0A">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22black%22/><text x=%2250%22 y=%2268%22 font-size=%2260%22 fill=%22white%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-weight=%22bold%22>O</text></svg>')}">
<meta property="og:title" content="${esc(settings.site_name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<script>
(function(){try{var t=localStorage.getItem('orub_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);var l=localStorage.getItem('orub_lang')||'me';document.documentElement.setAttribute('data-lang',l);}catch(e){}})();
</script>
</head>
<body>
${headerHtml(settings)}
<main>
${bodyHtml}
</main>
${footerHtml(settings)}
${floatingButtons(wa, viber)}
<script src="/js/main.js"></script>
</body>
</html>`;
}

function headerHtml(settings) {
  return html`
<header class="site-header">
  <div class="container">
    <a href="/" class="logo">ORUB<span class="dot">.</span>DIGITAL</a>
    <nav class="nav-links" id="nav-links">
      <a href="/#usluge" data-lang-text="me">Usluge</a><a href="/#usluge" data-lang-text="en">Services</a>
      <a href="/#zasto-mi" data-lang-text="me">Zašto mi</a><a href="/#zasto-mi" data-lang-text="en">Why us</a>
      <a href="/#portfolio" data-lang-text="me">Portfolio</a><a href="/#portfolio" data-lang-text="en">Portfolio</a>
      <a href="/#paketi" data-lang-text="me">Cijene</a><a href="/#paketi" data-lang-text="en">Pricing</a>
      <a href="/#faq" data-lang-text="me">Pitanja</a><a href="/#faq" data-lang-text="en">FAQ</a>
      <a href="/#kontakt" class="btn btn-primary header-cta-mobile" data-lang-text="me">Zatraži ponudu</a>
      <a href="/#kontakt" class="btn btn-primary header-cta-mobile" data-lang-text="en">Request a quote</a>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" data-lang-toggle type="button" aria-label="Jezik / Language">EN</button>
      <button class="icon-btn" data-theme-toggle type="button" aria-label="Tema / Theme">☾</button>
      <a href="/#kontakt" class="btn btn-primary header-cta" data-lang-text="me">Zatraži ponudu</a>
      <a href="/#kontakt" class="btn btn-primary header-cta" data-lang-text="en">Request a quote</a>
      <button class="icon-btn mobile-toggle" data-mobile-toggle type="button" aria-label="Meni">☰</button>
    </div>
  </div>
</header>`;
}

function footerHtml(settings) {
  const wa = (settings.whatsapp || '').replace(/[^0-9]/g, '');
  return html`
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <div class="footer-logo">ORUB<span style="opacity:.5">.</span>DIGITAL</div>
        <p data-lang-text="me">${settings.footer_note_me}</p>
        <p data-lang-text="en">${settings.footer_note_en}</p>
      </div>
      <div class="footer-col">
        <h4 data-lang-text="me">Navigacija</h4><h4 data-lang-text="en">Navigation</h4>
        <ul>
          <li><a href="/#usluge" data-lang-text="me">Usluge</a><a href="/#usluge" data-lang-text="en">Services</a></li>
          <li><a href="/#portfolio" data-lang-text="me">Portfolio</a><a href="/#portfolio" data-lang-text="en">Portfolio</a></li>
          <li><a href="/#paketi" data-lang-text="me">Cijene</a><a href="/#paketi" data-lang-text="en">Pricing</a></li>
          <li><a href="/#kontakt" data-lang-text="me">Kontakt</a><a href="/#kontakt" data-lang-text="en">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 data-lang-text="me">Kontakt</h4><h4 data-lang-text="en">Contact</h4>
        <ul>
          <li><a href="mailto:${settings.email}">${settings.email}</a></li>
          <li><a href="tel:${(settings.phone || '').replace(/\s+/g, '')}">${settings.phone}</a></li>
          <li><span>${settings.city}, ${settings.country}</span></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 data-lang-text="me">Pratite nas</h4><h4 data-lang-text="en">Follow us</h4>
        <ul>
          ${raw(settings.social_instagram ? `<li><a href="${esc(settings.social_instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : '')}
          ${raw(settings.social_facebook ? `<li><a href="${esc(settings.social_facebook)}" target="_blank" rel="noopener">Facebook</a></li>` : '')}
          ${raw(settings.social_linkedin ? `<li><a href="${esc(settings.social_linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>` : '')}
          ${raw(wa ? `<li><a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></li>` : '')}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} ORUB DIGITAL. <span data-lang-text="me">Sva prava zadržana.</span><span data-lang-text="en">All rights reserved.</span></p>
    </div>
  </div>
</footer>`;
}

function floatingButtons(wa, viber) {
  if (!wa && !viber) return '';
  return html`
<div class="float-contact">
  ${raw(wa ? `<a class="float-btn" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">${raw(waIcon())}</a>` : '')}
  ${raw(viber ? `<a class="float-btn" href="viber://chat?number=%2B${esc(viber)}" aria-label="Viber" title="Viber">${raw(viberIcon())}</a>` : '')}
</div>`;
}

function waIcon() {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.82 14.03c-.25.7-1.45 1.34-2 1.43-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.93-4.29-5.08-4.49-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.13.08.75-.17 1.45z"/></svg>`;
}
function viberIcon() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2C7.1 1.9 2.4 5.6 2 10.9c-.2 3 .8 5.6 2.7 7.6l-.6 3.4 3.6-1c1.4.6 2.9.9 4.5.9h.1c5.5 0 10-4.4 10.2-9.8C22.7 6.6 18.1 2.1 12.3 2zm5.4 14.6c-.2.5-1.1 1-1.6 1.1-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.4-.5-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4-.1.6.4.2.5.7 1.7.8 1.8.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.4-.1.1-.3.3-.1.6.2.3.7 1.1 1.5 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5-.1.2-.2.6-.7.8-.9.2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.1.1.6-.1 1.1z"/><path d="M12.4 4.7c-3.9 0-7 2.9-7.2 6.7 0 .2.2.4.4.4s.4-.2.4-.4c.2-3.3 3-5.9 6.4-5.9.2 0 .4-.2.4-.4s-.2-.4-.4-.4z"/></svg>`;
}

module.exports = { publicLayout, headerHtml, footerHtml };
