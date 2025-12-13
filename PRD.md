# NicheFinder: Product Requirements Document

**Version:** 2.1
**Date:** 2025-12-12
**Status:** Phase 1 Complete - Moving to Phase 2
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

NicheFinder provides a **Platform Demo Console** - a web-based UI built with React and TypeScript that demonstrates the end-to-end UDM + PEG + Connector ecosystem. Unlike a traditional business dashboard, this UI is designed to **prove the platform works** by showing every component, transformation, and data flow.

**Purpose:** Technical demonstration and validation tool
**Audience:** Engineering team, technical stakeholders, potential partners
**Deployment Model:** Local-only (runs on localhost:3000)

**Think:** AWS Console, Airflow UI, Grafana - not Tableau or Google Analytics

---

### Core Principle: Transparency Over Simplicity

**Show the internals, don't hide them:**
- ✅ Raw API responses alongside normalized data
- ✅ Workflow execution logs in real-time
- ✅ Connector configurations and schemas
- ✅ UDM transformation mappings
- ✅ Service health and architecture

**Why:** The goal is to PROVE the system works, not just show results.

---

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser (localhost:3000)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Platform Demo Console (React + TypeScript)   │   │
│  │                                                          │
│  │  [🏗️ System] [⚡ Workflow] [🔄 Pipeline] [📊 Results] [📦 Artifacts] │
│  │                                                          │
│  │  Tab 1: System Overview                                  │
│  │    • Architecture diagram with service health            │
│  │    • System statistics dashboard                         │
│  │                                                          │
│  │  Tab 2: Workflow Execution                               │
│  │    • Visual workflow DAG (React Flow)                    │
│  │    • Manual execution trigger                            │
│  │    • Real-time execution logs                            │
│  │                                                          │
│  │  Tab 3: Data Pipeline                                    │
│  │    • Raw → Normalized → Analyzed (3-column view)         │
│  │    • Transformation rules visualization                  │
│  │                                                          │
│  │  Tab 4: Results                                          │
│  │    • Opportunities table with scoring                    │
│  │    • Export functionality                                │
│  │                                                          │
│  │  Tab 5: Artifacts                                        │
│  │    • File browser for raw data                           │
│  │    • JSON preview with Monaco Editor                     │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│              Rust API Server (localhost:3001)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Axum REST API (Extended)                             │   │
│  │  • GET  /api/system/status       - Service health   │   │
│  │  • GET  /api/workflows           - List workflows    │   │
│  │  • POST /api/workflows/:id/exec  - Execute workflow  │   │
│  │  • GET  /api/executions          - Execution history │   │
│  │  • GET  /api/artifacts           - List artifacts    │   │
│  │  • GET  /api/opportunities       - Get results       │   │
│  │  • GET  /api/connectors          - List connectors   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PEG Engine (port 3007)                   │
│  • Workflow orchestration                                   │
│  • Connector execution                                      │
│  • Artifact storage                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### The 5 Core Tabs

#### Tab 1: 🏗️ System Overview
**Purpose:** Show the architecture and service health

**Components:**
- Architecture diagram (visual representation of all services)
- Service health indicators:
  - peg-engine (port 3007)
  - credential-vault (port 3005)
  - PEG-Connector-Service (port 9004)
  - PostgreSQL, Redis, ChromaDB
- Quick stats dashboard:
  - Total workflows executed
  - Total artifacts stored
  - Total opportunities identified
  - Last execution timestamp
- "System Check" button to verify all services

**Demo Value:** "Here's our architecture with 6 services running"

---

#### Tab 2: ⚡ Workflow Execution
**Purpose:** Manually trigger workflows and watch execution in real-time

**Components:**
- Workflow selector dropdown (Home Assistant Analysis)
- Workflow definition viewer (YAML/JSON with syntax highlighting)
- Visual workflow DAG showing:
  - Step 1: Fetch HACS Integrations
  - Step 2: Search GitHub Repos
  - Step 3: Search YouTube Videos
  - Status for each step (pending/running/complete/failed)
- "Execute Workflow" button
- Real-time execution log (streaming)
- Execution history table

**Demo Value:** "Let's execute a workflow and watch it run"

---

#### Tab 3: 🔄 Data Pipeline
**Purpose:** Show raw → normalized → analyzed transformation

**Components:**
- Three-column layout:
  - **Column 1: Raw Data** (from connector)
  - **Column 2: Normalized Data** (UDM schema)
  - **Column 3: Analyzed Data** (with scores)
- Data source selector (HACS, GitHub, YouTube)
- Sample data viewer with syntax highlighting
- Transformation logic display:
  - Show mapping rules
  - Highlight fields being transformed
  - Show UDM schema definition

**Demo Value:** "Here's how we transform raw data to normalized schema"

---

#### Tab 4: 📊 Results
**Purpose:** Show the actual opportunities (business value)

**Components:**
- Top opportunities table (sortable, filterable)
- Opportunity detail cards with:
  - Scoring breakdown (demand, feasibility, competition, trend)
  - Source attribution (which APIs contributed)
  - GitHub stats, YouTube mentions
  - Links to sources
- Scoring methodology explanation
- Export functionality (JSON, Markdown, CSV)

**Demo Value:** "Here are the top 20 opportunities with scores"

---

#### Tab 5: 📦 Artifacts
**Purpose:** Browse and inspect raw data files

**Components:**
- File browser for artifacts:
  - fetch_hacs_integrations-result.json (1.4 MB)
  - search_github_repos-result.json (134 KB)
  - search_youtube_videos-result.json (30 KB)
- File metadata (size, timestamp, source connector)
- JSON preview with syntax highlighting (Monaco Editor)
- Download button
- "Re-analyze" button to run analysis on selected artifacts

**Demo Value:** "Here's the raw data we collected from 3 APIs"

---

### Demo Narrative Flow (5-10 minutes)

**The UI tells this story:**

1. **System Overview** → "Here's our architecture with 6 services running"
2. **Workflow Execution** → "Let's execute the Home Assistant workflow"
3. **Artifacts** → "Here's the data we collected from 3 APIs"
4. **Data Pipeline** → "Here's how we transform raw data to normalized schema"
5. **Results** → "Here are the top 20 opportunities with scores"

**Result:** Complete understanding of the platform in 10 minutes

---

### Tech Stack

**Frontend:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router (for tab navigation)
- **State Management:** Zustand (lightweight, simple)
- **HTTP Client:** Native `fetch` with custom wrapper

**Visualization Libraries:**
- **Workflow DAG:** React Flow (workflow visualization)
- **Code Editor:** Monaco Editor (VS Code editor component)
- **Charts:** Recharts (scoring breakdown)
- **Icons:** Lucide React (consistent icon set)
- **Syntax Highlighting:** Prism.js or Shiki

**Real-time Updates:**
- **Polling:** Every 2 seconds during active execution
- **Future:** WebSocket for true real-time

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

#### Existing Endpoints (Already Built)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/opportunities` | Get top opportunities |
| POST | `/api/analyze` | Trigger analysis |

#### New Endpoints Required for Platform Demo Console

**System Overview:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system/status` | Health of all services (peg-engine, credential-vault, etc.) |
| GET | `/api/system/stats` | Overall statistics (workflows run, artifacts stored) |
| GET | `/api/system/architecture` | Architecture metadata for diagram |

**Workflow Execution:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List available workflows |
| GET | `/api/workflows/:id` | Get workflow definition (YAML/JSON) |
| POST | `/api/workflows/:id/execute` | Trigger workflow execution |
| GET | `/api/executions` | List execution history |
| GET | `/api/executions/:id` | Get execution details |
| GET | `/api/executions/:id/logs` | Get execution logs (streaming) |
| GET | `/api/executions/:id/status` | Get real-time status |

**Data Pipeline:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transform/preview` | Show transformation for sample data |
| GET | `/api/schemas` | List UDM schemas |
| GET | `/api/schemas/:name` | Get schema definition |

**Artifacts:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/artifacts` | List all artifacts |
| GET | `/api/artifacts/:id` | Get artifact content |
| GET | `/api/artifacts/:id/preview` | Get preview (first 100 lines) |
| GET | `/api/artifacts/:id/metadata` | Get metadata (size, timestamp, source) |

**Connectors:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/connectors` | List all connectors |
| GET | `/api/connectors/:id` | Get connector configuration |
| GET | `/api/connectors/:id/schema` | Get connector output schema |

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

## Phase 1: Platform Validation ✅ COMPLETE

**Completion Date:** 2025-12-12

### Achievements

✅ **PEG v2.0 Connectors Created**
- HACS Connector: Fetches Home Assistant custom integrations
- GitHub Connector: Searches repositories with API key authentication
- YouTube Connector: Searches videos with API key authentication

✅ **End-to-End Workflow Execution**
- Workflow ID: `87abf4be-2605-4b5f-9807-0e2aec3a3d89`
- Execution ID: `109b25c7-e0ae-45eb-b346-cbc1f950ce10`
- Status: COMPLETED
- Duration: ~2.5 seconds
- Steps: HACS → (GitHub + YouTube in parallel)

✅ **Infrastructure Setup**
- **peg-engine** (Node.js): Workflow orchestration with BullMQ job queue
- **credential-vault**: Secure credential storage with AWS KMS encryption
- **PEG-Connector-Service** (Rust): Connector runtime on port 9004
- PostgreSQL + Redis: Database and queue infrastructure

✅ **Key Validations**
- ✅ Connectors work without manual coding
- ✅ Workflow executes with proper dependency management
- ✅ Parallel execution works (GitHub + YouTube ran simultaneously)
- ✅ Credentials retrieved securely from vault
- ✅ Multi-service integration (peg-engine → vault → connectors → APIs)

### What We Proved

**"The platform works end-to-end without manual coding"**

1. **Declarative Workflows**: JSON workflow definition with actors and steps
2. **Secure Credentials**: AWS KMS-encrypted credential storage and retrieval
3. **Polyglot Architecture**: Node.js executor + Rust connectors working together
4. **Automated Orchestration**: BullMQ-based job queue with dependency resolution
5. **Real Data Extraction**: Successfully fetched data from HACS, GitHub, and YouTube

### Files Created

- `workflows/home-assistant-analysis-peg-engine.json` - Workflow definition
- `connectors/peg-v2-hacs.yaml` - HACS connector specification
- `connectors/peg-v2-github.yaml` - GitHub connector specification
- `connectors/peg-v2-youtube.yaml` - YouTube connector specification
- `deps/peg-engine/.env` - peg-engine configuration
- `deps/credential-vault/.env` - credential-vault configuration

---

### Future Enhancements (Post-MVP)

**Phase 2: UDM Normalization & Data Analysis** ✅ COMPLETE (2025-12-12)
- [x] **Fix artifact storage in peg-engine**
  - Modified `deps/peg-engine/src/core/worker.ts` to auto-create artifacts from connector results
  - Artifacts now stored before output mapping is applied
  - New execution ID: `309a8a02-293e-4bde-ae6b-d0df6d52844d` with 3 artifacts
- [x] **Extract workflow execution results**
  - Downloaded HACS integrations (1.4 MB, ~2,000+ integrations)
  - Downloaded GitHub repositories (134 KB, 20 repos)
  - Downloaded YouTube videos (30 KB, 20 videos)
  - Saved to `data/raw/` directory
- [x] **Transform raw API responses into UDM format**
  - Created `transform.rs` module to parse and normalize HACS, GitHub, YouTube data
  - Implemented domain extraction, GitHub stats parsing, YouTube mention counting
- [x] **Implement opportunity scoring algorithm**
  - Created `analysis.rs` module with demand-supply gap methodology
  - Scoring components: Demand (40%), Feasibility (30%), Competition (20%), Trend (10%)
  - Successfully analyzed 1,889 candidates in 0.09 seconds
- [x] **Generate analysis reports with rankings and metrics**
  - Created CLI tool (`analyze.rs`) for running analysis
  - Generated Markdown report with top 20 opportunities
  - Top opportunity: Xiaomi Home (Score: 83.6/100)
- [x] **Validate data quality and completeness**
  - End-to-end validation: PEG → Connectors → Artifacts → Transform → Analysis → Report
  - All 3 data sources successfully integrated

**Phase 3: Platform Demo Console** 🔄 IN PROGRESS (~60% Complete)
- [x] **UI Foundation & Infrastructure** (Phase 3.1-3.4)
  - React 18 + TypeScript + Vite project initialized
  - Tailwind CSS v4, React Router, Zustand, React Flow, Monaco Editor, Recharts
  - Layout components (Header, TabNavigation, Footer)
  - Shared components (StatusBadge, LoadingSpinner, ErrorMessage, CodeViewer)
  - Infrastructure startup scripts (`start-demo.sh`, `stop-demo.sh`)
- [x] **Backend API Extensions**
  - 10+ REST endpoints in nichefinder-server (Rust/Axum)
  - System status, workflow execution, artifact browsing, connector management
  - CORS support for local development
  - Database populated with 50 opportunities
- [x] **Results Tab** - FULLY IMPLEMENTED
  - Displays 50 opportunities with scoring breakdown
  - Source attribution (HACS, GitHub, YouTube)
  - Sortable table
- [x] **Workflow Execution Tab** - FULLY IMPLEMENTED
  - Auto-display of latest execution
  - Execution details (ID, status, timestamps, artifacts)
  - Service Call Trace (peg-engine traces grouped by step)
  - Aggregated service calls (nichefinder-server → peg-engine)
  - Expand/collapse for details
  - Real-time polling during execution
  - Complete end-to-end ecosystem visibility
- [x] **Service Call Trace Feature** (Phase 3.5)
  - PostgreSQL execution_traces table
  - HTTP interceptors in peg-engine
  - Trace storage and retrieval API
  - Frontend TraceEntry and ServiceCallTrace components
- [x] **Aggregated Service Call Viewer** (Phase 3.6)
  - In-memory service call storage in nichefinder-server
  - Aggregation by operation type
  - Frontend AggregatedServiceCall component
  - Real-time updates
- [ ] **System Overview Tab** - Placeholder (Priority 1)
  - Architecture diagram
  - Service health status
  - System statistics
- [ ] **Artifacts Tab** - Placeholder (Priority 1)
  - File browser
  - JSON preview
  - Download functionality
- [ ] **Data Pipeline Tab** - Placeholder (Priority 2)
  - 3-column view: Raw → Normalized → Analyzed
  - Transformation rules display
- [ ] **Polish & Testing** (Priority 2)
  - Error handling, loading states
  - Browser testing (Chrome, Firefox, Safari)
  - Responsive design
- [ ] **Create demo narrative** (5-10 minute presentation flow)
- [ ] **Test end-to-end demo** with stakeholders

**Phase 4: Additional Niches & Data Sources** 📋 PLANNED
- [ ] **Add more niches:**
  - Developer Tools niche (GitHub + Stack Overflow + npm)
  - SaaS Integration Marketplace niche (Zapier, Make, n8n)
  - Content Creator niche (Reddit + News API + Hacker News)
  - Custom niche builder (user-defined configurations)
- [ ] **Add more data sources to existing niches:**
  - Home Assistant: Add Reddit, Discord, Home Assistant forums
  - Enrichment: Add sentiment analysis, trend detection
  - Social signals: Twitter/X mentions, blog posts
- [ ] **UI for managing niches and data sources:**
  - Visual niche builder (drag-and-drop data sources)
  - Connector marketplace (browse and add connectors)
  - Data source configuration UI
  - Preview and test new niches before deployment

**Phase 5: Advanced Features**
- [ ] Automated monitoring and alerts
- [ ] Historical trend tracking and visualization
- [ ] Collaborative opportunity scoring
- [ ] Integration with project management tools
- [ ] Multi-user support with authentication

**Phase 6: Natural Language Interface**
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
| **Connector Generation** | < 5 minutes | ✅ **ACHIEVED** (3 connectors: HACS, GitHub, YouTube) |
| **Multi-Source Data Collection** | 3+ APIs per niche | ✅ **ACHIEVED** (HACS, GitHub, YouTube) |
| **Workflow Execution** | > 95% success rate | ✅ **ACHIEVED** (100% success in testing) |
| **PEG Orchestration** | Automated workflow execution | ✅ **ACHIEVED** (peg-engine with parallel execution) |
| **Credential Management** | Secure credential storage | ✅ **ACHIEVED** (credential-vault with AWS KMS) |
| **Performance** | < 2 minutes per analysis | ✅ **ACHIEVED** (~2.5 seconds for 3-step workflow) |
| **Data Freshness** | Real-time (< 1 hour old) | ✅ **ACHIEVED** (live API calls) |

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
- v3.0 (2025-12-12): Updated UI section to Platform Demo Console approach
  - Changed from business dashboard to technical demonstration tool
  - Added 5 core tabs: System Overview, Workflow Execution, Data Pipeline, Results, Artifacts
  - Expanded API endpoints for platform demonstration
  - Added Phase 4 for additional niches and data sources with UI management
  - Marked Phase 2 (UDM Normalization & Data Analysis) as complete

---

**For implementation details and progress tracking, see:**
- `PHASE_2_COMPLETE.md` - Phase 2 completion summary
- `UI_STRATEGY.md` - Platform Demo Console strategy
- `UI_MOCKUP.md` - Visual mockups of all 5 tabs
- `UI_IMPLEMENTATION_PLAN.md` - 12-day implementation roadmap
