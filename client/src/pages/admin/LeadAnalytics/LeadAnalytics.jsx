import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HiOutlineChartBar, HiOutlineCursorClick, HiOutlinePhone, HiOutlineCalendar, HiOutlineGlobe, HiOutlineRefresh, HiOutlineEye, HiOutlineMail } from 'react-icons/hi';
import { FaWhatsapp } from "react-icons/fa6";
import leadAnalyticsService from '../../../services/admin/leadAnalyticsService';
import DatePicker from '../../../components/common/DatePicker/DatePicker';
import { toast } from 'react-hot-toast';

const StatsCard = React.memo(({ title, value, icon, color }) => (
    <div className="bg-white border border-gray-200 p-6  ">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
                {icon}
            </div>
        </div>
    </div>
));

const LeadAnalytics = () => {
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingBreakdown, setLoadingBreakdown] = useState(true);
    const [loadingJourneys, setLoadingJourneys] = useState(true);
    const [dateMode, setDateMode] = useState('single');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState({
        totalClicks: 0,
        totalCallClicks: 0,
        totalWhatsappClicks: 0,
        totalBookingClicks: 0,
        totalVisits: 0,
        totalInquiries: 0
    });
    const [businessBreakdown, setBusinessBreakdown] = useState([]);
    const [businessPage, setBusinessPage] = useState(1);
    const [totalBusinessPages, setTotalBusinessPages] = useState(1);
    const [loadingMoreBusiness, setLoadingMoreBusiness] = useState(false);
    const businessEndRef = useRef(null);
    const [ipJourneys, setIpJourneys] = useState([]);
    const [ipPage, setIpPage] = useState(1);
    const [totalIpPages, setTotalIpPages] = useState(1);
    const refreshTimeoutRef = useRef(null);

    // Debounce refresh to prevent rapid successive calls
    const debouncedFetchAnalytics = useCallback(async () => {
        try {
            const params = dateMode === 'range' 
                ? { startDate, endDate }
                : { date: selectedDate };

            // Fetch data sections in parallel with their own loading states
            setLoadingSummary(true);
            setLoadingBreakdown(true);
            setLoadingJourneys(true);
            setBusinessPage(1); // Reset business page on new date

            const [summaryRes, breakdownRes, journeyRes] = await Promise.all([
                leadAnalyticsService.getSummary(params),
                leadAnalyticsService.getBusinessBreakdown({ ...params, limit: 50, page: 1 }),
                leadAnalyticsService.getIpJourneys({ ...params, page: ipPage, limit: 20 })
            ]);

            if (summaryRes.success) {
                setSummary(summaryRes.data);
            }

            if (breakdownRes.success) {
                setBusinessBreakdown(breakdownRes.data.data);
                setTotalBusinessPages(breakdownRes.data.pagination.pages);
            }

            if (journeyRes.success) {
                setIpJourneys(journeyRes.data.data);
                setTotalIpPages(journeyRes.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch lead analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoadingSummary(false);
            setLoadingBreakdown(false);
            setLoadingJourneys(false);
        }
    }, [dateMode, selectedDate, startDate, endDate, ipPage]);

    const fetchMoreBusinesses = useCallback(async () => {
        if (businessPage >= totalBusinessPages || loadingMoreBusiness) return;

        try {
            setLoadingMoreBusiness(true);
            const params = dateMode === 'range' 
                ? { startDate, endDate }
                : { date: selectedDate };

            const nextPage = businessPage + 1;
            const breakdownRes = await leadAnalyticsService.getBusinessBreakdown({ 
                ...params, 
                limit: 50, 
                page: nextPage 
            });

            if (breakdownRes.success) {
                setBusinessBreakdown(prev => [...prev, ...breakdownRes.data.data]);
                setBusinessPage(nextPage);
            }
        } catch (error) {
            console.error('Failed to fetch more businesses:', error);
        } finally {
            setLoadingMoreBusiness(false);
        }
    }, [businessPage, totalBusinessPages, dateMode, selectedDate, startDate, endDate, loadingMoreBusiness]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loadingMoreBusiness && businessPage < totalBusinessPages) {
                    fetchMoreBusinesses();
                }
            },
            { threshold: 0.1 }
        );

        if (businessEndRef.current) {
            observer.observe(businessEndRef.current);
        }

        return () => {
            if (businessEndRef.current) {
                observer.unobserve(businessEndRef.current);
            }
        };
    }, [businessPage, totalBusinessPages, loadingMoreBusiness, fetchMoreBusinesses]);

    const fetchAnalytics = useCallback(() => {
        // Clear existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        // Debounce for 300ms
        refreshTimeoutRef.current = setTimeout(debouncedFetchAnalytics, 300);
    }, [debouncedFetchAnalytics]);

    useEffect(() => {
        debouncedFetchAnalytics();
    }, [debouncedFetchAnalytics]);

    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const handleIpPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalIpPages) {
            setIpPage(newPage);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setIpPage(1);
        setBusinessPage(1);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        setIpPage(1);
        setBusinessPage(1);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        setIpPage(1);
        setBusinessPage(1);
    };

    const handleDateModeChange = (mode) => {
        setDateMode(mode);
        setIpPage(1);
        setBusinessPage(1);
    };

    const [expandedJourneyId, setExpandedJourneyId] = useState(null);

    const toggleJourneyExpand = (id) => {
        setExpandedJourneyId(expandedJourneyId === id ? null : id);
    };

    const loading = loadingSummary && !summary.totalClicks;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineCursorClick className="text-primary-600" />
                        Lead Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Real-time anonymous click tracking</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Mode Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
                        <button
                            onClick={() => handleDateModeChange('single')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                dateMode === 'single'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Single Date
                        </button>
                        <button
                            onClick={() => handleDateModeChange('range')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                dateMode === 'range'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Date Range
                        </button>
                    </div>

                    {/* Date Picker(s) */}
                    {dateMode === 'single' ? (
                        <div className="w-48">
                            <DatePicker
                                value={selectedDate}
                                onChange={handleDateChange}
                                placeholder="Select Date"
                                maxDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="w-40">
                                <DatePicker
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    placeholder="Start Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="w-40">
                                <DatePicker
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    placeholder="End Date"
                                    maxDate={new Date().toISOString().split('T')[0]}
                                    minDate={startDate}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-md transition h-[42px]"
                    >
                        <HiOutlineRefresh className="w-5 h-5" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <StatsCard
                    title="Total Inquiries"
                    value={summary.totalInquiries || 0}
                    icon={<HiOutlineMail className="w-6 h-6 text-orange-600" />}
                    color="text-orange-600"
                />
                <StatsCard
                    title="Total Visits"
                    value={summary.totalVisits}
                    icon={<HiOutlineEye className="w-6 h-6 text-indigo-600" />}
                    color="text-indigo-600"
                />
                <StatsCard
                    title="Total Clicks"
                    value={summary.totalClicks}
                    icon={<HiOutlineCursorClick className="w-6 h-6 text-blue-600" />}
                    color="text-blue-600"
                />
                <StatsCard
                    title="Call Clicks"
                    value={summary.totalCallClicks}
                    icon={<HiOutlinePhone className="w-6 h-6 text-green-600" />}
                    color="text-green-600"
                />
                <StatsCard
                    title="WhatsApp Clicks"
                    value={summary.totalWhatsappClicks}
                    icon={<FaWhatsapp className="w-6 h-6 text-green-600" />}
                    color="text-green-600"
                />
                <StatsCard
                    title="Booking Clicks"
                    value={summary.totalBookingClicks}
                    icon={<HiOutlineCalendar className="w-6 h-6 text-purple-600" />}
                    color="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Breakdown */}
                <div className="bg-white border border-gray-200  p-6 ">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <HiOutlineChartBar className="text-gray-500" />
                        Top Businesses ({dateMode === 'range' 
                            ? `${startDate} to ${endDate}` 
                            : new Date(selectedDate).toLocaleDateString()})
                    </h2>
                    {loadingBreakdown ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <div className="max-h-[1400px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WA</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {businessBreakdown.length > 0 ? (
                                        <>
                                            {businessBreakdown.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.businessName}
                                                        <span className="text-gray-500 text-xs block">{item.branch}</span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">{item.totalClicks}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.callClicks}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.whatsappClicks}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.bookingClicks}</td>
                                                </tr>
                                            ))}
                                            {/* Infinite scroll trigger */}
                                            <tr ref={businessEndRef}>
                                                <td colSpan="5" className="px-4 py-4">
                                                    {loadingMoreBusiness && (
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                                            <span className="ml-2 text-sm text-gray-600">Loading more...</span>
                                                        </div>
                                                    )}
                                                    {!loadingMoreBusiness && businessPage >= totalBusinessPages && businessBreakdown.length > 0 && (
                                                        <div className="text-center text-sm text-gray-500">
                                                            End of results
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm">
                                                No clicks recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* IP Journey Log */}
                <div className="bg-white border border-gray-200  p-6  flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <HiOutlineGlobe className="text-gray-500" />
                        Recent IP Journeys
                    </h2>
                    {loadingJourneys ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Page</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {ipJourneys.length > 0 ? (
                                            ipJourneys.map((journey) => (
                                                <React.Fragment key={journey._id}>
                                                    <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleJourneyExpand(journey._id)}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono align-top">
                                                            {journey.ipAddress}
                                                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[150px]">
                                                                {journey.businessId?.name || 'Unknown Business'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-gray-900 truncate max-w-[200px]" title={journey.lastPageVisited}>
                                                                    {journey.lastPageVisited}
                                                                </span>
                                                                <span className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                                    {expandedJourneyId === journey._id ? 'Hide History' : 'View History'}
                                                                    ({journey.pagesVisited?.length || 0})
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 align-top">
                                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                                                {journey.totalClicks} clicks
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 align-top">
                                                            {new Date(journey.lastVisitedAt).toLocaleTimeString()}
                                                        </td>
                                                    </tr>
                                                    {expandedJourneyId === journey._id && (
                                                        <tr className="bg-gray-50">
                                                            <td colSpan="4" className="px-4 py-3">
                                                                <div className="text-xs text-gray-600 space-y-2 pl-4 border-l-2 border-blue-200">
                                                                    <div className="flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
                                                                        <div className="w-24">Time</div>
                                                                        <div className="flex-1">Page URL</div>
                                                                        <div className="w-24 text-right">Duration</div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {journey.pagesVisited && journey.pagesVisited.slice().reverse().map((visit, vIndex) => {
                                                                            const visits = journey.pagesVisited;
                                                                            const originalIndex = visits.length - 1 - vIndex;
                                                                            const nextVisit = visits[originalIndex + 1];

                                                                            let duration = "Active / Exit";
                                                                            if (nextVisit) {
                                                                                const diffInSeconds = Math.floor((new Date(nextVisit.timestamp) - new Date(visit.timestamp)) / 1000);
                                                                                if (diffInSeconds < 60) duration = `${diffInSeconds}s`;
                                                                                else {
                                                                                    const minutes = Math.floor(diffInSeconds / 60);
                                                                                    const seconds = diffInSeconds % 60;
                                                                                    duration = `${minutes}m ${seconds}s`;
                                                                                }
                                                                            }

                                                                            return (
                                                                                <div key={vIndex} className="grid grid-cols-12 gap-4 text-sm items-center hover:bg-white p-2 rounded transition-colors border-b border-gray-100 last:border-0">
                                                                                    <div className="col-span-2 text-gray-400 font-mono text-xs">
                                                                                        {new Date(visit.timestamp).toLocaleTimeString([], { hour12: false })}
                                                                                    </div>
                                                                                    <div className="col-span-8">
                                                                                        <a
                                                                                            href={visit.page}
                                                                                            target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-gray-700 hover:text-blue-600 hover:underline truncate block"
                                                                                    title={visit.page}
                                                                                >
                                                                                    {visit.page}
                                                                                </a>
                                                                            </div>
                                                                            <div className="col-span-2 text-right">
                                                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${duration === "Active / Exit"
                                                                                    ? "bg-green-100 text-green-700"
                                                                                    : "bg-gray-100 text-gray-600"
                                                                                    }`}>
                                                                                    {duration}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No active sessions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalIpPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                            <button
                                onClick={() => handleIpPageChange(ipPage - 1)}
                                disabled={ipPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {ipPage} of {totalIpPages}
                            </span>
                            <button
                                onClick={() => handleIpPageChange(ipPage + 1)}
                                disabled={ipPage === totalIpPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadAnalytics;
