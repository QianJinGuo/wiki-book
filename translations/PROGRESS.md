# 主课程面批量翻译进度账本

> 后台 API 任务（`/tmp/translate-priority.log`）与会话内人工翻译（本会话）共用此目录。
> 状态：✔ 已完成入典 · 🔄 后台进行中 · ⬜ 待翻（页面启用英文时自动走实时兜底，不会断层）。
> 段落数为页面唯一段（去重后），随每日闭环重建会小幅浮动。

| 页面 | 唯一段 | 状态 | 完成者 |
|---|---|---|---|
| index.html（首页） | 162 | ✔ | 后台 API |
| course.html（课程总览） | 73 | ✔ | 会话内人工 |
| references.html（参考文献） | 45 | ✔ | 会话内人工 |
| 404.html | — | ✔ | 后台 API |
| dashboard/index.html | 73 | ✔ | 后台 API |
| learn/index.html | 9 | ✔ | 后台 API |
| PATH.html（学习路径） | 590 | ✔ | 后台 API |
| ch01-ai-basics | 359 | ✔ | 后台 API |
| ch02-prompt | 2,680 | 🔄 | 后台 API（87,722 字符） |
| ch03-ai-tools | 90 | ✔ | 会话内人工 |
| ch04-agent-core | 378 | ⬜ | 待翻（13,925 字符） |
| ch05-harness | 167 | ⬜ | 待翻（5,271 字符） |
| ch06-memory | ~1,900 | ⬜ | 待翻（最大章 ~72K 字符） |
| ch07-skill-tool | 113 | ✔ | 会话内人工 |
| ch08-multi-agent | ~1,300 | ⬜ | 待翻 |
| ch09-ai-coding | 168 | ⬜ | 待翻（4,405 字符） |
| ch10-rag | ~1,100 | ⬜ | 待翻 |
| ch11-infra | 220 | ⬜ | 待翻（8,668 字符） |
| ch12-security | ~350 | ⬜ | 待翻 |
| ch13-mlops | ~900 | ⬜ | 待翻 |
| ch14-data | ~950 | ⬜ | 待翻 |
| ch15-training | ~1,150 | ⬜ | 待翻 |
| ch16-inference | ~500 | ⬜ | 待翻 |
| ch17-multimodal | ~400 | ⬜ | 待翻 |
| ch18-robotics | 338 | ⬜ | 待翻（7,677 字符） |
| ch19-research-frontier | ~500 | ⬜ | 待翻 |
| ch20-ai-philosophy | ~900 | ⬜ | 待翻 |
| 其余 1,500+ 实体/工具页 | ~180,000 段 | ⬜ | 后台长尾（字典未覆盖时走实时兜底） |

**规则**：任何一方翻过的段（按源文哈希）另一方自动复用，互不重复计费；未覆盖段前端实时兜底。
