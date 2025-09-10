// Browser Utilities Module

// Debounce utility
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validation utilities
export function validateId(id) {
    return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
}

// Security utilities
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// URL utilities
export function createTestCaseURL(caseId) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?case=${encodeURIComponent(caseId)}`;
}

// Search utilities
export function clearSearchHighlights() {
    document.querySelectorAll('.browser-search-highlight').forEach(highlight => {
        const parent = highlight.parentNode;
        if (parent) {
            parent.textContent = parent.textContent;
        }
    });
}

export function highlightSearchTerm(element, searchTerm) {
    const text = element.textContent;
    const escapedTerm = escapeRegex(searchTerm);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const highlightedText = sanitizeHTML(text).replace(regex, '<span class="browser-search-highlight">$1</span>');
    element.innerHTML = highlightedText;
}

// DOM utilities
export function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

export function removeElementEventListeners(elementId) {
    const element = getElementById(elementId);
    if (element) {
        element.replaceWith(element.cloneNode(true));
    }
}
