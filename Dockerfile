# -- Build stage --
FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mkdocs.yml .
COPY docs/ docs/

RUN mkdocs build

# Remove old ch*/ subdirectories (MkDocs generates both flat and nested)
RUN cd site && for d in ch01 ch02 ch03 ch04 ch05 ch06 ch07 ch08 ch09 ch10 ch11 ch12 ch13 ch14 ch15 ch16 ch17 ch18 ch19 ch20 references; do rm -rf "$d" 2>/dev/null; done

# -- Serve stage --
FROM nginx:alpine

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy built site
COPY --from=builder /build/site /usr/share/nginx/html

# Custom nginx config for SPA + gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
