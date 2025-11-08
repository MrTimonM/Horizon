# 🚀 HORIZN - One Command Deploy

**Network Without Borders** - Decentralized VPN Marketplace

## ⚡ Quick Start (Single Command)

```bash
docker run -d -p 3000:3000 mrtimonm/horizn:latest
```

Then open: http://localhost:3000

## ✅ What's Included

The Docker image comes **pre-configured** with:
- ✅ Sepolia testnet contract addresses
- ✅ Pinata IPFS JWT token
- ✅ RPC endpoint (Infura)
- ✅ Ready-to-use marketplace

**No configuration needed!** Just pull and run.

## 📦 Pull the Image

```bash
docker pull mrtimonm/horizn:latest
```

**Image Details:**
- Size: ~1.05GB
- Architecture: amd64, arm64
- Base: Node.js 20 Alpine
- Version: v1.0.1

## 🎯 Features

- **Marketplace**: Browse and purchase VPN nodes
- **Node Registration**: Become a VPN provider
- **Wallet Integration**: Connect with MetaMask
- **Real-time Analytics**: Track data usage
- **Blockchain Verified**: On-chain session management

## 🔗 Contract Addresses (Embedded)

```
Network: Sepolia Testnet
Node Registry: 0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
Escrow Payment: 0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3
User Registry: 0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778
```

## 🛠️ Advanced Usage

### Run in Background
```bash
docker run -d -p 3000:3000 --name horizn mrtimonm/horizn:latest
```

### View Logs
```bash
docker logs -f horizn
```

### Stop Container
```bash
docker stop horizn
docker rm horizn
```

### Use Custom Port
```bash
docker run -d -p 8080:3000 mrtimonm/horizn:latest
```

## 🌐 Links

- **Docker Hub**: https://hub.docker.com/r/mrtimonm/horizn
- **GitHub**: https://github.com/MrTimonM/Horizon
- **Documentation**: See repo for full docs

## 🎓 For Developers

Want to modify or build locally?

```bash
git clone https://github.com/MrTimonM/Horizon.git
cd Horizon
docker build -f Dockerfile.frontend -t horizn .
```

## 📱 Screenshots

Once running, you'll see:
- 🏠 Home page with project overview
- 🛒 Marketplace with available VPN nodes
- 👤 User dashboard for managing sessions
- 📊 Analytics and usage tracking

## 🔐 Security Note

The embedded JWT token and contract addresses are for **Sepolia testnet** only. Safe for testing and demonstrations.

## 💡 Use Cases

- **Privacy**: Decentralized VPN access
- **Testing**: Try Web3 VPN marketplace
- **Development**: Build on top of HORIZN
- **Education**: Learn blockchain + VPN integration

## 🆘 Support

Issues? Questions? 
- Open an issue on [GitHub](https://github.com/MrTimonM/Horizon/issues)
- Check the full documentation in the repo

---

**Built with ❤️ by the HORIZN Team**

Network Without Borders 🌍
