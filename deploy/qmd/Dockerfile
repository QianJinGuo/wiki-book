FROM node:22-alpine
COPY qmd-pkg/ /opt/qmd-pkg/
RUN ln -sf /opt/qmd-pkg/node_modules/@tobilu/qmd/bin/qmd /usr/local/bin/qmd
WORKDIR /data
EXPOSE 8005
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["qmd", "mcp", "--http", "--port", "8005", "--host", "0.0.0.0"]
