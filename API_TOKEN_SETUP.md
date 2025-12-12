# API Token Setup Guide

This guide will help you obtain API tokens for GitHub and Reddit to use with the NicheFinder PEG v2 connectors.

## GitHub API Token

### Step 1: Create a Personal Access Token (Classic)

1. **Go to GitHub Settings:**
   - Navigate to https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name: `NicheFinder Demo`

3. **Select Scopes:**
   For repository search and issues, you need:
   - ✅ `public_repo` (Access public repositories)
   - ✅ `read:org` (Read org and team membership, read org projects) - Optional but recommended
   
   **Note:** For basic repository search, you can actually use GitHub's API without authentication, but with a token you get higher rate limits (5,000 requests/hour vs 60 requests/hour).

4. **Generate and Copy:**
   - Click "Generate token" at the bottom
   - **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Store Securely:**
   - Save it in a password manager or secure note
   - Never commit it to git or share it publicly

### Testing Your GitHub Token:

```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/search/repositories?q=home-assistant

# You should see repository search results
```

---

## Reddit API Credentials

Reddit uses OAuth2, so you need to create an application to get credentials.

### Step 1: Create a Reddit Application

1. **Go to Reddit Apps:**
   - Navigate to https://www.reddit.com/prefs/apps
   - Or: Preferences → Apps → "are you a developer? create an app..."

2. **Create Application:**
   - Click "create app" or "create another app"
   - Fill in the form:
     - **name:** `NicheFinder Demo`
     - **App type:** Select "script" (for personal use)
     - **description:** `Home Assistant niche discovery demo`
     - **about url:** (leave blank or use your GitHub repo)
     - **redirect uri:** `http://localhost:8080` (required but not used for script type)

3. **Get Credentials:**
   After creating, you'll see:
   - **client_id:** The string under "personal use script" (looks like: `abc123XYZ456`)
   - **client_secret:** The "secret" field (looks like: `xyz789ABC123-secretstring`)

4. **Store Securely:**
   - Save both the client_id and client_secret
   - Never commit these to git or share them publicly

### Step 2: Get Access Token

Reddit requires you to exchange your credentials for an access token. Here's how:

```bash
# Get access token (replace with your credentials)
curl -X POST -d "grant_type=password&username=YOUR_REDDIT_USERNAME&password=YOUR_REDDIT_PASSWORD" \
  --user "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  https://www.reddit.com/api/v1/access_token

# Response will include an access_token
```

**Alternative (Client Credentials Flow - Recommended for read-only):**

```bash
# Get access token without user credentials
curl -X POST -d "grant_type=client_credentials" \
  --user "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  https://www.reddit.com/api/v1/access_token

# Response: {"access_token": "...", "token_type": "bearer", "expires_in": 3600}
```

### Testing Your Reddit Token:

```bash
# Test with curl (replace YOUR_ACCESS_TOKEN)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -A "NicheFinder/1.0" \
  https://oauth.reddit.com/subreddits/search?q=homeassistant

# You should see subreddit search results
```

---

## Security Best Practices

1. **Never commit tokens to git:**
   - Add them to `.gitignore`
   - Use environment variables or secure vaults

2. **Use environment variables:**
   ```bash
   export GITHUB_TOKEN="ghp_your_token_here"
   export REDDIT_CLIENT_ID="your_client_id"
   export REDDIT_CLIENT_SECRET="your_client_secret"
   ```

3. **Rotate tokens regularly:**
   - GitHub: Regenerate tokens periodically
   - Reddit: Access tokens expire after 1 hour (you'll need to refresh)

4. **Limit token permissions:**
   - Only grant the minimum scopes needed
   - For GitHub: `public_repo` is sufficient for public data
   - For Reddit: Client credentials flow is sufficient for read-only access

---

## Using Tokens with PEG Workflows

Once you have your tokens, you can use them with the workflows:

### GitHub Workflow:
```bash
curl -X POST http://localhost:9004/api/v2/graphs/execute \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {...workflow yaml...},
    "inputs": {
      "query": "home-assistant",
      "access_token": "YOUR_GITHUB_TOKEN"
    }
  }'
```

### Reddit Workflow:
```bash
curl -X POST http://localhost:9004/api/v2/graphs/execute \
  -H "Content-Type: application/json" \
  -d '{
    "graph": {...workflow yaml...},
    "inputs": {
      "query": "homeassistant",
      "access_token": "YOUR_REDDIT_ACCESS_TOKEN"
    }
  }'
```

---

## Next Steps

After obtaining your tokens:
1. Test them using the curl commands above
2. Run `./test-token-validation.sh` to verify they work with the PEG connectors
3. Use them in your NicheFinder application

For help, see the main README or CONNECTOR_GENERATION_HANDOFF.md

