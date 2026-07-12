# Running an AI-native engineering org

## Ch01.050 Running an AI-native engineering org

> 📊 Level ⭐ | 7.9KB | `entities/running-an-ai-native-engineering-org.md`

# Running an AI-native engineering org

URL: https://claude.com/blog/running-an-ai-native-engineering-org

## 深度分析

### 1. AI-native 工程组织：从"用 AI"到"围绕 AI 组织"
AI-native 工程组织不是"现有团队用 AI 工具"，而是"围绕 AI 的能力和局限重新设计组织结构、流程和角色"。

### 2. 工程经理的新角色：AI 产出的质量守门人
AI 生成代码的速度远超人类审查速度——工程经理的核心挑战从"确保产出"转变为"确保 AI 产出的质量和安全性"。

### 3. 代码审查的规模化瓶颈
AI 可以在 1 小时内生成相当于 1 周的代码量，但代码审查仍然是人类瓶颈——需要引入 AI 辅助审查和分层审查策略。

## 实践启示

### 1. 引入 AI 审查作为第一道防线
AI 生成代码 → AI 自动审查 → 人类重点审查——三层审查模型解决规模化问题。

### 2. 重新定义工程师角色
从"写代码的人"转变为"引导 AI 写代码 + 审查 AI 产出 + 设计系统架构的人"。

### 3. 投资审查基础设施
审查工具（diff 可视化、AI 审查助手、自动测试）比写代码工具更重要。

## 相关实体
- [Cisco Preps For A World Of Ai Agent Coworkers Frontier Model Threats](ch01/035-cisco-preps-for-a-world-of-ai-agent-coworkers-frontier-mode.html)
- [How We Made Window Join Parallel And Vectorized](ch01/034-how-we-made-window-join-parallel-and-vectorized.html)
- [Products Are Out Brains Are In](ch01/133-products-are-out-brains-are-in.html)
- Investing In Stitch
- [Gemini 35 Flash More Expensive But Google Plan To Use It For Everything](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-35-flash-more-expensive-but-google-plan-to-use-it-for-everything.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/running-an-ai-native-engineering-org.md)

## 摘要

Published Time: Jun 03, 2026

Markdown Content:
[Video 4](https://www.youtube.com/watch?v=igO8iyca2_g)

For years, engineering bandwidth was the expensive part of building applications. Every process we used to have around software planning and shipping, first waterfall and then agile, was built around that cost.

I started my career in the early 2000s working on Visual Studio. In those days we shipped software on CD-ROMs with hard manufacturing deadlines. Once we could distribute software online, we began increasing to shipping updates continuously. Now we’re changing the way we work again, this time around the time and people it takes to write software.

On the Claude Code team, writing code, writing tests, and refactoring rarely slows us down anymore. But the bottlenecks didn’t go away when agentic coding took away the actual need to type code. Verification, code review, and security took their place.

We can all generate a lot of code really fast now, but this also brings up new questions: Is this code correct? How is it maintained? And one of the top questions I get from fellow engineering leaders: “How are humans keeping up with how you’re doing code reviews?”

## The processes that quietly stopped working

We all put processes in place for a reason, to close a gap or make something work better. But when that gap no longer exists and those processes become obsolete, they rarely go away on their own. When the Claude Code team began using agentic coding as our default way of working, a lot of our existing processes stopped working. Here are the norms we rewrote, and why.

### Planning: shift roadmaps to just in time

The old norm was to spend a lot more time pre-planning because coding time was expensive. When I first joined the Claude Code team, we wrote a pretty good six month roadmap, and then _because_ of Claude Code, so many things changed that it was out of date by month three.

Engineering speed and throughput is different now, so the way we plan sprints has changed. I call it just-in-time (JIT) planning, almost like JIT compiling: how do you do just the right amount at the right time? Our planning ritual shifted away from design docs toward discussions in PRs or prototypes. The space moves fast so we don’t do a lot of product reviews. Our process now is let's prototype, get a lot of internal users on it, and start acting on their feedback.

### Context gathering: ask Claude, not the author

When engineers wrote code, the first step to getting an answer to most questions was to find the person who wrote the code. Now, since all our PRs are assisted by Claude, "Who made this change?" is no longer sufficient. Our new norm is to go a level deeper: what do you actually need to know? For instance: Are you looking for who caused a regression? An expert to answer a customer question? Or context on a decision? You ask Claude that question, and consider whether Claude can answer it directly, also with more data and context.

On the Claude Code team, no matter what that question is, our process is to also ask “Is there a way to automate it?” For example, having Claude summarize customer feedback channels every morning went from a ritual I did manually with my coffee to something I just have running automatically in the background.

### Code review: trust but verify

We use [Code Review](https://code.claude.com/docs/en/code-review) heavily. Claude handles all the style and linting, PR feedback requests, catching bugs and fixing them before a full commit, and adding tests. Where we still definitely want a human is expertise.

The new norm is human review where it matters: for legal review, I always want my legal partner involved in risk tolerance. For trust boundaries and security-sensitive code, I want the domain experts. Product managers and designers also need to be involved with product sense and taste.

It’s important to continually evaluate, though, because the right balance of trust vs. verify will keep changing as the models improve. What you need humans for today might look different with the next model.

### Team makeup: blurring roles

Claude and AI have reshaped roles across the team. Our PMs code a lot now, which is fun to see. With Claude, you have nontraditional coders now being able to do more engineering, and you have engineers who take on things like content and design, work that were traditionally not on the technical side.

On the Claude Code engineering team, I’ve indexed heavily on two profiles. One is creative builders with product sense: the dreamers who are deeply curious and passionate about shipping products that solve problems. The other one is engineers with deep systems expertise. For example, when I joined the team, I noticed we were missing experts with systems backgrounds and we needed that when building [Claude Code on the Web](https://www.anthropic.com/news/claude-code-on-the-web), to ensure we can run Claude everywhere.

What I index on less, on the other hand, is raw thr

---

