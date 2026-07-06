# 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地

## Ch01.1040 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地

> 📊 Level ⭐⭐ | 3.4KB | `entities/prosemirror-knowledge-base-mention-vivo.md`

# 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/prosemirror-knowledge-base-mention-vivo.md)

## 深度分析

知识库问答 @文档：从 DOM 方案到 ProseMirror 落地 涉及agent领域的核心技术议题。
### 核心观点
1. # 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地
> 作者：vivo 互联网项目团队 · Ding Junjie
> 原文：https://mp.
2. com/s/7db3l9s9MfMonr0BYwyouQ
> 背景：知识库问答输入框的 @文档 mention 能力 —— 表面是"输入 @ 后选一个文档"，实则是编辑器稳定性的工程问题
## 一句话定位
**从 DOM 方案转向 ProseMirror** 是因为"文本 + 原子节点"混排后，复杂度会从"能不能插进去"转移到"能不能一直稳定"——光标恢复、IME、`innerHTML` 污染 undo 栈、临时交互态混入文档，每一项都让裸 `contenteditable` 不可维护。
3. ## 为什么不用 DOM 方案
1.
4. `contenteditable` 容器监听输入
2.
5. 识别光标前的 `@query`
3.

### 内容结构
- 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地
- 一句话定位
- 为什么不用 DOM 方案
- ProseMirror 架构（与 @文档 落地）
- `docrefNode` 关键设计
- 交互链路：触发 → 显示 → 确认
- 1. 触发（监听）
- 2. 显示（弹窗 + Decoration）

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Qy_Zacztcs1Ql3Bifmbmgg](https://github.com/QianJinGuo/wiki/blob/main/entities/qy_zaCZTCs1Ql3BIFmBMgg.md)
- [天猫新品营销技术团队Ai编码实战指南上 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/天猫新品营销技术团队ai编码实战指南上-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

