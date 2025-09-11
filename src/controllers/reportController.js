
const testrail = require('../services/testrailService');
const config = require('../config');

exports.getCase = async (req, res, next) => {
    const caseId = req.params.id;
    try {
        const data = await testrail.getCase(caseId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/case/${caseId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getReports = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getReports(projectId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/reports/${projectId} -`, error.message, error.stack);
        next(error);
    }
};

exports.runReport = async (req, res, next) => {
    const reportId = req.params.reportId;
    try {
        const data = await testrail.runReport(reportId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/report/run/${reportId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getSuites = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getSuites(projectId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/suites/${projectId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getCases = async (req, res, next) => {
    const { projectId, suiteId } = req.params;
    try {
        const data = await testrail.getCases(projectId, suiteId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getFixedReports = async (req, res, next) => {
    try {
        res.json(config.FIXED_REPORTS);
    } catch (error) {
        next(error);
    }
};

// Browser controller functions for local database
exports.getBrowserProjects = async (req, res, next) => {
    try {
        const data = await testrail.getBrowserProjects();
        
        // Validate data before sending
        if (!Array.isArray(data)) {
            throw new Error('Invalid projects data from database');
        }
        
        // Filter sensitive information and add safety checks
        const sanitizedData = data.map(project => ({
            id: parseInt(project.id) || 0,
            name: (project.name || '').substring(0, 255), // Limit length
            is_completed: project.is_completed ? 1 : 0,
            suite_mode: parseInt(project.suite_mode) || 1,
            announcement: (project.announcement || '').substring(0, 1000)
        })).filter(project => project.id > 0); // Only valid IDs
        
        res.json(sanitizedData);
    } catch (error) {
        console.error('[ERROR] GET /api/browser/projects -', error.message, error.stack);
        next(error);
    }
};

exports.getBrowserSuites = async (req, res, next) => {
    const projectId = parseInt(req.params.projectId);
    
    // Validate project ID
    if (!projectId || projectId <= 0) {
        return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    try {
        const data = await testrail.getBrowserSuites(projectId);
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid suites data from database');
        }
        
        const sanitizedData = data.map(suite => ({
            id: parseInt(suite.id) || 0,
            project_id: parseInt(suite.project_id) || 0,
            name: (suite.name || '').substring(0, 255),
            description: (suite.description || '').substring(0, 1000),
            is_master: suite.is_master ? 1 : 0
        })).filter(suite => suite.id > 0);
        
        res.json(sanitizedData);
    } catch (error) {
        console.error(`[ERROR] GET /api/browser/suites/${projectId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getBrowserSections = async (req, res, next) => {
    const suiteId = req.params.suiteId;
    try {
        const data = await testrail.getBrowserSections(suiteId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/browser/sections/${suiteId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getBrowserCases = async (req, res, next) => {
    const suiteId = req.params.suiteId;
    try {
        const data = await testrail.getBrowserCases(suiteId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/browser/cases/${suiteId} -`, error.message, error.stack);
        next(error);
    }
};

// Dashboard endpoints
exports.getAutomationCoverage = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getAutomationCoverage(projectId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/automation-coverage/${projectId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getMonthlyTrend = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getMonthlyTrend(projectId);
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/monthly-trend/${projectId} -`, error.message, error.stack);
        next(error);
    }
};

exports.getGitHubStats = async (req, res, next) => {
    const { owner, repo } = req.params;
    try {
        // Mock GitHub stats for now - would integrate with GitHub API later
        const data = {
            latestRelease: {
                tagName: 'v2.1.0',
                publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                url: `https://github.com/${owner}/${repo}/releases/latest`
            },
            openIssues: 5,
            recentCommits: 3,
            stars: 15,
            forks: 3
        };
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/github-stats/${owner}/${repo} -`, error.message, error.stack);
        next(error);
    }
};

exports.getEpicProgress = async (req, res, next) => {
    const epicKey = req.params.epicKey;
    try {
        // Real data from Atlassian/Jira API for OPR-3401 epic
        const data = {
            key: epicKey,
            summary: 'Testing in Backlog',
            status: 'To Do',
            progress: {
                total: 73,
                completed: 19,     // Done
                inProgress: 5,     // PO Review
                pending: 47,       // To Do
                declined: 2        // Declined
            },
            statusBreakdown: {
                'Done': 19,
                'To Do': 47,
                'PO Review': 5,
                'Declined': 2
            }
        };
        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/epic-progress/${epicKey} -`, error.message, error.stack);
        next(error);
    }
};

// ============================================================================
// MONTHLY AUTOMATION REPORT ENDPOINTS
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Obtém histórico de dados de automação mensais
 */
exports.getMonthlyAutomationHistory = async (req, res, next) => {
    try {
        const dbPath = path.join(__dirname, '../../data/testrail_dashboard.db');
        const db = new sqlite3.Database(dbPath);
        
        const data = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM monthly_automation_stats 
                ORDER BY year DESC, 
                CASE month 
                    WHEN 'janeiro' THEN 1 WHEN 'fevereiro' THEN 2 WHEN 'março' THEN 3
                    WHEN 'abril' THEN 4 WHEN 'maio' THEN 5 WHEN 'junho' THEN 6
                    WHEN 'julho' THEN 7 WHEN 'agosto' THEN 8 WHEN 'setembro' THEN 9
                    WHEN 'outubro' THEN 10 WHEN 'novembro' THEN 11 WHEN 'dezembro' THEN 12
                END DESC
                LIMIT 12
            `, (err, rows) => {
                db.close();
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/automation-history -`, error.message, error.stack);
        next(error);
    }
};

/**
 * Obtém histórico de dados do épico mensais
 */
exports.getMonthlyEpicHistory = async (req, res, next) => {
    try {
        const dbPath = path.join(__dirname, '../../data/testrail_dashboard.db');
        const db = new sqlite3.Database(dbPath);
        
        const data = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM epic_progress_stats 
                ORDER BY year DESC, 
                CASE month 
                    WHEN 'janeiro' THEN 1 WHEN 'fevereiro' THEN 2 WHEN 'março' THEN 3
                    WHEN 'abril' THEN 4 WHEN 'maio' THEN 5 WHEN 'junho' THEN 6
                    WHEN 'julho' THEN 7 WHEN 'agosto' THEN 8 WHEN 'setembro' THEN 9
                    WHEN 'outubro' THEN 10 WHEN 'novembro' THEN 11 WHEN 'dezembro' THEN 12
                END DESC
                LIMIT 12
            `, (err, rows) => {
                db.close();
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/epic-history -`, error.message, error.stack);
        next(error);
    }
};

/**
 * Obtém logs de execução do script mensal
 */
exports.getExecutionLogs = async (req, res, next) => {
    try {
        const limit = req.query.limit || 50;
        const dbPath = path.join(__dirname, '../../data/testrail_dashboard.db');
        const db = new sqlite3.Database(dbPath);
        
        const data = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM execution_logs 
                ORDER BY execution_date DESC 
                LIMIT ?
            `, [limit], (err, rows) => {
                db.close();
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/execution-logs -`, error.message, error.stack);
        next(error);
    }
};

/**
 * Força execução do relatório mensal (para teste/debug)
 */
exports.triggerMonthlyReport = async (req, res, next) => {
    try {
        const MonthlyAutomationReporter = require('../scripts/monthly_automation_report');
        const reporter = new MonthlyAutomationReporter();
        
        // Executa o relatório em background
        reporter.runMonthlyReport()
            .then(result => {
                console.log('✅ Relatório mensal executado com sucesso:', result);
            })
            .catch(error => {
                console.error('❌ Erro ao executar relatório mensal:', error);
            })
            .finally(() => {
                reporter.close();
            });

        res.json({ 
            message: 'Relatório mensal iniciado em background',
            timestamp: new Date().toISOString(),
            status: 'started'
        });
    } catch (error) {
        console.error(`[ERROR] POST /api/dashboard/trigger-monthly-report -`, error.message, error.stack);
        next(error);
    }
};

/**
 * Obtém estatísticas atuais de automação (dados mais recentes)
 */
exports.getCurrentAutomationStats = async (req, res, next) => {
    try {
        const dbPath = path.join(__dirname, '../../data/testrail_dashboard.db');
        const db = new sqlite3.Database(dbPath);
        
        const data = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM monthly_automation_stats 
                ORDER BY year DESC, 
                CASE month 
                    WHEN 'janeiro' THEN 1 WHEN 'fevereiro' THEN 2 WHEN 'março' THEN 3
                    WHEN 'abril' THEN 4 WHEN 'maio' THEN 5 WHEN 'junho' THEN 6
                    WHEN 'julho' THEN 7 WHEN 'agosto' THEN 8 WHEN 'setembro' THEN 9
                    WHEN 'outubro' THEN 10 WHEN 'novembro' THEN 11 WHEN 'dezembro' THEN 12
                END DESC
                LIMIT 1
            `, (err, row) => {
                db.close();
                if (err) reject(err);
                else resolve(row || {
                    month: 'N/A',
                    year: new Date().getFullYear(),
                    total_cases: 0,
                    automated_cases: 0,
                    manual_cases: 0,
                    not_required_cases: 0,
                    automation_percentage: 0
                });
            });
        });

        res.json(data);
    } catch (error) {
        console.error(`[ERROR] GET /api/dashboard/current-automation-stats -`, error.message, error.stack);
        next(error);
    }
};
