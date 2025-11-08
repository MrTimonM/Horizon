'use client';

import { motion } from 'framer-motion';
import { FiBook, FiCode, FiServer, FiShield, FiDollarSign, FiDownload, FiGithub, FiExternalLink } from 'react-icons/fi';
import { useState } from 'react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: FiBook },
    { id: 'smart-contracts', title: 'Smart Contracts', icon: FiCode },
    { id: 'deploy-node', title: 'Deploy VPN Node', icon: FiServer },
    { id: 'security', title: 'Security', icon: FiShield },
    { id: 'economics', title: 'Economics', icon: FiDollarSign },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about HORIZN - Network Without Borders
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card sticky top-24">
              <h3 className="text-lg font-bold mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-400 border border-primary-500/30'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-3xl font-bold mb-4 gradient-text">Getting Started</h2>
                  <p className="text-gray-300 mb-6">
                    Welcome to HORIZN! This guide will help you get started with the decentralized VPN marketplace.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">What is HORIZN?</h3>
                      <p className="text-gray-400 leading-relaxed">
                        HORIZN is a decentralized VPN marketplace built on Ethereum Sepolia testnet. It connects users who need VPN services 
                        with node operators who provide them. Everything is managed through smart contracts, ensuring 
                        transparency, security, and fair compensation. No centralized authority, no data logging, just pure peer-to-peer connectivity.
                      </p>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                        <FiDollarSign className="w-6 h-6 mr-2 text-blue-400" />
                        Get Free Testnet ETH
                      </h3>
                      <p className="text-gray-300 mb-4">
                        To use HORIZN on Sepolia testnet, you'll need some test ETH for gas fees. Get free Sepolia ETH from Google Cloud's faucet:
                      </p>
                      <a
                        href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <FiExternalLink className="w-5 h-5 mr-2" />
                        Get Sepolia ETH
                      </a>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">For Users (Buyers)</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Connect MetaMask to Sepolia</p>
                            <p className="text-sm text-gray-400">Make sure you have the Sepolia testnet configured in MetaMask</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Get test ETH from the faucet</p>
                            <p className="text-sm text-gray-400">You'll need it for gas fees and purchasing VPN access</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Register your profile</p>
                            <p className="text-sm text-gray-400">Create a username and optionally add a profile picture via IPFS</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Browse and purchase</p>
                            <p className="text-sm text-gray-400">Filter by region, price, and bandwidth to find the perfect VPN node</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Download your VPN config</p>
                            <p className="text-sm text-gray-400">Get your personalized OpenVPN configuration file from the dashboard</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">6</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Connect and browse securely</p>
                            <p className="text-sm text-gray-400">Import the config into your OpenVPN client and start browsing</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">For Node Operators (Sellers)</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Get a VPS</p>
                            <p className="text-sm text-gray-400">Ubuntu 20.04/22.04 with minimum 2GB RAM and public IP</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Get test ETH</p>
                            <p className="text-sm text-gray-400">Use the Google Cloud faucet to get Sepolia ETH for deployment</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Run deployment script</p>
                            <p className="text-sm text-gray-400">One command installs and configures everything automatically</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Configure and register</p>
                            <p className="text-sm text-gray-400">Provide node details and your private key for blockchain registration</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                          <div className="flex-1">
                            <p className="text-white font-medium">Start earning</p>
                            <p className="text-sm text-gray-400">Your node appears in the marketplace and begins accepting connections</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                        <FiShield className="w-6 h-6 mr-2 text-blue-400" />
                        Quick Links
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="https://sepolia.etherscan.io/address/0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4 mr-2" />
                          View Contracts on Etherscan
                        </a>
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <FiGithub className="w-4 h-4 mr-2" />
                          GitHub Repository
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Contracts */}
            {activeSection === 'smart-contracts' && (
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-3xl font-bold mb-4 gradient-text">Smart Contracts</h2>
                  <p className="text-gray-300 mb-6">
                    HORIZN uses three main smart contracts deployed on Sepolia testnet.
                  </p>

                  <div className="space-y-6">
                    {/* UserRegistry */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-2 text-white">UserRegistry</h3>
                      <p className="text-sm text-gray-400 mb-3 font-mono">0x844a785AA74dAE31dD23Ff70A0F346a8af26D639</p>
                      <p className="text-gray-400 mb-4">
                        Manages user profiles with wallet names and optional IPFS profile pictures via Pinata.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300"><strong>Key Functions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                          <li><code className="text-primary-400">registerUser(name, ipfsHash)</code> - Register new user</li>
                          <li><code className="text-primary-400">updateProfile(name, ipfsHash)</code> - Update profile</li>
                          <li><code className="text-primary-400">getUserProfile(address)</code> - Get user info</li>
                        </ul>
                      </div>
                    </div>

                    {/* NodeRegistry */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-2 text-white">NodeRegistry</h3>
                      <p className="text-sm text-gray-400 mb-3 font-mono">0x616D6c01A73Fe40fB7BD7EeAcD20b8df77968244</p>
                      <p className="text-gray-400 mb-4">
                        Registry for VPN nodes with pricing, bandwidth, and metadata.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300"><strong>Key Functions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                          <li><code className="text-primary-400">registerNode(...)</code> - Register VPN node</li>
                          <li><code className="text-primary-400">getActiveNodes()</code> - Get all active nodes</li>
                          <li><code className="text-primary-400">updateNode(nodeId, price, endpoint)</code> - Update settings</li>
                        </ul>
                      </div>
                    </div>

                    {/* EscrowPayment */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-2 text-white">EscrowPayment</h3>
                      <p className="text-sm text-gray-400 mb-3 font-mono">0xd018F55720244C5F6bec33BCc5B7D2354C5f71A3</p>
                      <p className="text-gray-400 mb-4">
                        Handles payments, sessions, and data usage tracking with escrow protection.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300"><strong>Key Functions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                          <li><code className="text-primary-400">createSession(nodeId, maxDataGB, duration)</code> - Purchase VPN access</li>
                          <li><code className="text-primary-400">claimPayout(sessionId, dataUsed)</code> - Operator claims payment</li>
                          <li><strong className="text-primary-400">Platform fee:</strong> 1% of total payment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deploy Node */}
            {activeSection === 'deploy-node' && (
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-3xl font-bold mb-4 gradient-text">Deploy Your VPN Node</h2>
                  <p className="text-gray-300 mb-6">
                    Earn cryptocurrency by hosting a VPN node. Follow these steps to get started.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-400">
                        <li>Ubuntu 20.04 or 22.04 VPS</li>
                        <li>Minimum 2GB RAM</li>
                        <li>20GB+ storage</li>
                        <li>Public IP address</li>
                        <li>Root/sudo access</li>
                        <li>Wallet with ETH for gas fees</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">Deployment Script</h3>
                      <div className="relative">
                        <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto border border-white/10">
                          <code className="text-primary-300 font-mono text-sm">
                            curl -sSL https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/deploy-vpn-node.sh | sudo bash
                          </code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">What the Script Does</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                          <div>
                            <p className="font-semibold text-white">Auto-detects your server IP</p>
                            <p className="text-sm text-gray-400">Confirms or allows you to change it</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                          <div>
                            <p className="font-semibold text-white">Collects node configuration</p>
                            <p className="text-sm text-gray-400">Name, region, price, bandwidth, private key</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                          <div>
                            <p className="font-semibold text-white">Installs dependencies</p>
                            <p className="text-sm text-gray-400">OpenVPN, Node.js, and required packages</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                          <div>
                            <p className="font-semibold text-white">Configures OpenVPN</p>
                            <p className="text-sm text-gray-400">Sets up certificates, server config, and networking</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                          <div>
                            <p className="font-semibold text-white">Starts API server</p>
                            <p className="text-sm text-gray-400">Manages sessions and data tracking</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 font-bold">6</div>
                          <div>
                            <p className="font-semibold text-white">Registers on blockchain</p>
                            <p className="text-sm text-gray-400">Your node appears in marketplace automatically</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="font-bold text-yellow-400 mb-2">⚠️ Security Note</h4>
                      <p className="text-gray-300 text-sm">
                        Never share your private key. The deployment script uses it only to register your node on the blockchain. 
                        It's stored locally on your server in a secure .env file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-3xl font-bold mb-4 gradient-text">Security</h2>
                  <p className="text-gray-300 mb-6">
                    HORIZN is built with security as a top priority at every layer.
                  </p>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                        <FiShield className="w-6 h-6 mr-2 text-green-400" />
                        OpenVPN Encryption
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-400">
                        <li>AES-256-CBC encryption</li>
                        <li>SHA-512 authentication</li>
                        <li>TLS-crypt for additional security</li>
                        <li>Perfect forward secrecy</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                        <FiCode className="w-6 h-6 mr-2 text-blue-400" />
                        Smart Contract Security
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-400">
                        <li>Escrow-based payments protect both parties</li>
                        <li>Access control for sensitive functions</li>
                        <li>Immutable contracts on Ethereum</li>
                        <li>No centralized control or backdoors</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                        <FiServer className="w-6 h-6 mr-2 text-purple-400" />
                        Node Security
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-400">
                        <li>Operators run their own infrastructure</li>
                        <li>No logging or tracking of user activity</li>
                        <li>Private keys stored locally only</li>
                        <li>Systemd service isolation</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                      <h4 className="font-bold text-green-400 mb-2">✅ Best Practices</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        <li>Always verify contract addresses before transactions</li>
                        <li>Use hardware wallets for large amounts</li>
                        <li>Keep your VPS updated and secured</li>
                        <li>Enable firewall and only open necessary ports</li>
                        <li>Regularly monitor your node's performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Economics */}
            {activeSection === 'economics' && (
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-3xl font-bold mb-4 gradient-text">Economics</h2>
                  <p className="text-gray-300 mb-6">
                    Understanding how payments and incentives work in the HORIZN marketplace.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">Pricing Model</h3>
                      <p className="text-gray-400 mb-4">
                        Node operators set their own prices per gigabyte of data. The marketplace is competitive, 
                        allowing users to choose based on price, location, and bandwidth.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                          <p className="text-sm text-gray-400 mb-1">Typical Range</p>
                          <p className="text-2xl font-bold gradient-text">0.001 - 0.01 ETH/GB</p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                          <p className="text-sm text-gray-400 mb-1">Platform Fee</p>
                          <p className="text-2xl font-bold gradient-text">1%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">Payment Flow</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                          <div>
                            <p className="font-semibold text-white">User purchases session</p>
                            <p className="text-sm text-gray-400">Funds are locked in escrow smart contract</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                          <div>
                            <p className="font-semibold text-white">User consumes data</p>
                            <p className="text-sm text-gray-400">Node tracks actual usage via OpenVPN</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                          <div>
                            <p className="font-semibold text-white">Operator claims payout</p>
                            <p className="text-sm text-gray-400">Submits data used, receives payment minus 1% fee</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                          <div>
                            <p className="font-semibold text-white">User gets refund</p>
                            <p className="text-sm text-gray-400">Unused funds automatically returned</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">Earnings Example</h3>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
                        <p className="text-gray-300 mb-4">
                          If you run a node and serve <strong>1 TB (1,000 GB)</strong> of data per month at <strong>0.001 ETH/GB</strong>:
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Gross Revenue:</span>
                            <span className="text-white font-semibold">1 ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Platform Fee (1%):</span>
                            <span className="text-red-400 font-semibold">-0.01 ETH</span>
                          </div>
                          <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                            <span className="text-white font-bold">Your Earnings:</span>
                            <span className="text-2xl font-bold gradient-text">0.99 ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-bold text-blue-400 mb-2">💡 Pro Tips</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        <li>Price competitively to attract more users</li>
                        <li>Higher bandwidth = more potential customers</li>
                        <li>Popular regions (US, EU) tend to have higher demand</li>
                        <li>Monitor your node's uptime for consistent earnings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
