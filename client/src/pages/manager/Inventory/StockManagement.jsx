import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBox,
    FaSearch,
    FaExclamationTriangle,
    FaSpinner,
    FaMinus
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import inventoryService from '../../../services/manager/inventoryService';

// Initial adjustment state - defined outside to avoid recreation
const INITIAL_ADJUSTMENT_DATA = {
    type: 'usage',
    quantity: '',
    notes: ''
};

// Memoized stock status badge component
const StockStatusBadge = React.memo(({ product }) => {
    const current = product.currentStock || 0;
    const min = product.minStockLevel || 0;

    if (current <= 0) {
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>;
    } else if (current <= min) {
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>;
});

StockStatusBadge.displayName = 'StockStatusBadge';

// Memoized product row component
const ProductRow = React.memo(({ product, onAdjust }) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.category}</div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
        <td className="px-6 py-4 text-sm font-semibold">
            {product.currentStock || 0} {product.unit || 'units'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
            {product.minStockLevel || 0} {product.unit || 'units'}
        </td>
        <td className="px-6 py-4">
            <StockStatusBadge product={product} />
        </td>
        <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => onAdjust(product)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                >
                    <FaMinus className="inline mr-1" />
                    Record Usage
                </button>
            </div>
        </td>
    </tr>
));

ProductRow.displayName = 'ProductRow';

const StockManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [lowStockCount, setLowStockCount] = useState(0);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState(INITIAL_ADJUSTMENT_DATA);
    const [submitting, setSubmitting] = useState(false);

    // Refs for cleanup and debouncing
    const isMountedRef = useRef(true);
    const searchTimeoutRef = useRef(null);

    const fetchProducts = useCallback(async (search = '') => {
        try {
            setLoading(true);
            const response = await inventoryService.getProducts({ search });
            if (isMountedRef.current) {
                if (response.success) {
                    setProducts(response.data?.data || response.data || []);
                } else {
                    toast.error(response.error || 'Failed to fetch products');
                }
            }
        } catch (error) {
            if (isMountedRef.current) {
                toast.error('Failed to fetch products');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const fetchLowStockCount = useCallback(async () => {
        try {
            const response = await inventoryService.getLowStockProducts();
            if (isMountedRef.current && response.success) {
                setLowStockCount(response.data?.count || 0);
            }
        } catch (error) {
            // Silently fail
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        isMountedRef.current = true;
        fetchProducts();
        fetchLowStockCount();
        return () => {
            isMountedRef.current = false;
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [fetchProducts, fetchLowStockCount]);

    // Debounced search - prevents API calls on every keystroke
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchProducts(value);
        }, 300);
    }, [fetchProducts]);

    const handleRefresh = useCallback(() => {
        fetchProducts(searchQuery);
    }, [fetchProducts, searchQuery]);

    const handleAdjustStock = useCallback(async () => {
        if (!adjustmentData.quantity || adjustmentData.quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        try {
            setSubmitting(true);
            const response = await inventoryService.adjustStock(selectedProduct._id, {
                type: adjustmentData.type,
                quantity: parseInt(adjustmentData.quantity),
                notes: adjustmentData.notes
            });

            if (response.success) {
                toast.success(`Stock ${adjustmentData.type === 'usage' ? 'usage recorded' : 'adjusted'}`);
                setShowAdjustModal(false);
                setSelectedProduct(null);
                setAdjustmentData(INITIAL_ADJUSTMENT_DATA);
                fetchProducts(searchQuery);
            } else {
                toast.error(response.error || 'Failed to adjust stock');
            }
        } catch (error) {
            toast.error('Failed to adjust stock');
        } finally {
            setSubmitting(false);
        }
    }, [selectedProduct, adjustmentData, fetchProducts, searchQuery]);

    const handleOpenAdjustModal = useCallback((product) => {
        setSelectedProduct(product);
        setAdjustmentData(INITIAL_ADJUSTMENT_DATA);
        setShowAdjustModal(true);
    }, []);

    const handleCloseAdjustModal = useCallback(() => {
        setShowAdjustModal(false);
        setSelectedProduct(null);
    }, []);

    const handleAdjustmentDataChange = useCallback((field, value) => {
        setAdjustmentData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNavigateToLowStock = useCallback(() => {
        navigate('/manager/inventory/low-stock');
    }, [navigate]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaBox className="text-primary-600" />
                        Stock Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage inventory and record usage</p>
                </div>
                <div className="flex gap-2">
                    {lowStockCount > 0 && (
                        <button
                            onClick={handleNavigateToLowStock}
                            className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 rounded flex items-center gap-2"
                        >
                            <FaExclamationTriangle />
                            {lowStockCount} Low Stock
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-gray-200 p-4 mb-6 rounded">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search products by name or SKU..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded flex items-center gap-2"
                    >
                        <HiRefresh />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
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
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <ProductRow
                                        key={product._id}
                                        product={product}
                                        onAdjust={handleOpenAdjustModal}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            {showAdjustModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            Adjust Stock: {selectedProduct.name}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Adjustment Type *</label>
                                <select
                                    value={adjustmentData.type}
                                    onChange={(e) => handleAdjustmentDataChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="usage">Usage (Reduce Stock)</option>
                                    <option value="wastage">Wastage (Reduce Stock)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantity *</label>
                                <input
                                    type="number"
                                    value={adjustmentData.quantity}
                                    onChange={(e) => handleAdjustmentDataChange('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="0"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Current stock: {selectedProduct.currentStock || 0} {selectedProduct.unit || 'units'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    value={adjustmentData.notes}
                                    onChange={(e) => handleAdjustmentDataChange('notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    placeholder="Optional notes..."
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleAdjustStock}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Confirm Adjustment'}
                                </button>
                                <button
                                    onClick={handleCloseAdjustModal}
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

export default StockManagement;