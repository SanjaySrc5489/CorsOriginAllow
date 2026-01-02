const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CORS Proxy Server is running',
        usage: 'Send requests to /proxy?url=YOUR_URL'
    });
});

// Main proxy endpoint
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({
            error: 'Missing URL parameter',
            usage: '/proxy?url=YOUR_URL'
        });
    }

    try {
        console.log(`[PROXY] Fetching: ${targetUrl}`);

        // Fetch the target URL with proper headers and binary response support
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 30000, // 30 seconds timeout
            maxRedirects: 5,
            responseType: 'arraybuffer' // ✅ KEY FIX: Handle binary data (images)
        });

        console.log(`[PROXY] Success: ${response.status} from ${targetUrl}`);
        console.log(`[PROXY] Content-Type: ${response.headers['content-type']}`);

        // Send the response back with CORS headers and proper content type
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Forward the original content-type
        if (response.headers['content-type']) {
            res.set('Content-Type', response.headers['content-type']);
        }

        // Send binary data directly
        res.status(response.status).send(Buffer.from(response.data));

    } catch (error) {
        console.error(`[PROXY] Error fetching ${targetUrl}:`, error.message);

        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch URL',
            message: error.message,
            url: targetUrl
        });
    }
});

// Handle POST requests
app.post('/proxy', async (req, res) => {
    const targetUrl = req.body.url;

    if (!targetUrl) {
        return res.status(400).json({
            error: 'Missing URL in request body'
        });
    }

    try {
        const response = await axios.post(targetUrl, req.body.data || {}, {
            headers: req.body.headers || {}
        });

        res.set('Access-Control-Allow-Origin', '*');
        res.status(response.status).send(response.data);

    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch URL',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
    console.log(`📡 Usage: http://localhost:${PORT}/proxy?url=YOUR_URL`);
});
