# PagePilot — PC端AI测试Skill设计与实战

## Ch07.077 PagePilot — PC端AI测试Skill设计与实战

> 📊 Level ⭐⭐ | 4.0KB | `entities/pagepilot-pc-ai-test-skill-design-practice.md`

# PagePilot — PC端AI测试Skill设计与实战

支付宝商家中心团队自建的 PC 端 AI 测试 Skill 系统，基于 Browser Agent (CDP) + 组件化知识库 + DB 验证的端到端 AI 测试方案。

## 核心设计理念

**不写测试代码，写测试知识。** 把踩过的坑、验证过的交互代码、有效的 DOM 选择器封装成"组件 md"，AI 执行时查阅对应组件直接复用。

核心公式：AI Agent + 组件化知识库 + 浏览器自动化 + DB 验证 = 端到端 AI 测试。

## 方案演进

从平台方案（自然语言驱动/智能测试流）到自建 Skill。平台方案在商家侧场景暴露出账号体系受限、流程控制粒度不足、文件上传缺失、验证手段单一、扩展受排期约束等短板，自建 Skill 逐一解决了这些问题。

## 技术架构

### 四趟编译管线（Case 解析）

1. **风格检测** — 自动识别三种 Case 写法（表格/自然语言/清单）
2. **元数据抽取** — 提取账号密码、入口 URL、DB ARN 等环境参数
3. **组件匹配 + 置信度评分** — 匹配 UI 组件并给出置信度（95%+/80-89%/60-69%/<50% 四级门控）
4. **可执行 step 列表输出** — 注入 trace-collector，置信度门控决定执行策略

### 组件查找优先链

三层优先级：local-components/（最高，业务覆盖平台）→ components/（平台通用）→ unmatched（提示新建）。类比 CSS 层叠规则。

### Phase 0→6 门控

7 个阶段串联，每阶段有前置通过条件（precheck→登录→URL→DB 查询→比对→报告→归档），条件不满足即卡住，不向下传播错误。

### 失败自学习

Case 失败 → errorCode 匹配 known-failures → 命中标注模式 ID / 未命中自动补录（只增不删）。

## 关键技术难点与解法

| 问题 | 解法 |
|------|------|
| React 受控组件 input.value 不生效 | prototype.value setter + dispatchEvent 触发合成事件 |
| CDP 无法操作原生文件选择 dialog | DOM.setFileInputFiles 直塞文件路径 |
| Cascader 异步加载跳级选择 | 逐级选 + 500ms 等待 |
| 同一搜索功能三种实现 | DOM 预扫描判断组件体系 |
| SPA 路由销毁 fetch 拦截器 | submit 前 0.5 秒内重注入 |
| 按钮无响应 | CDP 真实鼠标事件（mouse move → down → up） |
| CDP session 崩溃表单丢失 | window.__formState 表单快照 + 崩溃重登恢复 |

随机出错率从首轮 40% 降到 4 轮后 5% 以下。

## 业务成果

- **蚂蚁答疑助手评测**：4 波 137 条用例，3 小时完成（人工 2 天），发现 64 个 Bug（含 MCP 工具泄露 P0 漏洞）
- **店铺开通**：7 条 Case 30 分钟跑完（人工半天-1天）
- **品牌管理（B站）**：12 Case 全量覆盖，通过率 100%
- **品牌管理（P站）**：跨 Skill 联合验证，发现前端 Bug
- **跨域扩展**：万知管理平台 100 条 Monkey 测试 100% PASS；安全越权校验 4/4 PASS

## 组件生态

42 个组件 md + 34 个脚本，分 5 类覆盖商家侧 90% 高频操作。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/pagepilot-pc-ai-test-skill-design-practice.md)

---

