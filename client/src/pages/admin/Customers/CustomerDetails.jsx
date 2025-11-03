import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineStar, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineGift } from 'react-icons/hi';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // TODO: Fetch customer data
    setTimeout(() => {
      setCustomer({
        _id: id,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
        address: '123 Main St, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        membershipTier: 'gold',
        loyaltyPoints: 2500,
        totalVisits: 15,
        totalSpent: 45000,
        lastVisit: '2024-01-15',
        joinedDate: '2023-06-10',
        notes: 'VIP customer, prefers morning appointments',
        appointments: [
          { id: 1, service: 'Haircut', date: '2024-01-15', status: 'completed', amount: 500 },
          { id: 2, service: 'Hair Color', date: '2024-01-10', status: 'completed', amount: 2000 }
        ],
        invoices: [
          { id: 1, invoiceNumber: 'INV-001', date: '2024-01-15', amount: 500, status: 'paid' },
          { id: 2, invoiceNumber: 'INV-002', date: '2024-01-10', amount: 2000, status: 'paid' }
        ],
        loyaltyHistory: [
          { id: 1, type: 'earned', points: 50, reason: 'Purchase', date: '2024-01-15' },
          { id: 2, type: 'redeemed', points: -100, reason: '10% Discount', date: '2024-01-10' }
        ]
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      // TODO: Delete API call
      alert('Customer deleted!');
      navigate('/admin/customers');
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
    return badges[tier] || badges.none;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center py-12">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/customers')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Customers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.fullName}</h1>
          <p className="text-gray-600 mt-1">Customer ID: #{customer._id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/customers/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <HiOutlinePencil className="w-5 h-5" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
          >
            <HiOutlineTrash className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{customer.loyaltyPoints}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <HiOutlineGift className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{customer.totalVisits}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <HiOutlineCalendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">₹{customer.totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <HiOutlineDocumentText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Membership</p>
              <span className={`inline-flex mt-2 px-3 py-1 text-sm font-semibold rounded-full ${getTierBadge(customer.membershipTier)}`}>
                {customer.membershipTier.toUpperCase()}
              </span>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <HiOutlineStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['overview', 'appointments', 'invoices', 'loyalty'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h3>
                  <dl className="space-y-3">
                    <div><dt className="text-sm text-gray-600">Email</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.email || 'Not provided'}</dd></div>
                    <div><dt className="text-sm text-gray-600">Phone</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.phone}</dd></div>
                    <div><dt className="text-sm text-gray-600">Date of Birth</dt><dd className="text-sm font-medium text-gray-900 mt-1">{new Date(customer.dateOfBirth).toLocaleDateString()}</dd></div>
                    <div><dt className="text-sm text-gray-600">Gender</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.gender}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Address</h3>
                  <dl className="space-y-3">
                    <div><dt className="text-sm text-gray-600">Address</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.address}</dd></div>
                    <div><dt className="text-sm text-gray-600">City</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.city}</dd></div>
                    <div><dt className="text-sm text-gray-600">State</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.state}</dd></div>
                    <div><dt className="text-sm text-gray-600">Pincode</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.pincode}</dd></div>
                  </dl>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Additional Information</h3>
                <dl className="space-y-3">
                  <div><dt className="text-sm text-gray-600">Joined Date</dt><dd className="text-sm font-medium text-gray-900 mt-1">{new Date(customer.joinedDate).toLocaleDateString()}</dd></div>
                  <div><dt className="text-sm text-gray-600">Last Visit</dt><dd className="text-sm font-medium text-gray-900 mt-1">{new Date(customer.lastVisit).toLocaleDateString()}</dd></div>
                  <div><dt className="text-sm text-gray-600">Notes</dt><dd className="text-sm font-medium text-gray-900 mt-1">{customer.notes || 'No notes'}</dd></div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {customer.appointments.map((apt) => (
                    <tr key={apt.id}><td className="px-4 py-3 text-sm text-gray-900">{apt.service}</td><td className="px-4 py-3 text-sm text-gray-900">{new Date(apt.date).toLocaleDateString()}</td><td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{apt.status}</span></td><td className="px-4 py-3 text-sm text-gray-900">₹{apt.amount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice#</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {customer.invoices.map((inv) => (
                    <tr key={inv.id}><td className="px-4 py-3 text-sm text-gray-900">{inv.invoiceNumber}</td><td className="px-4 py-3 text-sm text-gray-900">{new Date(inv.date).toLocaleDateString()}</td><td className="px-4 py-3 text-sm text-gray-900">₹{inv.amount}</td><td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{inv.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {customer.loyaltyHistory.map((item) => (
                    <tr key={item.id}><td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${item.type === 'earned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.type}</span></td><td className="px-4 py-3 text-sm font-medium text-gray-900">{item.points > 0 ? '+' : ''}{item.points}</td><td className="px-4 py-3 text-sm text-gray-900">{item.reason}</td><td className="px-4 py-3 text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;

