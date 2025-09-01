
let fetchFn;
if (typeof fetch === 'function') {
    fetchFn = fetch;
} else {
    fetchFn = require('node-fetch');
}

function getCredentials() {
    const TESTRAIL_URL = process.env.TESTRAIL_URL;
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;
    if (!TESTRAIL_URL || !API_USER || !API_KEY) {
        throw new Error('TestRail credentials/config missing');
    }
    const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');
    return { TESTRAIL_URL, credentials };
}

async function getCase(caseId) {
    const { TESTRAIL_URL, credentials } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_case/${caseId}`;
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
    return await response.json();
}

async function getReports(projectId) {
    const { TESTRAIL_URL, credentials } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_reports/${projectId}`;
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
    return await response.json();
}

async function runReport(reportId) {
    console.log(`Running report with ID: ${reportId}`);
    const { TESTRAIL_URL, credentials } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/run_report/${reportId}`;
    console.log(`TestRail URL: ${url}`);
    
    const response = await fetchFn(url, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
        }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`TestRail API error: ${errorText}`);
        throw new Error(errorText);
    }
    
    const result = await response.json();
    console.log('Report result:', result);
    return result;
}

async function getSuites(projectId) {
    const { TESTRAIL_URL, credentials } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_suites/${projectId}`;
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
    return await response.json();
}

async function getCases(projectId, suiteId) {
    const { TESTRAIL_URL, credentials } = getCredentials();
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_cases/${projectId}&suite_id=${suiteId}`;
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
    return await response.json();
}

module.exports = {
    getCase,
    getReports,
    runReport,
    getSuites,
    getCases
};
