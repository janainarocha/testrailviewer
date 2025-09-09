import { callTestRailAPI } from '../../modules/api.js';
import { showLoading, showError, showTestCase, formatCustomFields } from '../../modules/ui.js';
import { formatDate, formatContent, formatSteps } from '../../modules/utils.js';
import { CONFIG } from '../../modules/state.js';

// --- Test Case Tab Logic ---
export async function loadTestCase(caseId) {
    showLoading();
    try {
        if (!caseId || isNaN(caseId)) throw new Error('Invalid test case ID.');
        const testCase = await callTestRailAPI(`get_case/${caseId}`);
        populateTestCaseUI(testCase);
        showTestCase();
    } catch (error) {
        showError(error.message);
    }
}

export function populateTestCaseUI(testCase) {
    document.getElementById('case-title').textContent = testCase.title || 'No title';
    document.getElementById('case-id').textContent = `C${testCase.id}`;
    const priorityElement = document.getElementById('case-priority');
    const priority = CONFIG.PRIORITIES[testCase.priority_id] || { name: 'Unknown', class: 'bg-secondary' };
    priorityElement.textContent = priority.name;
    priorityElement.className = `badge fs-6 ${priority.class}`;
    let typeText = 'N/A';
    if (testCase.type_id) {
        if (testCase.type_id === 2 || testCase.type_id === '2') typeText = 'Functionality';
        else typeText = `Type ${testCase.type_id}`;
    }
    document.getElementById('case-type').textContent = typeText;
    document.getElementById('case-created-by').textContent = testCase.created_by ? `User ${testCase.created_by}` : 'N/A';
    document.getElementById('case-created-on').textContent = formatDate(testCase.created_on);
    document.getElementById('case-updated-on').textContent = formatDate(testCase.updated_on);
    document.getElementById('case-preconditions').innerHTML = formatContent(testCase.custom_preconds);
    document.getElementById('case-steps').innerHTML = formatSteps(testCase.custom_steps, testCase.custom_steps_separated);
    document.getElementById('case-expected').innerHTML = formatContent(testCase.custom_expected);
    formatCustomFields(testCase);
    const testRailLink = document.getElementById('testrail-link');
    testRailLink.href = `${CONFIG.TESTRAIL_URL}/index.php?/cases/view/${testCase.id}`;
}