---
title: Hermes新顶流Agent Skills闭环系统深度解析
source_url: https://mp.weixin.qq.com/s/yHva-zLaRTxe8b4HSUr86Q
author: 李伟山
published: 2026-04-15
created: 2026-05-17
updated: 2026-05-17
type: article
tags: [hermes-agent, skill-system, closed-loop, self-evolution, progressive-disclosure, source-code]
sha256: dbb7bb9e59d15a34aea97077ca6dd63726ca8438122958344894e6d5937869ad 
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
---
# Hermes新顶流Agent Skills闭环系统深度解析
## 核心观点
Hermes Agent 的 Skills 闭环系统实现了"经验提取→知识存储→智能检索→上下文注入→执行验证→自动改进"的完整闭环，是唯一一个内置闭环自学习机制的开源 Agent 框架。
## 01 全局视角：七个阶段构成的闭环
1. **创建触发** — Agent 自主决定何时创建 Skill
2. **安全验证** — 七道安全关卡（名称/分类/Frontmatter/大小/冲突/原子写入/安全扫描）
3. **索引构建** — 两层缓存（进程内 LRU + 磁盘快照）
4. **条件激活** — 基于工具集和平台的条件可见性控制
5. **渐进式加载** — 三级披露（索引→完整内容→支撑文件）
6. **注入策略** — User Message 而非 System Prompt（保 Prompt Cache）
7. **自改进** — 使用时发现过时时立即 patch
## 02 Skill 创建：从经验到知识的蒸馏
### 2.1 创建触发条件
```python
SKILLS_GUIDANCE = (
    "After completing a complex task (5+ tool calls), fixing a tricky error, "
    "or discovering a non-trivial workflow, save the approach as a skill."
)
```
**关键洞察**:
- 5+ tool calls：简单任务不值得建 Skill
- fixing a tricky error：踩过的坑最有价值
- don't wait to be asked：Agent 应自主判断
- Skills that aren't maintained become liabilities
### 2.2 七道安全关卡
| 关卡 | 验证内容 |
|------|----------|
| 1 | 名称验证 — 小写字母/数字/连字符，≤64字符 |
| 2 | 分类验证 — 单层目录名，无路径穿越 |
| 3 | Frontmatter 验证 — 必须有 YAML 头部 |
| 4 | 大小限制 — ≤100,000 字符 |
| 5 | 名称冲突检查 — 跨所有目录去重 |
| 6 | 原子写入 — tempfile + os.replace() 防崩溃 |
| 7 | 安全扫描 — 90+ 威胁模式检测，失败则回滚 |
**原子写入**:
- 先写临时文件（.tmp. 前缀）
- 写入完成后用 os.replace() 原子替换
- 崩溃时目标文件要么是旧内容要么是新内容，绝不损坏
**先写后扫**: 避免 TOCTOU 竞态，确保扫描的是最终状态
## 03 索引构建：两层缓存的极致优化
### 两层缓存设计
**Layer 1: 进程内 LRU 缓存**
- 最多保存 8 条缓存条目
- 缓存键是五元组：(skills_dir, external_dirs, available_tools, available_toolsets, platform_hint)
**Layer 2: 磁盘快照**
- 通过 mtime+size manifest 验证快照是否过期
- 不对比文件内容（太慢），对比修改时间和大小
**性能对比**:
| 路径 | 耗时 | 场景 |
|------|------|------|
| Layer 1 命中 | ~0.001ms | 热路径 |
| Layer 2 命中 | ~1ms | 冷启动 |
| 全扫描 | 50-500ms | 首次访问 |
## 04 条件激活：Skill 的智能可见性控制
基于 frontmatter 元数据的条件激活：
- **fallback_for_toolsets**: 主工具可用时，隐藏 fallback skill
- **requires_toolsets**: 依赖工具不可用时，隐藏 skill
- **platforms**: 限制操作系统（macos/linux 等）
**解决的问题**: 索引膨胀
## 05 渐进式加载：三级披露
受 Anthropic Claude Skills 启发的设计模式。
### 为什么需要渐进式披露？
Token 就是钱。所有 Skill 完整内容塞进 System Prompt 可能要 100K+ tokens。
### 三级披露
1. **Tier 1**: System Prompt 只放索引（名称+描述，约 20 tokens/Skill）
2. **Tier 2**: Agent 主动调用 skill_view() 加载完整内容
3. **Tier 3**: 按需加载支撑文件（API 文档、模板等）
### 加载安全检查
- **Prompt Injection 检测**: 检测 "ignore previous instructions" 等模式
- **路径穿越防护**: 验证文件路径不逃逸出 Skill 目录
- **环境变量依赖检查**: 缺失时交互式收集或提示用户
## 06 注入策略：User Message 而非 System Prompt
**关键架构决策**: Skill 内容作为 User Message 注入，而非修改 System Prompt。
### 为什么？
**Prompt Cache**: Anthropic 的缓存机制要求 System Prompt 在整个对话中不变。每次加载 Skill 修改 System Prompt 会导致缓存失效，数十倍成本增加。
### User Message 注入的权衡
- 指令跟随权重低于 System Prompt
- 用 [SYSTEM: ...] 前缀模拟系统级指令权威性
- 牺牲一点可靠性，换取数十倍成本节约
## 07 自改进机制：闭环的关键闭合点
### 改进触发
> "If a skill you loaded was missing steps, had wrong commands, or needed pitfalls you discovered, update it immediately with skill_manage(action='patch') — don't wait to be asked."
### Patch 操作
复用了文件编辑工具的 Fuzzy Match 引擎，解决 LLM 回忆 Skill 内容时的格式差异问题。
## 与现有知识的链接
- → [[entities/hermes-skill-system|Hermes Agent Skill 系统深度解析]] — winty版基础原理
- → [[raw/articles/hermes-skill-system-deep-dive|原文存档]]