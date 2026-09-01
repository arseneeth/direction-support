/* ---------------------------------------------------------------------------
   direction.support — behaviour
   i18n (text / lists / attributes), language toggle, mobile nav,
   sticky-header state, scroll-spy, and reveal-on-scroll.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var LANG_KEY = 'direction-support-lang';
  var DEFAULT_LANG = 'en';
  var I18N = window.DIRECTION_SUPPORT_I18N || {};

  /* ------------------------------ language ------------------------------ */

  function getLang() {
    try {
      return localStorage.getItem(LANG_KEY) === 'ru' ? 'ru' : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function storeLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function applyTranslations(lang) {
    var t = I18N[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });

    document.querySelectorAll('[data-i18n-list]').forEach(function (el) {
      var list = t[el.getAttribute('data-i18n-list')];
      if (!Array.isArray(list)) return;
      var frag = document.createDocumentFragment();
      list.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        frag.appendChild(li);
      });
      el.replaceChildren(frag);
    });

    // data-i18n-attr="aria-label:someKey, title:otherKey"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        var attr = (bits[0] || '').trim();
        var v = t[(bits[1] || '').trim()];
        if (attr && v != null) el.setAttribute(attr, v);
      });
    });

    document.documentElement.lang = lang;

    // The signature image is language-specific; fall back to the other file,
    // then to the Caveat text, without ever leaving a broken image behind.
    var sig = document.querySelector('.signature-img');
    if (sig) sig.alt = t.heroSignatureAlt || sig.alt;

    scheduleFolioSync();
  }

  function initI18n() {
    var lang = getLang();
    applyTranslations(lang);

    var btn = document.getElementById('lang-toggle');
    if (!btn) return;

    function paintToggle(l) {
      btn.textContent = l === 'en' ? 'RU' : 'EN';
      btn.setAttribute('aria-label', l === 'en' ? 'Переключить на русский' : 'Switch to English');
    }

    paintToggle(lang);
    btn.addEventListener('click', function () {
      var next = getLang() === 'en' ? 'ru' : 'en';
      storeLang(next);
      applyTranslations(next);
      paintToggle(next);
    });
  }

  /* --------------------------- hero folio width -------------------------
     The folio line is constrained to the width of the name, so "coach" ends
     exactly where "Van" does, at every breakpoint. The name's width depends on the
     language, the viewport, the webfont and whether signature.png loaded, so
     it is measured rather than guessed.
  ----------------------------------------------------------------------- */

  function syncFolioWidth() {
    var name = document.querySelector('.hero-name');
    var grid = document.querySelector('.hero-grid');
    if (!name || !grid) return;

    var kids = name.children;
    var w = 0;
    for (var i = 0; i < kids.length; i++) w += kids[i].getBoundingClientRect().width;
    var gap = parseFloat(getComputedStyle(name).columnGap) || 0;
    w += gap * Math.max(0, kids.length - 1);

    grid.style.setProperty('--name-w', Math.ceil(w) + 'px');
  }

  // Measure now, then again once layout and webfonts have settled. Switching
  // language pulls in a different subset of the script face, and measuring
  // before it lands gives a width that is off by several pixels.
  function scheduleFolioSync() {
    syncFolioWidth();
    requestAnimationFrame(syncFolioWidth);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncFolioWidth);
    }
  }

  function initFolioWidth() {
    scheduleFolioSync();
    window.addEventListener('resize', syncFolioWidth);
    window.addEventListener('load', scheduleFolioSync);

    var sig = document.querySelector('.signature-img');
    if (sig) sig.addEventListener('load', scheduleFolioSync);
  }

  /* ------------------------------ mobile nav ---------------------------- */

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) close();
    });
  }

  /* --------------------------- header + scrollspy ----------------------- */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function paint() {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    }
    paint();
    window.addEventListener('scroll', paint, { passive: true });
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    var sections = [];
    links.forEach(function (link) {
      var el = document.getElementById(link.getAttribute('href').slice(1));
      if (el) { byId[el.id] = link; sections.push(el); }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var active = byId[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ------------------------------ reveal -------------------------------- */

  function initReveal() {
    var targets = document.querySelectorAll('.section-head, .card, .journey-step, .review, .note-block, .cert-slot, .stat, .booking, .contact-alt, .rules');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    function reveal(el) {
      el.classList.add('is-visible');
    }

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      observer.observe(el);
    });

    // Safety net: an IntersectionObserver can miss elements when the page
    // jumps straight to an anchor or restores a scroll position, which would
    // leave whole sections stuck at opacity 0. Sweep anything already on
    // screen ourselves, on load and while scrolling.
    function sweep() {
      var pending = document.querySelectorAll('.reveal:not(.is-visible)');
      for (var i = 0; i < pending.length; i++) {
        var r = pending[i].getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          reveal(pending[i]);
          observer.unobserve(pending[i]);
        }
      }
      if (!document.querySelector('.reveal:not(.is-visible)')) {
        window.removeEventListener('scroll', onScroll);
      }
    }

    var queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sweep(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', sweep);
    sweep();
  }

  /* ------------------------------- misc --------------------------------- */

  function initStickyCta() {
    var cta = document.getElementById('sticky-cta');
    var hero = document.querySelector('.hero');
    var contact = document.getElementById('contact');
    if (!cta || !hero) return;

    function paint() {
      var pastHero = window.scrollY > hero.offsetHeight * 0.75;
      var atContact = contact
        ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      cta.classList.toggle('is-visible', pastHero && !atContact);
    }

    paint();
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initI18n();
    initFolioWidth();
    initNav();
    initHeader();
    initScrollSpy();
    initReveal();
    initStickyCta();
    initYear();
  });
})();
