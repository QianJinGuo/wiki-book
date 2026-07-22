---
title: 10 Common Component Architecture Mistakes in Figma Design Systems
sha256: 69676acad441bf8c84b7ac68019de67388dcbd79095fe65cb8520d540accebf5
type: raw-article
source: newsletter
source_url: https://zeroheight.com/blog/10-common-component-architecture-mistakes-in-figma-design-systems/
tags: [design-system]
fetcher: jina
ingested: 2026-05-15
---
Markdown Content:
“Garbage in, garbage out.” A common phrase that can also be reversed, and it would still be just as true: “quality in, quality out.” With design systems acting as an infrastructure layer, “quality” is often a major pillar or offering. If designers and engineers are expected to deliver high-quality experiences that are consistent across teams (with the help of the design system), the system’s assets must be of high quality too.
Let’s return to the phrase’s original negative perspective. If a designer pulls a _poorly_ built component from a Figma library, two things can happen:
*   They use the component as best they can, favoring consistency over quality. But it slows them down or impedes them from doing their best work. It may also confuse and frustrate them.
*   The lack of quality is offensive enough that the designer does not use the component, favoring quality over consistency. This can look like detaching, building their own component, or sourcing a component from another system.
Both of those situations teach consumers not to expect quality from the design system. This hurts trust — a hard thing to earn.
To help you start regaining trust with consumers, or get a new system going with a strong start, I’ve compiled a list of mistakes I’ve made myself or encountered in the wild.
## 1. Creating a “count” or “# of items” variant property
![Image 1](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-1.png)
**Why it’s bad**: File memory.
Each and every variant in a component is rendered in the background when an instance is placed on the canvas. Variants therefore should be considered the most expensive type of property (relative to string and boolean props, which let you manipulate individual layers).
This is why when you’re using list-like UI elements — such as checkboxes or radios in a form field, options within a dropdown menu, rows in a table, list items in a list, or buttons inside of a button group — you’re likely to find them slower to work with. Or your file suddenly loses memory when a lot of them are present.
Many component architects will use a variant property to give component consumers a closed range of items to populate the element with: 0 to 24 rows in a table, 2 to 7 radios in a form field, 1 to 55 options in a dropdown menu. Even if file memory wasn't an issue, this approach requires an enormous amount of building effort and maintenance to keep working. This can introduce room for error when making updates, and consumers will likely always need “just a couple more” variants at the high end of any given range of items offered.
**What to do instead**: Use the latest slot feature. Even before slots were released, component architects could use [instance swapping](https://zeroheight.com/blog/using-composability-over-inheritance-to-scale-design-systems/) as a “pseudo slot”, alleviating all the issues that came with using variants.
## 2. Adding interactive states to icons
![Image 2](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-2.png)
**Why it’s bad**: Semantically confusing.
Remember what icons are: Their closest relative would be characters in a font. They’re not inherently interactive, but you could wrap them in an <a> or <button> tag to accomplish this. The same is true for icons. When you add states directly to an icon component, you risk confusing consumers and painting that icon into a corner. Icons’ use cases vary greatly, and they are not always interactive. Sometimes they're informational, other times they're decorative, and often they’re static.
**What to do instead**: Build UI elements, like icon buttons, and put instances of your icon components _inside_ of those. Add interactive states to the UI element, rather than directly to the icon component. Also, toggle switches are not icons.
## 3. Over-using booleans in a component’s API
![Image 3](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-5.png)
**Why it’s bad**: Loss of parity with engineering.
Unless your consumers' designs never need to leave Figma, you likely want to have alignment between Figma components and their coded counterparts. To achieve that, it’s beneficial to create symmetry in their APIs (their properties and the values of those props).
A common offense I’ve seen is treating “dark mode” as a true/false statement (see this [example](https://www.reddit.com/r/FigmaDesign/comments/1onve1w/how_do_i_group_the_same_component_boolean_and/)). Even in a situation where there are only ever two options, it’s worthwhile to reduce cognitive load for component consumers. Theme=dark is easier to understand than Dark mode=true. And a sea of booleans does not make for a more usable properties panel.
**What to do instead**: Remember that a bloated property panel hurts usability for design system consumers. Toggle switches may save some time, only needing one click to interact with, but consumers will ultimately waste more time reverse-engineering the logic of the property schema. It will also make using features like [Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect) much harder. Your developers won’t be happy either.
## 4. Using variants for broad themes and contexts
![Image 4](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-3.png)
**Why it’s bad**: Forces consumers to manually update each instance within a mockup to change a theme.
This opens consumers up to huge risk for errors, and it’s a laborious, time-consuming process. No designer wants to spend time making sure every instance, even with the help of [bulk-selection tools](https://help.figma.com/hc/en-us/articles/360040449873-Select-layers-and-objects), across dozens of mockups, is all set to theme=dark-mode or breakpoint=mobile.
It’s also hard on the library team. They will have many more variants to manage, and there are lots of opportunities to flub your naming conventions. Worse still, it’s expensive. Each theme a component offers is a multiplier on the cost of memory usage (don’t forget the hidden cost of variants from point #1).
**What to do instead**: Use variables and modes. Schema 2025 brought an increased number of modes to all plans, so there are fewer excuses not to use this feature. By simply applying a mode to a mockup, designers will both save time and reduce risk in their work.
## 5. Using Figma as a project management tool
![Image 5](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-4.png)
**Why it’s bad**: Increases the risk of confusion and misinformation.
The risk for a ✅ or 🟢 to go “stale”, and no longer reflect whether the material on that page is stable, is just too high. It’s especially selfish for a design system team to use fragile, static emojis in their library file, because it means the consumers of that file will see nothing but green dots. And when everything is green… what’s the point?
**What to do instead**: Use the work-tracking tool you’re already using: Jira, Monday, Trello, Asana, etc. If you have access to the branching feature, you can name your branches to describe where work is happening: call out components, variables, or pages by name. Similarly, if you’re using dev mode, use the “mark ready for dev” feature — use it. It does a lot of what folks try to do manually with emojis for free! You can also find ways to reduce context switching between Figma and your work-tracking tool by integrating them with a plugin or widget (perhaps you can even make your own).
## 6. Using shapes or groups instead of frames
![Image 6](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-10.png)
**Why it’s bad**: Shapes are more limited than frames.
Shapes can’t use auto layout. They show up as SVGs in Code Connect or dev mode, which can confuse developers.
In the example above, the leading and trailing lines within the Divider component are made with actual lines. If you’ve got an eye for alignment, you can see that the lines are sitting a little too high up. The optical alignment feels wrong. This is happening because a line has a height of 0px.
If you created this same component but used _frames_ that are 1px tall with a fill color, instead of 0px-tall lines with a 1px stroke, you’ll get better optical alignment.
As for groups, the same applies, except their dimensions are dynamic and will change based on the X & Y coordinates of their children. While these layers are important for organizing material on the canvas or for more traditional graphic design and illustration, they don’t have a huge role in design systems.
**When you _should_ use shapes**: Icon artwork and illustrative graphics.
**What to do instead**: Use frames.
## 7. Adding “on click” prototyping interactions to all components
![Image 7](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-6.png)
**Why it’s bad**: Inadvertently creates _more_ work for consumers.
Imagine a radio button with an on-click interaction that changes a “selected” property from false to selected=true. This may seem harmless, but it could create extra work for consumers. If they want to use that radio button in a **_set_** of radio buttons within a form field, they will need to remove all those on-click interactions so they can set up new ones. That’s because radio buttons are rarely used outside a group and must be aware of their neighbors’ selected states in order to function properly.
**What to do instead**: Include hover states, and leave out click interactions, except on toggleable elements like, well, toggles, and checkboxes.
## 8. Not explicitly naming each layer
![Image 8](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-8.png)
**Why it’s bad**: Not naming your layers increases your **risk of override loss** or **unintended override transfers** when swapping components or variants.
Figma uses layer names to know what overrides should persist when swapping variants or components. By not taking the time to make sure layer names are well-named, you risk undesirable overrides.
**Negative consequences for the properties panel.** If you’re planning to expose a nested instance’s properties, you want to make sure the layer of that instance is named in a way that will be clear in the properties panel. Otherwise, you risk confusing consumers.
**What to do instead**: If you can’t be bothered to name your own layers, use Figma’s AI feature to rename layers for you.
## 9. Using a “wrapping” variant property
![Image 9](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-7.png)
**Why it’s bad**: You’re **2x-ing the memory consumption** of that component.
Recall the first point about how expensive variants are! Folks make a “wrapping” prop in an effort to offer components that can flex into tight places, or be resilient even when they contain a lot of content. On the web, this happens somewhat automatically: Elements will flow onto new lines. But in Figma, that behavior requires a more intentional setup.
**What to do instead**: Use auto layout wrapping.
## 10. Overloading the “state” variant property
![Image 10](https://zh-marketing-wordpress-uploads.s3.amazonaws.com/wp-content/uploads/2026/05/image-9.png)
**Why it’s bad**: Conflating different kinds of states makes for a **messier component API.**
This creates confusion for consumers and your engineering counterparts. It’s easy to fall into this trap because the name is widely applicable. “Error” is a state! So is “hover”. And so is “disabled”.
But these are separate concerns, and cramming them all into a single property risks needing dozens upon dozens of values. For example, what happens when you _hover_ over the element while it’s displaying an _error_? If all you allow yourself is a single “state” property, you’d need an “error default” and “error hover” values.
**What to do instead**: Consider splitting out the “Focus” state from interactive states like hover and pressed. Let “Focus” and, while you’re at it, “Selected”, “Disabled”, and “Populated” be the booleans they’re meant to be. Acknowledge that “Error” is about validation feedback, and not interactivity.
## Avoid pitfalls, save time, and build more confidently
I believe that knowing how to effectively wield your tools matters a great deal. Understanding a tool’s constraints, the “edges” of each feature, where it shines and where it’s lacking, all give you enormous confidence. To me, that confidence has been invaluable as I’ve worked across three enterprise-level design systems thus far. I can tell that my decision-making is sharper, weighing tradeoffs feels comfortable, and I know what I’m building will last.
I hope I’ve saved you some time by showing you how to leverage Figma’s various features and what pitfalls to avoid. And I hope with that comes greater confidence as you build the best possible components for your team.