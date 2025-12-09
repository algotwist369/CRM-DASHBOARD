import React from 'react';
import { FaChartPie, FaInfoCircle } from 'react-icons/fa';
import BackButton from '../../../components/common/Button/BackButton';

const InventoryInsights = () => {
    // This page will be populated with actual analytics in the future
    // For nowyou can use mock data or fetch from backend when ready

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaChartPie className="text-primary-600" />
                    Inventory Insights & Analytics
                </h1>
                <p className="text-gray-600 mt-1">Detailed inventory performance and recommendations</p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                <FaInfoCircle className="text-blue-600 text-4xl mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Advanced Analytics Coming Soon</h2>
                <p className="text-blue-700">
                    Inventory turnover rates, wastage analysis, stock recommendations, and more will be available here.
                </p>
            </div>

            {/* Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Turnover Rates</h3>
                    <p className="text-sm text-gray-600">Track how quickly products are being used</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Wastage Analysis</h3>
                    <p className="text-sm text-gray-600">Identify products with high wastage</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Stock Recommendations</h3>
                    <p className="text-sm text-gray-600">AI-powered reorder suggestions</p>
                </div>
            </div>
        </div>
    );
};

export default InventoryInsights;
