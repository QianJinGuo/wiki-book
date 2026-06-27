# Deployment Environments

Three independent deployment targets, each with its own config and deploy script.

## Architecture

```
docs/                    ← Single source of truth (shared)
  ↓
scripts/build.sh         ← Shared build script
  ↓
site/                    ← Build output (shared)
  ↓
deploy/
├── docker/              ← Local Docker deployment
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── docker-compose.yml
│   └── deploy.sh
├── cloudflare/          ← Cloudflare Pages deployment
│   ├── wrangler.toml
│   └── deploy.sh
└── github/              ← GitHub Pages deployment
    ├── deploy.yml       ← GitHub Actions workflow
    └── deploy.sh
```

## Quick Start

```bash
# Build + deploy to all
./scripts/deploy.sh all

# Build + deploy to specific environment
./scripts/deploy.sh docker --build
./scripts/deploy.sh cloudflare
./scripts/deploy.sh github
```

## Environment Details

### Docker (localhost:8002)
- **URL**: http://localhost:8002
- **Config**: `deploy/docker/nginx.conf`
- **Deploy**: `./deploy/docker/deploy.sh [--build]`
- **Logs**: `docker compose -f deploy/docker/docker-compose.yml logs -f`

### Cloudflare Pages (ai-engineering)
- **URL**: https://ai-engineering-6yk.pages.dev
- **Config**: `deploy/cloudflare/wrangler.toml`
- **Deploy**: `./deploy/cloudflare/deploy.sh`
- **Limit**: Files >25MB auto-removed (search index excluded)

### GitHub Pages
- **URL**: https://qianjinguo.github.io/wiki-book/
- **Config**: `deploy/github/deploy.yml` (GitHub Actions)
- **Deploy**: `./deploy/github/deploy.sh`
- **Note**: Triggers GitHub Actions on push

## Isolation Rules

1. **Source changes** (`docs/`): Affects all environments on next deploy
2. **Docker config** (`deploy/docker/`): Only affects Docker
3. **Cloudflare config** (`deploy/cloudflare/`): Only affects Cloudflare
4. **GitHub config** (`deploy/github/`): Only affects GitHub Pages
5. **Build script** (`scripts/build.sh`): Shared, affects all environments

## Adding a New Environment

1. Create `deploy/<name>/` directory
2. Add environment-specific config files
3. Create `deploy/<name>/deploy.sh`
4. Add to `scripts/deploy.sh` case statement
