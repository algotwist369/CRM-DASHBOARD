import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';

const ServiceForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    isActive: true,
    featured: false
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      setFormData({
        name: 'Haircut',
        category: 'Hair',
        description: 'Professional haircut service',
        price: '500',
        duration: '30',
        isActive: true,
        featured: true
      });
    }
  }, [mode, id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert(`Service ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      navigate('/admin/services');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/services')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <HiOutlineArrowLeft className="w-5 h-5" />Back to Services
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Add New Service' : 'Edit Service'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Enter service name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g., Hair, Skin, Nails" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Enter price" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) <span className="text-red-500">*</span></label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Enter duration" />
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

