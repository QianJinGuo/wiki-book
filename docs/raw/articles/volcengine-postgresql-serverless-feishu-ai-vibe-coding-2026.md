---
source: wechat
source_url: https://mp.weixin.qq.com/s/wCVTJmYEz-H-4XiP-KgOSQ
ingested: 2026-07-23
feed_name: 字节跳动技术团队
wechat_mp_fakeid: MP_WXS_3253632141
source_published: 2026-07-14
sha256: 2dca273ad99c9789349efe4fcf9cd4b73154f0f4ba2b668aca50a3b061df8cee
---

# 想到即建、不用即停 —— 火山 PostgreSQL 助力飞书妙搭的 AI 效率革新

** “我的 APP 已经通过 AI 开发好了，怎么才能快速上生产？”  ** ——这是许多 Vibe Coding 用户感受到最真实的体验断点。当 AI 把“代码生产”的时间压缩到秒级，而“结果落地”却卡在传统数据库近 10 分钟的初始化过程中，Vibe Coding 的丝滑体验就会在此刻断崖式下跌。

火山云数据库 PostgreSQL Serverless 版的接入，为这些问题提供了新的解决思路。 自上线以来，火山云数据库 PostgreSQL Serverless 版 对比传统数据库，将实例创建速度压缩至  ** 10s  ** ，  ** 提速  ** ** 40 倍  ** ，分支创删能力  ** 提速 200 倍  ** ，非活跃实例自动 Scale-to-Zero ，  ** 综合成本降低 99.99%  ** ，支持百万级规模实例的企业级管理，数据库第一次跟上了 AI 生成代码的速度。

** 当 Vibe Coding 秒级写码，数据库却在拖后腿  **

** 「飞书妙搭」  ** 是飞书开发套件旗下的 AI 原生系统搭建平台。用户通过自然语言描述需求，妙搭就能自动生成完整应用——前端界面、后端逻辑、数据库结构，为用户带来全栈式的体验。

在 Vibe Coding 海量用户的使用下，妙搭的应用呈现出典型 AI 时代场景业务的特殊性：

* ** 应用形态跨度大：  ** 既支持搭建长期运行的业务系统、管理后台和复杂工作流，也覆盖活动公告、临时验证页、轻量落地页等短周期场景；

* ** 项目规模大、迭代快：  ** 大量项目从想法验证到正式上线持续产生和演进，要求底层能力具备规模化供给、自动化运维和低门槛接入；

* ** 访问负载峰谷明显：  ** 不同项目、不同阶段的访问量差异较大，平台需要支持按需弹性、自动休眠与快速唤醒，在用户体验、稳定性和成本之间取得平衡。

这种模式下，传统数据库暴露出多种问题：

* ** 创建慢：  ** 创建实例需要填写版本、规格、网络等内容，创建耗时 5～10 分钟，与秒级响应相差 100+倍，打断“对话即开发”的心流；

* ** 价格高：  ** 365×24 全时段计费，闲置资源持续收费，资源成本浪费高达 90%；

* ** 难恢复：  ** 数据恢复需要小时级，恢复时间点难定义，开发者与 Agent 无法大胆试错。

妙搭对数据库的期许，用一句话概括：

数据库不该再是一个需要手工准备的基础设施，而应该成为一种随应用一起生成、一起伸缩、一起演化的服务。

** 不是「Serverless 化改造」，而是为 AI 重造的数据库  **

当前，Vibe Coding 通过火山云数据库 PostgreSQL Serverless 版创建的数据库实例已突破百万，平台支持上万活跃实例的并发操作稳定运行。这意味着 Vibe Coding 的数据底座，从“基础验证可测试”真正迈向了  ** “规模化高可用”  ** 的范畴。

** 火山云数据库 PostgreSQL Serverless 版并非传统 RDS 的“Serverless 化改造”，而是从架构底层为 AI 时代重新设计的数据库服务。  **

图：火山云数据库 PostgreSQL Serverless 示意图

它的几大特性，完美解决 Vibe Coding 用户遭遇的问题：

** Serverless ——开发成本降低 90%  **

计算资源按需伸缩，无请求时 Scale to Zero。相比传统 数据库，  ** 综合成本降低 90%，节省上亿数据库成本。  ** 非活跃项目自动释放资源，无需手动清理。

** Data as Git ——任意开发，允许试错  **

一个代码分支对应一个数据库分支，  ** 秒级创建/删除  ** ，对比传统方案提升近  ** 200 倍  ** ，支持 Schema Diff 对比、Schema Merge 安全合并、Time Travel  ** ≤ 1 秒回退  ** 。

** AI Function —— 多模数据，SQL 搞定  **

支持向量、图、文本 多模态数据检索，一条 SQL 即可进行智能数据分析、语义理解、趋势预测。Agent 接入周期从 2～4 周降至  ** 5 分钟  ** 。

** 企业级管理 ——百万实例稳定运行  **

百万 Vibe Coding 项目的数据高可用管理与恢复。支持上万项目的并发请求，将数据库的企业级管理做到极致。

** 接入效果：从对话到应用，全链路秒级  **

当火山云数据库 PostgreSQL Serverless 版接入妙搭后，Vibe Coding 的体验发生了质变：

** 秒级创建，心流不断  **

** 用户：  ** "帮我做一个客户管理系统"

** 云数据库 PostgreSQL Serverless 版：  ** AI 生成代码的同时，后台秒级创建独立数据库分支。从对话到可运行应用，全链路秒级交付。

** 大胆试错，一秒回退  **

** 用户：  ** "把订单表拆成三张子表试试"

** 云数据库 PostgreSQL Serverless 版：  ** 子分支上操作，主分支不受影响。不满意？Time Travel 一秒回退。Schema Diff 精确展示变更，Schema Merge 安全合并确认的改动。

** 数据分析，开箱即用  **

** 用户：  ** "分析一下最近的销售趋势"

** 云数据库 PostgreSQL Serverless 版：  ** ai_query 一条 SQL 调用大模型分析原始数据，清扫复杂数据处理逻辑。

** 手把手实操：误删生产数据？  ** ** Data as Git  ** ** 帮你搞定！  **

在和 Agent 对话中，总会“一不小心”，将数据库搞坏了，数据搞丢了。火山云数据库 PostgreSQL Serverless 版提供 Data as Git 的能力，如果出现错误，支持从原有的数据版本上，秒级创建一个新的数据库分支来恢复历史数据，配合Agent 的快速验证与开发。

图：Data as Git 分支管理模型示意

下面用一个小 demo，亲身体验火山云数据库 PostgreSQL Serverless 版 如何一秒帮你恢复数据。

* ** Step1：填写你的数据库信息  **

    """场景：误删表的某一列后，通过分支能力极速恢复预装依赖pip install volcenginesdkcore volcenginesdkaidap psycopg2-binary"""import volcenginesdkcoreimport volcenginesdkaidapfrom volcenginesdkaidap import (    CreateBranchRequest, DeleteBranchRequest,    DescribeDBAccountConnectionRequest, DescribeComputesRequest,    BranchSettingsForCreateBranchInput)import psycopg2import time# ========== 配置（请填入你的信息） ==========configuration = volcenginesdkcore.Configuration()configuration.ak = "Your AK"# 替换为你的火山引擎 Access Keyconfiguration.sk = "Your SK"# 替换为你的火山引擎 Secret Keyconfiguration.region = "cn-beijing"configuration.host = "aidap.cn-beijing.volcengineapi.com"configuration.client_side_validation = Truevolcenginesdkcore.Configuration.set_default(configuration)api = volcenginesdkaidap.AIDAPApi()WORKSPACE_ID = "Your workspace ID"# 替换为你的 Workspace IDMAIN_BRANCH_ID = "Your main branch ID"# 替换为你的主分支 IDDATABASE_NAME = "aidb"# 默认数据库名ACCOUNT_NAME = "user_admin"# 默认账号名# ========== 获取信息 ==========defget_compute_id(branch_id):    max_retries = 30    retry_interval = 5for i inrange(max_retries):        resp = api.describe_computes(DescribeComputesRequest(            workspace_id=WORKSPACE_ID,            branch_id=branch_id,        ))if resp.computes andlen(resp.computes) > 0:return resp.computes[0].compute_id        print(f"  ⏳ 等待 compute 就绪... ({i+1}/{max_retries})")        time.sleep(retry_interval)raise Exception(f"等待 compute 就绪超时，分支 {branch_id} 没有可用的 compute")defget_connection_url(branch_id):    compute_id = get_compute_id(branch_id)    resp = api.describe_db_account_connection(DescribeDBAccountConnectionRequest(        workspace_id=WORKSPACE_ID,        branch_id=branch_id,        compute_id=compute_id,        account_name=ACCOUNT_NAME,        database_name=DATABASE_NAME,    ))    connection_url = resp.connection_url.strip()if connection_url.startswith("psql "):        connection_url = connection_url[5:].strip()if connection_url.startswith("'") and connection_url.endswith("'"):        connection_url = connection_url[1:-1]return connection_url# main 分支连接串PG_CONN = get_connection_url(MAIN_BRANCH_ID)

* ** Step2：模拟生产数据写入  **

    # ========== Step 2: 在 main 分支建表并写入数据 ==========print("""╔═══════════════════════════════════════════════════════╗║  Step 2: 在 main 分支创建表并写入 5 行数据                ║╚═══════════════════════════════════════════════════════╝""")  
    conn = psycopg2.connect(PG_CONN)conn.autocommit = Truecur = conn.cursor()  
    cur.execute("""    CREATE TABLE IF NOT EXISTS employees (        id SERIAL PRIMARY KEY,        name TEXT NOT NULL,        department TEXT NOT NULL,        salary INT NOT NULL,        email TEXT NOT NULL    )""")  
    cur.execute("""    INSERT INTO employees (name, department, salary, email) VALUES    ('Alice', 'Engineering', 25000, 'alice@example.com'),    ('Bob', 'Product', 22000, 'bob@example.com'),    ('Charlie', 'Design', 20000, 'charlie@example.com'),    ('Diana', 'Marketing', 23000, 'diana@example.com'),    ('Edward', 'Operations', 21000, 'edward@example.com')    ON CONFLICT DO NOTHING""")  
    cur.execute("SELECT * FROM employees")rows = cur.fetchall()print("  ✅ 表创建成功，当前数据：")print(f"  {'id':<4}{'name':<6}{'department':<8}{'salary':<8}{'email'}")print(f"  {'-'*50}")for row in rows:    print(f"  {row[0]:<4}{row[1]:<6}{row[2]:<8}{row[3]:<8}{row[4]}")  
    cur.close()conn.close()  

* ** Step3：模拟误操作  **

    # ========== Step 3: 创建 dev 分支，误删 email 列 ==========print("""╔═══════════════════════════════════════════════════════╗║  Step 3: 创建 dev 分支，执行删除列操作（模拟误操作）        ║╚═══════════════════════════════════════════════════════╝""")# 从 main 创建 dev 分支resp = api.create_branch(CreateBranchRequest(    workspace_id=WORKSPACE_ID,    branch_settings=BranchSettingsForCreateBranchInput(        name="dev",        parent_id=MAIN_BRANCH_ID,    ),))dev_branch_id = resp.branch_idprint(f"  📸 dev 分支已创建: {dev_branch_id}")# 连接 dev 分支，执行误操作：删除 email 列PG_CONN_DEV = get_connection_url(dev_branch_id)conn_dev = psycopg2.connect(PG_CONN_DEV)conn_dev.autocommit = Truecur_dev = conn_dev.cursor()cur_dev.execute("ALTER TABLE employees DROP COLUMN email")print("  ⚠️  执行了: ALTER TABLE employees DROP COLUMN email")cur_dev.execute("SELECT * FROM employees")rows = cur_dev.fetchall()print("\n  dev 分支数据（email 列已丢失）：")print(f"  {'id':<4}{'name':<6}{'department':<8}{'salary'}")print(f"  {'-'*35}")for row in rows:    print(f"  {row[0]:<4}{row[1]:<6}{row[2]:<8}{row[3]}")print("\n  ❌ 糟糕！email 列被误删了，数据无法恢复...")cur_dev.close()conn_dev.close()

* ** Step4：秒级恢复完整数据！  **

    # ========== Step 4: 从 main 重新拉出 dev2 分支，数据完好 ==========print("""╔═══════════════════════════════════════════════════════╗║  Step 4: 从 main 重新创建 dev2 分支，数据完好无损         ║╚═══════════════════════════════════════════════════════╝""")# 从 main 创建 dev2 分支（main 不受 dev 的误操作影响）resp2 = api.create_branch(CreateBranchRequest(    workspace_id=WORKSPACE_ID,    branch_settings=BranchSettingsForCreateBranchInput(        name="dev2",        parent_id=MAIN_BRANCH_ID,    ),))dev2_branch_id = resp2.branch_idprint(f"  📸 dev2 分支已创建: {dev2_branch_id}")# 连接 dev2 分支，验证数据完整PG_CONN_DEV2 = get_connection_url(dev2_branch_id)conn_dev2 = psycopg2.connect(PG_CONN_DEV2)conn_dev2.autocommit = Truecur_dev2 = conn_dev2.cursor()cur_dev2.execute("SELECT * FROM employees")rows = cur_dev2.fetchall()print("\n  ✅ dev2 分支数据（完好无损，email 列仍在）：")print(f"  {'id':<4}{'name':<6}{'department':<8}{'salary':<8}{'email'}")print(f"  {'-'*50}")for row in rows:    print(f"  {row[0]:<4}{row[1]:<6}{row[2]:<8}{row[3]:<8}{row[4]}")cur_dev2.close()conn_dev2.close()

火山云数据库 PostgreSQL Serverless 版 的 Data as Git 的能力，为你与 Agent 都提供了一套更加完整的开发链路，真正实现了数据结构可以随业务任意改，数据丢失也可快速恢复。

** 数据库的未来：与应用一起生长的数据底座  **

飞书妙搭为编程新手 & 项目专家解决“应用怎么更快做出来 & 怎么做的更好”，火山云数据库 PostgreSQL Serverless 版配合解决了 “应用做出来之后，数据库的能力与速度如何能跟上 AI 的迭代步伐”。未来，火山云数据库 PostgreSQL Serverless 版将支持  ** 千万级实例规模，更高性能的向量检索、更智能的 AI 分析（NL2Everything 覆盖 90%+ 操作）、更极致的弹性体验。  ** 让数据库从“需要手工准备的基础设施”，变成“随应用一起生长的数据底座”。
