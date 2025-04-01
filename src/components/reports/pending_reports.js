import React, { useState, useEffect } from 'react';
import ContractService from '../../services/contract_service';
import ReportCard from './report_card';
import { useTheme } from '../../contexts/theme_context';

const PendingReports = () => {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const allReports = await ContractService.getAllReports();
      const pendingReports = allReports.filter(report => !report.verified);
      setReports(pendingReports);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (report) => {
    try {
      // Show verification in progress
      setVerifying(true);
      setVerificationStatus({ type: 'info', message: 'Processing verification...' });
      
      // Prompt for reward amount
      const rewardAmount = prompt('Enter reward amount in ETH:', '0.01');
      
      // Check if user cancelled the prompt
      if (rewardAmount === null) {
        setVerifying(false);
        setVerificationStatus(null);
        return;
      }
      
      // Parse and validate reward amount
      const rewardValue = parseFloat(rewardAmount);
      if (isNaN(rewardValue) || rewardValue <= 0) {
        setVerificationStatus({ 
          type: 'error', 
          message: 'Invalid reward amount. Please enter a positive number.' 
        });
        setVerifying(false);
        return;
      }
      
      // Verify the report with the specified reward
      await ContractService.verifyReport(report.id, rewardValue);
      
      // Update status and reload reports to reflect changes
      setVerificationStatus({ 
        type: 'success', 
        message: `Report verified and ${rewardValue} ETH reward sent successfully!` 
      });
      
      // Reload reports to update the list (removing the now-verified report)
      await loadReports();
      
      // Reset current index if needed
      if (currentIndex >= reports.length - 1) {
        setCurrentIndex(Math.max(0, reports.length - 2));
      }
      
    } catch (err) {
      console.error('Error verifying report:', err);
      setVerificationStatus({ 
        type: 'error', 
        message: `Verification failed: ${err.message}` 
      });
    } finally {
      setVerifying(false);
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
          Pending Reports
        </h2>
        <p className={`text-center py-8 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          No pending reports found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : ''}`}>
          Pending Reports
        </h2>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Report {currentIndex + 1} of {reports.length}
        </div>
      </div>

      {/* Verification status message */}
      {verificationStatus && (
        <div className={`mb-4 p-4 rounded-lg ${
          verificationStatus.type === 'success' ? 
            (isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-50 text-green-700') :
          verificationStatus.type === 'error' ? 
            (isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-700') : 
            (isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-700')
        }`}>
          {verificationStatus.message}
        </div>
      )}

      <ReportCard 
        report={reports[currentIndex]} 
        onVerify={verifying ? null : handleVerify}
      />

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || verifying}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${currentIndex === 0 || verifying
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
              onClick={() => !verifying && setCurrentIndex(index)}
              className={`
                w-3 h-3 rounded-full
                ${currentIndex === index ? 
                  (isDarkMode ? 'bg-blue-400' : 'bg-blue-500') : 
                  (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}
                ${verifying ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === reports.length - 1 || verifying}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${currentIndex === reports.length - 1 || verifying
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

export default PendingReports; 