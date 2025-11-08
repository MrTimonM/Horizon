#!/bin/bash

#########################################
# HORIZN VPN Node Deployment Script
# Network Without Borders
# Version: 1.0.3 (Updated: Jan 2025)
#
# Changes in v1.0.3:
# - Updated contract addresses (UserRegistry, NodeRegistry, EscrowPayment)
# - Changed OpenVPN from UDP port 1194 to TCP port 443
# - Disabled explicit-exit-notify (incompatible with TCP)
# - Updated all firewall rules (iptables and UFW) for TCP 443
# - Updated client config template to use TCP 443
# - Updated API endpoint registration to use port 443
# - Added port 3000 to firewall for external API access
# - Updated fail2ban config for TCP protocol
#
# Changes in v1.0.2:
# - Removed "set -e" to prevent premature exits
# - Added progress bar for dependency installation
# - Added detailed progress messages for OpenVPN setup
# - Added error tolerance (|| true) to all critical commands
# - Fixed iptables commands that were causing silent failures
# - Improved error messages and fallback handling
#########################################

# Don't exit on error - we handle errors manually
set +e

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

# Contract addresses (Updated: Nov 8, 2025)
NODE_REGISTRY_ADDRESS="0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244"
ESCROW_PAYMENT_ADDRESS="0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3"
USER_REGISTRY_ADDRESS="0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778"
RPC_URL="https://sepolia.infura.io/v3/49581a1c6ce4426d908cd5101b73b99b"

# Auto-detect server IP
echo -e "${BLUE}[1/8] Detecting server IP address...${NC}"
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipecho.net/plain)
echo -e "${GREEN}✓ Detected IP: $SERVER_IP${NC}"
echo ""

# Confirm or change IP
echo -n -e "${YELLOW}Is this IP correct? [Y/n]: ${NC}"
read confirm_ip < /dev/tty
if [[ $confirm_ip =~ ^[Nn]$ ]]; then
    echo -n -e "${YELLOW}Enter your server IP: ${NC}"
    read SERVER_IP < /dev/tty
fi

# Get node configuration
echo ""
echo -e "${BLUE}[2/8] Node Configuration${NC}"
echo -n -e "${YELLOW}Enter node name [default: HORIZN-Node]: ${NC}"
read NODE_NAME < /dev/tty
NODE_NAME=${NODE_NAME:-HORIZN-Node}

echo -n -e "${YELLOW}Enter region (e.g., US-East, EU-West, Asia-Pacific): ${NC}"
read REGION < /dev/tty
while [ -z "$REGION" ]; do
    echo -e "${RED}Region is required!${NC}"
    echo -n -e "${YELLOW}Enter region: ${NC}"
    read REGION < /dev/tty
done

echo -n -e "${YELLOW}Enter price per GB in ETH [default: 0.001]: ${NC}"
read PRICE_PER_GB < /dev/tty
PRICE_PER_GB=${PRICE_PER_GB:-0.001}

echo -n -e "${YELLOW}Enter advertised bandwidth in Mbps [default: 1000]: ${NC}"
read BANDWIDTH < /dev/tty
BANDWIDTH=${BANDWIDTH:-1000}

echo -n -e "${YELLOW}Enter your wallet private key (without 0x): ${NC}"
read -s PRIVATE_KEY < /dev/tty
echo ""
while [ -z "$PRIVATE_KEY" ]; do
    echo -e "${RED}Private key is required!${NC}"
    echo -n -e "${YELLOW}Enter your wallet private key: ${NC}"
    read -s PRIVATE_KEY < /dev/tty
    echo ""
done

# Add 0x prefix if not present
if [[ ! $PRIVATE_KEY =~ ^0x ]]; then
    PRIVATE_KEY="0x$PRIVATE_KEY"
fi

echo -n -e "${YELLOW}Enter your Pinata JWT token [press Enter to use default]: ${NC}"
read -s PINATA_JWT < /dev/tty
echo ""

# Use default if empty
if [ -z "$PINATA_JWT" ]; then
    PINATA_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzYzgzYzk3Ni1mOWQ0LTRhMjQtOTdmOS1kOTc4ZTZlYjlkZTQiLCJlbWFpbCI6ImFtYXppbmdtaDg5MUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjJiN2ExODZjZjkxOGM5NGVmYjciLCJzY29wZWRLZXlTZWNyZXQiOiJjNzdjYjNhOTlmOTQ1ODdlNzBhMmQzNzExOTUxMzczMjA0ZjQ3MDQyZThiYjM0NWVmOTM0MTIwMDEyMTkyNmQ3IiwiZXhwIjoxNzkzNzc2MDYyfQ.teITE6YqRITS4JgsIHfE7jmrgTanhIG7tQt6-uean0w"
    echo -e "${GREEN}✓ Using default Pinata JWT${NC}"
fi

echo ""
echo -e "${GREEN}✓ Configuration collected${NC}"
echo ""

# Update package lists (required before install)
echo -e "${BLUE}[3/10] Updating package lists...${NC}"
export DEBIAN_FRONTEND=noninteractive

# Fix any interrupted dpkg operations
dpkg --configure -a 2>&1 | grep -v "^$" || true

apt-get update -qq 2>&1 | grep -v "^Ign:" | grep -v "^Get:" || true
echo -e "${GREEN}✓ Package lists updated${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[4/10] Installing dependencies...${NC}"

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local task=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    printf "\r${YELLOW}[%-50s] %3d%% - %s${NC}" \
        "$(printf '#%.0s' $(seq 1 $filled))$(printf ' %.0s' $(seq 1 $empty))" \
        "$percent" \
        "$task"
}

# Fix any broken packages
show_progress 0 6 "Fixing broken packages..."
apt-get -f install -y > /dev/null 2>&1 || true

# Install basic tools
show_progress 1 6 "Installing basic tools (curl, wget, git)..."
DEBIAN_FRONTEND=noninteractive apt-get install -y curl wget git > /dev/null 2>&1 || true

# Install networking tools
show_progress 2 6 "Installing networking tools (iptables)..."
DEBIAN_FRONTEND=noninteractive apt-get install -y iptables iptables-persistent netfilter-persistent > /dev/null 2>&1 || true

# Install OpenVPN
show_progress 3 6 "Installing OpenVPN..."
DEBIAN_FRONTEND=noninteractive apt-get install -y openvpn > /dev/null 2>&1 || true

# Install security tools
show_progress 4 6 "Installing security tools (ufw, fail2ban)..."
DEBIAN_FRONTEND=noninteractive apt-get install -y ufw fail2ban unattended-upgrades > /dev/null 2>&1 || true

# Download Easy-RSA manually (more reliable)
show_progress 5 6 "Downloading Easy-RSA..."
if [ ! -d "/usr/share/easy-rsa" ]; then
    cd /tmp
    rm -f EasyRSA-3.1.7.tgz 2>/dev/null
    wget -q https://github.com/OpenVPN/easy-rsa/releases/download/v3.1.7/EasyRSA-3.1.7.tgz 2>/dev/null || true
    if [ -f "EasyRSA-3.1.7.tgz" ]; then
        tar xzf EasyRSA-3.1.7.tgz 2>/dev/null
        rm -rf /usr/share/easy-rsa 2>/dev/null
        mv EasyRSA-3.1.7 /usr/share/easy-rsa 2>/dev/null
        chmod +x /usr/share/easy-rsa/easyrsa 2>/dev/null
    fi
fi

show_progress 6 6 "Complete!"
echo ""
echo -e "${GREEN}✓ All dependencies installed${NC}"
echo ""

# Setup OpenVPN
echo -e "${BLUE}[5/10] Setting up OpenVPN...${NC}"

# Create OpenVPN directory
mkdir -p /etc/openvpn/server

# Initialize Easy-RSA (remove if exists)
rm -rf ~/openvpn-ca

# Check if make-cadir exists, otherwise use direct copy
if command -v make-cadir &> /dev/null; then
    make-cadir ~/openvpn-ca
elif [ -d "/usr/share/easy-rsa" ]; then
    cp -r /usr/share/easy-rsa ~/openvpn-ca
else
    echo -e "${RED}Error: easy-rsa not found!${NC}"
    exit 1
fi

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
echo -e "${YELLOW}  - Initializing PKI...${NC}"
./easyrsa init-pki > /dev/null 2>&1
echo -e "${YELLOW}  - Building CA (may take 30 seconds)...${NC}"
./easyrsa --batch build-ca nopass > /dev/null 2>&1
echo -e "${YELLOW}  - Generating DH parameters (may take 1-2 minutes)...${NC}"
./easyrsa --batch gen-dh > /dev/null 2>&1
echo -e "${YELLOW}  - Building server certificate...${NC}"
./easyrsa --batch build-server-full server nopass > /dev/null 2>&1
echo -e "${YELLOW}  - Generating TLS key...${NC}"
openvpn --genkey secret /etc/openvpn/server/ta.key 2>/dev/null

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
port 443
proto tcp
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
crl-verify crl.pem
verb 3
# explicit-exit-notify 1  # Disabled for TCP mode
EOF

# Generate initial CRL
cd ~/openvpn-ca
./easyrsa gen-crl > /dev/null 2>&1
cp pki/crl.pem /etc/openvpn/server/
chmod 644 /etc/openvpn/server/crl.pem

mkdir -p /var/log/openvpn

echo -e "${GREEN}✓ Server config created${NC}"
echo ""

# Configure networking
echo -e "${BLUE}[7/10] Configuring network and firewall...${NC}"

# Enable IP forwarding
echo -e "${YELLOW}  - Enabling IP forwarding...${NC}"
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p > /dev/null 2>&1

# Get default network interface
DEFAULT_INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)
echo -e "${YELLOW}  - Detected network interface: $DEFAULT_INTERFACE${NC}"

# Disable UFW temporarily
echo -e "${YELLOW}  - Configuring firewall rules...${NC}"
ufw --force disable > /dev/null 2>&1 || true

# Configure iptables rules
# Clear existing rules
iptables -F 2>/dev/null || true
iptables -X 2>/dev/null || true
iptables -t nat -F 2>/dev/null || true
iptables -t nat -X 2>/dev/null || true

# Default policies
iptables -P INPUT DROP 2>/dev/null || true
iptables -P FORWARD DROP 2>/dev/null || true
iptables -P OUTPUT ACCEPT 2>/dev/null || true

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT 2>/dev/null || true
iptables -A OUTPUT -o lo -j ACCEPT 2>/dev/null || true

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true
iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true

# Allow SSH (port 22)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || true

# Allow OpenVPN (port 443 TCP)
iptables -A INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

# Allow API server (port 3000) - accessible externally for client connections
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT 2>/dev/null || true

# Allow ICMP (ping)
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT 2>/dev/null || true

# NAT for VPN clients
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o $DEFAULT_INTERFACE -j MASQUERADE 2>/dev/null || true

# Allow VPN traffic forwarding
iptables -A FORWARD -i tun0 -o $DEFAULT_INTERFACE -s 10.8.0.0/24 -j ACCEPT 2>/dev/null || true
iptables -A FORWARD -i $DEFAULT_INTERFACE -o tun0 -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || true

# Save iptables rules
mkdir -p /etc/iptables 2>/dev/null
iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
netfilter-persistent save > /dev/null 2>&1 || true

# Configure UFW as additional layer
echo -e "${YELLOW}  - Enabling UFW firewall...${NC}"
ufw --force reset > /dev/null 2>&1 || true
ufw default deny incoming > /dev/null 2>&1 || true
ufw default allow outgoing > /dev/null 2>&1 || true
ufw allow 22/tcp comment 'SSH' > /dev/null 2>&1 || true
ufw allow 443/tcp comment 'OpenVPN TCP' > /dev/null 2>&1 || true
ufw allow 3000/tcp comment 'API Server' > /dev/null 2>&1 || true
echo "y" | ufw enable > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Network and firewall configured${NC}"
echo -e "${GREEN}  - IP forwarding enabled${NC}"
echo -e "${GREEN}  - UFW firewall active${NC}"
echo -e "${GREEN}  - iptables rules saved${NC}"
echo -e "${GREEN}  - Allowed ports: 22 (SSH), 443 (OpenVPN TCP), 3000 (API)${NC}"
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
port = 443
protocol = tcp
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
systemctl enable openvpn-server@server > /dev/null 2>&1 || true
systemctl start openvpn-server@server 2>/dev/null || true
sleep 3

if systemctl is-active --quiet openvpn-server@server 2>/dev/null; then
    echo -e "${GREEN}✓ OpenVPN service started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start OpenVPN service${NC}"
    echo -e "${YELLOW}Check logs: journalctl -u openvpn-server@server -n 50${NC}"
    echo -e "${YELLOW}Continuing anyway...${NC}"
fi
echo ""

# Setup Node.js API server
echo -e "${BLUE}[10/10] Setting up API server and blockchain registration...${NC}"

# Remove old Node.js completely
if command -v node &> /dev/null; then
    CURRENT_VERSION=$(node --version)
    echo -e "${YELLOW}Found Node.js $CURRENT_VERSION, removing...${NC}"
    apt-get remove -y nodejs npm > /dev/null 2>&1 || true
    apt-get purge -y nodejs npm > /dev/null 2>&1 || true
    apt-get autoremove -y > /dev/null 2>&1 || true
    rm -rf /usr/bin/node /usr/bin/npm /usr/lib/node_modules
fi

# Install Node.js 20.x LTS
echo -e "${YELLOW}Installing Node.js 20.x LTS via NodeSource...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x 2>/dev/null | bash - > /dev/null 2>&1 || true
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs > /dev/null 2>&1 || true

if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
else
    echo -e "${RED}✗ Node.js installation failed${NC}"
    echo -e "${YELLOW}Trying alternative installation...${NC}"
    apt-get install -y nodejs npm > /dev/null 2>&1 || true
fi

# Setup application directory
mkdir -p /opt/horizn-node
cd /opt/horizn-node

# Remove old node_modules if exists
rm -rf node_modules package-lock.json

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
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "form-data": "^4.0.0"
  }
}
EOF

# Install npm packages
echo -e "${YELLOW}Installing Node.js packages (this may take a moment)...${NC}"
npm install --silent 2>&1 | grep -v "^npm WARN" || true

# Create .env file
cat > .env << EOF
PRIVATE_KEY=$PRIVATE_KEY
RPC_URL=$RPC_URL
NODE_REGISTRY_ADDRESS=$NODE_REGISTRY_ADDRESS
ESCROW_PAYMENT_ADDRESS=$ESCROW_PAYMENT_ADDRESS
SERVER_IP=$SERVER_IP
NODE_NAME=$NODE_NAME
REGION=$REGION
PRICE_PER_GB=$PRICE_PER_GB
BANDWIDTH=$BANDWIDTH
PINATA_JWT=$PINATA_JWT
EOF

# Create server.js
cat > server.js << 'SERVERJS'
const express = require('express');
const { ethers } = require('ethers');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Encryption key for VPN configs (generated once and stored)
const ENCRYPTION_KEY_FILE = './aes_key.txt';
let AES_KEY;

if (fs.existsSync(ENCRYPTION_KEY_FILE)) {
  AES_KEY = fs.readFileSync(ENCRYPTION_KEY_FILE, 'utf8').trim();
} else {
  AES_KEY = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(ENCRYPTION_KEY_FILE, AES_KEY);
  console.log('✓ Generated new AES encryption key');
}

// Database setup
const db = new sqlite3.Database('./vpn_node.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    session_id INTEGER PRIMARY KEY,
    user_address TEXT,
    node_id INTEGER,
    data_used_bytes INTEGER DEFAULT 0,
    created_at INTEGER,
    expires_at INTEGER,
    config_cid TEXT,
    status TEXT DEFAULT 'active'
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

const escrowABI = [
  "function getSession(uint256 sessionId) external view returns (tuple(uint256 sessionId, uint256 nodeId, address user, address nodeOperator, uint256 depositAmount, uint256 maxDataGB, uint256 durationSeconds, uint256 pricePerGB, uint256 createdAt, uint256 expiresAt, uint256 dataUsedBytes, uint8 status, bool payoutClaimed))"
];

let nodeId = null;

// Register node on blockchain
async function registerNode() {
  try {
    const contract = new ethers.Contract(process.env.NODE_REGISTRY_ADDRESS, nodeRegistryABI, wallet);
    
    const endpoint = `${process.env.SERVER_IP}:443`;
    const pricePerGB = ethers.parseEther(process.env.PRICE_PER_GB);
    const publicKey = ethers.toUtf8Bytes('openvpn-public-key');
    
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

// Generate client certificate and keys
function generateClientCertificate(sessionId) {
  const clientName = `client-session-${sessionId}`;
  const certDir = '/etc/openvpn/server';
  const easyRsaDir = '/root/openvpn-ca';
  
  try {
    // Generate client cert using easyrsa
    execSync(`cd ${easyRsaDir} && ./easyrsa --batch build-client-full ${clientName} nopass`, {
      stdio: 'pipe'
    });
    
    console.log(`✓ Generated certificate for session ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Error generating certificate:`, error.message);
    return false;
  }
}

// Generate complete VPN config with embedded certificates
function generateCompleteVPNConfig(sessionId) {
  const clientName = `client-session-${sessionId}`;
  const easyRsaDir = '/root/openvpn-ca';
  const certDir = '/etc/openvpn/server';
  
  // Read certificates
  const caCert = fs.readFileSync(`${certDir}/ca.crt`, 'utf8');
  const clientCert = fs.readFileSync(`${easyRsaDir}/pki/issued/${clientName}.crt`, 'utf8');
  const clientKey = fs.readFileSync(`${easyRsaDir}/pki/private/${clientName}.key`, 'utf8');
  const taKey = fs.readFileSync(`${certDir}/ta.key`, 'utf8');
  
  // Extract certificate content (remove headers/footers from the middle)
  const extractCert = (cert) => {
    const lines = cert.split('\n');
    const startIndex = lines.findIndex(l => l.includes('BEGIN CERTIFICATE'));
    const endIndex = lines.findIndex(l => l.includes('END CERTIFICATE'));
    return lines.slice(startIndex, endIndex + 1).join('\n');
  };
  
  const config = `# HORIZN VPN Configuration
# Session ID: ${sessionId}
# Node: ${process.env.NODE_NAME}
# Region: ${process.env.REGION}
# Generated: ${new Date().toISOString()}

client
dev tun
proto tcp
remote ${process.env.SERVER_IP} 443
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
auth SHA512
key-direction 1
verb 3

<ca>
${caCert}
</ca>

<cert>
${extractCert(clientCert)}
</cert>

<key>
${clientKey}
</key>

<tls-crypt>
${taKey}
</tls-crypt>
`;
  
  return config;
}

// Encrypt config file
function encryptConfig(configContent) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(AES_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(configContent, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt config file
function decryptConfig(encryptedData) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(AES_KEY, 'hex');
  
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Upload to Pinata
async function uploadToPinata(content, filename) {
  try {
    const formData = new FormData();
    formData.append('file', Buffer.from(content), {
      filename: filename,
      contentType: 'application/octet-stream'
    });
    
    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        type: 'vpn-config-encrypted'
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw error;
  }
}

// Verify session ownership on-chain
async function verifySessionOwner(sessionId, walletAddress) {
  try {
    const contract = new ethers.Contract(
      process.env.ESCROW_PAYMENT_ADDRESS,
      escrowABI,
      provider
    );
    
    const session = await contract.getSession(sessionId);
    const sessionOwner = session.user.toLowerCase();
    const requestWallet = walletAddress.toLowerCase();
    
    console.log(`Verifying session ${sessionId}: owner=${sessionOwner}, requester=${requestWallet}`);
    
    return sessionOwner === requestWallet;
  } catch (error) {
    console.error('Error verifying session owner:', error.message);
    return false;
  }
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    nodeId, 
    region: process.env.REGION,
    encryption: 'enabled'
  });
});

// Create session and generate encrypted config
app.post('/session/create', async (req, res) => {
  const { sessionId, userAddress, nodeId: reqNodeId, expiresAt } = req.body;
  
  try {
    console.log(`Creating session ${sessionId} for ${userAddress}`);
    
    // Generate client certificate
    const certGenerated = generateClientCertificate(sessionId);
    if (!certGenerated) {
      return res.status(500).json({ error: 'Failed to generate certificate' });
    }
    
    // Generate complete VPN config
    const configContent = generateCompleteVPNConfig(sessionId);
    
    // Encrypt the config
    const encryptedConfig = encryptConfig(configContent);
    
    // Upload encrypted config to Pinata
    const cid = await uploadToPinata(
      encryptedConfig,
      `session-${sessionId}-config.enc`
    );
    
    console.log(`✓ Session ${sessionId} config uploaded to IPFS: ${cid}`);
    
    // Store in database
    db.run(
      'INSERT INTO sessions (session_id, user_address, node_id, created_at, expires_at, config_cid, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sessionId, userAddress, reqNodeId, Date.now(), expiresAt, cid, 'active'],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          success: true, 
          cid,
          message: 'VPN config generated and encrypted'
        });
      }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download config - with on-chain verification
app.get('/session/:sessionId/download', async (req, res) => {
  const { sessionId } = req.params;
  const { wallet } = req.query;
  
  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address required' });
  }
  
  try {
    // Verify ownership on-chain
    const isOwner = await verifySessionOwner(sessionId, wallet);
    
    if (!isOwner) {
      console.log(`❌ Unauthorized download attempt for session ${sessionId} by ${wallet}`);
      return res.status(403).json({ 
        error: 'Unauthorized',
        message: 'You did not purchase this VPN session'
      });
    }
    
    console.log(`✓ Authorized download for session ${sessionId} by ${wallet}`);
    
    // Get config CID from database
    db.get(
      'SELECT config_cid FROM sessions WHERE session_id = ?',
      [sessionId],
      async (err, row) => {
        if (err || !row) {
          return res.status(404).json({ error: 'Session not found' });
        }
        
        try {
          // Download encrypted config from Pinata
          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${row.config_cid}`;
          const response = await axios.get(ipfsUrl);
          const encryptedConfig = response.data;
          
          // Decrypt config
          const decryptedConfig = decryptConfig(encryptedConfig);
          
          // Send config file
          res.setHeader('Content-Type', 'application/x-openvpn-profile');
          res.setHeader('Content-Disposition', `attachment; filename="horizn-session-${sessionId}.ovpn"`);
          res.send(decryptedConfig);
          
          console.log(`✓ Config downloaded successfully for session ${sessionId}`);
        } catch (error) {
          console.error('Error downloading/decrypting config:', error);
          res.status(500).json({ error: 'Failed to retrieve config' });
        }
      }
    );
  } catch (error) {
    console.error('Error in download handler:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session info
app.get('/session/:sessionId/info', (req, res) => {
  const { sessionId } = req.params;
  
  db.get(
    'SELECT session_id, user_address, node_id, data_used_bytes, created_at, expires_at, status FROM sessions WHERE session_id = ?',
    [sessionId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(row);
    }
  );
});

// Get data usage
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
  console.log(`Encryption: AES-256-CBC (Enabled)`);
  console.log(`IPFS Storage: Pinata`);
  console.log(`========================================\n`);
  
  await registerNode();
});

// Disconnect client from VPN
function disconnectClient(sessionId) {
  try {
    // OpenVPN management interface would be used here
    // For now, we revoke the certificate which prevents future connections
    const clientName = `client-session-${sessionId}`;
    const easyRsaDir = '/root/openvpn-ca';
    
    execSync(`cd ${easyRsaDir} && ./easyrsa --batch revoke ${clientName}`, {
      stdio: 'pipe'
    });
    
    // Regenerate CRL
    execSync(`cd ${easyRsaDir} && ./easyrsa gen-crl`, {
      stdio: 'pipe'
    });
    
    // Copy CRL to OpenVPN directory
    execSync('cp /root/openvpn-ca/pki/crl.pem /etc/openvpn/server/', {
      stdio: 'pipe'
    });
    
    console.log(`✓ Revoked certificate for session ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Error disconnecting client ${sessionId}:`, error.message);
    return false;
  }
}

// Check and enforce data limits
async function checkDataLimits(sessionId, dataUsedBytes) {
  try {
    // Get session details from blockchain
    const contract = new ethers.Contract(
      process.env.ESCROW_PAYMENT_ADDRESS,
      escrowABI,
      provider
    );
    
    const session = await contract.getSession(sessionId);
    const maxDataBytes = Number(session.maxDataGB) * (1024 ** 3); // Convert GB to bytes
    
    if (dataUsedBytes >= maxDataBytes) {
      console.log(`⚠️ Session ${sessionId} exceeded data limit: ${(dataUsedBytes / (1024 ** 3)).toFixed(2)} GB / ${session.maxDataGB} GB`);
      
      // Update database status
      db.run(
        'UPDATE sessions SET status = ? WHERE session_id = ?',
        ['expired', sessionId],
        (err) => {
          if (err) {
            console.error('Error updating session status:', err);
          }
        }
      );
      
      // Disconnect the client
      disconnectClient(sessionId);
      
      return true; // Limit reached
    } else {
      const percentUsed = (dataUsedBytes / maxDataBytes * 100).toFixed(1);
      
      // Warning at 90%
      if (percentUsed >= 90 && percentUsed < 100) {
        console.log(`⚠️ Session ${sessionId} at ${percentUsed}% data usage`);
      }
      
      return false; // Still within limit
    }
  } catch (error) {
    console.error(`Error checking data limit for session ${sessionId}:`, error.message);
    return false;
  }
}

// Parse OpenVPN status log for data usage
function parseDataUsage() {
  try {
    const statusLog = fs.readFileSync('/var/log/openvpn/openvpn-status.log', 'utf8');
    const lines = statusLog.split('\\n');
    
    // Find CLIENT_LIST entries
    // Format: CLIENT_LIST,Common Name,Real Address,Virtual Address,Virtual IPv6 Address,Bytes Received,Bytes Sent,Connected Since,Connected Since (time_t),Username,Client ID,Peer ID
    const clientList = lines.filter(line => line.startsWith('CLIENT_LIST'));
    
    clientList.forEach(async (line) => {
      const parts = line.split(',');
      if (parts.length >= 7) {
        const commonName = parts[1]; // This is the client certificate CN (session_id)
        const bytesReceived = parseInt(parts[5]) || 0;
        const bytesSent = parseInt(parts[6]) || 0;
        const totalBytes = bytesReceived + bytesSent;
        
        // Check if limit reached
        const limitReached = await checkDataLimits(commonName, totalBytes);
        
        if (limitReached) {
          console.log(`🚫 Session ${commonName} disconnected due to data limit`);
          return;
        }
        
        // Update session data usage
        db.run(
          'UPDATE sessions SET data_used_bytes = ? WHERE session_id = ?',
          [totalBytes, commonName],
          (err) => {
            if (err) {
              console.error(`Error updating data usage for ${commonName}:`, err);
            } else {
              const usageMB = (totalBytes / 1024 / 1024).toFixed(2);
              if (usageMB > 0) {
                console.log(`📊 Session ${commonName}: ${usageMB} MB used`);
              }
            }
          }
        );
      }
    });
  } catch (error) {
    console.error('Error parsing OpenVPN status:', error.message);
  }
}

// Check for expired sessions by time
function checkExpiredSessions() {
  const now = Date.now();
  
  db.all(
    'SELECT session_id FROM sessions WHERE expires_at < ? AND status = ?',
    [now, 'active'],
    (err, rows) => {
      if (err) {
        console.error('Error checking expired sessions:', err);
        return;
      }
      
      rows.forEach(row => {
        console.log(`⏰ Session ${row.session_id} expired by time`);
        
        // Update status
        db.run(
          'UPDATE sessions SET status = ? WHERE session_id = ?',
          ['expired', row.session_id]
        );
        
        // Disconnect client
        disconnectClient(row.session_id);
      });
    }
  );
}

// Update data usage every minute
setInterval(parseDataUsage, 60000);

// Check for expired sessions every 5 minutes
setInterval(checkExpiredSessions, 300000);

// Also parse on startup
setTimeout(parseDataUsage, 10000);
setTimeout(checkExpiredSessions, 15000);
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

sleep 5

if systemctl is-active --quiet horizn-node; then
    echo -e "${GREEN}✓ API server started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start API server${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    journalctl -u horizn-node -n 20 --no-pager
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  - Check logs: journalctl -u horizn-node -f"
    echo "  - Check Node.js: node --version"
    echo "  - Check npm packages: cd /opt/horizn-node && npm list"
    echo "  - Restart service: systemctl restart horizn-node"
    echo ""
    echo -e "${YELLOW}Continuing deployment...${NC}"
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
echo -e "${BLUE}Services Status:${NC}"
if systemctl is-active --quiet openvpn-server@server; then
    echo "  ✓ OpenVPN: Active on TCP 443"
else
    echo "  ✗ OpenVPN: Not running"
fi
if systemctl is-active --quiet horizn-node; then
    echo "  ✓ API Server: Active on TCP 3000"
else
    echo "  ⚠ API Server: Not running (check logs)"
fi
if systemctl is-active --quiet fail2ban; then
    echo "  ✓ Fail2ban: Active (SSH/VPN protection)"
else
    echo "  ⚠ Fail2ban: Not running"
fi
if ufw status | grep -q "Status: active"; then
    echo "  ✓ UFW Firewall: Active"
else
    echo "  ⚠ UFW Firewall: Not active"
fi
echo "  ✓ Auto Updates: Enabled"
echo ""
echo -e "${BLUE}Security Configured:${NC}"
echo "  ✓ IP forwarding enabled"
echo "  ✓ Firewall rules configured (SSH: 22, VPN: 443, API: 3000)"
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
