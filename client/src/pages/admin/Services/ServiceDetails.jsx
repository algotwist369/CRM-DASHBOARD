import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineCube } from 'react-icons/hi';

const ServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setService({
        _id: id,
        name: 'Haircut',
        category: 'Hair',
        description: 'Professional haircut service with styling consultation',
        price: 500,
        duration: 30,
        isActive: true,
        featured: true,
        bookingCount: 150,
        revenue: 75000,
        avgRating: 4.8,
        recentBookings: [
          { id: 1, customer: 'John Doe', date: '2024-01-15', status: 'completed' },
          { id: 2, customer: 'Jane Smith', date: '2024-01-14', status: 'completed' }
        ]
      });
      setLoading(false);
    }, 500);
  }, [id]);

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
          <button onClick={() => { if(window.confirm('Delete?')) navigate('/admin/services'); }} className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50">
            <HiOutlineTrash className="w-5 h-5" />Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', value: service.bookingCount, color: 'blue' },
          { label: 'Revenue', value: `₹${service.revenue.toLocaleString()}`, color: 'green' },
          { label: 'Avg Rating', value: service.avgRating, color: 'yellow' },
          { label: 'Duration', value: `${service.duration} min`, color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            {service.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.customer}</p>
                  <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;

