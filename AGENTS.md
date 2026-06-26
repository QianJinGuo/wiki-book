# AGENTS.md — AI Agent Instructions

This project builds the《AI 第一书：从入门到大师》static site using MkDocs Material + Docker.

## Project Structure

```
wiki-book/
├── docs/              # Markdown source files (2200 files, 20 chapters)
│   ├── index.md       # Landing page
│   ├── ch01-*.md      # Ch01: AI & LLM Basics (913 articles)
│   ├── ch02-*.md      # Ch02: Prompt Engineering (31 articles)
│   ├── ...
│   └── ch20-*.md      # Ch02: AI Philosophy & Future (16 articles)
├── mkdocs.yml         # MkDocs configuration
├── styles.css         # Custom styles (inside docs/)
├── requirements.txt   # Python deps: mkdocs-material, mkdocs-minify-plugin
├── Dockerfile         # Multi-stage: python build → nginx serve
├── docker-compose.yml # Container orchestration (port 8002)
├── nginx.conf         # Gzip + cache config
└── AGENTS.md          # This file
```

## Build & Serve

### Docker (production)
```bash
docker compose up -d              # Start on port 8002
docker compose up -d --build      # Rebuild after content changes
docker compose down               # Stop
```

### Local dev
```bash
pip install -r requirements.txt
mkdocs serve -a 0.0.0.0:8000     # Dev server with hot reload
```

## Content Updates

1. Edit markdown files in `docs/`
2. Rebuild: `docker compose up -d --build`
3. Commit: `git add -A && git commit -m "update: ..."`

## Key Conventions

- **File naming**: `ch{NN}-{NNN}-{slug}.md` (e.g. `ch04-090-deep-dive-claude-code.md`)
- **Chapter files**: `ch{NN}-{topic}.md` are index pages for each chapter
- **Language**: Chinese with English technical terms mixed naturally
- **Links**: Relative links between chapters use `../chXX-slug/` format

## Pitfalls

- `mkdocs build` without `--strict`: the book has many cross-chapter relative links that produce warnings; `--strict` treats them as errors
- nginx listens on 8080 internally; docker maps to 8002 externally
- `docs/styles.css` is referenced in mkdocs.yml as `extra_css: - styles.css`
