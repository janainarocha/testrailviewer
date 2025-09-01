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
