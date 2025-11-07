# GitHub Upload Guide

## Repository Information
- **GitHub URL**: https://github.com/MrTimonM/Horizon
- **Repository Name**: Horizon
- **Owner**: MrTimonM

## Steps to Upload

### 1. Initialize Git (if not already done)

```bash
cd /home/olaf/Dorahacks/NodeOps/HORIZN
git init
```

### 2. Add Remote Repository

```bash
git remote add origin https://github.com/MrTimonM/Horizon.git
```

### 3. Create .gitignore

Create a `.gitignore` file to exclude unnecessary files:

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Hardhat
smart-contracts/artifacts/
smart-contracts/cache/
smart-contracts/coverage/
smart-contracts/typechain-types/

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Private keys (IMPORTANT!)
*.key
*.pem
private-key.txt

# Deployment artifacts
deployments/*.json
!deployments/sepolia-deployment.json
EOF
```

### 4. Stage All Files

```bash
git add .
```

### 5. Create Initial Commit

```bash
git commit -m "Initial commit: HORIZN - Decentralized VPN Marketplace

Features:
- Smart contracts deployed on Sepolia (UserRegistry, NodeRegistry, EscrowPayment)
- Next.js 14 frontend with professional design
- Data usage dashboard with beautiful graphs
- One-command VPN node deployment script
- Complete security hardening (UFW, Fail2ban, iptables)
- Automatic blockchain registration
- IPFS profile pictures via Pinata
- Real-time data tracking and analytics
- Responsive modern UI with Tailwind CSS
- OpenVPN integration with AES-256 encryption"
```

### 6. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Alternative: If Repository Already Has Content

If the repository already exists and has content:

```bash
# Add remote
git remote add origin https://github.com/MrTimonM/Horizon.git

# Fetch existing content
git fetch origin

# Merge with existing (if any)
git merge origin/main --allow-unrelated-histories

# Push
git push -u origin main
```

## Force Push (Use Carefully!)

If you want to completely replace existing content:

```bash
git push -u origin main --force
```

⚠️ **Warning**: This will overwrite any existing files in the repository!

## Verify Upload

After pushing, verify at: https://github.com/MrTimonM/Horizon

## Update Repository Settings

### 1. Add Repository Description

Go to: https://github.com/MrTimonM/Horizon/settings

Add description:
```
Decentralized VPN marketplace powered by Ethereum and OpenVPN. Earn crypto by sharing bandwidth or connect securely through a global network of community-operated nodes.
```

### 2. Add Topics

Add these topics for discoverability:
- `blockchain`
- `ethereum`
- `vpn`
- `decentralized`
- `web3`
- `openvpn`
- `smart-contracts`
- `nextjs`
- `marketplace`
- `cryptocurrency`

### 3. Add Website

Website URL: (your deployed frontend URL or leave blank)

### 4. Enable GitHub Pages (Optional)

If you want to host documentation:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / docs (if you create a docs folder)

## Create Releases

### Tag the First Release

```bash
git tag -a v1.0.0 -m "HORIZN v1.0.0 - Initial Release

Features:
- Decentralized VPN marketplace
- Smart contracts on Sepolia
- Professional frontend UI
- Data usage analytics
- One-command node deployment
- Complete security hardening"

git push origin v1.0.0
```

### Create GitHub Release

1. Go to: https://github.com/MrTimonM/Horizon/releases/new
2. Choose tag: v1.0.0
3. Release title: `HORIZN v1.0.0 - Network Without Borders`
4. Description: Add features, deployment info, etc.
5. Click "Publish release"

## Project Structure to Upload

```
Horizon/
├── README.md                          ✅ Upload
├── LICENSE                            ✅ Upload (create if needed)
├── .gitignore                         ✅ Upload
├── ARCHITECTURE.md                    ✅ Upload
├── COMPLETE_FLOW_EXPLAINED.md         ✅ Upload
│
├── smart-contracts/                   ✅ Upload
│   ├── contracts/
│   │   ├── EscrowPayment.sol
│   │   ├── NodeRegistry.sol
│   │   └── UserRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── deployments/
│       └── sepolia-deployment.json
│
├── frontend/                          ✅ Upload
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── public/
│   ├── store/
│   ├── utils/
│   ├── styles/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── node-deployment/                   ✅ Upload
    ├── deploy-vpn-node.sh
    └── DEPLOYMENT_GUIDE.md
```

## Files to Exclude

❌ **DO NOT UPLOAD:**
- `node_modules/`
- `.next/`
- `build/`
- `.env` files
- Private keys
- `*.log` files
- IDE config (`.vscode/`, `.idea/`)
- Database files (`*.db`)

## Post-Upload Checklist

- [ ] Repository uploaded successfully
- [ ] README.md displays correctly
- [ ] All GitHub links updated
- [ ] .gitignore configured
- [ ] Repository description added
- [ ] Topics/tags added
- [ ] License file present
- [ ] Release created (v1.0.0)
- [ ] Repository set to public (if desired)
- [ ] Star your own repo 😄

## Useful Commands

```bash
# Check git status
git status

# View remote URL
git remote -v

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Push new branch
git push -u origin feature-name
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use Personal Access Token
# Go to: https://github.com/settings/tokens
# Generate new token with 'repo' scope
# Use token as password when pushing
```

### Large Files

If you have files > 100MB:

```bash
# Install Git LFS
sudo apt-get install git-lfs
git lfs install

# Track large files
git lfs track "*.db"
git lfs track "*.zip"

# Add .gitattributes
git add .gitattributes
git commit -m "Add Git LFS"
```

### Undo Last Commit

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

## Next Steps After Upload

1. ✅ Share repository link
2. ✅ Add collaborators (if needed)
3. ✅ Set up CI/CD (GitHub Actions)
4. ✅ Create project board for issues
5. ✅ Write contributing guidelines
6. ✅ Add code of conduct
7. ✅ Create issue templates
8. ✅ Set up branch protection rules

## GitHub Actions (Optional)

Create `.github/workflows/test.yml` for automated testing:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Build
        run: |
          cd frontend
          npm run build
```

---

**Repository**: https://github.com/MrTimonM/Horizon
**Ready to upload!** 🚀
