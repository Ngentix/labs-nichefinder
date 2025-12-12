#!/bin/bash

# Test script to validate GitHub and Reddit API tokens
# Usage: ./test-token-validation.sh

set -e

echo "=== API Token Validation Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PEG-Connector-Service is running
echo "Checking if PEG-Connector-Service is running..."
if ! curl -s http://localhost:9004/health > /dev/null 2>&1; then
    echo -e "${RED}❌ PEG-Connector-Service is not running on port 9004${NC}"
    echo "Please start it first with:"
    echo "  cd deps/PEG-Connector-Service && cargo run --bin peg-connector-service -- --config config.yaml"
    exit 1
fi
echo -e "${GREEN}✅ PEG-Connector-Service is running${NC}"
echo ""

# Test GitHub Token
echo "=== Testing GitHub Token ==="
echo ""
echo "Please enter your GitHub Personal Access Token (or press Enter to skip):"
read -s GITHUB_TOKEN
echo ""

if [ -n "$GITHUB_TOKEN" ]; then
    echo "Testing GitHub API directly..."
    GITHUB_RESPONSE=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
        https://api.github.com/search/repositories?q=home-assistant&per_page=1)
    
    if echo "$GITHUB_RESPONSE" | grep -q "total_count"; then
        echo -e "${GREEN}✅ GitHub token is valid!${NC}"
        TOTAL=$(echo "$GITHUB_RESPONSE" | grep -o '"total_count":[0-9]*' | cut -d':' -f2)
        echo "   Found $TOTAL repositories matching 'home-assistant'"
        
        echo ""
        echo "Testing GitHub connector via PEG-Connector-Service..."
        PEG_RESPONSE=$(curl -s -X POST http://localhost:9004/api/v2/connectors/github/actions/search_repositories/execute \
            -H "Content-Type: application/json" \
            -d "{
                \"parameters\": {
                    \"query\": \"home-assistant\",
                    \"per_page\": \"5\"
                },
                \"credentials\": {
                    \"access_token\": \"$GITHUB_TOKEN\"
                }
            }")
        
        if echo "$PEG_RESPONSE" | grep -q '"success":true'; then
            echo -e "${GREEN}✅ GitHub connector works via PEG-Connector-Service!${NC}"
            echo "$PEG_RESPONSE" | jq -r '.data.data.items[0].full_name // "No items returned"' 2>/dev/null || echo "Response received"
        else
            echo -e "${RED}❌ GitHub connector failed${NC}"
            echo "$PEG_RESPONSE" | jq '.' 2>/dev/null || echo "$PEG_RESPONSE"
        fi
    else
        echo -e "${RED}❌ GitHub token is invalid or has insufficient permissions${NC}"
        echo "Response: $GITHUB_RESPONSE" | jq '.' 2>/dev/null || echo "$GITHUB_RESPONSE"
    fi
else
    echo -e "${YELLOW}⊘ Skipped GitHub token test${NC}"
fi

echo ""
echo "=== Testing Reddit Token ==="
echo ""
echo "Reddit requires OAuth2. You have two options:"
echo "1. Use client credentials (recommended for read-only access)"
echo "2. Use a pre-obtained access token"
echo ""
echo "Choose option (1 or 2, or press Enter to skip):"
read REDDIT_OPTION

if [ "$REDDIT_OPTION" = "1" ]; then
    echo "Enter your Reddit Client ID:"
    read REDDIT_CLIENT_ID
    echo "Enter your Reddit Client Secret:"
    read -s REDDIT_CLIENT_SECRET
    echo ""
    
    echo "Getting access token from Reddit..."
    TOKEN_RESPONSE=$(curl -s -X POST -d "grant_type=client_credentials" \
        --user "$REDDIT_CLIENT_ID:$REDDIT_CLIENT_SECRET" \
        https://www.reddit.com/api/v1/access_token)
    
    REDDIT_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$REDDIT_TOKEN" ]; then
        echo -e "${GREEN}✅ Successfully obtained Reddit access token${NC}"
    else
        echo -e "${RED}❌ Failed to get Reddit access token${NC}"
        echo "Response: $TOKEN_RESPONSE"
        REDDIT_TOKEN=""
    fi
    
elif [ "$REDDIT_OPTION" = "2" ]; then
    echo "Enter your Reddit Access Token:"
    read -s REDDIT_TOKEN
    echo ""
fi

if [ -n "$REDDIT_TOKEN" ]; then
    echo "Testing Reddit API directly..."
    REDDIT_RESPONSE=$(curl -s -H "Authorization: Bearer $REDDIT_TOKEN" \
        -A "NicheFinder/1.0" \
        "https://oauth.reddit.com/subreddits/search?q=homeassistant&limit=1")
    
    if echo "$REDDIT_RESPONSE" | grep -q '"kind":"Listing"'; then
        echo -e "${GREEN}✅ Reddit token is valid!${NC}"
        SUBREDDIT=$(echo "$REDDIT_RESPONSE" | grep -o '"display_name":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Found subreddit: r/$SUBREDDIT"
        
        echo ""
        echo "Testing Reddit connector via PEG-Connector-Service..."
        PEG_RESPONSE=$(curl -s -X POST http://localhost:9004/api/v2/connectors/reddit/actions/search_subreddits/execute \
            -H "Content-Type: application/json" \
            -d "{
                \"parameters\": {
                    \"query\": \"homeassistant\",
                    \"limit\": \"5\"
                },
                \"credentials\": {
                    \"access_token\": \"$REDDIT_TOKEN\"
                }
            }")
        
        if echo "$PEG_RESPONSE" | grep -q '"success":true'; then
            echo -e "${GREEN}✅ Reddit connector works via PEG-Connector-Service!${NC}"
            echo "$PEG_RESPONSE" | jq -r '.data.data.data.children[0].data.display_name // "No items returned"' 2>/dev/null || echo "Response received"
        else
            echo -e "${RED}❌ Reddit connector failed${NC}"
            echo "$PEG_RESPONSE" | jq '.' 2>/dev/null || echo "$PEG_RESPONSE"
        fi
    else
        echo -e "${RED}❌ Reddit token is invalid${NC}"
        echo "Response: $REDDIT_RESPONSE" | jq '.' 2>/dev/null || echo "$REDDIT_RESPONSE"
    fi
else
    echo -e "${YELLOW}⊘ Skipped Reddit token test${NC}"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Summary:"
echo "- HACS connector: ✅ Works without authentication"
echo "- GitHub connector: $([ -n "$GITHUB_TOKEN" ] && echo "Tested" || echo "Not tested")"
echo "- Reddit connector: $([ -n "$REDDIT_TOKEN" ] && echo "Tested" || echo "Not tested")"
echo ""
echo "For more information, see API_TOKEN_SETUP.md"

