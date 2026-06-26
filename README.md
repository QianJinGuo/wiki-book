# wiki-book

《AI 第一书：从入门到院士》— 基于 MkDocs Material 的开源电子书。

## 快速启动

```bash
docker compose up -d
```

访问 http://localhost:8080

## 开发模式

```bash
pip install -r requirements.txt
mkdocs serve -a 0.0.0.0:8000
```

访问 http://localhost:8000

## 更新内容

1. 编辑 `docs/` 下的 markdown 文件
2. 重新构建: `docker compose up -d --build`
