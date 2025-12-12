#!/bin/bash

# Demo script - Works with NO authentication required!
# This demonstrates the PEG v2 connectors working with HACS and GitHub

set -e

echo "=== NicheFinder Demo - No Authentication Required ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if service is running
if ! curl -s http://localhost:9004/health > /dev/null 2>&1; then
    echo "❌ PEG-Connector-Service is not running"
    echo "Please start it first with:"
    echo "  cd deps/PEG-Connector-Service && cargo run --bin peg-connector-service -- --config config.yaml"
    exit 1
fi

echo -e "${GREEN}✅ PEG-Connector-Service is running${NC}"
echo ""

# Demo 1: HACS - Fetch all Home Assistant integrations
echo "=== Demo 1: HACS Connector (No Auth) ==="
echo -e "${BLUE}Fetching Home Assistant Community Store integrations...${NC}"
echo ""

HACS_RESPONSE=$(curl -s -X POST http://localhost:9004/api/v2/connectors/hacs/actions/fetch_integrations/execute \
    -H "Content-Type: application/json" \
    -d '{
        "parameters": {},
        "credentials": {}
    }')

if echo "$HACS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ HACS connector successful!${NC}"
    
    # Count integrations
    INTEGRATION_COUNT=$(echo "$HACS_RESPONSE" | jq -r '.data.data | length' 2>/dev/null || echo "unknown")
    echo "   Found $INTEGRATION_COUNT HACS integrations"
    
    # Show a few examples
    echo ""
    echo "Sample integrations:"
    echo "$HACS_RESPONSE" | jq -r '.data.data | to_entries | .[0:3] | .[] | "  - \(.value.manifest_name // .value.domain): \(.value.description // "No description")"' 2>/dev/null || echo "  (Data received but couldn't parse samples)"
    
    # Save full response
    echo "$HACS_RESPONSE" | jq '.' > hacs-response.json 2>/dev/null || echo "$HACS_RESPONSE" > hacs-response.json
    echo ""
    echo "Full response saved to: hacs-response.json"
else
    echo "❌ HACS connector failed"
    echo "$HACS_RESPONSE" | jq '.' 2>/dev/null || echo "$HACS_RESPONSE"
fi

echo ""
echo "=== Demo 2: GitHub Connector (No Auth - 60 req/hour limit) ==="
echo -e "${BLUE}Searching for 'home-assistant' repositories...${NC}"
echo ""

GITHUB_RESPONSE=$(curl -s -X POST http://localhost:9004/api/v2/connectors/github/actions/search_repositories/execute \
    -H "Content-Type: application/json" \
    -d '{
        "parameters": {
            "query": "home-assistant",
            "per_page": "5"
        },
        "credentials": {}
    }')

if echo "$GITHUB_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ GitHub connector successful!${NC}"
    
    # Show results
    TOTAL=$(echo "$GITHUB_RESPONSE" | jq -r '.data.data.total_count' 2>/dev/null || echo "unknown")
    echo "   Found $TOTAL total repositories"
    echo ""
    echo "Top 5 repositories:"
    echo "$GITHUB_RESPONSE" | jq -r '.data.data.items[] | "  - \(.full_name) ⭐ \(.stargazers_count) - \(.description // "No description")"' 2>/dev/null || echo "  (Data received but couldn't parse)"
    
    # Save full response
    echo "$GITHUB_RESPONSE" | jq '.' > github-response.json 2>/dev/null || echo "$GITHUB_RESPONSE" > github-response.json
    echo ""
    echo "Full response saved to: github-response.json"
else
    echo "❌ GitHub connector failed"
    echo "$GITHUB_RESPONSE" | jq '.' 2>/dev/null || echo "$GITHUB_RESPONSE"
fi

echo ""
echo "=== Demo 3: Combined Niche Discovery ==="
echo -e "${BLUE}Finding niches by combining HACS and GitHub data...${NC}"
echo ""

# Extract some interesting patterns
if [ -f hacs-response.json ] && [ -f github-response.json ]; then
    echo "Analysis:"
    echo ""
    
    # Most popular topics from HACS
    echo "Popular topics in HACS integrations:"
    jq -r '.data.data | to_entries | .[].value.topics[]? | select(. != null)' hacs-response.json 2>/dev/null | \
        sort | uniq -c | sort -rn | head -5 | \
        awk '{print "  - " $2 " (" $1 " integrations)"}' || echo "  (Could not analyze topics)"
    
    echo ""
    echo "This data can be used to:"
    echo "  • Identify trending integration categories"
    echo "  • Find underserved niches in home automation"
    echo "  • Discover popular GitHub projects for integration"
    echo "  • Analyze community interests and needs"
fi

echo ""
echo "=== Demo Complete! ==="
echo ""
echo -e "${YELLOW}Note: GitHub API without authentication has a 60 requests/hour limit.${NC}"
echo "For higher limits, get a GitHub token from: https://github.com/settings/tokens"
echo ""
echo "Next steps:"
echo "  1. Review the JSON responses: hacs-response.json, github-response.json"
echo "  2. Optionally get a GitHub token for higher rate limits"
echo "  3. Build your NicheFinder application using this data!"

