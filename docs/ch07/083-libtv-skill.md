# LibTV把导演的手艺装进了Skill商店，我拿三支片子验了验

## Ch07.083 LibTV把导演的手艺装进了Skill商店，我拿三支片子验了验

> 📊 Level ⭐⭐ | 3.9KB | `entities/libtv-ai-video-agent-skill-store-creative.md`

# LibTV把导演的手艺装进了Skill商店，我拿三支片子验了验


## 核心内容

本文深度评测了LibTV Agent——哩布哩布（Liblib）旗下专业AI视频创作平台的智能Agent功能。作者通过三个真实项目的完整创作过程，展现了LibTV Agent的核心创新：

1. **Skill商店机制**：导演和创作者可以将自己的专业工作流程、镜头语言、美学风格封装为可复用的"Skill"（技能文件），其他用户只需选择Skill、上传素材、描述需求即可调用专业级AI导演能力。每个Skill有创作者署名和使用人数记录。
2. **多步骤Agent工作流**：不同于大多数"生成即结束"的视频AI工具，LibTV Agent覆盖从创意到成片的完整专业流程——素材识别分析与角色设计、资产锚点（Asset Anchoring）定妆照生成与用户确认、故事大纲与专业分镜草图生成（含运镜标注）、逐镜头的视频生成与节点化重跑机制、ASR字幕与字卡合成、内置时间线剪辑。
3. **资产锚点（Asset Anchoring）**：关键元素（角色、道具、场景）在生成前先产出单独定妆照，经用户确认后再推进到后续所有镜头，确保全片视觉一致性和创作者控制力。
4. **Storyboard生成**：Agent自动生成铅笔线稿风格的分镜表，每格标注运镜方式（如"极端大特写，荷兰角15度倾斜"），接近专业影视工业的分镜规范。
5. **返工颗粒度**：画布采用节点化工作流视图，可单独重跑任一镜头的生成，不影响其他镜头，大幅降低迭代成本。
6. **Skill创作者生态**：官方提供1000万激励金，鼓励用户将创作方法提炼为可上架的Skill资产，实现"方法论文件跨平台通用"的愿景。

作者验证了三类场景：照片转皮克斯风格动画（选Skill型）、已有剧本的品牌宣传片制作（自带剧本型）、旅行照片集锦影像诗（从零到Skill型）。

## 分析

```mermaid
graph TB
    subgraph "Agent 核心"
        INT[意图理解] --> PLAN[任务规划]
        PLAN --> EXEC[工具选择与调用]
        EXEC --> VERIFY[结果验证]
        VERIFY -->|"失败重试"| PLAN
    end
    subgraph "工具层"
        direction LR
        FT[Function<br/>自定义函数]
        MT[MCP Server<br/>外部服务]
        API[REST API<br/>HTTP调用]
    end
    EXEC --> FT
    EXEC --> MT
    EXEC --> API
    subgraph "安全层"
        AUTH[权限检查]
        SANDBOX[沙箱隔离]
        AUDIT[审计日志]
    end
    EXEC --> AUTH --> SANDBOX
    SANDBOX --> AUDIT
    classDef agent fill:#dbeafe,stroke:#2563eb
    classDef tool fill:#d1fae5,stroke:#059669
    classDef sec fill:#fee2e2,stroke:#dc2626
    class INT,PLAN,EXEC,VERIFY agent
    class FT,MT,API tool
    class AUTH,SANDBOX,AUDIT sec
```


本文具有多重意义：

- **AI视频创作Agent的范式突破**：LibTV Agent展示了对"AI视频制作"这一命题的深度理解——核心不是单次生成质量，而是对整个制作流程的编排能力。它将专业影视工业的创作流程（概念设计→资产定妆→分镜→逐镜头制作→后期合成）完整映射到AI Agent的工作流中，每一步保留人类创作者的判断节点，而非端到端的黑盒。
- **Skill生态：方法论文件化**：沿袭SKILL.md（如女娲.skill项目，GitHub 26k stars）的核心理念，将创作方法论写成可被AI调用的标准化文件，LibTV将其落地到视频领域。Skill商店形成了创作者与使用者的双边市场——导演沉淀经验、使用者调用能力、平台提供激励。
- **生产级Agent编排**：资产锚点（Asset Anchoring）机制解决了AI视频长期以来的角色/场景一致性难题；节点化画布实现了精细化的返工粒度；多模型编排（图像+视频+音频）与内置剪辑工具构成了完整的创作闭环。
- **方法论文件的跨平台趋势**：文章通过作者本人"从方法论提供方（女娲.skill）到方法论调用方（LibTV Skill商店）"的双重视角，暗示了"Skill文件"正成为跨平台的通用创意资产这一趋势。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/libtv-ai-video-agent-skill-store-creative.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

