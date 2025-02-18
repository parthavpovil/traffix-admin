import React, { useState } from 'react';
import ContractService from '../../services/contract_service';
import ReportCard from './report_card';

const AddressReports = () => {
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
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Reporter Search</h2>
      
      <div className="mb-8">
        <div className="flex gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600 placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`
              px-8 py-4 rounded-xl font-medium
              flex items-center gap-2
              transition-all duration-200
              ${loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 max-w-2xl">
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : reports.length > 0 ? (
        <div>
          <div className="mb-4 text-sm text-gray-600">
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
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}
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
                      ${currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'}
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
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}
                `}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : address && !loading && (
        <div className="text-center py-12 text-gray-500">
          No reports found for this address
        </div>
      )}
    </div>
  );
};

export default AddressReports; 