import React from 'react';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import BackButton from '../../../components/common/Button/BackButton';

const ProfitabilityAnalysis = () => {
    // This page will show profitability insights using Phase 3 analytics
    // Will connect to enhancedBusinessUtils.js functions

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaChartLine className="text-primary-600" />
                    Profitability Analysis
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive profit & loss insights</p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                <FaInfoCircle className="text-green-600 text-4xl mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-green-900 mb-2">Advanced Profitability Analytics Coming Soon</h2>
                <p className="text-green-700">
                    Revenue analysis, expense breakdowns, profit margins, cash flow, and business health insights.
                </p>
            </div>

            {/* Placeholder Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <p className="text-xs font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <p className="text-xs font-medium text-gray-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <p className="text-xs font-medium text-gray-500">Net Profit</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹0</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <p className="text-xs font-medium text-gray-500">Profit Margin</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
            </div>

            {/* Placeholder Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-400">Chart will appear here</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 p-6 opacity-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-400">Pie chart will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitabilityAnalysis;
