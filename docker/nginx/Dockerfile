FROM nginx:1.27-alpine

RUN apk add --no-cache curl \
    && mkdir -p /var/cache/nginx/static /var/cache/nginx/api /var/www/certbot \
    && chown -R nginx:nginx /var/cache/nginx

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY snippets/ /etc/nginx/snippets/
COPY conf.d/ /etc/nginx/conf.d/
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh \
    && rm -f /etc/nginx/conf.d/10-http.conf \
              /etc/nginx/conf.d/10-http-redirect.conf \
              /etc/nginx/conf.d/20-https.conf

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
