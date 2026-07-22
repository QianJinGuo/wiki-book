---
source: newsletter
source_url: https://github.blog/ai-and-ml/github-copilot/improving-token-efficiency-in-github-agentic-workflows/
ingested: 2026-05-10
title: Improving token efficiency in GitHub Agentic Workflows
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [github, copilot, pricing, llm]
sha256: 8836b320e861b56f9074990cd4b92a9c8f817feec2279a439025d37dd77e6681
---
		<div data-color-mode="dark" data-light-theme="light" data-dark-theme="dark_dimmed" class="pt-header pt-lg-0">
		<header id="header" class="header position-fixed position-lg-static pb-lg-header z-4 top-0 left-0 right-0 d-flex flex-column flex-items-stretch color-bg-default">
						<a href="#start-of-content" class="p-3 color-bg-accent-emphasis color-fg-on-emphasis show-on-focus">
				Skip to content			</a>
							<a href="#sidebar" id="skip-to-sidebar" class="p-3 color-bg-accent-emphasis color-fg-on-emphasis show-on-focus">
					Skip to sidebar				</a>
						<div class="position-relative container-xl width-full mx-auto p-responsive-blog">
				<div class="d-flex flex-items-center flex-justify-between pt-3 pb-3 color-fg-default">
<a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub homepage" class="Header-link position-relative d-flex flex-items-center color-fg-default">
	<svg aria-hidden="true" role="img" class="octicon octicon-mark-github d-block" viewBox="0 0 98 96" width="32" height="32" fill="currentColor"><g clip-path="url(#a)">
<path d="M41.44 69.385C28.807 67.853 19.906 58.762 19.906 46.99c0-4.785 1.723-9.953 4.594-13.398-1.244-3.158-1.053-9.858.383-12.633 3.828-.479 8.996 1.531 12.058 4.307 3.637-1.149 7.465-1.723 12.155-1.723 4.69 0 8.517.574 11.963 1.627 2.966-2.68 8.23-4.69 12.058-4.211 1.34 2.584 1.531 9.283.287 12.537 3.063 3.637 4.69 8.518 4.69 13.494 0 11.772-8.9 20.672-21.725 22.3 3.254 2.104 5.455 6.698 5.455 11.962v9.953c0 2.871 2.393 4.498 5.264 3.35C84.41 87.95 98 70.629 98 49.19 98 22.107 75.988 0 48.904 0 21.82 0 0 22.107 0 49.191c0 21.246 13.494 38.856 31.678 45.46 2.584.956 5.072-.766 5.072-3.35v-7.657c-1.34.575-3.063.958-4.594.958-6.316 0-10.049-3.446-12.728-9.858-1.053-2.584-2.201-4.115-4.403-4.402-1.148-.096-1.53-.574-1.53-1.149 0-1.148 1.913-2.01 3.827-2.01 2.776 0 5.168 1.723 7.657 5.264 1.914 2.776 3.923 4.02 6.316 4.02 2.392 0 3.924-.861 6.125-3.063 1.627-1.627 2.871-3.062 4.02-4.02z" fill="#fff"/></g><defs><clipPath id="a">
<path fill="#fff" d="M0 0h98v96H0z"/></clipPath></defs></svg>
</a>
<span class="d-inline-block ml-2 f1-mktg f2-md-mktg" style="opacity: 0.3;">/</span>
<a class="d-inline-block Header-link font-weight-semibold ml-2 f2 color-fg-default" href="https://github.blog/">
	Blog</a>
<div class="d-none d-lg-flex flex-1">
	<form id="desktop-search" class="desktop-search position-relative ml-lg-4 flex-1" action="https://github.blog" method="get" aria-hidden="true" aria-label="Search form" role="search">
		<div class="position-relative d-flex flex-1 height-full color-bg-transparent" data-color-mode="light" data-light-theme="light" data-dark-theme="dark" >
			<input aria-label="Search the blog" type="search" class="p-2 pl-3 pr-6 border-0 rounded-2 flex-1" placeholder="Search the blog…" value="" name="s" id="search-input">
			<button type="submit" class="position-absolute right-0 z-3 d-flex flex-items-center flex-justify-center flex-self-center mr-2 p-2 border-0 rounded-2 color-bg-transparent color-fg-subtle" aria-label="Search">
				<svg viewBox="0 0 16 16" width="20" height="20" class="octicon octicon-search" role="presentation">
<path fill-rule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"></path></svg>
			</button>
		</div>
	</form>
	<button aria-label="Toggle search" class="flex-self-center ml-auto p-2 border-0 color-bg-transparent color-fg-default rounded-3 js-toggle" aria-controls="desktop-search" aria-expanded="false" >
		<svg viewBox="0 0 24 24" width="24" height="24" class="octicon octicon-search" role="presentation">
<path d="M10.25 2a8.25 8.25 0 0 1 6.34 13.53l5.69 5.69a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-5.69-5.69A8.25 8.25 0 1 1 10.25 2ZM3.5 10.25a6.75 6.75 0 1 0 13.5 0 6.75 6.75 0 0 0-13.5 0Z"></path></svg>
		<svg viewBox="2 2 20 20" width="24" height="24" class="octicon octicon-x" role="presentation">
<path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path></svg>
	</button>
		<a		class="Button Button--size-medium Button--primary ml-3"
		href="https://github.com/features/copilot/cli?utm_source=blog-top-nav-cli-features-cta&#038;utm_medium=blog&#038;utm_campaign=dev-pod-copilot-cli-2026"				target="_blank"		data-analytics-click="Blog, click on button, text: Use Copilot for free; ref_location:top nav;"					>
		<span class="Button__text">
		<span class="Text Text--200 Text--antialiased Text--weight-semibold Button--label Button--label-medium Button--label-primary">
			Try GitHub Copilot CLI		</span>
		</span>
			</a>
		<a		class="Button Button--size-medium Button--secondary ml-3"
		href="https://github.com/events/universe/recap?utm_source=k2k-blog-tap-nav&#038;utm_medium=blog&#038;utm_campaign=universe25"				target="_blank"		data-analytics-click="Blog, click on button, text: See what&#039;s new; ref_location:top nav;"					>
		<span class="Button__text">
		<span class="Text Text--200 Text--antialiased Text--weight-semibold Button--label Button--label-medium Button--label-secondary">
			See what&#039;s new		</span>
		</span>
			</a>
	</div>
<div class="d-flex d-lg-none flex-items-center flex-1 mr-n2">
	<button aria-label="Toggle search" class="ml-auto p-2 border-0 color-bg-transparent color-fg-default rounded-3 js-toggle" aria-controls="mobile-search" aria-expanded="false" >
		<svg viewBox="0 0 24 24" width="24" height="24" class="octicon octicon-search" role="presentation">
<path d="M10.25 2a8.25 8.25 0 0 1 6.34 13.53l5.69 5.69a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-5.69-5.69A8.25 8.25 0 1 1 10.25 2ZM3.5 10.25a6.75 6.75 0 1 0 13.5 0 6.75 6.75 0 0 0-13.5 0Z"></path></svg>
		<svg viewBox="2 2 20 20" width="24" height="24" class="octicon octicon-x" role="presentation">
<path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path></svg>
	</button>
	<button class="mobile-nav-focus-trap js-mobile-nav-focus-trap" data-target="#mobile-menu" data-focus-order="last"></button>
	<button id="mobile-menu-toggle"  aria-label="Toggle menu" class="ml-2 p-2 border-0 color-bg-transparent color-fg-default rounded-3 js-toggle" aria-controls="mobile-menu" aria-expanded="false" data-trap-focus="#header">
		<svg viewBox="0 0 16 16" width="24" height="24" class="octicon octicon-three-bars" role="presentation">
<path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path></svg>
		<svg viewBox="2 2 20 20" width="24" height="24" class="octicon octicon-x " role="presentation">
<path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path></svg>
	</button>
</div>
				</div>
			</div>
							<div class="position-relative pb-lg-navigation" data-sticky-navigation=".sticky-navigation">
				</div>
<form id="mobile-search" role="search" method="get" class="mobile-search" action="https://github.blog"  aria-hidden="true" aria-label="Search form">
	<div class="d-flex flex-1 p-3 color-bg-inset">
		<div class="d-flex flex-1 position-relative color-bg-transparent" data-color-mode="light" data-light-theme="light" data-dark-theme="dark" >
			<svg height="20" class="d-flex position-absolute z-3 octicon height-full ml-2 color-fg-subtle" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" role="img">
<path fill-rule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"></path></svg>
			<input aria-label="Search the blog" type="search" class="pl-6 search-field form-control p-2 flex-1" placeholder="Search the blog…" value="" name="s" id="search-input">
		</div>
			<button		class="Button Button--size-medium Button--secondary ml-2"
				type="submit"									>
		<span class="Button__text">
		<span class="Text Text--200 Text--antialiased Text--weight-semibold Button--label Button--label-medium Button--label-secondary">
			Search		</span>
		</span>
			</button>
		</div>
</form>
		</header>
	</div>
	<main id="start-of-content">
<header class="position-relative" data-color-mode="dark" data-light-theme="light" data-dark-theme="dark_dimmed">
	<div class="container-xl p-responsive-blog">
		<div class="gutter-spacious">
			<div class="col-12 offset-lg-1 col-lg-10 col-xl-8 py-5 py-md-6 ">
				<div class="f5 mb-5 mb-md-8"><span><span><a class="Link--primary" href="https://github.blog/">Home</a></span> <span class="mx-2 opacity-5">/</span> <span><a class="Link--primary" href="https://github.blog/ai-and-ml/">AI &amp; ML</a></span> <span class="mx-2 opacity-5">/</span> <span><a class="Link--primary" href="https://github.blog/ai-and-ml/github-copilot/">GitHub Copilot</a></span></span></div>				
#  class="h3-mktg lh-condensed mb-3 color-fg-default">Improving token efficiency in GitHub Agentic Workflows				<div class="f4-mktg color-fg-muted">
<p>Agentic workflows that run on every pull request can quietly accumulate large API bills. Here&#8217;s how we instrumented our own production workflows, found the inefficiencies, and built agents to fix them.
				</div>
			</div>
							<div class="offset-lg-1 col-lg-10">
					<div class="position-relative overflow-hidden rounded-2 z-1">
													<svg aria-hidden="true" width="1032" height="548" class=" d-block width-full height-auto" role="presentation"></svg>
							<img width="1600" height="850" src="https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?resize=1600%2C850" class="d-block cover-image wp-post-image" alt="Copilot hovering above a mosaic of green squares in a decorative scene." decoding="async" loading="lazy" srcset="https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?w=1600 1600w, https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?w=800 800w, https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?w=400 400w, https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?w=1032 1032w, https://github.blog/wp-content/uploads/2026/01/generic-github-copilot-commit-logo.png?w=516 516w" sizes="auto, (max-width: 1600px) 100vw, 1600px" />											</div>
				</div>
					</div>
	</div>
			<div class="position-absolute bottom-0 width-full" style="background:#fff; height:80px;"></div>
	</header>
<section class="container-xl mx-auto p-responsive-blog mt-4">
	<div class="gutter-spacious">
		<div class="col-12 offset-lg-1 col-lg-10">
			<div class="d-lg-flex flex-justify-between flex-items-center">
				<div class="mb-4 mb-lg-0">
	<div class="mb-1">
		<div class="d-flex flex-items-center mb-6px">
		<span>
					<span class="text-bold">
				<a href="https://github.blog/author/lpcox/" title="Posts by Landon Cox" class="author url fn Link--primary no-wrap position-relative z-2" rel="author">Landon Cox</a> & <a href="https://github.blog/author/mnkiefer/" title="Posts by Mara Kiefer" class="author url fn Link--primary no-wrap position-relative z-2" rel="author">Mara Kiefer</a>			</span>
							</span>
</div>
	</div>
	<div data-color-mode="auto" data-light-theme="light_tritanopia" class="d-flex flex-column flex-md-row text-mono color-fg-muted">
		<time datetime="2026-05-07" class="d-block">
			May 7, 2026		</time>
							<div class="d-flex flex-items-center mt-2 mt-md-0">
				<span class="d-none d-md-block mx-3">|</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="mr-2">
<path fill="currentcolor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path>
				</svg>
				12 minutes			</div>
			</div>
</div>
-  class="list-style-none d-flex flex-items-center">
	- 
		<span class="text-semibold">
			Share:		</span>
	<li class="ml-3">
		<a href="https://x.com/share?text=Improving%20token%20efficiency%20in%20GitHub%20Agentic%20Workflows&#038;url=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fgithub-copilot%2Fimproving-token-efficiency-in-github-agentic-workflows%2F" target="_blank" rel="noopener noreferrer" class="d-flex flex-justify-center flex-items-center border circle px-2 py-2" aria-label="Share on X">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="10" height="10">
<path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor" />
			</svg>
		</a>
	<li class="ml-3">
		<a href="https://www.facebook.com/sharer/sharer.php?t=Improving%20token%20efficiency%20in%20GitHub%20Agentic%20Workflows&#038;u=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fgithub-copilot%2Fimproving-token-efficiency-in-github-agentic-workflows%2F" target="_blank" rel="noopener noreferrer" class="d-flex flex-justify-center flex-items-center border circle px-2 py-2" aria-label="Share on Facebook">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.3 15.4" width="10" height="10">
<path d="M14.5 0H.8a.88.88 0 0 0-.8.9v13.6a.88.88 0 0 0 .8.9h7.3v-6h-2V7.1h2V5.4a2.87 2.87 0 0 1 2.5-3.1h.5a10.87 10.87 0 0 1 1.8.1v2.1h-1.3c-1 0-1.1.5-1.1 1.1v1.5h2.3l-.3 2.3h-2v5.9h3.9a.88.88 0 0 0 .9-.8V.8a.86.86 0 0 0-.8-.8z" fill="currentColor" />
			</svg>
		</a>
	<li class="ml-3">
		<a href="https://www.linkedin.com/shareArticle?title=Improving%20token%20efficiency%20in%20GitHub%20Agentic%20Workflows&#038;url=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fgithub-copilot%2Fimproving-token-efficiency-in-github-agentic-workflows%2F" target="_blank" rel="noopener noreferrer" class="d-flex flex-justify-center flex-items-center border circle px-2 py-2" aria-label="Share on LinkedIn">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 18" width="10" height="10">
<path d="M3.94 2A2 2 0 1 1 2 0a2 2 0 0 1 1.94 2zM4 5.48H0V18h4zm6.32 0H6.34V18h3.94v-6.57c0-3.66 4.77-4 4.77 0V18H19v-7.93c0-6.17-7.06-5.94-8.72-2.91z" fill="currentColor" />
			</svg>
		</a>
			</div>
			<div class="indigo-separator mt-4"></div>
		</div>
	</div>
</section>
	<div class="container-xl mx-auto p-responsive-blog mt-4 mt-md-7 mb-7 mb-md-9">
		<div class="d-flex flex-wrap flex-justify-center gutter-spacious">
			<section class="col-12 col-md-8 col-lg-7 post__content is-layout-constrained post-95785 post type-post status-publish format-standard has-post-thumbnail hentry category-ai-and-ml category-automation category-ci-cd category-enterprise-software category-generative-ai category-github-copilot category-llms category-machine-learning tag-agentic-workflows">
	<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
<html><body>
<p>GitHub Agentic Workflows is like a team of street sweepers that clean up little messes in your repo. These teams significantly improve repo hygiene and quality, but as with all agentic work, cost is a growing concern for developers. And because CI jobs like agentic workflows are automatically scheduled and triggered, costs can accumulate out of view.
<p>Thankfully, making automations more efficient is easier than doing the same for interactive desktop sessions. Work done during a developer session can be hard to predict, but agentic workflows&rsquo; work is fully specified in YAML and repeats every execution.
<p>Because we maintain and use GitHub Agentic Workflows in our own GitHub repositories, we worry about token efficiency as much as our users. That is why in April 2026, we began to systematically optimize the token usage of many of the workflows that we rely on every day. This post describes what we instrumented, the optimizations we applied, and our preliminary results.
##  class="wp-block-heading" id="h-logging-token-usage">Logging token usage
<p>We rely on hundreds of agentic workflows in our repos for maintenance and CI. All workflows run as GitHub Actions against real API rate limits. We are building the plane as we fly it and burning jet fuel as we go.
<p>Before we could optimize our token consumption, we needed to know how tokens were consumed. The first challenge we faced was that each agent framework (Claude CLI, Copilot CLI, Codex CLI) emitted logs in a different format, and usage data could be incomplete for historical runs. Thankfully, the agentic-workflows security architecture uses an API proxy to prevent agents from directly accessing authentication credentials. This proxy gave us a way to capture token usage across all runs in a single normalized format, regardless of agent framework.
<p>Every workflow now outputs a `token-usage.jsonl artifact with one record per API call that contains input tokens, output tokens, cache-read tokens, cache-write tokens, model, provider, and timestamps. Combining this data with the rest of the workflow&rsquo;s logs gave a historical view of how tokens were typically spent and allowed us to optimize for future runs.
##  class="wp-block-heading" id="h-workflows-optimizing-workflows">Workflows optimizing workflows
<p>With token data in hand, we built two daily optimization workflows.
<p>A <strong>Daily Token Usage Auditor</strong> reads token usage artifacts from recent workflow runs, aggregates consumption by workflow, and posts a structured report. Its job is to flag any workflow that has significantly increased its recent usage, surface the most expensive workflows, and take note of anomalous runs (e.g., a workflow that normally completes in four LLM turns taking 18).
<p>When an Auditor flags a workflow, a Daily Token Optimizer looks at the workflow&rsquo;s source and recent logs to create a GitHub issue with describing concrete inefficiencies and proposing specific optimization. The Optimizer has found many inefficiencies that we would have otherwise missed.
<p>Of course, the Auditor and Optimizer are agentic workflows themselves, and their token usage also appear in daily reports to create a small virtuous cycle.
##  class="wp-block-heading" id="h-eliminating-unused-mcp-tools">Eliminating unused MCP tools
<p>Based on our initial Auditor and Optimizer results, the most common inefficiency is unused MCP tool registrations.
<p>Because LLM APIs are stateless, agent runtimes typically include the MCP tool function names and JSON schemas with each request. In practice, this means the full set of tools can become part of every call&rsquo;s context. For a GitHub MCP server with 40 tools, this can add 10&ndash;15 KB of schema per turn. If the agent only uses two tools, the remaining 38 are pure overhead added to every request.
<p>Workflow authors naturally start with a full tool-set since it is the path of least resistance, and the agent can figure out which tools it needs. But as time goes on, most workflows rely on a narrow, stable set of tools. The Optimizer identifies this pattern by cross-referencing tool manifests against actual tool calls and recommends pruning unused tools from the configuration.
<p>In our smoke-test workflows, removing unused tools from the MCP configuration reduced per-call context size by 8&ndash;12 KB, saving several thousand tokens per run with no change in behavior.
##  class="wp-block-heading" id="h-replacing-github-mcp-with-github-cli">Replacing GitHub MCP with GitHub CLI
<p>Removing unused MCP tools is a relatively simple win. A larger structural opportunity was replacing GitHub MCP calls for data-fetching operations like retrieving pull request diffs, file contents, and review comments with calls to the GitHub CLI.
<p>This change did more than reduce the overhead of unused tools because an MCP tool call is a reasoning step in addition to data retrieval. The agent must decide to call the tool, formulate its arguments, and receive its output as part of the context. That&rsquo;s a full round-trip LLM API call, consuming tokens for the tool-use JSON schema, the argument block, and the response. Calling &lsquo;gh pr diff&rsquo;, by contrast, is a deterministic HTTP request to GitHub&rsquo;s REST API with no LLM involvement.
<p>We used two strategies for this migration:
<p><strong>Pre-agentic data downloads</strong>. For data that an agent will always need like a pull request diff or the list of changed files, we added setup steps in the workflow that run `gh commands before the agent starts and writes the results to workspace files. The agent reads those files instead of making MCP calls. This eliminates tool-call overhead and allows the agent to take advantage of its extensive training in bash scripting to efficiently process the data.
<p><strong>In-agent CLI proxy substitution</strong>. Pre-downloading isn&rsquo;t possible in cases where the agent determines what to fetch at runtime. In these cases we rely on a lightweight transparent HTTP proxy that routes CLI traffic to GitHub&rsquo;s API servers without exposing an authentication token to the agent. The agent runs `gh pr view &ndash;json and gets structured data back, just as a user would from a terminal. This reduces token usage without compromising our zero-secrets security requirement for the agent.
<p>Together, these techniques move the majority of GitHub data-fetching out of the LLM reasoning loop.
##  class="wp-block-heading" id="h-measuring-efficiency-gains-is-not-easy">Measuring efficiency gains is not easy
<p>Once we began to optimize our workflows, we ran into a more nuanced problem: how do you know whether a change made things more efficient, or just made the workflow do less (and perhaps worse) work?
<p>There are three confounding factors.
<p><strong>Not all tokens are created equal</strong>. Running the same workflow on Claude Haiku versus Claude Sonnet produces similar token counts but cost very differently. Haiku costs roughly 4&times; less per token than Sonnet, so a workflow that switches models appears unchanged in raw token count but represents a significant cost reduction. To account for this, we use an Effective Tokens (ET) metric that applies model multipliers to each token type:
<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext">`ET = m &times; (1.0 &times; I + 0.1 &times; C + 4.0 &times; O) 
```
<clipboard-copy aria-label="Copy" class="code-copy-btn" data-copy-feedback="Copied!" value="ET = m &times; (1.0 &times; I + 0.1 &times; C + 4.0 &times; O)" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewbox="0 0 16 16" version="1.1" width="16" class="octicon octicon-copy js-clipboard-copy-icon">
<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewbox="0 0 16 16" version="1.1" width="16" class="octicon octicon-check js-clipboard-check-icon">
<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div>
<p>where <em>m</em> is a model cost multiplier (Haiku = 0.25&times;, Sonnet = 1.0&times;, Opus = 5.0&times;), <em>I</em> is newly-processed input tokens, <em>C</em> is cache-read tokens, and <em>O</em> is output tokens. Output tokens carry 4&times; weight because they are the most expensive token type across all major providers. Cache-read tokens carry only 0.1&times; weight because they are served from cache at a fraction of the cost of fresh input. This formula normalizes consumption across model tiers so that a 10% ET reduction means a genuine 10% cost reduction regardless of which model is in use.
<p>The workload is a live repository. As far as we know, there is no agentic-workflow benchmark that we can use to optimize our token usage. When we began looking at token usage by our workflows, we found that in one run a workflow would handle a five-line fix, and in the next run it would handle a 200-line pull request. The first run naturally uses fewer tokens, but the difference is not due to a sudden change in efficiency. Raw token counts can confuse workload variation with fluctuations in efficiency. We try to normalize this by tracking LLM API call counts alongside token counts; constant LLM turns-per-run and falling tokens-per-call indicate genuine efficiency improvement. Both falling together may indicate that less work is being done.
<p>Does quality change? Understanding output quality is the hardest consideration. A lighter model running a more constrained workflow might produce lower-quality output. We looked at the process-level signals like output tokens per LLM call, turn counts per run, and tool-call completion rates to approximate quality. For our optimized Smoke Copilot workflow, all three remained stable across the optimization period even as token consumption fell. The workflow completes in roughly five LLM turns every run, before and after the optimizations. Of course, these are process signals, not outcome signals. We cannot directly observe whether the quality improved, degraded, or was stable, because there is no ground-truth &ldquo;correctness.&rdquo; Measuring tokens-per-unit-of-correct-work requires additional instrumentation and thought.
##  class="wp-block-heading" id="h-initial-results">Initial results
<p>After deploying the auditor and optimizer across a dozen production workflows in the `gh-aw and `gh-aw-firewall repos, we downloaded token-usage artifacts for runs before and after each was optimized and computed ET for each run. Nine of the 12 workflows received optimizer-recommended changes. We include results only for workflows with at least eight runs in both the pre- and post-optimization periods. These are: Auto-Triage Issues, Daily Compiler Quality, Community Attribution, Security Guard, and Smoke Claude.
<figure class="wp-block-image size-large"><img data-recalc-dims="1" decoding="async" loading="lazy" height="504" width="1024" src="https://github.blog/wp-content/uploads/2026/05/graph.png?resize=1024%2C504" alt="Graph showing token savings across Auto-Triage Issues, Daily Compiler Quality, Community Attribution, Security Guard, adn Smoke Claude." class="wp-image-95794" srcset="https://github.blog/wp-content/uploads/2026/05/graph.png?w=1486 1486w, https://github.blog/wp-content/uploads/2026/05/graph.png?w=300 300w, https://github.blog/wp-content/uploads/2026/05/graph.png?w=768 768w, https://github.blog/wp-content/uploads/2026/05/graph.png?w=1024 1024w" sizes="auto, (max-width: 1000px) 100vw, 1000px" /></figure>
<p>Auto-Triage Issues shows a clear, sustained reduction of 62% across 109 post-fix runs. Daily Compiler Quality shows 19% improvement over 12 post-fix runs, and Daily Community Attribution shows 37% improvement over eight post-fix runs. In the `gh-aw-firewall repo, Security Guard, which audits every pull request for security-sensitive changes, and Smoke Claude an integration test that exercises the firewall&rsquo;s Claude CLI path, had the most post-fix runs and show improvements of 43% and 59%, respectively.
<p>Run frequency matters as much as per-run savings. Auto-Triage Issues fires on every new issue (averaging 6.8 runs per day with a max of 15) while Daily Compiler Quality runs at most once per day. 62% savings and 6.8 runs/day compounds quickly: over the observation period, Auto-Triage&rsquo;s optimization saved roughly 7.8 M ET in aggregate, assuming the pre-optimization rate. Security Guard and Smoke Claude run even more frequently. When prioritizing which workflows to optimize, run frequency is as important as per-run consumption.
<p>It is important to note that not every optimization that the agent recommends translates into measurable ET savings, especially over short observation windows on a live repository where workload varies day to day. For example, the Contribution Check workflow experienced a 5% increase in ET, and we will discuss it in greater detail below.
##  class="wp-block-heading" id="h-take-aways">Take aways
<p>Based on these results, we highlight three patterns.
<p><strong>Many agent turns are deterministic data-gathering</strong>. Auto-Triage Issues shows the strongest sustained improvement in `gh-aw (&minus;44% across 62 post-fix runs) because the optimization eliminated structural inefficiency: many agent turns were spent on reads that required no inference, such as fetching issue metadata and scanning labels. Moving those reads into pre-agentic CLI steps before the agent starts removed them from the LLM reasoning loop entirely. The same pattern drove Security Guard&rsquo;s &minus;60% reduction in `gh-aw-firewall: a relevance gate now skips the LLM entirely for pull requests that don&rsquo;t touch security-sensitive files. The cheapest LLM call is the one you don&rsquo;t make.
<p>Contribution Check illustrates a confounding factor: 82&ndash;83% of input tokens were cache reads (data-gathering), but average ET increased 5%. This is due to a workload shift rather than optimization failure: in the pre-optimization period 41% of runs processed small pull requests (ET &lt; 100K) and 39% processed large pull requests (ET &gt; 300K). The post-optimization period coincided with a burst of development activity, and the workflow processed 9% small pull requests and 65% large pull requests. Output tokens, which carry a 4&times; weight in the ET formula, rose 14% as the agent reviewed bigger diffs. The optimization likely improved per-turn efficiency, but the shift toward heavier workloads masks that gain in the aggregate numbers.
<p>Unused tools are expensive to carry. Among the excluded `gh-aw workflows, the Glossary Maintainer is an instructive case. A single tool&mdash;search_repositories&mdash;was called 342 times in one run, accounting for 58% of all tool calls, despite being completely unnecessary for a workflow that only scans local file changes. Removing it from the toolset was the optimizer&rsquo;s recommendation. In `gh-aw-firewall, Smoke Claude&rsquo;s &minus;79% reduction was driven in part by aggressive MCP tool pruning combined with a model-tier switch to Haiku. The Daily Community Attribution workflow illustrates the limits of this approach: it was configured with eight GitHub MCP tools and made zero calls to any of them across an entire run, but removing them did not reduce ET. Tool manifests were a small fraction of this workflow&rsquo;s overall context.
<p><strong>A single misconfigured rule can cause runaway loops</strong>. Also among the excluded workflows, Daily Syntax Error Quality was the highest-ET workflow in the project before optimization. The root cause was a one-line misconfiguration: the workflow copied test files to /tmp/ then called gh aw compile *, but the sandbox&rsquo;s bash allowlist only permitted relative-path glob patterns. Every compile attempt was blocked. Unable to use the tool it needed, the agent fell into a 64-turn fallback loop in which it manually read source code to reconstruct what the compiler would have told it. One fix to the allowed bash patterns eliminated the loop. We did not have enough baseline runs to precisely quantify the improvement, but the pathology was clear and the fix was unambiguous.
##  class="wp-block-heading" id="h-what-s-next">What&rsquo;s next?
<p>The tools we use to optimize our workflows including API-level observability, automated auditing workflows, MCP tool pruning, and CLI substitution are all available today in the GitHub Agentic Workflows framework. Another upcoming optimization is refactoring monolithic agents into teams of subagents using smaller and cheaper models.
<p>The next step is to move from workflow-level optimization to system-level optimization. A workflow run is not really one flat sequence of API calls. It is a chain of episodes: short phases of work like gathering context, reading artifacts, retrying after a failure, or synthesizing a final answer. Once you can see those episodes clearly, you can ask much better questions. Which episode actually caused a costly run? Which episodes are mostly repeated work, blocked work, or failed work? Which ones should stop being agentic entirely and become deterministic pre-steps?
<p>That same logic applies at the portfolio level. Repositories do not run one workflow in isolation. They run a fleet of agentic automations that often trigger on the same events, inspect the same diffs and logs, and produce adjacent judgments. That means cost is not just a property of a single workflow, but also of overlap across the portfolio. The next analyses we want are portfolio-level ones: where workflows are duplicating reads, where several workflows should be consolidated, and where shared intermediate artifacts should be cached instead of rediscovered by each run.
<p>Those open questions are genuinely hard. Measuring goodput still requires outcome instrumentation that does not yet exist at scale for agentic CI workflows, and understanding episode and portfolio efficiency requires richer lineage data than most systems collect today. But that is the direction that matters. The proxy-level observability and optimizer workflows have already changed how we develop and deploy new agentic automations. We add token monitoring from day one rather than retrofitting it later, and increasingly we think in terms of avoidable work across the whole automation fleet, not just expensive runs in isolation.
<p>If you&rsquo;re running agentic workflows in CI and wondering whether you&rsquo;re spending more than you need to, the first step is the same as ours: add the API proxy, turn on logging, and let the data tell you where to look.
<p>If you want to add the workflows mentioned here, you can simply drop them into your repo using the <a href="https://github.github.com/gh-aw/setup/cli/#installation">`gh-aw CLI</a>:
<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext">`gh extensions install github/gh-aw
gh aw add githubnext/agentic-ops/copilot-token-audit githubnext/agentic-ops/copilot-token-optimizer
```
<clipboard-copy aria-label="Copy" class="code-copy-btn" data-copy-feedback="Copied!" value="gh extensions install github/gh-aw
gh aw add githubnext/agentic-ops/copilot-token-audit githubnext/agentic-ops/copilot-token-optimizer" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewbox="0 0 16 16" version="1.1" width="16" class="octicon octicon-copy js-clipboard-copy-icon">
<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewbox="0 0 16 16" version="1.1" width="16" class="octicon octicon-check js-clipboard-check-icon">
<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div>
<p>Running them alongside your existing CI will give you immediate visibility into usage and help continuously optimize your workflows over time.
<p>We&rsquo;d love to hear how others are approaching this problem. Share your thoughts in the <a href="https://github.com/orgs/community/discussions/186451">community discussion</a> or join the #agentic-workflows channel of the <a href="https://gh.io/next-discord">GitHub Next Discord</a>.
<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p>Explore the <a href="http://github.com/github/gh-aw" target="_blank" rel="noreferrer noopener">GitHub Agentic Workflows repo &gt;</a>
</div>