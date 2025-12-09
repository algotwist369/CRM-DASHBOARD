import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaMinus, FaBox, FaHistory } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import inventoryService from '../../../services/admin/inventoryService';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustment, setAdjustment] = useState({ type: 'purchase', quantity: 0, notes: '' });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await inventoryService.getProductById(id);
            if (response.success) {
                setProduct(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = async () => {
        if (adjustment.quantity <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        try {
            const response = await inventoryService.adjustStock(id, adjustment);
            if (response.success) {
                toast.success('Stock adjusted successfully');
                setShowAdjustModal(false);
                setAdjustment({ type: 'purchase', quantity: 0, notes: '' });
                fetchProduct();
            } else {
                toast.error(response.error || 'Failed to adjust stock');
            }
        } catch (error) {
            toast.error('Failed to adjust stock');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return <div className="p-6 text-center">Product not found</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <button
                onClick={() => navigate('/admin/inventory/products')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 mb-6"
            >
                <FaArrowLeft />
                Back to Products
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <button
                            onClick={() => setShowAdjustModal(true)}
                            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                        >
                            <FaPlus />
                            Adjust Stock
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Category</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{product.category}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">SKU</label>
                            <p className="text-lg font-semibold text-gray-900">{product.sku || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Current Stock</label>
                            <p className="text-2xl font-bold text-primary-600">{product.currentStock} {product.unit}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Reorder Level</label>
                            <p className="text-lg font-semibold text-yellow-600">{product.reorderLevel} {product.unit}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Cost Price</label>
                            <p className="text-lg font-semibold text-gray-900">₹{product.costPrice?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Selling Price</label>
                            <p className="text-lg font-semibold text-gray-900">₹{product.sellingPrice?.toLocaleString() || 0}</p>
                        </div>
                    </div>

                    {product.description && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="mt-2 text-gray-700">{product.description}</p>
                        </div>
                    )}
                </div>

                {/* Stock Status Card */}
                <div className="bg-white border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Stock Status</h2>
                    <div className="space-y-4">
                        <div className={`p-4 rounded ${product.currentStock <= 0 ? 'bg-red-50 border border-red-200' : product.currentStock <= product.reorderLevel ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                            <p className="text-sm font-medium">
                                {product.currentStock <= 0 ? '❌ Out of Stock' : product.currentStock <= product.reorderLevel ? '⚠️ Low Stock' : '✅ In Stock'}
                            </p>
                        </div>

                        {product.supplier && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Supplier</label>
                                <p className="text-gray-900">{product.supplier}</p>
                            </div>
                        )}

                        {product.lastRestocked && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Restocked</label>
                                <p className="text-gray-900">{new Date(product.lastRestocked).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            {product.transactions && product.transactions.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaHistory />
                        Recent Transactions
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {product.transactions.slice(0, 10).map((txn, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 text-sm">{new Date(txn.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-sm capitalize">{txn.type}</td>
                                        <td className="px-4 py-2 text-sm">{txn.quantity} {product.unit}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{txn.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Adjust Stock Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    value={adjustment.type}
                                    onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                >
                                    <option value="purchase">Purchase</option>
                                    <option value="adjustment">Adjustment</option>
                                    <option value="wastage">Wastage</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantity</label>
                                <input
                                    type="number"
                                    value={adjustment.quantity}
                                    onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    value={adjustment.notes}
                                    onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAdjustStock}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded"
                                >
                                    Adjust
                                </button>
                                <button
                                    onClick={() => setShowAdjustModal(false)}
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

export default ProductDetails;
