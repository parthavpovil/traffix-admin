import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pending', label: 'Pending Reports', icon: '⏳' },
    { id: 'verified', label: 'Verified Reports', icon: '✅' },
    { id: 'contract', label: 'Contract Management', icon: '💰' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-xl font-bold mb-8 p-2">Admin Dashboard</div>
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left p-3 mb-2 rounded flex items-center
              ${activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 