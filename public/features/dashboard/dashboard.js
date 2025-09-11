import { getAutomationCoverage, getMonthlyTrend, getEpicProgress } from '../../modules/api.js';
import { showError } from '../../modules/ui.js';

// Dashboard state
let currentProject = null;
let automationChart = null;
let testTypeChart = null;

// Simple success notification function
function showSuccess(message) {
    console.log('Success:', message);
    // You can expand this to show a toast notification or alert if needed
}

// Project configurations
const PROJECT_CONFIG = {
    ivision: {
        name: 'iVision',
        testRailProjectId: 1, // Update with actual project ID from TestRail
        githubRepo: 'fugro/fugro.ivision5.test-automation',
        epicKey: 'OPR-3401'
    },
    fastlane: {
        name: 'Fastlane',
        testRailProjectId: 2, // Update with actual project ID from TestRail
        githubRepo: 'fugro/fastlane-automation',
        epicKey: null
    }
};

// Initialize dashboard
export async function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initializeCharts();
}

// Set up event listeners
function setupEventListeners() {
    const ivisionBtn = document.getElementById('dashboard-ivision-btn');
    const fastlaneBtn = document.getElementById('dashboard-fastlane-btn');
    
    if (ivisionBtn) {
        ivisionBtn.addEventListener('click', () => selectProject('ivision'));
    }
    
    // Fastlane button is disabled for now
    if (fastlaneBtn) {
        fastlaneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Fastlane dashboard coming soon...');
            showError('Fastlane dashboard is not available yet. Coming soon!');
        });
    }
}

// Select project and load dashboard
export async function selectProject(projectKey) {
    console.log(`Selecting project: ${projectKey}`);
    
    // Only allow iVision for now
    if (projectKey !== 'ivision') {
        showError(`${projectKey} dashboard is not available yet. Please select iVision.`);
        return;
    }
    
    currentProject = projectKey;
    const config = PROJECT_CONFIG[projectKey];
    
    if (!config) {
        showError('Invalid project selected');
        return;
    }
    
    // Update UI state
    updateProjectButtonState(projectKey);
    document.getElementById('project-title').textContent = `${config.name} Dashboard`;
    
    // Show loading and hide content
    document.getElementById('dashboard-loading').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
    
    try {
        // Load all dashboard data
        await Promise.all([
            loadTestRailData(config),
            loadEpicData(config)
        ]);
        
        // Show content and hide loading
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('dashboard-loading').style.display = 'none';
        
        showSuccess(`Dashboard loaded for ${config.name}`);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError(`Failed to load dashboard data: ${error.message}`);
        document.getElementById('dashboard-loading').style.display = 'none';
    }
}

// Update project button state
function updateProjectButtonState(selectedProject) {
    const ivisionBtn = document.getElementById('dashboard-ivision-btn');
    const fastlaneBtn = document.getElementById('dashboard-fastlane-btn');
    
    // Reset all buttons first
    if (ivisionBtn) {
        ivisionBtn.classList.remove('btn-primary');
        ivisionBtn.classList.add('btn-outline-primary');
    }
    
    // Fastlane button stays disabled
    if (fastlaneBtn) {
        fastlaneBtn.classList.remove('btn-primary', 'btn-outline-primary');
        fastlaneBtn.classList.add('btn-outline-secondary');
        fastlaneBtn.disabled = true;
    }
    
    // Highlight selected project
    if (selectedProject === 'ivision' && ivisionBtn) {
        ivisionBtn.classList.remove('btn-outline-primary');
        ivisionBtn.classList.add('btn-primary');
    }
}

// Load TestRail data
async function loadTestRailData(config) {
    console.log('Loading TestRail data...');
    
    try {
        // Get current automation stats from dashboard database
        const currentStats = await getAutomationCoverage(config.testRailProjectId);
        console.log('Current automation stats:', currentStats);
        
        // Handle the database format - check if data exists
        if (currentStats && currentStats.total_cases) {
            // Update overview cards with real data from database
            document.getElementById('total-tests').textContent = currentStats.total_cases;
            document.getElementById('automated-tests').textContent = currentStats.automated_cases;
            document.getElementById('manual-tests').textContent = currentStats.manual_cases + currentStats.not_required_cases;
            document.getElementById('automation-percentage').textContent = `${currentStats.automation_percentage}%`;
            
            // Update automation backlog
            document.getElementById('automation-completed').textContent = currentStats.automated_cases;
            document.getElementById('automation-remaining').textContent = currentStats.manual_cases;
            document.getElementById('automation-progress').style.width = `${currentStats.automation_percentage}%`;
            document.getElementById('automation-progress-text').textContent = `${currentStats.automation_percentage}%`;
            
            // Update detail sections
            document.getElementById('automation-completed-detail').textContent = currentStats.automated_cases;
            document.getElementById('automation-remaining-detail').textContent = currentStats.manual_cases;
            
            // Update test type chart with real data
            updateTestTypeChart({
                automated: currentStats.automated_cases,
                manual: currentStats.manual_cases + currentStats.not_required_cases
            });
        } else {
            console.warn('No current automation stats available, using fallback data');
            // Fallback to mock data
            const mockData = { total: 252, automated: 113, manual: 139, automationPercentage: 45 };
            document.getElementById('total-tests').textContent = mockData.total;
            document.getElementById('automated-tests').textContent = mockData.automated;
            document.getElementById('manual-tests').textContent = mockData.manual;
            document.getElementById('automation-percentage').textContent = `${mockData.automationPercentage}%`;
            
            updateTestTypeChart(mockData);
        }
        
        // Get monthly trend data from database
        const monthlyHistory = await getMonthlyTrend(config.testRailProjectId);
        console.log('Monthly history:', monthlyHistory);
        
        // Transform database format to chart format
        const chartData = monthlyHistory.map(record => ({
            month: `${record.month} ${record.year}`,
            percentage: record.automation_percentage
        }));
        
        // Update automation trend chart
        updateAutomationChart(chartData);
        
    } catch (error) {
        console.error('Error loading TestRail data:', error);
        throw error;
    }
}

// Load Epic data from Atlassian
async function loadEpicData(config) {
    console.log('Loading Epic data...');
    
    if (!config.epicKey) {
        document.getElementById('epic-progress').innerHTML = '<p class="text-muted">No epic configured for this project</p>';
        return;
    }
    
    try {
        const epicData = await getEpicProgress(config.epicKey);
        
        const completionPercentage = Math.round((epicData.progress.completed / epicData.progress.total) * 100);
        
        // Update the epic progress display with all statuses
        document.getElementById('total-stories').textContent = epicData.progress.total;
        document.getElementById('completed-stories').textContent = epicData.progress.completed;
        document.getElementById('inprogress-stories').textContent = epicData.progress.inProgress;
        document.getElementById('pending-stories').textContent = epicData.progress.pending;
        document.getElementById('epic-progress-text').textContent = `${completionPercentage}% Complete`;
        document.getElementById('epic-progress-bar').style.width = `${completionPercentage}%`;
        document.getElementById('completion-percentage').textContent = completionPercentage;
        
        // Update declined stories count
        if (epicData.progress.declined !== undefined) {
            document.getElementById('declined-stories').textContent = epicData.progress.declined;
        }
        
        // Update color based on progress
        const progressBar = document.getElementById('epic-progress-bar');
        if (completionPercentage >= 80) {
            progressBar.className = 'progress-bar bg-success';
        } else if (completionPercentage >= 50) {
            progressBar.className = 'progress-bar bg-info';
        } else if (completionPercentage >= 25) {
            progressBar.className = 'progress-bar bg-warning';
        } else {
            progressBar.className = 'progress-bar bg-danger';
        }
        
        console.log(`Epic Progress: ${completionPercentage}% (${epicData.progress.completed}/${epicData.progress.total})`);
        
    } catch (error) {
        console.error('Error loading Epic data:', error);
        // Show fallback data
        document.getElementById('epic-progress-text').textContent = 'Unable to load epic data';
        throw error;
    }
}

// Initialize charts
function initializeCharts() {
    try {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Automation Coverage Evolution Chart
        const automationCtx = document.getElementById('automationChart');
        if (!automationCtx) {
            console.error('automationChart element not found');
            return;
        }
        
        automationChart = new Chart(automationCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Automation Percentage',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1,
                    borderWidth: 3,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Automation Coverage Trend',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
        
        // Test Type Distribution Chart
        const testTypeCtx = document.getElementById('testTypeChart');
        if (!testTypeCtx) {
            console.error('testTypeChart element not found');
            return;
        }
        
        testTypeChart = new Chart(testTypeCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Automated', 'Manual'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)'
                    ],
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} tests (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Update automation chart with real data
function updateAutomationChart(monthlyData) {
    if (!automationChart) {
        console.warn('Automation chart not initialized');
        return;
    }
    
    if (!monthlyData || monthlyData.length === 0) {
        // Fallback to mock data if no real data available
        monthlyData = [
            { month: 'Jan 2025', percentage: 45 },
            { month: 'Feb 2025', percentage: 52 },
            { month: 'Mar 2025', percentage: 58 },
            { month: 'Apr 2025', percentage: 61 },
            { month: 'May 2025', percentage: 65 },
            { month: 'Jun 2025', percentage: 68 },
            { month: 'Jul 2025', percentage: 70 },
            { month: 'Aug 2025', percentage: 72 },
            { month: 'Sep 2025', percentage: 73 }
        ];
    }
    
    try {
        automationChart.data.labels = monthlyData.map(d => d.month);
        automationChart.data.datasets[0].data = monthlyData.map(d => d.percentage);
        automationChart.update();
    } catch (error) {
        console.error('Error updating automation chart:', error);
    }
}

// Update test type chart
function updateTestTypeChart(data) {
    if (!testTypeChart) {
        console.warn('Test type chart not initialized');
        return;
    }
    
    try {
        testTypeChart.data.datasets[0].data = [data.automated, data.manual];
        testTypeChart.update();
    } catch (error) {
        console.error('Error updating test type chart:', error);
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '1 day ago';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }
}

// Handle dashboard tab show
export function handleDashboardTabShow() {
    console.log('Dashboard tab shown');
    
    // Re-initialize charts if needed
    setTimeout(() => {
        if (!automationChart || !testTypeChart) {
            console.log('Re-initializing charts...');
            initializeCharts();
        }
        
        // If we have a current project, reload its data
        if (currentProject) {
            console.log('Refreshing current project data...');
            selectProject(currentProject);
        }
    }, 200); // Give a bit more time for the DOM to be ready
}
