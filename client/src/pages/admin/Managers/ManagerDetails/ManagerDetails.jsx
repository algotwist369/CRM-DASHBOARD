import React, { useEffect, useState, useRef, memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaIdCard,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import adminService from "../../../../services/admin/adminService";
import { toast } from "react-hot-toast";
import BackButton from "../../../../components/common/Button/BackButton";

// --- Sub-Components ---

const ManagerHeader = memo(({ manager }) => (
  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
      <FaUser className="w-8 h-8 text-primary-600" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">{manager.name}</h2>
      <p className="text-sm text-gray-500">@{manager.username}</p>
    </div>
  </div>
));

const InfoSection = memo(({ title, items }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">{title}</h3>
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="w-8 h-8  bg-gray-50 flex items-center justify-center text-gray-400">
          <item.icon className="text-sm" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className={`text-sm font-medium text-gray-900 ${item.className || ''}`}>
            {item.value}
          </p>
          {item.subValue && (
            <p className="text-xs text-gray-500">{item.subValue}</p>
          )}
        </div>
      </div>
    ))}
  </div>
));

const AccountDetails = memo(({ createdAt, updatedAt, isActive }) => {
  const items = useMemo(() => [
    {
      icon: FaCalendarAlt,
      label: 'Created',
      value: new Date(createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    ...(updatedAt ? [{
      icon: FaCalendarAlt,
      label: 'Updated',
      value: new Date(updatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }] : [])
  ], [createdAt, updatedAt]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Account</h3>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-8 h-8  bg-gray-50 flex items-center justify-center text-gray-400">
            <item.icon className="text-sm" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}

      <div className="pt-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive
          ? "bg-green-50 text-green-700 border border-green-100"
          : "bg-red-50 text-red-700 border border-red-100"
          }`}>
          {isActive ? "Active Account" : "Inactive Account"}
        </span>
      </div>
    </div>
  );
});

const Permissions = memo(({ permissions }) => {
  if (!permissions) return null;

  const permissionList = useMemo(() => [
    { key: 'canManageStaff', label: 'Manage Staff' },
    { key: 'canViewReports', label: 'View Reports' },
    { key: 'canManageDailyBusiness', label: 'Manage Daily Business' },
    { key: 'canManageTransactions', label: 'Manage Transactions' },
  ], []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Permissions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {permissionList.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-2.5 bg-gray-50  border border-gray-100">
            <span className="text-sm text-gray-700">{label}</span>
            <div className={`w-2 h-2 rounded-full ${permissions[key] ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        ))}
      </div>
    </div>
  );
});

const ManagerDetails = () => {
  const { id } = useParams();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchManager = async () => {
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;
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
        fetchingRef.current = false;
      }
    };

    if (id) {
      fetchManager();
    }
  }, [id]);

  const contactItems = useMemo(() => {
    if (!manager) return [];
    return [
      { icon: FaEnvelope, label: 'Email', value: manager.email || "—" },
      { icon: FaPhone, label: 'Phone', value: manager.phone || "—" }
    ];
  }, [manager]);

  const businessItems = useMemo(() => {
    if (!manager) return [];
    return [
      {
        icon: FaBuilding,
        label: 'Business',
        value: manager.business?.name || "—",
        subValue: manager.business?.branch
      },
      {
        icon: FaIdCard,
        label: 'Type',
        value: manager.business?.type || "—",
        className: 'capitalize'
      },
      ...(manager.staffCount !== undefined ? [{
        icon: FaUser,
        label: 'Staff',
        value: manager.staffCount
      }] : [])
    ];
  }, [manager]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-primary-600" />
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="p-6">
        <BackButton />
        <div className="bg-red-50 border border-red-200  p-4 text-red-700 text-sm">
          {error || "Manager not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold text-gray-900">Manager Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white  border border-gray-200 p-6 ">
          <ManagerHeader manager={manager} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoSection title="Contact" items={contactItems} />
            <InfoSection title="Business" items={businessItems} />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Permissions permissions={manager.permissions} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white  border border-gray-200 p-6 ">
            <AccountDetails
              createdAt={manager.createdAt}
              updatedAt={manager.updatedAt}
              isActive={manager.isActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDetails;
