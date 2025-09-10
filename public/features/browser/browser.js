// Test Cases Browser Module - Main Orchestrator (Refactored)
import { showError } from '../../modules/ui.js';
import { BrowserAPI } from './browserAPI.js';
import { browserState, updateBrowserState, resetBrowserState } from './browserState.js';
import { 
    updateLoadingState, 
    displayProjects, 
    displayProjectsError,
    displaySuites, 
    displaySuitesError,
    displayCases,
    resetSuites,
    resetCases,
    updateSuiteInfo 
} from './browserUI.js';
import { 
    setupSearchAndFilter, 
    resetSearchAndFilter,
    setupAdvancedSearch 
} from './browserSearch.js';
import { validateId } from './browserUtils.js';

// Initialize API
const browserAPI = new BrowserAPI();

// Main initialization function
export function initializeBrowser() {
    console.log('Initializing Test Cases Browser...');
    
    // Cancel any pending requests
    browserAPI.cancelAllRequests();
    
    // Reset state
    resetBrowserState();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadProjects();
}

// Event listeners setup
function setupEventListeners() {
    // Remove existing listeners to prevent duplicates
    removeEventListeners();
    
    const projectSelect = document.getElementById('browser-project-select');
    const suiteSelect = document.getElementById('browser-suite-select');

    if (projectSelect) {
        projectSelect.addEventListener('change', handleProjectChange);
    }

    if (suiteSelect) {
        suiteSelect.addEventListener('change', handleSuiteChange);
    }

    // Setup search and filter functionality
    setupSearchAndFilter();
    setupAdvancedSearch();
}

function removeEventListeners() {
    const elements = [
        'browser-project-select',
        'browser-suite-select', 
        'browser-search',
        'browser-section-filter'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.replaceWith(element.cloneNode(true));
        }
    });
}

// Data loading functions
async function loadProjects() {
    if (browserState.isLoading.projects) return;
    
    try {
        updateLoadingState('projects', true);
        updateBrowserState({ isLoading: { ...browserState.isLoading, projects: true } });
        
        const projects = await browserAPI.getProjects();
        
        if (!Array.isArray(projects)) {
            throw new Error('Invalid projects data received');
        }
        
        updateBrowserState({ currentProjects: projects });
        displayProjects(projects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showError(`Failed to load projects: ${error.message}`);
        displayProjectsError(error.message);
    } finally {
        updateLoadingState('projects', false);
        updateBrowserState({ isLoading: { ...browserState.isLoading, projects: false } });
    }
}

async function loadSuites(projectId) {
    if (browserState.isLoading.suites) return;

    try {
        updateLoadingState('suites', true);
        updateBrowserState({ isLoading: { ...browserState.isLoading, suites: true } });
        
        const suites = await browserAPI.getSuites(projectId);
        
        if (!Array.isArray(suites)) {
            throw new Error('Invalid suites data received');
        }
        
        updateBrowserState({ currentSuites: suites });
        displaySuites(suites);
        
    } catch (error) {
        console.error('Error loading suites:', error);
        showError(`Failed to load suites: ${error.message}`);
        displaySuitesError(error.message);
    } finally {
        updateLoadingState('suites', false);
        updateBrowserState({ isLoading: { ...browserState.isLoading, suites: false } });
    }
}

async function loadCases(suiteId) {
    if (browserState.isLoading.cases) return;

    try {
        updateLoadingState('cases', true);
        updateBrowserState({ isLoading: { ...browserState.isLoading, cases: true } });
        
        // Load both sections and cases in parallel
        const [sections, cases] = await Promise.all([
            browserAPI.getSections(suiteId),
            browserAPI.getCases(suiteId)
        ]);
        
        if (!Array.isArray(sections) || !Array.isArray(cases)) {
            throw new Error('Invalid sections or cases data received');
        }
        
        updateBrowserState({ 
            currentSections: sections,
            currentCases: cases 
        });
        
        displayCases(sections, cases);
        
    } catch (error) {
        console.error('Error loading cases:', error);
        showError(`Failed to load test cases: ${error.message}`);
        
        // Show error in cases area
        const casesEmpty = document.getElementById('browser-cases-empty');
        if (casesEmpty) {
            casesEmpty.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load test cases: ${error.message}
                </div>
            `;
            casesEmpty.style.display = 'block';
        }
    } finally {
        updateLoadingState('cases', false);
        updateBrowserState({ isLoading: { ...browserState.isLoading, cases: false } });
    }
}

// Event handlers
async function handleProjectChange(event) {
    const projectId = event.target.value;
    
    // Reset dependent states
    resetSuites();
    resetCases();
    resetSearchAndFilter();
    updateBrowserState({ 
        selectedProjectId: projectId,
        selectedSuiteId: null 
    });
    
    if (!projectId || !validateId(projectId)) {
        return;
    }

    await loadSuites(projectId);
}

async function handleSuiteChange(event) {
    const suiteId = event.target.value;
    const selectedOption = event.target.selectedOptions[0];
    
    // Reset cases and search
    resetCases();
    resetSearchAndFilter();
    updateBrowserState({ selectedSuiteId: suiteId });
    
    if (!suiteId || !validateId(suiteId)) {
        return;
    }

    // Update suite info
    updateSuiteInfo(selectedOption);

    await loadCases(suiteId);
}

// Public API for external access
export const browserModule = {
    loadProjects,
    loadSuites,
    loadCases,
    browserState,
    browserAPI
};

// Function for main.js compatibility
export function handleBrowserTabShow() {
    // Only initialize if not already initialized
    if (!browserState.currentProjects.length) {
        initializeBrowser();
    }
}

// Global access for browser module
window.browserModule = browserModule;

// Export for main module loading
export default {
    init: initializeBrowser,
    module: browserModule
};
