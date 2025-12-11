# labs-nichefinder

**NicheFinder** - Identify underserved local business niches using AI-powered data analysis.

> **Status:** 🧪 Experimental Ngentix Labs Project  
> **Purpose:** Demonstrate UDM + PEG + Connector ecosystem capabilities end-to-end

---

## What Is This?

NicheFinder is a comprehensive demonstration project that proves the UDM + PEG + Connector ecosystem works end-to-end by solving a real business problem: finding underserved local business niches.

### What It Proves

1. ✅ **Connector Generation** - Auto-generate Yelp & Google Maps connectors (no manual coding)
2. ✅ **UDM Normalization** - Unify data from multiple sources into canonical schema
3. ✅ **PEG Orchestration** - Automate complex workflows with built-in executor
4. ✅ **Business Value** - Deliver actionable insights (top 20 underserved niches)

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
