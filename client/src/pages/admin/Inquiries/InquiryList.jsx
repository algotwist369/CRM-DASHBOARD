import React, { useState, memo, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineSearch,
    HiOutlineRefresh,
    HiOutlineCheck,
    HiOutlineTrash,
    HiOutlinePhone,
    HiOutlineClock,
    HiOutlineOfficeBuilding,
    HiOutlineFilter,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineDownload,
    HiOutlineCalendar
} from 'react-icons/hi';
import { FaQuestionCircle, FaRegEnvelopeOpen, FaFileCsv, FaFilePdf, FaSpinner } from 'react-icons/fa';
import adminService from '../../../services/admin/adminService';
import managerService from '../../../services/manager/managerService';
import authService from '../../../services/auth/authService';
import { useSocket } from '../../../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

// --- Sub-components ---

const TableSkeleton = memo(() => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex border-b border-gray-100 py-4 px-4 gap-4">
                <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-10 w-1/6 bg-gray-200 rounded"></div>
                <div className="h-10 w-1/6 bg-gray-200 rounded"></div>
                <div className="h-10 w-1/12 bg-gray-200 rounded ml-auto"></div>
            </div>
        ))}
    </div>
));

const InquiryRow = memo(({ inquiry, onMarkAsReceived, onDelete }) => {
    const createdAt = useMemo(() =>
        inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A'
        , [inquiry.createdAt]);

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className="hover:bg-gray-50/80 transition-colors group"
        >
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {inquiry.user_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <HiOutlinePhone className="w-3.5 h-3.5" /> {inquiry.phone}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                        <HiOutlineOfficeBuilding className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-800 font-medium">{inquiry.business_id?.name || 'N/A'}</span>
                        <span className="text-[11px] text-gray-500 uppercase tracking-tight font-bold">{inquiry.business_id?.branch || ''}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100">
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${inquiry.inquiry_type === 'whatsapp'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    {inquiry.inquiry_type || 'General'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100">
                {inquiry.is_recieved ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold border border-green-100 ">
                        <HiOutlineCheck className="w-3.5 h-3.5" /> RECEIVED
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100 ">
                        <HiOutlineClock className="w-3.5 h-3.5 animate-pulse" /> PENDING
                    </span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100 text-[13px] text-gray-500 font-medium">
                {createdAt}
            </td>
            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-100 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!inquiry.is_recieved && (
                        <button
                            onClick={() => onMarkAsReceived(inquiry._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all active:scale-95"
                            title="Mark as Received"
                        >
                            <HiOutlineCheck className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(inquiry._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                        title="Delete Inquiry"
                    >
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
}, (prev, next) => prev.inquiry._id === next.inquiry._id && prev.inquiry.is_recieved === next.inquiry.is_recieved);

// --- Main Component ---

const InquiryList = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket() || {};

    // Auth & Service Context
    const user = useMemo(() => authService.getCurrentUser(), []);
    const service = useMemo(() => user?.role === 'admin' ? adminService : managerService, [user]);

    // UI States
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        type: '',
        startDate: '',
        endDate: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(true);
    const [exporting, setExporting] = useState(null);

    // Consolidated Debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [filters]);

    // Socket Integration for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data) => {
            if (data?.type === 'business' || data?.actionUrl?.includes('inquiries')) {
                toast.info('New inquiry received!', { icon: '📢', duration: 4000 });
                queryClient.invalidateQueries({ queryKey: ['inquiries'] });
            }
        };

        const handleInquiryUpdated = (data) => {
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: ['inquiries'] });
            }
        };

        socket.on('new_notification', handleNewNotification);
        socket.on('inquiry_updated', handleInquiryUpdated);
        return () => {
            socket.off('new_notification', handleNewNotification);
            socket.off('inquiry_updated', handleInquiryUpdated);
        };
    }, [socket, queryClient]);

    // Fetch Data
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['inquiries', page, debouncedFilters],
        queryFn: () => service.getInquiries({
            page,
            limit: 12,
            ...debouncedFilters
        }),
        placeholderData: keepPreviousData,
        staleTime: 30000, // 30 seconds
        gcTime: 300000, // 5 minutes (renamed from cacheTime in v5)
        refetchOnWindowFocus: false,
    });

    // Mutations
    const markReceivedMutation = useMutation({
        mutationFn: (id) => service.markInquiryAsReceived(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['inquiries'] });
            const previousData = queryClient.getQueryData(['inquiries', page, debouncedFilters]);

            // Optimistic Update
            if (previousData) {
                queryClient.setQueryData(['inquiries', page, debouncedFilters], {
                    ...previousData,
                    data: previousData.data.map(inq =>
                        inq._id === id ? { ...inq, is_recieved: true } : inq
                    )
                });
            }
            return { previousData };
        },
        onSuccess: () => {
            toast.success('Status updated', { position: 'bottom-right' });
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['inquiries', page, debouncedFilters], context.previousData);
            }
            toast.error('Failed to update status');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => service.deleteInquiry(id),
        onSuccess: () => {
            toast.success('Inquiry removed');
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        }
    });

    // Handlers
    const handleMarkAsReceived = useCallback((id) => {
        markReceivedMutation.mutate(id);
    }, [markReceivedMutation]);

    const handleDelete = useCallback((id) => {
        if (window.confirm('Delete this inquiry?')) {
            deleteMutation.mutate(id);
        }
    }, [deleteMutation]);

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            status: '',
            type: '',
            startDate: '',
            endDate: ''
        });
    }, []);

    const handleExport = useCallback(async (format) => {
        try {
            setExporting(format);
            const res = await service.exportInquiries({
                format,
                ...debouncedFilters
            });

            if (res.success) {
                const blob = new Blob([res.data], {
                    type: format === 'csv' ? 'text/csv' : 'application/pdf'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `inquiries-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success(`Exported as ${format.toUpperCase()}`);
            } else {
                toast.error(res.error || 'Export failed');
            }
        } catch (e) {
            toast.error('Export failed');
        } finally {
            setExporting(null);
        }
    }, [service, debouncedFilters]);

    const inquiries = data?.data || [];
    const totalPages = data?.pagination?.pages || 1;
    const totalItems = data?.pagination?.total || 0;

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100  overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                    <BackButton />
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white  shadow-primary-100">
                            <FaQuestionCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Inquiries</h1>
                            <p className="text-gray-500 font-medium text-sm mt-0.5">
                                {user?.role === 'admin'
                                    ? 'Global lead management across all ecosystem branches'
                                    : 'Manage customer interests and leads for your branch'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mr-2">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting === 'csv' || inquiries.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
                            title="Download CSV"
                        >
                            {exporting === 'csv' ? <FaSpinner className="animate-spin" /> : <FaFileCsv className="text-green-600 w-4 h-4" />}
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting === 'pdf' || inquiries.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
                            title="Download PDF"
                        >
                            {exporting === 'pdf' ? <FaSpinner className="animate-spin" /> : <FaFilePdf className="text-red-600 w-4 h-4" />}
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all active:scale-95 ${showFilters ? 'bg-primary-50 border-primary-100 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <HiOutlineFilter className="w-5 h-5" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <HiOutlineRefresh className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                        {isFetching ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl  space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {/* Search */}
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Search Customer</label>
                                    <div className="relative">
                                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Name or Phone..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2 lg:col-span-2 flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">From Date</label>
                                        <div className="relative">
                                            <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={filters.startDate}
                                                onChange={handleFilterChange}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl outline-none text-xs transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">To Date</label>
                                        <div className="relative">
                                            <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={filters.endDate}
                                                onChange={handleFilterChange}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl outline-none text-xs transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Handle Status</label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl outline-none text-sm transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="false">Pending Only</option>
                                        <option value="true">Received Only</option>
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Inquiry Type</label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary-500 rounded-xl outline-none text-sm transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Any Type</option>
                                        <option value="general">General</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="booking">Booking</option>
                                    </select>
                                </div>

                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={resetFilters}
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total filtered:</span>
                                    <span className="text-sm font-black text-gray-900">{totalItems}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100  shadow-gray-200/50 overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Customer</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Origin Business</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Type</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Handle Status</th>
                                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Timestamp</th>
                                <th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="relative">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {isLoading && !inquiries.length ? (
                                    <motion.tr key="skeleton">
                                        <td colSpan="6" className="p-0">
                                            <TableSkeleton />
                                        </td>
                                    </motion.tr>
                                ) : inquiries.length === 0 ? (
                                    <motion.tr
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white"
                                    >
                                        <td colSpan="6" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                                <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-200">
                                                    <FaRegEnvelopeOpen className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Quiet Inbox</h3>
                                                    <p className="text-gray-500 text-sm mt-1">No inquiries match your current filters. Try broadening your search.</p>
                                                </div>
                                                <button
                                                    onClick={resetFilters}
                                                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all border border-gray-200"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    inquiries.map((inquiry) => (
                                        <InquiryRow
                                            key={inquiry._id}
                                            inquiry={inquiry}
                                            onMarkAsReceived={handleMarkAsReceived}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl  border border-gray-200">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500 rounded-lg transition-all active:scale-90"
                            >
                                <HiOutlineChevronLeft className="w-6 h-6" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pNum = i + 1;
                                // Basic sliding window for many pages
                                if (totalPages > 5 && Math.abs(pNum - page) > 1 && pNum !== 1 && pNum !== totalPages) {
                                    if (pNum === 2 || pNum === totalPages - 1) return <span key={pNum} className="px-2 text-gray-300">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={pNum}
                                        onClick={() => setPage(pNum)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all active:scale-90 ${page === pNum
                                            ? 'bg-primary-600 text-white  shadow-primary-200'
                                            : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-white text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-500 rounded-lg transition-all active:scale-90"
                            >
                                <HiOutlineChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing page {page} of {totalPages} <span className="text-gray-200 mx-2">|</span> {totalItems} total leads
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryList;
