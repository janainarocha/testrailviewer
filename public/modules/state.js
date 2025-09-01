// State management for TestRail Viewer
export const CONFIG = {
	PRIORITIES: {
		6: { name: '3 - Must Test - Code has changed', class: 'priority-6 bg-danger text-white' },
		3: { name: '2 - Test If Time', class: 'priority-3 bg-warning text-dark' },
		5: { name: '1 - Must Test', class: 'priority-5 bg-success text-white' }
	},
	TESTRAIL_URL: 'https://fugroroadware.testrail.com',
	CUSTOM_FIELDS: {
		'custom_automation_type': 'Automation Type',
		'custom_test_data': 'Test Data',
		'custom_environment': 'Environment',
		'custom_component': 'Component',
		'custom_feature': 'Feature',
		'custom_severity': 'Severity',
		'custom_estimated_time': 'Estimated Time',
		'custom_case_change_redesign': 'Case Change/Redesign'
	},
	CUSTOM_ENUMS: {
		custom_automation_type: {
			0: 'Not Required',
			1: 'To do',
			2: 'Automated',
			'0': 'Not Required',
			'1': 'To do',
			'2': 'Automated'
		},
		custom_case_change_redesign: {
			1: 'Yes - partially',
			2: 'Yes - fully',
			3: 'No',
			'1': 'Yes - partially',
			'2': 'Yes - fully',
			'3': 'No'
		}
	},
	SKIP_CUSTOM_FIELDS: new Set([
		'custom_preconds', 'custom_steps', 'custom_expected', 'custom_steps_separated'
	])
};

export const PROJECT_IDS = {
	'ivision': 19,
	'fastlane': 21
};

// Removed REPORT_IDS and getReportId function as they are no longer needed.

export let selectedProject = null;
export function setSelectedProject(projectName) {
	selectedProject = projectName;
}
