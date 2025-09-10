

const config = require('../config');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database path
const dbPath = path.join(__dirname, '../../data/testrail_cases.db');

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

// Helper function to run SQLite queries
function runSQLiteQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(new Error(`Database connection failed: ${err.message}`));
                return;
            }
        });

        db.all(query, params, (err, rows) => {
            if (err) {
                db.close();
                reject(new Error(`Query failed: ${err.message}`));
                return;
            }
            
            db.close((closeErr) => {
                if (closeErr) {
                    console.warn('Warning: Failed to close database connection:', closeErr.message);
                }
            });
            
            resolve(rows);
        });
    });
}

// Browser functions that query local SQLite database
async function getBrowserProjects() {
    const query = `
        SELECT id, name, is_completed, suite_mode, url, announcement 
        FROM projects 
        WHERE active = 1 
        ORDER BY name
    `;
    return runSQLiteQuery(query);
}

async function getBrowserSuites(projectId) {
    const query = `
        SELECT id, project_id, name, description, is_master, url 
        FROM suites 
        WHERE project_id = ? AND active = 1 
        ORDER BY name
    `;
    return runSQLiteQuery(query, [projectId]);
}

async function getBrowserSections(suiteId) {
    const query = `
        SELECT id, suite_id, name, description, parent_id, depth 
        FROM sections 
        WHERE suite_id = ? AND active = 1 
        ORDER BY COALESCE(parent_id, 0), name
    `;
    return runSQLiteQuery(query, [suiteId]);
}

async function getBrowserCases(suiteId) {
    const query = `
        SELECT c.id, c.section_id, c.title, c.custom_preconds, c.custom_steps, 
               c.custom_expected, c.type_id, c.priority_id, c.estimate, c.refs,
               s.name as section_name
        FROM cases c
        INNER JOIN sections s ON c.section_id = s.id
        WHERE s.suite_id = ? AND c.active = 1 AND s.active = 1
        ORDER BY s.name, c.title
    `;
    return runSQLiteQuery(query, [suiteId]);
}

module.exports = {
    getCase,
    getReports,
    runReport,
    getSuites,
    getCases,
    getBrowserProjects,
    getBrowserSuites,
    getBrowserSections,
    getBrowserCases
};
