# 📊 Monthly Automation Reports System

This system automates the collection and reporting of monthly automation data for the iVision5 project.

## 🎯 Features

### 1. **Automatic Data Collection**
- **TestRail**: Fetches test cases with `Automation Type` (Automated, To do, Not Required)
- **Jira**: Monitors epic OPR-3401 progress and its user stories
- **Reports**: Automatically executes the "Ivision Automated Report"

### 2. **Monthly Scheduling**
- Automatic execution every **1st day of the month at 9:00 AM**
- Scheduling via Windows Task Scheduler
- Complete execution logs

### 3. **Integrated Dashboard**
- Monthly trend visualization
- Automation data history
- Epic progress with status breakdown

## 🚀 Initial Setup

### 1. Install Dependencies
```bash
cd src/scripts
npm install
```

### 2. Configure Scheduling
```bash
# Create scheduled task in Windows
node schedule_setup.js 1

# Or create batch file for manual execution
node schedule_setup.js 5
```

### 3. Manual Testing
```bash
# Execute report immediately
node monthly_automation_report.js

# Or via API (application must be running)
curl -X POST http://localhost:3000/api/dashboard/trigger-monthly-report
```

## 📋 Estrutura de Dados

## 📋 Data Structure

### Automation Data (TestRail)
```javascript
{
  month: "September",
  year: 2025,
  total_cases: 245,
  automated_cases: 89,
  manual_cases: 156,
  not_required_cases: 0,
  automation_percentage: 36.3
}
```

### Epic Data (Jira)
```javascript
{
  epic_key: "OPR-3401",
  month: "September", 
  year: 2025,
  total_stories: 73,
  done_stories: 19,
  todo_stories: 47,
  po_review_stories: 5,
  declined_stories: 2,
  progress_percentage: 26.0
}
```

## 🔧 Configuration

### File: `monthly_report_config.json`
```json
{
  "config": {
    "testrail": {
      "project_id": 19,
      "project_name": "iVision5",
      "report_id": 3,
      "report_name": "Ivision Automated Report"
    },
    "jira": {
      "epic_key": "OPR-3401",
      "cloud_id": "2e885c33-8531-45fc-9887-52fbdfad2682"
    }
  }
}
```

### Automation Types (TestRail)
- **0**: Not Required
- **1**: To do (Manual)
- **2**: Automated

## 📊 Available APIs

### Monthly Data
```bash
# Automation history (last 12 months)
GET /api/dashboard/automation-history

# Epic history (last 12 months)  
GET /api/dashboard/epic-history

# Current automation stats
GET /api/dashboard/current-automation-stats
```

### Logs and Control
```bash
# Execution logs
GET /api/dashboard/execution-logs?limit=50

# Force manual execution
POST /api/dashboard/trigger-monthly-report
```

## 🗂️ Database

### Automatically Created Tables

#### `monthly_automation_stats`
- Stores monthly automation statistics
- Unique data per month/year

#### `epic_progress_stats`  
- Stores monthly epic progress
- Unique data per epic/month/year

#### `execution_logs`
- Detailed logs of each execution
- Success/error status with details

## 📅 Execution Schedule

| Day | Time | Action |
|-----|------|--------|
| 1st of each month | 9:00 AM | Automatic report execution |
| Every 6 hours | - | Test mode (if enabled) |

## 🛠️ Useful Commands

### Manage Scheduled Task
```bash
# Check if task exists
schtasks /query /tn "TestRailViewer-MonthlyAutomationReport"

# Execute task manually
schtasks /run /tn "TestRailViewer-MonthlyAutomationReport"

# Remove task
schtasks /delete /tn "TestRailViewer-MonthlyAutomationReport" /f
```

### Check Logs
```bash
# View recent logs
node -e "
const MonthlyReporter = require('./monthly_automation_report');
const reporter = new MonthlyReporter();
reporter.getExecutionHistory(10).then(console.log);
"
```

## 🔍 Troubleshooting

### Common Issues

1. **Task Scheduler Permission Error**
   - Run as Administrator
   - Check group policies

2. **API Connection Error**
   - Check environment variables
   - Confirm TestRail/Jira credentials

3. **Database Not Created**
   - Check if `/data` folder exists
   - Execute script manually once

### Debug Logs
```bash
# Enable detailed logs
set DEBUG=testrail-viewer:*
node monthly_automation_report.js
```

## 📧 Notifications

The automatic TestRail report will send emails to:
- m.blanchard@fugro.com
- t.yurchenko@fugro.com  
- janaina.rocha@fugro.com

## 🔄 Updates

### To modify collected data:
1. Edit `monthly_automation_report.js`
2. Update configurations in `monthly_report_config.json`
3. Execute manual test before scheduling

### To change frequency:
1. Modify XML in `schedule_setup.js`
2. Recreate the scheduled task

## 📊 Dashboard Integration

The collected data automatically appears in the Dashboard:
- **Automation Section**: Monthly trend charts
- **Epic Section**: Progress and status breakdown
- **Logs Section**: Execution history

---

**💡 Tip**: Execute the script manually on first use to verify everything is working before activating scheduling.
