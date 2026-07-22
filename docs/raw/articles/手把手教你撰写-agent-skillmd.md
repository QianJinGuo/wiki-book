---
title: "手把手教你撰写 Agent Skill.md"
source: wechat
url: https://mp.weixin.qq.com/s/ZcHtJH5eT76f8agSvo3HYQ
ingest_date: 2026-07-04
vxc: 56
stars: 4
sha256: 547cbde32dac238216ea3723aa83bcfe8ef586da5cb2c86d8b522c366d94dc91
---

# 手把手教你撰写 Agent Skill.md

**来源**: 数据STUDIO

**发布日期**: 2026-04-10

**原文链接**: https://mp.weixin.qq.com/s/ZcHtJH5eT76f8agSvo3HYQ

---

还在为AI助手不懂你的业务场景而头疼？一个轻量级的技能包，就能让通用模型听懂你的“黑话”

“帮我处理一下这个PDF表单，提取里面的订单信息，然后合并成一份报告。”

当你向AI助手提出这样的需求时，它可能会手忙脚乱地尝试各种库，或者干脆告诉你“我做不到”。但你有没有想过，如果能给AI一份“操作手册”，告诉它“用这个工具，按这个步骤，注意这个坑”，它就能轻松搞定？

这就是 Agent Skills 要做的事情。

想象一下，你的AI助手就像一个刚入职的新员工。他聪明、学习能力强，但不知道你们公司的业务流程、代码规范、以及那些只有老员工才知道的“潜规则”。Skills，就是一份 岗位职责说明书+操作SOP+避坑指南 的合集。

本文将深入拆解Agent Skills这个轻量级的开放格式，从原理到实践，再到如何评估和增强技能，教你如何让通用大模型秒变你的领域专家。

## 到底什么是Agent Skills？

从本质上讲，一个Skill就是一个文件夹。这个文件夹里最关键的文件是一个叫  SKILL.md  的文件。它就像一份“任务说明书”，里面不仅告诉AI这个技能是干嘛的（元数据），还详细描述了“怎么做”（操作指令）。

一个典型的Skill目录结构长这样：

my-skill/  
├── SKILL.md          # 必须：包含元数据和核心指令  
├── scripts/          # 可选：可执行脚本（Python/Bash等）  
├── references/       # 可选：参考文档（API说明、详细指南等）  
└── assets/           # 可选：静态资源（模板、图片等）

你可能会问：“这和直接把所有东西塞进Prompt里有什么区别？”区别大了！这就涉及到了Agent Skills的核心设计哲学—— 渐进式披露 。

## 渐进式披露：像外卖骑手一样高效

“渐进式披露”这个概念听起来很玄乎，但你可以把它想象成外卖骑手接单的过程：

- 第一步：发现 🚴‍♂️ 

   外卖平台打开时，骑手（AI）只会看到所有可接订单的 概要信息 ：比如“XX餐厅的订单，距离2公里，预计收入8元”。这对应Skill的  name  和  description  字段。系统只加载这些轻量信息，来判断是否与该任务相关。

- 第二步：激活 ✅ 

   当骑手看到这个订单并决定接单时，他才会点进去，看到 完整的订单详情 ：具体菜品、客户地址、备注要求（“不要香菜”）。这就对应当Agent发现某个任务匹配Skill的描述时，它会将完整的  SKILL.md  文件加载到上下文中。

- 第三步：执行 🏃‍♂️ 

   骑手根据详细地址出发，必要时查看地图（参考文件）或者联系客户（执行脚本）。这对应Agent按照Skill的指令，按需加载  references/  中的文档或执行  scripts/  里的代码。

这种设计的好处显而易见：AI的“大脑”（上下文窗口）不会被所有Skill的细节塞满，只有在需要时才会加载必要的信息，从而保持思考速度，且能应对更复杂的任务。

## SKILL.md 文件长什么样？

这是Skill的核心。它由两部分组成： YAML 前置元数据 和 Markdown 正文 。

---  
name: pdf-processing  
description: 从PDF中提取文本和表格、填写表单、合并文件。当用户需要处理PDF文档时使用此技能。  
license: Apache-2.0  
metadata:  
  author: your-team  
  version: "1.0"  
---  

# PDF 处理技能  

## 何时使用此技能  
当用户提到“PDF”、“表单”、“提取文本”等关键词时，应激活此技能...  

## 如何提取文本  
1. 使用 `pdfplumber` 库进行文本提取，这是首选方案。  
2. 对于扫描件（无法直接提取文本），需回退到 `pdf2image` + `pytesseract` 进行OCR识别...  

## 常见坑点（Gotchas）  
- ⚠️ 注意：部分PDF文件是扫描生成的，直接使用 `pdfplumber` 会得到空结果。此时必须判断文件是否包含文本层，若无，则自动切换到OCR流程。  
- 填写表单时，务必先运行 `scripts/analyze_form.py` 获取所有字段列表，不要凭猜测填写。

### 元数据字段详解

字段
是否必须
说明

name
是
技能标识符。只能包含小写字母、数字和连字符(-)，不超过64字符。 必须与父目录名一致 。

description
是
核心！用于告诉Agent“何时使用”。要包含关键词，描述做什么和什么时候用。 最多1024字符 。

license
否
许可证信息。

compatibility
否
环境要求。如“需要 Python 3.10+ 和 uv 包管理器”。

metadata
否
自定义键值对，用于额外元数据。

allowed-tools
否
（实验性）允许技能使用的预批准工具列表。

⚠️ 注意：这里90%的人会踩坑 

description  字段非常关键。如果描述不准确或不包含关键词，Agent根本不会激活你的Skill，写得再好也没用。例如，  “处理PDF”  远不如  “从PDF中提取文本、填写表单、合并文件。当用户需要处理PDF文档时使用此技能。”  有效。

## 实战：如何写出一个高质量的Skill？

光知道格式还不够，怎么写才能让AI真正用起来？这里有几个来自官方的最佳实践，非常值得借鉴。

### 1. 从真实经验中提炼，而非凭空想象

很多人写Skill时，会依赖AI自己的“常识”，结果写出一堆废话。比如“处理错误”、“遵循最佳实践”这种空话。真正有价值的Skill，来源于你的 真实项目经验 。

怎么做？ 

 你可以先和AI协作完成一个任务，在对话中不断提供上下文、纠正错误、强调偏好。然后，把这个过程中的成功步骤、你的修正、输入输出格式，提炼成Skill。

或者，从你的项目文档中“喂”给AI来生成。比如，把你团队的 事故复盘报告 、 API设计规范 、 代码审查意见 喂给AI，让它帮你提炼出“代码审查”Skill，这样的Skill会包含你们项目特有的错误模式，远比通用版本强。

### 2. 像写函数一样设计Skill的边界

Skill的边界要清晰。它应该像函数一样，完成一个“连贯的工作单元”。

- 范围过小
  ：一个任务需要激活多个Skill，增加开销，且指令可能冲突。

- 范围过大
  ：激活条件难以精准，容易误触发，且内部指令臃肿。

比如，一个“查询数据库并格式化结果”的技能是合理的。但如果这个技能还试图管理数据库集群，那就太“胖”了。

### 3. 写“方法”而不是“答案”

Skill应该教会AI 如何思考 ，而不是给出一个特定问题的答案。这样它才能举一反三。

<!-- 糟糕：只适用于这一个场景 -->  
将 `orders` 表与 `customers` 表在 `customer_id` 上关联，筛选 `region = 'EMEA'`，并求和 `amount` 列。  

<!-- 优秀：可复用的方法 -->  
1. 从 `references/schema.yaml` 读取数据库Schema，找到相关表。  
2. 按照 `_id` 外键约定关联表。  
3. 根据用户请求，使用 `WHERE` 子句应用筛选条件。  
4. 按需聚合数值列，最终以Markdown表格输出。

### 4. 预设“默认值”，而不是提供“菜单”

当有多种工具可选时，直接给出你的推荐，而不是罗列所有选项。这能显著减少AI犹豫不决的时间。

<!-- 太多选项，AI会困惑 -->  
你可以使用 pypdf, pdfplumber, PyMuPDF 或 pdf2image...  

<!-- 明确的默认方案，加上备选方案 -->  
使用 `pdfplumber` 进行文本提取：  
```python  
import pdfplumber

如果遇到无法提取文本的扫描件，再回退到  pdf2image  配合  pytesseract  。

### 5. 必杀技：“坑点（Gotchas）”章节  

这是最有价值的内容。把那些“只有踩过坑才知道”的细节写下来。AI不会知道你们公司数据库的 `users` 表使用了软删除（`deleted_at IS NULL`），除非你明确告诉它。  

```markdown  
## 坑点（Gotchas）  

- `users` 表使用了软删除。所有查询必须包含 `WHERE deleted_at IS NULL`，否则结果会包含已注销的账户，导致数据错误。  
- 用户ID在数据库中是 `user_id`，在认证服务中是 `uid`，在计费API中是 `accountId`。它们都指代同一个值，但字段名不同。  
- `/health` 端点只要Web服务器在运行就会返回200，即使数据库已宕机。请使用 `/ready` 端点来检查服务的完整健康状态。

### 6. 提供输出模板和检查清单

当需要AI输出特定格式时，直接给它一个模板。这比用自然语言描述要可靠得多。

## 报告结构  

请使用此模板生成最终报告：  

```markdown  
# [分析标题]  

## 执行摘要  
[关键发现的一段落概述]  

## 主要发现  
- 发现1，附上数据支撑  
- 发现2，附上数据支撑  

## 建议  
1. 具体、可执行的建议  
2. 具体、可执行的建议

对于多步骤流程，一个显式的检查清单可以帮助AI跟踪进度，避免遗漏关键步骤。  

```markdown  
## 表单处理工作流  

进度跟踪：  
- [ ] 步骤1：分析表单（运行 `scripts/analyze_form.py`）  
- [ ] 步骤2：创建字段映射（编辑 `fields.json`）  
- [ ] 步骤3：验证映射（运行 `scripts/validate_fields.py`）  
- [ ] 步骤4：填写表单（运行 `scripts/fill_form.py`）  
- [ ] 步骤5：验证输出（运行 `scripts/verify_output.py`）

## 如何让你的Skill被AI“看”到？

写好了Skill，但AI助手就是不用，怎么办？问题很可能出在  description  上。

Agent在启动时，只会加载所有Skill的  name  和  description  ，来判断“这个任务，要不要用这个Skill？”。如果描述不准确，Skill就永远躺在角落里吃灰。

这里有一个 优化  description  的系统性方法 ：

- 设计测试用例
   ：准备20个左右的提示词，其中一半应该触发该Skill，一半不应该触发。

- 运行测试
   ：用一个脚本让AI处理这些提示词，并记录它是否激活了你的Skill。注意，AI的输出有随机性，所以每个测试用例最好运行3次以上，取触发概率。

- 

分析并优化
   ：

- 

如果“应该触发”的用例没触发，说明你的描述
  太窄
  了。可以拓宽范围，或者补充更多关键词。

- 

如果“不应该触发”的用例触发了，说明你的描述
  太宽
  了。需要增加特异性，明确边界。

- 

迭代
   ：不断重复这个过程，直到通过率满意为止。

一个糟糕的描述 vs. 一个优秀的描述：

# 糟糕：范围太窄，关键词太少  
description: 处理CSV文件。  

# 优秀：范围清晰，关键词丰富，明确边界  
description: >  
  分析CSV和表格数据——计算摘要统计、添加派生列、生成图表、清理脏数据。  
  当用户有CSV、TSV或Excel文件，并想探索、转换或可视化数据时使用此技能，  
  即使他们没有明确提到“CSV”或“分析”。

## 评估：你的Skill真的有效吗？

你写了一个Skill，试了一个提示词，它看起来有效。但它在各种提示词下、在边缘情况下、在 没有 这个Skill的情况下，表现如何？运行结构化评估（evals）能回答这些问题，并为你提供一个系统性的改进反馈循环。

### 设计测试用例

一个测试用例包含三个部分：

- 提示词
  ：一个真实的用户消息——用户真正会输入的那种。

- 预期输出
  ：对成功样貌的人类可读描述。

- 输入文件
  （可选）：Skill工作时需要的文件。

你可以在Skill目录中创建一个  evals/evals.json  文件来存储它们：

{  
  "skill_name": "csv-analyzer",  
"evals": [  
    {  
      "id": 1,  
      "prompt": "我有一份月度销售数据的CSV文件，在 data/sales_2025.csv。你能找出收入最高的3个月并画一个柱状图吗？",  
      "expected_output": "一张柱状图图片，显示收入最高的3个月，坐标轴和数值都有标签。",  
      "files": ["evals/files/sales_2025.csv"]  
    },  
    {  
      "id": 2,  
      "prompt": "我下载目录里有个 customers.csv，有些行缺了邮箱——你能清理一下并告诉我缺了多少个吗？",  
      "expected_output": "一个清理后的CSV文件，处理了缺失的邮箱，并统计了缺失的数量。",  
      "files": ["evals/files/customers.csv"]  
    }  
  ]  
}

编写好测试提示词的技巧：

- 从2-3个测试用例开始
  。在还没看到第一轮结果前，不要投入太多。

- 变化提示词
  。使用不同的措辞、详细程度和正式程度。有些提示词可以很随意（“嘿，能帮我清理下这个CSV吗？”），有些则更精确（“解析 data/input.csv，删除B列为空的行，将结果写入 data/output.csv”）。

- 覆盖边缘情况
  。至少包含一个测试边界条件的提示词——比如一个格式错误的输入、一个不寻常的请求，或者Skill指令可能产生歧义的情况。

- 使用真实的上下文
  。真实的用户会提到文件路径、列名和个人背景。像“处理这个数据”这样模糊的提示词测试不出什么。

### 运行评估

核心模式是对每个测试用例运行两次：一次 带着Skill ，一次 不带Skill （或者使用旧版本）。这给了你一个可以对比的基线。

组织你的工作空间：

csv-analyzer/  
├── SKILL.md  
└── evals/  
    └── evals.json  
csv-analyzer-workspace/  
└── iteration-1/  
    ├── eval-top-months-chart/  
    │   ├── with_skill/  
    │   │   ├── outputs/       # 运行产生的文件  
    │   │   ├── timing.json    # Token数和耗时  
    │   │   └── grading.json   # 断言结果  
    │   └── without_skill/  
    │       ├── outputs/  
    │       ├── timing.json  
    │       └── grading.json  
    ├── eval-clean-missing-emails/  
    │   ├── with_skill/  
    │   │   ├── outputs/  
    │   │   ├── timing.json  
    │   │   └── grading.json  
    │   └── without_skill/  
    │       ├── outputs/  
    │       ├── timing.json  
    │       └── grading.json  
    └── benchmark.json         # 汇总统计数据

### 编写断言

断言是关于输出应该包含什么或达成什么的可验证陈述。在你看过第一轮输出后再添加它们——通常直到Skill运行过后你才知道“好”是什么样子。

好的断言：

- “输出文件是有效的 JSON”
  —— 可编程验证。

- “柱状图有坐标轴标签”
  —— 具体且可观察。

- “报告包含至少3条建议”
  —— 可计数。

弱的断言：

- “输出很好”
  —— 太模糊，无法评分。

- “输出准确使用了‘总收入：$X’这个短语”
  —— 太脆弱，正确的输出用不同措辞就会失败。

不是所有东西都需要断言。有些品质——写作风格、视觉设计、输出“感觉是否对”——很难分解成通过/失败检查。这些更适合在人工审查中捕捉。把断言留给那些可以客观检查的事情。

向  evals/evals.json  中的每个测试用例添加断言：

{  
  "skill_name": "csv-analyzer",  
"evals": [  
    {  
      "id": 1,  
      "prompt": "我有一份月度销售数据的CSV文件，在 data/sales_2025.csv。你能找出收入最高的3个月并画一个柱状图吗？",  
      "expected_output": "一张柱状图图片，显示收入最高的3个月，坐标轴和数值都有标签。",  
      "files": ["evals/files/sales_2025.csv"],  
      "assertions": [  
        "输出包含一张柱状图图片文件",  
        "图表恰好显示了3个月",  
        "两个坐标轴都有标签",  
        "图表的标题或说明提到了收入"  
      ]  
    }  
  ]  
}

### 评分

评分意味着根据实际输出来评估每个断言，并记录 通过 或 失败 及具体证据。证据应该引用或参考输出，而不仅仅是陈述观点。

最简单的方法是把输出和断言给一个LLM，让它评估每一条。对于那些可以用代码检查的断言（有效的JSON、正确的行数、文件存在且尺寸符合预期），使用验证脚本——脚本对机械性检查更可靠，且可在迭代中复用。

{  
  "assertion_results": [  
    {  
      "text": "输出包含一张柱状图图片文件",  
      "passed": true,  
      "evidence": "在outputs目录找到 chart.png (45KB)"  
    },  
    {  
      "text": "图表恰好显示了3个月",  
      "passed": true,  
      "evidence": "图表显示了3月、7月和11月的柱状图"  
    },  
    {  
      "text": "两个坐标轴都有标签",  
      "passed": false,  
      "evidence": "Y轴有'收入 ($)'标签，但X轴没有标签"  
    },  
    {  
      "text": "图表的标题或说明提到了收入",  
      "passed": true,  
      "evidence": "图表标题写着'收入最高的3个月'"  
    }  
  ],  
"summary": {  
    "passed": 3,  
    "failed": 1,  
    "total": 4,  
    "pass_rate": 0.75  
  }  
}

评分原则：

- 要求通过时有具体证据。
  不要给“可能性”加分。如果断言说“包含摘要”，而输出有一个“摘要”部分，里面只有一句模糊的话，那就是
  失败
  ——标签在那儿，但实质内容没有。

- 审视断言本身，而不仅仅是结果。
  评分时注意那些太容易（不管Skill质量如何总是通过）、太难（即使输出很好也总是失败）或无法验证（仅从输出无法检查）的断言。在下一轮迭代中修复它们。

💡 小提示 

 要比较两个Skill版本，试试 盲测 ：将两个输出交给一个LLM裁判，不透露哪个来自哪个版本。裁判根据它们自己的标准来评估整体品质——组织、格式、可用性、精细度——这样就不会有“哪个版本应该更好”的偏见。这可以补充断言评分：两个输出可能都通过了所有断言，但在整体质量上存在显著差异。

### 聚合结果

一旦本轮所有运行都评分完毕，为每种配置计算汇总统计数据，并将它们保存到  benchmark.json  中：

{  
  "run_summary": {  
    "with_skill": {  
      "pass_rate": { "mean": 0.83, "stddev": 0.06 },  
      "time_seconds": { "mean": 45.0, "stddev": 12.0 },  
      "tokens": { "mean": 3800, "stddev": 400 }  
    },  
    "without_skill": {  
      "pass_rate": { "mean": 0.33, "stddev": 0.10 },  
      "time_seconds": { "mean": 32.0, "stddev": 8.0 },  
      "tokens": { "mean": 2100, "stddev": 300 }  
    },  
    "delta": {  
      "pass_rate": 0.50,  
      "time_seconds": 13.0,  
      "tokens": 1700  
    }  
  }  
}

delta  告诉你Skill的代价（更多时间、更多Token）和它的收益（更高的通过率）。一个增加13秒但将通过率提高50个百分点的Skill可能是值得的。一个Token用量翻倍但只换来2个百分点提升的Skill可能就不太值。

### 分析模式

聚合统计数据可能隐藏重要的模式。计算完基准后：

- 移除或替换那些在两种配置下
  总是通过
  的断言。
  这些断言告诉你没有有用信息——没有Skill模型也能处理。它们会抬高带Skill的通过率，而没有反映实际的Skill价值。

- 调查那些在两种配置下
  总是失败
  的断言。
  要么断言本身有问题（要求模型做不到的事），要么测试用例太难，要么断言在检查错误的东西。在下一轮迭代前修复它们。

- 研究那些带Skill时通过但不带Skill时失败的断言。
  这就是Skill明显增加价值的地方。理解
  为什么
  ——是哪些指令或脚本起了作用？

- 当结果在运行间不一致时，收紧指令。
  如果同一个评估有时通过有时失败（在基准中表现为高标准差），可能是因为评估本身不稳定（对模型随机性敏感），或者Skill的指令足够模糊，以至于模型每次解读都不同。添加示例或更具体的指导来减少模糊性。

- 检查时间和Token异常值。
  如果某个评估花费的时间是其他评估的3倍，阅读它的执行日志（模型在运行期间做的完整记录）以找到瓶颈。

### 用人工审查结果

断言评分和模式分析能捕捉很多问题，但它们只检查了你想过要写断言的东西。人工审查者带来新视角——捕捉你未曾预料到的问题，注意到输出技术上正确但没抓住重点的情况，或者发现难以表达为通过/失败检查的问题。对每个测试用例，审查实际输出和评分。

为每个测试用例记录具体反馈，并将其保存在工作空间中（例如，与评估目录并列的  feedback.json  ）：

{  
  "eval-top-months-chart": "图表缺少坐标轴标签，月份是按字母顺序而不是时间顺序排列的。",  
  "eval-clean-missing-emails": ""  
}

“图表缺少坐标轴标签”是可操作的；“看起来不好”则不是。空反馈意味着输出看起来没问题——那个测试用例通过了你的审查。在迭代Skill时，把你的改进集中在有具体问题的测试用例上。

### 迭代Skill

在评分和审查之后，你有三个信号来源：

- 失败的断言
  指向具体的差距——缺失的步骤、不清晰的指令，或Skill不处理的情况。

- 人工反馈
  指向更广泛的质量问题——方法不对、输出结构差，或Skill产生了技术上正确但无帮助的结果。

- 执行日志
  揭示了
  为什么
  出错。如果Agent忽略了某个指令，该指令可能模糊不清。如果Agent在无用的步骤上花了时间，这些指令可能需要简化或移除。

将这些信号转化为Skill改进的最有效方法是把三者——连同当前的  SKILL.md  ——交给一个LLM，让它提出修改建议。LLM可以综合失败断言、审查者抱怨和执行日志行为中的模式，这些手动连接会很繁琐。在提示LLM时，包含这些指导原则：

- 从反馈中泛化。
  Skill将用于许多不同的提示词，而不仅仅是测试用例。修复应从根本上解决广泛的问题，而不是为特定例子添加狭隘的补丁。

- 保持Skill精简。
  更少、更好的指令往往胜过详尽的规则。如果日志显示有浪费的工作（不必要的验证、不需要的中间输出），移除那些指令。如果尽管增加了更多规则，通过率仍停滞不前，Skill可能被过度约束了——尝试移除一些指令，看看结果是否保持或改善。

- 解释为什么。
  基于推理的指令（“做X是因为Y往往导致Z”）比僵化的指令（“总是做X，永远不要做Y”）效果更好。模型在理解目的时能更可靠地遵循指令。

- 打包重复工作。
  如果每次测试运行都独立编写了类似的辅助脚本（一个图表生成器、一个数据解析器），这是一个信号，表明应该将该脚本打包进Skill的
  scripts/
  目录。

循环：

- 将评估信号和当前的
   SKILL.md
   交给一个LLM，让它提出改进建议。

- 审查并应用更改。

- 在一个新的
   iteration-<N+1>/
   目录下重新运行所有测试用例。

- 评分并聚合新结果。

- 用人工审查。重复。

当你对结果满意、反馈一直为空，或迭代间不再有显著改进时，就可以停止了。

## 为Skill编写脚本：从一次性命令到可复用逻辑

Skill可以指导Agent运行Shell命令，并在  scripts/  目录中打包可复用的脚本。这一节涵盖一次性命令、自带依赖的自包含脚本，以及如何为Agentic使用设计脚本接口。

### 一次性命令

当现有的包已经做了你需要的事，你可以直接在  SKILL.md  指令中引用它，而不需要  scripts/  目录。许多生态系统提供在运行时自动解析依赖关系的工具。

这里有几个常用的工具：

工具
说明
示例

uvx
运行Python包，在隔离环境中，带积极缓存。与 uv [1] 一同提供。需要单独安装。
uvx ruff@0.8.0 check .

pipx
在隔离环境中运行Python包。可通过OS包管理器获取。是 uvx 的成熟替代品。
pipx run 'black==24.10.0' .

npx
运行npm包，按需下载。与npm（与Node.js一起提供）一同提供。
npx eslint@9 --fix .

bunx
Bun版本的 npx 。与 Bun [2] 一同提供。
bunx eslint@9 --fix .

deno run
直接从URL或说明符运行脚本。与 Deno [3] 一同提供。
deno run npm:create-vite@6 my-app

go run
编译并运行Go包。内置在 go 命令中。
go run golang.org/x/tools/cmd/goimports@v0.28.0 .

在Skill中使用一次性命令的技巧：

- 固定版本
  （例如
  npx eslint@9.0.0
  ），确保命令在不同时间行为一致。

- 在
  SKILL.md
  中说明前提条件
  （例如“需要 Node.js 18+”），而不是假设Agent的环境就有。对于运行时级别的需求，使用
  compatibility
  前置元数据字段)。

- 把复杂的命令移到脚本中。
  一次性命令适合用几个标志调用一个工具。当命令变得复杂到难以一次做对时，一个经过测试的
  scripts/
  中的脚本更可靠。

### 从 SKILL.md 引用脚本

使用 从Skill目录根开始的相对路径 来引用打包的文件。Agent会自动解析这些路径——不需要绝对路径。

在你的  SKILL.md  中列出可用的脚本，让Agent知道它们存在：

## 可用脚本  

- `scripts/validate.sh` — 验证配置文件  
- `scripts/process.py` — 处理输入数据

然后指导Agent运行它们：

## 工作流  

1. 运行验证脚本：  
   ```bash  
   bash scripts/validate.sh "$INPUT_FILE"  
   ```  

2. 处理结果：  
   ```bash  
   python3 scripts/process.py --input results.json  
   ```

注意 ：同样的相对路径约定也适用于  references/.md  等支持文件——脚本执行路径（在代码块中）相对于 Skill目录根 ，因为Agent是从那里运行命令的。

### 自包含脚本

当你需要可复用的逻辑时，在  scripts/  中打包一个声明自己依赖的脚本。Agent可以用一个命令运行它——不需要单独的清单文件或安装步骤。

Python（PEP 723） ：使用  # /// script  标记内的TOML块声明依赖：

# /// script  
# dependencies = [  
#   "beautifulsoup4",  
# ]  
# ///  

from bs4 import BeautifulSoup  

html = '<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>'  
print(BeautifulSoup(html, "html.parser").select_one("p.info").get_text())

用 uv 运行：

uv run scripts/extract.py

Deno ：Deno的  npm:  和  jsr:  导入说明符默认使每个脚本自包含：

#!/usr/bin/env -S deno run  

import  as cheerio from "npm:cheerio@1.0.0";  

const html = `<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>`;  
const $ = cheerio.load(html);  
console.log($("p.info").text());

deno run scripts/extract.ts

Bun ：当没有找到  node_modules  目录时，Bun会在运行时自动安装缺失的包。在导入路径中直接固定版本：

#!/usr/bin/env bun  

import  as cheerio from "cheerio@1.0.0";  

const html = `<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>`;  
const $ = cheerio.load(html);  
console.log($("p.info").text());

bun run scripts/extract.ts

Ruby ：使用  bundler/inline  直接在脚本中声明gems：

require 'bundler/inline'  

gemfile do  
  source 'https://rubygems.org'  
  gem 'nokogiri'  
end  

html = '<html><body><h1>Welcome</h1><p class="info">This is a test.</p></body></html>'  
doc = Nokogiri::HTML(html)  
puts doc.at_css('p.info').text

ruby scripts/extract.rb

### 为Agentic使用设计脚本

当Agent运行你的脚本时，它通过读取stdout和stderr来决定下一步做什么。一些设计选择能让脚本对Agent来说更容易使用。

避免交互式提示 。这是Agent执行环境的一个硬性要求。Agent在非交互式Shell中运行——它们不能响应TTY提示、密码对话框或确认菜单。一个阻塞等待输入的脚本会无限期挂起。

# 糟糕：等待输入时会挂起  
$ python scripts/deploy.py  
目标环境：_  

# 好：清晰的错误和指导  
$ python scripts/deploy.py  
错误：--env 是必需的。选项：development, staging, production。  
用法：python scripts/deploy.py --env staging --tag v1.2.3

用  --help  记录用法 。  --help  输出是Agent学习你脚本接口的主要方式。包含简要描述、可用标志和使用示例：

用法：scripts/process.py [选项] 输入文件  

处理输入数据并生成摘要报告。  

选项：  
  --format 格式    输出格式：json, csv, table（默认：json）  
  --output 文件    将输出写入文件而非stdout  
  --verbose        向stderr打印进度  

示例：  
  scripts/process.py data.csv  
  scripts/process.py --format csv --output report.csv data.csv

保持简洁——输出会进入Agent的上下文窗口，和它正在处理的其他所有东西一起。

编写有帮助的错误消息 。当Agent收到错误时，消息直接影响它的下一步尝试。模糊的“错误：无效输入”浪费一次尝试。相反，说明哪里错了，期望什么，以及可以尝试什么：

错误：--format 必须是以下之一：json, csv, table。  
       收到："xml"

使用结构化输出 。优先选择结构化格式——JSON、CSV、TSV——而不是自由文本。结构化格式可以被Agent和标准工具（  jq  、  cut  、  awk  ）使用，使你的脚本在管道中可组合。

# 空白对齐——难以编程解析  
NAME          STATUS    CREATED  
my-service    running   2025-01-15  

# 有分隔符——明确的字段边界  
{"name": "my-service", "status": "running", "created": "2025-01-15"}

将数据与诊断信息分离 ：将结构化数据发送到stdout，将进度消息、警告和其他诊断信息发送到stderr。这让Agent可以捕获干净的、可解析的输出，同时仍然可以在需要时访问诊断信息。

进一步考虑 ：

- 幂等性
  。Agent可能会重试命令。“如果不存在则创建”比“创建，重复时失败”更安全。

- 输入约束
  。用清晰的错误拒绝模糊的输入，而不是猜测。尽可能使用枚举和封闭集。

- 空运行支持
  。对于有破坏性或状态性的操作，一个
  --dry-run
  标志让Agent可以预览将要发生什么。

- 有意义的退出码
  。为不同的失败类型使用不同的退出码（未找到、参数无效、认证失败），并在
  --help
  输出中记录，以便Agent知道每个代码的含义。

- 安全的默认值
  。考虑破坏性操作是否需要显式的确认标志（
  --confirm
  、
  --force
  ）或与风险级别相适应的其他保护措施。

- 可预测的输出大小
  。许多Agent工具会自动截断超过阈值（如10-30K字符）的工具输出，可能丢失关键信息。如果你的脚本可能产生大量输出，默认输出摘要或合理限制，并支持
  --offset
  等标志，以便Agent在需要时请求更多信息。或者，如果输出很大且不适合分页，要求Agent传递一个
  --output
  标志来指定输出文件或
  -
  显式选择输出到stdout。

## 写在最后

Agent Skills 是一种非常优雅的“技能封装”范式。它不改变模型本身，而是通过 结构化的上下文注入 ，让通用模型在特定领域瞬间变得专业、可靠。

它的核心理念——“渐进式披露”——不仅适用于AI Agent，对我们人类开发者同样有启发。写代码、写文档、甚至做PPT，都应该遵循“先给概要，按需深入”的原则，这才是高效协作的本质。

现在，你可以试着从你手头最繁琐、最重复的工作入手，把解决它的流程、工具、坑点，整理成一个Skill。然后，通过评估和迭代，让它真正成为你AI助手的“肌肉记忆”。你会发现，这不仅是给AI写说明书，更是对自己知识的又一次深度梳理。

你在开发过程中，最希望AI能学会的“坑点”或“内部规范”是什么？或者，如果让你为自己的团队写一个Skill，你会从哪个痛点开始？欢迎在评论区分享你的想法。

参考资料

[1]

uv:  https://docs.astral.sh/uv/

[2]

Bun:  https://bun.sh/

[3]

Deno:  https://deno.com/

🏴‍☠️宝藏级🏴‍☠️ 原创公众号『 数据STUDIO 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括 可戳 👉 Python ｜ MySQL ｜ 数据分析 ｜ 数据可视化 ｜ 机器学习与数据挖掘 ｜ 爬虫 等，从入门到进阶！

长按👇关注- 数据STUDIO -设为星标，干货速递
