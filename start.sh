#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

function check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo -e "${RED}Error: $1 is not installed.${NC}"; exit 1; }
}

function has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

function has_docker_compose() {
  if has_cmd docker && docker compose version >/dev/null 2>&1; then
    return 0
  elif has_cmd docker-compose; then
    return 0
  else
    return 1
  fi
}

function try_install_docker_compose() {
  echo -e "${GREEN}Attempting to install Docker Compose...${NC}"
  if [ "$(uname)" = "Darwin" ]; then
    if has_cmd brew; then
      echo -e "${GREEN}Using Homebrew to install Docker Compose plugin...${NC}"
      brew install docker-compose || brew install docker-compose-completion || true
    else
      echo -e "${RED}Homebrew not found. Please install Docker Compose manually.${NC}"
      return 1
    fi
  elif [ -f /etc/debian_version ] || [ -f /etc/lsb-release ]; then
    # Linux (Debian/Ubuntu)
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin || true
    # Try legacy binary as fallback
    if ! has_docker_compose; then
      sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      sudo chmod +x /usr/local/bin/docker-compose
    fi
  else
    echo -e "${RED}Please install Docker Compose manually for your OS.${NC}"
    return 1
  fi
}

function wait_for_mongo() {
  echo -e "${GREEN}==> Waiting for MongoDB to be ready...${NC}"
  for i in {1..20}; do
    if nc -z localhost 27017; then
      echo -e "${GREEN}MongoDB is up!${NC}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}MongoDB did not start in time. Exiting.${NC}"
  exit 1
}

# 0. Check and start MongoDB
if has_cmd mongod; then
  if [ "$(uname)" = "Darwin" ]; then
    # macOS
    if has_cmd brew && brew list | grep -q mongodb-community; then
      echo -e "${GREEN}==> Starting MongoDB with Homebrew...${NC}"
      brew services start mongodb-community || true
    else
      echo -e "${RED}MongoDB is not installed via Homebrew. Please install it or start mongod manually.${NC}"
    fi
  elif [ -f /etc/debian_version ] || [ -f /etc/lsb-release ]; then
    # Linux (Debian/Ubuntu)
    echo -e "${GREEN}==> Starting MongoDB with systemctl...${NC}"
    sudo systemctl start mongodb || true
  else
    echo -e "${RED}Please ensure MongoDB is running (unsupported OS for auto-start).${NC}"
  fi
  wait_for_mongo
else
  # mongod not installed, try Docker Compose
  if has_cmd docker; then
    if ! has_docker_compose; then
      try_install_docker_compose
    fi
    if has_docker_compose; then
      echo -e "${GREEN}==> Starting MongoDB with Docker Compose...${NC}"
      docker-compose up -d mongodb || docker compose up -d mongodb
      wait_for_mongo
    else
      echo -e "${RED}Docker Compose could not be installed automatically. Please install it manually.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}MongoDB is not installed, and Docker is not available. Please install one of them to continue.${NC}"
    exit 1
  fi
fi

# After MongoDB is up, check if high_liquidity_etfs is empty and prompt to seed
if has_cmd node; then
  if [ -f backend/node_modules/mongodb/package.json ]; then
    ETF_COUNT=$(node -e "const { MongoClient } = require('./backend/node_modules/mongodb'); (async () => { try { const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }); const db = client.db('etf_dashboard'); const count = await db.collection('high_liquidity_etfs').countDocuments(); console.log(count); await client.close(); } catch (e) { console.log(0); } })()")
    if [ "$ETF_COUNT" = "0" ]; then
      echo -e "${RED}No data found in high_liquidity_etfs collection.${NC}"
      read -p "Do you want to seed it now? (y/n): " SEED_CONFIRM
      if [[ "$SEED_CONFIRM" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Seeding high_liquidity_etfs collection...${NC}"
        node backend/scripts/seedHighLiquidityEtfs.js
      else
        echo -e "${RED}Skipping seeding. The collection will remain empty until you seed it manually.${NC}"
      fi
    fi
  else
    echo -e "${RED}Warning: 'mongodb' package not found in backend. Skipping high_liquidity_etfs data check.\nTo enable this check, run 'cd backend && npm install' first.${NC}"
  fi
fi

# 1. Check for node and npm
check_cmd node
check_cmd npm

# 2. Start backend
cd backend
echo -e "${GREEN}==> Starting backend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  npm install
fi
npm run start &
BACKEND_PID=$!
sleep 5

# 3. Start frontend
cd ../etf-dashboard-frontend
echo -e "${GREEN}==> Starting frontend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing frontend dependencies...${NC}"
  npm install
fi
npm start &
FRONTEND_PID=$!
sleep 5

# 4. Open frontend in browser
if command -v open >/dev/null; then
  open http://localhost:4000
elif command -v xdg-open >/dev/null; then
  xdg-open http://localhost:4000
fi

cd ..
echo -e "${GREEN}ETF Dashboard started! Backend (port 3001), Frontend (port 4000).${NC}"
echo -e "${GREEN}To stop: kill $BACKEND_PID $FRONTEND_PID${NC}"

# Access instructions
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4000"
MONGO_URL="mongodb://localhost:27017"

cat <<EOM

${GREEN}Access your app and services:${NC}

- Frontend:   ${FRONTEND_URL}
- Backend:    ${BACKEND_URL}
- MongoDB:    ${MONGO_URL}

${GREEN}MongoDB Access Options:${NC}
- MongoDB Compass:  Open Compass and connect to ${MONGO_URL}
- Mongo Shell:      mongosh "${MONGO_URL}/etf_dashboard"
- Docker CLI:       docker exec -it etf_dashboard_mongodb mongosh

${GREEN}Backend API Example:${NC}
- List high liquidity ETFs:  ${BACKEND_URL}/api/etfs/high-liquidity

${GREEN}To stop all services:${NC}
- kill $BACKEND_PID $FRONTEND_PID
- If using Docker: docker-compose down

EOM

wait $BACKEND_PID $FRONTEND_PID 