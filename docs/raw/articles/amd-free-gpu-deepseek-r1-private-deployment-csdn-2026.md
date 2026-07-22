---
title: "不花一分钱！用AMD免费云GPU私有化部署DeepSeek-R1"
source_url: "https://mp.weixin.qq.com/s/DY9oiDqQJb8PCXwC6GMlcQ"
author: "伍斌 @ CSDN"
created: 2026-07-02
updated: 2026-07-02
type: raw
tags: [deepseek, r1, amd, gpu, deployment, vllm, rocm, local-llm, ngrok, cherry-studio, opencode]
ingested: 2026-07-02
sha256: e12b2fe0764b7601b4f7e74bcc458bb2d7c9bb156daf88bc15f9403352b6ceaa
---

# 不花一分钱！用AMD免费云GPU私有化部署DeepSeek-R1

【CSDN 编者按】本文是伍斌于 6 月 17 日在 CSDN 视频号「AI 进化论」栏目中的直播内容整理，直播主题是「不花一分钱！用AMD免费云GPU私有化部署DeepSeek-R1」，直播结束后，群里不少粉丝反馈：真的很实操！于是，伍斌老师便快速整理成文，希望对正在学习大模型本地私有化部署、免费 GPU 算力搭建以及 DeepSeek-R1 模型实操落地的小伙伴们提供切实的帮助。

作者 | 伍斌      责编 | 张红月
出品 | AI 辅助软件开发伍斌

你有没有这样的感受？

每天用 DeepSeek、ChatGPT、Kimi 处理工作，越用越顺手——直到某天，你往对话框里粘贴了一份合同草稿，或者公司内部的用户数据……

停。

你有没有想过，这些数据去哪了？

四大痛点：调第三方AI API，你在裸奔

痛点一：数据隐私泄露风险

调用任何第三方 AI API，你的输入内容都会上传到对方服务器。合同细节、客户信息、代码源文件——一旦发出去，你就失去了控制权。对于金融、医疗、法律、政务等行业，这是红线。

痛点二：成本随用量失控

个人用用还好。一旦团队推广，token 消耗量爆炸式增长。按量计费的 API 账单，可以在一夜之间从几百变成几万。

痛点三：服务随时可能断供

还记得某些 API 因为政策变化突然断供的新闻吗？你的业务完全依赖对方，一旦断供，所有依赖这个API的系统立刻瘫痪。

痛点四：想练手私有化部署，却没有 GPU

最现实的问题：私有化部署大模型需要显卡。一张 48GB 显存的专业 GPU，售价动辄几万。租用云 GPU，每小时的费用也需要几十元。

大多数开发者和团队，连动手试一试的机会都没有。

解决方案：免费领 200 小时 AMD 云 GPU，自己部署 DeepSeek

AMD正在推进"AI开发者计划"，提供免费 200 小时的云 GPU 资源，硬件配置是：

AMD Radeon PRO W7900
48GB GDDR6 显存
ROCm 7.2.1 软件栈，已预装 vLLM

这张卡足以流畅运行 DeepSeek-R1-Distill-Qwen-14B（FP16 推理仅需约 28GB 显存）。

今天这篇文章，就带你用这台免费的 GPU，从零开始完成 DeepSeek 大模型的私有化部署，最终在自己的电脑上通过 Cherry Studio 或 OpenCode 与它对话——数据全程不出自己的服务器。

## 实操步骤

### 第一步：注册 AMD AI 开发者计划，领取免费 200 小时 GPU 算力
领取成功后点击"AMD开发者云" → 点击"Create Template"
随便起一个Title，比如"my-deepseek" → Container Image选择 AMD OneClick Base (amd-oneclick-base:rocm7.2.1-py3.12-v20260416)
点击"Create Template" → 点击右上角头像 → 点击"Profile"
在页面下方找到刚才创建的 Template，点击右侧"Launch"按钮
在自动打开的新页面中，点击"Terminal"进入云端终端

⚠️ 注意：请选择 Terminal 标签，而非 Python 3（Notebook）。vLLM 是长期运行的后台服务进程，必须在 Terminal 里启动，Notebook Cell 不适合管理这类进程。

### 第二步：检查系统状态与硬件参数

进入 Terminal 后，依次运行以下5条命令，确认环境正常。

**命令1：查看 GPU 基本状态**
`rocm-smi`

正常输出示例：Device 0，Temp 27.0°C，VRAM% 0%，GPU% 0%

⚠️ 避坑：如果 Temp、Power 等字段全部显示 N/A，不要慌——这是正常现象。容器虚拟化环境下传感器权限受限，只要 VRAM% 和 GPU% 能显示数值（0%），说明 GPU 已正确挂载。

**命令2：确认 GPU 架构**
`rocminfo | grep -E "^Agent|Name:|Marketing|gfx"`

GPU 架构为 gfx1100（RDNA3），即 Radeon PRO W7900。

**命令3：确认容器内 GPU 数量**
`ls /dev/dri/renderD*`

输出 /dev/dri/renderD134（数字可能不同），说明容器分配了1张 GPU。

**命令4：确认 VRAM 大小**
`amd-smi static --vram`

正常输出：VRAM TYPE: GDDR6, SIZE: 49136 MB ≈ 48GB

**命令5：确认 vLLM 已预装**
`pip show vllm`

vLLM 已预装，版本为 ROCm 7.2.1 专属构建，无需手动安装。

### 第三步：设置环境变量
```
export PYTORCH_ROCM_ARCH="gfx1100"
export HSA_OVERRIDE_GFX_VERSION=11.0.0
export HF_ENDPOINT=https://hf-mirror.com
```

⚠️ 避坑：这两个 ROCm 环境变量是 gfx1100 的必要配置，缺少任何一个都会导致 vLLM 无法正确识别 GPU 或性能大幅下降。

### 第四步：下载 DeepSeek-R1-Distill-Qwen-14B 模型

推荐使用 ModelScope（魔搭社区），国内网络直连，速度通常可达几十 MB/s：

```
pip install modelscope -i https://pypi.tuna.tsinghua.edu.cn/simple
modelscope download --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \
  --local_dir /workspace/models/DeepSeek-R1-14B
```

模型大小约 28GB（FP16 全精度）。

### 第五步：启动 vLLM 推理服务

```
PYTORCH_ROCM_ARCH="gfx1100" \
HSA_OVERRIDE_GFX_VERSION=11.0.0 \
VLLM_USE_V1=1 \
vllm serve /workspace/models/DeepSeek-R1-14B \
  --max-model-len 16384 \
  --gpu-memory-utilization 0.90 \
  --trust-remote-code \
  --port 8000 \
  --served-model-name deepseek-r1-14b \
  --enable-auto-tool-choice \
  --tool-call-parser hermes
```

启动成功标志：终端出现 `INFO: Application startup complete.`

⚠️ 避坑集锦：
- 不能加 VLLM_ROCM_USE_AITER=1（仅对 MI300 系列有效）
- 不能运行 DeepSeek-R1 满血 671B 版本（MLA 架构 gfx1100 不支持）
- `groups: cannot find name for group ID 109`：容器启动时的权限映射问题，忽略即可
- huggingface_hub 版本错误：`pip install "huggingface_hub>=0.34.0,<1.0"`

### 第六步：云端本地验证推理

```
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1-14b",
    "messages": [{"role": "user", "content": "用中文介绍一下你自己"}],
    "max_tokens": 500
  }'
```

### 第七步：用 ngrok 打通公网隧道

```
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok
```

注册 ngrok 账号 → 配置 authtoken → `ngrok http 8000` → 记下 Forwarding URL。

### 第八步A：配置 Cherry Studio（非开发者）

Cherry Studio 配置：Provider Type 选 OpenAI，API Host 填 ngrok URL，Model ID 填 deepseek-r1-14b。

### 第八步B：配置 OpenCode（开发者）

OpenCode 配置 (~/.config/opencode/opencode.json)：
- provider: @ai-sdk/openai-compatible
- baseURL: ngrok URL + /v1
- apiKey: no-key
- model: deepseek-r1-14b

⚠️ 避坑：用完记得在 radeon.anruicloud.com 的 Profile 里删实例，否则持续消耗 200 小时免费额度。
