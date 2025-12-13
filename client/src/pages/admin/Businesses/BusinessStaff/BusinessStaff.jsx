import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaSpinner,
  FaSearch,
  FaCopy,
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";
import BackButton from "../../../../components/common/Button/BackButton";

const ROLE_COLORS = {
  stylist: "bg-blue-100 text-blue-700",
  therapist: "bg-purple-100 text-purple-700",
  receptionist: "bg-green-100 text-green-700",
  cleaner: "bg-orange-100 text-orange-700",
  assistant: "bg-gray-100 text-gray-700",
  other: "bg-pink-100 text-pink-700",
};

// Memoized Staff Card
const StaffCard = memo(({ member, onCopy, copiedValue }) => {
  const memberId = member._id || member.id;

  return (
    <div className="bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <FaUser className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${ROLE_COLORS[member.role] || ROLE_COLORS.other
              }`}>
              {member.role || 'N/A'}
            </span>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {member.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        {member.phone && (
          <div className="flex items-center justify-between gap-2 group">
            <div className="flex items-center gap-2 min-w-0">
              <FaPhoneAlt className="text-gray-400" size={12} />
              <span className="truncate">{member.phone}</span>
            </div>
            <button
              onClick={() => onCopy(member.phone, "phone")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {copiedValue === `phone-${member.phone}` ? (
                <span className="text-green-600 text-xs">✓</span>
              ) : (
                <FaCopy className="text-gray-400 text-xs" />
              )}
            </button>
          </div>
        )}
        {member.email && (
          <div className="flex items-center justify-between gap-2 group">
            <div className="flex items-center gap-2 min-w-0">
              <FaEnvelope className="text-gray-400" size={12} />
              <span className="truncate">{member.email}</span>
            </div>
            <button
              onClick={() => onCopy(member.email, "email")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {copiedValue === `email-${member.email}` ? (
                <span className="text-green-600 text-xs">✓</span>
              ) : (
                <FaCopy className="text-gray-400 text-xs" />
              )}
            </button>
          </div>
        )}
        {(member.salary || member.commission > 0) && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100 mt-2">
            {member.salary && (
              <span className="text-gray-700">₹{parseInt(member.salary).toLocaleString('en-IN')}</span>
            )}
            {member.commission > 0 && (
              <span className="text-gray-500">{member.commission}% comm</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Memoized Pagination
const Pagination = memo(({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-white text-sm">
      <span className="text-gray-600">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
});

const BusinessStaff = () => {
  const { id: businessId } = useParams();
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
    limit: 12,
    total: 0,
  });

  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false);
  const lastParamsRef = useRef("");

  const fetchBusiness = useCallback(async () => {
    try {
      const res = await businessService.getBusiness(businessId);
      if (res.success) {
        setBusiness(res.data?.data || res.data);
      }
    } catch (e) {
      console.error("Failed to fetch business:", e);
    }
  }, [businessId]);

  const fetchStaff = useCallback(async () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      search: debouncedSearch || undefined,
      role: filterRole || undefined,
    };

    // Prevent duplicate calls
    const paramsKey = JSON.stringify(params);
    if (paramsKey === lastParamsRef.current) return;
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      lastParamsRef.current = paramsKey;
      setLoading(true);
      setError(null);

      const res = await businessService.getBusinessStaff(businessId, params);
      if (res.success) {
        setStaff(res.data?.data || res.data);
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
      fetchingRef.current = false;
    }
  }, [businessId, debouncedSearch, filterRole, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Clear copied value
  useEffect(() => {
    if (copiedValue) {
      const timer = setTimeout(() => setCopiedValue(null), 2000);
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

  const roleOptions = useMemo(() => [
    "stylist", "therapist", "receptionist", "cleaner", "assistant", "other"
  ], []);

  // Memoized staff cards
  const staffCards = useMemo(() => (
    staff.map((member) => (
      <StaffCard
        key={member._id || member.id}
        member={member}
        onCopy={handleCopy}
        copiedValue={copiedValue}
      />
    ))
  ), [staff, handleCopy, copiedValue]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Business Staff</h1>
          {business && (
            <p className="text-sm text-gray-600">{business.name} - {business.branch}</p>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="text-3xl text-primary-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
          {error}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-700 mb-1">No Staff Found</h3>
          <p className="text-sm text-gray-500">
            {search || filterRole
              ? "Try adjusting your search or filter."
              : "No staff added to this business yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {staffCards}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default BusinessStaff;
