import React, { useState } from "react";
import {
  FaStore,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaCreditCard,
  FaUsers,
  FaClock,
  FaCog,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import businessService from "../../../../services/admin/businessService";

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  const [formData, setFormData] = useState({
    // Basic Information
    type: "",
    name: "",
    branch: "",
    description: "",

    // Location & Contact
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    phone: "",
    alternatePhone: "",
    email: "",
    website: "",
    googleMapsUrl: "",

    // Category & Tags
    category: "",
    subCategory: "",
    tags: [],
    specialties: [],
    languages: [],

    // Images
    images: {
      logo: "",
      banner: "",
      thumbnail: "",
      gallery: [],
    },

    // Social Media
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
      telegram: "",
    },

    // Registration & Legal
    registration: {
      gstNumber: "",
      panNumber: "",
      registrationNumber: "",
      licenseNumber: "",
      taxId: "",
      registrationDate: "",
      expiryDate: "",
    },

    // Payment Methods
    paymentMethods: {
      cash: true,
      card: false,
      upi: false,
      netBanking: false,
      wallet: false,
    },

    // Bank Details
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branch: "",
      upiId: "",
      qrCode: "",
    },

    // Capacity
    capacity: {
      seatingCapacity: "",
      parkingSpaces: "",
      numberOfRooms: "",
      numberOfFloors: "",
      totalArea: "",
    },

    // Features & Amenities
    features: [],
    amenities: [],

    // Business Hours & Days Off
    businessHours: {},
    daysOff: [],
    holidays: [],

    // Settings
    settings: {
      workingHours: {
        open: "09:00",
        close: "18:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      },
      currency: "INR",
      timezone: "Asia/Kolkata",
    },

    // SEO
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      ogImage: "",
    },

    // Subscription
    subscription: {
      plan: "free",
      startDate: "",
      endDate: "",
      isActive: true,
      features: [],
    },

    // Notification Preferences
    notificationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      pushNotifications: true,
    },

    // Custom Fields
    customFields: [],
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
    }
    validateField(name, type === "checkbox" ? checked : value);
  };

  const handleArrayAdd = (field, input, setInput) => {
    if (input.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], input.trim()],
      }));
      setInput("");
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateField = (name, value) => {
    let msg = "";
    if (name === "type" && !value) msg = "Business type is required";
    if (name === "name" && value && value.trim().length < 3)
      msg = "Name must be at least 3 characters";
    if (name === "phone" && value && !/^[6-9]\d{9}$/.test(value))
      msg = "Enter a valid 10-digit phone number starting with 6-9";
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      msg = "Invalid email format";
    if (name === "website" && value && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(value))
      msg = "Enter a valid website URL";
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const validateStep = (step) => {
    let valid = true;
    const stepFields = {
      1: ["type", "name", "branch"],
      2: ["address", "city", "state", "phone"],
    };

    if (stepFields[step]) {
      stepFields[step].forEach((field) => {
        validateField(field, formData[field]);
        if (errors[field] || (field === "type" && !formData[field])) {
          valid = false;
        }
      });
    }
    return valid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fill required fields correctly");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      toast.error("Please fill required fields correctly");
      return;
    }

    try {
      setLoading(true);
      // Clean up empty objects and arrays before sending
      const cleanedData = { ...formData };
      
      // Remove empty nested objects
      Object.keys(cleanedData).forEach((key) => {
        if (typeof cleanedData[key] === "object" && !Array.isArray(cleanedData[key])) {
          const isEmpty = Object.values(cleanedData[key]).every(
            (v) => v === "" || v === false || (Array.isArray(v) && v.length === 0)
          );
          if (isEmpty && key !== "settings" && key !== "paymentMethods") {
            delete cleanedData[key];
          }
        } else if (Array.isArray(cleanedData[key]) && cleanedData[key].length === 0) {
          delete cleanedData[key];
        }
      });

      const res = await businessService.createBusiness(cleanedData);
      if (res.success) {
        toast.success(`${formData.type} created successfully`);
        navigate("/admin/businesses");
      } else {
        toast.error(res.error || "Failed to create business");
      }
    } catch (error) {
      toast.error("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Basic Information",
    "Location & Contact",
    "Category & Tags",
    "Images & Social Media",
    "Registration & Legal",
    "Payment & Banking",
    "Capacity & Features",
    "Business Hours & Settings",
    "Additional Settings",
  ];

  const stepIcons = [
    FaStore,
    FaMapMarkerAlt,
    FaBuilding,
    FaImage,
    FaCheckCircle,
    FaCreditCard,
    FaUsers,
    FaClock,
    FaCog,
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
            
          <div>
              <label className="block text-gray-700 font-medium mb-1">
                Business Type <span className="text-red-500">*</span>
              </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
                className={`w-full border ${
                  errors.type ? "border-red-500" : "border-gray-300"
                }  p-2.5 focus:ring-primary-500 focus:border-primary-500`}
            >
              <option value="">Select Type</option>
              <option value="salon">Salon</option>
              <option value="spa">Spa</option>
              <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="gym">Gym</option>
                <option value="clinic">Clinic</option>
                <option value="cafe">Cafe</option>
                <option value="studio">Studio</option>
                <option value="education">Education</option>
                <option value="automotive">Automotive</option>
                <option value="others">Others</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
              <label className="block text-gray-700 font-medium mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300  p-2 focus-within:ring-2 focus-within:ring-primary-500">
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

          <div>
              <label className="block text-gray-700 font-medium mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., Main Branch"
                className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write something about your business"
                rows={4}
                className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Location & Contact</h3>
            
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
                placeholder="Enter full address"
              rows={2}
                className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["city", "state", "country"].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 font-medium mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {field !== "country" && <span className="text-red-500">*</span>}
                  </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
              />
                </div>
            ))}
          </div>

          <div>
              <label className="block text-gray-700 font-medium mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Enter zip code"
                className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300  p-2 focus-within:ring-2 focus-within:ring-primary-500">
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

            <div>
              <label className="block text-gray-700 font-medium mb-1">Alternate Phone</label>
              <input
                type="text"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                placeholder="Alternate phone number"
                className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
              <div className="flex items-center border border-gray-300  p-2 focus-within:ring-2 focus-within:ring-primary-500">
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

          <div>
            <label className="block text-gray-700 font-medium mb-1">Website</label>
              <div className="flex items-center border border-gray-300  p-2 focus-within:ring-2 focus-within:ring-primary-500">
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

          <div>
              <label className="block text-gray-700 font-medium mb-1">Google Maps URL</label>
              <div className="flex items-center border border-gray-300  p-2 focus-within:ring-2 focus-within:ring-primary-500">
                <FaMapMarkerAlt className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Coordinates will be auto-extracted</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Category & Tags</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Beauty & Wellness"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Sub Category</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  placeholder="e.g., Hair Salon"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleArrayAdd("tags", tagInput, setTagInput);
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd("tags", tagInput, setTagInput)}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("tags", index)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Specialties</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleArrayAdd("specialties", specialtyInput, setSpecialtyInput);
                    }
                  }}
                  placeholder="Add specialty and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd("specialties", specialtyInput, setSpecialtyInput)}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("specialties", index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Languages Supported</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleArrayAdd("languages", languageInput, setLanguageInput);
                    }
                  }}
                  placeholder="Add language and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd("languages", languageInput, setLanguageInput)}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("languages", index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Images & Social Media</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Logo URL</label>
                <input
                  type="text"
                  name="images.logo"
                  value={formData.images.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Banner URL</label>
                <input
                  type="text"
                  name="images.banner"
                  value={formData.images.banner}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.png"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  name="images.thumbnail"
                  value={formData.images.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/thumbnail.png"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Social Media Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "facebook",
                  "instagram",
                  "twitter",
                  "linkedin",
                  "youtube",
                  "whatsapp",
                  "telegram",
                ].map((platform) => (
                  <div key={platform}>
                    <label className="block text-gray-700 font-medium mb-1 capitalize">
                      {platform}
                    </label>
                    <input
                      type="text"
                      name={`socialMedia.${platform}`}
                      value={formData.socialMedia[platform]}
                      onChange={handleChange}
                      placeholder={`${platform} URL`}
                      className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Registration & Legal</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">GST Number</label>
                <input
                  type="text"
                  name="registration.gstNumber"
                  value={formData.registration.gstNumber}
                  onChange={handleChange}
                  placeholder="GST Number"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">PAN Number</label>
                <input
                  type="text"
                  name="registration.panNumber"
                  value={formData.registration.panNumber}
                  onChange={handleChange}
                  placeholder="PAN Number"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registration.registrationNumber"
                  value={formData.registration.registrationNumber}
                  onChange={handleChange}
                  placeholder="Registration Number"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">License Number</label>
                <input
                  type="text"
                  name="registration.licenseNumber"
                  value={formData.registration.licenseNumber}
                  onChange={handleChange}
                  placeholder="License Number"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tax ID</label>
                <input
                  type="text"
                  name="registration.taxId"
                  value={formData.registration.taxId}
                  onChange={handleChange}
                  placeholder="Tax ID"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Registration Date</label>
                <input
                  type="date"
                  name="registration.registrationDate"
                  value={formData.registration.registrationDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="registration.expiryDate"
                  value={formData.registration.expiryDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment & Banking</h3>
            
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Payment Methods Accepted</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["cash", "card", "upi", "netBanking", "wallet"].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`paymentMethods.${method}`}
                      checked={formData.paymentMethods[method]}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Bank Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Account Name</label>
                  <input
                    type="text"
                    name="bankDetails.accountName"
                    value={formData.bankDetails.accountName}
                    onChange={handleChange}
                    placeholder="Account Holder Name"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    placeholder="Account Number"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    placeholder="Bank Name"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleChange}
                    placeholder="IFSC Code"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Branch</label>
                  <input
                    type="text"
                    name="bankDetails.branch"
                    value={formData.bankDetails.branch}
                    onChange={handleChange}
                    placeholder="Branch Name"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">UPI ID</label>
                  <input
                    type="text"
                    name="bankDetails.upiId"
                    value={formData.bankDetails.upiId}
                    onChange={handleChange}
                    placeholder="example@upi"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">QR Code URL</label>
                  <input
                    type="text"
                    name="bankDetails.qrCode"
                    value={formData.bankDetails.qrCode}
                    onChange={handleChange}
                    placeholder="QR Code Image URL"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Capacity & Features</h3>
            
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Business Capacity</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    name="capacity.seatingCapacity"
                    value={formData.capacity.seatingCapacity}
                    onChange={handleChange}
                    placeholder="Number of seats"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Parking Spaces</label>
                  <input
                    type="number"
                    name="capacity.parkingSpaces"
                    value={formData.capacity.parkingSpaces}
                    onChange={handleChange}
                    placeholder="Number of parking spaces"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    name="capacity.numberOfRooms"
                    value={formData.capacity.numberOfRooms}
                    onChange={handleChange}
                    placeholder="Number of rooms"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Number of Floors</label>
                  <input
                    type="number"
                    name="capacity.numberOfFloors"
                    value={formData.capacity.numberOfFloors}
                    onChange={handleChange}
                    placeholder="Number of floors"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Total Area</label>
                  <input
                    type="text"
                    name="capacity.totalArea"
                    value={formData.capacity.totalArea}
                    onChange={handleChange}
                    placeholder="e.g., 1000 sq ft"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Features</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleArrayAdd("features", featureInput, setFeatureInput);
                    }
                  }}
                  placeholder="Add feature and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd("features", featureInput, setFeatureInput)}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("features", index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Amenities</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleArrayAdd("amenities", amenityInput, setAmenityInput);
                    }
                  }}
                  placeholder="Add amenity and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd("amenities", amenityInput, setAmenityInput)}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("amenities", index)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Hours & Settings</h3>
            
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Working Hours</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Opening Time</label>
                  <input
                    type="time"
                    name="settings.workingHours.open"
                    value={formData.settings.workingHours.open}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          workingHours: {
                            ...prev.settings.workingHours,
                            open: e.target.value,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Closing Time</label>
                  <input
                    type="time"
                    name="settings.workingHours.close"
                    value={formData.settings.workingHours.close}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          workingHours: {
                            ...prev.settings.workingHours,
                            close: e.target.value,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Working Days</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.settings.workingHours.days.includes(day)}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                workingHours: {
                                  ...prev.settings.workingHours,
                                  days: e.target.checked
                                    ? [...prev.settings.workingHours.days, day]
                                    : prev.settings.workingHours.days.filter((d) => d !== day),
                                },
                              },
                            }));
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-700 text-sm capitalize">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Currency</label>
                <select
                  name="settings.currency"
                  value={formData.settings.currency}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        currency: e.target.value,
                      },
                    }));
                  }}
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Timezone</label>
                <input
                  type="text"
                  name="settings.timezone"
                  value={formData.settings.timezone}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        timezone: e.target.value,
                      },
                    }));
                  }}
                  placeholder="Asia/Kolkata"
                  className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Settings</h3>
            
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">SEO Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Meta Title</label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO Meta Title"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Meta Description</label>
            <textarea
                    name="seo.metaDescription"
                    value={formData.seo.metaDescription}
              onChange={handleChange}
                    placeholder="SEO Meta Description"
              rows={3}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Keywords</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (keywordInput.trim()) {
                            setFormData((prev) => ({
                              ...prev,
                              seo: {
                                ...prev.seo,
                                keywords: [...(prev.seo?.keywords || []), keywordInput.trim()],
                              },
                            }));
                            setKeywordInput("");
                          }
                        }
                      }}
                      placeholder="Add keyword and press Enter"
                      className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (keywordInput.trim()) {
                          setFormData((prev) => ({
                            ...prev,
                            seo: {
                              ...prev.seo,
                              keywords: [...(prev.seo?.keywords || []), keywordInput.trim()],
                            },
                          }));
                          setKeywordInput("");
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.seo?.keywords || []).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              seo: {
                                ...prev.seo,
                                keywords: (prev.seo?.keywords || []).filter((_, i) => i !== index),
                              },
                            }));
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">OG Image URL</label>
                  <input
                    type="text"
                    name="seo.ogImage"
                    value={formData.seo.ogImage}
                    onChange={handleChange}
                    placeholder="Open Graph Image URL"
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
          </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Notification Preferences</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "emailNotifications",
                  "smsNotifications",
                  "whatsappNotifications",
                  "pushNotifications",
                ].map((pref) => (
                  <label key={pref} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`notificationPreferences.${pref}`}
                      checked={formData.notificationPreferences[pref]}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">
                      {pref.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Subscription</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Plan</label>
                  <select
                    name="subscription.plan"
                    value={formData.subscription.plan}
                    onChange={handleChange}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="subscription.startDate"
                    value={formData.subscription.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="subscription.endDate"
                    value={formData.subscription.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white  shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaStore /> Add New Business
            </h2>
            <p className="text-primary-100 mt-1">Fill in the details step by step</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between overflow-x-auto">
              {stepTitles.map((title, index) => {
                const Icon = stepIcons[index];
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                  <div
                    key={stepNum}
                    className={`flex flex-col items-center min-w-[80px] ${
                      isActive ? "text-primary-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? "border-primary-600 bg-primary-50"
                          : isCompleted
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      {isCompleted ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : (
                        <Icon />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block">{title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="min-h-[400px]">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2.5  font-medium transition-all ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaChevronLeft /> Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white  font-medium transition-all"
                >
                  Next <FaChevronRight />
                </button>
              ) : (
          <button
            type="submit"
            disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white  font-medium transition-all disabled:opacity-60"
          >
                  {loading ? "Creating..." : "Create Business"}
          </button>
              )}
            </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBusiness;
