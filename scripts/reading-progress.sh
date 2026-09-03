#!/bin/bash
# Agent 工程阅读进度追踪器 v2 (macOS compatible)
# Usage: reading-progress.sh [stats|check|next|peek|summary|random]

CD="$(cd "$(dirname "$0")/.." && pwd)"
LIST="${READING_LIST:-$CD/meta/READING-LIST.md}"

if [ ! -f "$LIST" ]; then
  echo "Reading list not found: $LIST" >&2
  echo "Set READING_LIST to a local reading-list file." >&2
  exit 1
fi

count_pattern() {
  local n
  n=$(grep -c "$1" "$LIST" 2>/dev/null) || true
  echo "${n:-0}"
}

get_file_from_line() { echo "$1" | sed -n 's/.*`\(docs\/ch[^`]*\)`.*/\1/p' | sed 's/[[:space:]]*$//'; }
get_title_from_line() { echo "$1" | sed -n 's/.*\*\*\([^*]*\)\*\*.*/\1/p'; }

# Get first meaningful paragraph from article (skip headings, metadata lines)
get_preview() {
  local f="$1"
  # Skip frontmatter if present, skip headings and metadata
  awk '
    BEGIN { fm=0; shown=0 }
    /^---$/ { fm++; next }
    fm==1 { next }
    /^#/ { next }
    /^>/ { next }
    /^\[/ { next }
    /^📊/ { next }
    /^[[:space:]]*$/ { next }
    shown<3 { gsub(/[[:space:]]+/, " "); print; shown++ }
  ' "$f"
}

case "${1:-stats}" in
  stats)
    echo "📊 Agent 工程阅读进度"
    echo "====================="
    total=$(count_pattern '☐\|☑')
    done_count=$(count_pattern '☑')
    pct=0; [ "$total" -gt 0 ] && pct=$((done_count * 100 / total))
    echo "总进度: $done_count / $total ($pct%)"
    echo ""
    t1_s=$(sed -n '/Tier 1：核心冲刺/,/Tier 2：深入子域/p' "$LIST")
    t1_t=$(echo "$t1_s" | grep -c '☐\|☑' 2>/dev/null || true)
    t1_d=$(echo "$t1_s" | grep -c '☑' 2>/dev/null || true)
    t2_s=$(sed -n '/Tier 2：深入子域/,/Tier 3：全面覆盖/p' "$LIST")
    t2_t=$(echo "$t2_s" | grep -c '☐\|☑' 2>/dev/null || true)
    t2_d=$(echo "$t2_s" | grep -c '☑' 2>/dev/null || true)
    echo "  Tier 1 核心冲刺: ${t1_d:-0} / ${t1_t:-0}"
    echo "  Tier 2 深入子域: ${t2_d:-0} / ${t2_t:-0}"
    echo ""
    for track in "轨道 A" "轨道 B" "轨道 C" "轨道 D" "轨道 E" "轨道 F"; do
      section=$(sed -n "/$track/,/^###/p" "$LIST")
      tt=$(echo "$section" | grep -c '☐\|☑' 2>/dev/null || true)
      td=$(echo "$section" | grep -c '☑' 2>/dev/null || true)
      [ "${tt:-0}" -gt 0 ] 2>/dev/null && echo "  $track: ${td:-0} / $tt"
    done
    echo ""
    remaining=$((total - done_count))
    echo "  剩余 $remaining 篇 (~$((remaining * 8 / 60))h)"
    ;;

  check)
    [ -z "$2" ] && echo "Usage: $0 check <keyword>" && exit 1
    matched=$(grep -n '☐' "$LIST" | grep "$2" | head -1)
    if [ -z "$matched" ]; then
      grep -n '☑' "$LIST" | grep -q "$2" && echo "⚠️  已标记过了" || echo "❌ 未找到: $2"
      exit 1
    fi
    lineno=$(echo "$matched" | cut -d: -f1)
    title=$(get_title_from_line "$matched")
    sed -i '' "${lineno}s/☐/☑/" "$LIST"
    echo "✅ 已标记完成: $title"
    echo ""
    "$0" stats
    ;;

  next)
    echo "📖 下一篇未读:"
    echo ""
    grep '☐' "$LIST" | head -5 | while IFS= read -r line; do
      title=$(get_title_from_line "$line")
      file=$(get_file_from_line "$line")
      [ -n "$title" ] && echo "  📄 $title"
      [ -n "$file" ] && echo "     📁 $file"
      if [ -n "$file" ] && [ -f "$CD/$file" ]; then
        words=$(wc -w < "$CD/$file" | tr -d ' ')
        echo "     📊 ${words} 词 (~$((words / 100 + 1)) 分钟)"
      fi
      echo ""
    done
    ;;

  peek)
    next_line=$(grep -m1 '☐' "$LIST")
    next_file=$(get_file_from_line "$next_line")
    [ -z "$next_file" ] && echo "🎉 全部读完了！" && exit 0
    full_path="$CD/$next_file"
    [ ! -f "$full_path" ] && echo "❌ 文件不存在: $full_path" && exit 1
    title=$(head -3 "$full_path" | grep -m1 '^#' | sed 's/^#* *//')
    words=$(wc -w < "$full_path" | tr -d ' ')
    echo "📖 $title"
    echo "📁 $next_file"
    echo "📊 ${words} 词 (~$((words / 100 + 1)) 分钟)"
    echo "---"
    get_preview "$full_path"
    echo "---"
    echo "标记完成: $0 check $(echo "$next_file" | sed 's|.*/||;s|\.md||')"
    ;;

  random)
    entry=$(grep '☐' "$LIST" | shuf | head -1)
    [ -z "$entry" ] && echo "🎉 全部读完了！" && exit 0
    title=$(get_title_from_line "$entry")
    file=$(get_file_from_line "$entry")
    echo "🎲 随机推荐:"
    echo "  📄 $title"
    [ -n "$file" ] && echo "  📁 $file"
    if [ -n "$file" ] && [ -f "$CD/$file" ]; then
      words=$(wc -w < "$CD/$file" | tr -d ' ')
      echo "  📊 ${words} 词 (~$((words / 100 + 1)) 分钟)"
      echo ""
      get_preview "$CD/$file"
    fi
    fname=$(echo "$file" | sed 's|.*/||;s|\.md||')
    echo ""
    echo "  标记完成: $0 check $fname"
    ;;

  summary)
    echo "📝 Tier 1 文章速览"
    echo "==================="
    echo ""
    sed -n '/Tier 1：核心冲刺/,/Tier 2：深入子域/p' "$LIST" | while IFS= read -r line; do
      file=$(get_file_from_line "$line")
      [ -z "$file" ] && continue
      full_path="$CD/$file"
      [ ! -f "$full_path" ] && continue
      title=$(head -3 "$full_path" | grep -m1 '^#' | sed 's/^#* *//')
      words=$(wc -w < "$full_path" | tr -d ' ')
      first=$(get_preview "$full_path" | head -1 | cut -c1-120)
      echo "📄 $title ($words 词)"
      [ -n "$first" ] && echo "   💬 $first"
      echo ""
    done
    ;;

  *)
    echo "Agent 工程阅读追踪器 v2"
    echo "  stats    - 阅读进度统计"
    echo "  next     - 下一篇未读"
    echo "  peek     - 预览下一篇开头"
    echo "  check N  - 标记完成 (N=文件名关键词)"
    echo "  random   - 随机推荐"
    echo "  summary  - Tier 1 速览"
    ;;
esac
