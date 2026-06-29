# Haptics design and implementation - Microsoft Design

## Ch01.499 Haptics design and implementation - Microsoft Design

> 📊 Level ⭐⭐ | 7.2KB | `entities/haptics-design-implementation-microsoft-windows11.md`

## Haptics Design and Implementation — Microsoft Windows 11

## 摘要

微软在 Windows 11 中引入了系统级触觉反馈支持，通过 `InputHapticsManager` API 为应用提供一致的触觉体验。文章定义了一套标准化的「触觉语言」（Haptic Language），基于波形参数（强度、衰减、锐度）建立了一套可跨设备复用的交互反馈体系。这是数字交互设计中长期被忽视的「第三感知通道」——在视觉和听觉之外，触觉终于有了系统级的设计规范和实现路径。

## 核心要点

### 触觉反馈的三个价值维度

| 维度 | 作用 | 设计意义 |
|------|------|----------|
| **清晰度 (Clarity)** | 物理确认交互行为，减少不确定性 | 让用户不必看屏幕就知道操作是否成功 |
| **包容性 (Inclusion)** | 超越视觉/听觉通道，增强无障碍体验 | 为视障或听障用户提供额外感知通道 |
| **愉悦感 (Delight)** | 表达性反馈，增添交互乐趣 | 微妙的触感差异可以传达「质感」 |

### 触觉波形语言（Haptic Language）

Windows 定义了一套基于三个维度的波形系统，这是整套设计的核心抽象：

**三个波形特征维度：**
- **强度 (Intensity)**：反馈的力度感受
- **衰减 (Decay)**：反馈消退的速度
- **锐度 (Sharpness)**：反馈的质感特征，从柔软到清脆

**交互反馈波形：**
| 波形 | 用途 | 触感描述 |
|------|------|----------|
| **Hover** | 悬停状态指示 | 轻柔脉冲，预示即将发生的动作 |
| **Collide** | 边界/极限触达 | 柔和脉冲，表示到达边界 |
| **Align** | 对齐吸附 | 清脆脉冲，对象对齐到参考线时触发 |
| **Step** | 离散步进 | 坚实脉冲，用于滑块、数值调节等 |
| **Grow** | 运动/过渡/智能系统活动 | 动态脉冲，传达渐进变化 |

**结果确认波形：**
| 波形 | 用途 | 触感描述 |
|------|------|----------|
| **Success** | 操作成功确认 | 上升模式，确认完成 |
| **Error** | 操作失败指示 | 下降模式，指示失败 |

### 设计原则

1. **建立清晰的因果关系**：触觉反馈必须是用户操作的可靠响应。仅在用户发起的操作中使用，延迟需控制在 50ms 以内，否则会削弱动作与反馈的关联感。
2. **提供信号而非噪声**：并非每个交互都需要触觉反馈——只在能增加清晰度的地方使用。
3. **保持一致性**：相同类型的交互必须使用相同的波形模式，避免用户混淆。触觉、视觉、音频反馈在时间和强度上应保持对齐。

### 典型应用场景

| 场景 | 目的 | 触发时机 | 推荐波形 |
|------|------|----------|----------|
| 精确对齐 | 指示对象对齐到边缘或中心 | 拖动/缩放时吸附到参考线 | Align |
| 放置目标 | 指示可放置位置 | 拖动项目到有效目标区域 | Hover |
| 离散步进 | 指示范围内的离散值 | 控件到达步进值或吸附 | Step |
| 屏幕边界 | 指示到达边界 | 拖动窗口到屏幕边缘触发 Snap | Collide |

## 深度分析

### 技术实现架构

`InputHapticsManager` API 是 Windows 11 提供的系统级触觉接口，其设计有几个值得注意的特点：

**设备无关抽象**：API 通过 `GetForCurrentThread()` 自动检测当前线程最近接收输入的设备，开发者无需手动指定是鼠标、触控板还是触控笔。这大幅降低了多设备适配的复杂度。

**预定义波形而非自由参数**：与音频合成不同，触觉反馈采用预定义波形（`KnownSimpleHapticsControllerWaveforms`）而非暴露原始参数。这一设计选择约束了自由度，但保证了跨设备的一致性——同一波形在不同硬件上的「感觉」由设备驱动层负责适配。

**支持的输入设备**：鼠标、触控板、触控笔。不同厂商和型号的支持程度不同，微软维护了一个兼容设备列表并持续更新。

### 代码实现模式

```csharp
// 基本使用模式
using Windows.Devices.Haptics;

bool supported =
    ApiInformation.IsTypePresent("Windows.Devices.Input.InputHapticsManager") &&
    InputHapticsManager.IsSupported();

if (supported)
{
    var mgr = InputHapticsManager.GetForCurrentThread();
    mgr.TrySendHapticWaveform(
        KnownSimpleHapticsControllerWaveforms.Align,
        0);  // 0 作为 fallback 让系统选择设备默认值
}

// 停止反馈（在拖动/交互结束时调用）
InputHapticsManager.GetForCurrentThread().TryStopFeedback();
```

关键设计细节：`TrySendHapticWaveform` 的第二个参数是 fallback 值，传 0 表示让系统自动选择设备特定的默认行为。这体现了「约束即自由」的 API 设计哲学——开发者只需声明意图（「我要 Align 效果」），具体的物理实现交给平台。

### 与游戏触觉的对比

| 维度 | Windows 11 InputHaptics | 游戏手柄触觉 (如 DualSense) |
|------|------------------------|---------------------------|
| 设计目标 | UI 交互确认 | 沉浸式体验 |
| 参数控制 | 预定义波形，有限调参 | 高度可定制的自适应触发器 |
| 设备覆盖 | 鼠标/触控板/触控笔 | 专用游戏手柄 |
| 延迟要求 | < 50ms | 容忍更高延迟 |
| 开发复杂度 | 低（选波形即可） | 高（需精细调参） |

## 实践启示

1. **触觉是被严重低估的 UX 维度**：大多数数字产品只依赖视觉和听觉反馈，但触觉能提供即时、低认知负荷的确认感。对于高频操作（如列表滑动、拖放、表单提交），触觉反馈可以显著减少用户的「确认焦虑」。
2. **50ms 延迟红线**：触觉反馈的延迟感知阈值比视觉更严格。超过 50ms 用户会感觉「脱节」，这要求触觉逻辑必须靠近输入事件处理链的前端。
3. **波形一致性 > 波形丰富度**：宁可只用 3-4 种波形但保持全局一致，也不要为每个场景设计独特触感。用户通过重复体验建立「触觉词汇」，混乱的波形使用会破坏这一体系。
4. **无障碍设计的战略价值**：触觉反馈为视障用户提供了关键的非视觉确认通道。在无障碍合规日益重要的背景下，系统级触觉支持是一个值得关注的方向。
5. **跨平台差距**：目前只有 Windows 11 提供了系统级触觉 API，macOS 和 Linux 尚无等价方案。Web 端的 Vibration API 能力远弱于此。这为 Windows 平台的交互体验差异化提供了窗口。

## 相关实体

- [Haptics Design Implementation Microsoft Windows11](/ch01-488-haptics-design-and-implementation-microsoft-design/)
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/)
- [What Figma Made Visible](/ch03-018-what-figma-made-visible-component-model-bridging-design-and/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/haptics-design-implementation-microsoft-windows11.md)

---

