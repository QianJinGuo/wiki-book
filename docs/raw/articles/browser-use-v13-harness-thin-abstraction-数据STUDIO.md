---
title: "又一个 AI 浏览器自动化神器！browser-use v0.13 拆解：Browser Harness 薄抽象哲学"
source_url: "https://mp.weixin.qq.com/s/HPJ9UVntxvAaq03bJaoC0g"
source: "数据STUDIO（云朵君）"
author: "云朵君"
ingested: 2026-07-06
sha256: 5494252c9b594778ad23171e8d6f5f3e583abad7859253a93639982ccd76176e
---

**文章主旨**：对 browser-use v0.13.2 的架构拆解，核心观察是团队将上万行 DOM 处理代码替换为约 600 行 CDP 直连的 Browser Harness，因为 LLM 的训练数据中已包含大量 CDP 协议内容——薄抽象层比厚封装更有效。

**1. browser-use 概览**

从 2024 年开源至今，103k+ Star、318 位贡献者、2600+ 项目依赖。2026 年 6 月发布 v0.13.2，用 Rust 重写了核心运行时，同时推出 Browser Harness——仅约 600 行代码。PyPI 上已迭代 129 个版本。

5 行代码跑起来：
```python
from browser_use.beta import Agent, BrowserProfile, ChatBrowserUse
agent = Agent(task="...", llm=ChatBrowserUse(), browser_profile=BrowserProfile(headless=False))
history = await agent.run()
print(history.final_result())
```

**2. 范式切换：不是 Selenium 的升级版**

传统浏览器自动化痛点：找选择器 → 写 find_element → 跑 → 报错 → 加 time.sleep/WebDriverWait → 再跑 → 又报错。90% 时间花在和 DOM 结构斗智斗勇，页面一改版脚本就挂。

browser-use 的底层洞察：LLM 不需要你帮它找选择器。它在训练数据里已见过几百万字的网页结构和 HTML 语义。你说"点击搜索按钮"，它自己知道去找什么。传统工具的抽象层不是帮助，是障碍。

这不是 Selenium 升级版，是范式切换——从"人类写代码操控浏览器"到"人类描述目标，AI 自己决定每一步怎么操控浏览器"。

**3. 扔掉一万行代码，换六百行 CDP 直连**

v0.13 Browser Harness 仅四文件：
- run.py（~13 行）：入口点，预加载 helpers，执行用户代码
- helpers.py（~192 行）：薄 CDP 包装函数：goto_url()、click_at_xy()、type_text()、capture_screenshot()、js()、new_tab()——可在运行时被 Agent 编辑
- daemon.py（~220 行）：维护 CDP WebSocket 长连接，处理崩溃检测、重连、多实例命名空间
- SKILL.md（—）：LLM 的运行时指令：怎么用 helpers、优先坐标点击、跨域 iframe 处理

核心洞察：**LLM already knows CDP。** Chrome DevTools Protocol（Page.navigate、DOM.querySelector、Runtime.evaluate、Input.dispatchMouseEvent）这些命令名和参数格式，LLM 在训练数据中已见过几百万字。你给它 Playwright 的 page.click(selector)，它反而要经过一道"翻译"——多了一道翻译就多一出错可能。

坐标点击天然穿透 iframe 和 Shadow DOM：CDP 的 Input.dispatchMouseEvent 在浏览器的合成器层（compositor layer）执行坐标点击，不关心目标元素在哪个 frame、哪个 shadow root、哪个跨域边界。

**4. Agent 自己修好自己**

开发过程中发现一个 git diff：Agent 在执行"上传文件"任务时，扫描 helpers.py 发现没有 upload_file 函数——它没有报错，而是读了 helpers.py 的代码风格，用 DOM.setFileInputFiles 写了一个 upload_file()，保存到 helpers.py，调用它，继续执行任务。团队是在 review git diff 时才发现的。

还有一次，一个 12MB 文件超过 CDP WebSocket 消息大小限制（约 10MB），Agent 重写了上传逻辑为分块传输。

这不是预编程的容错机制——没有人写"如果缺 upload_file 就生成"。这是 LLM + 薄抽象层的涌现行为：当 Agent 可以直接看到和修改它自己的工具代码时，它的"调试能力"被释放了出来。

**5. Agent 四步循环**

Observe（观察）→ Decide（决策）→ Act（执行）→ Verify（验证）

- Observe：默认模式截图+页面信息。use_vision 参数控制：auto（需要时截图）、true（每步截图）、false（只看 DOM 文本）
- Decide：一次输出最多 3 个动作。动作类型：导航、页面交互、JS 执行、标签页管理、内容提取、文件操作、下拉菜单、截图
- Act：通过 CDP 执行。坐标点击通过 Input.dispatchMouseEvent 在合成器层完成，穿透一切
- Verify：截图确认。paint_order_filtering 做 DOM 树优化

**6. Benchmark 数据**

| 模型 | WebVoyager 成功率 | 备注 |
|------|-------------------|------|
| ChatBrowserUse (bu-ultra) | 78.0% | 云端最强，快 3-5 倍 |
| OSS + BU LLM 混合 | 63.3% | 开源+云端模型 |
| Claude Opus 4.6 | 62.0% | — |
| Gemini 3.1 Pro | 59.3% | — |
| Claude Sonnet 4.6 | 59.0% | — |
| GPT-5 | 52.4% | — |
| GPT-5 Mini | 37.0% | — |

**7. 适用场景**

该用：复杂多步 Web 操作、页面结构不确定、需要适应改版、探索性调研
不该用：简单爬虫或固定表单（传统 Playwright 更快更确定）、低延迟要求、成本敏感的批量任务

| 维度 | 开源版 | 云端版 (ChatBrowserUse) |
|------|--------|----------------------|
| 成功率 | 取决于 LLM | bu-ultra: 78% |
| 隐蔽性 | 需要自己配代理 | 内置代理轮换+反检测 |
| 验证码 | 需第三方集成 | 内置处理能力 |
| 集成 | 自己开发 | 1000+ 预置集成 |
| 扩展性 | 自己管理浏览器实例 | 自动扩展 |
| 价格 | 只付 LLM API 费 | $0.20/$2.00 每百万 token |

**8. 代码工程美学**

browser-use 的设计选择挑战了一个假设：更好的 AI 工具 = 更完善的 API 封装。

实验结果指向相反：在 browser-use 这个案例范围内，抽象层越薄，LLM 表现越好。因为 LLM 的训练数据里有海量的 CDP 协议文档——它"本来就会"。你给它更厚的抽象层，它反而要多一道"翻译"。

Browser Harness 的 600 行能替代一万行，不是因为它更聪明，是因为它信任 LLM 的能力——把 LLM 当作一个已经懂浏览器协议的工程师。

适合用薄抽象的：需要判断力的任务（"这个按钮是不是我要点的"、"数据应该怎么归类"）。适合用传统脚本的：简单、重复、确定性的任务。
