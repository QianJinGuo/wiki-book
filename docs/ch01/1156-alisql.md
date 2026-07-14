# AliSQL 向量技术解析（一）：存储格式与算法实现

## Ch01.1156 AliSQL 向量技术解析（一）：存储格式与算法实现

> 📊 Level ⭐⭐ | 3.0KB | `entities/alisql-向量技术解析一存储格式与算法实现.md`

# AliSQL 向量技术解析（一）：存储格式与算法实现

**来源**: 阿里技术

**发布日期**: 2025-11-19

**原文链接**: https://mp.weixin.qq.com/s/4fLgnwhIuJe76dX89Mv16A

---

这是 2025 年的第 129 篇文章

（ 本文阅读时间：15分钟 ）

01

背景

随着 AI 与大模型应用的普及，高维向量作为表征复杂数据（如文本、图像、语音）的关键载体，其存储与高效检索需求在推荐系统、图像检索、自然语言处理等领域快速扩展，对数据库技术提出了新的挑战。向量应用场景催生了专用的向量数据库，也推动了传统数据库对向量能力的支持。

在此背景下，PostgreSQL 通过 pgvector 插件实现了向量的高效检索能力，而 MySQL 生态则长期缺乏原生支持。虽然在 MySQL 9.0 发布了 VECTOR 数据类型，但其向量距离计算函数仅支持在 HeatWave 中使用，且未提供通用的向量索引能力。这一技术空白使得企业需依赖独立部署的向量数据库或迁移数据以实现高维计算需求。

AliSQL 基于 MySQL 8.0 原生扩展了企业级向量数据处理能力，提供开箱即用的向量化解决方案，通过标准 SQL 接口无缝集成高精度向量匹配与复杂业务逻辑，助力企业以低成本、高兼容性架构快速落地 AI 创新应用。

本文基于 AliSQL 8.0 20251031 版本，聚焦向量索引的核心实现，从存储格式到算法实现，帮助读者更好地了解和使用向量能力。

02

向量使用示例

AliSQL 原生支持最高 16,383 维向量数据的存储及计算，集成主流向量运算函数包括余弦相似度（COSINE）、欧式距离（EUCLIDEAN），并支持对全维度向量列建立基于 HNSW（Hierarchical Navigable Small World）算法构建的向量索引。

创建带有向量索引的表，插入数据并进行向量搜索。

# 创建带有向量索引的表CREATE TABLE `t1` (  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  `animal` VARCHAR(10),   `vec` VECTOR(2) NOT NULL, # 新增vector类型列  VECTOR INDEX `vi`(`vec`) m=6 distance=cosine # 显示指定m和distance  );  
# 插入数据INSERT INTO `t1`(`animal`, `vec`) VALUES  ("Frog", VEC_FROMTEXT("[0.1, 0.2]")),  ("Dog", VEC_FROMTEXT("[0.6, 0.7]")),  ("Cat", VEC_FROMTEXT("[0.6, 0.6]"));  
# 向量搜索SELECT `animal`, VEC_DISTANCE(`vec`, VEC_FROMTEXT("[0.1, 0.1]")) AS `distance` FROM t1 ORDER BY `distance`;

结果示例

|--------|---------------------------|| animal | distance                  ||--------|---------------------------|| Cat    | 0.00000001552204198507212 || D

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/alisql-向量技术解析一存储格式与算法实现.md)

---

