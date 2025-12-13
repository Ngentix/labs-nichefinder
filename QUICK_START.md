# NicheFinder Platform - Quick Start Guide

## Prerequisites

- Docker & Docker Compose (for PostgreSQL, Redis, ChromaDB)
- Node.js 18+ and npm/pnpm
- Rust 1.70+ and Cargo
- Git

## First-Time Setup

### 1. Clone and Install Dependencies

```bash
# Install peg-engine dependencies
cd deps/peg-engine
npm install
npx prisma generate
cd ../..

# Install credential-vault dependencies
cd deps/credential-vault
pnpm install
cd ../..

# Install PEG-Connector-Service dependencies
cd deps/PEG-Connector-Service
cargo build --release
cd ../..

# Install nichefinder-server dependencies
cd crates/nichefinder-server
cargo build --release
cd ../..

# Install frontend dependencies
cd web-ui
npm install
cd ..
```

### 2. Configure Environment Variables

#### Main API Keys (.env)
```bash
cp .env.example .env
# Edit .env and add your API keys:
# - GITHUB_API_KEY
# - YOUTUBE_API_KEY
```

#### credential-vault (.env)
```bash
cd deps/credential-vault
cp config/env.example .env
# Edit .env and add AWS credentials
cd ../..
```

#### peg-engine (.env)
```bash
cd deps/peg-engine
# .env should already exist with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5436/peg_engine
# REDIS_HOST=localhost
# REDIS_PORT=5379
cd ../..
```

#### nichefinder-server (.env) - Optional
```bash
cd crates/nichefinder-server
cp .env.example .env
# Default values should work, but you can customize:
# PORT=3001
# DATABASE_URL=sqlite://data/nichefinder.db
cd ../..
```

### 3. Initialize Databases

```bash
# Start infrastructure
cd deps/peg-engine
docker compose up -d
cd ../..

# Wait for PostgreSQL to be ready
sleep 5

# Run peg-engine migrations
cd deps/peg-engine
npx prisma migrate deploy
cd ../..
```

## Starting the Platform

### Option 1: All Services at Once (Recommended)

```bash
./start-full-stack.sh
```

This will start all services in the background with health checks:
- Infrastructure (PostgreSQL, Redis, ChromaDB)
- credential-vault (port 3005)
- peg-engine (port 3007)
- PEG-Connector-Service (port 9004)
- nichefinder-server (port 3001)
- Frontend UI (port 5173)

### Option 2: Manual Start (for debugging)

```bash
# Terminal 1: Infrastructure
cd deps/peg-engine && docker compose up

# Terminal 2: credential-vault
cd deps/credential-vault && pnpm dev

# Terminal 3: peg-engine
cd deps/peg-engine && npm run dev

# Terminal 4: PEG-Connector-Service
cd deps/PEG-Connector-Service && cargo run --release --bin peg-connector-service -- --config config.yaml

# Terminal 5: nichefinder-server
cd crates/nichefinder-server && PORT=3001 DATABASE_URL="sqlite://data/nichefinder.db" cargo run --release

# Terminal 6: Frontend UI
cd web-ui && npm run dev
```

## Verifying the Platform

### Check Service Health

```bash
./health-check.sh
```

This will verify all services are running and responding.

### Access the Platform

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **PEG Engine**: http://localhost:3007
- **Connector Service**: http://localhost:9004
- **credential-vault**: http://localhost:3005

## Stopping the Platform

```bash
./stop-full-stack.sh
```

## Troubleshooting

### Services Won't Start

1. Check logs in `./logs/` directory:
   ```bash
   tail -f logs/peg-engine.log
   tail -f logs/connector.log
   tail -f logs/backend.log
   tail -f logs/frontend.log
   ```

2. Verify ports are not in use:
   ```bash
   lsof -i :3001 -i :3005 -i :3007 -i :5173 -i :9004
   ```

3. Check Docker services:
   ```bash
   cd deps/peg-engine && docker compose ps
   ```

### Database Issues

- **nichefinder-server**: Ensure `crates/nichefinder-server/data/` directory exists
- **peg-engine**: Ensure PostgreSQL is running on port 5436

### Frontend Build Errors

If you see TypeScript errors about missing exports:
```bash
cd web-ui
rm -rf node_modules/.vite .vite dist
npm run dev
```

## Next Steps

1. Navigate to http://localhost:5173
2. Go to "Workflow Execution" tab
3. Select a workflow (e.g., "HACS Integrations")
4. Click "Execute Workflow"
5. View results in "Data Pipeline" and "Results" tabs

