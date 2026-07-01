# Restrict access to sensitive documents in your Amazon Quick knowledge bases for Amazon S3 | Amazon Web Services

## Ch11.206 Restrict access to sensitive documents in your Amazon Quick knowledge bases for Amazon S3 | Amazon Web Services

> 📊 Level ⭐⭐ | 5.3KB | `entities/restrict-access-to-sensitive-documents-in-your-amazon-quick-knowledge-bases-for--2.md`

## 深度分析
Amazon QuickSight 的 S3 知识库文档级 ACL 功能，是企业级 RAG（检索增强生成）系统在**权限收敛层**的关键工程实践。该功能解决了两个核心问题：知识库级别的粗粒度权限控制无法满足敏感文档的隔离需求，以及传统 S3 bucket 权限与 AI 查询层的联动缺失。

### 核心机制：ACL 评估在查询时而非索引时
文档级 ACL 的执行时机是一个容易被低估的设计决策。Quick 在**查询时**（query time）评估用户身份与 ACL 配置的匹配关系，而非索引时。这意味着：
1. **索引层无需预先过滤**：文档可以被完整索引，但查询结果根据用户权限动态过滤
2. **支持"否认优先"（deny-by-default）**：未在 ACL 文件中明确列出的文档或前缀，默认拒绝访问
3. **ALLOW vs DENY 的短路评估**：同一用户对同一文档同时存在 ALLOW 和 DENY 时，DENY 优先
这种设计相比"索引时过滤"的优势在于：索引构建与权限决策分离，ACL 配置变更不需要重新索引整个 prefix，只触发增量同步。

### 两种 ACL 配置方法的工程权衡
**Global ACL 文件**（集中式 JSON）适合权限结构稳定、以 folder/prefix 为粒度的场景。优势是单一文件管理，劣势是权限变更时需要重新索引整个 affected prefix。
**Document-level metadata 文件**（`.metadata.json` sidecar）适合权限频繁变动、以文档为粒度的场景。优势是变更只影响单个文档的重新索引，劣势是每个文档需要一个 sidecar 文件，管理的文件数量随文档线性增长。
选择逻辑可归纳为：**权限变更频率 × 文档数量**决定了配置方法的优劣。高频变更 + 大量文档 = metadata 文件；低频变更 + folder 级别隔离 = Global ACL。

### IAM Policy Assignments 的防护边界
值得注意的是，文档级 ACL 控制的是**知识库内的文档访问权限**，但无法控制**知识库本身的创建权限**。这是两个正交的权限维度：

- IAM Policy Assignments 控制：哪些用户可以用哪些 S3 bucket 创建知识库
- Document-level ACL 控制：已创建的知识库内，用户可以看到哪些文档
两者组合才能形成完整的防护：IAM 层面防止在敏感 bucket 上创建不带 ACL 的知识库，ACL 层面控制知识库内部的文档级访问。 See also [Harness Production Agent Engineering Deficit](ch03/044-agent.md)

### Flows 与 ACL 的集成：权限感知自动化
Quick Flows 支持在自动化流程中嵌入 ACL 评估，实现**运行时权限检查**。这对于构建企业级"AI 助手 + 文档访问"自动化流水线意义重大——例如 executive summary 生成流程可以在步骤层面检查用户是否有权访问相关文档，无权访问时自动降级到 web 搜索而非返回错误。

### 关键工程约束
1. **不可逆性**：启用文档级 ACL 是单向操作，无法关闭。测试环境验证必须先于生产部署完成。
2. **身份匹配基于 email**：ACL 中的 Name 字段必须与 Quick 用户的 email 地址精确匹配（email 匹配不区分大小写，但 group 名称必须完全一致）。用户 email 变更需要同步更新 ACL 文件。
3. **ACL 文件本身的写权限需要严格管控**：任何可以修改 ACL 文件的用户都可以给自己授予任意文档的访问权限，S3 `s3:PutObject` 权限应仅授予少数管理员，并启用 S3 versioning 以保留审计日志。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

