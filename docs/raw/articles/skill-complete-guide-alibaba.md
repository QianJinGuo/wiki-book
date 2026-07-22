---
title: 第一步：安装 Remotion Best Practice Skill
source_url: https://mp.weixin.qq.com/s/PG-rXJllhrtynAfNZn5asg
publish_date: 2026-04-30
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 14f2a67c74c6d62c73dd20405f244abacebc8be43e24e415b85956ded88d651a
---

**可选字段（完整版）**：
--- name: api-standard-check
license: MIT
metadata:
  author: 栗子团队
  version: 1.0.0
  mcp-server: github   # 如果配合某个 MCP 使用，注明名称
  category: development
  tags: [api, documentation, testing]
  documentation: https://your-docs-url.com
---
禁止事项：
# ❌ 禁止在 frontmatter 中使用 XML 尖括号
description: Use for <important> cases  # 错误！
# ❌ 禁止 name 中含 "claude" 或 "anthropic"（保留词）
name: claude-helper  # 错误！
# ❌ 禁止 name 有空格或大写
name: My Cool Skill  # 错误！
name: my-cool-skill  # ✅ 正确
写好 Description 的三个黄金原则：
原则一：同时说明"做什么"和"什么时候用"
原则二：包含用户实际会说的话（触发词）
原则三：控制长度，不超过 1024 字符
正文写作的四个技巧：
1. 用第三人称描述步骤
2. 步骤编号化：每步只做一件事
3. 关键验证前置
4. 引用胜过嵌入
八、五大进阶模式：让 Skill 处理复杂工作流
模式一：顺序工作流编排
适用：需要严格按顺序执行的多步流程
模式二：跨 MCP 协调
适用：工作流跨越多个外部服务
（例如：Figma 导出 → Drive 存储 → Linear 任务创建 → Slack 通知）
模式三：迭代优化循环
适用：需要多轮优化才能达到质量标准的输出
模式四：上下文感知的工具选择
适用：同一个目标，根据文件类型或场景选择不同工具
模式五：领域专业知识内嵌
适用：需要将复杂的合规规则、行业知识内嵌到工作流中
九、测试与迭代：让 Skill 越来越准
测试一：触发测试（最关键）
目标：确保 Skill 在正确的时机加载，不该加载时不加载。
✅ 应该触发的测试用例（至少 10 个）
❌ 不应该触发的测试用例
测试二：功能测试
运行同一个请求 3-5 次，检查：输出结果是否一致、API 调用是否成功（0 错误为目标）、关键步骤是否都完成
测试三：与无 Skill 基线对比
指标 无 Skill 有 Skill 改善
用户需要提供的说明 每次都要解释 无需解释 ✅
来回对话轮次 15 轮 2 轮 ✅
API 调用失败次数 3 次 0 次 ✅
Token 消耗 12,000 6,000 ✅
动态优化：用自然语言修改 Skill
"你刚才的输出中，[具体描述问题]。请把这个改进固化到 [skill-name] 这个 Skill 文件中。"
十、团队协作与 Skill 治理
两级安装策略：
用户级（全局）：~/.qoder/skills/ — 个人偏好、跨项目通用
项目级：<项目根>/.qoder/skills/ — 团队规范、项目特定流程（推荐提交到 Git）
Git 协作最佳实践：
git add .qoder/skills/
git commit -m "feat: add api-standard skill v1.0"
git push
团队成员 git pull 后立即生效，无需额外操作
组织级 Skill 部署：
如果你的公司使用 Claude 企业版，管理员可以在工作区级别统一部署 Skill，所有成员自动获得，并可集中管理版本更新。
十一、常见问题排查 FAQ
Q：Skill 上传失败，提示 "Could not find SKILL.md"
→ 检查文件名是否严格为 SKILL.md（区分大小写）
Q：上传失败，提示 "Invalid frontmatter"
→ 最常见的 YAML 格式错误：缺少 --- 分隔符，或引号未关闭
Q：AI 没有自动调用我装好的 Skill
→ 两步排查：输入 / 检查 Skill 是否出现 + 询问 AI"你什么时候会用这个 Skill"
Q：Skill 触发太频繁，影响不相关任务
→ 在 description 中加入负向说明："Do NOT use for simple data queries"
Q：Skill 加载了但 AI 没有按步骤执行
→ 可能原因：指令过于冗长、语言描述模糊
→ 修复：用脚本替代语言描述（代码是确定的，语言存在解读偏差）
Q：Skill 有多少数量限制？
→ 产品层面没有数量限制。实际上限由上下文窗口决定，但由于 Skill 只加载 meta data，通常可以同时携带大量 Skill（建议不超过 20-50 个同时启用）
Q：一个 Skill 能不能调用另一个 Skill？
→ 可以。由于所有 Skill 的 meta data 都在 Agent 的上下文中，一个 Skill 执行过程中可以自然地触发另一个。
Q：Skill 里的 reference 文件越大越好吗？
→ 不是。建议 SKILL.md 控制在 5000 词以内，大型文档放 references/ 并在正文中引用路径。
十二、最小闭环实践路径：现在就开始
第 1 步（5 分钟）：安装一个开源 Skill
→ npx skills add from-design → 选择 Qoder，选择 Global，选择 copy 模式
第 2 步（5 分钟）：测试是否生效
→ 在 Qoder Quest 模式中，输入一个前端设计需求，观察 AI 是否自动调用 from-design Skill
第 3 步（10 分钟）：修改这个 Skill 的 description
→ 打开 ~/.qoder/skills/from-design/SKILL.md，在 description 中加一句符合你实际场景的触发词，重启会话再次测试
第 4 步（10 分钟）：为你的团队写第一个 Skill
→ mkdir -p .qoder/skills/my-first-skill && touch .qoder/skills/my-first-skill/SKILL.md
→ 填写 name、description 和执行步骤，git commit 提交
十三、附录：YAML Frontmatter 速查表 + 完整 Checklist
Frontmatter 完整速查：
--- # ✅ 必填
name: skill-name-in-kebab-case
description: | [做什么] + [什么时候用，含触发词] 不超过 1024 字符，不含 XML 尖括号
# 🔧 可选
license: MIT
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"
metadata:
  author: Your Name / Team
  version: 1.0.0
  mcp-server: server-name
  category: productivity
  tags: [tag1, tag2]
  documentation: https://your-docs.com
  support: support@company.com
---
资源链接：
开放 Skill 市场：https://skills.sh
Anthropic 官方 Skill 示例库：github.com/anthropics/skills
Qoder 官方文档：Qoder 官网 → 文档 → 扩展能力
本文参考 Anthropic 官方《The Complete Guide to Building Skills for Claude》