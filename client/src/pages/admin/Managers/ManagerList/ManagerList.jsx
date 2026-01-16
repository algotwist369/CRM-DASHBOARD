import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { FiEdit, FiTrash2, FiEye, FiSearch, FiUser, FiPhone, FiMail, FiLock, FiBriefcase, FiChevronDown, FiRefreshCw, FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import businessService from "../../../../services/admin/businessService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Modal from "../../../../components/common/Modal/Modal";

// Debounce hook for search optimization
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Initial form data
const INITIAL_FORM_DATA = {
  name: "",
  username: "",
  pin: "",
  businessId: "",
  email: "",
  phone: "",
  permissions: {
    canManageStaff: true,
    canViewReports: true,
    canManageDailyBusiness: true,
    canManageTransactions: true,
  },
};

// Copy Button Component
const CopyButton = memo(({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-gray-200 rounded transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <FiCheck className="text-green-600 text-sm" />
      ) : (
        <FiCopy className="text-gray-500 text-sm" />
      )}
    </button>
  );
});

// Loading Skeleton Component
const SkeletonRow = memo(() => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
    <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
    <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div></td>
  </tr>
));

// Memoized Manager Row Component
const ManagerRow = memo(({ manager, onView, onEdit, onDelete, onStatusChange, isDeleting, isEditing }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 text-gray-700 font-medium">{manager.name}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="text-gray-600">{manager.username}</span>
        <CopyButton text={manager.username} label="Username" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border border-gray-300 text-gray-700">
          {manager.pin || '••••'}
        </span>
        {manager.pin && <CopyButton text={manager.pin} label="PIN" />}
      </div>
    </td>
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
      <button
        onClick={() => onStatusChange(manager)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${manager.isActive ? 'bg-green-500' : 'bg-gray-200'
          }`}
        title={manager.isActive ? "Deactivate Manager" : "Activate Manager"}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${manager.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </td>
    <td className="px-4 py-3">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => onView(manager)}
          className="p-2 bg-blue-100 text-blue-600  hover:bg-blue-200 transition-colors"
          title="View Details"
        >
          <FiEye />
        </button>
        <button
          onClick={() => onEdit(manager)}
          disabled={isEditing}
          className="p-2 bg-yellow-100 text-yellow-600  hover:bg-yellow-200 disabled:opacity-50 transition-colors"
          title="Edit Manager"
        >
          <FiEdit />
        </button>
        <button
          onClick={() => onDelete(manager.id)}
          disabled={isDeleting}
          className="p-2 bg-red-100 text-red-600  hover:bg-red-200 disabled:opacity-50 transition-colors"
          title="Delete Manager"
        >
          {isDeleting ? <FaSpinner className="animate-spin" /> : <FiTrash2 />}
        </button>
      </div>
    </td>
  </tr>
));

// Memoized Mobile Card Component for Responsive Design
const ManagerCard = memo(({ manager, onView, onEdit, onDelete, onStatusChange, isDeleting, isEditing }) => (
  <div className="bg-white border border-gray-200  p-4 mb-3 ">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{manager.name}</h3>
          <button
            onClick={() => onStatusChange(manager)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${manager.isActive ? 'bg-green-500' : 'bg-gray-200'
              }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${manager.isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <p className="text-sm text-gray-500">@{manager.username}</p>
          <CopyButton text={manager.username} label="Username" />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-300 text-gray-700">
            PIN: {manager.pin || '••••'}
          </span>
          {manager.pin && <CopyButton text={manager.pin} label="PIN" />}
        </div>
      </div>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => onView(manager)}
          className="p-2 bg-blue-100 text-blue-600  hover:bg-blue-200 transition-colors"
          title="View"
        >
          <FiEye className="text-sm" />
        </button>
        <button
          onClick={() => onEdit(manager)}
          disabled={isEditing}
          className="p-2 bg-yellow-100 text-yellow-600  hover:bg-yellow-200 disabled:opacity-50 transition-colors"
          title="Edit"
        >
          <FiEdit className="text-sm" />
        </button>
        <button
          onClick={() => onDelete(manager.id)}
          disabled={isDeleting}
          className="p-2 bg-red-100 text-red-600  hover:bg-red-200 disabled:opacity-50 transition-colors"
          title="Delete"
        >
          {isDeleting ? <FaSpinner className="animate-spin text-sm" /> : <FiTrash2 className="text-sm" />}
        </button>
      </div>
    </div>
    <div className="space-y-2 text-sm">
      {manager.email && (
        <div className="flex items-center gap-2 text-gray-600">
          <FiMail className="text-gray-400" />
          <span>{manager.email}</span>
        </div>
      )}
      {manager.phone && (
        <div className="flex items-center gap-2 text-gray-600">
          <FiPhone className="text-gray-400" />
          <span>{manager.phone}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-gray-600">
        <FiBriefcase className="text-gray-400" />
        <div>
          <span className="font-medium">{manager.business}</span>
          {manager.businessBranch && (
            <span className="text-xs text-gray-500 ml-1">({manager.businessBranch})</span>
          )}
        </div>
      </div>
    </div>
  </div>
));

// Memoized Icon Input Field Component
const IconInputField = memo(({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon, required = false }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
      {label}{required && " *"}
    </label>
    <div className="flex items-center border border-gray-300  p-1.5 sm:p-2">
      <Icon className="text-gray-400 mr-2 text-sm" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={type === "password" ? 4 : undefined}
        className="w-full focus:outline-none text-sm"
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
));

// Memoized Select Field Component
const SelectField = memo(({ label, name, value, onChange, error, options, required = false, icon: Icon }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
      {label}{required && " *"}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute top-3 left-3 text-gray-400 text-sm z-10" />}
      <FiChevronDown className="absolute top-3 right-3 text-gray-400 text-sm pointer-events-none" />
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300"}  p-1.5 sm:p-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none ${Icon ? "pl-10 pr-8" : "px-3"}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
));

// Table Header Component
const TableHeader = memo(() => (
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      {['Name', 'Username', 'PIN', 'Email', 'Phone', 'Business', 'Status'].map(header => (
        <th key={header} className="px-4 py-3 text-left font-semibold text-gray-700">{header}</th>
      ))}
      <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
    </tr>
  </thead>
));

// Empty State Component
const EmptyState = memo(({ search }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <p className="text-lg font-medium mb-2">No managers found</p>
    <p className="text-sm">
      {search ? "Try adjusting your search criteria." : "Create your first manager to get started."}
    </p>
  </div>
));

const ManagerList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // Debounce search input
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);

  // Form states
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [showPinSection, setShowPinSection] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");

  // Lazy load businesses only when needed (for dropdown)
  const fetchBusinesses = useCallback(async () => {
    // Skip if already loaded
    if (businesses.length > 0) return;

    try {
      const res = await businessService.getBusinesses({
        page: 1,
        limit: 10000,
        _t: Date.now()
      });
      if (res.success) {
        let allBusinesses = res.data?.data || [];
        // Sort alphabetically by name
        allBusinesses.sort((a, b) => a.name.localeCompare(b.name));
        setBusinesses(allBusinesses);
      }
    } catch (e) {
      console.error("Failed to fetch businesses:", e);
      toast.error("Failed to load businesses");
    }
  }, [businesses.length]);

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await adminService.getManagers(params);
      if (res.success) {
        // Response structure: { success, data: [...], pagination: {...} }
        const data = res.data || [];
        setManagers(data);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
      } else {
        setError(res.error || "Failed to load managers");
      }
    } catch (e) {
      setError("Failed to load managers");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  // Only fetch managers on mount
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      setPage(1);
    }
  }, [debouncedSearch, search]);

  // Memoize business options for dropdown
  const businessOptions = useMemo(() => {
    return businesses.map(biz => ({
      value: biz._id || biz.id,
      label: biz.name
    }));
  }, [businesses]);

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

  const handleStatusChange = useCallback(async (manager) => {
    try {
      // Optimistic update
      setManagers(prev => prev.map(m =>
        m.id === manager.id ? { ...m, isActive: !m.isActive } : m
      ));

      const res = await adminService.updateManagerStatus(manager.id, !manager.isActive);

      if (res.success) {
        // Update with actual server response to ensure sync
        setManagers(prev => prev.map(m =>
          m.id === manager.id ? { ...m, isActive: res.data.isActive } : m
        ));
        toast.success(`Manager ${res.data.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        // Revert on failure
        setManagers(prev => prev.map(m =>
          m.id === manager.id ? { ...m, isActive: manager.isActive } : m
        ));
        toast.error(res.error || "Failed to update status");
      }
    } catch (error) {
      // Revert on error
      setManagers(prev => prev.map(m =>
        m.id === manager.id ? { ...m, isActive: manager.isActive } : m
      ));
      toast.error("Failed to update status");
    }
  }, []);

  const handleView = (manager) => {
    navigate(`/admin/managers/${manager.id}`);
  };

  const handleAdd = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setShowPinSection(false);
    setIsCreateModalOpen(true);
    // Fetch businesses when opening create modal
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleEdit = useCallback(async (manager) => {
    setSubmitting(true);
    try {
      // Fetch businesses for dropdown
      fetchBusinesses();

      const res = await adminService.getManager(manager.id);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData({
          name: data.name || "",
          username: data.username || "",
          pin: "",
          businessId: data.business?._id || data.businessId || "",
          email: data.email || "",
          phone: data.phone || "",
          permissions: data.permissions || {
            canManageStaff: true,
            canViewReports: true,
            canManageDailyBusiness: true,
            canManageTransactions: true,
          },
        });
        setEditingManager(data);
        setFormErrors({});
        setShowPinSection(false);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load manager details");
    } finally {
      setSubmitting(false);
    }
  }, [fetchBusinesses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchManagers();
      toast.success("Managers list refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }, [fetchManagers]);

  const handleBack = useCallback(() => {
    navigate("/admin/dashboard");
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    // Handle permissions checkboxes
    if (name.startsWith('permission_')) {
      const permissionName = name.replace('permission_', '');
      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionName]: checked
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.username.trim()) errors.username = "Username is required";

    const needsPinValidation = isCreateModalOpen || (isEditModalOpen && showPinSection && formData.pin);
    if (needsPinValidation && !/^\d{4}$/.test(formData.pin)) {
      errors.pin = "PIN must be exactly 4 digits";
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = "Enter a valid 10-digit Indian phone number";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (isCreateModalOpen && !formData.businessId.trim()) {
      errors.businessId = "Please select a business";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isCreateModalOpen, isEditModalOpen, showPinSection]);

  const handleSubmit = useCallback(async (e, isEdit = false) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const submitData = { ...formData };

      if (isEdit && (!showPinSection || !submitData.pin)) {
        delete submitData.pin;
      }

      const res = isEdit
        ? await adminService.updateManager(editingManager.id || editingManager._id, submitData)
        : await adminService.createManager(submitData);

      if (res.success) {
        toast.success(`Manager ${isEdit ? 'updated' : 'created'} successfully!`);
        isEdit ? setIsEditModalOpen(false) : setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM_DATA);
        if (isEdit) setEditingManager(null);
        await fetchManagers();
      } else {
        toast.error(res.error || `Failed to ${isEdit ? 'update' : 'create'} manager`);
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} manager`);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingManager, showPinSection, validateForm, fetchManagers]);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Managers</h1>
          <p className="text-sm text-gray-600">Manage all business managers</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
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
            title="Refresh List"
          >
            <FiRefreshCw className={`text-base sm:text-lg ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2  hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <AiOutlineUserAdd className="text-base sm:text-lg" />
            <span className="hidden sm:inline">Add Manager</span>
          </button>

          {/* <button
            onClick={() => navigate('/admin/managers/create')}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2  hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <AiOutlineUserAdd className="text-base sm:text-lg" />
            <span className="hidden sm:inline">Add Manager</span>
          </button> */}
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200  p-3 text-red-700 text-sm">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border   p-4">
          <p className="text-sm text-gray-600 mb-1">Total Managers</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
        <div className="bg-white border   p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{total}</p>
        </div>
        <div className="bg-white border   p-4">
          <p className="text-sm text-gray-600 mb-1">Per Page</p>
          <p className="text-2xl font-bold text-primary-600">{managers.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border   overflow-hidden mb-6">
        <div className="flex items-center px-4 py-3">
          <FiSearch className="text-gray-400 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search managers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-gray-700 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 ml-2 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white border   overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <TableHeader />
              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : managers.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <TableHeader />
              <tbody className="divide-y divide-gray-200">
                {managers.map((manager) => (
                  <ManagerRow
                    key={manager.id}
                    manager={manager}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    isDeleting={deleting === manager.id}
                    isEditing={submitting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card View (visible on mobile only) */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : managers.length === 0 ? (
          <div className="bg-white border  p-8">
            <EmptyState search={search} />
          </div>
        ) : (
          managers.map((manager) => (
            <ManagerCard
              key={manager.id}
              manager={manager}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              isDeleting={deleting === manager.id}
              isEditing={submitting}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white  p-4 border">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} managers
            </div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to first page when changing limit
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-100  hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-gray-100  hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Manager Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(INITIAL_FORM_DATA);
          setFormErrors({});
        }}
        title="Add New Manager"
        size="xl"
      >
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3 sm:space-y-4">
          <IconInputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            placeholder="Enter manager name"
            icon={FiUser}
            required
          />

          <IconInputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            placeholder="Unique username"
            icon={FiUser}
            required
          />

          <IconInputField
            label="4-Digit PIN"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            error={formErrors.pin}
            type="password"
            placeholder="Enter 4-digit PIN"
            icon={FiLock}
            required
          />

          {/* Business Search & Select */}
          <div>
            <div className="mb-2">
              <IconInputField
                label="Search Business"
                name="businessSearch"
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                placeholder="Type to filter businesses..."
                icon={FiSearch}
              />
            </div>

            <SelectField
              label="Select Business"
              name="businessId"
              value={formData.businessId}
              onChange={handleChange}
              error={formErrors.businessId}
              options={businessOptions.filter(opt =>
                opt.label.toLowerCase().includes(businessSearch.toLowerCase())
              )}
              icon={FiBriefcase}
              required
            />
          </div>

          <IconInputField
            label="Email (optional)"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            type="email"
            placeholder="manager@example.com"
            icon={FiMail}
          />

          <IconInputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={formErrors.phone}
            placeholder="Enter 10-digit number"
            icon={FiPhone}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5  font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Creating..." : "Create Manager"}
          </button>
        </form>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingManager(null);
          setFormData(INITIAL_FORM_DATA);
          setFormErrors({});
          setShowPinSection(false);
        }}
        title="Edit Manager"
        size="xl"
      >
        <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-3 sm:space-y-4">
          <IconInputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            placeholder="Enter manager name"
            icon={FiUser}
            required
          />

          <IconInputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            placeholder="Unique username"
            icon={FiUser}
            required
          />

          <IconInputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            type="email"
            placeholder="manager@example.com"
            icon={FiMail}
          />

          <IconInputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={formErrors.phone}
            placeholder="Enter 10-digit number"
            icon={FiPhone}
          />

          {/* Change PIN Section */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Change PIN</h3>
                <p className="text-xs text-gray-500">Optional: Update manager login PIN</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPinSection(!showPinSection);
                  setFormData(prev => ({ ...prev, pin: "" }));
                  setFormErrors(prev => ({ ...prev, pin: "" }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700  transition-colors"
              >
                {showPinSection ? "Cancel" : "Change PIN"}
              </button>
            </div>

            {showPinSection && (
              <IconInputField
                label="New PIN (4 digits)"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                error={formErrors.pin}
                type="password"
                placeholder="••••"
                icon={FiLock}
              />
            )}
          </div>

          {/* Permissions Section */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Manager Permissions</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="permission_canManageStaff"
                  checked={formData.permissions.canManageStaff}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Manage Staff</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="permission_canViewReports"
                  checked={formData.permissions.canViewReports}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">View Reports</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="permission_canManageDailyBusiness"
                  checked={formData.permissions.canManageDailyBusiness}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Manage Daily Business</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="permission_canManageTransactions"
                  checked={formData.permissions.canManageTransactions}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Manage Transactions</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5  font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Updating..." : "Update Manager"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerList;
