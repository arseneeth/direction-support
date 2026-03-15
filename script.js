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
    if (btn) btn.textContent = lang === 'en' ? 'RU' : 'EN';
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

  var CALENDLY_URL = 'https://calendly.com/wowitskrisw/call';
  var PAYMENT_URL = 'https://revolut.me/wowitskris';

  var calendlyOpen = false;

  function initCalendly() {
    document.querySelectorAll('.js-calendly').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.Calendly) {
          calendlyOpen = true;
          Calendly.initPopupWidget({ url: CALENDLY_URL });
          injectPayLink();
          watchPopupClose();
        } else {
          window.open(CALENDLY_URL, '_blank');
        }
      });
    });
  }

  function openPayment() {
    if (!calendlyOpen) return;
    calendlyOpen = false;
    var payLink = document.querySelector('.calendly-pay-link');
    if (payLink) payLink.remove();
    window.open(PAYMENT_URL, '_blank');
  }

  function injectPayLink() {
    if (document.querySelector('.calendly-pay-link')) return;

    var lang = getLang();
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'calendly-pay-link';
    link.textContent = lang === 'ru' ? 'Закрыть и оплатить' : 'Close and Pay';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      try { Calendly.closePopupWidget(); } catch (_) {}
      openPayment();
    });

    document.body.appendChild(link);
  }

  function watchPopupClose() {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var removed = mutations[i].removedNodes;
        for (var j = 0; j < removed.length; j++) {
          var node = removed[j];
          if (node.nodeType === 1 && node.classList &&
              node.classList.contains('calendly-overlay')) {
            observer.disconnect();
            openPayment();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true });
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!window.location.hash) window.scrollTo(0, 0);
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.hash) window.scrollTo(0, 0);
    initI18n();
    initCalendly();
    updateHeaderScroll();
    window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  });
  window.addEventListener('load', function () {
    if (!window.location.hash) window.scrollTo(0, 0);
    updateHeaderScroll();
  });
})();
