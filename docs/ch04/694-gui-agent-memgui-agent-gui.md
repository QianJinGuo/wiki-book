# 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

## Ch04.694 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

> 📊 Level ⭐⭐⭐ | 2.7KB | `entities/让gui-agent不再边做边忘快手浙大提出memgui-agent攻克长程gui任务.md`

# 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

##### MemGUI-Agent团队 投稿   
量子位 | 公众号 QbitAI

手机GUI Agent正在从「看懂屏幕、点击按钮」走向更复杂的跨App自动化任务：

> 查商品参数、记笔记、更新通讯录、阅读新闻、整理社交媒体信息……

这些任务听起来并不复杂，但对现有手机GUI Agent来说，一个核心难题始终存在：**任务一长，就容易忘。**

在短程任务中，多模态大模型驱动的GUI Agent已经能较好理解截图、推理用户目标，并执行点击、输入、滑动等操作。

但一旦任务跨越几十步、多个App、多次页面跳转，Agent就会遇到明显的上下文退化：前面看到的价格、联系人、规格、日期、验证码、待写入文本等关键信息，可能在后续步骤中被稀释、转述错误、截断，甚至完全遗忘。

针对这一问题，来自**浙江大学APRIL实验室和快手主站技术部** 的研究者提出了**MemGUI-Agent** ：一个面向长程手机GUI任务的端到端Agent。

  * 它的核心思想不是简单把prompt变得更长，而是让Agent在执行UI操作的同时，主动决定「该压缩什么历史」「该记住什么UI事实」「该如何

## 要点
- * 论文同步开源了截至目前平均步数最长的手机GUI Agent开源数据集**MemGUI-3K** 。
- * 使用MemGUI-3K训练得到的MemGUI-8B-SFT刷新了手机GUI Agent的两个最具挑战的长程任务评测基准**MemGUI-Bench和MobileWorld的open-data模型的最好成绩** 。
- 论文的第一作者为浙江大学APRIL实验室的博士生刘广义，通讯作者为浙江大学刘勇教授。MemGUI-Agent**全链路开源** ，代码、数据、模型、训练/评测pipeline都已开放。
- [ 0.5倍 ](<javascript:;>)[ 0.75倍 ](<javascript:;>)[ 1.0倍 ](<javascript:;>)[ 1.5倍 ](<javascript:;>)[ 2.0倍 ](<javascript:;>)
- [ 超清 ](<javascript:;>)[ 流畅 ](<javascript:;>)
- 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/让gui-agent不再边做边忘快手浙大提出memgui-agent攻克长程gui任务.md)

---

