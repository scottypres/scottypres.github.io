const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy endpoint for FAA TFR data
app.get('/api/tfr', async (req, res) => {
    try {
        const response = await fetch('https://tfr.faa.gov/tfr3/export/json');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching TFR data:', error);
        res.status(500).json({ error: 'Failed to fetch TFR data' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 