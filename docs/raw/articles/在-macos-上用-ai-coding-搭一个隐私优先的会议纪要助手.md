---
tags: [wechat, article, claude, openai]
title: "在 macOS 上用 AI Coding 搭一个隐私优先的会议纪要助手"
url: https://aws.amazon.com/cn/blogs/china/macos-ai-coding-assistant/
source: rss
feed_name: AWS China Blog
sha256: cc66fff70e15e6bc5478283074dc42e6bbdc8fc28e3aa117c249ffb06c9cd05f
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p>
  <!-- 摘要区 --></p> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：两行命令，一个晚上，把任意会议变成结构化纪要——全程只用你自己的 AWS 账号，不登录第三方、不往会议里塞 bot。</p> 
 <p>
  <!-- 目录区 --></p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
  <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
  <div style="line-height: 1.8;margin: 0;padding: 0"> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">01</span>
    <a style="color: #333;text-decoration: none" href="#section1">一、引言</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">02</span>
    <a style="color: #333;text-decoration: none" href="#section2">二、非侵入的音频采集</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">03</span>
    <a style="color: #333;text-decoration: none" href="#section3">三、会议纪要的云端生成</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">04</span>
    <a style="color: #333;text-decoration: none" href="#section4">四、这个架构为什么“刚刚好“</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">05</span>
    <a style="color: #333;text-decoration: none" href="#section5">五、安装与上手</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">06</span>
    <a style="color: #333;text-decoration: none" href="#section6">六、安静的会议搭子</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">07</span>
    <a style="color: #333;text-decoration: none" href="#section7">七、尾声：这东西是一个晚上写出来的</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">08</span>
    <a style="color: #333;text-decoration: none" href="#section8">八、相关链接</a>
   </div> 
  </div> 
 </div> 
 <div style="height: 50px"></div> 
 <!-- 横线 -->
 <p></p> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 10px 0;width: 100%;margin-bottom: 30px"> 
 <p>
  <!-- 正文 --></p> 
 <div style="height: 30px"></div> 
 <h2 id="section1">一、引言</h2> 
 <h3>1.1 一个很常见、但一直没人解决好的问题</h3> 
 <p style="color: #5f6368;font-size: 16px">每天在 Teams、Zoom、腾讯会议、飞书之间来回切，有个挺尴尬的现实：开会时很专注，散会后信息也跟着散了。谁负责什么、下一步是什么、deadline 是哪天——这些最关键的事，往往要等到群里有人问一句“今天纪要谁有?“，才发现其实没人记。跨国英文会议更是“隐形踩坑“。不同口音带来的理解偏差，会让你悄悄漏掉一些关键细节，而且更麻烦的是——你甚至不知道自己漏了。</p> 
 <p style="color: #5f6368;font-size: 16px">这件事本该交给工具。但真的用一圈现有方案，你会发现每条路都有点别扭：</p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">会议平台自带的 AI 功能最大的问题是割裂：能力被锁在各自平台里，不同会议不同体验，也很难保证每一场都能用得上。</li> 
  <li style="color: #5f6368;font-size: 16px">第三方会议助手更完整，但代价直接——往会议里加一个 bot，同时把数据和控制权一并交出去。</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">很多人就是卡在这里：要么碎片化，要么不放心。</p> 
 <p style="color: #5f6368;font-size: 16px">那有没有第三种方式?换个角度看，我们手里的“积木“早就够了。操作系统本身就能处理音频分流，云上也早已有成熟的转录和大模型能力。如果只是把这些现成能力串起来，不登录、不订阅、不引入第三方、不往会议里塞机器人，只在自己的电脑上完成“采集 → 转录 → 整理“这一整件事，会怎么样?答案是：可以，而且比想象中简单得多。</p> 
 <p style="color: #5f6368;font-size: 16px">于是就有了 MeeTap——一个运行在 macOS 上的 CLI 工具。两行命令，完成从语音采集、文字转写、纪要生成、到按需发送邮件的全过程。整个流程只在你自己的 AWS 账号里走一遍，你付的只是 AWS 实际用掉的那一点资源成本——没有中间加价。</p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">隐私优先 — 数据全程只在你自己的 AWS 账号内流转。不登录第三方服务、不往会议里加 bot，录音文件用完即删，账户里不留痕迹。</li> 
  <li style="color: #5f6368;font-size: 16px">跨平台统一 — 不受限于 Teams、Zoom、飞书各自的 AI 能力。无论你用什么会议软件，MeeTap 在操作系统层面统一采集，一套工具覆盖所有场景。</li> 
  <li style="color: #5f6368;font-size: 16px">极简体验 — <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meetap start</code> / <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meetap stop</code>，开完会自动出纪要。没有界面要学、没有按钮要点，两条命令就是全部操作。</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>1.2 一张图说清 MeeTap</h3> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-1.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-1.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 1：MeeTap 在 AWS 上的实现架构]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"></p> 
 <p style="color: #5f6368;font-size: 16px">本地 → 云端 → 本地，一条非常干净的流水线：</p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">macOS CoreAudio + BlackHole 负责在本地把任意 App 的音频“截“下来</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/s3/">Amazon S3</a> 做音频和转录的中转存储</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/transcribe/">Amazon Transcribe</a> 做说话人分离和语言识别——传一个 S3 URI，不用碰模型和 GPU</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/">Amazon Bedrock</a> 把<a href="https://aws.amazon.com/cn/ai/generative-ai/nova/">Amazon Nova</a>、Llama、Mistral、DeepSeek 等主流 LLM 汇聚到同一个 Converse API 背后——改一个字符串就能换</li> 
  <li style="color: #5f6368;font-size: 16px">Amazon SES 可选地把纪要发你邮箱</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">这就是云计算最有价值的一件事：把原本需要一整套系统、甚至一个团队才能搭起来的能力，压缩成一条个人开发者也能快速拼接完成的流水线。</p> 
 <div style="height: 10px"></div> 
 <h3>1.3 先看效果：两条命令解决问题</h3> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">meetap start    # 开会前或会议开始会后均可
meetap stop     # 开完后(自动转录 + 生成纪要)</code></pre> 
  </div> 
 </div> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-2.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-2.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 2：meetap start —— 录制开始后的终端界面]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">敲完 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meetap start</code>，终端底部会出现一条刷新的麦克风电平 + 录制时长的状态栏，不占主屏幕。开会期间什么都不用做——虽然系统输出被切到了 BlackHole，但声音会被实时转发回你原来的设备，听感完全一致。持续 2 分钟静音会自动停止，忘了敲 stop 也不怕。</p> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-3.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-3.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 3：meetap stop —— 停止后的即时反馈]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"></p> 
 <p style="color: #5f6368;font-size: 16px">敲 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meetap stop</code>，三件事同时发生：</p> 
 <ol> 
  <li style="color: #5f6368;font-size: 16px">音频输出立即切回原设备(没有“播放器静音 5 秒“的尴尬)</li> 
  <li style="color: #5f6368;font-size: 16px">录制文件开始后台上传转录，终端立刻释放，不阻塞你</li> 
  <li style="color: #5f6368;font-size: 16px">完成后 macOS 右上角弹系统通知告诉你“会议纪要已生成“</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">结果存在 &nbsp;<code>~/Record/&lt;timestamp&gt;/</code>：</p> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">~/Record/20260430_2136/
├── meeting-notes.md         ← 你主要看这个
├── meeting-notes.pdf        ← 邮件附件用(如果开了邮件)
└── log/
    ├── transcript.txt       ← 带说话人标签的转录
    ├── speaker-stats.txt    ← 每人发言时长占比
    ├── transcribe-raw.json  ← Transcribe 原始 JSON
    └── meetap.log           ← 每一步时间戳</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">其他都是 debug 用的，你只需要打开 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meeting-notes.md</code>。</p> 
 <p style="color: #5f6368;font-size: 16px">下面我们把这件事拆开来看：音频是怎么采集的，纪要是怎么生成的，以及这个架构为什么“刚刚好“。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section2">二、非侵入的音频采集</h2> 
 <p style="color: #5f6368;font-size: 16px">macOS 有一条隐形的红线：App 不允许抓取其他 App 的音频输出(隐私和 DRM 的历史原因)。所以任何“会议助手“方案都绕不开同一个难题——必须在输出路径上“插一脚“。</p> 
 <p style="color: #5f6368;font-size: 16px">默认情况下，会议 App 的音频路径很直白：</p> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-4.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-4.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 4：默认音频路径]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">coreaudiod</code> 是 macOS 的音频路由守护进程，相当于一个“交换机“，按“系统偏好 → 声音 → 输出“里选中的设备分发每个 App 的音频。声音到物理设备就散入空气，没有旁路。</p> 
 <p style="color: #5f6368;font-size: 16px">MeeTap 的做法是经典但优雅的虚拟声卡分流：</p> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-5.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-5.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 5：MeeTap 虚拟声卡分流]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">三个关键角色：</p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">BlackHole 是一个开源的 CoreAudio HAL 插件，向系统注册了一张“没有物理硬件的声卡“。写入的音频不会被播放，而是被原封不动“搬“到它的输入端(loopback)。MeeTap 启动时把系统默认输出切到 BlackHole——从会议 App 的视角什么都没变，但“默认输出“此刻已经是一个可被读取的虚拟设备。</li> 
  <li style="color: #5f6368;font-size: 16px">audio-monitor 是一个小型 Swift 程序，通过 AUHAL AudioUnit 从 BlackHole 输入端实时读数据，再渲染到你原来的真实设备(AirPods / 扬声器)。端到端延迟 &lt; 10 ms，人耳无感。这一步保证用户听感不受影响。</li> 
  <li style="color: #5f6368;font-size: 16px">ffmpeg 同时把 BlackHole 当作输入，跟物理麦克风混流，AAC 编码后写入本地 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meeting.m4a</code>：</li> 
 </ul> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">ffmpeg -f avfoundation -i “：BlackHole 2ch“ \
       -f avfoundation -i “：default“ \
       -filter_complex amix=inputs=2：duration=longest \
       -c：a aac -b：a 128k -ac 1 meeting.m4a</code></pre> 
  </div> 
 </div> 
 <div style="background-color: #f5f5f5;border-left: 4px solid #9e9e9e;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px">
  128 kbps / 单声道是和 Transcribe 对齐的选择：语音识别对高保真不敏感，降码率能把 30 分钟的文件压到 ~30 MB，上传更快、转录成本不变。
 </div> 
 <p style="color: #5f6368;font-size: 16px">整张图最巧妙的地方就在 BlackHole 节点的分叉——同一份音频数据被两个消费者并行订阅：一路还原给用户听，一路落盘采集。这里没有黑科技，BlackHole 利用 macOS 的 AudioServerPlugIn API 注册为一张合法的软件声卡，本质就是把软件声卡当路由器用。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section3">三、会议纪要的云端生成</h2> 
 <p style="color: #5f6368;font-size: 16px">文件已经在本地了，接下来是把它变成纪要。MeeTap 选了一条最朴素的路径：CLI 作为唯一的控制面，直接调 4 个 AWS 托管服务——S3、Transcribe、Bedrock、SES。</p> 
 <p style="color: #5f6368;font-size: 16px">这四个都是 AWS 上典型的 “serverless、按量计费、SDK 开箱即用“ 的代表。没有 Lambda、没有 Step Functions、没有 API Gateway 这些中间层，也不需要——整个云端管线就是“客户端驱动 + 托管服务拼接“，4 步走完。</p> 
 <h3>3.1 上传音频到 S3</h3> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">BUCKET=“meetap-transcribe-${ACCOUNT_ID}-${AWS_REGION}“
aws s3 mb “s3：//${BUCKET}“ 2&gt;/dev/null || true
aws s3 cp “$AUDIO_FILE“ “s3：//${BUCKET}/${AUDIO_BASENAME}“</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">桶名带账号 ID 和区域，天然隔离、首次自动创建、用户零配置。桶本身只是中转——Transcribe 强制要求输入是 S3 URI，满足这个约束即可。任务结束后 CLI 会清空整个桶。</p> 
 <div style="height: 10px"></div> 
 <h3>3.2 Transcribe 生成带说话人标签的文本</h3> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">aws transcribe start-transcription-job \
    --identify-language \
    --language-options en-US zh-CN ja-JP \
    --media “{\“MediaFileUri\“： \“s3：//${BUCKET}/${AUDIO_BASENAME}\“}“ \
    --output-bucket-name “$BUCKET“ \
    --settings '{“ShowSpeakerLabels“： true， “MaxSpeakerLabels“： 10}'</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">两个关键开关：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">--identify-language</code> 让 Transcribe 自己判断这段会议是中 / 英 / 日，适合跨时区多语言场景；<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ShowSpeakerLabels</code> 开启说话人分离，最多 10 人。CLI 每 10 秒轮询一次状态，完成后下载 JSON，用一小段 Python 压成带说话人标签的文本：</p> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">spk_0： 我们今天主要讨论三件事...
spk_1： 第一个我补充一下，之前的数据显示...</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">顺便算一下每个人的发言时长占比，落到 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">speaker-stats.txt</code>。</p> 
 <div style="background-color: #f5f5f5;border-left: 4px solid #9e9e9e;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px">
  Transcribe 是这条链路的主要成本项($0.024/min)。如果你对成本特别敏感，可以换成本地跑的 Whisper，链路其余部分不变。
 </div> 
 <div style="height: 10px"></div> 
 <h3>3.3 Bedrock 生成结构化纪要</h3> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">client = boto3.client(“bedrock-runtime“， region_name=region)
response = client.converse_stream(
    modelId=“amazon.nova-pro-v1：0“，   # 或任意 Bedrock 可合规使用的模型 ID
    messages=[{“role“： “user“， “content“： [{“text“： prompt}]}]，
    inferenceConfig={“maxTokens“： 4096}，
)
for event in response[“stream“]：
    if “contentBlockDelta“ in event：
        delta = event[“contentBlockDelta“][“delta“]
        if “text“ in delta：
            sys.stdout.write(delta[“text“])</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">选 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">converse_stream</code> 而不是 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">invoke_model</code> 有两个原因：</p> 
 <ol> 
  <li style="color: #5f6368;font-size: 16px">流式输出让用户边生成边看到进度，不会卡住等半分钟；</li> 
  <li style="color: #5f6368;font-size: 16px">Converse API 是跨模型统一接口，将来换模型就是改一个字符串的事——<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">amazon.nova-pro-v1：0</code> 换成 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meta.llama3-70b-instruct-v1：0</code>、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">mistral.mistral-large-2407-v1：0</code>、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">deepseek.r1-v1：0</code>，代码一行都不用动。</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">MeeTap 默认用 Amazon Nova Pro：速度快、中英文稳定、长上下文能一次吃下几万 token 的转录，还能识别出“A 让 B 下周三之前交 PPT 给 C“这种跨段 action item。在 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">~/.config/meetap/config</code> 里改一行 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">model = ...</code> 就能切换到你偏好的任何 Bedrock LLM。</p> 
 <p style="color: #5f6368;font-size: 16px">输出落盘为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meeting-notes.md</code>，paper-style 的中文结构(摘要 / 议题 / 决议 / Action Items)。</p> 
 <div style="height: 10px"></div> 
 <h3>3.4 SES 发邮件(可选)</h3> 
 <p style="color: #5f6368;font-size: 16px">如果配置里填了收件人和已 verified 的发件人，CLI 会用 PyMuPDF 把 Markdown 渲染成 PDF，再通过 SES 的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">send_raw_email</code> 带附件发出去。没配就跳过。</p> 
 <p style="color: #5f6368;font-size: 16px">把上面 4 步展开成一个带状态的时序视图，能更直观地看到 MeeTap 和 AWS 之间是怎么”对话”的：</p> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-6.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/macos-ai-coding-assistant-6.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图 6：MeeTap 的完整云端数据流]</p> </td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"></p> 
 <div style="height: 30px"></div> 
 <h2 id="section4">四、这个架构为什么“刚刚好“</h2> 
 <p style="color: #5f6368;font-size: 16px">回过头看整条链路，它的特征可以总结为四个字：够用就好。</p> 
 <p style="color: #5f6368;font-size: 16px">1. 无常驻基础设施 = 无闲置成本。 部署 = <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">make install</code>，升级 = <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">git pull &amp;&amp; make install</code>；没会议时云端零调用，自然零费用。</p> 
 <p style="color: #5f6368;font-size: 16px">2. 用完即清。 S3 bucket 清空、Transcribe job 删除，账户里永远只有一个空桶。</p> 
 <p style="color: #5f6368;font-size: 16px">3. 成本透明。 一场 30 分钟会议的账单大致是：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <th style="padding: 12px;border: 1px solid #ddd">服务</th> 
    <th style="padding: 12px;border: 1px solid #ddd">成本</th> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">Transcribe</td> 
    <td style="padding: 12px;border: 1px solid #ddd">~$0.72($0.024/min，主要成本项)</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">Bedrock (Amazon Nova Pro)</td> 
    <td style="padding: 12px;border: 1px solid #ddd">~$0.01</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">S3 + SES</td> 
    <td style="padding: 12px;border: 1px solid #ddd">~$0</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">合计</td> 
    <td style="padding: 12px;border: 1px solid #ddd">~$0.73</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">建议配合 AWS Budgets 设月度告警。</p> 
 <p style="color: #5f6368;font-size: 16px">4. 可替换 / 可降级。 不想用 Transcribe 可换 Whisper；不想用 Bedrock 可切 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ai_backend = claude-code</code>；不想发邮件不填 email 字段；想换模型改 model 一行。</p> 
 <h3 style="color: #5f6368;font-size: 16px">几个设计决策</h3> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">轮询而非事件驱动。EventBridge + Lambda 对本地 CLI 过度工程化；每 10 秒一次 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">GetTranscriptionJob</code> 几乎零成本，换来无状态、即启即跑。</li> 
  <li style="color: #5f6368;font-size: 16px">流式返回。<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ConverseStream</code> 每收到一段就追写到 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meeting-notes.md</code>，用户看到的是“纪要在眼前长出来“，而不是干等 30 秒。</li> 
  <li style="color: #5f6368;font-size: 16px">资源生命周期与脚本绑定。S3 bucket 和 Transcribe job 在同一次 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">meetap stop</code> 里创建和销毁，bash 退出即清零，控制台不会有遗留资源在计费。</li> 
 </ul> 
 <div style="background-color: #f5f5f5;border-left: 4px solid #9e9e9e;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px">
  MeeTap 之所以能用一千多行 bash + Swift + Python 跑完整条链路，不是因为它做得多精巧，而是因为底层的每一块硬骨头，都被 AWS 啃完了。
 </div> 
 <p style="color: #5f6368;font-size: 16px">Transcribe 免去了养语音识别模型的工程负担，Bedrock 把模型选型从“部署 vLLM“降维成“改一行 modelId“，S3 / SES 则是大家熟悉的基础设施。复杂度被封装在了托管服务里面，留给开发者的就是业务本身。</p> 
 <p style="color: #5f6368;font-size: 16px">对一个个人 CLI 工具来说，“能看见、能重跑、能删干净“比“架构先进“更重要。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section5">五、安装与上手</h2> 
 <p style="color: #5f6368;font-size: 16px">首次准备只做一次。推荐路径——直接用 Homebrew：</p> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell"># 1. 安装 MeeTap(自动拉取 blackhole-2ch / ffmpeg / switchaudio-osx / awscli)
brew tap henceman777/tap
brew install meetap
# 2. 配置 AWS CLI(若还没配过)
aws configure
# 3. 重启 coreaudiod 让系统识别 BlackHole(音频会断 2–3 秒)
sudo killall coreaudiod
# 4. 初始化 + 一次性配置会议 App 的音频路由
meetap config
meetap setup  
# 5. 开始第一次录制
meetap start</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">如果你想改源码，走开发者路径：</p> 
 <div class="hide-language"> 
  <div class="hide-language"> 
   <pre class="unlimited-height-code"><code class="lang-powershell">brew install blackhole-2ch ffmpeg switchaudio-osx awscli
git clone https：//github.com/henceman777/meetap.git
cd meetap &amp;&amp; make install</code></pre> 
  </div> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">两种方式的差异只是“路径“：前者交给 Homebrew 管版本和依赖(<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">brew upgrade meetap</code> 即可升级)，后者把仓库 clone 到本地便于改 bash / Swift 源码。选哪条看你想“用“还是想“改“。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section6">六、安静的会议搭子</h2> 
 <p style="color: #5f6368;font-size: 16px">用久了会发现，MeeTap 根本不像个“工具“，更像随叫随到、但从不打扰你的会议搭子。开会时不用分心记笔记，也不用担心漏掉谁说了什么。想留就敲一下，它帮你记住；不想留就当它不存在。</p> 
 <p style="color: #5f6368;font-size: 16px">它特别“安静“——没有界面、没有提示、也不会跳出来刷存在感。用着用着你甚至会忘了它在那，但需要的时候，它一直都在。反而就是这种“几乎感觉不到它存在“的状态，慢慢变成一种很自然的习惯。</p> 
 <p style="color: #5f6368;font-size: 16px">而真正有意思的地方不在“会议“。你电脑里所有“能听的东西“，都可以变成“能用的内容“——开会、刷 YouTube、听播客、上网课、做访谈……以前听完就散了，现在都会变成一条条整理好的记录，慢慢积累下来。你不用刻意去“做笔记“，它自己会留下痕迹。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section7">七、尾声：这东西是一个晚上写出来的</h2> 
 <p style="color: #5f6368;font-size: 16px">还有个挺有意思的点：这东西并不是我一行一行“硬写”出来的。严格来说，我也算不上熟练程序员，但 MeeTap 从一个念头到真正跑起来，只用了一个晚上。很大程度上，这得益于现在已经完全不一样的开发方式 —— AI Coding。借助 Claude Code，很多事情在真正动手前就已经被“想清楚”了：要做什么、为什么这样做、应该拆成几步、每一步怎么推进。等这些都确认完，再由它落地生成代码。整个过程更像是我在和一个会写代码的搭档协作，而不是一个人对着编辑器死磕。MeeTap 之后的迭代，大概也会是这个节奏：冒出一个想法，抽点碎片时间，跟 Claude Code 聊清楚需求，再交给 AI Coding 慢慢补进去。不追路线图，也不赶进度，就在每天的使用里，一点点把它打磨成自己真正想要的样子。</p> 
 <p style="color: #5f6368;font-size: 16px">如果对这套 AI Coding 的玩法感兴趣，下一篇我会跟大家专门聊聊里面那些挺反直觉、却出奇好用的实践。</p> 
 <p style="color: #5f6368;font-size: 16px"><strong>MeeTap 已开源</strong></p> 
 <p style="color: #5f6368;font-size: 16px">GitHub： <a href="http://github.com/henceman777/meetap">github.com/henceman777/meetap</a></p> 
 <p style="color: #5f6368;font-size: 16px">欢迎 Star / Issue / PR——尤其欢迎对 Linux / Windows 移植、Whisper 本地模式、更多会议 App 预设感兴趣的朋友一起来玩。</p> 
 <p>
  <!-- 结语 --></p> 
 <div style="height: 30px"></div> 
 <h2 id="section8">八、相关链接</h2> 
 <p style="color: #5f6368;font-size: 16px"><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/27a1.png" alt="➡" class="wp-smiley" style="height: 1em; max-height: 1em;"> 下一步行动：</strong></p> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关产品：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/transcribe/?p=bl_pr_transcribe_l=1">Amazon Transcribe</a> — 语音转文本</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2">Amazon S3</a> — 适用于 AI、分析和存档的几乎无限的安全对象存储</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3">Amazon Bedrock</a> — 用于构建生成式人工智能应用程序和代理的端到端平台</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/ai/generative-ai/nova/?p=bl_pr_nova_l=4">Amazon Nova</a> — 提供前沿智能和最高性价比的基础模型</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关文章：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=1">用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/kiro-openclaw-ai-agent-practice-explore/?p=bl_ar_l=2">当 Kiro 遇上 OpenClaw：AI Agent 双向协作的实践探索</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/?p=bl_ar_l=3">用 Kiro 构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn/?p=bl_ar_l=4">AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/fast-fashion-ecommerce-agent-design-8-websocket-voice-system/?p=bl_ar_l=5">快时尚电商行业智能体设计思路与应用实践（八）基于 WebSocket 的语音系统：Nova 2 Sonic, AgentCore, Strands Agents 企业级架构实践</a></li> 
 </ul> 
 <p>
  <!-- 免责声明 --></p> 
 <p style="background-color: #f9f9f9;padding: 20px;border-radius: 8px;margin: 30px 0;color: #5f6368;font-size: 16px">*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。</p> 
 <p>
  <!-- 本篇作者 --></p> 
 <div style="height: 30px"></div> 
 <h2>本篇作者</h2> 
 <div style="height: 20px"></div> 
 <footer> 
  <div class="blog-author-box" style="border: none;padding: 0"> 
   <div class="blog-author-image">
    <img src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/08/lijyang.jpg" alt="" width="125">
   </div> 
   <h3 class="lb-h4">杨立军</h3> 
   <p style="color: #5f6368;font-size: 16px">亚马逊云科技 Network Specialist SA。聚焦 云网络(VPC / Transit Gateway / Direct Connect / Cloud WAN)、EC2 网络 与 数据中心网络(AI 训练推理网络 10p10u / SRD / EFA)三个方向。曾任职于 Ericsson、Cisco、Dell、Riverbed。CCIE #7915。</p> 
  </div> 
 </footer> 
 <p>
  <!-- 横线 --></p> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 40px 0;width: 100%"> 
 <p>
  <!-- AWS架构师中心 --></p> 
 <table width="100%"> 
  <tbody> 
   <tr> 
    <td width="480"> <h2>AWS 架构师中心：云端创新的引领者</h2> <p style="color: #5f6368;font-size: 16px">探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用</p> <p><strong><a href="https://aws.amazon.com/cn/solutions/architect-center/"><img class="alignleft" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa-button.png" width="60"></a></strong></p></td> 
    <td width="460"><img class="alignright" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa.png"></td> 
   </tr> 
  </tbody> 
 </table> 
</div>