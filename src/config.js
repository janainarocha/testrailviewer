// Centraliza variáveis de ambiente e constantes
require('dotenv').config();


const config = {
    TESTRAIL_URL: process.env.TESTRAIL_URL,
    TESTRAIL_API_USER: process.env.TESTRAIL_API_USER,
    TESTRAIL_API_KEY: process.env.TESTRAIL_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    FIXED_REPORTS: [
        {
            id: 3,
            name: 'Ivision Automated Report',
            project_id: 19,
            project_name: 'Ivision'
        },
        {
            id: 4,
            name: 'Fastlane Automated Report',
            project_id: 21,
            project_name: 'Fastlane'
        }
    ]
};

const requiredVars = ['TESTRAIL_URL', 'TESTRAIL_API_USER', 'TESTRAIL_API_KEY'];
const missingVars = requiredVars.filter(key => !config[key]);
if (missingVars.length > 0) {
    throw new Error(`Config error: Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = config;
