# Root Dockerfile - delegates to deploy/docker/Dockerfile
# This file exists for backward compatibility with `docker compose up -d --build`

FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY mkdocs.yml ./
COPY overrides/ overrides/
COPY docs/ docs/
COPY scripts/ scripts/
COPY styles.css ./

RUN mkdocs build

# Remove old ch*/ subdirectories
RUN cd site && for d in ch01 ch02 ch03 ch04 ch05 ch06 ch07 ch08 ch09 ch10 ch11 ch12 ch13 ch14 ch15 ch16 ch17 ch18 ch19 ch20 references; do rm -rf "$d" 2>/dev/null; done

# Strip trailing slashes from internal links (prevents nginx 301 redirect port mismatch)
# /ch01-xxx/ → /ch01-xxx (in href attributes, unquoted)
RUN cd site && find . -name '*.html' -exec sed -i 's|href=/\(ch[0-9]\+-[0-9]\+-[^/ >"]*\)/|href=/\1|g' {} +

# -- Serve stage --
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /build/site /usr/share/nginx/html
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
