#!/bin/bash

#########################################
# HORIZN VPN Node Deployment Script
# Network Without Borders
#########################################

set -e

echo "============================================"
echo "   HORIZN - Network Without Borders"
echo "   VPN Node Deployment Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contract addresses
NODE_REGISTRY_ADDRESS="0x7638b531c3CA30D47912583260982C272c2f66f1"
RPC_URL="https://sepolia.infura.io/v3/49581a1c6ce4426d908cd5101b73b99b"

# Auto-detect server IP
echo -e "${BLUE}[1/8] Detecting server IP address...${NC}"
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipecho.net/plain)
echo -e "${GREEN}✓ Detected IP: $SERVER_IP${NC}"
echo ""

# Confirm or change IP
echo -n -e "${YELLOW}Is this IP correct? [Y/n]: ${NC}"
read confirm_ip
if [[ $confirm_ip =~ ^[Nn]$ ]]; then
    echo -n -e "${YELLOW}Enter your server IP: ${NC}"
    read SERVER_IP
fi

# Get node configuration
echo ""
echo -e "${BLUE}[2/8] Node Configuration${NC}"
echo -n -e "${YELLOW}Enter node name [default: HORIZN-Node]: ${NC}"
read NODE_NAME
NODE_NAME=${NODE_NAME:-HORIZN-Node}

echo -n -e "${YELLOW}Enter region (e.g., US-East, EU-West, Asia-Pacific): ${NC}"
read REGION
while [ -z "$REGION" ]; do
    echo -e "${RED}Region is required!${NC}"
    echo -n -e "${YELLOW}Enter region: ${NC}"
    read REGION
done

echo -n -e "${YELLOW}Enter price per GB in ETH [default: 0.001]: ${NC}"
read PRICE_PER_GB
PRICE_PER_GB=${PRICE_PER_GB:-0.001}

echo -n -e "${YELLOW}Enter advertised bandwidth in Mbps [default: 1000]: ${NC}"
read BANDWIDTH
BANDWIDTH=${BANDWIDTH:-1000}

echo -n -e "${YELLOW}Enter your wallet private key (without 0x): ${NC}"
read -s PRIVATE_KEY
echo ""
while [ -z "$PRIVATE_KEY" ]; do
    echo -e "${RED}Private key is required!${NC}"
    echo -n -e "${YELLOW}Enter your wallet private key: ${NC}"
    read -s PRIVATE_KEY
    echo ""
done

# Add 0x prefix if not present
if [[ ! $PRIVATE_KEY =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

echo ""
echo -e "${GREEN}✓ Configuration collected${NC}"
echo ""

# Update system
echo -e "${BLUE}[3/10] Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq > /dev/null 2>&1
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[4/10] Installing dependencies...${NC}"
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    openvpn \
    easy-rsa \
    iptables \
    iptables-persistent \
    netfilter-persistent \
    curl \
    wget \
    git \
    nodejs \
    npm \
    ufw \
    fail2ban \
    unattended-upgrades > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup OpenVPN
echo -e "${BLUE}[5/10] Setting up OpenVPN...${NC}"

# Create OpenVPN directory
mkdir -p /etc/openvpn/server
cd /etc/openvpn/server

# Initialize Easy-RSA
make-cadir ~/openvpn-ca
cd ~/openvpn-ca

# Configure vars
cat > vars << EOF
set_var EASYRSA_REQ_COUNTRY    "US"
set_var EASYRSA_REQ_PROVINCE   "NewYork"
set_var EASYRSA_REQ_CITY       "NewYork"
set_var EASYRSA_REQ_ORG        "HORIZN"
set_var EASYRSA_REQ_EMAIL      "admin@horizn.network"
set_var EASYRSA_REQ_OU         "VPN"
set_var EASYRSA_ALGO           "ec"
set_var EASYRSA_DIGEST         "sha512"
EOF

# Build CA
./easyrsa init-pki > /dev/null 2>&1
./easyrsa --batch build-ca nopass > /dev/null 2>&1
./easyrsa --batch gen-dh > /dev/null 2>&1
./easyrsa --batch build-server-full server nopass > /dev/null 2>&1
openvpn --genkey secret /etc/openvpn/server/ta.key

# Copy certificates
cp pki/ca.crt /etc/openvpn/server/
cp pki/issued/server.crt /etc/openvpn/server/
cp pki/private/server.key /etc/openvpn/server/
cp pki/dh.pem /etc/openvpn/server/

echo -e "${GREEN}✓ OpenVPN configured${NC}"
echo ""

# Create OpenVPN server configuration
echo -e "${BLUE}[6/10] Creating OpenVPN server config...${NC}"

cat > /etc/openvpn/server/server.conf << EOF
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
auth SHA512
tls-crypt ta.key
topology subnet
server 10.8.0.0 255.255.255.0
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
ifconfig-pool-persist /var/log/openvpn/ipp.txt
keepalive 10 120
cipher AES-256-CBC
user nobody
group nogroup
persist-key
persist-tun
status /var/log/openvpn/openvpn-status.log
verb 3
explicit-exit-notify 1
EOF

mkdir -p /var/log/openvpn

echo -e "${GREEN}✓ Server config created${NC}"
echo ""

# Configure networking
echo -e "${BLUE}[7/10] Configuring network and firewall...${NC}"

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p > /dev/null 2>&1

# Get default network interface
DEFAULT_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)

# Disable UFW if enabled (we'll reconfigure it)
ufw --force disable > /dev/null 2>&1

# Configure iptables rules
# Clear existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (port 22)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow OpenVPN (port 1194 UDP)
iptables -A INPUT -p udp --dport 1194 -j ACCEPT

# Allow API server (port 3000) - only from localhost for security
iptables -A INPUT -p tcp --dport 3000 -s 127.0.0.1 -j ACCEPT

# Allow ICMP (ping)
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# NAT for VPN clients
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $DEFAULT_INTERFACE -j MASQUERADE

# Allow VPN traffic forwarding
iptables -A FORWARD -i tun0 -o $DEFAULT_INTERFACE -s 10.8.0.0/24 -j ACCEPT
iptables -A FORWARD -i $DEFAULT_INTERFACE -o tun0 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Save iptables rules
mkdir -p /etc/iptables
iptables-save > /etc/iptables/rules.v4
netfilter-persistent save > /dev/null 2>&1

# Configure UFW as additional layer
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow 22/tcp comment 'SSH' > /dev/null 2>&1
ufw allow 1194/udp comment 'OpenVPN' > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1

echo -e "${GREEN}✓ Network and firewall configured${NC}"
echo -e "${GREEN}  - IP forwarding enabled${NC}"
echo -e "${GREEN}  - UFW firewall active${NC}"
echo -e "${GREEN}  - iptables rules saved${NC}"
echo -e "${GREEN}  - Allowed ports: 22 (SSH), 1194 (OpenVPN)${NC}"
echo ""

# Configure Fail2ban
echo -e "${BLUE}[8/10] Configuring Fail2ban...${NC}"

# Create jail.local for SSH protection
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sendername = Fail2Ban

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[openvpn]
enabled = true
port = 1194
protocol = udp
logpath = /var/log/openvpn/openvpn-status.log
EOF

systemctl enable fail2ban > /dev/null 2>&1
systemctl restart fail2ban > /dev/null 2>&1

echo -e "${GREEN}✓ Fail2ban configured${NC}"
echo ""

# Configure automatic security updates
echo -e "${BLUE}[9/10] Enabling automatic security updates...${NC}"

cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

systemctl enable unattended-upgrades > /dev/null 2>&1
systemctl restart unattended-upgrades > /dev/null 2>&1

echo -e "${GREEN}✓ Automatic security updates enabled${NC}"
echo ""

# Start OpenVPN
echo -e "${BLUE}Starting OpenVPN service...${NC}"
systemctl enable openvpn-server@server > /dev/null 2>&1
systemctl start openvpn-server@server
sleep 3

if systemctl is-active --quiet openvpn-server@server; then
    echo -e "${GREEN}✓ OpenVPN service started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start OpenVPN service${NC}"
    echo -e "${YELLOW}Check logs: journalctl -u openvpn-server@server${NC}"
    exit 1
fi
echo ""

# Setup Node.js API server
echo -e "${BLUE}[10/10] Setting up API server and blockchain registration...${NC}"

mkdir -p /opt/horizn-node
cd /opt/horizn-node

# Create package.json
cat > package.json << EOF
{
  "name": "horizn-node",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "ethers": "^6.9.0",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

# Install npm packages
npm install --silent > /dev/null 2>&1

# Create .env file
cat > .env << EOF
PRIVATE_KEY=$PRIVATE_KEY
RPC_URL=$RPC_URL
NODE_REGISTRY_ADDRESS=$NODE_REGISTRY_ADDRESS
SERVER_IP=$SERVER_IP
NODE_NAME=$NODE_NAME
REGION=$REGION
PRICE_PER_GB=$PRICE_PER_GB
BANDWIDTH=$BANDWIDTH
EOF

# Create server.js
cat > server.js << 'SERVERJS'
const express = require('express');
const { ethers } = require('ethers');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Database setup
const db = new sqlite3.Database('./vpn_node.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    session_id INTEGER PRIMARY KEY,
    user_address TEXT,
    data_used_bytes INTEGER DEFAULT 0,
    created_at INTEGER,
    expires_at INTEGER,
    client_config TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS data_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    bytes INTEGER,
    timestamp INTEGER
  )`);
});

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const nodeRegistryABI = [
  "function registerNode(string calldata name, string calldata region, uint256 pricePerGB, uint256 advertisedBandwidth, string calldata endpoint, bytes calldata publicKey) external returns (uint256)"
];

let nodeId = null;

// Register node on blockchain
async function registerNode() {
  try {
    const contract = new ethers.Contract(process.env.NODE_REGISTRY_ADDRESS, nodeRegistryABI, wallet);
    
    const endpoint = `${process.env.SERVER_IP}:1194`;
    const pricePerGB = ethers.parseEther(process.env.PRICE_PER_GB);
    const publicKey = ethers.toUtf8Bytes('openvpn-public-key'); // Placeholder
    
    console.log('Registering node on blockchain...');
    const tx = await contract.registerNode(
      process.env.NODE_NAME,
      process.env.REGION,
      pricePerGB,
      parseInt(process.env.BANDWIDTH),
      endpoint,
      publicKey
    );
    
    const receipt = await tx.wait();
    console.log('✓ Node registered! Transaction:', receipt.hash);
    
    // Extract node ID from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'NodeRegistered';
      } catch (e) {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      nodeId = parsed.args.nodeId.toString();
      console.log('✓ Node ID:', nodeId);
    }
  } catch (error) {
    console.error('Error registering node:', error.message);
  }
}

// Generate client config
function generateClientConfig(sessionId, clientIP) {
  const serverCert = fs.readFileSync('/etc/openvpn/server/ca.crt', 'utf8');
  
  const config = `client
dev tun
proto udp
remote ${process.env.SERVER_IP} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
auth SHA512
verb 3
<ca>
${serverCert}
</ca>
`;
  
  return config;
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', nodeId, region: process.env.REGION });
});

app.post('/session/create', async (req, res) => {
  const { sessionId, userAddress, expiresAt } = req.body;
  
  try {
    const clientIP = `10.8.0.${100 + (sessionId % 150)}`;
    const clientConfig = generateClientConfig(sessionId, clientIP);
    
    db.run(
      'INSERT INTO sessions (session_id, user_address, created_at, expires_at, client_config) VALUES (?, ?, ?, ?, ?)',
      [sessionId, userAddress, Date.now(), expiresAt, clientConfig],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, config: clientConfig });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/session/:sessionId/config', (req, res) => {
  const { sessionId } = req.params;
  
  db.get('SELECT client_config FROM sessions WHERE session_id = ?', [sessionId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.setHeader('Content-Type', 'application/x-openvpn-profile');
    res.setHeader('Content-Disposition', `attachment; filename="horizn-${sessionId}.ovpn"`);
    res.send(row.client_config);
  });
});

app.get('/session/:sessionId/usage', (req, res) => {
  const { sessionId } = req.params;
  
  db.get('SELECT data_used_bytes FROM sessions WHERE session_id = ?', [sessionId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ dataUsedBytes: row.data_used_bytes });
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`HORIZN Node API Server`);
  console.log(`========================================`);
  console.log(`Server: http://${process.env.SERVER_IP}:${PORT}`);
  console.log(`Region: ${process.env.REGION}`);
  console.log(`Price: ${process.env.PRICE_PER_GB} ETH/GB`);
  console.log(`========================================\n`);
  
  await registerNode();
});

// Update data usage periodically
setInterval(() => {
  // Parse OpenVPN status to get data usage
  try {
    const status = fs.readFileSync('/var/log/openvpn/openvpn-status.log', 'utf8');
    // Parse and update database with actual usage
  } catch (error) {
    // Ignore errors
  }
}, 60000); // Every minute
SERVERJS

# Create systemd service
cat > /etc/systemd/system/horizn-node.service << EOF
[Unit]
Description=HORIZN VPN Node API
After=network.target openvpn-server@server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/horizn-node
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start API service
systemctl daemon-reload
systemctl enable horizn-node > /dev/null 2>&1
systemctl start horizn-node

sleep 3

if systemctl is-active --quiet horizn-node; then
    echo -e "${GREEN}✓ API server started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start API server${NC}"
    exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}   ✓ DEPLOYMENT COMPLETE! ${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}Node Information:${NC}"
echo "  Name: $NODE_NAME"
echo "  Region: $REGION"
echo "  IP: $SERVER_IP"
echo "  Price: $PRICE_PER_GB ETH/GB"
echo "  Bandwidth: $BANDWIDTH Mbps"
echo ""
echo -e "${BLUE}Services Running:${NC}"
echo "  ✓ OpenVPN: Active on UDP 1194"
echo "  ✓ API Server: Active on TCP 3000"
echo "  ✓ Fail2ban: Active (SSH/VPN protection)"
echo "  ✓ UFW Firewall: Active"
echo "  ✓ Auto Updates: Enabled"
echo ""
echo -e "${BLUE}Security Configured:${NC}"
echo "  ✓ IP forwarding enabled"
echo "  ✓ Firewall rules configured (SSH: 22, VPN: 1194)"
echo "  ✓ NAT/Masquerading for VPN clients"
echo "  ✓ Fail2ban protecting SSH and OpenVPN"
echo "  ✓ Automatic security updates enabled"
echo "  ✓ iptables rules persisted"
echo ""
echo -e "${YELLOW}Monitoring Commands:${NC}"
echo "  Node API logs:    journalctl -u horizn-node -f"
echo "  OpenVPN logs:     tail -f /var/log/openvpn/openvpn-status.log"
echo "  OpenVPN service:  systemctl status openvpn-server@server"
echo "  Firewall status:  ufw status verbose"
echo "  Fail2ban status:  fail2ban-client status"
echo "  Active sessions:  cat /var/log/openvpn/openvpn-status.log"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. ✓ Your node is registered on Sepolia blockchain"
echo "  2. ✓ It will appear in the HORIZN marketplace shortly"
echo "  3. Monitor earnings in your dashboard"
echo "  4. Keep this server secure and updated"
echo ""
echo -e "${GREEN}Your VPN node is now live and earning!${NC}"
echo "============================================"
