# 10 Common Component Architecture Mistakes in Figma Design Systems

## Ch03.023 10 Common Component Architecture Mistakes in Figma Design Systems

> 📊 Level ⭐ | 7.5KB | `entities/10-common-component-architecture-mistakes-in-figma-design-systems.md`

## 核心要点
- Newsletter article, source: https://zeroheight.com/blog/10-common-component-architecture-mistakes-in-figma-design-systems/
- 设计系统组件架构的十大常见错误及解决方案
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/10-common-component-architecture-mistakes-in-figma-design-systems.md)

## 相关实体

- [10 common component architecture mistakes in Figma design systems](https://github.com/QianJinGuo/wiki/blob/main/entities/component-architecture-mistakes-figma-zeroheight.md)
- [Agentic Systems Extreme Co-Design（NVIDIA 极简协同设计）](ch04/502-agent.md)
- [What the design-to-code loop unlocks](https://github.com/QianJinGuo/wiki/blob/main/entities/design-to-code-loop-figma.md)

## 深度分析
本文系统性地梳理了Figma设计系统中组件架构的十大错误，这些问题直接关系到设计系统的可维护性、可扩展性以及设计-开发协作效率。
**架构哲学：从"垃圾进垃圾出"到"质量进质量出"**
文章开篇引用"Garbage in, garbage out"这一经典表述，强调设计系统作为基础设施层，其资产质量直接影响用户体验。当设计师从组件库中使用构建不良的组件时，两种情况会发生：要么牺牲质量保持一致性，导致工作效率下降；要么放弃组件自行构建，破坏一致性。两种情况都会损害设计系统的信任度。
**错误分类与系统性根因分析**
十项错误可归纳为四类核心问题：
1. **性能与可扩展性矛盾**（错误1、9）

   - 使用count/# of items变体导致文件内存膨胀
   - wrapping变体使内存消耗翻倍
   - 变体是Figma中最"昂贵"的属性类型，相比string和boolean prop，每个变体都会在后台渲染
2. **语义与交互设计混乱**（错误2、10）

   - 图标本身不具备交互性，添加交互状态会语义混淆
   - 混用"state"变体包含hover、error、disabled等多种不同性质状态，导致组件API混乱
3. **设计-开发协作断裂**（错误3、4、7）

   - 过度使用布尔值破坏与工程的API对齐
   - 用变体处理主题/上下文导致批量更新困难
   - 预添加点击交互反而增加消费者工作负担
4. **技术债务累积**（错误5、6、8）

   - 用Figma做项目管理导致状态信息过时
   - 使用形状/分组而非Frame限制Auto Layout能力
   - 未命名图层导致Override丢失风险
**技术细节的关键发现**
关于文件内存问题，文章指出每个变体在实例放置到画布时都会在后台渲染。这解释了为什么列表类UI元素（复选框、表单、单选按钮、表格行等）通常响应较慢。
关于Auto Layout，文章特别指出使用1px高度的Frame填充颜色优于0px高度的线条+1px描边，因为线条高度为0px会导致视觉对齐问题。
**Slot与Instance Swapping的核心价值**
错误1的解决方案强调使用Slot功能或instance swapping作为"伪Slot"。这反映了组合式设计（composability over inheritance）原则的重要性。

## 实践启示
**设计系统构建者：**
1. **变体使用策略**

   - 避免创建"count"或"items number"类变体，改用Slot或instance swapping
   - wrapping变体改用Auto Layout wrapping替代
   - state变体应按关注点分离：Focus/Selected/Disabled/Populated应为布尔值，Error作为验证反馈独立处理
2. **主题与上下文管理**

   - 使用Variables和Modes替代变体处理主题切换
   - Schema 2025已扩展Modes到所有计划，为主题切换提供原生支持
3. **布尔值API设计**

   - theme=dark优于Dark mode=true
   - 减少属性面板中的布尔值数量，降低认知负载
   - 考虑Code Connect等代码同步工具的兼容性
**设计工程师：**
1. **图层命名规范**

   - 所有图层必须显式命名，避免Override丢失
   - 暴露嵌套实例属性时，图层命名直接影响属性面板可读性
   - 可使用Figma AI功能批量重命名
2. **Frame优先原则**

   - 使用Frame替代Shape以支持Auto Layout
   - Frame在Code Connect和Dev Mode中显示为组件而非SVG，避免开发者困惑
3. **交互状态设计**

   - 图标本身不应包含交互状态，交互状态应添加到包含图标的UI元素上
   - 避免在通用组件上预添加on-click交互，仅在可切换元素（toggle、checkbox）上添加
**设计系统治理：**
1. **工具专用性**

   - 使用Jira、Monday、Trello等专用工具进行项目跟踪，避免在Figma中使用emoji表示状态
   - 利用Figma的"mark ready for dev"功能替代手动标注
2. **持续维护心态**

   - 将设计系统视为活的产品而非完成品
   - 建立组件生命周期管理机制
   - 定期审计组件使用情况，识别技术债务
**跨职能协作：**
1. **API对称性**

   - Figma组件API与代码实现应保持对称
   - 考虑Code Connect等工具的集成需求
   - 属性命名应同时服务于设计师和开发者

---

