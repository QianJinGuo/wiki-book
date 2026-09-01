---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/story2video-technology-practice-text-launch-video-aigc-pipeline
ingested: 2026-09-01
feed_name: AWS China Blog
source_published: 2026-09-01
---

# Story2Video 技术实践：从故事文本到可发布短视频的 AIGC Pipeline

摘要：内容创作团队常常面临一个问题：把一段故事线快速转成可发布的短视频，涉及脚本、分镜、配音、口型同步和字幕，链路长且难以维持一致性。在这篇文章中，我们向面向视频生成的架构师、AI 工程师和内容平台团队展示如何使用 Amazon Bedrock、ComfyUI 和 Fish-Speech 组合出一条端到端的 AIGC pipeline  
  
**目录**

01 一、背景

02 二、架构设计

03 三、流程 Pipeline

04 四、功能模块

05 五、实施步骤：安装、配置与部署

06 六、参考资料

* * *

## **一、背景**

Story2Video 要解决的问题，是把“故事背景、故事线、风格参考图、人物参考图、角色音色”自动转成一条完整的视频。它和普通的文生视频 Demo 不太一样：普通文生视频往往只关心一个 prompt 到一个视频片段，而 Story2Video 更接近一个小型内容生产系统，需要同时处理脚本、分镜、角色一致性、TTS、口型同步、字幕、转场、音画对齐和任务状态管理。

在真实创作场景里，这类系统最容易遇到三个问题。

第一是结构不稳定。[LLM](<https://aws.amazon.com/cn/what-is/large-language-model/>) 可以写故事，但如果只输出自然语言，后续模块很难知道哪些镜头需要人物、哪些镜头是旁白、哪些镜头要口型同步、每个镜头持续几秒。Story2Video 因此把 LLM 输出约束为结构化 `StoryScript` 和 `StoryShot`，让每个镜头都有明确字段，例如 `audio_type`、`speaker`、`dialogue_text`、`narration`、`visual_prompt`、`camera_motion`、`character_id` 和 `duration`。

第二是角色一致性。故事视频通常包含多个镜头，如果每个镜头都直接文生图，角色外貌、服装和气质很容易漂移。项目通过人物参考图和 Qwen Image Edit workflow，把带人物的镜头[路由](<https://aws.amazon.com/cn/what-is/routing/>)到图生图链路；纯场景镜头则走 Z-image 文生图。这样可以在灵活生成画面的同时，尽量保留人物一致性。

第三是音画同步。一个完整视频不是简单拼接 MP4。对话镜头需要先生成角色语音，再把语音交给 lip-sync workflow；旁白镜头不需要口型同步，但最终仍要把旁白音频铺到时间轴上。项目在最终合成阶段统一生成 SRT、合并 TTS 音轨、裁剪或补齐每个分镜时长，最后生成 `final_video.mp4`。

## **二、架构设计**

整体架构如下图所示。图是用 SVG 直接绘制的，已保存为当前目录下的 `story2video_architecture.svg`。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/story2video-technology-practice-text-launch-video-aigc-pipeline-1.png>) [图 1]  
---  
  
从工程角度看，Story2Video 可以拆成五层。

第一层是交互层。`gui/vibe_video_ui.py` 提供 Gradio 页面，用户上传风格图、人物图、参考音频，并填写故事背景和故事线。每次提交都会生成一个独立 session，输入文件放在 `input/<session_id>/`，输出文件放在 `output/<session_id>/`。UI 不阻塞等待任务结束，而是启动后台线程，并通过 `status.json` 持续刷新进度。

第二层是编排层。`story_to_video_pipeline.py` 是核心入口，`run_story_to_video_pipeline` 串起图像分析、脚本生成、分镜图生成、TTS、分镜视频生成和最终合成。它返回 `StoryPipelineResult`，集中记录 `script`、`image_paths`、`audio_paths`、`video_paths`、`subtitle_path` 和 `final_video_path`。

第三层是数据协议层。`story_shot.py` 定义了 `StoryShot` 和 `StoryScript`。这一步非常关键，因为它把“故事创意”转成了机器可执行的中间表示。后续模块不需要重新理解自然语言，只要读取结构化字段就能决定自己的行为。

第四层是生成能力层。`story_writer.py` 调用 Bedrock 多模态模型生成脚本；`initial_image_analyze.py` 负责分析风格图和人物图；`comfyui_client.py` 负责向 ComfyUI 提交 Z-image、Qwen Image Edit、Wan2.2、MultiTalk 等 workflow；`tts_fish_speech.py` 负责使用 Fish-Speech 生成旁白和角色台词。

第五层是后期合成层。`video_editing.py` 负责拼接视频、替换音轨、烧录字幕、处理转场和分镜时长漂移。这个模块让前面几个不完全稳定的生成模型，最终落到一个可播放、时间轴尽量准确的视频文件上。

## **三、流程 Pipeline**

Story2Video 的主流程在 `run_story_to_video_pipeline` 中，按阶段执行。

Stage 0 是输入图像分析。系统调用 `analyze_all_images`，对风格参考图提取视觉风格、情绪氛围、色彩、光线、构图等信息；对人物参考图提取外貌、服装、表情、姿态等信息。这些分析结果不是最终产物，但会作为 prompt context 注入脚本生成阶段，帮助 LLM 写出更贴合参考素材的镜头描述。

Stage 1 是故事脚本生成。`generate_story_script` 会把用户输入的背景、故事线、参考图和图像分析结果组合成一个多模态 prompt，要求 Bedrock 模型返回严格 JSON。每个镜头需要包含字幕、画面描述、运镜、音频类型、角色、台词或旁白、情绪和时长。这里还有两个工程细节：一是自动识别用户文本里的时长要求，例如“30 秒”“1 分钟”“90s”，再反推分镜数量和单镜时长；二是自动替换高风险运镜，例如把 `pan_left`、`pan_right` 改成 `static`、`zoom_in` 或 `zoom_out`，避免主体在视频生成中移出画面。

Stage 2 是分镜图生成。系统遍历 `StoryShot`，为每个镜头生成 `images/shot_XXX.png`。如果镜头有 `character_id` 且用户提供了人物参考图，就使用 Qwen Image Edit，把人物图和镜头 prompt 一起送入图生图 workflow；如果镜头没有指定人物，则使用 Z-image 文生图。对于双人镜头，`character_ids=[0,1`] 会传入第二张人物参考图。图像生成使用线程池并发执行，默认并发数为 2，兼顾速度和 ComfyUI 资源压力。

Stage 3 是 TTS 语音生成。`generate_tts_for_shots` 根据 `audio_type` 路由音频生成：`dialogue` 使用角色音色，优先从 `character_voice_map` 中查找“主角 0”“主角 1”等 speaker 对应的参考音频；`narration` 使用旁白参考音频；`bgm_only` 不生成 TTS。每个镜头的音频会保存为 `audio/shot_XXX_tts.wav`，并写回 `StoryShot.audio_path`。

Stage 4 是分镜视频生成。这里会根据镜头类型选择不同视频链路。如果镜头是 `dialogue` 且存在 TTS 音频，就调用 `generate_multitalk_video_from_shot`，使用分镜图和台词音频生成带口型同步的视频；否则调用 `generate_wan2_video_from_shot`，使用 Wan2.2 image-to-video 生成普通动态镜头。为了复用已有 audio2video 能力，代码会把 `StoryShot` 转成兼容旧接口的 `LegacyShot`。

Stage 4.5 是可选字幕清理。如果 `REMOVE_SHOT_SUBTITLES` 开启，系统会调用 `remove_video_subtitles` 去除某些[工作流](<https://aws.amazon.com/cn/what-is/workflow/>)可能自动生成的分镜内嵌字幕，避免最终烧录统一字幕时出现重复。

Stage 5 是最终合成。系统先根据所有分镜生成 `subtitles.srt`。随后收集每个分镜视频，并把所有 TTS 音频合并成一条总音轨。合并音频时，若某段音频短于镜头时长，就补静音；若长于镜头时长，就截断。最后 `merge_videos_with_audio` 会按顺序拼接视频、替换音轨、烧录字幕，并根据 `shot_durations` 修正每个片段长度，减少生成模型导致的累计漂移。

最终输出结构大致如下：
    
    
    output/<session_id>/
      story_script.json
      status.json
      subtitles.srt
      final_video.mp4
      images/
        shot_000.png
        shot_001.png
      audio/
        shot_000_tts.wav
        merged_narration.wav
      videos/
        shot_000.mp4
        shot_001.mp4
    

## **四、功能模块**

`story_writer.py` 是脚本生成模块。它负责构造 Bedrock 多模态请求、解析模型返回、从 Markdown code block 中提取 JSON、构造 `StoryScript`，并在必要时修正时长和运镜。它的 prompt 明确要求 `dialogue`、`narration` 和 `bgm_only` 互斥，这使得后续模块可以直接按字段分支，而不是再次解析自然语言。

`story_shot.py` 是核心数据模型。`StoryShot` 提供 `is_dialogue()`、`is_narration()`、`get_tts_text`() 等方法，把镜头行为封装在数据对象里。这个模型让脚本生成、TTS、图像生成、视频生成和合成模块之间有了稳定接口。

`initial_image_analyze.py` 是视觉理解模块。它通过 Bedrock 视觉能力提取参考图的结构化描述，并用 `to_prompt_context`() 转成可注入 prompt 的上下文。这一步的价值是减少用户需要手写的风格提示词，让模型从图片本身继承风格、色彩和人物特征。

`comfyui_client.py` 是 ComfyUI 适配模块。它处理上传文件、提交 prompt、轮询 /`history/{prompt_id`}、下载结果等通用操作，也封装了不同 workflow 的参数注入。Story2Video 主要使用 `generate_story_shot_image`、`generate_wan2_video_from_shot` 和 `generate_multitalk_video_from_shot`。

`tts_fish_speech.py` 是语音合成模块。它支持 `local_api`、`local` 和 `sdk` 等模式。当前项目默认使用 `local_api`，也就是本地启动 Fish-Speech [API](<https://aws.amazon.com/cn/what-is/api/>) 服务后，Story2Video 通过 HTTP 请求生成 TTS 音频。角色音色和旁白音色可以分别配置。

`video_editing.py` 是后期模块。它负责把多个分镜视频合成为一个完整视频，处理音轨替换、字幕烧录、淡入淡出转场、视频长度裁剪和补齐等问题。[AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) GC 视频片段经常会出现实际时长和目标时长不完全一致的问题，这个模块是保证最终成片可用的关键。

`gui/vibe_video_ui.py` 是产品入口。它除了提供上传和进度刷新，还支持在用户没有上传人物图时，先用 LLM 从故事里提取主要人物，再调用图像生成自动生成人物参考图。这个能力让系统更接近“输入故事就能生成视频”的体验。

## **五、实施步骤：安装、配置与部署**

下面是一套适合从零部署 Story2Video 的步骤，假设你已经有一台可访问 [GPU](<https://aws.amazon.com/cn/what-is/gpu/>) 资源的机器用于 ComfyUI 和视频生成。

### 5.1 准备 [Python](<https://aws.amazon.com/cn/what-is/python/>) 环境
    
    
    git clone <your-repo-url>
    cd audio2video
    
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    

项目依赖包括 `gradio`、`boto3`、`moviepy`、`pydub`、`fastapi`、`uvicorn`、`fish-speech` 等。视频合成依赖 FFmpeg，Linux 服务器上通常还需要安装中文字体，避免字幕烧录时乱码。
    
    
    sudo apt update
    sudo apt install -y ffmpeg fonts-noto-cjk
    

### 5.2 配置 [AWS Bedrock](<https://aws.amazon.com/cn/bedrock/>)

Story2Video 使用 Bedrock 做图像理解和脚本生成。需要确保 AWS 账号已开通目标模型权限，并配置凭证：
    
    
    export AWS_REGION=us-west-2
    export AWS_ACCESS_KEY_ID=your_access_key
    export AWS_SECRET_ACCESS_KEY=your_secret_key
    

项目默认配置在 `config.py` 中：
    
    
    BEDROCK_REGION = "us-west-2"
    BEDROCK_MODEL_ID = "us.anthropic.claude-sonnet-4-5-20250929-v1:0"
    

如果你使用其他 Bedrock 模型或 region，需要同步修改 `config.py`。

### 5.3 准备 ComfyUI 服务和工作流

ComfyUI 负责图像生成、图像编辑、图生视频和 lip-sync。需要启动一个可访问的 ComfyUI 服务，并确保项目中的 workflow 文件可用：
    
    
    workflow/Z-image.json
    workflow/qwen-image-edit.json
    workflow/Wan2-2.json
    workflow/MultiTalk.json
    

在 `config.py` 中配置 ComfyUI 地址：
    
    
    COMFYUI_SERVER_URL = "http://your-comfyui-server:8188"
    Z_IMAGE_WORKFLOW_PATH = "./workflow/Z-image.json"
    QWEN_IMAGE_EDIT_WORKFLOW_PATH = "./workflow/qwen-image-edit.json"
    WAN2_WORKFLOW_PATH = "./workflow/Wan2-2.json"
    MULTITALK_WORKFLOW_PATH = "./workflow/MultiTalk.json"
    

部署时建议先单独验证 ComfyUI 能跑通对应 workflow，再启动 Story2Video。否则问题会混在 pipeline 里，不容易定位。

### 5.4 启动 Fish-Speech TTS API

Story2Video 默认使用 Fish-Speech 本地 API 模式。先准备 Fish-Speech 仓库和模型权重：
    
    
    git clone https://github.com/fishaudio/fish-speech.git
    cd fish-speech
    pip install -e .
    
    # 按 Fish-Speech 官方说明下载模型，例如 openaudio-s1-mini
    huggingface-cli login
    python tools/download_models.py
    

启动 API 服务：
    
    
    python tools/api_server.py \
      --mode tts \
      --listen 0.0.0.0:8088 \
      --llama-checkpoint-path "checkpoints/openaudio-s1-mini" \
      --decoder-checkpoint-path "checkpoints/openaudio-s1-mini/codec.pth" \
      --decoder-config-name modded_dac_vq \
      --device cuda \
      --half
    

回到本项目，设置 TTS 环境变量：
    
    
    export TTS_MODE=local_api
    export FISH_SPEECH_API_URL="http://127.0.0.1:8088"
    

如果 Fish-Speech 部署在另一台机器上，把地址改成对应内网或公网地址即可。

### 5.5 启动 Story2Video UI

项目提供两种启动方式。推荐用脚本：
    
    
    ./restart.sh story2video
    

也可以直接运行 Gradio：
    
    
    python gui/vibe_video_ui.py --listen 0.0.0.0 --port 7861
    

启动后访问：
    
    
    http://localhost:7861
    

页面需要填写或上传：

  * 风格参考图，必填，用于约束整体视觉风格。
  * 人物参考图，可选，建议上传 1 到 2 张，提高角色一致性。
  * 故事背景，必填，用于设定世界观、时代、地点或产品场景。
  * 故事线，必填，用于描述剧情发展。
  * 旁白参考音频，可选，用于旁白音色克隆。
  * 角色音色音频，可选，用于 dialogue 镜头。



### 5.6 验证一次完整任务

提交任务后，UI 会返回 session id。后台会不断更新：
    
    
    output/<session_id>/status.json
    

可以通过 UI 的“刷新进度”查看阶段状态，也可以直接检查输出目录。成功后应至少看到：
    
    
    output/<session_id>/story_script.json
    output/<session_id>/subtitles.srt
    output/<session_id>/final_video.mp4
    

如果失败，优先看 `status.json` 和终端日志。常见问题一般来自三类：Bedrock 权限或 region 配置不对；ComfyUI workflow 缺少模型或节点；Fish-Speech API 没启动或模型路径不正确。

### 5.7 生产部署建议

生产环境建议把 Gradio UI、ComfyUI、Fish-Speech 拆成三个服务。Gradio 负责用户交互和任务编排，ComfyUI 运行在 GPU 机器上，Fish-Speech 可以独立运行在另一张 GPU 或同机不同端口。这样一来，图像视频生成和 TTS 可以分别扩容，问题定位也更清晰。

任务输出建议挂载到持久化磁盘，例如 `output`/ 目录不要放在临时盘。对于多人使用场景，可以在 UI 层加鉴权，并定期清理过期 session。对于耗时任务，可以进一步把后台线程替换成队列系统，例如 Celery、RQ 或云厂商队列服务。

## **六、参考资料**

  * [Fish-Speech 官方仓库](<https://github.com/fishaudio/fish-speech>)
  * [Fish-Speech 官方文档](<https://speech.fish.audio/>)
  * [Amazon Bedrock 官方文档](<https://docs.aws.amazon.com/bedrock/>)
  * [ComfyUI 官方仓库](<https://github.com/comfyanonymous/ComfyUI>)：
  * [Wan2.2 Hugging Face](<https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B>)



**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台



**相关文章：**

  * [ECS + CodePipeline 企业轻量级容器化 CI/CD 实战—基于 GitHub + CodePipeline + CodeBuild + ECS Fargate 的全托管容器化部署方案](<https://aws.amazon.com/cn/blogs/china/ecs-codepipeline-enterprise-container-ci-cd-based-on-github/?p=bl_ar_l=1>)
  * [用 LLM + 语义聚类，把海量用户评论提炼成四级 VOC 标签体系](<https://aws.amazon.com/cn/blogs/china/llm-semantic-clustering-massive-user-comments-refine-into-four-level-voc-tag-system/?p=bl_ar_l=2>)
  * [基于Amazon中国区EKS使用Code家族和 Argo CD 构建GitOps CICD流程](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-eks-using-code-argo-cd-build-gitops-cicd/?p=bl_ar_l=3>)
  * [从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（二）：向量索引迁移与 Amazon Bedrock 集成](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-2/?p=bl_ar_l=4>)
  * [用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践](<https://aws.amazon.com/cn/blogs/china/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice/?p=bl_ar_l=5>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 唐清原

AWS数据分析解决方案架构师，负责AWS Data Analytic服务方案架构设计以及性能优化，迁移，治理等Deep Dive支持。10+数据领域研发及架构设计经验，历任Oracle 高级咨询顾问，咪咕文化数据集市高级架构师，澳新银行数据分析领域架构师职务。在大数据，数据湖，智能湖仓，及相关推荐系统/MLOps平台等项目有丰富实战经验

### 贺杨

亚马逊云科技解决方案架构师，具备 17 年 IT 专业服务经验，工作中担任过研发、开发经理、解决方案架构师等多种角色。在加入亚马逊云科技前，拥有多年外企研发和售前架构经验，在传统企业架构和中间件解决方案有深入的理解和丰富的实践经验。

### 粟伟

亚马逊云科技资深解决方案架构师，专注游戏行业。开源项目爱好者，致力于云原生应用推广、落地。具有 15 年以上的信息技术行业专业经验，担任过高级软件工程师，系统架构师等职位，在加入亚马逊云科技之前曾就职于 Bea、Oracle、IBM 等公司。

### 陈昊

亚马逊云科技合作伙伴解决方案架构师，有将近 20 年的 IT 从业经验，在企业应用开发、架构设计及建设方面具有丰富的实践经验。目前主要负责 AWS（中国）合作伙伴的方案架构咨询和设计工作，致力于 AWS 云服务在国内的应用推广以及帮助合作伙伴构建更高效的 AWS 云服务解决方案。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
