#!/bin/bash
set -e

echo "🚀 Setting up Solar Website Builder for development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy environment template if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from template"
    echo "📝 Please edit .env with your configuration"
else
    echo "✅ .env already exists"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd app
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../services
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Python virtual environment created"
fi

source venv/bin/activate
pip install -e .
echo "✅ Backend dependencies installed"

# Start development services
echo "🐳 Starting development services (PostgreSQL & Redis)..."
cd ..
docker-compose -f docker-compose.dev.yml up -d postgres redis
echo "✅ Development services started"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
if docker-compose -f docker-compose.dev.yml ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL may still be starting up"
fi

if docker-compose -f docker-compose.dev.yml ps redis | grep -q "healthy"; then
    echo "✅ Redis is ready"
else
    echo "⚠️  Redis may still be starting up"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your configuration if needed"
echo "2. Run './scripts/start-dev.sh' to start development servers"
echo "3. Visit http://localhost:3000 for frontend"
echo "4. Visit http://localhost:8000/docs for API documentation"
echo "5. Visit http://localhost:8080 for database admin (optional)"
echo ""