import React, { useEffect, useState } from "react";
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
import businessService from "../../../../services/admin/businessService";
import { useNavigate } from "react-router-dom";

const BusinessList = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page: 1, limit: 20 };
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await businessService.getBusinesses(params);
        if (res.success) {
          const list = res.data?.data || res.data?.businesses || [];
          setBusinesses(list);
        } else {
          setError(res.error || "Failed to load businesses");
        }
      } catch (e) {
        setError("Failed to load businesses");
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // ✅ Handlers
  const handleAdd = () => navigate('/admin/businesses/create');
  const handleEdit = (id) => navigate(`/admin/businesses/${id}/edit`);
  const handleView = (id) => navigate(`/admin/businesses/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this business?")) return;
    const res = await businessService.deleteBusiness(id);
    if (res.success) {
      setBusinesses((prev) => prev.filter((b) => (b.id || b._id) !== id));
    } else {
      alert(res.error || 'Delete failed');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </header>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses by name or branch..."
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Analytics Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          icon={<FaBuilding className="text-gray-500 text-xl" />}
          title="Total Businesses"
          value={businesses.length}
        />
        <AnalyticsCard
          icon={<FaUsers className="text-gray-500 text-xl" />}
          title="Total Customers"
          value={"—"}
        />
        <AnalyticsCard
          icon={<FaUserTie className="text-gray-500 text-xl" />}
          title="Active Staff"
          value={"—"}
        />
        <AnalyticsCard
          icon={<FaChartBar className="text-gray-500 text-xl" />}
          title="Total Revenue"
          value={"—"}
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
              {(loading ? [] : businesses).map((b) => (
                <tr
                  key={b.id || b._id}
                  className="hover:bg-gray-50 transition-all text-gray-600"
                >
                  <td className="px-4 py-3 border-b">{b.name}</td>
                  <td className="px-4 py-3 border-b capitalize">{b.type}</td>
                  <td className="px-4 py-3 border-b">{b.branch}</td>
                  <td className="px-4 py-3 border-b">{b.managersCount ?? b.managers?.length ?? 0}</td>
                  <td className="px-4 py-3 border-b">{b.staffCount ?? b.staff?.length ?? 0}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleView(b.id || b._id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(b.id || b._id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id || b._id)}
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
          {loading && (
            <div className="p-4 text-sm text-gray-500">Loading businesses…</div>
          )}
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
          <li className="text-sm text-gray-500">(Analytics coming soon)</li>
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
