import React, { createContext, useState, useContext, useEffect } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request accounts with explicit parameters
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
        params: []
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Get and set chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        setChainId(chainId);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletAddress(null);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const chainId = await window.ethereum.request({
              method: 'eth_chainId'
            });
            setChainId(chainId);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload();
      });

      // Listen for connection events
      window.ethereum.on('connect', ({ chainId }) => {
        setChainId(chainId);
      });

      window.ethereum.on('disconnect', () => {
        setWalletAddress(null);
        setChainId(null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('connect');
        window.ethereum.removeAllListeners('disconnect');
      }
    };
  }, []);

  return (
    <WalletContext.Provider 
      value={{ 
        walletAddress, 
        setWalletAddress, 
        chainId,
        connectWallet,
        isConnecting 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 