import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import expenseService from '../../../services/admin/expenseService';

const ExpenseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpense();
    }, [id]);

    const fetchExpense = async () => {
        try {
            const response = await expenseService.getExpenseById(id);
            if (response.success) {
                setExpense(response.data);
            } else {
                toast.error('Failed to fetch expense');
            }
        } catch (error) {
            toast.error('Failed to fetch expense');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            const response = await expenseService.approveExpense(id);
            if (response.success) {
                toast.success('Expense approved');
                fetchExpense();
            } else {
                toast.error(response.error || 'Failed to approve');
            }
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async () => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await expenseService.rejectExpense(id, reason);
            if (response.success) {
                toast.success('Expense rejected');
                fetchExpense();
            } else {
                toast.error(response.error || 'Failed to reject');
            }
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const handleMarkPaid = async () => {
        try {
            const response = await expenseService.markExpensePaid(id);
            if (response.success) {
                toast.success('Marked as paid');
                fetchExpense();
            } else {
                toast.error(response.error || 'Failed to mark as paid');
            }
        } catch (error) {
            toast.error('Failed to mark as paid');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!expense) {
        return <div className="p-6 text-center">Expense not found</div>;
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            paid: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/expenses')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50"
                >
                    <FaArrowLeft />
                    Back to List
                </button>
                <div className="flex gap-2">
                    {expense.status === 'pending' && (
                        <>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                            >
                                <FaCheck />
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                            >
                                <FaTimes />
                                Reject
                            </button>
                        </>
                    )}
                    {expense.status === 'approved' && (
                        <button
                            onClick={handleMarkPaid}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FaMoneyBillWave />
                            Mark as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Expense Details</h1>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(expense.status)}`}>
                        {expense.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Date</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(expense.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{expense.category}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Amount</label>
                            <p className="text-2xl font-bold text-primary-600">₹{expense.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Payment Method</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                                {expense.paymentMethod?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Business</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {expense.business?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Created By</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {expense.createdBy?.name || 'N/A'}
                            </p>
                        </div>
                        {expense.approvedBy && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Approved By</label>
                                <p className="text-lg font-semibold text-gray-900">{expense.approvedBy.name}</p>
                            </div>
                        )}
                        {expense.receiptUrl && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Receipt</label>
                                <a
                                    href={expense.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-2"
                                >
                                    <FaFileAlt />
                                    View Receipt
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-2 text-gray-700">{expense.description || 'No description provided'}</p>
                </div>

                {/* Notes */}
                {expense.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <label className="text-sm font-medium text-gray-500">Internal Notes</label>
                        <p className="mt-2 text-gray-700">{expense.notes}</p>
                    </div>
                )}

                {/* Rejection Reason */}
                {expense.status === 'rejected' && expense.rejectionReason && (
                    <div className="mt-6 pt-6 border-t border-red-200 bg-red-50 p-4">
                        <label className="text-sm font-medium text-red-700">Rejection Reason</label>
                        <p className="mt-2 text-red-900">{expense.rejectionReason}</p>
                    </div>
                )}

                {/* Timestamps */}
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                        <span className="font-medium">Created:</span> {new Date(expense.createdAt).toLocaleString()}
                    </div>
                    <div>
                        <span className="font-medium">Updated:</span> {new Date(expense.updatedAt).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseDetails;
