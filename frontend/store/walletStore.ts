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

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnectWallet();
        } else {
          // Reconnect with new account
          get().connectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Persist connection state
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletConnected', 'true');
      }
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
    
    // Clear persistence
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
    }
  },

  setUserProfile: (profile: UserProfile) => {
    set({ userProfile: profile });
  },
}));

// Auto-reconnect on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          useWalletStore.getState().connectWallet();
        }
      } catch (error) {
        console.error('Auto-reconnect failed:', error);
      }
    }
  });
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
