#!/bin/bash

API_URL="https://kazi-linda.onrender.com"

echo "Testing protected endpoints without token..."

# List of protected endpoints to test
ENDPOINTS=(
  "/api/profile/me"
  "/api/social/feed"
  "/api/social/suggestions"
  "/api/messages"
  "/api/applications"
  "/api/employers/dashboard"
)

for endpoint in "${ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint")
  if [ "$STATUS" == "401" ]; then
    echo "✅ $endpoint: Protected (401)"
  else
    echo "❌ $endpoint: Vulnerable ($STATUS)"
  fi
done
