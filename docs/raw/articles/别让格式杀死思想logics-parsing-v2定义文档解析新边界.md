---
tags: [wechat, article, claude, openai]
title: "别让格式杀死思想logics-parsing-v2定义文档解析新边界"
source: wechat
url: wechat
sha256: f080bf620baccc037f7819b43032320e0a4ef539de18f0bfefc503f7f941be67
date: 2026-05-17 10:05
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/FBt7UJ-TZGdTHtVoXPzC8Q
ingested: 2026-05-16
feed_name: 阿里技术
wechat_mp_fakeid: MP_WXS_3885737868
source_published: 2026-03-20
---
# 别让格式杀死思想：Logics-Parsing V2定义文档解析新边界
我们总以为拍下即留存，却常被“看得见、用不了”的内容困住：
* 此前在图书馆里拍摄的重要书籍页面却因为当时光线不佳，现在转文字时无法识别；
* 导师发来一份多年前的扫描版学术论文PDF，关键公式识别乱码，只能手动重新敲打；
* 开发者截图一段 GitHub 代码，识别后格式全无，需要手动调整缩进才能理解；
* 书本中纵横交错的思维导图，拍得下全貌却抓不住逻辑，想引用时只能对着照片重新构图；
* 谱架上那页珍贵的手写乐谱，承载着旋律却无法数字化，难以编辑或分享给伙伴。
格式本应是思想的容器，而非牢笼。
Logics-Parsing V2解析能力全新升级， 不止于文本，读懂更多数据的结构和逻辑。  现在，无论是一篇紧凑的学术论文复印件、一页复杂的财务报表扫描件，还是一张跳动的乐谱图片、一个包含思维导图或伪代码的网页截图——Logics-Parsing V2 都能穿透像素的屏障，将其转化可编辑、可搜索的结构化数字资产。让信息不再只是被“看见”，而是被真正“唤醒”。
** 01
**
** Logics-Parsing V2 核心能力
**
####  轻松实现端到端处理
* 单模型端到端实现各类文档的识别和解析
* 处理报纸、杂志等复杂版面文档更加游刃有余
####  先进的内容元素识别能力
* 无惧复杂排版，密集文字、复杂表格、科学公式、化学符号都能精确识别
* 拓展 Parsing 2.0 识别能力，乐谱、思维导图、代码伪代码也能精准还原
####  丰富的结构化输出
* 模型生成简洁的QwenVL HTML来表示文档，并标记元素类别、位置，保留其逻辑结构
####  业界领先的性能表现（SOTA）
* Logics-Parsing-V2不仅在自建评测集LogicsDocBench上取得了业界最佳（SOTA）的效果，同时在权威的公开评测集OmnidocBench-v1.5上也取得了端到端模型SOTA效果（总分93.23）
github:  https://github.com/alibaba/Logics-Parsing
demo:  https://www.modelscope.cn/studios/Alibaba-DT/Logics-Parsing/summary
模型地址：  https://huggingface.co/Logics-MLLM/Logics-Parsing-v2https://www.modelscope.cn/models/Alibaba-DT/Logics-Parsing-v2
** 02
**
** 对比  Logics-Parsing升级了什么？
**
Logics-Parsing-V2是去年9月开源的Logics-Parsing的升级版本。它继承了Logics-Parsing模型的所有核心功能，同时在处理复杂文档方面展现出更为强大的性能，并且进一步扩展了对 Parsing-2.0 场景的支持，实现了对乐谱、流程图、思维导图以及代码/伪代码块的结构化解析。模型大小也从8B下降到了4B，推理更快。
** 03
**
** 训练范式与数据双轮驱动
**
Logics-Parsing-V2是基于多模态大模型的端到端文档解析模型，在Qwen3-VL-4B的基础上，采用SFT+GRPO两阶段方式训练而成。我们同时针对真实解析场景的复杂任务，构建了以复杂版面和STEM学科为特色的高质量解析数据集，其不仅涵盖多栏报纸、学术海报等极具挑战的版面，更延伸至 Parsing-2.0 场景，覆盖化学分子式、五线谱、代码/伪代码块、流程图与思维导图。另外在复杂版面文档的解析过程中，创新性地引入基于布局的强化学习机制，设计识别、检测、阅读顺序的多维度奖励机制，显著提升模型在复杂文档布局下的结构理解与内容排序能力。
** 04
**
** 模型表现如何？  **
####  权威开源评测OmniDocBench_v1.5评测：端到端模型SOTA
####  自建 LogicsDocBench 深度测评：展现复杂文档解析的全维度领先实力
#####  LogicsDocBench介绍
LogicsDocBench为自建综合评估基准，由 900 页精心挑选的 PDF 页面组成，涵盖了传统的 Parsing-1.0 任务以及新引入的 Parsing-2.0 场景。该基准旨在更全面地评估模型在解析复杂且多样化的真实世界文档时的能力，LogicsDocBench近期将会开源。该数据集分为三个核心子集：
** STEM 文档  **
侧重于高难度的学术和教育内容，涵盖物理、数学、工程和交叉学科等十多个领域。该子集旨在评估模型对数学公式、技术术语和结构化知识表示的深层理解。
** 复杂布局  **
包含具有挑战性的真实世界布局，如多栏文本、跨页表格、竖排书写以及图文混排。该子集用于全面评估模型的布局分析能力。
** Parsing-2.0 场景  **
针对对传统 OCR 系统构成了重大挑战的现代数字化和半结构化内容，包括：
* 化学分子式
* 乐谱
* 代码和伪代码块
* 流程图和思维导图
各模型在LogicsDocBench的表现
** 05
**
复杂案例效果展示
点击  “
欢迎留言一起参与讨论~