import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCurrencyDollar } from 'react-icons/hi';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
    </div>
  </div>
));

const InvoiceRow = memo(({ invoice, onView }) => {
  const statusColors = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', overdue: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div><div className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</div></td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customerName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{invoice.total?.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{invoice.paid?.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(invoice.total - invoice.paid)?.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[invoice.status]}`}>{invoice.status}</span></td>
      <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => onView(invoice._id)} className="text-blue-600 hover:text-blue-900"><HiOutlineEye className="w-5 h-5" /></button></td>
    </tr>
  );
});

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setInvoices([
        { _id: '1', invoiceNumber: 'INV-001', date: new Date(), customerName: 'John Doe', total: 5000, paid: 5000, status: 'paid' },
        { _id: '2', invoiceNumber: 'INV-002', date: new Date(), customerName: 'Jane Smith', total: 8000, paid: 3000, status: 'pending' },
      ]);
      setStats({ total: '₹2.5L', paid: '₹2.1L', pending: '₹35K', overdue: '₹5K' });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineDocumentText className="text-primary-600" />Invoices & Payments</h1><p className="text-gray-600 mt-1">Manage your invoices</p></div>
        <button onClick={() => navigate('/admin/invoices/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Create Invoice</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Revenue" value={stats.total} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard title="Paid" value={stats.paid} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard title="Pending" value={stats.pending} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard title="Overdue" value={stats.overdue} icon={<HiOutlineCurrencyDollar className="w-6 h-6 text-red-600" />} color="text-red-600" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
              ) : (
                invoices.map((invoice) => <InvoiceRow key={invoice._id} invoice={invoice} onView={(id) => navigate(`/admin/invoices/${id}`)} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;

