
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = config.PORT;

// Modular API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Static files and root
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});