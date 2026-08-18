---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652718554&idx=3&sn=d289d47aa2e1e3f2bcea2a45f73b98ce
ingested: 2026-08-18
feed_name: WeChat-新智元
source_published: 2026-08-17
sha256: f2274f5290c45bf39c24daa5c3853d62e8a66112f61b85d1456a146c9c43bf6d
---

# 从Claude隐形水印回望GenAI时代信息隐藏：嵌入水印如何保证无损？

新智元 2026-08-17 18:09 北京

### 

### 

**新智元报道**

2026年8月11日，Anthropic宣布：自8月2日起发布的新版Claude模型，将在生成文本中直接嵌入人眼不可见、机器可读的隐形水印，使AI生成内容在被复制、传播之后仍可被软件识别溯源。

官方文档写道：「当受支持的Claude模型生成文本时，它会将一种难以察觉的水印直接嵌入到文本之中。您不会看到它，而且它既不会改变Claude回答的语义、质量，也不会影响其可读性。」

该机制覆盖Claude网页端、API与Claude Code等全线产品，面向全球用户生效且不可关闭；生成的图像等文件还将附带符合C2PA标准的数字签名溯源元数据。

这是Anthropic签署欧盟《人工智能法案》第50条透明度行为准则后的标志性举措。

给AI生成内容「打水印」，正在从企业倡议走向全球共识。2025年6月，世界经济论坛在天津夏季达沃斯发布《2025年十大新兴技术》，「生成式水印」位列第二；未来学家凯文·凯利在《2049：未来10000天的可能》中预言，人工智能时代需要「重新定义真实」，需要「在AI生成的图像和影像上加上类似水印的辨别真伪的标记」。

图1 夏季达沃斯论坛和凯文·凯利预言

但把水印「做对」并不容易。

Anthropic公告发布当天，用户最集中的质疑正是：打水印，会不会伤模型？会不会降低生成质量？

「可证明的性能无损」，由此成为GenAI时代信息隐藏研究的核心命题。而要理解这一命题，需要回到它的理论源头——可证安全隐写。

**可证安全隐写**

**等待生成模型二十年**

隐写与水印同属信息隐藏。传统隐写多年来一直停留在「经验安全」：用隐写检测算法测试隐写的安全强度，却无法给出数学保证。可证安全隐写则要求严格证明：载密数据与正常数据在分布上不可区分。

这条理论路线由来已久。

1949年，Shannon指出建立隐蔽通信理论的困难；1998年，Cachin引入相对熵，给出信息论意义上的安全定义；2002年，图灵奖得主Manuel Blum指导Hopper等人建立计算安全隐写框架，2004年又发展出公钥隐写与隐蔽密钥协商。

然而，所有可证安全隐写构造都依赖一个苛刻前提——载体分布可精确采样。自然数据分布不可控，理论因此沉寂多年。

图2 可证安全隐写发展历程简述

2018年，AI生成模型带来转折：模型先学到分布、再按分布采样，天然提供了「显式分布或完美采样器」。

中科大团队在国际上最早提出生成式可证安全隐写思路，给出「黑盒采样」与「压缩—可逆采样」两套框架（IWDW 2018、arXiv 2018），将隐写安全性归约到加密算法安全性——把消息加密成伪随机密文，用密文驱动采样生成内容，接收方经逆采样恢复密文。

彼时生成式AI尚未爆发，这一想法显得「超前」，一度难以获得学界同行认可。随着语音等生成模型质量快速提升，相关成果逐渐得到承认，国际水印与取证研讨会（IWDW）邀请中科大团队作题为「When Provably Secure Steganography Meets Generative Models」的大会主旨报告。

图3 最早的生成式可证安全隐写文章

2021年前后，AI生成数据逐步成为网络内容的主要形态，可证安全隐写在全球范围内得到广泛关注：清华大学提出基于样本分组的可证安全语言隐写（Findings of ACL 2021）；波士顿大学与约翰霍普金斯大学提出面向真实分布的密码学安全隐写Meteor（ACM CCS 2021）；牛津大学提出基于最小熵耦合的完美安全隐写（ICLR 2023）。

中科大团队提出基于「分布副本」的Discop构造（IEEE S&P 2023），显著提升了嵌入载荷率。同年，Quanta Magazine将「在生成数据中完美隐藏秘密信息」评为年度国际计算机科学七大突破之一，宣告了信息隐藏进入「可证明」时代。

**从对称到非对称**

**从「有盒」到「无盒」**

早期的生成式可证安全隐写均为「对称密钥」体制，收发双方须预先共享密钥，且依赖白盒提取，使用场景受限。

此外，子词歧义会导致提取失败。中科大团队把技术路线推向公钥隐写、无盒/灰盒场景、并消除了子词歧义，使生成式隐藏走向实用。

**公钥隐写** （IEEE TIFS 2024）：提出将椭圆曲线密码（ECC）与生成模型结合的可证安全公钥隐写方案、并提出了隐写密钥交换协议。解决了隐写密钥协商和隐藏信息「非对称」提取问题。

**无盒隐写** （IEEE TMM 2026）：传统方法依赖「白盒」提取，接收方必须持有与发送方完全相同的语言模型。团队提出Disreo，通过token位置随机化与输出概率重组实现「无盒提取」，接收方无需访问底层模型即可恢复消息，为实际部署提供更大便利。

**灰盒隐写** （ACM CCS 2026）：白盒与无盒之间还存在「灰盒」场景——收发双方资源不对等，接收方可能只有运行小模型的能力（如移动端设备）。SpecStega基于推测采样（speculative sampling）：以双方共享的小模型完成消息嵌入与提取，再借助目标大模型对输出进行精炼，使最终载密文本既对齐大模型的输出分布、保持高质量与安全性，又能在接收端仅凭小模型高效解码，载荷率相对现有黑盒方案提升20倍以上——为可证安全隐写提供了介于「有盒」与「无盒」之间的第三条路径。

**解决子词歧义** （IEEE TDSC）：基于大语言模型的隐写普遍面临分词（token）解码歧义——同一段文本可能被切成不同子词序列，导致提取失败。团队提出SyncPool，在嵌入前将存在前缀关系的token统一分组，从原理上消除歧义，实现可证安全隐写的可靠提取。

**从隐写到水印**

**让「可证无损」走向产业**

AIGC大模型首先学到了自然数据的分布，然后按照分布采样生成文本、图像、音视频等内容。如果能够做到：在生成内容中嵌入水印但是不影响采样分布，那就意味着水印嵌入没有影响生成质量。

可证安全隐写理论上保证了载密数据与正常生成数据的分布不可区分，即嵌入信息不改变模型的采样分布——这正是「可证生成质量无损水印」的定义。水印不需要隐写那样大的容量，因此还可以用容量换取鲁棒性。

在文本领域，中科大团队开发的可证生成质量无损水印系统，即插即用、无需修改模型参数，支持单比特鲁棒鉴别与多比特模型归因，已应用于星火大模型，安全GPT模型等平台，服务了1.3万名开发者。

与此同时，国际上可证无损生成文本水印的研究也在快速推进：

2024年，马里兰大学等团队的《Unbiased Watermark for Large Language Models》（ICLR 2024 Spotlight）定义了无偏水印并给出通用构造；

同年，斯坦福大学提出抗失真的鲁棒无偏水印（TMLR 2024）；

2025年，多通道无偏水印MCmark（ACL 2025）在保持严格无偏的同时，提升了水印提取的鲁棒性。

在图像领域，中科大团队提出Gaussian Shading（CVPR 2024），把加密随机化后的水印映射为与正常生成不可区分的高斯潜变量，再经扩散过程作用于整个潜空间，无需训练、即插即用、可证明性能无损；

Gaussian Shading++与T2SMark（NeurIPS 2025）进一步解决了真实部署中的鲁棒性、生成参数变化与生成多样性问题；

TAG-WM（ICCV 2025）引入「模板水印+信息水印」双重机制，在无损前提下同时实现篡改定位与权属确认；

SemBind（ICML 2026）通过语义掩码器把水印与图像语义绑定，抵御黑盒伪造攻击。

图4 可证无损生成式图像水印Gaussian Shading（CVPR 2024）

**从内容水印到模型水印。** 模型本身也是重要的数字资产，同样需要可靠的归属证明，而模型水印始终绕不开一个质疑：会不会影响模型的正常使用？

借鉴图灵奖得主Shafi Goldwasser等人在FOCS 2022提出的「可证明不可检测后门」构造，中科大团队提出了可证性能无损的黑盒模型水印协议（IEEE TDSC 2026）：以不可伪造的消息认证码构造分支指示器，使正常用户触发水印分支的概率在计算上可忽略，从而把性能无损性归约到密码学安全。

「可证无损」由此从生成内容延伸到了模型本身。

**从「经验安全」到「可证安全」**

Anthropic的隐形水印上线首日即引发争议：写作者担心署名归属，开发者担心「水印会不会降低生成质量」。行业先行者选择了「工程化快跑」，而「打得准、不伤身、经得起改写与擦除、还能给出确定证据」的目标，呼唤坚实的理论支撑。

从Shannon提出挑战问题的设想到Blum等人的理论框架，从2018年第一个生成式可证安全隐写算法到星火大模型水印和Claude的水印，信息隐藏走了七十七年，终于从「经验安全」跨越升级到「可证安全」，把「担心嵌水印伤模型」变成「数学上证明无损」——无论对生成的内容，还是对模型本身——为AI内容治理提供了有理论保证的技术支撑。

**水印的攻与防**

设计水印难，擦除水印容易。其实也不尽然。设计水印要同时追求质量无损和鲁棒性，而攻击者也需要在质量约束下擦水印。

没了约束，水印很容易擦。逐句重写擦水印，还算不算原模型生成的内容？或许不如直接使用其他开源模型生成了。

和其他安全领域一样，攻防双方在各自约束条件下博弈，有攻有防这个技术方向才有活力。

而「无损」就是攻防双方的约束和追求。

防守方不愿因为嵌水印牺牲生成质量；攻击方也不希望因擦水印降低质量。

从来没有绝对安全，防守的意义在于给攻击制造尽可能大的代价。攻防的本质是代价博弈，水印亦然。

参考资料：

[1] Anthropic. How Claude marks AI-generated content[EB/OL]. <https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content>

[2] World Economic Forum. Top 10 emerging technologies of 2025[R]. 2025.

[3] 凯文·凯利. 2049：未来10000天的可能[M]. 北京：中信出版集团, 2025.

[4] Claude Elwood Shannon. Communication theory of secrecy systems[J]. The Bell System Technical Journal, 1949, 28(4): 656-715.

[5] Christian Cachin. An information-theoretic model for steganography[C]//International Workshop on Information Hiding (IH). Springer, 1998: 306-318.

[6] Nicholas J. Hopper, John Langford, Luis von Ahn. Provably secure steganography[C]//Annual International Cryptology Conference (CRYPTO). Springer, 2002: 77-92.

[7] Luis von Ahn, Nicholas J. Hopper. Public-key steganography[C]//International Conference on the Theory and Applications of Cryptographic Techniques (EUROCRYPT). Springer, 2004: 323-341.

[8] Kejiang Chen, Hang Zhou, Hanqing Zhao, Dongdong Chen, Weiming Zhang, Nenghai Yu. When provably secure steganography meets generative models[EB/OL]. arXiv:1811.03732, 2018.

[9] Kuan Yang, Kejiang Chen, Weiming Zhang, Nenghai Yu. Provably secure generative steganography based on autoregressive model[C]//International Workshop on Digital Forensics and Watermarking (IWDW). Springer, 2018: 55-68.

[10] Kejiang Chen, Hang Zhou, Hanqing Zhao, Dongdong Chen, Weiming Zhang, Nenghai Yu. Distribution-preserving steganography based on text-to-speech generative models[J]. IEEE Transactions on Dependable and Secure Computing, 2022, 19(5): 3343-3356.

[11] Siyu Zhang, Zhongliang Yang, Jinshuai Yang, Yongfeng Huang. Provably secure generative linguistic steganography[C]//Findings of the Association for Computational Linguistics: ACL-IJCNLP 2021. 2021: 3046-3055.

[12] Gabriel Kaptchuk, Tushar M. Jois, Matthew Green, Aviel D. Rubin. Meteor: Cryptographically secure steganography for realistic distributions[C]//Proceedings of the 2021 ACM SIGSAC Conference on Computer and Communications Security (CCS). 2021: 1529-1548.

[13] Christian Schroeder de Witt, Samuel Sokota, J. Zico Kolter, Jakob Foerster, Martin Strohmeier. Perfectly secure steganography using minimum entropy coupling[C]//International Conference on Learning Representations (ICLR). 2023.

[14] Jinyang Ding, Kejiang Chen, Yaofei Wang, Na Zhao, Weiming Zhang, Nenghai Yu. Discop: Provably secure steganography in practice based on "distribution copies"[C]//IEEE Symposium on Security and Privacy (S&P). 2023: 2238-2255.

[15] Quanta Magazine. The biggest discoveries in computer science in 2023[EB/OL]. 2023-12-20. <https://www.quantamagazine.org/the-biggest-discoveries-in-computer-science-in-2023-20231220>

[16] Xin Zhang, Kejiang Chen, Jinyang Ding, Yuqi Yang, Weiming Zhang, Nenghai Yu. Provably secure public-key steganography based on elliptic curve cryptography[J]. IEEE Transactions on Information Forensics and Security, 2024, 19: 3148-3163.

[17] Yuang Qi, Kejiang Chen, Kai Zeng, Weiming Zhang, Nenghai Yu. Provably secure disambiguating neural linguistic steganography[J]. IEEE Transactions on Dependable and Secure Computing, 2025, 22(3): 2430-2442.

[18] Jun Jiang, Kejiang Chen, Na Zhao, Yuang Qi, Xin Zhang, Weiming Zhang, Nenghai Yu. Disreo: Provably secure no-box-extraction linguistic steganography based on distribution reorganization[J]. IEEE Transactions on Multimedia, 2026, 28: 2970-2983.

[19] Jun Jiang, Kejiang Chen, Yuang Qi, Jiawei Zhao, Weiming Zhang, Nenghai Yu. SpecStega: Provably secure linguistic steganography based on speculative sampling in asymmetric resource scenarios[C]//ACM SIGSAC Conference on Computer and Communications Security (CCS). 2026.

[20]Zhengmian Hu, Lichang Chen, Xidong Wu, Yihan Wu, Hongyang Zhang, Heng Huang. Unbiased watermark for large language models[C]//International Conference on Learning Representations (ICLR). 2024.

[21]Rohith Kuditipudi, John Thickstun, Tatsunori Hashimoto, Percy Liang. Robust distortion-free watermarks for language models[J]. Transactions on Machine Learning Research (TMLR). 2024.

[22]Ruibo Chen, Yihan Wu, Junfeng Guo, Heng Huang. Improved unbiased watermark for large language models[C]//Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (ACL). 2025.

[23] Zijin Yang, Kai Zeng, Kejiang Chen, Han Fang, Weiming Zhang, Nenghai Yu. Gaussian shading: Provable performance-lossless image watermarking for diffusion models[C]//IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). 2024: 12162-12171.

[24] Zijin Yang, Xin Zhang, Kejiang Chen, Kai Zeng, Qiyi Yao, Han Fang, Weiming Zhang, Nenghai Yu. Gaussian Shading++: Rethinking the realistic deployment challenge of performance-lossless image watermark for diffusion models[EB/OL]. arXiv:2504.15026, 2025.

[25] Jindong Yang, Han Fang, Weiming Zhang, Nenghai Yu, Kejiang Chen. T2SMark: Balancing robustness and diversity in noise-as-watermark for diffusion models[C]//Advances in Neural Information Processing Systems (NeurIPS). 2025.

[26] Yuzhuo Chen, Zehua Ma, Han Fang, Weiming Zhang, Nenghai Yu. TAG-WM: Tamper-aware generative image watermarking via diffusion inversion sensitivity[C]//IEEE/CVF International Conference on Computer Vision (ICCV). 2025.

[27] Xin Zhang, Zijin Yang, Kejiang Chen, Linfeng Ma, Weiming Zhang, Nenghai Yu. SemBind: Binding diffusion watermarks to semantics against black-box forgery attacks[C]//International Conference on Machine Learning (ICML). 2026.

[28] Shafi Goldwasser, Michael P. Kim, Vinod Vaikuntanathan, Or Zamir. Planting undetectable backdoors in machine learning models[C]//IEEE 63rd Annual Symposium on Foundations of Computer Science (FOCS). 2022: 931-942.

[29] Na Zhao, Kejiang Chen, Weiming Zhang, Nenghai Yu. Performance-lossless black-box model watermarking[J]. IEEE Transactions on Dependable and Secure Computing, 2026, 23(2): 1955-1970.

[30] 张卫明, 陈可江, 俞能海. 可证安全隐写：理论、应用与展望[J]. 网络空间安全科学学报, 2023, 1(1): 38-46.

[31] John Kirchenbauer, Jonas Geiping, Yuxin Wen, Jonathan Katz, Ian Miers, Tom Goldstein. A watermark for large language models[C]//International Conference on Machine Learning (ICML). 2023: 31961-31980.

编辑：LRST

**秒追ASI**

**⭐****点赞、转发、在看一键三连****⭐**

**点亮星标，锁定新智元极速推送！**

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=47ec083f&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzI3MTA0MTk1MA%3D%3D%26mid%3D2652718554%26idx%3D3%26sn%3Dd289d47aa2e1e3f2bcea2a45f73b98ce>)
