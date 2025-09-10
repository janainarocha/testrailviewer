// Test Cases Browser Module
import { showError } from '../../modules/ui.js';

let currentProjects = [];
let currentSuites = [];
let currentSections = [];
let currentCases = [];

// Initialize the browser when the tab is shown
export function initializeBrowser() {
    console.log('Initializing Test Cases Browser...');
    loadProjects();
    setupEventListeners();
}

function setupEventListeners() {
    const projectSelect = document.getElementById('browser-project-select');
    const suiteSelect = document.getElementById('browser-suite-select');
    const searchInput = document.getElementById('browser-search');
    const sectionFilter = document.getElementById('browser-section-filter');

    if (projectSelect) {
        projectSelect.addEventListener('change', handleProjectChange);
    }

    if (suiteSelect) {
        suiteSelect.addEventListener('change', handleSuiteChange);
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (sectionFilter) {
        sectionFilter.addEventListener('change', handleSectionFilter);
    }
}

async function loadProjects() {
    try {
        showLoadingState('projects');
        const response = await fetch('/api/browser/projects');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const projects = await response.json();
        currentProjects = projects;
        displayProjects(projects);
        hideLoadingState('projects');
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load projects: ' + error.message);
        hideLoadingState('projects');
    }
}

function displayProjects(projects) {
    const projectSelect = document.getElementById('browser-project-select');
    const projectsList = document.getElementById('browser-projects-list');
    
    if (!projectSelect || !projectsList) return;

    // Clear existing options
    projectSelect.innerHTML = '<option value="">Choose a project...</option>';
    
    // Add projects to select
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });

    projectsList.style.display = 'block';
}

async function handleProjectChange(event) {
    const projectId = event.target.value;
    
    // Reset suite and cases
    resetSuites();
    resetCases();
    
    if (!projectId) return;

    try {
        showLoadingState('suites');
        const response = await fetch(`/api/browser/suites/${projectId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const suites = await response.json();
        currentSuites = suites;
        displaySuites(suites);
        hideLoadingState('suites');
    } catch (error) {
        console.error('Error loading suites:', error);
        showError('Failed to load suites: ' + error.message);
        hideLoadingState('suites');
    }
}

function displaySuites(suites) {
    const suiteSelect = document.getElementById('browser-suite-select');
    const suitesList = document.getElementById('browser-suites-list');
    const suitesEmpty = document.getElementById('browser-suites-empty');
    
    if (!suiteSelect || !suitesList) return;

    // Clear existing options
    suiteSelect.innerHTML = '<option value="">Choose a suite...</option>';
    
    if (suites.length === 0) {
        suitesEmpty.style.display = 'block';
        suitesEmpty.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>No suites found in this project';
        suitesList.style.display = 'none';
        return;
    }

    // Add suites to select
    suites.forEach(suite => {
        const option = document.createElement('option');
        option.value = suite.id;
        option.textContent = suite.name;
        option.dataset.description = suite.description || '';
        suiteSelect.appendChild(option);
    });

    suitesEmpty.style.display = 'none';
    suitesList.style.display = 'block';
}

async function handleSuiteChange(event) {
    const suiteId = event.target.value;
    const selectedOption = event.target.selectedOptions[0];
    
    // Reset cases
    resetCases();
    
    if (!suiteId) {
        resetSuiteInfo();
        return;
    }

    // Update suite info
    updateSuiteInfo(selectedOption);

    try {
        showLoadingState('cases');
        
        // Load sections and cases for the selected suite
        const [sectionsResponse, casesResponse] = await Promise.all([
            fetch(`/api/browser/sections/${suiteId}`),
            fetch(`/api/browser/cases/${suiteId}`)
        ]);

        if (!sectionsResponse.ok || !casesResponse.ok) {
            throw new Error('Failed to load suite data');
        }

        const sections = await sectionsResponse.json();
        const cases = await casesResponse.json();
        
        currentSections = sections;
        currentCases = cases;
        
        displayCases(sections, cases);
        hideLoadingState('cases');
        
    } catch (error) {
        console.error('Error loading suite data:', error);
        showError('Failed to load suite data: ' + error.message);
        hideLoadingState('cases');
    }
}

function updateSuiteInfo(selectedOption) {
    const suiteInfo = document.getElementById('browser-suite-info');
    if (!suiteInfo) return;

    const suiteName = selectedOption.textContent;
    const suiteDescription = selectedOption.dataset.description;

    suiteInfo.innerHTML = `
        <div>
            <strong>${suiteName}</strong>
            ${suiteDescription ? `<p class="mt-2 mb-0 text-muted small">${suiteDescription}</p>` : ''}
        </div>
    `;
}

function displayCases(sections, cases) {
    const casesContent = document.getElementById('browser-cases-content');
    const casesEmpty = document.getElementById('browser-cases-empty');
    const casesCount = document.getElementById('browser-cases-count');
    const sectionsTree = document.getElementById('browser-sections-tree');
    const sectionFilter = document.getElementById('browser-section-filter');

    if (!casesContent || !sectionsTree) return;

    if (cases.length === 0) {
        casesEmpty.style.display = 'block';
        casesEmpty.innerHTML = `
            <i class="fas fa-clipboard-list fa-3x mb-3"></i>
            <p>No test cases found in this suite</p>
        `;
        casesContent.style.display = 'none';
        return;
    }

    // Update cases count
    if (casesCount) {
        casesCount.textContent = `${cases.length} case${cases.length !== 1 ? 's' : ''}`;
        casesCount.style.display = 'inline';
    }

    // Populate section filter
    populateSectionFilter(sections);

    // Group cases by section
    const casesBySection = groupCasesBySection(sections, cases);
    
    // Display sections and cases
    displaySectionsTree(casesBySection);

    casesEmpty.style.display = 'none';
    casesContent.style.display = 'block';
}

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
    
    // Initialize all sections (including those without cases)
    sections.forEach(section => {
        casesBySection[section.id] = {
            section: section,
            cases: []
        };
    });

    // Group cases by section
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

    // Show ALL sections, even those without cases
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
                <strong>${section.name}</strong>
                ${section.description ? `<small class="text-muted ms-2">${section.description}</small>` : ''}
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
        // Show message for sections without cases
        contentDiv.innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-info-circle me-2"></i>No test cases in this section</div>';
    } else {
        // Add cases to content
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

function createCaseElement(testCase) {
    const caseDiv = document.createElement('div');
    caseDiv.className = 'browser-case-item';
    caseDiv.dataset.caseId = testCase.id;
    
    caseDiv.innerHTML = `
        <div class="browser-case-title" data-searchable>${testCase.title}</div>
        <div class="browser-case-id">ID: ${testCase.id} <i class="fas fa-external-link-alt ms-1 text-muted"></i></div>
    `;
    
    // Click to open case in a new tab
    caseDiv.addEventListener('click', () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const newUrl = `${baseUrl}?case=${testCase.id}`;
        window.open(newUrl, '_blank');
    });
    
    // Add visual feedback on hover
    caseDiv.style.cursor = 'pointer';
    
    return caseDiv;
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const caseItems = document.querySelectorAll('.browser-case-item');
    const sections = document.querySelectorAll('.browser-section');
    
    if (!searchTerm) {
        // Show all cases and sections
        caseItems.forEach(item => item.style.display = 'block');
        sections.forEach(section => {
            section.style.display = 'block';
            const content = section.querySelector('.browser-section-content');
            if (content) content.style.display = 'block';
        });
        // Remove highlights
        document.querySelectorAll('.browser-search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.textContent = parent.textContent;
        });
        return;
    }
    
    sections.forEach(section => {
        let hasVisibleCases = false;
        const cases = section.querySelectorAll('.browser-case-item');
        
        cases.forEach(caseItem => {
            const titleElement = caseItem.querySelector('[data-searchable]');
            const title = titleElement.textContent.toLowerCase();
            const caseId = caseItem.dataset.caseId;
            
            if (title.includes(searchTerm) || caseId.includes(searchTerm)) {
                caseItem.style.display = 'block';
                hasVisibleCases = true;
                
                // Highlight search term
                highlightSearchTerm(titleElement, searchTerm);
            } else {
                caseItem.style.display = 'none';
            }
        });
        
        section.style.display = hasVisibleCases ? 'block' : 'none';
        if (hasVisibleCases) {
            const content = section.querySelector('.browser-section-content');
            if (content) content.style.display = 'block';
        }
    });
}

function handleSectionFilter(event) {
    const selectedSectionId = event.target.value;
    const sections = document.querySelectorAll('.browser-section');
    
    sections.forEach(section => {
        if (!selectedSectionId || section.dataset.sectionId === selectedSectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Clear search when filtering by section
    const searchInput = document.getElementById('browser-search');
    if (searchInput && selectedSectionId) {
        searchInput.value = '';
        // Remove any search highlights
        document.querySelectorAll('.browser-search-highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.textContent = parent.textContent;
        });
    }
}

function highlightSearchTerm(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = text.replace(regex, '<span class="browser-search-highlight">$1</span>');
    element.innerHTML = highlightedText;
}

function showLoadingState(type) {
    const loading = document.getElementById(`browser-loading-${type}`);
    const content = document.getElementById(`browser-${type}-list`) || 
                   document.getElementById(`browser-${type}-content`) ||
                   document.getElementById(`browser-${type}-empty`);
    
    if (loading) loading.style.display = 'block';
    if (content) content.style.display = 'none';
}

function hideLoadingState(type) {
    const loading = document.getElementById(`browser-loading-${type}`);
    if (loading) loading.style.display = 'none';
}

function resetSuites() {
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

function resetCases() {
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

// Handle tab activation
export function handleBrowserTabShow() {
    // Initialize only once
    if (currentProjects.length === 0) {
        initializeBrowser();
    }
}
