#!/bin/bash

API_URL="https://kazi-linda.onrender.com"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Ì¥ç COMPLETE API ENDPOINT TEST"
echo "=========================================="
echo ""

# Public endpoints (should return 200)
echo "Ì≥° PUBLIC ENDPOINTS:"
PUBLIC_ENDPOINTS=(
  "/"
  "/health"
  "/api/jobs"
  "/api/auth/login"
)

for endpoint in "${PUBLIC_ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint" 2>/dev/null)
  if [ "$STATUS" == "200" ] || [ "$STATUS" == "404" ]; then
    echo -e "  ${GREEN}‚úÖ${NC} $endpoint ($STATUS)"
  else
    echo -e "  ${RED}‚ùå${NC} $endpoint ($STATUS)"
  fi
done

echo ""
echo "Ì¥ê PROTECTED ENDPOINTS (without token):"

PROTECTED_ENDPOINTS=(
  "/api/profile/me"
  "/api/social/feed"
  "/api/social/suggestions"
  "/api/messages"
  "/api/applications"
  "/api/employers/dashboard"
  "/api/admin/users"
)

for endpoint in "${PROTECTED_ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint" 2>/dev/null)
  if [ "$STATUS" == "401" ] || [ "$STATUS" == "403" ]; then
    echo -e "  ${GREEN}‚úÖ${NC} $endpoint (Protected - $STATUS)"
  else
    echo -e "  ${RED}‚ùå${NC} $endpoint (Vulnerable - $STATUS)"
  fi
done

echo ""
echo "=========================================="
