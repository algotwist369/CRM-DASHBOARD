import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaIdCard,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import { toast } from "react-hot-toast";

const ManagerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManager = async () => {
      try {
        setLoading(true);
        const res = await adminService.getManager(id);
        if (res.success) {
          const data = res.data?.data || res.data;
          setManager(data);
        } else {
          setError(res.error || "Failed to fetch manager details");
          toast.error(res.error || "Failed to fetch manager details");
        }
      } catch (e) {
        setError("Failed to fetch manager details");
        toast.error("Failed to fetch manager details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchManager();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manager details...</p>
        </div>
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-gray-800">
          <FaArrowLeft /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || "Manager not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Manager Details</h1>
            <p className="text-sm text-gray-600">View complete manager information</p>
          </div>
        </div>
      </div>

      {/* Manager Info Card */}
      <div className="bg-white border shadow-sm rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <FaUser className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{manager.name}</h2>
            <p className="text-gray-600">@{manager.username}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800 font-medium">{manager.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaPhone className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-800 font-medium">{manager.phone || "—"}</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
              
              <div className="flex items-start gap-3">
                <FaBuilding className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Business</p>
                  <p className="text-gray-800 font-medium">{manager.business?.name || "—"}</p>
                  {manager.business?.branch && (
                    <p className="text-xs text-gray-500 mt-1">{manager.business.branch}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Business Type</p>
                  <p className="text-gray-800 font-medium capitalize">{manager.business?.type || "—"}</p>
                </div>
              </div>

              {manager.staffCount !== undefined && (
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Staff Members</p>
                    <p className="text-gray-800 font-medium">{manager.staffCount || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status & Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Details</h3>
              
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(manager.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {manager.updatedAt && (
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-gray-800 font-medium">
                      {new Date(manager.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  manager.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {manager.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {manager.permissions && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Manage Staff</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    manager.permissions.canManageStaff
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {manager.permissions.canManageStaff ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">View Reports</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    manager.permissions.canViewReports
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {manager.permissions.canViewReports ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Manage Daily Business</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    manager.permissions.canManageDailyBusiness
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {manager.permissions.canManageDailyBusiness ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Manage Transactions</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    manager.permissions.canManageTransactions
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {manager.permissions.canManageTransactions ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDetails;

