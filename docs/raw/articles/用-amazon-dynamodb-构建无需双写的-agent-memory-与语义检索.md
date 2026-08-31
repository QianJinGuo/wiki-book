---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-dynamodb-build-agent-memory-retrieval
ingested: 2026-09-01
feed_name: AWS China Blog
source_published: 2026-08-31
sha256: 78d58b64675c626f
---

|---|---  
查询类型 | 相似度搜索 | 精确匹配 + 范围  
读 API | SearchVectors | Query / Scan  
Schema | 向量属性 + 可选 SearchSchema（分区键、内联过滤） | 分区键 + 可选排序键  
每表上限 | 5 | 20  
容量模式 | 仅按需 | 按需或预置  
  
需要明确的一点：DynamoDB 存储和检索向量，但不生成向量。embedding 仍然由你调用嵌入模型产生，本文用 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 上的 Cohere Embed v4（多语言，输出维度可选 256 / 512 / 1024 / 1536，本文取 1024）。

## **四、数据模型：一张表承载两种读取**

这是整个设计的核心。我们让同一条 item 同时满足按时间读和按语义读。

属性 | 角色  
---|---  
pk = USER#<user_id> | 基表分区键  
sk = MEM#<类型>#<ISO 时间戳> | 基表排序键，让 Query 天然按时间倒序取最近几轮  
user_id | 向量索引分区键（HASH）  
mem_type | 向量索引内联过滤（INLINE_FILTER），取值 profile / conversation  
text | 记忆原文  
embedding | 1024 维向量  
embed_model | 生成该向量的模型 ID，用于检测模型变更  
expires_at | TTL，短期记忆自动过期  
  
**两个 schema 上的设计决策值得展开**

排序键前缀带上类型。MEM#conversation#<时间戳> 这样的结构，让「取最近 6 轮对话」变成一次 begins_with 的 Query，不需要额外的 GSI，也不需要过滤。

向量索引分区键选 user_id。向量索引的分区键做两件事：把索引数据分片以便独立扩展，以及把每次搜索的范围限定在一个分区键值内。对多租户或多用户的 Agent 记忆，这正好就是天然的边界 —— 搜索 Alice 的记忆时，Bob 的向量根本不参与[计算](<https://aws.amazon.com/cn/what-is/compute/>)。规模上去以后，这既降延迟也降成本。

选分区键的原则是低到中等基数，比如类目、国家、租户。如果你的 Agent 是每用户独立记忆，user_id 合适；如果是一个全局知识库，可能就不该定义分区键（那样每次搜索扫全索引，简单但不横向扩展）。

## **五、建表：把向量索引声明在 CreateTable 里**
    
    
    VECTOR_INDEX_DEF = {
        "IndexName": "memory-vector-index",
        "VectorAttribute": {"AttributeName": "embedding"},
        "SearchSchema": [
            # 一个用户一个分区：搜索只触达该用户的向量
            {"AttributeName": "user_id", "SearchSchemaElementType": "HASH"},
            # 在存储层完成的等值过滤，不是把结果捞回来再筛
            {"AttributeName": "mem_type", "SearchSchemaElementType": "INLINE_FILTER"},
        ],
        "Projection": {
            "ProjectionType": "INCLUDE",
            "NonKeyAttributes": ["text", "created_at", "session_id"],
        },
        "Dimensions": 1024,          # 必须与嵌入模型输出一致
        "DistanceFunction": "COSINE",
    }
    
    ddb.create_table(
        TableName="agent-memory",
        AttributeDefinitions=[
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
            # SearchSchema 引用的属性必须在这里声明，和 GSI 的 key 属性一样
            {"AttributeName": "user_id", "AttributeType": "S"},
            {"AttributeName": "mem_type", "AttributeType": "S"},
        ],
        KeySchema=[
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "sk", "KeyType": "RANGE"},
        ],
        BillingMode="PAY_PER_REQUEST",   # 向量索引仅支持按需容量模式
        SSESpecification={"Enabled": True},
        VectorIndexes=[VECTOR_INDEX_DEF],
    )
    

给已有表加索引用 UpdateTable 的 VectorIndexUpdates 参数，结构一样，包一层 {“Create”: …}。

Dimensions 和 DistanceFunction 创建后都不可修改，所以嵌入模型要在建索引之前定下来。DynamoDB 支持最多 4096 维。

关于距离函数：COSINE 只比较方向、忽略模长，适合文本语义检索，是不确定时的安全默认值；DOT_PRODUCT 对模长敏感，适合想让「热度」之类的标量影响排序的推荐场景，注意它的分数可以为负；EUCLIDEAN 适合图像 / 音频 embedding 和近重复检测。

## **六、等索引可搜：要看两个字段**

给存量表加索引时，DynamoDB 通过 DescribeTable 里两个独立字段汇报进度，只看 IndexStatus 是不够的：
    
    
    def wait_until_searchable():
        while True:
            table = ddb.describe_table(TableName="agent-memory")["Table"]
            index = next(i for i in table.get("VectorIndexes", [])
                         if i["IndexName"] == "memory-vector-index")
            status = index.get("IndexStatus")
            backfilling = bool(index.get("Backfilling", False))
            # 注意：不存在 BACKFILLING 这个状态值。
            # IndexStatus 会先变成 ACTIVE，此时 Backfilling 仍为 true，
            # 这个阶段调用 SearchVectors 会直接报错。
            if table["TableStatus"] == "ACTIVE" and status == "ACTIVE" and not backfilling:
                return
            time.sleep(5)
    

新建表时基表是空的，backfill 瞬间完成；给一张已有几百 GB 数据的表加索引，这个等待是实打实的。

## **七、写入：一次 PutItem，业务数据和向量一起落地**
    
    
    def put_memory(user_id, text, mem_type, ttl_days=None):
        created_at = utc_now_iso()
        item = {
            "pk":         {"S": f"USER#{user_id}"},
            "sk":         {"S": f"MEM#{mem_type}#{created_at}"},
            "user_id":    {"S": user_id},     # 向量索引分区键
            "mem_type":   {"S": mem_type},    # 向量索引内联过滤
            "text":       {"S": text},
            "created_at": {"S": created_at},
            # 向量在 item 属性里是 L 类型，元素是 N。
            # 存起来的内容按"文档"embed，不是按"查询"。
            "embedding":  {"L": [{"N": repr(v)}
                                 for v in embed(text, INPUT_TYPE_DOCUMENT)]},
            "embed_model": {"S": EMBED_MODEL_ID},
        }
        if ttl_days:
            item["expires_at"] = {"N": str(int(time.time()) + ttl_days * 86400)}
    
        # 这就是全部。向量索引由 DynamoDB 维护，应用代码里没有第二次写入。
        ddb.put_item(TableName="agent-memory", Item=item,
                     ReturnConsumedCapacity="INDEXES")
    

PutItem、UpdateItem、BatchWriteItem、TransactWriteItems 都能写向量。这意味着你可以把记忆写入放进一个事务，和其他业务写入一起原子提交 —— 这在跨存储的双写方案里是做不到的。

删除也是对称的：删掉 item，或者只删掉 embedding 属性，索引里对应的条目随之消失。TTL 过期同理。这就是「不用管删除同步」的意思。

**两个静默失败要特别注意。**

第一，如果 item 缺少向量索引的分区键属性（这里是 user_id），PutItem 会成功，但这条 item 不会进入向量索引，不报错。基表里查得到，SearchVectors 永远搜不到。排查「数据在但搜不到」时先查这个。相比之下，内联过滤属性缺失是允许的，item 照常入索引。

第二，DynamoDB 不会替你重算 embedding。改了 text 而没有重新生成向量写回去，索引里留的是旧向量，搜索会安静地返回错误的匹配。任何更新记忆原文的代码路径，都必须同时更新向量。

## **八、插一段：文档向量和查询向量不是一回事**

embed() 就是一次 Bedrock 调用，但有个容易被忽略的参数：
    
    
    INPUT_TYPE_DOCUMENT = "search_document"   # embed 准备存起来的内容
    INPUT_TYPE_QUERY    = "search_query"      # embed 用来检索的问题
    
    def embed(text, input_type, dimensions=1024):
        response = bedrock.invoke_model(
            # Embed v4 只能通过跨区域推理配置调用，注意 "us." 前缀。
            # 直接用 "cohere.embed-v4:0" 会报 on-demand throughput isn't supported。
            modelId="us.cohere.embed-v4:0",
            body=json.dumps({
                "texts": [text],
                "input_type": input_type,       # 这一行决定召回质量
                "output_dimension": dimensions, # 256 / 512 / 1024 / 1536
                "embedding_types": ["float"],
                "truncate": "RIGHT",
            }),
        )
        payload = json.loads(response["body"].read())
        embeddings = payload["embeddings"]
        if isinstance(embeddings, dict):
            embeddings = embeddings["float"]
        return embeddings[0]
    

Cohere 的嵌入模型会根据 input_type 加上不同的特殊 token，把「被检索的文档」和「发起检索的问题」映射到互相对齐但不对称的空间里。语料用 search_document，查询用 search_query，两边用同一种会明显降低召回质量。

查询「他什么时候不方便被打扰」 | 正确记忆的排名 | top1 与 top2 的分差  
---|---|---  
无 input_type 区分的对称模型 | 第 2 名 | 0.8858 vs 0.9015（几乎不可分）  
Cohere Embed v4（非对称） | 第 1 名 | 0.6534 vs 0.7568  
  
对称模型下所有分数都挤在 0.85~0.95，根本没法设相似度阈值来决定「这条记忆到底要不要塞进 prompt」。这不是 DynamoDB 的问题，但它直接决定了你的 Agent 记忆好不好用 —— 向量索引选型和嵌入模型选型是两件独立的事，后者往往影响更大。

另外 Embed v4 支持 Matryoshka 维度：同一个模型可以输出 256 / 512 / 1024 / 1536 维。维度直接乘在 DynamoDB 的存储和搜索成本上，所以这是一个可以真金白银调的旋钮 —— 在你自己的数据上比一下 512 和 1024 的召回质量，可能省一半成本。

## **九、检索：语义召回**
    
    
    def search_memories(user_id, query_text, top_k=5, mem_type=None):
        condition = "user_id = :uid"
        values = {":uid": {"S": user_id}}
        if mem_type:                       # 内联过滤是可选的
            condition += " AND mem_type = :mt"
            values[":mt"] = {"S": mem_type}
    
        return ddb.search_vectors(
            TableName="agent-memory",
            IndexName="memory-vector-index",
            # 注意两点：请求里的 SearchVector 是裸的数字列表，不要包 L；
            # 查询按 search_query embed，与存储时的 search_document 对应。
            SearchVector=[{"N": repr(v)}
                          for v in embed(query_text, INPUT_TYPE_QUERY)],
            TopK=top_k,
            # 定义了分区键就必须在这里给出它的值
            SearchConditionExpression=condition,
            ExpressionAttributeValues=values,
            ReturnConsumedCapacity="INDEXES",
        )
    

一个容易踩的形状差异：写 item 时向量包在 L 里，SearchVectors 请求里的 SearchVector 是裸列表。建议像上面这样把两种转换写成两个独立函数，避免混用。

返回的每个结果包含 Item 和 Score。COSINE 下分数越小越相似。默认结果不包含向量属性本身 —— 这是合理的默认值，1024 维约 4 KB，乘上 TopK 很快就接近 16 MB 的响应上限（SearchVectors 不支持分页）。确实需要向量时用 ProjectionExpression 显式要。

同一次 Agent 调用里，另一半上下文来自普通 Query：
    
    
    def recent_turns(user_id, limit=6):
        response = ddb.query(
            TableName="agent-memory",
            KeyConditionExpression="pk = :pk AND begins_with(sk, :prefix)",
            ExpressionAttributeValues={
                ":pk":     {"S": f"USER#{user_id}"},
                ":prefix": {"S": "MEM#conversation#"},
            },
            ScanIndexForward=False,   # 排序键倒序 = 最近优先
            Limit=limit,
        )
        return list(reversed(response["Items"]))
    

两种读取，同一批 item，同一张表。 这就是原生向量索引带来的实际差别。

## **十、跑起来看效果**

用一份合成记忆做种子：Alice 是跨境电商运营负责人，画像里有「周三下午开跨部门周会，不方便被打扰」，一个多月前的对话里提过「东南亚物流退货率偏高，主要在印尼的第三方仓」。另有一个用户 Bob，记忆完全无关。

问一个把两条记忆都牵连进来的问题：
    
    
    $ ./chat.sh "帮我约 Alice 周三下午聊一下印尼仓的退货问题"
    
    === 语义召回 (SearchVectors, user_id=alice, TopK=5) ===
    1. [conversation] score=0.4676  用户提到上个季度东南亚的物流退货率偏高，主要集中在印尼的第三方仓。
    2. [profile]      score=0.4706  Alice 的工作时区是 UTC+8，周三下午通常在开跨部门周会，不方便被打扰。
    3. [profile]      score=0.5990  Alice 对外沟通一律用中文，内部技术文档可以用英文。
    ...
    
    === 最近对话 (Query, 同一张表同一批条目) ===
    - 用户提到上个季度东南亚的物流退货率偏高，主要集中在印尼的第三方仓。
    - 用户希望周报里包含退货率、客单价和广告投产比三个指标，其他指标不用列。
    ...
    
    === 回答 ===
    可以为你安排在周三下午与 Alice 讨论印尼仓的退货问题，但需要注意的是，周三下午 Alice
    通常在开跨部门周会，不方便被打扰。你可以选择在会议结束后约她……
    依据：Alice 的工作时区是 UTC+8，周三下午通常在开跨部门周会，不方便被打扰。
    
    [已写入 1 条记忆：PutItem 一次调用，无双写]
    [SearchVectors ConsumedCapacity: {"VectorSearchRequestBytes": 15861.0}]
    

排在最前面的两条正好就是回答这个问题所需要的两条 —— 一条来自用户画像，一条来自一个多月前的另一段对话 —— 而第 3 名之后的分数有明显断层。Agent 因此识别出了时间冲突。

## **十一、实测细节：最终一致性有多久**

向量索引读取是最终一致的，而「最终」有多久，取决于索引的状态：

  * 稳态（索引已经在承载读写）：写入后基本立即可搜，上面这个例子就是。
  * 索引刚创建完：即使 IndexStatus=ACTIVE、Backfilling=false、PutItem 也已经成功返回，新写入的条目实测还要 30~40 秒才出现在 SearchVectors 结果里。这段时间里搜索返回的是空列表，不是错误。



这个细节很容易在演示或集成测试里坑到人：脚本刚建完表、灌完数据，立即搜索，得到空结果，然后开始怀疑数据模型写错了。所以自动化流程里，建完索引灌完数据之后应该轮询到能搜出东西为止，而不是只等 Backfilling 变 false：
    
    
    def wait_until_searchable_with_data(probe_vector, expected_at_least=3, timeout=300):
        deadline = time.time() + timeout
        while time.time() < deadline:
            response = ddb.search_vectors(
                TableName=TABLE, IndexName=INDEX, SearchVector=probe_vector, TopK=5,
                SearchConditionExpression="user_id = :uid",
                ExpressionAttributeValues={":uid": {"S": "alice"}},
            )
            if len(response.get("SearchResults", [])) >= expected_at_least:
                return True
            time.sleep(10)
        return False
    

更普适的结论是：需要读己之写的路径，请从基表读，用 GetItem 或 Query 而不是 SearchVectors。语义检索天然是「尽力而为」的召回，把它当强一致的真相来源用，迟早会出问题。

## **十二、上生产前需要自己验证的几件事**

DynamoDB 官方给出的性能口径是超大规模下个位数毫秒延迟和 99%+ recall。这是通用口径，你的数据分布下的实际表现需要自己压测。具体建议优先验证：

  * **嵌入模型和维度** 。这是影响最大、却最容易被跳过的一步。至少验证三件事：模型对你的语言和领域词汇的表现；是否支持文档/查询非对称 embed；在你的数据上 512 维和 1024 维的召回差多少。注意 Dimensions 和 DistanceFunction 在索引创建后都不可修改，所以模型必须在建索引之前定下来。另外给每条 item 记一个 embed_model 属性，将来换模型时才知道哪些向量需要回填 —— 一个索引里混着两个模型的向量，搜索不报错，只会安静地返回没有意义的结果。
  * **recall 与 P99** 。ANN 的召回特征只在百万级以上才显现出来，用几十条数据测不出任何有意义的结论。用真实数据分布和真实 QPS 压。
  * **分区键会不会形成热点** 。每个分区键值有独立的配额上限：搜索 1 GBps、向量索引写入 10 MBps（均可通过 AWS Support 调整）。如果你的租户体量严重不均，头部租户可能先撞上限，这时候可能需要在分区键里引入分片后缀。
  * **过滤条件对召回和成本的影响** 。内联过滤在存储层生效，但一个过滤性很强的条件配合 ANN，可能让实际返回条数少于 TopK。这一点必须用真实数据测。另外 SearchConditionExpression 目前只支持等值 =，<>、<、>、IN 都还没有，需要范围过滤只能召回后在应用侧筛，而这会进一步削减有效结果数。
  * **成本模型和你熟悉的不一样** 。向量搜索按字节计费，ReturnConsumedCapacity 返回的是 VectorSearchRequestBytes，不是 RCU。上文一次 1024 维 / TopK=5 的搜索约 15 KB。写入侧则要算上向量复制到索引的开销。维度直接乘在存储和读写成本上，所以「用 512 维还是 1024 维」是一个真实的成本决策 —— 配合 Embed v4 的 Matryoshka 维度，值得在你的数据上做召回质量对比后再定。
  * **备份恢复与跨区域策略** 。向量索引继承基表的加密配置。给带向量索引的表加副本时，索引定义会自动复制到新区域，不需要在每个区域单独建。
  * **几个硬性限制要提前纳入设计** ：仅按需容量模式；每表最多 5 个向量索引；最多 4096 维；向量在索引中以 f32 精度存储（更高精度写入会在复制到索引时降精度）；向量索引不支持 Query、Scan 和 PartiQL。



还有一个当前的工程现实：AWS::DynamoDB::Table 上目前还没有 VectorIndexes 属性，所以纯 CloudFormation / CDK 暂时声明不了向量索引。要保持全 IaC 的团队，短期方案是包一个 Lambda-backed 自定义资源来调 CreateTable。

## **十三、一个必须讲清楚的安全边界**

用分区键把搜索限定在单个租户内，是数据局部性和性能优化，不是访问控制。

任何持有该索引 dynamodb:SearchVectors 权限的主体，都可以搜索任意分区键值。细粒度访问控制（FGAC）的条件键，比如 dynamodb:LeadingKeys，对 SearchVectors 不生效，因此无法在 IAM 策略层面限制到单个分区键值。

如果你的业务要求数据层的强租户隔离，就要用独立的表或独立的索引，配独立的 IAM 授权。把这一点写进架构评审清单。

另外注意 SearchVectors 的资源 ARN 是索引级的：
    
    
    arn:aws:dynamodb:<region>:<account-id>:table/<表名>/index/<索引名>
    

而且 SearchVectors 走独立的向量搜索端点（<account-id>.search-ddb.<region>.amazonaws.com），与你管理表结构用的标准 DynamoDB 端点不同。用 AWS [SDK](<https://aws.amazon.com/cn/what-is/sdk/>) 或 [CLI](<https://aws.amazon.com/cn/what-is/cli/>) 时[路由](<https://aws.amazon.com/cn/what-is/routing/>)是自动的，不需要配置；但如果你在做 VPC endpoint、网络策略或自研 HTTP 客户端，这个差异要知道。

## **十四、什么时候不该用它**

原生向量索引让 DynamoDB 成为一个很有说服力的默认选择，但它不是万能替代品。以下场景仍然要做服务选型对比：

  * 复杂混合检索：需要 BM25 全文相关性打分、与向量分数融合、多字段加权、聚合、facet —— 这是 [Amazon OpenSearch](<https://aws.amazon.com/cn/opensearch-service/>) Service 的主场。
  * 海量冷向量的低成本存储：几十亿条、查询稀疏、能接受更高延迟 —— [Amazon S3 Vectors](<https://aws.amazon.com/cn/s3/features/vectors/>) 的成本结构更合适。
  * 丰富的元数据过滤：需要范围、IN、否定、嵌套条件 —— 当前的等值-only 过滤会成为约束。
  * 本来就不在 DynamoDB 里的数据：如果为了用这个特性把数据搬进 DynamoDB，你只是把同步问题换了个位置。



反过来，判断标准其实很清晰：如果你的操作型数据已经在 DynamoDB，而你正准备为语义检索搭第二套存储和一条同步管道，那就先评估向量索引。 省掉的那条管道，就是这个特性最直接的价值。

## **十五、小结**

DynamoDB 原生向量搜索让事务数据和语义检索在同一张表里合流。Agent 记忆是最贴合的场景之一：一次 PutItem 同时落地记忆文本、业务属性和向量；Query 负责按时间取最近上下文，SearchVectors 负责按语义召回相关记忆；删除和 TTL 自动带走索引条目；写入还可以放进 DynamoDB 事务。

需要提前想清楚的是：分区键的选择既决定扩展性也决定召回范围，但它不是安全边界；等值-only 的过滤能力和 16 MB 无分页的响应上限会影响数据模型；成本按字节计量，维度直接乘进账单；官方性能数字要用你自己的数据复现。

把这些放在一起看，结论是：这个特性显著降低了「在 DynamoDB 之上做语义检索」的架构复杂度，同时保留了在复杂检索场景下继续做服务选型的必要性。

**下一步行动：**

**相关产品：**

  * [Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=1>) — 无服务器分布式 NoSQL 数据库
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=3>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon OpenSearch](<https://aws.amazon.com/cn/opensearch-service/?p=bl_pr_opensearch_l=4>) — 搜索和分析引擎
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=5>) — 无需服务器即可运行代码



**相关文章：**

  * [JoyCastle 素材资产智能化之路：基于 Amazon Nova Multimodal Embeddings 的广告素材管理实践](<https://aws.amazon.com/cn/blogs/china/joycastle-intelligent-based-on-amazon-nova-multimodal-embeddings-management-practice/?p=bl_ar_l=1>)
  * [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](<https://aws.amazon.com/cn/blogs/china/agent-system-engineering-practice/?p=bl_ar_l=2>)
  * [从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（二）：向量索引迁移与 Amazon Bedrock 集成](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-2/?p=bl_ar_l=3>)
  * [AI Agent 存储选型：Curvine 如何在 EKS 上支撑万级Agent运行](<https://aws.amazon.com/cn/blogs/china/ai-agent-storage-curvine-how-to-eks-agent/?p=bl_ar_l=4>)
  * [用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例](<https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=5>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 邱鹏峻

亚马逊云科技解决方案架构师，专注于为企业提供基于亚马逊云服务的架构设计、技术咨询及最佳实践指导，具有多年一线研发经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---