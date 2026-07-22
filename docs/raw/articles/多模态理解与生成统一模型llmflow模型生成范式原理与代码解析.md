---
title: "【多模态理解与生成统一模型】LLM+flow模型生成范式原理与代码解析"
source: wechat
url: https://mp.weixin.qq.com/s/dYV9VcajT5K6ofSI2Hr1jQ
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: 38d2dfa180be948bbd2ed9b18083854ad4f78373e6440c182a9119456c482c05
---

# 【多模态理解与生成统一模型】LLM+flow模型生成范式原理与代码解析

**来源**: 炼钢AI

**发布日期**: 2024-12-17

**原文链接**: https://mp.weixin.qq.com/s/dYV9VcajT5K6ofSI2Hr1jQ

---

前言

大模型时代，当提到多模态大模型往往指的是多模态理解模型，即给大模型输入图像和文本，模型输出和图像相关的文本内容。能同时做到图像理解和生成多模态模型比较少，如meta的Chameleon、字节的o-show和deepseek的janus等。多模态理解和生成模型大致可分为两种范式：

- LLM+将图像编码为若干个离散的token id范式（后文称为第一类模型）：借助VQ-GAN/VQ-VAE等技术，生成一个离散码表并将图像离散到一组token id后，就可以像LLM一样，自回归的生成图像token id，再解码为图像了。典型的模型有meta的Chameleon、deepseek Janus等。除了以自回归的方式预测图像token id外，也可以像Bert一样，做“完形填空”方式的训练，一次预测出多个image token id，典型的模型有字节的show-o。

- LLM+图像生成模型范式（后文称为第二类模型）：这种范式不需要将图片转换为token id，让LLM和图像生成模型紧密耦合，二者各司其职，典型的模型有Transfusion（图像生成模型为扩散模型）和Janusflow（图像生成模型为rectified flow模型）。

笔者在下边的两篇往期文章分别介绍了多模态理解模型（ deepseek VL ）和第一类多模态理解与生成统一模型（讲了 deepseek的Janus模型 ）：

【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例

【多模态理解与生成统一模型】LLM+image token生成范式原理与代码解析

​

本文将详细介绍第二类多模态理解与生成统一模型，以deepseek的Janusflow为例。Janusflow和Janus模型是同时发布的两个模型，不得不说，deepseek开源的是真全活。

Janusflow github：https://github.com/deepseek-ai/JanusJanusflow paper：https://arxiv.org/pdf/2411.07975

Janusflow整体结构

和Janus一样，Janusflow支持的图像理解和图像生成也是两个比较割裂的任务，这两个任务使用的图像编码器都不是共享的，只不过共享LLM的主干部分，因此可以分开来讲。

- 在进行图像理解任务时，图像编码器(und.Encoder)是SigLIP，然后就是走qwen-vl、deepseek vl一样的流程，将图像和文本对齐到同一空间，输出关于图像的文本内容。

- 在进行图像生成任务时，使用 rectified flow模型的范式去生成图像，LLM的文本内容当作条件去控制 rectified flow模型生成和文本相关的内容。 rectified flow模型的编码器和解码器都是由ConvNeXt block堆叠而成。图像生成实际是在 latent space中进行的， latent space中特征图大小为44848，最后用VAE的decoder将图像从 latent空间映射到像素空间（3384384），在latent space进行图像生成更加高效（注意，SDXL-VAE在图中并没有体现），这也是diffusion等图像生成模型的常用手段。

聊点儿八卦，为啥Janusflow选用flow模型当作图像生成模型而不是用更广为人知的diffusion模型当作图像生成器呢？笔者做图像生成的工作比较少，暂且不论效果上的问题，在调研过程中，发现rectified flow的作者@ XCLiu大佬也在deepseek工作，应该是Janusflow这篇文章排名第二的作者。

图像理解原理

deepseek家的模型一家亲，janusflow图像理解这块和他家的deepseek-vl代码基本是一致的，也同样用了SigLIP图像编码器，这个在我之前的文章《  【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例  》已经讲的很详细了，因此不再赘述。

​

图像生成原理

1

整体推理流程

我们首先看下janusflow的推理代码，了解下运行流程，代码中加入了必要的住注释以及tensor的shape，代码中有for step in range(num_inference_steps) 这个循环里包了z_emb, t_emb等一大堆东西，是flow模型的推理流程，这块先跳过，后面结合介绍flow模型原理时候再一并介绍。下边是一些关键点：

- batchsize是对于同一个prompt生成图像的次数，文生图是抽卡游戏，多抽几次才会有好图。

- flow模型要求的随机初始化噪声是在latent space空间的，shape为（bz，4，48，48），因此推理时不用vae encoder，只需要vae decoder将图像从latent space还原成正常图像空间就行了。 vae模型在janus训练的过程中固定参数，不参与训练 （直接下载的stability ai提供的原始模型）。

- 生成每张图像时需要推理两次，一次带prompt，一次不带prompt，后边做无分类器指导（Classifier-Free Guidance，CFG）用。CFG是图像生成时非常常用的技术，旨在权衡生成图像的指令跟随程度以及生成质量、多样性。具体来说，CFG 在训练时随机丢弃文本prompt（用pad填充），迫使图像生成器在没有prompt指导的情况下进行学习，这样做的目的是让生成器学会在没有prompt指导的情况下生成高质量的图像，从而提高生成图像的多样性和质量。最后将图像解码器（vl_gpt.vision_gen_dec_model）在有/无文本条件情况下的输出进行加权求和。

- jansflow模型不用像janus模型那样一次只能生成一个图像token进行多次推理，而是一次生成所有图像token。但是因为flow模型需要多次迭代，仍然是需要多次推理的。

import osimport PIL.Imageimport torchimport numpy as npfrom janus.janusflow.models import MultiModalityCausalLM, VLChatProcessorimport torchvision  
cuda_num = 1model_path = "/data/model/JanusFlow-1.3B"vl_chat_processor: VLChatProcessor = VLChatProcessor.from_pretrained(model_path)tokenizer = vl_chat_processor.tokenizer  
vl_gpt = MultiModalityCausalLM.from_pretrained(    model_path, trust_remote_code=True)vl_gpt = vl_gpt.to(torch.bfloat16).cuda(cuda_num).eval()  
from diffusers.models import AutoencoderKL# remember to use bfloat16 dtype, this vae doesn't work with fp16# vae模型用来将图像从latent space转为正常的图像空间vae = AutoencoderKL.from_pretrained("/data/model/sdxl-vae")vae = vae.to(torch.bfloat16).cuda(cuda_num).eval()  
conversation = [    {        "role": "User",        "content": "一只猫在草地上奔跑。",    },    {"role": "Assistant", "content": ""},]  
sft_format = vl_chat_processor.apply_sft_template_for_multi_turn_prompts(    conversations=conversation,    sft_format=vl_chat_processor.sft_format,    system_prompt="",)prompt = sft_format + vl_chat_processor.image_gen_tagprint("look prompt: ",prompt)  
@torch.inference_mode()def generate(    mmgpt: MultiModalityCausalLM,    vl_chat_processor: VLChatProcessor,    prompt: str,    cfg_weight: float = 5.0,    num_inference_steps: int = 30,    batchsize: int = 5):    input_ids = vl_chat_processor.tokenizer.encode(prompt)    input_ids = torch.LongTensor(input_ids)    print("input_ids shape:", input_ids.shape)        # 之所以2是因为要走cfg逻辑，每个prompt生成两次图像，一次有条件，一次无条件。    tokens = torch.stack([input_ids]  2  batchsize).cuda(cuda_num)    print("tokens shape:", tokens.shape)    # 一半batch的prompt用pad填充，用来做无条件生成    tokens[batchsize:, 1:] = vl_chat_processor.pad_id    inputs_embeds = vl_gpt.language_model.get_input_embeddings()(tokens)    print("inputs_embeds shape:", inputs_embeds.shape)    # we remove the last <bog> token and replace it with t_emb later    inputs_embeds = inputs_embeds[:, :-1, :]         # generate with rectified flow ode    # step 1: encode with vision_gen_enc    # 并不是在原始图像空间随机的噪声，而是在latent space    z = torch.randn((batchsize, 4, 48, 48), dtype=torch.bfloat16).cuda(cuda_num)        dt = 1.0 / num_inference_steps    dt = torch.zeros_like(z).cuda(cuda_num).to(torch.bfloat16) + dt     # step 2: run ode    attention_mask = torch.ones((2batchsize, inputs_embeds.shape[1]+577)).to(vl_gpt.device)    attention_mask[batchsize:, 1:inputs_embeds.shape[1]] = 0    attention_mask = attention_mask.int()    for step in range(num_inference_steps):        # prepare inputs for the llm        z_input = torch.cat([z, z], dim=0) # for cfg        t = step / num_inference_steps  1000.        t = torch.tensor([t]  z_input.shape[0]).to(dt)        # # z_input shape: [bz2, 4, 48, 48] t shape: [10]        print(f"z_input shape:{z_input.shape} t shape: {t.shape}" )        z_enc = vl_gpt.vision_gen_enc_model(z_input, t)        z_emb, t_emb, hs = z_enc[0], z_enc[1], z_enc[2]        #  # step 14 z_emb shape:torch.Size([10, 768, 24, 24]) t_emb shape: torch.Size([10, 2048]) hs:1 hs[0] shape: torch.Size([10, 768, 24, 24])        print(f"step {step} z_emb shape:{z_emb.shape} t_emb shape: {t_emb.shape} hs:{len(hs)} hs[0] shape: {hs[0].shape}" )        z_emb = z_emb.view(z_emb.shape[0], z_emb.shape[1], -1).permute(0, 2, 1)        # vision_gen_enc_aligner output: torch.Size([bz2, 576, 2048])        z_emb = vl_gpt.vision_gen_enc_aligner(z_emb)        print(f"vision_gen_enc_aligner output: {z_emb.shape}")        llm_emb = torch.cat([inputs_embeds, t_emb.unsqueeze(1), z_emb], dim=1)        # inference step {step} inputs_embeds:[bz2, input_len-1, 2048] t_emb:[bz2, 2048] z_emb:[bz2, 576, 2048]        print(f"inference step {step} inputs_embeds:{inputs_embeds.shape} t_emb:{t_emb.shape} z_emb:{z_emb.shape}")        # input to the llm        # we apply attention mask for CFG: 1 for tokens that are not masked, 0 for tokens that are masked.        if step == 0:            outputs = vl_gpt.language_model.model(inputs_embeds=llm_emb,                                              use_cache=True,                                              attention_mask=attention_mask,                                             past_key_values=None)            # 这块有bug？并没有cache住k和v            past_key_values = []            for kv_cache in past_key_values:                k, v = kv_cache[0], kv_cache[1]                past_key_values.append((k[:, :, :inputs_embeds.shape[1], :], v[:, :, :inputs_embeds.shape[1], :]))            past_key_values = tuple(past_key_values)            print(f"step 0 past_key_values: {past_key_values}")        else:            outputs = vl_gpt.language_model.model(inputs_embeds=llm_emb,                                              use_cache=True,                                              attention_mask=attention_mask,                                             past_key_values=past_key_values)        hidden_states = outputs.last_hidden_state        # [bz2, input_len+576, 2048]        print(f"hidden_states 1 shape: {hidden_states.shape}")        # transform hidden_states back to v        hidden_states = vl_gpt.vision_gen_dec_aligner(vl_gpt.vision_gen_dec_aligner_norm(hidden_states[:, -576:, :]))        hidden_states = hidden_states.reshape(z_emb.shape[0], 24, 24, 768).permute(0, 3, 1, 2)        # hidden_states shape: [bz2, 768, 24, 24]        print(f"hidden_states 2 shape: {hidden_states.shape}")        v = vl_gpt.vision_gen_dec_model(hidden_states, hs, t_emb)        v_cond, v_uncond = torch.chunk(v, 2)        print(f"v:{v.shape} v_cond:{v_cond.shape} v_uncond:{v_uncond.shape}")        v = cfg_weight  v_cond - (cfg_weight-1.)  v_uncond        z = z + dt  v        # z shape: [bz, 4, 48, 48]        print(f"z shape: {z.shape}")            # step 3: decode with vision_gen_dec and sdxl vae    decoded_image = vae.decode(z / vae.config.scaling_factor).sample    # decoded_image shape: torch.Size([bz, 3, 384, 384])    print(f"decoded_image shape: {decoded_image.shape}")        os.makedirs('generated_samples', exist_ok=True)    save_path = os.path.join('./janusflow_generated_samples', "img.jpg")    torchvision.utils.save_image(decoded_image.clip_(-1.0, 1.0)0.5+0.5, save_path)  
generate(    vl_gpt,    vl_chat_processor,    prompt,    cfg_weight=2.0,    num_inference_steps=30,    batchsize=5)

2

图像生成编码器/解码器原理

讲解这部分时，会借助上文贴的jansflow推理代码。

flow模型编码器的主要作用是对输入噪声 z_input（shape:[4,48,48]）做变换，输出shape为[768, 24, 24]的feature map z_emb。同时也需要将时间数值t变换为一个dim为2048的向量t_emb， 用来给下游的LLM和flow编码器图像处理部分感知当前是第几次迭代 。

从janusflow的config.json文件中可知，flow模型的编码器在ShallowUViTEncoder类中定义。其处理图像的部分本质是由二维卷积层和ConvNeXt block堆叠而成。ConvNeXt block是ReNet的一种改进，是vision transformer（ViT）block之后的产物，在transformer结构大行其道的今天，也算是一种文艺复兴了。ConvNeXt block的结果如下：

class ConvNextBlock(nn.Module):    def __init__(self,channels,norm_eps,elementwise_affine,use_bias,hidden_dropout,hidden_size,res_ffn_factor: int = 4,):        super().__init__()        self.depthwise = nn.Conv2d(channels,channels,kernel_size=7,padding=3,groups=channels,bias=use_bias,)        self.norm = RMSNorm(channels, norm_eps)        self.channelwise_linear_1 = nn.Linear(            channels, int(channels  res_ffn_factor), bias=use_bias        )        self.channelwise_act = nn.GELU()        self.channelwise_norm = GlobalResponseNorm(int(channels  res_ffn_factor))        self.channelwise_linear_2 = nn.Linear(int(channels  res_ffn_factor), channels, bias=use_bias)        self.channelwise_dropout = nn.Dropout(hidden_dropout)        self.cond_embeds_mapper = nn.Linear(hidden_size, channels  2, use_bias)  
    def forward(self, x, cond_embeds):        x_res = x        x = self.depthwise(x)        x = x.permute(0, 2, 3, 1)        x = self.norm(x)        x = self.channelwise_linear_1(x)        x = self.channelwise_act(x)        x = self.channelwise_norm(x)        x = self.channelwise_linear_2(x)        x = self.channelwise_dropout(x)        x = x.permute(0, 3, 1, 2)        x = x + x_res  
        scale, shift = self.cond_embeds_mapper(F.silu(cond_embeds)).chunk(2, dim=1)        # x = x  (1 + scale[:, :, None, None]) + shift[:, :, None, None]        x = torch.addcmul(            shift[:, :, None, None], x, (1 + scale)[:, :, None, None], value=1        )        return x

ConvNeXt block就是由卷积层和mlp构成的，但是有以下几个结构特点，使得其有更好的效果：

- 深度可分离卷积：self.depthwise定义的卷积层有个参数是groups=channels，即在做卷积操作时，在channels维度是分组做的（正常的卷积操作卷积操作贯穿所有channel），组数（group）是通道个数（channels），就是每个通道有自己独立的卷积运算。

- 大卷积核：卷积层的kernel_size=7，一般的kernel_size为1/3/5的比较多。

- 逐通道线性变换：self.channelwise_linear_1和self.channelwise_linear_2对feature map的每个通道分别做线性变化。

可以发现，ConvNextBlock最终输出之前需要和cond_embeds进行交互， cond_embeds其实就是关于时间得t_emb，进而让图像处理部分也能感知到当前是迭代第几次了 。

时间embedding t_emb是通过Timesteps层和TimestepEmbedding层将数值t变换而来的，这两个层由diffusers库中定义，link，定义形式如下：

def get_timestep_embedding(    timesteps: torch.Tensor,    embedding_dim: int,    flip_sin_to_cos: bool = False,    downscale_freq_shift: float = 1,    scale: float = 1,    max_period: int = 10000,):    assert len(timesteps.shape) == 1, "Timesteps should be a 1d-array"​    half_dim = embedding_dim // 2    exponent = -math.log(max_period)  torch.arange(        start=0, end=half_dim, dtype=torch.float32, device=timesteps.device    )    exponent = exponent / (half_dim - downscale_freq_shift)    emb = torch.exp(exponent)    emb = timesteps[:, None].float()  emb[None, :]    # scale embeddings    emb = scale  emb    # concat sine and cosine embeddings    emb = torch.cat([torch.sin(emb), torch.cos(emb)], dim=-1)    # flip sine and cosine embeddings    if flip_sin_to_cos:        emb = torch.cat([emb[:, half_dim:], emb[:, :half_dim]], dim=-1)    # zero pad    if embedding_dim % 2 == 1:        emb = torch.nn.functional.pad(emb, (0, 1, 0, 0))    return emb​=======================================================class Timesteps(nn.Module):    def __init__(self, num_channels: int, flip_sin_to_cos: bool, downscale_freq_shift: float, scale: int = 1):        super().__init__()        self.num_channels = num_channels        self.flip_sin_to_cos = flip_sin_to_cos        self.downscale_freq_shift = downscale_freq_shift        self.scale = scale​    def forward(self, timesteps):        # 类似于rope位置编码，返回一个embedding        t_emb = get_timestep_embedding(            timesteps,            self.num_channels,            flip_sin_to_cos=self.flip_sin_to_cos,            downscale_freq_shift=self.downscale_freq_shift,            scale=self.scale,        )        return t_emb#======================================================class TimestepEmbedding(nn.Module):    def __init__(        self,        in_channels: int,        time_embed_dim: int,        act_fn: str = "silu",        out_dim: int = None,        post_act_fn: Optional[str] = None,        cond_proj_dim=None,        sample_proj_bias=True,    ):        super().__init__()        self.linear_1 = nn.Linear(in_channels, time_embed_dim, sample_proj_bias)        if cond_proj_dim is not None:            self.cond_proj = nn.Linear(cond_proj_dim, in_channels, bias=False)        else:            self.cond_proj = None        self.act = get_activation(act_fn)        if out_dim is not None:            time_embed_dim_out = out_dim        else:            time_embed_dim_out = time_embed_dim        self.linear_2 = nn.Linear(time_embed_dim, time_embed_dim_out, sample_proj_bias)​        if post_act_fn is None:            self.post_act = None        else:            self.post_act = get_activation(post_act_fn)​    def forward(self, sample, condition=None):        if condition is not None:            sample = sample + self.cond_proj(condition)        sample = self.linear_1(sample)​        if self.act is not None:            sample = self.act(sample)        sample = self.linear_2(sample)        if self.post_act is not None:            sample = self.post_act(sample)        return sample

Timesteps层调用get_timestep_embedding函数 将timestep数值转换为位置编码向量，link。TimestepEmbedding层通过一系列mlp操作位置编码向量，加强该向量的时间表征能力。

flow编码器最终返回了图像feature map（z_emb，shape:[bz 2, 768, 24,24]）和时间向量（t_emb, shape[bz2,2048]），供下游LLM使用。

图像feature map z_emb之后还需要过一个图像/文本对齐层vision_gen_enc_aligner，结构就是一个从768维映射到2048维的MLP，将z_emb的shape变为[bz2, 576, 2048]。

最后非常简单粗暴的将文本prompt的embedding（inputs_embeds）、时间向量embedding（t_emb），和图像feature map embedding（z_emb）concat起来，输入的LLM中进行运算。将文本prompt的embedding和图像的embedding拼接到同一条序列维度上，利用LLM自带的self attention机制进行文本和图像的交互， 进而实现了文本可控的图像生成 。

llm_emb = torch.cat([inputs_embeds, t_emb.unsqueeze(1), z_emb], dim=1)

和Janus模型使用LLM的方式不同，Janusflow并不需要不断的进行next token预测，而只需要对输入进行运算一次(类似于LLM推理时候的prefill环节，但是需要迭代多次)。

在LLM的输出中，最后576个token对应着图像相关的内容，将其取出来，用一个MLP（vision_gen_dec_aligner层）将2048维映射到768维度，reshap之后得到shape为[bz2, 768, 24, 24]的tensor，送入flow模型的解码器vision_gen_dec_model中，该模型实现在Janus/janus/janusflow/models/uvit.py的ShallowUViTDecoder类中，其主干模型使用了和flow模型编码器一样堆叠ConvNeXt block的结构，输出shape为[bz2, 4, 48, 48]。笔者发现，在flow decoder的解码过程中，进行了24 24 -> 48 48的两倍上采样，但是这块并没有用线性插值的方法，而是使用了torch提供的PixelShuffle操作。比如有shape为 (batch_size, C r^2, H, W) 的特征图， PixelShuffle会将其reshape为(batch_size, C, H r, W r)，说白了就是把通道维度的dim，reshape到H和W维度上。最后，将flow decoder的输出在batch 维度劈开，做一下cfg加权处理。

上边介绍了了这么多，一通flow encoder、LLM、flow decoder处理，看起来就是对噪声用NN进行一通变换， rectified flow模型生成图像的逻辑在哪呢？ 在janusflow模型的推理代码中，主要就是如下这一行代码逻辑：

z = z + dt  v

rectified flow模型将生成图像的过程抽象为位移-速度模型。flow encoder的原始输入是等号右边的z，flow decoder的输出 预测的是速度v ，即图像变化的速率，乘上步长dt后就可以更新一次图像生成过程了，这个过程需要迭代多次。更加详细的rectified flow模型数学原理与推导可以看作者更新的知乎文章：

[ICLR2023] 扩散生成模型新方法：极度简化，一步生成

笔者也是最近两三个月才开始接触图像生成模型的，不管是diffusion模型还是flow模型，最后抽象出来的公式形式都不是十分复杂，但是推导过程需要扎实的数学功底，和LLM“暴力出奇迹”的风格有着鲜明的对比。

janusflow训练流程

janusflow的训练流程如下图所示，也是分阶段的。笔者觉得图像生成训练用到的VAE Enc.不应该放到下边的模型输入部分，输入的是噪声，在latent space里sample就好了，VAE Enc编码目标图像是为了做训练的标签，放到图上方模型输出部分更合适些。

- stage1：只训练随机初始化的组件，包括图像理解任务用到的图像适配器、图像生成任务用的flow模型的encoder和decoder。

- stage2：训练除视觉理解编码器和VAE模型以外的所有模型。训练初期使用更多的多模态理解数据，训练后期更多的图像生成数据。

- stage3：有监督微调阶段，解冻了除了VAE模型以外的所有模块，让模型学会指令遵循。

各阶段的超参数如下所示：data raio是多模态理解数据：图像生成：纯文本生成数据的比例。

训练loss方面，多模态理解任务的loss就是交叉熵损失函数，预测下一个文本token的类别。图片生成的loss有两个，主loss的形式如下所示，和rectified flow模型的形式一致：

Z0是随机噪声，Z1是目标图像（或者说是原始图像经过VAE编码后的tensor），v是flow decoder输出的预测内容，loss需要考虑不同t情况下的预测结果。可以发现，不同t情况下，预测目标都是Z1-Z0，这是因为，rectified flow假设生成图像是“走直线”的过程，因此生成图像的过程中不同位置的斜率（v）都是一样的。

​图像生成过程中还有一个辅助loss如下所示：

f_enc是图像理解编码器，q(z_t）是LLM的中间表示，h是一个mlp的线性变换，将LLM中间表示的dim对齐图像理解编码器的dim。这个loss的作用是在做图像生成任务时，别让LLM的中间表示离图像理解任务偏离太远。计算这个loss时候，图像理解编码器部分是停梯度的，即不参与参数更新。

效果展示

使用上一篇文章相同的prompt进行图片生成，官方demo的默认参数。感觉JanusFlow的效果比Janus还要差些，尤其是中文prompt，太糊了。多模态理解与生成统一模型大业道阻且长，各大厂加油。

prompt：A cat is running on the grass.

prompt:一只猫在草地上奔跑。

点个关注再走吧~
