import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineChartBar, HiOutlineFilter, HiOutlineRefresh, HiOutlineGlobe, HiOutlineCursorClick } from 'react-icons/hi';
import leadAnalyticsService from '../../../services/admin/leadAnalyticsService';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import { toast } from 'react-hot-toast';

const SourceAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [dateMode, setDateMode] = useState('single');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [sourceData, setSourceData] = useState([]);
    const [businessFilter, setBusinessFilter] = useState('');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const params = dateMode === 'range'
                ? { startDate, endDate }
                : { date: selectedDate };

            if (businessFilter) {
                params.businessId = businessFilter;
            }

            const response = await leadAnalyticsService.getSourceBreakdown(params);

            if (response.success) {
                setSourceData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch source analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [dateMode, selectedDate, startDate, endDate, businessFilter]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineGlobe className="text-primary-600" />
                        Source Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Breakdown of leads by Traffic Source</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Mode Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
                        <button
                            onClick={() => setDateMode('single')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${dateMode === 'single'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Single Date
                        </button>
                        <button
                            onClick={() => setDateMode('range')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${dateMode === 'range'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Date Range
                        </button>
                    </div>

                    {/* Date Pickers */}
                    {dateMode === 'single' ? (
                        <div className="w-40">
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                placeholder="Select Date"
                                maxDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="w-36">
                                <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    placeholder="Start Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="w-36">
                                <DatePicker
                                    value={endDate}
                                    onChange={setEndDate}
                                    placeholder="End Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                    minDate={startDate}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source / Medium</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Visits</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Interactions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sourceData.length > 0 ? (
                                    sourceData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.businessName}</div>
                                                <div className="text-xs text-gray-500">{item.branch}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.source.toLowerCase().includes('google') ? 'bg-red-100 text-red-800' :
                                                            item.source.toLowerCase().includes('facebook') ? 'bg-blue-100 text-blue-800' :
                                                                item.source.toLowerCase().includes('instagram') ? 'bg-pink-100 text-pink-800' :
                                                                    item.source.toLowerCase().includes('direct') ? 'bg-gray-100 text-gray-800' :
                                                                        'bg-green-100 text-green-800'
                                                        }`}>
                                                        {item.source}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.visits}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.interactions}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.visits > 0
                                                    ? `${((item.interactions / item.visits) * 100).toFixed(1)}%`
                                                    : '0%'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No tracking data found for the selected period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SourceAnalytics;
