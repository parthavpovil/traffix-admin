import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ContractService from '../../services/contract_service';
import L from 'leaflet';
import { useTheme } from '../../contexts/theme_context';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ReporterModal = ({ reporter, onClose }) => {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    loadReporterData();
    // Add event listener to handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [reporter, onClose]);

  const loadReporterData = async () => {
    try {
      setLoading(true);
      const reporterReports = await ContractService.getReportsByAddress(reporter);
      setReports(reporterReports);
    } catch (err) {
      setError('Failed to load reporter data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent clicks inside modal from closing it
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={onClose} // Close when clicking the backdrop
    >
      <div 
        className={`${
          isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
        } rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}
        onClick={handleModalClick} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Reporter Details</h3>
          <button 
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reporter Address:</p>
          <p className="font-mono">{reporter}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div>
            <h4 className="font-semibold mb-3">Total Reports: {reports.length}</h4>
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className={`border ${
                    isDarkMode ? 'border-gray-700 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'
                  } rounded-lg p-4`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Report #{report.id}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      report.verified 
                        ? (isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800')
                        : (isDarkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-100 text-yellow-800')
                    }`}>
                      {report.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.description}</p>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(report.timestamp * 1000).toLocaleString()}
                  </div>
                  {report.verified && (
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Reward: {ethers.formatEther(report.reward.toString())} ETH
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ report, onVerify }) => {
  const { isDarkMode } = useTheme();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showReporterModal, setShowReporterModal] = useState(false);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEther = (value) => {
    try {
      return ethers.formatEther(value.toString());
    } catch (error) {
      console.error('Error formatting ether value:', error);
      return '0';
    }
  };

  // Parse location string to get coordinates
  const getLocationCoords = (location) => {
    try {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      return [lat, lng];
    } catch (error) {
      console.error('Error parsing location:', error);
      return [0, 0]; // Default coordinates if parsing fails
    }
  };

  const coordinates = getLocationCoords(report.location);

  return (
    <div className={`${
      isDarkMode ? 'bg-gray-800 text-gray-100 shadow-lg' : 'bg-white text-gray-800 shadow-md'
    } rounded-lg p-6 mb-4`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold">Report #{report.id}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Reporter:{' '}
            <button
              onClick={() => setShowReporterModal(true)}
              className={`${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'
              } hover:underline font-mono`}
            >
              {formatAddress(report.reporter)}
            </button>
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Submitted: {formatDate(report.timestamp)}
          </p>
        </div>
        {!report.verified && onVerify && (
          <button
            onClick={() => onVerify(report)}
            disabled={!onVerify}
            className={`
              px-4 py-2 rounded-lg
              ${!onVerify
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'} 
              transition-colors
            `}
          >
            {!onVerify ? 'Processing...' : 'Verify & Reward'}
          </button>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Description:</h4>
        <p className={`${
          isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'
        } p-3 rounded-lg`}>{report.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } p-4 rounded-lg`}>
          <h4 className="font-medium mb-4">Evidence:</h4>
          {report.evidenceLink && (
            <div className="space-y-4">
              <div className="relative w-full flex justify-center">
                <img 
                  src={ContractService.getIpfsUrl(report.evidenceLink)}
                  alt="Report Evidence"
                  className={`
                    rounded-lg shadow-sm object-cover h-64 w-full
                    ${isImageExpanded ? 'fixed top-0 left-0 w-screen h-screen z-50 object-contain p-4 bg-black bg-opacity-75' : ''}
                  `}
                  onClick={() => setIsImageExpanded(!isImageExpanded)}
                  onError={(e) => {
                    e.target.src = 'placeholder-image.jpg';
                    e.target.alt = 'Failed to load evidence';
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              {!isImageExpanded && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setIsImageExpanded(true)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    View Larger
                  </button>
                  <a 
                    href={ContractService.getIpfsUrl(report.evidenceLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                  >
                    Open Original
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } p-4 rounded-lg`}>
          <h4 className="font-medium mb-4">Location:</h4>
          <div className="space-y-4">
            <div className="h-64 w-full relative">
              <MapContainer 
                center={coordinates} 
                zoom={13} 
                className="h-64 w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={coordinates}>
                  <Popup>
                    Report Location
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="text-center">
              <p className={`text-sm ${
                isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-600'
              } px-3 py-2 rounded inline-block`}>
                📍 {report.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {report.verified && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className={`${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          } font-medium flex items-center justify-center gap-2`}>
            <span className="text-lg">✓</span>
            Verified - Reward: {formatEther(report.reward)} ETH
          </p>
        </div>
      )}

      {showReporterModal && (
        <ReporterModal
          reporter={report.reporter}
          onClose={() => setShowReporterModal(false)}
        />
      )}
    </div>
  );
};

export default ReportCard; 