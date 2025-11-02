import React, { useEffect, useState, useMemo } from "react";
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
  FaEdit,
  FaBuilding,
  FaCalendarAlt,
  FaChevronRight,
  FaLink,
  FaInfoCircle,
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await businessService.getBusiness(id);
      const data = res?.data?.data || res?.data;
      if (data) {
        setBusiness(data);
      } else {
        setBusiness(null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const businessTypeBadge = useMemo(() => {
    if (!business) return null;
    const types = {
      spa: "bg-purple-100 text-purple-700 border-purple-200",
      salon: "bg-pink-100 text-pink-700 border-pink-200",
      hotel: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return types[business.type] || types.spa;
  }, [business]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading business details...</p>
        </div>
      </div>
    );

  if (!business)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        <div className="text-center">
          <FaInfoCircle className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold">No business found</p>
        </div>
      </div>
    );

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[99rem] mx-auto">
      {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
          <button
            onClick={() => navigate(-1)}
                className="mb-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm transition-colors"
          >
            <FaArrowLeft /> Back
          </button>
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl ${businessTypeBadge?.split(' ')[0]}`}>
                  <FaBuilding className="text-2xl" style={{ color: businessTypeBadge?.includes('purple') ? '#7c3aed' : businessTypeBadge?.includes('pink') ? '#db2777' : '#2563eb' }} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {business.name}
          </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {business.branch}
                  </p>
                </div>
              </div>
        </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${businessTypeBadge}`}
              >
                {business.type?.toUpperCase()}
              </span>
        <span
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  business.isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
            }`}
        >
          {business.isActive ? "Active" : "Inactive"}
        </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/admin/businesses/${id}/staff`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium  "
                >
                  <FaUsers /> Staff ({business.staff?.length ?? 0})
                </button>
                <button
                  onClick={() => navigate(`/admin/businesses/${id}/daily-records`)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium  "
                >
                  <FaCalendarAlt /> Records
                </button>
                <button
                  onClick={() => navigate(`/admin/businesses/${id}/analytics`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium  "
                >
                  <FaChartBar /> Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-primary-600" />
                Quick Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <FaUserTie className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{business.managers?.length ?? 0}</p>
                      <p className="text-sm text-blue-700">Managers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <FaUsers className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{business.staff?.length ?? 0}</p>
                      <p className="text-sm text-green-700">Staff Members</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <FaLink className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-900 truncate">{business.businessLink}</p>
                      <p className="text-sm text-purple-700">Business ID</p>
                    </div>
                  </div>
                </div>
              </div>
      </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaPhone className="text-primary-600" />
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <FaMapMarkerAlt className="text-primary-600 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900">{business.address}</p>
                    <p className="text-gray-600">
                      {business.city}, {business.state}, {business.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <FaPhone className="text-primary-600 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                    <a
                      href={`tel:${business.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
            {business.phone || "N/A"}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <FaEnvelope className="text-primary-600 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${business.email}`}
                      className="text-primary-600 hover:text-primary-700 font-medium break-all"
                    >
            {business.email || "N/A"}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <FaGlobe className="text-primary-600 text-lg mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                    {business.website ? (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium break-all"
                      >
                        {business.website}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
          </div>
          </div>
        </div>
      </div>

      {/* Description */}
            {business.description && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
      </div>
            )}

      {/* Working Hours */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-primary-600" />
                Working Hours
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Opening Time</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {business.settings?.workingHours?.open || "—"}
                    </p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Closing Time</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {business.settings?.workingHours?.close || "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Operating Days</p>
                  <div className="flex flex-wrap gap-2">
                    {(business.settings?.workingHours?.days || []).map((day) => (
                      <span
                        key={day}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium"
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
        </div>
      </div>

      {/* Appointment Settings */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600" />
                Appointment Settings
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2">Booking Window</p>
                  <p className="text-lg font-bold text-blue-900">
                    {business.settings?.appointmentSettings?.advanceBookingDays ?? "—"} days in advance
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">Slot Duration</p>
                  <p className="text-lg font-bold text-green-900">
                    {business.settings?.appointmentSettings?.slotDuration ?? "—"} minutes
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm font-medium text-purple-700 mb-2">Buffer Time</p>
                  <p className="text-lg font-bold text-purple-900">
                    {business.settings?.appointmentSettings?.bufferTime ?? "—"} minutes
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm font-medium text-orange-700 mb-2">Online Booking</p>
                  <p className="text-lg font-bold text-orange-900">
            {business.settings?.appointmentSettings?.allowOnlineBooking ? "Enabled" : "Disabled"}
          </p>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</p>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
            {business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation
                      ? "✓ Cancellation Allowed"
                      : "✗ No Cancellation"}
                  </span>
                  {business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-700">
                        <strong>Refund:</strong>{" "}
                        {business.settings?.appointmentSettings?.cancellationPolicy?.refundPercentage ?? 0}%
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-700">
                        <strong>Min Hours:</strong>{" "}
                        {business.settings?.appointmentSettings?.cancellationPolicy?.minCancellationHours ?? 0}h
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Reminders</p>
                <div className="flex flex-wrap gap-2">
                  {business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      📱 SMS
                    </span>
                  )}
                  {business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      ✉️ Email
                    </span>
                  )}
                  {business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      💬 WhatsApp
                    </span>
                  )}
                  {(!business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder &&
                    !business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder &&
                    !business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder) && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      None
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {business.settings?.appointmentSettings?.reminderSettings?.reminderHours ?? "—"}h before
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Link */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaLink className="text-primary-600" />
                Business Link
              </h3>
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
                <p className="text-sm text-primary-700 mb-2 font-medium">Public Access Link</p>
                <a
                  href={`/${business.businessLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs bg-white p-3 rounded-lg border border-primary-200 text-blue-600 hover:text-blue-700 hover:bg-primary-50 hover:border-primary-300 transition-all mb-3 group"
                >
                  <FaLink className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="break-all">/{business.businessLink}</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`/${business.businessLink}`);
                    setCopied(true);
                  }}
                  className="flex items-center gap-2 text-xs font-medium transition-colors"
                  disabled={copied}
                >
                  {copied ? (
                    <span className="text-green-600">✓ Copied!</span>
                  ) : (
                    <>
                      <FaLink className="text-primary-600" />
                      <span className="text-primary-600 hover:text-primary-700">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Information */}
            {business.admin && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaUserTie className="text-primary-600" />
                  Admin Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Company</p>
                    <p className="text-gray-900 font-semibold">{business.admin.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Admin Name</p>
                    <p className="text-gray-900">{business.admin.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${business.admin.email}`}
                      className="text-primary-600 hover:text-primary-700 break-all"
                    >
                      {business.admin.email}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Currency & Timezone */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-semibold text-gray-900">
                    {business.settings?.currency || "INR"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Timezone</span>
                  <span className="font-semibold text-gray-900">
                    {business.settings?.timezone || "Asia/Kolkata"}
                  </span>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="text-gray-900 font-medium">
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
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-gray-900 font-medium">
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
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUserTie className="text-primary-600" />
              Managers ({business.managers.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.managers.map((manager) => (
                <div
                  key={manager._id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUserTie className="text-primary-600 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{manager.name}</p>
                      <p className="text-sm text-gray-500 truncate">@{manager.username}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {manager.email && (
                      <p className="flex items-center gap-2 text-gray-600 truncate">
                        <FaEnvelope className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{manager.email}</span>
                      </p>
                    )}
                    {manager.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <FaPhone className="text-gray-400 flex-shrink-0" />
                        {manager.phone}
                      </p>
                    )}
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        manager.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetails;
