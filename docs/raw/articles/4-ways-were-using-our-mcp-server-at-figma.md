---
title: "4 ways we’re using our MCP server at Figma"
source_url: "https://www.figma.com/blog/4-ways-were-using-our-mcp-server-at-figma/"
ingested: "2026-06-19"
sha256: "a8926e56f7790f99"
type: article
tags: [article]
---

# 4 ways we’re using our MCP server at Figma


Published Time: 2026-06-16T12:00:00.000Z

Markdown Content:
Two months after [opening the canvas to agents ![Image 1: Dark terminal window labeled “earthling—zsh” overlays a green-toned UI design canvas, showing a command to generate a button component set and status messages confirming files read and 72 variants created.](https://cdn.sanity.io/images/599r6htc/regionalized/e0ba3dc919974436fcf5a83c920ebccbf45ca743-1920x1080.png?w=1920&h=1080&q=75&fit=crop&crop=focalpoint&auto=format) ### Agents, meet the Figma canvas Starting today, you can use AI agents to design directly on the Figma canvas. And with skills, you can guide agents with context about your team’s decisions and intent.](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/), the [Figma MCP server ![Image 2: Abstract illustration of interlocking organic shapes in purple and orange on a dark green background.](https://cdn.sanity.io/images/599r6htc/regionalized/35f6fde4ce9f85257cecfcb6af666932842ab4af-3264x1836.png?w=3264&h=1836&q=75&fit=crop&crop=focalpoint&auto=format) ### The TL;DR on MCP: Why context matters and how to put it to work Figma’s MCP server brings your design decisions into the tools where code gets written—so what gets built actually matches what was designed. Here’s what that unlocks for everyone who builds products.](https://www.figma.com/blog/the-tldr-on-mcp/) now works across Figma Slides, [FigJam ![Image 3: Abstract layered graphic with orange, blue, and green blocks. Magenta squares labeled “1,” “2,” and “3” in bright green appear in different corners. Dark red bars cross the center. A large black curved brushstroke forms an upward-pointing arrow, partially covering the numbers.](https://cdn.sanity.io/images/599r6htc/regionalized/8a3ce8f118e4296961e3d68a5bbb771912f5e1db-6400x3600.png?w=6400&h=3600&q=75&fit=crop&crop=focalpoint&auto=format) ### FigJam is now your coding agent’s whiteboard too Agents are changing your code faster than your team can follow. Now you can close that gap with new MCP skills, architecture layouts, and more in FigJam.](https://www.figma.com/blog/figjam-your-coding-agents-whiteboard/), [Figma Make ### Figma Make, now on your local code From visual editing to contextual prompting and collaboration, Figma Make is expanding how teams can design with code.](https://www.figma.com/blog/figma-make-now-on-your-local-code/), and the new [Figma agent ### The Figma design agent is here Starting today, work with an agent that is built for Figma—directly on the canvas.](https://www.figma.com/blog/the-figma-agent-is-here/). That means presentation decks, FigJam boards, and Make prototypes can all be created or updated from a prompt. The MCP server also supports [custom fonts](https://help.figma.com/hc/en-us/articles/360039956894-Add-a-font-to-Figma#h_01KRYE1RA8K6RRADCBAS6FJATS) and lets you download images and icons—as SVG, PDF, JPG, or PNG—from design files through the new [download_assets](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/#download_assets) tool.

Here are four workflows Figmates are running right now using these new capabilities.

## [1. Create and refresh decks in Figma Slides](http://www.figma.com/blog/4-ways-were-using-our-mcp-server-at-figma/#_1-create-and-refresh-decks-in-figma-slides)

Mallory Dean, a designer advocate at Figma, maintains an evergreen deck covering Figma’s AI product launches. It's a living deck that she refreshes every few weeks so that what she's presenting at design talks and customer meetings stays current as we ship.

The [Figma MCP server](https://www.figma.com/blog/the-tldr-on-mcp/) now supports uploaded custom fonts, so any typeface saved on your machine can be prompted to render correctly in designs or slides.

After we launched the [Figma agent ### The Figma design agent is here Starting today, work with an agent that is built for Figma—directly on the canvas.](https://www.figma.com/blog/the-figma-agent-is-here/), she prompted in her code editor: `"Update my Figma AI deck to include our new Figma agent. Pull content from Slack, Google Drive, our Shortcut blog, and Release Notes webpage. Give me suggestions for what to refresh, plus ideas for new slides."` The agent pulled relevant conversations, briefs, and launch messaging, then used the [`use_figma`](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/) tool as well as the [`/figma-use-slides`skill](https://www.figma.com/community/skills) in Figma Slides to update the deck against her template.

The new slides still needed a review pass, images to swap out placeholders and copy edits, but the first 80% of the content work was already done by the time she jumped in. With our new [custom font](https://help.figma.com/hc/en-us/articles/360039956894-Add-a-font-to-Figma#h_01KRYE1RA8K6RRADCBAS6FJATS) support, the agent rendered type in her uploaded custom fonts—not web-safe approximations—so the deck stayed on-brand.

This same setup shows up across the product development process, whether you’re generating something from scratch or updating an existing document. A PM building a kickoff deck. A designer presenting a design exploration. Marketing pulling together a GTM plan for a feature. Sales updating a customer-facing deck with the latest product changes. The work isn’t just faster—it comes out on-brand, built from your team's design system.

## [2. Generate FigJam boards from live data](http://www.figma.com/blog/4-ways-were-using-our-mcp-server-at-figma/#_2-generate-figjam-boards-from-live-data)

As a product manager at Figma, Prasant Lokinendi runs feature kickoff workshops often. Prepping an engaging FigJam for these workshops—pulling in context from across the company and formatting sections to fit the session—takes time. So he built [`/figjam-builder`](https://github.com/prasantloki/figjam-builder), a custom skill that carries those instructions so he doesn't have to re-prompt them every time.

For our Make [voice-to-text launch](https://website-next-presentation.netlify.app/release-notes/?title=new-in-make-voice-to-text-question-cards-and-more) earlier this year, he prompted his agent to generate a FigJam board from context pulled across Slack, Asana, and Notion for project structure, and Hex for analytics. Instead of an empty FigJam, he started from the most up-to-date data, including product vision, customer insights, and key decisions.

## [3. Move designs between code and canvas with Figma Make](http://www.figma.com/blog/4-ways-were-using-our-mcp-server-at-figma/#_3-move-designs-between-code-and-canvas-with)

The MCP server now also works in Figma Make—closing the loop from [design edits to production PR ### Figma Make, now on your local code From visual editing to contextual prompting and collaboration, Figma Make is expanding how teams can design with code.](https://www.figma.com/blog/figma-make-now-on-your-local-code/) without ever leaving Figma. Iris Lin, a product designer at Figma, runs this loop on real product work.

For example, when Iris and a teammate recently built a sample audio editor as a demo file, her teammate shipped a first version, but Iris wanted to update the designs. Interactions are hard to show in a static file, so she branched the code and built the real thing in Figma Make: audio clips you can drag and reorder, a popover with level controls, and a playhead that scrubs.

Since Iris wanted to make edits to her design system for her demo file she brought the Make preview into the canvas by prompting in the Make prompt box: `“Can you bring back the preview here into Figma as design layers?”` The screen landed on the canvas, rebuilt with the relevant components from her library. Iris changed the audio clip component following her normal design patterns on the canvas, giving it a clear default, hover, and drag state. Then she sent it the other direction: `“Pull those new states back into the code.”` The agent read her design changes and wrote all three into the component, ready to 
