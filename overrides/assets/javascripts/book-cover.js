(function () {
  'use strict';

  function createCover() {
    var figure = document.createElement('figure');
    figure.className = 'home-hero__cover';

    var image = document.createElement('img');
    image.src = new URL('assets/images/ai-engineering-cover.png', document.baseURI).href;
    image.alt = '《AI 工程》电子书封面：从 LLM 原理到生产级 Agent';

    var caption = document.createElement('figcaption');
    caption.appendChild(document.createTextNode('《AI 工程》· v1.3.8 · '));
    var portraitLink = document.createElement('a');
    portraitLink.href = new URL('assets/images/ai-engineering-cover-1600x2400.png', document.baseURI).href;
    portraitLink.textContent = '查看竖版出版稿';
    caption.appendChild(portraitLink);

    figure.appendChild(image);
    figure.appendChild(caption);
    return figure;
  }

  function mountCover() {
    var hero = document.querySelector('.home-hero');
    if (!hero || hero.dataset.bookCoverMounted === 'true') return;

    hero.dataset.bookCoverMounted = 'true';
    hero.classList.add('home-hero--with-cover');
    document.body.classList.add('book-home');

    var layout = hero.querySelector(':scope > .home-hero__layout');
    if (!layout) {
      layout = document.createElement('div');
      layout.className = 'home-hero__layout';
      var content = document.createElement('div');
      content.className = 'home-hero__content';
      while (hero.firstChild) content.appendChild(hero.firstChild);
      layout.appendChild(content);
      hero.appendChild(layout);
    }

    if (!layout.querySelector(':scope > .home-hero__cover')) {
      layout.appendChild(createCover());
    }
  }

  mountCover();
  if (typeof document$ !== 'undefined') document$.subscribe(mountCover);
})();
