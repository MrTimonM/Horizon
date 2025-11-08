'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { getNodeRegistryContract, getEscrowPaymentContract, formatEther, parseEther } from '@/utils/contracts';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiMapPin, FiDollarSign, FiZap, FiShoppingCart, FiServer, FiRefreshCw } from 'react-icons/fi';
import { ethers } from 'ethers';

interface VPNNode {
  id: number;
  operator: string;
  name: string;
  region: string;
  pricePerGB: bigint;
  advertisedBandwidth: bigint;
  endpoint: string;
  active: boolean;
  totalSessions: bigint;
  totalDataServed: bigint;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { signer, provider, isConnected } = useWalletStore();
  const [nodes, setNodes] = useState<VPNNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<VPNNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setLoading(true);
    
    try {
      // Always use a fresh JSON-RPC provider for reading data
      // This ensures we don't have stale provider issues when navigating
      const ethersProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const contract = getNodeRegistryContract(ethersProvider);
      const activeNodes = await contract.getActiveNodes();
      
      console.log('Loaded nodes:', activeNodes);
      setNodes(activeNodes);
      setFilteredNodes(activeNodes);
    } catch (error) {
      console.error('Error loading nodes:', error);
      // Set empty array on error so we show the empty state
      setNodes([]);
      setFilteredNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNodes();
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = [...nodes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter((node) => node.region === selectedRegion);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return Number(a.pricePerGB - b.pricePerGB);
      } else if (sortBy === 'bandwidth') {
        return Number(b.advertisedBandwidth - a.advertisedBandwidth);
      }
      return 0;
    });

    setFilteredNodes(filtered);
  }, [searchTerm, selectedRegion, sortBy, nodes]);

  const regions = Array.from(new Set(nodes.map((node) => node.region)));

  const handlePurchase = (nodeId: number) => {
    router.push(`/purchase/${nodeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            VPN <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Browse and connect to decentralized VPN nodes worldwide
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Nodes'}
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white placeholder-gray-500"
              />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white appearance-none cursor-pointer"
              >
                <option value="all">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white appearance-none cursor-pointer"
              >
                <option value="price">Lowest Price</option>
                <option value="bandwidth">Highest Bandwidth</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Nodes Grid */}
        {filteredNodes.length === 0 ? (
          <div className="glass-card text-center py-20">
            <FiServer className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No VPN Nodes Available</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedRegion !== 'all' 
                ? 'No nodes match your search criteria. Try adjusting your filters.'
                : 'There are currently no active VPN nodes in the marketplace. Be the first to deploy one!'
              }
            </p>
            {!searchTerm && selectedRegion === 'all' && (
              <button
                onClick={() => router.push('/become-seller')}
                className="btn-primary"
              >
                Deploy Your Own Node
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNodes.map((node, index) => (
              <motion.div
                key={node.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{node.name}</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      {node.region}
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-1" />
                      Price per GB
                    </span>
                    <span className="text-white font-semibold">
                      {formatEther(node.pricePerGB)} ETH
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center">
                      <FiZap className="w-4 h-4 mr-1" />
                      Bandwidth
                    </span>
                    <span className="text-white font-semibold">
                      {node.advertisedBandwidth.toString()} Mbps
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                  <div className="text-xs text-gray-400 mb-1">Statistics</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Sessions: {node.totalSessions.toString()}</span>
                    <span className="text-gray-300">
                      Data: {(Number(node.totalDataServed) / (1024 ** 3)).toFixed(2)} GB
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    console.log('Navigating to purchase page for node ID:', Number(node.id));
                    handlePurchase(Number(node.id));
                  }}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Purchase Access</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
