# 一次构建，随处复用：Python 中的泛型仓库模式

## Ch01.666 一次构建，随处复用：Python 中的泛型仓库模式

> 📊 Level ⭐⭐ | 6.6KB | `entities/一次构建随处复用python-中的泛型仓库模式.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/一次构建随处复用python-中的泛型仓库模式.md)
从微信文章 [一次构建，随处复用：Python 中的泛型仓库模式](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/一次构建随处复用python-中的泛型仓库模式.md) 提取。

## 核心内容
source_url: https://mp.weixin.qq.com/s/LIjNSJOVlsYoqnzoxjRYaw

### 主要章节
- #####  你还在为每个实体手写CRUD？这个Python泛型仓库模式让你一次编写，随处复用
- ##  重复的代码，重复的痛苦
- ##  解决方案：一个通用的抽象仓库
- ##  核心组件：实体基类
- ##  辅助工具：异常与排序
- ##  通用仓库实现
- ##  泛型解析：用生活化类比理解
- ##  实战：创建具体的UserRepository
- ##  为什么  ` _get_filters  ` 这么重要？
- ##  自定义错误处理：保留灵活扩展的空间
- ##  添加自定义方法：通用 ≠ 不能定制
- ##  真实项目效果对比
- ##  为什么这个模式值得你采用？
- ##  写在最后
- ###  核心内容

## 深度分析
**重复 CRUD 是"复制粘贴综合症"的典型症状。** 文章指出了一个在 FastAPI/SQLAlchemy 项目中极其普遍的问题：每个实体（User、Product、Order）都维护一个 Repository 类，其中 save、get、update、delete 的实现几乎完全相同，唯一变化的是实体类型、ORM 模型类型和实体-模型映射三样东西。当业务逻辑需要修改时，开发者在8个仓库里改8遍，漏改一个就是 Bug。这是典型的 DRY（Don't Repeat Yourself）原则被忽视后的技术债累积。
**泛型仓库模式的核心价值：类型安全 + 代码复用。** Python 的泛型（Generic Type）允许在 Repository 类级别定义与具体实体无关的 CRUD 逻辑，同时在实例化时通过类型参数保证类型安全。具体来说，BaseRepository 接受两个类型参数：实体类型（User、POrder 等）和 ORM 模型类型，实体-模型之间的映射通过 `_to_entity()` 和 `_to_model()` 方法注入。这使得 save、get、find_all、update、delete 这些逻辑只需写一次，在所有实体间共享。
**"三个变化点"是整个模式的设计锚点。** 文章提炼出 Repository 层所有变化的来源只有三个：实体类型、ORM 模型类型、实体与模型的映射。这个三分法直接决定了泛型参数的数量（两个：Entity 和 Model）和抽象方法的数量（两个映射方法）。这是设计泛型系统时最重要的原则：先识别所有变化点，再把变化点作为参数暴露出来，不变化的部分作为共享逻辑保留。
**Filter 模式的自定义扩展是易忽视的精华。** `_get_filters()` 方法允许每个具体 Repository 注入自己的查询过滤逻辑，而不必修改基类。这是开闭原则（Open/Closed Principle）在 Python 里的朴素实现：扩展行为通过覆写方法实现，而非修改共享基类。如果这个方法设计得好，具体 Repository 的新增查询条件只需重写一个方法；如果设计得差，就会走向复制粘贴的老路。
**Repository 模式对 AI Coding 的特殊意义。** 在 AI Coding 场景中，Repository 层的实现是最适合泛化的：它的接口（save、get、update、delete）是标准化的，变化点（映射关系）是可枚举的。当 AI Coding 工具能够理解这个模式后，给它一个新的数据表描述，AI 可以自动生成完整的 Repository 子类。这意味着 AI 生成代码的质量瓶颈从"能写 CRUD"变成了"是否准确理解实体-模型映射关系"——这是一个更容易被规范约束的问题。

## 实践启示
1. **在项目启动阶段先实现 BaseRepository，不要先写具体 Repository。** 如果你从第一个实体就复制粘贴了 UserRepository → ProductRepository → OrderRepository，到第三个的时候停下来，把三个里的共同逻辑抽出来形成 BaseRepository。这样做有两个好处：减少后续实体的开发工作量；同时强制你第一次就从接口层面思考 Repository 层设计，而不是先写实现再重构。
2. **用泛型类型参数显式声明变化点。** 在 BaseRepository 的泛型声明中，`Entity` 和 `Model` 两个类型参数本身就是接口契约的一部分——任何阅读代码的人看到 `class UserRepository(BaseRepository[User, UserModel])` 就立刻知道这个类处理的是哪两个类型的映射。没有类型参数的 Repository 是隐性契约，是技术债的来源。
3. **Filter 逻辑是 Repository 扩展性的核心，优先实现 `_get_filters()` 模式。** 每个子类的查询逻辑应该完全定义在 `_get_filters()` 里，而不是散落在 service 层或其他地方。这使得查询逻辑集中、可测试、可审计。如果发现某个查询条件无法在 `_get_filters()` 中表达，这是你的 Repository 抽象粒度需要重新设计的信号。
4. **用这套模式作为 AI Coding 工具的领域知识输入。** 当你向 AI Coding Agent 描述一个新的数据表时，给它 BaseRepository 的实现作为上下文，让它理解"你需要生成的是 Entity 类、Model 类、和继承 BaseRepository 的 Repository 类，映射关系用 _to_entity / _to_model 定义"。这种规范化的领域知识注入，比让 AI 自由发挥生成 Repository 类的代码质量要高得多。
5. **在 Code Review 时检查 Repository 层是否有重复逻辑。** 复制粘贴的 Repository 是可以直接被检测到的 review  smell。如果在 PR 里看到两个 Repository 类的 save 方法几乎完全一样，应该打回要求重构为泛型基类。这不是过度工程，而是对技术债的及时止损。

## 相关实体

- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/245-skill.md)
- [民生银行基于规格驱动开发（SDD）的 CodeAgent 私域研发探索与实践](ch03/044-agent.md)

---

