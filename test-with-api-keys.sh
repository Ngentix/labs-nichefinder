#!/bin/bash

# =============================================================================
# NicheFinder API Test Script
# =============================================================================
# Tests GitHub and YouTube connectors with real API keys from .env file
#
# Prerequisites:
# 1. PEG-Connector-Service running on port 9004
# 2. .env file with GITHUB_API_KEY and YOUTUBE_API_KEY set
#
# Usage: ./test-with-api-keys.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}NicheFinder API Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo ""
    echo "Please create a .env file with your API keys:"
    echo "  GITHUB_API_KEY=your-github-token"
    echo "  YOUTUBE_API_KEY=your-youtube-api-key"
    exit 1
fi

# Load environment variables from .env
echo -e "${BLUE}📁 Loading API keys from .env file...${NC}"
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Check if API keys are set
if [ -z "$GITHUB_API_KEY" ] || [ "$GITHUB_API_KEY" = "your-github-token-here" ]; then
    echo -e "${YELLOW}⚠️  Warning: GITHUB_API_KEY not set in .env file${NC}"
    GITHUB_ENABLED=false
else
    echo -e "${GREEN}✅ GitHub API key loaded${NC}"
    GITHUB_ENABLED=true
fi

if [ -z "$YOUTUBE_API_KEY" ] || [ "$YOUTUBE_API_KEY" = "your-youtube-api-key-here" ]; then
    echo -e "${YELLOW}⚠️  Warning: YOUTUBE_API_KEY not set in .env file${NC}"
    YOUTUBE_ENABLED=false
else
    echo -e "${GREEN}✅ YouTube API key loaded${NC}"
    YOUTUBE_ENABLED=true
fi

if [ "$GITHUB_ENABLED" = false ] && [ "$YOUTUBE_ENABLED" = false ]; then
    echo -e "${RED}❌ Error: No API keys configured!${NC}"
    echo ""
    echo "Please edit .env and add your API keys."
    exit 1
fi

echo ""

# Check if PEG-Connector-Service is running
echo -e "${BLUE}🔍 Checking if PEG-Connector-Service is running...${NC}"
if ! curl -s http://localhost:9004/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: PEG-Connector-Service is not running on port 9004${NC}"
    echo ""
    echo "Please start it with:"
    echo "  cd deps/PEG-Connector-Service"
    echo "  RUST_LOG=info cargo run --bin peg-connector-service -- --config config.yaml"
    exit 1
fi
echo -e "${GREEN}✅ PEG-Connector-Service is running${NC}"
echo ""

# Test 1: HACS (no auth required)
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 1: HACS Integration Data (No Auth)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${BLUE}Fetching HACS integrations...${NC}"
HACS_RESULT=$(curl -s -X POST http://localhost:9004/api/v2/connectors/hacs/actions/fetch_integrations/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {}, "credentials": {}}')

# Check if successful
if echo "$HACS_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
    HACS_COUNT=$(echo "$HACS_RESULT" | jq -r '.data.data | length')
    echo -e "${GREEN}✅ Success! Retrieved $HACS_COUNT HACS integrations${NC}"
else
    echo -e "${RED}❌ Failed to fetch HACS data${NC}"
    echo "Error: $(echo "$HACS_RESULT" | jq -r '.error // "Unknown error"')"
fi

echo ""

# Test 2: GitHub (requires API key)
if [ "$GITHUB_ENABLED" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test 2: GitHub Repository Search${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    echo -e "${BLUE}Searching GitHub for 'home assistant integration'...${NC}"
    GITHUB_RESULT=$(curl -s -X POST http://localhost:9004/api/v2/connectors/github/actions/search_repositories/execute \
      -H "Content-Type: application/json" \
      -d "{
        \"parameters\": {
          \"query\": \"home assistant integration\",
          \"per_page\": 5
        },
        \"credentials\": {
          \"api_key\": \"$GITHUB_API_KEY\"
        }
      }")

    # Check if successful
    if echo "$GITHUB_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
        GITHUB_COUNT=$(echo "$GITHUB_RESULT" | jq -r '.data.data.items | length')
        echo -e "${GREEN}✅ Success! Found $GITHUB_COUNT repositories${NC}"
        echo ""
        echo "Top repositories:"
        echo "$GITHUB_RESULT" | jq -r '.data.data.items[] | "  - \(.full_name) (\(.stargazers_count) ⭐)"'
    else
        echo -e "${RED}❌ Failed to search GitHub${NC}"
        echo "Error: $(echo "$GITHUB_RESULT" | jq -r '.data.error // .error // "Unknown error"')"
    fi
    echo ""
fi

# Test 3: YouTube (requires API key)
if [ "$YOUTUBE_ENABLED" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test 3: YouTube Video Search${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    echo -e "${BLUE}Searching YouTube for 'home assistant zigbee'...${NC}"
    YOUTUBE_RESULT=$(curl -s -X POST http://localhost:9004/api/v2/connectors/youtube/actions/search_videos/execute \
      -H "Content-Type: application/json" \
      -d "{
        \"parameters\": {
          \"query\": \"home assistant zigbee\",
          \"max_results\": 5,
          \"order\": \"viewCount\"
        },
        \"credentials\": {
          \"api_key\": \"$YOUTUBE_API_KEY\"
        }
      }")

    # Check if successful
    if echo "$YOUTUBE_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
        YOUTUBE_COUNT=$(echo "$YOUTUBE_RESULT" | jq -r '.data.data.items | length')
        echo -e "${GREEN}✅ Success! Found $YOUTUBE_COUNT videos (showing top by views)${NC}"
        echo ""
        echo "Top videos:"
        echo "$YOUTUBE_RESULT" | jq -r '.data.data.items[] | "  - \(.snippet.title)\n    Channel: \(.snippet.channelTitle) | Views: \(.statistics.viewCount // "N/A")"'
    else
        echo -e "${RED}❌ Failed to search YouTube${NC}"
        echo "Error: $(echo "$YOUTUBE_RESULT" | jq -r '.error // "Unknown error"')"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ HACS:${NC} Working (no auth required)"
if [ "$GITHUB_ENABLED" = true ]; then
    echo -e "${GREEN}✅ GitHub:${NC} Tested with API key"
else
    echo -e "${YELLOW}⚠️  GitHub:${NC} Skipped (no API key)"
fi
if [ "$YOUTUBE_ENABLED" = true ]; then
    echo -e "${GREEN}✅ YouTube:${NC} Tested with API key"
else
    echo -e "${YELLOW}⚠️  YouTube:${NC} Skipped (no API key)"
fi
echo ""
echo -e "${GREEN}🎉 NicheFinder data sources are ready!${NC}"
echo ""

