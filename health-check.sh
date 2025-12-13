#!/bin/bash

# NicheFinder Full Stack - Health Check Script
# Verifies all services are running and responding

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🏥 NicheFinder Health Check"
echo ""

# Function to check if port is listening
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local timeout=${2:-5}
    curl -s -f -m $timeout "$url" > /dev/null 2>&1
}

# Track overall health
all_healthy=true

# Check Infrastructure
echo -e "${BLUE}=== Infrastructure ===${NC}"

if check_port 5436; then
    echo -e "${GREEN}✅ PostgreSQL (peg-engine)${NC} - port 5436"
else
    echo -e "${RED}❌ PostgreSQL (peg-engine)${NC} - port 5436 not listening"
    all_healthy=false
fi

if check_port 5379; then
    echo -e "${GREEN}✅ Redis (peg-engine)${NC} - port 5379"
else
    echo -e "${RED}❌ Redis (peg-engine)${NC} - port 5379 not listening"
    all_healthy=false
fi

if check_port 8000; then
    echo -e "${GREEN}✅ ChromaDB${NC} - port 8000"
else
    echo -e "${YELLOW}⚠️  ChromaDB${NC} - port 8000 not listening (optional)"
fi

echo ""

# Check Application Services
echo -e "${BLUE}=== Application Services ===${NC}"

if check_port 3005; then
    if check_http "http://localhost:3005/health" 3; then
        echo -e "${GREEN}✅ credential-vault${NC} - http://localhost:3005 (healthy)"
    else
        echo -e "${YELLOW}⚠️  credential-vault${NC} - port 3005 listening but health check failed"
    fi
else
    echo -e "${YELLOW}⚠️  credential-vault${NC} - port 3005 not listening (optional)"
fi

if check_port 3007; then
    # peg-engine doesn't have a health endpoint, just check if port is listening
    echo -e "${GREEN}✅ peg-engine${NC} - http://localhost:3007"
else
    echo -e "${RED}❌ peg-engine${NC} - port 3007 not listening"
    all_healthy=false
fi

if check_port 9004; then
    if check_http "http://localhost:9004/health" 3; then
        echo -e "${GREEN}✅ PEG-Connector-Service${NC} - http://localhost:9004 (healthy)"
    else
        echo -e "${YELLOW}⚠️  PEG-Connector-Service${NC} - port 9004 listening but health check failed"
    fi
else
    echo -e "${RED}❌ PEG-Connector-Service${NC} - port 9004 not listening"
    all_healthy=false
fi

if check_port 3001; then
    if check_http "http://localhost:3001/health" 3; then
        echo -e "${GREEN}✅ nichefinder-server${NC} - http://localhost:3001 (healthy)"
    else
        echo -e "${YELLOW}⚠️  nichefinder-server${NC} - port 3001 listening but health check failed"
    fi
else
    echo -e "${RED}❌ nichefinder-server${NC} - port 3001 not listening"
    all_healthy=false
fi

if check_port 5173; then
    if check_http "http://localhost:5173" 3; then
        echo -e "${GREEN}✅ Frontend UI${NC} - http://localhost:5173 (healthy)"
    else
        echo -e "${YELLOW}⚠️  Frontend UI${NC} - port 5173 listening but health check failed"
    fi
else
    echo -e "${RED}❌ Frontend UI${NC} - port 5173 not listening"
    all_healthy=false
fi

echo ""

# Summary
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}✅ All critical services are healthy!${NC}"
    echo ""
    echo "🎨 Frontend: http://localhost:5173"
    exit 0
else
    echo -e "${RED}❌ Some services are not healthy${NC}"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   - Check logs in ./logs/ directory"
    echo "   - Run: ./start-full-stack.sh"
    echo "   - Check individual service logs:"
    echo "     tail -f logs/peg-engine.log"
    echo "     tail -f logs/connector.log"
    echo "     tail -f logs/backend.log"
    echo "     tail -f logs/frontend.log"
    exit 1
fi

