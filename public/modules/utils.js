export function escapeHtml(text) {
	if (!text) return '';
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

export function formatContent(content) {
	if (!content) return '<div class="empty-content">Not specified</div>';
	let safe = escapeHtml(content);
	// Bold: **text**
	safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	// Italic: *text* (not inside **)
	safe = safe.replace(/(^|\s)\*(?!\*)([^*]+)\*(?=\s|$)/g, '$1<em>$2</em>');
	// Inline code: `text`
	safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
	// Line breaks
	safe = safe.replace(/\n/g, '<br>');
	// Image links (TestRail attachments)
	safe = safe.replace(/!\[([^\]]*)\]\((index\.php\?\/attachments\/get\/[^)]+)\)/gi, function(match, alt, relUrl) {
		const baseUrl = 'https://fugroroadware.testrail.com';
		relUrl = relUrl.replace(/^\/+/, '');
		const fullUrl = `${baseUrl}/${relUrl}`;
		return `<a href="${fullUrl}" target="_blank">${alt ? alt : 'View Image'}</a>`;
	});
	return safe;
}

function renderStepItem(step, index) {
	return `
		<div class="step-item">
			<div class="d-flex align-items-start">
				${typeof index === 'number' ? `<span class="step-number">${index + 1}</span>` : ''}
				<div class="step-content flex-grow-1">
					<div class="mb-2">
						<strong>${step.title || 'Action'}:</strong><br>
						${formatContent(step.content || 'Not specified')}
					</div>
					${step.expected ? `
						<div>
							<strong>Expected result:</strong><br>
							${formatContent(step.expected)}
						</div>
					` : ''}
				</div>
			</div>
		</div>
	`;
}

export function formatSteps(steps, stepsSeparated) {
	let html = '';
	if (steps && typeof steps === 'string') {
		html += renderStepItem({ content: steps, title: 'Steps' });
	}
	if (stepsSeparated && Array.isArray(stepsSeparated) && stepsSeparated.length > 0) {
		stepsSeparated.forEach((step, index) => {
			html += renderStepItem(step, index);
		});
	} else if (!steps) {
		html += '<div class="empty-content">No steps defined</div>';
	}
	return html;
}
// Utility/helper functions for TestRail Viewer
export function formatDate(timestamp) {
	if (!timestamp) return 'N/A';
	// Accept seconds or milliseconds
	let ts = Number(timestamp);
	if (ts < 10000000000) ts *= 1000; // If in seconds, convert to ms
	const date = new Date(ts);
	return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
}

export function getUrlParameter(name, url) {
	let search = '';
	if (url) {
		const u = new URL(url, window.location.origin);
		search = u.search;
	} else {
		search = window.location.search;
	}
	const urlParams = new URLSearchParams(search);
	return urlParams.get(name);
}
