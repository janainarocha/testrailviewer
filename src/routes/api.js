
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { validateIdParam, validateProjectAndSuite } = require('../middlewares/validators');

// GET /api/case/:id
router.get('/case/:id', validateIdParam('id'), reportController.getCase);

// GET /api/reports/:projectId
router.get('/reports/:projectId', validateIdParam('projectId'), reportController.getReports);

// GET /api/report/run/:reportId
router.get('/report/run/:reportId', validateIdParam('reportId'), reportController.runReport);

// GET /api/suites/:projectId
router.get('/suites/:projectId', validateIdParam('projectId'), reportController.getSuites);

// GET /api/cases/:projectId/:suiteId
router.get('/cases/:projectId/:suiteId', validateProjectAndSuite, reportController.getCases);

// GET /api/fixed-reports - Returns fixed reports for Ivision and Fastlane
router.get('/fixed-reports', reportController.getFixedReports);

// Browser routes for local database
router.get('/browser/projects', reportController.getBrowserProjects);
router.get('/browser/suites/:projectId', validateIdParam('projectId'), reportController.getBrowserSuites);
router.get('/browser/sections/:suiteId', validateIdParam('suiteId'), reportController.getBrowserSections);
router.get('/browser/cases/:suiteId', validateIdParam('suiteId'), reportController.getBrowserCases);

// Dashboard routes
router.get('/dashboard/automation-coverage/:projectId', validateIdParam('projectId'), reportController.getAutomationCoverage);
router.get('/dashboard/monthly-trend/:projectId', validateIdParam('projectId'), reportController.getMonthlyTrend);
router.get('/dashboard/github-stats/:owner/:repo', reportController.getGitHubStats);
router.get('/dashboard/epic-progress/:epicKey', reportController.getEpicProgress);

// Monthly automation report routes
router.get('/dashboard/automation-history', reportController.getMonthlyAutomationHistory);
router.get('/dashboard/epic-history', reportController.getMonthlyEpicHistory);
router.get('/dashboard/execution-logs', reportController.getExecutionLogs);
router.get('/dashboard/current-automation-stats', reportController.getCurrentAutomationStats);
router.post('/dashboard/trigger-monthly-report', reportController.triggerMonthlyReport);

module.exports = router;
