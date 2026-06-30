# Well-architected best practices for software supply chain security

## Ch01.765 Well-architected best practices for software supply chain security

> 📊 Level ⭐⭐ | 3.7KB | `entities/aws-software-supply-chain-security-well-architected.md`

# Well-architected best practices for software supply chain security

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aws-software-supply-chain-security-well-architected.md)

## 深度分析

Well-architected best practices for software supply chain security 涉及architecture领域的核心技术议题。
### 核心观点
1. xyz tokens, and recently axios.
2. Thanks to community efforts involving the Amazon Inspector team, the Open Source Security Foundation, and others, the affected packages were quickly flagged, which reduced the impact of these incidents.
3. Supply chain attacks like Shai-Hulud exploit vulnerabilities on two fronts: compromised maintainer accounts that publish malicious packages, and consumer environments that download and execute those packages.
4. The Shai-Hulud attack, shown in Figure 1, succeeded because maintainer credentials were compromised through phishing, enabling threat actors to publish malicious versions of popular packages.
5. Incidents like these highlight the need for strong security practices within the software supply chain, and effective defense requires addressing both sides.

### 内容结构
- Well-architected best practices for software supply chain security
- **Use temporary credentials and grant least privilege**
- **Implement defense in depth**
- **Artifact signing as part of defense in depth**
- **Centralize dependency management**
- **npm provenance attestation**
- **Scan dependencies throughout the software development lifecycle**
- **Configure logging and monitoring**

### 技术要点

- **architecture架构**: 本文在architecture方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **aws趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)

## 实践启示
1. **工程落地**: architecture领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

