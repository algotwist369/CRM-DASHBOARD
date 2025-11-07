import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineCube, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineTag
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
));

const ServiceRow = memo(({ service, onView, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 flex-shrink-0">
          <div className="h-10 w-10 rounded bg-primary-100 flex items-center justify-center">
            <HiOutlineCube className="w-6 h-6 text-primary-600" />
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{service.name}</div>
          <div className="text-sm text-gray-500">{service.category}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      ₹{service.price?.toLocaleString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {service.duration} min
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 text-xs rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {service.isActive ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {service.totalBookings || service.bookingCount || 0}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button onClick={() => onView(service._id)} className="text-blue-600 hover:text-blue-900 mr-3">
        <HiOutlineEye className="w-5 h-5" />
      </button>
      <button onClick={() => onEdit(service._id)} className="text-green-600 hover:text-green-900 mr-3">
        <HiOutlinePencil className="w-5 h-5" />
      </button>
      <button onClick={() => onDelete(service._id)} className="text-red-600 hover:text-red-900">
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </td>
  </tr>
));

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, categories: 0, popular: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [categories, setCategories] = useState([]);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
        if (!selectedBusinessId && response.data && response.data.length > 0) {
          const firstBusinessId = response.data[0]._id;
          setSelectedBusinessId(firstBusinessId);
          localStorage.setItem('selectedBusinessId', firstBusinessId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  }, [selectedBusinessId]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null' || selectedBusinessId.trim() === '') {
      return;
    }
    try {
      const response = await adminService.getServiceCategories({ businessId: selectedBusinessId });
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [selectedBusinessId]);

  const fetchServices = useCallback(async () => {
    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null' || selectedBusinessId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusinessId,
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined
      };

      const [servicesRes, popularRes] = await Promise.all([
        adminService.getServices(params),
        adminService.getPopularServices({ businessId: selectedBusinessId, limit: 10 })
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data || []);
        setTotalPages(servicesRes.pagination?.pages || 1);
        
        // Calculate stats
        const total = servicesRes.pagination?.total || 0;
        const active = (servicesRes.data || []).filter(s => s.isActive !== false).length;
        const popular = popularRes.success ? (popularRes.data || []).length : 0;
        
        setStats({
          total,
          active,
          categories: categories.length,
          popular
        });
      } else {
        toast.error(servicesRes.error || 'Failed to fetch services');
        setServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, selectedBusinessId, categories.length]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchCategories();
      fetchServices();
    }
  }, [fetchServices, fetchCategories, selectedBusinessId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await adminService.deleteService(id);
      if (response.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(response.error || 'Failed to delete service');
      }
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineCube className="text-primary-600" />
            Services & Products
          </h1>
          <p className="text-gray-600 mt-1">Manage your service catalog</p>
        </div>
        <button
          onClick={() => navigate('/admin/services/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard key="total" title="Total Services" value={stats.total} icon={<HiOutlineCube className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard key="active" title="Active" value={stats.active} icon={<HiOutlineCube className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard key="categories" title="Categories" value={stats.categories} icon={<HiOutlineTag className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
        <StatsCard key="popular" title="Popular" value={stats.popular} icon={<HiOutlineCube className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiOutlineCube className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => {
                  setSelectedBusinessId(e.target.value);
                  localStorage.setItem('selectedBusinessId', e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchServices();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button onClick={fetchServices} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><HiOutlineCube className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No services found</p></td></tr>
              ) : (
                services.map((service, index) => (
                  <ServiceRow 
                    key={service._id || service.id || `service-${index}`} 
                    service={service} 
                    onView={(id) => navigate(`/admin/services/${id}`)} 
                    onEdit={(id) => navigate(`/admin/services/${id}/edit`)} 
                    onDelete={handleDelete} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;

