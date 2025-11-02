import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiEye, FiSearch } from "react-icons/fi";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ManagerList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      
      const res = await adminService.getManagers(params);
      if (res.success) {
        const data = res.data?.data || [];
        setManagers(data);
        setTotalPages(res.data?.pagination?.pages || 1);
        setTotal(res.data?.pagination?.total || 0);
      } else {
        setError(res.error || "Failed to load managers");
      }
    } catch (e) {
      setError("Failed to load managers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) {
      return;
    }
    
    try {
      setDeleting(id);
      const res = await adminService.deleteManager(id);
      if (res.success) {
        toast.success("Manager deleted successfully");
        fetchManagers();
      } else {
        toast.error(res.error || "Failed to delete manager");
      }
    } catch (e) {
      toast.error("Failed to delete manager");
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (manager) => {
    navigate(`/admin/managers/${manager.id}`);
  };

  const handleEdit = (manager) => {
    navigate(`/admin/managers/${manager.id}/edit`);
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Managers</h1>
          <p className="text-sm text-gray-600">Manage all business managers</p>
        </div>
        <button 
          onClick={() => navigate('/admin/managers/create')} 
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <AiOutlineUserAdd className="text-lg" />
          Add Manager
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border shadow-sm rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Managers</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
        <div className="bg-white border shadow-sm rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{total}</p>
        </div>
        <div className="bg-white border shadow-sm rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Per Page</p>
          <p className="text-2xl font-bold text-primary-600">{managers.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden mb-6">
        <div className="flex items-center px-4 py-3">
          <FiSearch className="text-gray-400 text-xl mr-3" />
          <input
            type="text"
            placeholder="Search managers by name, username, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : managers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No managers found</p>
            <p className="text-sm">Create your first manager to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Business</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 font-medium">{manager.name}</td>
                    <td className="px-4 py-3 text-gray-600">{manager.username}</td>
                    <td className="px-4 py-3 text-gray-600">{manager.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{manager.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-700 font-medium">{manager.business}</p>
                        {manager.businessBranch && (
                          <p className="text-xs text-gray-500">{manager.businessBranch}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(manager)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleEdit(manager)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="Edit Manager"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(manager.id)}
                          disabled={deleting === manager.id}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                          title="Delete Manager"
                        >
                          {deleting === manager.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 border">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} managers
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerList;
