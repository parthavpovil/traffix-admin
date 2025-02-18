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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-8 animate-float">
            <AnimatedLogoSVG className="w-full h-full" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Traffix Dashboard
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Connect your wallet to access the dashboard
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl mb-8 text-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-6 rounded-xl mb-8 text-lg">
              {success}
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`
              w-full max-w-md mx-auto
              py-6 px-8 rounded-xl
              text-xl font-semibold
              transition-all duration-200
              transform hover:scale-105
              flex items-center justify-center gap-4
              ${isConnecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 35 33" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M32.9582 1L18.9291 10.5986L21.2916 5.02242L32.9582 1Z"
                fill="#E17726"
                stroke="#E17726"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.04187 1L15.9081 10.7218L13.7083 5.02242L2.04187 1Z"
                fill="#E27625"
                stroke="#E27625"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28.2308 23.5584L24.7417 28.8935L32.3125 30.9153L34.4792 23.6817L28.2308 23.5584Z"
                fill="#E27625"
                stroke="#E27625"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0.541667 23.6817L2.69792 30.9153L10.2687 28.8935L6.77958 23.5584L0.541667 23.6817Z"
                fill="#E27625"
                stroke="#E27625"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isConnecting ? 'Connecting...' : 'Connect with MetaMask'}</span>
          </button>

          {typeof window.ethereum === 'undefined' && (
            <p className="mt-8 text-lg text-gray-600">
              Don't have MetaMask?{' '}
              <a 
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Install it here
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-green-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default WalletConnect; 