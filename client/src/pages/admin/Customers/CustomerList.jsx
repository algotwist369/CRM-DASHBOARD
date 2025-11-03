import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUsers, HiOutlineUserAdd, HiOutlineSearch, HiOutlineFilter,
  HiOutlineRefresh, HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
  HiOutlineStar, HiOutlineCalendar
} from 'react-icons/hi';

// Stats Card Component
const StatsCard = memo(({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
));

// Customer Row Component
const CustomerRow = memo(({ customer, onView, onEdit, onDelete }) => {
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

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {customer.fullName?.charAt(0) || 'C'}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
            <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadge(customer.membershipTier)}`}>
          {customer.membershipTier || 'None'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {customer.loyaltyPoints || 0} pts
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {customer.totalVisits || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{customer.totalSpent?.toLocaleString() || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onView(customer._id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="View Details"
        >
          <HiOutlineEye className="w-5 h-5" />
        </button>
        <button
          onClick={() => onEdit(customer._id)}
          className="text-green-600 hover:text-green-900 mr-3"
          title="Edit"
        >
          <HiOutlinePencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(customer._id)}
          className="text-red-600 hover:text-red-900"
          title="Delete"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    vip: 0
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminService.getCustomers({ 
      //   page: currentPage, 
      //   search: searchTerm,
      //   tier: filterTier
      // });
      
      // Mock data for now
      setTimeout(() => {
        setCustomers([
          {
            _id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+91 98765 43210',
            membershipTier: 'gold',
            loyaltyPoints: 2500,
            totalVisits: 15,
            totalSpent: 45000
          },
          {
            _id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+91 98765 43211',
            membershipTier: 'platinum',
            loyaltyPoints: 5000,
            totalVisits: 25,
            totalSpent: 85000
          },
        ]);
        setStats({
          total: 245,
          active: 198,
          newThisMonth: 23,
          vip: 12
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterTier]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleView = (id) => navigate(`/admin/customers/${id}`);
  const handleEdit = (id) => navigate(`/admin/customers/${id}/edit`);
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    // TODO: Implement delete
    console.log('Delete customer:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineUsers className="text-primary-600" />
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => navigate('/admin/customers/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <HiOutlineUserAdd className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats.total}
          icon={<HiOutlineUsers className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          trend="+12% from last month"
        />
        <StatsCard
          title="Active Customers"
          value={stats.active}
          icon={<HiOutlineUsers className="w-6 h-6 text-green-600" />}
          color="text-green-600"
        />
        <StatsCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={<HiOutlineUserAdd className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
        />
        <StatsCard
          title="VIP Customers"
          value={stats.vip}
          icon={<HiOutlineStar className="w-6 h-6 text-yellow-600" />}
          color="text-yellow-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Tiers</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
            <option value="none">No Tier</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <HiOutlineUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first customer.</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <CustomerRow
                    key={customer._id}
                    customer={customer}
                    onView={handleView}
                    onEdit={handleEdit}
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
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;

