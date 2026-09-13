# Predicting Risk in Content Launches

> 📊 Level ⭐ | 4.4KB

## Predicting Risk in Content Launches: How Data-Driven Insights can Transform Launch Planning

→ [原文存档](https://netflixtechblog.com/predicting-risk-in-content-launches-how-data-driven-insights-can-transform-launch-planning-587b1f2de928?source=rss----2615bd06b42e---4)

## Predicting Risk in Content Launches: How Data-Driven Insights can Transform Launch Planning

by Emily Gill

_Each year, we bring the Analytics Engineering community together for an Analytics Summit — a multi-day internal conference to share analytical deliverables across Netflix, discuss analytic practice, and build relationships within the community. This post is one of several topics presented at the Summit highlighting the breadth and impact of Analytics work across different areas of the business._

### **Understanding Risk in Content Launches**

Every title you see on Netflix goes through several key phases: Development, Pre-Production, Production/Principal Photography, Post-Production, and finally, Launch Preparation, all leading up to the Title Launch. Once Principal Photography wraps, the focus shifts in Post-Production from content creation to quality assurance and visual effects (if needed).

At the end of Post Production, Netflix receives the final audio and video files — often delivered as an IMF (Interoperable Master Format) — which triggers a flurry of Launch Preparation activities, focused on tasks such as the development of artwork and trailers, creation of subtitles, maturity ratings & quality control, that happen within a tight window and rely on having the finalized media assets in hand.

Some of this work can be kicked off earlier using a non-final version of the media called the Locked Cut, but since it’s not the absolute final deliverable, this presents a tradeoff: should our teams who prepare content for service wait for the more finalized IMF to begin their work, or start sooner with the unfinal Locked Cut? Waiting for the IMF risks a compressed timeline if it arrives late, while starting with the Locked Cut means teams may need to do additional conformance work if there are significant changes between the Locked Cut and the final IMF.

#### **Identifying Gaps in Schedule Accuracy**

To help navigate the decision of when to start launch preparation, our teams rely on estimated delivery dates for both the Locked Cut and IMF media assets, which are manually provided by content partners in production schedules. However, these schedules often have gaps in coverage and lack accuracy for both asset types (see Figure 1).

Figure 1. At an asset-level we generally see that scheduled date accuracy and coverage are lower at horizons further from asset delivery. As we approach delivery (moving towards the right on this plot) schedules become more accurate (errors decrease) adn coverage improves.

This isn’t unexpected — productions are dynamic, facing frequent changes, scheduling conflicts, and unforeseen obstacles that can shift timelines without warning. As a result, there’s a clear opportunity to leverage the wealth of production data we collect to predict the risk of schedule slips. By developing a predictive model, we aim to both fill in ETA gaps (providing asset delivery estimates when

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

