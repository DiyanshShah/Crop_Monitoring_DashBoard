import { useState, useEffect } from 'react';

function Sidebar({ 
  selectedField, 
  setSelectedField, 
  dateRange, 
  setDateRange, 
  satelliteSources, 
  setSatelliteSources 
}) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call to fetch fields
    const fetchFields = async () => {
      try {
        // Replace with actual API call
        const mockFields = [
          { id: 1, name: 'Field 1', coordinates: [20.5937, 78.9629] },
          { id: 2, name: 'Field 2', coordinates: [20.5937, 78.9629] },
          { id: 3, name: 'Field 3', coordinates: [20.5937, 78.9629] },
        ];
        setFields(mockFields);
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const handleSatelliteSourceChange = (source) => {
    setSatelliteSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleDateChange = (type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <>
      <div className="card mb-4">
        <div className="card-header">
          <h5>Fields</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {loading ? (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              fields.map(field => (
                <button
                  key={field.id}
                  className={`list-group-item list-group-item-action ${
                    selectedField?.id === field.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedField(field)}
                >
                  {field.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Satellite Sources</h5>
        </div>
        <div className="card-body">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="source-landsat"
              checked={satelliteSources.landsat}
              onChange={() => handleSatelliteSourceChange('landsat')}
            />
            <label className="form-check-label" htmlFor="source-landsat">
              Landsat 8/9 (30m)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="source-sentinel"
              checked={satelliteSources.sentinel}
              onChange={() => handleSatelliteSourceChange('sentinel')}
            />
            <label className="form-check-label" htmlFor="source-sentinel">
              Sentinel-2 (10-20m)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="source-modis"
              checked={satelliteSources.modis}
              onChange={() => handleSatelliteSourceChange('modis')}
            />
            <label className="form-check-label" htmlFor="source-modis">
              MODIS (250m-1km)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="source-viirs"
              checked={satelliteSources.viirs}
              onChange={() => handleSatelliteSourceChange('viirs')}
            />
            <label className="form-check-label" htmlFor="source-viirs">
              VIIRS/GOES (Rapid Update)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="source-smap"
              checked={satelliteSources.smap}
              onChange={() => handleSatelliteSourceChange('smap')}
            />
            <label className="form-check-label" htmlFor="source-smap">
              SMAP (Soil Moisture)
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Date Range</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="start-date" className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              id="start-date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="end-date" className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              id="end-date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
          <button className="btn btn-primary">Apply</button>
        </div>
      </div>
    </>
  );
}

export default Sidebar; 