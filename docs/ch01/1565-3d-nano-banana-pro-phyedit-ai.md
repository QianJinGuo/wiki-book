# 3D 指标超过 Nano Banana Pro：浙大开源 PhyEdit 让 AI 在平面图像里进行立体编辑

> 📊 Level ⭐⭐⭐ | 5.4KB | `entities/浙大-立体编辑-acm-mm26-phyedit.md`

# 浙大 PhyEdit：用显式 3D 几何约束让 AI 在平面图像里做立体编辑

PhyEdit 是浙江大学 ReLER 团队提出并开源的图像编辑方案，论文被 ACM MM 2026 接收。针对"语义指令听懂了、但生成出的三维状态常错得离谱"这一图像编辑痛点，PhyEdit 用**显式 3D 几何 preview 指导 DiT 图像编辑**，让模型更准确地处理物体远近、尺度、遮挡和多物体操作，在 ManipEval 的 3D 指标上超过商业闭源的 Nano Banana Pro。

核心哲学一句话概括：**让几何模块负责"搬"，让生成模型负责"画"**。preview 不需要像完整照片，只要清楚表达"物体应该在哪里、应该多大、应该挡住谁"，生成模型就能从源图恢复纹理和身份，把粗糙几何修成自然结果，从而避开"纯 prompt 盲猜三维空间"与"点云投影直接当最终图像"两个极端。

## 方法：四步管线与像素级深度监督

PhyEdit 核心流程拆成四步：用户给定待操作物体和三维操作指令（移动或 6DOF）；估计场景深度和相机参数，把物体反投影成三维点云；在 3D 空间中移动点云再投影成目标 preview；将源图、preview 和文本一起交给 Qwen-Image-Edit backbone 生成最终图像。

在基础 flow-matching loss 之外，PhyEdit 加入**像素级 SILog depth loss**：先从预测 velocity 恢复编辑图，再比较编辑图和目标图的深度。消融结果直接：不使用深度监督 DIoU 62.37 / Chamfer 24.52；latent-to-depth 64.19 / 20.87；pixel-level 方案 65.33 / 18.93，逐级提升。

## 数据与评测：RealManip-40K 与 ManipEval

团队构建了 **RealManip-40K 数据集**（41154 对真实场景图像，提供深度、物体 mask 和代表性三维坐标）。数据管线利用 3D foundation model 的 camera token 聚类，筛选相机近似静止的视频片段，再完成目标检测、跟踪、分割、深度估计和三维位移筛选，保证图像对变化主要来自物体而非相机；重点覆盖明显远近变化、复杂遮挡、多对象同时操作三类难题。

**ManipEval 基准**包含 200 对图像、约 320 个物体，一半单物体、一半多物体操作，从五个层面考察：2D 落点、深度正确性、重建 3D 点云接近度、身份与画质保留、光照接触遮挡合理性。PhyEdit 主要成绩：DIoU 65.33、Mask IoU 27.20、Chamfer 18.93、RA-DINO 36.91、Phys-VLM 93.72；与 [Nano Banana 系列](ch01/1576-nano-banana-2-lite-gemini-omni-flash-google-deepmind.html) 的 Nano Banana Pro 相比，DIoU 提升 5.36、Chamfer 距离降低 6.40、RA-DINO 提升 2.14。

## 能力边界与延伸

PhyEdit 还能把一次编辑变成连续动作：给出三维轨迹后，在轨迹多个位置生成关键状态，再由视频模型插值中间帧；未出现在训练分布中的机械臂也能沿曲线移动物体。普通编辑能力基本保住：外观编辑 + 3D 操作同时完成的综合成功率 87.5%，而 Qwen-Image-Edit 单独普通编辑为 88.8%，仅差 1.3 个百分点。团队还开源了交互式 GUI，可分割选择多个物体、在 3D 点云中调整平移旋转后生成图片。

团队定位克制：PhyEdit 不是完整 physics simulator，不显式计算受力、碰撞和动力学，透明反光物体、极端近景移动、严重深度或分割错误仍可能导致失败。它解决的是更具体的问题——当动作已由用户指定时，如何把一个明确的三维操作渲染成几何合理的视觉状态。这种"显式几何 + 生成渲染"组合，为机器人视觉规划、交互式内容和图像状态预测提供了可复现的开源起点。

## 相关

- [PhyEdit 英文条目](ch01/1139-20.html) — 本实体对应的英文条目
- [Nano Banana 系列](ch01/1576-nano-banana-2-lite-gemini-omni-flash-google-deepmind.html) — ManipEval 对比对象
- [视频生成模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/video-generation-models.md) — 连续动作编辑依赖视频模型插值

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/3d指标超过nano-banana-pro浙大开源方案让ai在平面图像里进行立体编辑-acm-mm26.md)

---

