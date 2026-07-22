# MCP-based Interactive PDF Text Extraction from Amazon S3

## Ch07.019 MCP-based Interactive PDF Text Extraction from Amazon S3

> 📊 Level ⭐⭐ | 11.5KB | `entities/mcp-pdf-text-extraction-s3-interactive-aws.md`

# MCP-based Interactive PDF Text Extraction from Amazon S3

AWS 推出的基于 Model Context Protocol (MCP) 的交互式 PDF 文本提取方案，让 AI Agent 能够实时从 Amazon S3 存储的 PDF 文档中提取文本内容，无需等待批量处理管道。

## 摘要

该方案通过 MCP 服务器提供程序化文档访问能力，使 AI 助手能够直接查询存储在 S3 中的 PDF 文件。相比 Amazon Textract，在概念验证场景下成本降低约 90%，同时保持实时交互能力。适用于合规审查、法律咨询、财务分析等需要即时文档访问的场景。

## 核心能力

### 实时文本提取

该方案通过 MCP 服务器提供程序化文档访问能力，使 AI 助手能够直接查询存储在 S3 中的 PDF 文件：

- **即时响应**：典型 50 页文本 PDF 在几秒内完成提取
- **自然语言查询**：用户可用自然语言提问，获取文档中的相关段落
- **线性扩展**：处理时间与文档大小成线性关系，10 页文档比 50 页快约 5 倍
- **内存友好**：100 页以下文本 PDF 内存占用在典型开发机限制内

### 成本优化

| 方案 | 月处理量 | 成本构成 | 总成本 |
|------|----------|----------|--------|
| **Amazon Textract** | 10,000 页 | Textract $15 + S3 $2 + Lambda $1 + LLM $5-10 | $23-28 |
| **MCP Server** | 10,000 页 | S3 $2 + 数据传输 $0.50 | $2.50 |

成本对比说明：两方案功能集不同，不应作为直接价格竞争。涉及扫描文档、表单、表格、复杂布局或生产 SLA 时，Amazon Textract 是更合适的选择。

### 最小化基础设施

无需托管处理服务，直接连接 AI 助手与源文档。架构仅包含四个组件：

1. **命令行界面**：用户与系统交互的入口
2. **MCP 通信层**：标准化的外部数据源访问协议
3. **自定义 MCP 服务器**：专门处理 PDF 文档的服务器
4. **Amazon S3**：文档存储，通过 AWS IAM 进行安全控制

## 技术实现

### 工作流程

```
用户 → CLI → MCP Client → MCP Server → S3 (下载 PDF)
                                    ↓
                              PDF Parser (PyPDF2)
                                    ↓
                         返回提取的文本 → 显示给用户
```

### MCP 服务器核心代码

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
import boto3
from PyPDF2 import PdfReader
import tempfile
import os

server = Server("s3-pdf-extractor")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="extract_s3_pdf_text",
            description="Extract text content from a PDF stored in Amazon S3",
            inputSchema={
                "type": "object",
                "properties": {
                    "bucket": {"type": "string", "description": "S3 bucket name"},
                    "key": {"type": "string", "description": "S3 object key"}
                },
                "required": ["bucket", "key"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "extract_s3_pdf_text":
        bucket = arguments["bucket"]
        key = arguments["key"]

        s3_client = boto3.client('s3')
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            s3_client.download_file(bucket, key, tmp_file.name)
            tmp_path = tmp_file.name

        reader = PdfReader(tmp_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"

        os.unlink(tmp_path)
        return [TextContent(type="text", text=text)]
```

### 部署步骤

**环境准备**：
- Python 3.10+
- AWS CLI 配置有效凭证
- Kiro CLI 安装
- 依赖安装：`pip install mcp boto3 PyPDF2`

**Kiro CLI 配置** (`~/.kiro/settings/tools/mcp.json`)：
```json
{
    "mcpServers": {
        "s3-pdf-extractor": {
            "command": "python",
            "args": ["/path/to/s3_pdf_extractor.py"]
        }
    }
}
```

**验证部署**：
```bash
extract text from s3://your-bucket-name/sample.pdf
```

## 适用场景对比

### 推荐使用 MCP 方案的场景

- **文本型 PDF**：PDF 中已编码文本，无需 OCR
- **交互式工作流**：实时查询而非批处理
- **开发和 PoC 环境**：成本敏感场景
- **现有 AWS 工作流集成**：利用现有 IAM 和 S3 基础设施

### 推荐使用 Amazon Textract 的场景

- **扫描文档**：需要 OCR 的光栅化图像
- **手写识别**： Textract 原生支持
- **表单和表格提取**：结构化数据提取
- **复杂布局分析**：多栏、复杂排版
- **生产级 SLA**：企业级服务等级协议

### 混合工作流

对于同时包含扫描页和文本页的 PDF 仓库，可设计自动路由：
- 先尝试 MCP 方案提取文本
- 遇到失败或图像页时自动转交 Textract

## 安全考虑

该方案从设计之初就集成安全性：

1. **IAM 集成**：使用现有 AWS 凭证，无需单独 API 密钥
2. **最小权限**：仅授予特定 S3 桶的读权限
3. **临时存储**：处理完成后自动删除下载文件
4. **无数据持久化**：按需提取，不存储结果
5. **审计追踪**：AWS CloudTrail 记录所有 S3 访问请求

## 局限性与边界

**明确限制**：

- **仅文本型 PDF**：扫描图像或照片无法读取，需使用 Amazon Textract
- **无 OCR 能力**：只能读取 PDF 格式中嵌入的文本，无法解释图像像素
- **有限布局理解**：直接文本提取，不重建表格、栏或复杂页面布局
- **无表单处理**：不提取可填写表单字段或结构化数据

## 真实用例

### 法律服务公司

中型律师事务所用于合同审查。律师过去需在客户电话中花费 15-20 分钟搜索 PDF 合同中的特定赔偿条款，现在通过 Kiro CLI 输入问题，几秒内获得相关段落。

### 金融服务合规

地区银行用于监管检查。合规官员需要在审计期间快速定位特定政策语言，过去需手动在数十个 PDF 文件中添加书签，现在通过 MCP 服务器连接 S3 文档库，实时提取 examiner 询问的确切段落。

### 企业战略团队

企业领导团队在季度战略会议中使用。当董事会成员询问上季度财报中的特定指标时，团队可现场查询 PDF，无需翻阅纸质副本。

## 扩展与增强选项

该方案是起点，可根据需求扩展：

- **添加缓存**：使用 Amazon DynamoDB 缓存频繁访问的文档
- **批处理**：使用 Amazon SQS 实现批量操作
- **向量搜索**：集成 Amazon OpenSearch Service 实现语义文档发现
- **混合工作流**：自动将复杂文档路由到 Amazon Textract
- **监控**：使用 Amazon CloudWatch 跟踪使用模式和错误率

## 实践启示

### 选型决策树

```
PDF 类型？
├── 扫描/图像/手写 → Amazon Textract
└── 文本编码 PDF → 用途？
    ├── 批处理/生产 SLA → Amazon Textract
    └── 交互式/实时查询 → MCP 方案
```

### 关键要点

1. **成本与功能权衡**：MCP 方案成本极低但功能有限，Textract 功能全面但成本更高
2. **协议标准化价值**：MCP 作为开放标准，使文档访问与具体 LLM 或 Agent 框架解耦
3. **最小可行基础设施**：对于文本提取这类相对简单的任务，无需重量级托管服务
4. **渐进式增强**：从 MCP 方案开始，随需求增长逐步添加缓存、批处理、向量搜索等能力

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-interactive-pdf-text-extraction-from-amazon-s3.md)

---

