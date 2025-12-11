# NicheFinder: Product Requirements Document

**Version:** 1.0 (Draft)  
**Date:** 2025-12-11  
**Status:** Planning / Refinement  
**Owner:** JG

---

## Executive Summary

**NicheFinder** is a comprehensive demonstration project that proves the end-to-end capabilities of the UDM + PEG + Connector ecosystem by solving a real business problem: identifying underserved local business niches.

### Primary Goals

1. **Prove Connector Generation**: Demonstrate auto-generation of PEG-Connector v2 configurations from real-world APIs
2. **Prove UDM Normalization**: Show data unification across heterogeneous sources (Yelp, Google Maps)
3. **Prove PEG Orchestration**: Demonstrate workflow automation using built-in PEG executor
4. **Deliver Business Value**: Create a potentially profitable tool that identifies market opportunities

---

## Problem Statement

**Business Problem:**  
Entrepreneurs and local business owners struggle to identify underserved niches in their local markets.

**Technical Problem:**  
We need to prove that the UDM + PEG + Connector ecosystem can:
- Auto-generate connectors from any API without manual coding
- Normalize data from multiple sources into a unified model
- Orchestrate complex multi-step workflows reliably
- Deliver actionable business intelligence

---

## Solution Overview

NicheFinder analyzes any US city to identify the top 20 underserved business niches by:

1. **Data Collection**: Fetch business data from Yelp and Google Maps via auto-generated connectors
2. **Normalization**: Use UDM to unify data into canonical Business entities
3. **Analysis**: Calculate demand (search volume) vs supply (business count) ratios
4. **Scoring**: Rank niches by opportunity score
5. **Output**: Generate actionable report with revenue estimates

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        NicheFinder CLI                          │
│                     (This Repository)                           │
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
```

---

## Project Setup

### Repository Structure

```
labs-nichefinder/
├── Cargo.toml                 # Workspace root
├── README.md                  # Project overview
├── PRD.md                     # This document
├── .gitmodules                # Git submodules
├── deps/
│   ├── UDM-single/           # Git submodule
│   └── PEG-Connector-Service/ # Git submodule
├── crates/
│   ├── niche-finder-cli/     # CLI application
│   ├── niche-analyzer/       # Analysis logic
│   └── niche-scorer/         # Scoring algorithm
├── workflows/
│   └── analyze_city.yaml     # PEG workflow definition
└── examples/
    └── analyze_austin.rs     # Example usage
```

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
    "crates/*",
]

[workspace.dependencies]
# Reference UDM crates from submodule
udm-core = { path = "deps/UDM-single/crates/udm-core" }
udm-peg = { path = "deps/UDM-single/crates/udm-peg" }
udm-connector-generator = { path = "deps/UDM-single/crates/udm-connector-generator" }
```

---

## Implementation Plan

### Week 1: Project Setup & Connector Generation

**Days 1-2: Repository Setup**
- [ ] Create GitHub repository: `labs-nichefinder`
- [ ] Set up Cargo workspace structure
- [ ] Add UDM-Single as git submodule
- [ ] Configure dependencies in Cargo.toml

**Days 3-4: Connector Generation**
- [ ] Implement connector generation script
- [ ] Generate Yelp connector
- [ ] Generate Google Maps connector
- [ ] Test connectors independently

**Day 5: Integration Testing**
- [ ] Verify connectors work
- [ ] Document setup process

---

### Week 2: UDM Integration & PEG Workflow

**Days 1-2: UDM Schema & Mapping**
- [ ] Define canonical Business schema
- [ ] Create Yelp → Business mapping
- [ ] Create Google Maps → Business mapping
- [ ] Test normalization

**Days 3-4: PEG Workflow**
- [ ] Define PEG v0.2 workflow
- [ ] Implement workflow execution
- [ ] Test end-to-end

---

### Week 3: Analysis, CLI, & Documentation

**Days 1-2: Analysis & Scoring**
- [ ] Implement scoring algorithm
- [ ] Generate sample reports

**Days 3-4: CLI Application**
- [ ] Build CLI
- [ ] Add output formats

**Day 5: Documentation**
- [ ] Write comprehensive README
- [ ] Create demo materials

---

## Success Criteria

### Technical Validation

| Criterion | Target |
|-----------|--------|
| **Connector Generation** | < 5 minutes |
| **Workflow Execution** | > 95% success rate |
| **Performance** | < 2 minutes per city |

### Business Validation

| Criterion | Target |
|-----------|--------|
| **Cost** | $0 (free tier) |
| **Accuracy** | > 70% |

---

## Next Steps

1. **Review & Refine PRD**
2. **Create GitHub Repository**
3. **Add Submodules**
4. **Start Week 1**

---

**For full details, see the complete PRD in the repository.**
