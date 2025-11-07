import axios from 'axios';
import { PINATA_CONFIG } from '@/config/contracts';

export const uploadToPinata = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: `profile-${Date.now()}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${PINATA_CONFIG.jwt}`,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

export const getIPFSUrl = (ipfsHash: string): string => {
  if (!ipfsHash) return '';
  return `https://${PINATA_CONFIG.gateway}/ipfs/${ipfsHash}`;
};
