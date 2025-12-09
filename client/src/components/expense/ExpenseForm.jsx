import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ExpenseForm = ({
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
    submitButtonText = 'Submit',
    showReceiptUpload = true
}) => {
    const [formData, setFormData] = useState({
        date: initialData.date || new Date().toISOString().split('T')[0],
        category: initialData.category || 'supplies',
        amount: initialData.amount || '',
        paymentMethod: initialData.paymentMethod || 'cash',
        description: initialData.description || '',
        notes: initialData.notes || '',
        receiptUrl: initialData.receiptUrl || ''
    });

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                date: initialData.date || new Date().toISOString().split('T')[0],
                category: initialData.category || 'supplies',
                amount: initialData.amount || '',
                paymentMethod: initialData.paymentMethod || 'cash',
                description: initialData.description || '',
                notes: initialData.notes || '',
                receiptUrl: initialData.receiptUrl || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                </label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                </label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="salaries">Salaries</option>
                    <option value="supplies">Supplies</option>
                    <option value="marketing">Marketing</option>
                    <option value="travel">Travel</option>
                    <option value="meals">Meals & Entertainment</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                </label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                </label>
                <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Describe the expense..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Additional notes (optional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {showReceiptUpload && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt URL
                    </label>
                    <input
                        type="url"
                        name="receiptUrl"
                        value={formData.receiptUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Upload receipt to cloud storage and paste URL
                    </p>
                </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : submitButtonText}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

ExpenseForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    loading: PropTypes.bool,
    submitButtonText: PropTypes.string,
    showReceiptUpload: PropTypes.bool
};

export default ExpenseForm;
