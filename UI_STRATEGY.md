# NicheFinder UI Strategy: Platform Demo Console

**Version:** 1.0  
**Date:** 2025-12-12  
**Purpose:** Define UI strategy for demonstrating end-to-end UDM + PEG + Connector ecosystem

---

## Vision: Platform Demo Console vs Business Dashboard

### What We're NOT Building (Yet)
❌ **Business User Dashboard** - Simple results viewer for finding opportunities  
❌ **Analytics Tool** - Charts, trends, historical comparisons  
❌ **Production SaaS UI** - Multi-tenant, auth, billing

### What We ARE Building
✅ **Platform Demo Console** - Prove the architecture works end-to-end  
✅ **Technical Showcase** - Show every component, connector, transformation  
✅ **Interactive Demo** - Let stakeholders trigger workflows and inspect data  
✅ **Educational Tool** - Help viewers understand how the system works

**Think:** AWS Console, Airflow UI, Grafana - not Tableau or Google Analytics

---

## Target Audience

**Primary:** Technical stakeholders who need to understand the platform
- Engineering team members
- Technical leadership
- Potential investors/partners
- Integration developers

**Secondary:** Business users (future phase)

---

## Core Principle: Transparency Over Simplicity

**Show the internals, don't hide them:**
- ✅ Raw API responses alongside normalized data
- ✅ Workflow execution logs in real-time
- ✅ Connector configurations and schemas
- ✅ UDM transformation mappings
- ✅ Service health and architecture

**Why:** The goal is to PROVE the system works, not just show results.

---

## UI Architecture: 5 Core Tabs

### Tab 1: 🏗️ System Overview
**Purpose:** Show the architecture and service health

**Components:**
- Architecture diagram (visual representation of all services)
- Service health indicators:
  - peg-engine (port 3007) - ✅ Healthy
  - credential-vault (port 3005) - ✅ Healthy
  - PEG-Connector-Service (port 9004) - ✅ Healthy
  - PostgreSQL (ports 5436, 5433) - ✅ Healthy
  - Redis (ports 5379, 6380) - ✅ Healthy
  - ChromaDB (port 8000) - ✅ Healthy
- Quick stats dashboard:
  - Total workflows executed
  - Total artifacts stored
  - Total opportunities identified
  - Last execution timestamp
- "System Check" button to verify all services

**Visual:** Interactive architecture diagram with status indicators

---

### Tab 2: ⚡ Workflow Execution
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
- Execution history table:
  - Execution ID
  - Timestamp
  - Duration
  - Status
  - Artifacts produced
  - Link to view results

**Visual:** Workflow graph with animated execution flow

---

### Tab 3: 🔄 Data Pipeline
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
- Side-by-side comparison mode

**Visual:** Split-screen with highlighted transformations

---

### Tab 4: 📊 Results
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

**Visual:** Clean data table with expandable rows

---

### Tab 5: 📦 Artifacts
**Purpose:** Browse and inspect raw data files

**Components:**
- File browser for artifacts:
  - fetch_hacs_integrations-result.json (1.4 MB)
  - search_github_repos-result.json (134 KB)
  - search_youtube_videos-result.json (30 KB)
- File metadata:
  - Size, timestamp, source connector
  - Execution ID that produced it
- JSON preview with syntax highlighting
- Download button
- "Re-analyze" button to run analysis on selected artifacts

**Visual:** File explorer with preview pane

---

## Demo Narrative Flow

**The UI tells this story:**

1. **"Here's our architecture"** (System Overview)
   - Show all services running
   - Explain each component's role
   
2. **"Let's execute a workflow"** (Workflow Execution)
   - Select "Home Assistant Analysis"
   - Click "Execute"
   - Watch real-time execution (3 connectors run in parallel)
   
3. **"Here's the data we collected"** (Artifacts)
   - Show 3 artifacts produced
   - Preview raw JSON from each API
   
4. **"Here's how we transform it"** (Data Pipeline)
   - Show raw HACS data → normalized schema
   - Highlight UDM mapping
   
5. **"Here are the results"** (Results)
   - Show top 20 opportunities
   - Explain scoring algorithm
   - Show source attribution

**Total demo time:** 5-10 minutes

---

## API Requirements

### Existing Endpoints (Already Built)
- `GET /health` - Health check
- `GET /api/opportunities` - Get top opportunities
- `POST /api/analyze` - Trigger analysis

### New Endpoints Needed

#### System Overview
- `GET /api/system/status` - Health of all services (peg-engine, credential-vault, etc.)
- `GET /api/system/stats` - Overall statistics (workflows run, artifacts stored)
- `GET /api/system/architecture` - Architecture metadata for diagram

#### Workflow Execution
- `GET /api/workflows` - List available workflows
- `GET /api/workflows/:id` - Get workflow definition (YAML/JSON)
- `POST /api/workflows/:id/execute` - Trigger workflow execution
- `GET /api/executions` - List execution history
- `GET /api/executions/:id` - Get execution details
- `GET /api/executions/:id/logs` - Get execution logs (streaming)
- `GET /api/executions/:id/status` - Get real-time status

#### Data Pipeline
- `GET /api/transform/preview` - Show transformation for sample data
- `GET /api/schemas` - List UDM schemas
- `GET /api/schemas/:name` - Get schema definition

#### Artifacts
- `GET /api/artifacts` - List all artifacts
- `GET /api/artifacts/:id` - Get artifact content
- `GET /api/artifacts/:id/preview` - Get preview (first 100 lines)
- `GET /api/artifacts/:id/metadata` - Get metadata (size, timestamp, source)

#### Connectors
- `GET /api/connectors` - List all connectors
- `GET /api/connectors/:id` - Get connector configuration
- `GET /api/connectors/:id/schema` - Get connector output schema

---

## Visual Design Principles

### Design System
**Framework:** Tailwind CSS with custom design tokens

**Color Palette:**
- Primary: Blue (#3B82F6) - Actions, links
- Success: Green (#10B981) - Healthy status, completed
- Warning: Yellow (#F59E0B) - Pending, warnings
- Error: Red (#EF4444) - Failed, errors
- Neutral: Gray (#6B7280) - Text, borders

**Typography:**
- Headings: Inter (sans-serif)
- Body: Inter
- Code: JetBrains Mono (monospace)

### Component Library
**Status Indicators:**
- ✅ Green dot + "Healthy" for running services
- 🔵 Blue dot + "Running" for active executions
- ⏸️ Gray dot + "Pending" for queued tasks
- ❌ Red dot + "Failed" for errors

**Code Viewers:**
- Syntax highlighting for JSON, YAML, TypeScript
- Line numbers
- Copy button
- Expand/collapse sections

**Workflow Visualization:**
- Directed graph with nodes and edges
- Animated flow during execution
- Color-coded by status
- Click nodes to see details

### Dark Mode Support
- Toggle in header
- Persist preference in localStorage
- Developer-friendly dark theme

---

## Technical Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router (for tab navigation)
- **State Management:** Zustand (lightweight, simple)
- **HTTP Client:** Native fetch with custom wrapper

### Visualization Libraries
- **Workflow DAG:** React Flow (workflow visualization)
- **Code Editor:** Monaco Editor (VS Code editor component)
- **Charts:** Recharts (scoring breakdown)
- **Icons:** Lucide React (consistent icon set)
- **Syntax Highlighting:** Prism.js or Shiki

### Real-time Updates
- **Polling:** Every 2 seconds during active execution
- **Future:** WebSocket for true real-time (Phase 2)

---

## Component Structure

```
web-ui/
├── src/
│   ├── App.tsx                      # Main app with tab navigation
│   ├── api/
│   │   ├── client.ts                # Fetch wrapper
│   │   ├── types.ts                 # API response types
│   │   └── endpoints.ts             # Endpoint definitions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # App header with title
│   │   │   ├── TabNavigation.tsx    # Tab switcher
│   │   │   └── Footer.tsx           # Version info
│   │   ├── system/
│   │   │   ├── ArchitectureDiagram.tsx
│   │   │   ├── ServiceStatus.tsx
│   │   │   └── StatsCards.tsx
│   │   ├── workflow/
│   │   │   ├── WorkflowSelector.tsx
│   │   │   ├── WorkflowDAG.tsx      # React Flow visualization
│   │   │   ├── ExecutionLog.tsx
│   │   │   └── ExecutionHistory.tsx
│   │   ├── pipeline/
│   │   │   ├── DataComparison.tsx   # 3-column view
│   │   │   ├── TransformationView.tsx
│   │   │   └── SchemaViewer.tsx
│   │   ├── results/
│   │   │   ├── OpportunitiesTable.tsx
│   │   │   ├── OpportunityCard.tsx
│   │   │   ├── ScoringBreakdown.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── artifacts/
│   │   │   ├── ArtifactBrowser.tsx
│   │   │   ├── ArtifactPreview.tsx  # Monaco Editor
│   │   │   └── ArtifactMetadata.tsx
│   │   └── shared/
│   │       ├── CodeViewer.tsx       # Syntax-highlighted code
│   │       ├── StatusBadge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorMessage.tsx
│   ├── pages/
│   │   ├── SystemOverview.tsx
│   │   ├── WorkflowExecution.tsx
│   │   ├── DataPipeline.tsx
│   │   ├── Results.tsx
│   │   └── Artifacts.tsx
│   ├── hooks/
│   │   ├── useWorkflowExecution.ts
│   │   ├── useArtifacts.ts
│   │   └── useSystemStatus.ts
│   └── store/
│       └── appStore.ts              # Zustand store
```

---

## Implementation Plan

### Phase 1: Foundation (Days 1-2)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tailwind CSS
- [ ] Create basic layout (Header, TabNavigation, Footer)
- [ ] Implement API client wrapper
- [ ] Create shared components (StatusBadge, CodeViewer, LoadingSpinner)

### Phase 2: Core Tabs (Days 3-5)
- [ ] **System Overview tab**
  - Service status cards
  - Architecture diagram (static first, then interactive)
  - Stats dashboard
- [ ] **Results tab** (easiest, use existing data)
  - Opportunities table
  - Scoring breakdown
  - Export functionality

### Phase 3: Advanced Features (Days 6-8)
- [ ] **Workflow Execution tab**
  - Workflow selector
  - React Flow DAG visualization
  - Execute button + real-time status
  - Execution history
- [ ] **Artifacts tab**
  - File browser
  - Monaco Editor preview
  - Download functionality

### Phase 4: Data Pipeline (Days 9-10)
- [ ] **Data Pipeline tab**
  - 3-column comparison view
  - Transformation highlighting
  - Schema viewer

### Phase 5: Polish (Days 11-12)
- [ ] Dark mode support
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation
- [ ] Demo script

---

## Success Criteria

**The UI successfully demonstrates:**
- ✅ All services are running and healthy
- ✅ Workflows can be executed manually
- ✅ Real-time execution status is visible
- ✅ Raw data from connectors is inspectable
- ✅ UDM transformation is transparent
- ✅ Results are actionable and well-presented
- ✅ The entire pipeline is understandable in 10 minutes

**Technical Requirements:**
- ✅ Loads in < 2 seconds
- ✅ Real-time updates during execution
- ✅ Works in Chrome, Firefox, Safari
- ✅ Responsive (desktop + tablet)
- ✅ No console errors
- ✅ Accessible (keyboard navigation, screen readers)

---

## Next Steps

1. **Review this strategy** with the team
2. **Update PRD** to reflect Platform Demo Console approach
3. **Implement backend API endpoints** (extend nichefinder-server)
4. **Build frontend** following the phased plan
5. **Create demo script** for presentation
6. **Record demo video** for async sharing


