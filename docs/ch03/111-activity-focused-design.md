# Activity-Focused Design

## Ch03.111 Activity-Focused Design

> 📊 Level ⭐⭐ | 5.2KB | `entities/activity-focused-design.md`

## 核心要点

- Activity-Focused Design 以用户**活动**（Activity）为中心设计，而非人口统计或功能列表
- 三个核心概念：**Goal**（目标）、**Activity**（活动）、**Task**（任务）
- 适用于 UX 设计中的任务分析（Task Analysis）、Activity Theory、Job-to-be-Done 框架
- 该方法强调理解用户为达成目标而执行的活动，而非简单地按人口属性划分用户

## 深度分析

Activity-Focused Design 的核心价值在于将设计视角从"用户是谁"转向"用户做什么"。传统以人口统计或功能为中心的设计往往忽略用户达成目标的实际过程，而活动导向设计则将**活动**（Activity）作为分析的基本单元，关注人们为实现目标而采取的行动及其方式。

**Goal / Activity / Task 三层模型**是该方法的基础框架：

- **Goal（目标）**：用户期望达成的最终状态，如"灯泡连接到手机应用"或"灯光已打开"
- **Activity（活动）**：为达成目标而进行的一系列任务组合，如"将灯泡与应用连接"和"打开灯光"
- **Task（任务）**：执行过程中的单一动作或工作单元，如"打开应用"、"点击灯泡图标"、"插入灯泡"

这个分层模型帮助设计师在适当的抽象层次上进行分析——过于具体（如"移动手指"）或过于笼统（如"使用应用"）的分解都不利于设计决策。

**Task Analysis 四步流程**是 Activity-Focused Design 中最常用的方法：

1. **确定目标**：识别用户使用产品最核心的目标是什么
2. **确定任务**：拆解用户为达成目标必须执行的具体任务步骤
3. **文档化**：以任务分析图、分层任务图、序列图或流程图等形式记录目标和任务
4. **分析改进**：识别不必要的、低效的或反效果的任务，寻找可以移除或优化的环节

值得注意的是，当设计**全新产品**时，任务描述应保持界面独立性（如"打开灯泡"而非"点击开灯按钮"），以保留设计方案的多样性；而当分析**现有系统**时，包含具体界面元素的任务描述（如"使用搜索框找到设备"）则更有价值。

**Strengths（优势）**：

- 特别适用于解决方案的成功依赖于用户按特定顺序完成一系列任务的场景，能有效揭示设计缺口和优化机会
- 对离散任务的关注**自然转化为数字体验的设计指导**——任务分析的成果可直接映射为界面交互设计

**Weaknesses（劣势）**：

- 高度聚焦于任务和目标，**不自动导向对非任务维度**的洞察，如用户情绪状态、社会压力、使用规范等
- 容易陷入**回顾性设计**——如果信息来自对用户当前任务的分析，可能难以想象和设计全新的交互方式

任务分析并非人类中心设计的替代方案，而是**补充性**方法。例如在人类中心设计的研究阶段，可用任务分析发现用户解决问题的步骤；在后期阶段，可用它确保设计和原型支持重要的用户活动。

## 实践启示

1. **以活动作为设计锚点**：在项目初期明确要支持的核心活动和目标，而不是从功能列表出发设计。活动是连接用户需求与设计方案的有效中间层。

2. **选择适当的分析粒度**：分解任务时避免过于具体（单个手指动作、视线移动）或过于笼统（"完成任务"）。找到一个对设计目标有指导意义的中间层次。

3. **根据设计阶段选择任务描述方式**：

   - 全新产品设计 → 使用界面无关的抽象描述，保留设计自由度
   - 现有产品优化 → 使用具体界面元素描述，直接指导交互改进

4. **与其他方法互补使用**：任务分析不覆盖情绪、社会因素等维度，可结合用户访谈、问卷调查、5 Why 等方法揭示任务背后的深层原因。

5. **寻找任务优化机会**：分析时重点关注可移除、不必要的或低效的任务步骤。例如当设备始终通过蓝牙连接时，"打开蓝牙"这一步可以省略。

6. **警惕回顾性设计倾向**：在分析现有用户行为时，主动思考"是否有全新的交互方式可以实现同样目标"，避免被当前任务流程束缚创新思维。

7. **产出多样化**：任务分析的结果可以多种形式呈现——简单的任务分析图、分层任务图、序列图、流程图等，选择团队最易理解和沟通的形式即可。

## 相关实体
- [Icon Pack Websites Designers Should Bookmark](ch03/119-icon-pack-websites-designers-should-bookmark.md)
- [Blog.Tubikstudio.Com Form Over Function Mistakes](https://github.com/QianJinGuo/wiki/blob/main/entities/blog.tubikstudio.com-form-over-function-mistakes.md)
- [Designing Small Is Harder Than Designing Big Ux Magazine](ch03/088-designing-small-is-harder-than-designing-big-ux-magazine.md)
- [Deepmind Ai Pointer](ch04/310-ai.md)
- [Qoder Skill Ui](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/activity-focused-design.md)

---

