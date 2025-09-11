// API calls for TestRail Viewer

function getBaseUrl() {
	const hostname = window.location.hostname;
	return (hostname === 'localhost' || hostname === '127.0.0.1') ? 'http://localhost:3000' : '';
}

async function handleResponse(response, custom404Msg) {
	if (response.ok) return response.json();
	let errorMsg = `HTTP ${response.status}`;
	try {
		const error = await response.json();
		errorMsg = error.error || errorMsg;
	} catch {}
	if (response.status === 404 && custom404Msg) throw new Error(custom404Msg);
	throw new Error(errorMsg);
}

export async function callTestRailAPI(endpoint) {
	const caseId = endpoint.replace('get_case/', '');
	const url = `${getBaseUrl()}/api/case/${caseId}`;
	const response = await fetch(url);
	return handleResponse(response, 'Test case not found.');
}

export async function loadFixedReports() {
	const response = await fetch(`${getBaseUrl()}/api/fixed-reports`);
	return handleResponse(response);
}

export async function runReport(reportId) {
	const response = await fetch(`${getBaseUrl()}/api/report/run/${reportId}`);
	return handleResponse(response);
}

export async function getSuites(projectId) {
	const response = await fetch(`${getBaseUrl()}/api/suites/${projectId}`);
	return handleResponse(response);
}

export async function getCases(projectId, suiteId) {
	const response = await fetch(`${getBaseUrl()}/api/cases/${projectId}/${suiteId}`);
	return handleResponse(response);
}

// Browser API functions
export async function getBrowserProjects() {
	const response = await fetch(`${getBaseUrl()}/api/browser/projects`);
	return handleResponse(response);
}

export async function getBrowserSuites(projectId) {
	const response = await fetch(`${getBaseUrl()}/api/browser/suites/${projectId}`);
	return handleResponse(response);
}

export async function getBrowserSections(suiteId) {
	const response = await fetch(`${getBaseUrl()}/api/browser/sections/${suiteId}`);
	return handleResponse(response);
}

export async function getBrowserCases(suiteId) {
	const response = await fetch(`${getBaseUrl()}/api/browser/cases/${suiteId}`);
	return handleResponse(response);
}

// Dashboard API functions - Updated to use real dashboard database
export async function getAutomationCoverage(projectId) {
	// Use the new endpoint that gets current stats from dashboard database
	const response = await fetch(`${getBaseUrl()}/api/dashboard/current-automation-stats`);
	return handleResponse(response);
}

export async function getMonthlyTrend(projectId) {
	// Use the new endpoint that gets historical data from dashboard database
	const response = await fetch(`${getBaseUrl()}/api/dashboard/automation-history`);
	return handleResponse(response);
}

export async function getGitHubStats(owner, repo) {
	const response = await fetch(`${getBaseUrl()}/api/dashboard/github-stats/${owner}/${repo}`);
	return handleResponse(response);
}

export async function getEpicProgress(epicKey) {
	const response = await fetch(`${getBaseUrl()}/api/dashboard/epic-progress/${epicKey}`);
	return handleResponse(response);
}
