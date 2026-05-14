#!/bin/bash

echo "Starting Project Lifecycle Dashboard..."

cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Installing backend dependencies..."
./venv/bin/pip install -r requirements.txt

echo "Initializing database..."
./venv/bin/python init_db.py

echo "Starting backend server..."
./venv/bin/python app.py &
BACKEND_PID=$!

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

cd ../skills/aet-report-to-dashboard/scripts/platform

if [ ! -d "node_modules" ]; then
    echo "Installing phase-report dependencies..."
    npm install --no-audit --no-fund
fi

cd ../../..

echo ""
echo "Dashboard started!"
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
