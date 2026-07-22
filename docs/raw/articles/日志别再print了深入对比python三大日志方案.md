---
title: 日志别再print了！深入对比Python三大日志方案
source_url: https://mp.weixin.qq.com/s/5Ca9BVTMWJZ0eeb1yWJhag
publish_date: 2026-05-10
tags: [wechat, article]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: fa90ccb83f1687e5210505efb208495692854dc7f02c6c7f7e373777d4252f2e
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/5Ca9BVTMWJZ0eeb1yWJhag
ingested: 2026-05-09
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-04-22
---
# 日志别再print了！深入对比Python三大日志方案
凌晨2点13分，生产环境突然告警。你打开终端，翻看日志，却发现一片混乱：有的日志带时间戳，有的没有；有的用  ` %s  ` 格式化，有的直接拼接字符串；异常堆栈七零八落，请求ID无法串联。那个瞬间，你恨不得把半年前的自己拽起来重写一遍日志代码。
如果你经历过这样的场景，今天这篇文章就是为你准备的。
我做了十年后端开发，从单体应用到微服务，从简单的cron脚本到高并发的API网关，日志系统重构过无数次。直到两年前遇到  ** Loguru  ** ，我才真正觉得“日志不该这么复杂”。
本文会带你深入对比Python三大日志方案：  ** 标准库logging  ** 、  ** Loguru  ** 和  ** 新一代的Logfire  ** ，通过真实案例告诉你——什么时候该用什么，以及如何写出“凌晨2点也能救你一命”的日志。
##  一、标准库logging
> 那个“什么都能做，但什么都不好做”的老朋友
先看一段最典型的logging配置代码：
    import logging  
    # 创建logger  
    logger = logging.getLogger(__name__)  
    logger.setLevel(logging.INFO)  
    # 创建文件handler  
    handler = logging.FileHandler("app.log")  
    formatter = logging.Formatter(  
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"  
    )  
    handler.setFormatter(formatter)  
    logger.addHandler(handler)  
    # 使用  
    def process_order(order_id):  
        logger.info("Processing order %s", order_id)  
        try:  
            do_work(order_id)  
        except Exception:  
            logger.exception("Order failed")  
这段代码已经算“规范”了，但问题在于：
** 1\. 配置太啰嗦  **
每个新项目都要复制粘贴这10行模板，还要决定用  ` dictConfig  ` 还是  ` basicConfig  ` 。团队里5个人，能写出5种风格。
** 2\. 上下文传递极其痛苦  **
想给每条日志加上  ` request_id  ` ？要么用  ` LoggerAdapter  ` ，要么用自定义Filter，代码量直接翻倍。我见过一个项目，为了一行日志的上下文，写了50行适配器代码。
** 3\. 异常日志容易出错  **
` logger.exception  ` 必须放在  ` except  ` 块内，新手经常忘记传  ` exc_info=True  ` ，导致异常堆栈丢失。
** 4\. 结构化日志需要手动拼接  **
想把日志输出成JSON送ELK？你得自己组装字典，还要处理嵌套字段。
> ⚠️  ** 注意：这里90%的人会踩坑  **
>  logging模块的  ` %  ` 风格格式化是惰性求值的，但如果你写成  ` logger.info(f"Processing {order_id}")  ` ，字符串会在调用前就拼接，哪怕日志级别不输出也会造成性能损耗。很多人不知道这个差异。
** 标准库logging的定位  ** ：
它是Python自带的“瑞士军刀”——什么都能做，但每件事都要你自己拧螺丝。适合大型企业系统、有严格合规要求的场景、或者你无法引入第三方依赖的环境。
##  二、Loguru
> 开发者体验的极致
我第一次用Loguru是在一个数据清洗脚本里。原本只是想“试一下”，结果那个脚本到现在还在线上跑，日志部分一行没改过。
###  1\. 零配置起步
    from loguru import logger  
    logger.info("Service started")  
就这么简单。输出自动包含时间戳、日志级别、文件路径、行号、消息。颜色也是彩色的，开发时一眼就能区分级别。
###  2\. 文件轮转，一行搞定
    logger.add(  
        "logs/app.log",  
        rotation="10 MB",      # 超过10MB自动轮转  
        retention="7 days",    # 保留7天  
        level="INFO",  
        format="{time} | {level} | {message}"  
    )  
这是我最喜欢的功能。标准库要做文件轮转，你需要  ` RotatingFileHandler  ` 、  ` TimedRotatingFileHandler  ` ，还要配置备份数量。Loguru直接把配置参数化，读起来像自然语言。
###  3\. 异常处理，优雅得不像话
    try:  
        risky_call()  
    except Exception:  
        logger.exception("Risky call failed")  # 自动捕获完整堆栈  
不需要传  ` exc_info  ` ，不需要手动格式化，堆栈信息完整且美观。
###  4\. 上下文绑定，告别参数传递
    # 绑定request_id  
    request_logger = logger.bind(request_id="req_123")  
    request_logger.info("Incoming request")  # 自动包含request_id  
在FastAPI中，我通常这样用：
    from fastapi import FastAPI, Request  
    from loguru import logger  
    import uuid  
    app = FastAPI()  
    @app.middleware("http")  
    asyncdef add_request_id(request: Request, call_next):  
        request_id = str(uuid.uuid4())  
        request.state.logger = logger.bind(request_id=request_id)  
        response = await call_next(request)  
        return response  
    @app.get("/health")  
    asyncdef health(request: Request):  
        request.state.logger.info("Health check")  # 自动带request_id  
        return {"status": "ok"}  
调试时，直接  ` grep request_id  ` 就能把整个请求链路的日志拉出来，效率翻倍。
###  5\. 异步友好，无痛切换
    import asyncio  
    from loguru import logger  
    async def worker(name):  
        logger.info("Worker started {}", name)  
        await asyncio.sleep(1)  
        logger.info("Worker finished {}", name)  
    async def main():  
        await asyncio.gather(worker("A"), worker("B"))  
    asyncio.run(main())  
输出顺序正确，不会出现日志交叉混乱的情况。
###  6\. 非阻塞日志（性能关键）
    logger.add(  
        "logs/app.log",  
        enqueue=True,      # 日志入队，后台线程写入  
        rotation="50 MB",  
        level="INFO"  
    )  
在压测中，  ` enqueue=True  ` 能把日志带来的延迟波动降低60%以上。对于高QPS的服务，这个特性是救命稻草。
###  7\. 结构化日志，一行切换
    logger.add(  
        "logs/app.json",  
        serialize=True,    # 输出JSON格式  
        level="INFO"  
    )  
    logger.info("User login", user_id=42, source="web")  
    # 输出: {"time": "2026-03-21T10:00:00", "level": "INFO", "message": "User login", "user_id": 42, "source": "web"}  
不需要手动构造字典，  ` serialize=True  ` 自动把额外参数转成JSON字段，完美对接ELK、Loki等日志系统。
###  8\. 生产环境最佳实践
    from loguru import logger  
    import sys  
    def setup_logging():  
        # 移除默认的stderr输出  
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
            compression="zip"   # 压缩旧日志  
        )  
整个配置函数不到15行，比logging的  ` dictConfig  ` 清晰10倍。
** Loguru的定位  ** ：
它是“开发者优先”的日志库，用最少的代码做最多的事。适合微服务、CLI工具、数据管道、内部系统——任何你希望“日志不成为负担”的场景。
##  三、Logfire
> 当日志遇见可观测性
如果说logging是工具，Loguru是体验升级，那Logfire代表的是  ** 范式转变  ** 。
Logfire不是简单的日志库，它是可观测性平台与代码的桥梁。它会自动捕获结构化数据，实时发送到OpenTelemetry、Grafana、Datadog等后端，并且与指标（metrics）和链路追踪（traces）自动关联。
想象这个场景：你的API突然错误率飙升。
* 用标准库：你去服务器上  ` grep ERROR  ` ，再根据时间戳手动找关联。
* 用Loguru：你打开日志文件，搜索关键字，看堆栈。
* 用Logfire：你在Dashboard上看到错误率曲线，点击任意一个错误点，直接看到对应的日志、调用链路、数据库查询耗时、甚至当时的CPU和内存快照。
Logfire适合分布式系统、微服务架构、SRE团队。如果你已经上了Kubernetes，用了Prometheus和Grafana，那Logfire就是填上“日志”这块拼图的最佳方案。
##  四、实战对比：三个场景，三种选择
###  场景1：一个简单的cron脚本
** 需求  ** ：每天凌晨跑一次数据同步，需要记录开始、结束、失败原因。
** 选择  ** ：Loguru
** 理由  ** ：一行配置，彩色输出，错误堆栈自动完整。不需要考虑性能，不需要轮转策略。
    from loguru import logger  
    logger.add("sync.log", rotation="30 days")  
    def main():  
        logger.info("Sync started")  
        try:  
            do_sync()  
        except Exception as e:  
            logger.exception("Sync failed")  
            raise  
        logger.info("Sync completed")  
    if __name__ == "__main__":  
        main()  
###  场景2：一个高并发的API网关
** 需求  ** ：每秒处理5000+请求，日志需要带request_id，需要输出JSON格式给ELK，不能影响延迟。
** 选择  ** ：Loguru +  ` enqueue=True  `
** 理由  ** ：非阻塞队列保证性能，结构化输出方便检索，绑定request_id实现全链路追踪。
    logger.add(  
        "api.log",  
        enqueue=True,  
        serialize=True,  
        rotation="500 MB",  
        retention="7 days"  
    )  
    # 中间件绑定request_id  
    @app.middleware("http")  
    asyncdef log_request(request: Request, call_next):  
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))  
        with logger.contextualize(request_id=request_id):  
            response = await call_next(request)  
            return response  
###  场景3：一个金融级交易系统
** 需求  ** ：合规要求日志不可丢失，需要分级存储（审计日志单独加密），必须通过外部审计，依赖必须最小化。
** 选择  ** ：标准库logging + 自定义Handler
** 理由  ** ：稳定、无外部依赖、可精细控制每个环节。虽然配置繁琐，但这是合规的必要代价。
##  五、迁移指南
> 从logging到Loguru
如果你决定切换，记住三个核心步骤：
###  1\. 替换调用
    # 之前  
    import logging  
    logger = logging.getLogger(__name__)  
    logger.info("Processing %s", order_id)  
    # 之后  
    from loguru import logger  
    logger.info("Processing {}", order_id)  # 注意格式变化  
###  2\. 桥接第三方库
有些库（如  ` requests  ` 、  ` urllib3  ` ）使用标准库logging，你可以拦截并转发到Loguru：
    import logging  
    from loguru import logger  
    class InterceptHandler(logging.Handler):  
        def emit(self, record):  
            level = logger.level(record.levelname).name  
            logger.log(level, record.getMessage())  
    # 全局拦截  
    logging.basicConfig(handlers=[InterceptHandler()], level=0)  
###  3\. 逐步替换
建议从边缘服务开始，验证稳定性后再逐步推广到核心系统。Loguru和logging可以共存，不用一次性全部改完。
##  六、避坑指南
** 坑1：忘记移除默认的stderr输出  **
    logger.remove()  # 必须先调用，否则会输出两份  
** 坑2：在异步代码中用  ` enqueue=False  ` **
如果异步任务很多，日志可能阻塞事件循环。记得加上  ` enqueue=True  ` 。
** 坑3：敏感信息泄露  **
结构化日志会自动记录额外参数，千万确认不要在参数里传密码、token。建议实现一个过滤器：
    def mask_secrets(record):  
        if "password" in record["message"]:  
            record["message"] = record["message"].replace(record["extra"].get("password", ""), "***")  
        return True  
    logger.add("app.log", filter=mask_secrets)  
##  写在最后
我常跟团队说：  ** 日志是系统留给你的遗书  ** 。当事故发生时，它是唯一诚实的目击者。
用了两年Loguru，我最深的感受不是它功能多强，而是它让我  ** 愿意写日志了  ** 。以前配置麻烦，上下文难传，异常堆栈不全，导致大家本能地逃避。现在一个  ` logger.info  ` 就能带出所有上下文，开发者在调试时主动加日志，线上问题排查时间从小时级降到分钟级。
工具只是工具，但好的工具能改变习惯，习惯最终变成文化。而好的日志文化，是凌晨2点还能睡个好觉的底气。
###  核心回顾
>   1. ** 标准库logging  ** ：稳定、可控、零依赖，适合大型企业系统
>   2. ** Loguru  ** ：开发者体验极致，配置简洁，适合绝大多数Python项目
>   3. ** Logfire  ** ：面向可观测性的新一代方案，适合分布式、云原生架构
>
** 选择的关键  ** ：不是哪个最强大，而是哪个能让你和团队“不痛苦地写出好日志”。
假设你现在要做一个日活100万的API服务，日志需要支持全链路追踪、实时告警、长期归档，你会选择哪套方案？如果选Loguru，你会如何设计它的配置来平衡性能和可观测性？评论区聊聊你的思路。
#####  🏴‍☠️宝藏级🏴‍☠️ 原创公众号『  ** 数据STUDIO  ** 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括  可戳  👉[ Python ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978822768771072&scene=173&from_msgid=2247519294&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ MySQL ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2023684574089658370&scene=173&from_msgid=2247519619&from_itemidx=2&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据分析 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978820940054530&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据可视化 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974991176839544834&scene=173&from_msgid=2247519244&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 机器学习与数据挖掘 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1963494160565354497&scene=173&from_msgid=2247512171&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 爬虫 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2318258648965644288&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** 等，从入门到进阶！
长按👇关注- 数据STUDIO -设为星标，干货速递