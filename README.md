# labs-nichefinder

**NicheFinder** - Identify underserved local business niches using AI-powered data analysis.

> **Status:** 🧪 Experimental Ngentix Labs Project  
> **Purpose:** Demonstrate UDM + PEG + Connector ecosystem capabilities end-to-end

---

## What Is This?

**NicheFinder** identifies underserved local business niches by automatically generating connectors for Yelp and Google Maps APIs, orchestrating multi-step data collection workflows using nested PEGs (reusable components for search, trend analysis, and saturation calculation), normalizing heterogeneous API responses into UDM's canonical business model, and producing actionable niche opportunity reports—demonstrating the complete UDM ecosystem end-to-end: **connector auto-generation → PEG workflow orchestration → semantic data normalization → business intelligence**, all running locally without requiring changes to the core UDM-Single or PEG-Connector-Service repositories.

---

## 🎯 What We're Demoing

### **Services**
- ✅ **UDM Connector Generator** - Auto-generates v2 connector configs from API specs
- ✅ **PEG-Connector-Service** - Hosts and executes generated connectors (runs locally from UDM-Single submodule)
- ✅ **Built-in PEG Executor** - Orchestrates workflows using `udm-peg` crate (no external service needed)
- ✅ **UDM Normalization Engine** - Translates API responses to canonical business entities

### **Processes**
- ✅ **Connector Generation** - Auto-generate Yelp & Google Maps connectors (no manual coding)
- ✅ **Connector Deployment** - Deploy configs to local PEG-Connector-Service via HTTP API
- ✅ **Nested PEG Workflows** - Compose reusable workflow components (search → analyze → score)
- ✅ **Multi-Step Orchestration** - Sequential data collection with dependency tracking
- ✅ **Data Normalization** - Map Yelp/Google data to UDM canonical schema (Business, Location, Review entities)
- ✅ **Business Intelligence** - Calculate market saturation and opportunity scores

### **What We're NOT Demoing** ❌
- ❌ **External Auth Service** - Using simple API keys, not OAuth/SSO
- ❌ **PEG Executor Service** - Using built-in executor from `udm-peg` crate instead
- ❌ **Multi-Tenancy** - Single-tenant demo (no tenant isolation)
- ❌ **Database Persistence** - In-memory workflow state only (no PostgreSQL/Redis)
- ❌ **Production Deployment** - Local development setup only (no Docker/K8s)
- ❌ **Human-in-the-Loop** - Fully automated workflows (no approval steps)
- ❌ **Context Service** - Not using external context/memory service
- ❌ **Foreman AI Service** - Not using AI intent classification

---

## 💡 What It Proves

1. ✅ **Connector Generation** - Auto-generate production-ready connectors from any API
2. ✅ **UDM Normalization** - Unify heterogeneous data into canonical business schema
3. ✅ **PEG Orchestration** - Automate complex multi-step workflows with nested composition
4. ✅ **Self-Contained Demo** - Entire ecosystem runs locally without external dependencies
5. ✅ **Business Value** - Deliver actionable insights (top 20 underserved niches)

---

## Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/Ngentix/labs-nichefinder.git
cd labs-nichefinder

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Build
cargo build

# Run
cargo run -- analyze "Austin, TX"
```

---

## Documentation

- **[Product Requirements Document](PRD.md)** - Comprehensive project plan
- **[Quick Reference](SUMMARY.md)** - TL;DR version

---

## Development Status

### Week 1: Connector Generation ⏳
- [ ] Set up repository structure
- [ ] Add UDM-Single as submodule
- [ ] Generate Yelp connector
- [ ] Generate Google Maps connector

### Week 2: Workflow & Normalization 📋
- [ ] Define PEG workflow
- [ ] Implement UDM normalization

### Week 3: Analysis & CLI 📋
- [ ] Build scoring algorithm
- [ ] Create CLI application

---

**Built with ❤️ to prove the UDM ecosystem works end-to-end**
