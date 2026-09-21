(function () {
  'use strict';
  var root = document.documentElement;

  // ---------- Theme ----------
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('orub_theme', t); } catch (e) {}
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.textContent = t === 'dark' ? '☀' : '☾';
    });
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('orub_theme'); } catch (e) {}
  if (!savedTheme) savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme);
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---------- Language ----------
  function applyLang(l) {
    root.setAttribute('data-lang', l);
    try { localStorage.setItem('orub_lang', l); } catch (e) {}
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.textContent = l === 'me' ? 'EN' : 'CG';
    });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === l);
    });
  }
  var savedLang = null;
  try { savedLang = localStorage.getItem('orub_lang'); } catch (e) {}
  applyLang(savedLang === 'en' ? 'en' : 'me');
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang-toggle]');
    if (btn) {
      var current = root.getAttribute('data-lang');
      applyLang(current === 'me' ? 'en' : 'me');
      return;
    }
    var langBtn = e.target.closest('[data-lang-btn]');
    if (langBtn) applyLang(langBtn.getAttribute('data-lang-btn'));
  });

  // ---------- Mobile nav ----------
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-mobile-toggle]');
    if (toggle) {
      var nav = document.querySelector('.nav-links');
      if (nav) nav.classList.toggle('open');
      return;
    }
    var link = e.target.closest('.nav-links a');
    if (link) {
      var navEl = document.querySelector('.nav-links');
      if (navEl) navEl.classList.remove('open');
    }
  });

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- FAQ accordion ----------
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq-q');
    if (!q) return;
    var item = q.closest('.faq-item');
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!wasOpen) item.classList.add('open');
  });

  // ---------- Contact form ----------
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msgBox = document.getElementById('form-msg');
      var submitBtn = form.querySelector('[type=submit]');
      msgBox.className = 'form-msg';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      var data = new URLSearchParams(new FormData(form));
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString()
      }).then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (result) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          if (result.ok && result.body.success) {
            form.reset();
            msgBox.className = 'form-msg show ok';
            msgBox.textContent = form.getAttribute('data-success-me');
            if (root.getAttribute('data-lang') === 'en') msgBox.textContent = form.getAttribute('data-success-en');
          } else {
            msgBox.className = 'form-msg show err';
            msgBox.textContent = form.getAttribute('data-error-me');
            if (root.getAttribute('data-lang') === 'en') msgBox.textContent = form.getAttribute('data-error-en');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          msgBox.className = 'form-msg show err';
          msgBox.textContent = form.getAttribute('data-error-me');
        });
    });
  }
})();
