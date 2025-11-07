# HORIZN — Network Without Borders 🌐

> The first truly decentralized VPN marketplace powered by Ethereum and OpenVPN

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-success)](https://github.com/MrTimonM/Horizon)

## 🌟 Overview

HORIZN is a revolutionary decentralized VPN marketplace that connects users with VPN node operators through blockchain technology. Built on Ethereum, HORIZN eliminates centralized control, ensuring true privacy, transparency, and fair compensation for bandwidth providers.

### Key Features

✨ **Decentralized Architecture** - No single point of failure or control  
🔒 **True Privacy** - OpenVPN encryption with no logging  
💰 **Earn Cryptocurrency** - Node operators earn ETH for sharing bandwidth  
🌍 **Global Network** - Connect to nodes worldwide  
⚡ **Instant Payments** - Smart contract-based escrow and automatic payouts  
📊 **Transparent Marketplace** - All transactions on-chain  

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │◄───────►│   Frontend   │◄───────►│  Ethereum   │
│  (Buyers)   │         │   (Next.js)  │         │  (Sepolia)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               ▲                         ▲
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │  VPN Nodes   │────────►│   Smart     │
                        │  (OpenVPN)   │         │  Contracts  │
                        └──────────────┘         └─────────────┘
```

## 📦 Project Structure

```
HORIZN/
├── smart-contracts/          # Solidity smart contracts
│   ├── contracts/
│   │   ├── UserRegistry.sol     # User profile management
│   │   ├── NodeRegistry.sol     # VPN node registry
│   │   └── EscrowPayment.sol    # Payment & session management
│   ├── scripts/
│   │   └── deploy.js            # Deployment script
│   └── hardhat.config.js
│
├── frontend/                 # Next.js frontend application
│   ├── app/                     # App router pages
│   │   ├── page.tsx            # Home page
│   │   ├── marketplace/        # Browse VPN nodes
│   │   ├── dashboard/          # User dashboard
│   │   ├── purchase/           # Purchase VPN access
│   │   ├── register/           # User registration
│   │   └── become-seller/      # Seller onboarding
│   ├── components/             # React components
│   ├── config/                 # Contract addresses & ABIs
│   ├── store/                  # State management (Zustand)
│   ├── styles/                 # Global styles
│   └── utils/                  # Helper functions
│
└── node-deployment/          # VPN node deployment
    └── deploy-vpn-node.sh      # One-command deployment script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia ETH for testing

### 1. Clone the Repository

```bash
git clone https://github.com/MrTimonM/Horizon.git
cd Horizon
```

### 2. Deploy Smart Contracts (Already Deployed)

The contracts are already deployed on Sepolia:

- **UserRegistry**: `0x844a785AA74dAE31dD23Ff70A0F346a8af26D639`
- **NodeRegistry**: `0x7638b531c3CA30D47912583260982C272c2f66f1`
- **EscrowPayment**: `0x39877a33BF5B9552689858EB1e23811F7091Bb9a`

To redeploy:

```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 🔧 For VPN Node Operators

### Deploy Your Own VPN Node

Earn cryptocurrency by hosting a VPN node!

#### Requirements
- Ubuntu 20.04/22.04 VPS
- 2GB+ RAM
- Public IP address
- Wallet with some ETH for gas

#### One-Command Deployment

```bash
curl -sSL https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/deploy-vpn-node.sh | sudo bash
```

The script will:
1. ✅ Install OpenVPN and dependencies
2. ✅ Configure VPN server automatically
3. ✅ Set up API server for session management
4. ✅ Register your node on the blockchain
5. ✅ Make your node live in the marketplace

#### What You'll Need
- Node name (e.g., "My VPN Node")
- Region (e.g., "US-East", "EU-West")
- Price per GB in ETH (e.g., 0.001)
- Your wallet private key

#### After Deployment

Your node will:
- Appear in the marketplace immediately
- Accept connections from buyers
- Automatically track data usage
- Earn ETH for bandwidth served

Monitor your node:
```bash
# Check API logs
journalctl -u horizn-node -f

# Check OpenVPN status
systemctl status openvpn-server@server

# View active connections
cat /var/log/openvpn/openvpn-status.log
```

## 💻 Smart Contracts

### UserRegistry.sol
Manages user profiles with wallet names and optional IPFS profile pictures.

**Key Functions:**
- `registerUser(name, ipfsHash)` - Register new user
- `updateProfile(name, ipfsHash)` - Update profile
- `getUserProfile(address)` - Get user info

### NodeRegistry.sol
Registry for VPN nodes with pricing and metadata.

**Key Functions:**
- `registerNode(name, region, pricePerGB, bandwidth, endpoint, publicKey)` - Register VPN node
- `getActiveNodes()` - Get all active nodes
- `updateNode(nodeId, price, endpoint)` - Update node settings

### EscrowPayment.sol
Handles payments, sessions, and data usage tracking.

**Key Functions:**
- `createSession(nodeId, maxDataGB, durationSeconds)` - Purchase VPN access
- `claimPayout(sessionId, dataUsedBytes)` - Node operator claims payment
- Platform fee: 1% (goes to protocol)

## 🎨 Frontend Features

### For Buyers
- 🌐 Browse global VPN marketplace
- 🔍 Filter by region and price
- 💳 Purchase VPN access with crypto
- 📥 Download OpenVPN config files
- 📊 Track data usage in real-time
- ⏰ Monitor session expiration

### For Sellers
- 📝 Easy node registration
- 💰 Set custom pricing
- 📈 View earnings and statistics
- 🔧 Manage node status
- 📊 Track total data served

### User Experience
- 🎨 Beautiful, modern UI with Tailwind CSS
- ⚡ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🌙 Dark mode optimized
- 🔐 Secure wallet integration

## 🔒 Security

- ✅ OpenVPN protocol with AES-256 encryption
- ✅ Smart contracts audited for security
- ✅ No logging or tracking
- ✅ Escrow-based payments
- ✅ Private keys never stored

## 🛣️ Roadmap

- [x] Smart contract deployment
- [x] Frontend marketplace
- [x] VPN node deployment script
- [x] User registration with profiles
- [ ] Mobile app (iOS/Android)
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Advanced analytics dashboard
- [ ] Bandwidth proof verification
- [ ] Governance token

## 📊 Tech Stack

**Blockchain:**
- Solidity ^0.8.19
- Hardhat
- Ethers.js v6
- Sepolia Testnet

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

**VPN Infrastructure:**
- OpenVPN
- Ubuntu Linux
- Node.js
- SQLite
- Express

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenVPN for the VPN protocol
- Ethereum Foundation
- The Web3 community

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/MrTimonM/Horizon/issues)
- Email: support@horizn.network
- Discord: [Join our community](https://discord.gg/horizn)

---

**Built with ❤️ for a decentralized future**

*HORIZN - Network Without Borders*
