---
title: "aws bedrock agentcore os level actions browser"
source: rss
source_url: [ORIGINAL_URL]
ingested: 2026-05-08
created: 2026-05-08
updated: 2026-05-08
type: raw
tags: [rss, aws, post-training]
summary: OS级操作4步闭环：Action-Screenshot-Reaction / 8个原子操作（鼠标/键盘/截图） / 浏览器自动化
sha256: b8b7c813759a
---
# Introducing OS Level Actions in Amazon Bedrock AgentCore Browser
AI agents that automate web workflows operate within the browser’s web layer, the DOM that Playwright and the Chrome DevTools Protocol (CDP) expose. AgentCore Browser provides a secure, isolated browser environment for this, and it works well for the vast majority of automation: navigating pages, filling forms, clicking elements, extracting content. But the web layer has a hard boundary. Anything that the operating system renders (native dialogs, security prompts, certificate choosers, context menus, even Chrome settings) sits outside the DOM entirely. CDP can’t see it, and Playwright can’t interact with it.
When a web application calls `window.print()` and a system print dialog appears, Playwright has no DOM to interact with. When a workflow requires a keyboard shortcut or a right-click context menu, CDP has no mechanism to issue those commands at the OS level. When a browser session encounters a macOS privacy dialog, a Windows Security prompt, or a certificate chooser, they’re invisible to the web automation layer. These scenarios tend to surface in production. They’re triggered by specific application states, OS configurations, or user permissions, not in testing, where web content is predictable enough to validate against.
The challenge compounds for vision-enabled agents. A common architecture is to capture a screenshot, send it to a model, receive back coordinates or instructions, and execute. This loop works well for web content, but breaks the moment that native UI appears. The screenshot captures it, the model reasons about it, and then there’s nothing to act with. CDP can’t reach what the OS rendered. The agent sees exactly what to do and has no way to do it.
We’re announcing OS Level Actions for AgentCore Browser. This new capability unblocks these scenarios by exposing direct OS control through the `InvokeBrowser` API, so agents can interact with content visible on the screen, not only what’s accessible through the browser’s web layer. By combining full-desktop screenshots with mouse and keyboard control at the OS level, agents can observe native UI, reason about it, and act on it within the same session. This post walks through how OS Level Actions work, what actions are supported, and how to get started.
## **How OS Level Actions work**
OS Level Actions are available for new and existing browser configurations without further setup. After a session is active, you dispatch actions through the `InvokeBrowser` API. Each call carries exactly one action, identified by its type and arguments, and returns a `SUCCESS` or `FAILED` status. The active session is identified using the `x-amzn-browser-session-id` header, which ties each OS-level action to the correct browser session.
The expected interaction pattern is an action-screenshot-reaction loop. The agent takes an action (click, type, shortcut), captures a screenshot to observe the current state of the screen, and then decides the next action based on what it sees. This loop allows the agent to react to dynamic UI. This includes native dialogs and OS prompts that might appear mid-workflow.
  1. **Agent sends an action**. This can be a mouse click, key press, or shortcut using `InvokeBrowser`.
  2. **AgentCore executes the action** on the full OS desktop and returns `SUCCESS` or `FAILED`.
  3. **Agent requests a screenshot** to observe the current screen state.
  4. **AgentCore captures the full desktop** , including native dialogs, OS modals, and UI outside the browser window, and returns a base64-encoded PNG.
  5. **Agent reasons about the screenshot** sending it to a vision model to determine what happened and what to do next.
  6. **Agent sends the next action** based on what it observed, continuing the loop.
## **Supported actions**
OS Level Actions are organized into three categories: mouse control, keyboard input, and visual capture. The following table summarizes eight actions with their fields and constraints.
**Action** | **Required fields** | **Optional fields** | **Notes**  
---|---|---|---  
mouseClick | — | x, y, button, clickCount | Defaults to current position, LEFT, single click. clickCount: 1–10.  
mouseMove | x, y | — | Moves cursor to coordinates.  
mouseDrag | endX, endY | startX, startY, button | Drags from start to end. button defaults to LEFT.  
mouseScroll | — | x, y, deltaX, deltaY | deltaY negative = scroll down. Range: -1000 to 1000.  
keyType | text | — | Types a string. Max 10,000 characters.  
keyPress | key | presses | Presses a key N times. presses: 1–100, defaults to 1.  
keyShortcut | keys | — | Key combination array. Up to five keys, for example, [“ctrl”, “a”].  
screenshot | — | format | Captures full OS desktop. Returns base64-encoded PNG.  
### **Mouse actions**
Mouse actions cover the full range of pointer interactions: clicking, moving, dragging, and scrolling. Coordinate fields are optional for `mouseClick`. If omitted, the click lands at the current cursor position with a left button single click. This is useful when a prior `mouseMove` has already positioned the cursor. `mouseDrag` requires the four coordinates, start and end positions. `mouseScroll` accepts a position and delta values for both axes—negative `deltaY` scrolls down, positive scrolls up. A right-click context menu, for example, is a single `mouseClick` with button set to `RIGHT` at the target coordinates. Note that some context menu items might not function as expected because of the virtualized environment in which the browser session runs.
### **Keyboard actions**
The three keyboard actions cover different levels of input. `keyType` is for typing text. It sends characters directly and handles strings up to 10,000 characters. `keyPress` is for individual keys that must be pressed repeatedly, such as tab to advance through form fields or escape to dismiss a modal. `keyShortcut` is for combinations—pass an array of key names and AgentCore presses them simultaneously.
Key names for keyPress and keyShortcut must be lowercase. Supported keys include single characters (a–z, 0–9) and named keys such as enter, tab, space, backspace, delete, escape, ctrl, alt, and shift.
To select the entire text, for example, you would use keyShortcut with `["ctrl", "a"]`.
    {
      "action": {
        "keyShortcut": {
          "keys": ["ctrl", "a"]
        }
      }
    }
### **Screenshot**
The `screenshot` action captures the full OS desktop and returns a base64-encoded PNG in the response. It’s the only action that returns data. The other actions return only a status (SUCCESS or FAILED) and an error field on failure.
    {
       "action":{
          "screenshot":{
             "format":"PNG"
          }
       }
    }
## **Getting started**
The following examples walk through the action-screenshot-reaction loop, matching the [companion notebook](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions>). For the full working notebook with eight actions demonstrated end to end, start there.
### **Set up clients and create a browser**
You need two clients: a control plane client (`bedrock-agentcore-control`) for managing browser resources, and a data plane client (`bedrock-agentcore`) for dispatching actions during a session.
    import boto3
    import time
    browser_boto3 = boto3.client('bedrock-agentcore-control', region_name='us-west-2')
    BROWSER_NAME = "browser_with_os_actions"
Before starting a session, you need an AWS Identity and Access Management (IAM) execution role and a browser resource. The execution role requires `bedrock-agentcore:InvokeBrowser`, `bedrock-agentcore:StartBrowserSession`, and `bedrock-agentcore:StopBrowserSession` permissions. The [companion notebook](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions>) includes a helper that creates this role for you:
    from helpers.utils import create_agentcore_execution_role, SAMPLE_ROLE_NAME
    execution_role_arn = create_agentcore_execution_role(SAMPLE_ROLE_NAME)
With the role created, create a custom browser:
    created_browser = browser_boto3.create_browser(
        name=BROWSER_NAME,
        executionRoleArn=execution_role_arn,
        networkConfiguration={
            'networkMode': 'PUBLIC'
        }
    )
    browser_id = created_browser['browserId']
    print(f"Browser ID: {browser_id}")
### **Start a browser session**
With the browser resource created, start a session. The `viewPort` sets the screen resolution. This determines the coordinate space for mouse actions and the dimensions of captured screenshots. The `sessionTimeoutSeconds` controls how long the session stays alive before it’s automatically terminated.
    # These helpers are included in the companion notebook repository
    from helpers.browser import get_credentials, invoke, start_session, stop_session
    creds, default_region = get_credentials()
    BEDROCK_AGENTCORE_DP_ENDPOINT = f"https://bedrock-agentcore.{default_region}.amazonaws.com/"
    sid = start_session(BEDROCK_AGENTCORE_DP_ENDPOINT, browser_id, region=default_region, credentials=creds)
    # Wait for session to initialize — adjust if needed for your environment
    time.sleep(3)
The `start_session` helper sends a SigV4-signed PUT request to create the session and returns the sessionId. The invoke helper handles signing and dispatching individual actions.
### **Invoke an OS-level action**
With the session running, you can dispatch OS-level actions through the invoke helper. Each call takes a single action — in this case, a left click at coordinates (600, 370) on the screen:
    r = invoke(
        BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
        {"mouseClick": {"x": 600, "y": 370, "button": "LEFT"}},
        region=default_region, credentials=creds, browser_id=browser_id
    )
    print(f"Mouse click status: {r.status_code}, action: {r.json()['result']}")
The response tells you whether the action succeeded or failed. Coordinates map to screen pixels, if the session viewport is 1920×1080, valid x values range from 0 to 1919 and y from 0 to 1079. Coordinates outside the screen dimensions return a `ValidationException`.
### **Capture a screenshot**
After each action, the agent must observe what happened. The screenshot action captures the full desktop and returns the image as a base64-encoded PNG:
    import base64
    from IPython.display import Image, display
    r = invoke(
        BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
        {"screenshot": {"format": "PNG"}},
        region=default_region, credentials=creds, browser_id=browser_id
    )
    img_bytes = base64.b64decode(r.json()['result']['screenshot']['data'])
    display(Image(img_bytes))
This is the observation step in the loop. The agent sends the screenshot to a vision model, which reasons about what’s on screen and returns the next action to take. The cycle repeats until the workflow is complete.
## **Putting it together: dismissing a print dialog**
Here is the action-screenshot-reaction loop in practice. Suppose the agent navigates to a page that triggers `window.print()`, and a native print dialog appears. The agent can’t interact with it through CDP, but it can with OS Level Actions.First, the agent captures a screenshot to see the current state of the screen:
    r = invoke(
        BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
        {"screenshot": {"format": "PNG"}},
        region=default_region, credentials=creds, browser_id=browser_id
    )
    # Send the screenshot to a vision model to identify the dialog and locate the Cancel button.
    # The vision model integration depends on your agent architecture — see the Bedrock
    # InvokeModel API for how to send images to Claude or other models.
    # The model returns coordinates, e.g.: {"x": 410, "y": 535}
The vision model identifies the print dialog and returns the coordinates of the **Cancel** button. The agent selects it:
    r = invoke(
        BEDROCK_AGENTCORE_DP_ENDPOINT, sid,
        {"mouseClick": {"x": 410, "y": 535, "button": "LEFT"}},
        region=default_region, credentials=creds, browser_id=browser_id
    )
    print(f"Click status: {r.status_code}, action: {r.json()['result']}")
The agent takes another screenshot to confirm that the dialog was dismissed, and the workflow continues.
## **Stop the session and clean up**
When the workflow is done, stop the session and clean up resources:
    stop_session(BEDROCK_AGENTCORE_DP_ENDPOINT, sid, browser_id, region=default_region, credentials=creds)
To delete the browser resource and IAM role:
    browser_boto3.delete_browser(browserId=browser_id)
    print(f"Browser {browser_id} deleted")
    from helpers.utils import delete_agentcore_execution_role, SAMPLE_ROLE_NAME
    delete_agentcore_execution_role(SAMPLE_ROLE_NAME)
These steps, act, observe, decide, form the core of the action-screenshot-reaction pattern. The [companion notebook](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions>) walks through eight supported actions with a live browser session, including mouse drag, scroll, keyboard input, and shortcut combinations.
## **Conclusion**
When we launched [Amazon Bedrock AgentCore Browser](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html>), it gave AI agents a fully managed, cloud-based browser environment to interact with websites. It navigated pages, extracted content, and automated workflows at scale through Playwright and CDP. OS Level Actions extend that capability beyond the web layer to UI elements visible on the screen. Native dialogs, security prompts, keyboard shortcuts, and browser chrome are no longer blockers. Agents can now observe, reason about, and act on the full OS desktop within the same session.
Combined with AgentCore Browser’s existing capabilities like visual understanding and framework integration with Playwright and Amazon Nova Act, OS Level Actions close the last gap in browser automation coverage.
To start building:
  * Follow the [Amazon Bedrock AgentCore Developer Guide](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html>)
  * Try the [companion notebook](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/05-AgentCore-tools/02-Agent-Core-browser-tool/14-browser-os-actions>) for a hands-on walkthrough
  * For broader context on browser automation, see the [Amazon Bedrock AgentCore Browser documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-quickstart.html>)
* * *
**About the authors**
### Evandro Franco
**Evandro Franco** is a Sr. Data Scientist working on Amazon Web Services. He is part of the Global GTM team that helps AWS customers overcome business challenges related to AI/ML on top of AWS, mainly on Amazon Bedrock AgentCore and Strands Agents. He has more than 18 years of experience working with technology, from software development, infrastructure, serverless, to machine learning. In his free time, Evandro enjoys playing with his son, mainly building some funny Lego bricks.
### Phelipe Fabres
**Phelipe Fabres** is a Sr. Solutions Architect for Generative AI at AWS for Startups. He is part of a global Frontier AI team with a focus on costumers that are building Foundation Models/LLMs/SLMs. Has extended work on Agentic systems and Software driven AI systems. He has more than 10 years of working with software development, from monolith to event-driven architectures with a Ph.D. in Graph Theory. In his free time, Phelipe enjoys playing with his daughter, mainly board games and drawing princess.
### Saurav Das
**Saurav Das** is part of the Amazon Bedrock AgentCore Product Management team. He has more than 15 years of experience in working with cloud, data and infrastructure technologies. He has a deep interest in solving customer challenges centered around data and AI infrastructure.
### Yanda Hu
**Yanda Hu** is a software engineer on the Amazon Bedrock AgentCore Engineering team with 5+ years of experience building machine learning and AI solutions at scale. He specializes in designing and delivering scalable agentic systems. He is passionate about the emerging agentic AI landscape, focusing on helping customers overcome real-world challenges in agentic workflows.
### Cristiano Scandura
**Cristiano** has been in the IT industry since 1998. He joined Amazon Web Services (AWS) in 2018, where he worked on projects for enterprise clients. Currently, he specializes in GenAI and machine learning (ML) projects for all industries in AWS Worldwide Public Sector.
### Joshua Samuel
**Joshua Samuel** is a Senior AI/ML Specialist Solutions Architect at AWS who accelerates enterprise transformation through AI/ML, and generative AI solutions, based in Melbourne, Australia. A passionate disrupter, he specializes in agentic AI and coding techniques – Anything that makes builders faster and happier. Outside work, he tinkers with home automation and AI coding projects, and enjoys life with his wife, kids and dog.