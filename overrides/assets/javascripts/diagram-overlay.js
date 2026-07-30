/**
 * Diagram Overlay — 文章页自动关联架构图
 * 
 * 零侵入 | 按需加载 mermaid | 左下角可拖动按钮
 * 支持单图放大 lightbox | 模态框可拖拽四边+四角缩放
 */
(function() {
  'use strict';

  const DIAGRAM_BASE = '/diagrams/';
  const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  let mermaidAPI = null;
  let diagrams = null;
  let rendered = false;
  let lightboxOpen = false;

  function getDiagramKey() {
    return window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html?$/, '').replace(/\//g, '-');
  }
  function isArticlePage() {
    return /^\/ch\d+\//.test(window.location.pathname);
  }
  async function loadDiagrams() {
    try {
      const resp = await fetch(DIAGRAM_BASE + getDiagramKey() + '.json');
      if (!resp.ok) return null;
      return await resp.json();
    } catch(e) { return null; }
  }

  // ════════════════════════════════════════════════════
  // Resizable + Draggable overlay
  // ════════════════════════════════════════════════════
  function makeResizable(el, opts) {
    const MIN_W = opts.minW || 420;
    const MIN_H = opts.minH || 300;
    const handles = ['n','s','e','w','ne','nw','se','sw'];

    handles.forEach(function(dir) {
      const h = document.createElement('div');
      h.className = 'diagram-resize-handle diagram-resize-' + dir;
      h.setAttribute('data-dir', dir);
      el.appendChild(h);

      h.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = el.getBoundingClientRect();
        const startW = rect.width;
        const startH = rect.height;
        const startL = rect.left;
        const startT = rect.top;

        function onMove(ev) {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          let newW = startW, newH = startH, newL = startL, newT = startT;

          if (dir.includes('e')) newW = Math.max(MIN_W, startW + dx);
          if (dir.includes('w')) { newW = Math.max(MIN_W, startW - dx); newL = startL + startW - newW; }
          if (dir.includes('s')) newH = Math.max(MIN_H, startH + dy);
          if (dir.includes('n')) { newH = Math.max(MIN_H, startH - dy); newT = startT + startH - newH; }

          el.style.width = newW + 'px';
          el.style.height = newH + 'px';
          el.style.left = newL + 'px';
          el.style.top = newT + 'px';
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        }

        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  function makeDraggable(handle, target) {
    let dragging = false, startX, startY, startL, startT;

    handle.addEventListener('mousedown', function(e) {
      if (e.target.closest('.diagram-overlay-close')) return;
      dragging = true;
      const rect = target.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startL = rect.left; startT = rect.top;
      target.style.left = startL + 'px';
      target.style.top = startT + 'px';
      target.style.right = 'auto'; target.style.bottom = 'auto';
      handle.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      const newL = Math.max(0, Math.min(startL + e.clientX - startX, window.innerWidth - target.offsetWidth));
      const newT = Math.max(0, Math.min(startT + e.clientY - startY, window.innerHeight - 60));
      target.style.left = newL + 'px';
      target.style.top = newT + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (dragging) { dragging = false; handle.style.cursor = 'grab'; }
    });

    handle.style.cursor = 'grab';
  }

  // ════════════════════════════════════════════════════
  // Build UI
  // ════════════════════════════════════════════════════
  function buildUI() {
    const trigger = document.createElement('button');
    trigger.className = 'diagram-trigger';
    trigger.innerHTML = '📐';
    trigger.title = '架构图（' + diagrams.length + ' 张）';
    document.body.appendChild(trigger);
    positionBesideChat(trigger);

    let clickStart = 0, clickPos = { x: 0, y: 0 };
    trigger.addEventListener('mousedown', function(e) {
      clickStart = Date.now(); clickPos = { x: e.clientX, y: e.clientY };
    });
    trigger.addEventListener('mouseup', function(e) {
      if (Date.now() - clickStart < 250 && Math.abs(e.clientX - clickPos.x) < 5 && Math.abs(e.clientY - clickPos.y) < 5) openOverlay();
    });

    // Trigger drag
    let trigDragging = false, trigStartX, trigStartY, trigStartLeft, trigStartTop;
    trigger.addEventListener('mousedown', function(e) {
      trigDragging = true;
      const rect = trigger.getBoundingClientRect();
      trigStartX = e.clientX; trigStartY = e.clientY;
      trigStartLeft = rect.left; trigStartTop = rect.top;
      trigger.style.left = trigStartLeft + 'px';
      trigger.style.top = trigStartTop + 'px';
      trigger.style.right = 'auto'; trigger.style.bottom = 'auto';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!trigDragging) return;
      trigger.style.left = Math.max(0, Math.min(trigStartLeft + e.clientX - trigStartX, window.innerWidth - 52)) + 'px';
      trigger.style.top = Math.max(0, Math.min(trigStartTop + e.clientY - trigStartY, window.innerHeight - 52)) + 'px';
    });
    document.addEventListener('mouseup', function() { trigDragging = false; });

    // ── Overlay ──
    const overlay = document.createElement('div');
    overlay.className = 'diagram-overlay';
    overlay.id = 'diagram-overlay';
    overlay.innerHTML =
      '<div class="diagram-overlay-backdrop" id="diagram-backdrop"></div>' +
      '<div class="diagram-overlay-content" id="diagram-content">' +
        '<div class="diagram-overlay-header" id="diagram-header">' +
          '<span class="diagram-overlay-title">📐 架构图解析</span>' +
          '<span class="diagram-overlay-count">' + diagrams.length + ' 张</span>' +
          '<button class="diagram-overlay-close" id="diagram-close" title="关闭">✕</button>' +
        '</div>' +
        '<div class="diagram-overlay-body" id="diagram-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    const content = document.getElementById('diagram-content');
    makeResizable(content, { minW: 480, minH: 360 });
    makeDraggable(document.getElementById('diagram-header'), content);

    document.getElementById('diagram-close').onclick = closeOverlay;
    document.getElementById('diagram-backdrop').onclick = closeOverlay;
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (lightboxOpen) closeLightbox();
        else closeOverlay();
      }
    });

    // ── Lightbox ──
    const lb = document.createElement('div');
    lb.className = 'diagram-lightbox';
    lb.id = 'diagram-lightbox';
    lb.innerHTML =
      '<div class="diagram-lightbox-backdrop"></div>' +
      '<div class="diagram-lightbox-inner">' +
        '<div class="diagram-lightbox-header">' +
          '<span class="diagram-lightbox-title" id="diagram-lb-title"></span>' +
          '<div class="diagram-lightbox-nav">' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-prev" title="上一张">◀</button>' +
            '<span class="diagram-lightbox-counter" id="diagram-lb-counter"></span>' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-next" title="下一张">▶</button>' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-zoomin" title="放大">🔍+</button>' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-zoomout" title="缩小">🔍−</button>' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-reset" title="重置缩放">1:1</button>' +
            '<button class="diagram-lightbox-btn" id="diagram-lb-close" title="关闭">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="diagram-lightbox-body" id="diagram-lb-body"></div>' +
      '</div>';
    document.body.appendChild(lb);

    document.getElementById('diagram-lb-close').onclick = closeLightbox;
    document.querySelector('#diagram-lightbox .diagram-lightbox-backdrop').onclick = closeLightbox;
    document.getElementById('diagram-lb-prev').onclick = function() { navigateLightbox(-1); };
    document.getElementById('diagram-lb-next').onclick = function() { navigateLightbox(1); };
    document.getElementById('diagram-lb-zoomin').onclick = function() { zoomLightbox(1); };
    document.getElementById('diagram-lb-zoomout').onclick = function() { zoomLightbox(-1); };
    document.getElementById('diagram-lb-reset').onclick = function() { resetZoom(); };
  }

  function positionBesideChat(trigger) {
    const chatBtn = document.querySelector('.ai-chat-trigger');
    if (chatBtn) {
      const chatRect = chatBtn.getBoundingClientRect();
      trigger.style.left = (chatRect.right + 8) + 'px';
      trigger.style.bottom = '1.5rem';
      trigger.style.right = 'auto';
    } else {
      trigger.style.left = '4.5rem';
      trigger.style.bottom = '1.5rem';
    }
  }

  function openOverlay() {
    document.getElementById('diagram-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    const content = document.getElementById('diagram-content');
    content.style.left = ''; content.style.top = '';
    content.style.right = ''; content.style.bottom = '';
    content.style.width = ''; content.style.height = '';
    if (!rendered) renderDiagrams();
  }
  function closeOverlay() {
    document.getElementById('diagram-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ════════════════════════════════════════════════════
  // Lightbox
  // ════════════════════════════════════════════════════
  let currentLbIndex = 0, currentZoom = 1;

  function openLightbox(index) {
    currentLbIndex = index; currentZoom = 1; lightboxOpen = true;
    updateLightbox();
    document.getElementById('diagram-lightbox').classList.add('open');
  }
  function closeLightbox() {
    lightboxOpen = false;
    document.getElementById('diagram-lightbox').classList.remove('open');
  }
  function navigateLightbox(dir) {
    currentLbIndex = (currentLbIndex + dir + diagrams.length) % diagrams.length;
    currentZoom = 1; updateLightbox();
  }
  function zoomLightbox(dir) {
    currentZoom = Math.max(0.3, Math.min(5, currentZoom + dir * 0.3));
    applyLightboxZoom();
  }
  function resetZoom() {
    currentZoom = 1;
    applyLightboxZoom();
  }
  function applyLightboxZoom() {
    const wrapper = document.getElementById('diagram-lb-wrapper');
    if (wrapper) {
      wrapper.style.transform = 'scale(' + currentZoom + ')';
      wrapper.style.transformOrigin = 'center top';
    }
  }

  function updateLightbox() {
    document.getElementById('diagram-lb-title').textContent = (currentLbIndex + 1) + '. ' + diagrams[currentLbIndex].title;
    document.getElementById('diagram-lb-counter').textContent = (currentLbIndex + 1) + ' / ' + diagrams.length;

    const body = document.getElementById('diagram-lb-body');
    currentZoom = 1;

    // Clone the SVG from the rendered card
    const sourceCard = document.querySelector('#mermaid-d-' + currentLbIndex);
    if (sourceCard) {
      const svg = sourceCard.querySelector('svg');
      if (svg) {
        body.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'diagram-lb-wrapper';
        wrapper.className = 'diagram-lb-wrapper';

        const clone = svg.cloneNode(true);
        // Fit SVG into lightbox: constrain to container, maintain aspect
        clone.style.width = 'auto';
        clone.style.maxWidth = '100%';
        clone.style.height = 'auto';
        clone.style.display = 'block';
        clone.style.margin = '0 auto';
        clone.removeAttribute('id');
        wrapper.appendChild(clone);
        body.appendChild(wrapper);
        body.scrollTop = 0;
        return;
      }
    }
    // Fallback
    body.innerHTML = '<div id="diagram-lb-wrapper" class="diagram-lb-wrapper"><pre class="mermaid" id="mermaid-lb">' + diagrams[currentLbIndex].code + '</pre></div>';
    if (mermaidAPI) mermaidAPI.run({ querySelector: '#mermaid-lb' }).catch(function() {});
  }

  // ════════════════════════════════════════════════════
  // Render grid
  // ════════════════════════════════════════════════════
  async function renderDiagrams() {
    const body = document.getElementById('diagram-body');
    body.innerHTML = '<div class="diagram-loading">⏳ 加载渲染引擎...</div>';

    try {
      const m = await import(MERMAID_CDN);
      mermaidAPI = m.default;
      mermaidAPI.initialize({ startOnLoad: false, theme: 'default', c4: { useMaxWidth: false }, securityLevel: 'loose' });
    } catch(e) {
      body.innerHTML = '<div class="diagram-error">⚠️ 无法加载 mermaid</div>';
      return;
    }

    body.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'diagram-grid';

    for (let i = 0; i < diagrams.length; i++) {
      const d = diagrams[i];
      const card = document.createElement('div');
      card.className = 'diagram-card';
      card.setAttribute('data-index', i);
      card.innerHTML =
        '<div class="diagram-card-header">' +
          '<span class="diagram-card-title">' + (i + 1) + '. ' + d.title + '</span>' +
          '<button class="diagram-card-zoom" title="放大查看">🔍</button>' +
        '</div>' +
        '<div class="diagram-card-body"><pre class="mermaid" id="mermaid-d-' + i + '">' + d.code + '</pre></div>';
      grid.appendChild(card);
    }
    body.appendChild(grid);

    grid.addEventListener('click', function(e) {
      const zoomBtn = e.target.closest('.diagram-card-zoom');
      const cardBody = e.target.closest('.diagram-card-body');
      const target = zoomBtn || cardBody;
      if (!target) return;
      const card = target.closest('.diagram-card');
      if (card) openLightbox(parseInt(card.getAttribute('data-index')));
    });

    try {
      await mermaidAPI.run({ querySelector: '#diagram-body .mermaid' });
    } catch(e) {
      for (let i = 0; i < diagrams.length; i++) {
        try {
          const { svg } = await mermaidAPI.render('mermaid-fb-' + i, diagrams[i].code);
          const el = document.getElementById('mermaid-d-' + i);
          if (el) el.innerHTML = svg;
        } catch(err) {}
      }
    }
    rendered = true;
  }

  // ════════════════════════════════════════════════════
  // CSS
  // ════════════════════════════════════════════════════
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* ── Trigger ── */
      .diagram-trigger {
        position: fixed; bottom: 1.5rem; left: 4.5rem;
        width: 3rem; height: 3rem; border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #6366f1);
        color: #fff; border: none; cursor: pointer;
        box-shadow: 0 2px 12px rgba(0,0,0,.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.2rem; z-index: 100;
        transition: transform .2s, box-shadow .2s; user-select: none;
      }
      .diagram-trigger:hover { transform: scale(1.08); box-shadow: 0 4px 20px rgba(124,58,237,.4); }

      /* ── Overlay ── */
      .diagram-overlay {
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; opacity: 0; transition: opacity .25s;
      }
      .diagram-overlay.open { pointer-events: auto; opacity: 1; }
      .diagram-overlay-backdrop {
        position: absolute; inset: 0;
        background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
      }
      .diagram-overlay-content {
        position: relative; width: 92vw; max-width: 1100px; height: 88vh;
        background: var(--md-default-bg-color, #fff);
        border-radius: 16px; box-shadow: 0 16px 64px rgba(0,0,0,.3);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .diagram-overlay-header {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 24px; flex-shrink: 0;
        border-bottom: 1px solid var(--md-default-fg-color--lightest, #e2e8f0);
        background: linear-gradient(135deg, #1e1b4b, #312e81); color: #fff;
      }
      .diagram-overlay-title { font-size: 1.05rem; font-weight: 700; }
      .diagram-overlay-count {
        font-size: .75rem; padding: 2px 8px; border-radius: 10px;
        background: rgba(255,255,255,.15); color: #c4b5fd;
      }
      .diagram-overlay-close {
        margin-left: auto; width: 28px; height: 28px; border-radius: 50%;
        border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08);
        color: #c4b5fd; font-size: 14px; cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: all .15s;
      }
      .diagram-overlay-close:hover { background: rgba(255,255,255,.2); color: #fff; }
      .diagram-overlay-body { flex: 1; overflow-y: auto; padding: 20px 24px 32px; }
      .diagram-loading { text-align: center; padding: 60px; color: #64748b; font-size: .9rem; }
      .diagram-error { text-align: center; padding: 60px; color: #ef4444; }

      /* ── Resize handles ── */
      .diagram-resize-handle { position: absolute; z-index: 10; }
      .diagram-resize-n  { top: -4px; left: 12px; right: 12px; height: 8px; cursor: n-resize; }
      .diagram-resize-s  { bottom: -4px; left: 12px; right: 12px; height: 8px; cursor: s-resize; }
      .diagram-resize-e  { right: -4px; top: 12px; bottom: 12px; width: 8px; cursor: e-resize; }
      .diagram-resize-w  { left: -4px; top: 12px; bottom: 12px; width: 8px; cursor: w-resize; }
      .diagram-resize-ne { top: -5px; right: -5px; width: 14px; height: 14px; cursor: ne-resize; }
      .diagram-resize-nw { top: -5px; left: -5px; width: 14px; height: 14px; cursor: nw-resize; }
      .diagram-resize-se { bottom: -5px; right: -5px; width: 14px; height: 14px; cursor: se-resize; }
      .diagram-resize-sw { bottom: -5px; left: -5px; width: 14px; height: 14px; cursor: sw-resize; }
      .diagram-resize-handle:hover { background: rgba(124,58,237,.25); border-radius: 3px; }
      .diagram-resize-se:hover, .diagram-resize-ne:hover,
      .diagram-resize-sw:hover, .diagram-resize-nw:hover {
        background: rgba(124,58,237,.35); border-radius: 50%;
      }

      /* ── Grid & cards ── */
      .diagram-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      @media (max-width: 800px) { .diagram-grid { grid-template-columns: 1fr; } }
      .diagram-card {
        background: var(--md-default-bg-color, #fff);
        border: 1px solid var(--md-default-fg-color--lightest, #e2e8f0);
        border-radius: 10px; overflow: hidden; cursor: pointer;
        transition: box-shadow .2s, border-color .2s;
      }
      .diagram-card:hover { border-color: #7c3aed; box-shadow: 0 4px 16px rgba(124,58,237,.15); }
      .diagram-card-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 14px; background: #f5f3ff; border-bottom: 1px solid #ede9fe;
      }
      .diagram-card-title {
        font-size: .8rem; font-weight: 600; color: #7c3aed;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex: 1; margin-right: 8px;
      }
      .diagram-card-zoom {
        width: 26px; height: 26px; border-radius: 6px;
        border: 1px solid #ddd6fe; background: #ede9fe;
        cursor: pointer; font-size: 13px;
        display: flex; align-items: center; justify-content: center;
        transition: all .15s; flex-shrink: 0;
      }
      .diagram-card-zoom:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; }
      .diagram-card-body { padding: 14px; overflow-x: auto; background: #fff; }
      .diagram-card-body pre.mermaid { margin: 0; font-size: 12px; }
      .diagram-card-body svg { max-width: 100%; height: auto; }

      [data-md-color-scheme="slate"] .diagram-card-header { background: #1e1b4b; border-bottom-color: #334155; }
      [data-md-color-scheme="slate"] .diagram-card-title { color: #a78bfa; }
      [data-md-color-scheme="slate"] .diagram-card-zoom { background: #2e1065; border-color: #4c1d95; color: #a78bfa; }
      [data-md-color-scheme="slate"] .diagram-card-zoom:hover { background: #7c3aed; color: #fff; }
      [data-md-color-scheme="slate"] .diagram-card-body { background: #0f172a; }

      /* ── Lightbox ── */
      .diagram-lightbox {
        position: fixed; inset: 0; z-index: 10001;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; opacity: 0; transition: opacity .25s;
      }
      .diagram-lightbox.open { pointer-events: auto; opacity: 1; }
      .diagram-lightbox-backdrop {
        position: absolute; inset: 0;
        background: rgba(0,0,0,.8); backdrop-filter: blur(6px);
      }
      .diagram-lightbox-inner {
        position: relative; width: 96vw; max-width: 1500px; height: 92vh;
        background: var(--md-default-bg-color, #fff);
        border-radius: 16px; box-shadow: 0 20px 80px rgba(0,0,0,.4);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .diagram-lightbox-header {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #1e1b4b, #312e81); color: #fff; flex-shrink: 0;
      }
      .diagram-lightbox-title {
        font-size: .95rem; font-weight: 600; flex: 1;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .diagram-lightbox-nav { display: flex; align-items: center; gap: 6px; }
      .diagram-lightbox-btn {
        width: 30px; height: 30px; border-radius: 8px;
        border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08);
        color: #c4b5fd; font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: all .15s;
      }
      .diagram-lightbox-btn:hover { background: rgba(255,255,255,.2); color: #fff; }
      .diagram-lightbox-counter { font-size: .75rem; color: #94a3b8; min-width: 40px; text-align: center; }

      /* ── Lightbox body: SVG fits inside, scrollable ── */
      .diagram-lightbox-body {
        flex: 1; overflow: auto; padding: 32px;
        display: flex; justify-content: center;
      }
      .diagram-lb-wrapper {
        transition: transform .15s;
        transform-origin: center top;
      }
      .diagram-lb-wrapper {
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 8px;
      }
      .diagram-lb-wrapper svg {
        display: block;
        width: auto;
        max-width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);
  }

  // ════════════════════════════════════════════════════
  // Init
  // ════════════════════════════════════════════════════
  async function init() {
    if (!isArticlePage()) return;
    const data = await loadDiagrams();
    if (!data || data.length === 0) return;
    diagrams = data;
    injectCSS();
    setTimeout(buildUI, 500);
    console.log('[Diagram] ' + diagrams.length + ' diagrams ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
