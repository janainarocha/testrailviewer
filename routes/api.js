const express = require('express');
const router = express.Router();
const testrail = require('../services/testrailService');

// GET /api/case/:id
router.get('/case/:id', async (req, res) => {
    const caseId = req.params.id;
    if (!caseId || !/^\d+$/.test(caseId)) {
        return res.status(400).json({ error: 'Invalid case ID.' });
    }
    try {
        const data = await testrail.getCase(caseId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TestRail API error', details: error.message });
    }
});

// GET /api/reports/:projectId
router.get('/reports/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    if (!projectId || !/^\d+$/.test(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
    }
    try {
        const data = await testrail.getReports(projectId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TestRail API error', details: error.message });
    }
});

// GET /api/report/run/:reportId
router.get('/report/run/:reportId', async (req, res) => {
    const reportId = req.params.reportId;
    if (!reportId || !/^\d+$/.test(reportId)) {
        return res.status(400).json({ error: 'Invalid report ID.' });
    }
    try {
        const data = await testrail.runReport(reportId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TestRail API error', details: error.message });
    }
});

// GET /api/suites/:projectId
router.get('/suites/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    if (!projectId || !/^\d+$/.test(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID.' });
    }
    try {
        const data = await testrail.getSuites(projectId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TestRail API error', details: error.message });
    }
});

// GET /api/cases/:projectId/:suiteId
router.get('/cases/:projectId/:suiteId', async (req, res) => {
    const { projectId, suiteId } = req.params;
    if (!projectId || !/^\d+$/.test(projectId) || !suiteId || !/^\d+$/.test(suiteId)) {
        return res.status(400).json({ error: 'Invalid project ID or suite ID.' });
    }
    try {
        const data = await testrail.getCases(projectId, suiteId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'TestRail API error', details: error.message });
    }
});

// GET /api/fixed-reports - Returns fixed reports for Ivision and Fastlane
router.get('/fixed-reports', async (req, res) => {
    try {
        const fixedReports = [
            {
                id: 3, // Ivision Automated Report ID
                name: 'Ivision Automated Report',
                project_id: 19,
                project_name: 'Ivision'
            },
            {
                id: 4, // Fastlane Automated Report ID
                name: 'Fastlane Automated Report', 
                project_id: 21,
                project_name: 'Fastlane'
            }
        ];
        res.json(fixedReports);
    } catch (error) {
        res.status(500).json({ error: 'Error loading fixed reports', details: error.message });
    }
});

module.exports = router;
