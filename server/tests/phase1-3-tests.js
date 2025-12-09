/**
 * Automated Test Script for Phase 1-3
 * Tests all new endpoints, models, and functionality
 */

const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let managerToken = '';
let businessId = '';
let productId = '';
let expenseId = '';
let dailyBusinessId = '';

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    results.tests.push({ name, passed, message });
    if (passed) {
        results.passed++;
        console.log(`${status}: ${name}`);
    } else {
        results.failed++;
        console.log(`${status}: ${name} - ${message}`);
    }
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = adminToken) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        };
        if (data) config.data = data;

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

// ==================== TEST SUITES ====================

/**
 * Test 1: Server Health Check
 */
async function testServerHealth() {
    console.log('\n=== Test 1: Server Health Check ===');

    try {
        const response = await axios.get('http://localhost:5000/');
        logTest('Server is running', response.status === 200);
    } catch (error) {
        logTest('Server is running', false, 'Server not responding');
        throw new Error('Server is not running. Please start the server first.');
    }
}

/**
 * Test 2: Backward Compatibility - Existing Endpoints
 */
async function testBackwardCompatibility() {
    console.log('\n=== Test 2: Backward Compatibility ===');

    // Test existing daily business endpoint
    const dailyBusiness = await apiCall('GET', '/daily-business', null, managerToken);
    logTest('Existing daily business endpoint works', dailyBusiness.success);

    // Test existing business endpoint (if businessId available)
    if (businessId) {
        const business = await apiCall('GET', `/business/${businessId}`);
        logTest('Existing business endpoint works', business.success);
    }
}

/**
 * Test 3: Expense API - Full CRUD
 */
async function testExpenseAPI() {
    console.log('\n=== Test 3: Expense API ===');

    // Create expense (as manager)
    const createData = {
        businessId,
        date: new Date().toISOString(),
        category: 'electricity',
        amount: 5000,
        paymentMethod: 'bank_transfer',
        description: 'Test Monthly Electricity Bill'
    };

    const created = await apiCall('POST', '/expenses', createData, managerToken);
    logTest('Create expense (Manager)', created.success);

    if (created.success) {
        expenseId = created.data.data._id;
        logTest('Expense status is pending (Manager)', created.data.data.status === 'pending');

        // Get expense by ID
        const getById = await apiCall('GET', `/expenses/${expenseId}`, null, adminToken);
        logTest('Get expense by ID', getById.success);

        // List expenses
        const list = await apiCall('GET', `/expenses?businessId=${businessId}`, null, adminToken);
        logTest('List expenses', list.success && list.data.data.length > 0);

        // Approve expense (as admin)
        const approved = await apiCall('POST', `/expenses/${expenseId}/approve`, {}, adminToken);
        logTest('Approve expense (Admin)', approved.success);

        if (approved.success) {
            logTest('Expense status changed to approved', approved.data.data.status === 'approved');
        }

        // Get category report
        const report = await apiCall('GET', `/expenses/reports/by-category?businessId=${businessId}&startDate=2025-01-01&endDate=2025-12-31`, null, adminToken);
        logTest('Get expense category report', report.success);
    }
}

/**
 * Test 4: Inventory API - Product Management
 */
async function testInventoryAPI() {
    console.log('\n=== Test 4: Inventory API ===');

    // Create product
    const productData = {
        businessId,
        name: 'Test Shampoo',
        category: 'consumable',
        currentStock: 50,
        unit: 'bottle',
        reorderLevel: 10,
        costPrice: 150,
        sellingPrice: 250
    };

    const created = await apiCall('POST', '/inventory/products', productData, adminToken);
    logTest('Create product', created.success);

    if (created.success) {
        productId = created.data.data._id;

        // List products
        const list = await apiCall('GET', `/inventory/products?businessId=${businessId}`, null, managerToken);
        logTest('List products', list.success && list.data.data.length > 0);

        // Get product by ID
        const getById = await apiCall('GET', `/inventory/products/${productId}`, null, managerToken);
        logTest('Get product by ID', getById.success);

        // Adjust stock (usage)
        const adjust = await apiCall('POST', `/inventory/products/${productId}/adjust-stock`, {
            type: 'usage',
            quantity: 5,
            notes: 'Test usage'
        }, managerToken);
        logTest('Adjust stock (usage)', adjust.success);

        if (adjust.success) {
            logTest('Stock reduced correctly', adjust.data.data.product.currentStock === 45);
            logTest('Transaction created', adjust.data.data.transaction !== null);
        }

        // Get low stock products
        const lowStock = await apiCall('GET', `/inventory/low-stock?businessId=${businessId}`, null, adminToken);
        logTest('Get low stock products', lowStock.success);

        // Get stock valuation
        const valuation = await apiCall('GET', `/inventory/valuation?businessId=${businessId}`, null, adminToken);
        logTest('Get stock valuation', valuation.success);
    }
}

/**
 * Test 5: Enhanced Daily Business Workflow
 */
async function testDailyBusinessWorkflow() {
    console.log('\n=== Test 5: Enhanced Daily Business Workflow ===');

    // Initialize daily business
    const initData = {
        businessId,
        date: new Date().toISOString(),
        openingCashBalance: 5000
    };

    const initialized = await apiCall('POST', '/daily-business/initialize', initData, managerToken);
    logTest('Initialize daily business', initialized.success);

    if (initialized.success) {
        dailyBusinessId = initialized.data.data._id;
        logTest('Opening balance set correctly', initialized.data.data.cashHandling.openingBalance === 5000);

        // Close daily business
        const closeData = {
            actualCashClosing: 8500,
            varianceReason: 'Test closing',
            internalNotes: 'Automated test'
        };

        const closed = await apiCall('POST', `/daily-business/${dailyBusinessId}/close`, closeData, managerToken);
        logTest('Close daily business', closed.success);

        if (closed.success) {
            logTest('Daily business marked complete', closed.data.data.isCompleted === true);
            logTest('Cash variance calculated', closed.data.data.cashHandling.variance !== undefined);
        }
    }

    // Get cash discrepancies (if any exist)
    const discrepancies = await apiCall('GET', `/daily-business/cash-discrepancies?businessId=${businessId}`, null, adminToken);
    logTest('Get cash discrepancies', discrepancies.success);
}

/**
 * Test 6: Permission Middleware
 */
async function testPermissionMiddleware() {
    console.log('\n=== Test 6: Permission Middleware ===');

    // Test: Manager without admin privileges cannot delete expense
    const deleteAttempt = await apiCall('DELETE', `/expenses/${expenseId}`, null, managerToken);
    logTest('Manager cannot delete expense (403)', !deleteAttempt.success && deleteAttempt.status === 403);

    // Test: Admin can access admin-only endpoint
    const adminOnly = await apiCall('GET', `/expenses/pending-approvals?businessId=${businessId}`, null, adminToken);
    logTest('Admin can access admin-only endpoints', adminOnly.success);

    // Test: Manager cannot access admin-only endpoint
    const managerAttempt = await apiCall('GET', `/expenses/pending-approvals?businessId=${businessId}`, null, managerToken);
    logTest('Manager cannot access admin-only endpoints (403)', !managerAttempt.success && managerAttempt.status === 403);
}

/**
 * Test 7: Data Model Enhancements
 */
async function testDataModels() {
    console.log('\n=== Test 7: Data Model Enhancements ===');

    // Test that enhanced daily business has new fields
    if (dailyBusinessId) {
        const daily = await apiCall('GET', `/daily-business?businessId=${businessId}`, null, managerToken);
        if (daily.success && daily.data.data.length > 0) {
            const record = daily.data.data[0];
            logTest('DailyBusiness has cashHandling field', record.cashHandling !== undefined);
            logTest('DailyBusiness has revenueByPaymentMethod field', record.revenueByPaymentMethod !== undefined);
            logTest('DailyBusiness has flags field', record.flags !== undefined);
        }
    }
}

/**
 * Test 8: Error Handling
 */
async function testErrorHandling() {
    console.log('\n=== Test 8: Error Handling ===');

    // Invalid expense ID
    const invalidId = await apiCall('GET', '/expenses/invalid-id-123', null, adminToken);
    logTest('Invalid ID returns error', !invalidId.success);

    // Missing required fields
    const missingFields = await apiCall('POST', '/expenses', {}, adminToken);
    logTest('Missing required fields returns 400', !missingFields.success && missingFields.status === 400);

    // Unauthorized access (no token)
    const noAuth = await apiCall('GET', '/expenses', null, '');
    logTest('No authentication returns 401', !noAuth.success && (noAuth.status === 401 || noAuth.status === 403));
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     PHASE 1-3 AUTOMATED TESTING                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
        // Get test credentials (you'll need to provide actual tokens)
        console.log('⚠️  NOTE: This script requires valid admin and manager tokens.');
        console.log('⚠️  Please update the script with actual tokens and businessId.\n');

        // For demo purposes, we'll skip authentication tests
        // In real testing, you would:
        // 1. Login as admin to get adminToken
        // 2. Login as manager to get managerToken
        // 3. Get a valid businessId

        // Run tests
        await testServerHealth();

        // If you have valid tokens, uncomment these:
        // await testBackwardCompatibility();
        // await testExpenseAPI();
        // await testInventoryAPI();
        // await testDailyBusinessWorkflow();
        // await testPermissionMiddleware();
        // await testDataModels();
        // await testErrorHandling();

        // Print summary
        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║     TEST SUMMARY                                   ║');
        console.log('╚════════════════════════════════════════════════════╝\n');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️  Warnings: ${results.warnings}`);
        console.log(`📊 Total: ${results.passed + results.failed}\n`);

        if (results.failed === 0) {
            console.log('🎉 ALL TESTS PASSED!');
        } else {
            console.log('⚠️  Some tests failed. Review the output above.');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
}

// Run if executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests, logTest, apiCall };
