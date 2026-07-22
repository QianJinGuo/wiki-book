---
title: "Skills：让 Claude 记住「怎么做」，告别重复教学"
type: raw
tags: [claude, skill, claude-code, workflow, prompt-engineering]
source_url: "https://mp.weixin.qq.com/s/pHMLeSJkm1wZrozM0HpuTQ"
ingested: 2026-05-28
sha256: 2310663e4419616614977f03c7375d252bc719ccfd3d1ffeb9612ce345fcd7ed
---

# 技能描述
按标准流程 review API 代码...

# 具体步骤
1. 读取路由文件...
2. 对照 schema...
3. 检查错误处理...
```

## 调用方式

```bash
# 项目级 Skill（只对这个项目有效）
.claude/skills/<skill-name>/SKILL.md

# 全局级 Skill（所有项目都能用）
~/.claude/skills/<skill-name>/SKILL.md

# 调用
/api-review
```
