#!/bin/bash

# HORIZN GitHub Upload Script
# Repository: https://github.com/MrTimonM/Horizon

set -e

echo "=========================================="
echo "  HORIZN - GitHub Upload Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git is not installed. Installing...${NC}"
    sudo apt-get update -qq
    sudo apt-get install -y git
fi

# Navigate to project directory
cd "$(dirname "$0")"

echo -e "${BLUE}Current directory: $(pwd)${NC}"
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo -e "${BLUE}[1/6] Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi
echo ""

# Add remote
echo -e "${BLUE}[2/6] Adding remote repository...${NC}"
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists. Updating URL..."
    git remote set-url origin https://github.com/MrTimonM/Horizon.git
else
    git remote add origin https://github.com/MrTimonM/Horizon.git
fi
echo -e "${GREEN}✓ Remote added: https://github.com/MrTimonM/Horizon${NC}"
echo ""

# Configure git user (if not set)
if [ -z "$(git config user.name)" ]; then
    echo -e "${YELLOW}Git user not configured. Please enter your details:${NC}"
    read -p "Enter your name: " git_name
    read -p "Enter your email: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
fi
echo ""

# Stage all files
echo -e "${BLUE}[3/6] Staging files...${NC}"
git add .
echo -e "${GREEN}✓ Files staged${NC}"
echo ""

# Show what will be committed
echo -e "${BLUE}Files to be committed:${NC}"
git status --short
echo ""

# Commit
echo -e "${BLUE}[4/6] Creating commit...${NC}"
git commit -m "Initial commit: HORIZN - Decentralized VPN Marketplace

Features:
- Smart contracts deployed on Sepolia (UserRegistry, NodeRegistry, EscrowPayment)
- Next.js 14 frontend with professional design
- Data usage dashboard with beautiful graphs and analytics
- One-command VPN node deployment script with full automation
- Complete security hardening (UFW, Fail2ban, iptables)
- Automatic blockchain registration
- IPFS profile pictures via Pinata
- Real-time data tracking and monitoring
- Responsive modern UI with Tailwind CSS
- OpenVPN integration with AES-256 encryption
- Escrow-based payments with 1% platform fee
- Global VPN marketplace

Deployed Contracts (Sepolia):
- UserRegistry: 0x844a785AA74dAE31dD23Ff70A0F346a8af26D639
- NodeRegistry: 0x7638b531c3CA30D47912583260982C272c2f66f1
- EscrowPayment: 0x39877a33BF5B9552689858EB1e23811F7091Bb9a" || echo "Nothing to commit"
echo -e "${GREEN}✓ Commit created${NC}"
echo ""

# Set main branch
echo -e "${BLUE}[5/6] Setting main branch...${NC}"
git branch -M main
echo -e "${GREEN}✓ Branch set to main${NC}"
echo ""

# Push to GitHub
echo -e "${BLUE}[6/6] Pushing to GitHub...${NC}"
echo -e "${YELLOW}You may be prompted for GitHub credentials.${NC}"
echo -e "${YELLOW}Use a Personal Access Token if password authentication fails.${NC}"
echo -e "${YELLOW}Get token from: https://github.com/settings/tokens${NC}"
echo ""

read -p "Press Enter to continue with push..."

git push -u origin main

echo ""
echo "=========================================="
echo -e "${GREEN}  ✓ Upload Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Repository URL:${NC}"
echo "https://github.com/MrTimonM/Horizon"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Visit: https://github.com/MrTimonM/Horizon"
echo "2. Add repository description"
echo "3. Add topics: blockchain, ethereum, vpn, web3, openvpn"
echo "4. Create first release (v1.0.0)"
echo "5. Star your repository! ⭐"
echo ""
echo -e "${GREEN}Done!${NC}"
