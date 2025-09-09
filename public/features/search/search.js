import { getSuites, getCases } from '../../modules/api.js';
import { formatContent, escapeHtml } from '../../modules/utils.js';
import { PROJECT_IDS, selectedProject, setSelectedProject } from '../../modules/state.js';
import { CONFIG } from '../../modules/state.js';

// --- Search US Tab Logic ---
export function setSearchControls(enabled) {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput) searchInput.disabled = !enabled;
    if (searchBtn) searchBtn.disabled = !enabled;
}

export function selectProject(projectName) {
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

export function clearSearchResults() {
    const results = document.getElementById('search-results');
    const error = document.getElementById('search-error');
    const loading = document.getElementById('search-loading');
    if (results) results.innerHTML = '';
    if (error) error.classList.add('d-none');
    if (loading) loading.classList.add('d-none');
}

export function showSearchLoading() {
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

export function hideSearchLoading() {
    const loadingElement = document.getElementById('search-loading');
    if (loadingElement) loadingElement.classList.add('d-none');
}

export function showSearchError(message) {
    hideSearchLoading();
    const errorElement = document.getElementById('search-error');
    const errorMessageElement = document.getElementById('search-error-message');
    if (errorMessageElement) errorMessageElement.textContent = message;
    if (errorElement) errorElement.classList.remove('d-none');
    setSearchControls(true);
}

export async function searchUserStory() {
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

export function displaySearchResults(cases, searchTerm, projectName) {
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
