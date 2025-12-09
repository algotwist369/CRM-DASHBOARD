import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCube, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash
} from 'react-icons/hi';
import { CiFilter } from 'react-icons/ci';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const StatsCard = memo(({ title, value }) => (
  <div className="border border-gray-200 bg-white p-3">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-xl font-semibold text-gray-900">{value}</p>
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
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '--';
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
    const durations = activeOptions.map((option) => Number(option.duration)).filter((d) => !Number.isNaN(d));
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {service.business?.name || '--'}
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

  const [filtersOpen, setFiltersOpen] = useState(false); // <-- New toggle state

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        const businessList = (response.data || []).map((business) => ({
          ...business,
          _id: business?._id || business?.id || business?.businessId
        }));
        setBusinesses(businessList);
        setBusinessesLoaded(true);

        const storedValue = localStorage.getItem('selectedBusinessId');
        const resolvedBusinessId = resolveBusinessId(storedValue, businessList);
        // Default to '' (All Businesses) if no valid selection is stored
        let nextBusinessId = resolvedBusinessId || '';

        if (nextBusinessId && isValidObjectId(nextBusinessId)) {
          setSelectedBusinessId(nextBusinessId);
          localStorage.setItem('selectedBusinessId', nextBusinessId);
        } else {
          setSelectedBusinessId(''); // Ensure state matches "All Businesses"
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
    // if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) return; // Allow fetching for all businesses
    try {
      const params = selectedBusinessId && isValidObjectId(selectedBusinessId) ? { businessId: selectedBusinessId } : {};
      const response = await adminService.getServiceCategories(params);
      if (response.success) setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [selectedBusinessId]);

  const fetchServices = useCallback(async () => {
    // if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) { // Allow fetching for all businesses
    //   setLoading(false);
    //   return;
    // }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusinessId && isValidObjectId(selectedBusinessId) ? selectedBusinessId : undefined,
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined
      };

      const popularParams = { limit: 10 };
      if (selectedBusinessId && isValidObjectId(selectedBusinessId)) {
        popularParams.businessId = selectedBusinessId;
      }

      const [servicesRes, popularRes] = await Promise.all([
        adminService.getServices(params),
        adminService.getPopularServices(popularParams)
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data || []);
        setTotalPages(servicesRes.pagination?.pages || 1);

        const total = servicesRes.pagination?.total || 0;
        const active = (servicesRes.data || []).filter(s => s.isActive !== false).length;
        const popular = popularRes.success ? (popularRes.data || []).length : 0;
        setStats({ total, active, categories: categories.length, popular });
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

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  useEffect(() => {
    if (businessesLoaded) {
      // Always fetch if businesses are loaded, regardless of selection
      fetchCategories();
      fetchServices();
    }
  }, [businessesLoaded, selectedBusinessId, fetchServices, fetchCategories]);

  const handleDelete = async (id) => {
    try {
      const response = await adminService.deleteService(id);
      if (response.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else toast.error(response.error || 'Failed to delete service');
    } catch (error) { toast.error('Failed to delete service'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BackButton />
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
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Services" value={stats.total} />
        <StatsCard title="Active" value={stats.active} />
        <StatsCard title="Categories" value={stats.categories} />
        <StatsCard title="Popular" value={stats.popular} />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFiltersOpen(prev => !prev)}>
        <CiFilter className="w-6 h-6 text-gray-400" />
        <span className="text-gray-700 font-medium">Filters</span>
      </div>

      {/* Filters Section */}
      {filtersOpen && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-4 ">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">

            {/* Search */}
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchServices(); } }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-0 transition"
              />
            </div>

            {/* Business Selector */}
            {businesses.length > 0 && (
              <div className="w-full">
                <select
                  value={selectedBusinessId}
                  onChange={(e) => {
                    setSelectedBusinessId(e.target.value);
                    localStorage.setItem('selectedBusinessId', e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300  bg-white focus:outline-none focus:ring-0 transition"
                >
                  <option value="">All Businesses</option>
                  {businesses.filter(b => b?._id).map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh */}
            <div className="flex justify-start md:justify-start">
              <button
                onClick={fetchServices}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition"
              >
                <HiOutlineRefresh className="w-5 h-5" /> Refresh
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Services Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center"><HiOutlineCube className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No services found</p></td></tr>
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
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >Previous</button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
