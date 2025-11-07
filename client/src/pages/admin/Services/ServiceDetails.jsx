import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineCube } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const ServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await adminService.getService(id);
        if (response.success) {
          const serviceData = response.data;
          setService({
            ...serviceData,
            _id: serviceData._id || serviceData.id,
            bookingCount: serviceData.totalBookings || serviceData.bookingCount || 0,
            revenue: serviceData.totalRevenue || serviceData.revenue || 0,
            avgRating: serviceData.averageRating || serviceData.avgRating || 0,
            recentBookings: serviceData.recentBookings || serviceData.appointments || []
          });
        } else {
          toast.error(response.error || 'Failed to fetch service');
          navigate('/admin/services');
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
        toast.error('Failed to fetch service');
        navigate('/admin/services');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!service) return <div className="text-center py-12">Service not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/services')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <HiOutlineArrowLeft className="w-5 h-5" />Back to Services
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
          <p className="text-gray-600 mt-1">{service.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/services/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <HiOutlinePencil className="w-5 h-5" />Edit
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50">
            <HiOutlineTrash className="w-5 h-5" />Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', value: service.bookingCount || 0, color: 'blue' },
          { label: 'Revenue', value: `₹${(service.revenue || 0).toLocaleString()}`, color: 'green' },
          { label: 'Avg Rating', value: service.avgRating || 0, color: 'yellow' },
          { label: 'Duration', value: `${service.duration || 0} min`, color: 'purple' }
        ].map((stat, i) => (
          <div key={`stat-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-600">Price</dt><dd className="text-sm font-medium text-gray-900 mt-1">₹{service.price}</dd></div>
            <div><dt className="text-sm text-gray-600">Duration</dt><dd className="text-sm font-medium text-gray-900 mt-1">{service.duration} minutes</dd></div>
            <div><dt className="text-sm text-gray-600">Category</dt><dd className="text-sm font-medium text-gray-900 mt-1">{service.category}</dd></div>
            <div><dt className="text-sm text-gray-600">Status</dt><dd className="mt-1"><span className={`px-2 py-1 text-xs rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{service.isActive ? 'Active' : 'Inactive'}</span></dd></div>
            <div><dt className="text-sm text-gray-600">Featured</dt><dd className="mt-1"><span className={`px-2 py-1 text-xs rounded-full ${service.featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{service.featured ? 'Yes' : 'No'}</span></dd></div>
            <div><dt className="text-sm text-gray-600">Description</dt><dd className="text-sm font-medium text-gray-900 mt-1">{service.description}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {service.recentBookings && service.recentBookings.length > 0 ? (
              service.recentBookings.map((booking, index) => (
                <div key={booking.id || booking._id || `booking-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customer?.name || booking.customerName || booking.customer || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{booking.date ? new Date(booking.date).toLocaleDateString() : booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{booking.status || 'completed'}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent bookings found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;

