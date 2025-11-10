import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdBadge,
  FaRupeeSign,
  FaStar,
  FaSpinner,
  FaChevronLeft,
  FaSearch,
  FaFilter,
  FaCopy,
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";

const ROLE_COLORS = {
  stylist: "bg-blue-100 text-blue-700",
  therapist: "bg-purple-100 text-purple-700",
  receptionist: "bg-green-100 text-green-700",
  cleaner: "bg-orange-100 text-orange-700",
  assistant: "bg-gray-100 text-gray-700",
  other: "bg-pink-100 text-pink-700",
};

const BusinessStaff = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [copiedValue, setCopiedValue] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
    total: 0,
  });

  const fetchBusiness = useCallback(async () => {
    try {
      const res = await businessService.getBusiness(businessId);
      if (res.success) {
        const data = res.data?.data || res.data;
        setBusiness(data);
      }
    } catch (e) {
      console.error("Failed to fetch business:", e);
    }
  }, [businessId]);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterRole) params.role = filterRole;

      const res = await businessService.getBusinessStaff(businessId, params);
      if (res.success) {
        const staffData = res.data?.data || res.data;
        setStaff(staffData);
        if (res.data?.pagination) {
          setPagination((prev) => ({ ...prev, ...res.data.pagination }));
        }
      } else {
        setError(res.error || "Failed to fetch staff");
      }
    } catch (e) {
      setError("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  }, [businessId, debouncedSearch, filterRole, pagination.currentPage]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff, pagination.currentPage]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (copiedValue) {
      const timer = setTimeout(() => setCopiedValue(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedValue]);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleFilterChange = useCallback((role) => {
    setFilterRole(role);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCopy = useCallback((value, type) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(`${type}-${value}`);
  }, []);

  const roleOptions = useMemo(
    () => [
      "stylist",
      "therapist",
      "receptionist",
      "cleaner",
      "assistant",
      "other",
    ],
    []
  );

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <FaChevronLeft /> Back
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Business Staff
          </h1>
          {business && (
            <p className="text-sm text-gray-600 mt-1">
              {business.name} - {business.branch}
            </p>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or phone..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">All Roles</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {staff.map((member) => (
              <div
                key={member._id || member.id}
                className="bg-white border shadow-sm rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {member.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          ROLE_COLORS[member.role] || ROLE_COLORS.other
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                  {member.isActive ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {member.phone && (
                    <div className="flex items-center justify-between gap-2 text-gray-600 group">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FaPhone className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(member.phone, "phone")}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy phone"
                      >
                        {copiedValue === `phone-${member.phone}` ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <FaCopy className="text-gray-400 text-xs group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center justify-between gap-2 text-gray-600 group">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FaEnvelope className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(member.email, "email")}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy email"
                      >
                        {copiedValue === `email-${member.email}` ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <FaCopy className="text-gray-400 text-xs group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  )}
                  {member.specialization && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaIdBadge className="text-gray-400" />
                      {member.specialization}
                    </div>
                  )}
                  {member.experience > 0 && (
                    <div className="text-gray-600">
                      Experience: {member.experience} years
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                {(member.performance?.totalCustomers > 0 ||
                  member.performance?.totalRevenue > 0 ||
                  member.performance?.rating > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    {member.performance?.totalCustomers > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Customers</p>
                        <p className="font-semibold text-gray-800">
                          {member.performance.totalCustomers}
                        </p>
                      </div>
                    )}
                    {member.performance?.totalRevenue > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="font-semibold text-gray-800 flex items-center justify-center gap-1">
                          <FaRupeeSign className="text-xs" />
                          {member.performance.totalRevenue.toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                    {member.performance?.rating > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="font-semibold text-gray-800 flex items-center justify-center gap-1">
                          <FaStar className="text-yellow-500" />
                          {member.performance.rating.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Salary & Commission */}
                {(member.salary || member.commission) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                    {member.salary && (
                      <div className="text-gray-600">
                        Salary: ₹{member.salary.toLocaleString("en-IN")}
                      </div>
                    )}
                    {member.commission > 0 && (
                      <div className="text-green-600 font-medium">
                        {member.commission}% commission
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="bg-white border shadow-sm rounded-xl p-12 text-center">
              <FaUser className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Staff Found
              </h3>
              <p className="text-gray-600">
                {search || filterRole
                  ? "Try adjusting your search or filter criteria."
                  : "No staff members have been added to this business yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white rounded-xl">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} staff members
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessStaff;

