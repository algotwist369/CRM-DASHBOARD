import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  FaEye,
  FaTrash,
  FaLink,
  FaFilter,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUndo,
  FaComment,
} from "react-icons/fa";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import businessService from "../../../../services/admin/businessService";
import { useNavigate } from "react-router-dom";

const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type", capitalize: true },
  { key: "branch", label: "Branch" },
  { key: "link", label: "Business Link" },
  { key: "managersCount", label: "Managers", sortable: true },
  { key: "staffCount", label: "Staff", sortable: true },
  { key: "servicesCount", label: "Services", sortable: true },
  { key: "isActive", label: "Status" },
  { key: "actions", label: "Actions" },
];

// Memoized Business Row Component for Desktop
const BusinessRow = memo(({ business, onView, onDelete, onStatusChange, onRemark }) => (
  <tr className="hover:bg-gray-50 transition-all text-gray-600">
    <td className="px-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <span>{business.name}</span>
        {business.isNew && (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            NEW
          </span>
        )}
      </div>
    </td>
    <td className="px-4 py-3 border-b capitalize">{business.type}</td>
    <td className="px-4 py-3 border-b">{business.branch}</td>
    <td className="px-4 py-3 border-b">
      {business.businessLink ? (
        <a
          href={`/${business.businessLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
        >
          <FaLink className="text-xs" />
          <span className="text-xs">{business.businessLink}</span>
        </a>
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      )}
    </td>
    <td className="px-4 py-3 border-b">{business.managersCount || 0}</td>
    <td className="px-4 py-3 border-b">{business.staffCount || 0}</td>
    <td className="px-4 py-3 border-b">{business.servicesCount || 0}</td>
    <td className="px-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStatusChange(business)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${business.isActive ? 'bg-green-500' : 'bg-gray-200'
            }`}
          title={business.isActive ? "Deactivate Business" : "Activate Business"}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${business.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
          />
        </button>
      </div>
    </td>
    <td className="px-4 py-3 border-b">
      <div className="flex gap-3">
        <button onClick={() => onView(business.id || business._id)} className="text-blue-500 hover:text-blue-700" title="View">
          <FaEye />
        </button>
        <button onClick={() => onRemark(business)} className="text-yellow-500 hover:text-yellow-700" title="Add/Edit Remark">
          <FaComment />
        </button>
        <button onClick={() => onDelete(business.id || business._id)} className="text-red-500 hover:text-red-700" title="Delete">
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

// Memoized Business Card Component for Mobile
const BusinessCard = memo(({ business, onView, onDelete, onStatusChange, onRemark }) => (
  <div className="border border-gray-200  p-4 bg-white hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 truncate">{business.name}</h3>
          {business.isNew && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              NEW
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 capitalize">{business.type}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStatusChange(business)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${business.isActive ? 'bg-green-500' : 'bg-gray-200'
            }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${business.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
          />
        </button>
        <span className="text-xs font-medium text-gray-600">
          {business.isActive ? 'On' : 'Off'}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
      <div>
        <span className="text-gray-500">Branch:</span>
        <p className="font-medium text-gray-700">{business.branch || "—"}</p>
      </div>
      <div>
        <span className="text-gray-500">Managers:</span>
        <p className="font-medium text-gray-700">{business.managersCount || 0}</p>
      </div>
      <div>
        <span className="text-gray-500">Staff:</span>
        <p className="font-medium text-gray-700">{business.staffCount || 0}</p>
      </div>
      <div>
        <span className="text-gray-500">Services:</span>
        <p className="font-medium text-gray-700">{business.servicesCount || 0}</p>
      </div>
      {business.businessLink && (
        <div className="col-span-2">
          <span className="text-gray-500">Business Link:</span>
          <a
            href={`/${business.businessLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <FaLink className="text-xs" />
            {business.businessLink}
          </a>
        </div>
      )}
    </div>
    <div className="flex gap-3 border-t border-gray-100 pt-3">
      <button onClick={() => onView(business.id || business._id)} className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2  transition-colors">
        <FaEye /> View
      </button>
      <button onClick={() => onRemark(business)} className="flex-1 flex items-center justify-center gap-2 text-yellow-600 hover:bg-yellow-50 py-2  transition-colors">
        <FaComment /> Remark
      </button>
      <button onClick={() => onDelete(business.id || business._id)} className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2  transition-colors">
        <FaTrash /> Delete
      </button>
    </div>
  </div>
));

const BusinessList = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 20 });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [remarkText, setRemarkText] = useState("");
  const [updatingRemark, setUpdatingRemark] = useState(false);

  // Memoized fetch function
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;

      const res = await businessService.getBusinesses(params);
      if (res.success) {
        const responseData = res.data?.data || [];
        const paginationData = res.data?.pagination;

        setBusinesses(responseData);

        if (paginationData) {
          setPagination(prev => ({
            ...prev,
            currentPage: paginationData.page,
            totalPages: paginationData.pages,
            total: paginationData.total,
            limit: paginationData.limit
          }));
        }
      } else {
        setError(res.error || "Failed to load businesses");
      }
    } catch (e) {
      setError("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  // Initial fetch
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Memoized handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchBusinesses();
      toast.success('Business data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchBusinesses]);

  const handleBack = useCallback(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleView = useCallback((id) => navigate(`/admin/businesses/${id}`), [navigate]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this business?")) return;
    try {
      const res = await businessService.deleteBusiness(id);
      if (res.success) {
        toast.success("Business deleted successfully");
        setBusinesses((prev) => prev.filter((b) => (b.id || b._id) !== id));
      } else {
        toast.error(res.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  }, []);

  const handleRemark = useCallback((business) => {
    setSelectedBusiness(business);
    setRemarkText(business.remark || "");
    setShowRemarkModal(true);
  }, []);

  const handleSaveRemark = useCallback(async () => {
    if (!selectedBusiness) return;
    try {
      setUpdatingRemark(true);
      const res = await businessService.updateBusinessRemark(
        selectedBusiness.id || selectedBusiness._id,
        remarkText
      );
      if (res.success) {
        setBusinesses(prev => prev.map(b =>
          (b.id || b._id) === (selectedBusiness.id || selectedBusiness._id)
            ? { ...b, remark: remarkText, updatedAt: res.data?.updatedAt || new Date() }
            : b
        ));
        toast.success("Business remark updated successfully");
        setShowRemarkModal(false);
        setSelectedBusiness(null);
        setRemarkText("");
      } else {
        toast.error(res.error || 'Failed to update remark');
      }
    } catch (error) {
      toast.error('Failed to update remark');
    } finally {
      setUpdatingRemark(false);
    }
  }, [selectedBusiness, remarkText]);

  const handleCloseRemarkModal = useCallback(() => {
    setShowRemarkModal(false);
    setSelectedBusiness(null);
    setRemarkText("");
  }, []);

  const handleStatusChange = useCallback(async (business) => {
    try {
      // Optimistic update
      setBusinesses(prev => prev.map(b =>
        (b.id || b._id) === (business.id || business._id) ? { ...b, isActive: !b.isActive } : b
      ));

      const res = await businessService.updateBusinessStatus(business.id || business._id, !business.isActive);

      if (res.success) {
        // Update with actual server response
        const updatedStatus = res.data?.data?.isActive ?? res.data?.isActive;
        setBusinesses(prev => prev.map(b =>
          (b.id || b._id) === (business.id || business._id) ? { ...b, isActive: updatedStatus } : b
        ));
        toast.success(`Business ${updatedStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        // Revert on failure
        setBusinesses(prev => prev.map(b =>
          (b.id || b._id) === (business.id || business._id) ? { ...b, isActive: business.isActive } : b
        ));
        toast.error(res.error || "Failed to update status");
      }
    } catch (error) {
      // Revert on error
      setBusinesses(prev => prev.map(b =>
        (b.id || b._id) === (business.id || business._id) ? { ...b, isActive: business.isActive } : b
      ));
      toast.error("Failed to update status");
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      const res = await businessService.getBusinesses({ limit: 10000 });
      if (res.success) {
        const allBusinesses = res.data?.data || res.data?.businesses || [];
        const activeLinks = allBusinesses
          .filter(b => b.isActive && b.businessLink)
          .map(b => `${window.location.origin}/${b.businessLink}`);

        if (activeLinks.length === 0) {
          toast.error("No active business links found to export");
          return;
        }

        const content = activeLinks.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `active-businesses-sitemap-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Exported ${activeLinks.length} active business links`);
      } else {
        toast.error("Failed to fetch businesses for export");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export business links");
    } finally {
      setExporting(false);
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleSort = useCallback((columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [sortBy]);

  const handleReset = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setFilterType("");
    setFilterStatus("active");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    toast.success("Filters and sorting reset");
  }, []);

  // Memoized table columns
  const tableHeaders = useMemo(() => TABLE_COLUMNS, []);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Business List
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2  hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Back to Dashboard"
            >
              <FiArrowLeft className="text-base sm:text-lg" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2  hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
              title="Refresh Data"
            >
              <FiRefreshCw className={`text-base sm:text-lg ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2  hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Reset All Filters"
            >
              <FaUndo className="text-base sm:text-lg" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={toggleFilters}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2  transition-colors text-sm font-medium ${showFilters
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              <FaFilter className="text-base sm:text-lg" />
              <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Filters'}</span>
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </header>

      {/* Collapsible Search and Filter */}
      {showFilters && (
        <div className="mb-4 bg-white border border-gray-200   p-4 animate-fadeIn">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFilter className="text-primary-600" />
            Filter Businesses
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, branch, or location..."
                className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">Business Type</label>
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="salon">Salon</option>
                <option value="spa">Spa</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="gym">Gym</option>
                <option value="clinic">Clinic</option>
                <option value="cafe">Cafe</option>
                <option value="studio">Studio</option>
                <option value="education">Education</option>
                <option value="automotive">Automotive</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </div>
            {(search || filterType || filterStatus !== 'active' || sortBy !== 'createdAt') && (
              <div className="flex items-end">
                <button
                  onClick={handleReset}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          {(search || filterType || filterStatus !== 'active') && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700  text-xs">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch('')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterType && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700  text-xs capitalize">
                  Type: {filterType}
                  <button
                    onClick={() => setFilterType('')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterStatus !== 'active' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700  text-xs capitalize">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('active')}
                    className="hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Business List Table */}
      <section className="bg-white shadow-md  sm: p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Business List
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2  transition-all text-sm sm:text-base disabled:opacity-70"
              title="Export Active Business Links for Sitemap"
            >
              <FaFileExport className={exporting ? "animate-pulse" : ""} />
              {exporting ? "Exporting..." : "Export Links"}
            </button>

          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200  text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {tableHeaders.map(column => (
                  <th
                    key={column.key}
                    className={`text-left px-4 py-3 border-b ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-200 transition-colors' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <span className="text-gray-400">
                          {sortBy === column.key ? (
                            sortOrder === 'asc' ? <FaSortUp className="text-primary-600" /> : <FaSortDown className="text-primary-600" />
                          ) : (
                            <FaSort className="text-gray-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <BusinessRow
                  key={b.id || b._id}
                  business={b}
                  onView={handleView}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onRemark={handleRemark}
                />
              ))}
              {loading && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-sm text-gray-500">Loading businesses…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {businesses.map((b) => (
            <BusinessCard
              key={b.id || b._id}
              business={b}
              onView={handleView}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onRemark={handleRemark}
            />
          ))}
          {loading && <div className="p-4 text-sm text-gray-500 text-center">Loading businesses…</div>}
          {!loading && businesses.length === 0 && <div className="p-8 text-sm text-gray-500 text-center">No businesses found</div>}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 mt-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} businesses
              </div>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), currentPage: 1 }))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {[10, 20, 50, 100].map(limit => (
                  <option key={limit} value={limit}>{limit} per page</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 ">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedBusiness?.remark ? "Edit Remark" : "Add Remark"}
              </h3>
              <button
                onClick={handleCloseRemarkModal}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark for <span className="text-primary-600">{selectedBusiness?.name}</span>
              </label>
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Enter your remark about this business..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={handleCloseRemarkModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemark}
                disabled={updatingRemark}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {updatingRemark ? "Saving..." : "Save Remark"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessList;
