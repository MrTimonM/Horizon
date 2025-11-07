export const CONTRACT_ADDRESSES = {
  userRegistry: process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS!,
  nodeRegistry: process.env.NEXT_PUBLIC_NODE_REGISTRY_ADDRESS!,
  escrowPayment: process.env.NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS!,
};

export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
  networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
};

export const PINATA_CONFIG = {
  jwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
};
