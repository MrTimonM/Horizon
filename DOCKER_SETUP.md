# HORIZN Docker Setup Guide

This project is fully dockerized for easy deployment and scalability.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MrTimonM/Horizon.git
cd Horizon
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Required variables:
- `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
- `SERVER_IP`: Your server's public IP address
- `PINATA_JWT`: Your Pinata JWT token for IPFS storage
- `REGION`: Your server region (e.g., US-East, EU-West)

### 3. Build and Run

#### Option A: Run All Services

```bash
docker-compose up -d
```

#### Option B: Run Individual Services

Frontend only:
```bash
docker-compose up -d frontend
```

VPN Node only:
```bash
docker-compose up -d vpn-node
```

### 4. Check Status

```bash
docker-compose ps
docker-compose logs -f
```

## Services

### Frontend (Port 3000)
- Next.js web application
- Marketplace interface
- User dashboard

### VPN Node (Ports 443, 3001)
- OpenVPN server (port 443)
- Node.js API server (port 3001)
- Blockchain integration
- Data usage tracking

## Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f vpn-node
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container
```bash
# Frontend container
docker exec -it horizn-frontend sh

# VPN Node container
docker exec -it horizn-vpn-node bash
```

## Volumes

Persistent data is stored in Docker volumes:
- `openvpn-data`: OpenVPN certificates and configuration
- `vpn-logs`: VPN connection logs
- `node-data`: Node.js application data and database

### Backup Volumes
```bash
docker run --rm -v openvpn-data:/data -v $(pwd):/backup ubuntu tar czf /backup/openvpn-backup.tar.gz /data
```

### Restore Volumes
```bash
docker run --rm -v openvpn-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/openvpn-backup.tar.gz -C /
```

## Production Deployment

### Using Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml horizn
```

### Using Kubernetes
Generate Kubernetes manifests:
```bash
kompose convert -f docker-compose.yml
kubectl apply -f .
```

## Troubleshooting

### VPN Node Not Starting
```bash
docker logs horizn-vpn-node
# Check if /dev/net/tun is available
docker exec horizn-vpn-node ls -la /dev/net/tun
```

### Permission Issues
Ensure the container runs with necessary capabilities:
```bash
docker-compose up -d --force-recreate
```

### Network Issues
```bash
# Check network connectivity
docker network ls
docker network inspect horizn_horizn-network
```

## Security Notes

- Never commit `.env` file with real credentials
- Use secrets management in production (Docker Secrets, Kubernetes Secrets)
- Regularly update base images: `docker-compose pull`
- Monitor container logs for security events

## Development

### Hot Reload (Frontend)
For development with hot reload:
```bash
cd frontend
npm run dev
```

### Build Production Images
```bash
docker build -f Dockerfile.frontend -t horizn/frontend:latest .
docker build -f Dockerfile.vpn-node -t horizn/vpn-node:latest .
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/MrTimonM/Horizon/issues
- Documentation: Check other .md files in the repository
