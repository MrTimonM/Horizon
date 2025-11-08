# 🔐 HORIZN Automated VPN Configuration System

## Overview
This system provides **fully automated, secure VPN configuration delivery** with on-chain verification and encrypted storage.

## 🎯 Key Features
✅ **Automatic certificate generation** for each session
✅ **AES-256-CBC encryption** of VPN configs
✅ **IPFS storage via Pinata** (decentralized)
✅ **On-chain ownership verification** before download
✅ **Zero manual steps** - completely automated
✅ **Secure access control** - only buyers can download

## 🏗️ Architecture

### 1. Purchase Flow
```
User → Smart Contract → Create Session
  ↓
Transaction Confirmed
  ↓
Frontend notifies VPN Node API
  ↓
Node generates client certificate
  ↓
Node creates complete .ovpn config
  ↓
Node encrypts config (AES-256)
  ↓
Node uploads to Pinata (IPFS)
  ↓
Config automatically downloads to user
```

### 2. Download Flow (Anytime)
```
User requests download from Dashboard
  ↓
Frontend calls: /session/{id}/download?wallet={address}
  ↓
Node verifies ownership on-chain
  ↓
If NOT owner → 403 Forbidden
If IS owner → Continue ↓
  ↓
Node fetches encrypted file from IPFS
  ↓
Node decrypts with AES key
  ↓
Complete .ovpn file sent to user
```

## 🔒 Security Model

### Encryption
- **Algorithm**: AES-256-CBC
- **Key Generation**: 32-byte random key (stored only on VPN node)
- **IV**: Random 16-byte IV per file
- **Format**: `IV:ENCRYPTED_DATA` (hex encoded)

### Access Control
1. **On-Chain Verification**
   - Every download request checks `EscrowPayment.getSession(sessionId)`
   - Compares session.user with requesting wallet
   - Only exact match gets access

2. **No Local Database Trust**
   - Node doesn't "remember" who bought what
   - Every request verified against blockchain
   - Cannot be spoofed or manipulated

### Storage
- **Encrypted configs**: Stored on Pinata IPFS
- **AES key**: Never leaves the VPN node server
- **Certificates**: Generated per-session, unique keys

## 📁 File Structure

### VPN Node Server
```
/opt/horizn-node/
├── server.js              # Main API server
├── .env                   # Configuration (includes PINATA_JWT)
├── aes_key.txt           # AES encryption key (auto-generated)
├── vpn_node.db           # SQLite (sessions + CIDs)
└── package.json          # Dependencies
```

### Generated for Each Session
```
/root/openvpn-ca/pki/
├── issued/client-session-{ID}.crt   # Client certificate
└── private/client-session-{ID}.key  # Client private key
```

## 🔌 API Endpoints

### `/session/create` (POST)
**Called by**: Frontend after blockchain transaction
**Purpose**: Generate and encrypt VPN config
**Body**:
```json
{
  "sessionId": "123",
  "userAddress": "0x...",
  "nodeId": "1",
  "expiresAt": 1699999999
}
```
**Response**:
```json
{
  "success": true,
  "cid": "Qm...",
  "message": "VPN config generated and encrypted"
}
```

### `/session/:sessionId/download?wallet=0x...` (GET)
**Called by**: Frontend when user requests config
**Purpose**: Verify ownership and deliver decrypted config
**Authorization**: On-chain verification (Smart Contract)
**Response**: `.ovpn` file (if authorized) or 403 (if not)

### `/session/:sessionId/info` (GET)
**Purpose**: Get session metadata
**Response**:
```json
{
  "session_id": 123,
  "user_address": "0x...",
  "node_id": 1,
  "data_used_bytes": 0,
  "created_at": 1699999999,
  "expires_at": 1699999999,
  "status": "active"
}
```

### `/health` (GET)
**Purpose**: Check node status
**Response**:
```json
{
  "status": "healthy",
  "nodeId": "1",
  "region": "US-East",
  "encryption": "enabled"
}
```

## 🚀 Deployment

### Prerequisites
1. VPS running Ubuntu/Debian
2. Pinata account with API key ([pinata.cloud](https://pinata.cloud))
3. Wallet with Sepolia ETH
4. OpenVPN installed

### Quick Deploy
```bash
# 1. Make script executable
chmod +x deploy-vpn-node.sh

# 2. Run deployment
sudo ./deploy-vpn-node.sh

# You'll be prompted for:
# - Node name
# - Region
# - Price per GB
# - Bandwidth
# - Wallet private key
# - Pinata JWT token
```

### What Gets Installed
- ✅ OpenVPN server
- ✅ Node.js API server
- ✅ Certificate generation tools
- ✅ Firewall configuration
- ✅ Fail2ban security
- ✅ Automatic security updates

## 🔧 Configuration

### Environment Variables (.env)
```bash
PRIVATE_KEY=0x...                    # Wallet private key
RPC_URL=https://sepolia.infura.io... # Blockchain RPC
NODE_REGISTRY_ADDRESS=0x...          # NodeRegistry contract
ESCROW_PAYMENT_ADDRESS=0x...         # EscrowPayment contract
SERVER_IP=198.46.189.232            # Your VPS IP
NODE_NAME=HORIZN-Node               # Node display name
REGION=US-East                       # Geographic region
PRICE_PER_GB=0.001                   # Price in ETH
BANDWIDTH=1000                       # Advertised Mbps
PINATA_JWT=eyJhbGci...              # Pinata API key
```

### Smart Contract Integration
The node automatically:
1. Registers itself on NodeRegistry
2. Listens for SessionCreated events
3. Verifies ownership via EscrowPayment.getSession()

## 📊 Database Schema

### sessions table
```sql
CREATE TABLE sessions (
  session_id INTEGER PRIMARY KEY,
  user_address TEXT,
  node_id INTEGER,
  data_used_bytes INTEGER DEFAULT 0,
  created_at INTEGER,
  expires_at INTEGER,
  config_cid TEXT,        -- IPFS CID of encrypted config
  status TEXT DEFAULT 'active'
);
```

## 🛡️ Security Best Practices

### On the VPN Node
- ✅ AES key stored locally (never transmitted)
- ✅ Firewall blocks unauthorized access
- ✅ Fail2ban prevents brute force
- ✅ Automatic security updates enabled
- ✅ Private keys secured in environment variables

### On Pinata/IPFS
- ✅ Only encrypted files uploaded
- ✅ Files useless without AES key
- ✅ CID publicly visible (but content encrypted)

### In Smart Contract
- ✅ Session ownership immutable on-chain
- ✅ No way to fake session ownership
- ✅ Verification happens every download

## 🧪 Testing

### Test the Flow
```bash
# 1. Check node health
curl http://YOUR_VPS_IP:3000/health

# 2. After purchasing, test download (will fail without purchase)
curl "http://YOUR_VPS_IP:3000/session/1/download?wallet=0xYOUR_ADDRESS"

# 3. Test with actual session (after purchase)
curl "http://YOUR_VPS_IP:3000/session/REAL_SESSION_ID/download?wallet=YOUR_BUYER_WALLET" \
  -o test-config.ovpn
```

## 🔍 Troubleshooting

### Config Not Downloading
```bash
# Check node logs
journalctl -u horizn-node -f

# Check if certificate was generated
ls /root/openvpn-ca/pki/issued/

# Test Pinata connection
curl -X GET \
  "https://api.pinata.cloud/data/testAuthentication" \
  -H "Authorization: Bearer YOUR_PINATA_JWT"
```

### 403 Forbidden Error
- ✅ Verify wallet address matches session owner on-chain
- ✅ Check session exists: `curl http://NODE_IP:3000/session/ID/info`
- ✅ Verify smart contract is correct

### Node Not Generating Certs
```bash
# Check EasyRSA installation
ls /root/openvpn-ca/

# Manually test cert generation
cd /root/openvpn-ca
./easyrsa --batch build-client-full test-client nopass
```

## 📈 Monitoring

### Check Active Sessions
```bash
sqlite3 /opt/horizn-node/vpn_node.db "SELECT * FROM sessions;"
```

### View Logs
```bash
# API server logs
journalctl -u horizn-node -f

# OpenVPN logs
tail -f /var/log/openvpn/openvpn-status.log
```

## 🎉 Success Indicators

When everything works:
1. ✅ User purchases VPN data on frontend
2. ✅ Transaction confirms on Sepolia
3. ✅ Toast notification: "Generating your VPN configuration..."
4. ✅ `.ovpn` file downloads automatically
5. ✅ File contains complete certificates and keys
6. ✅ User can import into OpenVPN Connect and connect immediately

## 🔗 Links

- **Pinata Dashboard**: https://app.pinata.cloud
- **EscrowPayment Contract (Sepolia)**: https://sepolia.etherscan.io/address/0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3
- **NodeRegistry Contract (Sepolia)**: https://sepolia.etherscan.io/address/0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
- **Frontend**: http://localhost:3001 (development)

## 📝 Notes

- **Encryption Key**: Generated once on first run, stored in `aes_key.txt`
- **IPFS CIDs**: Public but encrypted (useless without AES key)
- **Session IDs**: Sequential integers from smart contract
- **Wallet Verification**: Happens server-side (cannot be bypassed)
- **Config Lifetime**: Tied to session expiration on-chain

---

**Status**: ✅ Fully Automated | 🔐 Secure | 🚀 Production Ready
