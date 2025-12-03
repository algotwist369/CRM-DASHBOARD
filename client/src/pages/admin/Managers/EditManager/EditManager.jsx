import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import { toast } from "react-hot-toast";

const EditManager = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form state
    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        pin: "",
        permissions: {
            canManageStaff: true,
            canViewReports: true,
            canManageDailyBusiness: true,
            canManageTransactions: true,
        },
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showPinSection, setShowPinSection] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // Fetch existing manager details
    useEffect(() => {
        const fetchManager = async () => {
            try {
                setFetching(true);
                const res = await adminService.getManager(id);
                if (res.success) {
                    const data = res.data?.data || res.data;
                    setIsActive(data.isActive !== undefined ? data.isActive : true);
                    setForm({
                        name: data.name || "",
                        username: data.username || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        pin: "", // Don't populate PIN for security
                        permissions: data.permissions || {
                            canManageStaff: true,
                            canViewReports: true,
                            canManageDailyBusiness: true,
                            canManageTransactions: true,
                        },
                    });
                } else {
                    toast.error(res.error || "Failed to fetch manager details");
                    navigate("/admin/managers");
                }
            } catch (err) {
                toast.error("Failed to fetch manager details");
                navigate("/admin/managers");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchManager();
        }
    }, [id, navigate]);

    // Handle status toggle
    const handleStatusChange = async () => {
        try {
            setStatusUpdating(true);
            const newStatus = !isActive;
            const res = await adminService.updateManagerStatus(id, newStatus);

            if (res.success) {
                setIsActive(newStatus);
                toast.success(`Manager ${newStatus ? 'activated' : 'deactivated'} successfully`);
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setStatusUpdating(false);
        }
    };

    // Validation
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.username.trim()) newErrors.username = "Username is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Enter a valid email address";
        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
            newErrors.phone = "Enter a valid 10-digit Indian phone number";
        if (showPinSection && form.pin && !/^\d{4}$/.test(form.pin))
            newErrors.pin = "PIN must be exactly 4 digits";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle permissions checkboxes
        if (name.startsWith('permission_')) {
            const permissionName = name.replace('permission_', '');
            setForm((prev) => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [permissionName]: checked
                }
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        try {
            // Only send PIN if the PIN section is shown and PIN is provided
            const submitData = { ...form };
            if (!showPinSection || !submitData.pin) {
                delete submitData.pin;
            }

            const res = await adminService.updateManager(id, submitData);
            if (res.success) {
                toast.success("Manager updated successfully!");
                navigate("/admin/managers");
            } else {
                toast.error(res.error || "Failed to update manager");
            }
        } catch (err) {
            toast.error("Failed to update manager");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-primary-600 mx-auto w-12 h-12 mb-4" />
                    <p className="text-gray-600">Loading manager details...</p>
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
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Manager</h1>
            </div>

            {/* Form */}
            <div className="bg-white border   p-6 max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Update Manager Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full border  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            maxLength={10}
                            onChange={handleChange}
                            className="w-full border  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Change PIN Section */}
                    <div className="border-t border-gray-200 pt-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Change PIN</h3>
                                <p className="text-xs text-gray-500">Optional: Update manager login PIN</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPinSection(!showPinSection);
                                    setForm(prev => ({ ...prev, pin: "" }));
                                    setErrors(prev => ({ ...prev, pin: "" }));
                                }}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700  transition-colors"
                            >
                                {showPinSection ? "Cancel" : "Change PIN"}
                            </button>
                        </div>

                        {showPinSection && (
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    New PIN (4 digits)
                                </label>
                                <input
                                    type="password"
                                    name="pin"
                                    value={form.pin}
                                    maxLength={4}
                                    onChange={handleChange}
                                    placeholder="••••"
                                    className="w-full border  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {errors.pin && (
                                    <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Account Status Section */}
                    <div className="border-t border-gray-200 pt-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Status</h3>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                <p className={`text-sm font-medium ${isActive ? "text-green-700" : "text-red-700"}`}>
                                    {isActive ? "Active Account" : "Inactive Account"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isActive
                                        ? "Manager can log in and access the dashboard"
                                        : "Manager access is currently disabled"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleStatusChange}
                                disabled={statusUpdating}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${isActive ? 'bg-primary-600' : 'bg-gray-200'
                                    } ${statusUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="border-t border-gray-200 pt-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Manager Permissions</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="permission_canManageStaff"
                                    checked={form.permissions.canManageStaff}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">Manage Staff</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="permission_canViewReports"
                                    checked={form.permissions.canViewReports}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">View Reports</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="permission_canManageDailyBusiness"
                                    checked={form.permissions.canManageDailyBusiness}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">Manage Daily Business</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="permission_canManageTransactions"
                                    checked={form.permissions.canManageTransactions}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">Manage Transactions</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3  font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3  font-medium transition disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <FaSpinner className="animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                "Update Manager"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditManager;
