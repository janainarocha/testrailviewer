
const testrail = require('../services/testrailService');
const config = require('../config');

exports.getCase = async (req, res, next) => {
    const caseId = req.params.id;
    try {
        const data = await testrail.getCase(caseId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getReports = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getReports(projectId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.runReport = async (req, res, next) => {
    const reportId = req.params.reportId;
    try {
        const data = await testrail.runReport(reportId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.getSuites = async (req, res, next) => {
    const projectId = req.params.projectId;
    try {
        const data = await testrail.getSuites(projectId);
        res.json(data);
    } catch (error) {
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
