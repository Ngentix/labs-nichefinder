# NicheFinder UI Implementation Plan

**Goal:** Build a Platform Demo Console to showcase the end-to-end UDM + PEG + Connector ecosystem

---

## Documents Created

1. **UI_STRATEGY.md** - Complete UI strategy and requirements
2. **UI_MOCKUP.md** - Visual mockups of all 5 tabs
3. **This document** - Implementation roadmap

---

## What Makes This UI Special

### Traditional Business Dashboard ❌
- Shows only final results
- Hides the complexity
- Focus: "What opportunities exist?"

### Platform Demo Console ✅
- Shows the entire pipeline
- Exposes the architecture
- Focus: "How does the system work?"

**Think:** AWS Console, Airflow UI, Grafana - not Tableau

---

## The 5 Core Tabs

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| 🏗️ **System Overview** | Show architecture & health | Service status, architecture diagram, stats |
| ⚡ **Workflow Execution** | Trigger & monitor workflows | DAG visualization, real-time logs, history |
| 🔄 **Data Pipeline** | Show transformations | Raw → Normalized → Analyzed (3-column view) |
| 📊 **Results** | Display opportunities | Sortable table, scoring breakdown, export |
| 📦 **Artifacts** | Browse raw data | File browser, JSON preview, download |

---

## Demo Narrative (5-10 minutes)

**The UI tells this story:**

1. **System Overview** → "Here's our architecture with 6 services running"
2. **Workflow Execution** → "Let's execute the Home Assistant workflow"
3. **Artifacts** → "Here's the data we collected from 3 APIs"
4. **Data Pipeline** → "Here's how we transform raw data to normalized schema"
5. **Results** → "Here are the top 20 opportunities with scores"

**Result:** Complete understanding of the platform in 10 minutes

---

## Technical Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (tab navigation)
- Zustand (state management)

### Visualization
- React Flow (workflow DAG)
- Monaco Editor (code viewer)
- Recharts (scoring charts)
- Lucide React (icons)

### Backend API
- Extend `nichefinder-server` with new endpoints
- See UI_STRATEGY.md for full endpoint list

---

## Implementation Phases

### Phase 1: Foundation (2 days)
**Goal:** Set up project structure and shared components

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project in `web-ui/`
- [ ] Install dependencies (Tailwind, React Router, Zustand, etc.)
- [ ] Create layout components (Header, TabNavigation, Footer)
- [ ] Implement API client wrapper (`src/api/client.ts`)
- [ ] Create shared components:
  - [ ] StatusBadge (✅ ❌ 🔵 indicators)
  - [ ] CodeViewer (syntax-highlighted JSON/YAML)
  - [ ] LoadingSpinner
  - [ ] ErrorMessage

**Deliverable:** Basic app shell with tab navigation

---

### Phase 2: Backend API Extensions (2 days)
**Goal:** Add endpoints needed for the UI

**Tasks:**
- [ ] Extend `crates/nichefinder-server/src/api.rs` with new routes:
  - [ ] System status endpoints
  - [ ] Workflow execution endpoints
  - [ ] Artifact endpoints
  - [ ] Connector endpoints
- [ ] Add workflow execution logic (call peg-engine API)
- [ ] Add artifact file serving
- [ ] Add CORS support for local development
- [ ] Test all endpoints with curl/Postman

**Deliverable:** REST API with all required endpoints

---

### Phase 3: Results Tab (1 day)
**Goal:** Build the easiest tab first (uses existing data)

**Tasks:**
- [ ] Create `OpportunitiesTable` component
- [ ] Create `OpportunityCard` component (expandable detail)
- [ ] Create `ScoringBreakdown` component (bar charts)
- [ ] Add filtering (min score, max results)
- [ ] Add sorting (by score, stars, issues)
- [ ] Add export functionality (JSON, Markdown, CSV)

**Deliverable:** Fully functional Results tab

---

### Phase 4: System Overview Tab (1 day)
**Goal:** Show architecture and service health

**Tasks:**
- [ ] Create `ArchitectureDiagram` component (static SVG or React Flow)
- [ ] Create `ServiceStatus` component (health checks)
- [ ] Create `StatsCards` component (workflows, artifacts, opportunities)
- [ ] Implement system health check API calls
- [ ] Add "Run System Check" button

**Deliverable:** System Overview tab with live status

---

### Phase 5: Workflow Execution Tab (2 days)
**Goal:** Most complex tab - workflow visualization and execution

**Tasks:**
- [ ] Create `WorkflowSelector` component
- [ ] Create `WorkflowDAG` component using React Flow
- [ ] Create `ExecutionLog` component (streaming logs)
- [ ] Create `ExecutionHistory` component (table)
- [ ] Implement "Execute Workflow" button
- [ ] Add real-time status polling (every 2s during execution)
- [ ] Add workflow definition viewer (YAML syntax highlighting)

**Deliverable:** Interactive workflow execution tab

---

### Phase 6: Artifacts Tab (1 day)
**Goal:** Browse and preview raw data files

**Tasks:**
- [ ] Create `ArtifactBrowser` component (file list)
- [ ] Create `ArtifactPreview` component using Monaco Editor
- [ ] Create `ArtifactMetadata` component (size, timestamp, source)
- [ ] Add download functionality
- [ ] Add "Re-analyze" button (trigger analysis on selected artifacts)

**Deliverable:** Artifact browser with preview

---

### Phase 7: Data Pipeline Tab (2 days)
**Goal:** Show raw → normalized → analyzed transformation

**Tasks:**
- [ ] Create `DataComparison` component (3-column layout)
- [ ] Create `TransformationView` component (highlight mappings)
- [ ] Create `SchemaViewer` component (show UDM schemas)
- [ ] Implement data source selector (HACS, GitHub, YouTube)
- [ ] Add side-by-side comparison mode
- [ ] Show transformation rules

**Deliverable:** Data pipeline visualization

---

### Phase 8: Polish & Testing (2 days)
**Goal:** Production-ready quality

**Tasks:**
- [ ] Add dark mode support
- [ ] Implement responsive design (desktop + tablet)
- [ ] Add comprehensive error handling
- [ ] Add loading states for all async operations
- [ ] Test in Chrome, Firefox, Safari
- [ ] Add keyboard navigation
- [ ] Write README with setup instructions
- [ ] Create demo script for presentation

**Deliverable:** Production-ready UI

---

## Total Timeline: 12 days (2.5 weeks)

**Week 1:**
- Days 1-2: Foundation + Backend API
- Days 3-5: Results + System Overview + Workflow Execution

**Week 2:**
- Days 1-2: Artifacts + Data Pipeline
- Days 3-4: Polish & Testing
- Day 5: Demo preparation

---

## Success Metrics

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

## Next Steps

1. **Review** UI_STRATEGY.md and UI_MOCKUP.md with team
2. **Approve** the Platform Demo Console approach
3. **Start Phase 1** - Initialize React project
4. **Build iteratively** - One tab at a time
5. **Demo early** - Show progress after each phase

---

## Questions to Answer

- [ ] Do we need WebSocket for real-time updates, or is polling sufficient?
- [ ] Should we support multiple workflow executions simultaneously?
- [ ] Do we need user authentication for the demo?
- [ ] Should we persist UI state (filters, preferences) in localStorage?
- [ ] Do we need a "guided tour" feature for first-time users?

---

## Resources

- **UI Strategy:** `UI_STRATEGY.md`
- **Visual Mockups:** `UI_MOCKUP.md`
- **PRD:** `PRD.md` (to be updated)
- **Backend API:** `crates/nichefinder-server/`
- **Frontend Code:** `web-ui/` (to be created)


