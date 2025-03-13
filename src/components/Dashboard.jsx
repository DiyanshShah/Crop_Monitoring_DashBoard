import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ selectedField, dateRange, satelliteSources }) {
  const [selectedIndex, setSelectedIndex] = useState('ndvi');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20.5937, 78.9629], 5);
      
      // Add satellite layers
      const landsat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19,
        name: 'Landsat 8/9'
      });

      const sentinel = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19,
        name: 'Sentinel-2'
      });

      const modis = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19,
        name: 'MODIS'
      });

      const viirs = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19,
        name: 'VIIRS/GOES'
      });

      const smap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri',
        maxZoom: 19,
        name: 'SMAP Soil Moisture'
      });

      // Add reference overlay for labels
      const referenceOverlay = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors & Carto',
        name: 'Labels'
      });

      // Add layers to map
      landsat.addTo(mapRef.current);
      referenceOverlay.addTo(mapRef.current);

      // Add layer control
      const baseMaps = {
        'Landsat 8/9 (30m)': landsat,
        'Sentinel-2 (10-20m)': sentinel,
        'MODIS (250m-1km)': modis,
        'VIIRS/GOES (Rapid Update)': viirs,
        'SMAP (Soil Moisture)': smap
      };

      const overlayMaps = {
        'Reference Labels': referenceOverlay
      };

      L.control.layers(baseMaps, overlayMaps).addTo(mapRef.current);

      // Add scale control
      L.control.scale().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedField && mapInstance.current) {
      mapInstance.current.setView(selectedField.coordinates, 13);
      // Add marker for selected field
      L.marker(selectedField.coordinates)
        .addTo(mapInstance.current)
        .bindPopup(selectedField.name);
    }
  }, [selectedField]);

  const mockFieldHealth = {
    soilHealth: {
      score: 75,
      status: 'Good',
      color: '#4CAF50',
      metrics: {
        pH: 6.8,
        organicMatter: '2.5%',
        nitrogen: '45 mg/kg',
        phosphorus: '30 mg/kg',
        potassium: '180 mg/kg'
      }
    },
    cropHealth: {
      score: 82,
      status: 'Excellent',
      color: '#4CAF50',
      metrics: {
        growthStage: 'Tillering',
        canopyCover: '85%',
        leafAreaIndex: '3.2',
        chlorophyll: '45 SPAD'
      }
    },
    moisture: {
      score: 65,
      status: 'Moderate',
      color: '#FFA000',
      metrics: {
        soilMoisture: '45%',
        evapotranspiration: '4.2 mm/day',
        irrigationEfficiency: '78%'
      }
    }
  };

  const mockTrendData = {
    labels: ['2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'Soil Health Index',
        data: [85, 75, 65, 55],
        borderColor: '#E53935',
        backgroundColor: 'rgba(229, 57, 53, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Crop Yield (tons/ha)',
        data: [4.2, 3.8, 3.5, 3.2],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const mockStats = {
    fieldInfo: {
      area: '50 hectares',
      cropType: 'Wheat',
      variety: 'HD-3086',
      plantingDate: '2023-11-15',
      expectedHarvest: '2024-03-20',
      growthStage: 'Tillering',
      daysToHarvest: 45
    },
    performance: {
      healthScore: '75%',
      moistureLevel: '65%',
      lastIrrigation: '2024-02-15',
      nextIrrigation: '2024-02-22',
      fertilizerApplied: '120 kg/ha',
      pestIncidence: 'Low'
    },
    weather: {
      temperature: '28°C',
      humidity: '65%',
      rainfall: '0 mm',
      windSpeed: '12 km/h'
    }
  };

  const mockRecommendations = [
    {
      priority: 'High',
      title: 'Schedule Irrigation',
      description: 'Field moisture levels are below optimal. Schedule irrigation for next week.',
      deadline: '2024-02-22',
      impact: 'Critical for crop development'
    },
    {
      priority: 'Medium',
      title: 'Apply Nitrogen Fertilizer',
      description: 'Soil nitrogen levels are declining. Apply 40 kg/ha of urea.',
      deadline: '2024-02-25',
      impact: 'Important for yield optimization'
    },
    {
      priority: 'Low',
      title: 'Monitor Pest Activity',
      description: 'Recent weather conditions favor pest development. Regular scouting recommended.',
      deadline: 'Ongoing',
      impact: 'Preventive measure'
    },
    {
      priority: 'Medium',
      title: 'Adjust Plant Density',
      description: 'Current plant density is high. Consider thinning to 150 plants/m².',
      deadline: '2024-02-28',
      impact: 'Optimize resource utilization'
    }
  ];

  return (
    <>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5>Field Map</h5>
            </div>
            <div className="card-body">
              <div id="map"></div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Field Health</h5>
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                  type="button" 
                  id="indexDropdown" 
                  data-bs-toggle="dropdown"
                >
                  {selectedIndex.toUpperCase()}
                </button>
                <ul className="dropdown-menu" aria-labelledby="indexDropdown">
                  {['ndvi', 'evi', 'ndwi', 'moisture'].map(index => (
                    <li key={index}>
                      <button 
                        className="dropdown-item" 
                        onClick={() => setSelectedIndex(index)}
                      >
                        {index.toUpperCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-body">
              {selectedField ? (
                <div className="field-health-metrics">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="health-card">
                        <h6>Soil Health</h6>
                        <div className="health-score" style={{ color: mockFieldHealth.soilHealth.color }}>
                          {mockFieldHealth.soilHealth.score}%
                        </div>
                        <div className="health-status">{mockFieldHealth.soilHealth.status}</div>
                        <div className="health-metrics">
                          <div className="metric">
                            <span>pH:</span>
                            <span>{mockFieldHealth.soilHealth.metrics.pH}</span>
                          </div>
                          <div className="metric">
                            <span>Organic Matter:</span>
                            <span>{mockFieldHealth.soilHealth.metrics.organicMatter}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="health-card">
                        <h6>Crop Health</h6>
                        <div className="health-score" style={{ color: mockFieldHealth.cropHealth.color }}>
                          {mockFieldHealth.cropHealth.score}%
                        </div>
                        <div className="health-status">{mockFieldHealth.cropHealth.status}</div>
                        <div className="health-metrics">
                          <div className="metric">
                            <span>Growth Stage:</span>
                            <span>{mockFieldHealth.cropHealth.metrics.growthStage}</span>
                          </div>
                          <div className="metric">
                            <span>Canopy Cover:</span>
                            <span>{mockFieldHealth.cropHealth.metrics.canopyCover}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="health-card">
                        <h6>Moisture Status</h6>
                        <div className="health-score" style={{ color: mockFieldHealth.moisture.color }}>
                          {mockFieldHealth.moisture.score}%
                        </div>
                        <div className="health-status">{mockFieldHealth.moisture.status}</div>
                        <div className="health-metrics">
                          <div className="metric">
                            <span>Soil Moisture:</span>
                            <span>{mockFieldHealth.moisture.metrics.soilMoisture}</span>
                          </div>
                          <div className="metric">
                            <span>ET Rate:</span>
                            <span>{mockFieldHealth.moisture.metrics.evapotranspiration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <p className="text-muted">Select a field to view health analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5>Statistics</h5>
            </div>
            <div className="card-body">
              {selectedField ? (
                <div className="field-stats">
                  <div className="row">
                    <div className="col-md-4">
                      <h6 className="stats-section">Field Information</h6>
                      <div className="stats-group">
                        <p><strong>Area:</strong> {mockStats.fieldInfo.area}</p>
                        <p><strong>Crop Type:</strong> {mockStats.fieldInfo.cropType}</p>
                        <p><strong>Variety:</strong> {mockStats.fieldInfo.variety}</p>
                        <p><strong>Planting Date:</strong> {mockStats.fieldInfo.plantingDate}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <h6 className="stats-section">Performance Metrics</h6>
                      <div className="stats-group">
                        <p><strong>Health Score:</strong> {mockStats.performance.healthScore}</p>
                        <p><strong>Moisture Level:</strong> {mockStats.performance.moistureLevel}</p>
                        <p><strong>Last Irrigation:</strong> {mockStats.performance.lastIrrigation}</p>
                        <p><strong>Fertilizer Applied:</strong> {mockStats.performance.fertilizerApplied}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <h6 className="stats-section">Weather Conditions</h6>
                      <div className="stats-group">
                        <p><strong>Temperature:</strong> {mockStats.weather.temperature}</p>
                        <p><strong>Humidity:</strong> {mockStats.weather.humidity}</p>
                        <p><strong>Rainfall:</strong> {mockStats.weather.rainfall}</p>
                        <p><strong>Wind Speed:</strong> {mockStats.weather.windSpeed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <p className="text-muted">Select a field to view statistics</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5>Recommendations</h5>
            </div>
            <div className="card-body">
              {selectedField ? (
                <div className="recommendations-list">
                  {mockRecommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-header">
                        <span className={`priority-badge ${rec.priority.toLowerCase()}`}>
                          {rec.priority}
                        </span>
                        <h6>{rec.title}</h6>
                      </div>
                      <p className="recommendation-description">{rec.description}</p>
                      <div className="recommendation-footer">
                        <span className="deadline">Deadline: {rec.deadline}</span>
                        <span className="impact">Impact: {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <p className="text-muted">Select a field to view recommendations</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>Health Trend</h5>
            </div>
            <div className="card-body">
              {selectedField ? (
                <div className="chart-container">
                  <Line 
                    data={mockTrendData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Field Health and Yield Trends'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Value'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Year'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center">
                    <p className="text-muted">Select a field to view trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard; 