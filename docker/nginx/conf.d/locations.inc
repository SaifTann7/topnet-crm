# =============================================================================
# Shared location blocks — included by HTTP and HTTPS server blocks
# =============================================================================

limit_conn conn_limit 50;
limit_req zone=general_limit burst=100 nodelay;

# ---------------------------------------------------------------------------
# Backend API — no caching, rate limited
# ---------------------------------------------------------------------------
location /api/ {
    limit_req zone=api_limit burst=60 nodelay;

    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;

    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate" always;
    add_header Pragma "no-cache" always;
    proxy_no_cache 1;
    proxy_cache_bypass 1;
}

# ---------------------------------------------------------------------------
# Spring Boot Actuator + APM discovery
# ---------------------------------------------------------------------------
location /actuator/ {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;
    add_header Cache-Control "no-store" always;
}

location /application/ {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;
    add_header Cache-Control "no-store" always;
}

# ---------------------------------------------------------------------------
# OpenAPI / Swagger UI
# ---------------------------------------------------------------------------
location /swagger-ui/ {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;
}

location /v3/api-docs {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;
}

location /swagger-ui.html {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://backend_upstream;
}

# ---------------------------------------------------------------------------
# Angular static assets — aggressive caching (immutable hashed bundles)
# ---------------------------------------------------------------------------
location ~* \.(?:js|css|woff2?|ttf|eot|ico|svg|png|jpg|jpeg|gif|webp|avif)$ {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://frontend_upstream;

    proxy_cache           static_cache;
    proxy_cache_valid     200 7d;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock      on;
    add_header X-Cache-Status $upstream_cache_status always;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    expires 1y;
}

# ---------------------------------------------------------------------------
# index.html — never cache (ensures fresh SPA deployments)
# ---------------------------------------------------------------------------
location = /index.html {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://frontend_upstream;

    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    expires -1;
}

# ---------------------------------------------------------------------------
# Angular SPA — all other routes
# ---------------------------------------------------------------------------
location / {
    include /etc/nginx/snippets/proxy.conf;
    include /etc/nginx/snippets/security-headers.conf;
    proxy_pass http://frontend_upstream;
    add_header Cache-Control "no-cache" always;
}
