/**
 * Dashboard - Main dashboard functionality 
 * Focuses on LISS IV, HR Data, and EOS-04 satellite imagery
 */

// Global variables
let map = null;
let selectedField = null;
let token = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initApp();
});

async function initApp() {
    try {
        // Try to get authentication token
        await checkAuth();
        
        // Initialize components
        initMap();
        setupEventListeners();
        
        // Load initial data
        loadFields();
    } catch (error) {
        console.error('Initialization error:', error);
        // For demo purposes, automatically get a demo token
        await getDemoToken();
        
        // Try initializing again
        initMap();
        setupEventListeners();
        loadFields();
    }
}

async function checkAuth() {
    // Check if we have a token in localStorage
    token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }
}

async function getDemoToken() {
    try {
        // Get a demo token using the /token endpoint
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'username=demo&password=demo'
        });
        
        if (!response.ok) {
            throw new Error('Failed to get demo token');
        }
        
        const data = await response.json();
        token = data.access_token;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        console.log('Successfully obtained demo token');
    } catch (error) {
        console.error('Error getting demo token:', error);
        alert('Failed to authenticate: ' + error.message);
    }
}

function showLoginForm() {
    // Show the login form
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.style.display = 'block';
    }
}

async function login(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username,
                'password': password
            })
        });
        
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        
        // Store the token
        localStorage.setItem('token', data.access_token);
        token = data.access_token;
        
        // Hide login form and show main content
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.style.display = 'none';
        }
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Initialize the app
        initMap();
        setupEventListeners();
        loadFields();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

function logout() {
    // Clear the token
    localStorage.removeItem('token');
    token = null;
    
    // Show login form
    showLoginForm();
}

function initMap() {
    // Initialize the map if it doesn't exist
    if (!map && document.getElementById('map')) {
        map = L.map('map').setView([20.5937, 78.9629], 5);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
}

function setupEventListeners() {
    // Set up event listeners for various UI elements
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => loadFields());
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // Set up provider filter buttons
    setupProviderFilters();
}

function setupProviderFilters() {
    // Set up filter buttons for satellite providers
    const lissButton = document.getElementById('liss-filter');
    const hrButton = document.getElementById('hr-filter');
    const eosButton = document.getElementById('eos-filter');
    
    if (lissButton) {
        lissButton.addEventListener('click', () => {
            filterSatelliteProvider('liss_iv');
            toggleActiveButton(lissButton);
        });
    }
    
    if (hrButton) {
        hrButton.addEventListener('click', () => {
            filterSatelliteProvider('hr_data');
            toggleActiveButton(hrButton);
        });
    }
    
    if (eosButton) {
        eosButton.addEventListener('click', () => {
            filterSatelliteProvider('eos_04');
            toggleActiveButton(eosButton);
        });
    }
}

function toggleActiveButton(button) {
    // Toggle active class on buttons
    const buttons = document.querySelectorAll('.provider-filter');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
}

function filterSatelliteProvider(provider) {
    // Filter satellite images by provider
    if (selectedField) {
        loadFieldAnalysis(selectedField.field_id, provider);
    }
}

async function loadFields() {
    try {
        const response = await fetch('/api/fields', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load fields');
        }
        
        const fields = await response.json();
        
        // Display fields
        displayFields(fields);
        
        // Add fields to map
        addFieldsToMap(fields);
    } catch (error) {
        console.error('Error loading fields:', error);
        document.getElementById('fields-list').innerHTML = 
            '<div class="alert alert-danger">Failed to load fields: ' + error.message + '</div>';
    }
}

function displayFields(fields) {
    const fieldsList = document.getElementById('fields-list');
    
    if (!fieldsList) {
        return;
    }
    
    if (fields.length === 0) {
        fieldsList.innerHTML = '<div class="alert alert-info">No fields found</div>';
        return;
    }
    
    let html = '';
    
    fields.forEach(field => {
        html += `
            <div class="card mb-3 field-card" data-field-id="${field.field_id}">
                <div class="card-body">
                    <h5 class="card-title">${field.name}</h5>
                    <p class="card-text">
                        <strong>Area:</strong> ${field.area_hectares ? field.area_hectares.toFixed(2) + ' ha' : 'Unknown'}<br>
                        <strong>Crop:</strong> ${field.crop_type || 'Unknown'}<br>
                        <strong>Soil:</strong> ${field.soil_type || 'Unknown'}
                    </p>
                    <button class="btn btn-primary btn-sm view-field-btn" data-field-id="${field.field_id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    fieldsList.innerHTML = html;
    
    // Add event listeners to field cards
    document.querySelectorAll('.view-field-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const fieldId = e.target.getAttribute('data-field-id');
            loadFieldDetails(fieldId);
        });
    });
}

function addFieldsToMap(fields) {
    // Clear existing field layers
    if (map) {
        map.eachLayer(layer => {
            if (layer instanceof L.Polygon) {
                map.removeLayer(layer);
            }
        });
        
        // Add field boundaries to map
        fields.forEach(field => {
            if (field.geometry && field.geometry.coordinates) {
                try {
                    // Convert GeoJSON coordinates to Leaflet format
                    const coordinates = field.geometry.coordinates[0];
                    const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
                    
                    const polygon = L.polygon(latLngs, {
                        color: '#3388ff',
                        weight: 2,
                        opacity: 0.7,
                        fillOpacity: 0.2
                    }).addTo(map);
                    
                    // Add popup
                    polygon.bindPopup(`
                        <strong>${field.name}</strong><br>
                        Area: ${field.area_hectares ? field.area_hectares.toFixed(2) + ' ha' : 'Unknown'}<br>
                        Crop: ${field.crop_type || 'Unknown'}
                    `);
                    
                    // Add click event
                    polygon.on('click', () => {
                        loadFieldDetails(field.field_id);
                    });
                } catch (error) {
                    console.error('Error adding field to map:', error);
                }
            }
        });
        
        // Fit map to bounds if there are fields
        if (fields.length > 0) {
            const bounds = [];
            fields.forEach(field => {
                if (field.geometry && field.geometry.coordinates) {
                    const coordinates = field.geometry.coordinates[0];
                    coordinates.forEach(coord => {
                        bounds.push([coord[1], coord[0]]);
                    });
                }
            });
            
            if (bounds.length > 0) {
                map.fitBounds(bounds);
            }
        }
    }
}

async function loadFieldDetails(fieldId) {
    try {
        const response = await fetch(`/api/fields/${fieldId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load field details');
        }
        
        const field = await response.json();
        selectedField = field;
        
        // Display field details
        displayFieldDetails(field);
        
        // Load field analysis
        loadFieldAnalysis(fieldId);
        
        // Update UI to show field details
        showFieldDetails();
    } catch (error) {
        console.error('Error loading field details:', error);
        alert('Failed to load field details: ' + error.message);
    }
}

function displayFieldDetails(field) {
    const detailsContainer = document.getElementById('field-details-container');
    
    if (!detailsContainer) {
        return;
    }
    
    const nameElement = document.getElementById('field-name');
    if (nameElement) {
        nameElement.textContent = field.name;
    }
    
    const areaElement = document.getElementById('field-area');
    if (areaElement) {
        areaElement.textContent = field.area_hectares ? field.area_hectares.toFixed(2) + ' ha' : 'Unknown';
    }
    
    const cropElement = document.getElementById('field-crop');
    if (cropElement) {
        cropElement.textContent = field.crop_type || 'Unknown';
    }
    
    const soilElement = document.getElementById('field-soil');
    if (soilElement) {
        soilElement.textContent = field.soil_type || 'Unknown';
    }
    
    const stageElement = document.getElementById('field-stage');
    if (stageElement) {
        stageElement.textContent = field.growth_stage || 'Unknown';
    }
}

function showFieldDetails() {
    // Show field details panel
    const listView = document.getElementById('fields-list-view');
    const detailsView = document.getElementById('field-details-view');
    
    if (listView && detailsView) {
        listView.style.display = 'none';
        detailsView.style.display = 'block';
    }
}

function backToList() {
    // Go back to fields list
    const listView = document.getElementById('fields-list-view');
    const detailsView = document.getElementById('field-details-view');
    
    if (listView && detailsView) {
        listView.style.display = 'block';
        detailsView.style.display = 'none';
    }
    
    selectedField = null;
}

async function loadFieldAnalysis(fieldId, provider = null) {
    try {
        let url = `/api/fields/${fieldId}/analyze`;
        
        if (provider) {
            url += `?provider=${provider}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to analyze field');
        }
        
        const analysis = await response.json();
        
        // Update UI with analysis results
        updateAnalysisUI(analysis);
    } catch (error) {
        console.error('Error analyzing field:', error);
        document.getElementById('analysis-container').innerHTML = 
            '<div class="alert alert-danger">Analysis failed: ' + error.message + '</div>';
    }
}

function updateAnalysisUI(analysis) {
    // Update health status
    const healthStatus = document.getElementById('health-status');
    if (healthStatus) {
        const status = analysis.health_status || 'unknown';
        
        let badgeClass;
        switch (status) {
            case 'excellent':
                badgeClass = 'bg-success';
                break;
            case 'good':
                badgeClass = 'bg-primary';
                break;
            case 'average':
                badgeClass = 'bg-info';
                break;
            case 'poor':
                badgeClass = 'bg-warning';
                break;
            case 'critical':
                badgeClass = 'bg-danger';
                break;
            default:
                badgeClass = 'bg-secondary';
        }
        
        healthStatus.innerHTML = `<span class="badge ${badgeClass}">${status.toUpperCase()}</span>`;
    }
    
    // Update indices
    updateIndices(analysis);
    
    // Update stress information
    updateStressInfo(analysis);
    
    // Update satellite image
    updateSatelliteImage(analysis);
}

function updateIndices(analysis) {
    const indices = document.getElementById('vegetation-indices');
    if (!indices) return;
    
    let html = '<div class="row">';
    
    if (analysis.indices) {
        if (analysis.indices.ndvi !== undefined) {
            html += `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">NDVI</h5>
                            <p class="card-text display-6 text-center">${analysis.indices.ndvi.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (analysis.indices.evi !== undefined) {
            html += `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">EVI</h5>
                            <p class="card-text display-6 text-center">${analysis.indices.evi.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (analysis.indices.moisture !== undefined) {
            html += `
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Moisture</h5>
                            <p class="card-text display-6 text-center">${analysis.indices.moisture.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    indices.innerHTML = html;
}

function updateStressInfo(analysis) {
    const stressInfo = document.getElementById('stress-info');
    if (!stressInfo) return;
    
    if (analysis.stress && analysis.stress.stress_detected) {
        stressInfo.innerHTML = `
            <div class="alert alert-warning">
                <h5><i class="fas fa-exclamation-triangle"></i> Stress Detected</h5>
                <p>
                    <strong>Type:</strong> ${analysis.stress.stress_type || 'Unknown'}<br>
                    <strong>Affected Area:</strong> ${analysis.stress.stress_percentage.toFixed(1)}%
                </p>
            </div>
        `;
    } else {
        stressInfo.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="fas fa-check-circle"></i> No Stress Detected</h5>
                <p>Your field appears healthy with no significant stress indicators.</p>
            </div>
        `;
    }
}

function updateSatelliteImage(analysis) {
    const imageContainer = document.getElementById('satellite-image');
    if (!imageContainer) return;
    
    // In a real application, we would display the actual satellite image
    // For this demo, we'll show a placeholder with metadata
    
    let provider = 'Unknown';
    let resolution = 'Unknown';
    let date = 'Unknown';
    
    if (analysis.metadata && analysis.metadata.image) {
        provider = analysis.metadata.image.provider || 'Unknown';
        resolution = analysis.metadata.image.resolution ? `${analysis.metadata.image.resolution}m` : 'Unknown';
        date = analysis.metadata.image.acquisition_date || 'Unknown';
    }
    
    imageContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Satellite Image</h5>
                <div class="placeholder-image" style="height: 200px; background-color: #e9ecef; display: flex; align-items: center; justify-content: center;">
                    <div class="text-center">
                        <div><i class="fas fa-satellite fa-3x mb-3"></i></div>
                        <div>Satellite Image Visualization</div>
                    </div>
                </div>
                <div class="mt-3">
                    <small class="text-muted">
                        <strong>Provider:</strong> ${provider}<br>
                        <strong>Resolution:</strong> ${resolution}<br>
                        <strong>Date:</strong> ${date}
                    </small>
                </div>
            </div>
        </div>
    `;
}

// Initialize the back button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back-to-list');
    if (backButton) {
        backButton.addEventListener('click', backToList);
    }
}); 