// loadTest.js - Performance and load testing script
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:5000';
const CONCURRENT_REQUESTS = 50; // Number of concurrent requests
const TOTAL_REQUESTS = 200; // Total requests to send
const TEST_DURATION = 30000; // 30 seconds

// Test results
let results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
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
            timeout: 10000 // 10 second timeout
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        return {
            success: true,
            status: response.status,
            responseTime,
            data: response.data
        };
    } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        return {
            success: false,
            status: error.response?.status || 0,
            responseTime,
            error: error.message
        };
    }
}

// Test 1: Health Check Load Test
async function testHealthCheck() {
    console.log('\n🏥 Testing Health Check Endpoint...');
    const promises = [];
    
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        promises.push(makeRequest('/'));
    }
    
    const startTime = performance.now();
    const responses = await Promise.all(promises);
    const endTime = performance.now();
    
    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    
    console.log(`✅ Health Check Results:`);
    console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return { successful, failed, avgResponseTime, totalTime: endTime - startTime };
}

// Test 2: Authentication Load Test
async function testAuthentication() {
    console.log('\n🔐 Testing Authentication Endpoint...');
    const promises = [];
    
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        const testData = {
            companyName: `Test Company ${i}`,
            name: `Test Admin ${i}`,
            email: `test${i}@example.com`,
            phone: `+9198765432${i.toString().padStart(2, '0')}`,
            password: 'Test@123'
        };
        promises.push(makeRequest('/api/auth/register', 'POST', testData));
    }
    
    const startTime = performance.now();
    const responses = await Promise.all(promises);
    const endTime = performance.now();
    
    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    
    console.log(`✅ Authentication Results:`);
    console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return { successful, failed, avgResponseTime, totalTime: endTime - startTime };
}

// Test 3: Sustained Load Test
async function testSustainedLoad() {
    console.log('\n⚡ Testing Sustained Load...');
    const startTime = performance.now();
    const endTime = startTime + TEST_DURATION;
    let requestCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const responseTimes = [];
    
    console.log(`   Running for ${TEST_DURATION / 1000} seconds...`);
    
    while (performance.now() < endTime) {
        const promises = [];
        
        // Send batch of concurrent requests
        for (let i = 0; i < 10; i++) {
            promises.push(makeRequest('/'));
            requestCount++;
        }
        
        const responses = await Promise.all(promises);
        
        responses.forEach(response => {
            if (response.success) {
                successfulCount++;
            } else {
                failedCount++;
            }
            responseTimes.push(response.responseTime);
        });
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const requestsPerSecond = (requestCount / totalTime) * 1000;
    
    console.log(`✅ Sustained Load Results:`);
    console.log(`   Total Requests: ${requestCount}`);
    console.log(`   Successful: ${successfulCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
    
    return { 
        totalRequests: requestCount, 
        successful: successfulCount, 
        failed: failedCount, 
        requestsPerSecond: requestsPerSecond,
        avgResponseTime,
        totalTime 
    };
}

// Test 4: Memory and Resource Usage
async function testResourceUsage() {
    console.log('\n💾 Testing Resource Usage...');
    
    const initialMemory = process.memoryUsage();
    console.log(`   Initial Memory Usage:`);
    console.log(`     RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    // Run heavy load test
    const promises = [];
    for (let i = 0; i < 100; i++) {
        promises.push(makeRequest('/'));
    }
    
    await Promise.all(promises);
    
    const finalMemory = process.memoryUsage();
    console.log(`   Final Memory Usage:`);
    console.log(`     RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Total: ${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    const memoryIncrease = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
    };
    
    console.log(`   Memory Increase:`);
    console.log(`     RSS: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Total: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    return { initialMemory, finalMemory, memoryIncrease };
}

// Test 5: Error Handling Under Load
async function testErrorHandling() {
    console.log('\n🚨 Testing Error Handling Under Load...');
    const promises = [];
    
    // Mix of valid and invalid requests
    for (let i = 0; i < 20; i++) {
        promises.push(makeRequest('/')); // Valid request
        promises.push(makeRequest('/invalid-endpoint')); // Invalid request
        promises.push(makeRequest('/api/auth/register', 'POST', { invalid: 'data' })); // Invalid data
    }
    
    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;
    const errorTypes = {};
    
    responses.forEach(response => {
        if (!response.success) {
            const status = response.status;
            errorTypes[status] = (errorTypes[status] || 0) + 1;
        }
    });
    
    console.log(`✅ Error Handling Results:`);
    console.log(`   Total Requests: ${responses.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Error Types:`, errorTypes);
    
    return { successful, failed, errorTypes };
}

// Main test runner
async function runLoadTests() {
    console.log('🚀 Starting Load Tests for CRM Dashboard Backend');
    console.log('=' .repeat(60));
    
    const overallStartTime = performance.now();
    
    try {
        // Test 1: Health Check
        const healthResults = await testHealthCheck();
        
        // Test 2: Authentication
        const authResults = await testAuthentication();
        
        // Test 3: Sustained Load
        const sustainedResults = await testSustainedLoad();
        
        // Test 4: Resource Usage
        const resourceResults = await testResourceUsage();
        
        // Test 5: Error Handling
        const errorResults = await testErrorHandling();
        
        const overallEndTime = performance.now();
        const totalTestTime = overallEndTime - overallStartTime;
        
        // Summary
        console.log('\n📊 LOAD TEST SUMMARY');
        console.log('=' .repeat(60));
        console.log(`Total Test Duration: ${(totalTestTime / 1000).toFixed(2)} seconds`);
        console.log(`\n🏥 Health Check: ${healthResults.successful}/${CONCURRENT_REQUESTS} successful`);
        console.log(`🔐 Authentication: ${authResults.successful}/${CONCURRENT_REQUESTS} successful`);
        console.log(`⚡ Sustained Load: ${sustainedResults.requestsPerSecond.toFixed(2)} requests/second`);
        console.log(`💾 Memory Usage: ${(resourceResults.memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB increase`);
        console.log(`🚨 Error Handling: ${errorResults.successful}/${errorResults.successful + errorResults.failed} successful`);
        
        // Performance Rating
        let performanceRating = 'EXCELLENT';
        if (sustainedResults.requestsPerSecond < 50) performanceRating = 'GOOD';
        if (sustainedResults.requestsPerSecond < 20) performanceRating = 'FAIR';
        if (sustainedResults.requestsPerSecond < 10) performanceRating = 'POOR';
        
        console.log(`\n🎯 Performance Rating: ${performanceRating}`);
        console.log(`📈 Server Capacity: Can handle ${sustainedResults.requestsPerSecond.toFixed(0)} requests/second`);
        
    } catch (error) {
        console.error('❌ Load test failed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    runLoadTests().then(() => {
        console.log('\n✅ Load testing completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Load testing failed:', error);
        process.exit(1);
    });
}

module.exports = { runLoadTests };
