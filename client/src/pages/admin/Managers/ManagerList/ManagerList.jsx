import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import { AiOutlineUserAdd } from "react-icons/ai";
import businessService from "../../../../services/admin/businessService";
import { useNavigate } from "react-router-dom";

const ManagerList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await businessService.getBusinesses({ page: 1, limit: 50 });
        if (res.success) {
          const businesses = res.data?.data || [];
          const flattened = businesses.flatMap((b) =>
            (b.managers || []).map((m) => ({
              id: m._id || m.id,
              name: m.name,
              username: m.username,
              email: m.email,
              phone: m.phone,
              business: b.name,
              businessId: b.id || b._id,
            }))
          );
          setManagers(flattened);
        } else {
          setError(res.error || "Failed to load managers");
        }
      } catch (e) {
        setError("Failed to load managers");
      } finally {
        setLoading(false);
      }
    };
    fetchManagers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      setManagers(managers.filter((m) => m.id !== id));
    }
  };

  const filteredManagers = managers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-2xl font-semibold text-gray-800">Manager List</h1>
        <button onClick={() => navigate('/admin/managers/create')} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg">
          <AiOutlineUserAdd className="text-lg" />
          Create Manager
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-600 text-sm font-medium">Total Managers</h2>
            <p className="text-2xl font-bold text-gray-800">{managers.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-600 text-sm font-medium">Active</h2>
            <p className="text-2xl font-bold text-green-600">
              {Math.floor(managers.length * 0.8)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-600 text-sm font-medium">Inactive</h2>
            <p className="text-2xl font-bold text-red-500">
              {Math.floor(managers.length * 0.2)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-lg shadow px-4 py-2 mb-4">
          <FiSearch className="text-gray-400 text-lg mr-2" />
          <input
            type="text"
            placeholder="Search manager by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-gray-700"
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Username</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Phone</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Business</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-gray-700">{manager.name}</td>
                    <td className="p-3 text-gray-700">{manager.username}</td>
                    <td className="p-3 text-gray-700">{manager.email}</td>
                    <td className="p-3 text-gray-700">{manager.phone}</td>
                    <td className="p-3 text-gray-700">{manager.business}</td>
                    <td className="p-3 text-center flex justify-center gap-3">
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                        <FiEye />
                      </button>
                      <button className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200">
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-gray-500 font-medium"
                  >
                    {loading ? 'Loading managers…' : 'No managers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

       
    </div>
  );
};

export default ManagerList;
