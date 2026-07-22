---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/using-kiro-mcp-automation-rds-mysql-8-0-rds-mysql-8-4/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-22
sha256: 1cf3eafab18d
feed_name: AWS China Blog
source_published: 2026-05-22T08:56:37Z
---

# 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4

摘要：本文介绍 RDS MySQL 升级助手，这是一款开源工具，可批量执行 Amazon RDS MySQL 8.0 到 RDS MySQL 8.4 主版本升级。它解决了大规模主版本升级中最棘手的两大难题：系统地修复数百个实例的预检查问题，以及验证升级后的应用程序行为。该工具提供了一个包含 19 项 SQL 预检查的引擎，并附带修复方案、自动化参数组和选项组迁移、蓝绿部署和原地升级编排（包含切换前安全检查）以及应用程序验证框架——所有作业都可以通过 shell 脚本或 Kiro IDE/CLI 的自然语言进行访问。

**目录**

01 [一、引言](#section1)

03 [三、解决方案概述](#section3)

04 [四、运作方式](#section4)

05 [五、前提条件](#section5)

06 [六、开始使用](#section6)

07 [七、最佳实践](#section7)

09 [九、清理](#section9)

10 [十、结论](#section10)

* * *

## **一、引言**

MySQL 8.0 即将结束标准支持。对于运行数百个 [Amazon RDS](https://aws.amazon.com/cn/rds/) for MySQL 8.0 实例的 AWS 客户而言，升级至 RDS MySQL 8.4 是一项关键但耗时的任务。每个实例都需要兼容性评估、参数组迁移、Blue/Green 部署创建、switchover 执行以及升级后验证——手动操作时，每个实例可能需要数小时。

在本文中，我们介绍 [RDS MySQL Upgrade Assistant](https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant)，这是一个开源工具，使用 Kiro 和 Model Context Protocol (MCP) 服务器自动化完整的升级生命周期。该工具结合了纯 SQL precheck 引擎、基于 shell 的自动化脚本，以及通过 Kiro 提供的自然语言接口，将原本需要多天的手动工作转变为精简、可重复的工作流程。

## **二、挑战：大规模升级 MySQL**

当客户拥有 100 个以上需要从 8.0 升级至 8.4 的 RDS MySQL 实例时，他们面临以下挑战：

*   兼容性评估：每个实例可能有不同的架构、存储过程、验证配置和参数配置，这些都可能与 MySQL 8.4 的变更产生冲突。
*   参数组迁移：自定义参数组需要为 MySQL 8.4 引擎系列重新创建，并处理已移除、重新命名和默认值变更的参数。
*   选项组迁移：自定义选项组（例如包含 MARIADB\_AUDIT\_PLUGIN 的组）必须为 MySQL 8.4 重新创建。不支持 8.4 的选项（如 MEMCACHED）需要排除。
*   升级执行：Blue/Green 部署是生产环境实例的建议方法，但为数百个实例创建和管理这些部署在操作上非常密集。
*   验证：每次升级后，必须验证数据库引擎版本、连接能力、复制健康状态和参数组状态。
*   回退计划：如果升级后出现问题，回退需要从快照或 PITR 还原——两者都会创建新的实例。没有就地降级或反向 switchover。

现有工具解决了部分问题。[MySQL Shell](https://dev.mysql.com/doc/mysql-shell/9.7/en/mysql-shell-utilities-upgrade.html) 的 `util.checkForServerUpgrade()` 可以执行兼容性检查，但需要安装 [MySQL Shell](https://dev.mysql.com/downloads/shell/) 并建立连接。RDS 内建的 `PrePatchCompatibility` 检查只在您实际启动升级时才会执行——如果发生失败，作业可能超出维护时段。这两个工具都无法解决批次升级所需的端到端编排。

## **三、解决方案概述**

RDS MySQL Upgrade Assistant 采用 shell 优先的方法：bash 脚本使用 AWS CLI 和标准 MySQL 客户端处理所有操作。一个轻量的 MCP 服务器包装这些脚本，让 Kiro 可以通过自然语言进行编排。每个脚本都可以在不使用 Kiro 的情况下独立执行，使偏好直接使用 CLI 的团队也能使用此工具。

解决方案由四个组件组成：

1.  Shell 脚本 : 十六个 bash 脚本加上两个安全库涵盖实例探索、兼容性 precheck、参数迁移、Blue/Green 部署生命周期、就地升级、升级后验证和批次编排。所有脚本使用 AWS CLI 进行 RDS 操作，使用 MySQL 客户端进行数据库连接。
2.  SQL precheck 引擎 : 一个纯 SQL 脚本，对 MySQL 8.0 实例执行 19 项兼容性检查，检测可能导致升级失败的问题。这些检查涵盖 MySQL Shell 的升级检查器逻辑以及额外的 RDS 特定检查，全部可从任何标准 MySQL 客户端执行。
3.  MCP 服务器 : 使用 FastMCP 构建的轻量 Python 服务器，公开十六个工具，每个工具包装一个 shell 脚本。这使 Kiro 能够通过自然语言命令调用这些脚本。
4.  Kiro steering 文件 : 包含 MySQL 8.0→8.4 升级最佳实践、已知问题和修复模式的知识文档，Kiro 在交互式会话中参考此文档。

以下图表说明解决方案架构。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/20/using-kiro-mcp-automation-rds-mysql-8-0-rds-mysql-8-4-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/20/using-kiro-mcp-automation-rds-mysql-8-0-rds-mysql-8-4-1.png)

\[图1\]

## **四、运作方式**

### 4.1 升级工作流程

对于每个实例，工具遵循十步骤工作流程：

1.  探索 — 使用 AWS CLI 搭配可选的标签筛选找到所有 MySQL 8.0 实例
2.  Precheck — 对来源实例执行 19 项基于 SQL 的兼容性检查
3.  迁移参数 — 从现有 8.0 自定义参数创建 MySQL 8.4 参数组
4.  创建 Blue/Green 部署 — 使用目标版本设置暂存环境
5.  监控 — 轮询部署状态直到绿色环境就绪
6.  验证绿色环境 — 对绿色环境执行基础设施和应用程序验证（post\_upgrade\_validate.sh、app\_validate\_run.sh）
7.  Pre-switchover 检查 — 验证 switchover 护栏：部署状态、复制健康、实例可用性（pre\_switchover\_check.sh）
8.  Switchover — 执行 Blue/Green switchover
9.  连接检查 — 验证 switchover 后实例名称和端点连接
10.  清理 — 移除旧的蓝色环境

### 4.2 Precheck 引擎

precheck 引擎可以帮助您在執行升级**之前**识别兼容性问题。它以纯 SQL 执行 19 项检查，只需要标准 MySQL 客户端——不需要安装 MySQL Shell。

重要定位：此 precheck 基于 MySQL Shell 的 `util.checkForServerUpgrade()` 逻辑，适配为标准 MySQL 客户端执行。它作为预筛选工具，用于及早发现常见问题——而非取代您启动升级时自动执行的 RDS 内部 `PrePatchCompatibility` 检查。RDS 内部检查可能涵盖此处未包含的额外引擎特定验证。我们建议：

1.  先执行此 precheck 以主动识别和修复已知问题
2.  在启动升级前修复所有 ERROR 级别的发现
3.  如果 RDS 升级仍因 `PrePatchCompatibility` 错误而失败，请查看 RDS 事件日志以了解此工具未涵盖的详细信息

检查分为两个阶段：

第一阶段（只读，可安全用于生产环境）执行 19 项检查，包括：

检查

严重性

检测内容

sysVarsNewDefaults

Warning

在 8.4 中默认值已变更的系统变量（例如 innodb\_adaptive\_hash\_index → OFF）

foreignKeyReferences

Warning

引用非唯一或部分索引的外键

authMethodUsage

Error/Warning

已弃用的验证插件（mysql\_native\_password、authentication\_fido）

pluginUsage

Error/Warning

已移除的插件（keyring\_file、keyring\_oci）

columnDefinition

Error

具有 AUTO\_INCREMENT 的 FLOAT/DOUBLE 列

partitionsWithPrefixKeys

Error

使用前缀键列的分区

reservedKeywords

Warning

与新保留字冲突的对象名称（FULL、INTERSECT）

三项检查会自动跳过 RDS 管理的项目（removedSysVars、deprecatedDefaultAuth、deprecatedRouterAuthMethod），以避免在受管环境中产生误报。

第二阶段（选择性加入）对所有用户表执行 CHECK TABLE FOR UPGRADE。这会获取元数据锁定，建议在维护时段或从快照还原的实例上执行。

### 4.3 参数组迁移

从 MySQL 8.0 升级至 8.4 时，自定义参数组必须为新的引擎系列重新创建。此工具集成了 [AWS RDS Support Tools](https://github.com/awslabs/rds-support-tools) 存储库中的 [migrate\_param\_group.sh](https://github.com/awslabs/rds-support-tools/blob/main/rds-general/shell/migrate_param_group.sh) 来自动化此过程。它将用户修改的参数从来源 8.0 自定义参数组复制到新的 8.4 自定义参数组，自动处理版本差异。

当多个实例共用相同的自定义参数组时，批次编排器只创建一次目标自定义参数组并重复使用——避免冗余的 API 调用并确保一致性。

### 4.4 选项组迁移

除了参数组外，使用自定义选项组的实例也需要迁移。RDS 不会自动将自定义选项组升级至新的引擎版本。工具的 check\_option\_group.sh 处理此问题：

*   默认选项组 — 无需操作。RDS 在升级期间自动分配 `default:mysql-8.4`。
*   包含 MARIADB\_AUDIT\_PLUGIN 的自定义选项组 — 创建新的 MySQL 8.4 选项组并添加相同的审计插件。对于 Blue/Green 部署，工具使用两步骤方法：先以相同版本创建 B/G 部署并关联目标选项组，然后单独将绿色实例升级至 8.4（RDS 不支持在单次 B/G 创建中同时指定自定义选项组和主要版本升级）。对于就地升级，目标选项组直接通过 `--option-group-name` 传递。
*   包含 MEMCACHED 的自定义选项组 — MEMCACHED 选项在 MySQL 8.4 中不受支持，会自动从目标选项组中排除。这不会阻挡升级。
*   空的自定义选项组 — 无需操作。工具跳过空的自定义选项组，让 RDS 自动分配 `default:mysql-8.4`，避免不必要的自定义选项组关联影响 Blue/Green 部署资格。

### 4.5 批次编排

批次编排器管理数百个实例的升级，具备：

*   可配置的并行度 — 并行处理 N 个实例（建议：Blue/Green 为 5–10 个，非生产就地升级为 3–5 个）
*   策略选择 — 每个实例选择 Blue/Green（建议用于生产环境）或就地升级（用于非生产环境）
*   自动 precheck 门控 — 具有 ERROR 级别发现的实例会自动跳过
*   状态文件持久化 — 恢复中断的批次而不重新处理已完成的实例
*   故障隔离 — 失败的实例不会阻挡其余升级

## **五、前提条件**

要使用此解决方案，您需要：

*   已安装并配置适当 IAM 权限的 [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
*   MySQL 客户端（标准 MySQL 命令行客户端）
*   [jq](https://jqlang.org/download/)（JSON 处理器）
*   Python 3.10+ 搭配 [uv](https://docs.astral.sh/uv/getting-started/installation/)（仅 MCP 服务器需要——使用独立脚本时不需要）
*   包含每个实例数据库凭证的 [AWS Secrets Manager](https://aws.amazon.com/cn/secrets-manager/) 密钥
*   [Kiro IDE](https://kiro.dev/downloads/) 或 [Kiro CLI](https://kiro.dev/docs/cli/installation/)（用于自然语言接口——使用独立脚本时不需要）

## **六、开始使用**

克隆项目存储库：

```
git clone https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant.git
cd sample-rds-mysql-upgrade-assistant
```

### 6.1 安装 Kiro

您可以通过 Kiro IDE（图形界面）或 Kiro CLI（终端）与升级助手交互动。安装其中一个或两者：

Kiro IDE — 从 [kiro.dev/downloads](https://kiro.dev/downloads/) 下载，支持 macOS、Windows 或 Linux。启动并使用您的 AWS Builder ID 或 IAM Identity Center 登录。

Kiro CLI — 从终端安装：

```
# macOS / Linux
curl -fsSL https://cli.kiro.dev/install | bash
# Windows (PowerShell)
irm 'https://cli.kiro.dev/install.ps1' | iex
```

然后进行验证：

完整安装详情请参阅 [Kiro CLI Installation](https://kiro.dev/docs/cli/installation/)。

### 6.2 安装 uv

MCP 服务器通过 uv 执行，这是一个快速的 Python 包管理器：

```
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 或通过 Homebrew
brew install uv
```

### 6.3 选项 1：使用 Kiro 进行交互式升级

将 MCP 服务器添加至您的 Kiro 配置。对于 Kiro IDE，在工作区根目录创建 .kiro/settings/mcp.json。对于 Kiro CLI，将其放置在 ~/.kiro/settings/mcp.json 以进行全局访问：

```
{
  "mcpServers": {
    "rds-mysql-upgrade": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/rds-mysql-upgrade-assistant",
               "python", "-m", "rds_upgrade_mcp.server"],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_DEFAULT_REGION": "us-west-2"
      }
    }
  }
}
```

将 /path/to/rds-mysql-upgrade-assistant 替换为克隆存储库的实际绝对路径。将 AWS\_DEFAULT\_REGION 设置为您的目标区域。

Kiro IDE 自动检测配置变更并启动 MCP 服务器。您也可以通过命令面板 → “MCP: Reconnect Server” 重新连接。对于 Kiro CLI，启动聊天会话：

使用自然语言开始对话：

“Discover all MySQL 8.0 instances in us-east-1 tagged with env=production”

Kiro 调用 discover\_instances MCP 工具，该工具执行 discover\_instances.sh 并返回实例清单：

Found 47 MySQL 8.0 instances in us-east-1:

*   prod-db-01: 8.0.35, db.r6g.xlarge, Multi-AZ, prod-mysql80 param group
*   prod-db-02: 8.0.35, db.r6g.xlarge, Multi-AZ, prod-mysql80 param group

…

对特定实例执行 precheck：

“Run precheck on prod-db-01 using secret prod/db01/credentials”

precheck 返回结构化报告：

Precheck Results for prod-db-01 (MySQL 8.0.35 → 8.4.9):

Errors: 0

Warnings: 3 (sysVarsNewDefaults: innodb\_adaptive\_hash\_index,

innodb\_io\_capacity, innodb\_change\_buffering)

Notices: 0

Skipped: 3 (RDS-managed)

No errors found. Instance is eligible for upgrade.

继续进行升级：

“Create a Blue/Green deployment for prod-db-01 upgrading to 8.4.9

with parameter group prod-mysql84″

### 6.4 选项 2：使用 shell 脚本进行批次升级

对于大规模升级，直接使用批次编排器：

1\. 从您当前的实例自动生成批次配置：

```
./scripts/batch/generate_config.sh \
  --secret-prefix "prod/rds/" \
  --tag "env=production" \
  --output batch_config.yaml
```

生成器探索所有 MySQL 8.0 实例并自动分配正确的升级策略：

*   Multi-AZ DB Clusters → in\_place（不支持 Blue/Green）
*   具有跨区域副本的实例 → in\_place（不支持 Blue/Green）
*   标准实例 → blue\_green（建议）
*   只读副本 → 不单独列出（自动包含在主要实例的 Blue/Green 部署中）

查看并调整生成的配置。典型输出如下：

```
target_version: "8.4.9"
target_param_family: "mysql8.4"
concurrency: 3
precheck_phase2: false
cleanup_blue_after_switchover: true
instances:
  - instance_id: "prod-db-01"
    secret_id: "prod/db01/credentials"
    source_param_group: "prod-mysql80-custom"
    strategy: "blue_green"
  - instance_id: "prod-db-02"
    secret_id: "prod/db02/credentials"
    source_param_group: "prod-mysql80-custom"  # Same group — migrated once
    strategy: "blue_green"
  - instance_id: "dev-db-01"
    secret_id: "dev/db01/credentials"
    source_param_group: "dev-mysql80"
    strategy: "in_place"
```

2\. 使用试运行进行验证：

```
./scripts/batch/batch_upgrade.sh --config batch_config.yaml --dry-run
```

3\. 执行批次升级：

```
./scripts/batch/batch_upgrade.sh --config batch_config.yaml --concurrency 5
```

编排器在遵守并行度限制的情况下处理实例，自动跳过任何 precheck 失败的实例，并生成摘要报告：

\============================================================

Batch Upgrade Summary

\============================================================

Total: 50

Completed: 47

Failed: 2

Skipped: 1

Duration: 14400s

\============================================================

Failed instances:

prod-db-12: Precheck found 3 ERROR findings

prod-db-37: Blue/Green creation failed: instance not eligible

4\. 如果中断，可恢复执行：

```
./scripts/batch/batch_upgrade.sh --config batch_config.yaml --resume
```

## **七、最佳实践**

使用此解决方案时，请牢记以下最佳实践：

*   **从非生产环境开始：** 先升级开发和暂存实例，在触及生产环境之前识别问题。
*   **务必先执行 precheck：** 使用 `--dry-run` 模式在执行升级前验证所有实例，並參考修复手册手動修复所有 ERROR 级别的发现。
*   **生产环境使用 Blue/Green：** Blue/Green 部署在 switchover 期间提供最小停机时间（约 30 秒）。请注意 switchover 是单向操作——没有反向 switchover。switchover 后，旧的蓝色实例会以重新命名的标识符保留（例如 -old1）。要回退，请删除 B/G 部署（保留旧实例），重新命名当前的绿色实例，然后将旧的蓝色实例重新命名回原始名称。或者，从快照还原或使用 PITR。将就地升级保留给可接受停机的非生产实例。注意：具有跨区域只读副本的实例不支持 Blue/Green 部署——请对这些实例使用就地升级。
*   **只读副本会先升级：** 对具有只读副本的实例执行就地升级时，工具会自动在主要实例之前升级所有副本，以维持复制兼容性。
*   **对绿色环境执行 precheck：** Blue/Green 部署创建后，对绿色环境再次执行 precheck，以验证升级是否顺利完成。
*   **暂时保留蓝色环境：** switchover 后，保留旧的蓝色实例 24–48 小时。要回退至 MySQL 8.0：删除 B/G 部署（保留旧实例），重新命名绿色实例，然后将蓝色实例重新命名回原始名称。重要：rename 回退会还原至 switchover 时的蓝色实例状态——switchover 后写入的任何数据都会丢失。PITR 无法降级引擎版本。目前没有零数据丢失且同时回退版本的全自动化路径。 回退前请仔细评估取舍。
*   **监控参数组变更：** 仔细查看 migrate\_param\_group.sh 报告。某些参数在 MySQL 8.4 中的默认值已变更（例如 innodb\_adaptive\_hash\_index 默认为 OFF），可能影响工作负载性能。
*   **关于 `mysql_native_password` 的说明：** RDS MySQL 8.4 使用 caching\_sha2\_password 作为默认验证插件。mysql\_native\_password 插件在 8.4 中仍然可用，但已弃用且将在未来版本中移除。升级后，使用 mysql\_native\_password 的现有账户将继续运作。要变更默认验证插件，请创建自定义参数组并修改 authentication\_policy 参数。长期而言，请计划将账户迁移至 caching\_sha2\_password。
*   **谨慎管理并行度：** 对于 Blue/Green 部署，大规模升级时 5–10 个并行是合理的——绿色环境独立构建，生产环境（蓝色）在 switchover 前不受影响。主要限制是账户的 RDS 服务配额（如最大并发 Blue/Green 部署数量）。对于就地升级，并行度取决于停机容忍度：同时执行多个就地升级意味着多个数据库同时不可用。对于可接受并发停机的非生产环境，并行度 3–5 可显著缩短总升级时间。对于生产环境的就地升级（例如不支持 Blue/Green 的 Multi-AZ DB Cluster），建议串行执行（并行度 1）或安排在维护窗口期间。

## **八、解决困难部分：修复和应用程序验证**

上述自动化处理了操作工作流程，但主要版本升级中真正困难的部分是 (1) 修复 precheck 发现和 (2) 升级后验证应用程序。本节解决这两个问题。

### 8.1 大规模处理 precheck 发现

在整个集群执行 precheck 后，您可能会看到常见模式。随附的[修复手册](https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant/blob/main/docs/remediation-playbook.md)为每种发现类型提供具体的修复步骤。以下是建议的方法：

1\. 跨集群分类发现。 大多数实例共享相同的发现（例如 sysVarsNewDefaults 警告几乎出现在每个实例上）。按发现类型而非按实例分组。

2\. 先修复 ERROR 发现——它们会阻挡升级。 最常见的阻挡因素及其修复方式：

FLOAT/DOUBLE 搭配 AUTO\_INCREMENT（检查 #9） — 变更列类型：

```
-- Find affected columns
SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE COLUMN_TYPE IN ('float', 'double') AND EXTRA = 'auto_increment'
  AND TABLE_SCHEMA NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys');
-- Fix
ALTER TABLE `schema`.`table` MODIFY COLUMN `col` BIGINT AUTO_INCREMENT;
```

daemon\_memcached 插件（检查 #14） — 从选项组中移除（MySQL 8.4 不支持 MEMCACHED）。请参阅 [MySQL Options for RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.MySQL.Options.html)。

sys 架构中的用户表（检查 #15） — 移至用户架构：

```
RENAME TABLE sys.my_table TO my_schema.my_table;
```

3\. 按影响评估 WARNING 发现。 并非所有警告都需要采取行动：

发现

是否需要行动？

建议

sysVarsNewDefaults

通常不需要

查看[默认值变更表](https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant/blob/main/docs/remediation-playbook.md)。大多数新默认值是改进。

mysql\_native\_password

否（在 RDS 上）

在 RDS MySQL 8.4 中仍然启用。计划长期迁移至 caching\_sha2\_password。

binlog\_format STATEMENT/MIXED

是

必须变更为 ROW。在参数组中配置。

foreignKeyReferences

查看

如需要，在引用列上添加唯一索引。

nonInclusiveLanguage

建议

更新存储过程以使用包容性用语（REPLICA 取代 SLAVE）。

4\. 批量应用修复。 对于影响多个共享相同架构的实例的架构变更，修复一次并在测试实例上验证后再推广。

有关所有 19 项检查的完整修复步骤，请参阅[完整修复手册](https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant/blob/main/docs/remediation-playbook.md)。

### 8.2 升级后的应用程序验证

工具的内建验证（post\_upgrade\_validate.sh）检查基础设施健康状态——引擎版本、实例状态、复制、参数组和 MySQL 连接能力。然而，应用程序级别的验证才是真正的瓶颈，且因工作负载而异。

为解决此问题，工具包含应用程序验证执行器（scripts/validate/app\_validate\_run.sh）和模板（scripts/validate/app\_validate\_template.sql），您可以使用关键查询进行自定义：

1\. 复制并自定义模板：

```
cp scripts/validate/app_validate_template.sql scripts/validate/app_validate.sql
# Edit app_validate.sql with your application's critical queries
```

2\. 在五个类别中定义验证查询：

*   *   关键读取查询 — 您最重要的 SELECT 语句
    *   存储过程测试 — CALL 每个关键过程并验证结果
    *   验证检查 — 验证应用程序用户可以使用预期的验证插件连接
    *   字符集验证 — 确认字符集/排序规则行为
    *   性能基准 — 计时关键查询并与升级前基准比较

3\. 对任何实例自动执行：

```
# 使用交互式密码提示
bash scripts/validate/app_validate_run.sh \
  -h <endpoint> -u <user> --json

# 或使用 Secrets Manager
bash scripts/validate/app_validate_run.sh \
  -h <endpoint> -u <user> --secret-id <secret_id> --json
```

执行器自动执行所有 app\_validate\*.sql 文件并报告结构化的 PASS/FAIL/WARNING 结果。您可以为不同的验证领域创建多个文件（例如 app\_validate\_orders.sql、app\_validate\_auth.sql）。

4\. 在 switchover 之前对绿色环境执行，以在生产流量受影响之前发现问题。

5\. 批次升级后在整个集群执行：

```
for endpoint in $(bash scripts/inventory/discover_instances.sh --version-prefix 8.4 --json | jq -r '.[].endpoint'); do
  bash scripts/validate/app_validate_run.sh -h "$endpoint" -u admin --secret-id <secret_id> --json
done
```

## **九、清理**

完成所有升级后：

1\. 删除尚未清理的旧蓝色环境：

```
./scripts/upgrade/cleanup_blue_green.sh --deployment-id <id> --delete-source
```

2\. 移除用于 precheck 测试的任何快照还原实例。

3\. 验证所有实例都在运行 MySQL 8.4 且参数组已同步：

```
./scripts/inventory/discover_instances.sh --version-prefix 8.4 --json
```

## **十、结论**

在本文中，我们展示了如何使用 [RDS MySQL Upgrade Assistant](https://github.com/aws-samples/sample-rds-mysql-upgrade-assistant) 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4。该工具结合了 19 项检查的 SQL precheck 引擎、经过验证的参数迁移工具，以及支持 Blue/Green 部署的批次编排——全部可通过直接 shell 脚本、Kiro IDE 的图形界面或 Kiro CLI 的终端工作流程访问。

通过自动化升级作业，团队可以减少与主要 MySQL 版本升级相关的时间和风险，将繁杂的手动工作转变为可重复、可审计的过程。shell 优先的架构确保工具可在任何具有 AWS CLI 和 MySQL 客户端的环境中运作，无需额外基础设施。

此解决方案以开源项目的形式发布在 GitHub 上。我们欢迎社区成员贡献代码、提出功能建议和反馈意见。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon RDS](https://aws.amazon.com/cn/rds/?p=bl_pr_rds_l=1) — 完全托管的关系数据库服务
*   [Amazon Secrets Manager](https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=2) — 密钥管理
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=3) — 身份管理和访问权限
*   [Amazon Batch](https://aws.amazon.com/cn/batch/?p=bl_pr_batch_l=4) — 完全托管式批处理

**相关文章：**

*   [从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家](https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/?p=bl_ar_l=1)
*   [Aurora PostgreSQL 大版本升级指南](https://aws.amazon.com/cn/blogs/china/aurora-postgresql-version-guide/?p=bl_ar_l=2)
*   [AI 驱动的 Graviton 迁移评估：Kiro Power 实战指南](https://aws.amazon.com/cn/blogs/china/ai-graviton-migration-kiro-power-guide/?p=bl_ar_l=3)
*   [AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](https://aws.amazon.com/cn/blogs/china/aws-devops-agent-mcp-server-closing-the-last-mile/?p=bl_ar_l=4)
*   [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

聚焦 AI Agent 的构建与部署实践，现场体验企业级 AI 应用的开发流程。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-button4.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
