# API Keys Setup Guide

## Quick Start

I've created everything you need! Now just add your API keys and test.

## Step 1: Add Your API Keys

Open the `.env` file in the root directory and replace the placeholder values:

```bash
# Edit .env file
GITHUB_API_KEY=ghp_your_actual_github_token_here
YOUTUBE_API_KEY=AIza_your_actual_youtube_key_here
```

**Important:** 
- Keep the `GITHUB_API_KEY=` and `YOUTUBE_API_KEY=` parts
- Just replace the `your-...-here` part with your actual keys
- Don't add quotes around the keys
- Don't commit this file to git (it's already in .gitignore)

## Step 2: Restart PEG-Connector-Service

The YouTube connector needs to be loaded. Restart the service:

1. **Stop the current service** (if running):
   - Find the terminal where it's running
   - Press `Ctrl+C`

2. **Start it again:**
   ```bash
   cd deps/PEG-Connector-Service
   RUST_LOG=info cargo run --bin peg-connector-service -- --config config.yaml
   ```

3. **Wait for this message:**
   ```
   Loaded 24 PEG v0.2 connectors
   ```
   (Should now be 24 instead of 23, because we added YouTube!)

## Step 3: Test Everything

In a new terminal, run:

```bash
./test-with-api-keys.sh
```

This will test:
- ✅ **HACS** - Fetch integration data (no auth)
- ✅ **GitHub** - Search repositories (with your token)
- ✅ **YouTube** - Search videos (with your API key)

## What You'll See

### Successful Test Output:

```
========================================
NicheFinder API Test Script
========================================

📁 Loading API keys from .env file...
✅ GitHub API key loaded
✅ YouTube API key loaded

🔍 Checking if PEG-Connector-Service is running...
✅ PEG-Connector-Service is running

========================================
Test 1: HACS Integration Data (No Auth)
========================================

✅ Success! Retrieved 1000+ HACS integrations

========================================
Test 2: GitHub Repository Search
========================================

✅ Success! Found 50000+ repositories
Top 5 repositories:
  - home-assistant/core (65000 ⭐)
  - ...

========================================
Test 3: YouTube Video Search
========================================

✅ Success! Found videos (showing top 5 by views)
Top videos:
  - Complete Home Assistant Zigbee Guide
    Channel: Smart Home Junkie
  - ...

========================================
Test Summary
========================================

✅ HACS: Working (no auth required)
✅ GitHub: Tested with API key
✅ YouTube: Tested with API key

🎉 NicheFinder data sources are ready!
```

## Troubleshooting

### "GITHUB_API_KEY not set in .env file"
- Make sure you edited the `.env` file
- Check that you replaced `your-github-token-here` with your actual token
- Token should start with `ghp_`

### "YOUTUBE_API_KEY not set in .env file"
- Make sure you edited the `.env` file
- Check that you replaced `your-youtube-api-key-here` with your actual key
- Key should start with `AIza`

### "PEG-Connector-Service is not running"
- Start the service (see Step 2 above)
- Make sure it's running on port 9004

### "Failed to search GitHub"
- Check that your GitHub token is valid
- Make sure it has `public_repo` permission
- Test it directly: `curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user`

### "Failed to search YouTube"
- Check that your YouTube API key is valid
- Make sure YouTube Data API v3 is enabled in your Google Cloud project
- Test it directly: `curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=YOUR_KEY"`

### "Loaded 23 PEG v0.2 connectors" (should be 24)
- The YouTube connector wasn't loaded
- Make sure you restarted the PEG-Connector-Service after creating the connector
- Check that `deps/PEG-Connector-Service/connectors-peg-v2/peg-v2-youtube.yaml` exists

## What's Next?

Once all tests pass, you have:
- ✅ **HACS** - 1000+ Home Assistant integrations
- ✅ **GitHub** - Repository data, stars, issues
- ✅ **YouTube** - Video content, views, engagement

**Ready for niche discovery!** 🚀

You can now:
1. Build the NicheFinder analysis service
2. Combine data from all three sources
3. Identify underserved niches in the Home Assistant ecosystem

Let me know when you're ready to proceed!

