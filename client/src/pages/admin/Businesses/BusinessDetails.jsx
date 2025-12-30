import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';

const BusinessDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [businessLink, setBusinessLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchBusiness();
    fetchBusinessLink();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const result = await adminService.getBusinessById(id);
      if (result.success) {
        setBusiness(result.data);
      } else {
        alert('Failed to load business details');
        navigate('/admin/businesses');
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
      alert('Failed to load business details');
      navigate('/admin/businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBusinessLink = async () => {
    try {
      const result = await adminService.getBusinessLink(id);
      if (result.success) {
        setBusinessLink(result.data?.publicLink || result.data?.link);
      }
    } catch (error) {
      console.error('Failed to fetch business link:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBusiness();
    fetchBusinessLink();
  };

  const handleEdit = () => {
    navigate(`/admin/businesses/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${business?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminService.deleteBusiness(id);
      if (result.success) {
        alert('Business deleted successfully!');
        navigate('/admin/businesses');
      } else {
        alert(result.error || 'Failed to delete business');
      }
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('Failed to delete business');
    }
  };

  const handleCopyLink = () => {
    if (businessLink) {
      navigator.clipboard.writeText(businessLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Business not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white  p-5 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-600  flex items-center justify-center">
                  <FaBuilding className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {business.type}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${business.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {business.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/admin/businesses')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300  hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 text-sm font-medium"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white  hover:bg-red-700 text-sm font-medium"
              >
                <FaTrash />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Business Link */}
      {businessLink && (
        <div className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50  p-5 border border-primary-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Business Link
              </label>
              <div className="flex items-center gap-2">
                <code className="text-sm text-primary-700 font-mono bg-white px-3 py-2  border border-primary-200 flex-1">
                  {businessLink}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 text-sm font-medium whitespace-nowrap"
                >
                  {copiedLink ? (
                    <>
                      <FaCheckCircle />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Information */}
        <div className="bg-white  border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="text-primary-600" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Business Name</label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Business Type</label>
              <p className="text-base font-semibold text-gray-900 mt-1 capitalize">{business.type}</p>
            </div>
            {business.branch && (
              <div>
                <label className="text-sm font-medium text-gray-600">Branch</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{business.branch}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Business Link</label>
              <code className="block text-sm font-mono text-primary-600 bg-gray-100 px-3 py-2  mt-1">
                {business.businessLink}
              </code>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white  border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaPhoneAlt className="text-primary-600" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FaPhoneAlt className="text-gray-400" />
                Phone
              </label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.phone || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                Email
              </label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.email || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white  border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-primary-600" />
          Location Information
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Address</label>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {business.address || '—'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.city || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.state || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ZIP Code</label>
              <p className="text-base font-semibold text-gray-900 mt-1">{business.zipCode || '—'}</p>
            </div>
          </div>
          {business.googleMapsUrl && (
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-600">Google Maps URL</label>
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary-600 hover:text-primary-700 underline mt-1 truncate"
              >
                {business.googleMapsUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white  border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <div className="flex items-center gap-3">
          {business.isActive ? (
            <>
              <FaCheckCircle className="text-green-500 text-2xl" />
              <div>
                <p className="font-semibold text-gray-900">Active</p>
                <p className="text-sm text-gray-600">This business is currently operating</p>
              </div>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-500 text-2xl" />
              <div>
                <p className="font-semibold text-gray-900">Inactive</p>
                <p className="text-sm text-gray-600">This business is not currently operating</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;

