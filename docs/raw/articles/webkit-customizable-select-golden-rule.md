---
source: newsletter
source_url: https://webkit.org/blog/18117/the-golden-rule-of-customizable-select/
ingested: 2026-06-16
title: "The golden rule of Customizable Select"
sha256: 4b8bcba4ecb762086a70af33cf7b5251f6a71369810f3a61cd06da43d9a433d0
---

# The golden rule of Customizable Select


Published Time: 2026-06-15T14:20:31-07:00

Markdown Content:
Customizable select is coming to Safari 27. With this technology, developers can fully control the appearance of `<select>` elements — custom arrows, option layouts, color swatches, icons, full visual styling — without the need for JavaScript libraries or an endless parade of `<div>` elements. And because it’s a built-in control, you don’t have to compromise on keyboard navigation or accessibility semantics.

But, to ensure this built-in control works well for everyone, it’s important to follow this single but essential rule: **always provide text content or accessible text attributes for your `option` elements.**

Every time that rule is broken, every time an option is styled to show a visual without any text and without any accessible fallbacks, three different problems get introduced all at once. The menu is harder to use for everyone, impossible to use with accessibility tools, and it becomes a completely broken experience in browsers that don’t support it yet.

When you remember to follow the rule, you’ll improve the user experience, support accessibility, and provide progressive enhancement so it works for people regardless of what browser they choose.

We’ll show you why following this mission critical rule gets you:

## Better UX

Take this category filter from a photographer’s gallery site. The version below uses icons alone — a building, a flower, a hummingbird — to represent each category:

![Image 1: customizable select of categories for photo gallery with no labels](https://webkit.org/wp-content/uploads/customizable-select-no-labels-LIGHT.png)
It looks clean. But a user who doesn’t immediately recognize what the hummingbird icon represents has no fallback. The closed select shows only an icon in the button, with no other hint of what’s currently selected. Add a text label to each option and the experience becomes immediately scannable. The selected state is readable at a glance, and every option is unambiguous:

![Image 2: customizable select of categories for photo gallery with labels](https://webkit.org/wp-content/uploads/customizable-select-with-labels-LIGHT.png)
The icons are still there. The labels make it readily decipherable for everyone.

## Better accessibility

When a screen reader encounters an option with no text, the user may not hear a descriptive label for each option. Braille rendering and other assistive technology output may also be confusing. Text, even when hidden visually with a `.visually-hidden` class, stays in the accessibility tree and gives screen readers, braille displays, and speech recognition software something real to work with. If you use an icon as an `<img>`, add an `alt` or `aria-label` — or mark it decorative using `alt=""` and let the visible or visually-hidden label carry the meaning.

```
<option>
   <img src="bird.svg" alt="">
   <span>Wildlife</span>
</option>
```

The problem you solve isn’t just a compliance checkbox: it’s the difference between a visitor completing your form and someone abandoning it.

## Better progressive enhancement

Customizable select is a new feature. Browsers that don’t yet support it fall back to the platform-native `<select>` — which is exactly the right behavior, as long as your options still make sense in that fallback state.

If you’ve removed text in favor of icons or swatches, a user on an older browser sees a dropdown full of empty options. The same is true when CSS fails to load at all: a slow connection, a corporate proxy stripping stylesheets, a user with custom styles enabled. Wrap your enhancements in `@supports (appearance: base-select)` and keep plain text as your baseline. Adding a swatch is an enhancement. Removing the color name to make room for it is a regression.

The rule for maximizing the power and utility of customizable select is simple: keep the text. You can hide it visually. You can make it tiny. You can position it off-screen. But it needs to be there. Icons, swatches, and illustrations are additions to an option — never substitutes for it. Follow that rule and the rest of customizable select is yours to play with.

## Feedback

We love hearing from you. To share your thoughts, find our web evangelists online: Saron Yitbarek on [BlueSky](https://bsky.app/profile/saron.bsky.social), Jen Simmons on [Bluesky](https://bsky.app/profile/jensimmons.bsky.social) / [Mastodon](https://front-end.social/@jensimmons), and Jon Davis on [Bluesky](https://bsky.app/profile/jondavis.bsky.social) / [Mastodon](https://mastodon.social/@jondavis). You can follow WebKit [on LinkedIn](https://www.linkedin.com/in/apple-webkit/). If you run into any issues, we welcome your [feedback](https://feedbackassistant.apple.com/) on Safari UI (learn more about [filing Feedback](https://developer.apple.com/bug-reporting/)), or your [WebKit bug report](https://bugs.webkit.org/) about web technologies or Web Inspector. If you run into a website that isn’t working as expected, please file a report at [webcompat.com](https://webcompat.com/). Filing issues really does make a difference.

