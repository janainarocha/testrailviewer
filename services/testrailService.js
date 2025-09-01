

const config = require('../config');

let fetchFn;
if (typeof fetch === 'function') {
    fetchFn = fetch;
} else {
    fetchFn = require('node-fetch');
}

async function apiGet(url) {
    const { credentials } = getCredentials();
    const response = await fetchFn(url, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

function getCredentials() {
    const { TESTRAIL_URL, TESTRAIL_API_USER, TESTRAIL_API_KEY } = config;
    if (!TESTRAIL_URL || !TESTRAIL_API_USER || !TESTRAIL_API_KEY) {
        throw new Error('TestRail credentials/config missing');
    }
    const credentials = Buffer.from(`${TESTRAIL_API_USER}:${TESTRAIL_API_KEY}`).toString('base64');
    return { TESTRAIL_URL, credentials };
}

async function getCase(caseId) {
    const { TESTRAIL_URL } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_case/${caseId}`;
    return apiGet(url);
}

async function getReports(projectId) {
    const { TESTRAIL_URL } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_reports/${projectId}`;
    return apiGet(url);
}

async function runReport(reportId) {
    const { TESTRAIL_URL } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/run_report/${reportId}`;
    return apiGet(url);
}

async function getSuites(projectId) {
    const { TESTRAIL_URL } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_suites/${projectId}`;
    return apiGet(url);
}

async function getCases(projectId, suiteId) {
    const { TESTRAIL_URL } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_cases/${projectId}&suite_id=${suiteId}`;
    return apiGet(url);
}

module.exports = {
    getCase,
    getReports,
    runReport,
    getSuites,
    getCases
};
