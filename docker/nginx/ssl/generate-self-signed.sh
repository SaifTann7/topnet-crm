#!/bin/sh
# Generate a self-signed TLS certificate for local HTTPS testing.
# Usage: ./generate-self-signed.sh [domain]

set -e

DOMAIN="${1:-localhost}"
DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$DIR/privkey.pem" \
  -out "$DIR/fullchain.pem" \
  -subj "/CN=$DOMAIN/O=TOPNET CRM/C=TN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:*.$DOMAIN,IP:127.0.0.1"

chmod 600 "$DIR/privkey.pem"
chmod 644 "$DIR/fullchain.pem"

echo ""
echo "Self-signed certificate created:"
echo "  $DIR/fullchain.pem"
echo "  $DIR/privkey.pem"
echo ""
echo "Enable HTTPS in .env:"
echo "  NGINX_SSL_ENABLED=true"
echo ""
echo "Restart: docker compose up -d --build nginx"
