#!/bin/bash

# NicheFinder Full Stack - Startup Script
# Starts ALL services including infrastructure (PostgreSQL, Redis, credential-vault, peg-engine)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting NicheFinder Full Stack..."
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
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "   Create .env with API keys for connectors"
fi

if [ ! -f deps/credential-vault/.env ]; then
    echo -e "${YELLOW}⚠️  Warning: deps/credential-vault/.env not found${NC}"
    echo "   credential-vault requires AWS credentials"
    echo "   Copy deps/credential-vault/config/env.example to deps/credential-vault/.env"
fi

if [ ! -f deps/peg-engine/.env ]; then
    echo -e "${YELLOW}⚠️  Warning: deps/peg-engine/.env not found${NC}"
    echo "   peg-engine requires database configuration"
fi
echo ""

# ============================================
# PHASE 1: Start Infrastructure (Docker)
# ============================================
echo -e "${GREEN}=== Phase 1: Infrastructure Services ===${NC}"
echo "Starting PostgreSQL, Redis, ChromaDB via Docker..."
echo ""

cd deps/peg-engine
if docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Docker services already running${NC}"
else
    docker compose up -d
    echo "Waiting for infrastructure to be ready..."
    sleep 10
fi
cd ../..

echo -e "${GREEN}✅ Infrastructure ready${NC}"
echo ""

# ============================================
# PHASE 2: Start credential-vault
# ============================================
echo -e "${GREEN}=== Phase 2: Credential Vault ===${NC}"
echo "Secure credential storage with AWS KMS encryption"
echo ""

if [ -f deps/credential-vault/.env ]; then
    cd deps/credential-vault
    start_service \
        "credential-vault" \
        3005 \
        "pnpm dev" \
        "vault.log" \
        "../../.vault.pid"
    cd ../..
    sleep 3
else
    echo -e "${YELLOW}⚠️  Skipping credential-vault (no .env file)${NC}"
fi
echo ""

# ============================================
# PHASE 3: Start peg-engine
# ============================================
echo -e "${GREEN}=== Phase 3: PEG Engine ===${NC}"
echo "Workflow orchestration with BullMQ job queue"
echo ""

if [ -f deps/peg-engine/.env ]; then
    cd deps/peg-engine
    start_service \
        "peg-engine" \
        3007 \
        "npm run dev" \
        "peg-engine.log" \
        "../../.peg-engine.pid"
    cd ../..
    sleep 3
else
    echo -e "${YELLOW}⚠️  Skipping peg-engine (no .env file)${NC}"
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
sleep 5
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
sleep 3
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
sleep 3
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
echo "   🔌 Connector Service:  http://localhost:9004"
if check_port 3007; then
    echo "   ⚙️  PEG Engine:         http://localhost:3007"
fi
if check_port 3005; then
    echo "   🔐 Credential Vault:   http://localhost:3005"
fi
echo ""
echo "🗄️  Infrastructure:"
echo "   PostgreSQL (peg-engine): localhost:5436"
echo "   PostgreSQL (UDM):        localhost:5433"
echo "   Redis (peg-engine):      localhost:5379"
echo "   Redis (UDM):             localhost:6380"
echo "   ChromaDB:                localhost:8000"
echo ""
echo "📝 Logs:"
echo "   Connector:  tail -f logs/connector.log"
echo "   Backend:    tail -f logs/backend.log"
echo "   Frontend:   tail -f logs/frontend.log"
if [ -f .peg-engine.pid ]; then
    echo "   PEG Engine: tail -f logs/peg-engine.log"
fi
if [ -f .vault.pid ]; then
    echo "   Vault:      tail -f logs/vault.log"
fi
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-full-stack.sh"
echo ""

