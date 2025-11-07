import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { USER_REGISTRY_ABI, NODE_REGISTRY_ABI, ESCROW_PAYMENT_ABI } from '@/config/abis';

export const getUserRegistryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.userRegistry, USER_REGISTRY_ABI, signerOrProvider);
};

export const getNodeRegistryContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.nodeRegistry, NODE_REGISTRY_ABI, signerOrProvider);
};

export const getEscrowPaymentContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.escrowPayment, ESCROW_PAYMENT_ABI, signerOrProvider);
};

export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatGBToBytes = (gb: number): number => {
  return gb * 1024 * 1024 * 1024;
};

export const formatBytesToGB = (bytes: number): number => {
  return bytes / (1024 * 1024 * 1024);
};
