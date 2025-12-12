#!/bin/bash

# NicheFinder Full Stack - Shutdown Script
# Stops all services including infrastructure

echo "🛑 Stopping NicheFinder Full Stack..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop a service
stop_service() {
    local name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${RED}Stopping $name (PID: $PID)...${NC}"
            kill $PID
            rm "$pid_file"
        else
            echo "$name not running (stale PID file)"
            rm "$pid_file"
        fi
    else
        # Try to find and kill by port
        PID=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo -e "${RED}Stopping $name (PID: $PID)...${NC}"
            kill $PID
        fi
    fi
}

# Stop application services
echo -e "${BLUE}Stopping application services...${NC}"
stop_service "Frontend UI" ".frontend.pid" 5173
stop_service "Backend API" ".backend.pid" 3001
stop_service "PEG-Connector-Service" ".connector.pid" 9004
stop_service "PEG Engine" ".peg-engine.pid" 3007
stop_service "Credential Vault" ".vault.pid" 3005

echo ""
echo -e "${BLUE}Stopping infrastructure services...${NC}"

# Stop Docker services
cd deps/peg-engine
if docker compose ps | grep -q "Up"; then
    echo -e "${RED}Stopping Docker services (PostgreSQL, Redis, ChromaDB)...${NC}"
    docker compose down
else
    echo "Docker services not running"
fi
cd ../..

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""

