import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineCube, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = memo(({ title, value, description }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
  </div>
));

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
};

const formatCurrency = (value, currency = 'INR') => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '--';
  }
  const symbol = currencySymbols[currency] || '';
  const amount = Number(value).toLocaleString('en-IN');
  return symbol ? `${symbol}${amount}` : `${currency} ${amount}`;
};

const getPricingSummary = (service) => {
  const currency = service.currency || 'INR';
  const activeOptions = (service.pricingOptions || []).filter(
    (option) => option && option.isActive !== false && option.price
  );

  if (service.pricingType === 'variable' && activeOptions.length > 0) {
    const prices = activeOptions.map((option) => Number(option.price)).filter((price) => !Number.isNaN(price));
    const durations = activeOptions
      .map((option) => Number(option.duration))
      .filter((duration) => !Number.isNaN(duration));

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDuration = durations.length ? Math.min(...durations) : null;
    const maxDuration = durations.length ? Math.max(...durations) : null;

    return {
      isVariable: true,
      priceRange: minPrice === maxPrice
        ? formatCurrency(minPrice, currency)
        : `${formatCurrency(minPrice, currency)} - ${formatCurrency(maxPrice, currency)}`,
      durationRange: minDuration === null
        ? '--'
        : minDuration === maxDuration
          ? `${minDuration} min`
          : `${minDuration}-${maxDuration} min`,
      options: activeOptions.map((option) => ({
        key: option._id || `${option.duration}-${option.price}`,
        duration: option.duration,
        price: option.price
      })),
      currency
    };
  }

  return {
    isVariable: false,
    priceRange: service.price ? formatCurrency(service.price, currency) : '--',
    durationRange: service.duration ? `${service.duration} min` : '--',
    options: [],
    currency
  };
};

const ServiceRow = memo(({ service, onView, onEdit, onDelete }) => {
  const pricingInfo = getPricingSummary(service);

  return (
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
        {pricingInfo.isVariable ? (
          <div>
            <p className="font-medium text-gray-900">{pricingInfo.priceRange}</p>
            <p className="text-xs text-gray-500 mt-1">
              {pricingInfo.options.length
                ? `${pricingInfo.options.length} option${pricingInfo.options.length > 1 ? 's' : ''}`
                : 'Variable pricing'}
            </p>
          </div>
        ) : (
          <p className="font-medium text-gray-900">{pricingInfo.priceRange}</p>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {pricingInfo.durationRange}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {service.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {service.totalBookings || service.bookingCount || service.stats?.totalBookings || 0}
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
  );
});

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const resolveBusinessId = (storedValue, businessList = []) => {
  if (!storedValue || storedValue === 'undefined' || storedValue === 'null') return '';
  if (isValidObjectId(storedValue)) return storedValue;

  const matchById = businessList.find(biz => biz._id === storedValue);
  if (matchById) return matchById._id;

  const matchByName = businessList.find(biz => biz.name === storedValue);
  if (matchByName) return matchByName._id;

  return '';
};

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, categories: 0, popular: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [categories, setCategories] = useState([]);
  const [businessesLoaded, setBusinessesLoaded] = useState(false);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        const businessList = (response.data || []).map((business) => ({
          ...business,
          _id: business?._id || business?.id || business?.businessId || business?._id
        }));
        setBusinesses(businessList);
        setBusinessesLoaded(true);

        // Resolve businessId from localStorage (might be name or invalid)
        const storedValue = localStorage.getItem('selectedBusinessId');
        const resolvedBusinessId = resolveBusinessId(storedValue, businessList);
        let nextBusinessId = resolvedBusinessId;

        // If no valid businessId found, use first business
        if (!nextBusinessId && businessList.length > 0) {
          nextBusinessId = businessList[0]._id;
        }

        // Only set if we have a valid ObjectId
        if (nextBusinessId && isValidObjectId(nextBusinessId)) {
          setSelectedBusinessId(nextBusinessId);
          localStorage.setItem('selectedBusinessId', nextBusinessId);
        } else {
          // Clear invalid value from localStorage
          localStorage.removeItem('selectedBusinessId');
        }
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      setBusinessesLoaded(true);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) {
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
    // Validate businessId before making API calls
    if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) {
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
    // Only fetch services/categories after businesses are loaded and we have a valid businessId
    if (businessesLoaded && selectedBusinessId && isValidObjectId(selectedBusinessId)) {
      fetchCategories();
      fetchServices();
    } else if (businessesLoaded && !selectedBusinessId) {
      // If businesses loaded but no valid businessId, stop loading
      setLoading(false);
    }
  }, [businessesLoaded, selectedBusinessId, fetchServices, fetchCategories]);

  const handleDelete = async (id) => {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Services" value={stats.total} description="All services under this business" />
        <StatsCard title="Active" value={stats.active} description="Currently visible to clients" />
        <StatsCard title="Categories" value={stats.categories} description="Unique service categories" />
        <StatsCard title="Popular" value={stats.popular} description="Trending or most viewed" />
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business</label>
          {businesses.filter(biz => biz?._id).length === 0 ? (
            <p className="text-sm text-gray-500">No valid businesses found.</p>
          ) : (
            <select
              value={selectedBusinessId}
              onChange={(e) => {
                setSelectedBusinessId(e.target.value);
                localStorage.setItem('selectedBusinessId', e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 bg-white"
            >
              {businesses
                .filter((business) => business && business._id)
                .map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
            </select>
          )}
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

