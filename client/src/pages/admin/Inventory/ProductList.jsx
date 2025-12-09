import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaPlus, FaSearch, FaEye, FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import inventoryService from '../../../services/admin/inventoryService';
import BackButton from '../../../components/common/Button/BackButton';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, lowStock: 0, totalValue: 0 });

    useEffect(() => {
        fetchProducts();
    }, []); const fetchProducts = async () => {
        try {
            setLoading(true);
            const [productsRes, lowStockRes, valuationRes] = await Promise.all([
                inventoryService.getProducts({}),
                inventoryService.getLowStockProducts(''),
                inventoryService.getStockValuation('')
            ]);

            if (productsRes.success) {
                setProducts(productsRes.data || []);
                setStats({
                    total: productsRes.pagination?.total || 0,
                    lowStock: lowStockRes.data?.count || 0,
                    totalValue: valuationRes.data?.data?.totalValue || 0
                });
            }
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (product) => {
        if (product.currentStock <= 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (product.currentStock <= product.reorderLevel) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <BackButton />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaBox className="text-primary-600" />
                        Inventory Products
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/inventory/low-stock')}
                        className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2"
                    >
                        <FaExclamationTriangle />
                        Low Stock ({stats.lowStock})
                    </button>
                    <button
                        onClick={() => navigate('/admin/inventory/products/create')}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Low Stock Items</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹{stats.totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-gray-200 p-4 mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-0"
                        />
                    </div>
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
                    >
                        <HiRefresh />
                        Refresh
                    </button>
                </div>
            </div>

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
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
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const status = getStockStatus(product);
                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">{product.currentStock} {product.unit}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{product.reorderLevel} {product.unit}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">₹{product.costPrice?.toLocaleString() || 0}</td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/inventory/products/${product._id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/inventory/products/${product._id}/edit`)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
