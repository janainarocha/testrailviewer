// backend.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(cors());
const PORT = 3000;

app.get('/api/case/:id', async (req, res) => {
    const caseId = req.params.id;
    const TESTRAIL_URL = 'https://fugroroadware.testrail.com';
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;

    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_case/${caseId}`;
    const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});