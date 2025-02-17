import React, { useState } from 'react';
import AnimatedLogoSVG from '../common/animated_logo_svg';
import ContractService from '../../services/contract_service';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    setSuccess('');
    
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this application');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        const connectedAddress = accounts[0];
        
        // Initialize contract
        await ContractService.init();
        
        // Get the owner address from the contract's owner() function
        const ownerAddress = await ContractService.contract.owner();
        
        // Convert both addresses to lowercase for comparison
        const connectedLower = connectedAddress.toLowerCase();
        const ownerLower = ownerAddress.toLowerCase();

        console.log('Owner Address from Contract:', ownerLower);
        console.log('Connected Wallet Address:', connectedLower);
        
        if (connectedLower === ownerLower) {
          setSuccess(`Successfully connected! You are the contract owner. Redirecting to dashboard...`);
          setTimeout(() => {
            onConnect(connectedAddress);
          }, 2000);
        } else {
          throw new Error(`Unauthorized: Only the contract owner (${ownerAddress}) can access this dashboard`);
        }
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <AnimatedLogoSVG className="w-24 h-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Traffic Report
          </h2>
          <p className="text-gray-600 mb-8">
            Connect your wallet to access the dashboard
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`
              w-full py-3 px-4 rounded-lg text-white font-medium
              ${isConnecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {typeof window.ethereum === 'undefined' && (
            <p className="mt-6 text-base text-gray-500">
              Don't have MetaMask?{' '}
              <a 
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Install it here
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnect; 