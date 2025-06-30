#!/bin/bash

# AI Analyst Financial Analytics API Startup Script

echo "🚀 Starting AI Analyst Financial Analytics API"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-3002}
export RELOAD=${RELOAD:-"true"}
export LOG_LEVEL=${LOG_LEVEL:-"info"}

echo "📍 Host: $HOST"
echo "🔌 Port: $PORT"
echo "🔄 Reload: $RELOAD"
echo "📝 Log Level: $LOG_LEVEL"
echo ""

# Start the server
echo "🚀 Starting server..."
python run.py --host $HOST --port $PORT --log-level $LOG_LEVEL 