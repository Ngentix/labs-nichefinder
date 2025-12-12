# NicheFinder Phase 2 - UDM Normalization & Analysis

**Date:** 2025-12-12  
**Phase:** 2 - UDM Normalization & Data Analysis  
**Previous Phase:** ✅ Phase 1 Complete - Platform Validation  
**Workspace:** `/Users/jg/labs-nichefinder`

---

## 🎉 Phase 1 Achievements

### ✅ What We Proved

**"The platform works end-to-end without manual coding"**

1. **PEG v2.0 Connectors Created**
   - HACS Connector: Fetches Home Assistant custom integrations
   - GitHub Connector: Searches repositories with API key authentication
   - YouTube Connector: Searches videos with API key authentication

2. **End-to-End Workflow Execution**
   - Workflow ID: `87abf4be-2605-4b5f-9807-0e2aec3a3d89`
   - Execution ID: `109b25c7-e0ae-45eb-b346-cbc1f950ce10`
   - Status: COMPLETED
   - Duration: ~2.5 seconds
   - Steps: HACS → (GitHub + YouTube in parallel)

3. **Infrastructure Running**
   - **peg-engine** (Node.js): Port 3007 - Workflow orchestration with BullMQ
   - **credential-vault**: Port 3005 - AWS KMS-encrypted credential storage
   - **PEG-Connector-Service** (Rust): Port 9004 - Connector runtime
   - **PostgreSQL**: Port 5436 (peg-engine), Port 5433 (main project)
   - **Redis**: Port 5379 (peg-engine), Port 6380 (main project)
   - **ChromaDB**: Port 8000 - Vector database for embeddings

4. **Key Validations**
   - ✅ Declarative workflows (JSON with actors + steps)
   - ✅ Secure credential management (AWS KMS encryption)
   - ✅ Polyglot architecture (Node.js + Rust working together)
   - ✅ Automated orchestration (BullMQ job queue)
   - ✅ Parallel execution (GitHub + YouTube ran simultaneously)
   - ✅ Real data extraction (HACS, GitHub, YouTube APIs)

---

## 🎯 Phase 2 Goals

### Primary Objective
**Implement UDM normalization to transform raw API data into canonical schemas and generate actionable market intelligence reports**

### Specific Goals

1. **Setup UDM-single Service**
   - Configure and run UDM-single for data normalization
   - Connect to existing infrastructure (PostgreSQL, ChromaDB)

2. **Define Canonical Schemas**
   - Create UDM schemas for Home Assistant integration data
   - Define `IntegrationOpportunity` entity with scoring fields
   - Map HACS, GitHub, and YouTube data to unified model

3. **Transform Raw Data**
   - Extract workflow execution results from peg-engine
   - Apply UDM transformations to normalize data
   - Store normalized data in PostgreSQL/ChromaDB

4. **Implement Scoring Algorithm**
   - Calculate demand signals (GitHub stars, YouTube views, HACS downloads)
   - Analyze supply (existing integrations, quality metrics)
   - Compute opportunity scores using demand-supply gap

5. **Generate Reports**
   - Rank integration opportunities by score
   - Include quantitative metrics and source links
   - Export as JSON/Markdown for review

---

## 📁 Key Files from Phase 1

### Workflow Definition
- `workflows/home-assistant-analysis-peg-engine.json` - 3-step workflow (HACS, GitHub, YouTube)

### Connector Specifications
- `connectors/peg-v2-hacs.yaml` - HACS connector (no auth required)
- `connectors/peg-v2-github.yaml` - GitHub connector (API key auth)
- `connectors/peg-v2-youtube.yaml` - YouTube connector (API key auth)

### Configuration
- `deps/peg-engine/.env` - peg-engine configuration
- `deps/credential-vault/.env` - credential-vault with AWS credentials
- `.env` - Main project configuration with API keys

---

## 🔧 Infrastructure Status

### Running Services (Keep Running)
```bash
# Terminal 153: credential-vault (port 3005)
cd deps/credential-vault && pnpm dev

# Terminal 158: peg-engine (port 3007)
cd deps/peg-engine && npm run dev

# PEG-Connector-Service should be running on port 9004
```

### Databases
- PostgreSQL (5436): peg-engine workflows and executions
- PostgreSQL (5433): Main project data (ready for UDM)
- Redis (5379): peg-engine job queue
- Redis (6380): Main project cache
- ChromaDB (8000): Vector embeddings

---

## 📊 Sample Workflow Execution Data

**Execution ID:** `109b25c7-e0ae-45eb-b346-cbc1f950ce10`

To retrieve results:
```bash
curl -s http://localhost:3007/api/v1/executions/109b25c7-e0ae-45eb-b346-cbc1f950ce10 | jq .
```

**Expected Data Structure:**
- `jobs[0]` - HACS integrations list
- `jobs[1]` - GitHub repositories (home assistant integration search)
- `jobs[2]` - YouTube videos (home assistant search)

---

## 🎯 Phase 2 Implementation Plan

### Step 1: Extract Workflow Results
- Query peg-engine API for execution results
- Parse JSON responses from each connector
- Save raw data to files for inspection

### Step 2: Setup UDM-single
- Configure UDM-single service
- Define connection to PostgreSQL and ChromaDB
- Test basic normalization

### Step 3: Define Schemas
- Create `IntegrationOpportunity` schema
- Define fields: name, demand_score, supply_score, opportunity_score, sources
- Map HACS/GitHub/YouTube fields to canonical model

### Step 4: Implement Transformations
- Write UDM transformation rules
- Normalize HACS data (integration names, download counts)
- Normalize GitHub data (repo names, stars, issues)
- Normalize YouTube data (video titles, views, engagement)

### Step 5: Scoring Algorithm
- Calculate demand: GitHub stars + YouTube views + search volume
- Calculate supply: HACS downloads + repo maintenance status
- Compute gap: demand / supply ratio
- Rank opportunities

### Step 6: Generate Report
- Query normalized data from UDM
- Sort by opportunity_score
- Format as JSON and Markdown
- Include source links for verification

---

## 🚀 Next Steps

**Start Here:**
1. Retrieve workflow execution results from peg-engine
2. Inspect raw data structure from HACS, GitHub, YouTube
3. Design canonical schema for integration opportunities
4. Setup UDM-single service for normalization

**Success Criteria:**
- ✅ Raw data successfully extracted from peg-engine
- ✅ UDM-single running and connected to databases
- ✅ Canonical schema defined and validated
- ✅ Data normalized and stored in PostgreSQL
- ✅ Opportunity scores calculated
- ✅ Report generated with top 10 opportunities

---

**Ready to begin Phase 2!**

