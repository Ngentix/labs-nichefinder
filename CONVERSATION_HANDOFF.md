# NicheFinder Project - Conversation Handoff Document

**Date:** 2025-12-11  
**From Workspace:** `/Users/jg/UDM-single`  
**To Workspace:** `/Users/jg/labs-nichefinder`  
**Purpose:** Complete context transfer for continuing NicheFinder implementation

---

## 🎯 Project Overview

**NicheFinder** is a comprehensive demo of the UDM ecosystem that identifies underserved local business niches by:
1. **Auto-generating connectors** for Yelp and Google Maps APIs
2. **Orchestrating multi-step workflows** using nested PEGs (reusable components)
3. **Normalizing heterogeneous data** into UDM's canonical business model
4. **Producing actionable reports** on niche opportunities

**One-Paragraph Summary:**  
NicheFinder identifies underserved local business niches by automatically generating connectors for Yelp and Google Maps APIs, orchestrating multi-step data collection workflows using nested PEGs (reusable components for search, trend analysis, and saturation calculation), normalizing heterogeneous API responses into UDM's canonical business model, and producing actionable niche opportunity reports—demonstrating the complete UDM ecosystem end-to-end: **connector auto-generation → PEG workflow orchestration → semantic data normalization → business intelligence**, all running locally without requiring changes to the core UDM-Single or PEG-Connector-Service repositories.

---

## 📁 Repository Structure

### **labs-nichefinder** (New Demo Repo)
- **Location:** `/Users/jg/labs-nichefinder`
- **GitHub:** https://github.com/Ngentix/labs-nichefinder
- **Purpose:** Self-contained demo of UDM + PEG + Connector ecosystem
- **Key Files:**
  - `README.md` - Project overview, what we're demoing, what we're NOT demoing
  - `PRD.md` - Product Requirements Document
  - `Cargo.toml` - Workspace configuration with UDM-Single dependencies
  - `.gitmodules` - UDM-Single submodule configuration
  - `deps/UDM-single/` - Git submodule (full UDM-Single codebase)

### **UDM-Single** (Main System)
- **Location:** `/Users/jg/UDM-single` (also at `/Users/jg/labs-nichefinder/deps/UDM-single`)
- **GitHub:** https://github.com/Ngentix/UDM-single
- **Branch:** `chore/update-cargo-lock` (pending PR)
- **Purpose:** Universal Data Model system with PEG execution and connector generation

### **PEG-Connector-Service** (Separate Service)
- **GitHub:** https://github.com/Ngentix/PEG-Connector-Service
- **Purpose:** Standalone service that hosts and executes generated connectors
- **NOT a submodule** - runs as separate process, accessed via HTTP API
- **Default Port:** 8080

---

## 🏗️ Architecture Decisions

### **Critical Insight: PEG-Connector-Service is NOT Needed as Submodule**

**What We Learned:**
- The `udm-connector-generator` crate (in UDM-Single) generates v2 connectors
- It deploys connectors to PEG-Connector-Service via **HTTP API only**
- We only need the **running service**, not the source code
- Connectors are stored in PEG-Connector-Service's `./connectors` directory (runtime, not tracked by git)

**Deployment Flow:**
```
labs-nichefinder code
  ↓ uses
udm-connector-generator (from UDM-Single submodule)
  ↓ HTTP POST
PEG-Connector-Service (running on localhost:8080)
  ↓ stores in
./connectors/{system_id}.yaml (runtime directory)
```

**API Endpoints Used:**
- `POST /api/v1/connectors/{system_id}/config` - Save YAML config
- `POST /api/v1/connectors` - Register connector
- `GET /api/v1/connectors/{system_id}` - Check status

---

## 🔑 Key Technical Concepts

### **1. UDM (Universal Data Model)**
- Rust-based enterprise data translation system
- Normalizes data from different sources into canonical format
- AI-powered semantic mapping and entity extraction
- Self-healing capabilities for API changes

### **2. PEG (Process Execution Graphs)**
- Workflow-as-code with YAML/JSON definitions
- **8 Node Types in v0.2:**
  1. **Action** - Execute operations
  2. **Guard** - Validation/precondition checks
  3. **Judgment** - Decision-making nodes
  4. **Move** - Data transformation/movement
  5. **Signal** - Event emission/notification
  6. **Call** - Invoke sub-workflows (nested PEGs)
  7. **HumanTask** - Human-in-the-loop approval
  8. **Reconcile** - Data consistency verification

### **3. Nested PEGs**
- Use **Call node type** to invoke sub-workflows
- Configuration: `subgraph_id` and `subgraph_version`
- Benefits: Modularity, reusability, versioning, testing isolation
- **For NicheFinder:** Compose reusable workflows for search, trend analysis, saturation calculation

### **4. Workflow Dependencies**
- Executor maintains `completed_steps` list
- `get_ready_steps()` checks ALL dependencies are completed before executing
- Each step is `await`ed, blocking until API response returns
- Supports sequential, parallel, and conditional execution

### **5. Human-in-the-Loop (HITL)**
- **HumanTask node type** for approval/review steps
- Workflow state becomes `Paused` waiting for external input
- External systems call `resume_workflow()` to continue
- **Limitation:** In-memory only - workflows lost on restart (database persistence planned but not implemented)

---

## 📋 What We're Demoing

### **Services:**
- UDM Connector Generator
- PEG-Connector-Service (running locally)
- Built-in PEG Executor (udm-peg crate)
- UDM Normalization Engine

### **Processes:**
- Connector generation from API specifications
- Connector deployment to local service
- Nested PEG workflow orchestration
- Multi-step data collection workflows
- Data normalization across heterogeneous sources
- Business intelligence report generation

---

## ❌ What We're NOT Demoing

- External Auth Service
- PEG Executor Service (using built-in executor instead)
- Multi-Tenancy (connector deployment doesn't implement tenant_id yet)
- Database Persistence (workflows are in-memory only)
- Production Deployment
- Human-in-the-Loop workflows
- Context Service
- Foreman AI Service

---

## 📝 Current Status

### **Completed:**
- ✅ labs-nichefinder repository created
- ✅ UDM-Single added as git submodule
- ✅ Cargo.toml workspace configured
- ✅ README.md updated with scope and demo details
- ✅ PRD.md created
- ✅ Architecture research completed
- ✅ V2 connector generation process understood

### **Pending in UDM-Single:**
- ⏳ PR for Cargo.lock update: https://github.com/Ngentix/UDM-single/pull/new/chore/update-cargo-lock
- Branch: `chore/update-cargo-lock`
- Commit: `f8272fd`

### **Next Steps (Week 1 Implementation):**
- **Days 3-4:** Implement connector generation script
  - Generate Yelp connector with multi-step workflow
  - Generate Google Maps connector with multi-step workflow
  - Deploy to local PEG-Connector-Service
  - Test connectors independently
- **Day 5:** Integration testing and documentation


---

## 🔧 Setup Instructions for New Workspace

### **Prerequisites:**

1. **PEG-Connector-Service running locally:**
   ```bash
   cd ~/PEG-Connector-Service
   cargo run --bin peg-connector
   # Runs on http://localhost:8080
   ```

2. **Workspace dependencies available via submodule:**
   ```bash
   cd /Users/jg/labs-nichefinder
   git submodule update --init --recursive
   ```

### **Workspace Configuration:**

The Cargo.toml workspace is already configured with dependencies from UDM-Single submodule:

```toml
[workspace.dependencies]
udm-core = { path = "deps/UDM-single/crates/udm-core" }
udm-peg = { path = "deps/UDM-single/crates/udm-peg" }
udm-connector-generator = { path = "deps/UDM-single/crates/udm-connector-generator" }
```

### **Codebase Visibility:**

The new workspace has full access to:
- ✅ **UDM-Single crates** via submodule at `deps/UDM-single/`
- ✅ **udm-connector-generator** for generating v2 connectors
- ✅ **udm-peg** for workflow execution
- ✅ **udm-core** for data normalization
- ❌ **PEG-Connector-Service source** - NOT needed (only running service required)

---

## 💡 Key Insights from Conversation

### **1. V2 Connector Generation Process**

To generate a v2 connector, you need:

```rust
use udm_connector_generator::*;

// Step 1: Configure generator
let config = GeneratorConfig {
    peg_connector_service_url: "http://localhost:8080/api/v1".to_string(),
    auto_deploy: true,  // Deploy automatically to running service
    output_dir: "./connectors".to_string(),
    ..Default::default()
};

// Step 2: Create generator service
let generator = ConnectorGeneratorService::new(config).await?;

// Step 3: Define target system
let request = GenerateConnectorRequest {
    target_system: TargetSystem {
        system_id: "yelp".to_string(),
        system_name: "Yelp Fusion API".to_string(),
        base_url: "https://api.yelp.com/v3".to_string(),
        system_type: SystemType::RestApi {
            api_version: Some("v3".to_string()),
            openapi_url: None,
        },
        auth_config: Some(AuthConfig {
            auth_type: AuthType::BearerToken,
            credentials: {
                let mut creds = HashMap::new();
                creds.insert("api_key".to_string(), json!("YOUR_API_KEY"));
                creds
            },
        }),
        metadata: HashMap::new(),
    },
    options: GenerationOptions {
        include_schema: true,
        include_relationships: true,
        auto_deploy: true,  // Deploys to running PEG-Connector-Service
        output_format: ConfigFormat::Yaml,
        ..Default::default()
    },
    tenant_id: None,
};

// Step 4: Generate and deploy
let result = generator.generate_connector(request).await?;
println!("✅ Connector deployed: {}", result.deployment_result.deployment_url);
```

**What happens internally:**
1. Generator calls UDM discovery service to analyze API
2. Detects schema (entities, endpoints, relationships)
3. Generates `ConnectorConfig` with action mappings
4. Converts to PEG YAML format
5. HTTP POST to PEG-Connector-Service to save and register

### **2. Nested PEG Workflow Example**

For NicheFinder, you'll create workflows like:

```yaml
# Main workflow: niche_finder.yaml
id: "niche_finder"
version: "0.2.0"
name: "NicheFinder Analysis"
nodes:
  - id: "search_yelp"
    node_type: "Call"
    config:
      subgraph_id: "yelp_search"
      subgraph_version: "1.0.0"
  
  - id: "search_google_maps"
    node_type: "Call"
    config:
      subgraph_id: "google_maps_search"
      subgraph_version: "1.0.0"
  
  - id: "calculate_saturation"
    node_type: "Call"
    dependencies: ["search_yelp", "search_google_maps"]
    config:
      subgraph_id: "saturation_calculator"
      subgraph_version: "1.0.0"
  
  - id: "generate_report"
    node_type: "Action"
    dependencies: ["calculate_saturation"]
    config:
      verb: "Generate"
      entity: "NicheReport"
```

### **3. Workflow Dependency Execution**

The built-in PEG executor handles dependencies automatically:

```rust
// From crates/udm-peg/src/orchestrator.rs
async fn get_ready_steps<'a>(
    &self,
    workflow: &Workflow,
    definition: &'a WorkflowDefinition,
) -> Vec<&'a WorkflowStep> {
    let completed_set: HashSet<&String> = workflow.completed_steps.iter().collect();
    
    definition.steps.iter()
        .filter(|step| {
            // Step is not already completed or failed
            !workflow.completed_steps.contains(&step.id) && 
            !workflow.failed_steps.contains(&step.id) &&
            // ALL dependencies are completed
            step.depends_on.iter().all(|dep| completed_set.contains(dep))
        })
        .collect()
}
```

**Key points:**
- Executor maintains `completed_steps` list
- Only executes steps when ALL dependencies are in `completed_steps`
- Each step is `await`ed, blocking until API response returns
- Supports parallel execution of independent steps

---

## 📚 Important Files Reference

### **In UDM-Single (via submodule):**

1. **crates/udm-connector-generator/src/lib.rs**
   - Main connector generation service
   - `GenerateConnectorRequest`, `TargetSystem`, `GenerationOptions`

2. **crates/udm-connector-generator/src/deployment.rs**
   - `PegDeploymentClient` - deploys to PEG-Connector-Service
   - HTTP API calls for config save and registration

3. **crates/udm-peg/src/orchestrator.rs**
   - Workflow execution engine
   - `get_ready_steps()` - dependency resolution
   - `execute_workflow()` - main execution loop

4. **crates/peg-core/src/v2_types.rs**
   - PEG v0.2 type definitions
   - All 8 node types (Action, Guard, Judgment, Move, Signal, Call, HumanTask, Reconcile)

5. **examples/v2_comprehensive_demo.rs**
   - Complete demo of all PEG v0.2 features
   - Examples of all node types including Call (nested PEGs)

### **In labs-nichefinder:**

1. **README.md** - Project overview and scope
2. **PRD.md** - Product requirements document
3. **Cargo.toml** - Workspace configuration
4. **CONVERSATION_HANDOFF.md** - This document

---

## 🎬 Conversation Evolution Summary

### **Phase 1: Initial Exploration**
- User wanted to understand what could be built with UDM
- Explored lead generation automation as demo

### **Phase 2: Business Model Discussion**
- Discussed lead scraping and selling
- User expressed skepticism about traditional lead sources

### **Phase 3: Passive Income Pivot**
- User revealed true goal: building passive income machine
- Explored what truly passive income machines could be built

### **Phase 4: NicheFinder Breakthrough**
- User had insight about finding underserved local business niches
- Tool that influencers talk about but seems like too much work
- Could accurately find underserved niches and build directories

### **Phase 5: Cost Analysis**
- Detailed breakdown of FREE, CHEAP, and PREMIUM approaches
- Bootstrap strategy starting at $0 using Yelp API + Google Trends

### **Phase 6: Ecosystem Demo Realization**
- User clarified: Real goal is to prove out entire UDM + PEG + Connector ecosystem
- NicheFinder should demonstrate full system capabilities end-to-end
- Not just a quick MVP, but comprehensive ecosystem demo

### **Phase 7: Repository Organization**
- Created separate `labs-nichefinder` repository with `labs-` prefix
- PRD created and refined
- Clarified: NicheFinder docs belong in new repo, not UDM-single

### **Phase 8: Architecture Clarification**
- Researched connector config storage (PEG-Connector-Service, not context service)
- Clarified multi-tenancy limitations (tenant_id not implemented in deployment)
- Understood self-contained demo architecture (no code changes to UDM-Single or PEG-Connector-Service)

### **Phase 9: Procedural Workflows**
- Learned how multi-step workflows work with dependencies
- Understood variable substitution and data flow between steps
- Explored dependency enforcement mechanism

### **Phase 10: HITL and Nested PEGs**
- Learned about Human-in-the-Loop workflows (HumanTask node type)
- Understood workflow persistence limitations (in-memory only)
- Explored nested PEGs using Call node type

### **Phase 11: README Updates**
- Added comprehensive scope documentation
- Listed services and processes being demoed
- Listed what we're NOT demoing (out of scope)

### **Phase 12: Workspace Transition**
- User requested conversation capture for workspace switch
- Researched v2 connector generation requirements
- **Critical discovery:** PEG-Connector-Service NOT needed as submodule
- Only need running service, not source code

---

## ✅ Ready to Continue

You now have:
1. ✅ Complete context of the conversation
2. ✅ Understanding of architecture and technical decisions
3. ✅ Clear next steps for implementation
4. ✅ All necessary dependencies via UDM-Single submodule
5. ✅ Knowledge of how to generate v2 connectors
6. ✅ Understanding of nested PEG workflows

**Next action:** Switch to `/Users/jg/labs-nichefinder` workspace and begin implementing connector generation script for Yelp and Google Maps APIs.

---

**End of Handoff Document**
