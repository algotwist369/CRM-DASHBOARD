import React, { useEffect, useState } from "react";
import {
  FaStore,
  FaPhoneAlt,
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
import { useParams, useNavigate } from "react-router-dom";
import businessService from "../../../../services/admin/businessService";

const EditBusiness = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

    features: [],
    amenities: [],

    // Days Off & Holidays (New)
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
      // Appointment/Time Slot Settings
      appointmentSettings: {
        slotDuration: 30, // minutes
        bufferTime: 10, // minutes
        minAdvanceBookingHours: 1, // hours
        maxAdvanceBookingHours: 480, // 20 days in hours
        advanceBookingDays: 20, // days
        allowOnlineBooking: true,
        requireAdvancePayment: false,
        advancePaymentPercentage: 0,
        cancellationPolicy: {
          allowCancellation: true,
          minCancellationHours: 24,
          refundPercentage: 100,
        },
      },
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
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      pushNotifications: true,
    },

    // Custom Fields (New)
    customFields: [],
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [daysOffInput, setDaysOffInput] = useState("");
  const [holidayInput, setHolidayInput] = useState({ name: "", date: "", reason: "" });
  const [customFieldInput, setCustomFieldInput] = useState({ key: "", value: "", type: "text" });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const res = await businessService.getBusiness(id);
        const data = res?.data?.data || res?.data;

        if (data) {
          // Flatten/Populate data carefully to match formData structure
          // We need to ensure nested objects are merged correctly
          setFormData((prev) => ({
            ...prev,
            ...data,
            // Ensure nested objects are not overwritten by null/undefined if data missing
            images: { ...prev.images, ...data.images },
            socialMedia: { ...prev.socialMedia, ...data.socialMedia },
            registration: { ...prev.registration, ...data.registration },
            paymentMethods: { ...prev.paymentMethods, ...data.paymentMethods },
            bankDetails: { ...prev.bankDetails, ...data.bankDetails },
            capacity: { ...prev.capacity, ...data.capacity },
            settings: {
              ...prev.settings,
              ...data.settings,
              workingHours: { ...prev.settings.workingHours, ...(data.settings?.workingHours || {}) },
              appointmentSettings: {
                ...prev.settings.appointmentSettings,
                ...(data.settings?.appointmentSettings || {}),
                cancellationPolicy: {
                  ...prev.settings.appointmentSettings.cancellationPolicy,
                  ...(data.settings?.appointmentSettings?.cancellationPolicy || {})
                }
              }
            },
            seo: { ...prev.seo, ...data.seo },
            subscription: { ...prev.subscription, ...data.subscription },
            notifications: { ...prev.notifications, ...data.notifications },
            // Arrays
            tags: data.tags || [],
            specialties: data.specialties || [],
            languages: data.languages || [],
            features: data.features || [],
            amenities: data.amenities || [],
            daysOff: data.daysOff || [],
            holidays: data.holidays || [],
            customFields: data.customFields || [],
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch business details");
        navigate("/admin/businesses");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      // Support multi-level nesting (e.g., settings.appointmentSettings.slotDuration)
      const keys = name.split(".");

      setFormData((prev) => {
        const updated = { ...prev };
        let current = updated;

        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }

        // Set the final value
        current[keys[keys.length - 1]] = actualValue;

        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: actualValue }));
    }

    validateField(name, actualValue);
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

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          gallery: [...(prev.images.gallery || []), galleryInput.trim()],
        },
      }));
      setGalleryInput("");
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: prev.images.gallery.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddHoliday = () => {
    if (holidayInput.name && holidayInput.date) {
      setFormData((prev) => ({
        ...prev,
        holidays: [...prev.holidays, holidayInput],
      }));
      setHolidayInput({ name: "", date: "", reason: "" });
    }
  };

  const handleRemoveHoliday = (index) => {
    setFormData((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomField = () => {
    if (customFieldInput.key && customFieldInput.value) {
      setFormData((prev) => ({
        ...prev,
        customFields: [...prev.customFields, customFieldInput],
      }));
      setCustomFieldInput({ key: "", value: "", type: "text" });
    }
  };

  const handleRemoveCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
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

  // Helper to recursively clean empty values
  const cleanFormData = (data) => {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      const cleanedArray = data
        .map(cleanFormData)
        .filter((item) => item !== "" && item !== null && item !== undefined);
      return cleanedArray.length > 0 ? cleanedArray : undefined;
    }

    const cleanedObj = {};
    Object.keys(data).forEach((key) => {
      const value = cleanFormData(data[key]);
      if (value !== "" && value !== null && value !== undefined) {
        if (typeof value === "object" && Object.keys(value).length === 0) {
          return;
        }
        cleanedObj[key] = value;
      }
    });

    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      toast.error("Please fill required fields correctly");
      return;
    }

    try {
      setLoading(true);
      const cleanedData = cleanFormData(formData) || {};
      const res = await businessService.updateBusiness(id, cleanedData);

      if (res.success) {
        toast.success("Business updated successfully");
        navigate("/admin/businesses");
      } else {
        toast.error(res.error || "Failed to update business");
      }
    } catch (error) {
      toast.error("Failed to update business");
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
                className={`w-full border ${errors.type ? "border-red-500" : "border-gray-300"
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
                <FaPhoneAlt className="text-gray-400 mr-2" />
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
              <label className="block text-gray-700 font-medium mb-1">Gallery Images</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGalleryImage();
                    }
                  }}
                  placeholder="Add image URL and press Enter"
                  className="flex-1 border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {formData.images.gallery && formData.images.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.images.gallery.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 border border-gray-200 rounded overflow-hidden group"
                    >
                      <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Time Slot Configuration Section */}
            <div className="border-b pb-4 pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">
                ⏱️ Time Slot Configuration
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Configure how customers can book appointments online
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slot Duration */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Slot Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={formData.settings.appointmentSettings?.slotDuration || 30}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 30;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            slotDuration: value,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default time for each appointment slot (5-240 mins)
                  </p>
                </div>

                {/* Buffer Time */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Buffer Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="5"
                    value={formData.settings.appointmentSettings?.bufferTime || 10}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            bufferTime: value,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gap between consecutive appointments (0-120 mins)
                  </p>
                </div>

                {/* Min Advance Booking */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Minimum Advance Booking (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    step="0.5"
                    value={formData.settings.appointmentSettings?.minAdvanceBookingHours || 1}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            minAdvanceBookingHours: value,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How far ahead customers must book (0-72 hours)
                  </p>
                </div>

                {/* Max Advance Booking (in days for UX) */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Maximum Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={Math.round((formData.settings.appointmentSettings?.maxAdvanceBookingHours || 480) / 24)}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 1;
                      const hours = days * 24;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            maxAdvanceBookingHours: hours,
                            advanceBookingDays: days,
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum days in advance to allow bookings (1-90 days)
                  </p>
                </div>

                {/* Online Booking Toggle */}
                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.appointmentSettings?.allowOnlineBooking ?? true}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            appointmentSettings: {
                              ...prev.settings.appointmentSettings,
                              allowOnlineBooking: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">Allow Online Booking</span>
                      <p className="text-xs text-gray-500">
                        Enable customers to book appointments through your public booking page
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Section */}
            <div className="border-b pb-4 pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">
                ❌ Cancellation Policy
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Set rules for appointment cancellations and refunds
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Allow Cancellation Toggle */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.appointmentSettings?.cancellationPolicy?.allowCancellation ?? true}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            appointmentSettings: {
                              ...prev.settings.appointmentSettings,
                              cancellationPolicy: {
                                ...prev.settings.appointmentSettings.cancellationPolicy,
                                allowCancellation: e.target.checked,
                              },
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">Allow Customers to Cancel Appointments</span>
                      <p className="text-xs text-gray-500">
                        Permit customers to cancel their bookings
                      </p>
                    </div>
                  </label>
                </div>

                {/* Minimum Cancellation Hours */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Minimum Cancellation Notice (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.settings.appointmentSettings?.cancellationPolicy?.minCancellationHours || 24}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            cancellationPolicy: {
                              ...prev.settings.appointmentSettings.cancellationPolicy,
                              minCancellationHours: value,
                            },
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!formData.settings.appointmentSettings?.cancellationPolicy?.allowCancellation}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required notice before appointment (1-168 hours)
                  </p>
                </div>

                {/* Refund Percentage */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Refund Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="10"
                    value={formData.settings.appointmentSettings?.cancellationPolicy?.refundPercentage || 100}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          appointmentSettings: {
                            ...prev.settings.appointmentSettings,
                            cancellationPolicy: {
                              ...prev.settings.appointmentSettings.cancellationPolicy,
                              refundPercentage: value,
                            },
                          },
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!formData.settings.appointmentSettings?.cancellationPolicy?.allowCancellation}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage ref und for cancellations (0-100%)
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 pt-4">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Days Off & Holidays</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Days Off (Closed Dates)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="date"
                      value={daysOffInput}
                      onChange={(e) => setDaysOffInput(e.target.value)}
                      className="flex-1 border border-gray-300 p-2.5 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayAdd("daysOff", daysOffInput, setDaysOffInput)}
                      className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.daysOff.map((date, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2">
                        {date}
                        <button
                          type="button"
                          onClick={() => handleArrayRemove("daysOff", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Holidays</label>
                  <div className="space-y-2 mb-2 border border-gray-200 p-3 rounded bg-gray-50">
                    <input
                      type="text"
                      placeholder="Holiday Name"
                      value={holidayInput.name}
                      onChange={(e) => setHolidayInput(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 p-2 text-sm mb-2"
                    />
                    <input
                      type="date"
                      value={holidayInput.date}
                      onChange={(e) => setHolidayInput(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-300 p-2 text-sm mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Reason (Optional)"
                      value={holidayInput.reason}
                      onChange={(e) => setHolidayInput(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full border border-gray-300 p-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddHoliday}
                      className="w-full py-2 bg-primary-600 text-white text-sm mt-1 hover:bg-primary-700"
                    >
                      Add Holiday
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {formData.holidays.map((h, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded text-sm">
                        <div>
                          <p className="font-semibold">{h.name}</p>
                          <p className="text-gray-500 text-xs">{h.date} {h.reason && `- ${h.reason}`}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveHoliday(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
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
                      name={`notifications.${pref}`}
                      checked={formData.notifications[pref]}
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
              <h4 className="text-lg font-medium text-gray-700 mb-3">Custom Fields</h4>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 items-end border border-gray-200 p-3 rounded bg-gray-50">
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs text-gray-500">Key (Label)</label>
                    <input
                      type="text"
                      value={customFieldInput.key}
                      onChange={(e) => setCustomFieldInput(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g. GST Enabled"
                      className="w-full border border-gray-300 p-2 text-sm"
                    />
                  </div>
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs text-gray-500">Value</label>
                    <input
                      type="text"
                      value={customFieldInput.value}
                      onChange={(e) => setCustomFieldInput(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g. Yes"
                      className="w-full border border-gray-300 p-2 text-sm"
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="text-xs text-gray-500">Type</label>
                    <select
                      value={customFieldInput.type}
                      onChange={(e) => setCustomFieldInput(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border border-gray-300 p-2 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-4 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700 w-full sm:w-auto h-[38px]"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.customFields.map((field, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-100 p-2 px-3 rounded text-sm border border-gray-200">
                      <div className="flex gap-4">
                        <span className="font-semibold text-gray-700">{field.key}:</span>
                        <span>{field.value.toString()}</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500 self-center">{field.type}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
                    value={formData.subscription.startDate ? formData.subscription.startDate.split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300  p-2.5 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="subscription.endDate"
                    value={formData.subscription.endDate ? formData.subscription.endDate.split('T')[0] : ''}
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/businesses")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaChevronLeft className="mr-2" />
            Back to Businesses
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-100 h-2">
            <div
              className="bg-primary-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Sidebar Steps */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200 p-4 hidden md:block">
              <div className="space-y-1">
                {stepTitles.map((title, index) => {
                  const StepIcon = stepIcons[index];
                  const stepNum = index + 1;
                  const isActive = stepNum === currentStep;
                  const isCompleted = stepNum < currentStep;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (stepNum < currentStep || validateStep(currentStep)) {
                          setCurrentStep(stepNum);
                        } else {
                          toast.error("Please complete current step");
                        }
                      }}
                      className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-primary-50 text-primary-700"
                        : isCompleted
                          ? "text-green-600 hover:bg-gray-100"
                          : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                      <StepIcon
                        className={`mr-3 ${isActive
                          ? "text-primary-600"
                          : isCompleted
                            ? "text-green-500"
                            : "text-gray-400"
                          }`}
                      />
                      <span className="text-left">{title}</span>
                      {isCompleted && <FaCheckCircle className="ml-auto text-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <FaChevronLeft className="mr-2" />
                    Previous
                  </button>

                  <div className="flex gap-3">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Next
                        <FaChevronRight className="ml-2" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loading ? "Updating..." : "Update Business"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default EditBusiness;
