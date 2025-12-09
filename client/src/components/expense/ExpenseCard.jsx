import React from 'react';
import PropTypes from 'prop-types';
import { FaMoneyBillWave, FaCalendar, FaFileAlt } from 'react-icons/fa';

const ExpenseCard = ({ expense, onView, onEdit, onDelete, onApprove, onReject, showActions = true }) => {
    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
            paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Paid' }
        };
        return badges[status] || badges.pending;
    };

    const status = getStatusBadge(expense.status);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-100 p-2 rounded">
                        <FaMoneyBillWave className="text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{expense.category}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendar className="w-3 h-3" />
                            {new Date(expense.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
            </div>

            {/* Content */}
            <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-2">{expense.description}</p>
            </div>

            {/* Amount */}
            <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold text-gray-900">₹{expense.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Payment Method</span>
                    <span className="text-xs text-gray-700 capitalize">{expense.paymentMethod?.replace('_', ' ')}</span>
                </div>
            </div>

            {/* Receipt Link */}
            {expense.receiptUrl && (
                <div className="mb-3">
                    <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <FaFileAlt />
                        View Receipt
                    </a>
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    {onView && (
                        <button
                            onClick={() => onView(expense._id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                        >
                            View
                        </button>
                    )}
                    {expense.status === 'pending' && onApprove && (
                        <button
                            onClick={() => onApprove(expense._id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded"
                        >
                            Approve
                        </button>
                    )}
                    {expense.status === 'pending' && onReject && (
                        <button
                            onClick={() => onReject(expense._id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                        >
                            Reject
                        </button>
                    )}
                    {expense.status === 'pending' && onEdit && (
                        <button
                            onClick={() => onEdit(expense._id)}
                            className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                        >
                            Edit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

ExpenseCard.propTypes = {
    expense: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        paymentMethod: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        receiptUrl: PropTypes.string
    }).isRequired,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    showActions: PropTypes.bool
};

export default ExpenseCard;
