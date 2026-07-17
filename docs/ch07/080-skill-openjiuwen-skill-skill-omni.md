# 让Skill“有图可依”：openJiuwen首发多模态Skill范式Skill-Omni

## Ch07.080 让Skill“有图可依”：openJiuwen首发多模态Skill范式Skill-Omni

> 📊 Level ⭐⭐ | 2.7KB | `entities/让skill有图可依openjiuwen首发多模态skill范式skill-omni.md`

# 让Skill“有图可依”：openJiuwen首发多模态Skill范式Skill-Omni

##### 允中 发自 凹非寺  
量子位 | 公众号 QbitAI

Skill让Agent不必每次都从零开始摸索，而是可以复用已有的任务经验，但一个明显的短板始终存在：

今天写给Agent的Skill几乎全是**纯文本** ，修图该修到什么程度、界面上该点哪个按钮，这些“看了才明白”的知识，一直塞不进一份Markdown文档。

针对这一问题，openJiuwen社区正式发布**Skill-Omni** ——业界最早工程化落地的多模态Skill范式。

**它让Agent的经验从“读得懂”升级为“看得见”，把网页和视频中的视觉知识，沉淀为Agent可复用的多模态Skill。**

> 给Agent的说明书，第一次有了插图和参考图。

具体来说，用户只需提供一个网页链接或一个B站视频链接，JiuwenSwarm中开箱即用的skill-omni-creation就会自动提取其中的关键截图、界面状态和操作脉络，**生成Agent可直接读取复用的多模态Skill** 。

这也是继SwarmSkill、SwarmFlow之后，openJiuwen在Skill工程化方向上的又一次快速迭代。

## 要点
- 这在代码生成、文档处理等任务中足够有用；可一旦Agent开始处理视觉任务、GUI任务，局限立刻显现——**有些任务，本来就不是“说清楚”的，而是“看明白”的。**
- 人类也许能领会，但对Agent来说过于模糊：主体在哪里？柔和到什么程度？有没有参考效果？
- **这些问题仅靠文字很难给出稳定答案。** 真正的知识藏在调整前后的视觉差异里：有了前后对比图，Agent才能看到**“调整到什么程度才算合理”** 。
- 但“设置”可能是齿轮图标，也可能藏在头像菜单下；“高级选项”可能需要滚动页面才能看到；“导出配置”可能是按钮，也可能是下拉菜单里的某个条目，界面里还有多个相似按钮。
- 还有更被低估的**视频教程** ：大量技能不写在文档里，而藏在软件录屏和操作演示中。
- 界面长什么样、操作前后有何变化、结果是否符合视觉预期。全部压缩成文字，既费笔墨，又丢失空间关系和视觉细节。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/让skill有图可依openjiuwen首发多模态skill范式skill-omni.md)

---

