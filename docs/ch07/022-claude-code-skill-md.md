# Claude Code SKILL.md 写作指南

## Ch07.022 Claude Code SKILL.md 写作指南

> 📊 Level ⭐⭐ | 11.4KB | `entities/claude-code-skill-writing-guide.md`

# Claude Code SKILL.md 写作指南

## 核心概念

Skill 是一份可被 Agent 发现、按需加载的任务说明。把"老员工脑子里的规矩"写进 SKILL.md，再交给 Agent 在合适的任务里调用。

**不是**把长 Prompt 换个地方保存，也不是给 Agent 看的 README。SKILL.md 写得越长，不代表效果越好。

## 文件结构

```
skill-name/
├── SKILL.md         # 主文件，触发时加载
├── scripts/          # 实用脚本（执行，不加载到上下文）
├── references/       # 参考资料（按需加载）
└── assets/          # 模板和静态文件（按需加载）
```

## Frontmatter 元数据

至少要写清楚两个字段：`name` 和 `description`。

### name 规范
- 最多 64 个字符
- 只能包含小写字母、数字和连字符
- 不能包含 XML 标签
- 不能包含保留字（anthropic、claude）
- 推荐动名词形式（动词+-ing）

### description 写法
说清楚两件事：
1. 这个 Skill 做什么
2. 在什么场景下需要用它
3. 带触发词（PDF、表单、git diff 等）

```yaml
# ✓ 好的 description
description: 从PDF文件中提取文本和表格、填充表单、合并文档。在处理PDF文件或用户提及PDF、表单时使用。

# ✗ 避免：只写功能名，不写触发时机
description: 处理Excel文件
```

## 正文写法

### 三层模型（渐进式披露）

1. **广告层**：name + description，启动时加载
2. **指令层**：命中后读 SKILL.md 正文，控制在 500 行以内
3. **资源层**：执行时按需读取 references/、scripts/

### 上下文管理原则

每写一段，问自己三个问题：
- Agent 真的需要这段解释吗？
- 这是项目里的私有知识，还是通用常识？
- 这段话值不值得占用上下文？

**Skill 正文里最值钱的是踩坑清单，不是概念解释。**

```markdown
# ✓ 好的写法
## 提取 PDF 文本
使用 pdfplumber 进行文本提取：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

# ✗ 不好的写法（全是废话）
PDF（便携式文档格式）是一种常见文件格式...
```

## 自由度把控

| 自由度 | 适合场景 | 写法 |
|--------|---------|------|
| 高 | 需要判断和取舍，答案不唯一 | 给检查方向，不写死步骤 |
| 中 | 有固定模板，但允许按场景调整 | 给模板、参数和边界 |
| 低 | 操作脆弱，出错代价高 | 给精确命令，明确不能改 |

**高风险操作（迁移/部署/删文件）→ 低自由度；分析/评审/总结 → 高自由度**

## 工作流与反馈循环

把流程拆成明确阶段，加验证点：

```markdown
### RED - Write Failing Test
Write one minimal test showing what should happen.

### Verify RED - Watch It Fail
**MANDATORY. Never skip.**
- Test fails, not errors
- Failure message is expected

### GREEN - Minimal Code
Write simplest code to pass the test. Don't add features.
```

**条件分支**：如果是 A，走 A 流程；如果是 B，走 B 流程。直接写出来，不让 Agent 自己猜。

## 常见坑

1. **把 Skill 当 README 写**：Skill 面向 Agent，重点是可执行性
2. **想做万能助手**：Skill 不怕小，怕边界不清楚。拆小：jvm-metrics-analyzer / distributed-trace-finder / k8s-pod-event-viewer
3. **给 Agent 太多选择**：先给默认方案，再给例外情况
4. **术语来回换**：同一个概念只用一个名字
5. **让 LLM 做确定性工作**：格式转换/精确计算交给脚本；LLM 做判断

## 深度分析

### 为什么 SKILL.md 不是长 Prompt

传统的 Long Prompt 模式把所有指令堆在一起，Agent 从头读到尾，上下文膨胀严重，且难以复用。而 SKILL.md 的设计初衷是**按需加载**：Agent 在任务开始时只知道这个 Skill 存在（通过 name 和 description 的广告层），只有在确定需要使用时才读取完整指令，最后在执行阶段按需引用 references 和 scripts。

这种分层设计背后有一个关键认知：**上下文窗口是昂贵的资源**。每一次 Token 都占用上下文，而上下文直接影响推理速度和质量。SKILL.md 通过三层分离，把"广告"、"指令"、"资源"拆开，让 Agent 只加载它此刻真正需要的内容。

反过来理解：如果把 SKILL.md 写成 2000 行的详细说明书，Agent 在每次任务中都要完整读取，无论任务大小。这不是"丰富"，而是"浪费"。真正专业的 Skill 作者会问：这一段在哪个阶段会被用到？如果只在执行阶段用到，就应该放到 references/ 而不是 SKILL.md 正文。

### 自由度设计的本质

自由度（Latitude）是 Skill 设计中最容易被忽视、也最影响最终效果的维度。高/中/低三档不是主观选择，而是**由任务本质决定的**：

- **低自由度**场景：操作后果不可逆、修复成本高。例如数据库迁移、文件删除、生产环境部署。在这些场景下，Agent 的"自由发挥"是危险的，必须给出精确命令和明确边界，不允许擅自变通。
- **中自由度**场景：有成熟模式但允许按实际情况调整。例如按模板生成代码、处理标准格式数据。这时候给Agent充分的上下文和参数，让它能在边界内自主决策。
- **高自由度**场景：没有标准答案，需要综合判断。例如代码评审、架构分析、性能优化建议。这里Agent需要的是方向和框架，而不是步骤清单。

一个常见的错误是：为所有 Skill 都选择"高自由度"，认为"给方向比给步骤更先进"。但实际上，当你的 Skill 涉及文件操作、命令执行、数据修改时，高自由度意味着 Agent 可能做出你未预期的操作并造成损失。**自由度的选择标准是：出错成本有多高？**

### 踩坑清单为什么比概念解释更重要

Agent 在执行任务时，最怕的不是"不知道概念"，而是"不知道坑在哪里"。概念解释是通用知识，Agent 本身已经具备（比如"PDF 是什么"）；而踩坑清单是**项目特定的、经验性的知识**，没有参考资料就无法获得。

举个例子：一个处理 PDF 的 Skill，Agent 按照通用逻辑可能会用 `PyPDF2` 提取文本，但遇到中文表格就乱码了。这个问题不会在概念层面出现，只在具体执行中暴露。如果 Skill 中写了"中文表格请用 pdfplumber + table_coords 参数"，Agent 直接绕过了这个坑。

所以，写 Skill 的重点应该从"教 Agent 什么"转向"提醒 Agent 避开什么"。当你发现团队成员在某个操作上经常出错，就把那个错误模式和正确做法写进 Skill——这是最有价值的 Skill 内容。

## 实践启示

### 1. 先写 description，再写上下文管理原则

很多 Skill 作者习惯先写正文，最后再补 description。这往往导致 description 和正文脱节——description 变成概括而不是承诺，正文变成自说自话。

正确顺序是：**先在 description 里说清楚这个 Skill 的触发时机和核心价值**。写完 description 后问自己：用户看到这个描述，会不会知道什么时候该用这个 Skill？如果答案是否定的，正文写得再好也没用，因为 Agent 根本不会加载它。

### 2. 用检查清单替代流程描述

在写"怎么做"的时候，很容易陷入步骤罗列。但对 Agent 来说，步骤罗列既冗长又缺乏灵活性。更好的方式是**检查清单（Checklist）模式**：

```
## 完成检查
- [ ] 确认源文件存在
- [ ] 检查文件编码是否为 UTF-8
- [ ] 验证输出目录可写
- [ ] 执行后核对行数一致
```

这种方式让 Agent 可以在每个节点自主决策，同时确保关键验证点不被跳过。

### 3. 先拆小，再组合

如果一个 Skill 的 description 里出现"和"、"以及"、"或"，这通常意味着它应该被拆成多个 Skill。"PDF 处理"不是一个好 Skill，"PDF 文本提取"、"PDF 表格提取"、"PDF 合并"才是边界清晰、可独立使用的最小单元。

小 Skill 的优势在于：**可发现性高，可组合性强**。一个 Agent 可以同时加载多个小 Skill 来完成复杂任务，而不是被迫理解一个臃肿的大 Skill。

### 4. 设计"默认方案 + 例外情况"的结构

不要让 Agent 在多个方案之间选择——这会消耗它的推理预算。正确做法是：先给出默认方案，再单独章节列出例外情况。

```
## 默认方案
使用 pdfplumber 提取文本（见 scripts/pdf-extract.py）

## 例外：扫描件 PDF
扫描件没有文本层，使用 OCR 处理（见 scripts/ocr-pipeline.py）
```

这样 Agent 在大多数情况下直接走默认路径，遇到特殊情况时能快速切换到正确处理方式。

### 5. 验证 Skill 效果的方式

Skill 写完后，不要直接投入生产使用。验证方式：
1. **模拟触发**：用触发词让 Agent 发现这个 Skill，确认 description 足够清晰
2. **执行测试**：用真实任务测试，检查 Agent 是否按 SKILL.md 指示执行
3. **错误注入**：故意触发例外情况，检查 Skill 的例外处理是否有效

每轮验证后，把发现的问题补充进"常见坑"章节。

## 参考资料

- [Superpowers TDD Skill](https://github.com/obra/superpowers)
- [sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills)
- [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills)
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](../ch01/814-skill-issues-compromising-claude-code-with-malicious-skills.html)
- [Claude Design Skill Web Design Engineer](../ch01/1095-claude-design-skill.html)
- [Claude Design Skill](../ch01/1095-claude-design-skill.html)
- [Claude Code Prompt Source Analysis](../ch09/060-claude-code-prompt.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](../ch03/076-claude-code.html)
- [using claude](../ch03/076-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)

---

