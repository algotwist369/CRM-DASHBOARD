import React, { useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaChartBar,
  FaUsers,
  FaBuilding,
  FaUserTie,
} from "react-icons/fa";

const BusinessList = () => {
  // ✅ Dummy Data (Mock API Response)
  const dummyData = {
    admin: {
      name: "Ankit Pathak",
      companyName: "VandV Agro Pvt Ltd",
      email: "ankit@vandvagro.com",
    },
    stats: {
      businesses: { total: 3, salon: 1, spa: 1, hotel: 1 },
      managers: 6,
      staff: 28,
      totalRevenue: "₹4,50,000",
      totalCustomers: 120,
      recentTransactions: 25,
    },
    analytics: {
      monthlyRevenue: [
        { month: "July", revenue: 85000 },
        { month: "August", revenue: 92000 },
        { month: "September", revenue: 105000 },
        { month: "October", revenue: 138000 },
      ],
    },
    recentBusinesses: [
      {
        id: 1,
        name: "Relax & Renew Spa",
        type: "spa",
        branch: "Lucknow",
        businessLink: "#",
        managersCount: 2,
        staffCount: 10,
      },
      {
        id: 2,
        name: "Hotel Silver Star",
        type: "hotel",
        branch: "Kanpur",
        businessLink: "#",
        managersCount: 3,
        staffCount: 12,
      },
      {
        id: 3,
        name: "Glow Beauty Salon",
        type: "salon",
        branch: "Varanasi",
        businessLink: "#",
        managersCount: 1,
        staffCount: 6,
      },
    ],
  };

  const [businesses, setBusinesses] = useState(dummyData.recentBusinesses);

  // ✅ CRUD Handlers (Mock Actions)
  const handleAdd = () => alert("Add New Business");
  const handleEdit = (id) => alert(`Edit Business ID: ${id}`);
  const handleView = (id) => alert(`View Business ID: ${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      setBusinesses(businesses.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back, {dummyData.admin.name} 👋
        </p>
      </header>

      {/* Analytics Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          icon={<FaBuilding className="text-gray-500 text-xl" />}
          title="Total Businesses"
          value={dummyData.stats.businesses.total}
        />
        <AnalyticsCard
          icon={<FaUsers className="text-gray-500 text-xl" />}
          title="Total Customers"
          value={dummyData.stats.totalCustomers}
        />
        <AnalyticsCard
          icon={<FaUserTie className="text-gray-500 text-xl" />}
          title="Active Staff"
          value={dummyData.stats.staff}
        />
        <AnalyticsCard
          icon={<FaChartBar className="text-gray-500 text-xl" />}
          title="Total Revenue"
          value={dummyData.stats.totalRevenue}
        />
      </section>

      {/* Business List Table */}
      <section className="bg-white shadow-md rounded-2xl p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-700">
            Business List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <FaPlus /> Add Business
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 border-b">Name</th>
                <th className="text-left px-4 py-3 border-b">Type</th>
                <th className="text-left px-4 py-3 border-b">Branch</th>
                <th className="text-left px-4 py-3 border-b">Managers</th>
                <th className="text-left px-4 py-3 border-b">Staff</th>
                <th className="text-left px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-gray-50 transition-all text-gray-600"
                >
                  <td className="px-4 py-3 border-b">{b.name}</td>
                  <td className="px-4 py-3 border-b capitalize">{b.type}</td>
                  <td className="px-4 py-3 border-b">{b.branch}</td>
                  <td className="px-4 py-3 border-b">{b.managersCount}</td>
                  <td className="px-4 py-3 border-b">{b.staffCount}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleView(b.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(b.id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue Analytics */}
      <section className="mt-8 bg-white shadow-md rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaChartBar className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-700">
            Monthly Revenue Analytics
          </h2>
        </div>

        <ul className="space-y-2 text-gray-600">
          {dummyData.analytics.monthlyRevenue.map((item) => (
            <li
              key={item.month}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{item.month}</span>
              <span>₹{item.revenue.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

// ✅ Reusable Analytics Card
const AnalyticsCard = ({ title, value, icon }) => (
  <div className="bg-white border shadow-sm rounded-2xl p-4 flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default BusinessList;
