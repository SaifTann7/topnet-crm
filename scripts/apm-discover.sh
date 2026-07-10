#!/bin/sh
# TOPNET CRM — APM discovery script (REST + SSH)
# Usage:
#   ./scripts/apm-discover.sh                    # via Nginx (localhost)
#   ./scripts/apm-discover.sh http://backend:8080 # custom base URL
#   docker exec topnet-backend apm-discover.sh    # inside container

set -e

BASE_URL="${1:-${TOPNET_APM_BASE_URL:-http://localhost}}"
BACKEND_URL="${TOPNET_APM_BACKEND_URL:-http://localhost:8080}"

if [ "$BASE_URL" = "docker" ]; then
  BASE_URL="${TOPNET_APM_DOCKER_BACKEND_URL:-http://backend:8080}"
fi

echo "=============================================="
echo " TOPNET CRM — APM Discovery"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo ""

fetch() {
  label="$1"
  url="$2"
  printf "%-22s " "$label"
  if command -v curl >/dev/null 2>&1; then
    status=$(curl -sf -o /tmp/apm_response.json -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
      echo "OK ($url)"
      if [ "$label" = "Application Info" ] || [ "$label" = "Actuator Info" ]; then
        cat /tmp/apm_response.json
        echo ""
      fi
    else
      echo "FAILED (HTTP $status) $url"
    fi
  else
    echo "SKIP (curl not installed) $url"
  fi
}

fetch "Health"              "$BASE_URL/actuator/health"
fetch "Info"                "$BASE_URL/actuator/info"
fetch "Metrics"             "$BASE_URL/actuator/metrics"
fetch "Application Info"    "$BASE_URL/application/info"
fetch "OpenAPI"             "$BASE_URL/v3/api-docs"

echo ""
echo "--- Environment (SSH) ---"
echo "TOPNET_APM_APPLICATION_NAME=${TOPNET_APM_APPLICATION_NAME:-TOPNET CRM}"
echo "TOPNET_APM_VERSION=${TOPNET_APM_VERSION:-1.0.0-SNAPSHOT}"
echo "DOCKER_READY=${DOCKER_READY:-$(test -f /.dockerenv && echo true || echo false)}"
echo "JAVA_VERSION=${JAVA_VERSION:-unknown}"
echo "SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-unknown}"
echo ""
echo "Discovery env file: docker/apm/discovery-endpoints.env"
echo "=============================================="
