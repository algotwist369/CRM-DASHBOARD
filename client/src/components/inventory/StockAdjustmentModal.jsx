import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const StockAdjustmentModal = ({
    product,
    onClose,
    onSubmit,
    loading = false,
    allowedTypes = ['purchase', 'usage', 'wastage', 'adjustment', 'return']
}) => {
    const [formData, setFormData] = useState({
        type: allowedTypes[0] || 'adjustment',
        quantity: '',
        reason: '',
        notes: '',
        costPerUnit: product?.costPrice || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.quantity <= 0) {
            alert('Quantity must be greater than 0');
            return;
        }

        // For usage/wastage, check if quantity exceeds current stock
        if (['usage', 'wastage'].includes(formData.type) &&
            parseInt(formData.quantity) > product.currentStock) {
            alert('Quantity cannot exceed current stock');
            return;
        }

        if (onSubmit) {
            onSubmit({
                ...formData,
                quantity: parseInt(formData.quantity),
                costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : undefined
            });
        }
    };

    const calculateNewStock = () => {
        const qty = parseInt(formData.quantity) || 0;
        const current = product.currentStock;

        if (['purchase', 'return', 'adjustment'].includes(formData.type)) {
            return current + qty;
        } else {
            return current - qty;
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            purchase: 'Purchase (Add Stock)',
            usage: 'Usage (Remove Stock)',
            wastage: 'Wastage (Remove Stock)',
            adjustment: 'Adjustment (Add Stock)',
            return: 'Return (Add Stock)',
            transfer: 'Transfer'
        };
        return labels[type] || type;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
                        <p className="text-sm text-gray-600 mt-1">{product.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Current Stock Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Stock</span>
                            <span className="text-lg font-bold text-gray-900">
                                {product.currentStock} {product.unit}
                            </span>
                        </div>
                        {formData.quantity && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-600">New Stock</span>
                                <span className="text-lg font-bold text-primary-600">
                                    {calculateNewStock()} {product.unit}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adjustment Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            {allowedTypes.map(type => (
                                <option key={type} value={type}>
                                    {getTypeLabel(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            min="1"
                            max={['usage', 'wastage'].includes(formData.type) ? product.currentStock : undefined}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                        {['usage', 'wastage'].includes(formData.type) && (
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum: {product.currentStock} {product.unit}
                            </p>
                        )}
                    </div>

                    {/* Cost Per Unit (for purchases) */}
                    {formData.type === 'purchase' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cost Per Unit (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.costPerUnit}
                                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {formData.type === 'wastage' ? 'Wastage Reason *' : 'Reason'}
                        </label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder={
                                formData.type === 'wastage'
                                    ? 'e.g., Expired, Damaged'
                                    : 'e.g., Monthly restock'
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required={formData.type === 'wastage'}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            placeholder="Optional notes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Confirm Adjustment'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

StockAdjustmentModal.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        currentStock: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        costPrice: PropTypes.number
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    allowedTypes: PropTypes.arrayOf(PropTypes.string)
};

export default StockAdjustmentModal;
