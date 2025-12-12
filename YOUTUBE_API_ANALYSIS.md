# YouTube Data API v3 - Analysis for NicheFinder

## Executive Summary

**YouTube Data API is EXCELLENT for niche discovery!** It's actually better than Reddit in many ways for Home Assistant content discovery.

✅ **Free tier: 10,000 units/day** (100 searches/day)  
✅ **No approval process** - just create a Google Cloud project  
✅ **Simple authentication** - API key only (no OAuth needed for read-only)  
✅ **Rich data** - views, likes, comments, trending topics  
✅ **Home Assistant has huge YouTube presence** - perfect for our use case  

---

## Why YouTube is Perfect for NicheFinder

### 1. **Massive Home Assistant Community**
- Thousands of Home Assistant tutorial channels
- Daily uploads of integration guides, reviews, automation ideas
- Shows what people are **actually interested in** (by view counts)

### 2. **Better Than Reddit For:**
- **Engagement metrics** - Views, likes, comments show real interest
- **Content trends** - See what tutorials are popular
- **Tutorial gaps** - Low view counts on important topics = opportunity
- **Visual content** - People show their actual setups and integrations
- **Creator ecosystem** - Identify influential voices in the community

### 3. **Excellent Data for Niche Discovery:**
- **Video titles** - "How to integrate X with Home Assistant"
- **Descriptions** - Detailed setup guides, device lists
- **Tags** - Topic categorization
- **View counts** - Popularity metrics
- **Comment counts** - Community engagement
- **Channel data** - Who's creating content in this space

---

## API Details

### Authentication
**Simple API Key** (no OAuth needed for read-only operations)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Done! (Takes ~2 minutes)

### Quota System

**Default: 10,000 units/day (FREE)**

**Quota Costs:**
- **Search** (most important for us): 100 units
- **List videos**: 1 unit
- **List channels**: 1 unit
- **List comments**: 1 unit

**What this means:**
- 100 searches per day (10,000 / 100)
- Or mix: 50 searches + 5,000 video detail requests
- **This is plenty for niche discovery!**

**Need more?** Can request quota increase (requires compliance audit)

---

## Key API Endpoints for NicheFinder

### 1. Search API
**Endpoint:** `GET https://www.googleapis.com/youtube/v3/search`

**Use case:** Find videos about specific topics

**Parameters:**
- `q` - Search query (e.g., "home assistant zigbee")
- `type` - Filter by video, channel, or playlist
- `order` - Sort by relevance, date, viewCount, rating
- `maxResults` - Up to 50 results per request
- `publishedAfter` - Filter by date

**Example:**
```
GET https://www.googleapis.com/youtube/v3/search?
  part=snippet&
  q=home+assistant+integration&
  type=video&
  order=viewCount&
  maxResults=50&
  key=YOUR_API_KEY
```

**Cost:** 100 units

### 2. Videos API
**Endpoint:** `GET https://www.googleapis.com/youtube/v3/videos`

**Use case:** Get detailed video statistics

**Parameters:**
- `id` - Video ID(s)
- `part` - snippet, statistics, contentDetails

**Returns:**
- View count
- Like count
- Comment count
- Duration
- Tags
- Category

**Cost:** 1 unit per request

### 3. Channels API
**Endpoint:** `GET https://www.googleapis.com/youtube/v3/channels`

**Use case:** Get channel information

**Returns:**
- Subscriber count
- Video count
- View count
- Description

**Cost:** 1 unit per request

---

## Data You Get (Perfect for Niche Discovery!)

### Video Data:
```json
{
  "title": "How to integrate Zigbee devices with Home Assistant",
  "description": "Complete guide to setting up Zigbee2MQTT...",
  "viewCount": "125000",
  "likeCount": "3500",
  "commentCount": "450",
  "publishedAt": "2024-01-15",
  "tags": ["home assistant", "zigbee", "smart home"],
  "channelTitle": "Smart Home Junkie"
}
```

### What This Tells You:
- **High views** = Popular topic (proven demand)
- **Low views on important topic** = Opportunity gap
- **Recent uploads** = Trending interests
- **Tags** = Topic categorization
- **Comments** = Community engagement and questions

---

## Niche Discovery Strategies

### 1. **Find Popular Topics**
Search for "home assistant" + sort by view count
→ See what integrations people care about most

### 2. **Identify Gaps**
Search for specific devices/integrations
→ Low video count or low views = underserved niche

### 3. **Trend Analysis**
Filter by `publishedAfter` (last 30 days)
→ See what's trending right now

### 4. **Community Pain Points**
Get video comments (1 unit each)
→ See what problems people have

### 5. **Creator Analysis**
Find top channels in the space
→ See what successful creators focus on

---

## Example Queries for Home Assistant Niches

```
1. "home assistant zigbee"
2. "home assistant esp32"
3. "home assistant dashboard"
4. "home assistant automation ideas"
5. "home assistant voice control"
6. "home assistant energy monitoring"
7. "home assistant security system"
8. "home assistant climate control"
```

Each search = 100 units, so you can do 100 searches/day!

---

## Comparison: YouTube vs Reddit

| Feature | YouTube | Reddit |
|---------|---------|--------|
| **API Access** | ✅ Free, instant | ❌ Requires approval |
| **Quota** | ✅ 10k units/day | ❌ Unknown (if approved) |
| **Home Assistant Community** | ✅ Huge | ✅ Large |
| **Engagement Metrics** | ✅ Views, likes, comments | ✅ Upvotes, comments |
| **Content Type** | ✅ Video tutorials | ✅ Text discussions |
| **Trending Topics** | ✅ Yes | ✅ Yes |
| **Pain Points** | ✅ Comments | ✅ Posts/comments |
| **Setup Time** | ✅ 2 minutes | ❌ Weeks (approval) |

**Winner: YouTube** (for our immediate needs)

---

## Recommended Connector Actions

### Action 1: `search_videos`
- Search for videos by keyword
- Filter by date, views, relevance
- Get video IDs and basic info

### Action 2: `get_video_details`
- Get full statistics for specific videos
- View counts, engagement metrics
- Tags and categories

### Action 3: `search_channels`
- Find channels by topic
- Get subscriber counts
- Identify top creators

---

## Next Steps

**I recommend we build a YouTube PEG v2 connector!**

**Why:**
1. ✅ No approval process (vs Reddit)
2. ✅ Excellent data for niche discovery
3. ✅ 100 searches/day is plenty
4. ✅ Simple API key authentication
5. ✅ Can build it in ~30 minutes

**Combined with:**
- HACS (integration ecosystem)
- GitHub (what people are building)
- YouTube (what people are watching/learning)

= **Complete niche discovery platform!**

---

## Should I Build It?

Say the word and I'll create:
1. `peg-v2-youtube` connector
2. Workflow examples
3. Test script with your API key

Ready to proceed?

