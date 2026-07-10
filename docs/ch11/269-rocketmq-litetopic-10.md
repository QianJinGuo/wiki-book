# 百炼网关实践：用 RocketMQ LiteTopic 让限流比降了 10 倍

## Ch11.269 百炼网关实践：用 RocketMQ LiteTopic 让限流比降了 10 倍

> 📊 Level ⭐⭐ | 1.8KB | `entities/百炼网关实践用-rocketmq-litetopic-让限流比降了-10-倍.md`

# 百炼网关实践：用 RocketMQ LiteTopic 让限流比降了 10 倍

百炼是阿里云的大模型服务平台，承载百万级用户调用千问等数十种大模型的推理请求。随着平台从千级用户增长到百万级，传统的限流方案（Token Bucket / 粗粒度 QPS 限流）已无法满足"在有限 GPU 池中实现百万租户各自独立、按需弹性的精细化流量治理"的需求。

本文详细记录了百炼网关团队对限流系统的端到端重构过程，核心技术选型是 **RocketMQ LiteTopic**。通过将限流决策与消息队列的 topic 模型深度结合，实现了多租户间的精细隔离与按需弹性，方案上线后限流比降低了 10 倍。

文章涵盖了两代限流方案的架构演进、LiteTopic 在实现过程中的多项工程挑战（包括消息顺序性、超时兜底、压测抖动等问题的解决方案），以及生产环境的灰度策略与观测体系。这些工程实践对大规模 AI 推理平台的 [Harness Engineering](../ch05/050-harness-engineering.html) 相关基础设施设计具有直接参考价值。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/百炼网关实践用-rocketmq-litetopic-让限流比降了-10-倍.md)

---

