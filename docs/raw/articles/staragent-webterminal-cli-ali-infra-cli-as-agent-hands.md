---
source_url: "https://mp.weixin.qq.com/s/5qwjuSZmENMovuEStczQEg""
ingested: 2026-06-26
sha256: 9233e9828b68a929
---

# StarAgent/Drogo WebTerminal CLI：阿里基础设施团队把 WebTerminal 变成 Agent 手脚

> 来源：阿里技术 / 阿里妹导读｜2026-06-01
> 代码仓库：foundation_models/webterminal-cli

## 核心论点

> 全是 Web，没有 CLI，怎么行？Agent 都会写代码了，远程排障还要人肉点网页、复制命令、盯滚动条——这画面多少有点"地铁老人看手机"。

本文记录一次围绕 **StarAgent/Drogo WebTerminal** 的工具化实践：

- 把 **GPU hang、core dump 调试**等场景**不固化成"祖传脚本套件"**
- 把 WebTerminal **抽象成稳定的 CLI 执行面**
- 用 **Skill 描述操作方法**
- Agent **动态生成命令、读取结果、继续决策**
- 最终完成：远程 GPU hang 分析、文件上传下载、**Emacs + eshell + gdb 的交互式 coredump 调试**

## 对 Skill 的态度

> 我对 Skill 的态度很朴素：Skill 不是法器，不是咒语，也不是"复制进去 Agent 就突然开悟"的玄学符纸。**Skill 本质上就是说明书，是贴在工具箱盖子上的那张"先拧这个、再接那个、别把手伸进风扇里"的操作指南**。

**真正能把活干成的，必须是 CLI**：参数清楚、行为稳定、输出可解析、错误可复现、证据能落盘。

> 所以这套东西的核心**不是"写一个很长的 Skill 让 Agent 背下来"**，而是把能制度化的都制度化，把能流程化的都流程化，把以前靠老师傅手感、群里口口相传、网页上点点点的部分，**全部压进 `wt` 这种可执行接口里**。

Skill 只负责告诉 Agent：**什么时候该登录、什么时候该 run、什么时候该 interact、什么时候该停手问人**。至于真正挥锤子的活，**必须交给 CLI**。

> 否则就是让 Agent 看着说明书徒手修发动机，场面很感人，结果很危险。

## 黑屏模式重大更新

> WebTerminal 终于可以像 SSH/SCP 一样用了

新增 `wsh` / `wcp`：
- `wsh x.y.z.w` —— 黑屏进 shell（或当作可编程远程命令执行入口）
- `wsh x.y.z.w -- 'hostname; pwd'` —— 远程命令执行
- `wcp /tmp/x.txt x.y.z.w:/tmp/x.txt --force` —— 上传
- `wcp x.y.z.w:/tmp/x.txt /tmp/x.down.txt --force` —— 下载

### 关键体验提升

1. **认证复用**：浏览器登录一次 → cookie 缓存（`~/.drogo-webterminal-helper/direct/default.auth.json`）→ `wsh`/`wcp` 后续直接复用
2. **shell 像个正常终端**：`exit` 不再卡死；远端 EOF/closed/reset 正确退出；本地 terminal 的 rows/cols 同步给 WebTerminal
3. **浏览器模式保留为兜底**：`wtsh/wtcp --transport browser`

### 一点遗憾

纯黑屏登录**暂时没有硬上**。阿里 SSO 的 HTTP 登录链路会进入 RSA、风控、账号安全检查，继续硬怼收益不高。所以当前最稳的路线：**浏览器负责合规授权，真正干活走黑屏 shell**。

## V1 内容：把 WebTerminal 变成 Agent 友好的执行面

### 仓库

**foundation_models/webterminal-cli**

> 不负责让 WebTerminal 变得更漂亮，**它负责让 WebTerminal 终于长出 CLI**。2026 年了，我们还在为"能不能别用手点网页"而奋斗，听起来很离谱，但工位现实就是这么朴素又残酷。

目标：让 **Codex / Cursor / Claude Code** 这类 Agent **不再隔着 DOM 猜命**，而是通过 `wt` 像普通 shell 一样控制远端。能跑命令，能传文件，能开 gdb，能一条条交互，能把证据落盘。

### 4 层职责分离

| 层次 | 职责 | 不做什么 |
|------|------|----------|
| **WebTerminal 页面** | 登录、角色选择、审计、心跳、官方连接链路 | 不承载任务逻辑 |
| **`wt` CLI** | 会话复用、命令发送、输出捕获、文件 API、交互控制面 | 不内置具体排障 suite |
| **Skill** | 描述操作方法、风险边界、推荐命令模板 | 不绑定某个 IP 或某个案例 |
| **Agent** | 动态规划、执行、观察、复盘 | 不绕过授权链路 |

> 一句话总结：**CLI 提供稳定手脚，Skill 提供行动章法，Agent 负责临场判断**。别把 Agent 当高级 crontab 用，它会委屈，我们也亏。

### 为什么不做固定 suite

把 `gpu-hang` 命令内置十几条检查项 + 固定报告——看起来很智能，实际像"祖传 shell + 自动排版"。第一次看很香，第二次遇到分支就开始 tmd。

这种方式和 Agent 能力**冲突**：

- 场景逻辑写死后，Agent 只能"调用工具"，不能"分析现场"
- 每新增一个诊断路径，都要修改 CLI 代码
- 远端状态复杂时，固定脚本很难处理分支
- 安全边界不清晰，读操作/写操作/侵入式操作混在一起

## 会话设计：授权留在浏览器，执行交给 CLI

企业内部 WebTerminal 通常**不是裸 SSH**——背后有 SSO、角色、审批、审计、心跳、跳板、容器选择等一串逻辑。全部重写进 CLI，**不现实，也不应该**。

`wt session start` 的设计：
- 启动或复用一个**持久 Chromium**
- 会话仍由官方 WebTerminal 页面建立
- 用户完成登录后，**CLI 只复用页面里已经存在的终端实例**

```
bin/wt session start --target-ip
bin/wt session status
```

### 4 个直接收益

- 授权、审计、心跳仍走官方页面链路
- CLI **不保存 SSO token**，也不绕过登录流程
- 目标 IP 是参数，**不会写死在实现里**
- 多轮排障可以共享同一个远端 shell 状态

实现上，CLI 从页面里读取 `window.terminalMap[wsSessionId]` 对应的终端实例，使用页面暴露的 `writeMsg2Session(data)` 发送输入，同时 hook xterm 输出做本地捕获。

## 命令执行：不做 suite，做动态闭环

`wt run` 是最基础的能力：发送一条 shell 命令，等待结束标记，返回远端 exit code，并把输出落盘。

```
bin/wt run --capture captures/task/name.raw.log -- ""
```

### 可靠识别命令完成

为可靠识别命令完成，`wt run` 会在远端命令后追加**唯一 marker**：

```bash
printf '\n__WT_DONE___:%s\n' "$?"
```

> 这比单纯依赖 prompt 更稳，因为远端 prompt 可能被用户配置、conda 环境、容器 shell、颜色控制字符影响。

### 三份证据文件

| 文件类型 | 内容 | 用途 |
|---------|------|------|
| `*.raw.log` | 原始 ANSI 输出 | 保留完整现场 |
| `*.plain` | 去 ANSI 后的文本 | Agent 解析 |
| `*.snapshot.json` | xterm buffer 快照 | 排查全屏程序或显示问题 |

> 不再是"我刚刚屏幕上好像看见了"，而是"证据在这，别耍赖"。

### GPU hang 例子（动态命令闭环）

Skill 只给出建议命令，**不把诊断固化进 CLI**：

```bash
bin/wt run --capture captures/gpu-hang/env.raw.log -- \
"hostname; date; uname -a; id; pwd; which nvidia-smi || true; nvidia-smi -L || true; nvidia-smi || true"

bin/wt run --capture captures/gpu-hang/processes.raw.log -- \
"ps -eo pid,ppid,stat,etime,%cpu,%mem,wchan:32,cmd --sort=-%cpu | head -200; GPU_PIDS=\"$(nvidia-smi --query-compute-apps=pid --format=csv,noheader 2>/dev/null | sort -u | tr '\n' ' ')\"; echo GPU_PIDS=$GPU_PIDS"

bin/wt run --capture captures/gpu-hang/kernel.raw.log -- \
"dmesg -T | egrep -i 'nvrm|xid|gpu|cuda|uvm|pcie|ecc|oom|hung|reset' | tail -300 || true"
```

Agent 读完结果后再决定是否继续查 wait channel、是否需要 gdb attach、是否需要用户批准侵入式操作。

> 关键不是"命令多"，而是"**下一步有脑子**"。

## 文件传输：从 DOM 自动化改成 API 调用

WebTerminal 页面里的上传下载能力——让 Agent 去点按钮、选文件、等弹窗，2026 年了还玩这个？

### 5 个文件 API

CLI 复用已登录浏览器上下文里的 cookie 和终端状态，调用 WebTerminal 文件接口：

- `openFileSystem`
- `listFiles`
- `getDownloadFileHead`
- `downloadFile`
- `uploadFile`
- `heartbeat`

### 协议化下载

- 先拿文件 head（`fileUuid`、分块数、总大小、md5）
- 再按 block 下载
- 最后校验 **size/md5**，并可选通过远端 `sha256sum`/`stat` 二次校验

> 下载完不校验，等于"我感觉它对了"，在排障现场基本等价于埋雷。

### 协议化上传

- 先初始化上传（带文件大小和 md5）
- 再按 **1MB block** 发送 multipart
- 最后同样用远端 sha256/stat 验证

> 能协议化就协议化，少点玄学，多点 checksum。

### 重要边界

文件 API **仍要求 WebTerminal 已经登录到机器**。也就是说，**用户需要先在页面点击登录并进入终端，CLI 才能拿到完整的 file session 材料**。

> 先上车，再让 Agent 开车；没上车就飙，属于纯玄学。

## 交互式调试：默认接口应该像普通 shell

远程排障里最难抽象的是**交互式程序**——gdb、pdb、less、emacs、vim——它们**不是"一条命令一个结果"**的模型。

> 你不能对 gdb 说"把所有问题一次回答完"，就像你不能在故障群里说"大家别问了，我先一次性猜完"。

### 从 expect 风格到 HTTP 控制面

最初的 `interact` 是 expect 风格：所有步骤一次性传进去。看起来还有点像那么回事，但用户一句"这好像不是交互式吧？"直接打回现实。

> 真正调试时，下一条命令取决于上一条输出：
> - `bt` 看到崩溃栈，才知道要进哪个 frame
> - `info locals` 看到变量，才知道要 print 哪个字段
> - gdb 缺符号、core 文件异常、路径不对，都需要临时调整
> - 对 emacs 这类全屏程序，**需要发送 raw key**，而不是 line command

最终把 `wt interact` 改成默认启动一个**本地 HTTP server**：

| Endpoint | 用途 |
|----------|------|
| `GET /health` | 查看交互会话是否存活 |
| `GET /summary` | 查看完整步骤摘要 |
| `GET /snapshot` | 获取 xterm 屏幕快照 |
| `POST /command` | 发送一行命令，按 prompt regex 等待结果 |
| `POST /send` | 发送 raw keys，适合 emacs/vim/TUI |
| `POST /drain` | 读取当前缓冲输出 |
| `POST /close` | 退出远端交互程序并关闭本地 server |

### 关键设计

> 远端程序**只启动一次**，状态在多次 HTTP 请求之间保持。gdb 的 `$x`、当前 frame、breakpoint、Emacs buffer，**都不能每请求一次就失忆**。否则不是交互，是每次重启式自动化。

```bash
curl -s -X POST http://127.0.0.1:8765/command -d '{"send":"print item.id"}'
```

响应里包含**本次命令的 prompt-bounded 输出**：

```json
{
  "ok": true,
  "result": {
    "name": "command",
    "send": "print item.id",
    "matched": true,
    "timed_out": false,
    "plain_output": "(gdb) print item.id\r\n$1 = 42\r\n(gdb) "
  }
}
```

Agent 看到这一段，**就可以继续推理**，而不是在一坨全量日志里捞针。

### Playwright 单线程教训

> **Playwright sync API 不能跨线程调用**。最初用了 `ThreadingHTTPServer`，结果请求进入不同线程后触发 greenlet thread switch 问题。最后改成**单线程 `HTTPServer`**，用锁保护 session 操作。

> 对这个使用场景来说，Agent 本来就是顺序调试，**单线程反而更符合模型**。不是所有并发都高级，有些并发只负责把你送走。

## 验收案例：在 Emacs 里写 crash.c，再用 eshell + gdb 定位 core

为了证明**这不是"批量塞命令"的伪交互**，做了一个"有点离谱但很硬"的验收：

> 在远端打开 `emacs -nw -Q`，通过 raw key 创建 C 文件，进入 eshell 编译运行，再在 eshell 里启动 gdb 调试 coredump。**这个流程像什么？像让 Agent 穿着拖鞋跑了个铁人三项**。

### 完整流程（同一个 WebTerminal 会话）

1. `wt interact` 启动远端 `emacs -nw -Q`
2. `/send` 发送 `C-x C-f /tmp/wt-emacs-crash.c`
3. `/send` 插入 C 源码并 `C-x C-s` 保存
4. `/send` 执行 `M-x eshell`
5. 在 eshell 里编译并运行程序，触发 **segmentation fault**
6. 生成 `core.wtdebug`
7. 在 eshell 里启动 `gdb -q ./wt-emacs-crash core.wtdebug`
8. 分别发送 `bt`、`frame 0`、`info locals`、`print item.id`、`print item.name`

### Crash 代码

```c
typedef struct {
    int id;
    const char *name;
} Item;
static int crash(int n) {
    Item item = {42, "emacs-eshell-core"};
    int *ptr = 0;
    printf("about to crash: %s %d %d\n", item.name, item.id, n);
    return *ptr + item.id + n;
}
```

### GDB 输出（真在 core 上说话）

```
Program terminated with signal SIGSEGV, Segmentation fault.
#0  0x0000000000401168 in crash (n=7) at /tmp/wt-emacs-crash.c:12
12        return *ptr + item.id + n;
```

```
bt:
#0 crash (n=7) at /tmp/wt-emacs-crash.c:12
#1 main (argc=2, argv=...) at /tmp/wt-emacs-crash.c:17
```

```
info locals / print:
item = {id = 42, name = 0x402004 "emacs-eshell-core"}
ptr  = 0x0
print item.id   -> 42
print item.name -> "emacs-eshell-core"
```

**最终定位**：`ptr = 0x0`，第 12 行 `return *ptr + item.id + n;` 对空指针解引用导致 coredump。**凶手就是它，证据链闭合，别让业务同学再背锅。**

> 这个验收覆盖了：普通 shell、全屏 TUI、文件编辑、编译、程序运行、core 生成、gdb prompt 交互、结果分析。**对 Agent 来说，它已经足够接近"我在一台机器上远程调试"的体验**。

## GPU hang 分析：场景逻辑留给 Agent

在 `x.y.z.w`（hippo-xyzw）上基于 Skill 推荐的命令做了一次 GPU hang 分析。**没有 `wt gpu-hang --please-save-me` 这种神棍命令**，只有 Agent 根据现场一步步查。

| 维度 | 现场 |
|------|------|
| 机器 | hippo-xyzw |
| Kernel | 5.10.134-010.ali5000.al8.x86_64 |
| Driver | 580.82.07 |
| CUDA | 13.0 |
| GPU | 8 x NVIDIA H20 |

### 采集结论

- 采集时 **GPU compute processes 为空**
- 采集时 8 张卡利用率均为 **0%**，显存占用约为基础占用
- 当前**没有看到 active GPU hang**
- 但 kernel log 里有**历史信号**：
  - 反复出现 `NVRM: refcntRequestReference_IMPL: Failed to enter state 1 ... status: 0x00000056`
  - NVSwitch 曾出现 `SXid 22013` 非致命链路中断
  - 5 月 8 日有一次 `Xid 43`，进程名为 `python`
  - 另有一次看起来不直接相关的 memcg OOM

> **机器当场没 hang，不代表历史上没"作过妖"。** 排障不是法术，不要没病也上猛药。

## Skill 的角色：把经验写成操作方法

这次实现里，Skill **不是"更长的 README"**，而是 Agent 执行远程任务时的**操作规约**。

> README 是给人看的，**Skill 是给 Agent 上手干活看的**；写法不一样，心态也不一样。

Skill 写清楚：

- 如何启动或复用 session
- 如何确认用户已经登录并进入 WebTerminal
- 什么时候用 `run`，什么时候用 `attach`，什么时候用 `interact`
- 文件上传下载必须走 API，**不能操作 DOM**
- **侵入式命令需要用户批准**
- GPU hang 分析的建议命令，但**不把它变成固定 suite**
- coredump demo 的推荐构造方式和清理方式

> 这样做的好处：任务知识可以快速迭代，CLI 的底层抽象保持稳定。**新增一个"Java 线程栈分析"或"磁盘 IO hang 分析"，更可能是改 Skill，而不是改 CLI**。否则每加一个场景都发版，迟早变成"工具平台版祖传单体"。

## 6 个可复用工程模式

### 模式 1：先抽象执行面，再沉淀场景

Agent 缺的往往不是某个具体按钮，而是**稳定的 command/observation loop**。**别一上来就问"能不能做一个 GPU hang 按钮"，按钮救不了复杂现场。**

### 模式 2：授权和执行要解耦

**授权可以继续交给官方页面，执行可以通过 CLI 暴露给 Agent。**

### 模式 3：输出必须可保存、可解析、可复盘

**raw / plain / snapshot 三份证据**比"屏幕上看到了"更适合 Agent 协作。**线上排障最怕一句"我刚才好像看到过"，这句话含金量约等于 0。**

### 模式 4：Skill 应该写边界和方法

而不是把所有业务逻辑变成代码。**Skill 是路线图，不是把每一步都焊死的轨道。**

### 模式 5：交互式程序要按状态机设计

gdb、emacs、eshell 这类工具不是普通命令，**必须保留远端进程状态，并允许多轮输入输出**。

### 模式 6：文件传输要协议化

**能走 API 就不要点 DOM；能校验 size/md5/sha256 就不要只相信"下载完成"。"下载完成"四个字，在没有校验之前，只是一句祝福。**

## 设计取舍

### 为什么不直接连 SSH

真实企业环境里，**WebTerminal 不是 SSH 的薄壳**——它承载授权、审计、角色、心跳和访问入口。**直接 SSH 可能绕过既有治理链路**，也无法复用用户已经完成的登录态。

> 为了一点方便把治理链路打穿，这种"聪明"通常会在复盘会上收费。

### 为什么不把 GPU hang 做成内置命令

GPU hang 的**现场差异很大**。固定 suite 很容易把 Agent 限制成"报告生成器"。更希望 Agent 能根据 `nvidia-smi`、dmesg、进程状态、wchan、业务进程情况**动态分支**。

> 否则 Agent 说"我看完了"，人一问"那进程栈呢？"，Agent 当场沉默。

CLI 内置的是**能力**：运行命令、捕获证据、交互调试、传输文件。**场景方法放在 Skill**。

### 为什么交互控制面用 HTTP

HTTP 的好处是**简单、可调试、Agent 容易调用**。一个 `curl` 就能发下一条命令，response 就是观察结果。**相比把所有调试命令预先写成脚本，HTTP 更接近 ReAct loop**。

> 简单不是土，简单是线上能救命。

### 为什么保留 `interact-script`

**固定 expect 脚本仍然有价值**——smoke test、固定初始化流程、可重复 demo。只是它不应该是默认交互接口。**能背稿的场合用脚本，真打架的时候要能临场发挥。**

所以现在：
- `wt interact`：默认 live server，用于动态调试
- `wt interact-script`：固定脚本，用于已知步骤

## CLI 能力速览

| 命令 | 功能 |
|------|------|
| `wt session` | 管理持久 WebTerminal 浏览器会话 |
| `wt status` | 查看当前终端状态 |
| `wt run` | 执行一条 shell 命令并捕获输出 |
| `wt attach` | 本地 raw TTY 直接接入 WebTerminal |
| `wt interact` | 启动 live HTTP 交互控制面 |
| `wt interact-script` | 执行固定 expect 风格交互脚本 |
| `wt snapshot` | 获取 xterm buffer 快照 |
| `wt ls-files` | 通过 WebTerminal 文件 API 列目录 |
| `wt download` | 通过 WebTerminal 文件 API 下载文件 |
| `wt upload` | 通过 WebTerminal 文件 API 上传文件 |
| `wt direct-info` | 输出脱敏后的直连协议材料，便于实验 |

## 结语

> 这次 WebTerminal CLI 的核心不是"让 Agent 能远程执行命令"这么简单，**而是把一个原本面向人的网页终端，整理成了 Agent 可以稳定消费的执行接口**。

> 人不该继续在网页里机械点点点，Agent 也不该隔着 DOM 猜人生。

**三句话总结**：
1. WebTerminal 继续负责官方授权和连接链路
2. `wt` CLI 负责把远程 shell、文件传输、交互式程序变成可调用能力
3. Skill 负责把排障经验写成可执行方法，让 Agent 根据现场动态闭环

> 从 GPU hang 到 coredump 调试，真正有价值的不是某一组命令，**而是 Agent 能够像工程师一样：观察、判断、执行、再观察**。说白了，就是让 Agent 从"会聊天"进化到"能上手干活"。**这中间差的不是一句 prompt，差的是一整套可执行、可观测、可复盘的工程接口**。

## 招聘

阿里基础设施团队在招 AI 推理和高性能计算方向：

- 大模型推理系统工程（LLM 推理链路系统设计、稳定性、吞吐、延迟）
- AI 高性能计算（GPU/异构计算、通信、调度、算子）
- AI 性能研发（把模型服务从"能跑"推进到"跑得快、跑得稳、跑得省"）
- 多模态推理引擎（文本/视觉/语音多模态推理场景）
