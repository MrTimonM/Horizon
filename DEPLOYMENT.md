# HORIZN Deployment Guide

## 🚀 Complete Deployment Instructions

### Deployed Smart Contracts (Sepolia Testnet)

✅ **UserRegistry**: `0x844a785AA74dAE31dD23Ff70A0F346a8af26D639`  
✅ **NodeRegistry**: `0x7638b531c3CA30D47912583260982C272c2f66f1`  
✅ **EscrowPayment**: `0x39877a33BF5B9552689858EB1e23811F7091Bb9a`  

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at: http://localhost:3000

### Production Build

```bash
cd frontend
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set root directory to `frontend`
4. Add environment variables from `.env.local`
5. Deploy!

## 🔧 VPN Node Deployment

### For Node Operators

1. **Get an Ubuntu VPS** (Recommended providers):
   - DigitalOcean
   - Vultr
   - Linode
   - AWS Lightsail

2. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Run the deployment script**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/horizn-vpn/deploy/main/deploy-vpn-node.sh | sudo bash
   ```

   Or download and run locally:
   ```bash
   wget https://raw.githubusercontent.com/horizn-vpn/deploy/main/deploy-vpn-node.sh
   chmod +x deploy-vpn-node.sh
   sudo ./deploy-vpn-node.sh
   ```

4. **Provide required information**:
   - Node name (e.g., "NYC-VPN-1")
   - Region (e.g., "US-East")
   - Price per GB in ETH (e.g., 0.001)
   - Advertised bandwidth in Mbps (e.g., 1000)
   - Your wallet private key

5. **Wait for deployment** (~5 minutes)

6. **Your node is live!**
   - Registered on blockchain
   - Visible in marketplace
   - Ready to accept connections

### Monitoring Your Node

```bash
# Check API server logs
journalctl -u horizn-node -f

# Check OpenVPN status
systemctl status openvpn-server@server

# View active connections
cat /var/log/openvpn/openvpn-status.log

# Check node API
curl http://localhost:3000/health
```

### Updating Node Configuration

To update your node's price or endpoint:

1. Access your server
2. Edit the configuration:
   ```bash
   cd /opt/horizn-node
   nano .env
   ```
3. Restart the service:
   ```bash
   systemctl restart horizn-node
   ```

## 💡 Testing the Complete Flow

### As a Buyer:

1. Visit http://localhost:3000
2. Click "Connect Wallet" and connect MetaMask
3. Register your profile (username + optional picture)
4. Browse the Marketplace
5. Select a VPN node
6. Purchase VPN access (specify GB and duration)
7. Go to Dashboard
8. Download your VPN config file
9. Import into OpenVPN client
10. Connect and enjoy!

### As a Seller:

1. Follow VPN node deployment instructions above
2. Your node appears in marketplace automatically
3. View your node in Dashboard > My Nodes
4. Monitor earnings and statistics
5. Update pricing as needed

## 🔐 Security Notes

- **Never share your private key**
- **Keep your .env files secure**
- **Use strong passwords for your VPS**
- **Enable firewall on your VPS**:
  ```bash
  ufw allow 22/tcp
  ufw allow 1194/udp
  ufw allow 3000/tcp
  ufw enable
  ```

## 🌐 Contract Verification

View contracts on Sepolia Etherscan:
- https://sepolia.etherscan.io/address/0x844a785AA74dAE31dD23Ff70A0F346a8af26D639
- https://sepolia.etherscan.io/address/0x7638b531c3CA30D47912583260982C272c2f66f1
- https://sepolia.etherscan.io/address/0x39877a33BF5B9552689858EB1e23811F7091Bb9a

## 📊 Architecture Overview

```
User Journey (Buyer):
1. Connect wallet → 2. Register profile → 3. Browse marketplace
→ 4. Purchase session → 5. Download config → 6. Connect to VPN

Node Operator Journey:
1. Deploy VPS → 2. Run deployment script → 3. Node auto-registers
→ 4. Appears in marketplace → 5. Earn crypto automatically
```

## 🆘 Troubleshooting

### Frontend Issues

**Problem**: Cannot connect wallet  
**Solution**: Make sure MetaMask is installed and set to Sepolia network

**Problem**: Transactions fail  
**Solution**: Ensure you have enough Sepolia ETH for gas

### Node Deployment Issues

**Problem**: OpenVPN won't start  
**Solution**: 
```bash
journalctl -u openvpn-server@server -n 50
```

**Problem**: Node not appearing in marketplace  
**Solution**: Check if blockchain registration succeeded:
```bash
journalctl -u horizn-node -n 100 | grep "registered"
```

**Problem**: Port already in use  
**Solution**: Check if another VPN is running:
```bash
netstat -tulpn | grep 1194
```

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/horizn/issues
- Email: support@horizn.network

## 🎉 Success Checklist

- [ ] Smart contracts deployed to Sepolia
- [ ] Frontend running locally
- [ ] Can connect wallet
- [ ] Can register user profile
- [ ] Can view marketplace
- [ ] (Optional) VPN node deployed
- [ ] (Optional) Node visible in marketplace
- [ ] (Optional) Can purchase and connect

---

**Congratulations!** You've successfully deployed HORIZN! 🎊
