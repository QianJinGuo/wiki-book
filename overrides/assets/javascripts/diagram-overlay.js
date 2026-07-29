/**
 * Diagram Overlay — 文章页自动关联架构图
 * 
 * 零侵入：不修改任何 .md 源文件
 * 按需加载：mermaid.js 仅在点击按钮时加载
 * 数据独立：diagrams/ 目录下 per-article JSON
 */
(function() {
  'use strict';

  const DIAGRAM_BASE = '/diagrams/';
  const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  let mermaidLoaded = false;
  let diagrams = null;
  let panelOpen = false;

  // ── URL → diagram key ─────────────────────────────
  // e.g. /ch04/694-cpu-agent-l1-l2-l3-execute-code/ → ch04-694-cpu-agent-l1-l2-l3-execute-code
  function getDiagramKey() {
    const path = window.location.pathname;
    // Remove leading/trailing slashes, replace / with -
    const clean = path.replace(/^\/+|\/+$/g, '');
    // ch04/694-xxx → ch04-694-xxx
    return clean.replace(/\//g, '-');
  }

  // ── Check if current page is an article ────────────
  function isArticlePage() {
    const path = window.location.pathname;
    return /^\/ch\d+\//.test(path);
  }

  // ── Load diagram data ─────────────────────────────
  async function loadDiagrams() {
    const key = getDiagramKey();
    const url = DIAGRAM_BASE + key + '.json';
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return await resp.json();
    } catch(e) {
      return null;
    }
  }

  // ── Create FAB button ─────────────────────────────
  function createFAB() {
    const fab = document.createElement('button');
    fab.id = 'diagram-fab';
    fab.innerHTML = '📐';
    fab.title = '查看架构图';
    fab.onclick = togglePanel;
    document.body.appendChild(fab);
    return fab;
  }

  // ── Create panel ──────────────────────────────────
  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'diagram-panel';

    const header = document.createElement('div');
    header.className = 'diagram-panel-header';
    header.innerHTML = '<span class="diagram-panel-title">📐 架构图</span><button class="diagram-panel-close" onclick="document.getElementById(\'diagram-panel\').classList.remove(\'open\')">×</button>';
    
    const list = document.createElement('div');
    list.className = 'diagram-list';
    list.id = 'diagram-list';

    panel.appendChild(header);
    panel.appendChild(list);
    document.body.appendChild(panel);
    return panel;
  }

  // ── Toggle panel ──────────────────────────────────
  async function togglePanel() {
    const panel = document.getElementById('diagram-panel');
    if (!panel) return;

    panelOpen = !panelOpen;
    panel.classList.toggle('open', panelOpen);

    if (panelOpen && diagrams) {
      await renderDiagrams();
    }
  }

  // ── Render diagrams with mermaid ──────────────────
  async function renderDiagrams() {
    if (!mermaidLoaded) {
      const mermaid = await import(MERMAID_CDN);
      mermaid.default.initialize({ 
        startOnLoad: false, 
        theme: 'default',
        c4: { useMaxWidth: false }
      });
      mermaidLoaded = true;
    }

    const list = document.getElementById('diagram-list');
    list.innerHTML = '';

    for (let i = 0; i < diagrams.length; i++) {
      const d = diagrams[i];

      // Section title
      const title = document.createElement('div');
      title.className = 'diagram-section-title';
      title.textContent = (i + 1) + '. ' + d.title;
      list.appendChild(title);

      // Diagram container
      const container = document.createElement('div');
      container.className = 'diagram-container';

      const pre = document.createElement('pre');
      pre.className = 'mermaid';
      pre.textContent = d.code;
      container.appendChild(pre);
      list.appendChild(container);
    }

    // Render all mermaid diagrams
    if (window.mermaid) {
      await window.mermaid.run({ querySelector: '#diagram-list .mermaid' });
    }
  }

  // ── Inject CSS ────────────────────────────────────
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      #diagram-fab {
        position: fixed;
        bottom: 80px;
        right: 24px;
        width: 48px;
        height: 48px;
        border-radius: 14px;
        border: 1px solid rgba(139,92,246,.4);
        background: linear-gradient(135deg, #1e1b4b, #312e81);
        color: #fff;
        font-size: 22px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 16px rgba(0,0,0,.3);
        transition: all .25s;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      #diagram-fab:hover {
        transform: translateY(-2px) scale(1.08);
        box-shadow: 0 6px 24px rgba(139,92,246,.3);
        border-color: rgba(139,92,246,.7);
      }
      #diagram-panel {
        position: fixed;
        top: 0;
        right: -520px;
        width: 500px;
        max-width: 90vw;
        height: 100vh;
        background: #0f172a;
        border-left: 1px solid #334155;
        z-index: 10000;
        transition: right .3s ease;
        overflow-y: auto;
        box-shadow: -8px 0 30px rgba(0,0,0,.4);
      }
      #diagram-panel.open {
        right: 0;
      }
      .diagram-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #334155;
        position: sticky;
        top: 0;
        background: #0f172a;
        z-index: 1;
      }
      .diagram-panel-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #e2e8f0;
      }
      .diagram-panel-close {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid #334155;
        background: #1e293b;
        color: #94a3b8;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .2s;
      }
      .diagram-panel-close:hover {
        border-color: #8b5cf6;
        color: #e2e8f0;
      }
      .diagram-list {
        padding: 12px 16px 40px;
      }
      .diagram-section-title {
        font-size: .9rem;
        font-weight: 600;
        color: #a78bfa;
        margin: 20px 0 8px;
        padding: 6px 12px;
        background: rgba(139,92,246,.1);
        border-radius: 6px;
        border-left: 3px solid #8b5cf6;
      }
      .diagram-section-title:first-child {
        margin-top: 0;
      }
      .diagram-container {
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        margin: 4px 0 16px;
        overflow-x: auto;
      }
      .diagram-container pre.mermaid {
        margin: 0;
        font-size: 13px;
      }
      .diagram-container svg {
        max-width: 100%;
      }
      @media (max-width: 768px) {
        #diagram-panel {
          width: 100vw;
          right: -100vw;
        }
        #diagram-fab {
          bottom: 70px;
          right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Init ──────────────────────────────────────────
  async function init() {
    if (!isArticlePage()) return;

    const data = await loadDiagrams();
    if (!data || data.length === 0) return;

    diagrams = data;
    injectCSS();
    createFAB();
    createPanel();
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
