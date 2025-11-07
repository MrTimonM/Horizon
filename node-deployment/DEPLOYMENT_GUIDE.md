# HORIZN VPN Node Deployment Script

## Overview

The `deploy-vpn-node.sh` script is a **fully automated one-command deployment** that transforms a fresh Ubuntu VPS into a production-ready HORIZN VPN node with complete security hardening.

## What It Does Automatically

### ✅ **Complete VPS Configuration (10 Steps)**

#### 1️⃣ **IP Detection & Configuration**
- Auto-detects your server's public IP address
- Allows manual override if needed
- Collects node configuration (name, region, pricing, bandwidth)

#### 2️⃣ **Configuration Collection**
- Node name (e.g., "Tokyo-Premium-01")
- Geographic region (e.g., "Asia-Pacific")
- Price per GB in ETH
- Advertised bandwidth in Mbps
- Wallet private key (secure input, hidden)

#### 3️⃣ **System Updates**
- Updates all system packages
- Upgrades to latest versions
- Ensures security patches are applied

#### 4️⃣ **Dependency Installation**
Installs everything needed:
- **OpenVPN** - VPN server software
- **Easy-RSA** - Certificate management
- **iptables** - Firewall rules
- **iptables-persistent** - Save rules across reboots
- **netfilter-persistent** - Persistent firewall config
- **Node.js & npm** - API server runtime
- **UFW** - Uncomplicated Firewall
- **Fail2ban** - Intrusion prevention
- **unattended-upgrades** - Automatic security updates

#### 5️⃣ **OpenVPN Setup**
- Initializes Easy-RSA PKI (Public Key Infrastructure)
- Generates Certificate Authority (CA)
- Creates server certificates and keys
- Generates Diffie-Hellman parameters
- Creates TLS-crypt key for extra security
- Configures OpenVPN with:
  - **AES-256-CBC** encryption
  - **SHA-512** authentication
  - **UDP port 1194**
  - **10.8.0.0/24** VPN subnet
  - DNS push (Google DNS)
  - Gateway redirect

#### 6️⃣ **OpenVPN Server Configuration**
Creates production-ready config:
```
- Protocol: UDP
- Port: 1194
- Encryption: AES-256-CBC
- Auth: SHA512
- TLS: Enabled
- Topology: Subnet
- DNS: 8.8.8.8, 8.8.4.4
- Logging: /var/log/openvpn/
```

#### 7️⃣ **Network & Firewall Configuration**

**IP Forwarding:**
- Enables IPv4 forwarding permanently
- Allows VPN traffic routing

**iptables Rules:**
- ✅ **Default Policy**: DROP incoming, ACCEPT outgoing
- ✅ **Loopback**: Allow localhost
- ✅ **Established Connections**: Allow related/established
- ✅ **SSH (22/tcp)**: Allow remote administration
- ✅ **OpenVPN (1194/udp)**: Allow VPN connections
- ✅ **API (3000/tcp)**: Localhost only (secure)
- ✅ **ICMP**: Allow ping
- ✅ **NAT/Masquerading**: Route VPN traffic through server
- ✅ **VPN Forwarding**: Allow tun0 ↔ internet traffic
- ✅ **Rules Persisted**: Survive reboots

**UFW Firewall:**
- Additional security layer
- Deny all incoming by default
- Allow SSH and OpenVPN explicitly
- Auto-enable on boot

#### 8️⃣ **Fail2ban Configuration**
Protects against brute-force attacks:
- **SSH Protection**: Max 5 attempts in 10 minutes → 1 hour ban
- **OpenVPN Protection**: Monitors VPN logs
- Auto-starts on boot
- Email notifications on ban events

#### 9️⃣ **Automatic Security Updates**
- Enables unattended-upgrades
- Auto-installs security patches
- Cleans up old packages
- Configurable reboot (default: no auto-reboot)

#### 🔟 **API Server & Blockchain Registration**

**Node.js API Server:**
- Creates Express API on port 3000
- SQLite database for session/data tracking
- Tracks data usage per session
- Generates client configs on-demand
- Monitors OpenVPN status logs

**Blockchain Registration:**
- Connects to Sepolia testnet via Infura
- Calls `NodeRegistry.registerNode()`
- Submits node details to smart contract
- Waits for transaction confirmation
- Retrieves Node ID from blockchain
- Node appears in marketplace automatically

**Systemd Service:**
- Creates `horizn-node.service`
- Auto-starts on boot
- Auto-restarts on failure
- Logs to journald

## Requirements

### Server Requirements
- **OS**: Ubuntu 20.04 or 22.04 LTS
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available
- **Network**: Public IPv4 address
- **Access**: Root or sudo privileges

### Wallet Requirements
- Ethereum wallet with private key
- Some Sepolia ETH for gas fees (~0.01 ETH)
- Get testnet ETH: https://cloud.google.com/application/web3/faucet/ethereum/sepolia

## Usage

### One-Command Deployment

```bash
curl -sSL https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/deploy-vpn-node.sh | sudo bash
```

Or download and run:

```bash
wget https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/deploy-vpn-node.sh
chmod +x deploy-vpn-node.sh
sudo ./deploy-vpn-node.sh
```

### During Installation

You'll be prompted for:

1. **Server IP Confirmation**
   ```
   Detected IP: 203.0.113.45
   Is this IP correct? [Y/n]:
   ```

2. **Node Name**
   ```
   Enter node name [default: HORIZN-Node]: Tokyo-Premium-01
   ```

3. **Region**
   ```
   Enter region (e.g., US-East, EU-West, Asia-Pacific): Asia-Pacific
   ```

4. **Price per GB**
   ```
   Enter price per GB in ETH [default: 0.001]: 0.001
   ```

5. **Bandwidth**
   ```
   Enter advertised bandwidth in Mbps [default: 1000]: 1000
   ```

6. **Private Key** (hidden input)
   ```
   Enter your wallet private key (without 0x): ****
   ```

### Installation Time

Approximately **5-10 minutes** depending on:
- Server specs
- Network speed
- Package downloads
- Blockchain confirmation time

## Post-Installation

### Verify Services

```bash
# Check OpenVPN
systemctl status openvpn-server@server

# Check API server
systemctl status horizn-node

# Check UFW firewall
ufw status verbose

# Check Fail2ban
fail2ban-client status
```

### Monitor Logs

```bash
# API server logs
journalctl -u horizn-node -f

# OpenVPN status
tail -f /var/log/openvpn/openvpn-status.log

# OpenVPN service logs
journalctl -u openvpn-server@server -f

# Fail2ban logs
tail -f /var/log/fail2ban.log
```

### View Active Sessions

```bash
cat /var/log/openvpn/openvpn-status.log
```

## Security Features

### ✅ Firewall Protection
- **UFW**: Layer 1 firewall
- **iptables**: Layer 2 firewall
- **Default deny**: All unused ports blocked
- **Minimal exposure**: Only SSH (22) and VPN (1194) open

### ✅ Intrusion Prevention
- **Fail2ban**: Monitors SSH and VPN
- **Auto-banning**: Blocks repeated failed attempts
- **Configurable**: Ban time, attempts, etc.

### ✅ Network Security
- **NAT/Masquerading**: Hides client IPs
- **IP Forwarding**: Controlled routing
- **Stateful Firewall**: Tracks connections
- **TLS-crypt**: Extra OpenVPN layer

### ✅ System Security
- **Auto-updates**: Security patches applied automatically
- **Minimal packages**: Only required software installed
- **Service isolation**: Systemd confinement
- **Log monitoring**: Centralized logging

### ✅ VPN Security
- **AES-256-CBC**: Military-grade encryption
- **SHA-512**: Strong authentication
- **TLS-crypt**: Additional DDoS protection
- **Certificate-based**: No password auth

## Troubleshooting

### OpenVPN Won't Start

```bash
# Check status
systemctl status openvpn-server@server

# View logs
journalctl -u openvpn-server@server -n 50

# Test config
openvpn --config /etc/openvpn/server/server.conf
```

### API Server Issues

```bash
# Check service
systemctl status horizn-node

# View logs
journalctl -u horizn-node -n 50

# Restart service
systemctl restart horizn-node
```

### Blockchain Registration Failed

```bash
# Check logs
journalctl -u horizn-node | grep "blockchain"

# Verify private key
cat /opt/horizn-node/.env | grep PRIVATE_KEY

# Check Sepolia balance
# Need ETH for gas fees
```

### Firewall Blocking Connections

```bash
# Check UFW status
ufw status verbose

# Allow specific port
ufw allow 1194/udp

# Check iptables
iptables -L -v -n
```

### Can't SSH After Setup

If locked out:
1. Use VPS provider's console/VNC access
2. Check UFW: `ufw status`
3. Temporarily disable: `ufw disable`
4. Re-enable SSH: `ufw allow 22/tcp`
5. Re-enable firewall: `ufw enable`

## Files Created

### Configuration Files
```
/etc/openvpn/server/server.conf       # OpenVPN config
/etc/openvpn/server/ca.crt            # CA certificate
/etc/openvpn/server/server.crt        # Server cert
/etc/openvpn/server/server.key        # Server key
/etc/openvpn/server/dh.pem            # DH params
/etc/openvpn/server/ta.key            # TLS-crypt key
```

### Node Files
```
/opt/horizn-node/server.js            # API server
/opt/horizn-node/package.json         # Dependencies
/opt/horizn-node/.env                 # Configuration
/opt/horizn-node/vpn_node.db          # SQLite database
```

### System Files
```
/etc/systemd/system/horizn-node.service           # Systemd service
/etc/iptables/rules.v4                            # Firewall rules
/etc/fail2ban/jail.local                          # Fail2ban config
/etc/apt/apt.conf.d/50unattended-upgrades         # Auto-updates
/var/log/openvpn/openvpn-status.log               # OpenVPN status
```

## Uninstallation

To remove the VPN node:

```bash
# Stop services
systemctl stop horizn-node openvpn-server@server

# Disable services
systemctl disable horizn-node openvpn-server@server

# Remove files
rm -rf /opt/horizn-node
rm -rf /etc/openvpn/server
rm /etc/systemd/system/horizn-node.service

# Reset firewall (optional)
ufw --force reset
iptables -F
iptables -X
iptables -t nat -F
```

## Smart Contract Integration

The script automatically registers your node on the **Sepolia testnet** by calling:

```solidity
NodeRegistry.registerNode(
    name,           // "Tokyo-Premium-01"
    region,         // "Asia-Pacific"
    pricePerGB,     // 0.001 ETH (in wei)
    bandwidth,      // 1000 Mbps
    endpoint,       // "203.0.113.45:1194"
    publicKey       // OpenVPN public key
)
```

### Contract Addresses (Sepolia)
- **NodeRegistry**: `0x7638b531c3CA30D47912583260982C272c2f66f1`
- **EscrowPayment**: `0x39877a33BF5B9552689858EB1e23811F7091Bb9a`
- **UserRegistry**: `0x844a785AA74dAE31dD23Ff70A0F346a8af26D639`

### RPC Endpoint
- **Infura Sepolia**: `https://sepolia.infura.io/v3/49581a1c6ce4426d908cd5101b73b99b`

## Support

- **Documentation**: https://horizn.network/docs
- **Marketplace**: https://horizn.network/marketplace
- **Dashboard**: https://horizn.network/dashboard

## License

MIT License - HORIZN Network Without Borders
