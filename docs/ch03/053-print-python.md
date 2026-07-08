# 日志别再print了！深入对比Python三大日志方案

## Ch03.053 日志别再print了！深入对比Python三大日志方案

> 📊 Level ⭐⭐ | 19.9KB | `entities/日志别再print了深入对比python三大日志方案.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/日志别再print了深入对比python三大日志方案.md)

## 标准库 logging：什么都能做，但什么都不好做
标准库 logging 是 Python 自带的"瑞士军刀"。先看一段最典型的配置代码：
```python
import logging

# 创建 logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# 创建文件 handler
handler = logging.FileHandler("app.log")
formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# 使用
def process_order(order_id):
    logger.info("Processing order %s", order_id)
    try:
        do_work(order_id)
    except Exception:
        logger.exception("Order failed")
```
这段代码已经算"规范"了，但问题在于：
**1. 配置太啰嗦**
每个新项目都要复制粘贴这10行模板，还要决定用 `dictConfig` 还是 `basicConfig`。团队里5个人，能写出5种风格。
**2. 上下文传递极其痛苦**
想给每条日志加上 `request_id`？要么用 `LoggerAdapter`，要么用自定义 Filter，代码量直接翻倍。为了一行日志的上下文，写50行适配器代码并不罕见。
**3. 异常日志容易出错**
`logger.exception` 必须放在 `except` 块内，新手经常忘记传 `exc_info=True`，导致异常堆栈丢失。
**4. 结构化日志需要手动拼接**
想把日志输出成 JSON 送 ELK？你得自己组装字典，还要处理嵌套字段。
> ⚠️ **注意：logging 模块的 `%` 风格格式化是惰性求值的，但如果你写成 `logger.info(f"Processing {order_id}")`，字符串会在调用前就拼接，哪怕日志级别不输出也会造成性能损耗。很多人不知道这个差异。**
**标准库 logging 的定位**：适合大型企业系统、有严格合规要求的场景、或者你无法引入第三方依赖的环境。

## Loguru：开发者体验的极致
Loguru 是"开发者优先"的日志库，用最少的代码做最多的事。第一次用 Loguru 是在一个数据清洗脚本里，原本只是想"试一下"，结果那个脚本到现在还在线上跑，日志部分一行没改过。

### 零配置起步
```python
from loguru import logger
logger.info("Service started")
```
就这么简单。输出自动包含时间戳、日志级别、文件路径、行号、消息。颜色也是彩色的，开发时一眼就能区分级别。

### 文件轮转，一行搞定
```python
logger.add(
    "logs/app.log",
    rotation="10 MB",     # 超过10MB自动轮转
    retention="7 days",   # 保留7天
    level="INFO",
    format="{time} | {level} | {message}"
)
```
标准库要做文件轮转，需要 `RotatingFileHandler`、`TimedRotatingFileHandler`，还要配置备份数量。Loguru 直接把配置参数化，读起来像自然语言。

### 异常处理，优雅得不像话
```python
try:
    risky_call()
except Exception:
    logger.exception("Risky call failed")  # 自动捕获完整堆栈
```
不需要传 `exc_info`，不需要手动格式化，堆栈信息完整且美观。

### 上下文绑定，告别参数传递
```python

# 绑定 request_id
request_logger = logger.bind(request_id="req_123")
request_logger.info("Incoming request")  # 自动包含 request_id
```
在 FastAPI 中的典型用法：
```python
from fastapi import FastAPI, Request
from loguru import logger
import uuid
app = FastAPI()
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.logger = logger.bind(request_id=request_id)
    response = await call_next(request)
    return response
@app.get("/health")
async def health(request: Request):
    request.state.logger.info("Health check")  # 自动带 request_id
    return {"status": "ok"}
```
调试时，直接 `grep request_id` 就能把整个请求链路的日志拉出来，效率翻倍。

### 异步友好，无痛切换
```python
import asyncio
from loguru import logger
async def worker(name):
    logger.info("Worker started {}", name)
    await asyncio.sleep(1)
    logger.info("Worker finished {}", name)
async def main():
    await asyncio.gather(worker("A"), worker("B"))
asyncio.run(main())
```
输出顺序正确，不会出现日志交叉混乱的情况。

### 非阻塞日志（性能关键）
```python
logger.add(
    "logs/app.log",
    enqueue=True,     # 日志入队，后台线程写入
    rotation="50 MB",
    level="INFO"
)
```
在压测中，`enqueue=True` 能把日志带来的延迟波动降低60%以上。对于高 QPS 服务，这个特性是救命稻草。

### 结构化日志，一行切换
```python
logger.add(
    "logs/app.json",
    serialize=True,   # 输出 JSON 格式
    level="INFO"
)
logger.info("User login", user_id=42, source="web")

# 输出: {"time": "2026-03-21T10:00:00", "level": "INFO", "message": "User login", "user_id": 42, "source": "web"}
```
不需要手动构造字典，`serialize=True` 自动把额外参数转成 JSON 字段，完美对接 ELK、Loki 等日志系统。

### 生产环境最佳实践
```python
from loguru import logger
import sys
def setup_logging():

    # 移除默认的 stderr 输出
    logger.remove()

    # 控制台输出（开发环境）
    logger.add(
        sys.stdout,
        level="INFO",
        format="{time} | {level} | {message}"
    )

    # 文件输出（生产环境）
    logger.add(
        "logs/app.log",
        level="INFO",
        rotation="100 MB",
        retention="10 days",
        enqueue=True,
        compression="zip"    # 压缩旧日志
    )
```
整个配置函数不到15行，比 logging 的 `dictConfig` 清晰10倍。
**Loguru 的定位**：适合微服务、CLI 工具、数据管道、内部系统——任何你希望"日志不成为负担"的场景。

## Logfire：面向可观测性的新一代方案
如果说 logging 是工具，Loguru 是体验升级，那 Logfire 代表的是**范式转变**。
Logfire 不是简单的日志库，它是可观测性平台与代码的桥梁。它会自动捕获结构化数据，实时发送到 OpenTelemetry、Grafana、Datadog 等后端，并且与指标（metrics）和链路追踪（traces）自动关联。
想象这个场景：你的 API 突然错误率飙升。

- **用标准库**：你去服务器上 `grep ERROR`，再根据时间戳手动找关联
- **用 Loguru**：你打开日志文件，搜索关键字，看堆栈
- **用 Logfire**：你在 Dashboard 上看到错误率曲线，点击任意一个错误点，直接看到对应的日志、调用链路、数据库查询耗时、甚至当时的 CPU 和内存快照
Logfire 适合分布式系统、微服务架构、SRE 团队。如果你已经上了 Kubernetes，用了 Prometheus 和 Grafana，那 Logfire 就是填上"日志"这块拼图的最佳方案。

## 实战对比：三个场景，三种选择
### 场景1：一个简单的 cron 脚本
**需求**：每天凌晨跑一次数据同步，需要记录开始、结束、失败原因。
**选择**：Loguru
**理由**：一行配置，彩色输出，错误堆栈自动完整。不需要考虑性能，不需要轮转策略。
```python
from loguru import logger
logger.add("sync.log", rotation="30 days")
def main():
    logger.info("Sync started")
    try:
        do_sync()
    except Exception as e:
        logger.exception("Sync failed")
        raise
    logger.info("Sync completed")
if __name__ == "__main__":
    main()
```

### 场景2：一个高并发的 API 网关
**需求**：每秒处理 5000+ 请求，日志需要带 request_id，需要输出 JSON 格式给 ELK，不能影响延迟。
**选择**：Loguru + `enqueue=True`
**理由**：非阻塞队列保证性能，结构化输出方便检索，绑定 request_id 实现全链路追踪。
```python
logger.add(
    "api.log",
    enqueue=True,
    serialize=True,
    rotation="500 MB",
    retention="7 days"
)

# 中间件绑定 request_id
@app.middleware("http")
async def log_request(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    with logger.contextualize(request_id=request_id):
        response = await call_next(request)
        return response
```

### 场景3：一个金融级交易系统
**需求**：合规要求日志不可丢失，需要分级存储（审计日志单独加密），必须通过外部审计，依赖必须最小化。
**选择**：标准库 logging + 自定义 Handler
**理由**：稳定、无外部依赖、可精细控制每个环节。虽然配置繁琐，但这是合规的必要代价。

## 迁移指南：从 logging 到 Loguru
### 1. 替换调用
```python

# 之前
import logging
logger = logging.getLogger(__name__)
logger.info("Processing %s", order_id)

# 之后
from loguru import logger
logger.info("Processing {}", order_id)  # 注意格式变化
```

### 2. 桥接第三方库
有些库（如 `requests`、`urllib3`）使用标准库 logging，你可以拦截并转发到 Loguru：
```python
import logging
from loguru import logger
class InterceptHandler(logging.Handler):
    def emit(self, record):
        level = logger.level(record.levelname).name
        logger.log(level, record.getMessage())

# 全局拦截
logging.basicConfig(handlers=[InterceptHandler()], level=0)
```

### 3. 逐步替换
建议从边缘服务开始，验证稳定性后再逐步推广到核心系统。Loguru 和 logging 可以共存，不用一次性全部改完。

## 避坑指南
**坑1：忘记移除默认的 stderr 输出**
```python
logger.remove()  # 必须先调用，否则会输出两份
```
**坑2：在异步代码中用 `enqueue=False`**
如果异步任务很多，日志可能阻塞事件循环。记得加上 `enqueue=True`。
**坑3：敏感信息泄露**
结构化日志会自动记录额外参数，千万确认不要在参数里传密码、token。建议实现一个过滤器：
```python
def mask_secrets(record):
    if "password" in record["message"]:
        record["message"] = record["message"].replace(record["extra"].get("password", ""), "***")
    return True
logger.add("app.log", filter=mask_secrets)
```

## 核心回顾
| 方案 | 定位 | 适用场景 |
|------|------|----------|
| **标准库 logging** | 稳定、可控、零依赖 | 大型企业系统、合规要求严格、无法引入第三方依赖 |
| **Loguru** | 开发者体验极致、配置简洁 | 绝大多数 Python 项目、微服务、CLI 工具、数据管道 |
| **Logfire** | 面向可观测性、分布式云原生 | 分布式系统、微服务架构、SRE 团队 |
**选择的关键**：不是哪个最强大，而是哪个能让你和团队"不痛苦地写出好日志"。
---
> [!quote] **日志是系统留给你的遗书**
> 当事故发生时，它是唯一诚实的目击者。用了两年 Loguru，最深的感受不是它功能多强，而是它让我**愿意写日志了**。以前配置麻烦，上下文难传，异常堆栈不全，导致大家本能地逃避。现在一个 `logger.info` 就能带出所有上下文，线上问题排查时间从小时级降到分钟级。
>
> 好的工具能改变习惯，习惯最终变成文化。而好的日志文化，是凌晨2点还能睡个好觉的底气。

## 深度分析
**1. 日志方案的演进逻辑**
从 logging 到 Loguru 再到 Logfire，呈现出一条清晰的演进路径：*配置复杂度递减，智能化程度递增*。标准库 logging 本质上是让你描述"如何记录"，Loguru 让你描述"记录什么"，而 Logfire 直接对接可观测性基础设施，你只需要关心"何时记录"。这条演进线的背后是 Python 生态的成熟——当中间件、异步框架、分布式系统成为默认选项时，日志库必须从工具升级为平台。
**2. 性能与可观测性的张力**
高并发场景下，日志是少数几类需要严格控制延迟波动的 I/O 操作。`enqueue=True` 的本质是用异步换同步——日志写入从关键路径中剥离，但代价是进程崩溃时可能丢失最后几秒的日志。这在金融交易系统里是不可接受的，在高 QPS 的微服务里却是必要权衡。Logfire 通过实时流式传输试图解决这个问题，但引入了供应商锁定风险。性能与可观测性之间的取舍，最终取决于业务对数据完整性的要求程度。
**3. 上下文传递的设计哲学**
三种方案代表了三种不同的上下文传递思路：logging 用 `LoggerAdapter/Filter` 做依赖注入，Loguru 用 `.bind()` 做装饰式增强，Logfire 用 OpenTelemetry 的 baggage机制做分布式上下文传播。从耦合度看，logging 最松（可随时替换 handler），Loguru 次之（需要实例化绑定后的 logger），Logfire 最紧（强依赖 OTel 生态）。选择哪种，取决于你的系统是否已经活在可观测性平台之上。
**4. 结构化日志的代价**
JSON 格式日志是 ELK/Loki 的最佳拍档，但结构化带来的是可读性下降——`grep` 失效，必须用 `jq` 或专用查询语法。Loguru 的 `serialize=True` 把这个问题封装掉了，但开发者在调试时付出的代价是：本地 `tail -f` 看到的不再是友好的人类可读格式。这是一种权衡：生产环境的可搜索性 vs 开发环境的可读性。成熟的团队通常会配置双输出——本地 stdout 输出人类可读格式，远程输出 JSON 格式。

## 实践启示
**从 print 到 logger 的范式转换**
print 的问题不是它简单，而是它没有层级、没有格式契约、没有上下文概念。迁移到日志库的真正意义不在于"更高级的输出"，而在于建立一套团队共同遵守的日志契约。建议先用 Loguru 替换所有 print，让团队成员体验到零成本日志的愉悦感，再逐步引入结构化、日志级别、上下文绑定等进阶实践。
**日志分级是团队协作的基础**
日志级别（DEBUG/INFO/WARNING/ERROR）不仅是过滤手段，更是团队成员之间的通信协议。INFO 意味着"这个事件正常但值得观察"，ERROR 意味着"需要立即关注"。当团队形成一致的日志级别使用规范后，告警规则、值班流程、故障复盘都能建立在这套共同语言之上。建议在项目初期就用 .editorconfig 或 linter 固化日志级别使用规范。
**结构化日志是运维投资**
很多人觉得结构化日志"太麻烦"，但它的真正价值在于故障时能快速聚合、过滤、关联。request_id + timestamp + user_id 的组合，可以让一次故障的排查时间从"翻遍整个日志文件"缩短到"一个查询语句"。这是面向未来的投资——系统规模越大、用户越多，结构化日志的回报越高。
**日志安全是常被忽视的盲区**
结构化日志里传 password、token、email 等敏感信息，是非常常见的疏漏。Loguru 的 filter 机制提供了一种补救手段，但更根本的解法是在 logger.info() 调用处做参数审查，或者在框架层统一脱敏。建议把"日志参数审查"加入 code review checklist，形成团队共识。

## 相关实体

- [FastAPI APIRouter 路由组织最佳实践](../ch01/607-fastapi-apirouter.html)
- [Karpathy AutoResearch 在软件开发领域的应用](https://github.com/QianJinGuo/wiki/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [民生银行 CodeAgent 私域研发探索](ch03/045-agent.html)
- [Claude Code Hackathon 经验总结](ch03/075-claude-code.html)

---

