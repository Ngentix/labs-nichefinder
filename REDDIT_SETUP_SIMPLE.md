# Reddit API Setup - Simple Guide

**Good news: You DON'T need a developer account!** You can create apps directly from your personal Reddit account.

## Step-by-Step Instructions

### Step 1: Make Sure You're Logged In
- Go to https://www.reddit.com
- Log in with your personal Reddit account
- **That's it - no separate developer account needed!**

### Step 2: Verify Your Email (If Not Already Done)
Reddit requires a verified email to create apps.

1. Go to https://www.reddit.com/settings
2. Look for "Email" section
3. If not verified, click "Resend verification email"
4. Check your email and click the verification link

### Step 3: Go to the Apps Page
1. **Direct link:** https://www.reddit.com/prefs/apps
2. Or navigate: Click your profile → Settings → Safety & Privacy → scroll down to "Apps"

You should see a page that says "authorized applications" at the top.

### Step 4: Create Your App
At the bottom of the page, you should see a button that says **"are you a developer? create an app..."**

Click that button.

### Step 5: Fill Out the Form

You'll see a form with these fields:

```
name: [text field]
○ web app  ○ installed app  ● script
description: [text field]
about url: [text field]
redirect uri: [text field]
```

**Fill it out exactly like this:**

- **name:** `NicheFinder` (or any name you want)
- **App type:** Select **"script"** (the third radio button)
- **description:** `Home Assistant niche discovery` (or leave blank)
- **about url:** (leave blank - it's optional)
- **redirect uri:** `http://localhost:8080` (required even though we won't use it)

### Step 6: Click "create app"

After clicking, you should see your new app appear in the list above.

### Step 7: Get Your Credentials

Your app will now be displayed with this information:

```
NicheFinder                                    [edit] [delete]
personal use script
[This is your CLIENT_ID - a string like: abc123XYZ456]

secret: [This is your CLIENT_SECRET - click to reveal]
```

**Copy these two values:**
1. **CLIENT_ID:** The string under "personal use script" (about 14-22 characters)
2. **CLIENT_SECRET:** Click the "secret" field to reveal it, then copy it

---

## Common Issues and Solutions

### Issue 1: "You don't have permission to do that"
**Solution:** Your account needs a verified email address.
- Go to https://www.reddit.com/settings
- Verify your email address
- Try again

### Issue 2: "Your account is too new"
**Solution:** Reddit may require accounts to be at least 30 days old.
- Wait a few days
- Or use an older Reddit account if you have one

### Issue 3: "You've reached the maximum number of apps"
**Solution:** Reddit limits you to 20 apps per account.
- Delete an old app you don't use
- Or use a different Reddit account

### Issue 4: "I don't see the 'create an app' button"
**Solution:** Make sure you're on the right page.
- Go directly to: https://www.reddit.com/prefs/apps
- Scroll to the very bottom
- Look for "are you a developer? create an app..."

### Issue 5: The page looks different / I see something else
**Solution:** Reddit has old and new UI versions.
- Try the old Reddit: https://old.reddit.com/prefs/apps
- Or try new Reddit: https://www.reddit.com/prefs/apps

---

## Testing Your Credentials

Once you have your CLIENT_ID and CLIENT_SECRET, test them:

```bash
# Get an access token
curl -X POST -d "grant_type=client_credentials" \
  --user "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  https://www.reddit.com/api/v1/access_token

# You should get a response like:
# {"access_token":"...", "token_type":"bearer", "expires_in":3600}
```

If you get an access token, it works! 🎉

---

## What to Tell Me

If you're still having trouble, please tell me:

1. **What page are you on?** (copy the URL)
2. **What do you see?** (describe what's on the page)
3. **What happens when you try to create an app?** (any error messages?)
4. **Is your email verified?** (yes/no)
5. **How old is your Reddit account?** (approximate)

This will help me give you specific help!

---

## Next Steps

Once you have your CLIENT_ID and CLIENT_SECRET:

1. Run the test script: `./test-token-validation.sh`
2. Choose option 1 (client credentials)
3. Enter your CLIENT_ID and CLIENT_SECRET
4. The script will get an access token and test it!

