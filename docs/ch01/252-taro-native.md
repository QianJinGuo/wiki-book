# 京东 Taro Native 框架静态布局直渲提速

## Ch01.252 京东 Taro Native 框架静态布局直渲提速

> 📊 Level ⭐ | 2.3KB | `entities/京东-taro-native-框架静态布局直渲提速.md`

# 京东 Taro Native 框架静态布局直渲提速

#  京东 Taro Native 框架静态布局直渲提速

京东零售技术  京东零售技术  [ 京东技术 ](<javascript:void\(0\);>)

__ _ _ _ _

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

** 技术背景  **
Taro Native是京东自研的跨平台移动应用开发框架，支持鸿蒙、iOS、Android三端应用开发，实现一次开发、多端部署。 随着秒送业务功能持续扩展，在华为鸿蒙低端机型上出现严重滑动卡顿，影响用户体验。该页面单张卡片包含100+个元素（图片、文本、容器等），渲染耗时显著，其他端亦存在体验下降。本次优化重点针对鸿蒙端，通过性能分析与调优提升用户体验。

** 01  **

** 性能分析  **

页面构成

* 外层容器：  ` WaterFlow  ` 实现瀑布流列表

* 单元项：每个  ` FlowItem  ` 承载一张商家卡片

* 卡片构建：TML 模板 → CAPI 创建 Node Tree → 挂载至 ArkTS 侧  ` NodeContent  `

##  卡片渲染流程

1\.  页面滑动时，WaterFlow预加载H:Preload FlowItem，调用Repeat.GetFrameChildByIndex获取可复用组件并更新数据，投递解析任务到element线程。

2\.  element线程对TML业务代码进行解析并生成Virtual Dom、CSS Info、yoga渲染树，投递测量布局任务到render线程。

3\.  render线程基于yoga布局引擎对渲染树进行测量布局，同时生成节点创建、属性设置等命令，投递命令集合到主线程。

4\.  主线程分析命令，调用CAPI接口创建节点、设置属性、更新布局，并将根节点挂载到ArkUI的ContentNode。

5\.  主线程OnVsync时触发Node Tree的系统测量、布局后，发送给render_service渲染上屏。

从上面流程中可以观察到，滑动卡顿的根源在于  ** 主线程过载  ** ，应聚焦阶段  ** 1、4、5进行深入优化。  **

##  ** 瓶颈定位  **

** 阶段1：FlowItem预加载耗时24ms，各区分别

---

