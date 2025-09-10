// Browser Search and Filter Module - Handles search and filtering functionality

import { sanitizeHTML, debounce } from './browserUtils.js';
import { createCaseElement } from './browserUI.js';

// Search and filter state
let currentFilter = '';
let currentSearch = '';

// Debounced search function
const debouncedSearch = debounce((searchTerm, sectionFilter) => {
    performSearch(searchTerm, sectionFilter);
}, 300);

export function setupSearchAndFilter() {
    const searchInput = document.getElementById('browser-search');
    const sectionFilter = document.getElementById('browser-section-filter');
    const clearSearch = document.getElementById('browser-clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            currentSearch = searchTerm;
            
            // Show/hide clear button
            if (clearSearch) {
                clearSearch.style.display = searchTerm ? 'block' : 'none';
            }
            
            debouncedSearch(searchTerm, currentFilter);
        });
    }

    if (sectionFilter) {
        sectionFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            performSearch(currentSearch, currentFilter);
        });
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            currentSearch = '';
            clearSearch.style.display = 'none';
            performSearch('', currentFilter);
        });
    }
}

function performSearch(searchTerm, sectionFilter) {
    const sectionsTree = document.getElementById('browser-sections-tree');
    if (!sectionsTree) return;

    const sections = sectionsTree.querySelectorAll('.browser-section');
    let visibleCasesCount = 0;
    let visibleSectionsCount = 0;

    sections.forEach(section => {
        const sectionId = section.dataset.sectionId;
        const caseItems = section.querySelectorAll('.browser-case-item');
        let sectionHasVisibleCases = false;

        // Check if section should be visible based on filter
        const shouldShowSection = !sectionFilter || sectionFilter === sectionId;

        if (!shouldShowSection) {
            section.style.display = 'none';
            return;
        }

        caseItems.forEach(caseItem => {
            const caseTitle = caseItem.querySelector('[data-searchable]');
            const titleText = caseTitle ? caseTitle.textContent.toLowerCase() : '';
            
            const matchesSearch = !searchTerm || titleText.includes(searchTerm.toLowerCase());

            if (matchesSearch) {
                caseItem.style.display = 'block';
                sectionHasVisibleCases = true;
                visibleCasesCount++;
                
                // Highlight search terms or remove highlight if no search
                if (caseTitle) {
                    highlightSearchTerm(caseTitle, searchTerm);
                }
            } else {
                caseItem.style.display = 'none';
                
                // Still need to remove highlight from hidden items
                if (caseTitle) {
                    highlightSearchTerm(caseTitle, '');
                }
            }
        });

        // Show/hide section based on whether it has visible cases
        if (sectionHasVisibleCases) {
            section.style.display = 'block';
            visibleSectionsCount++;
            
            // Auto-expand section if searching
            if (searchTerm) {
                const content = section.querySelector('.browser-section-content');
                const header = section.querySelector('.browser-section-header');
                if (content && header) {
                    content.style.display = 'block';
                    header.classList.remove('collapsed');
                    
                    const chevron = header.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (chevron) {
                        chevron.className = 'fas fa-chevron-up ms-2';
                    }
                }
            }
        } else {
            section.style.display = 'none';
        }
    });

    updateSearchResults(searchTerm, sectionFilter, visibleCasesCount, visibleSectionsCount);
}

function highlightSearchTerm(element, searchTerm) {
    const originalText = element.dataset.originalText || element.textContent;
    
    // Store original text if not already stored
    if (!element.dataset.originalText) {
        element.dataset.originalText = originalText;
    }

    if (!searchTerm) {
        element.innerHTML = sanitizeHTML(originalText);
        return;
    }

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
    element.innerHTML = highlightedText;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateSearchResults(searchTerm, sectionFilter, visibleCasesCount, visibleSectionsCount) {
    const resultsInfo = document.getElementById('browser-search-results');
    if (!resultsInfo) return;

    let message = '';

    if (searchTerm || sectionFilter) {
        const searchText = searchTerm ? `"${sanitizeHTML(searchTerm)}"` : '';
        const filterText = sectionFilter ? getSectionFilterName(sectionFilter) : '';
        
        let criteria = [];
        if (searchText) criteria.push(`search: ${searchText}`);
        if (filterText) criteria.push(`section: ${filterText}`);
        
        message = `
            <div class="search-results-info">
                <i class="fas fa-search me-2"></i>
                Found ${visibleCasesCount} case${visibleCasesCount !== 1 ? 's' : ''} 
                in ${visibleSectionsCount} section${visibleSectionsCount !== 1 ? 's' : ''}
                ${criteria.length > 0 ? `(${criteria.join(', ')})` : ''}
                ${(searchTerm || sectionFilter) ? `
                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="clearAllFilters()">
                        <i class="fas fa-times me-1"></i>Clear filters
                    </button>
                ` : ''}
            </div>
        `;
    }

    resultsInfo.innerHTML = message;
}

function getSectionFilterName(sectionId) {
    const sectionFilter = document.getElementById('browser-section-filter');
    if (!sectionFilter) return '';
    
    const selectedOption = sectionFilter.querySelector(`option[value="${sectionId}"]`);
    return selectedOption ? selectedOption.textContent : '';
}

// Global function for clear filters button
window.clearAllFilters = function() {
    const searchInput = document.getElementById('browser-search');
    const sectionFilter = document.getElementById('browser-section-filter');
    const clearSearch = document.getElementById('browser-clear-search');

    if (searchInput) {
        searchInput.value = '';
    }
    
    if (sectionFilter) {
        sectionFilter.value = '';
    }
    
    if (clearSearch) {
        clearSearch.style.display = 'none';
    }

    currentSearch = '';
    currentFilter = '';
    
    // Clear highlights and reset visibility
    clearHighlights();
    performSearch('', '');
};

function clearHighlights() {
    const sectionsTree = document.getElementById('browser-sections-tree');
    if (sectionsTree) {
        const searchableElements = sectionsTree.querySelectorAll('[data-searchable][data-original-text]');
        searchableElements.forEach(element => {
            if (element.dataset.originalText) {
                element.innerHTML = sanitizeHTML(element.dataset.originalText);
            }
        });
    }
}

export function resetSearchAndFilter() {
    const searchInput = document.getElementById('browser-search');
    const sectionFilter = document.getElementById('browser-section-filter');
    const clearSearch = document.getElementById('browser-clear-search');
    const resultsInfo = document.getElementById('browser-search-results');

    if (searchInput) searchInput.value = '';
    if (sectionFilter) sectionFilter.value = '';
    if (clearSearch) clearSearch.style.display = 'none';
    if (resultsInfo) resultsInfo.innerHTML = '';

    currentSearch = '';
    currentFilter = '';

    // Clear all highlights
    clearHighlights();
    
    // Reset all sections and cases to visible
    const sectionsTree = document.getElementById('browser-sections-tree');
    if (sectionsTree) {
        const sections = sectionsTree.querySelectorAll('.browser-section');
        sections.forEach(section => {
            section.style.display = 'block';
            const caseItems = section.querySelectorAll('.browser-case-item');
            caseItems.forEach(caseItem => {
                caseItem.style.display = 'block';
            });
        });
    }
}

// Advanced search functionality
export function setupAdvancedSearch() {
    const advancedToggle = document.getElementById('browser-advanced-search-toggle');
    const advancedPanel = document.getElementById('browser-advanced-search-panel');

    if (advancedToggle && advancedPanel) {
        advancedToggle.addEventListener('click', () => {
            const isHidden = advancedPanel.style.display === 'none';
            advancedPanel.style.display = isHidden ? 'block' : 'none';
            
            const icon = advancedToggle.querySelector('i');
            if (icon) {
                icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        });
    }
}

// Export current state for other modules
export function getCurrentSearchState() {
    return {
        search: currentSearch,
        filter: currentFilter
    };
}
