// routeTest.js - Comprehensive route testing for all API endpoints
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 10000; // 10 seconds timeout

// Test results storage
let testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    routes: {},
    startTime: null,
    endTime: null
};

// Helper function to make HTTP requests
async function makeRequest(url, method = 'GET', data = null, headers = {}) {
    const startTime = performance.now();
    
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: TEST_TIMEOUT,
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        return {
            success: response.status < 400,
            status: response.status,
            responseTime,
            data: response.data,
            headers: response.headers
        };
    } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        return {
            success: false,
            status: error.response?.status || 0,
            responseTime,
            error: error.message,
            data: error.response?.data
        };
    }
}

// Test categories
const testCategories = {
    'Health Check': [
        { method: 'GET', path: '/', expectedStatus: 200, description: 'Server health check' }
    ],
    
    'Authentication Routes': [
        { method: 'POST', path: '/api/auth/register', data: { companyName: 'Test Company', name: 'Test Admin', email: 'test@example.com', phone: '+919876543210', password: 'Test@123' }, expectedStatus: 201, description: 'Admin registration' },
        { method: 'POST', path: '/api/auth/login', data: { email: 'test@example.com', password: 'Test@123' }, expectedStatus: 200, description: 'Admin login' },
        { method: 'POST', path: '/api/auth/login', data: { username: 'testmanager', pin: '1234' }, expectedStatus: 200, description: 'Manager login' },
        { method: 'POST', path: '/api/auth/refresh', data: { refreshToken: 'test-token' }, expectedStatus: 401, description: 'Token refresh (invalid token)' },
        { method: 'POST', path: '/api/auth/logout', data: { refreshToken: 'test-token' }, expectedStatus: 401, description: 'Logout (invalid token)' },
        { method: 'POST', path: '/api/auth/otp/send', data: { phone: '+919876543210' }, expectedStatus: 200, description: 'Send OTP' },
        { method: 'POST', path: '/api/auth/otp/verify', data: { phone: '+919876543210', otp: '123456' }, expectedStatus: 400, description: 'Verify OTP (invalid)' }
    ],
    
    'Admin Routes': [
        { method: 'GET', path: '/api/admin/dashboard', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Admin dashboard (unauthorized)' },
        { method: 'POST', path: '/api/admin/business', headers: { Authorization: 'Bearer invalid-token' }, data: { type: 'salon', name: 'Test Salon', branch: 'Test Branch', address: 'Test Address', city: 'Test City', state: 'Test State' }, expectedStatus: 401, description: 'Create business (unauthorized)' },
        { method: 'GET', path: '/api/admin/businesses', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get businesses (unauthorized)' },
        { method: 'GET', path: '/api/admin/business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get business by ID (unauthorized)' },
        { method: 'PUT', path: '/api/admin/business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Updated Name' }, expectedStatus: 401, description: 'Update business (unauthorized)' },
        { method: 'DELETE', path: '/api/admin/business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Delete business (unauthorized)' },
        { method: 'POST', path: '/api/admin/manager', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Test Manager', username: 'testmanager', pin: '1234', businessId: 'invalid-id' }, expectedStatus: 401, description: 'Create manager (unauthorized)' },
        { method: 'GET', path: '/api/admin/business/invalid-id/link', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get business link (unauthorized)' }
    ],
    
    'Business Routes': [
        { method: 'GET', path: '/api/business/info/invalid-link', expectedStatus: 404, description: 'Get business info (invalid link)' },
        { method: 'GET', path: '/api/business/invalid-id/staff', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get business staff (unauthorized)' },
        { method: 'GET', path: '/api/business/invalid-id/daily-records', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get daily records (unauthorized)' }
    ],
    
    'Manager Routes': [
        { method: 'GET', path: '/api/manager/dashboard', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Manager dashboard (unauthorized)' },
        { method: 'POST', path: '/api/manager/staff', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Test Staff', role: 'stylist', phone: '+919876543211' }, expectedStatus: 401, description: 'Add staff (unauthorized)' },
        { method: 'GET', path: '/api/manager/staff', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get staff (unauthorized)' },
        { method: 'PUT', path: '/api/manager/staff/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Updated Staff' }, expectedStatus: 401, description: 'Update staff (unauthorized)' },
        { method: 'DELETE', path: '/api/manager/staff/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Delete staff (unauthorized)' },
        { method: 'POST', path: '/api/manager/transaction', headers: { Authorization: 'Bearer invalid-token' }, data: { customerName: 'Test Customer', serviceName: 'Hair Cut', basePrice: 500, finalPrice: 500 }, expectedStatus: 401, description: 'Add transaction (unauthorized)' },
        { method: 'GET', path: '/api/manager/transactions', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get transactions (unauthorized)' }
    ],
    
    'Staff Routes': [
        { method: 'GET', path: '/api/staff/dashboard', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Staff dashboard (unauthorized)' },
        { method: 'GET', path: '/api/staff/profile', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Staff profile (unauthorized)' },
        { method: 'PUT', path: '/api/staff/profile', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Updated Name' }, expectedStatus: 401, description: 'Update profile (unauthorized)' }
    ],
    
    'Daily Business Routes': [
        { method: 'POST', path: '/api/daily-business', headers: { Authorization: 'Bearer invalid-token' }, data: { date: '2025-09-17', totalCustomers: 10, totalRevenue: 5000 }, expectedStatus: 401, description: 'Add daily business (unauthorized)' },
        { method: 'GET', path: '/api/daily-business', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get daily business (unauthorized)' },
        { method: 'GET', path: '/api/daily-business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get daily business by ID (unauthorized)' },
        { method: 'PUT', path: '/api/daily-business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, data: { totalCustomers: 15 }, expectedStatus: 401, description: 'Update daily business (unauthorized)' },
        { method: 'DELETE', path: '/api/daily-business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Delete daily business (unauthorized)' },
        { method: 'GET', path: '/api/daily-business/reports/summary', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get summary report (unauthorized)' },
        { method: 'GET', path: '/api/daily-business/reports/analytics', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get analytics report (unauthorized)' }
    ],
    
    'Appointment Routes': [
        { method: 'GET', path: '/api/appointments/business/invalid-id/info', expectedStatus: 404, description: 'Get business info (invalid ID)' },
        { method: 'GET', path: '/api/appointments/business/invalid-id/slots', data: { date: '2025-09-20' }, expectedStatus: 404, description: 'Get available slots (invalid ID)' },
        { method: 'POST', path: '/api/appointments/book', data: { businessId: 'invalid-id', customerName: 'Test Customer', customerPhone: '+919876543212', appointmentDate: '2025-09-20', startTime: '10:00' }, expectedStatus: 400, description: 'Book appointment (invalid business)' },
        { method: 'GET', path: '/api/appointments', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get appointments (unauthorized)' },
        { method: 'GET', path: '/api/appointments/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get appointment by ID (unauthorized)' },
        { method: 'PUT', path: '/api/appointments/invalid-id/status', headers: { Authorization: 'Bearer invalid-token' }, data: { status: 'confirmed' }, expectedStatus: 401, description: 'Update appointment status (unauthorized)' },
        { method: 'DELETE', path: '/api/appointments/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Cancel appointment (unauthorized)' }
    ],
    
    'Customer Routes': [
        { method: 'GET', path: '/api/customers', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get customers (unauthorized)' },
        { method: 'GET', path: '/api/customers/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get customer by ID (unauthorized)' },
        { method: 'GET', path: '/api/customers/analytics/overview', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get customer analytics (unauthorized)' },
        { method: 'GET', path: '/api/customers/analytics/segments', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get customer segments (unauthorized)' },
        { method: 'GET', path: '/api/customers/analytics/growth', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get customer growth (unauthorized)' }
    ],
    
    'Notification Routes': [
        { method: 'GET', path: '/api/notifications', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get notifications (unauthorized)' },
        { method: 'POST', path: '/api/notifications', headers: { Authorization: 'Bearer invalid-token' }, data: { title: 'Test Notification', message: 'Test message', type: 'promotion' }, expectedStatus: 401, description: 'Create notification (unauthorized)' },
        { method: 'GET', path: '/api/notifications/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get notification by ID (unauthorized)' },
        { method: 'PUT', path: '/api/notifications/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, data: { title: 'Updated Notification' }, expectedStatus: 401, description: 'Update notification (unauthorized)' },
        { method: 'DELETE', path: '/api/notifications/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Delete notification (unauthorized)' },
        { method: 'POST', path: '/api/notifications/invalid-id/send', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Send notification (unauthorized)' },
        { method: 'GET', path: '/api/notifications/campaigns', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get campaigns (unauthorized)' },
        { method: 'POST', path: '/api/notifications/campaigns', headers: { Authorization: 'Bearer invalid-token' }, data: { name: 'Test Campaign', type: 'promotion' }, expectedStatus: 401, description: 'Create campaign (unauthorized)' }
    ],
    
    'Report Routes': [
        { method: 'GET', path: '/api/reports/dashboard', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get dashboard report (unauthorized)' },
        { method: 'GET', path: '/api/reports/business/invalid-id', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get business report (unauthorized)' },
        { method: 'GET', path: '/api/reports/analytics', headers: { Authorization: 'Bearer invalid-token' }, expectedStatus: 401, description: 'Get analytics report (unauthorized)' }
    ],
    
    'Invalid Routes': [
        { method: 'GET', path: '/invalid-route', expectedStatus: 404, description: 'Invalid route' },
        { method: 'POST', path: '/api/invalid-endpoint', expectedStatus: 404, description: 'Invalid API endpoint' },
        { method: 'GET', path: '/api/auth/invalid', expectedStatus: 404, description: 'Invalid auth endpoint' }
    ]
};

// Test runner function
async function runRouteTest(category, tests) {
    console.log(`\n🧪 Testing ${category}...`);
    console.log('=' .repeat(60));
    
    const categoryResults = {
        total: tests.length,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const testNumber = i + 1;
        
        console.log(`\n[${testNumber}/${tests.length}] ${test.description}`);
        console.log(`   ${test.method} ${test.path}`);
        
        const result = await makeRequest(test.path, test.method, test.data, test.headers);
        
        const passed = result.status === test.expectedStatus;
        const statusIcon = passed ? '✅' : '❌';
        
        console.log(`   ${statusIcon} Status: ${result.status} (Expected: ${test.expectedStatus})`);
        console.log(`   ⏱️  Response Time: ${result.responseTime.toFixed(2)}ms`);
        
        if (!passed) {
            console.log(`   ❌ Error: ${result.error || 'Unexpected status code'}`);
            if (result.data && result.data.message) {
                console.log(`   📝 Message: ${result.data.message}`);
            }
        }
        
        categoryResults.tests.push({
            description: test.description,
            method: test.method,
            path: test.path,
            expectedStatus: test.expectedStatus,
            actualStatus: result.status,
            responseTime: result.responseTime,
            passed: passed,
            error: result.error,
            message: result.data?.message
        });
        
        if (passed) {
            categoryResults.passed++;
            testResults.passedTests++;
        } else {
            categoryResults.failed++;
            testResults.failedTests++;
        }
        
        testResults.totalTests++;
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 ${category} Results:`);
    console.log(`   Total: ${categoryResults.total}`);
    console.log(`   Passed: ${categoryResults.passed} (${((categoryResults.passed / categoryResults.total) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${categoryResults.failed} (${((categoryResults.failed / categoryResults.total) * 100).toFixed(1)}%)`);
    
    testResults.routes[category] = categoryResults;
    
    return categoryResults;
}

// Main test runner
async function runAllRouteTests() {
    console.log('🚀 Starting Comprehensive Route Testing');
    console.log('=' .repeat(80));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test Timeout: ${TEST_TIMEOUT}ms`);
    console.log('=' .repeat(80));
    
    testResults.startTime = performance.now();
    
    try {
        // Run tests for each category
        for (const [category, tests] of Object.entries(testCategories)) {
            await runRouteTest(category, tests);
            
            // Wait between categories
            console.log('\n   Waiting 2 seconds before next category...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        testResults.endTime = performance.now();
        const totalTime = testResults.endTime - testResults.startTime;
        
        // Generate comprehensive report
        generateTestReport(totalTime);
        
    } catch (error) {
        console.error('❌ Route testing failed:', error.message);
    }
}

// Generate comprehensive test report
function generateTestReport(totalTime) {
    console.log('\n📊 COMPREHENSIVE ROUTE TEST REPORT');
    console.log('=' .repeat(80));
    console.log(`Total Test Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests} (${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${testResults.failedTests} (${((testResults.failedTests / testResults.totalTests) * 100).toFixed(1)}%)`);
    
    console.log('\n📈 Results by Category:');
    for (const [category, results] of Object.entries(testResults.routes)) {
        const passRate = ((results.passed / results.total) * 100).toFixed(1);
        const statusIcon = passRate >= 80 ? '✅' : passRate >= 60 ? '⚠️' : '❌';
        console.log(`   ${statusIcon} ${category}: ${results.passed}/${results.total} (${passRate}%)`);
    }
    
    // Calculate average response time
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    for (const category of Object.values(testResults.routes)) {
        for (const test of category.tests) {
            totalResponseTime += test.responseTime;
            responseTimeCount++;
        }
    }
    
    const avgResponseTime = totalResponseTime / responseTimeCount;
    
    console.log(`\n⏱️  Performance Metrics:`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Tests: ${testResults.totalTests}`);
    console.log(`   Tests per Second: ${(testResults.totalTests / (totalTime / 1000)).toFixed(2)}`);
    
    // Overall assessment
    const overallPassRate = (testResults.passedTests / testResults.totalTests) * 100;
    let overallRating = 'EXCELLENT';
    if (overallPassRate < 90) overallRating = 'GOOD';
    if (overallPassRate < 80) overallRating = 'FAIR';
    if (overallPassRate < 70) overallRating = 'POOR';
    
    console.log(`\n🎯 Overall Assessment:`);
    console.log(`   Rating: ${overallRating}`);
    console.log(`   Pass Rate: ${overallPassRate.toFixed(1)}%`);
    console.log(`   API Health: ${overallPassRate >= 80 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    
    // Failed tests summary
    if (testResults.failedTests > 0) {
        console.log(`\n❌ Failed Tests Summary:`);
        for (const [category, results] of Object.entries(testResults.routes)) {
            const failedTests = results.tests.filter(t => !t.passed);
            if (failedTests.length > 0) {
                console.log(`\n   ${category}:`);
                failedTests.forEach(test => {
                    console.log(`     ❌ ${test.method} ${test.path} - Expected: ${test.expectedStatus}, Got: ${test.actualStatus}`);
                });
            }
        }
    }
    
    console.log('\n🏆 ROUTE TESTING COMPLETE!');
    console.log('=' .repeat(80));
}

// Run the tests
if (require.main === module) {
    runAllRouteTests().then(() => {
        console.log('\n✅ Route testing completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Route testing failed:', error);
        process.exit(1);
    });
}

module.exports = { runAllRouteTests };
