# NicheFinder Platform Demo Console UI

A React + TypeScript web interface for demonstrating the end-to-end UDM + PEG + Connector ecosystem.

## Overview

This is a **Platform Demo Console** (not a business dashboard) designed to showcase the complete NicheFinder architecture to technical stakeholders.

### The 5 Core Tabs

1. **🏗️ System Overview** - Architecture diagram and service health
2. **⚡ Workflow Execution** - Trigger workflows and watch real-time execution  
3. **🔄 Data Pipeline** - Show raw → normalized → analyzed transformation
4. **📊 Results** - Display opportunities with scoring
5. **📦 Artifacts** - Browse and inspect raw data files

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:5173/`

## Development Status

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS configuration  
- [x] Layout components (Header, TabNavigation, Footer)
- [x] API client wrapper
- [x] Shared components (StatusBadge, CodeViewer, LoadingSpinner, ErrorMessage)
- [x] Basic routing and page structure

### 🚧 Next: Phase 2 - Backend API Extensions

See `UI_IMPLEMENTATION_PLAN.md` for the complete roadmap.
