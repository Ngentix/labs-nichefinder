# Feature: Additional Data Sources

**Purpose:** Expand market intelligence capabilities by adding more data sources beyond HACS, GitHub, and YouTube.

**Status:** 🔮 Future Enhancement  
**Priority:** MEDIUM - Enhances market validation but not critical for MVP  
**Timeline:** 3-5 days (post-Phase 3)

---

## 🎯 Problem Statement

**Current Situation:**
- We have 3 data sources: HACS, GitHub, YouTube
- YouTube data is generic ("home assistant" search) - not integration-specific
- Limited market intelligence for trend analysis

**What We Need:**
- More diverse data sources for comprehensive market validation
- Better trend analysis capabilities
- Integration-specific community discussions
- Search interest over time

---

## 📊 Proposed Data Sources

### 1. Google Trends (HIGHEST PRIORITY) ⭐

**Why Google Trends:**
- Shows search interest over time
- Indicates market demand and growth trends
- Can compare multiple integrations
- Free API available

**Data to Collect:**
- Search interest score (0-100) over last 12 months
- Related queries
- Geographic distribution
- Rising vs. declining trends

**API:**
- Use `pytrends` (unofficial Google Trends API)
- Or official Google Trends API if available

**Example Query:**
```
Search term: "xiaomi home assistant"
Time range: Last 12 months
Region: Worldwide
```

**Integration:**
- Create `google_trends` PEG connector
- Add to workflow as Step 4
- Store results in `data/raw/search_google_trends-result.json`
- Add "Google Trends" data source to opportunities

---

### 2. HackerNews

**Why HackerNews:**
- Tech-savvy community discussions
- Indicates developer interest
- Shows real-world use cases and problems
- Free API available

**Data to Collect:**
- Stories mentioning "home assistant" + integration name
- Comment count and engagement
- Story scores (upvotes)
- Timestamps for trend analysis

**API:**
- HackerNews Algolia API: https://hn.algolia.com/api
- Search endpoint: `http://hn.algolia.com/api/v1/search?query=home+assistant+xiaomi`

**Example Query:**
```
GET http://hn.algolia.com/api/v1/search?query=home+assistant+xiaomi&tags=story
```

**Integration:**
- Create `hackernews` PEG connector
- Add to workflow as Step 5
- Store results in `data/raw/search_hackernews-result.json`
- Add "HackerNews" data source to opportunities

---

### 3. Home Assistant Community Forum

**Why HA Community:**
- Official Home Assistant discussion forum
- Integration-specific threads
- User questions, issues, and solutions
- Shows real-world adoption and pain points

**Data to Collect:**
- Topic count mentioning integration
- Post count and engagement
- Recent activity (last 30 days)
- Top issues and feature requests

**API:**
- Discourse API: https://community.home-assistant.io
- Search endpoint: `/search.json?q=xiaomi`

**Example Query:**
```
GET https://community.home-assistant.io/search.json?q=xiaomi
```

**Integration:**
- Create `ha_community` PEG connector
- Add to workflow as Step 6
- Store results in `data/raw/search_ha_community-result.json`
- Add "HA Community" data source to opportunities

---

### 4. Reddit (r/homeassistant)

**Why Reddit:**
- Large community (500K+ members)
- Real user experiences and recommendations
- Integration discussions and comparisons
- Free API available

**Data to Collect:**
- Post count mentioning integration
- Comment count and engagement
- Upvote scores
- Recent activity

**API:**
- Reddit API: https://www.reddit.com/dev/api
- Search endpoint: `/r/homeassistant/search.json?q=xiaomi`

**Example Query:**
```
GET https://www.reddit.com/r/homeassistant/search.json?q=xiaomi&restrict_sr=1&sort=relevance
```

**Integration:**
- Create `reddit` PEG connector
- Add to workflow as Step 7
- Store results in `data/raw/search_reddit-result.json`
- Add "Reddit" data source to opportunities

---

## 🏗️ Implementation Plan

### Phase 1: Google Trends (2 days)
1. Create `google_trends` PEG connector
2. Add to workflow YAML
3. Update transform.rs to parse Google Trends data
4. Update analysis.rs to include Google Trends metrics
5. Add "Google Trends" data source to opportunities
6. Test end-to-end

### Phase 2: HackerNews (1 day)
1. Create `hackernews` PEG connector
2. Add to workflow YAML
3. Update transform.rs and analysis.rs
4. Test end-to-end

### Phase 3: HA Community + Reddit (2 days)
1. Create `ha_community` and `reddit` PEG connectors
2. Add to workflow YAML
3. Update transform.rs and analysis.rs
4. Test end-to-end

---

## 📈 Enhanced Scoring Algorithm

With additional data sources, update scoring to include:

```rust
pub struct ScoringDetails {
    // Existing
    pub github_score: f64,
    pub hacs_score: f64,
    pub community_score: f64,
    
    // New
    pub trends_score: f64,        // Google Trends interest
    pub discussion_score: f64,    // HackerNews + Reddit + HA Community
    pub growth_score: f64,        // Trend direction (rising vs. declining)
}
```

**Weights:**
- GitHub: 30%
- HACS: 20%
- Community (existing): 15%
- Google Trends: 15%
- Discussion (HN + Reddit + HA): 10%
- Growth: 10%

---

## ✅ Success Criteria

1. ✅ Google Trends data collected for all integrations
2. ✅ HackerNews mentions counted
3. ✅ HA Community activity tracked
4. ✅ Reddit discussions analyzed
5. ✅ All data sources visible in Results tab
6. ✅ Scoring algorithm updated with new metrics
7. ✅ End-to-end workflow execution successful

---

## 🔗 Related Documents

- `FEATURE_SERVICE_CALL_TRACE.md` - Service Call Trace (Phase 3.5)
- `FEATURE_OPPORTUNITY_DESCRIPTIONS.md` - AI-generated descriptions
- `PHASE_3_HANDOFF.md` - Current project status

