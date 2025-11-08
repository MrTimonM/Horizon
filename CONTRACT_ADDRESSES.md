# HORIZN Smart Contract Addresses - Sepolia Testnet

## Current Deployment (January 2025)

### Contract Addresses:

```
UserRegistry:    0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778
NodeRegistry:    0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
EscrowPayment:   0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3
```

### Etherscan Links:

- [UserRegistry](https://sepolia.etherscan.io/address/0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778)
- [NodeRegistry](https://sepolia.etherscan.io/address/0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244)
- [EscrowPayment](https://sepolia.etherscan.io/address/0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3)

### Deployment Info:

- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** 11155111
- **Deployer Address:** 0x82f77e6be9cf40bc89F5CA2cA2cA78C0eF87DFC8

---

## Configuration Files Updated:

### 1. Frontend (.env.local)
```env
NEXT_PUBLIC_USER_REGISTRY_ADDRESS=0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778
NEXT_PUBLIC_NODE_REGISTRY_ADDRESS=0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS=0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3
```

### 2. Deployment Script (deploy-vpn-node.sh)
```bash
NODE_REGISTRY_ADDRESS="0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244"
ESCROW_PAYMENT_ADDRESS="0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3"
USER_REGISTRY_ADDRESS="0x387E5b716C5A74dE4Dd1d672FDaAd389D9eD1778"
```

### 3. VPS Node (.env on server)
```env
NODE_REGISTRY_ADDRESS=0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244
ESCROW_PAYMENT_ADDRESS=0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3
```

---

## Previous Deployment (Deprecated)

### Old Addresses:
```
NodeRegistry:    0x7638b531c3CA30D47912583260982C272c2f66f1  ❌ DO NOT USE
EscrowPayment:   0x39877a33BF5B9552689858EB1e23811F7091Bb9a  ❌ DO NOT USE
```

These contracts should no longer be used. All new deployments and transactions should use the new addresses above.

---

## Network Configuration:

```javascript
{
  chainId: 11155111,
  networkName: 'sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://sepolia.etherscan.io'
}
```

---

## Quick Verification:

### Check Contract on Etherscan:
```bash
# Replace {ADDRESS} with contract address
https://sepolia.etherscan.io/address/{ADDRESS}
```

### Test Contract Interaction (using ethers.js):
```javascript
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const contract = new ethers.Contract(
  '0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244', // NodeRegistry
  NODE_REGISTRY_ABI,
  provider
);

// Read node count
const nodeCount = await contract.nextNodeId();
console.log('Total nodes:', nodeCount.toString());
```

---

## Deployment Status:

✅ **All contracts successfully deployed**  
✅ **All configuration files updated**  
✅ **Frontend using new addresses**  
✅ **VPS node using new addresses**  
✅ **Deployment script updated to v1.0.3**

---

Last Updated: January 2025
