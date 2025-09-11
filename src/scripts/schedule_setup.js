/**
 * Script to configure monthly scheduling on Windows Task Scheduler
 * 
 * Usage: node schedule_setup.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class ScheduleSetup {
    constructor() {
        this.scriptPath = path.resolve(__dirname, 'monthly_automation_report.js');
        this.taskName = 'TestRailViewer-MonthlyAutomationReport';
        this.nodePath = process.execPath; // Node.js path
    }

    /**
     * Creates a scheduled task in Windows Task Scheduler
     */
    async createWindowsScheduledTask() {
        const taskXML = this.generateTaskXML();
        const tempXMLPath = path.join(__dirname, 'temp_task.xml');

        try {
            // Write temporary XML
            fs.writeFileSync(tempXMLPath, taskXML);

            // Create task using schtasks
            const createCommand = `schtasks /create /tn "${this.taskName}" /xml "${tempXMLPath}" /f`;
            
            console.log('🔧 Creating scheduled task...');
            console.log('Command:', createCommand);

            await this.executeCommand(createCommand);

            // Remove temporary file
            fs.unlinkSync(tempXMLPath);

            console.log('✅ Scheduled task created successfully!');
            console.log(`📅 Task "${this.taskName}" will run on the 1st day of every month at 9:00 AM`);
            
            // Show task information
            await this.showTaskInfo();

        } catch (error) {
            console.error('❌ Error creating scheduled task:', error);
            // Cleanup
            if (fs.existsSync(tempXMLPath)) {
                fs.unlinkSync(tempXMLPath);
            }
            throw error;
        }
    }

    /**
     * Generates task XML for Task Scheduler
     */
    generateTaskXML() {
        const workingDirectory = path.dirname(this.scriptPath);
        
        return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>${new Date().toISOString()}</Date>
    <Author>TestRail Viewer</Author>
    <Description>Executes monthly automation report for iVision5 project</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>${new Date().toISOString().split('T')[0]}T09:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByMonth>
        <DaysOfMonth>
          <Day>1</Day>
        </DaysOfMonth>
        <Months>
          <January />
          <February />
          <March />
          <April />
          <May />
          <June />
          <July />
          <August />
          <September />
          <October />
          <November />
          <December />
        </Months>
      </ScheduleByMonth>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <DisallowStartOnRemoteAppSession>false</DisallowStartOnRemoteAppSession>
    <UseUnifiedSchedulingEngine>true</UseUnifiedSchedulingEngine>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>"${this.nodePath}"</Command>
      <Arguments>"${this.scriptPath}"</Arguments>
      <WorkingDirectory>${workingDirectory}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;
    }

    /**
     * Executes system command
     */
    executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Error: ${error.message}`));
                    return;
                }
                if (stderr) {
                    console.log('Stderr:', stderr);
                }
                if (stdout) {
                    console.log('Stdout:', stdout);
                }
                resolve(stdout);
            });
        });
    }

    /**
     * Shows information about the created task
     */
    async showTaskInfo() {
        try {
            const queryCommand = `schtasks /query /tn "${this.taskName}" /fo LIST /v`;
            const output = await this.executeCommand(queryCommand);
            console.log('\n📋 Created task information:');
            console.log(output);
        } catch (error) {
            console.log('⚠️  Could not show task information');
        }
    }

    /**
     * Removes the scheduled task
     */
    async removeScheduledTask() {
        try {
            const deleteCommand = `schtasks /delete /tn "${this.taskName}" /f`;
            await this.executeCommand(deleteCommand);
            console.log('🗑️  Scheduled task removed successfully!');
        } catch (error) {
            console.error('❌ Error removing task:', error);
        }
    }

    /**
     * Runs the task manually (for testing)
     */
    async runTaskNow() {
        try {
            const runCommand = `schtasks /run /tn "${this.taskName}"`;
            await this.executeCommand(runCommand);
            console.log('▶️  Task executed manually!');
        } catch (error) {
            console.error('❌ Error executing task:', error);
        }
    }

    /**
     * Checks if task exists
     */
    async taskExists() {
        try {
            const queryCommand = `schtasks /query /tn "${this.taskName}"`;
            await this.executeCommand(queryCommand);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Creates alternative batch file for execution
     */
    createBatchFile() {
        const batchContent = `@echo off
cd /d "${path.dirname(this.scriptPath)}"
"${this.nodePath}" "${this.scriptPath}"
pause`;
        
        const batchPath = path.join(path.dirname(this.scriptPath), 'run_monthly_report.bat');
        fs.writeFileSync(batchPath, batchContent);
        
        console.log('📄 Batch file created:', batchPath);
        console.log('💡 You can run the batch manually or use it for alternative scheduling');
        
        return batchPath;
    }
}

// Interactive menu
async function showMenu() {
    const setup = new ScheduleSetup();
    
    console.log('\n🔧 Monthly Automation Report Scheduler Setup');
    console.log('============================================');
    console.log('1. Create scheduled task (Windows Task Scheduler)');
    console.log('2. Remove scheduled task');
    console.log('3. Run task now (test)');
    console.log('4. Check if task exists');
    console.log('5. Create batch file for manual execution');
    console.log('6. Exit');
    
    // Simulates option 1 choice for demonstration
    const option = process.argv[2] || '1';
    
    try {
        switch (option) {
            case '1':
                await setup.createWindowsScheduledTask();
                break;
            case '2':
                await setup.removeScheduledTask();
                break;
            case '3':
                await setup.runTaskNow();
                break;
            case '4':
                const exists = await setup.taskExists();
                console.log(`📋 Task exists: ${exists ? 'Yes' : 'No'}`);
                break;
            case '5':
                setup.createBatchFile();
                break;
            case '6':
                console.log('👋 Exiting...');
                process.exit(0);
                break;
            default:
                console.log('❌ Invalid option');
                break;
        }
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Main execution
if (require.main === module) {
    showMenu().then(() => {
        console.log('\n✅ Setup completed!');
    }).catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ScheduleSetup;
