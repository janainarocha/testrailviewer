// Amplify Function to call TestRail API
exports.handler = async (event) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const caseId = event.pathParameters.caseId;
        
        if (!caseId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Case ID is required' })
            };
        }

        // Get environment variables from Amplify
        const TESTRAIL_URL = process.env.TESTRAIL_URL;
        const API_USER = process.env.TESTRAIL_API_USER;
        const API_KEY = process.env.TESTRAIL_API_KEY;

        if (!TESTRAIL_URL || !API_USER || !API_KEY) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'TestRail credentials not configured' })
            };
        }

        // Call TestRail API
        const url = `${TESTRAIL_URL}/index.php?/api/v2/get_case/${caseId}`;
        const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
