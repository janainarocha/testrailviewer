import { callTestRailAPI, loadFixedReports, runReport, getSuites, getCases } from './modules/api.js';
import { showLoading, hideLoading, showError, showTestCase, showReportsLoading, hideReportsLoading, showReportsError, showReportsList, hideReportResults, formatCustomFields } from './modules/ui.js';
import { formatDate, formatContent, formatSteps, escapeHtml, getUrlParameter } from './modules/utils.js';
import { CONFIG, PROJECT_IDS, selectedProject, setSelectedProject } from './modules/state.js';

// --- Test Case Tab Logic ---
async function loadTestCase(caseId) {
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

function populateTestCaseUI(testCase) {
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

// --- Reports Tab Logic ---
let currentReports = [];
async function handleLoadReports() {
	showReportsLoading();
	try {
		const reports = await loadFixedReports();
		currentReports = reports;
		displayReports(reports);
		showReportsList();
	} catch (error) {
		showReportsError(error.message || 'Failed to load fixed reports');
	}
}

function displayReports(reports) {
	const container = document.getElementById('reports-content');
	if (!reports || reports.length === 0) {
		container.innerHTML = `<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No fixed reports available.</div>`;
		return;
	}
	function getProjectBadge(projectName) {
		const badges = {
			Ivision: '<span class="badge bg-primary">Ivision</span>',
			Fastlane: '<span class="badge bg-info">Fastlane</span>'
		};
		return badges[projectName] || '';
	}

	const reportsHtml = reports.map(report => `
		<div class="card mb-3">
			<div class="card-body">
				<div class="d-flex justify-content-between align-items-start">
					<div class="flex-grow-1">
						<h6 class="card-title">${escapeHtml(report.name || 'Unnamed Report')}</h6>
						<p class="card-text text-muted small mb-2">
							<strong>Report ID:</strong> ${report.id}<br><strong>Project:</strong> ${escapeHtml(report.project_name || 'Unknown')} (ID: ${report.project_id || 'N/A'})
						</p>
						<div class="d-flex flex-wrap gap-1 mb-2">
							<span class="badge bg-success">Fixed Report</span>
							${getProjectBadge(report.project_name)}
						</div>
					</div>
					<div class="flex-shrink-0">
						<button class="btn btn-primary btn-sm" data-report-id="${report.id}" data-report-name="${escapeHtml(report.name)}">
							<i class="fas fa-play me-1"></i>Run Report
						</button>
					</div>
				</div>
			</div>
		</div>
	`).join('');
	container.innerHTML = reportsHtml;
	// Attach event listeners for run buttons
	container.querySelectorAll('button[data-report-id]').forEach(btn => {
		btn.addEventListener('click', async (e) => {
			await handleRunReport(btn.dataset.reportId, btn.dataset.reportName);
		});
	});
}

async function handleRunReport(reportId, reportName) {
	showReportsLoading();
	try {
		const result = await runReport(reportId);
		displayReportResults(result, reportName);
	} catch (error) {
		showReportsError(error.message || 'Failed to run report');
	}
}

function displayReportResults(result, reportName) {
	hideReportsLoading();
	const reportTitle = document.getElementById('report-title');
	if (reportTitle) reportTitle.textContent = reportName;
	const reportContent = document.getElementById('report-content');
	if (reportContent) {
		let buttonsHtml = '<div class="d-flex gap-2 flex-wrap mb-3">';
		if (result.report_url) {
			buttonsHtml += `<a href="${result.report_url}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt me-1"></i>See on TestRail</a>`;
		}
		if (result.report_html) {
			buttonsHtml += `<a href="${result.report_html}" target="_blank" class="btn btn-success"><i class="fas fa-download me-1"></i>Download HTML</a>`;
		}
		if (result.report_pdf) {
			buttonsHtml += `<a href="${result.report_pdf}" target="_blank" class="btn btn-danger"><i class="fas fa-file-pdf me-1"></i>Download PDF</a>`;
		}
		buttonsHtml += '</div>';
		if (!result.report_url && !result.report_html && !result.report_pdf) {
			buttonsHtml = '<div class="alert alert-warning">No report URLs available</div>';
		}
		reportContent.innerHTML = buttonsHtml;
	}
	const reportResults = document.getElementById('report-results');
	if (reportResults) {
		reportResults.classList.remove('d-none');
		reportResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}


// --- Search US Tab Logic ---
function setSearchControls(enabled) {
	const searchInput = document.getElementById('search-input');
	const searchBtn = document.getElementById('search-btn');
	if (searchInput) searchInput.disabled = !enabled;
	if (searchBtn) searchBtn.disabled = !enabled;
}

function selectProject(projectName) {
	setSelectedProject(projectName);
	const ivisionBtn = document.getElementById('ivision-btn');
	const fastlaneBtn = document.getElementById('fastlane-btn');
	if (ivisionBtn && fastlaneBtn) {
		ivisionBtn.classList.remove('btn-primary', 'btn-outline-primary');
		fastlaneBtn.classList.remove('btn-success', 'btn-outline-success');
		if (projectName === 'ivision') {
			ivisionBtn.classList.add('btn-primary');
			fastlaneBtn.classList.add('btn-outline-success');
		} else {
			fastlaneBtn.classList.add('btn-success');
			ivisionBtn.classList.add('btn-outline-primary');
		}
	}
	setSearchControls(true);
	clearSearchResults();
}

function clearSearchResults() {
	const results = document.getElementById('search-results');
	const error = document.getElementById('search-error');
	const loading = document.getElementById('search-loading');
	if (results) results.innerHTML = '';
	if (error) error.classList.add('d-none');
	if (loading) loading.classList.add('d-none');
}

function showSearchLoading() {
	const loadingElement = document.getElementById('search-loading');
	const errorElement = document.getElementById('search-error');
	const resultsElement = document.getElementById('search-results');
	if (loadingElement) {
		loadingElement.classList.remove('d-none');
		const loadingText = document.getElementById('search-status');
		if (loadingText) loadingText.textContent = 'Initializing search...';
	}
	if (errorElement) errorElement.classList.add('d-none');
	if (resultsElement) resultsElement.innerHTML = '';
}

function hideSearchLoading() {
	const loadingElement = document.getElementById('search-loading');
	if (loadingElement) loadingElement.classList.add('d-none');
}

function showSearchError(message) {
	hideSearchLoading();
	const errorElement = document.getElementById('search-error');
	const errorMessageElement = document.getElementById('search-error-message');
	if (errorMessageElement) errorMessageElement.textContent = message;
	if (errorElement) errorElement.classList.remove('d-none');
	setSearchControls(true);
}

async function searchUserStory() {
	const searchInput = document.getElementById('search-input');
	const usReference = searchInput.value.trim();
	if (!selectedProject) {
		showSearchError('Please select a project first');
		return;
	}
	if (!usReference) {
		showSearchError('Please enter a US reference to search');
		return;
	}
	setSearchControls(false);
	showSearchLoading();
	await new Promise(resolve => setTimeout(resolve, 2000));
	try {
		const projectId = PROJECT_IDS[selectedProject];
		const loadingText = document.getElementById('search-status');
		if (loadingText) loadingText.textContent = 'Loading project suites...';
		await new Promise(resolve => setTimeout(resolve, 800));
		const suitesData = await getSuites(projectId);
		let suites;
		if (suitesData.suites && Array.isArray(suitesData.suites)) suites = suitesData.suites;
		else if (Array.isArray(suitesData)) suites = suitesData;
		else throw new Error('Invalid suites response format - no suites array found');
		if (loadingText) loadingText.textContent = `Searching through ${suites.length} suites...`;
		await new Promise(resolve => setTimeout(resolve, 600));
		let allCases = [];
		let foundCases = [];
		let processedSuites = 0;
		for (const suite of suites) {
			try {
				if (loadingText) loadingText.textContent = `Searching suite "${suite.name}" (${processedSuites + 1}/${suites.length})...`;
				await new Promise(resolve => setTimeout(resolve, 400));
				const casesData = await getCases(projectId, suite.id);
				let cases;
				if (casesData.cases && Array.isArray(casesData.cases)) cases = casesData.cases;
				else if (Array.isArray(casesData)) cases = casesData;
				else { processedSuites++; continue; }
				allCases = allCases.concat(cases);
				const matchingCases = cases.filter(testCase => {
					const title = (testCase.title || '').toLowerCase();
					const refs = (testCase.refs || '').toLowerCase();
					const searchTerm = usReference.toLowerCase();
					return title.includes(searchTerm) || refs.includes(searchTerm);
				});
				if (matchingCases.length > 0) {
					foundCases = foundCases.concat(matchingCases.map(c => ({ ...c, suite_name: suite.name })));
				}
				processedSuites++;
			} catch (error) { processedSuites++; }
		}
		if (loadingText) loadingText.textContent = 'Processing search results...';
		await new Promise(resolve => setTimeout(resolve, 500));
		displaySearchResults(foundCases, usReference, selectedProject);
	} catch (error) {
		showSearchError(error.message || 'Failed to search user stories');
	} finally {
		setSearchControls(true);
	}
}

function displaySearchResults(cases, searchTerm, projectName) {
	hideSearchLoading();
	const resultsContainer = document.getElementById('search-results');
	if (cases.length === 0) {
		resultsContainer.innerHTML = `<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No test cases found containing "${escapeHtml(searchTerm)}" in ${projectName} project.</div>`;
		return;
	}
	const resultsHtml = `
		<div class="mb-3"><h5>Search Results for "${escapeHtml(searchTerm)}" in ${projectName}</h5><p class="text-muted">Found ${cases.length} test case(s)</p></div>
		<div class="row">${cases.map(testCase => `
			<div class="col-md-6 mb-3"><div class="card h-100"><div class="card-body"><div class="d-flex justify-content-between align-items-start mb-2"><h6 class="card-title"><a href="?case=${testCase.id}" class="text-decoration-none">C${testCase.id}: ${escapeHtml(testCase.title || 'Untitled')}</a></h6><span class="badge bg-secondary">ID: ${testCase.id}</span></div>${testCase.suite_name ? `<p class="text-muted small mb-2"><i class="fas fa-folder me-1"></i>Suite: ${escapeHtml(testCase.suite_name)}</p>` : ''}${testCase.refs ? `<p class="text-muted small mb-2"><i class="fas fa-link me-1"></i>References: ${escapeHtml(testCase.refs)}</p>` : ''}${testCase.custom_preconds ? `<div class="mb-2"><small class="text-muted">Preconditions:</small><div class="small" style="max-height: 60px; overflow: hidden;">${formatContent(testCase.custom_preconds).substring(0, 150)}${testCase.custom_preconds.length > 150 ? '...' : ''}</div></div>` : ''}<div class="d-flex gap-2 mt-auto"><a href="?case=${testCase.id}" class="btn btn-primary btn-sm"><i class="fas fa-eye me-1"></i>View Details</a><a href="${CONFIG.TESTRAIL_URL}/index.php?/cases/view/${testCase.id}" target="_blank" class="btn btn-outline-secondary btn-sm"><i class="fas fa-external-link-alt me-1"></i>TestRail</a></div></div></div></div>`).join('')}</div>`;
	resultsContainer.innerHTML = resultsHtml;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
	// Test Case tab: load case from URL
	const caseId = getUrlParameter('case') || getUrlParameter('id');
	if (caseId) loadTestCase(caseId);
	else showError('No test case ID provided. Use ?case=CASE_ID in the URL.');
	window.addEventListener('popstate', function() {
		const newCaseId = getUrlParameter('case') || getUrlParameter('id');
		if (newCaseId) loadTestCase(newCaseId);
	});
	// Reports tab: load reports on tab show
	const reportsTab = document.getElementById('reports-tab');
	if (reportsTab) reportsTab.addEventListener('click', handleLoadReports);
	// Hide report results button
	const hideReportBtn = document.getElementById('hide-report-results-btn');
	if (hideReportBtn) hideReportBtn.addEventListener('click', hideReportResults);
	// Print button
	const printBtn = document.querySelector('button.btn-outline-secondary');
	if (printBtn) printBtn.addEventListener('click', () => window.print());
	// Search US tab: project selection and search
	const ivisionBtn = document.getElementById('ivision-btn');
	const fastlaneBtn = document.getElementById('fastlane-btn');
	if (ivisionBtn) ivisionBtn.addEventListener('click', () => selectProject('ivision'));
	if (fastlaneBtn) fastlaneBtn.addEventListener('click', () => selectProject('fastlane'));
	const searchBtn = document.getElementById('search-btn');
	if (searchBtn) searchBtn.addEventListener('click', searchUserStory);
});
