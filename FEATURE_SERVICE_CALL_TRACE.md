# Feature: Service Call Trace

**Purpose:** Prove that the NicheFinder platform uses the real end-to-end UDM + PEG + Connector ecosystem (not workarounds) by showing actual API calls between services in the UI.

**Status:** 🚧 Planned  
**Priority:** HIGH - Critical for demonstrating platform integrity  
**Timeline:** 1-2 days

---

## 🎯 Problem Statement

**Current Situation:**
- The system DOES use the full end-to-end flow: peg-engine → credential-vault → PEG-Connector-Service
- But there's NO visual proof in the UI that this is happening
- Stakeholders might assume we're using shortcuts or workarounds

**What We Need:**
- Visual proof that shows the ACTUAL API calls being made
- Real-time trace of service-to-service communication
- Request/response details for transparency

---

## 🏗️ Architecture

### Current Flow (What Actually Happens)
```
User → Frontend → Backend API → peg-engine
                                     ↓
                              credential-vault ← AWS KMS
                                     ↓
                              PEG-Connector-Service
                                     ↓
                              External APIs (GitHub, HACS, YouTube)
                                     ↓
                              Artifacts Storage
```

### What We'll Capture
Every HTTP call made during workflow execution:
1. `POST /api/workflows/{id}/execute` → peg-engine
2. `GET /connectors/credentials?userId=...&connectorId=hacs` → credential-vault
3. `POST /api/v2/connectors/hacs/actions/list_integrations` → PEG-Connector-Service
4. `GET /connectors/credentials?userId=...&connectorId=github` → credential-vault
5. `POST /api/v2/connectors/github/actions/search_repositories` → PEG-Connector-Service
6. etc.

---

## 📋 Requirements

### Backend Requirements

**1. Add HTTP Call Logging to peg-engine**
- Create middleware to intercept all outgoing HTTP calls
- Capture: method, URL, headers, body, timestamp, duration
- Store in execution context

**2. Create Trace Storage**
- Store trace data in PostgreSQL (execution_traces table)
- Schema:
  ```sql
  CREATE TABLE execution_traces (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL,
    step_id VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    service_from VARCHAR(100),
    service_to VARCHAR(100),
    method VARCHAR(10),
    url TEXT,
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_headers JSONB,
    response_body JSONB,
    duration_ms INTEGER,
    error TEXT
  );
  ```

**3. Create API Endpoint**
- `GET /executions/:id/trace` - Returns trace data for an execution
- Response format:
  ```json
  {
    "execution_id": "109b25c7-e0ae-45eb-b346-cbc1f950ce10",
    "traces": [
      {
        "id": 1,
        "timestamp": "2025-12-12T21:00:00Z",
        "step_id": "fetch_hacs",
        "service_from": "peg-engine",
        "service_to": "credential-vault",
        "method": "GET",
        "url": "http://localhost:3005/connectors/credentials?userId=demo&connectorId=hacs",
        "request_headers": {...},
        "response_status": 200,
        "response_body": {"credentials": {...}},
        "duration_ms": 3
      },
      ...
    ]
  }
  ```

### Frontend Requirements

**1. Add Service Call Trace Panel to Workflow Execution Tab**
- Display below the workflow DAG
- Show traces in chronological order
- Group by workflow step

**2. Trace Entry Component**
- Show service-to-service arrow (peg-engine → credential-vault)
- Display HTTP method and URL
- Show response status (✅ 200, ❌ 500)
- Display duration
- Expandable to show request/response details

**3. Real-time Updates**
- Poll `/executions/:id/trace` every 500ms during execution
- Update UI as new traces arrive
- Stop polling when execution completes

---

## 🎨 UI Design

### Service Call Trace Panel
```
┌─ Service Call Trace ──────────────────────────────────────┐
│                                                            │
│ Step 1: Fetch HACS Integrations                          │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ peg-engine → credential-vault                       ││
│ │    GET /connectors/credentials?userId=demo&...         ││
│ │    Status: 200 OK | Duration: 3ms                      ││
│ │    [Expand] ▼                                          ││
│ └────────────────────────────────────────────────────────┘│
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ peg-engine → PEG-Connector-Service                  ││
│ │    POST /api/v2/connectors/hacs/actions/list_integrations││
│ │    Status: 200 OK | Duration: 1,234ms                  ││
│ │    [Expand] ▼                                          ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ Step 2: Search GitHub Repos                              │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ peg-engine → credential-vault                       ││
│ │    GET /connectors/credentials?userId=demo&...         ││
│ │    Status: 200 OK | Duration: 2ms                      ││
│ └────────────────────────────────────────────────────────┘│
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ peg-engine → PEG-Connector-Service                  ││
│ │    POST /api/v2/connectors/github/actions/search_repositories││
│ │    Status: 200 OK | Duration: 2,145ms                  ││
│ └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Expanded Trace Entry
```
┌─ Trace Details ────────────────────────────────────────────┐
│ peg-engine → credential-vault                              │
│                                                            │
│ Request:                                                   │
│   GET /connectors/credentials                              │
│   Query: userId=demo&connectorId=hacs&environment=sandbox  │
│   Headers:                                                 │
│     Content-Type: application/json                         │
│                                                            │
│ Response:                                                  │
│   Status: 200 OK                                           │
│   Duration: 3ms                                            │
│   Body:                                                    │
│   {                                                        │
│     "credentials": {                                       │
│       "api_key": "***" (redacted)                          │
│     },                                                     │
│     "createdAt": "2025-12-12T20:00:00Z"                    │
│   }                                                        │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### Phase 1: Backend (peg-engine)
1. Create HTTP logging middleware
2. Add trace storage to PostgreSQL
3. Create `/executions/:id/trace` endpoint
4. Test with existing workflow execution

### Phase 2: Frontend
1. Create TraceEntry component
2. Create ServiceCallTrace panel
3. Add to Workflow Execution tab
4. Implement real-time polling
5. Test with live workflow execution

---

## ✅ Success Criteria

1. ✅ Every HTTP call during workflow execution is captured
2. ✅ Traces are visible in the UI in real-time
3. ✅ Request/response details are available on expand
4. ✅ Clearly shows: peg-engine → credential-vault → PEG-Connector-Service flow
5. ✅ Proves NO shortcuts or workarounds are being used

---

## 🔗 Related Documents

- `PHASE_3_HANDOFF.md` - Current project status
- `UI_STRATEGY.md` - Overall UI strategy
- `UI_IMPLEMENTATION_PLAN.md` - Implementation roadmap
- `deps/peg-engine/src/core/actors/connector/connector-actor.ts` - Where credential-vault is called

