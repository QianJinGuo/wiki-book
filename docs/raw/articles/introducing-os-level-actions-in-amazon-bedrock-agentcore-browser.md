---
title: "Introducing OS Level Actions in Amazon Bedrock AgentCore Browser"
url: https://aws.amazon.com/blogs/machine-learning/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser/
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser/
tags: [aws-china-blog, agentic-ai, context-engineering]
sha256: ea2d4fe4a9918245
ingested: 2026-05-11
---
<p>AI agents that automate web workflows operate within the browser’s web layer, the DOM that Playwright and the Chrome DevTools Protocol (CDP) expose. AgentCore Browser provides a secure, isolated browser environment for this, and it works well for the vast majority of automation: navigating pages, filling forms, clicking elements, extracting content. But the web layer has a hard boundary. Anything that the operating system renders (native dialogs, security prompts, certificate choosers, context menus, even Chrome settings) sits outside the DOM entirely. CDP can’t see it, and Playwright can’t interact with it.</p> 
<p>When a web application calls <code>window.print()</code> and a system print dialog appears, Playwright has no DOM to interact with. When a workflow requires a keyboard shortcut or a right-click context menu, CDP has no mechanism to issue those commands at the OS level. When a browser session encounters a macOS privacy dialog, a Windows Security prompt, or a certificate chooser, they’re invisible to the web automation layer. These scenarios tend to surface in production. They’re triggered by specific application states, OS configurations, or user permissions, not in testing, where web content is predictable enough to validate against.</p> 
<p>The challenge compounds for vision-enabled agents. A common architecture is to capture a screenshot, send it to a model, receive back coordinates or instructions, and execute. This loop works well for web content, but breaks the moment that native UI appears. The screenshot captures it, the model reasons about it, and then there’s nothing to act with. CDP can’t reach what the OS rendered. The agent sees exactly what to do and has no way to do it.</p> 
<p>We’re announcing OS Level Actions for AgentCore Browser. This new capability unblocks these scenarios by exposing direct OS control through the <code>InvokeBrowser</code> API, so agents can interact with content visible on the screen, not only what’s accessible through the browser’s web layer. By combining full-desktop screenshots with mouse and keyboard control at the OS level, agents can observe native UI, reason about it, and act on it within the same session. This post walks through how OS Level Actions work, what actions are supported, and how to get started.</p> 
<h2><strong>How OS Level Actions work</strong></h2> 
<p>OS Level Actions are available for new and existing browser configurations without further setup. After a session is active, you dispatch actions through the <code>InvokeBrowser</code> API. Each call carries exactly one action, identified by its type and arguments, and returns a <code>SUCCESS</code> or <code>FAILED</code> status. The active session is identified using the <code>x-amzn-browser-session-id</code> header, which ties each OS-level action to the correct browser session.</p> 
<p>The expected interaction pattern is an action-screenshot-reaction loop. The agent takes an action (click, type, shortcut), captures a screenshot to observe the current state of the screen, and then decides the next action based on what it sees. This loop allows the agent to react to dynamic UI. This includes native dialogs and OS prompts that might appear mid-workflow.</p> 
<ol> 
 <li><strong>Agent sends an action</strong>. This can be a mouse click, key press, or shortcut using <code>InvokeBrowser</code>.</li> 
 <li><strong>AgentCore executes the action</strong> on the full OS desktop and returns <code>SUCCESS</code> or <code>FAILED</code>.</li> 
 <li><strong>Agent requests a screenshot</strong> to observe the current screen state.</li> 
 <li><strong>AgentCore captures the full desktop</strong>, including native dialogs, OS modals, and UI outside the browser window, and returns a base64-encoded PNG.</li> 
 <li><strong>Agent reasons about the screenshot</strong> sending it to a vision model to determine what happened and what to do next.</li> 
 <li><strong>Agent sends the next action</strong> based on what it observed, continuing the loop.</li> 
</ol> 
<h2><strong>Supported actions</strong></h2> 
<p>OS Level Actions are organized into three categories: mouse control, keyboard input, and visual capture. The following table summarizes eight actions with their fields and constraints.</p> 
<table class="styled-table" border="1px" cellpadding="10px"> 
 <tbody> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd"><strong>Action</strong></td> 
 <td style="padding: 10px;border: 1px solid #dddddd"><strong>Required fields</strong></td> 
 <td style="padding: 10px;border: 1px solid #dddddd"><strong>Optional fields</strong></td> 
 <td style="padding: 10px;border: 1px solid #dddddd"><strong>Notes</strong></td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">mouseClick</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">x, y, button, clickCount</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Defaults to current position, LEFT, single click. clickCount: 1–10.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">mouseMove</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">x, y</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Moves cursor to coordinates.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">mouseDrag</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">endX, endY</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">startX, startY, button</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Drags from start to end. button defaults to LEFT.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">mouseScroll</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">x, y, deltaX, deltaY</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">deltaY negative = scroll down. Range: -1000 to 1000.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">keyType</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">text</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Types a string. Max 10,000 characters.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">keyPress</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">key</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">presses</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Presses a key N times. presses: 1–100, defaults to 1.</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">keyShortcut</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">keys</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Key combination array. Up to five keys, for example, [“ctrl”, “a”].</td> 
 </tr> 
 <tr> 
 <td style="padding: 10px;border: 1px solid #dddddd">screenshot</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">—</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">format</td> 
 <td style="padding: 10px;border: 1px solid #dddddd">Captures full OS desktop. Returns base64-encoded PNG.</td> 
 </tr> 
 </tbody> 
</table> 
<h3><strong>Mouse actions</strong></h3> 
<p>Mouse actions cover the full range of pointer interactions: clicking, moving, dragging, and scrolling. Coordinate fields are optional for <code>mouseClick</code>. If omitted, the click lands at the current cursor position with a left button single click. This is useful when a prior <code>mouseMove</code> has already positioned the cursor. <code>mouseDrag</code> requires the four coordinates, start and end positions. <code>mouseScroll</code> accepts a position and delta values for both axes—negative <code>deltaY</code> scrolls down, positive scrolls up. A right-click context menu, for example, is a single <code>mouseClick</code> with button set to <code>RIGHT</code> at the target coordinates. Note that some context menu items might not function as expected because of the virtualized environment in which the browser session runs.</p> 
<h3><strong>Keyboard actions</strong></h3> 
<p>The three keyboard actions cover different levels of input. <code>keyType</code> is for typing text. It sends characters directly and handles strings up to 10,000 characters. <code>keyPress</code> is for individual keys that must be pressed repeatedly, such as tab to advance through form fields or escape to dismiss a modal. <code>keyShortcut</code> is for combinations—pass an array of key names and AgentCore presses them simultaneously.</p> 
<p>Key names for keyPress and keyShortcut must be lowercase. Supported keys include single characters (a–z, 0–9) and named keys such as enter, tab, space, backspace, delete, escape, ctrl, alt, and shift.</p> 
<p>To select the entire text, for example, you would use keyShortcut with <code>["ctrl", "a"]</code>.</p> 
<pre><code class="lang-yaml">{
 "action": {
 "keyShortcut": {
 "keys": ["ctrl", "a"]
 }
 }
}</code></pre> 
<h3><strong>Screenshot</strong></h3> 
<p>The <code>screenshot</code> action captures the full OS desktop and returns a base64-encoded PNG in the response. It’s the only action that returns data. The other actions return only a status (SUCCESS or FAILED) and an error field on failure.</p> 
<pre><code class="lang-yaml">{
 "action":{
 "screenshot":{
 "format":"PNG"
 }
 }
}</code></pre> 
<h2><strong>Getting started</strong></h2> 
<p>The following examples walk through the action-screenshot-reaction loop, matching the <a href="https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions" target="_blank" rel="noopener noreferrer">companion notebook</a>. For the full working notebook with eight actions demonstrated end to end, start there.</p> 
<h3><strong>Set up clients and create a browser</strong></h3> 
<p>You need two clients: a control plane client (<code>bedrock-agentcore-control</code>) for managing browser resources, and a data plane client (<code>bedrock-agentcore</code>) for dispatching actions during a session.</p> 
<pre><code class="lang-python">import boto3
import time
browser_boto3 = boto3.client('bedrock-agentcore-control', region_name='us-west-2')
BROWSER_NAME = "browser_with_os_actions"
</code></pre> 
<p>Before starting a session, you need an AWS Identity and Access Management (IAM) execution role and a browser resource. The execution role requires <code>bedrock-agentcore:InvokeBrowser</code>, <code>bedrock-agentcore:StartBrowserSession</code>, and <code>bedrock-agentcore:StopBrowserSession</code> permissions. The <a href="https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions" target="_blank" rel="noopener noreferrer">companion notebook</a> includes a helper that creates this role for you:</p> 
<pre><code class="lang-python">from helpers.utils import create_agentcore_execution_role, SAMPLE_ROLE_NAME
execution_role_arn = create_agentcore_execution_role(SAMPLE_ROLE_NAME)
</code></pre> 
<p>With the role created, create a custom browser:</p> 
<pre><code class="lang-python">created_browser = browser_boto3.create_browser(
 name=BROWSER_NAME,
 executionRoleArn=execution_role_arn,
 networkConfiguration={
 'networkMode': 'PUBLIC'
 }
)
browser_id = created_browser['browserId']
print(f"Browser ID: {browser_id}")
</code></pre> 
<h3><strong>Start a browser session</strong></h3> 
<p>With the browser resource created, start a session. The <code>viewPort</code> sets the screen resolution. This determines the coordinate space for mouse actions and the dimensions of captured screenshots. The <code>sessionTimeoutSeconds</code> controls how long the session stays alive before it’s automatically terminated.</p> 
<pre><code class="lang-python"># These helpers are included in the companion notebook repository
from helpers.browser import get_credentials, invoke, start_session, stop_session
creds, default_region = get_credentials()
BEDROCK_AGENTCORE_DP_ENDPOINT = f"https://bedrock-agentcore.{default_region}.amazonaws.com/"
sid = start_session(BEDROCK_AGENTCORE_DP_ENDPOINT, browser_id, region=default_region, credentials=creds)
# Wait for session to initialize — adjust if needed for your environment
time.sleep(3)
</code></pre> 
<p>The <code>start_session</code> helper sends a SigV4-signed PUT request to create the session and returns the sessionId. The invoke helper handles signing and dispatching individual actions.</p> 
<h3><strong>Invoke an OS-level action</strong></h3> 
<p>With the session running, you can dispatch OS-level actions through the invoke helper. Each call takes a single action — in this case, a left click at coordinates (600, 370) on the screen:</p> 
<pre><code class="lang-python">r = invoke(
 BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
 {"mouseClick": {"x": 600, "y": 370, "button": "LEFT"}},
 region=default_region, credentials=creds, browser_id=browser_id
)
print(f"Mouse click status: {r.status_code}, action: {r.json()['result']}")
</code></pre> 
<p>The response tells you whether the action succeeded or failed. Coordinates map to screen pixels, if the session viewport is 1920×1080, valid x values range from 0 to 1919 and y from 0 to 1079. Coordinates outside the screen dimensions return a <code>ValidationException</code>.</p> 
<h3><strong>Capture a screenshot</strong></h3> 
<p>After each action, the agent must observe what happened. The screenshot action captures the full desktop and returns the image as a base64-encoded PNG:</p> 
<pre><code class="lang-python">import base64
from IPython.display import Image, display
r = invoke(
 BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
 {"screenshot": {"format": "PNG"}},
 region=default_region, credentials=creds, browser_id=browser_id
)
img_bytes = base64.b64decode(r.json()['result']['screenshot']['data'])
display(Image(img_bytes))
</code></pre> 
<p>This is the observation step in the loop. The agent sends the screenshot to a vision model, which reasons about what’s on screen and returns the next action to take. The cycle repeats until the workflow is complete.</p> 
<h2><strong>Putting it together: dismissing a print dialog</strong></h2> 
<p>Here is the action-screenshot-reaction loop in practice. Suppose the agent navigates to a page that triggers <code>window.print()</code>, and a native print dialog appears. The agent can’t interact with it through CDP, but it can with OS Level Actions.First, the agent captures a screenshot to see the current state of the screen:</p> 
<pre><code class="lang-python">r = invoke(
 BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
 {"screenshot": {"format": "PNG"}},
 region=default_region, credentials=creds, browser_id=browser_id
)
# Send the screenshot to a vision model to identify the dialog and locate the Cancel button.
# The vision model integration depends on your agent architecture — see the Bedrock
# InvokeModel API for how to send images to Claude or other models.
# The model returns coordinates, e.g.: {"x": 410, "y": 535}
</code></pre> 
<p>The vision model identifies the print dialog and returns the coordinates of the <strong>Cancel</strong> button. The agent selects it:</p> 
<pre><code class="lang-python">r = invoke(
 BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
 {"mouseClick": {"x": 410, "y": 535, "button": "LEFT"}},
 region=default_region, credentials=creds, browser_id=browser_id
)
print(f"Click status: {r.status_code}, action: {r.json()['result']}")
</code></pre> 
<p>The agent takes another screenshot to confirm that the dialog was dismissed, and the workflow continues.</p> 
<h2><strong>Stop the session and clean up</strong></h2> 
<p>When the workflow is done, stop the session and clean up resources:</p> 
<pre><code class="lang-python">stop_session(BEDROCK_AGENTCORE_DP_ENDPOINT, sid, browser_id, region=default_region, credentials=creds)</code></pre> 
<p>To delete the browser resource and IAM role:</p> 
<pre><code class="lang-python">browser_boto3.delete_browser(browserId=browser_id)
print(f"Browser {browser_id} deleted")
from helpers.utils import delete_agentcore_execution_role, SAMPLE_ROLE_NAME
delete_agentcore_execution_role(SAMPLE_ROLE_NAME)
</code></pre> 
<p>These steps, act, observe, decide, form the core of the action-screenshot-reaction pattern. The <a href="https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions" target="_blank" rel="noopener noreferrer">companion notebook</a> walks through eight supported actions with a live browser session, including mouse drag, scroll, keyboard input, and shortcut combinations.</p> 
<h2><strong>Conclusion</strong></h2> 
<p>When we launched <a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html" target="_blank" rel="noopener noreferrer">Amazon Bedrock AgentCore Browser</a>, it gave AI agents a fully managed, cloud-based browser environment to interact with websites. It navigated pages, extracted content, and automated workflows at scale through Playwright and CDP. OS Level Actions extend that capability beyond the web layer to UI elements visible on the screen. Native dialogs, security prompts, keyboard shortcuts, and browser chrome are no longer blockers. Agents can now observe, reason about, and act on the full OS desktop within the same session.</p> 
<p>Combined with AgentCore Browser’s existing capabilities like visual understanding and framework integration with Playwright and Amazon Nova Act, OS Level Actions close the last gap in browser automation coverage.</p> 
<p>To start building:</p> 
<ul> 
 <li>Follow the <a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html" target="_blank" rel="noopener noreferrer">Amazon Bedrock AgentCore Developer Guide</a></li> 
 <li>Try the <a href="https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions" target="_blank" rel="noopener noreferrer">companion notebook</a> for a hands-on walkthrough</li> 
 <li>For broader context on browser automation, see the <a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-quickstart.html" target="_blank" rel="noopener noreferrer">Amazon Bedrock AgentCore Browser documentation</a></li> 
</ul> 
<hr> 
<p><strong>About the authors</strong></p> 
<footer> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="aligncenter wp-image-129291" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-1.png" alt="" width="400" height="532">
 </div> 
 <h3>Evandro Franco</h3> 
 <p><strong>Evandro Franco</strong> is a Sr. Data Scientist working on Amazon Web Services. He is part of the Global GTM team that helps AWS customers overcome business challenges related to AI/ML on top of AWS, mainly on Amazon Bedrock AgentCore and Strands Agents. He has more than 18 years of experience working with technology, from software development, infrastructure, serverless, to machine learning. In his free time, Evandro enjoys playing with his son, mainly building some funny Lego bricks.</p> 
 </div> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="alignnone size-full wp-image-129290" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-2.png" alt="" width="100" height="100">
 </div> 
 <h3>Phelipe Fabres</h3> 
 <p><strong>Phelipe Fabres</strong> is a Sr. Solutions Architect for Generative AI at AWS for Startups. He is part of a global Frontier AI team with a focus on costumers that are building Foundation Models/LLMs/SLMs. Has extended work on Agentic systems and Software driven AI systems. He has more than 10 years of working with software development, from monolith to event-driven architectures with a Ph.D. in Graph Theory. In his free time, Phelipe enjoys playing with his daughter, mainly board games and drawing princess.</p> 
 </div> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="alignnone size-medium wp-image-129289" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-3-253x300.jpeg" alt="" width="253" height="300">
 </div> 
 <h3>Saurav Das</h3> 
 <p><strong>Saurav Das</strong> is part of the Amazon Bedrock AgentCore Product Management team. He has more than 15 years of experience in working with cloud, data and infrastructure technologies. He has a deep interest in solving customer challenges centered around data and AI infrastructure.</p> 
 </div> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="alignnone size-full wp-image-129288" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-4.jpeg" alt="" width="256" height="256">
 </div> 
 <h3>Yanda Hu</h3> 
 <p><strong>Yanda Hu</strong> is a software engineer on the Amazon Bedrock AgentCore Engineering team with 5+ years of experience building machine learning and AI solutions at scale. He specializes in designing and delivering scalable agentic systems. He is passionate about the emerging agentic AI landscape, focusing on helping customers overcome real-world challenges in agentic workflows.</p> 
 </div> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="alignnone size-medium wp-image-129287" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-5-295x300.jpeg" alt="" width="295" height="300">
 </div> 
 <h3>Cristiano Scandura</h3> 
 <p><strong>Cristiano</strong> has been in the IT industry since 1998. He joined Amazon Web Services (AWS) in 2018, where he worked on projects for enterprise clients. Currently, he specializes in GenAI and machine learning (ML) projects for all industries in AWS Worldwide Public Sector.</p> 
 </div> 
 <div class="blog-author-box"> 
 <div class="blog-author-image">
 <img loading="lazy" class="alignnone size-full wp-image-129286" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/ml20810-image-6.jpeg" alt="" width="260" height="260">
 </div> 
 <h3>Joshua Samuel</h3> 
 <p><strong>Joshua Samuel</strong> is a Senior AI/ML Specialist Solutions Architect at AWS who accelerates enterprise transformation through AI/ML, and generative AI solutions, based in Melbourne, Australia. A passionate disrupter, he specializes in agentic AI and coding techniques – Anything that makes builders faster and happier. Outside work, he tinkers with home automation and AI coding projects, and enjoys life with his wife, kids and dog.</p> 
 </div> 
</footer>