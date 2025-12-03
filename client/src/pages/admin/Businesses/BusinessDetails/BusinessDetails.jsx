import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaUserTie,
  FaUsers,
  FaChartBar,
  FaBuilding,
  FaCalendarAlt,
  FaLink,
  FaInfoCircle,
  FaCopy,
  FaCheck,
  FaCog,
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import businessService from "../../../../services/admin/businessService";

// Stat Card Component
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white  border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`${iconBg} p-2  flex-shrink-0`}>
        <Icon className={`${iconColor} text-lg`} />
      </div>
      <div className="overflow-hidden">
        <p className="text-xs text-gray-600 mb-0.5">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
));

// Info Row Component
const InfoRow = memo(({ icon: Icon, label, value, isLink, href }) => (
  <div className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
    <Icon className="text-gray-500 text-base mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      {isLink && href ? (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium break-all"
        >
          {value || '—'}
        </a>
      ) : (
        <p className="text-sm text-gray-800 break-words">{value || '—'}</p>
      )}
    </div>
  </div>
));

// Manager Card Component
const ManagerCard = memo(({ manager }) => (
  <div className="border border-gray-200  p-4 bg-white">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <FaUserTie className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{manager.name}</p>
        <p className="text-xs text-gray-500 truncate">@{manager.username}</p>
      </div>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${manager.isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
        }`}>
        {manager.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
    <div className="space-y-1.5 text-xs">
      {manager.email && (
        <p className="flex items-center gap-2 text-gray-600 truncate">
          <FaEnvelope className="text-gray-400 text-xs flex-shrink-0" />
          <span className="truncate">{manager.email}</span>
        </p>
      )}
      {manager.phone && (
        <p className="flex items-center gap-2 text-gray-600">
          <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
          {manager.phone}
        </p>
      )}
    </div>
  </div>
));

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessService.getBusiness(id);
      const data = res?.data?.data || res?.data;

      // If business doesn't have link, fetch it separately
      if (data && !data.businessLink) {
        const linkRes = await businessService.getBusinessLink(id);
        if (linkRes.success && linkRes.data) {
          data.businessLink = linkRes.data.businessLink || linkRes.data.link;
        }
      }

      setBusiness(data || null);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      setBusiness(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBusiness();
  }, [fetchBusiness]);

  const handleCopyLink = useCallback(() => {
    if (business?.businessLink) {
      navigator.clipboard.writeText(`/${business.businessLink}`);
      setCopied(true);
    }
  }, [business?.businessLink]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const businessTypeBadge = useMemo(() => {
    if (!business) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    const types = {
      spa: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      salon: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
      hotel: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    };
    return types[business.type] || types.hotel;
  }, [business]);

  // Memoized stat cards
  const statCards = useMemo(() => [
    { icon: FaUserTie, title: "Managers", value: business?.managers?.length ?? 0, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: FaUsers, title: "Staff Members", value: business?.staff?.length ?? 0, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { icon: FaLink, title: "Business ID", value: business?.businessLink ?? '—', iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  ], [business]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <FaInfoCircle className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800">Business Not Found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white  border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2  bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                title="Go Back"
              >
                <FaArrowLeft className="text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${businessTypeBadge.bg}  flex items-center justify-center`}>
                  <FaBuilding className={`${businessTypeBadge.text} text-lg`} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{business.name}</h1>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    {business.branch}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200  hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <HiRefresh className={`text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1.5 text-xs font-medium  border ${businessTypeBadge.bg} ${businessTypeBadge.text} ${businessTypeBadge.border}`}>
              {business.type?.toUpperCase()}
            </span>
            <span className={`px-3 py-1.5 text-xs font-medium  border ${business.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}>
              {business.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/admin/businesses/${id}/staff`)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <FaUsers className="text-sm" />
              <span>Staff ({business.staff?.length ?? 0})</span>
            </button>
            <button
              onClick={() => navigate(`/admin/businesses/${id}/daily-records`)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-orange-600 text-white  hover:bg-orange-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <FaCalendarAlt className="text-sm" />
              <span>Records</span>
            </button>
            <button
              onClick={() => navigate(`/admin/businesses/${id}/analytics`)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <FaChartBar className="text-sm" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => navigate(`/admin/businesses/${id}/settings`)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-purple-600 text-white  hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium"
            >
              <FaCog className="text-sm" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaInfoCircle className="text-white text-sm" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Quick Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statCards.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaPhone className="text-white text-sm" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Contact Information</h2>
              </div>
              <div className="space-y-0">
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="Address"
                  value={`${business.address}, ${business.city}, ${business.state}, ${business.country}`}
                />
                <InfoRow
                  icon={FaPhone}
                  label="Phone"
                  value={business.phone}
                  isLink
                  href={`tel:${business.phone}`}
                />
                <InfoRow
                  icon={FaEnvelope}
                  label="Email"
                  value={business.email}
                  isLink
                  href={`mailto:${business.email}`}
                />
                <InfoRow
                  icon={FaGlobe}
                  label="Website"
                  value={business.website}
                  isLink
                  href={business.website}
                />
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <div className="bg-white  border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">About</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Working Hours */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaClock className="text-white text-sm" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Working Hours</h2>
              </div>
              <div className="border border-gray-200  p-4">
                <div className="flex items-center justify-around mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">Opening</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {business.settings?.workingHours?.open || "—"}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">Closing</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {business.settings?.workingHours?.close || "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Operating Days</p>
                  <div className="flex flex-wrap gap-2">
                    {(business.settings?.workingHours?.days || []).length > 0 ? (
                      (business.settings.workingHours.days).map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-primary-50 text-primary-700 border border-primary-200  text-xs font-medium"
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No days specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Settings */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaCalendarAlt className="text-white text-sm" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Appointment Settings</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 border border-gray-200 ">
                  <p className="text-xs font-medium text-gray-500 mb-1">Booking Window</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {business.settings?.appointmentSettings?.advanceBookingDays ?? "—"} days
                  </p>
                </div>
                <div className="p-3 border border-gray-200 ">
                  <p className="text-xs font-medium text-gray-500 mb-1">Slot Duration</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {business.settings?.appointmentSettings?.slotDuration ?? "—"} min
                  </p>
                </div>
                <div className="p-3 border border-gray-200 ">
                  <p className="text-xs font-medium text-gray-500 mb-1">Buffer Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {business.settings?.appointmentSettings?.bufferTime ?? "—"} min
                  </p>
                </div>
                <div className="p-3 border border-gray-200 ">
                  <p className="text-xs font-medium text-gray-500 mb-1">Online Booking</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {business.settings?.appointmentSettings?.allowOnlineBooking ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="p-3 bg-gray-50 border border-gray-200  mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Cancellation Policy</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-1  font-medium ${business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation
                      ? "Allowed"
                      : "Not Allowed"}
                  </span>
                  {business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation && (
                    <>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-700">
                        Refund: {business.settings?.appointmentSettings?.cancellationPolicy?.refundPercentage ?? 0}%
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-700">
                        Min: {business.settings?.appointmentSettings?.cancellationPolicy?.minCancellationHours ?? 0}h
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="p-3 bg-gray-50 border border-gray-200 ">
                <p className="text-xs font-medium text-gray-700 mb-2">Reminders</p>
                <div className="flex flex-wrap gap-2">
                  {business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200  text-xs font-medium">
                      SMS
                    </span>
                  )}
                  {business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200  text-xs font-medium">
                      Email
                    </span>
                  )}
                  {business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder && (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200  text-xs font-medium">
                      WhatsApp
                    </span>
                  )}
                  {(!business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder &&
                    !business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder &&
                    !business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600  text-xs font-medium">
                        None
                      </span>
                    )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700  text-xs font-medium">
                    {business.settings?.appointmentSettings?.reminderSettings?.reminderHours ?? "—"}h before
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Business Link */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaLink className="text-white text-sm" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Business Link</h3>
              </div>
              <div className="border border-primary-200 bg-primary-50 p-3 ">
                <p className="text-xs text-primary-700 mb-2 font-medium">Public Access</p>
                <a
                  href={`/${business.businessLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs bg-white p-2  border border-gray-200 text-blue-600 hover:text-blue-700 mb-2 break-all"
                >
                  <FaLink className="flex-shrink-0 text-xs" />
                  <span>/{business.businessLink}</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  disabled={copied}
                  className="flex items-center gap-2 text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <FaCheck className="text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy className="text-primary-600" />
                      <span className="text-primary-600">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Information */}
            {business.admin && (
              <div className="bg-white  border border-gray-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                    <FaUserTie className="text-white text-sm" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Admin Details</h3>
                </div>
                <div className="space-y-2.5">
                  <div className="pb-2.5 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Company</p>
                    <p className="text-sm text-gray-800 font-medium">{business.admin.companyName}</p>
                  </div>
                  <div className="pb-2.5 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Admin Name</p>
                    <p className="text-sm text-gray-800">{business.admin.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${business.admin.email}`}
                      className="text-sm text-primary-600 hover:text-primary-700 break-all"
                    >
                      {business.admin.email}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Currency & Timezone */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Settings</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Currency</span>
                  <span className="text-sm font-medium text-gray-800">
                    {business.settings?.currency || "INR"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Timezone</span>
                  <span className="text-sm font-medium text-gray-800">
                    {business.settings?.timezone || "Asia/Kolkata"}
                  </span>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Timeline</h3>
              <div className="space-y-2.5">
                <div className="pb-2.5 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">Created</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {business.createdAt
                      ? new Date(business.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Last Updated</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {business.updatedAt
                      ? new Date(business.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Managers Section */}
        {business.managers && business.managers.length > 0 && (
          <div className="bg-white  border border-gray-200 p-5 sm:p-6 mt-4 sm:mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                <FaUserTie className="text-white text-sm" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Managers ({business.managers.length})
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.managers.map((manager) => (
                <ManagerCard key={manager._id} manager={manager} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetails;
