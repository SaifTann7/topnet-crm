#!/bin/sh
set -e

SSL_ENABLED="${NGINX_SSL_ENABLED:-false}"
CERT_FILE="/etc/nginx/ssl/fullchain.pem"
KEY_FILE="/etc/nginx/ssl/privkey.pem"

mkdir -p /var/cache/nginx/static /var/cache/nginx/api /var/www/certbot

# Clean runtime configs
rm -f /etc/nginx/conf.d/05-ssl-map.conf
rm -f /etc/nginx/conf.d/10-http.conf
rm -f /etc/nginx/conf.d/10-http-redirect.conf
rm -f /etc/nginx/conf.d/20-https.conf

if [ "$SSL_ENABLED" = "true" ] && [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "SSL enabled — HTTPS on :443, HTTP redirects to HTTPS"
    cp /etc/nginx/conf.d/10-http-redirect.conf.template /etc/nginx/conf.d/10-http-redirect.conf
    cp /etc/nginx/conf.d/20-https.conf.template /etc/nginx/conf.d/20-https.conf
else
    echo "SSL disabled — serving application on HTTP :80"
    cp /etc/nginx/conf.d/10-http.conf.template /etc/nginx/conf.d/10-http.conf
fi

nginx -t
exec nginx -g 'daemon off;'
