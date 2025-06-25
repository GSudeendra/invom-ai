@echo off
setlocal enabledelayedexpansion

REM Colors for Windows (using echo with color codes)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "NC=[0m"

REM Get date for log files
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "LOG_DATE=%dt:~0,8%"
set "LOG_DIR=logs"
set "BACKEND_LOG=%LOG_DIR%\logs_backend_%LOG_DATE%.log"
set "FRONTEND_LOG=%LOG_DIR%\logs_frontend_%LOG_DATE%.log"

REM Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo %GREEN%==> Starting ETF Dashboard...%NC%

REM 0. Check and start MongoDB
echo %GREEN%==> Checking MongoDB...%NC%

REM Check if MongoDB is running on port 27017
netstat -an | find "27017" >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%==> MongoDB not running, attempting to start with Docker...%NC%
    
    REM Check if Docker is available
    docker --version >nul 2>&1
    if %errorlevel% equ 0 (
        REM Stop and remove existing MongoDB containers
        echo %YELLOW%==> Cleaning up existing MongoDB containers...%NC%
        docker stop invom_ai_mongodb etf_dashboard_mongodb >nul 2>&1
        docker rm invom_ai_mongodb etf_dashboard_mongodb >nul 2>&1
        
        REM Start MongoDB with Docker Compose
        echo %GREEN%==> Starting MongoDB with Docker Compose...%NC%
        docker compose up -d mongodb >nul 2>&1
        if %errorlevel% neq 0 (
            docker-compose up -d mongodb >nul 2>&1
        )
        
        REM Wait for MongoDB to be ready
        echo %GREEN%==> Waiting for MongoDB to be ready...%NC%
        for /l %%i in (1,1,20) do (
            netstat -an | find "27017" >nul 2>&1
            if !errorlevel! equ 0 (
                echo %GREEN%MongoDB is up!%NC%
                goto :mongo_ready
            )
            timeout /t 1 /nobreak >nul
        )
        echo %RED%MongoDB did not start in time. Exiting.%NC%
        exit /b 1
    ) else (
        echo %RED%MongoDB is not running and Docker is not available.%NC%
        echo %RED%Please start MongoDB manually or install Docker.%NC%
        exit /b 1
    )
) else (
    echo %GREEN%MongoDB is already running.%NC%
)

:mongo_ready

REM Check if high_liquidity_etfs collection is empty and prompt to seed
if exist "backend\node_modules\mongodb\package.json" (
    echo %GREEN%==> Checking database content...%NC%
    for /f %%i in ('node -e "const { MongoClient } = require('./backend/node_modules/mongodb'); (async () => { try { const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }); const db = client.db('invom_ai'); const count = await db.collection('high_liquidity_etfs').countDocuments(); console.log(count); await client.close(); } catch (e) { console.log(0); } })()" 2^>nul') do set ETF_COUNT=%%i
    
    if "%ETF_COUNT%"=="0" (
        echo %RED%No data found in high_liquidity_etfs collection.%NC%
        set /p SEED_CONFIRM="Do you want to seed it now? (y/n): "
        if /i "!SEED_CONFIRM!"=="y" (
            echo %GREEN%Seeding high_liquidity_etfs collection...%NC%
            node backend\scripts\seedHighLiquidityEtfs.js
        ) else (
            echo %RED%Skipping seeding. The collection will remain empty until you seed it manually.%NC%
        )
    )
)

REM 1. Check for node and npm
where node >nul 2>nul || (echo %RED%Error: node is not installed.%NC% & exit /b 1)
where npm >nul 2>nul || (echo %RED%Error: npm is not installed.%NC% & exit /b 1)

REM 2. Start backend
cd backend
echo %GREEN%==> Starting backend...%NC%
if not exist node_modules (
    echo %GREEN%Installing backend dependencies...%NC%
    npm install
) else (
    REM Check if package-lock.json is newer than node_modules
    for %%F in (package-lock.json) do set PLJ=%%~tF
    for %%F in (node_modules) do set NMD=%%~tF
    if "!PLJ!" GTR "!NMD!" (
        echo %GREEN%Installing backend dependencies...%NC%
        npm install
    )
)

echo %GREEN%==> Starting backend server...%NC%
start "ETF Backend" cmd /c "npm start > ..\%BACKEND_LOG% 2>&1"

REM Wait for backend to be ready
echo %GREEN%==> Waiting for backend to be ready...%NC%
for /l %%i in (1,1,30) do (
    netstat -an | find "3001" >nul 2>&1
    if !errorlevel! equ 0 (
        echo %GREEN%Backend is up!%NC%
        goto :backend_ready
    )
    timeout /t 1 /nobreak >nul
)
echo %RED%Backend did not start in time. Exiting.%NC%
exit /b 1

:backend_ready

REM 3. Start frontend
cd ..\frontend
echo %GREEN%==> Starting frontend...%NC%
if not exist node_modules (
    echo %GREEN%Installing frontend dependencies...%NC%
    npm install
) else (
    REM Check if package-lock.json is newer than node_modules
    for %%F in (package-lock.json) do set PLJ=%%~tF
    for %%F in (node_modules) do set NMD=%%~tF
    if "!PLJ!" GTR "!NMD!" (
        echo %GREEN%Installing frontend dependencies...%NC%
        npm install
    )
)

echo %GREEN%==> Starting frontend server...%NC%
start "ETF Frontend" cmd /c "npm start > ..\%FRONTEND_LOG% 2>&1"

REM Wait for frontend to be ready
echo %GREEN%==> Waiting for frontend to be ready...%NC%
timeout /t 5 /nobreak >nul

REM 4. Print summary and instructions
cd ..
echo.
echo %GREEN%ETF Dashboard started! Backend (port 3001), Frontend (port 4000).%NC%

REM Access instructions
set "BACKEND_URL=http://localhost:3001"
set "FRONTEND_URL=http://localhost:4000"
set "MONGO_URL=mongodb://localhost:27017"

echo.
echo %GREEN%Access your app and services:%NC%
echo.
echo - Frontend:   %FRONTEND_URL%
echo - Backend:    %BACKEND_URL%
echo - MongoDB:    %MONGO_URL%
echo.
echo %GREEN%MongoDB Access Options:%NC%
echo - MongoDB Compass:  Open Compass and connect to %MONGO_URL%
echo - Mongo Shell:      mongosh "%MONGO_URL%/invom_ai"
echo - Docker CLI:       docker exec -it invom_ai_mongodb mongosh
echo.
echo %GREEN%Backend API Example:%NC%
echo - List high liquidity ETFs:  %BACKEND_URL%/api/etfs/high-liquidity
echo.
echo %GREEN%To stop all services:%NC%
echo - Close the opened terminal windows for backend and frontend
echo - If using Docker: docker-compose down
echo.

REM 5. Open frontend in browser only once, at the end
start %FRONTEND_URL%

REM 6. Final console log with decorative borders
echo.
echo _______________________________________
echo ________________________________________
echo _________________________________________
echo - Frontend:   http://localhost:4000
echo - Backend:    http://localhost:3001
echo - MongoDB:    mongodb://localhost:27017
echo _________________________________________
echo ________________________________________
echo _______________________________________
echo.
echo %GREEN%Application logs are available at:%NC%
echo %YELLOW%%BACKEND_LOG% - Backend logs%NC%
echo %YELLOW%%FRONTEND_LOG% - Frontend logs%NC%
echo.
echo %GREEN%Additional suggestions:%NC%
echo %YELLOW%• Monitor logs in real-time: tail -f %BACKEND_LOG%%NC%
echo %YELLOW%• Check for errors: findstr /i error %BACKEND_LOG%%NC%
echo %YELLOW%• View recent logs: dir /o-d %LOG_DIR%\*.log%NC%
echo.

echo %GREEN%ETF Dashboard is now running!%NC%
echo %GREEN%Press any key to exit this window (services will continue running)...%NC%
pause >nul 