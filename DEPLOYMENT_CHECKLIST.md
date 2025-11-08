# 🚀 HORIZN VPN Node Deployment Checklist

## Before You Start

### ✅ Prerequisites
- [ ] Ubuntu/Debian VPS (2GB+ RAM recommended)
- [ ] Root or sudo access
- [ ] Public IP address
- [ ] Wallet with Sepolia ETH (~0.01 ETH for deployment)
- [ ] Pinata account → Get JWT from [app.pinata.cloud/developers/api-keys](https://app.pinata.cloud/developers/api-keys)

### ✅ Information You'll Need
- [ ] Node name (e.g., "HORIZN-US-East-01")
- [ ] Region (e.g., "US-East", "EU-West", "Asia-Pacific")
- [ ] Price per GB in ETH (e.g., 0.001)
- [ ] Advertised bandwidth in Mbps (e.g., 1000)
- [ ] Your wallet private key (keep secure!)
- [ ] Your Pinata JWT token

## Deployment Steps

### 1️⃣ Get the Deployment Script
```bash
# Download or upload the deploy script to your VPS
wget https://your-repo/deploy-vpn-node.sh
# OR
scp deploy-vpn-node.sh root@your-vps-ip:/root/

# Make it executable
chmod +x deploy-vpn-node.sh
```

### 2️⃣ Run the Deployment
```bash
sudo ./deploy-vpn-node.sh
```

**You'll be prompted for:**
1. Node name
2. Region
3. Price per GB
4. Bandwidth
5. Wallet private key (hidden input)
6. Pinata JWT token (hidden input)

**Expected time:** 5-10 minutes

### 3️⃣ Verify Installation

#### Check Services
```bash
# OpenVPN status
systemctl status openvpn-server@server

# API Server status
systemctl status horizn-node

# Firewall status
ufw status
```

All should show `active (running)` or `active`.

#### Test API
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "nodeId": "1",
  "region": "US-East",
  "encryption": "enabled"
}
```

#### Check Logs
```bash
# API logs
journalctl -u horizn-node -n 50

# Look for:
# ✓ Node registered! Transaction: 0x...
# ✓ Node ID: 1
# ✓ Generated new AES encryption key
```

### 4️⃣ Verify Blockchain Registration

Visit Sepolia Etherscan (NodeRegistry):
```
https://sepolia.etherscan.io/address/0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
```

- [ ] Find your registration transaction
- [ ] Verify node details are correct
- [ ] Copy your Node ID

### 5️⃣ Test on Frontend

1. Go to marketplace
2. Find your node in the list
3. Verify details match (name, region, price, bandwidth)

## Post-Deployment

### ✅ Security Checks
- [ ] Firewall is active (`ufw status`)
- [ ] Only ports 22 (SSH) and 1194 (OpenVPN) are open
- [ ] Fail2ban is running (`systemctl status fail2ban`)
- [ ] Automatic updates enabled

### ✅ Backup Critical Files
```bash
# Backup these files to a secure location:
/opt/horizn-node/.env           # Configuration
/opt/horizn-node/aes_key.txt    # Encryption key
/root/openvpn-ca/pki/ca.crt     # CA certificate
/root/openvpn-ca/pki/ca.key     # CA private key
```

**Store securely offline!**

### ✅ Monitor Your Node
```bash
# Watch logs live
journalctl -u horizn-node -f

# Check OpenVPN connections
cat /var/log/openvpn/openvpn-status.log

# Check session database
sqlite3 /opt/horizn-node/vpn_node.db "SELECT * FROM sessions;"
```

## Testing the Full Flow

### Test Purchase (Frontend)
1. [ ] Connect wallet to frontend
2. [ ] Navigate to your node in marketplace
3. [ ] Click "Purchase Access"
4. [ ] Enter amount (e.g., 1 GB)
5. [ ] Confirm transaction in MetaMask
6. [ ] Wait for confirmation
7. [ ] `.ovpn` file should download automatically

### Test Config Download (Manual)
```bash
# After a purchase, test download endpoint
curl "http://YOUR_VPS_IP:3000/session/1/download?wallet=BUYER_WALLET_ADDRESS" \
  -o test-config.ovpn

# Should either:
# - Download .ovpn file (if you're the buyer)
# - Return 403 (if you're not the buyer)
```

### Test Config Import
1. [ ] Download OpenVPN Connect
   - **Windows/Mac**: https://openvpn.net/client/
   - **Android**: Play Store
   - **iOS**: App Store
2. [ ] Import the `.ovpn` file
3. [ ] Connect to VPN
4. [ ] Verify connection (check IP: https://whatismyipaddress.com)

## Troubleshooting

### Issue: Node not showing in marketplace
**Check:**
```bash
# View registration logs
journalctl -u horizn-node | grep "Node registered"

# Check blockchain
# Visit: https://sepolia.etherscan.io/address/0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244

# Restart node service
systemctl restart horizn-node
```

### Issue: Config download fails (403)
**Verify:**
```bash
# Check session ownership on-chain
# Use Etherscan to view EscrowPayment contract
# Function: getSession(sessionId)
# Verify user address matches

# Check node logs
journalctl -u horizn-node -n 100 | grep "Unauthorized"
```

### Issue: OpenVPN won't connect
**Check:**
```bash
# OpenVPN service status
systemctl status openvpn-server@server

# Firewall rules
iptables -L -n | grep 1194
ufw status | grep 1194

# Test port is open
nc -zv YOUR_VPS_IP 1194
```

### Issue: Cert generation fails
```bash
# Check EasyRSA
ls /root/openvpn-ca/

# Reinitialize if needed
cd /root/openvpn-ca
./easyrsa init-pki
./easyrsa build-ca nopass

# Restart node
systemctl restart horizn-node
```

## Maintenance

### Daily
- [ ] Check node is running: `systemctl status horizn-node`
- [ ] Monitor active sessions: `sqlite3 /opt/horizn-node/vpn_node.db "SELECT COUNT(*) FROM sessions WHERE status='active';"`

### Weekly
- [ ] Review logs for errors: `journalctl -u horizn-node --since "1 week ago" | grep -i error`
- [ ] Check disk space: `df -h`
- [ ] Verify firewall: `ufw status`

### Monthly
- [ ] Backup `.env` and `aes_key.txt`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Review earnings on dashboard

## Support

### Getting Help
- **Documentation**: `/HORIZN/AUTOMATED_VPN_CONFIG_SYSTEM.md`
- **Logs Location**: `/var/log/` and `journalctl -u horizn-node`
- **Config Location**: `/opt/horizn-node/`

### Common Commands
```bash
# Restart node
systemctl restart horizn-node

# View logs
journalctl -u horizn-node -f

# Check database
sqlite3 /opt/horizn-node/vpn_node.db ".tables"

# Test Pinata connection
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "Authorization: Bearer $(cat /opt/horizn-node/.env | grep PINATA_JWT | cut -d= -f2)"
```

## Success Criteria

Your node is fully operational when:
- ✅ `systemctl status horizn-node` shows "active (running)"
- ✅ `curl http://localhost:3000/health` returns JSON
- ✅ Node appears in marketplace frontend
- ✅ Test purchase works end-to-end
- ✅ `.ovpn` config downloads automatically
- ✅ VPN connection works in OpenVPN Connect

---

**🎉 Congratulations!** Your HORIZN VPN node is now earning!
