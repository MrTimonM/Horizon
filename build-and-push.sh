#!/bin/bash

# HORIZN Docker Build and Push Script
# Builds and pushes HORIZN frontend to Docker Hub

set -e

echo "============================================"
echo "   HORIZN Docker Build & Push"
echo "============================================"
echo ""

# Docker Hub username
DOCKER_USERNAME="mrtimonm"
VERSION="v1.0.1"

# Check if logged in to Docker
if ! docker info | grep -q "Username"; then
    echo "Please login to Docker Hub first:"
    docker login
fi

echo "Building HORIZN image..."
echo ""

# Build HORIZN Frontend
echo "Building HORIZN Application..."
docker build -f Dockerfile.frontend \
    -t ${DOCKER_USERNAME}/horizn:latest \
    -t ${DOCKER_USERNAME}/horizn:${VERSION} \
    .
echo "✓ HORIZN image built"
echo ""

echo "============================================"
echo "Pushing image to Docker Hub..."
echo "============================================"
echo ""

# Push HORIZN
echo "Pushing HORIZN..."
docker push ${DOCKER_USERNAME}/horizn:latest
docker push ${DOCKER_USERNAME}/horizn:${VERSION}
echo "✓ HORIZN pushed"
echo ""

echo "============================================"
echo "✓ Image built and pushed successfully!"
echo "============================================"
echo ""
echo "Pull command:"
echo "  docker pull ${DOCKER_USERNAME}/horizn:latest"
echo ""
echo "Run command:"
echo "  docker run -d -p 3000:3000 ${DOCKER_USERNAME}/horizn:latest"
echo ""
echo "Includes pre-configured:"
echo "  ✓ Contract addresses (Sepolia)"
echo "  ✓ Pinata JWT token"
echo "  ✓ RPC endpoint"
echo ""
