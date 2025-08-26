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
    try {
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
    } catch (error) {
        throw error;
    }
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

// Auto-load project 19 reports when Reports tab is shown
document.addEventListener('DOMContentLoaded', function() {
    // Listen for tab changes
    const reportsTab = document.getElementById('reports-tab');
    if (reportsTab) {
        reportsTab.addEventListener('shown.bs.tab', function () {
            // Only auto-load if no reports are currently displayed
            if (currentReports.length === 0) {
                loadReports();
            }
        });
    }
});

async function loadReports() {
    const projectId = document.getElementById('project-id').value || '19';
    
    if (!projectId) {
        showReportsError('Please enter a project ID');
        return;
    }
    
    if (!/^\d+$/.test(projectId)) {
        showReportsError('Project ID must be a number');
        return;
    }
    
    showReportsLoading();
    
    try {
        const response = await fetch(`/api/reports/${projectId}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const reports = await response.json();
        currentReports = reports;
        displayReports(reports);
        showReportsList();
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showReportsError(error.message || 'Failed to load reports');
    }
}

function displayReports(reports) {
    const container = document.getElementById('reports-content');
    
    if (!reports || reports.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No reports available for this project, or no reports are configured for API access.
                <br><small class="mt-2 d-block">
                    To make reports available via API, create a report in TestRail and check "On-demand via the API" option.
                </small>
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
                            <strong>ID:</strong> ${report.id}
                            ${report.description ? `<br><strong>Description:</strong> ${escapeHtml(report.description)}` : ''}
                        </p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${report.notify_user ? '<span class="badge bg-info">Email Notifications</span>' : ''}
                            ${report.notify_attachment ? '<span class="badge bg-secondary">Email Attachments</span>' : ''}
                            ${report.cases_limit ? `<span class="badge bg-light text-dark">Limit: ${report.cases_limit}</span>` : ''}
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
        const response = await fetch(`/api/report/run/${reportId}`);
        
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
