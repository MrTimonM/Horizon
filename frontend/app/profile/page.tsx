'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { getUserRegistryContract } from '@/utils/contracts';
import { uploadToPinata, getIPFSUrl } from '@/utils/pinata';
import { motion } from 'framer-motion';
import { FiUser, FiImage, FiSave, FiLogOut } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { signer, address, isConnected, disconnectWallet } = useWalletStore();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    loadProfile();
  }, [address, signer]);

  const loadProfile = async () => {
    if (!signer || !address) return;

    try {
      const contract = getUserRegistryContract(signer);
      const userProfile = await contract.getUserProfile(address);
      
      if (userProfile.exists) {
        setProfile(userProfile);
        setUsername(userProfile.walletName);
        if (userProfile.profilePictureIPFS) {
          setImagePreview(getIPFSUrl(userProfile.profilePictureIPFS));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!signer) return;

    setSaving(true);
    try {
      let ipfsHash = profile?.profilePictureIPFS || '';
      
      if (profileImage) {
        ipfsHash = await uploadToPinata(profileImage);
      }

      const contract = getUserRegistryContract(signer);
      const tx = await contract.updateProfile(username, ipfsHash);
      await tx.wait();

      await loadProfile();
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    disconnectWallet();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile?.exists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">You need to register first</p>
          <button
            onClick={() => router.push('/register')}
            className="btn-primary"
          >
            Register Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          {/* Profile Picture */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-4 border-white/10">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                  <FiImage className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            {editing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none transition-colors text-white"
                maxLength={50}
              />
            ) : (
              <div className="text-2xl font-bold">{profile.walletName}</div>
            )}
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <div className="p-3 rounded-lg glass border border-white/10 font-mono text-sm">
              {address}
            </div>
          </div>

          {/* Registration Date */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Member Since
            </label>
            <div className="text-gray-400">
              {new Date(Number(profile.registeredAt) * 1000).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile.walletName);
                    setImagePreview(profile.profilePictureIPFS ? getIPFSUrl(profile.profilePictureIPFS) : '');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary flex-1"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
