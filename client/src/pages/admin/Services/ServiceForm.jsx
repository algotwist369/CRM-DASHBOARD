import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const ServiceForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    isActive: true,
    featured: false
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchBusinesses = async () => {
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
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
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
    };

    if (selectedBusinessId) {
      fetchCategories();
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    const fetchService = async () => {
      if (mode === 'edit' && id) {
        try {
          setFetching(true);
          const response = await adminService.getService(id);
          if (response.success) {
            const service = response.data;
            setFormData({
              name: service.name || '',
              category: service.category || '',
              description: service.description || '',
              price: service.price || '',
              duration: service.duration || '',
              isActive: service.isActive !== false,
              featured: service.featured || false
            });
            if (service.business?._id) {
              setSelectedBusinessId(service.business._id);
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
    setFormData({ ...formData, [e.target.name]: value });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.duration || Number(formData.duration) <= 0) errors.duration = 'Valid duration is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
      toast.error('Please select a business');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        businessId: selectedBusinessId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        duration: Number(formData.duration),
        isActive: formData.isActive,
        featured: formData.featured || undefined
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <p className="text-gray-600 mt-1">
            {mode === 'create' ? 'Create a new service or product' : 'Update service information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Business Selector */}
          {businesses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Select a business</option>
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter service name" 
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              {categories.length > 0 ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Hair, Skin, Nails" 
                />
              )}
              {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter price" 
              />
              {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                required 
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter duration" 
              />
              {formErrors.duration && <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Enter service description" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded" /><span className="text-sm font-medium text-gray-700">Active</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="rounded" /><span className="text-sm font-medium text-gray-700">Featured</span></label>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/services')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50">
            <HiOutlineSave className="w-5 h-5" />{loading ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Update Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;

