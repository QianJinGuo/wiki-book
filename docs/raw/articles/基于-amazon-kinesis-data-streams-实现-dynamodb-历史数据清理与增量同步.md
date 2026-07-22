---
tags: [wechat, article, claude, openai]
title: "基于 Amazon Kinesis Data Streams 实现 DynamoDB 历史数据清理与增量同步"
url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-kinesis-data-streams-implement-dynamodb/
source: rss
feed_name: AWS China Blog
sha256: e7244f2bc03e124283777ac175b2d10d242c461b61a4824cf537bb2d83ab036e
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：本文介绍了一种基于 Amazon Kinesis Data Streams、AWS Lambda、AWS Glue 和 Amazon S3 的完整方案，帮助企业客户在不停机的前提下，对 Amazon DynamoDB 表进行历史数据清理、TTL 自动过期配置，并通过 Kinesis 实现增量数据的无缝同步，最终将过期数据归档至 Amazon S3 智能分层存储以降低长期成本。</p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
  <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
  <div style="line-height: 1.8;margin: 0;padding: 0"> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">01</span>
    <a style="color: #333;text-decoration: none" href="#section1">一、引言</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">02</span>
    <a style="color: #333;text-decoration: none" href="#section2">二、概览</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">03</span>
    <a style="color: #333;text-decoration: none" href="#section3">三、方案架构</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">04</span>
    <a style="color: #333;text-decoration: none" href="#section4">四、前置条件</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">05</span>
    <a style="color: #333;text-decoration: none" href="#section5">五、实施详解</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">06</span>
    <a style="color: #333;text-decoration: none" href="#section6">六、成本分析</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">07</span>
    <a style="color: #333;text-decoration: none" href="#section7">七、常见问题</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">08</span>
    <a style="color: #333;text-decoration: none" href="#section8">八、总结</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">09</span>
    <a style="color: #333;text-decoration: none" href="#section9">九、参考资源</a>
   </div> 
  </div> 
 </div> 
 <div style="height: 50px"></div> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 10px 0;width: 100%;margin-bottom: 30px"> 
 <div style="height: 30px"></div> 
 <h2 id="section1"><strong>一、引言</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">在使用 <a href="https://aws.amazon.com/cn/dynamodb/" target="_blank" rel="noopener">Amazon DynamoDB</a> 构建业务系统的过程中，随着数据持续写入，表中会积累大量历史数据。对于视频字幕翻译、日志记录、IoT 事件等场景，数据往往具有明显的时效性——超过一定时间后不再被业务查询，但仍占用存储空间并产生费用。</p> 
 <p style="color: #5f6368;font-size: 16px">企业客户在处理这类问题时，通常面临以下挑战：</p> 
 <ol> 
  <li style="color: #5f6368;font-size: 16px">存储成本持续增长：DynamoDB 按存储量计费，TB 级历史数据每月产生可观的存储费用，而这些数据可能已经不再被访问。</li> 
  <li style="color: #5f6368;font-size: 16px">数据清理与业务连续性的矛盾：直接删除历史数据需要消耗大量写入容量（WCU），可能影响在线业务的正常读写；而创建新表并迁移数据，又面临迁移窗口期内增量数据丢失的风险。</li> 
  <li style="color: #5f6368;font-size: 16px">增量同步的时间窗口限制：DynamoDB Streams 的数据保留期仅为 24 小时且不可修改。对于 10TB 以上的大表，历史数据的导出、清洗和导入流程可能需要数天时间，远超 24 小时的窗口期。</li> 
  <li style="color: #5f6368;font-size: 16px">缺乏自动化的数据生命周期管理：清理后的数据如果没有归档机制，可能导致合规审计所需的历史数据永久丢失。</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">本文将介绍一种基于 <a href="https://aws.amazon.com/cn/kinesis/data-streams/" target="_blank" rel="noopener">Amazon Kinesis Data Streams</a> 的完整解决方案，通过将增量同步的时间窗口从 24 小时扩展到最长 365 天，从根本上解决大数据量场景下的迁移时间约束问题。该方案与 AWS Well-Architected Framework 的卓越运营和成本优化支柱保持一致。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section2"><strong>二、概览</strong></h2> 
 <h3>2.1 业务场景</h3> 
 <p style="color: #5f6368;font-size: 16px">某字幕翻译业务中，每次翻译任务会在 DynamoDB 中生成大量字幕记录。随着业务运行，表中积累了数 TB 的历史数据，其中大部分超过 30 天的记录已不再被业务查询。客户希望：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">仅保留最近 30 天的活跃数据</li> 
  <li style="color: #5f6368;font-size: 16px">对保留的数据自动添加 TTL，实现持续的自动过期清理</li> 
  <li style="color: #5f6368;font-size: 16px">迁移过程中不丢失任何增量写入</li> 
  <li style="color: #5f6368;font-size: 16px">过期删除的数据归档到低成本存储，满足合规要求</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>2.2 方案收益</h3> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">维度</td> 
    <td style="padding: 12px;border: 1px solid #ddd">收益</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">零数据丢失</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Kinesis 保留期最长 365 天，彻底消除迁移窗口期的数据丢失风险</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">零停机迁移</td> 
    <td style="padding: 12px;border: 1px solid #ddd">源表持续提供服务，增量数据通过 Kinesis + Lambda 实时同步到新表</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">自动生命周期管理</td> 
    <td style="padding: 12px;border: 1px solid #ddd">TTL 自动过期删除 + DynamoDB Streams 归档到 S3 智能分层，形成完整的数据生命周期</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">成本显著降低</td> 
    <td style="padding: 12px;border: 1px solid #ddd">清理历史数据减少 DynamoDB 存储费用，归档数据利用 S3 智能分层最低至 $0.00099/GB/月</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">架构简洁</td> 
    <td style="padding: 12px;border: 1px solid #ddd">全部使用 AWS 托管服务，无需维护额外基础设施</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>2.3 方案选型：为什么选择 Kinesis Data Streams</h3> 
 <p style="color: #5f6368;font-size: 16px">在增量同步环节，DynamoDB 原生支持两种变更捕获机制。以下是关键对比：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd"></td> 
    <td style="padding: 12px;border: 1px solid #ddd">DynamoDB Streams</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Kinesis Data Streams</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">数据保留期</td> 
    <td style="padding: 12px;border: 1px solid #ddd">24 小时（不可修改）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">最长 365 天（可配置）</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">额外成本</td> 
    <td style="padding: 12px;border: 1px solid #ddd">免费</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Kinesis 按 shard/小时计费</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Lambda 代码</td> 
    <td style="padding: 12px;border: 1px solid #ddd">直接读取 DynamoDB 格式</td> 
    <td style="padding: 12px;border: 1px solid #ddd">需要 base64 解码</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">适用场景</td> 
    <td style="padding: 12px;border: 1px solid #ddd">小数据量，24h 内完成</td> 
    <td style="padding: 12px;border: 1px solid #ddd">大数据量，可能需要数天</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">对于 10TB 以上的大表，历史数据处理流程（导出 → Glue 清洗 → 导入新表）通常需要 2-5 天。DynamoDB Streams 的 24 小时保留期无法覆盖这一时间窗口，而 Kinesis Data Streams 可将保留期设为 7 天甚至更长，从根本上消除了时间约束。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section3"><strong>三、方案架构</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">该方案分为两条并行的数据处理路径：历史数据批量处理和增量数据实时同步，最终汇聚到同一张新表，并通过 TTL + DynamoDB Streams 实现持续的数据生命周期管理。</p> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/04/28/based-on-amazon-kinesis-data-streams-implement-dynamodb-1.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/04/28/based-on-amazon-kinesis-data-streams-implement-dynamodb-1.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图1]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>3.1 核心组件</h3> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">组件</td> 
    <td style="padding: 12px;border: 1px solid #ddd">功能</td> 
    <td style="padding: 12px;border: 1px solid #ddd">说明</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><a href="https://aws.amazon.com/cn/dynamodb/" target="_blank" rel="noopener">Amazon DynamoDB</a></td> 
    <td style="padding: 12px;border: 1px solid #ddd">源表与目标表</td> 
    <td style="padding: 12px;border: 1px solid #ddd">源表持续提供服务，新表仅包含清洗后的数据并启用 TTL</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><a href="https://aws.amazon.com/cn/kinesis/data-streams/" target="_blank" rel="noopener">Amazon Kinesis Data Streams</a></td> 
    <td style="padding: 12px;border: 1px solid #ddd">增量变更捕获</td> 
    <td style="padding: 12px;border: 1px solid #ddd">记录源表所有写入操作，保留期可配置至 7 天以上</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><a href="https://aws.amazon.com/cn/lambda/" target="_blank" rel="noopener">AWS Lambda</a></td> 
    <td style="padding: 12px;border: 1px solid #ddd">增量同步 + 归档</td> 
    <td style="padding: 12px;border: 1px solid #ddd">消费 Kinesis 记录写入新表（加 TTL），消费 DynamoDB Streams 归档到 S3</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><a href="https://aws.amazon.com/cn/glue/" target="_blank" rel="noopener">AWS Glue</a></td> 
    <td style="padding: 12px;border: 1px solid #ddd">历史数据清洗</td> 
    <td style="padding: 12px;border: 1px solid #ddd">筛选有效数据、添加 TTL 字段、转换为 DynamoDB JSON 格式</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><a href="https://aws.amazon.com/cn/s3/" target="_blank" rel="noopener">Amazon S3</a></td> 
    <td style="padding: 12px;border: 1px solid #ddd">数据中转与归档</td> 
    <td style="padding: 12px;border: 1px solid #ddd">存储导出数据、Glue 处理结果，以及过期数据的长期归档（智能分层）</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>3.2 工作流程与执行顺序</h3> 
 <p style="color: #5f6368;font-size: 16px">整体流程的执行顺序至关重要，必须确保增量捕获先于历史数据导出启动，以避免数据丢失：</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">步骤 1: 创建 Kinesis Data Stream（保留期 7 天）
步骤 2: 源表关联 Kinesis Stream             ← 最先做，开始记录所有变更
步骤 3: 创建 Lambda 函数（先不添加触发器）
步骤 4: 导出源表数据到 S3
步骤 5: Glue 处理历史数据（筛选+加TTL）
步骤 6: Import from S3 创建新表
步骤 7: 启用 TTL
步骤 8: 添加 Lambda 触发器（Kinesis，TRIM_HORIZON） ← 自动补上窗口期数据
步骤 9: 验证数据完整性
<img src="https://s.w.org/images/core/emoji/14.0.0/72x72/26a0.png" alt="⚠" class="wp-smiley" style="height: 1em; max-height: 1em;"> 步骤 4-7 需在 Kinesis 保留期（7 天）内完成，保留期可按需延长
</code></pre> 
 </div> 
 <p style="color: #232f3e;font-size: 16px"><strong><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/2139.png" alt="ℹ" class="wp-smiley" style="height: 1em; max-height: 1em;"> 关键设计说明</strong></p> 
 <p style="color: #5f6368;font-size: 16px">为什么步骤 8 使用 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">TRIM_HORIZON</code>？</p> 
 <p style="color: #5f6368;font-size: 16px">因为 Lambda 触发器设置为从 Kinesis Stream 的最早可用记录开始消费，这意味着从步骤 2 开始记录的所有增量变更都会被自动处理，无需手动对齐时间窗口。窗口期内与历史数据重叠的记录，通过 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">put_item</code> 的覆盖特性自动去重。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section4"><strong>四、前置条件</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">在开始实施之前，请确保满足以下条件：</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>AWS 环境要求</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">具有适当 IAM 权限的 AWS 账户</li> 
  <li style="color: #5f6368;font-size: 16px">已有 DynamoDB 源表（本文以 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">VideoTranslationSubtitle</code> 为例）</li> 
  <li style="color: #5f6368;font-size: 16px">用于数据中转的 S3 存储桶（本文以 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">glue-test023</code> 为例）</li> 
  <li style="color: #5f6368;font-size: 16px">源表与目标表位于同一区域（本文以 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">us-east-1</code> 为例）</li> 
 </ul> 
 <p style="color: #232f3e;font-size: 16px"><strong>权限要求</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">DynamoDB：读写源表和目标表、导出到 S3、启用 Kinesis Streaming 和 DynamoDB Streams</li> 
  <li style="color: #5f6368;font-size: 16px">Kinesis：创建和管理 Data Stream</li> 
  <li style="color: #5f6368;font-size: 16px">Lambda：创建函数、配置触发器</li> 
  <li style="color: #5f6368;font-size: 16px">Glue：创建和运行 ETL Job</li> 
  <li style="color: #5f6368;font-size: 16px">S3：读写数据桶</li> 
  <li style="color: #5f6368;font-size: 16px">IAM：创建和管理角色与策略</li> 
 </ul> 
 <div style="height: 30px"></div> 
 <h2 id="section5"><strong>五、实施详解</strong></h2> 
 <h3>5.1 步骤一：创建 Kinesis Data Stream</h3> 
 <p style="color: #5f6368;font-size: 16px">首先创建用于捕获 DynamoDB 源表增量变更的 Kinesis Data Stream，并将保留期设置为 7 天，为后续的历史数据处理预留充足的时间窗口。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>控制台操作</strong></p> 
 <p style="color: #5f6368;font-size: 16px">1. Kinesis 控制台 → Data streams → Create data stream</p> 
 <p style="color: #5f6368;font-size: 16px">2. 配置：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Data stream name</td> 
    <td style="padding: 12px;border: 1px solid #ddd">VideoTranslationSubtitle-stream</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Capacity mode</td> 
    <td style="padding: 12px;border: 1px solid #ddd">On-demand</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">3. 点击 Create data stream</p> 
 <p style="color: #5f6368;font-size: 16px">4. 修改保留期：点击刚创建的 Stream → Configuration 标签 → Data retention period → Edit → 修改为 168 小时（7 天）→ Save changes</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>CLI 操作</strong></p> 
 <pre><code class="lang-bash">aws kinesis create-stream \
  --stream-name VideoTranslationSubtitle-stream \
  --stream-mode-details StreamMode=ON_DEMAND \
  --region us-east-1
aws kinesis increase-stream-retention-period \
  --stream-name VideoTranslationSubtitle-stream \
  --retention-period-hours 168 \
  --region us-east-1
</code></pre> 
 <div style="height: 10px"></div> 
 <h3>5.2 步骤二：DynamoDB 源表关联 Kinesis Stream</h3> 
 <p style="color: #5f6368;font-size: 16px">将源表与 Kinesis Data Stream 关联后，源表的所有写入、更新和删除操作都会被实时记录到 Stream 中。这一步必须在导出历史数据之前完成，以确保窗口期内的增量数据不会丢失。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>控制台操作：</strong></p> 
 <p style="color: #5f6368;font-size: 16px">1. DynamoDB 控制台 → Tables → 选择 `VideoTranslationSubtitle`</p> 
 <p style="color: #5f6368;font-size: 16px">2. Exports and streams 标签</p> 
 <p style="color: #5f6368;font-size: 16px">3. Amazon Kinesis data stream details 区域 → Turn on</p> 
 <p style="color: #5f6368;font-size: 16px">4. 选择 <span style="background-color: #f2f4f5;color: #222222;font-family: Consolas, Monaco, monospace">VideoTranslationSubtitle-stream</span></p> 
 <p style="color: #5f6368;font-size: 16px">5. 点击 Turn on stream</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>CLI 操作：</strong></p> 
 <pre><code class="lang-bash">aws dynamodb enable-kinesis-streaming-destination \
  --table-name VideoTranslationSubtitle \
  --stream-arn arn:aws:kinesis:us-east-1:&lt;account-id&gt;:stream/VideoTranslationSubtitle-stream \
  --region us-east-1
</code></pre> 
 <p style="color: #232f3e;font-size: 16px"><strong>验证：</strong></p> 
 <pre><code class="lang-bash">aws dynamodb describe-kinesis-streaming-destination \
  --table-name VideoTranslationSubtitle \
  --region us-east-1
</code></pre> 
 <p style="color: #5f6368;font-size: 16px">确认 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">StreamStatus</code> 为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ACTIVE</code> 后再进行下一步。</p> 
 <div style="height: 10px"></div> 
 <h3>5.3 步骤三：创建增量同步 Lambda 函数</h3> 
 <p style="color: #5f6368;font-size: 16px">该函数负责消费 Kinesis Data Stream 中的增量记录，为每条数据添加 TTL 字段后写入目标表。此步骤仅创建函数，暂不添加触发器——触发器将在历史数据导入完成后再添加。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>创建函数：</strong></p> 
 <p style="color: #5f6368;font-size: 16px">1. Lambda 控制台 → Create function</p> 
 <p style="color: #5f6368;font-size: 16px">2. 配置：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Function name</td> 
    <td style="padding: 12px;border: 1px solid #ddd">ddb-kinesis-sync-ttl</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Runtime</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Python 3.12</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Architecture</td> 
    <td style="padding: 12px;border: 1px solid #ddd">arm64</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Execution role</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Create a new role with basic Lambda permissions</td> 
   </tr> 
  </tbody> 
 </table> 
 <p>3. 粘贴以下代码：</p> 
 <pre><code class="lang-python">import boto3
import json
import base64
import time
dynamodb = boto3.client('dynamodb', region_name='us-east-1')
TARGET_TABLE = 'VideoTranslationSubtitle-ttl'
TTL_DAYS = 30
def lambda_handler(event, context):
    for record in event['Records']:
        payload = base64.b64decode(record['kinesis']['data']).decode('utf-8')
        data = json.loads(payload)
        event_name = data.get('eventName', '')
        if event_name in ('INSERT', 'MODIFY'):
            new_image = data['dynamodb']['NewImage']
            ttl_value = int(time.time()) + TTL_DAYS * 86400
            new_image['test001'] = {'N': str(ttl_value)}
            dynamodb.put_item(TableName=TARGET_TABLE, Item=new_image)
    return {'statusCode': 200}
</code></pre> 
 <p style="color: #5f6368;font-size: 16px">&gt; <img src="https://s.w.org/images/core/emoji/14.0.0/72x72/26a0.png" alt="⚠" class="wp-smiley" style="height: 1em; max-height: 1em;"> 注意：Kinesis 版代码需要对 `record[‘kinesis’][‘data’]` 进行 base64 解码，这与直接使用 DynamoDB Streams 触发器的代码不同。</p> 
 <p style="color: #5f6368;font-size: 16px">4. 点击 Deploy</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>配置 IAM 权限：</strong></p> 
 <p style="color: #5f6368;font-size: 16px">Lambda 函数需要读取 Kinesis Stream 和写入目标 DynamoDB 表的权限。进入 Lambda 函数页面 → Configuration → Permissions → 点击 Role name → Add permissions → Create inline policy → JSON：</p> 
 <pre><code class="lang-json">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "dynamodb:PutItem",
      "Resource": "arn:aws:dynamodb:us-east-1:&lt;account-id&gt;:table/VideoTranslationSubtitle-ttl"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:GetRecords",
        "kinesis:GetShardIterator",
        "kinesis:DescribeStream",
        "kinesis:DescribeStreamSummary",
        "kinesis:ListShards",
        "kinesis:ListStreams",
        "kinesis:SubscribeToShard"
      ],
      "Resource": "arn:aws:kinesis:us-east-1:&lt;account-id&gt;:stream/VideoTranslationSubtitle-stream"
    }
  ]
}
</code></pre> 
 <div style="background-color: #f8f9fa;border-left: 4px solid #ccc;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px">
  将 
  <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">&lt;account-id&gt;</code> 替换为实际 AWS 账户 ID
 </div> 
 <p style="color: #5f6368;font-size: 16px">Policy name：`kinesis-sync-policy` → Create policy</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>调整 Lambda 配置：</strong></p> 
 <p style="color: #232f3e;font-size: 16px">Configuration → General configuration → Edit</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Memory</td> 
    <td style="padding: 12px;border: 1px solid #ddd">256 MB</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Timeout</td> 
    <td style="padding: 12px;border: 1px solid #ddd">1 min 0 sec</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>5.4 步骤四：导出历史数据到 S3</h3> 
 <p style="color: #5f6368;font-size: 16px">利用 DynamoDB 原生的 Export to S3 功能，将源表的全量数据导出。该操作不会影响源表的正常读写性能。</p> 
 <p style="color: #5f6368;font-size: 16px">1. DynamoDB 控制台 → 左侧 Exports to S3 → Export to S3</p> 
 <p style="color: #5f6368;font-size: 16px">2. 配置：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Source table</td> 
    <td style="padding: 12px;border: 1px solid #ddd">VideoTranslationSubtitle</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">S3 bucket</td> 
    <td style="padding: 12px;border: 1px solid #ddd">glue-test023</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">S3 prefix</td> 
    <td style="padding: 12px;border: 1px solid #ddd">ddb-export/</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Export format</td> 
    <td style="padding: 12px;border: 1px solid #ddd">DynamoDB JSON</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Export type</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Full export</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">3. 点击 Export，等待状态变为 Completed</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>验证：</strong></p> 
 <pre><code class="lang-bash">aws s3 ls s3://glue-test023/ddb-export/ --recursive --summarize --human-readable
</code></pre> 
 <div style="height: 10px"></div> 
 <h3>5.5 步骤五：Glue 处理历史数据（筛选 + 添加 TTL）</h3> 
 <p style="color: #5f6368;font-size: 16px">使用 <a href="https://aws.amazon.com/cn/glue/">AWS Glue</a> ETL Job 对导出的历史数据进行清洗：筛选出最近 30 天的有效数据，为每条记录计算并添加 TTL 字段，最后转换为 DynamoDB JSON 格式输出到 S3。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>上传 Glue 脚本：</strong></p> 
 <pre><code class="lang-bash">aws s3 cp glue_add_ttl.py s3://aws-glue-assets-&lt;account-id&gt;-us-east-1/scripts/glue_add_ttl.py
</code></pre> 
 <p style="color: #232f3e;font-size: 16px"><strong>Glue 脚本内容：</strong></p> 
 <pre><code class="lang-python">import sys
import time
from datetime import datetime, timedelta, timezone
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from pyspark.sql.functions import col, udf
from pyspark.sql.types import LongType, StringType
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)
S3_INPUT = "s3://glue-test023/ddb-export/"
S3_OUTPUT = "s3://glue-test023/ddb-with-ttl/"
ONE_MONTH_AGO = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
@udf(returnType=LongType())
def calc_ttl(created_at):
    dt = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    return int((dt + timedelta(days=30)).timestamp())
df = spark.read.json(S3_INPUT)
df_flat = df.select(
    col("Item.JobId.S").alias("JobId"),
    col("Item.Index.N").cast("string").alias("Index"),
    col("Item.Content.S").alias("Content"),
    col("Item.BeginTime.S").alias("BeginTime"),
    col("Item.EndTime.S").alias("EndTime"),
    col("Item.CreatedAt.S").alias("CreatedAt"),
)
df_filtered = df_flat.filter(col("CreatedAt") &gt;= ONE_MONTH_AGO)
df_with_ttl = df_filtered.withColumn("test001", calc_ttl(col("CreatedAt")))
@udf(returnType=StringType())
def to_ddb_json(job_id, index, content, begin_time, end_time, created_at, ttl):
    import json
    item = {"Item": {"JobId": {"S": job_id}, "Index": {"N": index}, "Content": {"S": content},
            "BeginTime": {"S": begin_time}, "EndTime": {"S": end_time},
            "CreatedAt": {"S": created_at}, "test001": {"N": str(ttl)}}}
    return json.dumps(item, ensure_ascii=False)
df_output = df_with_ttl.select(
    to_ddb_json("JobId", "Index", "Content", "BeginTime", "EndTime", "CreatedAt", "test001").alias("value"))
df_output.write.mode("overwrite").text(S3_OUTPUT)
job.commit()
</code></pre> 
 <p style="color: #232f3e;font-size: 16px"><strong>创建 Glue Job（控制台）</strong></p> 
 <p style="color: #5f6368;font-size: 16px">1. Glue 控制台 → ETL jobs → Script editor → Engine: Spark → Create</p> 
 <p style="color: #5f6368;font-size: 16px">2. 粘贴脚本 → Job details</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Name</td> 
    <td style="padding: 12px;border: 1px solid #ddd">VideoTranslationSubtitle-ttl</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">IAM Role</td> 
    <td style="padding: 12px;border: 1px solid #ddd">有 S3 读写权限的 Glue Role</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Glue version</td> 
    <td style="padding: 12px;border: 1px solid #ddd">4.0 或 5.0</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Language</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Python 3</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Worker type</td> 
    <td style="padding: 12px;border: 1px solid #ddd">G.1X</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Number of workers</td> 
    <td style="padding: 12px;border: 1px solid #ddd">10（大数据量可增加到 50-100）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Job timeout</td> 
    <td style="padding: 12px;border: 1px solid #ddd">480 分钟</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Job bookmark</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Disable</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">3. Save → Run</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>验证输出：</strong></p> 
 <pre><code class="lang-bash">aws s3 ls s3://glue-test023/ddb-with-ttl/ --recursive --summarize --human-readable
aws s3 cp s3://glue-test023/ddb-with-ttl/&lt;任意文件&gt; - | head -1 | python3 -m json.tool
</code></pre> 
 <div style="height: 10px"></div> 
 <h3>5.6 步骤六：从 S3 导入创建新表</h3> 
 <p style="color: #5f6368;font-size: 16px">使用 DynamoDB 的 Import from S3 功能，将 Glue 处理后的数据直接导入并创建新表。</p> 
 <p style="color: #5f6368;font-size: 16px">&gt; <img src="https://s.w.org/images/core/emoji/14.0.0/72x72/26a0.png" alt="⚠" class="wp-smiley" style="height: 1em; max-height: 1em;"> 注意：Import from S3 会创建一张全新的表，不能导入到已有表。</p> 
 <p style="color: #5f6368;font-size: 16px">1. DynamoDB 控制台 → Imports from S3 → Import from S3</p> 
 <p style="color: #232f3e;font-size: 16px">第一页 – Source：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">配置项</td> 
    <td style="padding: 12px;border: 1px solid #ddd">值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">S3 source URL</td> 
    <td style="padding: 12px;border: 1px solid #ddd">s3://glue-test023/ddb-with-ttl/</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Import file format</td> 
    <td style="padding: 12px;border: 1px solid #ddd">DynamoDB JSON</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Import file compression</td> 
    <td st