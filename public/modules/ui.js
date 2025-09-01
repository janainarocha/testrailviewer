
import { formatContent } from './utils.js';
import { CONFIG } from './state.js';

// Helper functions for showing/hiding elements
function showElement(id) {
	const el = document.getElementById(id);
	if (el) el.classList.remove('d-none');
}
function hideElement(id) {
	const el = document.getElementById(id);
	if (el) el.classList.add('d-none');
}

export function formatCustomFields(testCase) {
	const customFieldsDiv = document.getElementById('custom-fields');
	const customFieldsContent = document.getElementById('custom-fields-content');
	const fieldsHtml = Object.entries(testCase)
		.filter(([key, value]) => key.startsWith('custom_') && !CONFIG.SKIP_CUSTOM_FIELDS.has(key) && value !== null && value !== '')
		.map(([key, value]) => {
			let label = CONFIG.CUSTOM_FIELDS[key] || key.replace('custom_', '').replace(/_/g, ' ');
			if (CONFIG.CUSTOM_ENUMS[key]) {
				value = CONFIG.CUSTOM_ENUMS[key][value] || value;
			}
			return `<div class="custom-field"><div class="custom-field-label">${label}</div><div class="custom-field-value">${formatContent(String(value))}</div></div>`;
		});
	if (fieldsHtml.length > 0) {
		customFieldsContent.innerHTML = fieldsHtml.join('');
		customFieldsDiv.classList.remove('d-none');
	} else {
		customFieldsDiv.classList.add('d-none');
	}
}
// UI rendering and DOM manipulation for TestRail Viewer
export function showLoading() {
	showElement('loading');
	hideElement('error');
	hideElement('test-case');
}

export function hideLoading() {
	hideElement('loading');
}

export function showError(message) {
	hideLoading();
	const errorMsg = document.getElementById('error-message');
	if (errorMsg) errorMsg.textContent = message;
	showElement('error');
	hideElement('test-case');
}

export function showTestCase() {
	hideLoading();
	hideElement('error');
	showElement('test-case');
}

export function showReportsLoading() {
	showElement('reports-loading');
	hideElement('reports-error');
	hideElement('reports-list');
	hideElement('report-results');
}

export function hideReportsLoading() {
	hideElement('reports-loading');
}

export function showReportsError(message) {
	hideReportsLoading();
	const errorMsg = document.getElementById('reports-error-message');
	if (errorMsg) errorMsg.textContent = message;
	showElement('reports-error');
	hideElement('reports-list');
}

export function showReportsList() {
	hideReportsLoading();
	hideElement('reports-error');
	showElement('reports-list');
}

export function hideReportResults() {
	hideElement('report-results');
	showElement('reports-list');
}
