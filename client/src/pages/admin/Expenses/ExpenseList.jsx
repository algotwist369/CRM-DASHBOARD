import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaMoneyBillWave,
    FaPlus,
    FaFilter,
    FaEye,
    FaCheck,
    FaTimes,
    FaTrash,
    FaSpinner,
    FaFileAlt
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import expenseService from '../../../services/admin/expenseService';
import BackButton from '../../../components/common/Button/BackButton';

// Memoized table row component to prevent re-renders
const ExpenseRow = React.memo(({ expense, onView, onApprove, onReject, onDelete, getStatusBadge }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">
            {new Date(expense.date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 capitalize">{expense.category}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{expense.description}</td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{expense.amount?.toLocaleString()}</td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(expense.status)}`}>
                {expense.status}
            </span>
        </td>
        <td className="px-6 py-4 text-right text-sm">
            <div className="flex justify-end gap-2">
                <button onClick={() => onView(expense._id)} className="text-blue-600 hover:text-blue-900">
                    <FaEye />
                </button>
                {expense.status === 'pending' && (
                    <>
                        <button onClick={() => onApprove(expense._id)} className="text-green-600 hover:text-green-900">
                            <FaCheck />
                        </button>
                        <button onClick={() => onReject(expense._id)} className="text-red-600 hover:text-red-900">
                            <FaTimes />
                        </button>
                        <button onClick={() => onDelete(expense._id)} className="text-red-600 hover:text-red-900">
                            <FaTrash />
                        </button>
                    </>
                )}
            </div>
        </td>
    </tr>
));

ExpenseRow.displayName = 'ExpenseRow';

// Status badge helper - defined outside component to avoid recreation
const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800'
};

const getStatusBadge = (status) => STATUS_BADGES[status] || 'bg-gray-100 text-gray-800';

const ExpenseList = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [filters, setFilters] = useState({
        businessId: '',
        startDate: '',
        endDate: '',
        category: '',
        status: '',
        paymentMethod: ''
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    // Ref to prevent duplicate API calls
    const abortControllerRef = useRef(null);
    const isMountedRef = useRef(true);

    const fetchExpenses = useCallback(async () => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await expenseService.getExpenses(params);

            // Check if component is still mounted
            if (!isMountedRef.current) return;

            if (response.success) {
                const allExpenses = response.data || [];
                setExpenses(allExpenses);
                setPagination(prev => ({ ...prev, total: response.pagination?.total || 0 }));
                setStats({
                    total: response.pagination?.total || 0,
                    approved: allExpenses.filter(e => e.status === 'approved').length,
                    pending: allExpenses.filter(e => e.status === 'pending').length,
                    rejected: allExpenses.filter(e => e.status === 'rejected').length
                });
            } else {
                toast.error(response.error || 'Failed to fetch expenses');
            }
        } catch (error) {
            if (error.name !== 'AbortError' && isMountedRef.current) {
                toast.error('Failed to fetch expenses');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [filters, pagination.page, pagination.limit]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleApprove = useCallback(async (id) => {
        try {
            const response = await expenseService.approveExpense(id);
            if (response.success) {
                toast.success('Expense approved');
                fetchExpenses();
            } else {
                toast.error(response.error || 'Failed to approve expense');
            }
        } catch (error) {
            toast.error('Failed to approve expense');
        }
    }, [fetchExpenses]);

    const handleReject = useCallback(async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await expenseService.rejectExpense(id, reason);
            if (response.success) {
                toast.success('Expense rejected');
                fetchExpenses();
            } else {
                toast.error(response.error || 'Failed to reject expense');
            }
        } catch (error) {
            toast.error('Failed to reject expense');
        }
    }, [fetchExpenses]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            const response = await expenseService.deleteExpense(id);
            if (response.success) {
                toast.success('Expense deleted');
                fetchExpenses();
            } else {
                toast.error(response.error || 'Failed to delete expense');
            }
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    }, [fetchExpenses]);

    const handleView = useCallback((id) => {
        navigate(`/admin/expenses/${id}`);
    }, [navigate]);

    // Memoized filter update handlers
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    }, []);

    // Memoized pagination info
    const paginationInfo = useMemo(() => ({
        start: ((pagination.page - 1) * pagination.limit) + 1,
        end: Math.min(pagination.page * pagination.limit, pagination.total),
        showPagination: pagination.total > pagination.limit
    }), [pagination.page, pagination.limit, pagination.total]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaMoneyBillWave className="text-primary-600" />
                        Expense Management
                    </h1>
                    <p className="text-gray-600 mt-1">Track and approve business expenses</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/expenses/pending')}
                        className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2"
                    >
                        <FaFileAlt />
                        Pending ({stats.pending})
                    </button>
                    <button
                        onClick={() => navigate('/admin/expenses/create')}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="text-gray-400" />
                    <span className="font-medium text-gray-700">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0"
                        placeholder="End Date"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="paid">Paid</option>
                    </select>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0"
                    >
                        <option value="">All Categories</option>
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="salaries">Salaries</option>
                        <option value="supplies">Supplies</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                    </select>
                    <button
                        onClick={fetchExpenses}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2"
                    >
                        <HiRefresh />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <FaSpinner className="animate-spin h-8 w-8 text-primary-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No expenses found
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <ExpenseRow
                                        key={expense._id}
                                        expense={expense}
                                        onView={handleView}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onDelete={handleDelete}
                                        getStatusBadge={getStatusBadge}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {paginationInfo.showPagination && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing {paginationInfo.start} to {paginationInfo.end} of {pagination.total}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                className="px-3 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseList;
