import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaBox } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import inventoryService from '../../../services/admin/inventoryService';
import BackButton from '../../../components/common/Button/BackButton';

const LowStockAlerts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLowStockProducts();
    }, []);

    const fetchLowStockProducts = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getLowStockProducts('');
            if (response.success) {
                setProducts(response.data || []);
            } else {
                toast.error(response.error || 'Failed to fetch low stock products');
            }
        } catch (error) {
            toast.error('Failed to fetch low stock products');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-600" />
                    Low Stock Alerts
                </h1>
                <p className="text-gray-600 mt-1">Products that need reordering</p>
            </div>

            {/* Alert Banner */}
            {products.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded">
                    <div className="flex items-center gap-2">
                        <FaExclamationTriangle className="text-yellow-600 text-xl" />
                        <div>
                            <p className="font-semibold text-yellow-900">
                                {products.length} product{products.length !== 1 ? 's' : ''} need immediate attention
                            </p>
                            <p className="text-sm text-yellow-700">
                                Please reorder these items to avoid stockouts
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <FaBox className="h-12 w-12 text-green-400 mx-auto mb-2" />
                                        <p>All stock levels are healthy!</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-semibold ${product.currentStock <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {product.currentStock} {product.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{product.reorderLevel} {product.unit}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.currentStock <= 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {product.currentStock <= 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{product.supplier || '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/inventory/products/${product._id}`)}
                                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                            >
                                                Reorder
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LowStockAlerts;
