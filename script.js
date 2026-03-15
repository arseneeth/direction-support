(function () {
  var LANG_KEY = 'direction-support-lang';
  var DEFAULT_LANG = 'en'; // English is the default when no preference is set

  function getLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored === 'ru') return 'ru';
      return DEFAULT_LANG; // default: English
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  function applyTranslations(lang) {
    var t = window.DIRECTION_SUPPORT_I18N && window.DIRECTION_SUPPORT_I18N[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] != null) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-list]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-list');
      var list = t[key];
      if (!Array.isArray(list)) return;
      var tag = el.tagName === 'UL' || el.tagName === 'OL' ? 'li' : 'span';
      var itemClass = tag === 'span' ? 'tag' : '';
      el.innerHTML = '';
      list.forEach(function (item) {
        var child = document.createElement(tag);
        if (itemClass) child.className = itemClass;
        child.textContent = item;
        el.appendChild(child);
      });
    });

    document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
  }

  function updateLangToggle(lang) {
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'en' ? 'EN' : 'RU';
  }

  function initI18n() {
    var lang = getLang();
    applyTranslations(lang);
    updateLangToggle(lang);

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = getLang() === 'en' ? 'ru' : 'en';
        setLang(next);
        applyTranslations(next);
        updateLangToggle(next);
      });
    }
  }

  function updateHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!window.location.hash) window.scrollTo(0, 0);
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.hash) window.scrollTo(0, 0);
    initI18n();
    updateHeaderScroll();
    window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  });
  window.addEventListener('load', function () {
    if (!window.location.hash) window.scrollTo(0, 0);
    updateHeaderScroll();
  });
})();
