import React from 'react';
import trafficLogo from '../../assets/traffic-logo.svg';
import { useTheme } from '../../contexts/theme_context';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'pending', label: 'Pending Reports', icon: '⏳' },
    { id: 'verified', label: 'Verified Reports', icon: '✅' },
    { id: 'search', label: 'Reporter Search', icon: '🔍' },
    { id: 'contract', label: 'Contract Management', icon: '⚙️' },
  ];

  return (
    <div className={`w-72 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-r border-gray-100 h-screen`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-blue-600">
              <img src={trafficLogo} alt="Traffix Report" className="w-full h-full" />
            </div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Traffix Report
            </h1>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors duration-200
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-xl
                    flex items-center gap-3 transition-all duration-200
                    ${activeTab === item.id 
                      ? isDarkMode
                        ? 'bg-gray-700 text-blue-400 font-medium'
                        : 'bg-blue-50 text-blue-600 font-medium'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 