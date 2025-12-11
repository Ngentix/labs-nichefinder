# UDM-Single Capabilities Analysis

**Purpose:** Definitive guide to what UDM-Single provides vs what we need to build for NicheFinder

**Date:** 2025-12-11  
**Status:** ✅ Verified by code inspection

---

## ✅ What UDM-Single Provides (Use As-Is)

### 1. Connector Generation & Deployment

**Crate:** `udm-connector-generator`

**What it does:**
- Takes a `TargetSystem` specification (API base URL, auth type, endpoints)
- Analyzes API schema automatically (discovers endpoints, entities, parameters)
- Generates `ConnectorConfig` with action mappings (API operations → business verbs)
- Converts to PEG-Connector-Service format (YAML/JSON)
- Deploys via HTTP POST to PEG-Connector-Service

**API Endpoints (PEG-Connector-Service on port 3000):**
```
POST   /api/v1/connectors                    - Register connector
POST   /api/v1/connectors/{id}/config        - Save YAML config
GET    /api/v1/connectors                    - List connectors
GET    /api/v1/connectors/{id}/status        - Check status
PUT    /api/v1/connectors/{id}               - Update connector
DELETE /api/v1/connectors/{id}               - Remove connector
```

**What we do:**
```rust
// In our connector-generator crate
use udm_connector_generator::{ConnectorGeneratorService, TargetSystem, SystemType, AuthType};

let generator = ConnectorGeneratorService::new(config).await?;
let result = generator.generate_connector(request).await?;
// ✅ Connector is now deployed and ready to use
```

**No modifications needed!**

---

### 2. Connector Execution

**Crate:** `udm-connectors`

**Built-in capabilities:**
```rust
pub struct ExecutionConfig {
    pub max_concurrent_executions: usize,     // ✅ Concurrency control
    pub default_timeout_seconds: u64,         // ✅ Timeout handling
    pub retry_attempts: u32,                  // ✅ Retry logic
    pub retry_delay_ms: u64,                  // ✅ Backoff delay
    pub enable_circuit_breaker: bool,         // ✅ Circuit breaker
    pub circuit_breaker_threshold: u32,       // ✅ Failure threshold
    pub enable_execution_cache: bool,         // ✅ Response caching
    pub cache_ttl_seconds: u64,               // ✅ Cache TTL
}
```

**What we do:**
```rust
// In our niche-analyzer crate
use udm_connectors::execution::{ConnectorExecutor, ExecutionConfig};

let config = ExecutionConfig {
    max_concurrent_executions: 10,
    default_timeout_seconds: 30,
    retry_attempts: 3,
    retry_delay_ms: 1000,
    enable_circuit_breaker: true,
    circuit_breaker_threshold: 5,
    enable_execution_cache: true,
    cache_ttl_seconds: 3600,  // 1 hour cache
};

let executor = ConnectorExecutor::new(config).await?;
// ✅ All retry, timeout, cache, circuit breaker logic is built-in
```

**No modifications needed!**

---

### 3. PEG Workflow Execution

**Crate:** `udm-peg`

**Built-in capabilities:**
- 8 node types: Action, Guard, Judgment, Move, Signal, Call, HumanTask, Reconcile
- Per-node retry policies
- Per-node timeouts
- Dependency management
- Workflow-level policies
- Built-in executor (no external service needed)

**What we do:**
```yaml
# workflows/home-assistant-analysis.yaml
id: "home-assistant-analysis"
version: "0.2.0"

nodes:
  - id: "fetch-github"
    node_type: "Action"
    config:
      connector: "github-api"
      endpoint: "search_issues"
      parameters:
        q: "repo:home-assistant/core label:integration"
    traits:
      timeout: 60
      retry:
        max_attempts: 3
        backoff_ms: 1000
        backoff_multiplier: 2.0
```

**No modifications needed!**

---

## ❌ What UDM-Single Does NOT Provide

### 1. API Rate Limit Tracking

**What UDM-Single has:**
- Concurrent execution limits (max 10 connectors running at once)
- Per-request timeout and retry

**What UDM-Single does NOT have:**
- Tracking of API usage across multiple workflow executions
- Enforcement of API rate limits (e.g., GitHub's 5000 req/hour)
- Rate limit header parsing and backoff

**What we need to build:**
```rust
// NEW CRATE: crates/rate-limiter
pub struct ApiRateLimiter {
    github_remaining: Arc<AtomicU32>,
    github_reset_at: Arc<Mutex<DateTime<Utc>>>,
}

impl ApiRateLimiter {
    pub async fn check_github(&self) -> Result<()> {
        // Check if we're within GitHub's 5000 req/hour limit
        // Parse X-RateLimit-Remaining header from responses
        // Wait if necessary
    }
}
```

---

### 2. Opportunity Scoring Algorithm

**What we need to build:**
```rust
// NEW CRATE: crates/scoring
pub fn calculate_opportunity_score(
    demand: &DemandSignals,
    supply: &SupplyAnalysis,
    trends: &TrendData,
) -> f64 {
    // Our business logic
    // Demand-supply gap calculation
    // Trend analysis
    // Market size estimation
}
```

---

### 3. CLI Application

**What we need to build:**
```rust
// NEW CRATE: crates/cli
cargo run -- analyze --niche home-assistant
```

---

### 4. Report Generation

**What we need to build:**
```rust
// NEW CRATE: crates/reporting
pub fn generate_report(opportunities: Vec<IntegrationOpportunity>) -> String {
    // Format as Markdown, JSON, HTML
    // Include source links
    // Include metrics
}
```

---

## 📦 Final Crate Structure

```
labs-nichefinder/
├── crates/
│   ├── connector-generator/     ✅ Uses udm-connector-generator (no mods)
│   ├── rate-limiter/            ❌ NEW - We build this
│   ├── scoring/                 ❌ NEW - We build this
│   ├── reporting/               ❌ NEW - We build this
│   └── cli/                     ❌ NEW - We build this
│
├── workflows/                   ✅ PEG YAML configs (no code)
│   └── home-assistant-analysis.yaml
│
└── deps/
    └── UDM-single/              ✅ Use as-is (no modifications)
```

---

## 🎯 Summary

**Use UDM-Single for:**
- ✅ Connector generation and deployment
- ✅ Connector execution (retry, timeout, cache, circuit breaker)
- ✅ PEG workflow orchestration
- ✅ Concurrent execution limits

**Build ourselves:**
- ❌ API rate limit tracking (GitHub, Reddit limits)
- ❌ Opportunity scoring algorithm
- ❌ CLI interface
- ❌ Report generation

**Total new code:** ~4 crates, ~1 workflow YAML file

