# Root Dockerfile - delegates to deploy/docker/Dockerfile
# This file exists for backward compatibility with `docker compose up -d --build`

FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt ./
RUN unset http_proxy HTTP_PROXY https_proxy HTTPS_PROXY && pip install --no-cache-dir -r requirements.txt

COPY mkdocs.yml ./
COPY overrides/ overrides/
COPY docs/ docs/
COPY scripts/ scripts/
COPY styles.css ./

RUN mkdocs build

# Remove flat ch01-NNN-*.html duplicates (subdirs ch01/, ch02/ etc. are kept — links point there)
RUN cd site && find . -maxdepth 1 -name 'ch[0-9][0-9]-[0-9][0-9][0-9]-*.html' -delete

# Build neighbor graph for RAG (Tier 1)
RUN if [ -f "site/search/search_index.json" ]; then \
      python3 scripts/build-neighbor-graph.py \
        --input site/search/search_index.json \
        --output site/assets/neighbor_graph.json \
        --top-k 20; \
    fi

# Slim search index for faster loading
RUN python3 scripts/slim-search-index.py

# -- Serve stage --
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /build/site /usr/share/nginx/html
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
