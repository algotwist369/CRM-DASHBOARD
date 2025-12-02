import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaChartBar,
  FaUsers,
  FaBuilding,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaLink,
  FaFilter,
} from "react-icons/fa";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import businessService from "../../../../services/admin/businessService";
import adminService from "../../../../services/admin/adminService";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../components/common/Modal/Modal";

// Constants
const INITIAL_FORM_DATA = {
  type: "",
  name: "",
  branch: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  phone: "",
  alternatePhone: "",
  email: "",
  website: "",
  description: "",
  googleMapsUrl: "",
};

const BUSINESS_TYPES = ["salon", "spa", "hotel", "restaurant", "retail", "gym", "clinic", "cafe", "studio", "education", "automotive", "others"];

const ADDRESS_FIELDS = ["city", "state", "country"];

const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type", capitalize: true },
  { key: "branch", label: "Branch" },
  { key: "link", label: "Business Link" },
  { key: "managers", label: "Managers" },
  { key: "staff", label: "Staff" },
  { key: "isActive", label: "Status" },
  { key: "actions", label: "Actions" },
];

// Utility function to check if business is new (created within 2 days)
const isNewBusiness = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - created;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays <= 2;
};

// Memoized NEW Badge Component
const NewBadge = memo(() => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 animate-pulse">
    NEW
  </span>
));

// Memoized Analytics Card Component
const AnalyticsCard = memo(({ title, value, icon: Icon }) => (
  <div className="bg-white border   sm: p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
    <div className="bg-gray-100 p-2 sm:p-3 rounded-full">
      <Icon className="text-gray-500 text-xl" />
    </div>
    <div>
      <h3 className="text-xs sm:text-sm text-gray-500">{title}</h3>
      <p className="text-lg sm:text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
));

// Memoized Form Field Component
const FormField = memo(({ label, name, value, onChange, error, type = "text", placeholder, required = false, options, rows }) => {
  const baseLabelClass = "block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1";
  const baseInputClass = `w-full border ${error ? "border-red-500" : "border-gray-300"}  p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-primary-500`;

  if (type === "select") {
    return (
      <div>
        <label className={baseLabelClass}>{label}{required && " *"}</label>
        <select name={name} value={value} onChange={onChange} className={baseInputClass}>
          <option value="">Select Type</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className={baseLabelClass}>{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${baseInputClass} resize-none`}
        />
        {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className={baseLabelClass}>{label}{required && " *"}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={baseInputClass}
      />
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
});

// Memoized Icon Input Field Component
const IconInputField = memo(({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon, required = false }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">{label}{required && " *"}</label>
    <div className="flex items-center border border-gray-300  p-1.5 sm:p-2">
      <Icon className="text-gray-400 mr-2 text-sm" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full focus:outline-none text-sm"
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
));

// Memoized Business Row Component for Desktop
const BusinessRow = memo(({ business, onView, onEdit, onDelete, onStatusChange }) => (
  <tr className="hover:bg-gray-50 transition-all text-gray-600">
    <td className="px-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <span>{business.name}</span>
        {isNewBusiness(business.createdAt) && <NewBadge />}
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
    <td className="px-4 py-3 border-b">{business.managersCount ?? business.managers?.length ?? 0}</td>
    <td className="px-4 py-3 border-b">{business.staffCount ?? business.staff?.length ?? 0}</td>
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
        <span className="text-xs font-medium text-gray-600">
          {business.isActive ? 'On' : 'Off'}
        </span>
      </div>
    </td>
    <td className="px-4 py-3 border-b">
      <div className="flex gap-3">
        <button onClick={() => onView(business.id || business._id)} className="text-blue-500 hover:text-blue-700" title="View">
          <FaEye />
        </button>
        <button onClick={() => onEdit(business.id || business._id)} className="text-green-500 hover:text-green-700" title="Edit">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(business.id || business._id)} className="text-red-500 hover:text-red-700" title="Delete">
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
));

// Memoized Business Card Component for Mobile
const BusinessCard = memo(({ business, onView, onEdit, onDelete, onStatusChange }) => (
  <div className="border border-gray-200  p-4 bg-white hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 truncate">{business.name}</h3>
          {isNewBusiness(business.createdAt) && <NewBadge />}
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
        <p className="font-medium text-gray-700">{business.managersCount ?? business.managers?.length ?? 0}</p>
      </div>
      <div>
        <span className="text-gray-500">Staff:</span>
        <p className="font-medium text-gray-700">{business.staffCount ?? business.staff?.length ?? 0}</p>
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
      <button onClick={() => onEdit(business.id || business._id)} className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:bg-green-50 py-2  transition-colors">
        <FaEdit /> Edit
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
  const [dashboardStats, setDashboardStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 20 });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  // Form states
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Memoized fetch function
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterType) params.type = filterType;

      const res = await businessService.getBusinesses(params);
      if (res.success) {
        const list = res.data?.data || res.data?.businesses || [];
        setBusinesses(list);
        if (res.data?.pagination) {
          setPagination(prev => ({ ...prev, ...res.data.pagination }));
        }
      } else {
        setError(res.error || "Failed to load businesses");
      }
    } catch (e) {
      setError("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, debouncedSearch, filterType]);

  // Fetch dashboard stats once
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await adminService.getDashboard(1, 5);
      if (res.success && res.data.data) {
        setDashboardStats(res.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard stats:", e);
    }
  }, []);

  // Single effect for fetching businesses
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Fetch dashboard stats once on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Memoized handlers
  const handleAdd = useCallback(() => {
    navigate('/admin/businesses/create');
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchBusinesses();
      await fetchDashboardStats();
      toast.success('Business data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchBusinesses, fetchDashboardStats]);

  const handleBack = useCallback(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleEdit = useCallback(async (id) => {
    try {
      const res = await businessService.getBusiness(id);
      const data = res?.data?.data || res?.data;
      if (data) {
        setFormData({
          type: data.type || "",
          name: data.name || "",
          branch: data.branch || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "India",
          zipCode: data.zipCode || "",
          phone: data.phone || "",
          alternatePhone: data.alternatePhone || "",
          email: data.email || "",
          website: data.website || "",
          description: data.description || "",
          googleMapsUrl: data.googleMapsUrl || "",
        });
        setEditingBusiness(data);
        setFormErrors({});
        setIsEditModalOpen(true);
      } else {
        toast.error("Business not found");
      }
    } catch (error) {
      console.error("Error loading business:", error);
      toast.error("Failed to load business details");
    }
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.type) errors.type = "Business type is required";
    if (!formData.name.trim()) errors.name = "Business name is required";
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone))
      errors.phone = "Enter a valid 10-digit phone number starting with 6-9";
    if (formData.alternatePhone && !/^[6-9]\d{9}$/.test(formData.alternatePhone))
      errors.alternatePhone = "Enter a valid 10-digit phone number starting with 6-9";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (formData.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.website))
      errors.website = "Invalid website URL";
    if (formData.googleMapsUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.googleMapsUrl))
      errors.googleMapsUrl = "Invalid Google Maps URL";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const refreshBusinesses = useCallback(async () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filterType) params.type = filterType;
    const listRes = await businessService.getBusinesses(params);
    if (listRes.success) {
      const list = listRes.data?.data || listRes.data?.businesses || [];
      setBusinesses(list);
      if (listRes.data?.pagination) {
        setPagination(prev => ({ ...prev, ...listRes.data.pagination }));
      }
    }
    await fetchDashboardStats();
  }, [debouncedSearch, filterType, pagination.currentPage, pagination.limit, fetchDashboardStats]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCreateSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Prepare data - only send fields that have values
      const payload = {
        type: formData.type,
        name: formData.name.trim(),
        branch: formData.branch.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country || "India",
      };

      // Add optional fields only if they have values
      if (formData.zipCode) payload.zipCode = formData.zipCode.trim();
      if (formData.phone) payload.phone = formData.phone.trim();
      if (formData.alternatePhone) payload.alternatePhone = formData.alternatePhone.trim();
      if (formData.email) payload.email = formData.email.trim();
      if (formData.website) payload.website = formData.website.trim();
      if (formData.description) payload.description = formData.description.trim();
      if (formData.googleMapsUrl) payload.googleMapsUrl = formData.googleMapsUrl.trim();

      const res = await businessService.createBusiness(payload);
      if (res.success) {
        toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created successfully`);
        setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM_DATA);
        setFormErrors({});
        await refreshBusinesses();
      } else {
        toast.error(res.error || 'Failed to create business');
      }
    } catch (error) {
      console.error("Create business error:", error);
      toast.error("Failed to create business");
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, refreshBusinesses]);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Prepare update data - only send fields that are being updated
      const payload = {
        type: formData.type,
        name: formData.name.trim(),
        branch: formData.branch.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country || "India",
      };

      // Add optional fields - send empty string to clear or value to update
      payload.zipCode = formData.zipCode || undefined;
      payload.phone = formData.phone || undefined;
      payload.alternatePhone = formData.alternatePhone || undefined;
      payload.email = formData.email || undefined;
      payload.website = formData.website || undefined;
      payload.description = formData.description || undefined;
      payload.googleMapsUrl = formData.googleMapsUrl || undefined;

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });

      const businessId = editingBusiness._id || editingBusiness.id;
      const res = await businessService.updateBusiness(businessId, payload);
      if (res.success) {
        toast.success("Business updated successfully");
        setIsEditModalOpen(false);
        setEditingBusiness(null);
        setFormData(INITIAL_FORM_DATA);
        setFormErrors({});
        await refreshBusinesses();
      } else {
        toast.error(res.error || "Failed to update business");
      }
    } catch (error) {
      console.error("Update business error:", error);
      toast.error("Failed to update business");
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingBusiness, validateForm, refreshBusinesses]);

  // Memoized analytics values from dashboard stats
  const analyticsValues = useMemo(() => {
    if (!dashboardStats) {
      return [
        { icon: FaBuilding, title: "Total Businesses", value: "—" },
        { icon: FaUsers, title: "Total Customers", value: "—" },
        { icon: FaUserTie, title: "Active Staff", value: "—" },
        { icon: FaChartBar, title: "Total Revenue", value: "—" },
      ];
    }
    return [
      { icon: FaBuilding, title: "Total Businesses", value: dashboardStats.stats?.businesses?.total || 0 },
      { icon: FaUsers, title: "Total Customers", value: dashboardStats.stats?.totalCustomers || 0 },
      { icon: FaUserTie, title: "Active Staff", value: dashboardStats.stats?.staff || 0 },
      { icon: FaChartBar, title: "Total Revenue", value: dashboardStats.stats?.totalRevenue || "₹0" },
    ];
  }, [dashboardStats]);

  // Memoized business type options
  const businessTypeOptions = useMemo(() =>
    BUSINESS_TYPES.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    })),
    []
  );

  // Memoized table columns
  const tableHeaders = useMemo(() => TABLE_COLUMNS, []);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Business Dashboard
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
              </select>
            </div>
            {(search || filterType) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterType('');
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          {(search || filterType) && (
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
            </div>
          )}
        </div>
      )}

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {analyticsValues.map((card) => (
          <AnalyticsCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            value={card.value}
          />
        ))}
      </section>

      {/* Business List Table */}
      <section className="bg-white shadow-md  sm: p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Business List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2  transition-all text-sm sm:text-base"
          >
            <FaPlus /> Add Business
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200  text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {tableHeaders.map(column => (
                  <th key={column.key} className="text-left px-4 py-3 border-b">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <BusinessRow
                  key={b.id || b._id}
                  business={b}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {loading && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-sm text-gray-500">Loading businesses…</td>
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
          {loading && <div className="p-4 text-sm text-gray-500 text-center">Loading businesses…</div>}
          {!loading && businesses.length === 0 && <div className="p-8 text-sm text-gray-500 text-center">No businesses found</div>}
        </div>

        {/* Pagination */}
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

      {/* Create Business Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(INITIAL_FORM_DATA);
          setFormErrors({});
        }}
        title="Add New Business"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-2 sm:space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            <FormField
              label="Business Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={formErrors.type}
              type="select"
              options={businessTypeOptions}
              required
            />

            <IconInputField
              label="Business Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              placeholder="Enter business name"
              icon={FaBuilding}
              required
            />

            <FormField
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., Main Branch"
            />

            <FormField
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Enter zip code"
            />

            <IconInputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
              placeholder="10-digit phone number"
              icon={FaPhone}
            />

            <IconInputField
              label="Alternate Phone"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              error={formErrors.alternatePhone}
              placeholder="Alternate phone number"
              icon={FaPhone}
            />

            <IconInputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              type="email"
              placeholder="Business email"
              icon={FaEnvelope}
            />

            <IconInputField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              error={formErrors.website}
              placeholder="https://example.com"
              icon={FaGlobe}
            />
          </div>

          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            type="textarea"
            rows={2}
            placeholder="Enter address"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {ADDRESS_FIELDS.map((field) => (
              <FormField
                key={field}
                label=""
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
          </div>

          <FormField
            label="Google Maps URL"
            name="googleMapsUrl"
            value={formData.googleMapsUrl}
            onChange={handleChange}
            error={formErrors.googleMapsUrl}
            placeholder="https://maps.google.com/..."
            type="url"
          />

          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            type="textarea"
            rows={2}
            placeholder="Write something about your business"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5  font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Adding..." : "Add Business"}
          </button>
        </form>
      </Modal>

      {/* Edit Business Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBusiness(null);
          setFormData(INITIAL_FORM_DATA);
          setFormErrors({});
        }}
        title="Edit Business"
        size="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-2 sm:space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            <FormField
              label="Business Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={formErrors.type}
              type="select"
              options={businessTypeOptions}
              required
            />

            <IconInputField
              label="Business Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              placeholder="Enter business name"
              icon={FaBuilding}
              required
            />

            <FormField
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., Main Branch"
            />

            <FormField
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Enter zip code"
            />

            <IconInputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
              placeholder="10-digit phone number"
              icon={FaPhone}
            />

            <IconInputField
              label="Alternate Phone"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              error={formErrors.alternatePhone}
              placeholder="Alternate phone number"
              icon={FaPhone}
            />

            <IconInputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              type="email"
              placeholder="Business email"
              icon={FaEnvelope}
            />

            <IconInputField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              error={formErrors.website}
              placeholder="https://example.com"
              icon={FaGlobe}
            />
          </div>

          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            type="textarea"
            rows={2}
            placeholder="Enter address"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {ADDRESS_FIELDS.map((field) => (
              <FormField
                key={field}
                label=""
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
          </div>

          <FormField
            label="Google Maps URL"
            name="googleMapsUrl"
            value={formData.googleMapsUrl}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            type="url"
          />

          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            type="textarea"
            rows={2}
            placeholder="Write something about your business"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5  font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Updating..." : "Update Business"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BusinessList;
