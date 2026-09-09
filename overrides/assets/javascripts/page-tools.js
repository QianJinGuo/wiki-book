/**
 * Page tools — lightweight controls shared by the documentation pages.
 *
 * English opens the current page through Google Translate. Mermaid reuses
 * the existing diagram overlay when the current page contains diagrams.
 */
(function() {
  'use strict';

  var TOOLS_ID = 'wiki-book-tools';

  function translateUrl() {
    return 'https://translate.google.com/translate?sl=auto&tl=en&u=' +
      encodeURIComponent(window.location.href);
  }

  function showToast(message) {
    var toast = document.getElementById('wiki-book-tool-toast');
    if (!toast) {
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

  function hasMermaidOverlay() {
    return typeof window.wikiBookOpenMermaid === 'function' &&
      document.getElementById('diagram-overlay');
  }

  function renderTools() {
    var header = document.querySelector('.md-header__inner');
    if (!header) return;

    var tools = document.getElementById(TOOLS_ID);
    if (!tools) {
      tools = document.createElement('div');
      tools.id = TOOLS_ID;
      tools.className = 'wiki-book-tools';
      tools.innerHTML =
        '<a class="wiki-book-tool wiki-book-tool--translate" ' +
          'target="_blank" rel="noopener" aria-label="翻译为英文" title="翻译为英文">' +
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

      tools.querySelector('.wiki-book-tool--mermaid').addEventListener('click', function() {
        if (hasMermaidOverlay()) {
          window.wikiBookOpenMermaid();
        } else {
          showToast('本页暂无 Mermaid 图表');
        }
      });
    }

    var translate = tools.querySelector('.wiki-book-tool--translate');
    translate.href = translateUrl();

    var mermaid = tools.querySelector('.wiki-book-tool--mermaid');
    var ready = Boolean(hasMermaidOverlay());
    mermaid.classList.toggle('is-disabled', !ready);
    mermaid.setAttribute('aria-disabled', String(!ready));
    mermaid.title = ready ? '打开本页 Mermaid 图表' : '本页暂无 Mermaid 图表';
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
