'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { getEscrowPaymentContract, getNodeRegistryContract, formatEther, formatBytes } from '@/utils/contracts';
import { motion } from 'framer-motion';
import { FiDownload, FiClock, FiDatabase, FiDollarSign, FiServer, FiActivity, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { signer, address, provider, isConnected } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [buyerSessions, setBuyerSessions] = useState<any[]>([]);
  const [sellerNodes, setSellerNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in production, fetch from blockchain/API
  const mockSession = {
    id: 1,
    nodeId: 1,
    nodeName: 'Tokyo-Premium-01',
    totalDataGB: 100,
    usedDataGB: 67.5,
    remainingDataGB: 32.5,
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    expiryDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
    totalCost: '0.1',
    status: 'active',
  };

  // Usage over time (last 7 days)
  const usageHistory = [
    { date: 'Nov 1', usage: 8.2, limit: 14.3 },
    { date: 'Nov 2', usage: 12.5, limit: 14.3 },
    { date: 'Nov 3', usage: 9.8, limit: 14.3 },
    { date: 'Nov 4', usage: 15.2, limit: 14.3 },
    { date: 'Nov 5', usage: 11.3, limit: 14.3 },
    { date: 'Nov 6', usage: 7.9, limit: 14.3 },
    { date: 'Nov 7', usage: 2.6, limit: 14.3 },
  ];

  // Data breakdown
  const dataBreakdown = [
    { name: 'Streaming', value: 35.2, color: '#22c55e' },
    { name: 'Browsing', value: 18.5, color: '#3b82f6' },
    { name: 'Downloads', value: 10.8, color: '#a855f7' },
    { name: 'Other', value: 3.0, color: '#64748b' },
  ];

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    loadData();
  }, [address, provider]);

  const loadData = async () => {
    if (!provider || !address) return;

    try {
      // Load buyer sessions
      const escrowContract = getEscrowPaymentContract(provider);
      setBuyerSessions([mockSession]); // Using mock data for now

      // Load seller nodes
      const nodeContract = getNodeRegistryContract(provider);
      const nodes = await nodeContract.getOperatorNodes(address);
      setSellerNodes(nodes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadVPNConfig = async (sessionId: number) => {
    alert('VPN config download would happen here. Contact the node operator for the config file.');
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-brand-500';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-brand-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
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
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
            Dashboard
          </h1>
          <p className="text-gray-400">Monitor your VPN usage and manage nodes</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 glass-card p-1">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'buyer'
                ? 'bg-brand-600 text-white'
                : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            My Sessions
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'seller'
                ? 'bg-brand-600 text-white'
                : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            My Nodes
          </button>
        </div>

        {/* Buyer Tab */}
        {activeTab === 'buyer' && (
          <div className="space-y-8">
            {buyerSessions.length === 0 ? (
              <div className="glass-card text-center py-16">
                <FiDatabase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Sessions</h3>
                <p className="text-gray-400 mb-6">Purchase VPN access to get started</p>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="btn-primary"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <>
                {/* Data Usage Overview Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">Total Purchased</div>
                      <FiDatabase className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {mockSession.totalDataGB} GB
                    </div>
                    <div className="text-sm text-gray-500">Original allocation</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">Data Used</div>
                      <FiActivity className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {mockSession.usedDataGB} GB
                    </div>
                    <div className={`text-sm font-semibold ${getStatusColor(getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB))}`}>
                      {getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB)}% consumed
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">Remaining</div>
                      <FiTrendingUp className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="text-3xl font-bold text-brand-500 mb-1">
                      {mockSession.remainingDataGB} GB
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((mockSession.remainingDataGB / mockSession.usedDataGB) * 10) / 10}x days at current rate
                    </div>
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Usage Progress</h3>
                    <span className={`text-sm font-semibold ${getStatusColor(getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB))}`}>
                      {getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB)}%
                    </span>
                  </div>
                  <div className="relative h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${getProgressBarColor(getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB))} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">0 GB</span>
                    <span className="text-white font-semibold">{mockSession.usedDataGB} GB used</span>
                    <span className="text-gray-400">{mockSession.totalDataGB} GB</span>
                  </div>

                  {getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB) >= 80 && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start space-x-3">
                      <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-yellow-500">Low Data Warning</div>
                        <div className="text-xs text-gray-400 mt-1">
                          You've used {getUsagePercentage(mockSession.usedDataGB, mockSession.totalDataGB)}% of your data. Consider purchasing more soon.
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Usage Chart */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card"
                  >
                    <h3 className="text-lg font-bold text-white mb-6">Daily Usage (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={usageHistory}>
                        <defs>
                          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} label={{ value: 'GB', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="usage" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                        <Line type="monotone" dataKey="limit" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                        <span className="text-gray-400">Daily Usage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-gray-500"></div>
                        <span className="text-gray-400">Daily Average</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card"
                  >
                    <h3 className="text-lg font-bold text-white mb-6">Usage Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={dataBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {dataBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: any) => `${value} GB`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {dataBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-400">{item.name}</div>
                            <div className="text-sm font-semibold text-white">{item.value} GB</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Session Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-card"
                >
                  <h3 className="text-lg font-bold text-white mb-6">Session Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Node</span>
                          <span className="text-white font-semibold">{mockSession.nodeName}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Status</span>
                          <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                            <span className="text-brand-500 font-semibold capitalize">{mockSession.status}</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Total Cost</span>
                          <span className="text-white font-semibold">{mockSession.totalCost} ETH</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Started</span>
                          <span className="text-white">{new Date(mockSession.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Expires</span>
                          <span className="text-white">{new Date(mockSession.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-gray-400">Time Remaining</span>
                          <span className="text-brand-500 font-semibold">
                            {formatDistanceToNow(mockSession.expiryDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <button
                      onClick={() => downloadVPNConfig(mockSession.id)}
                      className="btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      <FiDownload className="w-5 h-5" />
                      <span>Download VPN Configuration</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* Seller Tab */}
        {activeTab === 'seller' && (
          <div className="space-y-6">
            {sellerNodes.length === 0 ? (
              <div className="glass-card text-center py-16">
                <FiServer className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Nodes</h3>
                <p className="text-gray-400 mb-6">Deploy your first VPN node to start earning</p>
                <button
                  onClick={() => router.push('/become-seller')}
                  className="btn-primary"
                >
                  Deploy Node
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerNodes.map((node: any, index: number) => (
                  <div key={index} className="glass-card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{node.name}</h3>
                        <p className="text-sm text-gray-400">{node.region}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-500 text-xs font-semibold">
                        Active
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price</span>
                        <span className="text-white font-semibold">{formatEther(node.pricePerGB)} ETH/GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Sessions</span>
                        <span className="text-white font-semibold">{node.totalSessions.toString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bandwidth</span>
                        <span className="text-white font-semibold">{node.advertisedBandwidth.toString()} Mbps</span>
                      </div>
                    </div>

                    <button className="btn-secondary w-full text-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
