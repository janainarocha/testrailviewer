
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
