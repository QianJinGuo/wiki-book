sha256: 76b09750ef9b2c7a5beadae8e6d99e219066a794c91a2497fa28161585315668
---
source: newsletter
source_url: auto
ingested: 2026-06-30
---

Title: What happens when you run a CUDA kernel

URL Source: http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/

Markdown Content:
Here’s a simple CUDA program. It adds two vectors.

```
__global__ void vadd(const float* a, const float* b, float* c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

int main() {
    int n = 1 << 20;                 // a million floats (1,048,576)
    size_t bytes = n * sizeof(float);

    float *a = (float*)malloc(bytes), *b = (float*)malloc(bytes),
          *c = (float*)malloc(bytes);
    for (int i = 0; i < n; i++) a[i] = b[i] = 1.0f;

    float *da, *db, *dc;
    cudaMalloc(&da, bytes);
    cudaMalloc(&db, bytes);
    cudaMalloc(&dc, bytes);
    cudaMemcpy(da, a, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(db, b, bytes, cudaMemcpyHostToDevice);

    vadd<<<4096, 256>>>(da, db, dc, n);   // 4096 * 256 = n threads, one per float

    cudaMemcpy(c, dc, bytes, cudaMemcpyDeviceToHost);
    printf("c[0]=%f c[n-1]=%f\n", c[0], c[n-1]);
}
```

Compiled for an RTX 4090, and launched, it does correctly work out that $1 + 1 = 2$, a million times I didn’t check all of them..

```
$ nvcc -arch=sm_89 -o vadd vadd.cu && ./vadd
c[0]=2.000000 c[n-1]=2.000000
```

Telling you that involved tens of millions of CPU instructions, a couple of device files, nine hundred ioctls, and one memory-mapped doorbell register. In this post, we’ll follow this one kernel from the code down to the warps, and back up to the answer An aside, this post is an instance of the ‘legibility transition’ that agents have engendered. There really is very little about computers you can’t find out with curiosity and (machine-enhanced) persistence. An interesting discussion of the implications of legibility for what AI can help us to know [here](https://resobscura.substack.com/p/ai-legibility-archives-future-of-research)..

## Compiling our program with `nvcc`[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#compiling-our-program-with-nvcc)

We ought to start with how to turn this CUDA program into something that the device can actually read. To do that we need a compiler. Really, we need many compilers.

`nvcc` is a driver program that runs several other compilers and combines their output. If you pass `--keep` it leaves the whole pipeline on disk for you to read:

```
$ nvcc --keep -arch=sm_89 -o vadd vadd.cu && ls
...
vadd.ptx            # device code as PTX        (from cicc)
vadd.sm_89.cubin    # device code as SASS       (from ptxas)
vadd.fatbin         # cubin + PTX, bundled      (from fatbinary)
vadd.cudafe1.stub.c # host launch stub + kernel registration
vadd.o              # final host object, fatbin embedded
...
```

The host code goes to your host compiler. The device code (`vadd`) takes more steps: `cicc`, an [LLVM](https://en.wikipedia.org/wiki/LLVM)-based compiler, turns it into [PTX](https://developer.nvidia.com/blog/understanding-ptx-the-assembly-language-of-cuda-gpu-computing/), and then `ptxas` turns the PTX into [SASS](https://modal.com/gpu-glossary/device-software/streaming-assembler).

PTX is a virtual [ISA](https://en.wikipedia.org/wiki/Instruction_set_architecture). It has infinitely many typed registers, and no notion of how many of them the hardware actually has. Here is the (elided) body of `vadd` in PTX:

```
$ cat vadd.ptx
...
mad.lo.s32      %r1, %r3, %r4, %r5;        // set register r1 to ctaid*ntid + tid
setp.ge.s32     %p1, %r1, %r2;             // set predicate p1 if i >= n
@%p1 bra        $L__BB0_2;                 // if out of bounds, skip to exit
cvta.to.global.u64  %rd4, %rd1;            // convert generic pointer %rd1 to a global address, store in %rd4
mul.wide.s32    %rd5, %r1, 4;              // multiply r1 by 4, store the result in %rd5
add.s64         %rd6, %rd4, %rd5;          // add %rd4, %rd5, result in %rd6
ld.global.f32   %f2, [%rd6];               // load a[i] into %f2
...
add.f32         %f3, %f2, %f1;             // add %f1 and %f2, result in %f3
st.global.f32   [%rd10], %f3;              // store c[i] = ... in global memory
```

The virtual registers look like `%rd1`–`%rd10`, `%f1`–`%f3`The prefix is the type: `%r` is a 32-bit integer, `%rd` a 64-bit one, `%f` a 32-bit float, `%p` a one-bit predicate..

PTX is more ‘longhand’ than you might expect. For example, forming one address in `%rd6` takes three PTX instructions. This happens because PTX is device agnostic.

Why three?
CUDA pointers are “generic” by default, meaning they could name global, shared, or local memory. `cvta.to.global` asserts the pointer lives in the global window, so a cheaper `ld.global` can be used later. `mul.wide.s32` then turns the index `i` into a byte offset by multiplying by 4 (`sizeof(float)`) and widening 32→64 bits in one step. `add.s64` adds that to the base pointer.

Next, `ptxas` transforms our PTX, which is device agnostic, into the SASS for your architecture, which isn’t. The SASS it emits looks different:

```
$ cuobjdump -sass vadd
/*0000*/  MOV R1, c[0x0][0x28] ;                      // set up the stack pointer (ABI; unused here)
/*0010*/  S2R R6, SR_CTAID.X ;                        // R6 = blockIdx.x
/*0020*/  S2R R3, SR_TID.X ;                          // R3 = threadIdx.x
/*0030*/  IMAD R6, R6, c[0x0][0x0], R3 ;              // i = ctaid*ntid + tid
/*0040*/  ISETP.GE.AND P0, PT, R6, c[0x0][0x178], PT ;// P0 = (i >= n)
/*0050*/  @P0 EXIT ;                                  // if so, exit
/*0060*/  MOV R7, 0x4 ;                               // load literal 4 (sizeof(float)) into R7 as multiplier
/*0070*/  ULDC.64 UR4, c[0x0][0x118] ;                // uniform load of a driver-provided system value
/*0080*/  IMAD.WIDE R4, R6, R7, c[0x0][0x168] ;       // &b[i]
/*0090*/  IMAD.WIDE R2, R6, R7, c[0x0][0x160] ;       // &a[i]
/*00a0*/  LDG.E R4, [R4.64] ;                         // b[i]
/*00b0*/  LDG.E R3, [R2.64] ;                         // a[i]
/*00c0*/  IMAD.WIDE R6, R6, R7, c[0x0][0x170] ;       // &c[i]
/*00d0*/  FADD R9, R4, R3 ;                           // a[i] + b[i]
/*00e0*/  STG.E [R6.64], R9 ;                         // c[i] = ...
/*00f0*/  EXIT ;
```

What the S2R lines are doing
`S2R` is “special register to register”: it copies a _special_ register the hardware maintains per thread — here `SR_CTAID.X` (the block’s index, `blockIdx.x`) and `SR_TID.X` (the lane’s index within the block, `threadIdx.x`) — into an ordinary register so `IMAD` can do arithmetic on it.

Ten-odd virtual registers have collapsed onto seven real ones`ncu` reports `launch__registers_per_thread = 16`. The disassembly only names up to `R9`, but the allocator reserves a few more for the ABI and alignment.. The two `mul.wide` plus `add` sequences have fused into a single `IMAD.WIDE`. The `cvta` conversions are gone, absorbed into the addressing.

The `c[0x0][…]` operands are **constant bank 0**, in a small, driver-managed region. These are the kernel’s arguments — the pointers `a`, `b`, `c` and the size `n` — along with the launch geometry. Filling the bank is the job of a structure called the QMD that the driver hands the GPU at launch, which we’ll come to once the launch itself reaches the card.

Why the arguments sit in constant bank 0, and where
They’re in constant memory because this is a _broadcast_ read: every thread in the grid needs the identical pointers, and the constant cache is able to serve all 32 lanes in one shot. The layout is fixed — `0x160`, `0x168`, `0x170` are the pointers `a`, `b`, `c`, and `0x178` is `n`, with the launch geometry alongside them at `0x0` (`blockDim.x`). Bank 0 also holds ABI parameters such as `c[0x0][0x28]`, the stack base that `MOV R1, c[0x0][0x28]` loads at entry. We’ll see these same offsets again when the host stub packs the arguments for launch.

The ‘cubin’ file holding this SASS is an [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) file — the same object-file container Linux uses for ordinary executables and shared libraries`cuobjdump -elf` shows a symbol table, a `.text.vadd` section holding the machine code, plus CUDA-specific sections like `.nv.callgraph`.. The `fatbinary` executable bundles the cubin together with the PTX into a single ‘fatbin’, and `cuobjdump` on the result reveals that the fatbin embedded in our binary contains _both_:

```
$ cuobjdump vadd
...
Fatbin elf code:  arch = sm_89        # the SASS we just read
Fatbin ptx code:  arch = sm_89  compressed   # the PTX, shipped too
```

The SASS is what actually runs on this 4090, but the PTX rides along as a forward-compatibility fallback. If you then take this binary to a GPU whose architecture the cubin doesn’t cover, the driver can JIT the PTX into fresh SASS at load time.

Finally, that fatbin is nested in the host executable, where `readelf -S` finds it occupying its own sections:

```
$ readelf -S vadd
...
[18] .nv_fatbin        PROGBITS   ...
[19] __nv_module_id    PROGBITS   ...
[29] .nvFatBinSegment  PROGBITS   ...
...
```

The `vadd` binary that nvcc spits out is a single executable containing host code, a complete ELF object containing the Ada SASS, and a copy of the PTX. Because PTX is verbose plain text, `nvcc` compresses it by default to keep the binary size small; the driver will only decompress and JIT-compile it if the binary is run on an architecture that the pre-compiled SASS doesn’t cover.

## How the host triggers the GPU[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#how-the-host-triggers-the-gpu)

The compiled GPU machine code is now sitting inert inside the `.nv_fatbin` section of our `./vadd` executable. When you launch the program on the host, we have to bridge two worlds: the host CPU, and the GPU sitting across the PCIe bus.

To set up a host binary that knows how to cross the bridge, the frontend compiler (`cudafe++`) inserts a hidden constructor into your code, running before the `main` function starts. Its job is to register our embedded fatbinary with the CUDA runtime and record a mapping that the runtime will later use: associating the host-side function pointer `vadd` with the compiled device kernel’s mangled name in the fatbin.

When the compiler encounters `vadd<<<4096, 256>>>(da, db, dc, n)`, it replaces that high-level expression with a generated host launch stub. This stub packs our kernel arguments into a buffer in host memory. The pointers `da`, `db`, `dc` and the integer `n` are aligned at byte offsets `0`, `8`, `16`, and `24`These offsets are the constant bank offsets `0x160`, `0x168`, `0x170`, and `0x178` that we saw our SASS machine code reading from constant bank 0 earlier.:

```
// from vadd.cudafe1.stub.c
void __device_stub__Z4vaddPKfS0_Pfi(const float *__par0, const float *__par1,
                                     float *__par2, int __par3) {
    __cudaLaunchPrologue(4);
    __cudaSetupArgSimple(__par0,  0UL);   // arg buffer offset 0
    __cudaSetupArgSimple(__par1,  8UL);   // offset 8
    __cudaSetupArgSimple(__par2, 16UL);   // offset 16
    __cudaSetupArgSimple(__par3, 24UL);   // offset 24
    __cudaLaunch((char*)(void(*)(const float*, const float*, float*, int))vadd);
}
```

Once the arguments are packed, the stub calls `__cudaLaunch`, passing it the memory address of the host-side dummy `vadd` function. Because this host function is just an empty shell on the CPU, its host memory address serves as a lookup key. The runtime queries its registration table with this address to find the corresponding device-side symbol name, and then crosses the boundary into the closed-source user-mode driver (`libcuda.so.1`)The usermode bit of the driver comes with the GPU’s kernel driver, not with the CUDA toolkit: the `libcuda.so.1` from the `strace` resolves to `libcuda.so.590.48.01`, the driver release on this machine. to initiate the launch of that kernel.

The runtime opens this driver dynamically on the first GPU call in our program, which we can catch using `strace`:

```
$ strace -f -e trace=openat ./vadd
...
openat(..., "/lib/x86_64-linux-gnu/libcuda.so.1", O_RDONLY|O_CLOEXEC) = 3
...
```

When this first call is performed, a ‘context’ is created, containing all the infrastructure the driver needs to talk to the device, including the _channel_ through which the CPU speaks to the GPU. We’ll talk more about that in the next section.

At this stage, the compiled machine code still hasn’t reached the GPU. Since CUDA 12.2, module loading is lazy by default Controlled by `CUDA_MODULE_LOADING`. It shipped opt-in in CUDA 11.7 and defaulted to `EAGER` for years; the 12.x series flipped the default to `LAZY` (which can be overridden if you want loading costs paid up front).—the driver defers uploading a kernel’s SASS cubin to the card’s memory until the very first time that specific kernel is actually launched.

Underneath `libcuda` sits the kernel-mode driver, `nvidia.ko`, which `libcuda` reaches by invoking `ioctl` on device files. When `cuLaunchKernel` finally needs to put work on the GPU, it becomes a conversation with that kernel module. What follows is the mechanics of that conversation.

## Getting it onto the GPU[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#getting-it-onto-the-gpu)

A GPU does not take function calls like a CPU does. There is no entry point to jump to, and no stack to push arguments onto from the CPU. The GPU sits across a PCIe bus and reads a stream of driver commands out of host memory. Everything `cuLaunchKernel` does past this point is in service of getting one fully formed launch command into that stream, and then telling the GPU it has done so.

The first thing that needs to be done is loading the GPU code onto the device. The first time you run `vadd`, the driver copies across the kernel’s code: it allocates a buffer and copies the SASS in.

Once the code is on the GPU, the CPU needs to get the GPU to read it and start executing it. It does so via a complex dance, across host and device memory. Both the host and the GPU can map regions of each other’s memory spaces, but accesses across the PCIe bus pay a penalty. To achieve a kernel launch, both write to various structures, living across both spaces. These structures comprise the _channel_ — the work queue that runs the GPU’s operations.

There are two important such structures living in host RAM: the **pushbuffer**, and the **GPFIFO**, representing between them the list of work the GPU has to perform.

The **pushbuffer** is a region of memory into which the driver writes commands to the GPU, called _methods_. A method is a register address and a value in the GPU’s native command encoding — the pair defines what action the GPU should perform.

The **GPFIFO** is a ring buffer of pointers, used by the GPU & CPU to coordinate what the GPU still needs to read, and what it’s read already. Each entry in the GPFIFO is made up of two 32-bit words, describing a span of the pushbuffer In this case, base is a GPU virtual address pointing to host memory`(base, length)`.

The GPU continually walks the GPFIFO to find work. Between the driver and the GPU, two cursors need to be maintained: `GP_GET` (how far the GPU has consumed), and `GP_PUT` (how far the driver has produced). Both cursors live in USERD, a small per-channel structure that here sits in device memory. To launch a kernel, the driver fills a pushbuffer span with the relevant methods, points a GPFIFO entry at it, and advances `GP_PUT`. Once the GPU consumes the entry, it advances `GP_GET`.

Where the different pieces live.

Our launch is triggered by a burst of methods, first [`SET_INLINE_QMD_ADDRESS_A/B`](https://github.com/NVIDIA/open-gpu-kernel-modules/blob/590.48.01/src/common/sdk/nvidia/inc/class/clc6c0.h#L403-L409)How I know it’s this method, given that `libcuda` is closed source: see the [appendix](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#appendix-how-to-look-inside-the-launch). followed by a run of [`LOAD_INLINE_QMD_DATA`](https://github.com/NVIDIA/open-gpu-kernel-modules/blob/590.48.01/src/common/sdk/nvidia/inc/class/clc6c0.h#L409-L410). These methods serve to stream an object called the “Queue Meta Data” (**QMD**) into the pushbuffer.

The QMD is the launch descriptor for a compute grid. It holds the grid and block dimensions — our 4096 and 256, from the `.cu` code — the registers per thread and shared memory it needs, and two addresses: the program’s start (the SASS the first launch loaded into GPU memory) and the constant bank holding the kernel’s arguments. That bank is where the arguments the host stub packed land: the driver copies them in and records the bank’s address in the QMD. The QMD tells the GPU where the SASS is, how to turn that SASS into a parallel program, and where to signal its completion of that program.

Everything is now in place for the GPU to start running. The problem is that the GPU’s **host engine**The part of the GPU’s control logic that interfaces with the host. hasn’t acted: it doesn’t watch the cursor on modern cards They used to: older GPUs [snooped USERD](https://github.com/NVIDIA/open-gpu-kernel-modules/blob/590.48.01/src/common/unix/nvidia-push/src/nvidia-push.c#L421-L438), so writing `GP_PUT` was enough. Turing and later don’t, so the driver rings the doorbell instead., so the change to `GP_PUT` just sits there until something tells the engine to look.

It is told to look through the **doorbell**. The GPU maps a small window of its registers into the process, and one of them is the doorbell; the driver writes the channel’s _work-submit token_ to it. The token tells it which channel has new work.

When its doorbell gets rung, the host engine reads the updated `GP_PUT`, follows the new GPFIFO entry to the pushbuffer span, and pulls the methods out of it by DMA. When it reaches the compute method carrying our QMD, it hands that descriptor to the “compute work distributor”, about which more shortly.

From the CPU’s side the launch is done: `cuLaunchKernel` returned the moment the doorbell was rung. The call was asynchronous, so control returns to the program and the CPU runs on while the GPU works; we pick the host side back up once the kernel has run.

It’s time for the GPU to start doing its job.

## Instruction by instruction[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#instruction-by-instruction)

The host engine hands the QMD to the **compute work distributor**Sometimes still called the GigaThread Engine. There is one of these on the whole GPU. There is one linear list of SASS instructions in VRAM, and the compute work distributor + the QMD is the first step in telling the hardware how to make that linear list of thread instructions into a massively parallel program across all the **Streaming Multiprocessors** (SMs).

In our journey down the stack, our compute work distributor now has a QMD describing 4096 blocks of 256 threads. The card we are targeting is a GeForce RTX 4090 chip with **128 SMs**NVIDIA’s AD102-300-A1 SKU disables 16 of the physical 144 SMs on the full die to maximize manufacturing yield, as detailed in the [NVIDIA Ada GPU Architecture whitepaper](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf).. The distributor’s task is to keep all 128 saturated with work.

The compiled machine code sits as a single linear sequence in global memory. Each SM contains its own local Instruction Cache (I-cache), and every active warp on the GPU maintains its own private [Program Counter](https://en.wikipedia.org/wiki/Program_counter) (PC)Since Volta, the model goes finer still — each _thread_ carries its own program counter and call stack ([Independent Thread Scheduling](https://docs.nvidia.com/cuda/volta-tuning-guide/index.html#independent-thread-scheduling)), letting threads in a warp diverge and reconverge freely. Issue is still per-warp, though: each cycle the scheduler picks one warp and issues to the lanes currently at a common PC.. Schedulers on the SM then fetch instructions from that linear sequence independently, allowing different warps to execute the same SASS code at different speeds, or down different branch paths.

One instruction stream in VRAM, cached locally per SM. An SM keeps up to 48 warps resident (the grid), but its four schedulers issue at most one instruction each per cycle. Here nearly every warp is parked on the `LDG.E` load (orange) and only one slot is issuing the `FADD` (green).

The hardware constraints of our SMs set the number of blocks that can run at the same time`cudaGetDeviceProperties` tells you this information:

```
+------------------------------------------------------------+
  |                   AD102 SM Resource Caps                   |
  +------------------------------------------------------------+
  |  Max Active Threads/SM |  1,536 threads (48 warps)         |
  |  Register File/SM      |  65,536 32-bit registers (256 KB) |
  |  Shared Memory/SM      |  100 KB                           |
  +------------------------------------------------------------+
```

Our launch configuration specifies blocks of **256 threads (8 warps)**, and `ptxas` reserved **16 registers per thread**.

1.   **Register capacity**: Each block needs $256 \times 16 = 4 , 096$ registers. On registers alone, an SM could fit $65 , 536 / 4 , 096 = 16$ resident blocks.
2.   **Thread capacity**: The hardware caps each SM at 1,536 active threads. Divided by our block size, this yields $1 , 536 / 256 = 6$ resident blocks.

Because thread capacity is the tighter bottleneck, each SM holds at most **6 blocks (48 warps) at once**.

The distributor assigns these 6 resident blocks to an SM. Each SM is divided into **four processing blocks (sub-partitions)**. Each sub-partition is a self-contained execution pipeline.

The SM distributes our 48 resident warps evenly across these four sub-partitions, so when the SM is full each warp scheduler has **12 active warps** ($48 / 4$) to manage. Every cycle, a warp scheduler evaluates its 12 candidates, selects one _eligible_ warp, and dispatches its next instruction across the 32 physical lanes of its execution slice.

### What does it mean for a warp to be _eligible_?[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#what-does-it-mean-for-a-warp-to-be-eligible)

A GPU decides when an instruction is ready to run differently from a CPU. A modern out-of-order CPU discovers dependencies [dynamically at runtime](https://en.wikipedia.org/wiki/Tomasulo%27s_algorithm), with [reorder buffers](https://en.wikipedia.org/wiki/Re-order_buffer) and [rename logic](https://en.wikipedia.org/wiki/Register_renaming) spending silicon on extracting parallelism from a single thread. A GPU doesn’t need that: it hides latency by keeping many warps resident and switching between them when they stall. With parallelism the order of the day, too much heavyweight dependency machinery is the wrong use of silicon. So the hardware leans on the compiler to schedule everything whose timing it can predict, falling back to lightweight hardware scoreboards for whatever it can’t.

Every 128-bit SASS instruction carries a packed control-code payload written by `ptxas`The clearest public reconstructions are the Citadel microbenchmarking papers ([Jia et al., “Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking”](https://arxiv.org/abs/1804.06826)) and [these `maxas` control-code notes](https://github.com/NervanaSystems/maxas/wiki/Control-Codes) for Maxwell.. These scheduling control bits dictate hardware timing directly and contain three key directives:

1.   **A static stall count**: For fixed-latency instructions—like standard integer or floating-point maths—the compiler knows exactly when the ALUs will write back. It encodes a precise cycle count telling the scheduler exactly how long to park this warp before issuing its very next instruction.
2.   **A yield hint**: A single bit telling the scheduler whether this warp should yield its scheduling priority. If the compiler knows this warp is about to hit a bottleneck, it sets this hint to let the scheduler prioritize other active warps on the next clock cycle.
3.   **Dependency-barrier indices**: For variable-latency operations whose duration cannot be predicted at compile time—most notably global memory loads (`LDG`) and special functions (`MUFU`)—the hardware provides **six physical scoreboard barriers (numbered 0 to 5)** per warp.

Why you won't see these bits in the disassembly

When you disassemble a binary using NVIDIA’s standard `nvdisasm` tool, the raw control codes are hidden by default; the tool strips them away to show you standard, clean SASS mnemonics. However, they are stored directly alongside the instructions. If you inspect the raw binary using `cuobjdump -sass` and look closely at the hexadecimal instruction comments (e.g., `/* 0x... */`), you will see the packed, raw hex words that house these control bits.

What we know about their exact layout comes from the microbenchmarking community’s reverse-engineering efforts. Although the bit fields have shifted and evolved between Maxwell, Volta, Ampere, and Ada Lovelace, the core architectural concept remains identical: compile-time static scheduling metadata is packed directly into the instruction stream to keep the SM hardware as simple and power-efficient as possible.

Running `cuobjdump -sass` on our `vadd`, each instruction comes with its raw 128-bit encoding as two 64-bit words, and the _second_ word of each pair carries the control payload:

```
$ cuobjdump -sass vadd                              # control payload
/*00a0*/  LDG.E R4, [R4.64]                       /* 0x000ea8000c1e1900 */
/*00b0*/  LDG.E R3, [R2.64]                       /* 0x000ea2000c1e1900 */
/*00c0*/  IMAD.WIDE R6, R6, R7, c[0x0][0x170]     /* 0x000fe200078e0207 */
/*00d0*/  FADD R9, R4, R3                         /* 0x004fca0000000000 */
/*00e0*/  STG.E [R6.64], R9                       /* 0x000fe2000c101904 */
```

Pulling out the control payloads The clearest public reconstructions are the Citadel microbenchmarking papers ([Jia et al., “Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking”](https://arxiv.org/abs/1804.06826)) and [these `maxas` control-code notes](https://github.com/NervanaSystems/maxas/wiki/Control-Codes) for Maxwell. — their bit layout is in the [appendix](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#decoding-the-sass-control-words) — you can see the schedule that `ptxas` wrote, with each directive in action:

| instruction | stall | yield | sets | waits-on |
| --- | --- | --- | --- | --- |
| `LDG.E` | 4 | yes | `B2` | — |
| `LDG.E` | 1 | yes | `B2` | — |
| `IMAD.WIDE` | 1 | yes | — | — |
| `FADD` | 5 | no | — | `B2` |
| `STG.E` | 1 | yes | — | — |

The two loads leverage directive 3, each “set”-ing the **same** scoreboard barrier, `B2`. The `FADD`, the first instruction that needs the loaded `R4` and `R3`, carries a wait on `B2`: until both loads have returned and the barrier clears, the warp is **ineligible**, and the scheduler skips it for one of the other eleven warps in the sub-partition.

The `FADD`→`STG` hand-off is directive 1. A floating-point add has a fixed latency, so there is no barrier: `FADD` just carries `stall=5`, which parks the warp for the few cycles it takes for `R9` to land before `STG` reads it.

The yield bit, directive 2, toggles on & off across the sequence, as the compiler nudges scheduling priority around the operations that are about to wait.

Each cycle the scheduler reads the warp’s six-bit barrier state and a small stall counter, and makes the eligibility decision for each warp. This is how a GPU hides latency with close to zero hardware-scheduling overhead.

### Loading the data[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#loading-the-data)

When a warp scheduler does find an eligible warp and issues the `LDG.E` loads, we can follow the hardware requests down the memory hierarchy. Each of the 32 threads in the warp computes an address. Because our threads access consecutive elements of `float` arrays (each 4 bytes), the warp requests a contiguous block of 128 bytes ($32 \times 4$ bytes).

The SM’s load/store unit detects this consecutive access pattern and performs **request coalescing**. It merges the 32 per-thread 4-byte requests into four 32-byte sector requests. Fetches are in units of 32 bytes, so this is perfect — if the reads were not consecutive & coalesced like this we’d end up loading more data than we needed.

The coalesced requests first check the SM’s local L1 Data Cache. If they miss, they are routed through a high-bandwidth crossbar interconnect that links all 128 SMs to the distributed slices of the 72 MB L2 Cache. If the requests miss in the L2 cache as well, they descend further to the memory controllers and travel across the memory bus to the physical GDDR6X VRAM chips The RTX 4090 uses GDDR6X memory rather than the High-Bandwidth Memory (HBM) found in datacenter-class GPUs like the A100 or H100.. The `STG.E` store that writes `c[i]` at the end of the loop follows the exact same path in reverse In principle anyway, we’ll see later that `c[i]` never hits VRAM..

If we run our compiled kernel under the NVIDIA Nsight Compute profiler (`ncu`), we can get some telling metrics:

```
$ ncu --metrics \
    launch__grid_size,launch__block_size,launch__registers_per_thread,\
    launch__waves_per_multiprocessor,sm__warps_active.avg.pct_of_peak,\
    smsp__issue_active.avg.pct_of_peak,dram__throughput.avg.pct_of_peak,\
    gpu__time_duration.sum \
    ./vadd
...
----------------------------------------------------------
Metric Name                                   Unit   Value
----------------------------------------------------------
launch__grid_size                                    4,096
launch__block_size                                     256
launch__registers_per_thread                            16
launch__waves_per_multiprocessor                      5.33
sm__warps_active.avg.pct_of_peak              %      82.77
smsp__issue_active.avg.pct_of_peak            %       5.17
dram__throughput.avg.pct_of_peak              %      79.65
gpu__time_duration.sum                        us     10.78
----------------------------------------------------------
```

82.77% of warps were active over the run. The warps were issuing instructions 5.17% of the time. The DRAM was running at 79.65% of its maximum utilization.

The kernel has an extremely low **arithmetic intensity**: it performs exactly one floating-point addition (`FADD`) and a tiny amount of pointer arithmetic for every 12 bytes of data it transfers (two 4-byte loads and one 4-byte store).

So the `10.78`$\mu$s just comes down to how fast the DRAM bus can feed the kernel its inputs, here about four-fifths of peak Only the two inputs cross the bus, not the full 12 MB. `ncu` shows 8.4 MB read from DRAM and essentially nothing written: the 4 MB output `c` fits in the 72 MB L2 and isn’t flushed to DRAM until the later device-to-host copy reads it back. The four-fifths-of-peak figure is the read side — 8.4 MB / 10.78 $\mu$s $\approx$ 780 GB/s..

## Back to the CPU[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#back-to-the-cpu)

The result is now sitting in the GPU’s L2 cache. The CPU is what runs our terminal, so it needs to get the result in order to show it to us. We return to its view of events.

The launch returned control to the CPU the moment the doorbell rang. So the GPU needs to tell the CPU it’s done. When the last of our 4096 blocks retires, the GPU does so by posting a completion semaphore the QMD carried (the [fence fields](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#reading-device-memory--qmd-layout) at words 23–24).

The device-to-host `cudaMemcpy(c, dc, …)`A pinned-memory `cudaMemcpyAsync` would skip the wait and let the host run ahead. copy sits behind the kernel on the default stream, so the GPU’s copy engine (which performs the transfer) is gated on the semaphore. Once the value appears the GPU performs the DMA. Because `c` is still sitting dirty in the 72 MB L2 — the `STG.E` stores never had to spill it to DRAM — the engine’s reads are served straight from L2, and the data crosses PCIe without a DRAM round trip.

Once the copy finishes, it posts its _own_ semaphore, which the host was waiting on in `cudaMemcpy`. `cudaMemcpy` completes on the host, `c` is ordinary host memory again, and `printf` loads `c[0]` and `c[n-1]` out of RAM, formats them into a string, and hands them to a `write` syscall on stdout.

## The whole path[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#the-whole-path)

The kernel source went through `cicc` to PTX and through `ptxas` to SASS, which `fatbinary` packed with a fallback copy of the PTX into a cubin-bearing fatbin that the linker welded into an ordinary Linux executable. A constructor registered that fatbin before `main`, mapping a host stub to a mangled device name. The first launch lazily uploaded the cubin to the GPU. `cuLaunchKernel` built a QMD from the launch configuration, wrote it into a pushbuffer as GPU methods, advanced `GP_PUT`, and rang a doorbell with a single MMIO store, at which point the GPU’s host engine fetched the work and handed the QMD to the compute work distributor. The distributor spread 4096 blocks across 128 SMs at full occupancy, four warp schedulers per SM issued 128-bit instructions whose stall counts the compiler had written, and a coalesced memory path pulled the inputs through DRAM at four-fifths of peak bandwidth to compute, in each of a million lanes, a single sum. A completion semaphore and a copy engine then carried that result back across the bus to where `printf` was waiting, and we learnt that:

`c[0]=2.000000 c[n-1]=2.000000`
## Appendix: how to look inside the launch[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#appendix-how-to-look-inside-the-launch)

Claude & I used a lot of different tricks to see the different parts of the kernel launch happen here. Some of it comes from painstakingly reading the [open kernel modules](https://github.com/nvidia/open-gpu-kernel-modules).

A few claims in this post can’t be read off the open source, because `libcuda` is closed source. To figure them out, there are a few useful diagnostic hooks.

### An interposition hook[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#an-interposition-hook)

Driver method writes never go through a syscall (the driver writes them straight into a write-combined buffer it has already mapped), so to find them you need to read the memory. We used an `LD_PRELOAD` shim that wraps `mmap`, records every region the driver maps from the `/dev/nvidia*` file, and exposes a function a test program calls just after the launch returns to dump them:

```
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include <sys/mman.h>
#include <unistd.h>
#include <string.h>

// Dynamic linker function pointers
static void* (*orig_mmap)(void*, size_t, int, int, int, off_t) = NULL;

// Store captured channel mappings
struct Map {
    void* addr;
    size_t length;
    off_t offset;
    char path[256];
} maps[128];
static int map_count = 0;

void* mmap(void* addr, size_t length, int prot, int flags, int fd, off_t offset) {
    if (!orig_mmap) {
        orig_mmap = dlsym(RTLD_NEXT, "mmap");
    }
    void* ret = orig_mmap(addr, length, prot, flags, fd, offset);
    if (ret != MAP_FAILED && fd != -1 && map_count < 128) {
        char proclink[256];
        char path[256];
        sprintf(proclink, "/proc/self/fd/%d", fd);
        ssize_t len = readlink(proclink, path, sizeof(path) - 1);
        if (len != -1) {
            path[len] = '\0';
            // We care about NVIDIA device files
            if (strstr(path, "/dev/nvidia")) {
                maps[map_count].addr = ret;
                maps[map_count].length = length;
                maps[map_count].offset = offset;
                strcpy(maps[map_count].path, path);
                map_count++;
            }
        }
    }
    return ret;
}

// Expose a function to dump memory ranges holding the pushbuffer
void dump_pushbuffer() {
    printf("\n=== [Shim] Dump of Mapped Pushbuffers ===\n");
    for (int i = 0; i < map_count; i++) {
        // User-space channels/pushbuffers are mapped at large sizes
        if (maps[i].length >= 0x1000) {
            unsigned int* ptr = (unsigned int*)maps[i].addr;
            printf("Mapping %d: %s, at %p (%zu bytes), offset 0x%lx\n",
                   i, maps[i].path, maps[i].addr, maps[i].length, (long)maps[i].offset);

            // Walk the words looking for a method-header burst
            for (size_t j = 0; j < maps[i].length / 4; j++) {
                unsigned int word   = ptr[j];
                unsigned int opcode = (word >> 29) & 0x7;     // 1 = INC
                unsigned int count  = (word >> 16) & 0x1FFF;  // payload words
                unsigned int method = (word & 0xFFF) << 2;    // register offset

                // 0x318 is SET_INLINE_QMD_ADDRESS_A, the start of the inline burst
                if (opcode == 1 && method == 0x318) {
                    printf("  [+] Method burst at word %zu: header = 0x%08X\n", j, word);
                    printf("      INC, count %d, offset 0x%04X\n", count, method);
                    for (unsigned int k = 1; k <= count && (j + k) < (maps[i].length / 4); k++) {
                        printf("      word %02u: 0x%08X\n", k, ptr[j + k]);
                    }
                }
            }
        }
    }
}
```

Compile it into a shared library:

`$ gcc -shared -fPIC -o shim.so shim.c -ldl`
and then call `dump_pushbuffer()` from the test program just after the kernel launch, and run it with the shim preloaded so this `mmap` runs in place of libc’s:

`$ LD_PRELOAD=./shim.so ./vadd`
The driver maps a write-combined buffer for the channel; the dump walks it and prints the launch’s method burst. Which we then need to decode.

### Decoding the pushbuffer command stream[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#decoding-the-pushbuffer-command-stream)

A pushbuffer method is a header word followed by data words. The header packs four fields (defined as `NVC46F_DMA_INCR_*` macros in `clc46f.h`):

*   **bits 31:29** — opcode: `0x1` is an increasing-method write (`INC_METHOD`/`INCR_OPCODE_VALUE`), `0x3` is a non-increasing-method write (`NON_INC_METHOD`), and `0x4` is an immediate-data write (`IMMD_DATA_METHOD`).
*   **bits 28:16** — count: the number of payload words (`NVC46F_DMA_INCR_COUNT`).
*   **bits 15:13** — subchannel index: routes the commands to a specialized backend engine context (`NVC46F_DMA_INCR_SUBCHANNEL`).
*   **bits 11:0** — the method’s register offset, divided by four (`NVC46F_DMA_INCR_ADDRESS`), as the shim shifts it back.

There are two launch paths that seem relevant here. The methods are defined per compute class in `src/common/sdk/nvidia/inc/class/` — `clc3c0.h` (Volta), `clc5c0.h` (Turing), `clc6c0.h`/`clc7c0.h` (Ampere), `clc9c0.h` (Ada), `clcbc0.h` (Hopper), `clcdc0.h` (Blackwell). The Ada header (`clc9c0.h`) is a 29-line stub that only defines the class number `0xC9C0` and inherits the Ampere method set, so the definitions we actually read live in the Ampere headers:

*   `0x0318` — `SET_INLINE_QMD_ADDRESS_A` (defined as `NVC6C0_SET_INLINE_QMD_ADDRESS_A` in the Ampere header, inherited unchanged by Ada), which opens an inline-QMD burst streamed straight into the pushbuffer via `LOAD_INLINE_QMD_DATA(i)` (offset `0x0320 + i * 4`).
*   `0x02b4` — `SEND_PCAS_A`, the out-of-line path, which carries only a pointer to a QMD that lives elsewhere in VRAM.

From the dump, we can figure out which one ends up in the pushbuffer. The dump shows the inline path: one increasing-method burst, count 66, opening at `SET_INLINE_QMD_ADDRESS_A`. The 66 words are the two address words (`SET_INLINE_QMD_ADDRESS_A`/`_B`, `0x0318`/`0x031c`) followed by 64 `LOAD_INLINE_QMD_DATA` words (`0x0320` onward) — a 256-byte QMD carried inline. Within it, word 12 is `0x1000` and word 18 is `0x100`: the 4096 and 256 of `vadd<<<4096, 256>>>`.

### Reading device memory & QMD Layout[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#reading-device-memory--qmd-layout)

The Queue Meta Data (QMD) structure is represented as a multi-word layout, with fields defined as multi-word (MW) bits spanning 32-bit boundaries inside `src/common/sdk/nvidia/inc/class/cla0c0qmd.h`. The QMD stores several address-like fields, but they aren’t all the same kind of value:

*   `PROGRAM_OFFSET` — MW(287:256) (Word 8) is a **32-bit** entry-point offset relative to the channel’s code base, not a 64-bit pointer.
*   `CONSTANT_BUFFER_ADDR_LOWER(i)` / `ADDR_UPPER(i)` — MW(959+i _64:928+i_ 64) (e.g. Constant Bank 0 holding our arguments sitting in Words 29–30).
*   `RELEASE0_ADDRESS_LOWER/UPPER` — MW(767:736) (Words 23–24), used for fences/semaphores.
*   `CIRCULAR_QUEUE_ADDR_LOWER/UPPER` — MW(319:288) (Words 9-10).

These point into device memory the CPU can’t read directly: a plain load faults, and both `cudaMemcpy` and `cuMemcpyDtoH` reject the address.

So we need to read it with the GPU. A small kernel copies 512 bytes from a raw pointer into a buffer the host can fetch:

```
__global__ void peek(const unsigned char* src, unsigned char* dst) {
    for (int i = blockIdx.x * blockDim.x + threadIdx.x;
         i < 512;
         i += blockDim.x * gridDim.x) {
        dst[i] = src[i];
    }
}
```

Pointed at each of the QMD fields, exactly one returns all 512 bytes of the SASS. If we run a memory-scanning shim to look for valid GPU virtual addresses inside the QMD, we see a match at Word 48:

`qmd[48] -> 0x74167b272300   512 / 512 bytes match`
Why is SASS matched at Word 48 (`qmd[48]`) when the driver’s program field is `PROGRAM_OFFSET` at Word 8?

Word 8 holds only a 32-bit offset set by the driver, whereas words 48/49 are the hardware-owned `HW_ONLY_INNER_GET` (`MW(1566:1536)`) and `HW_ONLY_INNER_PUT` (`MW(1598:1568)`) fields. In the post-launch dump those words hold a full 64-bit GPU virtual address, and dereferencing the word-48 value returns the kernel SASS. The simplest reading is that the scheduler resolves the program offset into these scheduler-owned fields at launch.

### Decoding the driver’s ioctls[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#decoding-the-drivers-ioctls)

The command stream needs to be read from the memory, but `libcuda` sets up its memory and GPU objects the ordinary way: by running `ioctl` (see Michael Kerrisk, [_The Linux Programming Interface_](https://www.amazon.com/Linux-Programming-Interface-System-Handbook/dp/1593272200), Chapter 4 & 15) on the driver’s device files. `strace` on the one-kernel program records 948 of them Almost all are one-time setup; a steady launch loop makes far fewer., almost all on two file descriptors — `/dev/nvidiactl` and `/dev/nvidia-uvm`:

```
$ strace -f -e trace=ioctl ./vadd
...
ioctl(8, _IOC(_IOC_READ|_IOC_WRITE, 0x46, 0x2a, 0x900), ...)   # /dev/nvidiactl
ioctl(8, _IOC(_IOC_READ|_IOC_WRITE, 0x46, 0x2b, 0x30),  ...)   # /dev/nvidiactl
ioctl(9, ...)                                                  # /dev/nvidia-uvm
...
```

The magic byte `0x46` is `'F'`, the NVIDIA resource manager’s ioctl magic The ‘magic’ byte is a value every NVIDIA ioctl carries as a sanity check; see [the Linux kernel documentation](https://kernel.org/doc/html/v5.4/process/magic-number.html).. The command numbers decode against the open kernel modules’ [`nv_escape.h`](https://github.com/NVIDIA/open-gpu-kernel-modules/blob/590.48.01/src/nvidia/arch/nvalloc/unix/include/nv_escape.h#L27-L31): `0x2A` is `NV_ESC_RM_CONTROL` and `0x2B` is `NV_ESC_RM_ALLOC`.

### Decoding the SASS control words[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#decoding-the-sass-control-words)

The stall counts, barriers and yield bits from [the eligibility section](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#what-does-it-mean-for-a-warp-to-be-eligible) come from a 21-bit control field `ptxas` packs into the top of each instruction’s second 64-bit word, which `cuobjdump -sass` prints next to the mnemonic:

```
20    17 16       11 10   8 7    5 4 3    0
┌────────┬───────────┬──────┬──────┬─┬──────┐
│ reuse  │ wait mask │ read │write │Y│stall │
│  (4)   │    (6)    │ barr │ barr │ │ (4)  │
└────────┴───────────┴──────┴──────┴─┴──────┘
```

The two 3-bit indices name the scoreboard barriers the instruction sets, the 6-bit mask is the barriers it waits on, `Y` is the yield bit, and `stall` is the static cycle count. The layout is undocumented and reconstructed from microbenchmarking The clearest public reconstructions are the Citadel microbenchmarking papers ([Jia et al., “Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking”](https://arxiv.org/abs/1804.06826)) and [these `maxas` control-code notes](https://github.com/NervanaSystems/maxas/wiki/Control-Codes) for Maxwell..

### NVCC host registration callbacks[§](http://fergusfinn.com/blog/what-happens-when-you-run-a-gpu-kernel/#nvcc-host-registration-callbacks)

If you want to see the exact code the compiler generates to register your GPU code at startup, compiling with `nvcc --keep` lets you inspect `vadd.cudafe1.stub.c`.

The start-of-process registration is handled by an automatically generated constructor:

```
// from vadd.cudafe1.stub.c
static void __sti____cudaRegisterAll(void) __attribute__((__constructor__));

static void __nv_cudaEntityRegisterCallback(void **__T4) {
    __cudaRegisterEntry(__T4, (void(*)(const float*, const float*, float*, int))vadd,
                        _Z4vaddPKfS0_Pfi, -1);
}

static void __sti____cudaRegisterAll(void) {
    __cudaRegisterBinary(__nv_cudaEntityRegisterCallback);
}
```

The `__attribute__((__constructor__))` directive tells the linker to execute `__sti____cudaRegisterAll` before `main` starts. It registers our device binary with the CUDA runtime and schedules the callback. When executed, `__cudaRegisterEntry` maps the host function pointer `vadd` to the mangled device entry point `_Z4vaddPKfS0_Pfi`, building the hash table that `cudaLaunchKernel` queries at launch time.

