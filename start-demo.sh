#!/bin/bash

# NicheFinder Platform Demo - Startup Script
# Starts the COMPLETE end-to-end UDM + PEG + Connector ecosystem
# This is the REAL system - no shortcuts or workarounds!

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting NicheFinder Platform Demo (Full Stack)"
echo "   This starts the COMPLETE end-to-end system:"
echo "   - Infrastructure (PostgreSQL, Redis, ChromaDB)"
echo "   - credential-vault (secure credential storage)"
echo "   - peg-engine (workflow orchestration)"
echo "   - PEG-Connector-Service (connector runtime)"
echo "   - nichefinder-server (REST API)"
echo "   - web-ui (React frontend)"
echo ""

# Create logs directory
mkdir -p logs

# Function to check if port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to start a service
start_service() {
    local name=$1
    local port=$2
    local command=$3
    local log_file=$4
    local pid_file=$5

    if check_port $port; then
        echo -e "${YELLOW}⚠️  $name already running on port $port${NC}"
    else
        echo -e "${BLUE}🔧 Starting $name (port $port)...${NC}"
        eval "$command > logs/$log_file 2>&1 &"
        local pid=$!
        echo "$pid" > $pid_file
        echo "   PID: $pid"
    fi
}

# Check for required .env files
echo -e "${BLUE}Checking configuration...${NC}"
if [ ! -f deps/credential-vault/.env ]; then
    echo -e "${RED}❌ ERROR: deps/credential-vault/.env not found${NC}"
    echo "   credential-vault requires AWS credentials for KMS encryption"
    echo "   Copy deps/credential-vault/config/env.example to deps/credential-vault/.env"
    echo "   and configure AWS_REGION, KMS_KEY_ALIAS, DATABASE_URL"
    exit 1
fi

if [ ! -f deps/peg-engine/.env ]; then
    echo -e "${RED}❌ ERROR: deps/peg-engine/.env not found${NC}"
    echo "   peg-engine requires database configuration"
    echo "   Create deps/peg-engine/.env with DATABASE_URL and REDIS_URL"
    exit 1
fi

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "   API keys will need to be stored in credential-vault"
fi
echo ""

# ============================================
# PHASE 1: Start Infrastructure (Docker)
# ============================================
echo -e "${GREEN}=== Phase 1: Infrastructure Services ===${NC}"
echo "Starting PostgreSQL, Redis, ChromaDB via Docker..."
echo ""

cd deps/peg-engine
if docker compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Docker services already running${NC}"
else
    docker compose up -d
    echo "Waiting for infrastructure to be ready..."
    sleep 10
fi
cd ../..

echo -e "${GREEN}✅ Infrastructure ready${NC}"
echo "   PostgreSQL: localhost:5436 (peg-engine), localhost:5433 (UDM)"
echo "   Redis: localhost:5379 (peg-engine), localhost:6380 (UDM)"
echo "   ChromaDB: localhost:8000"
echo ""

# ============================================
# PHASE 2: Start credential-vault
# ============================================
echo -e "${GREEN}=== Phase 2: Credential Vault ===${NC}"
echo "Secure credential storage with AWS KMS encryption"
echo "This is where API keys are securely stored and retrieved"
echo ""

cd deps/credential-vault
start_service \
    "credential-vault" \
    3005 \
    "pnpm dev" \
    "vault.log" \
    "../../.vault.pid"
cd ../..

echo "Waiting for credential-vault to be ready..."
sleep 5

if check_port 3005; then
    echo -e "${GREEN}✅ credential-vault ready${NC}"
else
    echo -e "${YELLOW}⏳ credential-vault still starting (check logs/vault.log)${NC}"
fi
echo ""

# ============================================
# PHASE 3: Start peg-engine
# ============================================
echo -e "${GREEN}=== Phase 3: PEG Engine ===${NC}"
echo "Workflow orchestration with BullMQ job queue"
echo "This orchestrates the entire workflow execution"
echo ""

cd deps/peg-engine
start_service \
    "peg-engine" \
    3007 \
    "npm run dev" \
    "peg-engine.log" \
    "../../.peg-engine.pid"
cd ../..

echo "Waiting for peg-engine to be ready..."
sleep 5

if check_port 3007; then
    echo -e "${GREEN}✅ peg-engine ready${NC}"
else
    echo -e "${YELLOW}⏳ peg-engine still starting (check logs/peg-engine.log)${NC}"
fi
echo ""

# ============================================
# PHASE 4: Start PEG Connector Service
# ============================================
echo -e "${GREEN}=== Phase 4: PEG Connector Service ===${NC}"
echo "Hosts all connectors (GitHub, HACS, YouTube, etc.)"
echo ""

cd deps/PEG-Connector-Service
start_service \
    "PEG-Connector-Service" \
    9004 \
    "cargo run --release --bin peg-connector-service -- --config config.yaml" \
    "connector.log" \
    "../../.connector.pid"
cd ../..

echo "Waiting for connector service to be ready..."
sleep 5

if check_port 9004; then
    echo -e "${GREEN}✅ PEG-Connector-Service ready${NC}"
else
    echo -e "${YELLOW}⏳ PEG-Connector-Service still starting (check logs/connector.log)${NC}"
fi
echo ""

# ============================================
# PHASE 5: Start Backend API Server
# ============================================
echo -e "${GREEN}=== Phase 5: Backend API Server ===${NC}"
echo "REST API for the web UI"
echo ""

start_service \
    "NicheFinder Backend" \
    3001 \
    "cd crates/nichefinder-server && cargo run --release" \
    "backend.log" \
    ".backend.pid"

echo "Waiting for backend to be ready..."
sleep 3

if check_port 3001; then
    echo -e "${GREEN}✅ Backend API ready${NC}"
else
    echo -e "${YELLOW}⏳ Backend still starting (check logs/backend.log)${NC}"
fi
echo ""

# ============================================
# PHASE 6: Start Frontend UI
# ============================================
echo -e "${GREEN}=== Phase 6: Frontend UI ===${NC}"
echo "React web interface"
echo ""

cd web-ui
start_service \
    "Frontend UI" \
    5173 \
    "npm run dev" \
    "frontend.log" \
    "../.frontend.pid"
cd ..

echo "Waiting for frontend to be ready..."
sleep 3

if check_port 5173; then
    echo -e "${GREEN}✅ Frontend UI ready${NC}"
else
    echo -e "${YELLOW}⏳ Frontend still starting (check logs/frontend.log)${NC}"
fi
echo ""

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}✅ Full stack started!${NC}"
echo ""
echo "📊 Access Points:"
echo "   🎨 Frontend UI:        http://localhost:5173"
echo "   📡 Backend API:        http://localhost:3001"
echo "   ⚙️  PEG Engine:         http://localhost:3007"
echo "   🔐 Credential Vault:   http://localhost:3005"
echo "   🔌 Connector Service:  http://localhost:9004"
echo ""
echo "🗄️  Infrastructure:"
echo "   PostgreSQL (peg-engine): localhost:5436"
echo "   PostgreSQL (UDM):        localhost:5433"
echo "   Redis (peg-engine):      localhost:5379"
echo "   Redis (UDM):             localhost:6380"
echo "   ChromaDB:                localhost:8000"
echo ""
echo "📝 Logs:"
echo "   Vault:      tail -f logs/vault.log"
echo "   PEG Engine: tail -f logs/peg-engine.log"
echo "   Connector:  tail -f logs/connector.log"
echo "   Backend:    tail -f logs/backend.log"
echo "   Frontend:   tail -f logs/frontend.log"
echo ""
echo "🔄 Workflow Execution Flow:"
echo "   1. peg-engine receives workflow request"
echo "   2. peg-engine → credential-vault (get encrypted API keys)"
echo "   3. credential-vault → AWS KMS (decrypt credentials)"
echo "   4. peg-engine → PEG-Connector-Service (execute with credentials)"
echo "   5. Results stored as artifacts"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-demo.sh"
echo ""

