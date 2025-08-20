// Configuration
const CONFIG = {
    // Priority settings (adapt according to your TestRail configuration)
    PRIORITIES: {
        1: { name: 'Critical', class: 'priority-1' },
        2: { name: 'High', class: 'priority-2' },
        3: { name: 'Medium', class: 'priority-3' },
        4: { name: 'Low', class: 'priority-4' }
    }
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
    
    // Convert basic HTML to styled content
    let formatted = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    
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
        if (key.startsWith('custom_') && testCase[key] !== null && testCase[key] !== '') {
            const label = knownCustomFields[key] || key.replace('custom_', '').replace(/_/g, ' ');
            const value = testCase[key];
            
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
    // Call the backend instead of TestRail directly
    const url = `http://localhost:3000/api/case/${endpoint.replace('get_case/', '')}`;
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
    document.getElementById('case-type').textContent = testCase.type_id ? `Type ${testCase.type_id}` : 'N/A';
    
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

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        loadTestCase,
        formatContent,
        formatSteps,
        formatDate
    };
}
