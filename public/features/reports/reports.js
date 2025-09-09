import { loadFixedReports, runReport } from '../../modules/api.js';
import { showReportsLoading, hideReportsLoading, showReportsError, showReportsList } from '../../modules/ui.js';
import { escapeHtml } from '../../modules/utils.js';

// --- Reports Tab Logic ---
let currentReports = [];
export async function handleLoadReports() {
    showReportsLoading();
    try {
        const reports = await loadFixedReports();
        currentReports = reports;
        displayReports(reports);
        showReportsList();
    } catch (error) {
        showReportsError(error.message || 'Failed to load fixed reports');
    }
}

export function displayReports(reports) {
    const container = document.getElementById('reports-content');
    if (!reports || reports.length === 0) {
        container.innerHTML = `<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No fixed reports available.</div>`;
        return;
    }
    function getProjectBadge(projectName) {
        const badges = {
            Ivision: '<span class="badge bg-primary">Ivision</span>',
            Fastlane: '<span class="badge bg-info">Fastlane</span>'
        };
        return badges[projectName] || '';
    }

    const reportsHtml = reports.map(report => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title">${escapeHtml(report.name || 'Unnamed Report')}</h6>
                        <p class="card-text text-muted small mb-2">
                            <strong>Report ID:</strong> ${report.id}<br><strong>Project:</strong> ${escapeHtml(report.project_name || 'Unknown')} (ID: ${report.project_id || 'N/A'})
                        </p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            <span class="badge bg-success">Fixed Report</span>
                            ${getProjectBadge(report.project_name)}
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <button class="btn btn-primary btn-sm" data-report-id="${report.id}" data-report-name="${escapeHtml(report.name)}">
                            <i class="fas fa-play me-1"></i>Run Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    container.innerHTML = reportsHtml;
    // Attach event listeners for run buttons
    container.querySelectorAll('button[data-report-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await handleRunReport(btn.dataset.reportId, btn.dataset.reportName);
        });
    });
}

export async function handleRunReport(reportId, reportName) {
    showReportsLoading();
    try {
        const result = await runReport(reportId);
        displayReportResults(result, reportName);
    } catch (error) {
        showReportsError(error.message || 'Failed to run report');
    }
}

export function displayReportResults(result, reportName) {
    hideReportsLoading();
    const reportTitle = document.getElementById('report-title');
    if (reportTitle) reportTitle.textContent = reportName;
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
        let buttonsHtml = '<div class="d-flex gap-2 flex-wrap mb-3">';
        if (result.report_url) {
            buttonsHtml += `<a href="${result.report_url}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt me-1"></i>See on TestRail</a>`;
        }
        if (result.report_html) {
            buttonsHtml += `<a href="${result.report_html}" target="_blank" class="btn btn-success"><i class="fas fa-download me-1"></i>Download HTML</a>`;
        }
        if (result.report_pdf) {
            buttonsHtml += `<a href="${result.report_pdf}" target="_blank" class="btn btn-danger"><i class="fas fa-file-pdf me-1"></i>Download PDF</a>`;
        }
        buttonsHtml += '</div>';
        if (!result.report_url && !result.report_html && !result.report_pdf) {
            buttonsHtml = '<div class="alert alert-warning">No report URLs available</div>';
        }
        reportContent.innerHTML = buttonsHtml;
    }
    const reportResults = document.getElementById('report-results');
    if (reportResults) {
        reportResults.classList.remove('d-none');
        reportResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}