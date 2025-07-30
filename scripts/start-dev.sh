#!/bin/bash
set -e

echo "🚀 Starting Solar Website Builder development servers..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found. Run './scripts/dev-setup.sh' first."
    exit 1
fi

# Start database services if not running
echo "🐳 Ensuring development services are running..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 3

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "✅ Development servers stopped"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start backend in background
echo "🐍 Starting Python FastAPI backend..."
cd services
source venv/bin/activate
python main.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Give backend time to start
sleep 2

# Start frontend in background
echo "⚛️  Starting React frontend..."
cd ../app
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Development servers are running!"
echo ""
echo "📱 Frontend:      http://localhost:3000"
echo "🔧 Backend API:   http://localhost:8000"
echo "📚 API Docs:      http://localhost:8000/docs"
echo "🗄️  Database UI:   http://localhost:8080 (optional)"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait