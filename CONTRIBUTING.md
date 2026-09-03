# 贡献指南

感谢你对《AI工程》项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 1. 内容贡献
- **提交新文章**: 提交高质量的 AI 工程相关文章
- **改进现有内容**: 修正错误、补充信息、优化表述
- **翻译**: 帮助翻译内容到其他语言

### 2. 技术贡献
- **修复 Bug**: 报告或修复代码中的问题
- **功能开发**: 添加新功能或改进现有功能
- **性能优化**: 优化构建流程或 RAG 系统

### 3. 社区贡献
- **问题反馈**: 在 GitHub Issues 中报告问题或提出建议
- **文档改进**: 完善文档或添加示例
- **推广分享**: 在社交媒体或技术社区分享项目

## 贡献流程

1. **Fork 仓库**: 点击 GitHub 页面右上角的 Fork 按钮
2. **创建分支**: `git checkout -b feature/your-feature`
3. **提交更改**: `git commit -m "Add some feature"`
4. **推送分支**: `git push origin feature/your-feature`
5. **创建 PR**: 在 GitHub 上创建 Pull Request

## 内容规范

### 文章格式
- 使用 Markdown 格式
- 标题层级清晰（H1 > H2 > H3）
- 添加必要的代码示例
- 标注难度级别（⭐️~⭐️⭐️⭐️⭐️⭐️）

### 内容要求
- **原创性**: 确保内容原创或已获得授权
- **准确性**: 技术内容准确无误
- **时效性**: 内容反映最新的技术发展
- **可读性**: 语言流畅，易于理解

### 引用规范
- 标注内容来源
- 添加参考链接
- 遵守版权规定

### 原始资料公开边界
- `docs/raw/articles/` 可能包含第三方全文，不受仓库统一许可证覆盖。
- 只有在确认原始作者的开放许可或取得逐篇再发布授权后，才能提交全文；否则请提交自己的摘要、分析和原文链接。

## 技术贡献

### 开发环境
```bash
# 克隆仓库
git clone https://github.com/QianJinGuo/wiki-book.git
cd wiki-book

# 安装依赖
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 本地运行
PYTHON=.venv/bin/python bash scripts/build.sh
# 或
docker compose up -d
```

### 代码规范
- 遵循 PEP 8（Python）
- 添加必要的注释
- 编写清晰的提交信息
- 保持代码简洁

## 问题反馈

### Bug 报告
请在 GitHub Issues 中创建新的 Issue，包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息

### 功能建议
请在 GitHub Issues 中创建新的 Issue，说明：
- 功能描述
- 使用场景
- 预期效果

## 行为准则

- 尊重所有贡献者
- 保持友善和建设性
- 专注于技术讨论
- 遵守开源社区规范

## 联系方式

- **GitHub Issues**: [项目 Issues](https://github.com/QianJinGuo/wiki-book/issues)
- **在线阅读**: https://jinguo.tech

感谢你的贡献！🙏
