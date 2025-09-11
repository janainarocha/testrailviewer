import { showError, hideReportResults } from './modules/ui.js';
import { getUrlParameter } from './modules/utils.js';

// Import feature modules
import * as testCaseModule from './features/case/testCase.js';
import * as reportsModule from './features/reports/reports.js';
import * as searchModule from './features/search/search.js';
import * as browserModule from './features/browser/browser.js';
import * as dashboardModule from './features/dashboard/dashboard.js';

// Tab content loading
async function loadTabContent(tabId, htmlPath) {
    try {
        const response = await fetch(htmlPath);
        const html = await response.text();
        document.getElementById(tabId).innerHTML = html;
    } catch (error) {
        console.error(`Failed to load ${htmlPath}:`, error);
        document.getElementById(tabId).innerHTML = `<div class="alert alert-danger">Failed to load content</div>`;
    }
}

// Initialize tabs content
async function initializeTabs() {
    await loadTabContent('case-pane', 'features/case/case.html');
    await loadTabContent('reports-pane', 'features/reports/reports.html');
    await loadTabContent('search-pane', 'features/search/search.html');
    await loadTabContent('browser-pane', 'features/browser/browser.html');
    await loadTabContent('dashboard-pane', 'features/dashboard/dashboard.html');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async function() {
    // Load all tab contents first
    await initializeTabs();
    
    // Test Case tab: load case from URL
    const caseId = getUrlParameter('case') || getUrlParameter('id');
    if (caseId) testCaseModule.loadTestCase(caseId);
    else showError('No test case ID provided. Use ?case=CASE_ID in the URL.');
    
    window.addEventListener('popstate', function() {
        const newCaseId = getUrlParameter('case') || getUrlParameter('id');
        if (newCaseId) testCaseModule.loadTestCase(newCaseId);
    });
    
    // Reports tab: load reports on tab show
    const reportsTab = document.getElementById('reports-tab');
    if (reportsTab) reportsTab.addEventListener('click', reportsModule.handleLoadReports);
    
    // Browser tab: initialize browser on tab show
    const browserTab = document.getElementById('browser-tab');
    if (browserTab) browserTab.addEventListener('click', browserModule.handleBrowserTabShow);
    
    // Dashboard tab: initialize dashboard on tab show
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.addEventListener('click', dashboardModule.handleDashboardTabShow);
        // Initialize dashboard immediately
        setTimeout(() => dashboardModule.initializeDashboard(), 100);
    }
    
    // Hide report results button
    const hideReportBtn = document.getElementById('hide-report-results-btn');
    if (hideReportBtn) hideReportBtn.addEventListener('click', hideReportResults);
    
    // Print button
    const printBtn = document.querySelector('button.btn-outline-secondary');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    
    // Search US tab: project selection and search
    const ivisionBtn = document.getElementById('ivision-btn');
    const fastlaneBtn = document.getElementById('fastlane-btn');
    if (ivisionBtn) ivisionBtn.addEventListener('click', () => searchModule.selectProject('ivision'));
    if (fastlaneBtn) fastlaneBtn.addEventListener('click', () => searchModule.selectProject('fastlane'));
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', searchModule.searchUserStory);
});
