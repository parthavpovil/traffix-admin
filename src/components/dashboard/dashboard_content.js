import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../../contexts/theme_context';

const DashboardContent = ({ stats }) => {
  const { isDarkMode } = useTheme();

  // Sample data for the area chart (you can modify this with real data)
  const reportData = [
    { name: 'Jan', reports: 4 },
    { name: 'Feb', reports: 7 },
    { name: 'Mar', reports: 5 },
    { name: 'Apr', reports: 8 },
    { name: 'May', reports: 12 },
    { name: 'Jun', reports: 9 }
  ];

  const pieData = [
    { name: 'Verified', value: parseInt(stats.verifiedCount) },
    { name: 'Pending', value: parseInt(stats.totalReports) - parseInt(stats.verifiedCount) }
  ];

  const COLORS = ['#10B981', '#FCD34D'];

  return (
    <div className="space-y-6">
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Reports Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
                />
                <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: isDarkMode ? '#E5E7EB' : '#1F2937'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stroke="#3B82F6" 
                  fill={isDarkMode ? '#2563EB' : '#93C5FD'} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Reports Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: isDarkMode ? '#E5E7EB' : '#1F2937'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-600'}>
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Financial Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Rewards Distributed
            </h4>
            <div className="mt-2 flex items-baseline">
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {stats.totalRewards}
              </p>
              <p className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total paid out
              </p>
            </div>
          </div>
          <div>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Contract Balance
            </h4>
            <div className="mt-2 flex items-baseline">
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {stats.contractBalance}
              </p>
              <p className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Available for rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {/* Sample activity items */}
          <div className={`flex items-center justify-between p-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-lg`}>
            <div className="flex items-center">
              <div className={`${
                isDarkMode ? 'bg-gray-600' : 'bg-blue-100'
              } p-2 rounded-full`}>
                <span className="text-blue-600">📝</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>New Report Submitted</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Report #123 - Traffic Light Malfunction</p>
              </div>
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>2 hours ago</span>
          </div>
          
          <div className={`flex items-center justify-between p-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-lg`}>
            <div className="flex items-center">
              <div className={`${
                isDarkMode ? 'bg-gray-600' : 'bg-green-100'
              } p-2 rounded-full`}>
                <span className="text-green-600">✓</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>Report Verified</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Report #120 - 0.5 ETH Reward Paid</p>
              </div>
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 