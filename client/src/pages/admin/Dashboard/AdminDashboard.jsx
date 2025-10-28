import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  // Simulate fetching dashboard data (dummy JSON)
  useEffect(() => {
    const dummyData = {
      stats: {
        businesses: {
          total: 8,
          salon: 3,
          spa: 3,
          hotel: 2,
        },
        managers: 12,
        staff: 48,
        totalRevenue: "₹4,32,500",
        totalCustomers: 325,
        recentTransactions: 40,
      },
      analytics: {
        revenueGrowth: "12%",
        customerGrowth: "8%",
        avgTransaction: "₹1,200",
      },
      recentBusinesses: [
        {
          id: "b1",
          name: "Bliss Spa",
          type: "spa",
          branch: "Lucknow",
          businessLink: "/business/bliss-spa",
          managersCount: 2,
          staffCount: 8,
        },
        {
          id: "b2",
          name: "Elite Salon",
          type: "salon",
          branch: "Kanpur",
          businessLink: "/business/elite-salon",
          managersCount: 1,
          staffCount: 6,
        },
        {
          id: "b3",
          name: "Urban Hotel",
          type: "hotel",
          branch: "Varanasi",
          businessLink: "/business/urban-hotel",
          managersCount: 3,
          staffCount: 10,
        },
      ],
    };

    setTimeout(() => setDashboard(dummyData), 500);
  }, []);

  if (!dashboard)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Businesses" value={dashboard.stats.businesses.total} />
        <StatCard title="Managers" value={dashboard.stats.managers} />
        <StatCard title="Staff" value={dashboard.stats.staff} />
        <StatCard title="Revenue (30 days)" value={dashboard.stats.totalRevenue} />
        <StatCard title="Customers (30 days)" value={dashboard.stats.totalCustomers} />
        <StatCard title="Recent Transactions" value={dashboard.stats.recentTransactions} />
      </div>

      {/* Business Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Businesses by Type
        </h2>
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard.stats.businesses.salon}
            </p>
            <p className="text-gray-500">Salons</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard.stats.businesses.spa}
            </p>
            <p className="text-gray-500">Spas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard.stats.businesses.hotel}
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
            {dashboard.recentBusinesses.map((b) => (
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
