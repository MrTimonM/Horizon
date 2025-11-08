#!/bin/bash

# HORIZN Docker Build and Push Script
# This script builds Docker images and pushes them to Docker Hub

set -e

echo "============================================"
echo "   HORIZN Docker Build & Push"
echo "============================================"
echo ""

# Docker Hub username
DOCKER_USERNAME="mrtimonm"
VERSION="v1.0.0"

# Check if logged in to Docker
if ! docker info | grep -q "Username"; then
    echo "Please login to Docker Hub first:"
    docker login
fi

echo "Building images..."
echo ""

# Build Frontend
echo "[1/2] Building Frontend Image..."
docker build -f Dockerfile.frontend \
    -t ${DOCKER_USERNAME}/horizn-frontend:latest \
    -t ${DOCKER_USERNAME}/horizn-frontend:${VERSION} \
    .
echo "✓ Frontend image built"
echo ""

# Build VPN Node (simplified - without server.js copy)
echo "[2/2] Building VPN Node Image..."
docker build -f Dockerfile.vpn-node \
    -t ${DOCKER_USERNAME}/horizn-vpn-node:latest \
    -t ${DOCKER_USERNAME}/horizn-vpn-node:${VERSION} \
    .
echo "✓ VPN Node image built"
echo ""

echo "============================================"
echo "Pushing images to Docker Hub..."
echo "============================================"
echo ""

# Push Frontend
echo "Pushing Frontend..."
docker push ${DOCKER_USERNAME}/horizn-frontend:latest
docker push ${DOCKER_USERNAME}/horizn-frontend:${VERSION}
echo "✓ Frontend pushed"
echo ""

# Push VPN Node
echo "Pushing VPN Node..."
docker push ${DOCKER_USERNAME}/horizn-vpn-node:latest
docker push ${DOCKER_USERNAME}/horizn-vpn-node:${VERSION}
echo "✓ VPN Node pushed"
echo ""

echo "============================================"
echo "✓ All images built and pushed successfully!"
echo "============================================"
echo ""
echo "Pull commands:"
echo "  docker pull ${DOCKER_USERNAME}/horizn-frontend:latest"
echo "  docker pull ${DOCKER_USERNAME}/horizn-vpn-node:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose pull"
echo "  docker-compose up -d"
echo ""
