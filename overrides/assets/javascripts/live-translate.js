/**
 * Live translation layer — the "site-wide English" mode.
 *
 * When enabled (header English button or the /en/ guide button), every page
 * the visitor opens is machine-translated in the browser through
 * /api/translate (Pages Function). Original Chinese is never modified;
 * toggling back reloads the page. Translated segments are cached in
 * localStorage keyed by source text, so repeat visits and repeated labels
 * (nav, tabs) render instantly.
 *
 * Works only where the Pages Function exists (jinguo.tech). Elsewhere the
 * first batch fails and the mode is rolled back with a hint.
 */
(function() {
  'use strict';

  var LS_FLAG = 'wb-live-lang';
  var LS_CACHE = 'wb-tr-cache-v1';
  var CACHE_MAX_ENTRIES = 2500;
  var ENDPOINT = '/api/translate';
  var MAX_BATCH_CHARS = 1200;
  var MAX_BATCH_ITEMS = 16;
  var CONCURRENCY = 2;
  var RETRY_DELAYS_MS = [3000, 8000]; // throttled/failed batches get 2 retries

  var SKIP_SELECTOR = [
    'script', 'style', 'noscript', 'pre', 'code', 'kbd', 'samp', 'svg', 'math',
    '.mermaid', '.diagram-trigger', '.diagram-overlay', '.diagram-lightbox',
    '.wiki-book-tools', '.wiki-book-tool-toast', '.wb-live-pill',
    'textarea', 'input', 'select', 'option', '[contenteditable]', '[data-live-skip]'
  ].join(',');

  var CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff]/;

  var running = false;
  var pillEl = null;

  function langOn() {
    try { return localStorage.getItem(LS_FLAG) === 'en'; } catch (_) { return false; }
  }

  function setLang(value) {
    try {
      if (value) localStorage.setItem(LS_FLAG, value);
      else localStorage.removeItem(LS_FLAG);
    } catch (_) { /* private mode */ }
  }

  // ── Segment cache: FNV-1a keyed, LRU-trimmed, quota-tolerant ──
  var cache = (function() {
    try { return JSON.parse(localStorage.getItem(LS_CACHE)) || { map: {}, order: [] }; }
    catch (_) { return { map: {}, order: [] }; }
  })();

  function segKey(text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(36) + ':' + text.length;
  }

  function cacheGet(key) {
    if (!Object.prototype.hasOwnProperty.call(cache.map, key)) return null;
    var idx = cache.order.indexOf(key);
    if (idx >= 0) { cache.order.splice(idx, 1); cache.order.push(key); }
    return cache.map[key];
  }

  function cachePut(key, value) {
    if (cache.map[key] !== undefined) {
      var idx = cache.order.indexOf(key);
      if (idx >= 0) cache.order.splice(idx, 1);
    }
    cache.map[key] = value;
    cache.order.push(key);
    while (cache.order.length > CACHE_MAX_ENTRIES) {
      var oldest = cache.order.shift();
      delete cache.map[oldest];
    }
  }

  var lastSave = 0;

  function cacheSave(force) {
    // Persist incrementally: a full page can take minutes, and visitors
    // toggle away mid-run — whatever is translated must survive.
    var now = Date.now();
    if (!force && now - lastSave < 3000) return;
    lastSave = now;
    try {
      localStorage.setItem(LS_CACHE, JSON.stringify(cache));
    } catch (_) {
      // Quota exceeded: keep the newest half and retry once.
      var drop = cache.order.splice(0, Math.floor(cache.order.length / 2));
      for (var i = 0; i < drop.length; i++) delete cache.map[drop[i]];
      try { localStorage.setItem(LS_CACHE, JSON.stringify(cache)); } catch (_) { /* give up */ }
    }
  }

  // ── DOM collection ──
  function hasCJK(text) { return CJK_RE.test(text); }

  function collect(root) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var value = node.nodeValue;
        if (!value || !value.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        if (!hasCJK(value)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  function collectNodes() {
    var priority = document.querySelectorAll('.md-header, .md-tabs, .md-sidebar');
    var content = document.querySelectorAll('.md-content, .md-footer, .md-content__inner');
    var nodes = [];
    priority.forEach(function(r) { nodes = nodes.concat(collect(r)); });
    content.forEach(function(r) { nodes = nodes.concat(collect(r)); });
    return nodes;
  }

  // ── Pill indicator ──
  function pill() {
    if (!pillEl) {
      pillEl = document.createElement('div');
      pillEl.className = 'wb-live-pill';
      document.body.appendChild(pillEl);
    }
    return pillEl;
  }

  function showPill(text, sticky) {
    var el = pill();
    el.textContent = text;
    el.classList.add('is-visible');
    window.clearTimeout(el._hideTimer);
    if (!sticky) {
      el._hideTimer = window.setTimeout(function() {
        el.classList.remove('is-visible');
      }, 1500);
    }
  }

  // ── Upstream call ──
  function requestBatch(texts) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'en', texts: texts })
    }).then(function(resp) {
      if (!resp.ok) {
        return resp.json().catch(function() { return {}; }).then(function(err) {
          var e = new Error(err.error || ('HTTP ' + resp.status));
          e.status = resp.status;
          throw e;
        });
      }
      return resp.json();
    }).then(function(data) {
      if (!data || !Array.isArray(data.texts) || data.texts.length !== texts.length) {
        throw new Error('Malformed translation response');
      }
      return data.texts;
    });
  }

  function delay(ms) {
    return new Promise(function(resolve) { window.setTimeout(resolve, ms); });
  }

  function requestBatchWithRetry(texts, attempt) {
    return requestBatch(texts).catch(function(error) {
      var status = error && error.status;
      if (attempt < RETRY_DELAYS_MS.length && (status === 429 || status >= 500 || status === undefined)) {
        return delay(RETRY_DELAYS_MS[attempt]).then(function() {
          return requestBatchWithRetry(texts, attempt + 1);
        });
      }
      throw error;
    });
  }

  // ── Translation pass ──
  function start() {
    if (running || !langOn()) return Promise.resolve();
    var nodes = collectNodes();
    if (!nodes.length) return Promise.resolve();

    running = true;
    var queue = [];
    var batch = { items: [], chars: 0 };
    var done = 0, failed = 0, total = 0;

    nodes.forEach(function(node) {
      var raw = node.nodeValue;
      var src = raw.trim();
      var key = segKey(src);
      var hit = cacheGet(key);
      if (hit !== null) {
        node.nodeValue = raw.replace(src, hit);
        return;
      }
      node._wbLive = { raw: raw, src: src, key: key };
      if (batch.items.length >= MAX_BATCH_ITEMS || batch.chars + src.length > MAX_BATCH_CHARS) {
        if (batch.items.length) queue.push(batch);
        batch = { items: [], chars: 0 };
      }
      batch.items.push(node);
      batch.chars += src.length;
      total++;
    });
    if (batch.items.length) queue.push(batch);

    if (!total) { running = false; return Promise.resolve(); }

    function onProgress() {
      var settledCount = done + failed;
      if (settledCount >= total) {
        running = false;
        cacheSave(true);
        showPill(failed ? 'Translated · ' + failed + ' blocks failed' : 'Translated', false);
        // Late-injected widgets (book cover caption, per-page tools) missed
        // the first walk; one bounded resweep catches them. Already-
        // translated nodes contain no CJK, so they are skipped naturally.
        window.setTimeout(function() {
          if (!langOn()) return;
          running = false;
          start();
        }, 3000);
      } else {
        showPill('Translating… ' + settledCount + '/' + total, true);
      }
    }

    var cursor = 0;
    function next() {
      if (cursor >= queue.length) return;
      var current = queue[cursor++];
      var texts = current.items.map(function(n) { return n._wbLive.src; });
      requestBatchWithRetry(texts, 0).then(function(out) {
        current.items.forEach(function(node, i) {
          var meta = node._wbLive;
          var text = (out[i] && typeof out[i] === 'string') ? out[i] : meta.src;
          cachePut(meta.key, text);
          node.nodeValue = meta.raw.replace(meta.src, text);
          delete node._wbLive;
          done++;
        });
        cacheSave(false);
      }).catch(function(error) {
        failed += current.items.length;
        if (error && error.status === 404) {
          // Endpoint missing (mirror / non-Cloudflare host): roll the mode back.
          setLang(null);
          if (window.showToast) window.showToast('整站实时翻译仅在 jinguo.tech 提供');
          current.items.forEach(function(node) { delete node._wbLive; });
          cursor = queue.length; // stop scheduling further batches
        }
      }).then(onProgress).then(next);
    }

    showPill('Translating… 0/' + total, true);
    for (var i = 0; i < CONCURRENCY; i++) next();
    return Promise.resolve();
  }

  function toggle() {
    if (langOn()) {
      setLang(null);
      window.location.reload();
      return;
    }
    setLang('en');
    start();
  }

  window.WBLiveTranslate = { toggle: toggle, langOn: langOn, start: start };

  window.addEventListener('pagehide', function() {
    if (cache.order.length) cacheSave(true);
  });

  function init() {
    if (langOn()) start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
