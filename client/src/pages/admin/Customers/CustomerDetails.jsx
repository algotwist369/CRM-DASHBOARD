import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineGift,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChat
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';
import Modal from '../../../components/common/Modal/Modal';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const { data: customer, isLoading: loading, isError } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await adminService.getCustomer(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch customer');
    },
    onError: (error) => {
      toast.error(error.message);
      navigate('/admin/customers');
    },
    refetchOnWindowFocus: false,
    retry: 1
  });

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmationText('');
  };

  const confirmDelete = async () => {
    try {
      const response = await adminService.deleteCustomer(id);
      if (response.success) {
        toast.success('Customer deleted successfully');
        navigate('/admin/customers');
      } else {
        toast.error(response.error || 'Failed to delete customer');
      }
    } catch (error) {
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      platinum: 'bg-purple-100 text-purple-800',
      gold: 'bg-yellow-100 text-yellow-800',
      silver: 'bg-gray-100 text-gray-800',
      bronze: 'bg-orange-100 text-orange-800',
      none: 'bg-gray-100 text-gray-600'
    };
    return badges[tier?.toLowerCase()] || badges.none;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !customer) {
    return <div className="text-center py-12">Customer not found</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{customer.fullName}</h1>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
            {customer.isBlacklisted && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-900 text-white">
                Blacklisted
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">ID: {customer._id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/customers/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300  text-gray-700 hover:bg-gray-50 transition-colors "
          >
            <HiOutlinePencil className="w-5 h-5" />
            Edit Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200  text-red-600 hover:bg-red-50 transition-colors "
          >
            <HiOutlineTrash className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white  border border-gray-200 p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Loyalty Points</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{customer.loyaltyPoints?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <HiOutlineGift className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white  border border-gray-200 p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Visits</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{customer.totalVisits}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <HiOutlineCalendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white  border border-gray-200 p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(customer.totalSpent)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <HiOutlineDocumentText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white  border border-gray-200 p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Membership</p>
              <span className={`inline-flex mt-2 px-3 py-1 text-sm font-semibold rounded-full ${getTierBadge(customer.membershipTier)}`}>
                {(customer.membershipTier || 'none').toUpperCase()}
              </span>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <HiOutlineStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white  border border-gray-200  overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            {['overview', 'appointments', 'invoices', 'loyalty'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Personal & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <HiOutlineUser className="w-5 h-5 text-gray-400" />
                      Personal Information
                    </h3>
                    <div className="bg-gray-50  p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Full Name</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.fullName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2 break-all">{customer.email || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.phone}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Age</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.age ? `${customer.age} years` : 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Gender</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2 capitalize">{customer.gender?.replace(/_/g, ' ') || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Date of Birth</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{formatDate(customer.dateOfBirth)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Anniversary</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{formatDate(customer.anniversary)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Language</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2 uppercase">{customer.preferredLanguage || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <HiOutlineLocationMarker className="w-5 h-5 text-gray-400" />
                      Address Details
                    </h3>
                    <div className="bg-gray-50  p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Street</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.address?.street || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">City</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.address?.city || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">State</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.address?.state || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Country</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.address?.country || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Zip Code</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.address?.zipCode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <HiOutlineOfficeBuilding className="w-5 h-5 text-gray-400" />
                      Business & Insights
                    </h3>
                    <div className="bg-gray-50  p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Business</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{customer.business?.name} ({customer.business?.branch})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2 capitalize">{customer.customerType}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Source</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2 capitalize">{customer.source}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Avg. Spent</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{formatCurrency(customer.averageSpent)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">First Visit</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">{formatDate(customer.firstVisit)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Last Visit</span>
                        <span className="text-sm font-medium text-gray-900 col-span-2">
                          {formatDate(customer.lastVisit)}
                          <span className="text-xs text-gray-500 ml-2">({customer.daysSinceLastVisit} days ago)</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-500">Tags</span>
                        <div className="col-span-2 flex flex-wrap gap-2">
                          {customer.tags?.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <HiOutlineTag className="mr-1" /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <HiOutlineCheckCircle className="w-5 h-5 text-gray-400" />
                      Preferences & Consent
                    </h3>
                    <div className="bg-gray-50  p-4 space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Preferred Staff</p>
                        <div className="flex flex-wrap gap-2">
                          {customer.preferences?.preferredStaff?.length > 0 ? (
                            customer.preferences.preferredStaff.map(staff => (
                              <div key={staff._id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-200">
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 border border-gray-200 p-2">
                                  {staff.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">{staff.name}</p>
                                  <p className="text-[10px] text-gray-500 capitalize">{staff.role}</p>
                                </div>
                              </div>
                            ))
                          ) : <span className="text-sm text-gray-400">None</span>}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Preferred Time</p>
                        <div className="flex gap-2">
                          {customer.preferences?.preferredTimeSlots?.map((slot, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 capitalize">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Marketing Consent</p>
                        <div className="flex gap-4">
                          <div className={`flex items-center gap-1.5 text-sm ${customer.marketingConsent?.email ? 'text-green-600' : 'text-gray-400'}`}>
                            <HiOutlineMail /> Email
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm ${customer.marketingConsent?.sms ? 'text-green-600' : 'text-gray-400'}`}>
                            <HiOutlineChat /> SMS
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm ${customer.marketingConsent?.whatsapp ? 'text-green-600' : 'text-gray-400'}`}>
                            <HiOutlineChat /> WhatsApp
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm ${customer.marketingConsent?.phone ? 'text-green-600' : 'text-gray-400'}`}>
                            <HiOutlinePhone /> Phone
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="bg-yellow-50 border border-yellow-100  p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{customer.notes || 'No notes available.'}</p>
                </div>
              </div>

              {/* Created By Info */}
              <div className="text-xs text-gray-400 text-right pt-4 border-t border-gray-100">
                Created by {customer.createdBy?.name} ({customer.createdByModel}) on {formatDate(customer.createdAt)}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.appointments && customer.appointments.length > 0 ? (
                    customer.appointments.map((apt, index) => (
                      <tr key={apt.id || apt._id || `apt-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.service?.name || apt.service || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(apt.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {apt.status || 'completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(apt.amount || apt.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No appointments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.invoices && customer.invoices.length > 0 ? (
                    customer.invoices.map((inv, index) => (
                      <tr key={inv.id || inv._id || `inv-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{inv.invoiceNumber || inv.invoiceId || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(inv.date || inv.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(inv.amount || inv.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {inv.status || 'paid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No invoices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.loyaltyHistory && customer.loyaltyHistory.length > 0 ? (
                    customer.loyaltyHistory.map((item, index) => (
                      <tr key={item.id || item._id || `loyalty-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'earned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.type || 'earned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.points > 0 ? '+' : ''}{item.points || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reason || item.description || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date || item.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No loyalty history found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{customer.fullName}</strong>? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteConfirmationText !== 'DELETE'}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerDetails;
