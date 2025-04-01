import React, { useEffect, useRef, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../../contexts/theme_context';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ContractService from '../../services/contract_service';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom heat map implementation using markers with colored circles
const HeatMapCircles = ({ points }) => {
  const map = useMap();
  const markersRef = useRef([]);
  
  useEffect(() => {
    // Remove previous markers
    markersRef.current.forEach(marker => {
      if (map) marker.removeFrom(map);
    });
    markersRef.current = [];
    
    // Create markers for each point
    points.forEach(point => {
      const { lat, lng, intensity } = point;
      
      // Convert intensity to a color (blue -> yellow -> red)
      const getColor = (value) => {
        // value from 0 to 1
        if (value < 0.3) {
          return '#3b88eb'; // blue for low
        } else if (value < 0.7) {
          return '#f4d35e'; // yellow for medium
        } else {
          return '#ee4b2b'; // red for high
        }
      };
      
      // Create circle marker with intensity-based styling
      const marker = L.circleMarker([lat, lng], {
        radius: 8 + (intensity * 12), // Scale radius by intensity
        fillColor: getColor(intensity),
        color: getColor(intensity),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
      }).addTo(map);
      
      markersRef.current.push(marker);
    });
    
    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => {
        if (map) marker.removeFrom(map);
      });
    };
  }, [map, points]);
  
  return null;
};

const DashboardContent = ({ stats }) => {
  const { isDarkMode } = useTheme();
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [mapCenter, setMapCenter] = useState([37.0902, -95.7129]); // US center by default
  const [mapZoom, setMapZoom] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports data for the heat map
  useEffect(() => {
    const loadReportLocations = async () => {
      try {
        setIsLoading(true);
        
        // Get all reports data - combining verified and pending
        const verifiedReports = await ContractService.getVerifiedReports();
        const allReports = await ContractService.getAllReports();
        
        // Extract location data and convert to heatmap points
        const points = [];
        
        // Process all reports to extract coordinates
        [...verifiedReports, ...allReports].forEach(report => {
          try {
            // Parse location string to get coordinates (assuming format: "lat, lng")
            const [lat, lng] = report.location.split(',').map(coord => parseFloat(coord.trim()));
            
            // Skip invalid coordinates
            if (isNaN(lat) || isNaN(lng)) return;
            
            // Add to points with intensity based on verification status (verified reports get higher intensity)
            points.push({
              lat,
              lng,
              intensity: report.verified ? 0.8 : 0.5, // Verified reports are more intense
              reportId: report.id
            });
          } catch (err) {
            console.warn('Could not parse location for report:', report.id);
          }
        });
        
        // Filter out duplicates based on exact coordinates
        const uniquePoints = points.filter((point, index, self) => 
          self.findIndex(p => p.lat === point.lat && p.lng === point.lng) === index
        );
        
        setHeatmapPoints(uniquePoints);
        
        // If we have points, center the map on the average position
        if (uniquePoints.length > 0) {
          const avgLat = uniquePoints.reduce((sum, point) => sum + point.lat, 0) / uniquePoints.length;
          const avgLng = uniquePoints.reduce((sum, point) => sum + point.lng, 0) / uniquePoints.length;
          setMapCenter([avgLat, avgLng]);
          setMapZoom(10); // Zoom closer to see the reports
        }
      } catch (err) {
        console.error('Error loading report locations:', err);
        // Fallback to sample data if there's an error
        loadSampleData();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadSampleData = () => {
      // Sample data as fallback - just for demo purposes
      const samplePoints = [
        { lat: 37.782, lng: -122.447, intensity: 0.5 },
        { lat: 37.784, lng: -122.445, intensity: 0.8 },
        { lat: 37.785, lng: -122.442, intensity: 0.6 },
        { lat: 37.787, lng: -122.443, intensity: 1.0 },
        { lat: 37.786, lng: -122.439, intensity: 0.8 },
      ];
      setHeatmapPoints(samplePoints);
      setMapCenter([37.785, -122.440]);
      setMapZoom(13);
    };
    
    loadReportLocations();
  }, [stats.totalReports, stats.verifiedCount]); // Refresh when report counts change

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
      {/* Reports Overview Section */}
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

      {/* Heat Map Section (replacing Recent Activity) */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Traffic Issue Hotspots
        </h3>
        <div className="space-y-2 mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Heat map showing concentrations of reported traffic issues
          </p>
        </div>
        <div className="h-[600px] rounded-lg overflow-hidden">
          {isLoading ? (
            <div className={`flex items-center justify-center h-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              attributionControl={true}
            >
              <TileLayer
                url={isDarkMode 
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <HeatMapCircles points={heatmapPoints} />
            </MapContainer>
          )}
        </div>
        <div className="mt-4 flex justify-between">
          <div className="flex items-center">
            <div className="w-full h-4 rounded bg-gradient-to-r from-blue-50 via-yellow-300 to-red-500" style={{ width: '150px' }}></div>
          </div>
          <div className="flex text-sm">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3`}>Low</span>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3`}>Medium</span>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 