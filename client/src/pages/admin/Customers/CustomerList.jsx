import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUsers, HiOutlineUserAdd, HiOutlineSearch,
  HiOutlineRefresh, HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
  HiOutlineStar
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

// --- Sub-Components ---

const StatsGrid = memo(({ stats }) => {
  const statItems = useMemo(() => [
    {
      title: "Total Customers",
      value: stats.total,
      icon: HiOutlineUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Customers",
      value: stats.active,
      icon: HiOutlineUsers,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "New This Month",
      value: stats.newThisMonth,
      icon: HiOutlineUserAdd,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "VIP Customers",
      value: stats.vip,
      icon: HiOutlineStar,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ], [stats]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{item.title}</p>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            </div>
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const FilterSection = memo(({
  searchTerm, setSearchTerm,
  filterTier, setFilterTier,
  businesses, selectedBusinessId, setSelectedBusinessId,
  onRefresh
}) => {
  return (
    <div className="bg-white border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Customer Type Filter */}
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="px-4 py-2 border border-gray-300 outline-none focus:border-primary-500 transition-colors bg-white"
        >
          <option value="">All Customers</option>
          <option value="new">New Customers</option>
          <option value="regular">Regular Customers</option>
          <option value="vip">VIP Customers</option>
          <option value="walkin">Walk-in Customers</option>
          <option value="inactive">Inactive Customers</option>
        </select>

        {/* Business Selector */}
        {businesses.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 outline-none focus:border-primary-500 transition-colors bg-white"
              >
                <option value="">All Businesses</option>
                {businesses.map((business, index) => (
                  <option key={business.id || business._id || index} value={business.id || business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 flex items-center gap-2 transition-colors outline-none"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>
  );
});

const CustomerTable = memo(({ customers, loading, onView, onEdit, onDelete, showBusinessColumn }) => {
  const headers = [
    "Customer",
    "Phone",
    ...(showBusinessColumn ? ["Business"] : []),
    "Tier",
    "Points",
    "Visits",
    "Total Spent",
    // "Actions"
  ];

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
      <div className="bg-white border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-12 text-center">
        <HiOutlineUsers className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first customer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer, index) => (
              <tr key={customer.id || customer._id || index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold border border-primary-400 rounded-full w-10 h-10 flex items-center justify-center">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                {showBusinessColumn && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.business?.name || 'N/A'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadge(customer.membershipTier)}`}>
                    {customer.membershipTier || 'None'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.loyaltyPoints || 0} pts</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalVisits || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{customer.totalSpent?.toLocaleString() || 0}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onView(customer.id || customer._id)} className="text-blue-600 hover:text-blue-900" title="View">
                      <HiOutlineEye className="w-5 h-5" />
                    </button>
                    <button onClick={() => onEdit(customer.id || customer._id)} className="text-green-600 hover:text-green-900" title="Edit">
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(customer.id || customer._id)} className="text-red-600 hover:text-red-900" title="Delete">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border border-t-0 border-gray-200">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Main Component ---

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0, vip: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');

  // Refs for API deduplication
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Fetch businesses on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchBusinesses = async () => {
      try {
        const response = await adminService.getBusinesses({ limit: 1000 });
        if (response.success) {
          const businessesData = response.data || [];
          console.log('Fetched businesses:', businessesData);
          setBusinesses(businessesData);

          // Validate selectedBusinessId or set default
          // Validate selectedBusinessId
          if (businessesData.length > 0 && selectedBusinessId) {
            // Check if it's a valid ObjectId AND exists in the list
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedBusinessId);
            const existsInList = businessesData.some(b => (b.id || b._id) === selectedBusinessId);

            if (!isValidObjectId || !existsInList) {
              console.warn('Invalid or missing business ID in localStorage, resetting...');
              setSelectedBusinessId('');
              localStorage.setItem('selectedBusinessId', '');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };
    fetchBusinesses();
  }, []); // Remove selectedBusinessId dependency to avoid infinite loop logic

  const fetchCustomers = useCallback(async () => {
    // Allow empty selectedBusinessId for "All Businesses"
    if (selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      fetchingRef.current = true;
      abortControllerRef.current = new AbortController();
      setLoading(true);

      const params = {
        businessId: selectedBusinessId,
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        customerType: filterTier || undefined
      };

      console.log('Fetching customers with params:', params);

      const [customersRes, statsRes] = await Promise.all([
        adminService.getCustomers(params),
        adminService.getCustomerStats({ businessId: selectedBusinessId })
      ]);

      console.log('Customers response:', customersRes);
      console.log('Stats response:', statsRes);

      if (customersRes.success) {
        setCustomers(customersRes.data || []);
        setTotalPages(customersRes.pagination?.pages || 1);
      } else {
        toast.error(customersRes.error || 'Failed to fetch customers');
        setCustomers([]);
      }

      if (statsRes.success && statsRes.data) {
        setStats({
          total: statsRes.data.totalCustomers || 0,
          active: (statsRes.data.totalCustomers || 0) - (statsRes.data.inactiveCustomers || 0),
          newThisMonth: statsRes.data.newCustomers || 0,
          vip: statsRes.data.vipCustomers || 0
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch customers:', error);
        toast.error('Failed to fetch customers');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [selectedBusinessId, currentPage, searchTerm, filterTier]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleBusinessChange = useCallback((id) => {
    setSelectedBusinessId(id);
    localStorage.setItem('selectedBusinessId', id);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleTierChange = useCallback((tier) => {
    setFilterTier(tier);
    setCurrentPage(1);
  }, []);

  const handleView = useCallback((id) => navigate(`/admin/customers/${id}`), [navigate]);
  const handleEdit = useCallback((id) => navigate(`/admin/customers/${id}/edit`), [navigate]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const response = await adminService.deleteCustomer(id);
      if (response.success) {
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } else {
        toast.error(response.error || 'Failed to delete customer');
      }
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  }, [fetchCustomers]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineUsers className="text-primary-600" />
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        {/* <button
          onClick={() => navigate('/admin/customers/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <HiOutlineUserAdd className="w-5 h-5" />
          Add Customer
        </button> */}
      </div>

      <StatsGrid stats={stats} />

      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        filterTier={filterTier}
        setFilterTier={handleTierChange}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        setSelectedBusinessId={handleBusinessChange}
        onRefresh={fetchCustomers}
      />

      <CustomerTable
        customers={customers}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showBusinessColumn={!selectedBusinessId}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default CustomerList;
