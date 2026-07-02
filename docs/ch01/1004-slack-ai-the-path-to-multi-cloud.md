# Slack AI: The Path to Multi-Cloud

## Ch01.1004 Slack AI: The Path to Multi-Cloud

> 📊 Level ⭐⭐ | 1.2KB | `entities/slack-ai-path-to-multi-cloud.md`

# Slack AI: The Path to Multi-Cloud

Slack AI's journey from single-cloud AWS SageMaker to multi-cloud LLM inference spans three phases. Phase 1 (SageMaker Era): Deployed LLM inference containers across multiple AWS regions but faced scaling latency, hardware scarcity (A100/H100 GPUs), and over-provisioning costs. Mitigated via On-Demand Capacity Reservations (ODCR) and cron-based scaling. Phase 2: Migrated to a multi-cloud architecture spanning AWS, GCP, and Azure to eliminate single-provider GPU dependency, using a custom routing layer for cost-optimized inference. The routing layer considers GPU availability, spot instance pricing, and regional latency to dispatch requests. Key lessons include the importance of observability across cloud boundaries and the operational complexity of managing different GPU instance types.

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/slack-ai-path-to-multi-cloud.md)

---

