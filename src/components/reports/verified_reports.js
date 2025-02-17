import React, { useState, useEffect } from 'react';
import ContractService from '../../services/contract_service';
import ReportCard from './report_card';

const VerifiedReports = () => {
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
      const verifiedReports = await ContractService.getVerifiedReports();
      setReports(verifiedReports);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error('Error loading reports:', err);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Verified Reports</h2>
        <p className="text-gray-500 text-center py-8">
          No verified reports found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verified Reports</h2>
        <div className="text-sm text-gray-500">
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
          onClick={handleNext}
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
    </div>
  );
};

export default VerifiedReports; 