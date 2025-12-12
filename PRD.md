# NicheFinder: Product Requirements Document

**Version:** 2.0
**Date:** 2025-12-11
**Status:** Active Development
**Owner:** JG

---

## Executive Summary

**NicheFinder** is a multi-domain market intelligence platform that demonstrates the end-to-end capabilities of the UDM + PEG + Connector ecosystem by systematically analyzing integration ecosystems to identify high-value opportunities using real-time API data.

**Primary Use Case:** Home Assistant Integration Opportunity Finder
**Architecture:** Extensible multi-niche framework supporting future domains

### Primary Goals

1. **Prove Connector Generation**: Demonstrate auto-generation of PEG-Connector v2 configurations from real-world APIs (GitHub, Reddit, HACS)
2. **Prove UDM Normalization**: Show data unification across heterogeneous sources into canonical schemas
3. **Prove PEG Orchestration**: Demonstrate workflow automation using built-in PEG executor
4. **Deliver Business Value**: Create actionable market intelligence that complements AI-based research
5. **Demonstrate Extensibility**: Build multi-niche architecture that can analyze any integration ecosystem

---

## Problem Statement

### Business Problem

**For Integration Developers:**
Identifying high-value integration opportunities requires manual research across fragmented data sources (GitHub issues, community forums, Reddit discussions, existing integrations). This process is time-consuming, inconsistent, and often misses emerging opportunities.

**For Market Intelligence:**
AI tools like ChatGPT provide qualitative insights but lack:
- Real-time, current data (training cutoff limitations)
- Verifiable sources and quantitative metrics
- Systematic, repeatable analysis
- Automated monitoring and trend tracking
- Multi-source data fusion

### Technical Problem

We need to prove that the UDM + PEG + Connector ecosystem can:
- Auto-generate connectors from any API without manual coding
- Normalize data from multiple heterogeneous sources into unified models
- Orchestrate complex multi-step workflows reliably
- Deliver quantitative, verifiable, real-time market intelligence
- Provide structured data that complements AI analysis

---

## Solution Overview

### Primary Use Case: Home Assistant Integration Opportunities

NicheFinder analyzes the Home Assistant ecosystem to identify the top integration opportunities by:

1. **Data Collection**: Fetch real-time data via auto-generated connectors:
   - GitHub API: Integration requests, issues, repository metrics
   - Reddit API: Community discussions, feature requests
   - HACS API: Existing custom integrations, download counts
   - Home Assistant Community Forum: Pain points, discussions

2. **Normalization**: Use UDM to unify heterogeneous data into canonical `IntegrationOpportunity` schema

3. **Analysis**: Calculate opportunity scores based on:
   - Demand signals (GitHub issues, Reddit posts, forum threads)
   - Supply analysis (existing integrations, quality, maintenance status)
   - Market size estimation (user mentions, engagement metrics)
   - Trend analysis (growth over time)

4. **Scoring**: Rank opportunities using demand-supply gap algorithm

5. **Output**: Generate actionable reports with:
   - Quantitative scores and metrics
   - Verifiable source links
   - Revenue potential estimates
   - Trend analysis
   - Optional AI-enhanced insights

### Multi-Niche Architecture

The system is designed to support multiple analysis domains:

**Current:**
- ✅ Home Assistant Integrations (primary use case)

**Future Expansion:**
- 🔄 Developer Tools & Libraries (GitHub + Stack Overflow + npm)
- 🔄 SaaS Integration Marketplace (Zapier, Make, n8n analysis)
- 🔄 Content & Creator Niches (Reddit + News API + Hacker News)
- 🔄 Custom domains (user-defined configurations)

---

## Value Proposition

### How NicheFinder Complements AI Search

| Capability | ChatGPT/AI Tools | NicheFinder | Hybrid Approach |
|------------|------------------|-------------|-----------------|
| **Data Freshness** | ❌ Training cutoff (months old) | ✅ Real-time API data | ✅ Current data + AI reasoning |
| **Verifiable Sources** | ❌ Can't cite specific sources | ✅ Links to GitHub issues, Reddit posts | ✅ Verified data + context |
| **Quantitative Metrics** | ⚠️ Qualitative estimates | ✅ Precise scores, counts, trends | ✅ Metrics + interpretation |
| **Repeatability** | ❌ Different answers each time | ✅ Consistent, trackable results | ✅ Consistent + adaptive |
| **Automated Monitoring** | ❌ Manual re-querying needed | ✅ Scheduled analysis, alerts | ✅ Auto-update + summaries |
| **Systematic Coverage** | ⚠️ May miss opportunities | ✅ Checks ALL sources | ✅ Complete + prioritized |
| **Trend Analysis** | ❌ No historical tracking | ✅ Growth rates, time-series | ✅ Trends + predictions |
| **Multi-Source Fusion** | ❌ Can't query APIs directly | ✅ Combines GitHub + Reddit + Forums | ✅ Integrated + synthesized |

### Key Differentiators

**1. Real-Time Market Intelligence**
- ChatGPT: "Based on my training data from 2023, Govee integrations were popular..."
- NicheFinder: "In the last 30 days: 47 new GitHub issues, 234 Reddit posts, +45% growth"

**2. Verifiable, Quantitative Analysis**
- ChatGPT: "I think there's demand for better Govee support"
- NicheFinder: "Opportunity Score: 94/100 | Demand:Supply Ratio: 15:1 | Sources: [links]"

**3. Continuous Monitoring**
- ChatGPT: Requires manual re-querying
- NicheFinder: "Run every Monday, alert on new opportunities scoring >85"

**4. Structured Data for AI**
- NicheFinder can feed its structured, verified data to AI for enhanced insights
- Best of both worlds: quantitative data + qualitative reasoning

### Target Users

**Primary:**
- Integration developers seeking profitable opportunities
- Home Assistant power users identifying gaps
- Market researchers analyzing integration ecosystems

**Secondary:**
- Product managers validating integration roadmaps
- Investors evaluating integration platform opportunities
- Community maintainers prioritizing feature requests

---

## Architecture

### Design Principle: Use UDM-Single As-Is

**Critical:** We do NOT modify UDM-Single code. We use it as a dependency and build our business logic on top.

**What UDM-Single Provides (Use As-Is):**
- ✅ Connector generation (`udm-connector-generator`)
- ✅ Connector execution with retry, timeout, cache, circuit breaker (`udm-connectors`)
- ✅ PEG workflow orchestration (`udm-peg`)
- ✅ Concurrent execution limits
- ✅ Built-in PEG executor (no external service needed)

**What We Contribute to UDM-Single:**
- 🔄 API rate limit tracking (benefits all UDM-Single users)

**What We Build:**
- ❌ Opportunity scoring algorithm (demand-supply gap)
- ❌ Report generation
- ❌ REST API server (Axum)
- ❌ Job scheduler (cron-based, scheduled analysis)
- ❌ Web UI (React + TypeScript)
- ❌ CLI interface (one-off analysis)

**See:** `UDM_CAPABILITIES_ANALYSIS.md` for detailed breakdown

---

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    NicheFinder Multi-Domain CLI                 │
│                        (This Repository)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Niche Config │  │ CLI Interface│  │ Report Generator     │  │
│  │ (HA, DevTools│  │ (Multi-niche)│  │ (Quantitative + AI)  │  │
│  │  SaaS, etc.) │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dependency: UDM-Single                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Connector        │  │ UDM Core         │  │ PEG Executor │  │
│  │ Generator        │  │ (Normalization)  │  │ (Built-in)   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External APIs (Free Tier)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ GitHub API   │  │ Reddit API   │  │ HACS/Community APIs  │  │
│  │ (5K req/hr)  │  │ (60 req/min) │  │ (Unlimited)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Component Breakdown (Lean Architecture):**

| Component | Type | Description |
|-----------|------|-------------|
| **Web UI** | 📦 NEW (React + TS) | Single-page app for niche selection, results, scheduling |
| **nichefinder-server** | 📦 NEW CRATE | Axum REST API + scheduler + SQLite (single binary) |
| **nichefinder-core** | 📦 NEW CRATE | Scoring algorithm, types, report formatters (library) |
| **Niche Config** | 📄 YAML FILES | Per-niche configuration (APIs, schemas, scoring) |
| **PEG Workflows** | 📄 YAML FILES | Workflow definitions (e.g., home-assistant-analysis.yaml) |
| **UDM Core** | ✅ USE AS-IS | Data normalization from UDM-Single |
| **PEG Executor** | ✅ USE AS-IS | Workflow orchestration from UDM-Single |
| **Connectors** | ✅ USE AS-IS | HTTP connector execution from UDM-Single |
| **Rate Limiter** | 🔄 CONTRIBUTE | Add to UDM-Single's udm-connectors crate |

**Legend:**
- ✅ **USE AS-IS** - UDM-Single crates, no modifications
- 📦 **NEW CRATE** - We build this in `crates/` (only 2 crates!)
- 📦 **NEW (React + TS)** - React + TypeScript frontend (minimal dependencies)
- 📄 **YAML FILES** - Configuration/workflow files
- 🔄 **CONTRIBUTE** - Implement in UDM-Single and contribute back

**Key Simplifications:**
- **2 Rust crates** instead of 6 (consolidated)
- **No separate CLI** - use REST API directly (`curl` for scripting)
- **Scheduler integrated** into server (not a separate crate)
- **Minimal frontend** - no routing library, no chart library for MVP

---

## User Interface

### Overview

NicheFinder provides a **web-based UI** built with React and TypeScript, running locally on the user's machine. The UI communicates with a Rust-based REST API server that orchestrates analysis workflows and manages scheduled jobs.

**Deployment Model:**
- **MVP:** Local-only (runs on localhost:3001)
- **Future:** Self-hosted or hosted service

---

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser (localhost:3000)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React + TypeScript Frontend                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │   │
│  │  │ Niche      │  │ Results    │  │ Schedule     │   │   │
│  │  │ Selector   │  │ Table      │  │ Manager      │   │   │
│  │  └────────────┘  └────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│              Rust API Server (localhost:3001)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Axum REST API                                        │   │
│  │  • GET  /api/niches          - List niches          │   │
│  │  • POST /api/analyze         - Run analysis         │   │
│  │  • GET  /api/opportunities   - Get results          │   │
│  │  • GET  /api/schedules       - List schedules       │   │
│  │  • POST /api/schedules       - Create schedule      │   │
│  │  • GET  /api/runs            - Job run history      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Job Scheduler (tokio-cron-scheduler)                 │   │
│  │  • Cron-based scheduling                             │   │
│  │  • Execute PEG workflows on schedule                 │   │
│  │  • Store results in SQLite                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PEG Workflow Executor                    │
│  (UDM-Single's built-in executor)                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Core Features (MVP)

#### 1. Niche Selection
- Dropdown to select analysis domain (Home Assistant for MVP)
- Display niche description and data sources

#### 2. Results View
- **Table View:** Sortable list of opportunities
  - Columns: Name, Demand Score, Supply Score, Gap Score, Sources
  - Click row to expand details inline
- **Detail View:** Expanded opportunity information
  - Demand signals (GitHub issues, Reddit posts)
  - Supply analysis (existing integrations, HACS availability)
  - Source links (verifiable, clickable)

#### 3. Scheduled Analysis (Core Feature)
- **Create Schedule:**
  - Select niche
  - Set schedule (daily, weekly)
  - Enable/disable schedule
- **View Schedules:**
  - List all scheduled jobs
  - Show next run time
  - Delete schedules
- **Run History:**
  - View past analysis runs
  - View results from each run

#### 4. Export
- Export current results as JSON
- Download as Markdown report

### Future Features (NOT MVP)
- ~~Trend charts~~ → Requires multiple runs over time
- ~~Historical comparison~~ → Requires weeks of data
- ~~Email notifications~~ → Requires email service
- ~~Multiple niches~~ → Start with Home Assistant only

---

### Tech Stack (Minimal)

**Frontend (Simplified for MVP):**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Native `fetch` (no Axios needed)

**What we're NOT using for MVP:**
- ~~React Query~~ → Simple `useState` + `useEffect`
- ~~React Router~~ → Single page app, no routing needed
- ~~Recharts~~ → Charts are future enhancement
- ~~Axios~~ → Native `fetch` is sufficient

**Backend (Rust):**
- **Framework:** Axum (Rust async web framework)
- **Database:** SQLite (for schedules, results, job history)
- **Scheduler:** tokio-cron-scheduler (integrated into server)
- **ORM:** SQLx (async SQL toolkit)

---

### Data Persistence

**SQLite Schema:**

```sql
-- Scheduled jobs
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    niche TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Job run history
CREATE TABLE runs (
    id TEXT PRIMARY KEY,
    schedule_id TEXT,
    niche TEXT NOT NULL,
    status TEXT NOT NULL, -- 'running', 'completed', 'failed'
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);

-- Analysis results
CREATE TABLE opportunities (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    niche TEXT NOT NULL,
    name TEXT NOT NULL,
    demand_score REAL NOT NULL,
    supply_score REAL NOT NULL,
    gap_score REAL NOT NULL,
    trend TEXT,
    data JSONB NOT NULL, -- Full opportunity data
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (run_id) REFERENCES runs(id)
);
```

---

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/niches` | List available niches |
| POST | `/api/analyze` | Run one-off analysis |
| GET | `/api/opportunities` | Get opportunities (filtered by run_id, niche) |
| GET | `/api/schedules` | List all scheduled jobs |
| POST | `/api/schedules` | Create new schedule |
| PUT | `/api/schedules/:id` | Update schedule |
| DELETE | `/api/schedules/:id` | Delete schedule |
| GET | `/api/runs` | Get job run history |
| GET | `/api/runs/:id` | Get specific run details |
| GET | `/api/reports/:id` | Download report (Markdown/JSON) |

---

## Project Setup

### Repository Structure (Lean)

```
labs-nichefinder/
├── Cargo.toml                          # Workspace root
├── README.md                           # Project overview
├── PRD.md                              # This document
├── .gitmodules                         # Git submodules
│
├── deps/
│   └── UDM-single/                     # Git submodule (use as-is)
│
├── crates/
│   ├── nichefinder-core/               # 📦 Library: scoring, types, reporting
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── types.rs                # IntegrationOpportunity, NicheConfig
│   │       ├── scoring.rs              # Demand-supply gap algorithm
│   │       └── reporting.rs            # Markdown/JSON formatters
│   │
│   └── nichefinder-server/             # 📦 Binary: API + scheduler
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs                 # Axum server entry point
│           ├── api.rs                  # REST endpoints
│           ├── scheduler.rs            # tokio-cron-scheduler
│           └── db.rs                   # SQLite with SQLx
│
├── web-ui/                             # 📦 React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                     # Single page app (no router)
│   │   ├── api.ts                      # Simple fetch wrapper
│   │   └── components/
│   │       ├── NicheSelector.tsx
│   │       ├── ResultsTable.tsx
│   │       ├── OpportunityDetail.tsx
│   │       └── ScheduleManager.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── scripts/
│   └── generate-connectors.sh          # One-time connector generation
│
├── config/
│   └── niches/
│       └── home-assistant.yaml         # HA integration config (MVP)
│
└── workflows/
    └── home-assistant-analysis.yaml    # PEG workflow for HA
```

**Key Simplifications:**
- **2 crates only** (nichefinder-core + nichefinder-server)
- **No CLI crate** - use REST API or curl
- **No examples directory** - the server IS the example
- **Single niche config** - Home Assistant only for MVP
- **Flat component structure** - no pages/, api/ subdirectories

### Dependency Management

**Git Submodules:**
```bash
# Add UDM-Single as submodule
git submodule add https://github.com/Ngentix/UDM-single.git deps/UDM-single

# Initialize submodules
git submodule update --init --recursive
```

**Cargo Workspace:**
```toml
# Cargo.toml
[workspace]
members = [
    "crates/nichefinder-core",
    "crates/nichefinder-server",
]

[workspace.dependencies]
# ✅ Reference UDM crates from submodule (use as-is, no modifications)
udm-peg = { path = "deps/UDM-single/crates/udm-peg" }
udm-connectors = { path = "deps/UDM-single/crates/udm-connectors" }

# Our crates
nichefinder-core = { path = "crates/nichefinder-core" }

# Server dependencies
axum = "0.7"
tower-http = { version = "0.5", features = ["cors"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite"] }
tokio-cron-scheduler = "0.10"

# Common dependencies
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
```

### Example Usage

#### Web UI (Primary Interface)

```bash
# Start the API server (includes scheduler)
cargo run --bin nichefinder-server

# In another terminal, start the React frontend
cd web-ui
npm run dev

# Open browser to http://localhost:5173 (Vite default)
# - Select "Home Assistant" from niche dropdown
# - Click "Run Analysis" for one-off analysis
# - Or create a schedule (e.g., "Daily at 9am")
# - View results in sortable table
# - Click opportunity for detailed view
```

#### REST API (Scripting / curl)

```bash
# Run one-off analysis
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"niche": "home-assistant"}'

# Get opportunities from latest run
curl http://localhost:3001/api/opportunities

# Create a daily schedule
curl -X POST http://localhost:3001/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"niche": "home-assistant", "cron": "0 9 * * *"}'

# Export as JSON
curl http://localhost:3001/api/reports/latest > report.json
```

**Sample Output:**
```
🏠 Home Assistant Integration Opportunities
============================================
Analysis Date: 2025-12-11
Data Sources: GitHub (47 issues), Reddit (234 posts), HACS (156 integrations)

Top 5 Opportunities:

1. Govee LED Advanced Control (Score: 94/100) 🔥
   ├─ Demand: 47 GitHub issues, 234 Reddit posts, 12 forum threads
   ├─ Supply: 1 basic official integration, 2 unmaintained HACS integrations
   ├─ Gap: Music sync, custom effects, advanced scheduling
   ├─ Market Size: ~15,000 users
   ├─ Trend: +45% growth (last 30 days)
   ├─ Revenue Potential: $75K-225K
   └─ Sources: [GitHub #12345] [Reddit r/ha/abc123] [Forum thread/456]

2. Ecobee Advanced Scheduling (Score: 89/100)
   ...
```

---

## Implementation Plan

### Week 1: Project Setup & Architecture ✅

**Days 1-2: Repository Setup** ✅
- [x] Create GitHub repository: `labs-nichefinder`
- [x] Set up initial Cargo workspace structure
- [x] Add UDM-Single as git submodule
- [x] Fix UDM-Single compilation issues
- [x] Create PRD and architecture documents

**Days 3-5: Architecture Review & Lean Refactor** ✅
- [x] Review UDM-Single capabilities thoroughly
- [x] Identify what UDM-Single provides vs what we build
- [x] Simplify architecture: 6 crates → 2 crates
- [x] Remove unnecessary components (CLI, separate scheduler)
- [x] Define minimal frontend (no React Query, Router, charts)
- [x] Update PRD with lean architecture

---

### Week 2: Core Library + Server + UI

**Days 1-2: nichefinder-core (Rust Library)**
- [ ] Create `nichefinder-core` crate structure
- [ ] Define `IntegrationOpportunity` type in `types.rs`
- [ ] Define `NicheConfig` type (from YAML)
- [ ] Implement scoring algorithm in `scoring.rs` (demand-supply gap)
- [ ] Implement JSON/Markdown formatters in `reporting.rs`
- [ ] Write unit tests for scoring logic

**Days 3-4: nichefinder-server (Rust Binary)**
- [ ] Create `nichefinder-server` crate structure
- [ ] Set up Axum with basic routes
- [ ] Set up SQLite with SQLx (schedules, runs, opportunities tables)
- [ ] Implement `/api/niches` endpoint
- [ ] Implement `/api/analyze` endpoint (triggers PEG workflow)
- [ ] Implement `/api/opportunities` endpoint
- [ ] Add CORS for local development

**Day 5: Scheduling + PEG Integration**
- [ ] Integrate tokio-cron-scheduler into server
- [ ] Implement `/api/schedules` CRUD endpoints
- [ ] Implement `/api/runs` endpoint (job history)
- [ ] Create PEG workflow YAML for Home Assistant
- [ ] Connect scheduler to PEG workflow executor
- [ ] Test: create schedule → wait for trigger → verify results stored

---

### Week 3: Frontend + Polish

**Days 1-2: React Frontend**
- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Tailwind CSS
- [ ] Create simple `api.ts` fetch wrapper
- [ ] Implement `NicheSelector` component
- [ ] Implement `ResultsTable` component (sortable)
- [ ] Implement `OpportunityDetail` component (inline expand)

**Days 3-4: Scheduling UI + Integration**
- [ ] Implement `ScheduleManager` component
- [ ] Implement `RunHistory` component
- [ ] Add "Run Now" button (one-off analysis)
- [ ] Add loading states and error handling
- [ ] Add JSON export button
- [ ] End-to-end testing: UI → API → PEG → SQLite → UI

**Day 5: Documentation + Demo**
- [ ] Write README with setup instructions
- [ ] Document the architecture (lean, 2 crates)
- [ ] Create demo walkthrough
- [ ] Record demo video (optional)

---

### Optional Week 4: Rate Limiting Contribution

**If time permits, contribute rate limiting to UDM-Single:**
- [ ] Fork UDM-Single or work in deps/UDM-single
- [ ] Add `RateLimitTracker` to `udm-connectors`
- [ ] Parse `X-RateLimit-*` headers from responses
- [ ] Implement backoff when limits approached
- [ ] Write tests
- [ ] Create PR to UDM-Single repository

---

### Future Enhancements (Post-MVP)

**Phase 2: AI Integration**
- [ ] Add OpenAI/Claude API connector
- [ ] Implement hybrid analysis (quantitative + AI insights)
- [ ] Add natural language query interface
- [ ] Example: "What Home Assistant integrations should I build for smart lighting?"
- [ ] AI generates analysis plan → UDM/PEG executes → AI synthesizes results

**Phase 3: Additional Niches**
- [ ] Developer Tools niche (GitHub + Stack Overflow + npm)
- [ ] SaaS Integration Marketplace niche (Zapier, Make, n8n)
- [ ] Content Creator niche (Reddit + News API + Hacker News)
- [ ] Custom niche builder (user-defined configurations)

**Phase 4: Advanced Features**
- [ ] Web UI for non-technical users
- [ ] Automated monitoring and alerts
- [ ] Historical trend tracking and visualization
- [ ] Collaborative opportunity scoring
- [ ] Integration with project management tools

**Phase 5: Natural Language Interface**
- [ ] Conversational query interface
- [ ] "Show me trending Home Assistant integration requests from this week"
- [ ] "Compare Govee vs Philips Hue integration opportunities"
- [ ] "Alert me when a new high-scoring opportunity emerges"
- [ ] AI-powered query understanding and workflow generation

---

## Success Criteria

### Technical Validation

| Criterion | Target | Status |
|-----------|--------|--------|
| **Connector Generation** | < 5 minutes | 🔄 In Progress |
| **Multi-Source Data Collection** | 3+ APIs per niche | 📋 Planned |
| **Workflow Execution** | > 95% success rate | 📋 Planned |
| **Performance** | < 2 minutes per analysis | 📋 Planned |
| **Data Freshness** | Real-time (< 1 hour old) | 📋 Planned |

### Business Validation

| Criterion | Target | Status |
|-----------|--------|--------|
| **Cost** | $0 (free tier APIs only) | ✅ Achieved |
| **Accuracy** | > 70% opportunity identification | 📋 To Validate |
| **Verifiability** | 100% sources linked | 📋 Planned |
| **Repeatability** | Consistent scores ±5% | 📋 To Validate |

### Value Proposition Validation

| Criterion | Target |
|-----------|--------|
| **vs ChatGPT: Data Freshness** | Real-time vs months-old training data |
| **vs ChatGPT: Verifiability** | 100% sources linked vs unverifiable |
| **vs ChatGPT: Quantification** | Precise scores vs qualitative estimates |
| **vs ChatGPT: Automation** | Scheduled analysis vs manual queries |
| **Complementarity** | Can feed structured data to AI for enhanced insights |

---

## Key Differentiators

### 1. Real-Time Market Intelligence
Unlike AI tools with training cutoffs, NicheFinder provides current data from live APIs, ensuring opportunities are based on the latest market signals.

### 2. Verifiable, Quantitative Analysis
Every opportunity includes precise metrics and source links, enabling validation and trust in the analysis.

### 3. Systematic, Repeatable Process
Consistent methodology ensures comparable results over time, enabling trend tracking and automated monitoring.

### 4. Multi-Source Data Fusion
UDM normalizes data from heterogeneous sources (GitHub, Reddit, forums, etc.) into unified schemas, providing comprehensive market views.

### 5. Extensible Architecture
Multi-niche design allows analysis of any integration ecosystem, demonstrating UDM/PEG versatility.

### 6. AI Complementarity
Structured output can feed AI tools for enhanced qualitative insights, combining quantitative rigor with contextual reasoning.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **API Rate Limits** | High | Use free tier APIs with generous limits; implement caching |
| **Data Quality** | Medium | Validate against known opportunities; implement confidence scores |
| **Scope Creep** | Medium | Focus on Home Assistant first; add niches incrementally |
| **AI Comparison** | Low | Position as complementary, not competitive; emphasize unique value |
| **Maintenance Burden** | Medium | Use stable APIs; implement graceful degradation |

---

## Next Steps

### Immediate (Week 1, Day 5)
1. ✅ Update PRD with Home Assistant use case
2. [ ] Generate GitHub API connector
3. [ ] Generate Reddit API connector
4. [ ] Test connector generation end-to-end
5. [ ] Document setup process

### Short-Term (Week 2)
1. [ ] Define IntegrationOpportunity schema
2. [ ] Implement UDM mappings
3. [ ] Create PEG workflow for Home Assistant analysis
4. [ ] Test multi-source data collection

### Medium-Term (Week 3)
1. [ ] Implement scoring algorithm
2. [ ] Build CLI with niche selector
3. [ ] Generate sample reports
4. [ ] Create demo materials

### Long-Term (Post-MVP)
1. [ ] Add AI integration for hybrid analysis
2. [ ] Implement natural language interface
3. [ ] Add additional niches (dev tools, SaaS, etc.)
4. [ ] Build web UI

---

**Version History:**
- v1.0 (2025-12-11): Initial PRD with local business niche use case
- v2.0 (2025-12-11): Pivot to Home Assistant integrations, multi-niche architecture, AI complementarity

---

**For implementation details and progress tracking, see CONVERSATION_HANDOFF.md**
