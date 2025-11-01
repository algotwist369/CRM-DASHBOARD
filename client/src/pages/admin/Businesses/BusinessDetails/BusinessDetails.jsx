import React, { useEffect, useState } from "react";
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
} from "react-icons/fa";
import businessService from "../../../../services/admin/businessService";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        Loading business details...
      </div>
    );

  if (!business)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        No business found.
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="pb-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm mb-3 md:mb-0"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            {business.name} <span className="text-gray-500">({business.branch})</span>
          </h1>
          <p className="capitalize text-gray-500">{business.type}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${business.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
        >
          {business.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            {business.address}, {business.city}, {business.state}, {business.country}
          </p>
          <p className="flex items-center gap-2">
            <FaPhone className="text-gray-500" />
            {business.phone || "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-gray-500" />
            {business.email || "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <FaGlobe className="text-gray-500" />
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:underline"
            >
              {business.website || "N/A"}
            </a>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-around items-center bg-gray-50 rounded-xl border p-4">
          <div className="text-center">
            <FaUserTie className="mx-auto text-gray-500 text-lg mb-1" />
            <p className="text-xl font-semibold text-gray-600">{business.managers?.length ?? 0}</p>
            <p className="text-gray-600 text-sm">Managers</p>
          </div>
          <div className="text-center">
            <FaUsers className="mx-auto text-gray-500 text-lg mb-1" />
            <p className="text-xl font-semibold text-gray-600">{business.staff?.length ?? 0}</p>
            <p className="text-gray-600 text-sm">Staff</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
        <p className="text-gray-600 leading-relaxed">{business.description}</p>
      </div>

      {/* Working Hours */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FaClock className="text-gray-500" /> Working Hours
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border text-gray-700">
          <p>
            <strong>Open:</strong> {business.settings?.workingHours?.open || "—"} &nbsp; | &nbsp;
            <strong>Close:</strong> {business.settings?.workingHours?.close || "—"}
          </p>
          <p>
            <strong>Days:</strong>{" "}
            {(business.settings?.workingHours?.days || [])
              .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
              .join(", ")}
          </p>
        </div>
      </div>

      {/* Appointment Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Appointment Settings</h3>
        <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 grid md:grid-cols-2 gap-3">
          <p>
            <strong>Advance Booking:</strong>{" "}
            {business.settings?.appointmentSettings?.advanceBookingDays ?? "—"} days
          </p>
          <p>
            <strong>Slot Duration:</strong>{" "}
            {business.settings?.appointmentSettings?.slotDuration ?? "—"} mins
          </p>
          <p>
            <strong>Buffer Time:</strong>{" "}
            {business.settings?.appointmentSettings?.bufferTime ?? "—"} mins
          </p>
          <p>
            <strong>Online Booking:</strong>{" "}
            {business.settings?.appointmentSettings?.allowOnlineBooking ? "Enabled" : "Disabled"}
          </p>
          <p>
            <strong>Require Advance Payment:</strong>{" "}
            {business.settings?.appointmentSettings?.requireAdvancePayment ? "Yes" : "No"}
          </p>
          <p>
            <strong>Cancellation:</strong>{" "}
            {business.settings?.appointmentSettings?.cancellationPolicy?.allowCancellation
              ? `Allowed (${business.settings?.appointmentSettings?.cancellationPolicy?.refundPercentage ?? 0}% refund)`
              : "Not Allowed"}
          </p>
          <p>
            <strong>Reminders:</strong>{" "}
            {([
              business.settings?.appointmentSettings?.reminderSettings?.sendSMSReminder && "SMS",
              business.settings?.appointmentSettings?.reminderSettings?.sendEmailReminder && "Email",
              business.settings?.appointmentSettings?.reminderSettings?.sendWhatsappReminder &&
              "WhatsApp",
            ])
              .filter(Boolean)
              .join(", ") || "None"}
          </p>
          <p>
            <strong>Reminder Hours Before:</strong>{" "}
            {business.settings?.appointmentSettings?.reminderSettings?.reminderHours ?? "—"} hrs
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
