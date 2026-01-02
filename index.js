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

// Main proxy endpoint with improved error handling
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({
            error: 'Missing URL parameter',
            usage: '/proxy?url=YOUR_URL'
        });
    }

    // Retry configuration
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[PROXY] Attempt ${attempt}/${maxRetries}: ${targetUrl}`);

            // Fetch the target URL with proper headers and binary response support
            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                },
                timeout: 30000, // 30 seconds timeout
                maxRedirects: 5,
                responseType: 'arraybuffer', // Handle binary data (images)
                validateStatus: function (status) {
                    return status < 500; // Accept 4xx as valid response
                }
            });

            console.log(`[PROXY] Success: ${response.status} from ${targetUrl}`);
            console.log(`[PROXY] Content-Type: ${response.headers['content-type']}`);

            // Set CORS headers
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.set('Access-Control-Max-Age', '86400'); // 24 hours

            // Forward important headers
            if (response.headers['content-type']) {
                res.set('Content-Type', response.headers['content-type']);
            }
            if (response.headers['cache-control']) {
                res.set('Cache-Control', response.headers['cache-control']);
            }
            if (response.headers['etag']) {
                res.set('ETag', response.headers['etag']);
            }

            // Send binary data directly
            return res.status(response.status).send(Buffer.from(response.data));

        } catch (error) {
            lastError = error;
            console.error(`[PROXY] Attempt ${attempt} failed: ${error.message}`);

            // If it's the last attempt, return error
            if (attempt === maxRetries) {
                break;
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
    }

    // If all retries failed
    console.error(`[PROXY] All retries failed for ${targetUrl}:`, lastError.message);

    res.status(lastError.response?.status || 500).json({
        error: 'Failed to fetch URL',
        message: lastError.message,
        url: targetUrl,
        attempts: maxRetries
    });
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

// Handle OPTIONS for CORS preflight
app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '86400');
    res.status(200).end();
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
    console.log(`📡 Usage: http://localhost:${PORT}/proxy?url=YOUR_URL`);
});

module.exports = app;
