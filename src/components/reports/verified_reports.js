import React, { useState, useEffect } from 'react';
import ContractService from '../../services/contract_service';
import ReportCard from './report_card';
import { useTheme } from '../../contexts/theme_context';

const VerifiedReports = () => {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize contract if needed
      if (!ContractService.contract) {
        await ContractService.init();
      }

      console.log('Fetching verified reports...');
      const verifiedReports = await ContractService.getVerifiedReports();
      console.log('Verified Reports:', verifiedReports);
      
      if (Array.isArray(verifiedReports)) {
        setReports(verifiedReports);
      } else {
        throw new Error('Invalid response format from contract');
      }
    } catch (err) {
      console.error('Error in loadReports:', err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < reports.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'text-gray-100' : ''}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${
        isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-700'
      } p-4 rounded-lg`}>
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : ''}`}>
          Verified Reports
        </h2>
        <p className={`text-center py-8 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          No verified reports found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : ''}`}>
          Verified Reports
        </h2>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Report {currentIndex + 1} of {reports.length}
        </div>
      </div>

      {reports[currentIndex] && (
        <ReportCard 
          report={reports[currentIndex]} 
        />
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
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
                ${currentIndex === index ? 
                  (isDarkMode ? 'bg-blue-400' : 'bg-blue-500') : 
                  (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}
              `}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
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
    </div>
  );
};

export default VerifiedReports; 