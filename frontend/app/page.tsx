'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShield, FiGlobe, FiZap, FiLock, FiTrendingUp, FiUsers, FiArrowRight, FiCheck, FiServer, FiActivity } from 'react-icons/fi';

export default function Home() {
  const features = [
    {
      icon: FiShield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption with decentralized infrastructure ensures your data remains private and secure.',
    },
    {
      icon: FiGlobe,
      title: 'Global Infrastructure',
      description: 'Access a worldwide network of high-performance nodes strategically distributed across continents.',
    },
    {
      icon: FiZap,
      title: 'Lightning Performance',
      description: 'Optimized routing and guaranteed bandwidth deliver seamless streaming and browsing experiences.',
    },
    {
      icon: FiLock,
      title: 'Zero-Knowledge Privacy',
      description: 'No logging, no tracking, no compromises. Your digital footprint remains completely invisible.',
    },
    {
      icon: FiTrendingUp,
      title: 'Monetization Platform',
      description: 'Transform idle bandwidth into revenue streams by operating nodes in the marketplace ecosystem.',
    },
    {
      icon: FiUsers,
      title: 'Community Governed',
      description: 'Decentralized autonomous infrastructure powered by smart contracts and community consensus.',
    },
  ];

  const stats = [
    { label: 'Active Nodes', value: '1,234', suffix: '+' },
    { label: 'Global Regions', value: '85', suffix: '+' },
    { label: 'Data Processed', value: '2.5', suffix: ' PB' },
    { label: 'Active Users', value: '10K', suffix: '+' },
  ];

  const benefits = [
    'No centralized control or single point of failure',
    'Transparent pricing with blockchain-verified transactions',
    'Instant deployment with automated node configuration',
    'Real-time analytics and performance monitoring',
    'Escrow-protected payments for buyer security',
    'Competitive marketplace with dynamic pricing',
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-block mb-8"
            >
              <div className="inline-flex items-center px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-sm font-medium text-gray-300">Decentralized VPN Infrastructure</span>
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span className="block text-white">Network Without</span>
              <span className="block gradient-text mt-2">Borders</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Enterprise-grade decentralized VPN marketplace powered by Ethereum. 
              <br className="hidden md:block" />
              Secure connectivity, transparent pricing, and blockchain-verified infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/marketplace" className="btn-primary group inline-flex items-center">
                <span>Explore Marketplace</span>
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/become-seller" className="btn-secondary group inline-flex items-center">
                <FiServer className="mr-2" />
                <span>Deploy Node</span>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}<span className="text-brand-500">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
              Built on blockchain technology with institutional-grade security and performance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="glass-card h-full hover:border-brand-500/30 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-brand-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 relative bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose HORIZN
              </h2>
              <p className="text-xl text-gray-400 mb-10 font-light">
                A decentralized approach to VPN infrastructure that prioritizes transparency, security, and performance.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck className="w-4 h-4 text-brand-500" />
                    </div>
                    <p className="text-gray-300">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/docs" className="btn-primary inline-flex items-center">
                  <span>Read Documentation</span>
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-500/20 flex items-center justify-center">
                        <FiActivity className="w-6 h-6 text-brand-500" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Network Status</div>
                        <div className="text-lg font-semibold text-white">All Systems Operational</div>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-brand-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Uptime</div>
                      <div className="text-2xl font-bold text-white">99.9%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Avg Speed</div>
                      <div className="text-2xl font-bold text-white">850 Mbps</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20">
                    <div className="flex items-start space-x-4">
                      <FiShield className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-white mb-2">Smart Contract Verified</div>
                        <div className="text-sm text-gray-400">All transactions are secured by Ethereum smart contracts with full transparency and immutability.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
              Join the decentralized VPN revolution. Connect securely or start earning by deploying your own node.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="btn-primary">
                Create Account
              </Link>
              <Link href="/docs" className="btn-secondary">
                View Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
