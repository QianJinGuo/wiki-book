---
source: wechat
source_url: https://mp.weixin.qq.com/s/7JiW6lUtEPvDiTBtVrqMxg
ingested: 2026-07-27
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-07-26
sha256: b2ed8d810ee016fd52422b1c839700951d8f87ae9788e89f62dcf12f29b734f5
---

source: wechat
source_url: https://mp.weixin.qq.com/s/7JiW6lUtEPvDiTBtVrqMxg
ingested: 2026-07-27
source_published: 2026年7月26日 11:00
---

# Python 3.15 Beta 实测：这几个改动我会立刻用起来

Python 3.15 正式版定在 2026 年 10 月 1 日，beta 1 已经发布，特性集也基本锁定了。

我把 beta 装起来，顺手拿自己的几个项目过了一遍。跑完以后，真正让我停下来多看两眼的，并不是那些“版本更新清单里看着很厉害”的功能，而是几处很具体的变化：有的能把散落在函数里的 import 收回来，有的终于替掉了写了十年的土办法，还有一个能直接 attach 到正在发疯的生产进程。

下面这 6 个改动，我按“会不会真的塞进项目里”来排，不按 release notes 的顺序排。

## 01`lazy import` — 以后不必再把 import 藏进函数里了

这是 Python 3.15 里，我最想先拿到现有项目里试的一项。

### 我为什么在意它

写过稍微复杂一点的 CLI 工具，大概率都遇到过这种场面：

入口文件 import 了一个框架，框架又拖进 6 个工具模块，每个模块再拽进十几个依赖。用户只是敲了一句 `--help`，什么业务都还没跑，先原地等了 2 秒。

以前最常见的处理方式，是把 import 往函数体里塞：
    
    
    def export_report():  
        import pandas as pd  # 2 秒的启动惩罚延迟到这里  
        return pd.DataFrame(...)  
      
    def start_server():  
        # 纯服务模式，pandas 永远用不到——但 import 还是被执行了  
        ...  
    

这招确实管用，但代码会慢慢变得有点别扭。

import 开始散落在各个函数里。三个月后再回头看，你很难判断它到底是刻意做的性能优化，还是某个人顺手写在了那里。再碰上循环依赖、类型检查和自动补全，维护成本会继续往上叠。

### 3.15 的写法
    
    
    lazy import json  
    lazy import pandas as pd  
    lazy from pathlib import Path  
      
    print("Starting up...")  # 立刻打印，模块还没加载  
      
    data = json.loads('{"name": "Yang"}')  # json 在这里才真正 import  
    path = Path(".")                        # pathlib 在这里才真正 import  
    

`lazy` 是软关键字，只在 import 语句里生效，不影响你继续用 `lazy` 做变量名。

它背后的逻辑也不复杂：Python 先创建一个代理对象，真正的 import 延迟到**第一次访问被导入名字** 时再发生。

这件事看起来只是多了一个关键字，实际解决的是一个很老的工程问题：**既想保留清晰的模块依赖，又不想为暂时用不到的模块支付启动成本。**

###  放到项目里怎么用

CLI 工具是最直接的场景：
    
    
    lazy import pandas as pd  
    lazy from myapp.reports import build_pdf  
      
    def main(command: str):  
        if command == "serve":  
            start_server()       # 不走 pandas，不触发 import  
        elif command == "export":  
            df = pd.DataFrame(load_data())  # 这时才加载 pandas  
            build_pdf(df)  
    

如果要批量控制，3.15 还提供了三个全局开关。比如 staging 环境先全部打开，production 暂时不动：

  * `-X lazy_imports` 命令行参数
  * `PYTHON_LAZY_IMPORTS` 环境变量
  * `sys.set_lazy_imports()` 运行时开关

### 这里别一上来就全开

真正要小心的是 import side effect。

有些模块在 import 时会连接数据库、注册 hook、加载插件，甚至悄悄修改全局状态。这类代码一旦被延迟，问题未必出在启动阶段，而可能拖到某条业务路径第一次访问模块时才爆出来，排查反而更麻烦。

所以我的做法不会是“全项目一键 lazy”，而是先从显式 `lazy import` 开始，只标记那些确定没有副作用、又确实拖慢启动的模块。

小脚本未必能感受到多少收益。到了 AI 技术栈、Web 框架或依赖树又深又宽的项目里，它就不只是语法上的清爽了。

* * *

## 02`frozendict` + `sentinel` — 两个写了十年的 workaround，终于能删了

我把这两个改动放在一起，是因为它们带来的感受非常像：

不是“Python 又发明了什么新概念”，而是社区用 hack 撑了很多年的东西，终于有了一个能直接写进标准代码的版本。

### `frozendict`

不可变字典这个需求，Python 生态已经反复造了很多遍。

现在的项目通常有三种处理方式：

  1. 引入第三方 `frozendict`；
  2. 用 `MappingProxyType` 绕一层；
  3. 在代码评审里反复强调：“这个 dict 不要改。”

前两种不算优雅，最后一种基本等于许愿。

Python 3.15 直接给了内置类型：
    
    
    config = frozendict(  
        host="localhost",  
        port=2077,  
        debug=False,  
    )  
      
    config["host"]      # 'localhost'  
    config["debug"] = True# TypeError: 'frozendict' object does not support item assignment  
    hash(config)             # 可用，因为不可变  
    

我最先会考虑把它放到这几个位置：

  * **配置常量** ：避免某段代码顺手修改全局配置；
  * **缓存 key** ：参数组合需要作为字典 key 时，可以直接哈希；
  * **函数默认参数** ：少写一层 `None` 判断和临时字典初始化。


    
    
    DEFAULT_SETTINGS = frozendict(debug=False, retries=3, timeout=30)  
      
    def connect(**overrides):  
        settings = dict(DEFAULT_SETTINGS)  # 明确复制后再修改  
        settings.update(overrides)  
        ...  
    

这里真正有价值的不是“少装一个包”，而是意图终于能直接写在类型里。

看到 `frozendict`，后面接手代码的人不需要读注释，也知道这份配置不是让你原地改的。

### `sentinel`

另一个熟悉得不能再熟悉的写法是：
    
    
    MISSING = object()  # 每个项目里至少出现一次  
      
    def get_value(key, default=MISSING):  
        value = read_from_cache(key)  
        if value is MISSING:  
            return default  
        return value  
    

不能直接用 `None`，因为 `None` 本身可能就是用户存进去的合法值。于是大家用 `object()` 造一个绝对唯一的占位值。

逻辑没有问题，体验一直很糙。

它打印出来是 `<object object at 0x7f8e3c001230>`，不自解释，类型检查也很难从中得到多少信息。项目里一多，还会出现 `MISSING`、`UNSET`、`NOT_PROVIDED` 各自造一遍的情况。

3.15 的 `sentinel` 把这件事收进了语言本身：
    
    
    NOT_SET = sentinel("NOT_SET")  
      
    def get_setting(name: str, default=NOT_SET):  
        value = read_from_env(name)  
        return default if value is NOT_SET else value  
    
    
    
    >>> NOT_SET  
    NOT_SET  
    

打印结果干净，类型标注更友好，序列化和 pickle 支持也比临时造出来的 `object()` 完整。

它会出现在很多并不起眼、但非常常见的位置：

  * API 参数区分“没传”和“明确传了 `None`”；
  * 判断缓存未命中；
  * ORM 字段默认值；
  * 配置合并；
  * 数据清洗流程里的缺失状态。

这类功能不会让人第一眼觉得“Python 变强了”，却很容易让一批小而烦的代码从项目里消失。

* * *

## 03`profiling.sampling` — 进程已经慢了，再去问它现在在干什么

`cProfile` 很精确。它会追踪每一次函数调用和耗时。

问题也正出在这里：开销太大，生产环境里基本不可能一直挂着。可线上性能问题最麻烦的地方在于，它通常不会提前通知你。

进程已经跑起来了，真实流量已经进来了，某个 worker 突然变慢。你这时再重启服务、加 profiling 代码，刚才那个异常状态很可能已经没了。

Python 3.15 新增的 `profiling.sampling`，代号 Tachyon，解决的就是这个时间差。

它是统计采样 profiler：周期性抓取堆栈快照，用采样结果估算时间分布，而不是追踪每一次调用。精度会低一些，但开销也低得多。

### 三种调用方式

跑一个新进程：
    
    
    python -m profiling.sampling run app.py  
    

直接生成火焰图：
    
    
    python -m profiling.sampling run --flamegraph -o profile.html app.py  
    

attach 到一个已经在运行的进程：
    
    
    python -m profiling.sampling attach 12345  
    

对我来说，第三种才是这项功能真正有工程价值的地方。

它相当于让标准库第一次能比较自然地回答这个问题：

> 这个 Python 进程现在到底在忙什么？

不用提前埋点，不用为了 profiling 重启服务，也不用先引入一整套外部工具链。

支持的采样模式包括 wall-clock time、CPU time、GIL 持有时间、异常耗时、async 感知和 opcode 级别。它和 `cProfile` 不是互相替代，而是对应两个完全不同的排障时机。

### 可以立刻怎么试

假设你有一个正在运行的 FastAPI 或 Flask 应用：
    
    
    pip install python-dev  # 3.15 beta  
      
    # 找到进程 PID  
    ps aux | grep uvicorn  
      
    # attach 采样 30 秒并生成火焰图  
    python -m profiling.sampling attach --duration 30 12345 --flamegraph -o hot.html  
    

这不是每天都会打开的工具，但真碰到线上进程行为诡异时，它可能比一堆“理论上应该有用”的新语法更值钱。

* * *

## 04JIT 提速 — 先别兴奋，拿自己的负载跑一遍再说

Python 3.13 刚引入 JIT 时，实际提速不算明显。很多人的反应大概都是：“知道了，继续写代码。”

到了 3.15，数字终于开始像一项能进入工程评估的改动。

官方文档给出的结果是：x86-64 Linux 上几何平均提升 **8–9%** ，AArch64 macOS 上提升 **12–13%** ，比较基准是 tail-calling interpreter。

这当然不是“Python 一夜之间追上 Rust”。

但换个角度看，它是一种**不改业务代码就可能拿到的性能收益** 。单个脚本里不一定惊艳，摊到大量任务、长时间运行和多实例部署上，就不能只当成一个小数点了。

### 要不要为 JIT 改写代码？

我的答案是：不要。

现在最值得做的只有一件事——把你自己的 CPU 密集负载拿到 3.15 上跑一遍。

比如纯 Python 的计算循环、数据处理、模型推理前后的预处理：
    
    
    python3.15 -m timeit -s "from myproject import heavy_compute" "heavy_compute(1000)"  
    

手头暂时没有合适项目，也可以先用 `pyperformance` 建一份基线：
    
    
    pip install pyperformance  
      
    pyperformance run --python=python3.15 -o py315.json  
    pyperformance compare py314.json py315.json --table  
    

JIT 背后也不是某个突然冒出来的奇招，而是一堆低层工程开始叠出结果：追踪前端重写、基础寄存器分配、更多优化 pass、机器码生成改进，以及 JIT 帧的 unwind 支持。

这类优化通常不会在某一个版本里突然封神，更像是连续几个版本一点点往上推。

所以我更关心的不是“3.15 到底快了百分之几”，而是现在把 benchmark baseline 建起来。以后 3.16、3.17 出来，换个解释器再跑一次，就知道自己的项目到底有没有持续吃到红利。

* * *

## 05推导式解包 — 是语法糖，但这次确实更顺眼

这个改动不大，几乎看一眼就知道怎么用。

以前展平嵌套列表，要写两个顺序有点反直觉的 `for`：
    
    
    groups = [["Yang", "Bob"], ["Cindy"], ["David", "Eve"]]  
      
    # 旧写法：两个 for 的顺序需要想一下  
    names = [name for group in groups for name in group]  
      
    # 3.15：直接表达“把每个 group 解包进来”  
    names = [*group for group in groups]  
    # ['Yang', 'Bob', 'Cindy', 'David', 'Eve']  
    

字典合并也一样：
    
    
    configs = [{"host": "localhost"}, {"port": 2077}, {"debug": False}]  
      
    config = {**c for c in configs}  
    # {'host': 'localhost', 'port': 2077, 'debug': False}  
    

集合去重合并：
    
    
    permissions = [{"read", "write"}, {"read", "delete"}]  
      
    all_perms = {*p for p in permissions}  
    # {'read', 'write', 'delete'}  
    

我喜欢它的原因很简单：读代码时少绕一下。

旧写法不是不能理解，但视线要在两个 `for` 之间倒一次顺序。新写法更接近“把这些东西摊开”的直觉。

不过这类语法一旦遇到喜欢写一行神仙代码的人，很快又会变成另一种阅读负担。

我的边界也很简单：如果解包后的推导式一行已经超过 60 个字符，或者同时混进条件判断、转换和多层循环，就老老实实拆回普通 `for`。语法糖是为了少想一步，不是为了展示手速。

* * *

## 06几个不需要背下来，但会慢慢省事的改进

剩下这些变化单独看都不算大，也未必值得专门改一次项目。

但它们会出现在日常开发的边边角角里，过一段时间再回头看，可能会发现原来那批烦人的小问题已经少了不少。

### UTF-8 终于成为默认编码

`open("users.txt")` 不再跟着系统 locale 走，也就少了 Windows 环境下被 CP932 之类默认编码坑到的经典场面。

生产代码里继续显式写 `encoding="utf-8"` 依然是好习惯。不是因为 Python 默认值不可信，而是文件格式本身就应该在代码里说清楚。

只是从 3.15 开始，即使漏写了，默认行为终于更接近 Web、JSON 和今天真实项目的使用习惯。

如果确实要按系统 locale 读取旧文件：
    
    
    open("legacy.txt", encoding="locale")  # 3.15 新增的 locale 别名  
    

也可以通过 `PYTHONUTF8=0` 或 `-X utf8=0` 关闭 UTF-8 mode。

### 错误提示继续变聪明

跨语言写代码时，手指往往比脑子更顽固。

今天写 JavaScript，明天回 Python，顺手就可能敲出：
    
    
    names = ["Charlie", "Warren"]  
    names.push("Yang")              # AttributeError: Did you mean '.append'?  
      
    "Yang".toUpperCase()            # AttributeError: Did you mean '.upper'?  
    

这种错误当然不难排查，但如果解释器能直接指出你大概率想写什么，调试过程就少一次没必要的上下文切换。

它不是值得升级版本的理由，却是每天都可能享受到的改进。

### 类型系统继续补工程边界

`TypedDict` 新增了：

  * `closed=True`：禁止额外 key；
  * `extra_items=float`：允许额外 key，但限制它们的值类型。

做严格 JSON Schema 建模、配置校验或库接口设计时，这些能力很实用。

`TypeForm`（PEP 747）则用于标注类型表达式本身。日常脚本基本不用关心，写库、框架和类型工具的人会更有感觉。

### 3.14 的增量 GC 被撤回了

Python 3.14 引入增量 GC，是为了降低停顿时间。但用户反馈里出现了比较明显的内存增长，3.15 又退回了原来的代际 GC。

这件事本身也挺有 Python 的风格：不是所有“理论上更先进”的改动都要硬撑下去。真实负载反馈不理想，就撤。

如果你的生产环境已经跑过 3.14，而且观察到过异常的内存占用，升级 3.15 后值得专门对比一次。

* * *

## 07一张表：不同项目最值得先看什么

改动| CLI 工具| Web 应用| 数据/ML| 库/框架  
---|---|---|---|---  
`lazy import`| ★★★| ★★★| ★★| ★  
`frozendict`| ★| ★| ★★| ★★★  
`sentinel`| ★| ★| ★| ★★★  
`profiling.sampling`| ★| ★★★| ★★| ★  
推导式解包| ★★| ★★| ★★★| ★  
JIT 提速| ★| ★| ★★★| ★  
UTF-8 默认| ★★| ★★| ★★| ★★  
  
如果只让我从这次更新里挑三个：

  * 依赖多、启动慢的项目，先测 `lazy import`；
  * 有线上服务的项目，先把 `profiling.sampling` 的使用方式记下来；
  * 写库和框架的人，可以开始清理自己造的 `frozendict` 和 sentinel 替代品。

至于 JIT，不用围着官方数字兴奋，也别因为提升看起来不夸张就直接忽略。让你自己的 benchmark 说话，比任何版本发布文章都可靠。

如果项目还停在 Python 3.12 或更早版本，我不会只为了其中一个功能立刻升级。更稳妥的做法，是先在 CI 里加一条 3.15 beta 测试，看看依赖、类型检查和现有测试有没有问题，等正式版发布后再决定切换节奏。

已经在 3.13 或 3.14 的项目，迁移成本通常低一些，beta 阶段就可以提前测。

Python 3.15 正式版计划在 2026 年 10 月 1 日发布。

release notes 可以告诉你 Python 加了什么，但只有把自己的项目放上去跑一遍，你才会知道这些改动到底和你有没有关系。