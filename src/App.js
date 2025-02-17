import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/sidebar';
import StatsCard from './components/dashboard/stats_card';
import WalletConnect from './components/wallet/wallet_connect';
import './App.css';
import PendingReports from './components/reports/pending_reports';
import VerifiedReports from './components/reports/verified_reports';
import ContractService from './services/contract_service';
import DashboardContent from './components/dashboard/dashboard_content';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState(null);
  const [stats, setStats] = useState({
    totalReports: '0',
    verifiedCount: '0',
    totalRewards: '0',
    contractBalance: '0'
  });

  useEffect(() => {
    if (walletAddress && activeTab === 'dashboard') {
      loadStats();
    }
  }, [walletAddress, activeTab]);

  const loadStats = async () => {
    try {
      const contractStats = await ContractService.getContractStats();
      setStats({
        totalReports: contractStats.totalReports.toString(),
        verifiedCount: contractStats.verifiedCount.toString(),
        totalRewards: `${contractStats.totalRewards} ETH`,
        contractBalance: `${contractStats.contractBalance} ETH`
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statsCards = [
    { title: 'Total Reports', value: stats.totalReports, icon: '📝' },
    { title: 'Verified Reports', value: stats.verifiedCount, icon: '✅' },
    { title: 'Total Rewards', value: stats.totalRewards, icon: '🏆' },
    { title: 'Contract Balance', value: stats.contractBalance, icon: '💰' },
  ];

  // Handle wallet connection
  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  // If wallet is not connected, show connect wallet screen
  if (!walletAddress) {
    return <WalletConnect onConnect={handleWalletConnect} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8">
        {/* Wallet Info */}
        <div className="flex justify-end mb-6">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center">
            <span className="text-gray-600 mr-2">Connected:</span>
            <span className="text-sm font-mono">
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
          </div>
        </div>

        {/* Only show stats in dashboard */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>
            <DashboardContent stats={stats} />
          </>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'dashboard' && <h2>Dashboard Content</h2>}
          {activeTab === 'pending' && <PendingReports />}
          {activeTab === 'verified' && <VerifiedReports />}
          {activeTab === 'contract' && <h2>Contract Management</h2>}
        </div>
      </main>
    </div>
  );
}

export default App;
