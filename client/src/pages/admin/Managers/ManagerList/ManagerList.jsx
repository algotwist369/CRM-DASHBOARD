import React, { useState, useEffect, useCallback, memo } from "react";
import { FiEdit, FiTrash2, FiEye, FiSearch, FiUser, FiPhone, FiMail, FiLock, FiBriefcase, FiChevronDown } from "react-icons/fi";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import businessService from "../../../../services/admin/businessService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Modal from "../../../../components/common/Modal/Modal";

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

// Memoized Icon Input Field Component
const IconInputField = memo(({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon, required = false }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
      {label}{required && " *"}
    </label>
    <div className="flex items-center border border-gray-300 rounded-lg p-1.5 sm:p-2">
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
        className={`w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-lg p-1.5 sm:p-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none ${Icon ? "pl-10 pr-8" : "px-3"}`}
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

  // Fetch businesses for dropdown
  const fetchBusinesses = useCallback(async () => {
    try {
      const res = await businessService.getBusinesses({ page: 1, limit: 100 });
      if (res.success) {
        setBusinesses(res.data?.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch businesses:", e);
    }
  }, []);

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
    fetchBusinesses();
  }, [fetchBusinesses]);

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

  const handleAdd = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setShowPinSection(false);
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback(async (manager) => {
    setSubmitting(true);
    try {
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
  }, []);

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
    if (isCreateModalOpen && !/^\d{4}$/.test(formData.pin)) {
      errors.pin = "PIN must be exactly 4 digits";
    }
    if (isEditModalOpen && showPinSection && formData.pin && !/^\d{4}$/.test(formData.pin)) {
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

  const handleCreateSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await adminService.createManager(formData);
      if (res.success) {
        toast.success("Manager created successfully!");
        setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM_DATA);
        await fetchManagers();
      } else {
        toast.error(res.error || "Failed to create manager");
      }
    } catch (error) {
      toast.error("Failed to create manager");
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, fetchManagers]);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const submitData = { ...formData };
      // Only send PIN if the PIN section is shown and PIN is provided
      if (!showPinSection || !submitData.pin) {
        delete submitData.pin;
      }
      
      const res = await adminService.updateManager(editingManager.id || editingManager._id, submitData);
      if (res.success) {
        toast.success("Manager updated successfully!");
        setIsEditModalOpen(false);
        setEditingManager(null);
        await fetchManagers();
      } else {
        toast.error(res.error || "Failed to update manager");
      }
    } catch (error) {
      toast.error("Failed to update manager");
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
        <button 
          onClick={handleAdd} 
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
                          disabled={submitting}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
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
        <form onSubmit={handleCreateSubmit} className="space-y-3 sm:space-y-4">
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
          
          <SelectField
            label="Business"
            name="businessId"
            value={formData.businessId}
            onChange={handleChange}
            error={formErrors.businessId}
            options={businesses.map(biz => ({ value: biz._id || biz.id, label: biz.name }))}
            icon={FiBriefcase}
            required
          />
          
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
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
        <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
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
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 text-sm sm:text-base"
          >
            {submitting ? "Updating..." : "Update Manager"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerList;
