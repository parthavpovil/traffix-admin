import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/sidebar';
import StatsCard from './components/dashboard/stats_card';
import WalletConnect from './components/wallet/wallet_connect';
import './App.css';
import PendingReports from './components/reports/pending_reports';
import VerifiedReports from './components/reports/verified_reports';
import ContractService from './services/contract_service';
import DashboardContent from './components/dashboard/dashboard_content';
import AddressReports from './components/reports/address_reports';
import { ThemeProvider } from './contexts/theme_context';
import { useTheme } from './contexts/theme_context';
import WithdrawForm from './components/contract/WithdrawForm';

function AppContent() {
  const { isDarkMode } = useTheme();
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

  const handleDisconnect = () => {
    setWalletAddress(null);
    // Clear any stored data
    setStats({
      totalReports: '0',
      verifiedCount: '0',
      totalRewards: '0',
      contractBalance: '0'
    });
  };

  // If wallet is not connected, show connect wallet screen
  if (!walletAddress) {
    return <WalletConnect onConnect={handleWalletConnect} />;
  }

  return (
    <div className={`flex min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={`flex-1 p-6 md:p-8 overflow-auto ${
        isDarkMode ? 'text-gray-100' : ''
      }`}>
        {/* Wallet Info */}
        <div className="flex justify-end mb-8">
          <div className={`group cursor-pointer ${
            isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:bg-gray-50'
          } px-6 py-3 rounded-xl shadow-sm flex items-center gap-3 border transition-colors duration-200`}
          onClick={handleDisconnect}
          title="Click to disconnect wallet"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Connected:</span>
            <span className={`font-mono text-sm ${
              isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600'
            } px-3 py-1 rounded-lg`}>
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
            
            {/* Disconnect hint */}
            <span className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}>
              Disconnect
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        )}

        {/* Other Tabs Content */}
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-xl shadow-sm border`}>
          {activeTab === 'pending' && <PendingReports />}
          {activeTab === 'verified' && <VerifiedReports />}
          {activeTab === 'search' && <AddressReports />}
          {activeTab === 'contract' && (
            <div className="p-8">
              <h2 className={`text-2xl font-bold mb-6 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Contract Management</h2>
              <WithdrawForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
