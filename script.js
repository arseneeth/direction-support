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

    // There is a drawn signature per language. If one fails to load the <img>
    // removes itself and the Caveat fallback takes over, which is localised
    // through heroSignatureAlt anyway.
    var sig = document.querySelector('.signature-img');
    if (sig) {
      var src = 'assets/signature_' + (lang === 'ru' ? 'ru' : 'en') + '.png';
      if (sig.getAttribute('src') !== src) sig.setAttribute('src', src);
      sig.alt = t.heroSignatureAlt || sig.alt;
    }

    scheduleHeroName();
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

  function syncHeroName() {
    var name = document.querySelector('.hero-name');
    var grid = document.querySelector('.hero-grid');
    var text = name && name.querySelector('.hero-name-text');
    if (!name || !grid || !text) return;

    grid.style.removeProperty('--fs');

    var kids = name.children;
    var gap = parseFloat(getComputedStyle(name).columnGap) || 0;

    function contentWidth() {
      var w = 0;
      for (var i = 0; i < kids.length; i++) w += kids[i].getBoundingClientRect().width;
      return w + gap * Math.max(0, kids.length - 1);
    }

    var avail = name.clientWidth;
    var w = contentWidth();

    // The two drawn signatures have very different proportions, and Cyrillic
    // "КРИСТИНА" is far wider than "KRISTINA", so the lockup outgrows its row
    // in one language and not the other. Everything scales off --fs, so one
    // proportional pass is enough to bring it back inside.
    if (avail > 0 && w > avail) {
      var fs = parseFloat(getComputedStyle(text).fontSize);
      grid.style.setProperty('--fs', (fs * (avail / w) * 0.995) + 'px');
      w = contentWidth();
    }

    grid.style.setProperty('--name-w', Math.ceil(w) + 'px');

    // The folio box lines up with the name box exactly, but the eye reads ink,
    // not boxes: "K" carries a left side bearing that "counselling" does not,
    // so the label looks a few pixels adrift. Measure that bearing and inset
    // the left label by it. Only the left label moves, so "coach" stays
    // aligned with the end of the signature.
    grid.style.setProperty('--name-bearing', leftBearing(text) + 'px');
  }

  function leftBearing(el) {
    var text = (el.textContent || '').trim();
    if (!text) return 0;
    try {
      var cs = getComputedStyle(el);
      var ctx = (leftBearing.ctx || (leftBearing.ctx =
        document.createElement('canvas').getContext('2d')));
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var m = ctx.measureText(text.charAt(0));
      if (typeof m.actualBoundingBoxLeft !== 'number') return 0;
      var inset = -m.actualBoundingBoxLeft;      // ink starts right of the origin
      return inset > 0 && inset < 40 ? Math.round(inset * 10) / 10 : 0;
    } catch (e) {
      return 0;
    }
  }

  // Measure now, then again once layout and webfonts have settled. Switching
  // language pulls in a different subset of the script face, and measuring
  // before it lands gives a width that is off by several pixels.
  function scheduleHeroName() {
    syncHeroName();
    requestAnimationFrame(syncHeroName);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeroName);
    }
  }

  function initHeroName() {
    scheduleHeroName();
    window.addEventListener('resize', syncHeroName);
    window.addEventListener('load', scheduleHeroName);

    var sig = document.querySelector('.signature-img');
    if (sig) sig.addEventListener('load', scheduleHeroName);

    // Watch the row itself rather than relying on window resize: this also
    // catches a font landing or the container changing for any other reason,
    // and leaves no window where --name-w still holds a previous width.
    //
    // Deliberately synchronous. Deferring to requestAnimationFrame strands the
    // measurement whenever frames are throttled (a hidden or background tab):
    // the callback never runs, and --name-w keeps a stale width. Nothing here
    // resizes the observed element itself — only --fs on its children — so
    // this cannot feed back into the observer; the guard is belt and braces.
    var name = document.querySelector('.hero-name');
    if (name && 'ResizeObserver' in window) {
      var running = false;
      new ResizeObserver(function () {
        if (running) return;
        running = true;
        try { syncHeroName(); } finally { running = false; }
      }).observe(name);
    }
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

  /* ------------------------------ parallax ------------------------------
     A light drift on the text inside each block. The transform goes on the
     children, never on the block itself: the modular grids draw their
     hairlines from cells sitting flush against each other, and moving the
     cells would tear those seams open.
  ----------------------------------------------------------------------- */

  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    var AMPLITUDE = 8; // px of travel across the whole viewport
    var boxes = document.querySelectorAll('.section-head, .card, .review, .shift, .note-block');
    if (!boxes.length) return;

    var live = [];

    function paint() {
      ticking = false;
      var vh = window.innerHeight || 1;

      for (var i = 0; i < live.length; i++) {
        var box = live[i];
        var r = box.getBoundingClientRect();
        var offset = ((r.top + r.height / 2) - vh / 2) / vh * AMPLITUDE;
        var t = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
        var kids = box.children;
        for (var k = 0; k < kids.length; k++) kids[k].style.transform = t;
      }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var el = entries[i].target;
        var at = live.indexOf(el);
        if (entries[i].isIntersecting) {
          if (at === -1) {
            live.push(el);
            for (var k = 0; k < el.children.length; k++) el.children[k].classList.add('px');
          }
        } else if (at > -1) {
          live.splice(at, 1);
        }
      }
      onScroll();
    }, { rootMargin: '25% 0px 25% 0px' });

    for (var i = 0; i < boxes.length; i++) io.observe(boxes[i]);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initI18n();
    initHeroName();
    initNav();
    initHeader();
    initScrollSpy();
    initReveal();
    initStickyCta();
    initParallax();
    initYear();
  });
})();
