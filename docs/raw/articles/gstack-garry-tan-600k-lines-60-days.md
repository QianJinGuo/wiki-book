---
title: YC掌门人60天写了60万行代码：gstack开源
source_url: https://mp.weixin.qq.com/s/-kJeOfYHMvetALarZOuZFw
publish_date: 2026-04-25
tags: [wechat, article, claude, openai, agent, multi-agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 933e112d0f8f64883d78d7ef2be5b2f8f35a54400eac20a2c3bbfd73b1532c1a
---
# YC掌门人60天写了60万行代码：gstack开源
## 核心数据
- **60天**写了60万+行代码，其中35%测试代码
- **7天**：14.7万行新增，362次提交，净增约11.5万行
- **每日产出**：1万-2万行可用代码
- **2013年** Garry Tan YC内部贡献772次 → **2026年3月**已达1237次（还在增长）
- **并行Sprint**：常规10-15个同时运行
## gstack是什么
把Claude Code变成可管理的虚拟工程团队。15个专家角色+6个增强工具，MIT协议开源。
### 15个角色
**流程类（按Sprint顺序）**：
- `/office-hours` — 产品重构，重新定义问题本身
- `/plan-ceo-review` — CEO视角，四种范围模式
- `/plan-eng-review` — 工程负责人，锁定架构、数据流、边界
- `/plan-design-review` — 设计师，0-10打分+满分方案
- `/design-consultation` — 设计合伙人，完整设计系统+原型
- `/review` — Staff工程师，找CI通过但会炸生产的bug
- `/investigate` — 调试专家，根因分析，3次失败停止
- `/design-review` — 会写代码的设计师，修复+原子提交
- `/qa` — QA负责人，找bug+自动修复+回归测试
- `/qa-only` — QA报告员，只出报告
- `/ship` — 发布工程师，同步+测试+覆盖率+PR
- `/document-release` — 技术写作，自动更新所有文档
- `/retro` — 周度复盘，个人数据+发布连续性+测试趋势
- `/browse` — QA工程师，真实Chromium浏览器+截图
- `/setup-browser-cookies` — 会话管理，导入各浏览器cookie
**增强工具类**：
- `/codex` — OpenAI Codex CLI独立审查，双AI交叉
- `/careful` — 安全护栏，破坏性命令前警告
- `/freeze` — 编辑锁定，限制目录范围
- `/guard` — /careful + /freeze合并
- `/unfreeze` — 解除限制
- `/gstack-upgrade` — 自我更新
## 一次典型Sprint
1. `/office-hours` — 质疑表述框架，提取隐性能力，挑战前提假设
2. `/plan-ceo-review` — 10维度范围评估
3. `/plan-eng-review` — 数据流ASCII图、状态机、故障模式
4. 批准，退出规划模式
5. **8分钟，11个文件，2400行代码**
6. `/review` — 2个问题自动修复，1个手动确认
7. `/qa` — 真实浏览器测试，1个bug
8. `/ship` — 测试42→51个，PR开出
**8条命令完成完整Sprint**
## 并行运行10-15个Sprint
用Conductor把多个Claude Code会话并行运行在隔离工作区。一个做/offic-hours，另一个/review，第三个实现功能，第四个跑/qa...
关键：没有流程，十个代理是混乱来源。有流程后，管理方式和CEO管理团队一样——重要决策介入，其余让它们跑。
## 亮点能力
- **QA让并行翻倍**：6→12个工作流，Claude看到问题→修复→生成回归测试→验证
- **设计贯穿全系统**：/design-consultation → DESIGN.md → /design-review和/plan-eng-review都读取
- **文档自动同步**：/document-release读取每个文档，交叉对比diff，自动更新所有漂移内容
- **浏览器交接**：遇到验证码/MFA，可见Chrome窗口+cookie导入，解决后原地继续
- **双AI交叉审查**：/review(Claude) + /codex(OpenAI)同时审查同一个diff
## 安装
需要：Claude Code + Git + Bun v1.0+
```bash
# 安装到本机
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```
GitHub: https://github.com/garrytan/gstack