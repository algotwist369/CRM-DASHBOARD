
const axios = require('axios');

// Mock the API client
const apiClient = {
    get: async (url, config) => {
        console.log(`GET ${url}`, config);
        // Simulate backend response based on adminController.js
        if (url === '/api/admin/businesses') {
            return {
                data: {
                    success: true,
                    data: [{ id: 1, name: 'Test Business' }],
                    pagination: {
                        total: 1,
                        page: 1,
                        limit: 10,
                        pages: 1
                    }
                }
            };
        }
        return { data: {} };
    }
};

// Mock adminService.getBusinesses
const getBusinesses = async (params = {}) => {
    try {
        const response = await apiClient.get('/api/admin/businesses', { params });
        // This matches adminService.js line 322: return { success: true, ...response.data }
        return { success: true, ...response.data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
};

async function test() {
    const res = await getBusinesses({ page: 1, limit: 10 });
    console.log('Result:', JSON.stringify(res, null, 2));

    // Check how BusinessList.jsx accesses it
    const list = res.data?.data || res.data?.businesses || [];
    console.log('BusinessList.jsx list access (res.data?.data):', list);

    const correctList = res.data || [];
    console.log('Correct list access (res.data):', correctList);

    const pagination = res.data?.pagination;
    console.log('BusinessList.jsx pagination access (res.data?.pagination):', pagination);

    const correctPagination = res.pagination;
    console.log('Correct pagination access (res.pagination):', correctPagination);
}

test();
