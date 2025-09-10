
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
        res.json(data);
    } catch (error) {
        console.error('[ERROR] GET /api/browser/projects -', error.message, error.stack);
        next(error);
    }
};

exports.getBrowserSuites = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getBrowserSuites(projectId);
        res.json(data);
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
