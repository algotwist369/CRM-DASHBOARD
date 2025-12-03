import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCurrencyDollar } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white   border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
    </div>
  </div>
));

const InvoiceRow = memo(({ invoice, onView }) => {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    'partially-paid': 'bg-blue-100 text-blue-800'
  };

  const customerName = invoice.customer
    ? `${invoice.customer.firstName || ''} ${invoice.customer.lastName || ''}`.trim() || 'N/A'
    : invoice.customerSnapshot?.name || 'N/A';
  const invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date();
  const total = invoice.total || 0;
  const paidAmount = invoice.paidAmount || 0;
  const balanceDue = invoice.balanceDue || (total - paidAmount);
  const status = invoice.status || invoice.paymentStatus || 'pending';
  const paymentStatus = invoice.paymentStatus || status;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber || 'N/A'}</div>
        <div className="text-sm text-gray-500">{invoiceDate.toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customerName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{total.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{paidAmount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{balanceDue.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[paymentStatus] || statusColors.pending}`}>
          {paymentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(invoice._id)} className="text-blue-600 hover:text-blue-900">
          <HiOutlineEye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper to validate ObjectId
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  }, []);

  // Validate selectedBusinessId on mount/change
  useEffect(() => {
    if (selectedBusinessId && !isValidObjectId(selectedBusinessId)) {
      setSelectedBusinessId('');
      localStorage.removeItem('selectedBusinessId');
    }
  }, [selectedBusinessId]);

  const fetchInvoices = useCallback(async () => {
    // Allow empty selectedBusinessId (for "All Businesses"), but validate if present
    if (selectedBusinessId && !isValidObjectId(selectedBusinessId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusinessId || undefined,
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };

      const [invoicesRes, statsRes] = await Promise.all([
        adminService.getInvoices(params),
        adminService.getInvoiceStats({ businessId: selectedBusinessId || undefined })
      ]);

      if (invoicesRes.success) {
        setInvoices(invoicesRes.data || []);
        setTotalPages(invoicesRes.pagination?.pages || 1);
      } else {
        toast.error(invoicesRes.error || 'Failed to fetch invoices');
        setInvoices([]);
      }

      if (statsRes.success) {
        const statsData = statsRes.data || {};
        setStats({
          total: statsData.totalRevenue || statsData.total || 0,
          paid: statsData.paidAmount || statsData.paid || 0,
          pending: statsData.pendingAmount || statsData.pending || 0,
          overdue: statsData.overdueAmount || statsData.overdue || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    // Always fetch invoices, even if selectedBusinessId is empty (All Businesses)
    if (!selectedBusinessId || isValidObjectId(selectedBusinessId)) {
      fetchInvoices();
    }
  }, [fetchInvoices, selectedBusinessId]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineDocumentText className="text-primary-600" />Invoices & Payments</h1><p className="text-gray-600 mt-1">Manage your invoices</p></div>
        <button onClick={() => navigate('/admin/invoices/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Create Invoice</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard key="total" title="Total Revenue" value={formatCurrency(stats.total)} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard key="paid" title="Paid" value={formatCurrency(stats.paid)} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard key="pending" title="Pending" value={formatCurrency(stats.pending)} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard key="overdue" title="Overdue" value={formatCurrency(stats.overdue)} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-red-600" />} color="text-red-600" />
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchInvoices();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Business Selector */}
          {businesses.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <select
                  value={selectedBusinessId}
                  onChange={(e) => {
                    setSelectedBusinessId(e.target.value);
                    if (e.target.value) {
                      localStorage.setItem('selectedBusinessId', e.target.value);
                    } else {
                      localStorage.removeItem('selectedBusinessId');
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500  bg-white"
                >
                  <option value="">All Businesses</option>
                  {businesses.map((business, index) => (
                    <option key={business._id || index} value={business._id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially-paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={fetchInvoices} className="px-4 py-2 border border-gray-300  hover:bg-gray-50 flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white   border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center"><HiOutlineDocumentText className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No invoices found</p></td></tr>
              ) : (
                invoices.map((invoice, index) => (
                  <InvoiceRow
                    key={invoice._id || invoice.id || `invoice-${index}`}
                    invoice={invoice}
                    onView={(id) => navigate(`/admin/invoices/${id}`)}
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
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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

export default InvoiceList;

