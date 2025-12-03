import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';
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
  if (!service) {
    return {
      isVariable: false,
      priceRange: '--',
      durationRange: '--',
      currency: 'INR',
      options: []
    };
  }

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
        name: option.name,
        duration: option.duration,
        price: option.price,
        originalPrice: option.originalPrice
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

const ServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  const fetchService = useCallback(async () => {
    if (!id) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await adminService.getService(id, {
        signal: abortControllerRef.current.signal
      });

      if (!isMounted.current) return;

      if (response.success) {
        const serviceData = response.data;
        setService({
          ...serviceData,
          _id: serviceData._id || serviceData.id,
          bookingCount: serviceData.stats?.totalBookings || 0,
          revenue: serviceData.stats?.totalRevenue || 0,
          avgRating: serviceData.ratings?.average || 0,
          recentBookings: serviceData.recentBookings || []
        });
      } else {
        toast.error(response.error || 'Failed to fetch service');
        navigate('/admin/services');
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Request cancelled');
        return;
      }
      if (!isMounted.current) return;
      console.error('Failed to fetch service:', error);
      toast.error('Failed to fetch service');
      navigate('/admin/services');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    isMounted.current = true;
    fetchService();

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchService]);

  const handleDelete = async () => {
    try {
      const response = await adminService.deleteService(id);
      if (response.success) {
        toast.success('Service deleted successfully');
        navigate('/admin/services');
      } else {
        toast.error(response.error || 'Failed to delete service');
      }
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const pricingInfo = useMemo(() => getPricingSummary(service), [service]);

  const businessName = useMemo(() =>
    service?.business?.name || service?.businessName || service?.business?.businessName || 'N/A',
    [service]);

  const availableDaysText = useMemo(() =>
    service?.availableDays && service.availableDays.length
      ? service.availableDays.join(', ')
      : 'Not specified',
    [service]);

  const cancellationPolicy = useMemo(() => service?.cancellationPolicy || {
    allowed: true,
    hoursBeforeService: 24,
    cancellationFee: 0
  }, [service]);

  const staffCommissionText = useMemo(() => service?.staffCommission
    ? `${service.staffCommission.value || 0}${service.staffCommission.type === 'percentage' ? '%' : ''}`
    : 'Not set',
    [service]);

  const summaryStats = useMemo(() => [
    { label: 'Total bookings', value: service?.bookingCount || 0, hint: 'Lifetime' },
    { label: 'Price range', value: pricingInfo?.priceRange || '--', hint: 'Current pricing' },
    { label: 'Revenue', value: formatCurrency(service?.revenue || 0, service?.currency || pricingInfo?.currency), hint: 'Recorded to date' }
  ], [service, pricingInfo]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  if (!service) return <div className="text-center py-12">Service not found</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <div className="flex items-center gap-4 mt-2">
            {service.thumbnail && (
              <img
                src={service.thumbnail}
                alt={service.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-gray-600 mt-1">{service.category}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/services/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50">
            <HiOutlinePencil className="w-5 h-5" />Edit
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 border border-red-300  text-red-600 hover:bg-red-50">
            <HiOutlineTrash className="w-5 h-5" />Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className=" border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Business</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{businessName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{service.category || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Service Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{service.serviceType || 'Service'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pricing Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{service.pricingType || 'fixed'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span className="inline-flex mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-900">
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Featured</p>
              <span className="inline-flex mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-900">
                {(service.isFeatured || service.featured) ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm text-gray-900 mt-1">{service.description || 'No description provided'}</p>
          </div>

          {/* Inventory Section */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Inventory & SEO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Inventory Tracking</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {service.inventory?.trackInventory ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {service.inventory?.trackInventory && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Current Stock</p>
                    <p className={`text-sm font-medium mt-1 ${(service.inventory?.currentStock || 0) <= (service.inventory?.lowStockThreshold || 0)
                      ? 'text-red-600'
                      : 'text-gray-900'
                      }`}>
                      {service.inventory?.currentStock || 0} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Low Stock Alert</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Below {service.inventory?.lowStockThreshold || 0} units
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-gray-500">SEO Keywords</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {service.seo?.keywords?.length > 0 ? (
                    service.seo.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <p className="text-sm text-gray-600 mb-4">
            {pricingInfo.isVariable ? 'Multiple pricing options available' : 'Fixed pricing'}
          </p>
          {pricingInfo.isVariable ? (
            <div className="space-y-3">
              {pricingInfo.options.map((option) => (
                <div key={option.key} className="p-3  border border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray-900">
                      {option.name || `${option.duration} min`}
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(option.price, pricingInfo.currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{option.duration} min</span>
                    {option.originalPrice && (
                      <span className="line-through">
                        {formatCurrency(option.originalPrice, pricingInfo.currency)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className=" border border-gray-100 p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">{pricingInfo.priceRange}</p>
              <p>{pricingInfo.durationRange}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking & Staff</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Online Booking</p>
              <p className="font-medium text-gray-900 mt-1">
                {service.allowOnlineBooking !== false ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Advance Booking</p>
              <p className="font-medium text-gray-900 mt-1">
                {service.advanceBookingDays ? `${service.advanceBookingDays} days` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Buffer Time</p>
              <p className="font-medium text-gray-900 mt-1">
                {service.bufferTime ? `${service.bufferTime} min` : '0 min'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Requires Staff</p>
              <p className="font-medium text-gray-900 mt-1">
                {service.requiresStaff !== false ? `Yes (min ${service.minStaffRequired || 1})` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Staff Commission</p>
              <p className="font-medium text-gray-900 mt-1">{staffCommissionText}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Available Days</p>
              <p className="font-medium text-gray-900 mt-1">{availableDaysText}</p>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-4 text-sm">
            <p className="text-xs text-gray-500 mb-2">Cancellation Policy</p>
            {cancellationPolicy.allowed ? (
              <p className="text-gray-900">
                Free cancellation up to {cancellationPolicy.hoursBeforeService || 24} hrs before service.
                {cancellationPolicy.cancellationFee
                  ? ` Fee: ${formatCurrency(cancellationPolicy.cancellationFee, pricingInfo.currency)}`
                  : ' No fee after that.'}
              </p>
            ) : (
              <p className="text-gray-900">Cancellations not allowed.</p>
            )}
          </div>
        </div>

        {/* <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {service.recentBookings && service.recentBookings.length > 0 ? (
              service.recentBookings.map((booking, index) => (
                <div key={booking.id || booking._id || `booking-${index}`} className="flex items-center justify-between p-3 bg-gray-50 ">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customer?.name || booking.customerName || booking.customer || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{booking.date ? new Date(booking.date).toLocaleDateString() : booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-900">{booking.status || 'completed'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent bookings found</p>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ServiceDetails;

