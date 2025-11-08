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
    // Check connection status
    if (!isConnected && typeof window !== 'undefined') {
      // Try to reconnect first
      const wasConnected = localStorage.getItem('walletConnected');
      if (!wasConnected) {
        router.push('/');
        return;
      }
    }
    
    if (isConnected && address && provider) {
      loadData();
    }
  }, [isConnected, address, provider]);

  const loadData = async () => {
    if (!provider || !address) return;

    try {
      // Load buyer sessions from blockchain
      const escrowContract = getEscrowPaymentContract(provider);
      const userSessions = await escrowContract.getUserSessions(address);
      
      console.log('📊 Raw user sessions from blockchain:', userSessions);
      console.log('📊 Number of sessions:', userSessions.length);
      
      // Fetch real data usage from node APIs
      const sessionsWithUsage = await Promise.all(
        userSessions.map(async (session: any) => {
          // Access by index since ethers returns Result arrays
          const sessionId = Number(session[0]);
          const nodeId = Number(session[1]);
          const dataAmountGB = Number(session[5]);
          const totalCost = session[4];
          const startTime = Number(session[8]);
          const expiryTime = Number(session[9]);
          const active = session[12];
          
          console.log('Processing session:', {
            sessionId,
            nodeId,
            dataAmountGB,
            totalCost: totalCost?.toString(),
            startTime,
            expiryTime,
            active
          });
          
          try {
            // Get node details
            const nodeContract = getNodeRegistryContract(provider);
            const node = await nodeContract.getNode(nodeId);
            
            // Check if apiEndpoint exists and extract IP
            let serverIP = '198.46.189.232'; // Default fallback
            if (node.apiEndpoint && typeof node.apiEndpoint === 'string' && node.apiEndpoint.includes(':')) {
              serverIP = node.apiEndpoint.split(':')[0];
            }
            
            // Fetch data usage from node API (port 3000)
            const usageResponse = await fetch(`http://${serverIP}:3000/session/${sessionId}/usage`);
            const usageData = await usageResponse.json();
            
            const dataUsedBytes = usageData.dataUsedBytes || 0;
            const dataUsedGB = dataUsedBytes / (1024 ** 3);
            const remainingDataGB = Math.max(0, dataAmountGB - dataUsedGB);
            
            return {
              id: sessionId,
              nodeId: nodeId,
              nodeName: node.region || 'Unknown',
              totalDataGB: dataAmountGB,
              usedDataGB: parseFloat(dataUsedGB.toFixed(2)),
              remainingDataGB: parseFloat(remainingDataGB.toFixed(2)),
              startDate: startTime > 0 ? startTime * 1000 : Date.now(),
              expiryDate: expiryTime > 0 ? expiryTime * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000,
              totalCost: totalCost ? formatEther(totalCost) : '0',
              status: active ? 'active' : 'expired',
              nodeEndpoint: `${serverIP}:443`, // Use the actual endpoint
            };
          } catch (error) {
            console.error(`Error fetching usage for session ${sessionId}:`, error);
            // Return fallback data
            return {
              id: sessionId,
              nodeId: nodeId,
              nodeName: 'Node #' + nodeId,
              totalDataGB: dataAmountGB || 0,
              usedDataGB: 0,
              remainingDataGB: dataAmountGB || 0,
              startDate: startTime > 0 ? startTime * 1000 : Date.now(),
              expiryDate: expiryTime > 0 ? expiryTime * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000,
              totalCost: totalCost ? formatEther(totalCost) : '0',
              status: active ? 'active' : 'expired',
              nodeEndpoint: '198.46.189.232:443', // Default endpoint
            };
          }
        })
      );
      
      setBuyerSessions(sessionsWithUsage);

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
    if (!address) return;
    
    const session = buyerSessions.find(s => s.id === sessionId);
    if (!session || !session.nodeEndpoint) {
      alert('Unable to download config. Node endpoint not available.');
      return;
    }

    try {
      // Extract IP from endpoint (format: "IP:PORT") and use API port 3000
      const serverIP = session.nodeEndpoint.split(':')[0];
      const response = await fetch(
        `http://${serverIP}:3000/session/${sessionId}/download?wallet=${address}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to download config');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horizn-session-${sessionId}.ovpn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download VPN config');
    }
  };

  const refreshUsageData = async () => {
    setLoading(true);
    await loadData();
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
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              Dashboard
            </h1>
            <p className="text-gray-400">Monitor your VPN usage and manage nodes</p>
          </div>
          
          {/* Refresh Button */}
          {activeTab === 'buyer' && buyerSessions.length > 0 && (
            <button
              onClick={refreshUsageData}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiActivity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Usage</span>
            </button>
          )}
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
                      {buyerSessions.reduce((sum, s) => sum + s.totalDataGB, 0)} GB
                    </div>
                    <div className="text-sm text-gray-500">Across {buyerSessions.length} session{buyerSessions.length !== 1 ? 's' : ''}</div>
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
                      {buyerSessions.reduce((sum, s) => sum + s.usedDataGB, 0).toFixed(2)} GB
                    </div>
                    <div className="text-sm text-gray-500">
                      {getUsagePercentage(
                        buyerSessions.reduce((sum, s) => sum + s.usedDataGB, 0),
                        buyerSessions.reduce((sum, s) => sum + s.totalDataGB, 0)
                      )}% of total
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
                      <FiTrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {buyerSessions.reduce((sum, s) => sum + s.remainingDataGB, 0).toFixed(2)} GB
                    </div>
                    <div className="text-sm text-gray-500">Available to use</div>
                  </motion.div>
                </div>

                {/* Active Sessions List */}
                <div className="space-y-4">
                  {buyerSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                    >
                      {/* Session Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{session.nodeName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <FiServer className="w-4 h-4 mr-1" />
                              Node #{session.nodeId}
                            </span>
                            <span className="flex items-center">
                              <FiClock className="w-4 h-4 mr-1" />
                              {session.expiryDate && !isNaN(session.expiryDate) 
                                ? `Expires ${formatDistanceToNow(session.expiryDate, { addSuffix: true })}`
                                : 'Expiry date unavailable'
                              }
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              session.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {session.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadVPNConfig(session.id)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>Download Config</span>
                        </button>
                      </div>

                      {/* Usage Stats */}
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-white/5">
                          <div className="text-sm text-gray-400 mb-1">Used</div>
                          <div className="text-2xl font-bold text-white">{session.usedDataGB} GB</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <div className="text-sm text-gray-400 mb-1">Remaining</div>
                          <div className="text-2xl font-bold text-green-400">{session.remainingDataGB} GB</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5">
                          <div className="text-sm text-gray-400 mb-1">Total Cost</div>
                          <div className="text-2xl font-bold text-white">{session.totalCost} ETH</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Data Usage Progress</span>
                          <span className={`font-semibold ${getStatusColor(getUsagePercentage(session.usedDataGB, session.totalDataGB))}`}>
                            {getUsagePercentage(session.usedDataGB, session.totalDataGB)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressBarColor(getUsagePercentage(session.usedDataGB, session.totalDataGB))} transition-all duration-500`}
                            style={{ width: `${getUsagePercentage(session.usedDataGB, session.totalDataGB)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

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
