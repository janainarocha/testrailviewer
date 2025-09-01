
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

module.exports = router;
