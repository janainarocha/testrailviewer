/**
 * Monthly Automation Report Script - Real API Version
 * 
 * This script uses direct TestRail and Jira APIs
 * to collect updated data monthly.
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
    TESTRAIL_PROJECT_ID: 19, // iVision5
    JIRA_EPIC_KEY: 'OPR-3401',
    JIRA_CLOUD_ID: '2e885c33-8531-45fc-9887-52fbdfad2682',
    DB_PATH: './data/testrail_dashboard.db',
    EXISTING_DB_PATH: './data/testrail_cases.db', // Existing weekly updated database
    
    // API Configurations
    TESTRAIL_URL: process.env.TESTRAIL_URL || 'https://fugroroadware.testrail.com',
    TESTRAIL_USER: process.env.TESTRAIL_API_USER,
    TESTRAIL_API_KEY: process.env.TESTRAIL_API_KEY,
    
    JIRA_URL: process.env.JIRA_URL || 'https://fugro.atlassian.net',
    JIRA_EMAIL: process.env.JIRA_EMAIL,
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN
};

class MonthlyAutomationReporterAPI {
    constructor() {
        this.db = new sqlite3.Database(CONFIG.DB_PATH);
        this.createTables();
    }

    createTables() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS monthly_automation_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    month TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    total_cases INTEGER DEFAULT 0,
                    automated_cases INTEGER DEFAULT 0,
                    manual_cases INTEGER DEFAULT 0,
                    not_required_cases INTEGER DEFAULT 0,
                    automation_percentage REAL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(month, year)
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS epic_progress_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    epic_key TEXT NOT NULL,
                    month TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    total_stories INTEGER DEFAULT 0,
                    done_stories INTEGER DEFAULT 0,
                    todo_stories INTEGER DEFAULT 0,
                    po_review_stories INTEGER DEFAULT 0,
                    declined_stories INTEGER DEFAULT 0,
                    progress_percentage REAL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(epic_key, month, year)
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS execution_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    message TEXT,
                    details TEXT
                )
            `);
        });
    }

    /**
     * Executes monthly report using real APIs
     */
    async runMonthlyReportAPI() {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('en-US', { month: 'long' });
        const year = currentDate.getFullYear();

        console.log(`🚀 Starting monthly API report - ${month}/${year}`);
        
        try {
            // Validate API credentials
            this.validateCredentials();
            
            // 1. Fetch TestRail automation data from existing database
            console.log('📊 Fetching TestRail automation data...');
            const automationData = await this.fetchTestRailAutomationDataFromDB();
            
            // 2. Fetch Jira epic data (optional - will use mock data if fails)
            console.log('🎯 Fetching Jira epic data...');
            let epicData;
            try {
                epicData = await this.fetchJiraEpicDataAPI();
            } catch (jiraError) {
                console.warn('⚠️  Jira API failed, using mock data:', jiraError.message);
                epicData = {
                    epic_key: CONFIG.JIRA_EPIC_KEY,
                    total_stories: 0,
                    done_stories: 0,
                    todo_stories: 0,
                    po_review_stories: 0,
                    declined_stories: 0,
                    progress_percentage: 0
                };
            }
            
            // 3. Save data to database
            console.log('💾 Saving data to database...');
            await this.saveMonthlyData(month, year, automationData, epicData);
            
            // 4. Success log
            this.logExecution('monthly_report', 'success', 
                `Monthly API report executed successfully`, {
                month, year, automationData, epicData
            });

            console.log('✅ Monthly API report completed successfully!');
            return { success: true, month, year, automationData, epicData };

        } catch (error) {
            console.error('❌ Error executing monthly API report:', error);
            this.logExecution('monthly_report', 'error', error.message, {
                month, year, stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Validates API credentials
     */
    validateCredentials() {
        const missing = [];
        
        if (!CONFIG.TESTRAIL_USER) missing.push('TESTRAIL_API_USER');
        if (!CONFIG.TESTRAIL_API_KEY) missing.push('TESTRAIL_API_KEY');
        if (!CONFIG.JIRA_EMAIL) missing.push('JIRA_EMAIL');
        if (!CONFIG.JIRA_API_TOKEN) missing.push('JIRA_API_TOKEN');
        
        if (missing.length > 0) {
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
        }
    }

    /**
     * Fetches automation data from existing TestRail database (much faster!)
     */
    async fetchTestRailAutomationDataFromDB() {
        try {
            console.log('🔍 Fetching automation data from existing database...');
            
            const existingDB = new sqlite3.Database(CONFIG.EXISTING_DB_PATH);
            
            return new Promise((resolve, reject) => {
                existingDB.get(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN c.data LIKE '%"custom_automation_type":2%' THEN 1 ELSE 0 END) as automated,
                        SUM(CASE WHEN c.data LIKE '%"custom_automation_type":1%' THEN 1 ELSE 0 END) as manual,
                        SUM(CASE WHEN c.data LIKE '%"custom_automation_type":0%' OR c.data LIKE '%"custom_automation_type":null%' THEN 1 ELSE 0 END) as not_required
                    FROM cases c
                    JOIN sections sec ON c.section_id = sec.id
                    JOIN suites s ON sec.suite_id = s.id
                    WHERE c.active = 1 AND s.project_id = ?
                `, [CONFIG.TESTRAIL_PROJECT_ID], (err, row) => {
                    existingDB.close();
                    
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    const automationPercentage = row.total > 0 ? (row.automated / row.total) * 100 : 0;
                    
                    const result = {
                        total_cases: row.total,
                        automated_cases: row.automated,
                        manual_cases: row.manual,
                        not_required_cases: row.not_required,
                        automation_percentage: Math.round(automationPercentage * 100) / 100
                    };

                    console.log('📊 Automation Summary (iVision5 only):');
                    console.log(`  📈 Total Cases: ${result.total_cases}`);
                    console.log(`  🤖 Automated: ${result.automated_cases} (${result.automation_percentage}%)`);
                    console.log(`  ✋ Manual: ${result.manual_cases}`);
                    console.log(`  ❌ Not Required: ${result.not_required_cases}`);

                    this.logExecution('testrail_db', 'success', 'iVision5 automation data collected from existing database', result);
                    resolve(result);
                });
            });

        } catch (error) {
            this.logExecution('testrail_db', 'error', error.message);
            throw error;
        }
    }

    /**
     * Fetches automation data from TestRail using direct API (legacy method)
     */
    async fetchTestRailAutomationDataAPI() {
        try {
            console.log('🔍 Fetching data from all iVision5 project suites...');
            
            // Create TestRail API client
            const testrailAuth = Buffer.from(`${CONFIG.TESTRAIL_USER}:${CONFIG.TESTRAIL_API_KEY}`).toString('base64');
            const testrailHeaders = {
                'Authorization': `Basic ${testrailAuth}`,
                'Content-Type': 'application/json'
            };

            // Get project suites
            const suitesResponse = await axios.get(
                `${CONFIG.TESTRAIL_URL}/index.php?/api/v2/get_suites/${CONFIG.TESTRAIL_PROJECT_ID}`,
                { headers: testrailHeaders }
            );

            console.log('✅ TestRail API response received');
            
            // Extract suites from the response
            const suites = suitesResponse.data.suites || suitesResponse.data;
            
            // Verify response structure
            if (!suites || !Array.isArray(suites)) {
                console.error('❌ Unexpected API response format:', suitesResponse.data);
                throw new Error('TestRail API returned unexpected format');
            }

            console.log(`📂 Found ${suites.length} test suites`);

            let totalCases = 0;
            let automatedCases = 0;
            let manualCases = 0;
            let notRequiredCases = 0;

            // Iterate through all suites
            for (const suite of suites) {
                console.log(`  📂 Processing suite: ${suite.name} (ID: ${suite.id})`);
                
                try {
                    // Fetch cases for this suite
                    const casesResponse = await axios.get(
                        `${CONFIG.TESTRAIL_URL}/index.php?/api/v2/get_cases/${CONFIG.TESTRAIL_PROJECT_ID}&suite_id=${suite.id}&limit=250`,
                        { headers: testrailHeaders }
                    );

                    // Extract cases from response (similar to suites, might be wrapped)
                    const cases = casesResponse.data.cases || casesResponse.data;
                    
                    if (!Array.isArray(cases)) {
                        console.warn(`    ⚠️  Unexpected cases format for suite ${suite.name}`);
                        continue;
                    }

                    // Count cases by automation type
                    for (const testCase of cases) {
                        totalCases++;
                        
                        switch (testCase.custom_automation_type) {
                            case 2: // Automated
                                automatedCases++;
                                break;
                            case 1: // To do (Manual)
                                manualCases++;
                                break;
                            case 0: // Not Required
                            case null:
                            case undefined:
                                notRequiredCases++;
                                break;
                        }
                    }

                    console.log(`    ✅ ${cases.length} cases processed`);
                    
                } catch (suiteError) {
                    console.warn(`    ⚠️  Error processing suite ${suite.name}:`, suiteError.message);
                }
            }

            const automationPercentage = totalCases > 0 ? (automatedCases / totalCases) * 100 : 0;

            const result = {
                total_cases: totalCases,
                automated_cases: automatedCases,
                manual_cases: manualCases,
                not_required_cases: notRequiredCases,
                automation_percentage: Math.round(automationPercentage * 100) / 100
            };

            console.log('📊 Automation Summary:');
            console.log(`  📈 Total Cases: ${totalCases}`);
            console.log(`  🤖 Automated: ${automatedCases} (${result.automation_percentage}%)`);
            console.log(`  ✋ Manual: ${manualCases}`);
            console.log(`  ❌ Not Required: ${notRequiredCases}`);

            this.logExecution('testrail', 'success', 'Automation data collected via API', result);
            return result;

        } catch (error) {
            this.logExecution('testrail', 'error', error.message);
            throw error;
        }
    }

    /**
     * Fetches Jira epic data using direct API
     */
    async fetchJiraEpicDataAPI() {
        try {
            console.log('🎯 Fetching OPR-3401 epic data...');
            
            // Create Jira API client
            const jiraAuth = Buffer.from(`${CONFIG.JIRA_EMAIL}:${CONFIG.JIRA_API_TOKEN}`).toString('base64');
            const jiraHeaders = {
                'Authorization': `Basic ${jiraAuth}`,
                'Accept': 'application/json'
            };

            // Fetch epic information
            const epicResponse = await axios.get(
                `${CONFIG.JIRA_URL}/rest/api/2/issue/${CONFIG.JIRA_EPIC_KEY}`,
                { headers: jiraHeaders }
            );

            console.log(`  📋 Epic: ${epicResponse.data.fields.summary}`);

            // Fetch all epic user stories (try different JQL syntax)
            const jql = `"Epic Link" = "${CONFIG.JIRA_EPIC_KEY}"`;
            const storiesResponse = await axios.get(
                `${CONFIG.JIRA_URL}/rest/api/2/search`,
                {
                    headers: jiraHeaders,
                    params: {
                        jql: jql,
                        maxResults: 100,
                        fields: 'summary,status,issuetype'
                    }
                }
            );

            // Count by status
            let doneStories = 0;
            let todoStories = 0;
            let poReviewStories = 0;
            let declinedStories = 0;

            for (const story of storiesResponse.data.issues || []) {
                const status = story.fields.status.name;
                
                switch (status) {
                    case 'Done':
                        doneStories++;
                        break;
                    case 'PO Review':
                        poReviewStories++;
                        break;
                    case 'Declined':
                    case "Won't Do":
                        declinedStories++;
                        break;
                    default:
                        todoStories++;
                        break;
                }
            }

            const totalStories = storiesResponse.data.total || 0;
            const progressPercentage = totalStories > 0 ? (doneStories / totalStories) * 100 : 0;

            const result = {
                epic_key: CONFIG.JIRA_EPIC_KEY,
                total_stories: totalStories,
                done_stories: doneStories,
                todo_stories: todoStories,
                po_review_stories: poReviewStories,
                declined_stories: declinedStories,
                progress_percentage: Math.round(progressPercentage * 100) / 100
            };

            console.log('🎯 Epic Summary:');
            console.log(`  📊 Total Stories: ${totalStories}`);
            console.log(`  ✅ Done: ${doneStories} (${result.progress_percentage}%)`);
            console.log(`  🔄 To Do/In Progress: ${todoStories}`);
            console.log(`  👀 PO Review: ${poReviewStories}`);
            console.log(`  ❌ Declined: ${declinedStories}`);

            this.logExecution('jira', 'success', 'Epic data collected via API', result);
            return result;

        } catch (error) {
            this.logExecution('jira', 'error', error.message);
            throw error;
        }
    }

    // Helper methods (database operations)
    async saveMonthlyData(month, year, automationData, epicData) {
        console.log('💾 Starting to save data to database...');
        console.log(`  Month: ${month}, Year: ${year}`);
        
        return new Promise((resolve, reject) => {
            // Save automation stats first
            this.db.run(`
                INSERT OR REPLACE INTO monthly_automation_stats 
                (month, year, total_cases, automated_cases, manual_cases, not_required_cases, automation_percentage)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                month, year,
                automationData.total_cases,
                automationData.automated_cases,
                automationData.manual_cases,
                automationData.not_required_cases,
                automationData.automation_percentage
            ], (err) => {
                if (err) {
                    console.error('❌ Error saving automation stats:', err);
                    reject(err);
                    return;
                }
                console.log('✅ Automation stats saved successfully');

                // Save epic stats second
                this.db.run(`
                    INSERT OR REPLACE INTO epic_progress_stats 
                    (epic_key, month, year, total_stories, done_stories, todo_stories, po_review_stories, declined_stories, progress_percentage)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    epicData.epic_key, month, year,
                    epicData.total_stories,
                    epicData.done_stories,
                    epicData.todo_stories,
                    epicData.po_review_stories,
                    epicData.declined_stories,
                    epicData.progress_percentage
                ], (err) => {
                    if (err) {
                        console.error('❌ Error saving epic stats:', err);
                        reject(err);
                    } else {
                        console.log('✅ Epic stats saved successfully');
                        console.log('✅ All data saved to dashboard');
                        resolve();
                    }
                });
            });
        });
    }

    logExecution(type, status, message, details = null) {
        this.db.run(`
            INSERT INTO execution_logs (type, status, message, details)
            VALUES (?, ?, ?, ?)
        `, [type, status, message, JSON.stringify(details)]);
    }

    close() {
        this.db.close();
    }
}

// Main execution
if (require.main === module) {
    const reporter = new MonthlyAutomationReporterAPI();
    
    reporter.runMonthlyReportAPI()
        .then(result => {
            console.log('📊 API report result:', result);
            reporter.close();
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            reporter.close();
            process.exit(1);
        });
}

module.exports = MonthlyAutomationReporterAPI;
