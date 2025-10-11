// performanceTest.js - High-performance testing for 100k monthly users
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration for 100k monthly users
const BASE_URL = 'http://localhost:5000';
const MONTHLY_USERS = 100000;
const DAILY_ACTIVE_USERS = Math.floor(MONTHLY_USERS * 0.1); // 10% daily active
const PEAK_HOUR_USERS = Math.floor(DAILY_ACTIVE_USERS * 0.3); // 30% during peak hour
const CONCURRENT_USERS = Math.floor(PEAK_HOUR_USERS * 0.1); // 10% concurrent

// Test scenarios
const TEST_SCENARIOS = [
    {
        name: 'Light Load (1k users)',
        concurrent: 100,
        duration: 30000,
        expectedRPS: 50
    },
    {
        name: 'Medium Load (5k users)',
        concurrent: 500,
        duration: 60000,
        expectedRPS: 200
    },
    {
        name: 'Heavy Load (10k users)',
        concurrent: 1000,
        duration: 90000,
        expectedRPS: 500
    },
    {
        name: 'Peak Load (20k users)',
        concurrent: 2000,
        duration: 120000,
        expectedRPS: 1000
    }
];

// Performance metrics
let performanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    throughput: [],
    errors: {},
    startTime: null,
    endTime: null
};

// Helper function to make HTTP requests with retry logic
async function makeRequest(url, method = 'GET', data = null, headers = {}, retries = 3) {
    const startTime = performance.now();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${url}`,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                timeout: 10000,
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
                attempt
            };
        } catch (error) {
            if (attempt === retries) {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                return {
                    success: false,
                    status: error.response?.status || 0,
                    responseTime,
                    error: error.message,
                    attempt
                };
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
    }
}

// Test scenario runner with advanced metrics
async function runPerformanceTest(scenario) {
    console.log(`\n🚀 Running ${scenario.name}...`);
    console.log(`   Concurrent Users: ${scenario.concurrent}`);
    console.log(`   Duration: ${scenario.duration / 1000} seconds`);
    console.log(`   Expected RPS: ${scenario.expectedRPS}`);
    
    const startTime = performance.now();
    const endTime = startTime + scenario.duration;
    let requestCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const responseTimes = [];
    const throughput = [];
    const errors = {};
    
    // Create request batches
    const batchSize = Math.min(scenario.concurrent, 100);
    const batchInterval = 100; // 100ms between batches
    
    console.log(`   Starting load test...`);
    
    while (performance.now() < endTime) {
        const batchStartTime = performance.now();
        const promises = [];
        
        // Create batch of requests
        for (let i = 0; i < batchSize; i++) {
            const requestType = i % 5; // Distribute request types
            let url, method, data;
            
            switch (requestType) {
                case 0: // Health check (40%)
                    url = '/';
                    method = 'GET';
                    break;
                case 1: // Auth endpoint (20%)
                    url = '/api/auth/login';
                    method = 'POST';
                    data = { email: 'test@test.com', password: 'test' };
                    break;
                case 2: // Business info (20%)
                    url = '/api/appointments/business/test_business/slots?date=2025-09-20';
                    method = 'GET';
                    break;
                case 3: // Invalid endpoint (10%)
                    url = '/invalid-endpoint';
                    method = 'GET';
                    break;
                case 4: // Another health check (10%)
                    url = '/';
                    method = 'GET';
                    break;
            }
            
            promises.push(makeRequest(url, method, data));
            requestCount++;
        }
        
        try {
            const responses = await Promise.all(promises);
            const batchEndTime = performance.now();
            const batchDuration = batchEndTime - batchStartTime;
            const batchRPS = (batchSize / batchDuration) * 1000;
            
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
            
            throughput.push({
                timestamp: batchEndTime,
                rps: batchRPS,
                requests: batchSize,
                duration: batchDuration
            });
            
        } catch (error) {
            console.error('Batch error:', error.message);
            failedCount += batchSize;
        }
        
        // Wait before next batch
        await new Promise(resolve => setTimeout(resolve, batchInterval));
    }
    
    const totalTime = performance.now() - startTime;
    const avgResponseTime = responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
    const requestsPerSecond = (requestCount / totalTime) * 1000;
    const avgThroughput = throughput.length > 0 ?
        throughput.reduce((sum, t) => sum + t.rps, 0) / throughput.length : 0;
    
    // Calculate percentiles
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
    const p50 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)];
    const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)];
    const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)];
    
    const result = {
        scenario: scenario.name,
        totalRequests: requestCount,
        successful: successfulCount,
        failed: failedCount,
        requestsPerSecond: requestsPerSecond,
        avgThroughput: avgThroughput,
        avgResponseTime: avgResponseTime,
        p50ResponseTime: p50,
        p95ResponseTime: p95,
        p99ResponseTime: p99,
        totalTime: totalTime,
        errors: errors,
        successRate: (successfulCount / requestCount) * 100,
        meetsExpectations: requestsPerSecond >= scenario.expectedRPS * 0.8 // 80% of expected
    };
    
    console.log(`✅ ${scenario.name} Results:`);
    console.log(`   Total Requests: ${requestCount.toLocaleString()}`);
    console.log(`   Successful: ${successfulCount.toLocaleString()} (${result.successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${failedCount.toLocaleString()}`);
    console.log(`   Requests/Second: ${requestsPerSecond.toFixed(2)}`);
    console.log(`   Avg Throughput: ${avgThroughput.toFixed(2)} RPS`);
    console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   P50 Response Time: ${p50.toFixed(2)}ms`);
    console.log(`   P95 Response Time: ${p95.toFixed(2)}ms`);
    console.log(`   P99 Response Time: ${p99.toFixed(2)}ms`);
    console.log(`   Meets Expectations: ${result.meetsExpectations ? '✅' : '❌'}`);
    console.log(`   Errors:`, errors);
    
    return result;
}

// Memory and resource monitoring
async function monitorResources() {
    console.log('\n💾 Resource Monitoring...');
    
    const initialMemory = process.memoryUsage();
    console.log(`   Initial Memory:`);
    console.log(`     RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    // Run a heavy load test
    const promises = [];
    for (let i = 0; i < 500; i++) {
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

// Calculate capacity for 100k monthly users
function calculateCapacity(results) {
    console.log('\n📊 Capacity Analysis for 100k Monthly Users...');
    
    const maxRPS = Math.max(...results.map(r => r.requestsPerSecond));
    const avgRPS = results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / results.length;
    
    // Calculate capacity metrics
    const dailyCapacity = maxRPS * 86400; // requests per day
    const monthlyCapacity = dailyCapacity * 30; // requests per month
    
    // User capacity estimates
    const requestsPerUserPerDay = 10; // Average requests per user per day
    const requestsPerUserPerMonth = requestsPerUserPerDay * 30;
    
    const maxDailyUsers = Math.floor(dailyCapacity / requestsPerUserPerDay);
    const maxMonthlyUsers = Math.floor(monthlyCapacity / requestsPerUserPerMonth);
    
    console.log(`   Peak RPS: ${maxRPS.toFixed(2)}`);
    console.log(`   Average RPS: ${avgRPS.toFixed(2)}`);
    console.log(`   Daily Capacity: ${dailyCapacity.toLocaleString()} requests`);
    console.log(`   Monthly Capacity: ${monthlyCapacity.toLocaleString()} requests`);
    console.log(`   Max Daily Users: ${maxDailyUsers.toLocaleString()}`);
    console.log(`   Max Monthly Users: ${maxMonthlyUsers.toLocaleString()}`);
    
    const canHandle100k = maxMonthlyUsers >= 100000;
    console.log(`   Can Handle 100k Monthly Users: ${canHandle100k ? '✅ YES' : '❌ NO'}`);
    
    if (canHandle100k) {
        const headroom = ((maxMonthlyUsers - 100000) / 100000) * 100;
        console.log(`   Headroom: ${headroom.toFixed(1)}% above 100k users`);
    } else {
        const shortfall = ((100000 - maxMonthlyUsers) / 100000) * 100;
        console.log(`   Shortfall: ${shortfall.toFixed(1)}% below 100k users`);
    }
    
    return {
        maxRPS,
        avgRPS,
        dailyCapacity,
        monthlyCapacity,
        maxDailyUsers,
        maxMonthlyUsers,
        canHandle100k,
        headroom: canHandle100k ? ((maxMonthlyUsers - 100000) / 100000) * 100 : 0
    };
}

// Main performance test runner
async function runPerformanceTests() {
    console.log('🚀 Starting High-Performance Tests for 100k Monthly Users');
    console.log('=' .repeat(80));
    console.log(`Target: ${MONTHLY_USERS.toLocaleString()} monthly users`);
    console.log(`Daily Active: ${DAILY_ACTIVE_USERS.toLocaleString()} users`);
    console.log(`Peak Hour: ${PEAK_HOUR_USERS.toLocaleString()} users`);
    console.log(`Concurrent: ${CONCURRENT_USERS.toLocaleString()} users`);
    console.log('=' .repeat(80));
    
    const overallStartTime = performance.now();
    const results = [];
    
    try {
        // Run performance tests
        for (const scenario of TEST_SCENARIOS) {
            const result = await runPerformanceTest(scenario);
            results.push(result);
            
            // Wait between scenarios
            console.log('   Waiting 10 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
        // Monitor resources
        const resourceResults = await monitorResources();
        
        const overallEndTime = performance.now();
        const totalTestTime = overallEndTime - overallStartTime;
        
        // Calculate capacity
        const capacityResults = calculateCapacity(results);
        
        // Generate comprehensive report
        console.log('\n📊 PERFORMANCE TEST SUMMARY');
        console.log('=' .repeat(80));
        console.log(`Total Test Duration: ${(totalTestTime / 1000).toFixed(2)} seconds`);
        
        console.log('\n📈 Performance by Load Level:');
        results.forEach(result => {
            console.log(`   ${result.scenario}:`);
            console.log(`     RPS: ${result.requestsPerSecond.toFixed(2)}`);
            console.log(`     Success Rate: ${result.successRate.toFixed(1)}%`);
            console.log(`     Avg Response: ${result.avgResponseTime.toFixed(2)}ms`);
            console.log(`     P95 Response: ${result.p95ResponseTime.toFixed(2)}ms`);
            console.log(`     Meets Expectations: ${result.meetsExpectations ? '✅' : '❌'}`);
        });
        
        // Performance rating
        const allTestsPass = results.every(r => r.meetsExpectations);
        const canHandle100k = capacityResults.canHandle100k;
        
        let performanceRating = 'EXCELLENT';
        if (!canHandle100k) performanceRating = 'NEEDS_OPTIMIZATION';
        else if (!allTestsPass) performanceRating = 'GOOD';
        else if (capacityResults.headroom < 50) performanceRating = 'GOOD';
        
        console.log(`\n🎯 Performance Rating: ${performanceRating}`);
        console.log(`📈 Peak Capacity: ${capacityResults.maxRPS.toFixed(0)} requests/second`);
        console.log(`👥 User Capacity: ${capacityResults.maxMonthlyUsers.toLocaleString()} monthly users`);
        console.log(`✅ Can Handle 100k Users: ${canHandle100k ? 'YES' : 'NO'}`);
        console.log(`💾 Memory Efficiency: ${(resourceResults.memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB increase`);
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (canHandle100k) {
            console.log('   ✅ Server can handle 100k monthly users');
            if (capacityResults.headroom > 100) {
                console.log('   ✅ Excellent headroom for growth');
            } else if (capacityResults.headroom > 50) {
                console.log('   ✅ Good headroom for growth');
            } else {
                console.log('   ⚠️ Consider scaling for future growth');
            }
        } else {
            console.log('   ❌ Server needs optimization for 100k users');
            console.log('   💡 Consider:');
            console.log('     • Horizontal scaling with load balancer');
            console.log('     • Database optimization and indexing');
            console.log('     • Redis clustering for caching');
            console.log('     • CDN for static assets');
        }
        
        console.log('\n🏆 FINAL ASSESSMENT:');
        console.log(`   • Performance: ${performanceRating}`);
        console.log(`   • 100k Users: ${canHandle100k ? '✅ Supported' : '❌ Not Supported'}`);
        console.log(`   • Scalability: ${capacityResults.maxMonthlyUsers > 200000 ? 'Excellent' : 'Good'}`);
        console.log(`   • Production Ready: ${canHandle100k ? '✅ YES' : '❌ Needs Work'}`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    runPerformanceTests().then(() => {
        console.log('\n✅ Performance testing completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Performance testing failed:', error);
        process.exit(1);
    });
}

module.exports = { runPerformanceTests };
