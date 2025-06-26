#!/bin/bash
set -e

# Prevent multiple instances of this script
LOCKFILE="/tmp/invom_ai_run.lock"
if [ -f "$LOCKFILE" ]; then
  echo "Another instance of run.sh is already running. Exiting."
  exit 1
fi
trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

function cleanup_existing_containers() {
  echo -e "${YELLOW}==> Cleaning up existing MongoDB containers...${NC}"
  # Stop and remove any existing MongoDB containers that might conflict
  docker stop invom_ai_mongodb etf_dashboard_mongodb 2>/dev/null || true
  docker rm invom_ai_mongodb etf_dashboard_mongodb 2>/dev/null || true
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

function wait_for_backend() {
  echo -e "${GREEN}==> Waiting for backend to be ready...${NC}"
  for i in {1..30}; do
    if nc -z localhost 3001; then
      echo -e "${GREEN}Backend is up!${NC}"
      return 0
    fi
    sleep 1
  done
  echo -e "${RED}Backend did not start in time. Exiting.${NC}"
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
      cleanup_existing_containers
      
      # Try the new docker compose command first, fallback to docker-compose
      if docker compose version >/dev/null 2>&1; then
        docker compose up -d mongodb
      else
        docker-compose up -d mongodb
      fi
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
    ETF_COUNT=$(node -e "const { MongoClient } = require('./backend/node_modules/mongodb'); (async () => { try { const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }); const db = client.db('invom_ai'); const count = await db.collection('high_liquidity_etfs').countDocuments(); console.log(count); await client.close(); } catch (e) { console.log(0); } })()")
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

# Get date for log files
LOG_DATE=$(date +%Y%m%d)
LOG_DIR="logs"
BACKEND_LOG="$LOG_DIR/logs_backend_$LOG_DATE.log"
FRONTEND_LOG="$LOG_DIR/logs_frontend_$LOG_DATE.log"

mkdir -p "$LOG_DIR"

# 2. Start backend
cd backend
echo -e "${GREEN}==> Starting backend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  npm install
fi
npm run start >>"../$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
wait_for_backend

# 3. Start frontend
cd ../frontend
echo -e "${GREEN}==> Starting frontend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing frontend dependencies...${NC}"
  npm install
fi
npm start >>"../$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
sleep 5

# 4. Print summary and instructions
cd ..
echo -e "${GREEN}ETF Dashboard started! Backend (port 3001), Frontend (port 4000).${NC}"
echo -e "${GREEN}To stop: kill $BACKEND_PID $FRONTEND_PID${NC}"

# Access instructions
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4000"
MONGO_URL="mongodb://localhost:27017"
SWAGGER_URL="http://localhost:3001/api-docs/"

cat <<EOM

${GREEN}Access your app and services:${NC}

- Frontend:   		t${FRONTEND_URL}
- Backend:    		t${BACKEND_URL}
- MongoDB:    		${MONGO_URL}
- Swagger API Docs: 	${SWAGGER_URL}

${GREEN}MongoDB Access Options:${NC}
- MongoDB Compass:  Open Compass and connect to ${MONGO_URL}
- Mongo Shell:      mongosh "${MONGO_URL}/invom_ai"
- Docker CLI:       docker exec -it invom_ai_mongodb mongosh

${GREEN}Backend API Example:${NC}
- List high liquidity ETFs:  ${BACKEND_URL}/api/etfs/high-liquidity

${GREEN}To stop all services:${NC}
- kill $BACKEND_PID $FRONTEND_PID
- If using Docker: docker-compose down

EOM

# 5. Open frontend in browser only once, at the end
BROWSER_LOCK=".frontend_browser_opened"
if [ ! -f "$BROWSER_LOCK" ]; then
  if command -v open >/dev/null; then
    open http://localhost:4000
  elif command -v xdg-open >/dev/null; then
    xdg-open http://localhost:4000
  fi
  touch "$BROWSER_LOCK"
fi

# 6. Final console log with decorative borders
echo ""
echo "_______________________________________"
echo "________________________________________"
echo "_________________________________________"
echo "- Frontend:   http://localhost:4000"
echo "- Backend:    http://localhost:3001"
echo "- MongoDB:    mongodb://localhost:27017"
echo "- Swagger API Docs:  http://localhost:3001/api-docs/"
echo "_________________________________________"
echo "________________________________________"
echo "_______________________________________"
echo ""
echo -e "${GREEN}Application logs are available at:${NC}"
echo -e "${YELLOW}logs/logs_backend_$LOG_DATE.log${NC} - Backend logs"
echo -e "${YELLOW}logs/logs_frontend_$LOG_DATE.log${NC} - Frontend logs"
echo ""
echo -e "${GREEN}Additional suggestions:${NC}"
echo -e "${YELLOW}• Monitor logs in real-time: tail -f logs/logs_backend_$LOG_DATE.log${NC}"
echo -e "${YELLOW}• Check for errors: grep -i error logs/logs_backend_$LOG_DATE.log${NC}"
echo -e "${YELLOW}• View recent logs: ls -la logs/ | tail -5${NC}"
echo ""

wait $BACKEND_PID $FRONTEND_PID 