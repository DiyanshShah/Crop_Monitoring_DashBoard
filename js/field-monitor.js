/**
 * Field Monitor - Handles field data and satellite visualizations
 */

// Global variables for field monitoring
let currentField = null;
let ndviLayer = null;
let fieldBoundary = null;
let activeIndex = 'ndvi'; // Default index to display

document.addEventListener('DOMContentLoaded', function() {
    // Set up index selector dropdown
    setupIndexSelector();
});

function setupIndexSelector() {
    const indexDropdown = document.getElementById('indexDropdown');
    const indexOptions = document.querySelectorAll('.dropdown-item[data-index]');
    
    indexOptions.forEach(option => {
        option.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            indexDropdown.textContent = index.toUpperCase();
            activeIndex = index;
            
            if (currentField) {
                updateFieldVisualization(currentField.field_id, index);
            }
        });
    });
}

async function loadField(fieldId) {
    try {
        const response = await fetch(`/api/fields/${fieldId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch field: ${response.statusText}`);
        }
        
        const field = await response.json();
        currentField = field;
        
        // Display field details
        displayFieldDetails(field);
        
        // Load field data analysis
        await loadFieldAnalysis(fieldId);
        
        // Add field boundary to map
        addFieldToMap(field);
        
        // Update visualization with active index
        updateFieldVisualization(fieldId, activeIndex);
        
        // Load trend data
        loadFieldTrend(fieldId);
        
        return field;
    } catch (error) {
        console.error('Error loading field:', error);
        showError('Failed to load field details');
    }
}

function displayFieldDetails(field) {
    // Update the field details panel
    document.getElementById('field-name').textContent = field.name || 'Unnamed Field';
    document.getElementById('field-area').textContent = field.area_hectares ? `${field.area_hectares.toFixed(2)} ha` : 'Unknown';
    document.getElementById('field-crop').textContent = field.crop_type || 'Unknown';
    document.getElementById('field-soil').textContent = field.soil_type || 'Unknown';
    document.getElementById('field-stage').textContent = field.growth_stage || 'Unknown';
}

async function loadFieldAnalysis(fieldId) {
    try {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Build the query string
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const url = `/api/fields/${fieldId}/analyze?${params.toString()}`;
        
        // Show loading indicator
        document.getElementById('health-status').innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div> Loading...';
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to analyze field: ${response.statusText}`);
        }
        
        const analysis = await response.json();
        
        // Update health status
        updateHealthStatus(analysis);
        
        // Update indices panel
        updateIndicesPanel(analysis);
        
        // Update stress panel
        updateStressPanel(analysis);
        
        // Update recommendations
        updateRecommendations(analysis);
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing field:', error);
        document.getElementById('health-status').innerHTML = '<span class="text-danger">Analysis failed</span>';
    }
}

function updateHealthStatus(analysis) {
    const healthStatus = analysis.health_status || 'unknown';
    const healthStatusElement = document.getElementById('health-status');
    
    // Clear any previous content
    healthStatusElement.innerHTML = '';
    
    // Create badge with appropriate color
    const badge = document.createElement('span');
    badge.classList.add('badge', 'fs-6');
    badge.textContent = healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);
    
    // Set badge color based on health status
    switch (healthStatus) {
        case 'excellent':
            badge.classList.add('bg-success');
            break;
        case 'good':
            badge.classList.add('bg-primary');
            break;
        case 'average':
            badge.classList.add('bg-warning');
            break;
        case 'poor':
            badge.classList.add('bg-danger');
            break;
        case 'critical':
            badge.classList.add('bg-danger');
            break;
        default:
            badge.classList.add('bg-secondary');
    }
    
    healthStatusElement.appendChild(badge);
}

function updateIndicesPanel(analysis) {
    // Update NDVI
    if (analysis.ndvi) {
        document.getElementById('ndvi-mean').textContent = analysis.ndvi.mean.toFixed(2);
        document.getElementById('ndvi-min').textContent = analysis.ndvi.min.toFixed(2);
        document.getElementById('ndvi-max').textContent = analysis.ndvi.max.toFixed(2);
    }
    
    // Update EVI if available
    if (analysis.evi) {
        document.getElementById('evi-container').classList.remove('d-none');
        document.getElementById('evi-mean').textContent = analysis.evi.mean.toFixed(2);
        document.getElementById('evi-min').textContent = analysis.evi.min.toFixed(2);
        document.getElementById('evi-max').textContent = analysis.evi.max.toFixed(2);
    } else {
        document.getElementById('evi-container').classList.add('d-none');
    }
    
    // Update moisture if available
    if (analysis.moisture) {
        document.getElementById('moisture-container').classList.remove('d-none');
        document.getElementById('moisture-mean').textContent = analysis.moisture.mean.toFixed(2);
        document.getElementById('moisture-min').textContent = analysis.moisture.min.toFixed(2);
        document.getElementById('moisture-max').textContent = analysis.moisture.max.toFixed(2);
        document.getElementById('moisture-status').textContent = analysis.moisture_status || 'Unknown';
    } else {
        document.getElementById('moisture-container').classList.add('d-none');
    }
}

function updateStressPanel(analysis) {
    const stressPanel = document.getElementById('stress-info');
    
    if (analysis.stress && analysis.stress.stress_detected) {
        // Stress detected
        const stressPercentage = analysis.stress.stress_percentage || 0;
        const stressType = analysis.stress.stress_type || 'unknown';
        
        stressPanel.innerHTML = `
            <div class="alert alert-warning mb-0">
                <strong>Stress Detected:</strong> ${stressType.charAt(0).toUpperCase() + stressType.slice(1)} stress<br>
                <strong>Affected Area:</strong> ${stressPercentage.toFixed(1)}% of field
            </div>
        `;
    } else {
        // No stress detected
        stressPanel.innerHTML = `
            <div class="alert alert-success mb-0">
                No significant stress detected
            </div>
        `;
    }
}

function updateRecommendations(analysis) {
    const recommendationsPanel = document.getElementById('recommendations');
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
        let html = '<ul class="list-group list-group-flush">';
        analysis.recommendations.forEach(rec => {
            html += `<li class="list-group-item">${rec}</li>`;
        });
        html += '</ul>';
        recommendationsPanel.innerHTML = html;
    } else {
        recommendationsPanel.innerHTML = '<p class="text-muted">No recommendations available</p>';
    }
}

async function updateFieldVisualization(fieldId, index) {
    // This function would fetch and display the visualization
    // For now, we'll just show a placeholder
    
    const mapContainer = document.getElementById('field-map');
    
    // In a real implementation, this would fetch and display actual satellite imagery
    // For the demo, we'll display a placeholder message
    
    mapContainer.innerHTML = `
        <div class="alert alert-info">
            <strong>Visualization:</strong> ${index.toUpperCase()} index visualization would be displayed here
        </div>
    `;
}

async function loadFieldTrend(fieldId) {
    try {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Build the query string
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        const url = `/api/fields/${fieldId}/trend?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch trend data: ${response.statusText}`);
        }
        
        const trendData = await response.json();
        displayTrendChart(trendData);
        
    } catch (error) {
        console.error('Error loading field trend:', error);
        document.getElementById('trend-chart').innerHTML = '<div class="alert alert-danger">Failed to load trend data</div>';
    }
}

function displayTrendChart(data) {
    const chartContainer = document.getElementById('trend-chart');
    chartContainer.innerHTML = '<canvas id="trend-canvas"></canvas>';
    
    const ctx = document.getElementById('trend-canvas').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'NDVI',
                    data: data.ndvi,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Precipitation (mm)',
                    data: data.precipitation,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y1',
                    type: 'bar'
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'NDVI'
                    },
                    max: 1
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Precipitation (mm)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function addFieldToMap(field) {
    // Add field boundary to map
    // This is a placeholder for now
    // In a real implementation, this would parse the field's GeoJSON and add it to the Leaflet map
}

function showError(message) {
    // Display error message
    console.error(message);
    // You could add a toast/alert UI element here
} 