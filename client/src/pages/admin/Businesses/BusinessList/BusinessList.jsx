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
  phone: "",
  email: "",
  website: "",
  description: "",
};

const BUSINESS_TYPES = ["salon", "spa", "hotel"];

const ADDRESS_FIELDS = ["city", "state", "country"];

const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type", capitalize: true },
  { key: "branch", label: "Branch" },
  { key: "link", label: "Business Link" },
  { key: "managers", label: "Managers" },
  { key: "staff", label: "Staff" },
  { key: "actions", label: "Actions" },
];

// Memoized Analytics Card Component
const AnalyticsCard = memo(({ title, value, icon: Icon }) => (
  <div className="bg-white border shadow-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
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
  const baseInputClass = `w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-primary-500`;
  
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
    <div className="flex items-center border border-gray-300 rounded-lg p-1.5 sm:p-2">
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

const BusinessList = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
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
  }, [debouncedSearch, filterType]);

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

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Trigger fetch on page change
  useEffect(() => {
    fetchBusinesses();
  }, [pagination.currentPage]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Memoized handlers
  const handleAdd = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback(async (id) => {
    setSubmitting(true);
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
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          description: data.description || "",
        });
        setEditingBusiness(data);
        setFormErrors({});
        setIsEditModalOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load business details");
    } finally {
      setSubmitting(false);
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.type) errors.type = "Business type is required";
    if (!formData.name.trim()) errors.name = "Business name is required";
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone))
      errors.phone = "Enter a valid 10-digit phone number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (formData.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.website))
      errors.website = "Invalid website URL";
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
      const res = await businessService.createBusiness(formData);
      if (res.success) {
        toast.success(`${formData.type} created successfully`);
        setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM_DATA);
        await refreshBusinesses();
      } else {
        toast.error(res.error || 'Failed to create business');
      }
    } catch (error) {
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
      const res = await businessService.updateBusiness(editingBusiness._id, formData);
      if (res.success) {
        toast.success("Business updated successfully");
        setIsEditModalOpen(false);
        setEditingBusiness(null);
        await refreshBusinesses();
      } else {
        toast.error(res.error || "Failed to update business");
      }
    } catch (error) {
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
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Business Dashboard
        </h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </header>

      {/* Search and Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">All Types</option>
          <option value="salon">Salon</option>
          <option value="spa">Spa</option>
          <option value="hotel">Hotel</option>
        </select>
      </div>

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
      <section className="bg-white shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Business List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base"
          >
            <FaPlus /> Add Business
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {tableHeaders.map(column => (
                  <th key={column.key} className="text-left px-4 py-3 border-b">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id || b._id} className="hover:bg-gray-50 transition-all text-gray-600">
                  <td className="px-4 py-3 border-b">{b.name}</td>
                  <td className="px-4 py-3 border-b capitalize">{b.type}</td>
                  <td className="px-4 py-3 border-b">{b.branch}</td>
                  <td className="px-4 py-3 border-b">
                    {b.businessLink ? (
                      <a 
                        href={`/${b.businessLink}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FaLink className="text-xs" />
                        <span className="text-xs">{b.businessLink}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">{b.managersCount ?? b.managers?.length ?? 0}</td>
                  <td className="px-4 py-3 border-b">{b.staffCount ?? b.staff?.length ?? 0}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-3">
                      <button onClick={() => handleView(b.id || b._id)} className="text-blue-500 hover:text-blue-700" title="View">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(b.id || b._id)} className="text-green-500 hover:text-green-700" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(b.id || b._id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-gray-500">Loading businesses…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {businesses.map((b) => (
            <div key={b.id || b._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{b.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{b.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Branch:</span>
                  <p className="font-medium text-gray-700">{b.branch || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Managers:</span>
                  <p className="font-medium text-gray-700">{b.managersCount ?? b.managers?.length ?? 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Staff:</span>
                  <p className="font-medium text-gray-700">{b.staffCount ?? b.staff?.length ?? 0}</p>
                </div>
                {b.businessLink && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Business Link:</span>
                    <a 
                      href={`/${b.businessLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <FaLink className="text-xs" />
                      {b.businessLink}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex gap-3 border-t border-gray-100 pt-3">
                <button onClick={() => handleView(b.id || b._id)} className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">
                  <FaEye /> View
                </button>
                <button onClick={() => handleEdit(b.id || b._id)} className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:bg-green-50 py-2 rounded-lg transition-colors">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(b.id || b._id)} className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
          {loading && <div className="p-4 text-sm text-gray-500 text-center">Loading businesses…</div>}
          {!loading && businesses.length === 0 && <div className="p-8 text-sm text-gray-500 text-center">No businesses found</div>}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} businesses
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
      </section>

      {/* Create Business Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Business"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-2 sm:space-y-2.5">
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Adding..." : "Add Business"}
          </button>
        </form>
      </Modal>

      {/* Edit Business Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Business"
        size="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-2 sm:space-y-2.5">
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Updating..." : "Update Business"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BusinessList;
