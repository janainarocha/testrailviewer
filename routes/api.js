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

module.exports = router;
