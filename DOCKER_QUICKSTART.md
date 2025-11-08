# Quick Start with Docker

The HORIZN project is now fully dockerized and available on Docker Hub! Anyone can pull and run the project with just a few commands.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start (Using Pre-built Images)

### 1. Pull the images from Docker Hub

```bash
docker pull mrtimonm/horizn-frontend:latest
docker pull mrtimonm/horizn-vpn-node:latest
```

### 2. Clone the repository (for docker-compose.yml and .env)

```bash
git clone https://github.com/MrTimonM/Horizon.git
cd Horizon
```

### 3. Configure environment variables

```bash
cp .env.example .env
nano .env  # Edit with your values
```

Required variables:
- `PRIVATE_KEY`: Your wallet private key
- `SERVER_IP`: Your server's public IP
- `PINATA_JWT`: Pinata JWT token
- `REGION`: Server region (e.g., US-East, EU-West)

### 4. Run with docker-compose

```bash
docker-compose up -d
```

That's it! The services are now running:
- Frontend: http://localhost:3000
- VPN Node API: http://localhost:3001

## View Logs

```bash
docker-compose logs -f
```

## Stop Services

```bash
docker-compose down
```

## Available Docker Images

| Image | Description | Size | Pull Command |
|-------|-------------|------|--------------|
| `mrtimonm/horizn-frontend` | Next.js frontend application | ~300MB | `docker pull mrtimonm/horizn-frontend:latest` |
| `mrtimonm/horizn-vpn-node` | OpenVPN + Node.js API server | ~1.2GB | `docker pull mrtimonm/horizn-vpn-node:latest` |

## For Developers: Build Locally

If you want to build the images yourself:

```bash
# Build only (without pushing)
docker-compose build

# Build and push to your own Docker Hub
./build-and-push.sh
```

## Detailed Documentation

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for comprehensive documentation including:
- Advanced configuration
- Production deployment
- Volume management
- Troubleshooting
- Security best practices

## Links

- **GitHub**: https://github.com/MrTimonM/Horizon
- **Docker Hub Frontend**: https://hub.docker.com/r/mrtimonm/horizn-frontend
- **Docker Hub VPN Node**: https://hub.docker.com/r/mrtimonm/horizn-vpn-node

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/MrTimonM/Horizon/issues).
