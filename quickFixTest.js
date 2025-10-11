// quickFixTest.js - Test fixes for identified issues
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testQuickFixes() {
    console.log('🔧 Testing Quick Fixes for Identified Issues\n');
    
    // Test 1: Check if business info endpoint is public
    console.log('1. Testing Business Info Endpoint (should be public):');
    try {
        const response = await axios.get(`${BASE_URL}/api/business/info/test-business-link`);
        console.log(`   Status: ${response.status} (Expected: 404 for invalid link)`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log(`   Status: ${error.response?.status} (Expected: 404 for invalid link)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 2: Check appointment business info endpoint
    console.log('\n2. Testing Appointment Business Info (should be public):');
    try {
        const response = await axios.get(`${BASE_URL}/api/appointments/business/test-business/info`);
        console.log(`   Status: ${response.status} (Expected: 404 for invalid business)`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log(`   Status: ${error.response?.status} (Expected: 404 for invalid business)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 3: Check appointment slots endpoint
    console.log('\n3. Testing Appointment Slots (should be public):');
    try {
        const response = await axios.get(`${BASE_URL}/api/appointments/business/test-business/slots?date=2025-09-20`);
        console.log(`   Status: ${response.status} (Expected: 404 for invalid business)`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log(`   Status: ${error.response?.status} (Expected: 404 for invalid business)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 4: Test with valid manager login to get token
    console.log('\n4. Testing Valid Manager Login:');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'testmanager',
            pin: '1234'
        });
        console.log(`   Status: ${response.status} (Expected: 200)`);
        console.log(`   Success: ${response.data.success}`);
        if (response.data.accessToken) {
            console.log(`   Token received: ${response.data.accessToken.substring(0, 20)}...`);
            
            // Test 5: Use valid token to test protected endpoint
            console.log('\n5. Testing Protected Endpoint with Valid Token:');
            try {
                const protectedResponse = await axios.get(`${BASE_URL}/api/manager/dashboard`, {
                    headers: { Authorization: `Bearer ${response.data.accessToken}` }
                });
                console.log(`   Status: ${protectedResponse.status} (Expected: 200)`);
                console.log(`   Success: ${protectedResponse.data.success}`);
            } catch (error) {
                console.log(`   Status: ${error.response?.status} (Expected: 200)`);
                console.log(`   Error: ${error.response?.data?.message || error.message}`);
            }
        }
    } catch (error) {
        console.log(`   Status: ${error.response?.status} (Expected: 200)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 6: Test OTP endpoint (should work even without SMS)
    console.log('\n6. Testing OTP Endpoint:');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/otp/send`, {
            phone: '+919876543210'
        });
        console.log(`   Status: ${response.status} (Expected: 200 or 500)`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log(`   Status: ${error.response?.status} (Expected: 200 or 500)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ Quick fix testing completed!');
}

testQuickFixes().catch(console.error);
