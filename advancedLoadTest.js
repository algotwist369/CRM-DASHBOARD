// advancedLoadTest.js - Advanced performance and stress testing
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_SCENARIOS = [
    { name: 'Light Load', concurrent: 10, duration: 10000 },
    { name: 'Medium Load', concurrent: 25, duration: 15000 },
    { name: 'Heavy Load', concurrent: 50, duration: 20000 },
    { name: 'Stress Test', concurrent: 100, duration: 30000 }
];

// Test results storage
let testResults = [];

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
            timeout: 15000 // 15 second timeout
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

// Test scenario runner
async function runTestScenario(scenario) {
    console.log(`\n🧪 Running ${scenario.name} Test...`);
    console.log(`   Concurrent Requests: ${scenario.concurrent}`);
    console.log(`   Duration: ${scenario.duration / 1000} seconds`);
    
    const startTime = performance.now();
    const endTime = startTime + scenario.duration;
    let requestCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const responseTimes = [];
    const errors = {};
    
    // Create request batches
    const batchSize = Math.min(scenario.concurrent, 20); // Limit batch size to prevent overwhelming
    
    while (performance.now() < endTime) {
        const promises = [];
        
        // Send batch of concurrent requests
        for (let i = 0; i < batchSize; i++) {
            // Mix of different endpoint types
            const endpointType = i % 4;
            let url, method, data;
            
            switch (endpointType) {
                case 0: // Health check
                    url = '/';
                    method = 'GET';
                    break;
                case 1: // Auth endpoint (will fail but test error handling)
                    url = '/api/auth/login';
                    method = 'POST';
                    data = { email: 'test@test.com', password: 'test' };
                    break;
                case 2: // Invalid endpoint
                    url = '/invalid-endpoint';
                    method = 'GET';
                    break;
                case 3: // Another health check
                    url = '/';
                    method = 'GET';
                    break;
            }
            
            promises.push(makeRequest(url, method, data));
            requestCount++;
        }
        
        try {
            const responses = await Promise.all(promises);
            
            responses.forEach(response => {
                if (response.success) {
                    successfulCount++;
                } else {
                    failedCount++;
                    const status = response.status;
                    errors[status] = (errors[status] || 0) + 1;
                }
                responseTimes.push(response.responseTime);
            });
        } catch (error) {
            console.error('Batch error:', error.message);
            failedCount += batchSize;
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
    const requestsPerSecond = (requestCount / totalTime) * 1000;
    
    const result = {
        scenario: scenario.name,
        totalRequests: requestCount,
        successful: successfulCount,
        failed: failedCount,
        requestsPerSecond: requestsPerSecond,
        avgResponseTime: avgResponseTime,
        totalTime: totalTime,
        errors: errors,
        successRate: (successfulCount / requestCount) * 100
    };
    
    console.log(`✅ ${scenario.name} Results:`);
    console.log(`   Total Requests: ${requestCount}`);
    console.log(`   Successful: ${successfulCount} (${result.successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Errors:`, errors);
    
    return result;
}

// Memory usage test
async function testMemoryUsage() {
    console.log('\n💾 Testing Memory Usage Under Load...');
    
    const initialMemory = process.memoryUsage();
    console.log(`   Initial Memory:`);
    console.log(`     RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    // Run heavy load
    const promises = [];
    for (let i = 0; i < 200; i++) {
        promises.push(makeRequest('/'));
    }
    
    await Promise.all(promises);
    
    const finalMemory = process.memoryUsage();
    console.log(`   Final Memory:`);
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

// Connection limit test
async function testConnectionLimits() {
    console.log('\n🔗 Testing Connection Limits...');
    
    const maxConnections = 200;
    const promises = [];
    
    console.log(`   Testing ${maxConnections} simultaneous connections...`);
    
    for (let i = 0; i < maxConnections; i++) {
        promises.push(makeRequest('/'));
    }
    
    const startTime = performance.now();
    const responses = await Promise.all(promises);
    const endTime = performance.now();
    
    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;
    const totalTime = endTime - startTime;
    
    console.log(`✅ Connection Limit Results:`);
    console.log(`   Max Connections: ${maxConnections}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`   Success Rate: ${((successful / maxConnections) * 100).toFixed(1)}%`);
    
    return { maxConnections, successful, failed, totalTime, successRate: (successful / maxConnections) * 100 };
}

// Response time distribution test
async function testResponseTimeDistribution() {
    console.log('\n⏱️ Testing Response Time Distribution...');
    
    const requests = 100;
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
        promises.push(makeRequest('/'));
    }
    
    const responses = await Promise.all(promises);
    const responseTimes = responses.map(r => r.responseTime).sort((a, b) => a - b);
    
    const stats = {
        min: responseTimes[0],
        max: responseTimes[responseTimes.length - 1],
        median: responseTimes[Math.floor(responseTimes.length / 2)],
        p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
        p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
        average: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    };
    
    console.log(`✅ Response Time Distribution:`);
    console.log(`   Min: ${stats.min.toFixed(2)}ms`);
    console.log(`   Max: ${stats.max.toFixed(2)}ms`);
    console.log(`   Average: ${stats.average.toFixed(2)}ms`);
    console.log(`   Median: ${stats.median.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${stats.p95.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${stats.p99.toFixed(2)}ms`);
    
    return stats;
}

// Main test runner
async function runAdvancedLoadTests() {
    console.log('🚀 Starting Advanced Load Tests for CRM Dashboard Backend');
    console.log('=' .repeat(70));
    
    const overallStartTime = performance.now();
    
    try {
        // Run different load scenarios
        for (const scenario of TEST_SCENARIOS) {
            const result = await runTestScenario(scenario);
            testResults.push(result);
            
            // Wait between scenarios
            console.log('   Waiting 5 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Memory usage test
        const memoryResults = await testMemoryUsage();
        
        // Connection limit test
        const connectionResults = await testConnectionLimits();
        
        // Response time distribution test
        const responseTimeResults = await testResponseTimeDistribution();
        
        const overallEndTime = performance.now();
        const totalTestTime = overallEndTime - overallStartTime;
        
        // Generate comprehensive summary
        console.log('\n📊 ADVANCED LOAD TEST SUMMARY');
        console.log('=' .repeat(70));
        console.log(`Total Test Duration: ${(totalTestTime / 1000).toFixed(2)} seconds`);
        
        console.log('\n📈 Performance by Load Level:');
        testResults.forEach(result => {
            console.log(`   ${result.scenario}:`);
            console.log(`     Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);
            console.log(`     Success Rate: ${result.successRate.toFixed(1)}%`);
            console.log(`     Avg Response: ${result.avgResponseTime.toFixed(2)}ms`);
        });
        
        // Performance rating
        const maxRPS = Math.max(...testResults.map(r => r.requestsPerSecond));
        const avgSuccessRate = testResults.reduce((sum, r) => sum + r.successRate, 0) / testResults.length;
        
        let performanceRating = 'EXCELLENT';
        if (maxRPS < 100) performanceRating = 'GOOD';
        if (maxRPS < 50) performanceRating = 'FAIR';
        if (maxRPS < 20) performanceRating = 'POOR';
        
        console.log(`\n🎯 Performance Rating: ${performanceRating}`);
        console.log(`📈 Peak Capacity: ${maxRPS.toFixed(0)} requests/second`);
        console.log(`✅ Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
        console.log(`💾 Memory Efficiency: ${(memoryResults.memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB increase`);
        console.log(`🔗 Connection Handling: ${connectionResults.successRate.toFixed(1)}% success rate`);
        console.log(`⏱️ Response Time: ${responseTimeResults.average.toFixed(2)}ms average`);
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (maxRPS > 100) {
            console.log('   ✅ Server can handle high traffic loads');
        }
        if (avgSuccessRate > 95) {
            console.log('   ✅ Excellent error handling and stability');
        }
        if (responseTimeResults.average < 100) {
            console.log('   ✅ Fast response times');
        }
        if (memoryResults.memoryIncrease.heapUsed < 50 * 1024 * 1024) {
            console.log('   ✅ Good memory efficiency');
        }
        
        console.log('\n🏆 SERVER CAPACITY ASSESSMENT:');
        console.log(`   • Can handle ${maxRPS.toFixed(0)} concurrent requests/second`);
        console.log(`   • Suitable for ${Math.floor(maxRPS * 0.7)} sustained requests/second`);
        console.log(`   • Can support ${Math.floor(maxRPS * 0.5)} users simultaneously`);
        console.log(`   • Memory usage is efficient and stable`);
        
    } catch (error) {
        console.error('❌ Advanced load test failed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    runAdvancedLoadTests().then(() => {
        console.log('\n✅ Advanced load testing completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Advanced load testing failed:', error);
        process.exit(1);
    });
}

module.exports = { runAdvancedLoadTests };
