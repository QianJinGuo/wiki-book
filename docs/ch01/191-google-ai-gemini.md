# Google被曝正在研发一颗新的服务器AI芯片，把Gemini固化到硬件里

## Ch01.191 Google被曝正在研发一颗新的服务器AI芯片，把Gemini固化到硬件里

> 📊 Level ⭐ | 2.5KB | `entities/google-frozen-v2-server-ai-chip-gemini-hardware.md`

# Google被曝正在研发一颗新的服务器AI芯片，把Gemini固化到硬件里

## 核心内容

Google正在研发代号「Frozen v2」的专用服务器AI芯片，将Gemini模型的部分架构直接固化进硬件电路，以大幅提升推理效率和能效比。据披露，该芯片每瓦功耗能输出的Token数可能达到现有自研AI芯片的6到10倍，最快2028年部署。

文章从四个维度分析了Google的芯片战略：

1. **技术原理**：Frozen v2通过固定Gemini的计算路径（而非权重），减少调度开销、优化数据搬运、激进压低数值精度，将专用化推至新高度。这延续了Google从TPU开始的「删通用、保专用」路线——GPU→TPU→Frozen v2，一层层收窄兼容性以换取效率。

2. **风险与矛盾**：Gemini 3.5 Pro（代号「Cappuccino」）因编码能力未达标而延期数月，模型本身仍在难产中。芯片固化架构意味着押注Gemini的底层计算方式在未来数年内不变，若范式转移（新注意力机制、非Transformer架构）发生，Frozen v2的高效率将反噬为技术包袱。

3. **收敛假说**：Google判断大模型架构正在收敛——旗舰模型更新已不再有飞跃式变化（「下一代巨模型失望陷阱」），底层计算形态频繁翻修的概率降低。这使得「把骨架焊死」从疯狂变为可行，但仍是一场豪赌。

4. **行业影响**：引用Sara Hooker的「硬件彩票」理论，指出AI芯片正从「硬件服务通用模型」转向「芯片认准特定模型骨架」。Etched（固化Transformer）、Taalas（连权重做进硅片）、微软Maia、亚马逊Trainium、Meta MTIA等均在朝此方向演进，可能引发新架构创新所需的灵活算力短缺。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/google-frozen-v2-server-ai-chip-gemini-hardware.md)

---

