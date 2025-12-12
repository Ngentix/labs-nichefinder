#!/bin/bash

# NicheFinder Platform Demo - Shutdown Script
# Stops all services (connector, backend, frontend)

echo "🛑 Stopping NicheFinder Platform Demo..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
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

# Stop all services
stop_service "PEG-Connector-Service" ".connector.pid" 9004
stop_service "Backend server" ".backend.pid" 3001
stop_service "Frontend server" ".frontend.pid" 5173

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""

