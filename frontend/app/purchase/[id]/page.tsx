'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { useToastStore } from '@/store/toastStore';
import { getNodeRegistryContract, getEscrowPaymentContract, formatEther, parseEther } from '@/utils/contracts';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiDollarSign, FiZap, FiClock, FiDatabase, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { ethers } from 'ethers';

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { signer, provider, isConnected, address } = useWalletStore();
  const { addToast } = useToastStore();
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [dataAmount, setDataAmount] = useState('10');
  const [duration, setDuration] = useState('30');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [currentNetwork, setCurrentNetwork] = useState<string>('Unknown');
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      const wasConnected = localStorage.getItem('walletConnected');
      if (!wasConnected) {
        router.push('/');
        return;
      }
    }
    
    if (provider && params.id) {
      loadNode();
    }
  }, [isConnected, params.id, provider]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (signer && address) {
        try {
          // Force check the network first
          const network = await signer.provider?.getNetwork();
          const chainId = Number(network?.chainId);
          const networkName = chainId === 11155111 ? 'Sepolia' : 
                            chainId === 1 ? 'Mainnet' : 
                            `Unknown (${chainId})`;
          
          console.log('Connected to network:', chainId, networkName);
          setCurrentNetwork(networkName);
          
          if (chainId !== 11155111) {
            console.warn('Wrong network! Expected Sepolia (11155111), got:', chainId);
            setWalletBalance('0');
            return;
          }
          
          const balance = await signer.provider!.getBalance(address);
          console.log('Fetched balance for', address, ':', formatEther(balance), 'ETH');
          setWalletBalance(formatEther(balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
          // Fallback: try with a fresh provider
          try {
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const balance = await provider.getBalance(address);
            console.log('Fetched balance via RPC provider:', formatEther(balance), 'ETH');
            setWalletBalance(formatEther(balance));
            setCurrentNetwork('Sepolia');
          } catch (fallbackError) {
            console.error('Fallback balance fetch failed:', fallbackError);
          }
        }
      }
    };
    fetchBalance();
  }, [signer, address]);

  const refreshBalance = async () => {
    if (!signer || !address) return;
    
    setRefreshingBalance(true);
    try {
      // Try direct provider first
      const balance = await signer.provider!.getBalance(address);
      setWalletBalance(formatEther(balance));
      
      // Also check network
      const network = await signer.provider?.getNetwork();
      const chainId = Number(network?.chainId);
      const networkName = chainId === 11155111 ? 'Sepolia' : 
                        chainId === 1 ? 'Mainnet' : 
                        `Unknown (${chainId})`;
      setCurrentNetwork(networkName);
      
      console.log('Refreshed - Network:', networkName, 'Balance:', formatEther(balance));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      // Try fallback
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const balance = await provider.getBalance(address);
        setWalletBalance(formatEther(balance));
        setCurrentNetwork('Sepolia (via RPC)');
      } catch (e) {
        console.error('Fallback refresh failed:', e);
      }
    } finally {
      setRefreshingBalance(false);
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      // Request to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex (11155111)
      });
      
      // Wait a moment for the switch to complete
      setTimeout(() => {
        refreshBalance();
      }, 1000);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/49581a1c6ce4426d908cd5101b73b99b'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          
          // Wait and refresh after adding
          setTimeout(() => {
            refreshBalance();
          }, 1000);
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          alert('Failed to add Sepolia network to MetaMask');
        }
      } else {
        console.error('Error switching network:', switchError);
        alert('Failed to switch to Sepolia network');
      }
    }
  };

  const loadNode = async () => {
    if (!params.id) {
      console.error('No node ID in params');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Always use a fresh JSON-RPC provider for reading data
      // This ensures we don't have stale provider issues when navigating
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl) {
        throw new Error('RPC URL not configured');
      }

      const ethersProvider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = getNodeRegistryContract(ethersProvider);
      
      console.log('Purchase Page - Loading node with ID:', params.id);
      console.log('Using RPC:', rpcUrl);
      console.log('Contract address:', CONTRACT_ADDRESSES.nodeRegistry);
      
      // Try to get the specific node first
      try {
        const specificNode = await contract.getNode(params.id);
        console.log('Got specific node:', specificNode);
        
        if (specificNode && specificNode.id && specificNode.id.toString() === params.id.toString()) {
          console.log('Node is valid and active:', specificNode.active);
          setNode(specificNode);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.log('Could not get specific node:', err.message);
        // Continue to fallback
      }
      
      // Fallback: Get all active nodes and find the one we need
      try {
        const allNodes = await contract.getActiveNodes();
        console.log('All active nodes count:', allNodes.length);
        
        if (allNodes.length === 0) {
          console.error('No active nodes found on blockchain');
          setNode(null);
          setLoading(false);
          return;
        }
        
        // Compare both as strings since BigInt can be tricky
        const foundNode = allNodes.find((n: any) => {
          const nodeId = n.id.toString();
          const paramId = params.id.toString();
          console.log(`Comparing node ID "${nodeId}" with param "${paramId}"`);
          return nodeId === paramId;
        });
        
        if (foundNode) {
          console.log('Found node via getActiveNodes:', foundNode.name);
          setNode(foundNode);
        } else {
          console.error('Node not found with ID:', params.id);
          console.error('Available node IDs:', allNodes.map((n: any) => n.id.toString()).join(', '));
          setNode(null);
        }
      } catch (err: any) {
        console.error('Error getting active nodes:', err.message);
        setNode(null);
      }
    } catch (error: any) {
      console.error('Error loading node:', error.message);
      setNode(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!signer || !node) {
      addToast('Please connect your wallet first', 'error');
      return;
    }

    setPurchasing(true);
    try {
      // Check network
      const network = await signer.provider?.getNetwork();
      const chainId = network ? Number(network.chainId) : 0;
      
      if (chainId !== 11155111) {
        addToast(`Wrong network! Please switch to Sepolia Testnet. Current Chain ID: ${chainId}`, 'error', 8000);
        setPurchasing(false);
        return;
      }

      // Check balance
      const userAddress = await signer.getAddress();
      const balance = await signer.provider!.getBalance(userAddress);
      
      const dataGB = parseInt(dataAmount);
      const durationDays = parseInt(duration);
      const durationSeconds = durationDays * 24 * 60 * 60;
      const totalCost = node.pricePerGB * BigInt(dataGB);

      console.log('Wallet address:', userAddress);
      console.log('Current balance:', formatEther(balance), 'ETH');
      console.log('Total cost:', formatEther(totalCost), 'ETH');

      // Check if balance is sufficient (totalCost + estimated gas)
      const estimatedGas = ethers.parseEther('0.002'); // Rough estimate
      const totalNeeded = totalCost + estimatedGas;

      if (balance < totalNeeded) {
        const shortfall = formatEther(totalNeeded - balance);
        addToast(
          `Insufficient funds! You need ${formatEther(totalNeeded)} ETH but have ${formatEther(balance)} ETH. Get free Sepolia ETH from sepoliafaucet.com`,
          'error',
          10000
        );
        setPurchasing(false);
        return;
      }

      const contract = getEscrowPaymentContract(signer);
      
      console.log('Creating session with:', {
        nodeId: node.id.toString(),
        dataGB,
        durationSeconds,
        value: formatEther(totalCost)
      });

      addToast('Sending transaction...', 'info');
      
      const tx = await contract.createSession(
        node.id,
        dataGB,
        durationSeconds,
        { value: totalCost }
      );

      console.log('Transaction sent:', tx.hash);
      addToast('Transaction submitted! Waiting for confirmation...', 'info', 0);
      
      const receipt = await tx.wait();
      
      // Extract session ID from the event
      let sessionId: string | null = null;
      let expiresAt: number | null = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'SessionCreated') {
            sessionId = parsed.args.sessionId.toString();
            expiresAt = Number(parsed.args.expiresAt);
            console.log('Session created:', { sessionId, expiresAt });
            break;
          }
        } catch (e) {
          // Ignore logs that don't match
        }
      }

      if (!sessionId) {
        throw new Error('Could not extract session ID from transaction');
      }

      addToast('✅ Purchase successful! Generating your VPN configuration...', 'success', 5000);
      
      // Notify node to generate and encrypt config
      try {
        const serverIP = node.endpoint.split(':')[0];
        await fetch(`http://${serverIP}:3000/session/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userAddress,
            nodeId: node.id.toString(),
            expiresAt
          })
        });
        console.log('✓ Notified node to generate config');
      } catch (notifyError) {
        console.warn('Could not notify node:', notifyError);
        // Continue anyway - user can download from dashboard later
      }
      
      // Download VPN config automatically
      await downloadVPNConfig(sessionId);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let errorMessage = 'Failed to purchase session';
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for transaction. Please add more SepoliaETH to your wallet.';
      } else if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error', 8000);
    } finally {
      setPurchasing(false);
    }
  };

  const downloadVPNConfig = async (sessionId: string) => {
    try {
      if (!address) {
        addToast('Wallet address not found', 'error');
        return;
      }
      
      addToast('Requesting VPN configuration from node...', 'info', 3000);
      
      // Get the node's API endpoint
      const serverIP = node.endpoint.split(':')[0];
      const apiUrl = `http://${serverIP}:3000`;
      
      // Download config with wallet verification
      try {
        const response = await fetch(
          `${apiUrl}/session/${sessionId}/download?wallet=${address}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.status === 403) {
          addToast('❌ Access denied. You are not the owner of this session.', 'error', 8000);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        // Get the decrypted config as blob
        const blob = await response.blob();
        
        // Download the file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horizn-${node.name}-session-${sessionId}.ovpn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addToast(
          '✅ VPN configuration downloaded! Import it into OpenVPN Connect. Your connection is fully configured and ready to use.',
          'success',
          10000
        );
        return;
      } catch (apiError: any) {
        console.error('Node API error:', apiError);
        
        if (apiError.message.includes('403')) {
          addToast('❌ Access denied. You are not the owner of this session.', 'error', 8000);
          return;
        }
        
        addToast(
          '⚠️ Could not connect to VPN node. The node may still be generating your configuration. Please try again in 1-2 minutes or check your dashboard.',
          'warning',
          10000
        );
      }
    } catch (error) {
      console.error('Error downloading VPN config:', error);
      addToast(
        'Failed to download VPN config. Please try again from your dashboard.',
        'error',
        8000
      );
    }
  };

  const generateVPNConfigTemplate = (sessionId: string): string => {
    // Generate OpenVPN configuration template
    const serverIP = node.endpoint.split(':')[0];
    const serverPort = node.endpoint.split(':')[1] || '1194';
    
    return `client
dev tun
proto udp
remote ${serverIP} ${serverPort}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA512
verb 3
reneg-sec 0

# ================================================
# HORIZN VPN Configuration
# ================================================
# Session ID: ${sessionId}
# Node: ${node.name}
# Region: ${node.region}
# Node Operator: ${node.operator}
# Purchased: ${new Date().toISOString()}
# ================================================

# IMPORTANT NOTES:
# ================
# This is a TEMPLATE configuration file.
# To use this VPN connection, you need:
# 
# 1. CA Certificate - from the VPN node
# 2. Client Certificate - unique to your session
# 3. Client Private Key - unique to your session
#
# NEXT STEPS:
# ===========
# 1. Go to your HORIZN Dashboard
# 2. Find this session (ID: ${sessionId})
# 3. Click "Download Complete Config" 
# 4. The node operator will provide the certificates
#
# OR wait a few minutes and the node will 
# automatically generate your credentials.
# ================================================

<ca>
# CA Certificate will be inserted here
# The node operator will provide this
</ca>

<cert>
# Your Client Certificate will be inserted here
# Unique to session ${sessionId}
</cert>

<key>
# Your Client Private Key will be inserted here
# Keep this SECRET and SECURE
# Unique to session ${sessionId}
</key>

# Alternative: Instead of embedded certs, you can use:
# ca /path/to/ca.crt
# cert /path/to/client.crt  
# key /path/to/client.key
`;
  };

  const calculateTotal = () => {
    if (!node) return '0';
    const dataGB = parseInt(dataAmount) || 0;
    const total = node.pricePerGB * BigInt(dataGB);
    return formatEther(total);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Node not found</p>
          <button onClick={() => router.push('/marketplace')} className="btn-primary mt-4">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/marketplace')}
          className="btn-secondary mb-8 flex items-center space-x-2"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Marketplace</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Node Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold mb-6">Node Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{node.name}</h3>
                <div className="flex items-center text-gray-400">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  {node.region}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center">
                    <FiDollarSign className="w-4 h-4 mr-2" />
                    Price per GB
                  </span>
                  <span className="text-white font-semibold">{formatEther(node.pricePerGB)} ETH</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center">
                    <FiZap className="w-4 h-4 mr-2" />
                    Bandwidth
                  </span>
                  <span className="text-white font-semibold">{node.advertisedBandwidth.toString()} Mbps</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sessions</span>
                  <span className="text-white font-semibold">{node.totalSessions.toString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center text-green-400">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="font-semibold">Active & Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Purchase Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
          >
            <h2 className="text-2xl font-bold mb-6">Purchase Access</h2>

            {/* Wallet Info */}
            {address && (
              <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-blue-400">Connected Wallet</div>
                  <button
                    onClick={refreshBalance}
                    disabled={refreshingBalance}
                    className="text-xs px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className={refreshingBalance ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
                <div className="font-mono text-xs text-white mb-2">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-lg font-bold text-white">
                    {walletBalance} SepoliaETH
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    currentNetwork === 'Sepolia' || currentNetwork === 'Sepolia (via RPC)' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {currentNetwork}
                  </div>
                </div>
                {parseFloat(walletBalance) === 0 && (
                  <div className="text-xs text-red-400 mt-2">
                    ❌ No balance detected! Make sure you're on Sepolia network in MetaMask.
                  </div>
                )}
                {parseFloat(walletBalance) > 0 && parseFloat(walletBalance) < 0.01 && (
                  <div className="text-xs text-yellow-400 mt-2">
                    ⚠️ Low balance - you may not have enough for this transaction
                  </div>
                )}
                {currentNetwork !== 'Sepolia' && currentNetwork !== 'Sepolia (via RPC)' && (
                  <div className="mt-3">
                    <div className="text-xs text-red-400 mb-2">
                      ⚠️ Wrong network! You're on {currentNetwork}.
                    </div>
                    <button
                      onClick={switchToSepolia}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw />
                      Switch to Sepolia Network
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Data Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FiDatabase className="w-4 h-4 mr-2" />
                  Data Amount (GB)
                </label>
                <input
                  type="number"
                  value={dataAmount}
                  onChange={(e) => setDataAmount(e.target.value)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white"
                />
                <p className="text-xs text-gray-400 mt-1">How much data you want to purchase</p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FiClock className="w-4 h-4 mr-2" />
                  Duration (Days)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white appearance-none cursor-pointer bg-gray-900/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="7" className="bg-gray-900 text-white">7 Days</option>
                  <option value="30" className="bg-gray-900 text-white">30 Days</option>
                  <option value="90" className="bg-gray-900 text-white">90 Days</option>
                  <option value="180" className="bg-gray-900 text-white">180 Days</option>
                  <option value="365" className="bg-gray-900 text-white">1 Year</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">How long the session will be valid</p>
              </div>

              {/* Total Cost */}
              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Total Cost</span>
                  <span className="text-2xl font-bold gradient-text">{calculateTotal()} ETH</span>
                </div>
                <div className="text-xs text-gray-400">
                  {dataAmount} GB × {formatEther(node.pricePerGB)} ETH/GB
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || !dataAmount || !duration}
                className="btn-primary w-full text-lg py-4"
              >
                {purchasing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Purchase VPN Access'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Funds will be held in escrow until session completion
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
