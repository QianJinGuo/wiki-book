// Prev/Next article navigation
// Works by fetching the chapter index page and extracting article order
(function() {
  "use strict";
  
  var path = window.location.pathname;
  // Match: ch01/001-xxx or ch01-001-xxx
  var match = path.match(/ch(\d+)\/(\d+)-|ch(\d+)-(\d+)-/);
  if (!match) return; // Not an article page
  
  var chNum = match[1] || match[3];
  var artNum = parseInt(match[2] || match[4]);
  
  // Chapter index file mapping
  var chapters = {
    "01": "ch01-ai-basics", "02": "ch02-prompt", "03": "ch03-ai-tools",
    "04": "ch04-agent-core", "05": "ch05-harness", "06": "ch06-memory",
    "07": "ch07-skill-tool", "08": "ch08-multi-agent", "09": "ch09-ai-coding",
    "10": "ch10-rag", "11": "ch11-infra", "12": "ch12-security",
    "13": "ch13-mlops", "14": "ch14-data", "15": "ch15-training",
    "16": "ch16-inference", "17": "ch17-multimodal", "18": "ch18-robotics",
    "19": "ch19-research-frontier", "20": "ch20-ai-philosophy"
  };
  
  var chFile = chapters[chNum];
  if (!chFile) return;
  
  var chUrl = new URL(chFile + ".html", window.location.origin).href;
  
  // Fetch chapter index page
  fetch(chUrl).then(function(r) { return r.text(); }).then(function(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    
    // Extract article links from the chapter index
    var links = [];
    var anchors = doc.querySelectorAll("article a[href]");
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute("href");
      if (href && /ch\d+[\/-]\d+-/.test(href) && !href.startsWith("http")) {
        var m = href.match(/ch\d+[\/-](\d+)-/);
        if (m) {
          links.push({ num: parseInt(m[1]), href: href, title: a.textContent.trim() });
        }
      }
    }
    
    // Find current article
    var currentIdx = -1;
    for (var j = 0; j < links.length; j++) {
      if (links[j].num === artNum) {
        currentIdx = j;
        break;
      }
    }
    if (currentIdx === -1) return;
    
    var prev = currentIdx > 0 ? links[currentIdx - 1] : null;
    var next = currentIdx < links.length - 1 ? links[currentIdx + 1] : null;
    
    // Build footer HTML
    var footer = document.querySelector(".md-footer-meta");
    if (!footer) return;
    
    var nav = document.createElement("nav");
    nav.className = "md-footer__inner md-grid";
    nav.setAttribute("aria-label", "上一篇/下一篇");
    
    var html_out = "";
    if (prev) {
      var prevUrl = new URL(prev.href, window.location.origin).href;
      html_out += '<a href="' + prevUrl + '" class="md-footer__link md-footer__link--prev" rel="prev">'
        + '<div class="md-footer__button md-icon">'
        + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 11v2H8l5.5 5.5-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5 8 11z"/></svg>'
        + '</div>'
        + '<div class="md-footer__title">'
        + '<span class="md-footer__direction">上一篇</span>'
        + '<span class="md-ellipsis">' + (prev.title.length > 60 ? prev.title.substring(0, 60) + "…" : prev.title) + '</span>'
        + '</div></a>';
    }
    if (next) {
      var nextUrl = new URL(next.href, window.location.origin).href;
      html_out += '<a href="' + nextUrl + '" class="md-footer__link md-footer__link--next" rel="next">'
        + '<div class="md-footer__title">'
        + '<span class="md-footer__direction">下一篇</span>'
        + '<span class="md-ellipsis">' + (next.title.length > 60 ? next.title.substring(0, 60) + "…" : next.title) + '</span>'
        + '</div>'
        + '<div class="md-footer__button md-icon">'
        + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11z"/></svg>'
        + '</div></a>';
    }
    
    nav.innerHTML = html_out;
    footer.parentNode.insertBefore(nav, footer);
  }).catch(function() {});
})();
