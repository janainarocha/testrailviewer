// Browser UI Module - Handles DOM manipulation and UI state

import { sanitizeHTML, validateId, createTestCaseURL } from './browserUtils.js';
import { showError } from '../../modules/ui.js';
import { browserState } from './browserState.js';

// Loading state management
export function updateLoadingState(type, isLoading) {
    const loadingElement = document.getElementById(`browser-loading-${type}`);
    const contentElement = document.getElementById(`browser-${type}-list`) || 
                          document.getElementById(`browser-${type}-content`) ||
                          document.getElementById(`browser-${type}-empty`);
    
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'block' : 'none';
    }
    
    if (contentElement && isLoading) {
        contentElement.style.display = 'none';
    }
    
    // Update form elements during loading
    if (type === 'projects') {
        const projectSelect = document.getElementById('browser-project-select');
        if (projectSelect) {
            projectSelect.disabled = isLoading;
        }
    }
}

// Project display functions
export function displayProjects(projects) {
    const projectSelect = document.getElementById('browser-project-select');
    const projectsList = document.getElementById('browser-projects-list');
    
    if (!projectSelect || !projectsList) {
        console.warn('Project display elements not found');
        return;
    }

    projectSelect.innerHTML = '<option value="">Choose a project...</option>';
    
    projects.forEach(project => {
        if (!project.id || !project.name) {
            console.warn('Invalid project data:', project);
            return;
        }
        
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        option.title = project.name;
        projectSelect.appendChild(option);
    });

    projectsList.style.display = 'block';
}

export function displayProjectsError(errorMessage) {
    const projectsList = document.getElementById('browser-projects-list');
    if (projectsList) {
        projectsList.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Failed to load projects: ${sanitizeHTML(errorMessage)}
                <button class="btn btn-sm btn-outline-warning ms-2" onclick="window.browserModule?.loadProjects()">
                    <i class="fas fa-redo me-1"></i>Retry
                </button>
            </div>
        `;
        projectsList.style.display = 'block';
    }
}

// Suite display functions
export function displaySuites(suites) {
    const suiteSelect = document.getElementById('browser-suite-select');
    const suitesList = document.getElementById('browser-suites-list');
    const suitesEmpty = document.getElementById('browser-suites-empty');
    
    if (!suiteSelect || !suitesList) return;

    suiteSelect.innerHTML = '<option value="">Choose a suite...</option>';
    
    if (suites.length === 0) {
        if (suitesEmpty) {
            suitesEmpty.style.display = 'block';
            suitesEmpty.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>No suites found in this project';
        }
        suitesList.style.display = 'none';
        return;
    }

    suites.forEach(suite => {
        const option = document.createElement('option');
        option.value = suite.id;
        option.textContent = suite.name;
        option.dataset.description = suite.description || '';
        suiteSelect.appendChild(option);
    });

    if (suitesEmpty) suitesEmpty.style.display = 'none';
    suitesList.style.display = 'block';
}

export function displaySuitesError(errorMessage) {
    const suitesList = document.getElementById('browser-suites-list');
    const suitesEmpty = document.getElementById('browser-suites-empty');
    
    if (suitesEmpty) {
        suitesEmpty.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Failed to load suites: ${sanitizeHTML(errorMessage)}
            </div>
        `;
        suitesEmpty.style.display = 'block';
    }
    
    if (suitesList) {
        suitesList.style.display = 'none';
    }
}

// Cases display functions
export function displayCases(sections, cases) {
    const casesContent = document.getElementById('browser-cases-content');
    const casesEmpty = document.getElementById('browser-cases-empty');
    const casesCount = document.getElementById('browser-cases-count');

    if (!casesContent) return;

    if (cases.length === 0) {
        if (casesEmpty) {
            casesEmpty.style.display = 'block';
            casesEmpty.innerHTML = `
                <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                <p>No test cases found in this suite</p>
            `;
        }
        casesContent.style.display = 'none';
        return;
    }

    // Update cases count
    if (casesCount) {
        casesCount.textContent = `${cases.length} case${cases.length !== 1 ? 's' : ''}`;
        casesCount.style.display = 'inline';
    }

    populateSectionFilter(sections);
    const casesBySection = groupCasesBySection(sections, cases);
    displaySectionsTree(casesBySection);

    if (casesEmpty) casesEmpty.style.display = 'none';
    casesContent.style.display = 'block';
}

// Helper functions
function populateSectionFilter(sections) {
    const sectionFilter = document.getElementById('browser-section-filter');
    if (!sectionFilter) return;

    sectionFilter.innerHTML = '<option value="">All sections</option>';
    
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionFilter.appendChild(option);
    });
}

function groupCasesBySection(sections, cases) {
    const casesBySection = {};
    
    sections.forEach(section => {
        casesBySection[section.id] = {
            section: section,
            cases: []
        };
    });

    cases.forEach(testCase => {
        if (casesBySection[testCase.section_id]) {
            casesBySection[testCase.section_id].cases.push(testCase);
        }
    });

    return casesBySection;
}

function displaySectionsTree(casesBySection) {
    const sectionsTree = document.getElementById('browser-sections-tree');
    if (!sectionsTree) return;

    sectionsTree.innerHTML = '';

    Object.values(casesBySection).forEach(sectionData => {
        const sectionElement = createSectionElement(sectionData);
        sectionsTree.appendChild(sectionElement);
    });
}

function createSectionElement(sectionData) {
    const { section, cases } = sectionData;
    
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'browser-section';
    sectionDiv.dataset.sectionId = section.id;
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'browser-section-header';
    headerDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <i class="fas fa-folder me-2"></i>
                <strong>${sanitizeHTML(section.name)}</strong>
                ${section.description ? `<small class="text-muted ms-2">${sanitizeHTML(section.description)}</small>` : ''}
            </div>
            <div class="browser-section-stats">
                <span class="badge ${cases.length > 0 ? 'bg-secondary' : 'bg-light text-dark'}">${cases.length} case${cases.length !== 1 ? 's' : ''}</span>
                <i class="fas fa-chevron-down ms-2"></i>
            </div>
        </div>
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'browser-section-content';
    
    if (cases.length === 0) {
        contentDiv.innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-info-circle me-2"></i>No test cases in this section</div>';
    } else {
        cases.forEach(testCase => {
            const caseElement = createCaseElement(testCase);
            contentDiv.appendChild(caseElement);
        });
    }
    
    // Toggle functionality
    headerDiv.addEventListener('click', () => {
        const isCollapsed = contentDiv.style.display === 'none';
        contentDiv.style.display = isCollapsed ? 'block' : 'none';
        headerDiv.classList.toggle('collapsed', !isCollapsed);
        
        const chevron = headerDiv.querySelector('.fa-chevron-down, .fa-chevron-up');
        if (chevron) {
            chevron.className = isCollapsed ? 'fas fa-chevron-down ms-2' : 'fas fa-chevron-up ms-2';
        }
    });
    
    sectionDiv.appendChild(headerDiv);
    sectionDiv.appendChild(contentDiv);
    
    return sectionDiv;
}

export function createCaseElement(testCase) {
    if (!testCase || !testCase.id) {
        console.warn('Invalid test case data:', testCase);
        return document.createElement('div');
    }
    
    const caseDiv = document.createElement('div');
    caseDiv.className = 'browser-case-item';
    caseDiv.dataset.caseId = testCase.id;
    caseDiv.setAttribute('role', 'button');
    caseDiv.setAttribute('tabindex', '0');
    caseDiv.setAttribute('aria-label', `Open test case ${testCase.id}: ${testCase.title}`);
    
    const safeTitle = sanitizeHTML(testCase.title || 'Untitled Test Case');
    const safeId = sanitizeHTML(testCase.id.toString());
    
    caseDiv.innerHTML = `
        <div class="browser-case-title" data-searchable>${safeTitle}</div>
        <div class="browser-case-id">ID: ${safeId} <i class="fas fa-external-link-alt ms-1 text-muted" aria-hidden="true"></i></div>
    `;
    
    // Event handlers
    const openCase = () => openTestCase(testCase.id);
    
    caseDiv.addEventListener('click', openCase);
    caseDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCase();
        }
    });
    
    return caseDiv;
}

function openTestCase(caseId) {
    if (!validateId(caseId)) {
        console.error('Invalid case ID:', caseId);
        return;
    }
    
    try {
        const newUrl = createTestCaseURL(caseId);
        window.open(newUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('Failed to open test case:', error);
        showError('Failed to open test case');
    }
}

// Reset functions
export function resetSuites() {
    const suiteSelect = document.getElementById('browser-suite-select');
    const suitesList = document.getElementById('browser-suites-list');
    const suitesEmpty = document.getElementById('browser-suites-empty');
    
    if (suiteSelect) suiteSelect.innerHTML = '<option value="">Choose a suite...</option>';
    if (suitesList) suitesList.style.display = 'none';
    if (suitesEmpty) {
        suitesEmpty.style.display = 'block';
        suitesEmpty.innerHTML = '<i class="fas fa-info-circle me-2"></i>Select a project first';
    }
    
    resetSuiteInfo();
}

export function resetCases() {
    const casesEmpty = document.getElementById('browser-cases-empty');
    const casesContent = document.getElementById('browser-cases-content');
    const casesCount = document.getElementById('browser-cases-count');
    
    if (casesEmpty) {
        casesEmpty.style.display = 'block';
        casesEmpty.innerHTML = `
            <i class="fas fa-clipboard-list fa-3x mb-3"></i>
            <p>Select a project and suite to browse test cases</p>
        `;
    }
    if (casesContent) casesContent.style.display = 'none';
    if (casesCount) casesCount.style.display = 'none';
    
    // Clear search and filter
    const searchInput = document.getElementById('browser-search');
    const sectionFilter = document.getElementById('browser-section-filter');
    if (searchInput) searchInput.value = '';
    if (sectionFilter) sectionFilter.innerHTML = '<option value="">All sections</option>';
}

function resetSuiteInfo() {
    const suiteInfo = document.getElementById('browser-suite-info');
    if (suiteInfo) {
        suiteInfo.innerHTML = '<i class="fas fa-info-circle me-2"></i>Select a suite to see details';
    }
}

export function updateSuiteInfo(selectedOption) {
    const suiteInfo = document.getElementById('browser-suite-info');
    if (!suiteInfo) return;

    const suiteName = selectedOption.textContent;
    const suiteDescription = selectedOption.dataset.description;

    suiteInfo.innerHTML = `
        <div>
            <strong>${sanitizeHTML(suiteName)}</strong>
            ${suiteDescription ? `<p class="mt-2 mb-0 text-muted small">${sanitizeHTML(suiteDescription)}</p>` : ''}
        </div>
    `;
}
