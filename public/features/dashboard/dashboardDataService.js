// Dashboard Data Service
// Handles integration with TestRail, Atlassian (Jira), and GitHub APIs

import { TestRailAPI } from '../../modules/api.js';

export class DashboardDataService {
    constructor() {
        this.testRailAPI = new TestRailAPI();
    }

    // Get TestRail automation coverage data
    async getAutomationCoverage(projectId, suiteId = null) {
        try {
            // Get all test cases for the project
            const cases = await this.testRailAPI.getCases(projectId, suiteId);
            
            // Analyze automation coverage
            const automatedCases = cases.filter(testCase => 
                testCase.custom_automation_type && 
                testCase.custom_automation_type !== 'None'
            );
            
            const manualCases = cases.filter(testCase => 
                !testCase.custom_automation_type || 
                testCase.custom_automation_type === 'None'
            );
            
            return {
                total: cases.length,
                automated: automatedCases.length,
                manual: manualCases.length,
                automationPercentage: Math.round((automatedCases.length / cases.length) * 100),
                cases: cases,
                automatedCases: automatedCases,
                manualCases: manualCases
            };
        } catch (error) {
            console.error('Error getting automation coverage:', error);
            throw error;
        }
    }

    // Get monthly automation trend
    async getMonthlyAutomationTrend(projectId, months = 12) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(endDate.getMonth() - months);
            
            // This would require historical data or regular snapshots
            // For now, we'll return mock trend data
            const monthlyData = [];
            
            for (let i = months; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                
                // Mock data showing gradual improvement
                const basePercentage = 45;
                const growth = (months - i) * 2.5;
                const percentage = Math.min(Math.round(basePercentage + growth), 80);
                
                monthlyData.push({
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    percentage: percentage,
                    date: date
                });
            }
            
            return monthlyData;
        } catch (error) {
            console.error('Error getting monthly automation trend:', error);
            throw error;
        }
    }

    // Get test case types distribution
    async getTestTypeDistribution(projectId, suiteId = null) {
        try {
            const coverage = await this.getAutomationCoverage(projectId, suiteId);
            
            // Group by test type
            const typeDistribution = {};
            coverage.cases.forEach(testCase => {
                const type = testCase.type_id || 'Unknown';
                if (!typeDistribution[type]) {
                    typeDistribution[type] = {
                        total: 0,
                        automated: 0,
                        manual: 0
                    };
                }
                
                typeDistribution[type].total++;
                
                if (testCase.custom_automation_type && testCase.custom_automation_type !== 'None') {
                    typeDistribution[type].automated++;
                } else {
                    typeDistribution[type].manual++;
                }
            });
            
            return typeDistribution;
        } catch (error) {
            console.error('Error getting test type distribution:', error);
            throw error;
        }
    }

    // Get GitHub repository statistics
    async getGitHubStats(repoOwner, repoName) {
        try {
            // This would use GitHub API through MCP
            // For now, return mock data
            return {
                latestRelease: {
                    tagName: 'v2.1.0',
                    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
                    url: `https://github.com/${repoOwner}/${repoName}/releases/latest`
                },
                openIssues: 5,
                recentCommits: 3,
                stars: 15,
                forks: 3
            };
        } catch (error) {
            console.error('Error getting GitHub stats:', error);
            throw error;
        }
    }

    // Get Jira Epic progress
    async getEpicProgress(epicKey) {
        try {
            // This would use Atlassian API through MCP
            // For now, return mock data for OPR-3401
            if (epicKey === 'OPR-3401') {
                return {
                    key: epicKey,
                    summary: 'Test Automation Framework Implementation',
                    status: 'In Progress',
                    progress: {
                        total: 15,
                        completed: 8,
                        inProgress: 4,
                        pending: 3
                    },
                    stories: [
                        { key: 'OPR-3402', status: 'Done', summary: 'Setup test framework' },
                        { key: 'OPR-3403', status: 'Done', summary: 'Implement login tests' },
                        { key: 'OPR-3404', status: 'In Progress', summary: 'Dashboard tests' },
                        // ... more stories
                    ]
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting Epic progress:', error);
            throw error;
        }
    }

    // Get automation backlog (tests marked for automation but not yet automated)
    async getAutomationBacklog(projectId, suiteId = null) {
        try {
            const cases = await this.testRailAPI.getCases(projectId, suiteId);
            
            // Filter cases marked for automation but not yet automated
            const backlogCases = cases.filter(testCase => 
                testCase.custom_automation_type === 'To Be Automated' ||
                (testCase.custom_automation_type === 'None' && testCase.priority_id >= 3) // High priority manual tests
            );
            
            // Group by priority
            const priorityGroups = {
                high: backlogCases.filter(c => c.priority_id === 4).length,
                medium: backlogCases.filter(c => c.priority_id === 3).length,
                low: backlogCases.filter(c => c.priority_id <= 2).length
            };
            
            return {
                total: backlogCases.length,
                cases: backlogCases,
                priorityGroups: priorityGroups
            };
        } catch (error) {
            console.error('Error getting automation backlog:', error);
            throw error;
        }
    }

    // Get test execution metrics
    async getExecutionMetrics(projectId, runs = 10) {
        try {
            // This would get recent test run data
            // For now, return mock execution data
            return {
                averagePassRate: 87,
                totalExecutions: 450,
                executionTrend: [
                    { date: '2025-09-01', passRate: 85, total: 50 },
                    { date: '2025-09-02', passRate: 88, total: 52 },
                    { date: '2025-09-03', passRate: 90, total: 48 },
                    // ... more data
                ],
                topFailingTests: [
                    { id: 'C123', title: 'Login with invalid credentials', failRate: 15 },
                    { id: 'C456', title: 'File upload validation', failRate: 12 },
                    // ... more failing tests
                ]
            };
        } catch (error) {
            console.error('Error getting execution metrics:', error);
            throw error;
        }
    }

    // Generate monthly dashboard report
    async generateMonthlyReport(projectKey) {
        try {
            const config = this.getProjectConfig(projectKey);
            
            const [
                automationCoverage,
                monthlyTrend,
                typeDistribution,
                githubStats,
                epicProgress,
                automationBacklog,
                executionMetrics
            ] = await Promise.all([
                this.getAutomationCoverage(config.testRailProjectId),
                this.getMonthlyAutomationTrend(config.testRailProjectId),
                this.getTestTypeDistribution(config.testRailProjectId),
                this.getGitHubStats(...config.githubRepo.split('/')),
                config.epicKey ? this.getEpicProgress(config.epicKey) : null,
                this.getAutomationBacklog(config.testRailProjectId),
                this.getExecutionMetrics(config.testRailProjectId)
            ]);
            
            return {
                project: config.name,
                generatedAt: new Date(),
                automationCoverage,
                monthlyTrend,
                typeDistribution,
                githubStats,
                epicProgress,
                automationBacklog,
                executionMetrics
            };
        } catch (error) {
            console.error('Error generating monthly report:', error);
            throw error;
        }
    }

    // Get project configuration
    getProjectConfig(projectKey) {
        const configs = {
            ivision: {
                name: 'iVision',
                testRailProjectId: 1,
                githubRepo: 'fugro/fugro.ivision5.test-automation',
                epicKey: 'OPR-3401'
            },
            fastlane: {
                name: 'Fastlane',
                testRailProjectId: 2,
                githubRepo: 'fugro/fastlane-automation',
                epicKey: null
            }
        };
        
        return configs[projectKey];
    }
}
