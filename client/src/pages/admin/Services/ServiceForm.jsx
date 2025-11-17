
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const resolveBusinessId = (storedValue, businessList = []) => {
  if (!storedValue || storedValue === 'undefined' || storedValue === 'null') return '';
  if (isValidObjectId(storedValue)) return storedValue;

  const matchById = businessList.find(
    biz => biz?._id === storedValue || biz?.id === storedValue || biz?.businessId === storedValue
  );
  if (matchById) return matchById._id;

  const matchByName = businessList.find(biz => biz?.name === storedValue);
  if (matchByName) return matchByName._id;

  return '';
};

const ServiceForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [businessesLoaded, setBusinessesLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    category: '',
    serviceType: 'service',
    
    // Pricing
    pricingType: 'variable',
    price: '',
    duration: '',
    bufferTime: 0,
    currency: 'INR',
    pricingOptions: [{ name: '', price: '', originalPrice: '', duration: '', isActive: true }],
    
    // Availability
    isActive: true,
    isAvailableOnline: true,
    availableDays: [],
    
    // Staff
    requiresStaff: true,
    minStaffRequired: 1,
    staffCommission: { type: 'percentage', value: 0 },
    
    // Media
    thumbnail: '',
    images: [],
    
    // Booking
    allowOnlineBooking: true,
    advanceBookingDays: 30,
    cancellationPolicy: {
      allowed: true,
      hoursBeforeService: 24,
      cancellationFee: 0
    },
    
    // Display
    isFeatured: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [imageInput, setImageInput] = useState('');

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'availability', label: 'Availability' },
    { id: 'staff', label: 'Staff & Commission' },
    { id: 'media', label: 'Media' },
    { id: 'booking', label: 'Booking Settings' }
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await adminService.getBusinesses();
        if (response.success) {
          const fetchedBusinesses = (response.data || [])
            .map((business) => ({
              ...business,
              _id: business?._id || business?.id || business?.businessId
            }))
            .filter((business) => business && business._id);

          setBusinesses(fetchedBusinesses);
          setBusinessesLoaded(true);

          const storedValue = localStorage.getItem('selectedBusinessId');
          let nextBusinessId = resolveBusinessId(storedValue, fetchedBusinesses);

          if (!nextBusinessId && fetchedBusinesses.length > 0) {
            nextBusinessId = fetchedBusinesses[0]._id;
          }

          if (nextBusinessId && isValidObjectId(nextBusinessId)) {
            setSelectedBusinessId(nextBusinessId);
            localStorage.setItem('selectedBusinessId', nextBusinessId);
          } else {
            localStorage.removeItem('selectedBusinessId');
          }
        } else {
          setBusinessesLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        setBusinessesLoaded(true);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) return;
      try {
        const response = await adminService.getServiceCategories({ businessId: selectedBusinessId });
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    if (businessesLoaded && selectedBusinessId) fetchCategories();
  }, [businessesLoaded, selectedBusinessId]);

  useEffect(() => {
    const fetchService = async () => {
      if (mode === 'edit' && id) {
        try {
          setFetching(true);
          const response = await adminService.getService(id);
          if (response.success) {
            const service = response.data;
            const hasPricingOptions = service.pricingOptions && service.pricingOptions.length > 0;
            const pricingType = hasPricingOptions ? 'variable' : (service.pricingType || 'fixed');
            
            setFormData({
              name: service.name || '',
              description: service.description || '',
              category: service.category || '',
              serviceType: service.serviceType || 'service',
              pricingType: pricingType,
              price: service.price || '',
              duration: service.duration || '',
              bufferTime: service.bufferTime || 0,
              currency: service.currency || 'INR',
              pricingOptions: hasPricingOptions 
                ? service.pricingOptions.map(opt => ({
                    name: opt.name || '',
                    price: opt.price?.toString() || '',
                    originalPrice: opt.originalPrice?.toString() || '',
                    duration: opt.duration?.toString() || '',
                    isActive: opt.isActive !== false
                  }))
                : [{ name: '', price: '', originalPrice: '', duration: '', isActive: true }],
              isActive: service.isActive !== false,
              isAvailableOnline: service.isAvailableOnline !== false,
              availableDays: service.availableDays || [],
              requiresStaff: service.requiresStaff !== false,
              minStaffRequired: service.minStaffRequired || 1,
              staffCommission: service.staffCommission || { type: 'percentage', value: 0 },
              thumbnail: service.thumbnail || '',
              images: service.images || [],
              allowOnlineBooking: service.allowOnlineBooking !== false,
              advanceBookingDays: service.advanceBookingDays || 30,
              cancellationPolicy: service.cancellationPolicy || {
                allowed: true,
                hoursBeforeService: 24,
                cancellationFee: 0
              },
              isFeatured: service.isFeatured || false
            });
            
            // Handle business field - could be ObjectId or populated object
            const businessId = service.business?._id || service.business || service.businessId;
            if (businessId) {
              // Normalize to ensure we have the _id format
              const normalizedBusinessId = typeof businessId === 'object' ? businessId._id || businessId : businessId;
              if (normalizedBusinessId) {
                const businessIdString = normalizedBusinessId.toString();
                setSelectedBusinessId(businessIdString);
                localStorage.setItem('selectedBusinessId', businessIdString);

                if (service.business && typeof service.business === 'object') {
                  setBusinesses((prev) => {
                    if (prev.some(biz => biz?._id === businessIdString)) {
                      return prev;
                    }
                    return [
                      ...prev,
                      {
                        ...service.business,
                        _id: businessIdString
                      }
                    ];
                  });
                }
              }
            }
          } else {
            toast.error(response.error || 'Failed to fetch service');
            navigate('/admin/services');
          }
        } catch (error) {
          console.error('Failed to fetch service:', error);
          toast.error('Failed to fetch service');
          navigate('/admin/services');
        } finally {
          setFetching(false);
        }
      }
    };
    fetchService();
  }, [mode, id, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const name = e.target.name;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear errors for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    // Also clear nested errors
    Object.keys(formErrors).forEach(key => {
      if (key.startsWith(name)) {
        const newErrors = { ...formErrors };
        delete newErrors[key];
        setFormErrors(newErrors);
      }
    });
  };

  const handlePricingTypeChange = (e) => {
    const newPricingType = e.target.value;
    setFormData({
      ...formData,
      pricingType: newPricingType,
      pricingOptions: newPricingType === 'fixed' 
        ? [{ name: '', price: '', originalPrice: '', duration: '', isActive: true }]
        : formData.pricingOptions
    });
  };

  const handlePricingOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.pricingOptions];
    const formattedValue = field === 'isActive' ? Boolean(value) : value;
    updatedOptions[index] = { ...updatedOptions[index], [field]: formattedValue };
    setFormData({ ...formData, pricingOptions: updatedOptions });

    const errorKey = `pricingOptions.${index}.${field}`;
    if (formErrors[errorKey]) {
      const newErrors = { ...formErrors };
      delete newErrors[errorKey];
      setFormErrors(newErrors);
    }
  };

  const addPricingOption = () => {
    setFormData({
      ...formData,
      pricingOptions: [...formData.pricingOptions, { name: '', price: '', originalPrice: '', duration: '', isActive: true }]
    });
  };

  const removePricingOption = (index) => {
    if (formData.pricingOptions.length > 1) {
      setFormData({
        ...formData,
        pricingOptions: formData.pricingOptions.filter((_, i) => i !== index)
      });
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const toggleDay = (day) => {
    const days = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    setFormData({ ...formData, availableDays: days });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    
    if (formData.pricingType === 'fixed') {
      if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
      if (!formData.duration || Number(formData.duration) <= 0) errors.duration = 'Valid duration is required';
    } else {
      if (!formData.pricingOptions || formData.pricingOptions.length === 0) {
        errors.pricingOptions = 'At least one pricing option is required';
      } else {
        formData.pricingOptions.forEach((option, index) => {
          if (!option.price || Number(option.price) <= 0) {
            errors[`pricingOptions.${index}.price`] = 'Valid price is required';
          }
          if (!option.duration || Number(option.duration) <= 0) {
            errors[`pricingOptions.${index}.duration`] = 'Valid duration is required';
          }
        });
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!selectedBusinessId || !isValidObjectId(selectedBusinessId)) {
      toast.error('Please select a valid business');
      return;
    }

    setLoading(true);
    
    try {
      let payload = {
        businessId: selectedBusinessId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim() || undefined,
        serviceType: formData.serviceType,
        pricingType: formData.pricingType,
        currency: formData.currency,
        bufferTime: formData.bufferTime || 0,
        isActive: formData.isActive,
        isAvailableOnline: formData.isAvailableOnline,
        availableDays: formData.availableDays.length > 0 ? formData.availableDays : undefined,
        requiresStaff: formData.requiresStaff,
        minStaffRequired: formData.minStaffRequired || 1,
        staffCommission: formData.staffCommission,
        thumbnail: formData.thumbnail.trim() || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        allowOnlineBooking: formData.allowOnlineBooking,
        advanceBookingDays: formData.advanceBookingDays || 30,
        cancellationPolicy: formData.cancellationPolicy,
        isFeatured: formData.isFeatured || false
      };

      if (formData.pricingType === 'fixed') {
        payload.price = Number(formData.price);
        payload.duration = Number(formData.duration);
      } else {
        // Filter out empty options and validate
        const validOptions = formData.pricingOptions
          .filter(opt => opt.price && opt.duration && Number(opt.price) > 0 && Number(opt.duration) > 0)
          .map(opt => {
            const optionPayload = {
              name: opt.name?.trim() || undefined,
              price: Number(opt.price),
              duration: Number(opt.duration),
              isActive: opt.isActive !== false
            };

            if (opt.originalPrice && Number(opt.originalPrice) > 0) {
              optionPayload.originalPrice = Number(opt.originalPrice);
            }

            return optionPayload;
          });
        
        if (validOptions.length > 0) {
          payload.pricingOptions = validOptions;
        }
      }

      // Clean undefined values and empty arrays
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || 
            (Array.isArray(payload[key]) && payload[key].length === 0) ||
            (typeof payload[key] === 'string' && payload[key].trim() === '')) {
          delete payload[key];
        }
      });
      
      // Ensure staffCommission and cancellationPolicy are properly formatted
      if (payload.staffCommission && typeof payload.staffCommission === 'object') {
        payload.staffCommission = {
          type: payload.staffCommission.type || 'percentage',
          value: Number(payload.staffCommission.value) || 0
        };
      }
      
      if (payload.cancellationPolicy && typeof payload.cancellationPolicy === 'object') {
        payload.cancellationPolicy = {
          allowed: payload.cancellationPolicy.allowed !== false,
          hoursBeforeService: Number(payload.cancellationPolicy.hoursBeforeService) || 24,
          cancellationFee: Number(payload.cancellationPolicy.cancellationFee) || 0
        };
      }

      let response;
      if (mode === 'create') {
        response = await adminService.createService(payload);
      } else {
        response = await adminService.updateService(id, payload);
      }

      if (response.success) {
        toast.success(`Service ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        navigate('/admin/services');
      } else {
        toast.error(response.error || `Failed to ${mode === 'create' ? 'create' : 'update'} service`);
      }
    } catch (error) {
      console.error('Failed to save service:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} service`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/services')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <HiOutlineArrowLeft className="w-5 h-5" />Back to Services
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Add New Service' : 'Edit Service'}</h1>
          <p className="text-gray-600 mt-1">Create and manage service details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Business Selector */}
          {businessesLoaded && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business <span className="text-red-500">*</span>
              </label>
              {businesses.filter((business) => business && business._id).length === 0 ? (
                <p className="text-sm text-gray-500">No valid businesses found.</p>
              ) : (
                <select
                  value={selectedBusinessId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedBusinessId(value);
                    localStorage.setItem('selectedBusinessId', value);
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="">Select a business</option>
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

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter service name"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="service">Service</option>
                    <option value="product">Product</option>
                    <option value="package">Package</option>
                    <option value="membership">Membership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {categories.length > 0 ? (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                        formErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.category || cat} value={cat.category || cat}>
                          {cat.category || cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                        formErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Hair, Skin, Nails"
                    />
                  )}
                  {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="Detailed service description"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handlePricingTypeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="variable">Variable Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (minutes)</label>
                  <input
                    type="number"
                    name="bufferTime"
                    value={formData.bufferTime}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.pricingType === 'fixed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                        formErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                        formErrors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="30"
                    />
                    {formErrors.duration && <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>}
                  </div>
                </div>
              )}

              {formData.pricingType === 'variable' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Pricing Options <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addPricingOption}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <HiOutlinePlus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                  {formErrors.pricingOptions && (
                    <p className="text-sm text-red-600">{formErrors.pricingOptions}</p>
                  )}
                  <div className="space-y-3">
                    {formData.pricingOptions.map((option, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Option Name</label>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => handlePricingOptionChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                            placeholder="e.g., Standard"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Duration (min) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={option.duration}
                            onChange={(e) => handlePricingOptionChange(index, 'duration', e.target.value)}
                            required
                            min="1"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                              formErrors[`pricingOptions.${index}.duration`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="30"
                          />
                          {formErrors[`pricingOptions.${index}.duration`] && (
                            <p className="mt-1 text-xs text-red-600">{formErrors[`pricingOptions.${index}.duration`]}</p>
                          )}
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) => handlePricingOptionChange(index, 'price', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 ${
                              formErrors[`pricingOptions.${index}.price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="500.00"
                          />
                          {formErrors[`pricingOptions.${index}.price`] && (
                            <p className="mt-1 text-xs text-red-600">{formErrors[`pricingOptions.${index}.price`]}</p>
                          )}
                        </div>
                        <div className="col-span-12 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Original Price
                          </label>
                          <input
                            type="number"
                            value={option.originalPrice}
                            onChange={(e) => handlePricingOptionChange(index, 'originalPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2 flex flex-col justify-between">
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                            <input
                              type="checkbox"
                              checked={option.isActive !== false}
                              onChange={(e) => handlePricingOptionChange(index, 'isActive', e.target.checked)}
                              className="rounded"
                            />
                            Active
                          </label>
                          {formData.pricingOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePricingOption(index)}
                              className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center justify-center"
                              title="Remove option"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: ServiceName &gt; duration1 - price1, duration2 - price2, etc.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAvailableOnline"
                    checked={formData.isAvailableOnline}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Available Online</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Staff & Commission Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requiresStaff"
                    checked={formData.requiresStaff}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Requires Staff</span>
                </label>
              </div>
              {formData.requiresStaff && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Staff Required</label>
                  <input
                    type="number"
                    name="minStaffRequired"
                    value={formData.minStaffRequired}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
                  <select
                    name="staffCommission.type"
                    value={formData.staffCommission.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Value</label>
                  <input
                    type="number"
                    name="staffCommission.value"
                    value={formData.staffCommission.value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="Add image URL and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm text-gray-700 truncate">{img}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings Tab */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allowOnlineBooking"
                    checked={formData.allowOnlineBooking}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Online Booking</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking Days</label>
                <input
                  type="number"
                  name="advanceBookingDays"
                  value={formData.advanceBookingDays}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="30"
                />
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cancellation Policy</h3>
                <div className="flex items-center gap-6 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.cancellationPolicy.allowed}
                      onChange={(e) => handleChange({ target: { name: 'cancellationPolicy.allowed', type: 'checkbox', checked: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Cancellation</span>
                  </label>
                </div>
                {formData.cancellationPolicy.allowed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hours Before Service</label>
                      <input
                        type="number"
                        value={formData.cancellationPolicy.hoursBeforeService}
                        onChange={(e) => handleChange({ target: { name: 'cancellationPolicy.hoursBeforeService', value: e.target.value } })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Fee</label>
                      <input
                        type="number"
                        value={formData.cancellationPolicy.cancellationFee}
                        onChange={(e) => handleChange({ target: { name: 'cancellationPolicy.cancellationFee', value: e.target.value } })}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
          >
            <HiOutlineSave className="w-5 h-5" />
            {loading ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Update Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;

