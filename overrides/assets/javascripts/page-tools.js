/**
 * Page tools — lightweight controls shared by the documentation pages.
 *
 * English opens the curated English guide (/en/). Machine translation via
 * translate.goog is not offered: Cloudflare bot protection challenges the
 * Google Translate fetcher on the Pages deployment, so proxied pages 403
 * and never load. Inside the translate.goog proxy (user arrived some other
 * way) the control and the language switcher escape back to the real site.
 *
 * Mermaid reuses the existing diagram overlay; the control stays hidden
 * until the overlay reports readiness so it never shows up dead.
 */
(function() {
  'use strict';

  var TOOLS_ID = 'wiki-book-tools';
  var REAL_ORIGINS = ['jinguo.tech', 'wiki.jinguo.tech'];

  function inTranslateProxy() {
    return /\.translate\.goog$/.test(window.location.hostname);
  }

  function isLocalHost() {
    return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  }

  function isEnglishPage() {
    return /^\/(en\/|agent-book\/)/.test(window.location.pathname);
  }

  // translate.goog encodes the original host as a hyphenated subdomain
  // (jinguo-tech.translate.goog -> jinguo.tech). Only escape to hosts we own.
  function realOrigin() {
    var m = window.location.hostname.match(/^(.+)\.translate\.goog$/);
    if (m) {
      var host = m[1].replace(/-/g, '.');
      if (REAL_ORIGINS.indexOf(host) !== -1) return 'https://' + host;
    }
    return 'https://jinguo.tech';
  }

  function showToast(message) {
    var toast = document.getElementById('wiki-book-tool-toast');    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wiki-book-tool-toast';
      toast.className = 'wiki-book-tool-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(function() {
      toast.classList.remove('is-visible');
    }, 2600);
  }
  window.showToast = showToast; // reused by live-translate.js

  function hasMermaidOverlay() {
    return typeof window.wikiBookOpenMermaid === 'function' &&
      document.getElementById('diagram-overlay');
  }

  function renderTools() {
    // Mark English pages so theme.css can hide the Chinese navigation
    // chrome; the header language switcher stays as the way back.
    if (document.body) document.body.classList.toggle('wiki-book-en', isEnglishPage());

    var header = document.querySelector('.md-header__inner');
    if (!header) return;

    var tools = document.getElementById(TOOLS_ID);
    if (!tools) {
      tools = document.createElement('div');
      tools.id = TOOLS_ID;
      tools.className = 'wiki-book-tools';
      tools.innerHTML =
        '<a class="wiki-book-tool wiki-book-tool--translate" ' +
          'href="#" role="button" aria-label="切换英文模式" title="切换英文模式">' +
          '<span class="wiki-book-tool__icon" aria-hidden="true">🌐</span>' +
          '<span class="wiki-book-tool__label">English</span>' +
        '</a>' +
        '<button class="wiki-book-tool wiki-book-tool--mermaid" type="button" ' +
          'aria-label="打开 Mermaid 图表" title="打开 Mermaid 图表">' +
          '<span class="wiki-book-tool__icon" aria-hidden="true">📐</span>' +
          '<span class="wiki-book-tool__label">Mermaid</span>' +
        '</button>';

      var source = header.querySelector('.md-header__source');
      if (source) header.insertBefore(tools, source);
      else header.appendChild(tools);

      tools.querySelector('.wiki-book-tool--translate').addEventListener('click', function(e) {
        e.preventDefault();
        if (window.WBLiveTranslate) {
          window.WBLiveTranslate.toggle();
          renderTools();
        }
      });

      tools.querySelector('.wiki-book-tool--mermaid').addEventListener('click', function() {
        if (hasMermaidOverlay()) {
          window.wikiBookOpenMermaid();
        } else {
          showToast('本页暂无 Mermaid 图表');
        }
      });
    }

    // English: live site-wide translation toggle. Hidden on the static
    // English surface only while the live mode is off — there is nothing
    // to translate there, but the toggle must stay reachable to exit.
    var translate = tools.querySelector('.wiki-book-tool--translate');
    var label = translate.querySelector('.wiki-book-tool__label');
    var liveMode = Boolean(window.WBLiveTranslate && window.WBLiveTranslate.langOn());
    if (liveMode) {
      translate.style.display = '';
      label.textContent = '中文';
      translate.title = '切换回中文（重新加载页面）';
      translate.setAttribute('aria-label', '切换回中文');
    } else if (isEnglishPage()) {
      translate.style.display = 'none';
    } else {
      translate.style.display = '';
      label.textContent = 'English';
      translate.title = '实时翻译整站为英文';
      translate.setAttribute('aria-label', '实时翻译整站为英文');
    }

    // Mermaid: hidden until the diagram overlay is actually ready, so the
    // button never appears dead on pages without diagrams.
    var mermaid = tools.querySelector('.wiki-book-tool--mermaid');
    var ready = Boolean(hasMermaidOverlay());
    mermaid.style.display = ready ? '' : 'none';
    if (ready) {
      mermaid.removeAttribute('aria-disabled');
      mermaid.title = '打开本页 Mermaid 图表';
    } else {
      mermaid.setAttribute('aria-disabled', 'true');
    }
  }

  // Inside the translate proxy, the language switcher (alternate links and
  // the English tab) must reach the real site instead of re-translating it.
  if (inTranslateProxy()) {
    var origin = realOrigin();
    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!a.hasAttribute('hreflang') && !/en\/index\.html$/.test(href)) return;
      var target;
      try {
        target = new URL(href, window.location.href);
      } catch (_) { return; }
      e.preventDefault();
      e.stopPropagation();
      window.location.href = origin + target.pathname + target.search;
    }, true);
  }

  function init() {
    renderTools();
    window.addEventListener('wiki-book:mermaid-ready', renderTools);
    window.addEventListener('popstate', renderTools);

    if (typeof document$ !== 'undefined' && document$.subscribe) {
      document$.subscribe(function() {
        window.setTimeout(renderTools, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
