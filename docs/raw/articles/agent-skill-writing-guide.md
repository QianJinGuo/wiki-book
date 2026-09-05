---
title: 从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"
source_url: https://mp.weixin.qq.com/s/six9MKhvBgyZyUvyAIujTA
publish_date: 2026-04-24
tags: [wechat, article, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: bcf209038f19e2439eac94cabde8f7914dbc773312cf6a05b29144eadbe0e04f
---

```
**元数据字段**：
| 字段 | 必须 | 说明 |
|------|------|------|
| name | 是 | 小写字母、数字、连字符，不超过64字符，必须与父目录名一致 |
| description | 是 | 核心！告诉Agent何时激活，最多1024字符，要包含关键词 |
| license | 否 | 许可证 |
| compatibility | 否 | 环境要求 |
| metadata | 否 | 自定义键值对 |
| allowed-tools | 否 | 实验性，预批准工具列表 |
⚠️ **90%的人踩的坑**：description 不准确或缺少关键词 → Agent 根本不激活 Skill。
## 高质量 Skill 编写规范
1. **从真实经验提炼**，不要凭空想象——和AI协作完成任务后提炼，或从事故复盘/代码规范文档中生成
2. **像函数一样设计边界**——范围过小（多次激活+冲突）/ 范围过大（臃肿+误触发）
3. **写"方法"而不是"答案"**——教会AI如何思考，而不是给出特定答案
4. **预设"默认值"**——给推荐方案+备选，而不是罗列菜单让AI犹豫
5. **"坑点（Gotchas）"章节**——最有价值，把"只有踩过坑才知道"的细节写进去
6. **提供输出模板和检查清单**——Markdown模板 + [ ] 进度跟踪清单
## 评估与迭代
### 测试用例设计
一个测试用例 = 提示词 + 预期输出 + 输入文件（可选）。
技巧：
- 从2-3个开始，不要一开始就写很多
- 变化措辞、详细程度（随意↔精确）
- 覆盖边缘情况
- 使用真实上下文（文件路径、列名等）
### 运行评估
两次运行对比：**with_skill vs without_skill**
输出结构：
```
iteration-1/
├── eval-top-months-chart/
│   ├── with_skill/outputs/ + timing.json + grading.json
│   └── without_skill/...
└── benchmark.json（汇总统计）
```
### 断言编写
好的断言：可编程验证 / 具体可观察 / 可计数
弱的断言：太模糊 / 太脆弱（措辞一变就失败）
### 聚合结果分析
| delta 指标 | 含义 |
|-----------|------|
| pass_rate | Skill 带来的通过率提升 |
| time_seconds | Skill 带来的时间额外开销 |
| tokens | Skill 带来的 Token 额外消耗 |
分析模式：
- 两种配置都通过的断言 → 移除，无有用信息
- 两种都失败 → 断言本身有问题，需修复
- 带Skill才通过 → Skill 明显增加价值的地方
- 高标准差 → 收紧指令，减少模糊性
### 迭代原则
- 从反馈中泛化，不做狭隘补丁
- 保持精简：少而好的指令 > 详尽规则
- 解释为什么：基于推理的指令（"做X是因为Y"）> 僵化指令
- 打包重复工作：每个测试用例都写了类似辅助脚本 → 应打包进 Skill
## scripts/ 编写规范
### 自包含脚本（PEP 723 / Deno / Bun）
Python (PEP 723)：`# /// script` 声明依赖
Deno：`npm:`/`jsr:` 导入说明符
Bun：自动安装缺失包
Ruby：`bundler/inline`
### Agentic 脚本设计原则
- **避免交互式提示**——硬性要求，Agent 在非交互式Shell中运行
- **用 --help 记录用法**——是Agent学习脚本接口的主要方式
- **编写有帮助的错误消息**——说明哪里错了、期望什么、可尝试什么
- **使用结构化输出**——JSON/CSV/TSV，stdout发数据，stderr发诊断
- **幂等性**——"如果不存在则创建" > "重复时失败"
- **空运行支持**——`--dry-run` 预览破坏性操作
- **有意义的退出码**——不同失败类型用不同退出码
- **可预测的输出大小**——限制输出或支持 `--output` 写到文件