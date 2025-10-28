import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiBriefcase,
  FiChevronDown,
} from "react-icons/fi";

const CreateManager = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    pin: "",
    businessId: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);

  // Fetch all businesses (will replace with real API later)
  useEffect(() => {
    // Temporary mock data
    setBusinesses([
      { _id: "673b91f88a12345", name: "Elite Hair Studio" },
      { _id: "673b91f88a67890", name: "Serenity Spa" },
      { _id: "673b91f88a99887", name: "Grand Palace Hotel" },
    ]);
  }, []);

  // Validation
  const validate = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        break;
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "pin":
        if (!/^\d{4}$/.test(value))
          error = "PIN must be exactly 4 digits (e.g., 1234)";
        break;
      case "phone":
        if (!/^[6-9]\d{9}$/.test(value))
          error = "Enter a valid 10-digit Indian phone number";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "businessId":
        if (!value.trim()) error = "Please select a business";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      validate(key, formData[key]);
      if (formData[key] === "" || errors[key]) isValid = false;
    });

    if (!isValid) {
      toast.error("Please correct all errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Manager created successfully!");
        setFormData({
          name: "",
          username: "",
          pin: "",
          businessId: "",
          email: "",
          phone: "",
        });
      } else {
        toast.error(data.message || "Failed to create manager");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Manager
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Enter manager name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Unique username"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* 4-Digit PIN */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              4-Digit PIN
            </label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                maxLength={4}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Enter 4-digit PIN"
              />
            </div>
            {errors.pin && (
              <p className="text-red-500 text-xs mt-1">{errors.pin}</p>
            )}
          </div>

          {/* Business Dropdown */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Select Business
            </label>
            <div className="relative">
              <FiBriefcase className="absolute top-3 left-3 text-gray-400" />
              <FiChevronDown className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
              <select
                name="businessId"
                value={formData.businessId}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
              >
                <option value="">Select Business</option>
                {businesses.map((biz) => (
                  <option key={biz._id} value={biz._id}>
                    {biz.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.businessId && (
              <p className="text-red-500 text-xs mt-1">{errors.businessId}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email (optional)
            </label>
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="manager@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Enter 10-digit number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition-colors ${
              loading
                ? "bg-primary-300 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {loading ? "Creating..." : "Create Manager"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateManager;
