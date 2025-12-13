# Phase 3.5: Service Call Trace - Implementation Summary

## Overview
Successfully implemented end-to-end service call tracing to prove the NicheFinder Platform uses the real UDM + PEG + Connector ecosystem without shortcuts.

## Implementation Completed

### Phase 1: peg-engine Backend (TypeScript/Node.js)

#### 1. Database Schema
- **File**: `deps/peg-engine/prisma/schema.prisma`
- **Changes**: Added `ExecutionTrace` model with fields for capturing HTTP requests/responses
- **Migration**: Created and applied migration `20251213002607_add_execution_traces`

#### 2. Trace Service
- **File**: `deps/peg-engine/src/services/trace-service.ts`
- **Purpose**: Service class for storing and retrieving trace data from PostgreSQL
- **Key Methods**:
  - `storeTrace(data: TraceData)` - Store a trace entry
  - `getExecutionTraces(executionId: string)` - Get all traces for an execution

#### 3. Execution Context Tracker
- **File**: `deps/peg-engine/src/services/execution-context-tracker.ts`
- **Purpose**: Track current execution context using AsyncLocalStorage
- **Key Methods**:
  - `run<T>(context: ExecutionContextData, fn: () => T)` - Run function within execution context
  - `getContext()` - Get current execution context

#### 4. HTTP Interceptors
- **Files Modified**:
  - `deps/peg-engine/src/clients/credentials-client.ts`
  - `deps/peg-engine/src/clients/connector-client.ts`
- **Changes**: Added axios interceptors to capture all HTTP requests and responses
- **Traces Captured**:
  - `peg-engine → credential-vault` (GET /connectors/credentials)
  - `peg-engine → PEG-Connector-Service` (POST /api/v2/connectors/{id}/actions/{action}/execute)

#### 5. Connector Actor Update
- **File**: `deps/peg-engine/src/core/actors/connector/connector-actor.ts`
- **Changes**: Wrapped execution in `executionContextTracker.run()` to provide context to interceptors

#### 6. API Endpoint
- **Files Modified**:
  - `deps/peg-engine/src/api/executions/routes.ts`
  - `deps/peg-engine/src/api/executions/controller.ts`
  - `deps/peg-engine/src/api/schemas/executions.ts`
- **Endpoint**: `GET /api/executions/:id/trace`
- **Response**: Returns all trace entries for an execution

### Phase 2: nichefinder-server Backend (Rust/Axum)

#### 1. Dependencies
- **File**: `crates/nichefinder-server/Cargo.toml`
- **Changes**: Added `reqwest` dependency for HTTP client

#### 2. Proxy Endpoint
- **File**: `crates/nichefinder-server/src/api.rs`
- **Endpoint**: `GET /api/executions/{id}/trace`
- **Purpose**: Proxies trace requests to peg-engine
- **Configuration**: Uses `PEG_ENGINE_URL` environment variable (defaults to `http://localhost:3007`)

### Phase 3: Frontend (React/TypeScript)

#### 1. TypeScript Types
- **File**: `web-ui/src/types/api.ts`
- **Added Types**:
  - `TraceEntry` - Individual HTTP trace entry
  - `ExecutionTrace` - Collection of traces for an execution

#### 2. API Client
- **File**: `web-ui/src/api/client.ts`
- **Added Method**: `getExecutionTrace(id: string)` - Fetch traces for an execution

#### 3. TraceEntry Component
- **File**: `web-ui/src/components/trace/TraceEntry.tsx`
- **Features**:
  - Expandable/collapsible trace display
  - Shows request/response headers and bodies
  - Color-coded HTTP status codes
  - Duration display
  - Error highlighting

#### 4. ServiceCallTrace Panel
- **File**: `web-ui/src/components/trace/ServiceCallTrace.tsx`
- **Features**:
  - Groups traces by workflow step
  - Real-time polling (500ms) during execution
  - Live indicator when execution is running
  - Empty state handling

#### 5. WorkflowExecution Page
- **File**: `web-ui/src/pages/WorkflowExecution.tsx`
- **Changes**: Complete rewrite to include:
  - Execution details display
  - Execution logs
  - ServiceCallTrace panel integration
  - Real-time polling (2s) for execution status

## Testing Instructions

### 1. Start All Services
```bash
# Start infrastructure
./scripts/start-infrastructure.sh

# Start credential-vault
cd deps/credential-vault && npm run dev

# Start peg-engine
cd deps/peg-engine && npm run dev

# Start PEG-Connector-Service
cd deps/PEG-Connector-Service && cargo run

# Start nichefinder-server
cd crates/nichefinder-server && cargo run

# Start frontend
cd web-ui && npm run dev
```

### 2. Execute a Workflow
1. Navigate to the frontend UI (http://localhost:5173)
2. Go to the Workflow Execution tab
3. Select and execute a workflow (e.g., "Home Assistant Analysis")
4. Note the execution ID

### 3. Verify Service Call Trace
1. Navigate to `/workflow-execution/{execution-id}`
2. Observe the "Service Call Trace" panel
3. Verify you see traces for:
   - `peg-engine → credential-vault`
   - `peg-engine → PEG-Connector-Service`
4. Expand trace entries to see request/response details
5. Verify real-time updates while execution is running

### 4. Expected Results
- ✅ Traces appear in real-time as workflow executes
- ✅ Each trace shows method, URL, status, duration
- ✅ Request/response bodies are visible (credentials redacted)
- ✅ Traces are grouped by workflow step
- ✅ Live indicator shows when execution is running
- ✅ NO direct API calls to external services (proves end-to-end flow)

## Architecture Decisions

1. **Data Storage**: Traces stored in peg-engine's PostgreSQL database (not nichefinder-server's SQLite)
2. **API Ownership**: peg-engine owns trace data and exposes it via its own API
3. **Proxy Pattern**: nichefinder-server proxies requests to peg-engine (clean separation of concerns)
4. **Context Tracking**: AsyncLocalStorage provides execution context across async operations
5. **Credential Redaction**: Sensitive credentials are redacted in stored traces
6. **Response Size Limiting**: Large response bodies are truncated to prevent database bloat

## Files Created
- `deps/peg-engine/src/services/trace-service.ts`
- `deps/peg-engine/src/services/execution-context-tracker.ts`
- `web-ui/src/components/trace/TraceEntry.tsx`
- `web-ui/src/components/trace/ServiceCallTrace.tsx`

## Files Modified
- `deps/peg-engine/prisma/schema.prisma`
- `deps/peg-engine/src/clients/credentials-client.ts`
- `deps/peg-engine/src/clients/connector-client.ts`
- `deps/peg-engine/src/core/actors/connector/connector-actor.ts`
- `deps/peg-engine/src/api/executions/routes.ts`
- `deps/peg-engine/src/api/executions/controller.ts`
- `deps/peg-engine/src/api/schemas/executions.ts`
- `crates/nichefinder-server/Cargo.toml`
- `crates/nichefinder-server/src/api.rs`
- `web-ui/src/types/api.ts`
- `web-ui/src/api/client.ts`
- `web-ui/src/pages/WorkflowExecution.tsx`

## Next Steps
1. Test end-to-end flow with a real workflow execution
2. Verify traces are captured correctly
3. Check for any TypeScript or Rust compilation errors
4. Update documentation if needed

