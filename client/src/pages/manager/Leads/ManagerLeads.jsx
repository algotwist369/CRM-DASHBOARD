import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPhone, FaWhatsapp, FaComment, FaSyncAlt } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import managerService from '../../../services/manager/managerService';
import toast from 'react-hot-toast';

const ManagerLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'called', 'whatsapped', 'pending'
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Leads
    const fetchLeads = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const params = {
                page,
                limit: 20,
                search,
                filterByStatus: statusFilter !== 'all' ? statusFilter : undefined
            };

            const response = await managerService.getManagerLeads(params);

            if (response.success) {
                setLeads(response.data.data);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.error || 'Failed to fetch leads');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, search, statusFilter]);

    // Initial Fetch
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Handle Actions
    const handleAction = async (action, lead) => {
        if (action === 'call' || action === 'whatsapp') {
            // Optimistic Update
            const updatedLeads = leads.map(l =>
                l._id === lead._id
                    ? {
                        ...l,
                        status: action === 'call' ? 'called' : 'whatsapped',
                        [action === 'call' ? 'isCalled' : 'isWhatsapp']: true
                    }
                    : l
            );
            setLeads(updatedLeads);

            const res = await managerService.updateLeadStatus({
                leadId: lead._id,
                contactType: action
            });

            if (!res.success) {
                toast.error('Failed to update status');
                fetchLeads(); // Revert
            } else {
                toast.success(action === 'call' ? 'Marked as Called' : 'Marked as Whatsapped');
            }
        } else if (action === 'remark') {
            const text = window.prompt("Enter remark:", lead.remarks?.[lead.remarks.length - 1]?.text || "");
            if (!text) return;

            const res = await managerService.addLeadRemark({
                leadId: lead._id,
                text
            });

            if (res.success) {
                toast.success("Remark added");
                fetchLeads(); // Refresh to show remark (if we display it)
            } else {
                toast.error("Failed to add remark");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.pages || 1)) {
            setPage(newPage);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaWhatsapp className="text-green-500" />
                        WhatsApp Leads
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your assigned leads</p>
                </div>
                <button
                    onClick={() => fetchLeads(true)}
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm"
                    title="Refresh"
                >
                    <HiRefresh className={`text-gray-600 text-xl ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="pending">New / Pending</option>
                    <option value="called">Called</option>
                    <option value="whatsapped">Whatsapped</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading && !leads.length ? (
                    <div className="p-8 text-center text-gray-500">Loading leads...</div>
                ) : leads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No leads found matching your criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            <div className="text-xs text-gray-400">
                                                {new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.customerName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{lead.location}</div>
                                            {lead.remarks && lead.remarks.length > 0 && (
                                                <div className="mt-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block max-w-[200px] truncate" title={lead.remarks[lead.remarks.length - 1].text}>
                                                    Example Remark: {lead.remarks[lead.remarks.length - 1].text}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {lead.customerPhone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'called' ? 'bg-blue-100 text-blue-800' :
                                                lead.status === 'whatsapped' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {lead.status === 'called' ? 'Called' : lead.status === 'whatsapped' ? 'Whatsapped' : 'New'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleAction('call', lead)}
                                                    className={`text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition ${lead.isCalled ? 'opacity-50' : ''}`}
                                                    title="Call"
                                                >
                                                    <FaPhone />
                                                </button>
                                                <button
                                                    onClick={() => handleAction('whatsapp', lead)}
                                                    className={`text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition ${lead.isWhatsapp ? 'opacity-50' : ''}`}
                                                    title="WhatsApp"
                                                >
                                                    <FaWhatsapp />
                                                </button>
                                                <button
                                                    onClick={() => handleAction('remark', lead)}
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition"
                                                    title="Add Remark"
                                                >
                                                    <FaComment />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination needs to be properly implemented based on API response structure */}
                {pagination && pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{pagination.pages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {/* Simplified Pagination */}
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === pagination.pages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerLeads;
