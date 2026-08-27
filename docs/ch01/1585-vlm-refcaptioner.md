# VLM会描述视频，却未必用对参考图：RefCaptioner让参考图与视频语义精准对应

## Ch01.1585 VLM会描述视频，却未必用对参考图：RefCaptioner让参考图与视频语义精准对应

> 📊 Level ⭐⭐⭐ | 2.9KB | `entities/vlm会描述视频却未必用对参考图refcaptioner让参考图与视频语义精准对应.md`

# VLM会描述视频，却未必用对参考图：RefCaptioner让参考图与视频语义精准对应

> WeChat-机器之心 | 发布于 2026-08-11 | 评分入库 v×c≥49

## 核心内容

机器之心 2026-08-11 12:05 北京 让视频caption与参考图完成端到端绑定。 图 1：RefCaptioner 的任务动机。普通视频描述只生成文本，难以表达候选参考图与局部视频语义之间的对应关系；RefCaptioner 从最多 22 张候选图中选出视频实际出现的内容，将图像标签放在对应短语之后，同时排除无关干扰项。 近年来，随着多模态大模型的发展，视频理解领域已经可以对视频的内容进行详尽的描述。 然而随着多参考图视频生成与编辑的发展，除了对视频本身的理解，通常还需要模型经常同时处理人物、服装、场景等多张参考图，建立参考图和视频的对应关系。而我们通过实验发现一个几乎所有多模态大模型都存在的问题：模型虽然可以将简单的视频主体和参考图主体对应，但当参考图增多时，视频理解模型对于视频中的主体和参考图的对应能力则会大幅下降。 这正是现有视频描述范式的盲区。普通 Caption 只要求文本忠实于视频；多参考图场景还要求模型在候选图之间做选择，把每张有效参考图落到正确的局部短语上，并理解同一个主体多张不同视角，姿态的图片可能属于同一主体。问题因此从 “生成一段好的描述”，变成 “在生成描述的同时建立可用的视频对象 - 参考图对应关系”。 这引出了一个核心问题：当输入是视频和大量参考图时，如何更好的建立视频语义和参考图之间的关系，并给出合理且正确的视频理解内容？ 对于这个问题，我们将多参考图场景下的视频 caption 问题进行梳理。首先。多参考图里可能有真正出现的主体和场景，也可能混入外观相似的干扰项，现有的 VLM 要么过于自信全部引用，要么过度保守又会漏掉有效信息。其。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vlm会描述视频却未必用对参考图refcaptioner让参考图与视频语义精准对应.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

---

