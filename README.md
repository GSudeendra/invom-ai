# 📈 ETF Dashboard

A robust, production-grade Indian ETF dashboard system with a Node.js backend and a React frontend.

---

## 🚀 One-Click Start (Recommended)

From the project root, use the provided scripts:

### 💻 Mac/Linux
```bash
chmod +x run.sh
./run.sh
```

### 🪟 Windows
```
run run.bat
```

- These scripts will:
  - 🧑‍💻 Check for Node.js and npm
  - 🗄️ Start MongoDB (Docker or local)
  - 📦 Install missing dependencies (backend and frontend)
  - 🟢 Start the backend (port 3001) and then the frontend (port 4000)
  - 🌐 Open the dashboard in your browser
  - 📝 Log all output to `logs/` directory with date stamps

---

## 🛠️ Manual Setup (Advanced)

### 🗄️ MongoDB
```bash
# Using Docker (recommended)
docker compose up -d mongodb

# Or install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
```

### 🔙 Backend
```bash
cd backend
npm install
npm start
```

### 🔜 Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🗂️ Project Structure

```
invom-ai/
├── backend/           # 🟢 Node.js/Express API
│   ├── server.js
│   ├── package.json
│   ├── nav_data/
│   │   └── etf_navs_categorized_YYYY-MM-DD.json
│   └── src/
│       ├── api/
│       │   └── etf/
│       │       ├── fetchNavs.js
│       │       ├── fetchNseEtfs.js
│       │       ├── getCategories.js
│       │       ├── getEtfList.js
│       │       ├── getEtfsByCategory.js
│       │       └── getNavBySchemeId.js
│       └── services/
│           ├── amfiNavService.js
│           └── navDataService.js
├── frontend/          # ⚛️ React app (user dashboard UI)
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── components/
│       │   ├── etf/
│       │   └── layout/
│       ├── hooks/
│       ├── pages/
│       ├── styles/
│       ├── utils/
│       └── App.js, index.js
├── logs/              # 📝 Application logs (auto-generated)
│   ├── logs_backend_YYYYMMDD.log
│   └── logs_frontend_YYYYMMDD.log
├── run.sh             # 🚀 Mac/Linux startup script
├── run.bat            # 🚀 Windows startup script
└── docker-compose.yml # 🐳 MongoDB container setup
```

---

## 🔌 API Endpoints

| Endpoint                                 | Method | Description                                 |
|-------------------------------------------|--------|---------------------------------------------|
| `/api/etfs`                              | GET    | 📊 Get all categorized ETFs                  |
| `/api/etfs/categories`                   | GET    | 🗂️ Get list of ETF categories                |
| `/api/etfs/category/:categoryKey`        | GET    | 📁 Get ETFs for a specific category          |
| `/api/nav?schemeId=...`                  | GET    | 💰 Get NAV for a specific scheme             |
| `/api/fetch-navs`                        | POST   | 🔄 Trigger NAV fetch/save (admin/refresh)    |
| `/api/etfs/live`                         | GET    | ⚡ Fetch live ETF data from NSE (Puppeteer)  |

---

## ✨ Frontend Features

- 🗂️ **Category Filter:** Browse ETFs by dynamically fetched categories.
- ⚡ **Live Toggle:** Instantly switch to live ETF prices from NSE.
- 🖼️ **Modern UI:** Responsive, glassmorphism dashboard with infinite scroll.
- 📊 **Stats Page:** View and compare ETF stats in a tabular format.
- 🔄 **Refresh Button:** Manually trigger backend NAV data refresh.
- ⏳ **Loading/Error Handling:** User-friendly spinners and error messages.
- 🏗️ **Production-Grade Structure:** Clean separation of concerns, modular code.

---

## 🏭 Development & Production

- 🟢 **Backend:** All business logic is in `src/`, with clear separation between API handlers and services.
- ⚛️ **Frontend:** All UI logic is in `src/`, with components, hooks, pages, and styles organized by domain.
- 🗃️ **Data:** Only the latest categorized ETF data is kept in `nav_data/`.
- 📝 **Logging:** All application logs are automatically saved to `logs/` directory with date stamps.

---

## 🛠️ Customization

- ➕ **Add new ETF categories:** Update the categorization logic in `amfiNavService.js`.
- 🔢 **Change default grid size:** Edit the `visibleCount` in `ETFGrid.js`.
- 🔧 **Change ports:** Set the `PORT` environment variable in backend or frontend.

---

## 🧰 Troubleshooting

- ❌ **Backend not starting?**  
  - Ensure Node.js v18+ is installed.
  - Check for missing dependencies: `npm install`
  - Check import paths if you move files.
  - Check logs: `tail -f logs/logs_backend_YYYYMMDD.log`

- ❌ **Frontend not compiling?**  
  - Ensure all CSS imports use the correct path (`./styles/App.css`).
  - Check for missing dependencies: `npm install`
  - Check logs: `tail -f logs/logs_frontend_YYYYMMDD.log`

- ⚠️ **Live data not working?**  
  - Puppeteer may be blocked by NSE anti-bot. Try again or check logs.

- 🗄️ **MongoDB issues?**
  - Check if MongoDB is running: `docker ps` or `brew services list`
  - Check logs for connection errors
  - Ensure port 27017 is not in use by another process

---

## 📝 Logging

The application automatically logs all output to the `logs/` directory:

- **Backend logs:** `logs/logs_backend_YYYYMMDD.log`
- **Frontend logs:** `logs/logs_frontend_YYYYMMDD.log`

**Useful commands:**
```bash
# Monitor logs in real-time
tail -f logs/logs_backend_$(date +%Y%m%d).log

# Check for errors
grep -i error logs/logs_backend_$(date +%Y%m%d).log

# View recent log files
ls -la logs/ | tail -5
```

---

## 📄 License

Apache License 2.0

---

**For any questions or contributions, please open an issue or pull request!**
