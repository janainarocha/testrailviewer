// Browser State Management Module

export const BROWSER_CONFIG = {
    DEBOUNCE_DELAY: 300,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
};

export const browserState = {
    currentProjects: [],
    currentSuites: [],
    currentSections: [],
    currentCases: [],
    selectedProjectId: null,
    selectedSuiteId: null,
    isLoading: {
        projects: false,
        suites: false,
        cases: false
    }
};

// State update helpers
export function updateState(key, value) {
    if (key in browserState) {
        browserState[key] = value;
    }
}

export function resetDependentStates(level) {
    switch(level) {
        case 'project':
            browserState.currentSuites = [];
            browserState.selectedSuiteId = null;
            // fall through
        case 'suite':
            browserState.currentSections = [];
            browserState.currentCases = [];
            break;
    }
}

export function setLoadingState(type, isLoading) {
    browserState.isLoading[type] = isLoading;
}

export function resetAllState() {
    Object.assign(browserState, {
        currentProjects: [],
        currentSuites: [],
        currentSections: [],
        currentCases: [],
        selectedProjectId: null,
        selectedSuiteId: null,
        isLoading: {
            projects: false,
            suites: false,
            cases: false
        }
    });
}

// Aliases for compatibility
export const resetBrowserState = resetAllState;

export function updateBrowserState(updates) {
    Object.assign(browserState, updates);
}
