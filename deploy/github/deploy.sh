#!/bin/bash
# Deploy to GitHub Pages (triggers GitHub Actions)
# Usage: ./deploy/github/deploy.sh [--message "commit message"]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

MESSAGE="${2:-update: wiki content}"

echo "=== Deploying to GitHub Pages ==="

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit and push
echo "Committing changes..."
git add -A
git commit -m "$MESSAGE"

echo "Pushing to GitHub..."
git push

echo "=== GitHub Pages deployment triggered ==="
echo "URL: https://qianjinguo.github.io/wiki-book/"
