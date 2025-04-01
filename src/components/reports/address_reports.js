import React, { useState } from 'react';
import ContractService from '../../services/contract_service';
import ReportCard from './report_card';
import { useTheme } from '../../contexts/theme_context';

const AddressReports = () => {
  const { isDarkMode } = useTheme();
  const [address, setAddress] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSearch = async () => {
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedReports = await ContractService.getReportsByAddress(address);
      setReports(fetchedReports);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports for this address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className={`text-2xl font-bold mb-8 ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>Reporter Search</h2>
      
      <div className="mb-8">
        <div className="flex gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`flex-1 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-400' 
                : 'border border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500'
            }`}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`
              px-8 py-4 rounded-xl font-medium
              flex items-center gap-2
              transition-all duration-200
              ${loading 
                ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400') + ' cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <span>🔍</span>
                Search
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className={`mt-4 p-4 rounded-xl border max-w-2xl ${
            isDarkMode 
              ? 'bg-red-900 text-red-100 border-red-800'
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className={`flex justify-center items-center h-64 ${
          isDarkMode ? 'text-gray-100' : ''
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : reports.length > 0 ? (
        <div>
          <div className={`mb-4 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Found {reports.length} reports for this address
          </div>
          
          {reports[currentIndex] && (
            <ReportCard report={reports[currentIndex]} />
          )}

          {reports.length > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2
                  ${currentIndex === 0 
                    ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400') + ' cursor-not-allowed'
                    : (isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')}
                `}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {reports.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      w-3 h-3 rounded-full
                      ${currentIndex === index 
                        ? (isDarkMode ? 'bg-blue-400' : 'bg-blue-500')
                        : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}
                    `}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                disabled={currentIndex === reports.length - 1}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2
                  ${currentIndex === reports.length - 1
                    ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400') + ' cursor-not-allowed'
                    : (isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600')}
                `}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : address && !loading && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No reports found for this address
        </div>
      )}
    </div>
  );
};

export default AddressReports; 