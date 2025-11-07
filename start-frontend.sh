#!/bin/bash

# HORIZN Frontend Launch Script

echo "============================================"
echo "   HORIZN - Network Without Borders"
echo "   Starting Frontend Application"
echo "============================================"
echo ""

cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
