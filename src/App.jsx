import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [selectedField, setSelectedField] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [satelliteSources, setSatelliteSources] = useState({
    landsat: true,
    sentinel: true,
    modis: true,
    viirs: true,
    smap: true
  });

  return (
    <div className="app">
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-lg-3">
            <Sidebar 
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              dateRange={dateRange}
              setDateRange={setDateRange}
              satelliteSources={satelliteSources}
              setSatelliteSources={setSatelliteSources}
            />
          </div>
          <div className="col-lg-9">
            <Dashboard 
              selectedField={selectedField}
              dateRange={dateRange}
              satelliteSources={satelliteSources}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 