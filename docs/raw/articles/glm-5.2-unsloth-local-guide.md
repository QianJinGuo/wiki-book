---
title: GLM-5.2 How to Run Locally - Unsloth
source_url: https://unsloth.ai/docs/models/glm-5.2
ingested: 2026-06-24
sha256: newsletter-fetch
tags: [glm, unsloth, quantization, local-inference]
---

# GLM-5.2 - How to Run Locally

⌘Ctrl k

1.   [Models](http://unsloth.ai/docs/models)

## GLM-5.2 - How to Run Locally

Run the new GLM-5.2 model by Z.ai on local hardware!

GLM-5.2 is Z.ai’s new open model, delivering SOTA performance across long-horizon coding, reasoning, and agentic tasks. With **744B parameters**, 40B active parameters, and a **1M context** window, it can now be run locally using [Unsloth Dynamic](http://unsloth.ai/docs/basics/unsloth-dynamic-2.0-ggufs) GGUFs. GLM-5.2 is the **strongest open model** to date, performing on par with Claude 4.8 Opus, GPT-5.5, and Gemini 3.1 Pro across Artificial Analysis and many other benchmarks.

[Dynamic 1-bit reaches **~76.2%**](http://unsloth.ai/docs/models/glm-5.2#quantization-analysis) top-1 accuracy while being **86% smaller**. Dynamic 2-bit reaches **~82%** accuracy while being **84% smaller**. This means the model is not 82% worse since it's 84% smaller - it rather is only ~18% less accurate than the full **1.5TB** model. Thanks Z.ai for giving Unsloth day-zero access. [**GLM-5.2-GGUF**](https://huggingface.co/unsloth/GLM-5.2-GGUF)

[Run GLM-5.2 Tutorials](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-tutorials)[Quantization Results](http://unsloth.ai/docs/models/glm-5.2#quantization-analysis)

#### ⚙️ Usage Guide

The 2-bit dynamic quant `UD-IQ2_M` uses **239GB** of disk space - this can directly fit on a **256GB unified memory Mac**and works well in a **1x24GB GPU**and**256GB of RAM** with MoE offloading.

The **1-bit** quant will fit on a 223GB RAM and 8-bit requires 810GB RAM. See the 1-bit GGUF in action to the right:

![Image 1](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252Foq3aroYI24hXQhrWdHrY%252Fvreferfre.gif%3Falt%3Dmedia%26token%3D3176c78d-a005-4f56-bb07-0af1e9d39105&width=768&dpr=3&quality=100&sign=65fb3a88&sv=2)

**Table: Inference hardware requirements** (units = total memory: RAM + VRAM, or unified memory)

223 GB

245 GB

290-360 GB

372-475 GB

570 GB

810 GB

For best performance, make sure your total available memory, including VRAM and system RAM, exceeds the quantized model file size by a comfortable margin.

GLM-5.2 has **3 thinking modes**. Non-thinking and Thinking in two modes: **High** + **Max**. Use Max Thinking for complicated tasks. In [Unsloth Studio](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-in-unsloth-studio) you can easily toggle High + Max Thinking and non-Thinking with a UI.

Use these settings for most use cases:

`temperature` = 1.0

`temperature` = 1.0

`top_p` = 0.95

`top_p` = 1.0

*   **Maximum context window:**`1,048,576`. 

GLM 5.2 uses reasoning by default. It also supports reasoning efforts where `reasoning_effort` can be "high", "max" or disabled.

To disable thinking, use `--chat-template-kwargs '{"enable_thinking":false}'`. If you're on **Windows** Powershell, use: `--chat-template-kwargs "{\"enable_thinking\":false}"`

You can also use `--reasoning on` or `--reasoning off` in llama.cpp as well now!

For reasoning effort customization and or to disable reasoning, use the below examples:

We also ran KLD (KL Divergence) benchmarks to gauge the accuracy of our quantizations of GLM-5.2-GGUF. Dynamic 4-bit UD-Q4_K_XL and dynamic 5-bit UD-Q5_K_XL are mostly lossless, and smaller quants also work great by dynamically leaving important layers in higher precision, and unimportant ones to low bits.

On pure top-1% accuracy, **dynamic 1-bit gets around 76.2% accuracy yet being 86% smaller**! Dynamic 2-bit gets around 82% accuracy whilst being 84% smaller. This shows dynamically quantizing some layers to higher precision does not make the model 86% worse yet being 86% smaller - but only 24% less capable than the full 1.5TB model.

But what does "76% accuracy" actually describe?

76% top-1% does NOT mean "The capital of France is" becomes choosing 76% Paris and 24% of Sydney. The model is NOT "dumber" by 24%. For this, Paris is always 100%, and Sydney is 0%. The 76% number includes filler words and stop words across the entire corpus for example asking:

"Create a novel" will get due to LLM sampling:

*   I will now create a novel... 
*   The novel is below: 
*   What genre would you like it to be? 

Each example is correct, but the [I, The, What] distribution is what changes - the baseline might use [I] 100% of the time, but now [I] is 76% and [The] is 24%.

It does **NOT** mean that you get incorrect outputs like gibberish or incorrect outputs 24% of the time.

![Image 2](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FJgdvmCITNT51eYmwwJE1%252Fglm52_top1_acc_anchored_vs_gb.png%3Falt%3Dmedia%26token%3D6a08d6cf-7762-45d6-97b9-6106daa89329&width=768&dpr=3&quality=100&sign=5a549303&sv=2)

99.9% KLD is also generally good - there is a larger uplift from 4bit onwards though, so for massive out of distribution tasks, dynamic 4-bit is probably best.

Top-1% is a "forced" binomial distrution of the KLD itself. KLD is the "distance" between the probabilities of the baseline (BF16 or Q8_0) vs the quantized version. The goal of quantization is to minimize the below objective:

$$
\text{minimize}\textrm{ } \frac{1}{n} \sum \text{D}_{\text{KL}} \left[\right. \textrm{ } f \left(\right. q \left(\right. W \left.\right) \left.\right) \textrm{ } \mid \mid \textrm{ } f \left(\right. W \left.\right) \left.\right) \textrm{ } \left]\right.
$$

minimize n 1​∑D KL​[f(q(W))∣∣f(W))]

Where `f` is the language model's forward and `q` is the quantization operation and `W` is the parameters or weights of the model. The goal is to make the "distance" between the logits output of the baseline `f(W)` and the quantized model's output as small as possible. If you can make 0 KLD, then you have perfectly reconstructed the model!

![Image 3](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FPadJaaFCzVGfU9uffyvp%252Fglm52_kld_p999_vs_gb.png%3Falt%3Dmedia%26token%3D8472d10b-c59d-4c91-b00a-aea0d2e80b04&width=768&dpr=3&quality=100&sign=ad3c321a&sv=2)

We use **mean KLD** like below since it's expensive to run KLD across the full training corpus (15T tokens for example) - instead we do **sampling,** and get a small representative subset of the training corpus**/** downstream task, and optimize that.Mean KLD generally follows a monotonic trend vs disk space, and shows even at 1-bit GLM 5.2 works well!

Top-1% accuracy is simply a greedy decoding operator where we assume the argmax item will be picked, and for 1bit, 76% it picks the same as the argmax from the baseline.

![Image 4](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252Ft8XhLf9BgltHhIZtj852%252Fglm52_kld_mean_vs_gb.png%3Falt%3Dmedia%26token%3De9cf3d6c-0c56-4a79-8970-47b5e08881dc&width=768&dpr=3&quality=100&sign=f83f68d3&sv=2)

You can now run GLM-5.2 in [llama.cpp](http://unsloth.ai/docs/models/glm-5.2#run-in-llama.cpp) and [Unsloth Studio](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-in-unsloth-studio). We will be utilizing the 239GB [`UD-IQ2_M`](https://huggingface.co/unsloth/GLM-5.2-GGUF/tree/main/UD-IQ2_M) quant for best results in terms of accessbility and accuracy.

GLM-5.2 can run in [Unsloth Studio](http://unsloth.ai/docs/new/studio), an open-source web UI for local AI. **Unsloth Studio automatically offloads to RAM and detects multiGPU setups**. With Unsloth Studio, you can run models locally on **MacOS, Windows**, Linux and:

*   Search, download, [run GGUFs](http://unsloth.ai/docs/new/studio#run-models-locally) and safetensor models 

*   Fast CPU + GPU inference via llama.cpp 

![Image 5](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FYVcpYHcS7vpnYcZUiwpO%252Fglm52%2520example.png%3Falt%3Dmedia%26token%3Dd218ed4e-5102-48a6-943a-7d6b7a10446f&width=768&dpr=3&quality=100&sign=85d39cb6&sv=2)

2-bit GLM-5.2 GGUF output

**Install and Launch Unsloth**

To install, run in your terminal:

MacOS, Linux, WSL:

Windows PowerShell:

**Launch Unsloth**

MacOS, Linux, WSL and Windows:

Then open `http://127.0.0.1:8888` (or your specific URL) in your browser.

**Launch Unsloth securely with HTTPS and Cloudflare**

**NEW!**Unsloth now provides a secure way to launch Studio over HTTPS through a free Cloudflare tunnel. Use the below (works in Windows, Mac & Linux):

**Search and download GLM-5.2**

Unsloth Studio automatically offloads to RAM and detects multiGPU setups. On first launch you will need to create a password to secure your account and sign in again later.

Then go to the [Studio Chat](http://unsloth.ai/docs/new/studio/chat) tab and search for **GLM-5.2** in the search bar and download your desired model and quant. Ensure you have enough compute the run the model.

![Image 6](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252Fo4JBdOgos6gNYsJhhDKh%252Fglm52%2520unsloth.png%3Falt%3Dmedia%26token%3Dd632e8de-c14a-420f-b1e4-8de4ab7b0f91&width=768&dpr=3&quality=100&sign=b3263898&sv=2)

**Run GLM-5.2**

Inference parameters should be auto-set when using Unsloth Studio, however you can still change it manually. You can also edit the context length, chat template and other settings.

For more information, you can view our [Unsloth Studio inference guide](http://unsloth.ai/docs/new/studio/chat).

![Image 7](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FlsRhkByA0mzesSx7bCyW%252Ffinal%2520gifffff.gif%3Falt%3Dmedia%26token%3Dcb55fd66-9f3c-429c-8d86-99b3f930455e&width=768&dpr=3&quality=100&sign=b4cbfe97&sv=2)

Example of 1-bit GLM-5.2 running with Canvas

For this guide we'll be running the `UD-IQ2_M` quant which will require at least 245GB RAM. Feel free to change quantization type. For these tutorials, we will using [llama.cpp](llama.cpphttps://github.com/ggml-org/llama.cpp) for fast local inference. GGUF: [**GLM-5.2-GGUF**](https://huggingface.co/unsloth/GLM-5.2-GGUF)

Obtain the latest `llama.cpp`**on**[**GitHub here**](https://github.com/ggml-org/llama.cpp). You can follow the build instructions below as well. Change `-DGGML_CUDA=ON` to `-DGGML_CUDA=OFF` if you don't have a GPU or just want CPU inference. **For Apple Mac / Metal devices**, set `-DGGML_CUDA=OFF` then continue as usual - Metal support is on by default.

You can now use `llama.cpp` directly to load and download models, just like `ollama run`. First, select the quantization type you want like `UD-IQ2_M`. Also use `export LLAMA_CACHE="unsloth/GLM-5.2-GGUF"` to force `llama.cpp` to save to a specific location. **Note this download process might be very slow**, so it's probably best to use the manual download process in the next section.

If you want to download the model manually **(much faster!)**, we can download the model via the code below (after installing `pip install huggingface_hub`). If downloads get stuck, see: [Hugging Face Hub, XET debugging](http://unsloth.ai/docs/basics/troubleshooting-and-faqs/hugging-face-hub-xet-debugging)

If you want to use the dynamic 1bit, then do:

Then run the model in conversation mode. Use `unsloth/GLM-5.2-GGUF/UD-IQ2_M/GLM-5.2-UD-IQ2_M-00001-of-00006.gguf` for 2bit or `unsloth/GLM-5.2-GGUF/UD-IQ1_S/GLM-5.2-UD-IQ1_S-00001-of-00006.gguf` for 1bit.

When you launch llama-cli, you will see:

![Image 8](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FUalNNvFxH613C9kcM3r4%252Fimage.png%3Falt%3Dmedia%26token%3Df376e93d-26af-472f-8ea3-0968b57b004c&width=768&dpr=3&quality=100&sign=e565ab6c&sv=2)

Then after prompting it to make a short Flappy Bird game, we get:

![Image 9](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FDKENC30N1ZI8cKzWuuWf%252Fimage.png%3Falt%3Dmedia%26token%3Dc7dfbaa7-1635-4e58-b0cb-94749164dac2&width=768&dpr=3&quality=100&sign=d258901b&sv=2)

With the full conversation and game below:

Full game in HTML[](http://unsloth.ai/docs/models/glm-5.2#full-game-in-html)

Full conversation[](http://unsloth.ai/docs/models/glm-5.2#full-conversation)

And the game has sound and works wonderfully! Reminder this was a 1-bit quantization and it worked well!

![Image 10](https://unsloth.ai/docs/~gitbook/image?url=https%3A%2F%2F3215535692-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxhOjnexMCB3dmuQFQ2Zq%252Fuploads%252FJDcNNfkYzRVNOO494JbR%252Fimage.png%3Falt%3Dmedia%26token%3Db23cc27d-3c2f-4e18-bb21-997aba799c1e&width=768&dpr=3&quality=100&sign=9e637644&sv=2)

### 📐Long context via KV Cache quantization

To utilize long context in llama.cpp, we need to employ KV cache quantization to reduce memory usage. Recently llama.cpp added higher accuracy tricks to KV cache quantization - [see](https://github.com/ggml-org/llama.cpp/pull/21038) and other PRs!

Currently, these KV cache dtypes are supported:

By default `f16` is used. If you use `q4_0` which is around 4.5 bits per weight, you can extend around 16 / 4.5 = **3.5x longer context lengths**! So if you model used to support 10K, 35K can be in reach! `q4_1` is probably better since you also get a shifting parameter, and is 5 bits per weight - so 3.2x longer contexts.

Use it like below:

You can view further below for GLM-5.2 benchmarks in table format:

**Reasoning**

HLE

40.5

49.8*

41.4*

45

31

41.4

37

37.7

HLE (w/ Tools)

54.7

57.9*

52.2*

51.4*

52.3

53.5

-

48.2

CritPt

20.9

20.9

27.1

17.7

4.6

13.4

3.7

12.9

AIME 2026

99.2

95.7

98.3

98.2

95.3

97

-

94.6

HMMT Nov. 2025

94.4

96.5

96.5

94.8

94

95

84.4

94.4

HMMT Feb. 2026

92.5

96.7

96.7

87.3

82.6

97.1

84.4

95.2

IMOAnswerBench

91.0

83.5

-

81

83.8

90

-

89.8

GPQA-Diamond

91.2

93.6

93.6

94.3

86.2

90

93

90.1

**Coding**

SWE-bench Pro

62.1

69.2

58.6

54.2

58.4

60.6

59

55.4

NL2Repo

48.9

69.7

50.7

33.4

42.7

47.2

42.1

35.5

DeepSWE

46.2

58

70

10

18

18

20

8

ProgramBench

63.7

71.9

70.8

39.5

50.9

-

-

47.8

Terminal Bench 2.1 (Terminus-2)

81.0

85

84

74

63.5

75

65

64

Terminal Bench 2.1 (Best Reported Harness)

82.7

78.9

83.4

70.7

69

-

-

-

FrontierSWE (Dominance)

74.4

75.1

72.6

39.6

30.5

-

-

29.0

PostTrainBench

34.3

37.2

28.4

21.6

20.1

-

-

-

SWE-Marathon

13.0

26.0

12.0

4.0

1.0

-

-

-

**Agentic**

MCP-Atlas (Public Set)

76.8

77.8

75.3

69.2

71.8

76.4

74.2

73.6

Tool-Decathlon

48.2

59.9

55.6

48.8

40.7

-

-

52.8

Last updated 19 hours ago

Was this helpful?

*   [Recommended Settings](http://unsloth.ai/docs/models/glm-5.2#recommended-settings)
*   [📈 Quantization analysis](http://unsloth.ai/docs/models/glm-5.2#quantization-analysis)
*   [Run GLM-5.2 Tutorials:](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-tutorials)
*   [🦥 Run GLM-5.2 in Unsloth Studio](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-in-unsloth-studio)
*   [🦙 Run GLM-5.2 in llama.cpp](http://unsloth.ai/docs/models/glm-5.2#run-glm-5.2-in-llama.cpp)
*   [📐Long context via KV Cache quantization](http://unsloth.ai/docs/models/glm-5.2#long-context-via-kv-cache-quantization)
*   [📊 Benchmarks](http://unsloth.ai/docs/models/glm-5.2#benchmarks)

Was this helpful?

```
--chat-template-kwargs '{"reasoning_effort":"max"}'
--chat-template-kwargs '{"reasoning_effort":"high"}'
--chat-template-kwargs '{"enable_thinking":false}'
```

`curl -fsSL https://unsloth.ai/install.sh | sh`

`irm https://unsloth.ai/install.ps1 | iex`

`unsloth studio -H 0.0.0.0 -p 8888`

`unsloth studio --secure`

```
apt-get update
apt-get install pciutils build-essential cmake curl libcurl4-openssl-dev -y
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build \
    -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=ON
cmake --build llama.cpp/build --config Release -j --clean-first --target llama-cli llama-mtmd-cli llama-server llama-gguf-split
cp llama.cpp/build/bin/llama-* llama.cpp
```

```
export LLAMA_CACHE="unsloth/GLM-5.2-GGUF"
./llama.cpp/llama-cli \
    -hf unsloth/GLM-5.2-GGUF:UD-IQ2_M \
    --temp 1.0 \
    --top-p 0.95 \
    --min-p 0.01
```

```
hf download unsloth/GLM-5.2-GGUF \
    --local-dir unsloth/GLM-5.2-GGUF \
    --include "*UD-IQ2_M*" # Use "*UD-Q8_K_XL*" for near full precision
```

```
hf download unsloth/GLM-5.2-GGUF \
    --local-dir unsloth/GLM-5.2-GGUF \
    --include "*UD-IQ1_S*"
```

```
./llama.cpp/llama-cli \
    --model unsloth/GLM-5.2-GGUF/UD-IQ2_M/GLM-5.2-UD-IQ2_M-00001-of-00006.gguf \
    --temp 1.0 \
    --top-p 0.95 \
    --min-p 0.01
```

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Sunset Flier</title>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fred:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --sunset-1: #ff6b6b;
    --sunset-2: #feca50;
    --sunset-3: #ff9ff3;
    --dusk: #36306b;
    --night: #1a1746;
    --accent: #ffd93b;
    --coral: #ff6b6b;
    --pipe: #4a902b;
    --pipe-dark: #2d5a1a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: var(--night);
    font-family: 'Fred', sans-serif;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }

  #game-wrap {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, #1a1746 0%, #36306b 40%, #ff6b6b 70%, #feca50 100%);
  }

  #game-frame {
    position: relative;
    width: min(100vw, 480px);
    height: min(100vh, 720px);
    max-height: 100vh;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
    overflow: hidden;
    background: linear-gradient(180deg, #4a3a8e 0%, #ff6b6b 60%, #feca50 100%);
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 10;
    transition: opacity 0.3s ease;
  }

  .overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .panel {
    background: rgba(26, 23, 70, 0.85);
    border: 3px solid var(--accent);
    border-radius: 16px;
    padding: 28px 36px;
    text-align: center;
    color: #fff;
    box-shadow: 0 12px 0 rgba(0,0,0,0.3), 0 0 40px rgba(255, 217, 59, 0.4);
    backdrop-filter: blur(4px);
    transform: translateY(0);
    animation: bob 3s ease-in-out infinite;
  }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .title {
    font-family: 'Press Start 2P', monospace;
    font-size: 26px;
    color: var(--accent);
    text-shadow: 3px 3px 0 #b87c0a, 6px 6px 0 rgba(0,0,0,0.3);
    letter-spacing: 1px;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 14px;
    color: #ffe8a8;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .tap-icon {
    font-size: 42px;
    margin: 8px 0;
    animation: tap 1.2s ease-in-out infinite;
  }

  @keyframes tap {
    0%, 50% { transform: translateY(0) scale(1); }
    20% { transform: translateY(-8px) scale(1.1); }
  }

  .instructions {
    font-size: 13px;
    color: #fff;
    opacity: 0.85;
    margin-top: 10px;
    font-weight: 400;
  }

  .score-row {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin: 12px 0 20px;
  }

  .score-box {
    background: rgba(0,0,0,0.4);
    border: 2px solid var(--accent);
    border-radius: 10px;
    padding: 10px 18px;
    min-width: 80px;
  }

  .score-box .label {
    font-family: 'Press Start 2p', monospace;
    font-size: 9px;
    color: var(--accent);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .score-box .value {
    font-family: 'Press Start 2p', monospace;
    font-size: 18px;
    color: #fff;
  }

  .score-box.best .value { color: var(--coral); }

  .btn {
    font-family: 'Press Start 2p', monospace;
    font-size: 12px;
    color: var(--night);
    background: var(--accent);
    border: none;
    padding: 12px 22px;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: 1px;
    box-shadow: 0 6px 0 #b87c0a, 0 8px 12px rgba(0,0,0,0.3);
    transition: transform 0.1s, box-shadow 0.1s;
    pointer-events: auto;
  }

  .btn:hover { transform: translateY(2px); box-shadow: 0 4px 0 #b87c0a, 0 6px 10px rgba(0,0,0,0.3); }
  .btn:active { transform: translateY(6px); box-shadow: 0 0 0 #b87c0a, 0 2px 6px rgba(0,0,0,0.3); }

  #hud {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    font-family: 'Press Start 2P', monospace;
    font-size: 36px;
    color: #fff;
    text-shadow: 3px 3px 0 #b87c0a, 5px 5px 0 rgba(0,0,0,0.5);
    pointer-events: none;
    transition: opacity 0.3s;
    opacity: 0;
  }

  #hud.visible { opacity: 1; }

  #hud .new-best {
    font-size: 11px;
    color: var(--coral);
    text-shadow: 2px 2px 0 #000;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  #hud.has-new-best .new-best { opacity: 1; animation: pulse 0.6s ease infinite alternate; }

  @keyframes pulse {
    from { transform: translateX(-50%) scale(1); }
    to { transform: translateX(-50%) scale(1.15); }
  }

  .medal {
    font-family: 'Press Start 2P', monospace;
    font-size: 48px;
    margin: 10px 0;
    text-shadow: 3px 3px 0 #000;
  }

  .flash {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    z-index: 8;
  }

  .footer {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    font-weight: 400;
    text-align: center;
    pointer-events: none;
    z-index: 9;
  }
</style>
</head>
<body>
<div id="game-wrap">
  <div id="game-frame">
    <canvas id="canvas"></canvas>
    <div id="hud" class="hud">
      <div id="hud-score">0</div>
      <div class="new-best">NEW BEST!</div>
    </div>
    <div id="flash" class="flash"></div>

    <!-- Start screen -->
    <div id="start-screen" class="overlay visible">
      <div class="panel">
        <div class="title">SUNSET<br>FLIER</div>
        <div class="subtitle">— dusk flight —</div>
        <div class="tap-icon">✊</div>
        <div class="instructions">TAP / SPACE / CLICK to flap</div>
      </div>
    </div>

    <!-- Game over screen -->
    <div id="end-screen" class="overlay hidden">
      <div class="panel">
        <div class="title" style="font-size:22px;color:var(--coral);">GAME OVER</div>
        <div id="medal" class="medal" style="display:none;">★</div>
        <div class="score-row">
          <div class="score-box">
            <div class="label">SCORE</div>
            <div class="value" id="end-score">0</div>
          </div>
          <div class="score-box best">
            <div class="label">BEST</div>
            <div class="value" id="end-best">0</div>
          </div>
        </div>
        <button class="btn" id="restart-btn">RETRY</button>
      </div>
    </div>

    <div class="footer">Sound on • Tap to fly</div>
  </div>
</div>

<script>
(() => {
  // ============ Setup ============
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const frame = document.getElementById('game-frame');
  const hud = document.getElementById('hud');
  const hudScore = document.getElementById('hud-score');
  const startScreen = document.getElementById('start-screen');
  const endScreen = document.getElementById('end-screen');
  const endScore = document.getElementById('end-score');
  const endBest = document.getElementById('end-best');
  const medalEl = document.getElementById('medal');
  const flashEl = document.getElementById('flash');
  const restartBtn = document.getElementById('restart-btn');

  let W = 480, H = 720;
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = frame.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ============ Audio (Web Audio API) ============
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freq, dur=0.1, type='square', vol=0.1, slideTo=null) {
    const ac = getAudio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  const sfx = {
    flap: () => beep(420, 0.12, 'square', 0.08, 720),
    score: () => { beep(880, 0.08, 'triangle', 0.12); setTimeout(()=>beep(1320, 0.1, 'triangle', 0.1), 60); },
    hit: () => { beep(180, 0.25, 'sawtooth', 0.15, 60); },
    die: () => { beep(120, 0.5, 'sawtooth', 0.15, 40); }
  };

  // ============ Game State ============
  const STATE = { READY: 0, PLAYING: 1, DYING: 2, OVER: 3 };
  let state = STATE.READY;

  let bird, pipes, particles, score, best, frameCount, shake, groundX, clouds, stars;

  best = parseInt(localStorage.getItem('sunsetFlierBest') || '0', 10) || 0;
  endBest.textContent = best;

  // ============ Bird ============
  function makeBird() {
    return {
      x: W * 0.32,
      y: H * 0.5,
      vy: 0,
      radius: 14,
      wingPhase: 0,
      rotation: 0,
      alive: true
    };
  }

  // ============ Pipes ============
  const PIPE_W = 68;
  const PIPE_GAP = 180;
  const PIPE_SPEED = 2.6;
  const PIPE_SPACING = 220;

  function makePipe(x) {
    const minY = 90;
    const maxY = H - 90 - PIPE_GAP;
    const gapY = minY + Math.random() * (maxY - minY);
    return { x, gapY, scored: false, passed: false };
  }

  function initPipes() {
    pipes = [];
    let x = W + 80;
    for (let i = 0; i < 4; i++) {
      pipes.push(makePipe(x));
      x += PIPE_SPACING;
    }
  }

  // ============ Particles ============
  function spawnParticles(x, y, color, count=10, vel=3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.6 + 0.4) * vel;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: Math.random() * 4 + 2,
        color
      });
    }
  }

  // ============ Background ============
  function initBg() {
    clouds = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * W,
        y: 80 + Math.random() * 180,
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.2 + Math.random() * 0.3
      });
    }
    stars = [];
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.4,
        r: Math.random() * 1.5 + 0.3,
        tw: Math.random() * Math.PI * 2
      });
    }
  }

  // ============ Reset / Start ============
  function reset() {
    bird = makeBird();
    pipes = [];
    particles = [];
    score = 0;
    frameCount = 0;
    shake = 0;
    groundX = 0;
    initPipes();
    initBg();
    hudScore.textContent = '0';
    hud.classList.remove('has-new-best');
  }

  function startGame() {
    state = STATE.PLAYING;
    startScreen.classList.add('hidden');
    startScreen.classList.remove('visible');
    hud.classList.add('visible');
    bird.vy = -7.2;
    sfx.flap();
  }

  function gameOver() {
    state = STATE.DYING;
    sfx.hit();
    setTimeout(sfx.die, 120);
    shake = 18;
    spawnParticles(bird.x, bird.y, '#ffd93b', 24, 5);
    spawnParticles(bird.x, bird.y, '#ff6b6b', 16, 4);
    flashScreen();
    bird.alive = false;

    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      localStorage.setItem('sunsetFlierBest', String(best));
    }

    setTimeout(() => {
      state = STATE.OVER;
      endScore.textContent = score;
      endBest.textContent = best;
      const medal = getMedal(score);
      if (medal) {
        medalEl.style.display = 'block';
        medalEl.textContent = medal.symbol;
        medalEl.style.color = medal.color;
      } else {
        medalEl.style.display = 'none';
      }
      endScreen.classList.remove('hidden');
      endScreen.classList.add('visible');
      if (isNewBest) {
        setTimeout(()=>hud.classList.add('has-new-best'), 0);
      }
    }, 700);
  }

  function flashScreen() {
    flashEl.style.transition = 'none';
    flashEl.style.opacity = '0.9';
    requestAnimationFrame(() => {
      flashEl.style.transition = 'opacity 0.4s ease-out';
      flashEl.style.opacity = '0';
    });
  }

  function getMedal(s) {
    if (s >= 30) return { symbol: '★', color: '#ffd93b' };
    if (s >= 20) return { symbol: '✦', color: '#c0c0c0' };
    if (s >= 10) return { symbol: '✧', color: '#cd7f32' };
    if (s >= 5)  return { symbol: '•', color: '#ff9ff3' };
    return null;
  }

  function restart() {
    reset();
    state = STATE.READY;
    endScreen.classList.add('hidden');
    endScreen.classList.remove('visible');
    startScreen.classList.remove('hidden');
    startScreen.classList.add('visible');
    hud.classList.remove('visible');
    hud.classList.remove('has-new-best');
  }

  // ============ Input ============
  function flap() {
    if (state === STATE.READY) { startGame(); return; }
    if (state === STATE.PLAYING) {
      bird.vy = -7.2;
      bird.wingPhase = 0;
      sfx.flap();
      spawnParticles(bird.x - 8, bird.y + 6, '#fff8d6', 4, 1.5);
    }
    if (state === STATE.OVER) {
      // tap anywhere on end screen also restarts
      // but we let button handle it primarily
    }
  }

  function handleInput(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    flap();
  }

  frame.addEventListener('mousedown', handleInput);
  frame.addEventListener('touchstart', handleInput, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      e.preventDefault();
      if (state === STATE.OVER) restart();
      else flap();
    }
  });
  restartBtn.addEventListener('click', (e) => { e.stopPropagation(); restart(); });

  // ============ Update ============
  const GRAVITY = 0.42;
  const MAX_FALL = 9;

  function update() {
    frameCount++;
    if (state === STATE.READY) {
      // idle bob
      bird.y = H * 0.5 + Math.sin(frameCount * 0.08) * 14;
      bird.wingPhase += 0.2;
      bird.rotation = Math.sin(frameCount * 0.08) * 0.05;
    }

    if (state === STATE.PLAYING) {
      bird.vy += GRAVITY;
      if (bird.vy > MAX_FALL) bird.vy = MAX_FALL;
      bird.y += bird.vy;
      bird.wingPhase += 0.4;
      bird.rotation = Math.max(-0.4, Math.min(1.2, bird.vy * 0.08));

      // Pipes
      for (const p of pipes) {
        p.x -= PIPE_SPEED;
        if (!p.scored && p.x + PIPE_W < bird.x) {
          p.scored = true;
          score++;
          hudScore.textContent = score;
          sfx.score();
          spawnParticles(bird.x, bird.y, '#ffd93b', 8, 2);
        }
      }
      // Remove off-screen pipes, add new
      while (pipes.length > 0 && pipes[0].x + PIPE_W < -10) pipes.shift();
      const last = pipes[pipes.length - 1];
      if (last && last.x < W - PIPE_SPACING) {
        pipes.push(makePipe(last.x + PIPE_SPACING));
      }

      // Collision
      // Ground & ceiling
      const groundY = H - 80;
      if (bird.y + bird.radius > groundY || bird.y - bird.radius < 0) {
        bird.y = Math.max(bird.radius + 1, Math.min(groundY - bird.radius, bird.y));
        gameOver();
        return;
      }
      // Pipes
      for (const p of pipes) {
        if (p.x > bird.x + bird.radius || p.x + PIPE_W < bird.x - bird.radius) continue;
        const top = p.gapY;
        const bottom = p.gapY + PIPE_GAP;
        if (bird.y - bird.radius < top || bird.y + bird.radius > bottom) {
          // collision
          gameOver();
          return;
        }
      }
    }

    if (state === STATE.DYING) {
      bird.vy += GRAVITY * 1.2;
      bird.y += bird.vy;
      bird.rotation += 0.06;
      const groundY = H - 80;
      if (bird.y + bird.radius > groundY) {
        bird.y = groundY - bird.radius;
        bird.vy = 0;
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.02;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Shake decay
    if (shake > 0) shake = Math.max(0, shake - 1.2);

    // Background animations
    for (const c of clouds) {
      c.x -= c.speed;
      if (c.x < -100) c.x = W + 100;
    }
    for (const s of stars) {
      s.tw += 0.05;
    }

    groundX = (groundX - PIPE_SPEED) % 120;
  }

  // ============ Render ============
  function render() {
    ctx.save();
    // Shake
    if (shake > 0) {
      const sx = (Math.random() - 0.5) * shake;
      const sy = (Math.random() - 0.5) * shake;
      ctx.translate(sx, sy);
    }

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a1746');
    sky.addColorStop(0.3, '#4a3a8e');
    sky.addColorStop(0.55, '#ff6b6b');
    sky.addColorStop(0.8, '#feca50');
    sky.addColorStop(1, '#ffd93b');
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // Stars
    for (const s of stars) {
      const a = 0.4 + Math.sin(s.tw) * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sun
    const sunX = W * 0.75;
    const sunY = H * 0.65;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
    sunGlow.addColorStop(0, 'rgba(255,240,160,0.7)');
    sunGlow.addColorStop(0.4, 'rgba(255,200,120,0.3)');
    sunGlow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 200, sunY - 200, 400, 400);

    ctx.fillStyle = '#fff6d0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    for (const c of clouds) {
      drawCloud(c.x, c.y, c.scale);
    }

    // Mountains silhouette
    ctx.fillStyle = 'rgba(40, 30, 80, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.72);
    const peaks = [
      [W * 0.15, H * 0.58],
      [W * 0.25, H * 0.68],
      [W * 0.4, H * 0.52],
      [W * 0.55, H * 0.66],
      [W * 0.7, H * 0.6],
      [W * 0.85, H * 0.68],
      [W, H * 0.62]
    ];
    for (const [px, py] of peaks) ctx.lineTo(px, py);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Pipes
    for (const p of pipes) {
      drawPipe(p);
    }

    // Ground
    drawGround();

    // Bird
    drawBird();

    // Particles
    for (const part of particles) {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.life;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function drawCloud(x, y, scale) {
    ctx.fillStyle = 'rgba(255, 230, 200, 0.85)';
    const s = scale;
    ctx.beginPath();
    ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y + 4 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 38 * s, y, 16 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y - 6 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPipe(p) {
    const x = p.x;
    const topY = p.gapY;
    const bottomY = p.gapY + PIPE_GAP;
    const groundY = H - 80;

    // gradient
    const grad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
    grad.addColorStop(0, '#2d5a1a');
    grad.addColorStop(0.15, '#4a902b');
    grad.addColorStop(0.5, '#7bc94a');
    grad.addColorStop(0.85, '#4a902b');
    grad.addColorStop(1, '#2d5a1a');

    // Top pipe
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, PIPE_W, topY - 18);
    // Top cap
    ctx.fillRect(x - 4, topY - 18, PIPE_W + 8, 18);
    // Top cap highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 4, topY - 18, 14, 18);

    // Bottom pipe
    ctx.fillStyle = grad;
    ctx.fillRect(x, bottomY + 18, PIPE_W, groundY - (bottomY + 18));
    // Bottom cap
    ctx.fillRect(x - 4, bottomY, PIPE_W + 8, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 4, bottomY, 14, 18);

    // Outline
    ctx.strokeStyle = '#1c3a0d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, PIPE_W, topY - 18);
    ctx.strokeRect(x - 4, topY - 18, PIPE_W + 8, 18);
    ctx.strokeRect(x, bottomY + 18, PIPE_W, groundY - (bottomY + 18));
    ctx.strokeRect(x - 4, bottomY, PIPE_W + 8, 18);
  }

  function drawGround() {
    const groundY = H - 80;
    // Sand/dusk ground
    const g = ctx.createLinearGradient(0, groundY, 0, H);
    g.addColorStop(0, '#8b5a2b');
    g.addColorStop(0.4, '#5e3a1c');
    g.addColorStop(1, '#2d1a0c');
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, W, 80);

    // surface line
    ctx.strokeStyle = '#1c3a0d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Pattern stripes (moving)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = -2; i < W / 40 + 2; i++) {
      const stripeX = (i * 80 + groundX + 120) % (W + 80) - 40;
      ctx.beginPath();
      ctx.moveTo(stripeX, groundY);
      ctx.lineTo(stripeX + 30, groundY + 80);
      ctx.lineTo(stripeX + 50, groundY + 80);
      ctx.lineTo(stripeX + 20, groundY);
      ctx.closePath();
      ctx.fill();
    }

    // Pebbles on top
    ctx.fillStyle = '#3d2412';
    for (let i = 0; i < 12; i++) {
      const px = (i * 60 + groundX + 60) % (W + 40);
      ctx.beginPath();
      ctx.arc(px, groundY + 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBird() {
    const b = bird;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(2, 2, b.radius, b.radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, b.radius + 4);
    bodyGrad.addColorStop(0, '#ff9ff3');
    bodyGrad.addColorStop(0.5, '#ff6b6b');
    bodyGrad.addColorStop(1, '#c0334a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.radius, b.radius * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing (flapping)
    const wingY = Math.sin(b.wingPhase) * 8;
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.ellipse(-4, 4 + wingY, 9, 5, -0.4 + wingY * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b87c0a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1746';
    ctx.beginPath();
    ctx.arc(9.5, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(10, -5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffaa33';
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(20, 1);
    ctx.lineTo(13, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b87c0a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tail
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-18, -5);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-18, 5);
    ctx.lineTo(-12, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ============ Loop ============
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  reset();
  loop();
})();
</script>
</body>
</html>
```

```
[Start thinking]
The user wants a short Flappy Bird game. I'll create a complete, self-contained HTML file with:

1. A classic Flappy Bird-style game
2. Nice graphics and animations
3. Score tracking
4. Game over screen
5. Restart functionality
6. Good physics (gravity, jump mechanics)
7. Pipes that move and are randomly placed
8. Sound effects (using Web Audio API for tones)
9. A nice visual style - I'll avoid the classic yellow bird and use a more interesting color scheme

Let me design this with:
- A nice gradient sky background
- Animated bird with flapping wings
- Pipes with a nice green/metallic look
- Score display
- Start screen, playing state, game over state
- High score tracking with localStorage
- Particle effects when scoring
- Smooth animations

I'll use a sunset/dusk color palette to make it distinctive - warm oranges and purples, with the bird being a warm coral/red color.

Let me code this up carefully:

Key features:
- Canvas-based rendering
- requestAnimationFrame game loop
- Bird physics: gravity, jump impulse
- Pipe generation: random gaps, moving left
- Collision detection
- Score increment when passing pipes
- Particle effects on score
- Death animation
- localStorage for high score
- Sound effects via Web Audio API
- Mobile/touch support
- Clean, polished UI overlay

Let me write the code.
[End thinking]

I'll create a polished Flappy Bird game with a distinctive dusk/sunset aesthetic, smooth physics, particle effects, and sound.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Sunset Flier</title>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Fred:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --sunset-1: #ff6b6b;
    --sunset-2: #feca50;
    --sunset-3: #ff9ff3;
    --dusk: #36306b;
    --night: #1a1746;
    --accent: #ffd93b;
    --coral: #ff6b6b;
    --pipe: #4a902b;
    --pipe-dark: #2d5a1a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: var(--night);
    font-family: 'Fred', sans-serif;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }

  #game-wrap {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, #1a1746 0%, #36306b 40%, #ff6b6b 70%, #feca50 100%);
  }

  #game-frame {
    position: relative;
    width: min(100vw, 480px);
    height: min(100vh, 720px);
    max-height: 100vh;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
    overflow: hidden;
    background: linear-gradient(180deg, #4a3a8e 0%, #ff6b6b 60%, #feca50 100%);
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 10;
    transition: opacity 0.3s ease;
  }

  .overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .panel {
    background: rgba(26, 23, 70, 0.85);
    border: 3px solid var(--accent);
    border-radius: 16px;
    padding: 28px 36px;
    text-align: center;
    color: #fff;
    box-shadow: 0 12px 0 rgba(0,0,0,0.3), 0 0 40px rgba(255, 217, 59, 0.4);
    backdrop-filter: blur(4px);
    transform: translateY(0);
    animation: bob 3s ease-in-out infinite;
  }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .title {
    font-family: 'Press Start 2P', monospace;
    font-size: 26px;
    color: var(--accent);
    text-shadow: 3px 3px 0 #b87c0a, 6px 6px 0 rgba(0,0,0,0.3);
    letter-spacing: 1px;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 14px;
    color: #ffe8a8;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .tap-icon {
    font-size: 42px;
    margin: 8px 0;
    animation: tap 1.2s ease-in-out infinite;
  }

  @keyframes tap {
    0%, 50% { transform: translateY(0) scale(1); }
    20% { transform: translateY(-8px) scale(1.1); }
  }

  .instructions {
    font-size: 13px;
    color: #fff;
    opacity: 0.85;
    margin-top: 10px;
    font-weight: 400;
  }

  .score-row {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin: 12px 0 20px;
  }

  .score-box {
    background: rgba(0,0,0,0.4);
    border: 2px solid var(--accent);
    border-radius: 10px;
    padding: 10px 18px;
    min-width: 80px;
  }

  .score-box .label {
    font-family: 'Press Start 2p', monospace;
    font-size: 9px;
    color: var(--accent);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .score-box .value {
    font-family: 'Press Start 2p', monospace;
    font-size: 18px;
    color: #fff;
  }

  .score-box.best .value { color: var(--coral); }

  .btn {
    font-family: 'Press Start 2p', monospace;
    font-size: 12px;
    color: var(--night);
    background: var(--accent);
    border: none;
    padding: 12px 22px;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: 1px;
    box-shadow: 0 6px 0 #b87c0a, 0 8px 12px rgba(0,0,0,0.3);
    transition: transform 0.1s, box-shadow 0.1s;
    pointer-events: auto;
  }

  .btn:hover { transform: translateY(2px); box-shadow: 0 4px 0 #b87c0a, 0 6px 10px rgba(0,0,0,0.3); }
  .btn:active { transform: translateY(6px); box-shadow: 0 0 0 #b87c0a, 0 2px 6px rgba(0,0,0,0.3); }

  #hud {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    font-family: 'Press Start 2P', monospace;
    font-size: 36px;
    color: #fff;
    text-shadow: 3px 3px 0 #b87c0a, 5px 5px 0 rgba(0,0,0,0.5);
    pointer-events: none;
    transition: opacity 0.3s;
    opacity: 0;
  }

  #hud.visible { opacity: 1; }

  #hud .new-best {
    font-size: 11px;
    color: var(--coral);
    text-shadow: 2px 2px 0 #000;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  #hud.has-new-best .new-best { opacity: 1; animation: pulse 0.6s ease infinite alternate; }

  @keyframes pulse {
    from { transform: translateX(-50%) scale(1); }
    to { transform: translateX(-50%) scale(1.15); }
  }

  .medal {
    font-family: 'Press Start 2P', monospace;
    font-size: 48px;
    margin: 10px 0;
    text-shadow: 3px 3px 0 #000;
  }

  .flash {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    z-index: 8;
  }

  .footer {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    font-weight: 400;
    text-align: center;
    pointer-events: none;
    z-index: 9;
  }
</style>
</head>
<body>
<div id="game-wrap">
  <div id="game-frame">
    <canvas id="canvas"></canvas>
    <div id="hud" class="hud">
      <div id="hud-score">0</div>
      <div class="new-best">NEW BEST!</div>
    </div>
    <div id="flash" class="flash"></div>

    <!-- Start screen -->
    <div id="start-screen" class="overlay visible">
      <div class="panel">
        <div class="title">SUNSET<br>FLIER</div>
        <div class="subtitle">— dusk flight —</div>
        <div class="tap-icon">✊</div>
        <div class="instructions">TAP / SPACE / CLICK to flap</div>
      </div>
    </div>

    <!-- Game over screen -->
    <div id="end-screen" class="overlay hidden">
      <div class="panel">
        <div class="title" style="font-size:22px;color:var(--coral);">GAME OVER</div>
        <div id="medal" class="medal" style="display:none;">★</div>
        <div class="score-row">
          <div class="score-box">
            <div class="label">SCORE</div>
            <div class="value" id="end-score">0</div>
          </div>
          <div class="score-box best">
            <div class="label">BEST</div>
            <div class="value" id="end-best">0</div>
          </div>
        </div>
        <button class="btn" id="restart-btn">RETRY</button>
      </div>
    </div>

    <div class="footer">Sound on • Tap to fly</div>
  </div>
</div>

<script>
(() => {
  // ============ Setup ============
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const frame = document.getElementById('game-frame');
  const hud = document.getElementById('hud');
  const hudScore = document.getElementById('hud-score');
  const startScreen = document.getElementById('start-screen');
  const endScreen = document.getElementById('end-screen');
  const endScore = document.getElementById('end-score');
  const endBest = document.getElementById('end-best');
  const medalEl = document.getElementById('medal');
  const flashEl = document.getElementById('flash');
  const restartBtn = document.getElementById('restart-btn');

  let W = 480, H = 720;
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = frame.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ============ Audio (Web Audio API) ============
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freq, dur=0.1, type='square', vol=0.1, slideTo=null) {
    const ac = getAudio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  const sfx = {
    flap: () => beep(420, 0.12, 'square', 0.08, 720),
    score: () => { beep(880, 0.08, 'triangle', 0.12); setTimeout(()=>beep(1320, 0.1, 'triangle', 0.1), 60); },
    hit: () => { beep(180, 0.25, 'sawtooth', 0.15, 60); },
    die: () => { beep(120, 0.5, 'sawtooth', 0.15, 40); }
  };

  // ============ Game State ============
  const STATE = { READY: 0, PLAYING: 1, DYING: 2, OVER: 3 };
  let state = STATE.READY;

  let bird, pipes, particles, score, best, frameCount, shake, groundX, clouds, stars;

  best = parseInt(localStorage.getItem('sunsetFlierBest') || '0', 10) || 0;
  endBest.textContent = best;

  // ============ Bird ============
  function makeBird() {
    return {
      x: W * 0.32,
      y: H * 0.5,
      vy: 0,
      radius: 14,
      wingPhase: 0,
      rotation: 0,
      alive: true
    };
  }

  // ============ Pipes ============
  const PIPE_W = 68;
  const PIPE_GAP = 180;
  const PIPE_SPEED = 2.6;
  const PIPE_SPACING = 220;

  function makePipe(x) {
    const minY = 90;
    const maxY = H - 90 - PIPE_GAP;
    const gapY = minY + Math.random() * (maxY - minY);
    return { x, gapY, scored: false, passed: false };
  }

  function initPipes() {
    pipes = [];
    let x = W + 80;
    for (let i = 0; i < 4; i++) {
      pipes.push(makePipe(x));
      x += PIPE_SPACING;
    }
  }

  // ============ Particles ============
  function spawnParticles(x, y, color, count=10, vel=3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.6 + 0.4) * vel;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: Math.random() * 4 + 2,
        color
      });
    }
  }

  // ============ Background ============
  function initBg() {
    clouds = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * W,
        y: 80 + Math.random() * 180,
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.2 + Math.random() * 0.3
      });
    }
    stars = [];
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.4,
        r: Math.random() * 1.5 + 0.3,
        tw: Math.random() * Math.PI * 2
      });
    }
  }

  // ============ Reset / Start ============
  function reset() {
    bird = makeBird();
    pipes = [];
    particles = [];
    score = 0;
    frameCount = 0;
    shake = 0;
    groundX = 0;
    initPipes();
    initBg();
    hudScore.textContent = '0';
    hud.classList.remove('has-new-best');
  }

  function startGame() {
    state = STATE.PLAYING;
    startScreen.classList.add('hidden');
    startScreen.classList.remove('visible');
    hud.classList.add('visible');
    bird.vy = -7.2;
    sfx.flap();
  }

  function gameOver() {
    state = STATE.DYING;
    sfx.hit();
    setTimeout(sfx.die, 120);
    shake = 18;
    spawnParticles(bird.x, bird.y, '#ffd93b', 24, 5);
    spawnParticles(bird.x, bird.y, '#ff6b6b', 16, 4);
    flashScreen();
    bird.alive = false;

    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      localStorage.setItem('sunsetFlierBest', String(best));
    }

    setTimeout(() => {
      state = STATE.OVER;
      endScore.textContent = score;
      endBest.textContent = best;
      const medal = getMedal(score);
      if (medal) {
        medalEl.style.display = 'block';
        medalEl.textContent = medal.symbol;
        medalEl.style.color = medal.color;
      } else {
        medalEl.style.display = 'none';
      }
      endScreen.classList.remove('hidden');
      endScreen.classList.add('visible');
      if (isNewBest) {
        setTimeout(()=>hud.classList.add('has-new-best'), 0);
      }
    }, 700);
  }

  function flashScreen() {
    flashEl.style.transition = 'none';
    flashEl.style.opacity = '0.9';
    requestAnimationFrame(() => {
      flashEl.style.transition = 'opacity 0.4s ease-out';
      flashEl.style.opacity = '0';
    });
  }

  function getMedal(s) {
    if (s >= 30) return { symbol: '★', color: '#ffd93b' };
    if (s >= 20) return { symbol: '✦', color: '#c0c0c0' };
    if (s >= 10) return { symbol: '✧', color: '#cd7f32' };
    if (s >= 5)  return { symbol: '•', color: '#ff9ff3' };
    return null;
  }

  function restart() {
    reset();
    state = STATE.READY;
    endScreen.classList.add('hidden');
    endScreen.classList.remove('visible');
    startScreen.classList.remove('hidden');
    startScreen.classList.add('visible');
    hud.classList.remove('visible');
    hud.classList.remove('has-new-best');
  }

  // ============ Input ============
  function flap() {
    if (state === STATE.READY) { startGame(); return; }
    if (state === STATE.PLAYING) {
      bird.vy = -7.2;
      bird.wingPhase = 0;
      sfx.flap();
      spawnParticles(bird.x - 8, bird.y + 6, '#fff8d6', 4, 1.5);
    }
    if (state === STATE.OVER) {
      // tap anywhere on end screen also restarts
      // but we let button handle it primarily
    }
  }

  function handleInput(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    flap();
  }

  frame.addEventListener('mousedown', handleInput);
  frame.addEventListener('touchstart', handleInput, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      e.preventDefault();
      if (state === STATE.OVER) restart();
      else flap();
    }
  });
  restartBtn.addEventListener('click', (e) => { e.stopPropagation(); restart(); });

  // ============ Update ============
  const GRAVITY = 0.42;
  const MAX_FALL = 9;

  function update() {
    frameCount++;
    if (state === STATE.READY) {
      // idle bob
      bird.y = H * 0.5 + Math.sin(frameCount * 0.08) * 14;
      bird.wingPhase += 0.2;
      bird.rotation = Math.sin(frameCount * 0.08) * 0.05;
    }

    if (state === STATE.PLAYING) {
      bird.vy += GRAVITY;
      if (bird.vy > MAX_FALL) bird.vy = MAX_FALL;
      bird.y += bird.vy;
      bird.wingPhase += 0.4;
      bird.rotation = Math.max(-0.4, Math.min(1.2, bird.vy * 0.08));

      // Pipes
      for (const p of pipes) {
        p.x -= PIPE_SPEED;
        if (!p.scored && p.x + PIPE_W < bird.x) {
          p.scored = true;
          score++;
          hudScore.textContent = score;
          sfx.score();
          spawnParticles(bird.x, bird.y, '#ffd93b', 8, 2);
        }
      }
      // Remove off-screen pipes, add new
      while (pipes.length > 0 && pipes[0].x + PIPE_W < -10) pipes.shift();
      const last = pipes[pipes.length - 1];
      if (last && last.x < W - PIPE_SPACING) {
        pipes.push(makePipe(last.x + PIPE_SPACING));
      }

      // Collision
      // Ground & ceiling
      const groundY = H - 80;
      if (bird.y + bird.radius > groundY || bird.y - bird.radius < 0) {
        bird.y = Math.max(bird.radius + 1, Math.min(groundY - bird.radius, bird.y));
        gameOver();
        return;
      }
      // Pipes
      for (const p of pipes) {
        if (p.x > bird.x + bird.radius || p.x + PIPE_W < bird.x - bird.radius) continue;
        const top = p.gapY;
        const bottom = p.gapY + PIPE_GAP;
        if (bird.y - bird.radius < top || bird.y + bird.radius > bottom) {
          // collision
          gameOver();
          return;
        }
      }
    }

    if (state === STATE.DYING) {
      bird.vy += GRAVITY * 1.2;
      bird.y += bird.vy;
      bird.rotation += 0.06;
      const groundY = H - 80;
      if (bird.y + bird.radius > groundY) {
        bird.y = groundY - bird.radius;
        bird.vy = 0;
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.02;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Shake decay
    if (shake > 0) shake = Math.max(0, shake - 1.2);

    // Background animations
    for (const c of clouds) {
      c.x -= c.speed;
      if (c.x < -100) c.x = W + 100;
    }
    for (const s of stars) {
      s.tw += 0.05;
    }

    groundX = (groundX - PIPE_SPEED) % 120;
  }

  // ============ Render ============
  function render() {
    ctx.save();
    // Shake
    if (shake > 0) {
      const sx = (Math.random() - 0.5) * shake;
      const sy = (Math.random() - 0.5) * shake;
      ctx.translate(sx, sy);
    }

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a1746');
    sky.addColorStop(0.3, '#4a3a8e');
    sky.addColorStop(0.55, '#ff6b6b');
    sky.addColorStop(0.8, '#feca50');
    sky.addColorStop(1, '#ffd93b');
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // Stars
    for (const s of stars) {
      const a = 0.4 + Math.sin(s.tw) * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sun
    const sunX = W * 0.75;
    const sunY = H * 0.65;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
    sunGlow.addColorStop(0, 'rgba(255,240,160,0.7)');
    sunGlow.addColorStop(0.4, 'rgba(255,200,120,0.3)');
    sunGlow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 200, sunY - 200, 400, 400);

    ctx.fillStyle = '#fff6d0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    for (const c of clouds) {
      drawCloud(c.x, c.y, c.scale);
    }

    // Mountains silhouette
    ctx.fillStyle = 'rgba(40, 30, 80, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.72);
    const peaks = [
      [W * 0.15, H * 0.58],
      [W * 0.25, H * 0.68],
      [W * 0.4, H * 0.52],
      [W * 0.55, H * 0.66],
      [W * 0.7, H * 0.6],
      [W * 0.85, H * 0.68],
      [W, H * 0.62]
    ];
    for (const [px, py] of peaks) ctx.lineTo(px, py);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Pipes
    for (const p of pipes) {
      drawPipe(p);
    }

    // Ground
    drawGround();

    // Bird
    drawBird();

    // Particles
    for (const part of particles) {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.life;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function drawCloud(x, y, scale) {
    ctx.fillStyle = 'rgba(255, 230, 200, 0.85)';
    const s = scale;
    ctx.beginPath();
    ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y + 4 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 38 * s, y, 16 * s, 0, Math.PI * 2);
    ctx.arc(x + 18 * s, y - 6 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPipe(p) {
    const x = p.x;
    const topY = p.gapY;
    const bottomY = p.gapY + PIPE_GAP;
    const groundY = H - 80;

    // gradient
    const grad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
    grad.addColorStop(0, '#2d5a1a');
    grad.addColorStop(0.15, '#4a902b');
    grad.addColorStop(0.5, '#7bc94a');
    grad.addColorStop(0.85, '#4a902b');
    grad.addColorStop(1, '#2d5a1a');

    // Top pipe
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, PIPE_W, topY - 18);
    // Top cap
    ctx.fillRect(x - 4, topY - 18, PIPE_W + 8, 18);
    // Top cap highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 4, topY - 18, 14, 18);

    // Bottom pipe
    ctx.fillStyle = grad;
    ctx.fillRect(x, bottomY + 18, PIPE_W, groundY - (bottomY + 18));
    // Bottom cap
    ctx.fillRect(x - 4, bottomY, PIPE_W + 8, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 4, bottomY, 14, 18);

    // Outline
    ctx.strokeStyle = '#1c3a0d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, PIPE_W, topY - 18);
    ctx.strokeRect(x - 4, topY - 18, PIPE_W + 8, 18);
    ctx.strokeRect(x, bottomY + 18, PIPE_W, groundY - (bottomY + 18));
    ctx.strokeRect(x - 4, bottomY, PIPE_W + 8, 18);
  }

  function drawGround() {
    const groundY = H - 80;
    // Sand/dusk ground
    const g = ctx.createLinearGradient(0, groundY, 0, H);
    g.addColorStop(0, '#8b5a2b');
    g.addColorStop(0.4, '#5e3a1c');
    g.addColorStop(1, '#2d1a0c');
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, W, 80);

    // surface line
    ctx.strokeStyle = '#1c3a0d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Pattern stripes (moving)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = -2; i < W / 40 + 2; i++) {
      const stripeX = (i * 80 + groundX + 120) % (W + 80) - 40;
      ctx.beginPath();
      ctx.moveTo(stripeX, groundY);
      ctx.lineTo(stripeX + 30, groundY + 80);
      ctx.lineTo(stripeX + 50, groundY + 80);
      ctx.lineTo(stripeX + 20, groundY);
      ctx.closePath();
      ctx.fill();
    }

    // Pebbles on top
    ctx.fillStyle = '#3d2412';
    for (let i = 0; i < 12; i++) {
      const px = (i * 60 + groundX + 60) % (W + 40);
      ctx.beginPath();
      ctx.arc(px, groundY + 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBird() {
    const b = bird;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(2, 2, b.radius, b.radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, b.radius + 4);
    bodyGrad.addColorStop(0, '#ff9ff3');
    bodyGrad.addColorStop(0.5, '#ff6b6b');
    bodyGrad.addColorStop(1, '#c0334a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.radius, b.radius * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing (flapping)
    const wingY = Math.sin(b.wingPhase) * 8;
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.ellipse(-4, 4 + wingY, 9, 5, -0.4 + wingY * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b87c0a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1746';
    ctx.beginPath();
    ctx.arc(9.5, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(10, -5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffaa33';
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(20, 1);
    ctx.lineTo(13, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b87c0a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tail
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-18, -5);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-18, 5);
    ctx.lineTo(-12, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ============ Loop ============
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  reset();
  loop();
})();
</script>
</body>
</html>
```

Here's what I built:

**Theme**: "Sunset Flier" — instead of the classic green/teal Flappy Bird look, I went with a dusk-sunset palette (deep purple → coral → gold) with silhouetted mountains, a glowing sun, drifting clouds, and twinkling stars in the upper sky.

**Bird**: A coral-pink bird with a yellow flapping wing, animated beak, tail, and tracking eye. Wing flaps physically animate when the bird rises/falls.

**Mechanics**:
- Classic gravity + flap-impulse physics, tuned to feel responsive
- Pipes with random gap placement, smooth scrolling, cap-with-highlight rendering for a chunky 2D look
- Score increments when the bird passes a pipe, with a particle pop and chime SFX
- Collision with pipes, ceiling, and ground triggers game over with screen flash, screen shake, and death particles

**Polish**:
- Press Start 2P pixel-font HUD with score and "NEW BEST!" pulse on record-breaking runs
- Game-over panel with medal system (★ / ✦ / ✧ / •) based on score thresholds
- High score persisted via `localStorage`
- Animated start screen with bobbing panel
- Procedural sound effects via Web Audio API (flap, score, hit, death) — no external assets
- Moving ground stripes/pebbles to reinforce the sense of speed
- Responsive: scales to viewport, supports mouse, touch, and keyboard (Space/↑/Enter)
- Retry button + tap-anywhere-to-restart convenience

Just open the file in a browser — tap/click/press space to fly.
```

`f32, f16, bf16, q8_0, q4_0, q4_1, iq4_nl, q5_0, q5_1`

```
./llama.cpp/llama-cli \
    --model unsloth/GLM-5.2-GGUF/UD-IQ2_M/GLM-5.2-UD-IQ2_M-00001-of-00006.gguf \
    --temp 1.0 \
    --top-p 0.95 \
    --min-p 0.01 \
    --cache-type-k q4_1 \
    --cache-type-v q4_1
```