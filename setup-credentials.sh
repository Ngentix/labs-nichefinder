#!/bin/bash

# Setup script to load API credentials from .env into credential-vault

set -e

echo "=== Loading Credentials into Vault ==="
echo ""

# Load .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Check if credential-vault is running
if ! curl -s http://localhost:3005/health > /dev/null 2>&1; then
    echo "❌ credential-vault is not running on port 3005"
    echo "   Start it with: ./start-full-stack.sh"
    exit 1
fi

echo "✅ credential-vault is running"
echo ""

# Store credentials for demo-user in both prod and sand-box environments
# peg-engine uses environment="sand-box" by default
USER_ID="demo-user"

for env in "prod" "sand-box"; do
    echo "📝 Storing credentials for user=$USER_ID, environment=$env..."

    # HACS (no credentials needed)
    curl -s -X POST http://localhost:3005/connectors/credentials \
        -H "Content-Type: application/json" \
        -d "{\"userId\":\"$USER_ID\",\"environment\":\"$env\",\"connectorId\":\"hacs\",\"credentials\":{}}" > /dev/null

    # GitHub
    if [ -n "$GITHUB_API_KEY" ] && [ "$GITHUB_API_KEY" != "your-github-token-here" ]; then
        curl -s -X POST http://localhost:3005/connectors/credentials \
            -H "Content-Type: application/json" \
            -d "{\"userId\":\"$USER_ID\",\"environment\":\"$env\",\"connectorId\":\"github\",\"credentials\":{\"api_key\":\"$GITHUB_API_KEY\"}}" > /dev/null
    fi

    # YouTube
    if [ -n "$YOUTUBE_API_KEY" ] && [ "$YOUTUBE_API_KEY" != "your-youtube-api-key-here" ]; then
        curl -s -X POST http://localhost:3005/connectors/credentials \
            -H "Content-Type: application/json" \
            -d "{\"userId\":\"$USER_ID\",\"environment\":\"$env\",\"connectorId\":\"youtube\",\"credentials\":{\"api_key\":\"$YOUTUBE_API_KEY\"}}" > /dev/null
    fi

    echo "   ✅ Stored for $USER_ID/$env"
done

echo ""
echo "✅ Credentials setup complete!"
echo ""
echo "You can now execute workflows that require these credentials."
