function hideReportResults() {
    const reportResults = document.getElementById('report-results');
    const reportsList = document.getElementById('reports-list');
    if (reportResults) {
        reportResults.classList.add('d-none');
    }
    if (reportsList) {
        reportsList.classList.remove('d-none');
    }
}
// Configuration
const CONFIG = {
    // Priority settings from Fugro Roadware TestRail configuration
    PRIORITIES: {
        6: { name: '3 - Must Test - Code has changed', class: 'priority-6 bg-danger text-white' },
        3: { name: '2 - Test If Time', class: 'priority-3 bg-warning text-dark' },
        5: { name: '1 - Must Test', class: 'priority-5 bg-success text-white' }
    },
    // TestRail URL (will be configured automatically)
    TESTRAIL_URL: 'https://fugroroadware.testrail.com'
};

// Utility functions
function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('error').classList.add('d-none');
    document.getElementById('test-case').classList.add('d-none');
}

function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
}

function showError(message) {
    hideLoading();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').classList.remove('d-none');
    document.getElementById('test-case').classList.add('d-none');
}

function showTestCase() {
    hideLoading();
    document.getElementById('error').classList.add('d-none');
    document.getElementById('test-case').classList.remove('d-none');
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
}

function formatContent(content) {
    if (!content) return '<div class="empty-content">Not specified</div>';

    // Replace TestRail image markdown with clickable link
    let formatted = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/!\[([^\]]*)\]\((index\.php\?\/attachments\/get\/[^)]+)\)/gi, function(match, alt, relUrl) {
            const baseUrl = 'https://fugroroadware.testrail.com';
            relUrl = relUrl.replace(/^\/+/, '');
            const fullUrl = `${baseUrl}/${relUrl}`;
            return `<a href="${fullUrl}" target="_blank">${alt ? alt : 'View Image'}</a>`;
        });
    return formatted;
}

function formatSteps(steps, stepsSeparated) {
    let html = '';

    // Format custom_steps
    if (steps && typeof steps === 'string') {
        html += `
            <div class="step-item">
                <div class="d-flex align-items-start">
                    <div class="step-content flex-grow-1">
                        <div class="mb-2">
                            <strong>Steps:</strong><br>
                            ${formatContent(steps)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Format custom_steps_separated
    if (stepsSeparated && Array.isArray(stepsSeparated) && stepsSeparated.length > 0) {
        stepsSeparated.forEach((step, index) => {
            html += `
                <div class="step-item">
                    <div class="d-flex align-items-start">
                        <span class="step-number">${index + 1}</span>
                        <div class="step-content flex-grow-1">
                            <div class="mb-2">
                                <strong>Action:</strong><br>
                                ${formatContent(step.content || 'Not specified')}
                            </div>
                            ${step.expected ? `
                                <div>
                                    <strong>Expected result:</strong><br>
                                    ${formatContent(step.expected)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    } else if (!steps) {
        html += '<div class="empty-content">No steps defined</div>';
    }

    return html;
}

function formatCustomFields(testCase) {
    const customFieldsDiv = document.getElementById('custom-fields');
    const customFieldsContent = document.getElementById('custom-fields-content');
    
    let hasCustomFields = false;
    let html = '';
    
    // List of known custom fields (adapt according to your configuration)
    const knownCustomFields = {
        'custom_automation_type': 'Automation Type',
        'custom_test_data': 'Test Data',
        'custom_environment': 'Environment',
        'custom_component': 'Component',
        'custom_feature': 'Feature',
        'custom_severity': 'Severity',
        'custom_estimated_time': 'Estimated Time'
    };
    
    Object.keys(testCase).forEach(key => {
        if (
            key.startsWith('custom_') &&
            testCase[key] !== null &&
            testCase[key] !== '' &&
            key !== 'custom_preconds' &&
            key !== 'custom_steps' &&
            key !== 'custom_expected' &&
            key !== 'custom_steps_separated'
        ) {
            let label = knownCustomFields[key] || key.replace('custom_', '').replace(/_/g, ' ');
            let value = testCase[key];
            // Special handling for Automation Type
            if (key === 'custom_automation_type') {
                if (value === 0 || value === '0') {
                    value = 'Not Required';
                } else if (value === 1 || value === '1') {
                    value = 'To do';
                } else if (value === 2 || value === '2') {
                    value = 'Automated';
                }
            }
            // Special handling for Case Change Redesign
            if (key === 'custom_case_change_redesign') {
                if (value === 1 || value === '1') {
                    value = 'Yes - partially';
                } else if (value === 2 || value === '2') {
                    value = 'Yes - fully';
                } else if (value === 3 || value === '3') {
                    value = 'No';
                }
            }
            html += `
                <div class="custom-field">
                    <div class="custom-field-label">${label}</div>
                    <div class="custom-field-value">${formatContent(String(value))}</div>
                </div>
            `;
            hasCustomFields = true;
        }
    });
    
    if (hasCustomFields) {
        customFieldsContent.innerHTML = html;
        customFieldsDiv.classList.remove('d-none');
    } else {
        customFieldsDiv.classList.add('d-none');
    }
}

async function callTestRailAPI(endpoint) {
    // Detect environment: localhost vs others
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const caseId = endpoint.replace('get_case/', '');
    let url;
    if (isLocalhost) {
        // Local development: use Node.js backend
        url = `http://localhost:3000/api/case/${caseId}`;
    } else {
        // Others: use relative path
        url = `/api/case/${caseId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Test case not found.');
        } else {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
    }
    const data = await response.json();
    console.log('API response:', data); // Debug log
    return data;
}

async function loadTestCase(caseId) {
    showLoading();
    
    try {
        // Validate case ID
        if (!caseId || isNaN(caseId)) {
            throw new Error('Invalid test case ID.');
        }
        
        console.log(`Loading test case ${caseId}...`);
        
        // Get test case details
        const testCase = await callTestRailAPI(`get_case/${caseId}`);
        
        console.log('Test case loaded:', testCase);
        
        // Populate the UI
        populateTestCaseUI(testCase);
        
        showTestCase();
        
    } catch (error) {
        console.error('Error loading test case:', error);
        showError(error.message);
    }
}

function populateTestCaseUI(testCase) {
    // Basic information
    document.getElementById('case-title').textContent = testCase.title || 'No title';
    document.getElementById('case-id').textContent = `C${testCase.id}`;
    
    // Priority
    const priorityElement = document.getElementById('case-priority');
    const priority = CONFIG.PRIORITIES[testCase.priority_id] || { name: 'Unknown', class: 'bg-secondary' };
    priorityElement.textContent = priority.name;
    priorityElement.className = `badge fs-6 ${priority.class}`;
    
    // Type (you might need to get types from API first)
    let typeText = 'N/A';
    if (testCase.type_id) {
        if (testCase.type_id === 2 || testCase.type_id === '2') {
            typeText = 'Functionality';
        } else {
            typeText = `Type ${testCase.type_id}`;
        }
    }
    document.getElementById('case-type').textContent = typeText;
    
    // Dates and creator
    document.getElementById('case-created-by').textContent = testCase.created_by ? `User ${testCase.created_by}` : 'N/A';
    document.getElementById('case-created-on').textContent = formatDate(testCase.created_on);
    document.getElementById('case-updated-on').textContent = formatDate(testCase.updated_on);
    
    // Content
    document.getElementById('case-preconditions').innerHTML = formatContent(testCase.custom_preconds);
    document.getElementById('case-steps').innerHTML = formatSteps(testCase.custom_steps, testCase.custom_steps_separated);
    document.getElementById('case-expected').innerHTML = formatContent(testCase.custom_expected);
    
    // Custom fields
    formatCustomFields(testCase);
    
    // TestRail link
    const testRailLink = document.getElementById('testrail-link');
    testRailLink.href = `${CONFIG.TESTRAIL_URL}/index.php?/cases/view/${testCase.id}`;
}

// Parse URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check for case ID in URL parameters
    const caseId = getUrlParameter('case') || getUrlParameter('id');
    
    if (caseId) {
        loadTestCase(caseId);
    } else {
        showError('No test case ID provided. Use ?case=CASE_ID in the URL.');
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const newCaseId = getUrlParameter('case') || getUrlParameter('id');
        if (newCaseId) {
            loadTestCase(newCaseId);
        }
    });
});

// Reports functionality
// Global variables
let currentReports = [];

function showReportsLoading() {
    document.getElementById('reports-loading').classList.remove('d-none');
    document.getElementById('reports-error').classList.add('d-none');
    document.getElementById('reports-list').classList.add('d-none');
    document.getElementById('report-results').classList.add('d-none');
}

function hideReportsLoading() {
    document.getElementById('reports-loading').classList.add('d-none');
}

function showReportsError(message) {
    hideReportsLoading();
    document.getElementById('reports-error-message').textContent = message;
    document.getElementById('reports-error').classList.remove('d-none');
    document.getElementById('reports-list').classList.add('d-none');
}

function showReportsList() {
    hideReportsLoading();
    document.getElementById('reports-error').classList.add('d-none');
    document.getElementById('reports-list').classList.remove('d-none');
}

async function loadFixedReports(){
    showReportsLoading();
    
    try {
        // Detect environment: localhost vs others
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? 'http://localhost:3000' : '';
        
        const response = await fetch(`${baseUrl}/api/fixed-reports`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const reports = await response.json();
        currentReports = reports;
        displayReports(reports);
        showReportsList();
        
    } catch (error) {
        console.error('Error loading fixed reports:', error);
        showReportsError(error.message || 'Failed to load fixed reports');
    }
}
function displayReports(reports) {
    const container = document.getElementById('reports-content');
    
    if (!reports || reports.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No fixed reports available.
            </div>
        `;
        return;
    }
    
    const reportsHtml = reports.map(report => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title">${escapeHtml(report.name || 'Unnamed Report')}</h6>
                        <p class="card-text text-muted small mb-2">
                            <strong>Report ID:</strong> ${report.id}
                            <br><strong>Project:</strong> ${escapeHtml(report.project_name || 'Unknown')} (ID: ${report.project_id || 'N/A'})
                        </p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            <span class="badge bg-success">Fixed Report</span>
                            ${report.project_name === 'Ivision' ? '<span class="badge bg-primary">Ivision</span>' : ''}
                            ${report.project_name === 'Fastlane' ? '<span class="badge bg-info">Fastlane</span>' : ''}
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <button class="btn btn-primary btn-sm" onclick="runReport(${report.id}, '${escapeHtml(report.name)}')">
                            <i class="fas fa-play me-1"></i>
                            Run Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = reportsHtml;
}

async function runReport(reportId, reportName) {
    showReportsLoading();
    
    try {
        // Detect environment: localhost vs others
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? 'http://localhost:3000' : '';
        
        const response = await fetch(`${baseUrl}/api/report/run/${reportId}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        displayReportResults(result, reportName);
        
    } catch (error) {
        console.error('Error running report:', error);
        showReportsError(error.message || 'Failed to run report');
    }
}

function displayReportResults(result, reportName) {
    hideReportsLoading();
    
    // Update report title
    const reportTitle = document.getElementById('report-title');
    if (reportTitle) {
        reportTitle.textContent = reportName;
    }
    
    // Create buttons container
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
        let buttonsHtml = '<div class="d-flex gap-2 flex-wrap mb-3">';
        
        if (result.report_url) {
            buttonsHtml += `<a href="${result.report_url}" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt me-1"></i> See on TestRail
            </a>`;
        }
        
        if (result.report_html) {
            buttonsHtml += `<a href="${result.report_html}" target="_blank" class="btn btn-success">
                <i class="fas fa-download me-1"></i> Download HTML
            </a>`;
        }
        
        if (result.report_pdf) {
            buttonsHtml += `<a href="${result.report_pdf}" target="_blank" class="btn btn-danger">
                <i class="fas fa-file-pdf me-1"></i> Download PDF
            </a>`;
        }
        
        buttonsHtml += '</div>';
        
        if (!result.report_url && !result.report_html && !result.report_pdf) {
            buttonsHtml = '<div class="alert alert-warning">No report URLs available</div>';
        }
        
        reportContent.innerHTML = buttonsHtml;
    }
    
    // Show results
    const reportResults = document.getElementById('report-results');
    if (reportResults) {
        reportResults.classList.remove('d-none');
        
        // Scroll to results
        reportResults.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}


function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search functionality
let selectedProject = null;
const PROJECT_IDS = {
    'ivision': 19,
    'fastlane': 21
};

function selectProject(projectName) {
    selectedProject = projectName;
    
    // Update button states
    const ivisionBtn = document.getElementById('ivision-btn');
    const fastlaneBtn = document.getElementById('fastlane-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Reset button states
    ivisionBtn.classList.remove('btn-primary', 'btn-outline-primary');
    fastlaneBtn.classList.remove('btn-success', 'btn-outline-success');
    
    if (projectName === 'ivision') {
        ivisionBtn.classList.add('btn-primary');
        fastlaneBtn.classList.add('btn-outline-success');
    } else {
        fastlaneBtn.classList.add('btn-success');
        ivisionBtn.classList.add('btn-outline-primary');
    }
    
    // Enable search input and button
    searchInput.disabled = false;
    searchBtn.disabled = false;
    
    // Clear previous results
    clearSearchResults();
}

function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-error').classList.add('d-none');
    document.getElementById('search-loading').classList.add('d-none');
}

function showSearchLoading() {
    console.log('showSearchLoading called - making loading visible');
    const loadingElement = document.getElementById('search-loading');
    const errorElement = document.getElementById('search-error');
    const resultsElement = document.getElementById('search-results');
    
    console.log('Loading element found:', !!loadingElement);
    
    // Show loading element using Bootstrap classes
    if (loadingElement) {
        loadingElement.classList.remove('d-none');
        console.log('Loading element shown - removed d-none class');
        
        // Reset the loading text to initial state
        const loadingText = document.getElementById('search-status');
        if (loadingText) {
            loadingText.textContent = 'Initializing search...';
        }
    }
    
    // Hide error and results
    if (errorElement) {
        errorElement.classList.add('d-none');
    }
    
    if (resultsElement) {
        resultsElement.innerHTML = '';
    }
}

function hideSearchLoading() {
    console.log('hideSearchLoading called');
    const loadingElement = document.getElementById('search-loading');
    if (loadingElement) {
        loadingElement.classList.add('d-none');
        console.log('Loading element hidden - added d-none class');
    }
}

function showSearchError(message) {
    hideSearchLoading();
    const errorElement = document.getElementById('search-error');
    const errorMessageElement = document.getElementById('search-error-message');
    
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
    }
    if (errorElement) {
        errorElement.classList.remove('d-none');
    }
    
    // Re-enable button and input on error
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn) searchBtn.disabled = false;
    if (searchInput && selectedProject) searchInput.disabled = false;
}

async function searchUserStory() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const usReference = searchInput.value.trim();
    
    if (!selectedProject) {
        showSearchError('Please select a project first');
        return;
    }
    
    if (!usReference) {
        showSearchError('Please enter a US reference to search');
        return;
    }
    
    // Disable button and input during search
    searchBtn.disabled = true;
    searchInput.disabled = true;
    
    showSearchLoading();
    
    // Ensure loading is visible for at least 2 seconds before starting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const projectId = PROJECT_IDS[selectedProject];
        console.log(`Searching for "${usReference}" in project ${projectId} (${selectedProject})`);
        
        // Update loading message to show we're fetching suites
        const loadingText = document.getElementById('search-status');
        if (loadingText) {
            loadingText.textContent = 'Loading project suites...';
        }
        
        // Add delay to ensure loading message is visible
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Detect environment for API URL
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? 'http://localhost:3000' : '';
        
        console.log('Making API call to:', `${baseUrl}/api/suites/${projectId}`);
        
        // First, get all suites for the project
        const suitesResponse = await fetch(`${baseUrl}/api/suites/${projectId}`);
        if (!suitesResponse.ok) {
            throw new Error(`Failed to get suites: ${suitesResponse.status}`);
        }
        
        const suitesData = await suitesResponse.json();
        console.log('Suites response:', suitesData);
        
        // Handle TestRail API response format
        let suites;
        if (suitesData.suites && Array.isArray(suitesData.suites)) {
            suites = suitesData.suites;
        } else if (Array.isArray(suitesData)) {
            suites = suitesData;
        } else {
            throw new Error('Invalid suites response format - no suites array found');
        }
        
        console.log(`Found ${suites.length} suites in project ${projectId}`);
        
        // Update loading message to show we're searching through suites
        let statusText = document.getElementById('search-status');
        if (statusText) {
            statusText.textContent = `Searching through ${suites.length} suites...`;
        }
        
        // Add delay to show the suite count message
        await new Promise(resolve => setTimeout(resolve, 600));
        
        let allCases = [];
        let foundCases = [];
        let processedSuites = 0;
        
        // Search in each suite
        for (const suite of suites) {
            try {
                console.log(`Searching in suite ${suite.id}: ${suite.name}`);
                
                // Update loading message with current suite progress
                statusText = document.getElementById('search-status');
                if (statusText) {
                    statusText.textContent = `Searching suite "${suite.name}" (${processedSuites + 1}/${suites.length})...`;
                }
                
                // Add delay to show progress for each suite
                await new Promise(resolve => setTimeout(resolve, 400));
                
                console.log('Making API call to:', `${baseUrl}/api/cases/${projectId}/${suite.id}`);
                const casesResponse = await fetch(`${baseUrl}/api/cases/${projectId}/${suite.id}`);
                
                if (casesResponse.ok) {
                    const casesData = await casesResponse.json();
                    console.log(`Suite ${suite.id} response:`, casesData);
                    
                    // Handle TestRail API response format for cases
                    let cases;
                    if (casesData.cases && Array.isArray(casesData.cases)) {
                        cases = casesData.cases;
                    } else if (Array.isArray(casesData)) {
                        cases = casesData;
                    } else {
                        console.warn(`Invalid cases response format for suite ${suite.id}:`, casesData);
                        processedSuites++;
                        continue;
                    }
                    
                    allCases = allCases.concat(cases);
                    
                    // Filter cases that contain the US reference
                    const matchingCases = cases.filter(testCase => {
                        const title = (testCase.title || '').toLowerCase();
                        const refs = (testCase.refs || '').toLowerCase();
                        const searchTerm = usReference.toLowerCase();
                        
                        return title.includes(searchTerm) || refs.includes(searchTerm);
                    });
                    
                    if (matchingCases.length > 0) {
                        foundCases = foundCases.concat(matchingCases.map(c => ({
                            ...c,
                            suite_name: suite.name
                        })));
                    }
                } else {
                    console.warn(`Failed to get cases for suite ${suite.id}: ${casesResponse.status}`);
                }
                
                processedSuites++;
                
            } catch (error) {
                console.warn(`Error searching suite ${suite.id}:`, error);
                processedSuites++;
            }
        }
        
        // Final loading message
        statusText = document.getElementById('search-status');
        if (statusText) {
            statusText.textContent = 'Processing search results...';
        }
        
        // Add final delay to show processing message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Total cases found: ${allCases.length}, Matching cases: ${foundCases.length}`);
        displaySearchResults(foundCases, usReference, selectedProject);
        
    } catch (error) {
        console.error('Error searching user story:', error);
        showSearchError(error.message || 'Failed to search user stories');
    } finally {
        // Re-enable button and input after search
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        searchBtn.disabled = false;
        searchInput.disabled = false;
    }
}

function displaySearchResults(cases, searchTerm, projectName) {
    hideSearchLoading();
    
    const resultsContainer = document.getElementById('search-results');
    
    if (cases.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No test cases found containing "${escapeHtml(searchTerm)}" in ${projectName} project.
            </div>
        `;
        return;
    }
    
    const resultsHtml = `
        <div class="mb-3">
            <h5>Search Results for "${escapeHtml(searchTerm)}" in ${projectName}</h5>
            <p class="text-muted">Found ${cases.length} test case(s)</p>
        </div>
        <div class="row">
            ${cases.map(testCase => `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title">
                                    <a href="?case=${testCase.id}" class="text-decoration-none">
                                        C${testCase.id}: ${escapeHtml(testCase.title || 'Untitled')}
                                    </a>
                                </h6>
                                <span class="badge bg-secondary">ID: ${testCase.id}</span>
                            </div>
                            
                            ${testCase.suite_name ? `
                                <p class="text-muted small mb-2">
                                    <i class="fas fa-folder me-1"></i>
                                    Suite: ${escapeHtml(testCase.suite_name)}
                                </p>
                            ` : ''}
                            
                            ${testCase.refs ? `
                                <p class="text-muted small mb-2">
                                    <i class="fas fa-link me-1"></i>
                                    References: ${escapeHtml(testCase.refs)}
                                </p>
                            ` : ''}
                            
                            ${testCase.custom_preconds ? `
                                <div class="mb-2">
                                    <small class="text-muted">Preconditions:</small>
                                    <div class="small" style="max-height: 60px; overflow: hidden;">
                                        ${formatContent(testCase.custom_preconds).substring(0, 150)}${testCase.custom_preconds.length > 150 ? '...' : ''}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="d-flex gap-2 mt-auto">
                                <a href="?case=${testCase.id}" class="btn btn-primary btn-sm">
                                    <i class="fas fa-eye me-1"></i>
                                    View Details
                                </a>
                                <a href="${CONFIG.TESTRAIL_URL}/index.php?/cases/view/${testCase.id}" target="_blank" class="btn btn-outline-secondary btn-sm">
                                    <i class="fas fa-external-link-alt me-1"></i>
                                    TestRail
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHtml;
}

window.hideReportResults = hideReportResults;
