# Phase 3: Platform Demo Console UI - Handoff Document

**Date:** 2025-12-12  
**Current Phase:** Phase 3 - Build Platform Demo Console UI  
**Repository:** `/Users/jg/labs-nichefinder`  
**Branch:** `main` (all changes committed and pushed)

---

## 🎯 Project Overview

**NicheFinder** is a multi-domain market intelligence platform that demonstrates the end-to-end capabilities of the **UDM + PEG + Connector ecosystem**. The primary goal is to **prove the platform works** by showing how data flows from APIs → Connectors → PEG Engine → UDM Normalization → Analysis → Results.

**Current Use Case:** Home Assistant integration opportunity analysis
- **Data Sources:** HACS (integrations), GitHub (repos), YouTube (videos)
- **Output:** Ranked list of integration opportunities with scoring

---

## ✅ What's Been Completed

### Phase 1: PEG Connectors & Workflow Execution ✅ COMPLETE
- Created 3 PEG v2.0 connectors: HACS, GitHub, YouTube
- Successfully executed workflow (ID: `309a8a02-293e-4bde-ae6b-d0df6d52844d`)
- Retrieved 3 artifacts:
  - HACS: 1.4 MB (~2,000+ integrations)
  - GitHub: 134 KB (20 repos)
  - YouTube: 30 KB (20 videos)
- All artifacts stored in `data/raw/`

### Phase 2: UDM Normalization & Data Analysis ✅ COMPLETE
- Implemented data transformation pipeline (`crates/nichefinder-core/src/transform.rs`)
- Created opportunity scoring algorithm (`crates/nichefinder-core/src/analysis.rs`)
- Built CLI tool for running analysis (`crates/nichefinder-core/src/bin/analyze.rs`)
- Successfully analyzed 1,889 candidates in 0.09 seconds
- Generated comprehensive analysis report (`data/analysis_report.md`)
- **Top opportunity:** Xiaomi Home (Score: 83.6/100)

**Key Achievement:** End-to-end validation of UDM + PEG + Connector ecosystem

### Phase 3.1: UI Foundation ✅ COMPLETE
- Initialized Vite + React + TypeScript project in `web-ui/`
- Installed all dependencies (Tailwind CSS v4, React Router, Zustand, React Flow, Monaco Editor, Recharts)
- Created complete project structure with organized directories
- Built layout components (Header, TabNavigation, Footer)
- Created shared components (StatusBadge, LoadingSpinner, ErrorMessage, CodeViewer)
- Implemented API client wrapper with TypeScript types

### Phase 3.2: Backend API Extensions ✅ COMPLETE
- Extended Rust backend with new endpoints:
  - `/api/opportunities` - Get opportunities with filtering
  - `/api/system/status` - Service health checks
  - `/api/system/stats` - System statistics
  - `/api/workflows` - List workflows
  - `/api/workflows/{id}/execute` - Execute workflow
  - `/api/executions` - List executions
  - `/api/executions/{id}` - Get execution details
  - `/api/artifacts` - List artifacts
  - `/api/artifacts/{id}` - Get artifact details
  - `/api/connectors` - List connectors
- Added CORS support for local development
- Created import script to populate database with 50 opportunities
- Successfully imported data from analysis results

### Phase 3.3: Results Tab Implementation ✅ COMPLETE
- Built Results page with sortable table
- Displays 50 opportunities with scoring details
- Shows data sources for each opportunity (HACS, GitHub, YouTube)
- Fixed frontend-backend data structure integration
- Successfully tested with real data from database
- YouTube data source showing as "YouTube (general)" for all opportunities

### Phase 3.4: Infrastructure Startup Scripts ✅ COMPLETE
- Created `start-demo.sh` - Starts ALL 6 services + infrastructure
- Created `stop-demo.sh` - Stops all services gracefully
- Updated README.md with comprehensive startup instructions
- Documented the complete end-to-end architecture flow:
  1. Infrastructure (PostgreSQL, Redis, ChromaDB)
  2. credential-vault (port 3005) - AWS KMS encryption
  3. peg-engine (port 3007) - Workflow orchestration
  4. PEG-Connector-Service (port 9004) - Connector runtime
  5. nichefinder-server (port 3001) - REST API
  6. Frontend UI (port 5173) - React interface

**Key Achievement:** Complete end-to-end system startup with NO shortcuts or workarounds!

---

## � Current Status: Phase 3 In Progress

### What's Working Now
✅ **Full infrastructure startup** - All 6 services start with `./start-demo.sh`
✅ **Backend API** - 10 endpoints serving data
✅ **Frontend UI** - Basic React app with 5 tabs
✅ **Results tab** - Displays 50 opportunities from database
✅ **End-to-end flow** - peg-engine → credential-vault → PEG-Connector-Service (PROVEN)

### What's Next
🚧 **Service Call Trace** - Prove the end-to-end integration in the UI
🚧 **System Overview tab** - Architecture diagram and service health
🚧 **Workflow Execution tab** - Trigger workflows and watch execution
🚧 **Data Pipeline tab** - Show raw → normalized → analyzed transformation
🚧 **Artifacts tab** - Browse and inspect raw data files

---

## 🎯 Next Immediate Task: Service Call Trace

### Purpose
**PROVE** that the system uses the real end-to-end flow (not workarounds) by showing actual API calls between services in the UI.

### What We'll Build
Add a "Service Call Trace" panel to the Workflow Execution tab that shows:
1. peg-engine → credential-vault (credential retrieval)
2. credential-vault → AWS KMS (decryption)
3. peg-engine → PEG-Connector-Service (connector execution with credentials)
4. PEG-Connector-Service → External APIs (GitHub, HACS, YouTube)
5. Results stored as artifacts

### Implementation Plan
See `FEATURE_SERVICE_CALL_TRACE.md` for detailed specification.

**Timeline:** 1-2 days
- Backend: Add logging middleware to peg-engine
- Backend: Create `/executions/:id/trace` API endpoint
- Frontend: Add Service Call Trace panel to Tab 2
- Frontend: Display real-time API calls with request/response details

---

## 🔮 Future Enhancements

### 1. Opportunity Descriptions (AI-Generated)
**Goal:** Add human-readable descriptions to each opportunity explaining what it is and why it's valuable.

**LLM Options:**

**Option 1: Ollama (Preferred)** ⭐
- **Pros:** Local, private, no API costs, no data leaves our infrastructure
- **Cons:** Requires local Ollama installation
- **Use Case:** All opportunity descriptions (no proprietary data concerns)

**Option 2: OpenAI**
- **Pros:** Higher quality, faster, no local setup
- **Cons:** API costs, data sent to external service
- **Use Case:** ONLY for public data (GitHub descriptions, topics, stars)
- **CRITICAL:** NEVER send proprietary data (PEG workflows, UDM schemas, internal analysis)

**Data Classification:**
```
✅ SAFE for OpenAI:
- GitHub repo descriptions
- GitHub topics/tags
- Star/fork/issue counts
- HACS category names
- Public community activity

❌ NEVER send to OpenAI:
- PEG workflow definitions
- UDM transformation schemas
- Internal scoring algorithms
- Proprietary analysis logic
- Custom connector implementations
```

**Recommended Approach:**
1. **Use Ollama by default** (preferred for privacy)
2. **OpenAI as fallback** (if Ollama unavailable, with data filtering)

**Example Output:**
```
Name: Xiaomi Home
Description: A comprehensive Home Assistant integration for controlling
Xiaomi smart home devices including lights, sensors, and appliances
through the MIoT protocol.
Value: High community demand with 21K GitHub stars and active development,
indicating strong user interest and reliable maintenance.
```

**Implementation:**
1. Add `description` and `value_proposition` fields to `NicheOpportunity` struct
2. Create LLM service with dual provider support (Ollama + OpenAI)
3. Implement data filtering for OpenAI (public data only)
4. Generate descriptions for all opportunities
5. Update Results tab UI to display descriptions
6. Add expandable detail view

**Timeline:** 2-3 days (future phase)

**Specification:** See `FEATURE_OPPORTUNITY_DESCRIPTIONS.md`

---

### 2. Additional Data Sources
**Goal:** Expand market intelligence with more diverse data sources.

**Proposed Sources:**
1. **Google Trends** (HIGHEST PRIORITY) ⭐
   - Search interest over time
   - Market demand and growth trends
   - Geographic distribution
   - Rising vs. declining trends

2. **HackerNews**
   - Tech community discussions
   - Developer interest signals
   - Real-world use cases

3. **Home Assistant Community Forum**
   - Official forum activity
   - Integration-specific threads
   - User questions and solutions

4. **Reddit (r/homeassistant)**
   - Community recommendations
   - User experiences
   - Integration comparisons

**Benefits:**
- More comprehensive market validation
- Better trend analysis
- Real-world user pain points
- Enhanced scoring algorithm

**Timeline:** 3-5 days (future phase)

**Specification:** See `FEATURE_ADDITIONAL_DATA_SOURCES.md`

---

## 📚 Key Documents to Review

**MUST READ (in this order):**

1. **`UI_STRATEGY.md`** (429 lines)
   - Complete UI vision and requirements
   - 5 core tabs specification
   - API endpoint requirements
   - Visual design principles
   - Technical stack and component structure

2. **`UI_MOCKUP.md`** (223 lines)
   - ASCII mockups of all 5 tabs
   - Visual reference for development
   - Shows layout and data flow

3. **`UI_IMPLEMENTATION_PLAN.md`** (270 lines)
   - 8-phase implementation roadmap
   - 12-day timeline (2.5 weeks)
   - Success metrics and next steps

4. **`PRD.md`** (sections 233-551)
   - Updated User Interface section (v3.0)
   - Platform Demo Console approach
   - API endpoints specification

5. **`PHASE_2_COMPLETE.md`**
   - Phase 2 summary and achievements
   - Current system capabilities

---

## 🏗️ The 5 Core Tabs

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| 🏗️ **System Overview** | Show architecture & health | Service status, architecture diagram, stats |
| ⚡ **Workflow Execution** | Trigger & monitor workflows | DAG visualization, real-time logs, history |
| 🔄 **Data Pipeline** | Show transformations | Raw → Normalized → Analyzed (3-column view) |
| 📊 **Results** | Display opportunities | Sortable table, scoring breakdown, export |
| 📦 **Artifacts** | Browse raw data | File browser, JSON preview, download |

---

## 🎬 Demo Narrative (5-10 minutes)

The UI tells this story:

1. **System Overview** → "Here's our architecture with 6 services running"
2. **Workflow Execution** → "Let's execute the Home Assistant workflow"
3. **Artifacts** → "Here's the data we collected from 3 APIs"
4. **Data Pipeline** → "Here's how we transform raw data to normalized schema"
5. **Results** → "Here are the top 20 opportunities with scores"

**Result:** Complete understanding of the platform in 10 minutes

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router (for tab navigation)
- **State Management:** Zustand (lightweight, simple)
- **HTTP Client:** Native `fetch` with custom wrapper

### Visualization Libraries
- **Workflow DAG:** React Flow (workflow visualization)
- **Code Editor:** Monaco Editor (VS Code editor component)
- **Charts:** Recharts (scoring breakdown)
- **Icons:** Lucide React (consistent icon set)
- **Syntax Highlighting:** Prism.js or Shiki

### Backend (Existing)
- **Framework:** Axum (Rust)
- **Server:** `crates/nichefinder-server/` (port 3001)
- **Existing Endpoints:**
  - `GET /health`
  - `GET /api/opportunities`
  - `POST /api/analyze`

---

## 📋 Implementation Plan (12 Days)

### Phase 1: Foundation (Days 1-2)
- [ ] Initialize Vite + React + TypeScript project in `web-ui/`
- [ ] Install dependencies (Tailwind, React Router, Zustand, etc.)
- [ ] Create layout components (Header, TabNavigation, Footer)
- [ ] Implement API client wrapper
- [ ] Create shared components (StatusBadge, CodeViewer, LoadingSpinner)

### Phase 2: Backend API Extensions (Days 3-4)
- [ ] Extend `crates/nichefinder-server/src/api.rs` with new routes
- [ ] Add system status endpoints
- [ ] Add workflow execution endpoints
- [ ] Add artifact endpoints
- [ ] Add CORS support for local development

### Phase 3: Results Tab (Day 5)
- [ ] Create OpportunitiesTable component
- [ ] Create OpportunityCard component
- [ ] Add filtering and sorting
- [ ] Add export functionality

### Phase 4: System Overview Tab (Day 6)
- [ ] Create ArchitectureDiagram component
- [ ] Create ServiceStatus component
- [ ] Create StatsCards component

### Phase 5: Workflow Execution Tab (Days 7-8)
- [ ] Create WorkflowDAG component (React Flow)
- [ ] Create ExecutionLog component
- [ ] Implement "Execute Workflow" button
- [ ] Add real-time status polling

### Phase 6: Artifacts Tab (Day 9)
- [ ] Create ArtifactBrowser component
- [ ] Create ArtifactPreview component (Monaco Editor)
- [ ] Add download functionality

### Phase 7: Data Pipeline Tab (Day 10)
- [ ] Create DataComparison component (3-column view)
- [ ] Create TransformationView component
- [ ] Show transformation rules

### Phase 8: Polish & Testing (Days 11-12)
- [ ] Dark mode support
- [ ] Responsive design
- [ ] Error handling
- [ ] Testing and demo preparation

---

## 🏃 Next Steps (START HERE)

### Step 1: Review Documents
Read the following documents in order:
1. `UI_STRATEGY.md` - Understand the vision
2. `UI_MOCKUP.md` - See the visual design
3. `UI_IMPLEMENTATION_PLAN.md` - Understand the roadmap

### Step 2: Initialize React Project
```bash
cd /Users/jg/labs-nichefinder
npm create vite@latest web-ui -- --template react-ts
cd web-ui
npm install
```

### Step 3: Install Dependencies
```bash
npm install tailwindcss postcss autoprefixer
npm install react-router-dom zustand
npm install @xyflow/react  # React Flow for workflow DAG
npm install @monaco-editor/react  # Monaco Editor for code viewing
npm install recharts  # Charts for scoring breakdown
npm install lucide-react  # Icons
```

### Step 4: Set Up Tailwind CSS
```bash
npx tailwindcss init -p
```

Then configure `tailwind.config.js` and add Tailwind directives to `src/index.css`.

### Step 5: Create Basic Layout
- Create `src/components/layout/Header.tsx`
- Create `src/components/layout/TabNavigation.tsx`
- Create `src/components/layout/Footer.tsx`
- Update `src/App.tsx` with tab navigation

### Step 6: Implement API Client
- Create `src/api/client.ts` - Fetch wrapper
- Create `src/api/types.ts` - TypeScript types
- Create `src/api/endpoints.ts` - Endpoint definitions

### Step 7: Build Results Tab First
This is the easiest tab because it uses existing data:
- Create `src/pages/Results.tsx`
- Create `src/components/results/OpportunitiesTable.tsx`
- Fetch data from `GET /api/opportunities`
- Display in a sortable table

---

## 🔧 Infrastructure Context

### Services Running
- **peg-engine:** Port 3007 (workflow orchestration)
- **credential-vault:** Port 3005 (credential storage)
- **PEG-Connector-Service:** Port 9004 (connector runtime)
- **PostgreSQL:** Ports 5436 (peg-engine), 5433 (main project)
- **Redis:** Ports 5379 (peg-engine), 6380 (main project)
- **ChromaDB:** Port 8000 (vector database)
- **nichefinder-server:** Port 3001 (REST API - to be started)

### Starting the Backend Server
```bash
cd /Users/jg/labs-nichefinder
cargo run -p nichefinder-server
```

This will start the REST API on `http://localhost:3001`

### Running the Analysis CLI (for testing)
```bash
cd /Users/jg/labs-nichefinder
cargo run -p nichefinder-core --bin nichefinder-analyze -- --max-results 20
```

---

## 📊 Current Data

### Artifacts Available
- `data/raw/fetch_hacs_integrations-result.json` (1.4 MB)
- `data/raw/search_github_repos-result.json` (134 KB)
- `data/raw/search_youtube_videos-result.json` (30 KB)

### Analysis Results
- `data/analysis_report.md` - Full analysis report
- 1,889 candidates analyzed
- 20 qualified opportunities
- Top opportunity: Xiaomi Home (Score: 83.6/100)

---

## ✅ Success Criteria

**The UI successfully demonstrates:**
- ✅ All 6 services are running and healthy
- ✅ Workflows can be executed manually via UI
- ✅ Real-time execution status is visible
- ✅ Raw data from connectors is inspectable
- ✅ UDM transformation is transparent and understandable
- ✅ Results are actionable and well-presented
- ✅ The entire pipeline is understandable in 10 minutes

**Technical Quality:**
- ✅ Loads in < 2 seconds
- ✅ Real-time updates during execution (< 2s latency)
- ✅ Works in Chrome, Firefox, Safari
- ✅ Responsive design (desktop + tablet)
- ✅ No console errors or warnings
- ✅ Accessible (keyboard navigation, ARIA labels)

---

## 🎯 Important Notes

1. **This is NOT a business dashboard** - It's a technical demonstration tool
2. **Show the internals** - Don't hide complexity, expose it elegantly
3. **Build iteratively** - One tab at a time, test as you go
4. **Start with Results tab** - It's the easiest and uses existing data
5. **Extend backend API** - You'll need to add new endpoints as you build
6. **Use the mockups** - `UI_MOCKUP.md` shows exactly what each tab should look like
7. **Follow the plan** - `UI_IMPLEMENTATION_PLAN.md` has the detailed roadmap

---

## 📞 Questions to Consider

- Do we need WebSocket for real-time updates, or is polling sufficient? (Polling recommended for MVP)
- Should we support multiple workflow executions simultaneously? (No for MVP)
- Do we need user authentication? (No for MVP - local only)
- Should we persist UI state in localStorage? (Yes - filters, preferences, dark mode)

---

## 🚀 Ready to Start?

**Your first task:** Initialize the React + TypeScript + Vite project in `web-ui/` and set up the basic layout with tab navigation.

**Timeline:** 12 days (2.5 weeks)

**Good luck!** 🎉


