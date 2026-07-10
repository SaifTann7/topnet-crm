# Place TLS certificates here to enable HTTPS:
#
#   fullchain.pem   — certificate + intermediate chain
#   privkey.pem     — private key
#
# Generate a self-signed certificate for local/dev:
#   ./generate-self-signed.sh
#
# Production (Let's Encrypt example):
#   certbot certonly --webroot -w /var/www/certbot -d yourdomain.com
#   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./
#   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./
#
# Then set in .env:
#   NGINX_SSL_ENABLED=true
