(function () {
  'use strict';

  // Language tabs inside forms (ME / EN fields)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.lang-tab-btn');
    if (btn) {
      var group = btn.closest('[data-lang-tabs]');
      var target = btn.getAttribute('data-target');
      group.querySelectorAll('.lang-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      group.querySelectorAll('.lang-pane').forEach(function (p) { p.classList.remove('active'); });
      group.querySelector('[data-pane="' + target + '"]').classList.add('active');
      return;
    }
  });

  // Confirm delete
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.hasAttribute('data-confirm')) {
      if (!window.confirm(form.getAttribute('data-confirm'))) {
        e.preventDefault();
      }
    }
  });

  // Image preview on file input
  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-preview-target]');
    if (!input || !input.files || !input.files[0]) return;
    var targetId = input.getAttribute('data-preview-target');
    var img = document.getElementById(targetId);
    if (!img) return;
    var reader = new FileReader();
    reader.onload = function (ev) { img.src = ev.target.result; img.style.display = 'block'; };
    reader.readAsDataURL(input.files[0]);
  });

  // Auto-dismiss flash messages
  document.querySelectorAll('.admin-flash').forEach(function (el) {
    setTimeout(function () { el.style.transition = 'opacity .4s ease'; el.style.opacity = '0'; }, 4000);
  });
})();
