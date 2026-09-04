# 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地

> 📊 Level ⭐⭐ | 2.4KB | `entities/prosemirror-knowledge-base-mention-vivo.md`

# 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地

→ [原文存档](https://mp.weixin.qq.com/s/7db3l9s9MfMonr0BYwyouQ)

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

### 关联实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/004-agent.html)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](660-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Qy_Zacztcs1Ql3Bifmbmgg](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qy_zacztcs1ql3bifmbmgg.md)
- [天猫新品营销技术团队Ai编码实战指南上 V2](../ch04/052-ai.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04/180-openclaw.html)

---

