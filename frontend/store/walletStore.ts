import { create } from 'zustand';
import { ethers } from 'ethers';

interface UserProfile {
  address: string;
  walletName: string;
  profilePictureIPFS: string;
  isRegistered: boolean;
}

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  userProfile: UserProfile | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUserProfile: (profile: UserProfile) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  isConnected: false,
  userProfile: null,

  connectWallet: async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      set({
        provider,
        signer,
        address,
        chainId,
        isConnected: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  },

  disconnectWallet: () => {
    set({
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      isConnected: false,
      userProfile: null,
    });
  },

  setUserProfile: (profile: UserProfile) => {
    set({ userProfile: profile });
  },
}));

declare global {
  interface Window {
    ethereum?: any;
  }
}
