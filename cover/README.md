# 《AI 工程》封面

这是一版面向出版社提案、电子书和网站传播的封面设计稿。视觉概念是“可被工程化的知识系统”：右侧由模块、连接和锚点组成的上升结构，抽象表达从模型原理到 Agent 生产系统的完整路径；左侧保留安静的出版物排版空间，并加入五篇内容概览，让读者能快速判断全书范围。

## 文件

- `ai-engineering-cover.svg`：1600×2400 竖版封面，可编辑矢量排版源文件。
- `ai-engineering-cover-wide.svg`：1920×1080 宽版封面，可编辑矢量排版源文件。
- `render.mjs`：使用仓库已有的 Playwright 渲染 SVG，并生成全部尺寸版本。
- `art/portrait-art.png`、`art/wide-art.png`：无文字的主视觉图层，便于后续替换或做其他版式。
- `exports/`：已渲染的 PNG/JPG 尺寸版本。

## 文字依据

书名、副标题、章节规模和内容范围依据 [jinguo.tech](https://jinguo.tech/) 当前首页信息整理。出版社正式印刷前，还需由责任编辑确认作者署名、ISBN、书号条码、出版社标识、版权页信息、出血线和 CMYK 印刷文件。

## 色彩（墨金书房 · Ink & Gold，与站点主题一致）

- Midnight navy：`#0A1628`（与首页 Hero 同源）
- Gold primary：`#F5C84C`
- Gold muted：`#C9A84C`
- Warm paper：`#F0E9D9` / 正文 `#EFE8D6`
- Muted bronze text：`#A99F87` / `#B5AC96`

主视觉图层为金色调 duotone（原蓝青版保留在 `art/*-art.png`），由 `make-art.sh` 从源图重新生成；站点主题 token 见 `overrides/assets/stylesheets/theme.css`。

## 重新渲染

在仓库根目录执行（需要仓库已有的 Playwright 和 ImageMagick）：

```bash
bash cover/make-art.sh   # 仅需重生成金色主视觉图层时
node cover/render.mjs    # 渲染全部尺寸到 cover/exports/
```
