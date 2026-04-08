import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineRefresh, HiOutlineGlobe, HiOutlineSearch } from 'react-icons/hi';
import leadAnalyticsService from '../../../services/admin/leadAnalyticsService';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import { toast } from 'react-hot-toast';
import { getPlatformStyle } from '../../../utils/common/sourceHelper';

const SourceAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [dateMode, setDateMode] = useState('single');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [sourceData, setSourceData] = useState([]);
    const [businessFilter, setBusinessFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [activeQuickFilter, setActiveQuickFilter] = useState('today');
    const [availablePlatforms, setAvailablePlatforms] = useState([]);

    // Fetch available platforms on mount
    useEffect(() => {
        const fetchPlatforms = async () => {
            const response = await leadAnalyticsService.getAvailableSources();
            if (response.success) {
                setAvailablePlatforms(response.sources || []);
            }
        };
        fetchPlatforms();
    }, []);

    // Helper functions for date calculations
    const getDateString = (daysOffset = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    const applyQuickFilter = (filter) => {
        setActiveQuickFilter(filter);
        switch (filter) {
            case 'today':
                setDateMode('single');
                setSelectedDate(getDateString(0));
                break;
            case 'yesterday':
                setDateMode('single');
                setSelectedDate(getDateString(-1));
                break;
            case 'last7days':
                setDateMode('range');
                setStartDate(getDateString(-7));
                setEndDate(getDateString(0));
                break;
            default:
                break;
        }
    };

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const params = dateMode === 'range'
                ? { startDate, endDate }
                : { date: selectedDate };

            if (businessFilter) {
                params.businessId = businessFilter;
            }

            // Add search and platform filters
            if (searchQuery.trim()) {
                params.search = searchQuery;
            }

            if (platformFilter !== 'all') {
                params.platform = platformFilter;
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
    }, [dateMode, selectedDate, startDate, endDate, businessFilter, searchQuery, platformFilter]);

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
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Search and Platform Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by business name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            />
                        </div>
                    </div>

                    {/* Dynamic Platform Filters */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Filter by Platform:</p>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setPlatformFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${platformFilter === 'all'
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                All Platforms
                            </button>
                            {availablePlatforms.map((platform) => {
                                const style = getPlatformStyle(platform);
                                const isActive = platformFilter === platform;
                                return (
                                    <button
                                        key={platform}
                                        onClick={() => setPlatformFilter(platform)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap flex items-center gap-2 ${isActive
                                            ? `${style.bg} text-white shadow-md`
                                            : `bg-white text-gray-700 border ${style.border} ${style.hover}`
                                            }`}
                                    >
                                        <style.icon className={isActive ? 'text-white' : style.text} />
                                        <span>{style.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* ... (keep existing quick filter code) ... */}
                <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => applyQuickFilter('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeQuickFilter === 'today'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => applyQuickFilter('yesterday')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeQuickFilter === 'yesterday'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                    >
                        Yesterday
                    </button>
                    <button
                        onClick={() => applyQuickFilter('last7days')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeQuickFilter === 'last7days'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                    >
                        Last 7 Days
                    </button>
                </div>

                {/* Custom Date Pickers */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-600">Custom:</span>
                    {dateMode === 'single' ? (
                        <div className="w-40">
                            <DatePicker
                                value={selectedDate}
                                onChange={(date) => { setSelectedDate(date); setActiveQuickFilter(null); }}
                                placeholder="Select Date"
                                maxDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="w-36">
                                <DatePicker
                                    value={startDate}
                                    onChange={(date) => { setStartDate(date); setActiveQuickFilter(null); }}
                                    placeholder="Start Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="w-36">
                                <DatePicker
                                    value={endDate}
                                    onChange={(date) => { setEndDate(date); setActiveQuickFilter(null); }}
                                    placeholder="End Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                    minDate={startDate}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded">
                        <button
                            onClick={() => setDateMode('single')}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${dateMode === 'single'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setDateMode('range')}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${dateMode === 'range'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Range
                        </button>
                    </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Interactions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sourceData && sourceData.length > 0 ? (
                                    sourceData.map((item, index) => {
                                        const style = getPlatformStyle(item.source);
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 text-sm">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{item.businessName}</div>
                                                    <div className="text-xs text-gray-500">{item.branch}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <style.icon className={`text-lg ${style.text}`} />
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${style.pill} ${style.text}`}>
                                                            {style.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {item.visits}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {item.interactions}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                                                    {item.visits > 0
                                                        ? `${((item.interactions / item.visits)).toFixed(1)}`
                                                        : '0'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No tracking data found for the selected filter.
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

