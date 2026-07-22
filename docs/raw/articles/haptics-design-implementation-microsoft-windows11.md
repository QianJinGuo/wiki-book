---
source_url: "https://microsoft.design/articles/haptics-design-and-implementation/""
ingested: 2026-06-26
sha256: 70ab1b4aed3e7f11
---

# Haptics design and implementation - Microsoft Design


Published Time: 2026-06-15T23:32:27+00:00

Markdown Content:
[Guidelines](https://microsoft.design/news-and-stories/category/guidelines/)

Guidance for adding haptic feedback to improve clarity, support inclusion, and create more intuitive experiences.

Jun 15, 2026 – The estimated reading time is  11 min.

![Image 1: A laptop with a highlighted trackpad, a stylus pen, and a computer mouse with highlighted areas on a white surface, suggesting interactive touch or input zones.](https://microsoft.design/wp-content/uploads/2026/05/heroDevices.png)

 Introducing advanced haptics in Windows 11 

## Getting started with haptics

Touch helps people understand how the physical world responds to their actions through immediate feedback. In contrast, digital interfaces often rely on visual or auditory cues alone. Haptics add a sense of touch to digital interactions, making experiences feel more responsive and intuitive.

Windows now supports contextual haptic feedback through the InputHapticsManager API, enabling apps to deliver consistent experiences across supported devices.

**Contents:**

[What is haptics](http://microsoft.design/articles/haptics-design-and-implementation/#what-is-haptics)

[Why add haptics](http://microsoft.design/articles/haptics-design-and-implementation/#why-add-haptics)

[Haptic language](http://microsoft.design/articles/haptics-design-and-implementation/#haptic-language)

[When to use haptics](http://microsoft.design/articles/haptics-design-and-implementation/#when-to-use-haptics)

[Implementing haptics](http://microsoft.design/articles/haptics-design-and-implementation/#implementing-haptics)

[Implemtation examples](http://microsoft.design/articles/haptics-design-and-implementation/#implementation-examples)

## What is haptics?

Before diving in further, let’s briefly align on the basics:

## Why add haptics?

**Clarity** Haptic feedback reinforces interactions by providing a physical confirmation, helping make actions feel responsive and reducing uncertainty.

**Inclusion** Haptics extend feedback beyond visual and auditory channels, helping make interactions more accessible for users with different needs and preferences.

**Delight** Thoughtfully designed haptics bring interactions to life through subtle, expressive feedback—adding moments of delight beyond basic function.

![Image 2: Abstract image featuring overlapping translucent blue shapes with rounded edges, set against a white background, creating a modern and dynamic visual effect.](https://microsoft.design/wp-content/uploads/2026/05/divider1.jpg)

## Haptic language

Windows provides a set of predefined haptic waveforms designed for common interaction patterns. Each waveform has a distinct feel and purpose, helping create consistent experiences across applications and devices.

Waveforms are defined by three characteristics:

**Intensity**

 How strong the feedback feels.

**Decay**

 How quickly the feedback fades.

**Sharpness**

 The character of the feedback, ranging from soft to crisp.

![Image 3: A blue 3D bar with arrows and labels indicating "Intensity" vertically, "Decay" to the right, and "Sharpness" diagonally upward. The background features a dotted grid.](https://microsoft.design/wp-content/uploads/2026/05/waveformParameters.png)

Use the waveforms below to match feedback to specific interaction moments, such as alignment, boundaries, discrete changes, or completed actions.

### Interaction feedback

Waveforms in this group provide feedback during an interaction.

### Hover

Hover

A light pulse that indicates hover states, signaling an upcoming action

### Collide

Collide

A soft pulse that indicates reaching a boundary or limit

### Align

Align

A sharp pulse when an object snaps to an alignment guide

### Step

Step

A firm pulse for discrete changes, such as moving through steps or values

### Grow

Grow

A dynamic pulse that conveys motion, transitions, or intelligent system activity

### Process confirmation

Waveforms in this group communicate the outcome of a completed action.

### Success

Success

An ascending pattern that confirms a completed action

### Error

Error

A descending pattern that indicates a failed action

## When to use haptics?

Haptics should feel like a natural part of the interaction. Use them to reinforce user input, not distract from it.

The following principles guide when and how to use haptics effectively.

![Image 4: A stylized 3D blue square button with a white paper airplane icon in the center, set against a light blue and white abstract background with dotted lines and subtle gradients.](https://microsoft.design/wp-content/uploads/2026/05/causeEffect.png)

### 1. Establish a clear cause – effect relationship

Haptic feedback should act as a reliable response to user input. Reserve it for user-initiated actions to create a clear and intuitive connection.

To ensure interactions feel immediate, aim for a latency of less than 50 ms. Delays can weaken the connection between action and feedback.

![Image 5: A single blue, translucent square hovers above a light background with geometric lines and faint rectangles, creating a modern, minimalist design.](https://microsoft.design/wp-content/uploads/2026/05/signalsNotNoise-1.jpg)

### 2. Provide signals, not noise

Haptics are most effective when used with clear intent. Not every interaction needs feedback – use it where it adds value.

The scenarios below show a few common patterns where haptics improve clarity and interaction.

### **Precision:** Object Alignment

**Purpose**

 Indicate when an object aligns to the edge or center of another object.

**Trigger**

 While moving or resizing an object, the cursor snaps to an alignment guide.

**Recommended Waveform**

 Align

[Video 16](https://microsoft.design/wp-content/uploads/2026/05/align.mp4)

Align

### **Action zones:** Drop Target

**Purpose**

 Indicate that an item can be dropped at the current location.

**Trigger**

 Dragging an item over a valid drop target, such as dropping files into a folder or application.

**Recommended Waveform**

 Hover

[Video 17](https://microsoft.design/wp-content/uploads/2026/05/hover.mp4)

Hover

### **Detents:** Slider

**Purpose**

 Indicate discrete steps or values within a range.

**Trigger**

 The control reaches a step or snaps to a value.

**Recommended Waveform**

 Step

[Video 18](https://microsoft.design/wp-content/uploads/2026/05/step.mp4)

Step

### **Boundaries:** Screen Edge

**Purpose**

 Indicate that a boundary or edge has been reached.

**Trigger**

 Dragging a window to the edge of the screen to activate Window snap.

**Recommended Waveform**

 Collide

[Video 19](https://microsoft.design/wp-content/uploads/2026/05/collide.mp4)

Collide

![Image 6: Abstract digital illustration featuring several floating blue squares of varying sizes, with soft shadows, arranged on a light blue and white geometric background. The overall design is modern and minimalist.](https://microsoft.design/wp-content/uploads/2026/05/designConsistency-1.jpg)

### 3. Provide haptics consistently

Apply haptics consistently across similar interactions so users can build a clear understanding of what each signal represents. Use waveforms for their intended purpose and avoid mixing patterns for the same interaction.

When combining haptics with visual or audio feedback, ensure they are aligned in timing and intensity. Well-designed haptics may go unnoticed, but their absence is felt.

![Image 7: Abstract digital artwork with curved, overlapping translucent shapes in shades of blue and white, creating a flowing, layered pattern. The design has a smooth, modern, and airy appearance.](https://microsoft.design/wp-content/uploads/2026/05/divider2.jpg)

## Implementing haptics

Use the InputHapticsManager API to add haptic feedback to your app. The resources below include API documentation, hardware guidance, and reference implementations.

![Image 8: A laptop with a highlighted trackpad, a stylus pen, and a computer mouse with highlighted areas on a white surface, suggesting interactive touch or input zones.](https://microsoft.design/wp-content/uploads/2026/05/heroDevices.png)

 Supported input device types by the InputHapticsManager API 

### Supported devices

Haptics are supported on input devices such as mouse, touchpad, and pen. Availability varies by model and manufacturer. See the current list of compatible devices for the InputHapticsManager API. This list is updated as new devices are added.

## Implementation examples

### Basic Usage

Use InputHapticsManager to trigger haptic waveforms on the input device that most recently delivered input to the current thread. Device detection and fallback are handled automatically.

Start haptic playback

```
using Windows.Devices.Haptics;

// Check whether the InputHapticsManager API is available
// and supported on the current system.
bool supported =
    ApiInformation.IsTypePresent("Windows.Devices.Input.InputHapticsManager") &&
    InputHapticsManager.IsSupported();

if (supported)
{
    var mgr = InputHapticsManager.GetForCurrentThread();

    // Trigger a known waveform. Pass 0 as fallback to let
    // the system pick a device-specific default.
    mgr.TrySendHapticWaveform(
        KnownSimpleHapticsControllerWaveforms.Align,
        0);
}
```

Stop haptic playback

```
// Call on drag or interaction end to stop any ongoing playback.

InputHapticsManager
    .GetForCurrentThread()
    .TryStopFeedback();
```

