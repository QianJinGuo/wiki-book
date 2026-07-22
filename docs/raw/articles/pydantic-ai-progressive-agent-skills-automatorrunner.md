---
title: "pydantic-ai-progressive-agent-skills-automatorrunner"
created: 2026-06-10
type: raw
sha256: f835e253f12062a361d62ebb53826a864f88f131fda3460113198cef078fc1fe
---
source_url: https://mp.weixin.qq.com/s/osc5beCKJGDAvHeY2Ji4_w
source: wechat
source_title: 不用Claude模型，也能搭一套渐进式Agent Skills
author: AutomatorRunner
feed_name: AutomatorRunner
published: 2026-04-28
scored: v=8, c=6, v×c=48

# 不用Claude模型，也能搭一套渐进式Agent Skills

## 核心结论

- Claude Skills月费够雇一个初级工程师，想换DeepSeek/Gemini但Skills绑定Claude SDK，需litellm转接增加故障点
- Claude官方《Building Effective Agents》：框架不重要，工具设计和上下文管理才是关键；渐进式加载是设计哲学非Claude专利
- Pydantic AI给了底层积木但没有Claude Skills黑盒魔法——渐进式加载你得自己搭

## 问题背景

- 原来用Claude Skills搭了一套用户反馈日报系统（抓取Reddit/App Store/内测群→分类→生成HTML报告→推飞书）
- 效果好但三个月后账单沉默：日均调用量大，Claude模型费用够雇一个初级工程师
- 想换DeepSeek/Gemini但Claude Skills绑定Claude SDK，需litellm转接——多一层故障点

## 核心洞察

Claude官方《Building Effective Agents》三句话：
- "很多模式只需几行代码就能实现"
- "成功不在于构建最复杂的系统，而在于构建最适合你需求的系统"
- "Frameworks can help you get started quickly, but don't hesitate to reduce abstraction layers and build with basic components as you move to production"

翻译：工具设计+上下文管理比框架重要；渐进式加载是设计哲学非Claude专利

## Pydantic AI能力

**1. 模型自由，一行代码切换**
- 原生支持40+模型提供商：OpenAI/Anthropic/DeepSeek/Gemini/阿里通义/Ollama
- 不需要litellm，内部自动抹平参数格式
- FallbackModel：主模型失败自动切备用（DeepSeek挂了自动切Claude）

**2. Capabilities ≈ Skills，可组合可复用**
- 一个Capability打包：工具(函数)/指令(系统prompt追加)/生命周期hooks
- Claude Skills是自动触发（框架判断"现在该加载哪个"），Pydantic AI是显式传入（创建Agent时指定）
- 这是第一个需要手动补的缺口

**3. Hooks手动实现渐进式加载**
- PrepareTools：每次模型请求前动态过滤工具列表
- before_model_request：每次模型请求前追加指令、修改请求内容
- 组合可实现Claude Skills的渐进式披露效果

**4. 类型安全的依赖注入（比Claude SDK更优）**
- Claude SDK：工具函数靠字符串prompt和cwd参数传递上下文，无类型检查
- Pydantic AI：RunContext[DepsType]依赖注入，IDE自动补全，静态检查捕获错误

## Pydantic AI局限性

- ❌ 不会自动判断调用哪个Capability（Claude Skills自动触发，需显式传入）
- ❌ 无内置三层渐进加载（frontmatter/正文/references需手动实现）
- ❌ 自定义Capability不能直接用于YAML Spec，需先注册

## 实战迁移：6个Claude Skills → 5个Capabilities

**第一步：Skill拆成Capability**
6个Claude Skills重构成5个Pydantic AI Capabilities

**第二步：组装Agent**
功能对应原来的6个Skills，缺渐进式加载

**第三步：手动实现渐进式加载**
- 方案A：按步骤过滤工具
- 方案B（更自然）：按步骤追加指令——告诉模型"现在该做什么"而非藏工具
- 比过滤工具更贴近Claude Skills的渐进式披露

**第四步：依赖注入**
日报依赖(数据库连接/网络客户端/推送地址) → 类型安全的RunContext

**第五步：YAML声明式配置**
内置Capability可直接用YAML，自定义Capability需先注册（Python代码组装更实在）

## 迁移后一个月效果

- DeepSeek某次API波动，FallbackModel自动切Claude，团队无感知
- 意外发现：白盒控制比Claude Skills黑盒魔法更适合生产环境
  - 可精确控制第几步追加哪段指令、暴露哪份参考资料
  - 原来Claude Skills的references"需要时"加载由框架判断，有时模型该看标签体系文档但框架没加载
- Token经济学核心：别让模型在不该分心时看到不该看的东西

## Claude SDK vs Pydantic AI核心对比

| 维度 | Claude SDK | Pydantic AI |
|------|-----------|------------|
| 模型绑定 | 绑定Claude | 模型自由(40+provider) |
| Skills机制 | 自动触发 | 显式传入 |
| 渐进加载 | 内置黑盒 | 需自己搭hooks |
| 依赖注入 | 字符串prompt+无类型 | RunContext[DepsType]类型安全 |
| 生产扩展 | 需litellm | 内置FallbackModel |

原文：https://mp.weixin.qq.com/s/osc5beCKJGDAvHeY2Ji4_w
