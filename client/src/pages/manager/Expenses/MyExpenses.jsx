import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaMoneyBillWave,
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaSpinner
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import expenseService from '../../../services/manager/expenseService';

// Status badge helper - defined outside to avoid recreation
const STATUS_BADGES = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800'
};

const getStatusBadge = (status) => STATUS_BADGES[status] || 'bg-gray-100 text-gray-800';

// Initial expense state - defined outside to avoid recreation
const INITIAL_EXPENSE_STATE = {
    date: new Date().toISOString().split('T')[0],
    category: 'supplies',
    amount: '',
    paymentMethod: 'cash',
    description: ''
};

// Memoized expense row
const ExpenseRow = React.memo(({ expense, onView, onEdit, onDelete }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">
            {new Date(expense.date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-sm capitalize">{expense.category}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{expense.description}</td>
        <td className="px-6 py-4 text-sm font-semibold">₹{expense.amount?.toLocaleString()}</td>
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
                        <button onClick={() => onEdit(expense._id)} className="text-green-600 hover:text-green-900">
                            <FaEdit />
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

const MyExpenses = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [newExpense, setNewExpense] = useState(INITIAL_EXPENSE_STATE);
    const [submitting, setSubmitting] = useState(false);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await expenseService.getMyExpenses({});
            if (isMountedRef.current) {
                if (response.success) {
                    const data = response.data || [];
                    setExpenses(data);
                    setStats({
                        total: data.length,
                        pending: data.filter(e => e.status === 'pending').length,
                        approved: data.filter(e => e.status === 'approved').length,
                        rejected: data.filter(e => e.status === 'rejected').length
                    });
                } else {
                    toast.error(response.error || 'Failed to fetch expenses');
                }
            }
        } catch (error) {
            if (isMountedRef.current) {
                toast.error('Failed to fetch expenses');
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
        fetchExpenses();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchExpenses]);

    const handleCreateExpense = useCallback(async () => {
        if (!newExpense.amount || !newExpense.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const response = await expenseService.createExpense(newExpense);
            if (response.success) {
                toast.success('Expense submitted for approval');
                setShowCreateModal(false);
                setNewExpense({ ...INITIAL_EXPENSE_STATE, date: new Date().toISOString().split('T')[0] });
                fetchExpenses();
            } else {
                toast.error(response.error || 'Failed to create expense');
            }
        } catch (error) {
            toast.error('Failed to create expense');
        } finally {
            setSubmitting(false);
        }
    }, [newExpense, fetchExpenses]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            const response = await expenseService.updateExpense(id, { status: 'cancelled' });
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
        navigate(`/manager/expenses/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/manager/expenses/${id}/edit`);
    }, [navigate]);

    const handleOpenModal = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleExpenseFieldChange = useCallback((field, value) => {
        setNewExpense(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaMoneyBillWave className="text-primary-600" />
                        My Expenses
                    </h1>
                    <p className="text-gray-600 mt-1">Track your submitted expenses</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                >
                    <FaPlus />
                    New Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Expense History</h2>
                    <button onClick={fetchExpenses} className="text-primary-600 hover:text-primary-700">
                        <HiRefresh className="w-5 h-5" />
                    </button>
                </div>
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
                                        No expenses found. Click "New Expense" to add one.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <ExpenseRow
                                        key={expense._id}
                                        expense={expense}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Expense Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create New Expense</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={newExpense.date}
                                    onChange={(e) => handleExpenseFieldChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => handleExpenseFieldChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="supplies">Supplies</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="travel">Travel</option>
                                    <option value="meals">Meals</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
                                <input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => handleExpenseFieldChange('amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Method *</label>
                                <select
                                    value={newExpense.paymentMethod}
                                    onChange={(e) => handleExpenseFieldChange('paymentMethod', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <textarea
                                    value={newExpense.description}
                                    onChange={(e) => handleExpenseFieldChange('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    placeholder="Describe the expense..."
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleCreateExpense}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit for Approval'}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyExpenses;
