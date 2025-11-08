'use client';

import { motion } from 'framer-motion';
import { FiServer, FiDollarSign, FiCode, FiCheckCircle, FiCopy } from 'react-icons/fi';
import { useState } from 'react';

export default function BecomeSellerPage() {
  const [copied, setCopied] = useState(false);

  const deployCommand = `curl -sSL https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/deploy-vpn-node.sh | sudo bash`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(deployCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      number: 1,
      title: 'Get an Ubuntu VPS',
      description: 'Rent a server from providers like DigitalOcean, AWS, Vultr, or Linode',
      requirements: ['Ubuntu 20.04 or 22.04', '2GB+ RAM', '20GB+ Storage', 'Public IP address'],
    },
    {
      number: 2,
      title: 'Run Deployment Script',
      description: 'SSH into your server and run our automated deployment script',
      requirements: ['Root access', 'Internet connection', 'Wallet private key ready'],
    },
    {
      number: 3,
      title: 'Configure Your Node',
      description: 'The script will ask for your preferences',
      requirements: ['Node name', 'Region', 'Price per GB (ETH)', 'Private key'],
    },
    {
      number: 4,
      title: 'Start Earning',
      description: 'Your node will be registered and visible in the marketplace',
      requirements: ['Automatic blockchain registration', 'Live in marketplace', 'Earn crypto automatically'],
    },
  ];

  const features = [
    {
      icon: FiDollarSign,
      title: 'Earn Cryptocurrency',
      description: 'Get paid in ETH for sharing your bandwidth. Set your own prices.',
    },
    {
      icon: FiServer,
      title: 'Easy Setup',
      description: 'One-command deployment. Everything is automated for you.',
    },
    {
      icon: FiCode,
      title: 'Full Control',
      description: 'Manage pricing, bandwidth, and node status anytime.',
    },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Become a <span className="gradient-text">VPN Provider</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Turn your server into a revenue stream. Join the decentralized VPN revolution 
            and earn cryptocurrency by sharing your bandwidth.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Quick Start</span> - Deploy in Minutes
          </h2>
          <p className="text-gray-400 mb-6">
            Copy and run this command on your Ubuntu server:
          </p>
          
          <div className="relative">
            <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto border border-white/10">
              <code className="text-primary-300 font-mono text-sm">
                {deployCommand}
              </code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 btn-secondary p-2"
            >
              {copied ? (
                <FiCheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <FiCopy className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">
              <strong>Important:</strong> Have your wallet private key ready. The script will need it to register your node on the blockchain.
            </p>
          </div>
        </motion.div>

        {/* Step by Step */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Step-by-Step <span className="gradient-text">Guide</span>
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-400 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.requirements.map((req, i) => (
                        <li key={i} className="flex items-center text-gray-300 text-sm">
                          <FiCheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Earnings Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Potential <span className="gradient-text">Earnings</span>
          </h2>
          <p className="text-gray-400 mb-6">
            Example: If you serve 1TB of data per month at 0.001 ETH/GB
          </p>
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/20">
            <div className="text-5xl font-bold gradient-text mb-2">
              ~1 ETH
            </div>
            <div className="text-gray-400">per month</div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            *Actual earnings depend on demand, pricing, and bandwidth usage
          </p>
        </motion.div>
      </div>
    </div>
  );
}
