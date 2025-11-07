#!/bin/bash

# HORIZN API Diagnostic Script

echo "=========================================="
echo "  HORIZN API Server Diagnostics"
echo "=========================================="
echo ""

# Check Node.js
echo "[1] Node.js Version:"
if command -v node &> /dev/null; then
    node --version
else
    echo "  ✗ Node.js not installed"
fi
echo ""

# Check npm
echo "[2] npm Version:"
if command -v npm &> /dev/null; then
    npm --version
else
    echo "  ✗ npm not installed"
fi
echo ""

# Check if directory exists
echo "[3] Installation Directory:"
if [ -d "/opt/horizn-node" ]; then
    echo "  ✓ /opt/horizn-node exists"
    ls -la /opt/horizn-node
else
    echo "  ✗ /opt/horizn-node does not exist"
fi
echo ""

# Check node_modules
echo "[4] Node Modules:"
if [ -d "/opt/horizn-node/node_modules" ]; then
    echo "  ✓ node_modules exists"
    cd /opt/horizn-node
    npm list --depth=0 2>&1 | head -20
else
    echo "  ✗ node_modules not found"
fi
echo ""

# Check service status
echo "[5] Service Status:"
systemctl status horizn-node --no-pager -l
echo ""

# Check recent logs
echo "[6] Recent Logs (last 30 lines):"
journalctl -u horizn-node -n 30 --no-pager
echo ""

# Check if ports are in use
echo "[7] Port 3000 Status:"
if netstat -tulpn 2>/dev/null | grep :3000 > /dev/null; then
    echo "  ✓ Port 3000 is in use"
    netstat -tulpn | grep :3000
else
    echo "  ⚠ Port 3000 is not in use"
fi
echo ""

# Try to start manually
echo "[8] Attempting Manual Start:"
echo "  Running: cd /opt/horizn-node && node server.js"
echo "  (Press Ctrl+C to stop)"
echo ""
cd /opt/horizn-node && timeout 10 node server.js 2>&1 || echo "  ✗ Failed to start or timed out"
echo ""

echo "=========================================="
echo "  Diagnostic Complete"
echo "=========================================="
