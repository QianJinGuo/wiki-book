# 钉钉 Stream + CLI 代理双引擎 AI 助手架构

## Ch04.087 钉钉 Stream + CLI 代理双引擎 AI 助手架构

> 📊 Level ⭐⭐ | 18.0KB | `entities/dingtalk-stream-cli-dual-engine-ai-assistant.md`

# 钉钉 Stream + CLI 代理双引擎 AI 助手架构

闪购搜索团队（阿里云开发者 久梦）把企业级 AI 助手落地到钉钉群的完整方案。核心是用 **钉钉 Stream（WebSocket）+ CLI 代理** 替代传统 Webhook 方案，避开内网公网回调限制；引擎侧 Qoder CLI 与 Claude Code 并行部署，通过 ProcessBuilder 子进程调用；上下文与权限走 LinkedHashMap LRU + 管理员/只读双模式；外部工具通过 MCP 协议 + 静态 Token 跳过 OAuth 浏览器授权。

## 一、问题域：为什么传统 Webhook 方案失败

闪购搜索团队的日常操作分散在 SLS 日志、TPP 实验平台、代码仓库等多个平台。目标是**在钉钉群里直接对话一个 AI 助手**，让 AI 替人查日志、看实验、分析性能、部署代码。

四个核心挑战：

1. **内网部署限制**：服务在内网，无法暴露公网回调地址，传统 Webhook 不可行
2. **实时性要求**：AI 推理耗时 30s-120s，不能"发消息→等 2 分钟→一次性返回"
3. **安全性要求**：非管理员不能执行写操作（部署代码、修改配置）
4. **工具集成需求**：需要访问代码仓库、日志系统、实验平台等外部工具

## 二、架构核心：钉钉 Stream + CLI 代理

| 组件 | 方案 | 选择理由 |
|------|------|---------|
| 消息通道 | 钉钉 Stream（WebSocket） | 内网无需公网回调地址，规避 DNS/防火墙限制 |
| AI 引擎 | CLI 代理模式 | 轻量无框架依赖，复用成熟 CLI 生态 |
| 流式展示 | 钉钉 AI 卡片 | 原生打字机效果 |
| 进程管理 | Java ProcessBuilder | 进程级隔离，一个请求一个进程 |
| 工具扩展 | MCP（Model Context Protocol） | 标准化协议，可插拔配置驱动 |
| 上下文存储 | 内存 LinkedHashMap | 自动 LRU 淘汰，无需外部存储 |

**关键设计哲学**：把"消息通道"、"AI 推理"、"UI 渲染"三层解耦，每层都用最轻的现有技术。钉钉 Stream 处理消息通道，CLI 工具处理 AI 推理（避开自研 agent framework），AI 卡片处理流式 UI。

## 三、双引擎选择：从 Qoder CLI 到 Claude Code

**Qoder CLI 初选理由**：
- CLI 模式轻量无框架依赖
- 支持 MCP 工具调用
- 单二进制 + 配置文件，部署简单

**实际使用发现的问题**：
- 复杂问题排查场景表现不如预期
- 答案"差点意思"，需要反复调 prompt

**引入 Claude Code 后的验证**：
- 复杂排查能力显著提升
- MCP 兼容性更好

**双引擎并行部署**（Docker 同容器共享工作目录与 MCP 配置），通过不同入口调用——一个不行切另一个，是工程上"低风险冗余"的典型实践。

## 四、MCP 工具集成：跳过 OAuth 的无头方案

**MCP 默认 OAuth2 流程**：

```mermaid
用户 → AI 请求 → 触发 MCP server → 返回 OAuth URL
   → 用户浏览器打开 URL → 登录 → 授权 → 拿到 token
   → token 传回 MCP server → 工具调用继续
```

**Docker 容器里的问题**：无浏览器，无法完成交互式授权。

**解决方案**：预先在本地浏览器完成 OAuth 授权，把 tokens 以 JSON 数组格式写入远端配置文件：

```json
[
  {
    "serverName": "git",
    "accessToken": "xxx",
    "refreshToken": "xxx",
    "expiresAt": 1234567890
  }
]
```

**工作原理**：MCP 启动时读取该静态文件，跳过运行时 OAuth 流程。Token 通过 antx/diamond 注入（不硬编码）。

**踩坑**：JSON 必须是数组格式 `[{...}]`，对象格式 `{...}` 会导致 crash。

## 五、生产级稳定性：stdbuf + 进程控制 + 三重防护

### 5.1 stdbuf 行缓冲（必须）

Node.js 进程在非 TTY 环境下默认 **4KB 全缓冲**。如果 Java 侧直接读 `InputStream`，用户看到的是"卡住→突然一大段"的糟糕体验。**必须加 `stdbuf -oL` 强制行缓冲**。

### 5.2 ProcessBuilder 子进程控制

```java
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(process.getInputStream()), 256)) {
    String line;
    while ((line = reader.readLine()) != null) {
        lineConsumer.accept(line);
    }
}
if (!process.waitFor(120, TimeUnit.SECONDS)) {
    process.destroyForcibly();
}
```

**关键设计**：
- **256 字节 BufferedReader**：Java 侧小缓冲确保及时输出
- **异常即杀进程**：consumer 异常立即 `destroyForcibly`，停止消耗推理额度
- **进程引用暴露**：支持用户发"停止"命令时主动中断
- **120s 超时**：超时强杀，避免僵尸进程

### 5.3 用户上下文三重防护

```java
private final LinkedHashMap<String, UserContext> contextMap =
    new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Entry<String, UserContext> eldest) {
            return size() > 500;
        }
    };
```

| 保护层 | 机制 | 触发条件 | 效果 |
|--------|------|---------|------|
| 第一层 | TTL 过期 | 48 小时无活动 | 清空上下文 |
| 第二层 | 滑动窗口 | 单用户超 200KB | FIFO 删除最早对话 |
| 第三层 | LRU 淘汰 | 全局超 500 用户 | 淘汰最久未使用 |

`accessOrder=true` + `removeEldestEntry` override = 标准 LinkedHashMap LRU 实现。

### 5.4 权限隔离双模式

- **管理员**：完全权限（读写 + 命令执行 + 部署）
- **普通用户**：只读模式（**系统指令最高优先级强制约束**）

### 5.5 并发控制

```java
private final ExecutorService qoderExecutor = new ThreadPoolExecutor(
    10, 15, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(30),
    new ThreadPoolExecutor.AbortPolicy()
);
```

核心线程 10 / 最大 15 / 队列 30 / `AbortPolicy` 满载即拒。**`AbortPolicy` 比 `CallerRunsPolicy` 安全**：避免主线程被长任务阻塞。

## 六、五级知识沉淀模型（L0-L4）

**这是文章最具复用价值的部分**——一套让 AI 越用越聪明的经验沉淀机制：

```
L0  git history（自动追踪代码变更）
 ↓
L1  .qoder/context/（每次任务的过程报告）
 ↓
L2  .qoder/memory_recent.md（最近 5 次会话摘要）
 ↓
L3  .qoder/rules/candidates/（候选规则，经验沉淀）
 ↓
L4  AGENTS.md + P0-constraints.md（正式规则）
```

**自动晋升机制**：候选规则触发 **≥3 次** 且 **成功率 ≥80%**，自动提议晋升为正式规则。

**层级设计哲学**：
- **L0-L1 是"原始数据层"**：git 与每次任务的详细过程，机器可读
- **L2 是"短期记忆层"**：5 次会话摘要，平衡上下文长度与历史信息
- **L3 是"候选规则层"**：经验沉淀待验证，避免直接污染 AGENTS.md
- **L4 是"正式知识层"**：直接进入 agent 加载的最高优先级规则

这套机制把"prompt engineering 的偶发灵感"转化为"可量化、可晋升、可回滚的组织知识资产"。

## 七、踩坑经验清单

| # | 坑 | 修复 |
|---|-----|------|
| 1 | Node.js 4KB 全缓冲 | `stdbuf -oL` 强制行缓冲 |
| 2 | MCP OAuth token 格式错 | 必须是 JSON 数组 `[{...}]`，对象格式会 crash |
| 3 | Stream 多实例消息重复 | 用环境开关精确控制（`dingtalk.stream.enabled`），生产设 `false` |
| 4 | AI 卡片流式更新 403 | 单独申请"AI 卡片流式更新权限" |
| 5 | Claude Code `-p` 模式权限丢失 | 显式传 `--allowedTools` 参数（`-p` 不会读 `settings.json`） |

## 八、关键配置参考

```properties
# Stream 开关（生产设 false 避免多实例重复）
dingtalk.stream.enabled=true
dingtalk.app.key=${DINGTALK_APP_KEY}     # antx 注入
dingtalk.app.secret=${DINGTALK_APP_SECRET}
dingtalk.robot.code=${DINGTALK_ROBOT_CODE}
```

**AI 卡片流式更新限流策略**：
```java
// 累计超 50 字符才更新一次
if (fullContent.length() - lastUpdateLen > 50) {
    String content = fullContent.length() > 3000 
        ? fullContent.substring(0, 3000)  // 截断保护
        : fullContent.toString();
    cardService.streamUpdate(trackId, content, false, false);
}
```

## 九、总结：以最低侵入实现企业级 AI 助手

| 维度 | 实现 |
|------|------|
| 完全内网部署 | WebSocket 长连接规避公网回调 |
| 实时流式回复 | stdbuf + AI 卡片打字机效果 |
| 安全权限隔离 | 管理员/只读双模式 |
| MCP 工具开放 | 静态 Bearer token 跳过 OAuth |
| 引擎可切换 | Qoder CLI → Claude Code 平滑过渡 |
| 生产级稳定 | 线程池 + 超时 + LRU 三层保护 |

**这套方案的真正价值**：不是某一项技术多新颖，而是把"现有成熟组件"（钉钉 Stream、MCP、ProcessBuilder、LinkedHashMap、stdbuf）拼成可生产落地的最小可行系统。**5 级知识沉淀模型 L0-L4** 是其中最值得借鉴的工程模式——把 AI 助手从"工具"升级为"越用越聪明的同事"。

## 深度分析

### 架构解耦：消息通道、AI 推理、UI 渲染的三层分离

本方案最核心的架构洞察是将 AI 助手拆分为三个关注点迥异的层次：**消息通道**（网络连接与协议）、**AI 推理**（LLM 调用与工具编排）、**UI 渲染**（用户可见的流式输出）。每层选择最轻量的现有技术而非自研框架，这是工程上"组合优于继承"原则的典型实践。钉钉 Stream 处理 WebSocket 长连接，解决了内网部署无法暴露回调地址的根本问题；CLI 工具负责推理，避开自研 Agent Framework 的复杂度；AI 卡片负责打字机效果，利用平台原生能力而非自己实现 SSE。这种分层还有另一层价值：每层的故障隔离独立——Stream 断连不会影响正在运行的 CLI 推理进程，反之亦然。

### 双引擎冗余：工程理性对抗 AI 不确定性

双引擎并行部署（Qoder CLI + Claude Code）的设计，表面上是"一个不行切另一个"的故障切换，深层逻辑是对 AI 模型能力边界不确定性的主动防御。当前没有任何单一 CLI 工具能在所有场景下表现一致——Qoder 在简单操作场景轻量高效，Claude Code 在复杂问题排查场景能力更强。采用不同入口调用的设计比"自动选择最优引擎"更务实，因为后者需要额外的评估成本和切换延迟。在 Docker 同容器内共享工作目录和 MCP 配置，是保证用户体验一致性的关键细节。

### 知识沉淀：从偶发洞察到可量化资产

L0-L4 五级知识沉淀模型解决了 AI 助手落地的根本难题：如何让 AI 越用越聪明，而不是每次都从零开始。传统 prompt engineering 的问题是灵感无法累积、无法复现、无法验证。这套机制通过将知识分层——原始数据层（L0-L1）、短期记忆层（L2）、候选规则层（L3）、正式知识层（L4）——创造了一条从经验到规则的晋升路径。关键创新是**自动晋升机制**：≥3 次触发且成功率 ≥80% 才允许晋升，这把经验沉淀从主观判断转化为可量化的工程指标。这个比例（3 次 × 80% 成功率）暗合统计学的小样本置信区间，在工程成本与知识质量间取了平衡。

### 无头环境工具调用：OAuth 困境的结构性解决

MCP 协议默认的 OAuth2 流程假设有浏览器供用户交互授权，但 Docker/Serverless 等无头环境下这个假设失效。本方案的解决思路是"提前完成授权、静态注入 token"，将交互式流程转化为一次性配置操作。这种方案的局限在于 token 有效期管理——需要提前刷新，且凭据必须通过 antx/diamond 等配置中心注入而非硬编码。值得注意的是，这个方案在多容器水平扩展时需要保证 token 文件的一致性，否则不同实例可能面临不同的授权状态。

### 生产稳定性：三层保护与进程级隔离

ProcessBuilder 带来的进程级隔离比线程级隔离更彻底——一个请求一个进程，进程退出即资源完全释放。但这里存在一个微妙的设计权衡：120 秒超时配合 `destroyForcibly()` 能避免僵尸进程，却也意味着正在执行的写操作可能被强制中断，数据可能不一致。三层上下文保护（TTL 过期、滑动窗口、LRU 淘汰）通过 LinkedHashMap 的 `accessOrder` 特性实现，代码简洁但有效。`AbortPolicy` 满载即拒的设计比 `CallerRunsPolicy` 更安全，因为后者会让主线程被长任务阻塞，在高并发场景下可能引发级联故障。

## 实践启示

### 1. 优先选择平台原生能力而非自研

钉钉 AI 卡片的流式更新、Stream 模式的 WebSocket 长连接——这些平台原生能力已经解决了最难的网络和 UI 问题。选择方案时应优先评估平台提供的能力，只有当原生能力明显不足时才考虑自研。本方案的流式更新限频策略（累计 50 字符才更新一次）是工程折中，应该成为所有类似场景的标准实践。

### 2. 在无头环境中为所有交互式协议准备静态 Token 方案

无论 MCP 还是其他需要 OAuth 的工具协议，在规划 Docker 部署时，第一件事应该是设计静态 Token 注入方案，而不是假设可以完成交互式授权。建议将 Token 获取流程写入部署文档的"环境准备"步骤，并在配置中心预留刷新机制。

### 3. AI 助手的上线顺序应该是：先跑通、再优化、再扩展

本方案的落地路径是先在钉钉群跑通对话 -> 发现 Qoder CLI 能力不足 -> 引入 Claude Code -> 双引擎并行。每一步都有明确的目标和验证标准，避免了在初始阶段就追求"完美方案"导致的过度工程。建议所有 AI 助手项目遵循类似的渐进路径。

### 4. 知识沉淀机制应该在第一版上线时就包含

L0-L4 模型虽然在文章靠后位置描述，但它的实现复杂度不高（主要是文件读写和简单的规则引擎），建议在上线的第一版就包含基础版本。哪怕只有 L0（git history）和 L1（每次任务报告），也比完全没有知识积累要好。知识的价值随时间增长，早启动的收益远大于后期迁移成本。

### 5. 生产环境的多实例部署必须用环境开关精确控制

Stream 模式的多实例冲突问题（消息重复处理）是典型的"开发环境正常、生产环境异常"场景。解决方案是环境开关 `dingtalk.stream.enabled` 配合 antx/diamond 注入，生产/预发设 `false`，只有日常开发环境才开启。这个模式可以推广到所有有状态的长连接组件。

## 相关实体
- [Claude Code Core Internals](../ch03/076-claude-code.html)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](../ch01/339-anthropic-claude-code.html)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](../ch01/891-anthropic.html)
- [Agentmemory Source Analysis Coding Agent Local Memory](../ch09/047-coding-agent.html)
- [Aws Devops Agent 实战云网络故障自主调查与修复建议](../ch11/264-aws-devops-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dingtalk-qoder-claudecode-dual-engine-ai-assistant.md)

- [Claude Code Best Practices Prompt Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-best-practices-prompt-engineering.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

