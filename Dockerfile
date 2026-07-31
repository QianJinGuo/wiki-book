# Root Dockerfile — serve pre-built site/ (mkdocs build + neighbor graph + slim done externally)
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built site from build context (built by sync-wiki-book.sh)
COPY site/ /usr/share/nginx/html/

COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
