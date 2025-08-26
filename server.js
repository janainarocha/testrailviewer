// backend.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configure CORS with more specific settings
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] // Add your production domain here
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Run a specific report
app.get('/api/report/run/:reportId', async (req, res) => {
    const reportId = req.params.reportId;
    if (!reportId || !/^[0-9]+$/.test(reportId)) {
        console.error(`Invalid report ID provided: ${reportId}`);
        return res.status(400).json({ error: 'Invalid report ID. Must be a numeric value.' });
    }
    const TESTRAIL_URL = process.env.TESTRAIL_URL || 'https://your-company.testrail.com';
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;
    if (!API_USER || !API_KEY) {
        console.error('Missing TestRail credentials in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    const url = `${TESTRAIL_URL}/index.php?/api/v2/run_report/${reportId}`;
    const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');
    try {
        console.log(`Running report ${reportId} from TestRail...`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });
        console.log(response)
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TestRail API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: 'TestRail API error', details: errorText });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error running report ${reportId}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get available reports for a project

app.get('/api/reports/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    if (!projectId || !/^[0-9]+$/.test(projectId)) {
        console.error(`Invalid project ID provided: ${projectId}`);
        return res.status(400).json({ error: 'Invalid project ID. Must be a numeric value.' });
    }
    const TESTRAIL_URL = process.env.TESTRAIL_URL || 'https://your-company.testrail.com';
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;
    if (!API_USER || !API_KEY) {
        console.error('Missing TestRail credentials in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_reports/${projectId}`;
    const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');
    try {
        console.log(`Fetching reports for project ${projectId} from TestRail...`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TestRail API error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: 'TestRail API error', details: errorText });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching reports for project ${projectId}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Health check endpoint

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/case/:id', async (req, res) => {
    const caseId = req.params.id;
    
    // Validate case ID
    if (!caseId || !/^\d+$/.test(caseId)) {
        console.error(`Invalid case ID provided: ${caseId}`);
        return res.status(400).json({ error: 'Invalid case ID. Must be a numeric value.' });
    }
    
    // Check environment variables
    const TESTRAIL_URL = process.env.TESTRAIL_URL || 'https://your-company.testrail.com';
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;
    
    if (!API_USER || !API_KEY) {
        console.error('Missing TestRail credentials in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const url = `${TESTRAIL_URL}/index.php?/api/v2/get_case/${caseId}`;
    const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');

    try {
        console.log(`Fetching case ${caseId} from TestRail...`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TestRail API error: ${response.status} - ${errorText}`);
            if (response.status === 401) {
                return res.status(401).json({ error: 'Invalid TestRail credentials' });
            } else if (response.status === 404) {
                return res.status(404).json({ error: 'Test case not found' });
            } else {
                return res.status(response.status).json({ error: 'TestRail API error' });
            }
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching case ${caseId}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files from public directory
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));

// Fallback: serve index.html for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public/index.html');
    res.sendFile(indexPath);
});

app.get('/api/test-download-pdf', async (req, res) => {
    const pdfUrl = req.query.url;
    const API_USER = process.env.TESTRAIL_API_USER;
    const API_KEY = process.env.TESTRAIL_API_KEY;
    const TESTRAIL_URL = process.env.TESTRAIL_URL;

    if (!pdfUrl) {
        return res.status(400).json({ error: 'PDF URL is required' });
    }
    
    try {
        console.log(`Tentando baixar PDF de: ${pdfUrl}`);
        
        // Primeira tentativa: autenticação via API usando Basic Auth
        const response = await fetch(pdfUrl, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${API_USER}:${API_KEY}`).toString('base64'),
                'User-Agent': 'TestRail-API-Client'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
            // É um PDF válido
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync('downloaded.pdf', buffer);
            
            res.json({ 
                message: 'PDF salvo como downloaded.pdf', 
                contentType,
                size: buffer.length,
                status: response.status,
                success: true
            });
        } else {
            // Não é um PDF, vamos tentar uma abordagem diferente
            console.log('PDF direto não funcionou, tentando via login web...');
            
            // Tentar fazer login web primeiro
            const loginUrl = `${TESTRAIL_URL}/index.php?/auth/login`;
            const loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: `name=${encodeURIComponent(API_USER)}&password=${encodeURIComponent(API_KEY)}&rememberme=1`,
                redirect: 'manual'
            });
            
            // Extrair cookies de sessão
            const cookies = loginResponse.headers.get('set-cookie');
            console.log('Login cookies:', cookies);
            
            if (cookies) {
                // Tentar baixar PDF com cookies de sessão
                const pdfWithSessionResponse = await fetch(pdfUrl, {
                    headers: {
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const sessionContentType = pdfWithSessionResponse.headers.get('content-type');
                console.log('PDF com sessão - Content-Type:', sessionContentType);
                
                if (sessionContentType && sessionContentType.includes('application/pdf')) {
                    const arrayBuffer = await pdfWithSessionResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync('downloaded.pdf', buffer);
                    
                    res.json({ 
                        message: 'PDF salvo via sessão web', 
                        contentType: sessionContentType,
                        size: buffer.length,
                        status: pdfWithSessionResponse.status,
                        success: true,
                        method: 'web-session'
                    });
                } else {
                    const htmlContent = await response.text();
                    res.json({ 
                        message: 'TestRail requer autenticação web para PDFs', 
                        contentType,
                        status: response.status,
                        success: false,
                        htmlPreview: htmlContent.substring(0, 500) + '...',
                        recommendation: 'A API key não tem permissão para baixar PDFs diretamente. É necessário usar a interface web.'
                    });
                }
            } else {
                const htmlContent = await response.text();
                res.json({ 
                    message: 'Falha no login web', 
                    contentType,
                    status: response.status,
                    success: false,
                    htmlPreview: htmlContent.substring(0, 500) + '...',
                    recommendation: 'Verificar credenciais ou usar a interface web do TestRail.'
                });
            }
        }
    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).json({ error: error.message, success: false });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});