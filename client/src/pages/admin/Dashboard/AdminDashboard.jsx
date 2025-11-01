import React, { useState, useEffect } from "react";
import adminService from "../../../services/admin/adminService";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getDashboard();
        if (res.success) {
          setDashboard(res.data.data || res.data); // support {success, data} or direct data
        } else {
          setError(res.error || "Failed to load dashboard");
        }
      } catch (e) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Businesses" value={dashboard?.stats?.businesses?.total ?? 0} />
        <StatCard title="Managers" value={dashboard?.stats?.managers ?? 0} />
        <StatCard title="Staff" value={dashboard?.stats?.staff ?? 0} />
        <StatCard title="Revenue (30 days)" value={dashboard?.stats?.totalRevenue ?? 0} />
        <StatCard title="Customers (30 days)" value={dashboard?.stats?.totalCustomers ?? 0} />
        <StatCard title="Recent Transactions" value={dashboard?.stats?.recentTransactions ?? 0} />
      </div>

      {/* Business Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Businesses by Type
        </h2>
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard?.stats?.businesses?.salon ?? 0}
            </p>
            <p className="text-gray-500">Salons</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard?.stats?.businesses?.spa ?? 0}
            </p>
            <p className="text-gray-500">Spas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard?.stats?.businesses?.hotel ?? 0}
            </p>
            <p className="text-gray-500">Hotels</p>
          </div>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Businesses
        </h2>
        <table className="min-w-full border-t border-gray-100">
          <thead>
            <tr className="text-left text-gray-600 text-sm border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Type</th>
              <th className="py-2">Branch</th>
              <th className="py-2 text-center">Managers</th>
              <th className="py-2 text-center">Staff</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard?.recentBusinesses || []).map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium text-gray-800">{b.name}</td>
                <td className="py-2 capitalize">{b.type}</td>
                <td className="py-2">{b.branch}</td>
                <td className="py-2 text-center">{b.managersCount}</td>
                <td className="py-2 text-center">{b.staffCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Small Reusable Stat Card
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
