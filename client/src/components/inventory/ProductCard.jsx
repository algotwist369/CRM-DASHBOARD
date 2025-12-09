import React from 'react';
import PropTypes from 'prop-types';
import { FaBox, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const ProductCard = ({ product, onView, onAdjustStock, compact = false }) => {
    const getStockStatus = (product) => {
        if (product.currentStock <= 0) {
            return {
                text: 'Out of Stock',
                color: 'text-red-600',
                bg: 'bg-red-50',
                icon: FaExclamationTriangle,
                iconColor: 'text-red-500'
            };
        }
        if (product.currentStock <= product.reorderLevel) {
            return {
                text: 'Low Stock',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
                icon: FaExclamationTriangle,
                iconColor: 'text-yellow-500'
            };
        }
        return {
            text: 'In Stock',
            color: 'text-green-600',
            bg: 'bg-green-50',
            icon: FaCheckCircle,
            iconColor: 'text-green-500'
        };
    };

    const status = getStockStatus(product);
    const StatusIcon = status.icon;
    const stockPercentage = Math.min((product.currentStock / (product.reorderLevel * 2)) * 100, 100);

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${status.bg}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                    <div className="bg-primary-100 p-2 rounded">
                        <FaBox className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                </div>
                <StatusIcon className={status.iconColor} />
            </div>

            {/* Stock Info */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className={`text-lg font-bold ${status.color}`}>
                        {product.currentStock} {product.unit}
                    </span>
                </div>

                {/* Progress Bar */}
                {!compact && (
                    <>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                                className={`h-2 rounded-full transition-all ${product.currentStock <= 0
                                        ? 'bg-red-500'
                                        : product.currentStock <= product.reorderLevel
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                style={{ width: `${stockPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Reorder at: {product.reorderLevel}</span>
                            <span className={status.color}>{status.text}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Additional Info */}
            {!compact && (
                <div className="mb-3 pb-3 border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-gray-500">SKU:</span>
                            <span className="ml-1 font-medium text-gray-700">{product.sku || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Cost:</span>
                            <span className="ml-1 font-medium text-gray-700">₹{product.costPrice?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                {onView && (
                    <button
                        onClick={() => onView(product._id)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                    >
                        View Details
                    </button>
                )}
                {onAdjustStock && (
                    <button
                        onClick={() => onAdjustStock(product)}
                        className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded"
                    >
                        Adjust Stock
                    </button>
                )}
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        currentStock: PropTypes.number.isRequired,
        reorderLevel: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        sku: PropTypes.string,
        costPrice: PropTypes.number
    }).isRequired,
    onView: PropTypes.func,
    onAdjustStock: PropTypes.func,
    compact: PropTypes.bool
};

export default ProductCard;
