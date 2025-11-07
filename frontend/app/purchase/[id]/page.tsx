'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { getNodeRegistryContract, getEscrowPaymentContract, formatEther, parseEther } from '@/utils/contracts';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiDollarSign, FiZap, FiClock, FiDatabase } from 'react-icons/fi';
import { ethers } from 'ethers';

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { signer, provider, isConnected } = useWalletStore();
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [dataAmount, setDataAmount] = useState('10');
  const [duration, setDuration] = useState('30');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    loadNode();
  }, [params.id, provider]);

  const loadNode = async () => {
    if (!provider || !params.id) return;

    try {
      const contract = getNodeRegistryContract(provider);
      const nodeData = await contract.getNode(params.id);
      setNode(nodeData);
    } catch (error) {
      console.error('Error loading node:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!signer || !node) return;

    setPurchasing(true);
    try {
      const dataGB = parseInt(dataAmount);
      const durationDays = parseInt(duration);
      const durationSeconds = durationDays * 24 * 60 * 60;

      const totalCost = node.pricePerGB * BigInt(dataGB);

      const contract = getEscrowPaymentContract(signer);
      const tx = await contract.createSession(
        node.id,
        dataGB,
        durationSeconds,
        { value: totalCost }
      );

      await tx.wait();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to purchase session');
    } finally {
      setPurchasing(false);
    }
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
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white appearance-none cursor-pointer"
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="365">1 Year</option>
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
