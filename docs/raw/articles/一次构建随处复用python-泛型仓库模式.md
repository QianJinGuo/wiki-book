---
source: wechat
source_url: https://mp.weixin.qq.com/s/LIjNSJOVlsYoqnzoxjRYaw
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-12
feed_name: 数据STUDIO
source_published: 2026-04-21
sha256: 28d063bf89925d91093f3d643386e635d2d78530d4c2efa22261e9313b1b997e
review_value: 5
review_confidence: 6
review_recommendation: worth-reading
---
# 一次构建，随处复用：Python 中的泛型仓库模式
#####  你还在为每个实体手写CRUD？这个Python泛型仓库模式让你一次编写，随处复用
一个真实场景：刚接手一个FastAPI项目，打开代码库，  ` UserRepository  ` 、  ` ProductRepository  ` 、  ` OrderRepository  ` ……每个文件都在重复同样的  ` save  ` 、  ` get  ` 、  ` update  ` 、  ` delete  ` 逻辑。复制粘贴了8次之后，我开始怀疑人生——我们真的需要为每个数据表写一遍相同的代码吗？
如果你也有同样的困惑，今天这篇文章会给你一个答案。我将带你用Python泛型和SQLAlchemy，实现一个  ** 类型安全、可扩展、可复用  ** 的通用仓库模式，让你从此告别重复的CRUD代码。
##  重复的代码，重复的痛苦
在大多数FastAPI或SQLAlchemy项目中，仓库层（Repository）长这样：
    class UserRepository:  
        def __init__(self, session: AsyncSession):  
            self._session = session  
        asyncdef save(self, user: User) -> User:  
            model = UserModel(name=user.name, email=user.email)  
            self._session.add(model)  
            await self._session.flush()  
            await self._session.refresh(model)  
            return self._to_entity(model)  
        asyncdef get(self, user_id: UUID) -> User | None:  
            result = await self._session.scalar(  
                select(UserModel).where(UserModel.id == user_id)  
            )  
            return self._to_entity(result) if result elseNone  
        # ... 更多方法  
然后你创建  ` ProductRepository  ` ——复制粘贴。
` OrderRepository  ` ——再次复制粘贴。
每个仓库都包含：
* 相同的CRUD逻辑
* 相同的分页逻辑
* 相同的错误处理
* 相同的SQLAlchemy操作模式
唯一变化的只有三样东西：
* ** 实体类型  ** （如  ` User  ` ）
* ** ORM模型类型  ** （如  ` UserModel  ` ）
* ** 实体与模型之间的映射  **
> ⚠️  ** 注意：这种重复代码是“复制粘贴综合症”的典型表现，90%的团队在这里踩坑——当业务逻辑需要修改时，你要在8个仓库里改8遍，漏改一个就是Bug。  **
##  解决方案：一个通用的抽象仓库
一个设计良好的通用仓库应该做到：
* 实现所有常见CRUD操作
* 支持分页、排序、存在性检查、计数
* 通过Python泛型保证类型安全
* 允许自定义实体与模型的映射
* 允许每个仓库自定义过滤条件
* 保持代码整洁、可扩展、易测试
下面是一份  ** 生产级  ** 的实现代码。
##  核心组件：实体基类
首先，需要一个所有领域实体共享的基类，保证统一的结构：
    from dataclasses import dataclass, field  
    from datetime import datetime, timezone  
    from uuid import UUID  
    @dataclass(kw_only=True)  
    class EntityBase:  
        id: UUID | None = None  
        created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))  
        updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))  
##  辅助工具：异常与排序
    class DatabaseException(Exception):  
        """数据库操作异常的统一包装"""  
        pass  
    from enum import StrEnum  
    class Ordering(StrEnum):  
        """排序方向，类型安全"""  
        asc = "asc"  
        desc = "desc"  
##  通用仓库实现
这是整个模式的核心。我把它拆成两部分讲解，但你可以直接复制使用。
    from abc import ABC, abstractmethod  
    from typing import Any, Generic, List, TypeVar  
    import sqlalchemy  
    from sqlalchemy import asc, desc, func, select  
    from sqlalchemy.exc import IntegrityError, SQLAlchemyError  
    from sqlalchemy.ext.asyncio import AsyncSession  
    # 假设你的Base类在这里定义  
    from .... import Base  
    from domain.value_objects.ordering import Ordering  
    from domain.entities.base import EntityBase  
    from domain.exceptions.common import DatabaseException  
    Entity = TypeVar("Entity", bound=EntityBase)  
    SqlAlchemyModel = TypeVar("SqlAlchemyModel", bound=Base)  
    class SqlAlchemyAbstractRepository(ABC, Generic[Entity, SqlAlchemyModel]):  
        # 子类必须指定具体的ORM模型类  
        model: type[SqlAlchemyModel]  
        def __init__(self, session: AsyncSession) -> None:  
            self._session = session  
        asyncdef save(self, entity: Entity) -> Entity:  
            """保存实体，返回包含数据库生成字段（如ID）的完整实体"""  
            model = self._entity_to_model(entity)  
            self._session.add(model)  
            await self._session.flush()  
            await self._session.refresh(model)  
            return self._model_to_entity(model)  
        asyncdef update(  
            self,  
            fields_to_update: dict[str, Any],  
            **filters,  
        ) -> int:  
            """根据过滤条件更新字段，返回受影响的行数"""  
            try:  
                filter_conditions = self._get_filters(**filters)  
                query = (  
                    sqlalchemy.update(self.model)  
                    .where(*filter_conditions)  
                    .values(fields_to_update)  
                )  
                result = await self._session.execute(query)  
                await self._session.flush()  
                return result.rowcount  # type: ignore[attr-defined]  
            except IntegrityError as exception:  
                await self._session.rollback()  
                raise exception  
            except SQLAlchemyError as exception:  
                await self._session.rollback()  
                raise DatabaseException from exception  
        asyncdef list_all(  
            self,  
            page: int = 1,  
            limit: int = 10,  
            order_by: str = "created_at",  
            ordering: Ordering = Ordering.asc,  
            **filters,  
        ) -> List[Entity]:  
            """分页列表查询，支持排序和过滤"""  
            query = select(self.model)  
            filter_conditions = self._get_filters(**filters)  
            query = query.where(*filter_conditions)  
            # 排序  
            query = query.order_by(  
                self._get_order_expression(order_by=order_by, ordering=ordering)  
            )  
            # 分页  
            offset = (page - 1) * limit  
            query = query.offset(offset).limit(limit)  
            result = await self._session.execute(query)  
            models = result.scalars().all()  
            return [self._model_to_entity(model) for model in models]  
        asyncdef get(  
            self,  
            **filters,  
        ) -> Entity | None:  
            """根据过滤条件获取单个实体"""  
            query = select(self.model)  
            filter_conditions = self._get_filters(**filters)  
            query = query.where(*filter_conditions)  
            model = await self._session.scalar(query)  
            return self._model_to_entity(model) if model elseNone  
        asyncdef exists(  
            self,  
            **filters,  
        ) -> bool:  
            """检查是否存在满足条件的记录"""  
            query = select(self.model)  
            filter_conditions = self._get_filters(**filters)  
            query = query.where(*filter_conditions)  
            result = await self._session.scalar(query)  
            return result isnotNone  
        asyncdef delete(  
            self,  
            **filters,  
        ) -> int:  
            """根据过滤条件删除记录，返回删除的行数"""  
            try:  
                query = sqlalchemy.delete(self.model)  
                filter_conditions = self._get_filters(**filters)  
                query = query.where(*filter_conditions)  
                result = await self._session.execute(query)  
                await self._session.flush()  
                return result.rowcount  # type: ignore[attr-defined]  
            except SQLAlchemyError as e:  
                await self._session.rollback()  
                raise DatabaseException from e  
        asyncdef count(  
            self,  
            **filters,  
        ) -> int:  
            """统计满足条件的记录数"""  
            filter_conditions = self._get_filters(**filters)  
            return (  
                await self._session.scalar(  
                    select(func.count()).select_from(self.model).where(*filter_conditions)  
                )  
                or0  
            )  
        @staticmethod  
        @abstractmethod  
        def _model_to_entity(model: SqlAlchemyModel) -> Entity:  
            """将ORM模型转换为领域实体——子类必须实现"""  
            raise NotImplementedError("Subclasses must implement _model_to_entity")  
        @staticmethod  
        @abstractmethod  
        def _entity_to_model(entity: Entity) -> SqlAlchemyModel:  
            """将领域实体转换为ORM模型——子类必须实现"""  
            raise NotImplementedError("Subclasses must implement _entity_to_model")  
        @abstractmethod  
        def _get_filters(self, **filters) -> List[Any]:  
            """将业务层过滤条件转换为SQLAlchemy查询条件——子类可重写"""  
            return []  
        @staticmethod  
        def _get_order_expression(  
            order_by: str, ordering: Ordering  
        ) -> sqlalchemy.UnaryExpression[str]:  
            """生成排序表达式"""  
            if ordering == Ordering.asc:  
                return asc(order_by)  
            return desc(order_by)  
##  泛型解析：用生活化类比理解
如果上面这段代码让你有点晕，我用一个类比帮你理清：
** 泛型就像订餐平台的模板  ** ：
* ` Entity = TypeVar("Entity", bound=EntityBase)  ` —— 这就像“我要一份饭”，但具体是盖浇饭还是炒饭，后面再定
* ` Model = TypeVar("Model", bound=Base)  ` —— 这就像“我要一个餐具”，具体是碗还是盘子，也后面再定
* ` SqlAlchemyAbstractRepository[Entity, Model]  ` —— 这个组合就像“我要一份（某种饭）搭配（某种餐具）的套餐”
当你创建具体仓库时：
    class UserRepository(SqlAlchemyAbstractRepository[User, UserModel]):  
        ...  
就相当于说：“我要一份  ** User饭  ** 装在  ** UserModel餐具  ** 里。”
IDE现在就能准确知道：
* ` save()  ` 接收  ` User  ` ，返回  ` User  `
* ` _model_to_entity()  ` 必须把  ` UserModel  ` 映射成  ` User  `
* 过滤条件只接受对  ` User  ` 有效的字段
> ⚠️  ** 关键点：Python虽然是动态语言，但通过类型提示和泛型，你可以获得编译时类型检查的能力。这在多人协作时，能避免无数“不小心传错参数”的Bug。  **
##  实战：创建具体的UserRepository
现在创建一个用户仓库，你会发现只需要写三件事：
1. 指定  ` model  ` 类
2. 实现映射逻辑
3. 定义支持的过滤条件
    class SqlAlchemyUserRepository(  
        SqlAlchemyAbstractRepository[User, UserModel],  
    ):  
        model = UserModel  
        def _entity_to_model(self, entity: User) -> UserModel:  
            model = UserModel(  
                name=entity.name,  
                email=entity.email,  
                role=entity.role,  
            )  
            # 如果实体已有ID（更新场景），保持ID  
            if entity.id:  
                model.id = entity.id  
            return model  
        def _model_to_entity(self, model: UserModel) -> User:  
            return User(  
                id=model.id,  
                name=model.name,  
                email=model.email,  
                role=model.role,  
                created_at=model.created_at,  
                updated_at=model.updated_at,  
            )  
        def _get_filters(self, **filters):  
            """支持三种过滤条件：id、email、role"""  
            conditions = []  
            if"id_filter"in filters:  
                conditions.append(UserModel.id == filters["id_filter"])  
            if"email_filter"in filters:  
                conditions.append(UserModel.email == filters["email_filter"])  
            if"role_filter"in filters:  
                conditions.append(UserModel.role == filters["role_filter"])  
            return conditions  
** 看到没？  ** 整个仓库就这么点代码。
* CRUD？已经处理好了
* 分页？已经处理好了
* 错误处理？已经处理好了
你的仓库只需要关注  ** 领域特有的逻辑  ** 。
##  为什么  ` _get_filters  ` 这么重要？
它让你的查询API既干净又灵活：
    # 查询管理员  
    admins = await user_repo.list_all(  
        role_filter="admin",  
        page=1,  
        limit=20  
    )  
    # 按邮箱查找单个用户  
    user = await user_repo.get(email_filter="john@example.com")  
    # 检查用户是否存在  
    exists = await user_repo.exists(email_filter="john@example.com")  
不需要为每个查询写单独的SQL，所有过滤条件统一通过  ` _get_filters  ` 转换为查询条件。
##  自定义错误处理：保留灵活扩展的空间
需要处理特定业务的数据库错误？只需覆盖方法：
    class SqlAlchemyUserRepository(...):  
        # ... 前面的代码  
        asyncdef save(self, entity: User) -> User:  
            try:  
                returnawait super().save(entity)  
            except IntegrityError as e:  
                await self._session.rollback()  
                # 检查是否是邮箱重复  
                if"ix_users_email"in str(e):  
                    raise UserAlreadyExistsError(entity.email)  
                raise  
> ⚠️  ** 注意：这里的关键是  ` await self._session.rollback()  ` ——忘记回滚会让session处于异常状态，后续操作都会失败。这是90%的人踩过的坑。  **
##  添加自定义方法：通用 ≠ 不能定制
通用仓库不代表不能添加特定查询：
    class SqlAlchemyUserRepository(...):  
        # ... 前面的代码  
        asyncdef get_by_email(self, email: str) -> User | None:  
            """按邮箱获取用户（业务常用）"""  
            returnawait self.get(email_filter=email)  
        asyncdef get_active_admins(self) -> List[User]:  
            """获取活跃管理员（业务特定）"""  
            returnawait self.list_all(  
                role_filter="admin",  
                status_filter="active"  
            )  
** 通用 ≠ 限制  ** ，而是  ** 从强大的基础上开始  ** 。
##  真实项目效果对比
在重构一个中等规模的FastAPI项目后，数据是这样的：
维度  |  重构前  |  重构后
---|---|---
仓库数量  |  8个  |  8个
单个仓库代码量  |  250-400行  |  30-50行
CRUD重复代码  |  每个仓库重复  |  0（全部复用）
修改分页逻辑  |  改8个地方  |  改1个地方
类型安全  |  ❌ 随意传参  |  ✅ 编译时检查
> ** 核心洞察：这种模式不仅减少了代码量，更重要的是——逻辑集中在一处，修改一次生效全局，Bug率显著下降。  **
##  为什么这个模式值得你采用？
** 1\. DRY原则落地  **
写一次，修一次，处处生效。
** 2\. 一致性保障  **
所有仓库行为统一，新人上手零学习成本。
** 3\. 类型安全  **
告别  ` Any  ` 和随意传递的字典，IDE能给你准确的代码补全。
** 4\. 可测试性  **
测试一次基类，所有仓库都得到测试覆盖。
** 5\. 可维护性  **
想加软删除？在基类改一次，所有仓库自动支持。
** 6\. 灵活性  **
需要特殊行为？覆盖方法即可，基类不限制你。
##  写在最后
从复制粘贴8个仓库，到用泛型基类一行行抽象出来，这个过程让我意识到一件事：
> ** 好的抽象不是炫技，而是当你需要修改代码时，发现只需要改一个地方。  **
通用仓库模式在Python生态中并不算新，但它结合  ` async  ` 、SQLAlchemy和泛型后，能给你的代码质量带来质的飞跃。下次你再新建一个实体时，不用再写那300行CRUD，只需30行映射和过滤逻辑。
如果你正在维护一个数据访问层臃肿的项目，建议  ** 逐个仓库迁移  ** ，而不是一次性全量替换。先迁移一个非核心的仓库，验证无误后再逐步推进。
###  核心内容
1. ** 原理  ** ：泛型+抽象基类，让CRUD逻辑一次性实现，类型安全有保障
2. ** 实践  ** ：子类只需实现映射和过滤，所有操作自动获得
3. ** 避坑  ** ：记得处理事务回滚，自定义过滤用  ` _get_filters  ` 统一入口
** 你在项目中有没有遇到过类似的重复代码困扰？如果让你设计一个通用仓库，你会加入哪些额外的通用方法（比如批量操作、乐观锁）？欢迎在评论区分享你的思路。  **
#####  🏴‍☠️宝藏级🏴‍☠️ 原创公众号『  ** 数据STUDIO  ** 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括  可戳  👉[ Python ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978822768771072&scene=173&from_msgid=2247519294&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ MySQL ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2023684574089658370&scene=173&from_msgid=2247519619&from_itemidx=2&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据分析 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978820940054530&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据可视化 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974991176839544834&scene=173&from_msgid=2247519244&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 机器学习与数据挖掘 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1963494160565354497&scene=173&from_msgid=2247512171&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 爬虫 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2318258648965644288&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** 等，从入门到进阶！
长按👇关注- 数据STUDIO -设为星标，干货速递