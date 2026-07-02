#!/bin/sh
# QMD entrypoint — wiki-book RAG 搜索后端
# 端口: 8005
set -e

DOCS_DIR="/data/docs"
CACHE_DIR="/root/.cache/qmd"

# 首次运行：初始化 + 索引构建
if [ ! -f "$DOCS_DIR/.qmd-initialized" ]; then
  echo "=== QMD 首次初始化 ==="
  echo "文档目录: $DOCS_DIR"
  
  # 确保文档目录存在
  if [ ! -d "$DOCS_DIR" ] || [ -z "$(ls -A "$DOCS_DIR" 2>/dev/null)" ]; then
    echo "错误: $DOCS_DIR 为空。请挂载 wiki-book docs/ 目录。"
    echo "  docker run ... -v /path/to/wiki-book/docs:/data/docs ..."
    exit 1
  fi

  # 初始化 QMD
  cd /data
  qmd init 2>/dev/null || true

  # 添加文档集合
  qmd context add qmd://wiki-book "$DOCS_DIR" --glob "**/*.md" 2>/dev/null || true

  # 标记初始化完成
  touch "$DOCS_DIR/.qmd-initialized"
  echo "=== 初始化完成 ==="
fi

echo "=== 启动 QMD HTTP Server (端口 8005) ==="
exec "$@"
