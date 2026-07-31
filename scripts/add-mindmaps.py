"""Add mindmap concept overview diagrams to all 20 chapter pages + index."""
import re, os

DOCS_DIR = '/Users/jinguo/wiki-book/docs'

# Each chapter's mindmap — designed for "first mental model" cognitive stage
MINDMAPS = {
    'ch01-ai-basics.md': """mindmap
  root((AI与LLM基础))
    Token化
      分词器
      BPE/WordPiece
      词汇表
    嵌入
      语义向量
      位置编码
    注意力机制
      自注意力
      多头注意力
      KV Cache
    前馈网络
      FFN层
      MoE混合专家
    生成与推理
      Next-Token预测
      投机解码
      量化加速
    模型演化
      GPT系列
      Claude系列
      开源模型
    应用能力
      代码生成
      推理链
      多模态""",

    'ch02-prompt.md': """mindmap
  root((提示词工程))
    基础范式
      Zero-shot
      Few-shot
      Chain-of-Thought
    高级技巧
      Tree-of-Thought
      Self-Consistency
      ReAct提示
    上下文工程
      系统提示
      上下文窗口管理
      长上下文优化
    结构化输出
      JSON Schema
      Function Calling
      约束生成
    提示词安全
      注入攻击
      越狱防御
      红队测试
    评估与优化
      A/B测试
      提示词版本管理
      自动优化""",

    'ch03-ai-tools.md': """mindmap
  root((AI工具生态))
    CLI Agent
      Codex
      Claude Code
      Cursor
    浏览器工具
      Playwright
      Browser-use
      CDP
    开发平台
      VS Code插件
      JetBrains插件
      IDE集成
    知识管理
      Wiki系统
      RAG工具
      笔记工具
    自动化工具
      工作流引擎
      Zapier类
      n8n
    模型服务
      OpenAI API
      Anthropic API
      开源推理
    监控与调试
      Langfuse
      Helicone
      可观测性""",

    'ch04-agent-core.md': """mindmap
  root((Agent核心架构))
    推理模式
      ReAct
      Plan-and-Execute
      反思循环
    规划器
      任务分解
      目标层级
      动态重规划
    执行器
      工具调用
      代码执行
      沙箱隔离
    观察与反馈
      环境感知
      结果验证
      错误恢复
    Agent框架
      OpenAI Agents SDK
      LangGraph
      CrewAI
      AutoGen
    自主性等级
      人工审批
      人机协作
      全自主""",

    'ch05-harness.md': """mindmap
  root((Harness护栏架构))
    可观测性
      日志追踪
      指标监控
      链路追踪
    护栏
      输入校验
      输出过滤
      速率限制
    编排层
      工作流引擎
      状态管理
      错误处理
    人类监督
      审批网关
      升级机制
      覆盖控制
    评估
      质量评分
      回归检测
      A/B实验
    治理
      合规检查
      审计日志
      访问控制""",

    'ch06-memory.md': """mindmap
  root((Agent记忆系统))
    工作记忆
      上下文窗口
      注意力机制
      上下文压缩
    短期记忆
      Session存储
      对话历史
      临时缓存
    长期记忆
      向量数据库
      知识图谱
      结构化存储
    记忆检索
      语义搜索
      关键词匹配
      混合检索
    记忆管理
      遗忘机制
      重要性评分
      压缩摘要
    跨会话持久化
      用户画像
      偏好学习
      知识积累""",

    'ch07-skill-tool.md': """mindmap
  root((技能与工具))
    Skill技能
      可复用能力
      描述与触发
      版本管理
    MCP协议
      Server
      Client
      Tool Bus
    Function Calling
      参数Schema
      返回格式
      并行调用
    工具生态
      搜索
      代码执行
      文件操作
      API调用
    工具选择
      意图匹配
      参数推断
      依赖解析
    安全边界
      权限控制
      沙箱执行
      审计日志""",

    'ch08-multi-agent.md': """mindmap
  root((多Agent协作))
    协作模式
      编排者-执行者
      对等协作
      层级团队
    通信机制
      消息传递
      共享状态
      事件驱动
    角色分配
      Leader
      Worker
      Critic
    框架
      AutoGen
      CrewAI
      LangGraph
      A2A协议
    编排策略
      串行
      并行
      条件分支
    冲突解决
      优先级
      投票
      仲裁者""",

    'ch09-ai-coding.md': """mindmap
  root((AI编程))
    编程范式
      Vibe Coding
      Agentic Coding
      辅助编程
    核心工具
      Codex
      Claude Code
      Cursor
      Windsurf
    工作流
      意图理解
      代码生成
      测试验证
      迭代修复
    代码质量
      静态分析
      自动测试
      Code Review
    最佳实践
      提示词工程
      上下文管理
      版本控制
    安全考量
      代码注入
      依赖安全
      敏感信息泄露""",

    'ch10-rag.md': """mindmap
  root((RAG检索增强))
    检索层
      关键词BM25
      近邻图扩展
      语义搜索
    索引构建
      向量化
      TF-IDF
      稀疏矩阵
    重排序
      Reranker
      相关性融合
      多路召回
    上下文工程
      注入策略
      窗口管理
      压缩摘要
    存储后端
      向量数据库
      R2对象存储
      SQLite FTS
    降级策略
      客户端优先
      服务器兜底
      空结果处理""",

    'ch11-infra.md': """mindmap
  root((云基础设施))
    云平台
      AWS
      Cloudflare
      GCP/Azure
    容器化
      Docker
      Kubernetes
      Serverless
    API层
      Gateway
      负载均衡
      CDN加速
    数据存储
      R2/S3
      关系数据库
      向量数据库
    可观测性
      日志
      指标
      链路追踪
    部署策略
      CI/CD
      蓝绿部署
      金丝雀发布
    成本优化
      Spot实例
      自动扩缩
      资源右调""",

    'ch12-security.md': """mindmap
  root((AI安全))
    威胁建模
      提示注入
      数据泄露
      供应链攻击
    防御层
      输入过滤
      输出审查
      沙箱隔离
    检测
      异常检测
      入侵检测
      行为分析
    响应
      自动阻断
      升级处理
      取证分析
    合规
      GDPR
      行业标准
      审计要求
    隐私保护
      差分隐私
      联邦学习
      数据脱敏""",

    'ch13-mlops.md': """mindmap
  root((MLOps与评估))
    实验管理
      超参调优
      实验追踪
      版本控制
    评估体系
      基准测试
      人工评估
      LLM-as-Judge
    部署流水线
      模型打包
      A/B测试
      灰度发布
    监控
      性能指标
      数据漂移
      概念漂移
    CI/CD
      自动化测试
      回归检测
      质量门禁
    可观测性
      日志聚合
      告警规则
      仪表盘""",

    'ch14-data.md': """mindmap
  root((数据工程))
    数据采集
      API集成
      爬虫抓取
      流式摄入
    数据处理
      ETL流水线
      批处理
      流处理
    数据存储
      数据湖
      数据仓库
      Iceberg
    数据质量
      校验规则
      去重清洗
      血缘追踪
    数据治理
      元数据管理
      访问控制
      合规审计
    特征工程
      特征提取
      特征存储
      在线/离线""",

    'ch15-training.md': """mindmap
  root((模型训练))
    预训练
      数据准备
      分布式训练
      检查点管理
    监督微调
      SFT数据
      指令跟随
      质量筛选
    对齐
      RLHF
      DPO
      GRPO
    高效训练
      LoRA/QLoRA
      分布式策略
      混合精度
    蒸馏
      知识蒸馏
      数据蒸馏
      模型压缩
    评估
      困惑度
      下游任务
      人工评测""",

    'ch16-inference.md': """mindmap
  root((推理优化))
    量化
      INT4/INT8
      GPTQ
      AWQ
    KV Cache
      PagedAttention
      KV共享
      缓存淘汰
    调度
      Prefill/Decode分离
      连续批处理
      请求排队
    投机解码
      草稿模型
      多Token预测
      验证接受
    架构优化
      Flash Attention
      稀疏注意力
      MoE路由
    部署
      vLLM
      TensorRT-LLM
      SGLang""",

    'ch17-multimodal.md': """mindmap
  root((多模态AI))
    视觉理解
      图像识别
      文档解析
      视频理解
    图像生成
      扩散模型
      文生图
      图编辑
    语音
      TTS合成
      ASR识别
      实时翻译
    编码器架构
      视觉编码器
      音频编码器
      跨模态对齐
    应用
      VLM视觉语言
      多模态Agent
      内容创作
    评估
      图文对齐
      生成质量
      多模态基准""",

    'ch18-robotics.md': """mindmap
  root((具身智能与机器人))
    感知
      视觉感知
      触觉传感
      环境建图
    决策规划
      任务规划
      运动规划
      强化学习
    执行控制
      运动控制
      灵巧操作
      人机交互
    仿真
      仿真环境
      Sim-to-Real
      数字孪生
    自主驾驶
      感知融合
      路径规划
      安全决策
    前沿
      通用机器人
      具身大模型
      开源硬件""",

    'ch19-research-frontier.md': """mindmap
  root((研究前沿))
    AGI路径
      扩展假说
      架构创新
      自我改进
    新范式
      世界模型
      因果推理
      神经符号
    科学发现
      AI4Science
      药物发现
      材料设计
    理论基础
      缩放定律
      涌现现象
      可解释性
    长期挑战
      对齐问题
      意识与理解
      价值学习
    跨学科
      认知科学
      神经科学
      哲学""",

    'ch20-ai-philosophy.md': """mindmap
  root((AI哲学))
    本体论
      AI是什么
      意识问题
      智能本质
    认识论
      知识边界
      理解vs模拟
      黑箱问题
    伦理学
      AI对齐
      价值冲突
      责任归属
    社会影响
      就业变革
      权力结构
      数字鸿沟
    治理
      全球协调
      监管框架
      开源vs闭源
    未来学
      技术奇点
      人机共生
      文明演化""",
}

def add_mindmap(filepath, mindmap_code):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already has mindmap
    if 'mindmap' in content and '```mermaid' in content:
        # Check if any mermaid block uses mindmap
        if re.search(r'```mermaid\s*\nmitmap', content):
            return False
    
    # Find the first ## heading (usually "本章导航" or "导读")
    lines = content.split('\n')
    insert_idx = None
    for i, line in enumerate(lines):
        if line.startswith('## '):
            insert_idx = i
            break
    
    if insert_idx is None:
        # Fallback: insert after first paragraph
        for i, line in enumerate(lines):
            if line.strip() and not line.startswith('#') and i > 3:
                insert_idx = i
                break
    
    if insert_idx is None:
        return False
    
    # Build the mindmap block
    block = [
        '## 概念全景',
        '',
        '```mermaid',
        mindmap_code.strip(),
        '```',
        '',
    ]
    
    # Insert before the first ## heading
    for j, bline in enumerate(block):
        lines.insert(insert_idx + j, bline)
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    return True

count = 0
for filename, mindmap_code in MINDMAPS.items():
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue
    if add_mindmap(filepath, mindmap_code):
        print(f"OK: {filename}")
        count += 1
    else:
        print(f"SKIP: {filename} (already has mindmap)")

# Also add to index.md
index_path = os.path.join(DOCS_DIR, 'index.md')
with open(index_path, 'r') as f:
    content = f.read()

if 'mindmap' not in content:
    index_mindmap = """mindmap
  root((AI工程全书))
    基础篇
      Ch01 LLM基础
      Ch02 提示词工程
    工具篇
      Ch03 AI工具
      Ch09 AI编程
    Agent篇
      Ch04 Agent核心
      Ch05 Harness护栏
      Ch06 记忆系统
      Ch07 技能与工具
      Ch08 多Agent
    数据篇
      Ch10 RAG
      Ch14 数据工程
    基础设施篇
      Ch11 云基础设施
      Ch12 安全
      Ch13 MLOps
    进阶篇
      Ch15 训练
      Ch16 推理优化
      Ch17 多模态
      Ch18 机器人
    前沿篇
      Ch19 研究前沿
      Ch20 AI哲学"""
    
    # Insert after the first heading
    lines = content.split('\n')
    insert_idx = 1
    for i, line in enumerate(lines):
        if line.startswith('## '):
            insert_idx = i
            break
    
    block = [
        '',
        '## 全书概念全景',
        '',
        '```mermaid',
        index_mindmap.strip(),
        '```',
        '',
    ]
    for j, bline in enumerate(block):
        lines.insert(insert_idx + j, bline)
    
    with open(index_path, 'w') as f:
        f.write('\n'.join(lines))
    print(f"OK: index.md")
    count += 1

print(f"\nTotal: {count} pages updated with mindmaps")
