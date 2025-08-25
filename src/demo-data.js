// Demo data for TestRail case viewer - Fugro Roadware configuration
const DEMO_DATA = {
    373696: {
        id: 373696,
        title: "Verify user login functionality with valid credentials",
        priority_id: 5, // 1 - Must Test (default priority)
        type_id: 1,
        created_by: 1,
        created_on: 1692633600, // Aug 21, 2023
        updated_on: 1692720000, // Aug 22, 2023
        custom_preconds: "1. User has valid account credentials\n2. Application is accessible\n3. Login page is displayed",
        custom_steps: "1. Enter valid username\n2. Enter valid password\n3. Click Login button",
        custom_expected: "User should be successfully logged in and redirected to dashboard",
        custom_automation_type: "Manual",
        custom_environment: "Production",
        custom_component: "Authentication"
    },
    123456: {
        id: 123456,
        title: "Test API response validation",
        priority_id: 6, // 3 - Must Test - Code has changed
        type_id: 2,
        created_by: 2,
        created_on: 1692547200,
        updated_on: 1692633600,
        custom_preconds: "API endpoint is available",
        custom_steps: "Send request to API endpoint",
        custom_expected: "Receive valid JSON response",
        custom_automation_type: "Automated",
        custom_environment: "Staging"
    },
    999999: {
        id: 999999,
        title: "Optional UI validation test",
        priority_id: 3, // 2 - Test If Time
        type_id: 1,
        created_by: 1,
        created_on: 1692460800,
        updated_on: 1692547200,
        custom_preconds: "UI is accessible and functional",
        custom_steps: "1. Navigate to the page\n2. Verify all elements are visible\n3. Check responsiveness",
        custom_expected: "All UI elements should be properly displayed and responsive",
        custom_automation_type: "Manual",
        custom_environment: "Test",
        custom_component: "UI"
    }
};

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEMO_DATA;
} else {
    window.DEMO_DATA = DEMO_DATA;
}
