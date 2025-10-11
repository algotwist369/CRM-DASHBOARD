// testFixedRoutes.js - Test the fixed routes to ensure they work properly
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFixedRoutes() {
    console.log('🔧 Testing Fixed Routes\n');
    console.log('=' .repeat(60));
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Test 1: Business Info by Link (should return 404 for invalid link)
    console.log('\n1. Testing Business Info by Link (Fixed)');
    try {
        const response = await axios.get(`${BASE_URL}/api/business/info/invalid-business-link`);
        console.log(`   ❌ Status: ${response.status} (Expected: 404)`);
        results.failed++;
        results.tests.push({ test: 'Business Info by Link', status: 'FAILED', expected: 404, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            console.log(`   ✅ Status: ${status} (Expected: 404)`);
            results.passed++;
            results.tests.push({ test: 'Business Info by Link', status: 'PASSED', expected: 404, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 404)`);
            results.failed++;
            results.tests.push({ test: 'Business Info by Link', status: 'FAILED', expected: 404, actual: status });
        }
    }
    results.total++;
    
    // Test 2: Appointment Business Info by ID (should return 404 for invalid business)
    console.log('\n2. Testing Appointment Business Info by ID (Fixed)');
    try {
        const response = await axios.get(`${BASE_URL}/api/appointments/business/invalid-business-id/info`);
        console.log(`   ❌ Status: ${response.status} (Expected: 404)`);
        results.failed++;
        results.tests.push({ test: 'Appointment Business Info by ID', status: 'FAILED', expected: 404, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            console.log(`   ✅ Status: ${status} (Expected: 404)`);
            results.passed++;
            results.tests.push({ test: 'Appointment Business Info by ID', status: 'PASSED', expected: 404, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 404)`);
            results.failed++;
            results.tests.push({ test: 'Appointment Business Info by ID', status: 'FAILED', expected: 404, actual: status });
        }
    }
    results.total++;
    
    // Test 3: Appointment Slots by ID (should return 400 for missing date)
    console.log('\n3. Testing Appointment Slots by ID (Fixed)');
    try {
        const response = await axios.get(`${BASE_URL}/api/appointments/business/invalid-business-id/slots`);
        console.log(`   ❌ Status: ${response.status} (Expected: 400)`);
        results.failed++;
        results.tests.push({ test: 'Appointment Slots by ID', status: 'FAILED', expected: 400, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 400) {
            console.log(`   ✅ Status: ${status} (Expected: 400)`);
            results.passed++;
            results.tests.push({ test: 'Appointment Slots by ID', status: 'PASSED', expected: 400, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 400)`);
            results.failed++;
            results.tests.push({ test: 'Appointment Slots by ID', status: 'FAILED', expected: 400, actual: status });
        }
    }
    results.total++;
    
    // Test 4: Book Appointment by ID (should return 400 for invalid business)
    console.log('\n4. Testing Book Appointment by ID (Fixed)');
    try {
        const response = await axios.post(`${BASE_URL}/api/appointments/book`, {
            businessId: 'invalid-business-id',
            customerInfo: { name: 'Test Customer', phone: '+919876543212' },
            appointmentDate: '2025-09-20',
            startTime: '10:00'
        });
        console.log(`   ❌ Status: ${response.status} (Expected: 400)`);
        results.failed++;
        results.tests.push({ test: 'Book Appointment by ID', status: 'FAILED', expected: 400, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 400) {
            console.log(`   ✅ Status: ${status} (Expected: 400)`);
            results.passed++;
            results.tests.push({ test: 'Book Appointment by ID', status: 'PASSED', expected: 400, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 400)`);
            results.failed++;
            results.tests.push({ test: 'Book Appointment by ID', status: 'FAILED', expected: 400, actual: status });
        }
    }
    results.total++;
    
    // Test 5: Token Refresh (should return 401 for missing token)
    console.log('\n5. Testing Token Refresh (Fixed)');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {});
        console.log(`   ❌ Status: ${response.status} (Expected: 401)`);
        results.failed++;
        results.tests.push({ test: 'Token Refresh', status: 'FAILED', expected: 401, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            console.log(`   ✅ Status: ${status} (Expected: 401)`);
            results.passed++;
            results.tests.push({ test: 'Token Refresh', status: 'PASSED', expected: 401, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 401)`);
            results.failed++;
            results.tests.push({ test: 'Token Refresh', status: 'FAILED', expected: 401, actual: status });
        }
    }
    results.total++;
    
    // Test 6: Logout (should return 401 for missing token)
    console.log('\n6. Testing Logout (Fixed)');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/logout`, {});
        console.log(`   ❌ Status: ${response.status} (Expected: 401)`);
        results.failed++;
        results.tests.push({ test: 'Logout', status: 'FAILED', expected: 401, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
            console.log(`   ✅ Status: ${status} (Expected: 401)`);
            results.passed++;
            results.tests.push({ test: 'Logout', status: 'PASSED', expected: 401, actual: status });
        } else {
            console.log(`   ❌ Status: ${status} (Expected: 401)`);
            results.failed++;
            results.tests.push({ test: 'Logout', status: 'FAILED', expected: 401, actual: status });
        }
    }
    results.total++;
    
    // Test 7: Send OTP (should work with mock SMS)
    console.log('\n7. Testing Send OTP (Fixed)');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/otp/send`, {
            phone: '+919876543210'
        });
        console.log(`   ✅ Status: ${response.status} (Expected: 200)`);
        console.log(`   📝 Message: ${response.data.message}`);
        results.passed++;
        results.tests.push({ test: 'Send OTP', status: 'PASSED', expected: 200, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        console.log(`   ❌ Status: ${status} (Expected: 200)`);
        console.log(`   📝 Error: ${error.response?.data?.message || error.message}`);
        results.failed++;
        results.tests.push({ test: 'Send OTP', status: 'FAILED', expected: 200, actual: status });
    }
    results.total++;
    
    // Test 8: Manager Login (should work)
    console.log('\n8. Testing Manager Login (Should Work)');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'testmanager',
            pin: '1234'
        });
        console.log(`   ✅ Status: ${response.status} (Expected: 200)`);
        console.log(`   📝 Success: ${response.data.success}`);
        if (response.data.accessToken) {
            console.log(`   🔑 Token received: ${response.data.accessToken.substring(0, 20)}...`);
        }
        results.passed++;
        results.tests.push({ test: 'Manager Login', status: 'PASSED', expected: 200, actual: response.status });
    } catch (error) {
        const status = error.response?.status;
        console.log(`   ❌ Status: ${status} (Expected: 200)`);
        console.log(`   📝 Error: ${error.response?.data?.message || error.message}`);
        results.failed++;
        results.tests.push({ test: 'Manager Login', status: 'FAILED', expected: 200, actual: status });
    }
    results.total++;
    
    // Generate Results
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FIXED ROUTES TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
    
    console.log('\n📋 Detailed Results:');
    results.tests.forEach(test => {
        const icon = test.status === 'PASSED' ? '✅' : '❌';
        console.log(`   ${icon} ${test.test}: ${test.status} (Expected: ${test.expected}, Got: ${test.actual})`);
    });
    
    const passRate = (results.passed / results.total) * 100;
    if (passRate >= 90) {
        console.log('\n🎉 EXCELLENT! All major issues have been fixed!');
    } else if (passRate >= 80) {
        console.log('\n✅ GOOD! Most issues have been resolved!');
    } else if (passRate >= 70) {
        console.log('\n⚠️ FAIR! Some issues still need attention.');
    } else {
        console.log('\n❌ POOR! Many issues still need to be fixed.');
    }
    
    console.log('\n🏆 FIXED ROUTES TESTING COMPLETE!');
    console.log('=' .repeat(60));
}

testFixedRoutes().catch(console.error);
