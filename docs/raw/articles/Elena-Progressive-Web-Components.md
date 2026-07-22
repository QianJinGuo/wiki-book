---
title: Elena | Progressive Web Components
type: raw
source: newsletter
source_url: https://elenajs.com/
fetcher: jina
sha256: 9b72290f8b3c2cde
ingested: 2026-05-20
---
Markdown Content:
## Introduction
## What is Elena? [​](https://elenajs.com/#what-is-elena)
**Elena is a simple, tiny library for building [Progressive Web Components](https://elenajs.com/components/overview).** Unlike most web component libraries, Elena doesn’t force JavaScript for everything. You can load HTML and CSS first, then use JavaScript to progressively add interactivity. [[1]](https://elenajs.com/#fn1)
### Here is a minimal example [​](https://elenajs.com/#here-is-a-minimal-example)
HTML Styles JavaScript
html
```
<elena-stack direction="row">
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</elena-stack>
```
css
```
@scope (elena-stack) {
  :scope {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-flow: column wrap;
    flex-direction: column;
    gap: 0.5rem;
  }
  :scope[direction="row"] {
    flex-direction: row;
  }
}
```
js
```
import { Elena } from "@elenajs/core";
export default class Stack extends Elena(HTMLElement) {
  static tagName = "elena-stack";
  static props = ["direction"];
  direction = "column";
}
Stack.define();
```
[Try it in the playground](https://elenajs.com/playground/#composite-component)
Prerequisites
This documentation assumes familiarity with HTML, CSS, and JavaScript. If you're new to custom elements, the [MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) is a good starting point, though prior experience is not required.
## Why was Elena created [​](https://elenajs.com/#why-was-elena-created)
Elena was created by [@arielle](https://arielsalminen.com/) after nearly a decade of building enterprise-scale design systems with [web components](https://arielsalminen.com/2019/why-we-use-web-components/). The recurring pain points were often similar: accessibility issues, server-side rendering, layout shifts, flash of invisible content, React Server Components, too much reliance on client side JavaScript, and compatibility with e.g. third party analytics tools.
Elena was built to solve these problems while staying grounded in web standards and what the platform natively provides. This is how _“Progressive Web Components”_ were born.
## Why should I use Elena [​](https://elenajs.com/#why-should-i-use-elena)
**Elena is built for teams creating component libraries and design systems.** If you need web components that work across multiple frameworks (such as [React](https://react.dev/), [Next.js](https://nextjs.org/), [Vue](https://vuejs.org/), [Angular](https://angular.dev/)), render HTML and CSS before JavaScript loads, and sidestep common issues like accessibility problems, SSR limitations, and layout shifts, Elena is built for exactly that.
It handles the cross-framework complexity (prop/attribute syncing, event delegation, framework compatibility) so you can focus on building components rather than plumbing.
## Elena’s features [​](https://elenajs.com/#elena-s-features)
🔋
### Extremely lightweight
2.9kB minified & compressed, simple and tiny by design.
📈
### Progressively enhanced
Renders HTML & CSS first, then hydrates with JavaScript.
🫶
### Accessible by default
Semantic HTML foundation with no Shadow DOM barriers.
🌍
### Standards based
Built entirely on native custom elements & web standards.
⚡
### Reactive updates
Prop and state changes trigger efficient, batched re-renders.
🎨
### Scoped styles
Simple & clean CSS encapsulation without complex workarounds.
🖥️
### SSR friendly
Works out of the box, with optional server-side utilities if needed.
🧩
### Zero dependencies
No runtime dependencies, runs entirely on the web platform.
🔓
### Zero lock-in
Works with every major framework, or no framework at all.
## Browser support [​](https://elenajs.com/#browser-support)
As a baseline, Elena’s progressive approach supports any web browser that’s capable of rendering Custom Elements. After that, it’s up to you to determine what is appropriate for your project when authoring CSS styles and JavaScript interactivity. Elena, the JavaScript library, is tested in the latest two versions of the following browsers:
![Image 1: Chrome](https://elenajs.com/chrome.svg)![Image 2: Safari](https://elenajs.com/safari.png)![Image 3: Edge](https://elenajs.com/edge.png)![Image 4: Firefox](https://elenajs.com/firefox.png)![Image 5: Opera](https://elenajs.com/opera.png)
## Next steps [​](https://elenajs.com/#next-steps)
*   Start with the [Quick Start](https://elenajs.com/start/) guide.
*   View the [Live examples](https://elenajs.com/examples/) for demos.
*   Read how [Elena compares](https://elenajs.com/advanced/faq#how-does-elena-compare-against-other-tools) against other web component libraries.
*   Browse our [FAQ](https://elenajs.com/advanced/faq) for frequently asked questions.
*   Try Elena in the [Playground](https://elenajs.com/playground/).
* * *
1.   **Elena supports [multiple component models](https://elenajs.com/components/overview):** Composite Components that wrap and enhance the HTML composed inside them; Primitive Components that are self-contained and render their own HTML; And Declarative Components that are a hybrid of these and utilize [Declarative Shadow DOM](https://elenajs.com/components/templates#declarative-shadow-dom). [↩︎](https://elenajs.com/#fnref1)