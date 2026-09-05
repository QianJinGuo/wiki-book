# Dockerfile for the bilingual book "Agent Engineering: Harness, Loop, Graph"
# Follows the repo convention: serve pre-built sites (run ./build.sh first).
#   site-zh/ -> / (Chinese)
#   site-en/ -> /en/ (English)
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY site-zh/ /usr/share/nginx/html/zh/
COPY site-en/ /usr/share/nginx/html/en/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
