---
title: Triton L2缓存命中优化矩阵乘法(fp16&int8)详解及性能测试
source_url: https://mp.weixin.qq.com/s/JyANJ5n5enTTq9i2N82NKg
source: wechat
publish_date: 2026-05-09
tags: [wechat, article, deepseek, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: b78cc9fecdb3e4576c3bb2aeb344a3e44a2bee19fecc334d2e244fe22adf8e04
---
# Triton L2缓存命中优化矩阵乘法(fp16&int8)详解及性能测试
“L2缓存命中优化矩阵乘法”是Triton官方提供的第三个教程，本文将结合硬件特性对此部分内容进行详解。同时笔者也简单的做了下int8 matul的魔改，并进行了量化/非量化性能测试及分析。
** 基础概念  **
Triton虽然是python前端，但是编程思维和python还是有比较大的区别的，更倾向于cuda编程。但和cuda编程相比，Triton开发不需要手动管理线程块、网格、线程束等结构。此外，Triton 编译器会自动对代码进行优化，包括内存访问模式优化、指令调度、并行性优化等。Triton编译器能够根据不同的 GPU 硬件架构和输入数据大小，生成高效的机器代码，减少了开发者手动优化的工作量。
使用Triton编程最主要的目标是用来做  ** 算子融合  ** 。模型在训练时候，除了gpu的计算时间外，从显存（HBM）把数据搬运到SRAM也占用了很多时间。举个例子，算一个最简单的标准化(x-mean)/var，需要涉及到如下步骤：1.读x+读mean 2.写x-mean 3.读x-mean，读var 4.写(x-mean)/var，看起来十分的啰嗦，并且要保存中间的临时变量，占用额外显存。如果想让线程块端到端的计算结果（只读一次写一次），就需要做算子融合了。flash attention本质上就是一种算子融合，加速效果和显存节约量都比较显著，尤其是在长序列的时候。之前在训练Steel-LLM（https://github.com/zhanshijinwat/Steel-LLM）的时候，笔者专门消融过算子融合带来的训练加速效果，可以看我的往期文章（https://zhuanlan.zhihu.com/p/694223107），即使仅对RMSNorm做算子融合，训练也有10%左右的吞吐提升，显存节约了4g。
接下来，了解一点GPU相关的基础知识（具体数值是A100显卡的），以便后边更好的理解Triton编程。先来看看GPU SM（Streaming Multiprocessor，流式多处理器），其是GPU上的基础硬件单元，由如下几部分组成：
* CUDA核心：用于执行计算指令的基本单元。在一个 SM 中包含多个 CUDA 核心，它们可以并行地执行相同或不同的指令。例如，在进行矩阵乘法运算时，多个 CUDA 核心可以同时对矩阵的不同元素进行计算，大大提高了计算速度。
* 寄存器：GPU 中速度最快的存储单元，SM 中的寄存器文件用于存储线程在执行过程中的临时数据。每个线程都有自己独立的寄存器空间，线程可以快速地读写寄存器中的数据。
* 共享内存：线程块（SM中可有多个线程块，例如A100的每个SM最多可以支持32个线程块）内的线程可以共享这块内存区域。线程可以通过共享内存快速地交换数据，实现线程间的协作和通信。例如，在矩阵乘法中，一个线程块内的线程可以将矩阵的一部分数据加载到共享内存中，然后共同对这些数据进行计算，减少了对全局内存的访问次数。
* L1 cache：位于 SM 内部，用于缓存从全局内存或更高层次存储中频繁访问的数据。当线程需要访问数据时，首先会在 L1 Cache 中查找，如果找到则直接获取，避免了从全局内存读取数据的高延迟。
* 线程调度器：负责管理和调度线程块的执行。它会根据线程块的资源需求（如寄存器、共享内存等）和执行状态，将线程块分配到合适的 CUDA 核心上执行。当一个线程块因为等待内存数据等原因暂停执行时，线程调度器会切换到另一个就绪的线程块继续执行，以提高 SM 的利用率。
对于GPU来讲主要下几种存储层次结构，从上到下读取读取速度依次递减、但容量逐渐递增：
当 GPU 线程需要读取数据时，首先会在 L1 Cache 中查找，如果找不到会进一步到 L2 Cache 中查找，还是找不到的话才回去HBM中找。如果我们能够通过一些数据组织策略，让线程能更大概率的在L1 Cache/L2 Cache中找到想要的数据，那么就可以提高数据读取速度。这就呼应了我们的标题，为啥要对矩阵乘法做L2 Cache的命中优化。
在讲解L2缓存命中优化矩阵乘法之前，需要再强调一下block的概念。Triton是围绕block的抽象逻辑进行编程的，block内执行任务靠多线程，同时也有线程间的共享内存，但其和gpu的线程块又不完全等价。gpu的线程块更“物理”一些，在cuda编程时需要手动管理线程块的维度、索引等细节。而Triton的blcok更“逻辑”一些，Triton 编译器会自动处理很多硬件相关的调度和优化，开发者只需关注 block 的计算逻辑和数据处理。
** L2缓存命中优化矩阵乘法  **
读者可以大致先过一下官方教程，看下代码整体结构：
Matrix Multiplication：
https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html
首先我们来看一下Triton实现的矩阵乘法函数matmul_kernel是如何调用的：
    def matmul(a, b, activation=""):    # Check constraints.    assert a.shape[1] == b.shape[0], "Incompatible dimensions"    assert a.is_contiguous(), "Matrix A must be contiguous"    M, K = a.shape    K, N = b.shape    # Allocates output.    c = torch.empty((M, N), device=a.device, dtype=torch.float16)    # 1D launch kernel where each block gets its own program.    grid = lambda META: (triton.cdiv(M, META['BLOCK_SIZE_M']) * triton.cdiv(N, META['BLOCK_SIZE_N']), )    matmul_kernel[grid](        a, b, c,  #        M, N, K,  #        a.stride(0), a.stride(1),  #        b.stride(0), b.stride(1),  #        c.stride(0), c.stride(1),  #        ACTIVATION=activation  #    )    return c
matmul_kernel需要传入grid，Triton是以block为单位进行函数定义的，而grid决定了并行任务块数量。这里假设计算A*B=C的矩阵乘法，其分块计算任务定义是从C的视角出发，每个block负责计算最终结果C的大小为BLOCK_SIZE_M * BLOCK_SIZE_N的一小部分。
LOCK_SIZE_M / BLOCK_SIZE_N属于计算超参数，在不同硬件上最优的参数是不同的。Triton在运行时可以自动搜索当前硬件条件下的最有超参数是多少，通过装饰器triton.autotune实现，如下所示。matmul_kernel在调用的时候输入的是torch的tensor a/b/c，但是  ** 传到函数内部后就会被处理为指针形式  ** a_ptr/b_ptr/c_ptr, 指向a/b/c第一个元素所在的地址。之后的所以操作都需要基于这个地址+偏移来进行读取，  ** 二维矩阵也会被铺成一维  ** 。传入的参数a.stride(0)表示a在第0维度挪一个位置需要跳过多少个  ** 元素  ** 。举个例子,如果a=[[1,2,3], [4,5,6]]，那么a.stride(0)=3，因为是行主序的，将a铺成一维后，在原来0轴上挪动一个位置（从1到4），需要跳过3个元素。传入  ** stride信息是为tensor被铺平为1维矩阵后更方便的进行寻址  ** 。
    def get_cuda_autotune_config():    return [        # 定义若干组超参数组合        triton.Config({'BLOCK_SIZE_M': 128, 'BLOCK_SIZE_N': 256, 'BLOCK_SIZE_K': 64, 'GROUP_SIZE_M': 8}, num_stages=3,                      num_warps=8),        triton.Config({'BLOCK_SIZE_M': 64, 'BLOCK_SIZE_N': 256, 'BLOCK_SIZE_K': 32, 'GROUP_SIZE_M': 8}, num_stages=4,                      num_warps=4),        ......    ]@triton.autotune(    configs=get_cuda_autotune_config(),    key=['M', 'N', 'K'],)@triton.jitdef matmul_kernel(        # Pointers to matrices        a_ptr, b_ptr, c_ptr,        # Matrix dimensions        M, N, K,        # The stride variables represent how much to increase the ptr by when moving by 1        # element in a particular dimension. E.g. `stride_am` is how much to increase `a_ptr`        # by to get the element one row down (A has M rows).        stride_am, stride_ak,  #        stride_bk, stride_bn,  #        stride_cm, stride_cn,        # Meta-parameters        BLOCK_SIZE_M: tl.constexpr, BLOCK_SIZE_N: tl.constexpr, BLOCK_SIZE_K: tl.constexpr,  #        GROUP_SIZE_M: tl.constexpr,  #        ACTIVATION: tl.constexpr  #):...
matmul_kernel函数内，可以调用pid = tl.program_id(axis=0)接口来获取当前执行块的编号。一种最容易想到执行顺序是逐行来计算C的结果（  ** 注意，块之间是并行的，并不是真正按顺序执行的，但这样讲更容易理解为啥后边能做L2 cache优化  ** ）。假设A、B、C都是9*9的，那么如果想算出C的第一行，A矩阵一共需要用到9个block，B矩阵一共需要用到81个block，共计90个block。此时根据pid计算矩阵C block二维坐标的计算方式如下所示：
    pid = tl.program_id(axis=0)grid_n = tl.cdiv(N, BLOCK_SIZE_N)pid_m = pid // grid_npid_n = pid % grid_n
如果我们按下图方式将计算分组，同样是计算出C的9个block，A需要用到27个block，B也需要用到27个block，共计54个block。和行主序计算矩阵C相比，读取数据量其实并没有降低，只不过读取数据的unique数降低了，A矩阵的某些行/B矩阵的某些列会被重复利用。此时根据pid计算矩阵C block二维坐标的计算方式如下所示：
    pid = tl.program_id(axis=0) num_pid_m = tl.cdiv(M, BLOCK_SIZE_M) num_pid_n = tl.cdiv(N, BLOCK_SIZE_N)# 组是按照C的M维度划分的，包括所有num_pid_n列。GROUP_SIZE_M表示包含多少行blocknum_pid_in_group = GROUP_SIZE_M * num_pid_n# 当前block所在的组号group_id = pid // num_pid_in_group# 当前block所在的group第一个block的行号是多少first_pid_m = group_id * GROUP_SIZE_M# 最后一个group行数可能不够GROUP_SIZE_Mgroup_size_m = min(num_pid_m - first_pid_m, GROUP_SIZE_M)# *Within groups*, programs are ordered in a column-major order# 列主序列计算二维坐标pid_m = first_pid_m + ((pid % num_pid_in_group) % group_size_m)pid_n = (pid % num_pid_in_group) // group_size_m
此时计算block二维坐标是在group内部列主序的。但是官方的图（图2）画的和代码不完全对应，因为计算一个group有多少block/pid时，计算方法是num_pid_in_group = GROUP_SIZE_M * num_pid_n，包含了C所有列上的block，实际情况应该如下图3所示。图中也列出了行主序/按group转换二维坐标之后pid对应处理的C矩阵的位置，假设C矩阵是7*4的，group大小为3,不同颜色为不同group。
我们前边提到，和行主序计算C相比，分group计算C时，同时计算出一定数量C的block情况下A和B读取的总数据量虽然是一样的，但是unique block数是更少的（  ** 更多的block被重复用到  ** ）。基础知识部分提到，GPU的存储时分级的，  ** 从L2 Cache读取数据的速度会比从HBM读数据更块，而那些被重复复用的数据更容易被保存在L2 Cache上，当线程能够从L2 Cache拿到数据时，就不去HBM上找了，进而提高数据读取速度  ** 。这就是矩阵乘法时按照group计算更快的原因。
如果计算C的block是按顺序执行的，使用按group计算矩阵C在一定时间内A/B的block复用次数会更多，更容易缓存到L2 Cache很好理解，但是计算block是并行无序的，又该如何理解呢？
数据存在L2 Cache遵循时间局部性（被频繁访问的数据容易留在L2 Cache上）和空间局部性（之前被访问的数据的相邻数据容易被缓存在L2 Cache上）。按group划分的矩阵乘法在概率上能更好的利用时间局部性和空间局部性。
因为数据都是在内存空间中一维连续存储的，为了方便后续做二维矩阵运算，需要先把一维数据“reshape”成二维数据。offs_am在最后一维度从(m,)扩维度为(m,1)， offs_k在最前一维从(k,)扩维为(1, k)，通过  ** 广播机制  ** a_ptrs的shape为(m, k)。
    offs_am = (pid_m * BLOCK_SIZE_M + tl.arange(0, BLOCK_SIZE_M)) % Moffs_bn = (pid_n * BLOCK_SIZE_N + tl.arange(0, BLOCK_SIZE_N)) % Noffs_k = tl.arange(0, BLOCK_SIZE_K)a_ptrs = a_ptr + (offs_am[:, None] * stride_am + offs_k[None, :] * stride_ak)b_ptrs = b_ptr + (offs_k[:, None] * stride_bk + offs_bn[None, :] * stride_bn)
计算C的(m,n)位置的block需要用到A的所有列，和B的所有行，因此需要在K维度for循环遍历所有的K列，局部算点积之后并累加。由于K不一定会被BLOCK_SIZE_K整除，在最后一个block可能会越界，通过K - k * BLOCK_SIZE_K随时监测还有多少数据未被处理，传入mask防止越界读取。
    accumulator = tl.zeros((BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)for k in range(0, tl.cdiv(K, BLOCK_SIZE_K)):    a = tl.load(a_ptrs, mask=offs_k[None, :] < K - k * BLOCK_SIZE_K, other=0.0)    b = tl.load(b_ptrs, mask=offs_k[:, None] < K - k * BLOCK_SIZE_K, other=0.0)    accumulator = tl.dot(a, b, accumulator)    a_ptrs += BLOCK_SIZE_K * stride_ak    b_ptrs += BLOCK_SIZE_K * stride_bkc = accumulator.to(tl.float16)
最后用tl.store接口将计算结果写回到C的内存空间。Triton函数做的都是寻址并写入的操作，因此并没有返回值。
    offs_cm = pid_m * BLOCK_SIZE_M + tl.arange(0, BLOCK_SIZE_M)offs_cn = pid_n * BLOCK_SIZE_N + tl.arange(0, BLOCK_SIZE_N)c_ptrs = c_ptr + stride_cm * offs_cm[:, None] + stride_cn * offs_cn[None, :]c_mask = (offs_cm[:, None] < M) & (offs_cn[None, :] < N)tl.store(c_ptrs, c, mask=c_mask)
** int8精度下的triton matmul  **
接下来扩展一下官方的教程，介绍一下如何计算int8矩阵乘法。在调用时，需要手动在torch层将A和B矩阵转化为int8类型的格式，然后在传入Triton函数调用接口。除此之外，还要传入A和B矩阵的量化scale值，我们在Triton函数内部做反量化。
    def matmul_int8_opt(a,b, activation=""):    scale_a = (a.abs().max() / 127.0).clamp(min=1e-8)    scale_b = (b.abs().max() / 127.0).clamp(min=1e-8)    # 量化到int8    a_int8 = (a / scale_a).round().clamp(-127, 127).to(torch.int8)    b_int8 = (b / scale_b).round().clamp(-127, 127).to(torch.int8)    M, K = a.shape    _, N = b.shape    c = torch.empty((M, N), device=a.device)    grid = lambda META: (triton.cdiv(M, META['BLOCK_SIZE_M']) * triton.cdiv(N, META['BLOCK_SIZE_N']), )    int8_matmul_forward_opt[grid](            a_int8, b_int8, c,            scale_a, scale_b,            M, N, K,            a_int8.stride(0), a_int8.stride(1),            b_int8.stride(0), b_int8.stride(1),            c.stride(0), c.stride(1),        )    return c
具体实现的话和fp16 matmul的实现区别不大，唯一需要注意的地方就是累加器需要用int32格式的，不然int8相乘累加之后非常容易溢出被截断，进而损失精度。
    triton.jitdef int8_matmul_forward_opt(a_ptr, b_ptr, c_ptr,scale_a_ptr, scale_b_ptr,M, N, K,stride_am, stride_ak,stride_bk, stride_bn,    stride_cm, stride_cn,BLOCK_SIZE_M: tl.constexpr,BLOCK_SIZE_N: tl.constexpr,BLOCK_SIZE_K: tl.constexpr,):    pid = tl.program_id(axis=0)    num_pid_m = tl.cdiv(M, BLOCK_SIZE_M)    num_pid_n = tl.cdiv(N, BLOCK_SIZE_N)    num_pid_in_group = GROUP_SIZE_M * num_pid_n    group_id = pid // num_pid_in_group    first_pid_m = group_id * GROUP_SIZE_M    group_size_m = min(num_pid_m - first_pid_m, GROUP_SIZE_M)    pid_m = first_pid_m + ((pid % num_pid_in_group) % group_size_m)    pid_n = (pid % num_pid_in_group) // group_size_m        offs_am = (pid_m * BLOCK_SIZE_M + tl.arange(0, BLOCK_SIZE_M)) % M    offs_bn = (pid_n * BLOCK_SIZE_N + tl.arange(0, BLOCK_SIZE_N)) % N    offs_k = tl.arange(0, BLOCK_SIZE_K)        # 加载scale    scale_a = tl.load(scale_a_ptr)    scale_b = tl.load(scale_b_ptr)        # 使用int32累加器    acc = tl.zeros((BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.int32)        # 主循环 - 保持int8计算    for k in range(0, K, BLOCK_SIZE_K):        a = tl.load(a_ptr + offs_am[:, None] * stride_am + (k + offs_k[None, :]) * stride_ak)        b = tl.load(b_ptr + (k + offs_k[:, None]) * stride_bk + offs_bn[None, :] * stride_bn)                # 使用int8矩阵乘法指令        acc += tl.dot(a, b)        # 最后才反量化到float32    output = acc.to(tl.float32) * (scale_a * scale_b)    tl.store(c_ptr + offs_am[:, None] * stride_cm + offs_bn[None, :] * stride_cn, output
torch原生的matmul接口是不能做int8的矩阵乘法的，运行时候会出现如下错误。可以借助torch.quantization工具包。int8 matmul累加非常容易出现溢出，还不如让开发者自己实现计算逻辑，比如用int32去累加数值等来环节溢出。Triton实现的int8 matmul也避免不了溢出，可以手动控制BLOCK_SIZE_K不要太大，能缓解溢出的现象。
*
    "addmm_cuda" not implemented for 'Char'
** 性能测试  **
如果你是好奇宝宝，会想测试一下按group进行matmul的程序比行主序的程序快多少，当你粘贴了官方的测试代码之后应该会收获如下这张图，会想官方教程咋骗人啊，怎么优化了和没优化的一点区别没有。原因在于测试的规模太小了，L2 cache有几十M，不管用哪种计算方法，都足够把数据cache上去。需要扩大规模才能看出了。
笔者测试硬件为RTX 4090，考虑如下几种实现的matmul性能：
    torch：torch官方matmul，torch.matmul调用，float16精度triton_by_row：行主序triton实现的matmul，float16精度triton_by_group：按group计算的triton matmul，float16精度triton_by_row_int8：行主序triton实现的matmul，int8精度triton_by_group_int8：按group计算的triton matmul，int8精度
有如下结论：
1. fp16情况下，做group优化的triton matul一直能和torch实现的matnul（cuBLAS实现）性能相近。当M大于15000时，行主序的triton matul性能骤降，是因为L2 Cache此使被打满了，行主序的matmul不利于L2 cache的命中率，更多的数据需要从HBM读导致性能下降。
2. 在int8情况下，行主序 的triton matmul和做了group优化的matmul相比性能虽有下降，但是和在fp16情况下相比，劣化程度更低一些。这是因为在低精度情况下，L2 cache能存更多数量的数据，进而提高L2 Cache命中率。
3. int8类型在计算和传输上和fp16相比都具有优势，因此矩阵的dim M越大，int8收益越大。因此deepseek-v3这种超大号的模型使用fp8收益会非常显著，但是小模型上的意义就不是太大了。小模型对低精度也更加敏感。
后续应该还会对triton实现的flash attention进行一期讲解，欢迎关注。