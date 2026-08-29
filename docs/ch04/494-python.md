# 一次构建随处复用python-泛型仓库模式

> 📊 Level ⭐⭐ | 7.7KB | `entities/一次构建随处复用python-泛型仓库模式.md`

# 一次构建随处复用python-泛型仓库模式

## 摘要

这篇文章针对 FastAPI/SQLAlchemy 项目中 Repository 层的"复制粘贴综合症"：每个实体都维护一份几乎相同的 CRUD 代码，唯一变化的只有实体类型、ORM 模型类型与二者间的映射。作者用双 `TypeVar` 加 `ABC` 抽象基类，把分页、排序、错误处理等通用逻辑一次写进 `SqlAlchemyAbstractRepository[Entity, SqlAlchemyModel]`，子类只需实现映射与过滤，实测单个仓库从 250-400 行降到 30-50 行。

## 核心要点

- **问题锚点**：8 个仓库、每份 250-400 行的重复 CRUD；变化点只有三个——实体类型、ORM 模型类型、实体↔模型映射，其余逻辑完全相同，漏改一处就是 Bug。
- **双 TypeVar 约束**：`Entity = TypeVar("Entity", bound=EntityBase)` 与 `SqlAlchemyModel = TypeVar("SqlAlchemyModel", bound=Base)` 把领域实体与 ORM 模型绑定到各自基类边界，让 IDE 在动态语言里获得编译期类型检查与自动补全。
- **基类职责**：`SqlAlchemyAbstractRepository(ABC, Generic[Entity, SqlAlchemyModel])` 一次性实现 save/update/list_all/get/exists/delete/count 七类操作，并内置分页、排序（`Ordering` StrEnum 保证方向类型安全）与异常包装（`DatabaseException` 统一承接 SQLAlchemyError）。
- **子类契约**：只需声明 `model` 类、实现 `_model_to_entity()` / `_entity_to_model()` 两个映射方法与 `_get_filters()` 过滤转换，即可获得基类全部能力。
- **_get_filters 统一查询入口**：业务侧命名参数（如 `role_filter="admin"`、`email_filter="john@example.com"`）在此统一转换为 SQLAlchemy 查询条件，无需为每个查询单独编写 SQL。
- **回滚纪律**：覆盖基类方法做自定义错误处理时，必须先行 `await self._session.rollback()`，否则会话停留在异常状态，后续所有操作都会失败——这是文中强调的 90% 开发者踩过的坑。
- **通用 ≠ 不能定制**：基类之上仍可叠加业务方法（如 `get_by_email`、`get_active_admins`），它们复用基类查询能力组合而成，"从强大的基础开始"而非被基础限制。

## 深度分析

### 三个变化点直接决定泛型参数与抽象方法的设计

文章先诊断问题再给方案：所有 Repository 的差异收敛为实体类型、ORM 模型类型、实体↔模型映射三个变化点。这个三分法直接推导出泛型系统的形状——两个 `TypeVar` 参数对应前两个变化点，两个抽象映射方法对应第三个；不变的部分（CRUD、分页、排序、事务与异常处理）全部沉淀为基类实现。这是设计泛型抽象的一般原则：先枚举变化点，把变化点参数化或抽象化，把不变点留在共享基类。

### 类型安全：动态语言里的"编译期"防线及其边界

`bound=EntityBase` 与 `bound=Base` 让 IDE 在实例化 `UserRepository(SqlAlchemyAbstractRepository[User, UserModel])` 后能精确推断：`save()` 接收 User 返回 User、映射方法必须产出对应实体、过滤条件只接受对 User 有效的字段。作者用"订餐模板"类比——TypeVar 是"要一份饭"，模型是"要一副餐具"，实例化即"User 饭装在 UserModel 餐具里"。但 Python 泛型只作用于静态检查、运行时并不强制，因此模式把防御压在运行时纪律上：`Ordering` 枚举杜绝排序方向笔误、`DatabaseException` 统一错误出口、失败路径统一回滚。类型提示负责"少犯错"，异常与回滚设计负责"出错后可恢复"，两者缺一不可。

### _get_filters 是开闭原则的朴素实现

`_get_filters(**filters)` 把调用侧的业务语义翻译为 SQLAlchemy 查询条件，是整座抽象里最值得模仿的钩子：基类所有查询方法都经由它取条件，子类只需覆写这一个方法即可扩展任意查询组合，基类代码一行不动——这正是开闭原则（对扩展开放、对修改关闭）的朴素落地。同时它也保证了查询 API 的整洁：`list_all(role_filter="admin", page=1, limit=20)` 这类调用既自文档化，又免去为每个查询单独拼 SQL。若某个新查询无法用现有 filter 表达，往往不是 filter 不够多，而是抽象粒度需要重新审视的信号。

### 变更成本集中是这套模式真正的回报

文章给出的重构前后对比很有说服力：仓库数量不变（8 个），单个仓库代码量从 250-400 行降至 30-50 行，CRUD 重复代码归零，分页逻辑修改从 8 处变为 1 处，类型安全从"随意传参"变为"编译期检查"。核心理念是"好的抽象不是炫技，而是你需要修改代码时只需改一个地方"：测试基类一次即覆盖全部仓库，新增软删除等横切能力只需改基类一处、所有子类自动获得。这种收益的度量维度不是"代码少了多少行"，而是"一次变更影响的代码位置有多少处"——后者才是维护成本的真实代理指标。

## 实践启示

1. **从第三个重复仓库开始抽象**：不必等到 8 个仓库全部复制完再重构；发现第三份雷同 CRUD 时即可停下，把共同逻辑抽成泛型基类，越早抽取，重构成本越低。
2. **逐仓库渐进迁移**：对存量项目，先迁移一个非核心仓库验证模式可行，确认无误后再逐步铺开，避免一次性全量替换带来的回归风险。
3. **用 _get_filters 收敛查询逻辑**：所有查询条件统一经该入口转换，不散落在 service 层；新增查询先尝试用现有 filter 组合表达，表达不了再考虑扩展基类。
4. **覆盖方法先回滚**：自定义错误处理（如把邮箱唯一索引冲突转译为业务异常）时先 `await self._session.rollback()`，再判断异常类型；忘记回滚会让 session 进入不可用状态，殃及后续请求。
5. **评估 ROI 再决定是否引入**：实体仅两三个时手写 CRUD 更直白；实体多、团队大、数据访问层 Bug 修复频繁时，基类"改一处、测一次、全员一致"的收益才显著——不要为抽象而抽象。
6. **可把该模式作为 AI Coding 的领域知识**：Repository 接口高度标准化、变化点可枚举，把基类实现作为上下文交给编码 Agent，它能据此为新的数据表生成完整仓库子类，生成质量的关键从"会不会写 CRUD"转移到"是否准确理解实体与模型的映射关系"。

## 相关实体

- [一次构建，随处复用：Python 中的泛型仓库模式](ch04/494-python.html) — 同源姊妹条目（同一微信文章的另一个入库版本）
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/496-agent-skills.html)
- [民生银行基于规格驱动开发（SDD）的 CodeAgent 私域研发探索与实践](../ch03/006-agent.html)
- [Agent 开发范式演进：从环境工程出发](../ch03/006-agent.html) — 反向链接本条目

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/一次构建随处复用python-泛型仓库模式.md)

---

