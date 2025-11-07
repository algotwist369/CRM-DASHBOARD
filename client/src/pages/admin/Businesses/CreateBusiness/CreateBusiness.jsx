import React, { useState } from "react";
import { FaStore, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import businessService from "../../../../services/admin/businessService";

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let msg = "";
    if (name === "type" && !value) msg = "Business type is required";
    if (name === "name" && value.trim().length < 3) msg = "Name must be at least 3 characters";
    if (name === "phone" && !/^[6-9]\d{9}$/.test(value))
      msg = "Enter a valid 10-digit phone number starting with 6-9";
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      msg = "Invalid email format";
    if (name === "website" && value && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(value))
      msg = "Enter a valid website URL";
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const validateForm = () => {
    let valid = true;
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
      if (errors[key]) valid = false;
    });
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct form errors before submitting");
      return;
    }

    try {
      setLoading(true);
      const res = await businessService.createBusiness(formData);
      if (res.success) {
        toast.success(`${formData.type} created successfully`);
        navigate("/admin/businesses");
      } else {
        toast.error(res.error || 'Failed to create business');
      }
    } catch (error) {
      toast.error("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="bg-white w-full max-w-11/12 p-8 rounded-2xl shadow-md border border-gray-400 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FaStore className="text-primary-600" /> Add New Business
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Business Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full border ${errors.type ? "border-red-500" : "border-gray-300"
                } rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500`}
            >
              <option value="">Select Type</option>
              <option value="salon">Salon</option>
              <option value="spa">Spa</option>
              <option value="hotel">Hotel</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Business Name</label>
            <div className="flex items-center border border-gray-400 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500">
              <FaBuilding className="text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter business name"
                className="w-full focus:outline-none"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., Main Branch"
              className="w-full border border-gray-400 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows={2}
              className="w-full border border-gray-400 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          {/* City, State, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["city", "state", "country"].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="border border-gray-400 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
              />
            ))}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <div className="flex items-center border border-gray-400 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500">
              <FaPhone className="text-gray-400 mr-2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                className="w-full focus:outline-none"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <div className="flex items-center border border-gray-400 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Business email"
                className="w-full focus:outline-none"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Website */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Website</label>
            <div className="flex items-center border border-gray-400 rounded-lg p-2 focus-within:ring-2 focus-within:ring-primary-500">
              <FaGlobe className="text-gray-400 mr-2" />
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full focus:outline-none"
              />
            </div>
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write something about your business"
              rows={3}
              className="w-full border border-gray-400 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Business"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBusiness;
