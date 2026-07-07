# LLMReaper - DOM Based AI Conversation Exfiltration

## Ch01.657 LLMReaper - DOM Based AI Conversation Exfiltration

> 📊 Level ⭐⭐ | 6.7KB | `entities/llmreaper-dom-based-ai-exfiltration.md`

# LLMReaper - DOM Based AI Conversation Exfiltration

## 深度分析

Published Time: 2026-05-27T00:00:00.000Z

Markdown Content:
Every time someone pastes their code or config files into LLMs to debug something, or to review code, they assume the conversation stays between them and the AI.

But it doesn't.

Any extension installed in your browser can read that conversation. All of it and In real time without you knowing.

*   In December 2024 , a supply chain attack on the [Cyberhaven Chrome extension](https://www.darktrace.com/blog/cyberhaven-supply-chain-attack-exploiting-browser-extensions) and at least 34 others affected around 2.6 million users
*   In February 2025, [GitLab's threat intelligence](https://gitlab-com.gitlab.io/gl-security/security-tech-notes/threat-intelligence-tech-notes/malicious-browser-extensions-feb-2025/) team identified 16 malicious Chrome extensions impacting at least 3.2 million users
*   In April 2026, a coordinated campaign of over 100 malicious Chrome extensions was [found stealing Google OAuth2](https://www.rescana.com/post/over-100-malicious-chrome-extensions-in-chrome-web-store-steal-google-and-telegram-data-create-pers) Bearer tokens and Telegram sessions

As you can see malicious browser extensions remain a popular attack vector since the reach is massive and people are constantly looking for tools and utilities to make their work and life easier. But an average user is at high risk because escaping a supply chain attack is out of scope and social engineering is hard to beat.

When you install a browser extension and grant it access to a site, you're giving it the ability to read everything on that page. The DOM. The prompts we use and the responses we get are all part of the DOM and that's how it gets displayed.

Extensions use a standard browser API called `MutationObserver` to watch for changes in the DOM in real time. So when we send a prompt and get the response both events can be tracked using it. This is a normal feature but this helps lot of extensions function properly.

And the permissions required to do this? "read and change all your data on websites you visit". It looks normal and it is required by many legitimate extensions and majority of us allow it without thinking twice. Same permissions can be abused by a malicious extension in the background.

_Disclaimer : many parts of this PoC can be improved, also please excuse my javascript..._

When i thought about testing this I was assuming creating browser extensions must be difficult but to my surprise its not that hard and its kind of fun actually specially for someone who is into web development.

LLMReaper is a proof of concept which demonstrates how a malicious extension can look legitimate and social engineer users and in the background it can fetch conversations in real time without any indications.

Structure of LLMReaper is simple :

`.├── chrome_ext│   ├── manifest.json│   ├── popup.html│   ├── popup.js│   └── scripts│       ├── background.js│       └── content.js├── LICENSE├── llmreaper.py└── README.md`

It has two main parts, backend and the unpacked extension. For this PoC i created a chrome extension but with minor changes we can make a firefox extension as well both compliant with Manifest V3.

In the manifest we specify the content scripts and the service workers along with the permissions required by the extension. In this case however no permissions are needed.

`"action": {    "default_popup": "popup.html"  },"content_scripts": [    {      "js": ["scripts/content.js"],      "matches": [        "https://claude.ai/*",        "https://chatgpt.com/*",        "https://gemini.google.com/*"      ]    }  ],"background": {    "service_worker": "scripts/background.js",    "type": "module"  }`

When we click the extension icon we see a popup window, so as you might have guessed `popup.html` is the file where our extension _front-end_ lives. Here is an example of a legitimate _looking_ extension :

![Image 1: Figure 1 showing LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions written by thewhiteh4t](https://res.cloudinary.com/dg5ijxsap/image/upload/f_auto,q_auto/v1779859042/2026-05-27_10-45_tumxub.png)
Real magic happens inside the `content_scripts` this is where we use `MutationObserver` to watch DOM changes and parse it according to the platform we are targeting. For this PoC I added custom parsing for Claude, ChatGPT and Gemini, the big 3.

I have used various selector queries to match user prompts and LLM responses but the main challenge was detecting when the response completes since we see a streaming output in these platforms. We can't fire a capture query every few seconds because that would mean lot of duplicate and chunks of the response depending on the length, but all three platforms have a thing in common **the stop button**. It maintains its state until the response is completed and then changes so I used the stop button to track response completion and it was good enough for the PoC.

`const STOP_SIGNALS = {  ChatGPT: 'button[data-

## 相关实体
- [Llmreaper Dom Based Ai Conversation Exfiltration Via Browser](../ch12/017-llmreaper-dom-based-ai-conversation-exfiltration-via-brows.md)
- [Cloudflare Glasswing Mythos Security](https://github.com/QianJinGuo/wiki/blob/main/entities/cloudflare-glasswing-mythos-security.md)
- [Llm Raiders Private Ai Server](ch01/586-llm.md)
- [Trackingtamperedchefclustersviacertificateandcodereuse](https://github.com/QianJinGuo/wiki/blob/main/entities/trackingtamperedchefclustersviacertificateandcodereuse.md)
- [Amazon Bedrock Api Security Guide](../ch12/033-amazon-bedrock-api.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llmreaper-dom-based-ai-exfiltration.md)- [llmreaper - dom based ai conversation exfiltration via brows](../ch12/087-llmreaper.md)

---

