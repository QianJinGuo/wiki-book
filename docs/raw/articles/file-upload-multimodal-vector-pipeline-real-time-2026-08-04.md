---
title: "文件上传即可检索：实时多模态向量链路落地实践"
source_url: https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247521103&idx=2&sn=e4de10f386f34f1620fadc40729e8ec4
source_published: 2026-08-04
ingested: 2026-08-14
sha256: ea532ddc0f44bd624bc83e8f12c2649688eeda3f636bf2aa149a408fc0d69c15
type: raw-article
tags: [multimodal, vector-database, rag, pipeline, embedding, bytedance]
---

# 文件上传即可检索｜实时多模态向量链路落地实践分享

原创 Viking 2026-08-04 19:12 北京

当企业 AI 应用从概念验证走向生产，一定遇到过这样的场景：商品图库每天新增几千张图片、企业知识库持续有新文档进入、训练数据平台需尽快感知新样本……这些内容的第一站，通常是**对象存储** 。

但“文件已经上传”并不等于“内容已经能被 AI 使用”。从“存起来”到“用起来”，通常还要经过这样一套流程：

**发现新增或变化的对象 → 读取对象或元信息 → 清洗与组装模型输入 → 生成 Embedding（向量化） → 写入向量数据库 → 更新检索索引**

如果上述流程由多个定时任务和脚本拼接，生产阶段常常会遇到三个卡点：

  1. **数据更新不及时****：** 新文件需要等待下一个扫描周期，检索内容可能滞后数小时甚至更久。

  2. **存量与增量难以衔接：** 全量扫描期间仍有新文件上传，切换增量消费时容易遗漏或重复。

  3. **模型和向量写入链路复杂：** 图片拉取、模型服务、GPU 资源、失败重试、向量写入与索引更新需要分别建设。




为了解决上述问题，本文将介绍如何用火山引擎 Flink 与 VikingDB 搭建一条“文件上传后秒级可检索”的实时多模态数据链路，并给出两套完整 Flink SQL 参考方案。

**一、一条链路，收敛所有环节**

Flink + VikingDB 联合方案将上述分散的环节收敛到一条持续运行的实时数据链路中：

这条链路的几个关键角色：

  * **TOS** （对象存储）：承载图片、视频、文本、文档及业务元数据——你的多模态数据就存在这里。

  * **Kafka** （消息队列）：承接 TOS 的 PUT、DELETE 等对象事件——文件变动时，Kafka 会收到一条消息。

  * **流式计算 Flink 版** ：负责全增量接入、清洗、路由、模型调用与故障恢复——整条链路的“编排引擎”。

  * **VikingDB** （向量数据库）：负责向量化、向量存储、索引和在线检索——向量数据的最终归宿，也是检索服务的后端。

  * **方舟** ：为需要自定义模型的场景提供多模态 Embedding 能力——当内置模型不够用时，在这里接入自有模型。




**二、三项关键能力，打通实时 AI 数据链路**

**1、TOS-CDC：把对象存储变成一张持续更新的表**

**T****OS-CDC** 是面向对象存储的 Flink SQL Source Connector。原本散落在对象存储里的文件变化，被连续地翻译成了一条可处理的数据流。作业启动后，它会：

  1. 记录全量扫描开始时间；

  2. 对指定的 TOS 存储桶执行全量扫描；

  3. 全量完成后，默认从全量扫描开始时间对应的 Kafka 位置开始消费对象事件；

  4. 通过 Checkpoint 保存全量扫描进度和 Kafka 消费位点。




通过从全量扫描时间开始衔接消费 Kafka 增量数据，能覆盖到全量扫描期间发生的对象变化。下游使用稳定主键 Upsert（即"有则更新，无则插入"）后，即使有重复事件也最终能收敛到同一条记录。

注：TOS-CDC 接收到的是**文件在哪里** 的信息，不接收文件内容本身。

**2、VikingDB：让写入、向量化和检索形成闭环**

对于标准图片和文本检索场景，可以在 VikingDB 表上声明字段语义和向量模型。例如将字段声明为 image，并配置 doubao-embedding-vision，由 VikingDB 自动完成图片读取、向量化和索引更新。

业务不需要额外维护模型服务、GPU 资源池和向量导入程序。Flink 负责持续写入变化的数据，VikingDB 将其沉淀为可检索的向量资产。

VikingDB Connector 支持根据 Flink Changelog 执行 Upsert 和 Delete。默认使用同步写入：
    
    
    'async' = 'false'

对于要求写入后快速检索的业务，不建议直接启用 async=true。异步写入更偏向吞吐优先，会增加 Collection（数据集合）与 Index 的可见延迟。

**3、 Flink 2.2 AI SQL：把模型调用变成 SQL 的一部分**

部分业务需要在 Flink 侧自行完成 Embedding，典型场景包括：

  * 将图片、标题、标签和 OCR 文本组装成多模态输入；

  * 使用指定的方舟模型及版本；

  * 统一控制模型调用的并行度、吞吐和成本；

  * 让一份 Embedding 同时写入 VikingDB、Kafka、特征库或训练样本；

  * 在不重写 Java/Python 作业的情况下切换模型。




流式计算 Flink 版 2.2 支持通过 CREATE MODEL 声明方舟模型，并使用 ML_PREDICT 在 SQL 中执行实时推理。模型接入、数据处理和向量写入由一条 SQL 作业统一编排。

注：当前流式计算 Flink 版 2.2 AI SQL 正在邀测中。如有需求可联系火山官网。

**三、前期准备工作 CheckList**

开始搭建链路前，需要准备以下资源：

**准备项**| **作用**| **是否必需**  
---|---|---  
TOS Bucket 与事件通知规则| 保存多模态对象，并将对象变更事件投递至 Kafka| 必需  
Kafka 实例、Topic 与用户| 承接 TOS 增量事件，供 TOS-CDC 持续消费| 必需  
流式计算 Flink 版| 运行 TOS-CDC、数据处理和 VikingDB Sink| 必需  
TOS-CDC 邀测资格| 使用全量扫描与增量事件一体化 Source| 必需  
Flink 2.2 邀测资格| 使用 CREATE MODEL 与 ML_PREDICT 调用方舟| 方案二必需  
VikingDB 实例与 API Key| 完成自动向量化或存储 Flink 生成的向量| 必需  
方舟推理接入点与 API Key| 执行自定义多模态 Embedding| 方案二必需  
  
注：两种方案后续会展开介绍。

**1、准备 TOS Bucket，并开启事件投递**

TOS 事件通知能够在 Bucket 内对象发生变化时，将事件消息推送至 Kafka。事件消息包含 Bucket、对象 Key、事件类型和事件时间等信息，TOS-CDC 根据这些消息持续感知新增、覆盖和删除操作。

在 TOS 控制台为目标 Bucket 创建事件通知规则时，需要：

  * 将推送目标设置为消息队列 Kafka 版；

  * 至少订阅 tos:ObjectCreated:*；如果后续需要处理对象删除，再订阅 tos:ObjectRemoved:*；

  * 按业务范围配置 Prefix、Suffix，使事件范围与 TOS-CDC 的 bucket 配置保持一致；

  * 选择目标 Kafka 实例、Topic、Kafka 用户和授权角色。




注：详细操作请参见火山引擎对象存储文档：设置事件通知推送至 Kafka。（复制链接至浏览器：<https://docs.volcengine.com/docs/6349/1817509?lang=zh）>

**2、准备 Kafka 实例、Topic 与访问授权**

在消息队列 Kafka 版中创建实例、Topic 和访问用户。TOS 事件通知规则需要引用 Kafka 实例 ID、Topic 名称、用户和 IAM 角色。该角色需要绑定系统预设策略 KafkaAccessForTOS，用于授权 TOS 向 Kafka 投递事件。

同时需要确保：

  * Flink 资源池能够访问 Kafka Bootstrap Servers；

  * Kafka 用户与认证参数可以在 Flink 作业中使用；

  * Topic Retention 大于“全量扫描最大耗时 + rewind.offset”，避免全量扫描结束时需要回拨的事件已经过期。




**3、开通流式计算 Flink 版**

开通火山引擎流式计算 Flink 版，创建项目和运行作业所需的资源池，并打通到 Kafka、VikingDB 及方舟服务的网络。

注：若需 TOS-CDC 邀测资格 和 Flink 2.2 版本邀测资格，可联系火山官网。

**4、准备 VikingDB 与方舟资源**

开通 VikingDB，准备数据面地址和 API Key。方案一需要确认目标 Collection 使用的自动向量化模型、版本和维度；方案二需要创建方舟推理接入点，准备模型名称、输出维度和 API Key。

注：所有访问凭证均建议通过流式计算 Flink 版的加密变量或运行环境变量注入，不要直接写入 SQL。

**三、两套 SQL 方案：选你需要的那条路**

两套方案共用同一条 TOS-CDC 数据接入链路，区别在于“谁来完成向量化操作”：

  * **方案一：VikingDB 自动向量化。** 面向标准图文检索，架构最简单——把数据交给 VikingDB，它来搞定 Embedding。

  * **方案二：Flink AI SQL 调用方舟。** 面向图文融合、模型自主和向量多下游复用——用户自主控制模型、输入和输出。




**1、创建 TOS-CDC 源表**
    
    
     CREATE TABLE tos_object_events (  
        object_key    STRING NOT NULL,  
        object_url    STRING,  
        bucket_name   STRING,  
        file_name     STRING,  
        object_etag   STRING,  
        object_size   BIGINT,  
        mtime         TIMESTAMP_LTZ(3),  
        event_time    TIMESTAMP_LTZ(3),  
        record_origin STRING,  
        PRIMARY KEY (object_key) NOT ENFORCED  
    ) WITH (  
    'connector'                    = 'tos-cdc',  
    'path'                         = 'tos://my-bucket/images01/, tos://my-bucket/images02/',  
    'properties.bootstrap.servers' = 'kafka.example:9092',  
    'properties.group.id'          = 'ingest-cg',  
    'topic'                        = 'object-events',  
    'scan.startup.mode'            = 'initial'  
    );

生产环境需要根据 Kafka 实例补充认证和网络参数，并注意：

  * Kafka Topic 的消息保留时间应能覆盖全量阶段扫描到 Kafka 切换所需时间以及配置的 rewind.offset。

  * 增量回拨参数 rewind.offset 默认为0，可按需设置，并建议保留 rewind.retention-miss-policy=fail，避免回拨位置过期后静默漏数。




构造输出数据：
    
    
    CREATE TEMPORARY VIEW image_put_events AS  
    SELECT  
      object_key AS id,  
      object_url AS image_uri,  
      object_etag,  
      COALESCE(event_time, mtime) AS update_time  
    FROM tos_object_events;

这里使用 object_key 作为主键，因 TOS-CDC 与外部 Sink 均采用 At-Least-Once 语义（至少投递一次，可能重复），故障恢复或全增量衔接期间可能重放记录。稳定主键可以使重复 PUT 在 VikingDB 中执行 Upsert，最终收敛到同一条数据。

**2、方案一：VikingDB 自动向量化**

首先创建 VikingDB Catalog：
    
    
    CREATE CATALOG viking WITH (  
    'type'               = 'vikingdb',  
    'control-plane.host' = 'open.volcengineapi.com',  
    'region'             = 'cn-beijing',  
    'project-name'       = 'default',  
    'access-key'         = '${secret_values.volc-ak}',  
    'secret-key'         = '${secret_values.volc-sk}',  
    'data-plane.host'    = '<vikingdb-data-plane-host>',  
    'api-key'            = '${secret_values.vikingdb-api-key}'  
    );

然后创建启用自动图片向量化的 Collection：
    
    
    CREATE TABLE IF NOT EXISTS `viking`.`default`.`realtime_image_assets` (  
      id          STRING,  
      image_uri   STRING,  
      object_etag STRING,  
      update_time TIMESTAMP_LTZ(3),  
      PRIMARY KEY (id) NOT ENFORCED  
    ) WITH (  
    'vikingdb.field.image_uri.type'          = 'image',  
    'vikingdb.vectorize.dense.model-name'    = 'doubao-embedding-vision',  
    'vikingdb.vectorize.dense.model-version' = '<model-version>',  
    'vikingdb.vectorize.dense.dim'           = '2048',  
    'vikingdb.vectorize.dense.image-field'   = 'image_uri'  
    );

最后写入 VikingDB：
    
    
    INSERT INTO `viking`.`default`.`realtime_image_assets`  
    SELECT id, image_uri, object_etag, update_time  
    FROM image_put_events;

这条链路能够覆盖：

  * 作业首次启动时导入指定存储桶下的存量对象；

  * 新对象上传后实时写入；

  * 同一路径对象被覆盖后按稳定主键更新；

  * 作业失败后从 Checkpoint 恢复，并通过 Upsert 抵御事件重放。




**3、方案二：Flink AI SQL 调用方舟 Embedding**

当业务需要自定义多模态输入或指定模型时，可以复用同一张 TOS-CDC 源表。

首先在 SQL 中声明方舟模型：
    
    
    CREATE MODEL ark_multimodal_embedding  
    INPUT  (payload STRING)  
    OUTPUT (embedding ARRAY<FLOAT>)  
    WITH (  
    'provider'         = 'ark',  
    'endpoint'         = '<https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal>',  
    'api-key'          = '${secret_values.ark-api-key}',  
    'model'            = 'doubao-embedding-vision-251215',  
    'model.dimensions' = '2048'  
    );

将对象信息组装为方舟多模态输入：
    
    
    CREATE TEMPORARY VIEW multimodal_payload AS  
    SELECT  
      id,  
      image_uri,  
      update_time,  
      CAST(  
        JSON_ARRAY(  
          JSON_OBJECT(  
    'type' VALUE 'image_url',  
    'image_url' VALUE JSON_OBJECT(  
    'url' VALUE CONCAT(  
    'https://<bucket-domain>/',  
                 object_key  
              )  
            )  
          )  
        ) AS STRING  
      ) AS payload  
    FROM (  
      SELECT  
        object_key AS id,  
        object_url AS image_uri,  
        COALESCE(event_time, mtime) AS update_time,  
        object_key  
      FROM tos_object_events  
    ) AS source_events;

示例使用 HTTPS 图片地址作为模型输入。生产环境应确保方舟服务能够安全访问该地址；私有 Bucket 可以使用受控的临时签名 URL 或企业内部授权链路，不建议为模型调用将整个 Bucket 配置为公开读。

创建保存显式向量的 VikingDB Collection：
    
    
    CREATE TABLE IF NOT EXISTS `viking`.`default`.`realtime_multimodal_assets` (  
      id              STRING,  
      image_uri       STRING,  
      update_time     TIMESTAMP_LTZ(3),  
      mixed_embedding ARRAY<FLOAT>,  
      PRIMARY KEY (id) NOT ENFORCED  
    ) WITH (  
    'vikingdb.field.mixed_embedding.type' = 'vector',  
    'vikingdb.field.mixed_embedding.dim'  = '2048'  
    );

调用模型并写入 VikingDB：
    
    
    INSERT INTO `viking`.`default`.`realtime_multimodal_assets`  
    SELECT  
      id,  
      image_uri,  
      update_time,  
      embedding AS mixed_embedding  
    FROM ML_PREDICT(  
      TABLE multimodal_payload,  
      MODEL ark_multimodal_embedding,  
      DESCRIPTOR(payload)  
    );

如果 Embedding 还要用于实时特征、训练样本或消息订阅，可以通过 EXECUTE STATEMENT SET 增加多个 Sink，让下游共享同一次模型计算结果。

**五、如何验证这条链路**

**1、确认 Flink 任务进入运行状态**

通过 Flink UI 检查，确认存量的图片、视频文件已经导入 VikingDB。确保数据量和 TOS 能够对齐。

**2、验证向量与搜索结果**

在 VikingDB 控制台的"数据集 → 数据预览"中，按照 TOS 的路径进行查询，确认数据已经写入数据集。

检查 VikingDB Collection 中的字段类型和向量维度，并使用一张相似图片或一段相关文本发起检索，确认能够召回刚上传的对象。如下图所示，输入“小松鼠”可以召回相关相似的照片。

**3、测量端到端时延**

分别记录：

  * TOS 对象上传时间；

  * Kafka 事件时间； 

  * Flink 处理时间；

  * VikingDB 写入可见时间；

  * 首次能够检索到该对象的时间。




以真实数据规模和并发条件评估 P50、P95 延迟，再调整 Flink 并行度、模型吞吐、Sink Flush Interval 和 VikingDB 索引配置。

**4、使用 VikingDB 做多样化检索测试**

数据实时写入 VikingDB 后，可根据业务场景选择不同检索方式：

**检索方式**| **适用场景**| **详细文档**  
---|---|---  
**多模态检索**|  以图搜图、以文搜图、图文混合召回，支持图片/文本/混合输入。| <https://docs.volcengine.com/docs/84313/1791135?lang=zh>  
**关键词检索**|  精确匹配、术语/编号类查询，实现全文检索与语义检索互补。| <https://docs.volcengine.com/docs/84313/1791139>  
**地理信息检索**|  支持按地理位置和距离做检索过滤。| <https://docs.volcengine.com/docs/84313/1791133?lang=zh#filter%E7%BB%93%E6%9E%84>  
  
**写在最后**

多模态 AI 应用进入生产阶段后，价值不只来自模型效果，也来自数据更新速度。对于图片、视频、音频、文档等非结构化数据，只要能把对象内容或元信息接入 Flink，就可以沿用**“事件触发、全增量一体、写入即可检索”** 的方式，构建面向企业 AI 应用的实时向量化链路。

这条链路带来的核心改变：

  * **事件驱动替代定时扫描** ：文件上传后秒级触发处理，数据可见延迟从小时级降至秒级。

  * **一条 SQL 作业打通全链路** ：全量 + 增量 + 向量化 + 存储，架构复杂度大幅下降。

  * **向量化能力开箱即用，又可自主可控** ：既能用 VikingDB 内置模型零工程落地，也能用 Flink 2.2 AI SQL 调用方舟实现模型自主。

  * **写入秒级可见、可搜索** ：产出的 Collection 直接支撑知识库问答、推荐召回与多模态检索。




这意味着企业知识库能更快更新、内容推荐能更快感知新素材、训练样本也能更及时沉淀。

**火山引擎 Flink + VikingDB** ，把“多源、多模态、持续变化”的数据实时转化为可检索、可服务的向量资产，助力企业 AI 应用从 PoC 稳步迈向生产。

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=dfe320ef&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzI1MzYzMjE0MQ%3D%3D%26mid%3D2247521103%26idx%3D2%26sn%3De4de10f386f34f1620fadc40729e8ec4>)
