import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import expenseService from '../../../services/admin/expenseService';
import BackButton from '../../../components/common/Button/BackButton';

// Memoized expense row component
const ExpenseRow = React.memo(({ expense, isSelected, onToggleSelect, onView, onApprove, onReject }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(expense._id)}
                className="rounded border-gray-300"
            />
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
            {new Date(expense.date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-sm capitalize">{expense.category}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{expense.description}</td>
        <td className="px-6 py-4 text-sm font-semibold">₹{expense.amount?.toLocaleString()}</td>
        <td className="px-6 py-4 text-sm">{expense.createdBy?.name || 'N/A'}</td>
        <td className="px-6 py-4 text-right text-sm">
            <div className="flex justify-end gap-2">
                <button onClick={() => onView(expense._id)} className="text-blue-600 hover:text-blue-900">
                    <FaEye />
                </button>
                <button onClick={() => onApprove(expense._id)} className="text-green-600 hover:text-green-900">
                    <FaCheck />
                </button>
                <button onClick={() => onReject(expense._id)} className="text-red-600 hover:text-red-900">
                    <FaTimes />
                </button>
            </div>
        </td>
    </tr>
));

ExpenseRow.displayName = 'ExpenseRow';

const PendingApprovals = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExpenses, setSelectedExpenses] = useState([]);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    const fetchPendingExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await expenseService.getPendingApprovals('');
            if (isMountedRef.current) {
                if (response.success) {
                    setExpenses(response.data || []);
                } else {
                    toast.error(response.error || 'Failed to fetch pending expenses');
                }
            }
        } catch (error) {
            if (isMountedRef.current) {
                toast.error('Failed to fetch pending expenses');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        fetchPendingExpenses();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchPendingExpenses]);

    const handleApprove = useCallback(async (id) => {
        try {
            const response = await expenseService.approveExpense(id);
            if (response.success) {
                toast.success('Expense approved');
                fetchPendingExpenses();
            } else {
                toast.error(response.error || 'Failed to approve');
            }
        } catch (error) {
            toast.error('Failed to approve');
        }
    }, [fetchPendingExpenses]);

    const handleReject = useCallback(async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await expenseService.rejectExpense(id, reason);
            if (response.success) {
                toast.success('Expense rejected');
                fetchPendingExpenses();
            } else {
                toast.error(response.error || 'Failed to reject');
            }
        } catch (error) {
            toast.error('Failed to reject');
        }
    }, [fetchPendingExpenses]);

    const handleBulkApprove = useCallback(async () => {
        if (selectedExpenses.length === 0) {
            toast.error('No expenses selected');
            return;
        }

        try {
            await Promise.all(selectedExpenses.map(id => expenseService.approveExpense(id)));
            toast.success(`${selectedExpenses.length} expenses approved`);
            setSelectedExpenses([]);
            fetchPendingExpenses();
        } catch (error) {
            toast.error('Failed to approve expenses');
        }
    }, [selectedExpenses, fetchPendingExpenses]);

    const handleView = useCallback((id) => {
        navigate(`/admin/expenses/${id}`);
    }, [navigate]);

    const toggleSelectExpense = useCallback((id) => {
        setSelectedExpenses(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedExpenses(prev =>
            prev.length === expenses.length ? [] : expenses.map(e => e._id)
        );
    }, [expenses]);

    // Memoized computed values
    const totalAmount = useMemo(() =>
        expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        [expenses]
    );

    const isAllSelected = useMemo(() =>
        selectedExpenses.length === expenses.length && expenses.length > 0,
        [selectedExpenses.length, expenses.length]
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaExclamationCircle className="text-yellow-600" />
                        Pending Approvals
                    </h1>
                    <p className="text-gray-600 mt-1">Review and approve expense requests</p>
                </div>
                <div className="flex gap-2">
                    {selectedExpenses.length > 0 && (
                        <button
                            onClick={handleBulkApprove}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                            <FaCheck />
                            Approve Selected ({selectedExpenses.length})
                        </button>
                    )}
                    <button
                        onClick={fetchPendingExpenses}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                    >
                        <HiRefresh />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6">
                <div className="flex items-center gap-2">
                    <FaExclamationCircle className="text-yellow-600 text-xl" />
                    <div>
                        <p className="font-semibold text-yellow-900">
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} awaiting approval
                        </p>
                        <p className="text-sm text-yellow-700">
                            Total amount: ₹{totalAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <FaCheck className="h-12 w-12 text-green-400 mx-auto mb-2" />
                                        <p>All caught up! No pending approvals.</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <ExpenseRow
                                        key={expense._id}
                                        expense={expense}
                                        isSelected={selectedExpenses.includes(expense._id)}
                                        onToggleSelect={toggleSelectExpense}
                                        onView={handleView}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovals;
