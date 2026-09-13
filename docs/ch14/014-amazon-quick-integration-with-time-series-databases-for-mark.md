# Amazon Quick integration with time-series databases for market intelligence using MCP

> 📊 Level ⭐⭐⭐ | 8.2KB

## 摘要

Amazon Quick's Model Context Protocol (MCP) support lets financial analysts query KDB-X time-series market data in natural language instead of writing q or SQL by hand, with Bedrock AgentCore Gateway as the authenticated routing layer between the Quick chat agent and a self-hosted KDB-X MCP server on EC2. The walkthrough covers the full path — hardened systemd services, an HTTPS MCP endpoint, a Cognito-fronted gateway target, a Quick `Actions` connector, and an equity-research chat agent — and offers the same pattern for IoT and DevOps dashboards.

## 核心要点

- **The bottleneck is expertise, not data.** Firms hold the market data; only q-literate specialists can query it.
- **Amazon Quick is the generation layer** — conversation, NL-to-SQL, visualizations — and never touches the database.
- **The KDB-X MCP server is the tool surface**, publishing `run_sql_query`, `hybrid_search`, and `similarity_search` over kdb+ and its vector language q.
- **AgentCore Gateway is the chokepoint**: the MCP server is a gateway target, inbound authorization is validated there, and Quick's connector draws credentials there.
- **Cognito plus service-to-service OAuth** carries identity end to end — a user pool before the gateway, client credentials before Quick.
- **A human approves each query**: Quick frames the SQL, the user reviews and submits, then the MCP server executes it.
- **Least privilege is layered**, from a non-login `kdbx-svc` account and hardened systemd units to TLS-only Nginx, Secrets Manager, and WAF.
- **The pattern is domain-neutral**: swap the trade table for device telemetry or service metrics and the tool surface barely changes.

## 深度分析

### 1. What MCP Actually Changes: A Tool Boundary, Not a Query Engine

MCP's contribution here is a boundary, not a database. Before it, an analyst's interface is a q REPL or a hand-written SQL script; after it, it is a short list of named tools with declared arguments that a model can select and fill. The server sits between model and data: it owns the connection to KDB-X, wraps execution behind `run_sql_query`, and exposes `hybrid_search` and `similarity_search` as siblings of plain SQL. Everything Quick does downstream — planning, aggregation, charts, follow-ups — is only as capable as the tool surface it can reach.

### 2. Architecture: Three Layers Between the Analyst and the Data

The top layer is Quick, the generative BI service that analyzes data, builds visualizations, and automates workflows; it never touches the database directly. Below it, Amazon Bedrock AgentCore Gateway registers the MCP server as a target, terminates inbound authorization, and presents one endpoint plus credentials to Quick's `Actions` connector. The innermost layer is the KDB-X MCP server, a Python process under `uv` speaking streamable HTTP on `127.0.0.1:8080` and calling a KDB-X service on `127.0.0.1:5000`. What teaches the model about this deployment is not a schema dump but the server's tool list — retrievable with `tools/list` — and its per-tool descriptions. Quick translates each question into SQL and hands it to the MCP server; q stays the engine underneath while SQL is the surface the model writes against. Both run as systemd units, the MCP unit requiring the database unit so startup order is explicit.

### 3. Why Naive Text-to-SQL Struggles with Time-Series and Market Data

Time-series schemas punish open-ended text-to-SQL. A trade table is narrow and deeply typed — `time`, `sym`, `price`, `size` across tens of millions of rows — and the analyses that matter are aggregations over time buckets, where a subtly wrong predicate — a mis-specified symbol, an unaligned window, a look-ahead leaking future data — returns a plausible number that is simply wrong. Free schema discovery also invites hallucinated columns.

A declarative MCP descriptor constrains that search space: pre-declare a few tools, and the task narrows to choosing one and filling its arguments, shrinking generation from unconstrained program synthesis to bounded tool invocation. The sample dataset is deliberately small for the same reason — 100 symbols, 20 million rows, one trading day — so the agent can be evaluated on total trading volume, hourly breakdown, maximum price, and price visualization before it faces a live feed. Retrieval tools declared alongside `run_sql_query` mean semantic search over filings shares one surface.

### 4. Generalization Beyond Finance, and What the Server Is Allowed to Touch

The authors frame the pattern as domain-neutral, naming financial market analysis, IoT sensor monitoring, and DevOps performance dashboards as equivalents. The common shape is not "stocks" but a high-volume append-only series plus an analyst who cannot write the native query language: swap the trade table for device telemetry or service metrics and the tool surface barely changes, provided the needed aggregations are pre-declared.

Permission is layered rather than delegated to the model. On the host, the KDB-X service runs as a dedicated `kdbx-svc` account with no login shell, no sudo, and no SSH keys, inside a systemd unit setting `NoNewPrivileges=true`, `ProtectSystem=strict`, and `PrivateTmp=true` and allowing writes only under `/opt/kdbx`; the MCP server is a separate unit that requires it. On the wire, Nginx terminates TLS with Let's Encrypt, forces HTTP to HTTPS, and negotiates only TLS 1.2 or 1.3, with guidance to replace `nip.io` with Route 53 and ACM and keep AgentCore traffic in the VPC via VPC Lattice. On identity, Cognito guards the gateway, service-to-service OAuth guards the Quick connector, Secrets Manager holds the client secret, and WAF protects the token endpoint. On the query, the guardrail is an explicit data scope in the agent's system prompt.

## 实践启示

1. Treat the tool list as the security boundary. The agent reaches only what the MCP server declares, so review which tools exist and what each one executes.
2. Constrain the schema before the prompt. Pre-declare the aggregations and searches your analysts actually run, and let the model choose among them.
3. Keep a human approval step where model-authored queries hit production data. Quick's review-then-execute flow is a requirement, not a nicety.
4. Run the database and the MCP server as separate least-privilege systemd units. A non-login account with `NoNewPrivileges` and `ProtectSystem=strict` is cheap insurance for a process consuming model output.
5. Put a gateway in the middle even for one tool. One endpoint, one auth story, one place to revoke access is worth the OAuth plumbing you would otherwise write.
6. Harden before you scale: ACM and Route 53 instead of `nip.io`, VPC Lattice egress instead of a public endpoint, Secrets Manager with rotation, and WAF before token issuance.

## 相关实体

- [MCP 协议](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)
- [AgentCore Gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-gateway-mcp-extension.md)
- [Adobe × Quick MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/adobe-marketing-agent-amazon-quick-mcp-integration.md)
- [Amazon Quick: 企业数据到决策](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-accelerating-the-path-from-enterprise-data-to-ai-powered-decisions.md)
- [AgentCore 构建 BI Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-ai-agents-for-business-intelligence-with-amazon-bedrock-agentcore.md)
- [Cassandra 时序分区拆分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/dynamically-splitting-wide-partitions-in-cassandra-for-time-.md)

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/amazon-quick-integration-with-time-series-databases-for-market-intelligence-using-mcp/)

---

