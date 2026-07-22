---
title: 在 RDS PostgreSQL 中实现 RaBitQ 量化
source_url: https://mp.weixin.qq.com/s/KGqbnolHh6sJU0kDICuUwQ
publish_date: 2026-05-14
tags: [wechat, article, openai, rag]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 57c33172782391574ee6c17a5d7e8d6068dc6190bc7cf14d9499c68010623787
---
# 在 RDS PostgreSQL 中实现 RaBitQ 量化
#
一、向量检索与 pgvector：数据库里的 AI 能力
近年来，大语言模型和多模态 AI 的普及让向量检索成为基础设施级别的能力。语义搜索、图像检索、推荐系统、RAG（检索增强生成）——这些场景的共同点是：需要将非结构化数据（文本、图像、音频）编码为高维向量，然后在海量向量中快速找到与查询最相似的结果。
不仅是专用的向量数据库，向量检索也逐渐成为传统关系型数据库中的  “  标配能力”之一。pgvector是一个PostgreSQL的扩展，它基于pg内核提供的Access Method接口实现了IVF-FLAT和HNSW两种向量索引。用户无需引入额外的专用向量数据库，即可在已有的社区版pg中直接使用向量存储和向量搜索的能力。
在阿里云 RDS PostgreSQL 上，pgvector 的能力得到了进一步增强。除了持续跟进开源版本的迭代，我们还针对生产场景的性能、稳定性和可扩展性做了优化。其中，RaBitQ 量化就是我们引入的能力之一——它让 pgvector 在大规模向量场景下的表现得到了提升。
* * *
二、pgvector 面临的挑战
pgvector 的HNSW索引在百万级向量规模下完全够用，索引创建和搜索速度表现优异，但当数据量进一步增大，迈向千万级甚至亿级时，向量数据库的常见性能瓶颈在pgvector上会被进一步放大。
* 存储效率不足。  pgvector使用float32数组来表示一条向量。一个 1024 维的 float32 向量占用4096字节。pgvector基于pg内核的shared_buffer实现内存管理，每个页面的大小为固定的8KB，这使得单个页面对高维向量的存储效率是极低的。特别是HNSW索引，在内存资源受限的场景下，在向量搜索阶段会因为Buffer未命中触发大量文件IO，导致查询性能呈现数量级的劣化。
* 查询延迟的长尾效应  。  随着索引规模增长，单次查询需要扫描的向量数量增加，P99 延迟的劣化比 P50 更加明显。在高并发场景下，CPU 的浮点计算压力成为瓶颈，查询延迟的稳定性难以保障。
* 向量插入的性能劣化。pgvector的索引  创建过程中依赖pg参数  ` maintenance_work_mem  ` 控制内存，在创建HNSW索引时，如果已经构建的图超过了内存限制，后续的图构建会退化到磁盘上，因为创建过程中需要频繁读取图中已经插入的向量来计算距离，这会进一步导致IO瓶颈。索引构建完成后，插入新数据的时候这个问题也会存在。
这些问题的根源在于一个简单的事实:  传统索引存储的是完整的浮点向量。无论 IVF-FLAT 还是 HNSW，距离计算都需要读取完整的 d 维 float32 数据并执行 O(d) 次浮点乘加运算。当数据规模增大，对应的计算量和内存消耗都是也是巨大的。下面统计使用pgvector，各个数据集的空间大小。
数据集  |  数据规模  |  索引空间
---|---|---
GIST1M  |  128D1M  |  654MB
SIFT1M  |  960D1M  |  4887MB
###  dbpedia-openai-1M
|  1536D1M  |  7918MB
业务数据集  |  1024D100M  |  689GB
向量量化（Vector Quantization）是解决这个问题的有效途径之一。用更少的比特数来表示每个向量，在可接受的精度损失下换取存储和性能的双重收益。
* * *
三、向量量化与 RaBitQ
** 3.1 什么是向量量化  **
向量量化的核心思想很直接：用更紧凑的方式来表示高维向量。
一个未经量化的 768 维向量，每个维度用 32 位浮点数存储，总共需要 3072 字节。向量量化通过各种编码策略，将这个数字大幅压缩——可能是 8 位整数（每维度 1 字节）、二值比特（每维度 1 比特）、或者是码本索引（每个子向量 1 字节）。
量化后的向量存储占用变小了，但查询时仍然需要估计两个向量之间的距离（欧氏距离或内积）。不同的量化方法有不同的距离估计方式：有些通过查表快速计算，有些通过解析公式近似估计。这个估计过程必然带来精度损失，但好的量化方法能将损失控制在可接受范围内。
pgvector社区已经实现了一些特性。
* 半精度向量（half vector），使用float16表示向量的每一维，召回率很小，但是压缩比例有限。
* 二值量化 （binary quantization），  实现了 32 倍压缩（float32 → 1 bit/维），  但是召回率会有大量损失，无法满足生产要求。
综合上述考量，RaBitQ成为一个更好的选择。我们在pgvector已经支持的索引类型上拓展了框架结构，用来后续支持各种量化方式。
** 3.2 为什么选择 RaBitQ  **
RaBitQ（Random Binary Quantization）是一种基于二值化的量化方法。
与其他量化方法相比，RaBitQ 的优势在于
* 极高的压缩比。使用1bit表示向量的每一维，实现32倍的压缩比。
* 距离运算的效率提升。将向量距离运算转化为位运算，结合simd一次处理多条向量。
* 理论的误差界。提供一个可证明的误差范围，向量搜索时可以快速初筛出候选集，再根据误差计算精确距离重排序，确保向量搜索的召回率不会有过多的损失。
* * *
四、RaBitQ 在 pgvector 中的工作原理
** 4.1 RaBitQ 的核心原理  **
RaBitQ源于论文《  RaBitQ: Quantizing High-Dimensional Vectors with a Theoretical Error Bound for Approximate Nearest Neighbor Search》，它利用了高维空间的几何特性。举例来说，在1000维和3维空间的单位球面上随机生成一些单位向量，统计向量第一维的值的分布，会发现高维空间下这些单位向量的取值不是均匀分布的，而是集中在零点附近。
利用这个特性，RaBitQ先把原始向量投影到单位球面上，再通过二值量化表示向量每一维的方向而非具体数值，这样就可以记录到每一条向量的关键信息。实现float32到1bit的向量压缩。在此之前会先对向量做一次随机旋转变换。这个操作将原始向量的信息"均匀打散"到各个维度上，使得每个比特位都能携带有效信息。
在计算距离时，RaBitQ 将原始的内积或欧式距离展开为多个分量。其中绝大部分分量可以在索引创建阶段预计算，或在查询时以常数级别一次性计算（与候选集大小无关）。唯一需要逐向量计算的核心项可以通过SQ4（4bit标量量化）的方式，最终被转化为 1-bit 量化码与 4-bit 查询向量的内积运算，这可以通过位运算 + POPCOUNT的方式快速计算。极大提升了距离运算的效率。
在此基础上，论文证明了估计距离的理论误差界，查询时可以先根据估计距离初筛，  再根据理论误差界判断哪些候选向量需要做精确距离计算并参与重排序  ，保证了查询的召回率。
** 4.2 pgvector上的 IVF-RaBitQ  **
IVF-FLAT（倒排文件索引）的工作流程是：先用 K-Means 将向量空间划分为若干 cluster，搜索时先找到距离查询向量最近的 N 个 cluster，然后在这些 cluster 内做精确扫描。
在 RDS PostgreSQL 的 pgvector 实现中，RaBitQ 与 IVF-FLAT 的结合方式如下：
索引构建：
1. 使用KMeans聚类把原始向量集组织成多个聚类。每个聚类的中心点仍使用原始向量表示。
2. 初始化RaBitQ信息用来做后续的向量旋转，并写入索引文件。
3. 以每个聚类的中心点作为RaBitQ的质心，使用RaBitQ对聚类内的向量进行量化，写入索引文件。
向量搜索：
1. 计算查询向量和各个中心点的距离，选出最近的几个聚类。
2. 对查询向量进行SQ4量化，在RaBitQ索引上计算估计距离，初步对结果集进行排序。
3. 根据参数对应误差界，选出部分向量使用原始向量计算精确距离，完成更高精度的重排序。
** 4.3 pgvector 索引上的 HNSW-RaBiQ  **
HNSW（分层可导航小世界图）索引将向量组织为多层图：上层为稀疏的"高速公路"，下层为稠密的局部邻接图。搜索时从顶层入口逐层向下，在每一层做贪心导航。
HNSW和量化方式结合会有一个问题，如果全程使用RaBitQ上的估计距离来计算和目标向量的距离，这可能会导致在图索引上的搜索方向出现偏差，进一步导致召回率的损失。我们的解决思路如下。
1. 图的构建（分层和邻接关系建立）基于原始向量  。
2. 在搜索阶段，
     * 在HNSW上层初筛时使用RaBitQ计算估计距离，快速定位到目标向量附近。 
     * 在Level 0搜索时，先使用RaBitQ计算估计距离，  根据 RaBitQ 的理论误差界，只对估计距离接近的候选向量计算精确距离并进行排序。 
* * *
五、性能测试：压缩率、延迟与召回率
** 5.1 测试环境  **
我们测试pgvector在百万和亿级别数据集下的性能表现，本次测试使用以下环境和数据集。
* RDS PostgreSQL小版本：RDS PostgreSQL 17 20260330小版本
* 实例规格：  pg.x2.12xlarge.2c
* pgvector小版本：0.8.0.2
* 压测工具：ann-benchmark
* 数据集
    * dbpedia-openai-1M 
    * 业务数据集，1024维100M条 
** 5.2 测试结果  **
###  5.2.1 dbpedia-openai-1M
我们先使用  ` dbpedia-openai-1M  ` 数据集测试内存充足场景下RaBitQ的性能表现。
首先创建索引，然后执行数据集中的查询。对比RaBitQ与社区版本pgvector的性能差异。
索引类型  |  索引参数  |  创建时间  |  索引空间
---|---|---|---
IVF-FLAT  |  nlists=1000  |  95.32s  |  7820MB
IVF-RaBitQ  |  nlists=1000  |  78.72s  |  248MB
HNSW  |  m=16，ef_construction=64  |  281.42s  |  7918MB
HNSW-RaBitQ  |  m=16，ef_construction=64  |  251.97s  |  510MB
下面是使用ann-benchmark测试得到的recall-qps曲线。
图例说明如下：
* pgvector，社区版本的HNSW。
* pgvector_hnsw_rabitq，RDS PostgreSQL的HNSW-RaBitQ索引，引入重排序提升召回率。
* pgvector_hnsw_rabitq_without_refine，RDS PostgreSQL的HNSW-RaBitQ索引，关闭重排序。
* pgvector_ivfflat，pgvector社区版本的IVF-FLAT。
* pgvector_ivfRaBitQ，RDS PostgreSQL的IVF-RaBitQ索引。
###  5.2.2  1024 维 100M 业务数据集
然后使用业务数据集测试IVF-RaBitQ相较于pgvector社区版本HNSW的性能提升。旨在验证真实生产环境中，IVF-RaBitQ相比HNSW在各个场景下的性能提升。
|  |  IVF-RaBitQ  |  HNSW
---|---|---|---
索引创建  |  索引参数  |  lists=10000  |  m=16, ef_construction=64
索引创建时间  |  4h23min17s  |  4d1h13min47s
索引空间  |  16GB  |  689GB
write-only  |  avg-latency  |  6.41ms  |  469.41ms
read-only  |  查询参数  |  ivfflat.probes = 100  |  hnsw.ef_search = 40
top10 avg-latency  |  342.08 ms  |  27.65 ms
top100 avg-latency  |  359.194 ms  |  1789.22 ms
read-write  |  write avg-latency  |  13.42ms  |  473.54ms
read avg-latency  |  395.93 ms  |  1704.64 ms
** 5.3 小结  **
* 在内存充足场景下引入RaBitQ量化后。
    * 同等召回率下，ivf和HNSW相比社区原始版本的查询性能都有所提升。 
    * 进行量化后，实现了索引上32倍的压缩比，减少了对内存和存储资源的需求。 
* 在真实业务的大规模数据场景下。
    * 因为内存受限，HNSW在索引创建，数据插入，大结果集查询等场景下都会出现严重的性能劣化。 
    * 相比HNSW，IVF-RaBitQ 的优势在于大规模、内存受限场景，而非小结果集的极致低延迟。 
* * *
六、快速上手：用 SQL 体验 RaBitQ 量化检索
** 6.1 环境准备  **
确保你的 RDS PostgreSQL 实例已启用 pgvector 扩展，索引创建和向量搜索与pgvector社区版本语法兼容。
    -- 检查 pgvector 版本SELECT extversion FROM pg_extension WHERE extname = 'vector';  
    -- 确保 vector 扩展已启用CREATE EXTENSION IF NOT EXISTS vector;
** 6.2 创建表并插入数据  **
    -- 创建向量表CREATE TABLE items (    id bigserial PRIMARY KEY,    embedding vector(768));  
    -- 插入示例数据（实际使用中由嵌入模型生成）INSERT INTO items (embedding)SELECT array_agg(random())::vector(768)FROM generate_series(1, 100000);
** 6.3 创建 RaBitQ 量化的 IVF-FLAT 索引  **
    -- 创建 RaBitQ 量化的 IVF-FLAT 索引-- lists 参数控制 cluster 数量，通常设为数据量的平方根CREATE INDEX ON itemsUSING ivfflat (embedding rabitq_vector_cosine_ops)WITH (lists = 100);
** 6.4 创建 RaBitQ 量化的 HNSW 索引  **
    CREATE INDEX ON itemsUSING hnsw (embedding rabitq_vector_cosine_ops)WITH (m = 16, ef_construction = 64);
** 6.5 执行量化搜索查询  **
    -- 设置搜索参数SET ivfflat.probes = 10;    -- IVF-FLAT 搜索的 cluster 数量-- SET HNSW.ef_search = 64; -- HNSW 搜索的候选集数量  
    -- 执行相似度搜索（余弦距离）SELECT id, embedding <=> '[0.1, 0.2, ...]' AS distanceFROM itemsORDER BY embedding <=> '[0.1, 0.2, ...]'LIMIT 10;
结语
RaBitQ 量化的引入，让 RDS PostgreSQL 上的 pgvector 在保持 PostgreSQL 生态优势的同时，显著提升了大规模向量检索的效率和可扩展性。无需引入额外的向量数据库，无需复杂的运维配置，仅通过一个索引参数即可开启高倍压缩和检索加速。
对于正在使用或计划在阿里云 RDS PostgreSQL 上处理向量检索的团队，RaBitQ 是一个值得尝试的选项。