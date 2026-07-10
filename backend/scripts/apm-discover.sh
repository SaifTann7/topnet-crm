#!/bin/sh
# TOPNET CRM — APM discovery (runs inside backend container)
# Usage: apm-discover.sh [base-url]

set -e

BASE_URL="${1:-${TOPNET_APM_BASE_URL:-http://localhost:8080}}"

echo "=============================================="
echo " TOPNET CRM — APM Discovery"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo ""

fetch() {
  label="$1"
  url="$2"
  printf "%-22s " "$label"
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
}

fetch "Health"              "$BASE_URL/actuator/health"
fetch "Info"                "$BASE_URL/actuator/info"
fetch "Metrics"             "$BASE_URL/actuator/metrics"
fetch "Application Info"    "$BASE_URL/application/info"
fetch "OpenAPI"             "$BASE_URL/v3/api-docs"

echo ""
echo "--- Environment ---"
echo "TOPNET_APM_APPLICATION_NAME=${TOPNET_APM_APPLICATION_NAME:-TOPNET CRM}"
echo "DOCKER_READY=${DOCKER_READY:-true}"
echo "SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-unknown}"
echo "=============================================="
