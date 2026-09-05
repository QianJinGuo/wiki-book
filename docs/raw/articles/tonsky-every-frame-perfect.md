---
source: newsletter
source_url: https://tonsky.me/blog/every-frame-perfect/
ingested: 2026-06-16
title: "Every Frame Perfect"
sha256: 7596d2a73a2bd92093056849b118bcba76705bfa539c059c3fc42a4f0bf91c12
---

# Every Frame Perfect


Published Time: 2026-06-13

Markdown Content:
A while ago I was reading about Wayland and this quote stuck with me:

> A stated goal of Wayland is “[every frame is perfect](https://wayland-book.com/protocol-design/design-patterns.html)”.

And I think this is a goal we should all aspire to. Wayland is talking about the technical side of things (modern GPU stacks are very complex and Wayland is trying to take control back) but it could be applied to UI too.

The rule of thumb is:

If I take a screenshot of your app at any moment, you should be able to explain what I see

EDIT: This used to say “..., it must make sense” but that doesn’t account for advanced animation techniques such as smear frames etc.

Why care about every frame? It builds trust. Users can’t see the code, so UI is the only way for them to judge the quality of the app. If UI looks good, that means developers had time to polish it, which means that they probably spent a comparable amount of time to iron out the code. It’s a heuristic, but a reasonable one.

Now, what does it mean in practice? I can think of a few things:

*   No white flashes between screens.
*   No partially loaded content.
*   No relayout while content loads.
*   Internally consistent. If one part of the UI says “1 update available”, another part should not say “Checking for updates...”
*   Precise animations.

Animations often end up being forgotten. A UI might look great in both start and end states but very janky in between. Like this:

[Video 21](http://tonsky.me/blog/every-frame-perfect/toolbar@2x.mp4?t=1781538459)
If you feel like there are weird things going on there, there are! Look at slowed down version:

[Video 22](http://tonsky.me/blog/every-frame-perfect/toolbar_slow_reencode@2x.mp4?t=1781538459)
Now let’s apply our rule and take screenshots in the middle of the animation. This doesn’t look right:

![Image 1](http://tonsky.me/blog/every-frame-perfect/toolbar_still_2@2x.png?t=1781538459)
Neither does this:

![Image 2](http://tonsky.me/blog/every-frame-perfect/toolbar_still_1@2x.png?t=1781538459)
Both of these frames are not perfect.

Let’s look at another example. Safari:

[Video 23](http://tonsky.me/blog/every-frame-perfect/safari@2x.mp4?t=1781538459)
Placeholder text here moves from the center but cursor animates from the left position:

[Video 24](http://tonsky.me/blog/every-frame-perfect/safari_slow_reencode@2x.mp4?t=1781538459)
Not the end of the world by any means, but it does create a feeling that these two components are not in sync with each other. Next thought: maybe they weren’t designed together? If so, then they might not work well together. That’s how trust is lost.

This desynchronization can lead to a lot of confusion. For example, in Photos, when switching between Crop and Adjust mode, picture snaps into place immediately but the crop border is animated:

[Video 25](http://tonsky.me/blog/every-frame-perfect/photos@1x.mp4?t=1781538459)
This creates a _false_ feeling that something subtly changes when you switch between modes. And you know what? I don’t want my UI to give me false feelings. I want it to be a precise instrument, not an animated toy.

Sometimes animations are supposed to help you understand a transition, so it’s doubly sad when they make it harder. Follow the magnifying glass:

[Video 26](http://tonsky.me/blog/every-frame-perfect/search_slow_reencode@2x.mp4?t=1781538459)
Same with Youtube. They had the simplest task in the world: move a rectangle from one position to another! Yet they decided to do something very strange:

[Video 27](http://tonsky.me/blog/every-frame-perfect/youtube@1x.mp4?t=1781538459)
Can you explain this? Does it make sense?

![Image 3](http://tonsky.me/blog/every-frame-perfect/youtube@1x.png?t=1781538459)
Probably a technical limitation of the DOM architecture they decided earlier on. I call these situations “The technology has outsmarted the programmer”. But no matter the reason, the result is an imperfect frame.

Sometimes animations are left out as an afterthought. Whatever happens, happens. Then we get this:

[Video 28](http://tonsky.me/blog/every-frame-perfect/save@1x.mp4?t=1781538459)
The details are fascinating to watch:

[Video 29](http://tonsky.me/blog/every-frame-perfect/save_slow_reencode@1x.mp4?t=1781538459)
So yeah. Please pay attention not only to the start and end states, but also to everything in between. _Every frame matters._

I’ll leave you with this unprovoked zoom animation from Preview app. Take care!

[Video 30](http://tonsky.me/blog/every-frame-perfect/preview@1x.mp4?t=1781538459)

