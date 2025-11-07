import Link from 'next/link';
import { FiGithub, FiTwitter, FiGlobe, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">H</span>
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">HORIZN</h3>
                <p className="text-xs text-gray-400">Network Without Borders</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              A decentralized VPN marketplace powered by blockchain technology. 
              Connect securely, privately, and without borders.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="mailto:contact@horizn.network"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors">
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white text-sm transition-colors">Marketplace</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
              <li><Link href="/become-seller" className="text-gray-400 hover:text-white text-sm transition-colors">Become a Seller</Link></li>
              <li><Link href="/docs" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">Support</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} HORIZN. All rights reserved. Built with ❤️ on Ethereum.
          </p>
        </div>
      </div>
    </footer>
  );
}
