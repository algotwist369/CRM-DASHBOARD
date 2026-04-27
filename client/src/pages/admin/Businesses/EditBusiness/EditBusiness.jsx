import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import businessService from "../../../../services/admin/businessService";
import { Button } from "../../../../components/common"; 
import useBusinessForm from "../../../../hooks/business/useBusinessForm";

// Step Components (Reused from CreateBusiness)
import BasicInfoStep from "../CreateBusiness/components/BasicInfoStep";
import LocationContactStep from "../CreateBusiness/components/LocationContactStep";
import CategoryTagsStep from "../CreateBusiness/components/CategoryTagsStep";
import MediaSocialStep from "../CreateBusiness/components/MediaSocialStep";
import LegalRegistrationStep from "../CreateBusiness/components/LegalRegistrationStep";
import PaymentBankingStep from "../CreateBusiness/components/PaymentBankingStep";
import CapacityFeaturesStep from "../CreateBusiness/components/CapacityFeaturesStep";
import BusinessHoursStep from "../CreateBusiness/components/BusinessHoursStep";
import AppointmentSettingsStep from "../CreateBusiness/components/AppointmentSettingsStep";
import AdditionalSettingsStep from "../CreateBusiness/components/AdditionalSettingsStep";

const INITIAL_STATE = {
  type: "", name: "", branch: "", description: "",
  address: "", city: "", state: "", country: "India", zipCode: "",
  phone: "", alternatePhone: "", email: "", website: "", googleMapsUrl: "",
  category: "", subCategory: "", tags: [], specialties: [], languages: [],
  google360ImageUrl: [],
  images: { logo: "", banner: "", thumbnail: "", gallery: [] },
  files: { logo: null, banner: null, thumbnail: null, gallery: [] },
  socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "", whatsapp: "", telegram: "" },
  registration: { gstNumber: "", panNumber: "", registrationNumber: "", licenseNumber: "", taxId: "", registrationDate: "", expiryDate: "" },
  paymentMethods: { cash: true, card: false, upi: false, netBanking: false, wallet: false },
  bankDetails: { accountName: "", accountNumber: "", bankName: "", ifscCode: "", branch: "", upiId: "", qrCode: "" },
  capacity: { seatingCapacity: "", parkingSpaces: "", numberOfRooms: "", numberOfFloors: "", totalArea: "" },
  features: [], amenities: [], daysOff: [], holidays: [],
  settings: {
    workingHours: { open: "09:00", close: "18:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] },
    currency: "INR",
    timezone: "Asia/Kolkata",
    appointmentSettings: {
      advanceBookingDays: 10,
      minAdvanceBookingHours: 1,
      maxAdvanceBookingHours: 480,
      slotDuration: 30,
      bufferTime: 15,
      allowOnlineBooking: true,
      requireAdvancePayment: false,
      advancePaymentPercentage: 0,
      cancellationPolicy: {
        allowCancellation: true,
        minCancellationHours: 24,
        refundPercentage: 100
      },
      reminderSettings: {
        sendSMSReminder: false,
        sendEmailReminder: false,
        sendWhatsappReminder: true,
        reminderHours: 24
      }
    }
  },
  seo: { metaTitle: "", metaDescription: "", keywords: [], ogImage: "" },
  subscription: { plan: "free", startDate: "", endDate: "", isActive: true, features: [] },
  notificationPreferences: { emailNotifications: true, smsNotifications: false, whatsappNotifications: false, pushNotifications: true },
  customFields: []
};

const STEPS = [
  { id: 1, title: "Identity", sub: "Basic business info" },
  { id: 2, title: "Location", sub: "Where to find you" },
  { id: 3, title: "Category", sub: "Services & Tags" },
  { id: 4, title: "Media", sub: "Social & Images" },
  { id: 5, title: "Legal", sub: "Tax & Compliance" },
  { id: 6, title: "Finance", sub: "Banking & Payments" },
  { id: 7, title: "Facility", sub: "Space & Features" },
  { id: 8, title: "Operations", sub: "Hours & Schedule" },
  { id: 9, title: "Appointments", sub: "Booking Rules" },
  { id: 10, title: "Advanced", sub: "SEO & Custom" }
];

const EditBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [holidayInput, setHolidayInput] = useState({ name: "", date: "" });
  const [customFieldInput, setCustomFieldInput] = useState({ key: "", value: "" });

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleArrayAdd,
    handleArrayRemove,
    setNestedValue,
    handleFileChange,
    handleFileRemove
  } = useBusinessForm(INITIAL_STATE, null); // No localStorage for Edit

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setFetching(true);
        const res = await businessService.getBusiness(id);
        const data = res?.data?.data || res?.data;
        if (data) {
          // Merge data with initial state to ensure structure
          setFormData(prev => ({
            ...prev,
            ...data,
            settings: {
              ...prev.settings,
              ...(data.settings || {}),
              workingHours: { ...prev.settings.workingHours, ...(data.settings?.workingHours || {}) },
              appointmentSettings: {
                ...prev.settings.appointmentSettings,
                ...(data.settings?.appointmentSettings || {}),
                cancellationPolicy: { ...prev.settings.appointmentSettings.cancellationPolicy, ...(data.settings?.appointmentSettings?.cancellationPolicy || {}) },
                reminderSettings: { ...prev.settings.appointmentSettings.reminderSettings, ...(data.settings?.appointmentSettings?.reminderSettings || {}) }
              }
            },
            images: { ...prev.images, ...(data.images || {}) },
            files: { ...prev.files }, // Reset files on fetch
            socialMedia: { ...prev.socialMedia, ...(data.socialMedia || {}) },
            registration: { ...prev.registration, ...(data.registration || {}) },
            paymentMethods: { ...prev.paymentMethods, ...(data.paymentMethods || {}) },
            bankDetails: { ...prev.bankDetails, ...(data.bankDetails || {}) },
            capacity: { ...prev.capacity, ...(data.capacity || {}) },
            seo: { ...prev.seo, ...(data.seo || {}) },
            notificationPreferences: { ...prev.notificationPreferences, ...(data.notificationPreferences || {}) }
          }));
        }
      } catch (e) {
        toast.error("Failed to load business data");
      } finally {
        setFetching(false);
      }
    };
    fetchBusiness();
  }, [id, setFormData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.type) newErrors.type = "Required";
      if (!formData.name) newErrors.name = "Required";
      if (!formData.branch) newErrors.branch = "Required";
    }
    if (step === 2) {
      if (!formData.address) newErrors.address = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.state) newErrors.state = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(p => Math.min(STEPS.length, p + 1));
    else toast.error("Required fields missing");
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) return;
    try {
      setLoading(true);

      // Check if there are any files to upload
      const hasFiles = formData.files && (
        formData.files.logo ||
        formData.files.banner ||
        formData.files.thumbnail ||
        (formData.files.gallery && formData.files.gallery.length > 0)
      );

      let payload;
      if (hasFiles) {
        payload = new FormData();
        
        // Append all data except files as stringified JSON if they are objects - skip empty data
        const { files, ...restData } = formData;
        
        Object.keys(restData).forEach(key => {
          const value = restData[key];
          
          // Skip null or undefined
          if (value === null || value === undefined) return;

          // Handle Arrays
          if (Array.isArray(value)) {
            if (value.length > 0) {
              payload.append(key, JSON.stringify(value));
            }
            return;
          }

          // Handle Objects
          if (typeof value === 'object' && !(value instanceof Date)) {
            // Check if object has any non-empty values
            const hasData = Object.values(value).some(v => v !== "" && v !== null && v !== undefined);
            if (hasData) {
              payload.append(key, JSON.stringify(value));
            }
            return;
          }

          // Handle Primitives
          if (value !== "") {
            payload.append(key, value);
          }
        });

        // Append files
        if (files.logo) payload.append("logo", files.logo);
        if (files.banner) payload.append("banner", files.banner);
        if (files.thumbnail) payload.append("thumbnail", files.thumbnail);
        if (files.gallery && files.gallery.length > 0) {
          files.gallery.forEach(file => payload.append("gallery", file));
        }
      } else {
        payload = formData;
      }

      const res = await businessService.updateBusiness(id, payload);
      if (res.success) {
        toast.success("Business Updated!");
        navigate("/admin/businesses");
      }
    } catch (e) {
      console.error("Update error:", e);
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-secondary-500 font-bold">Loading business details...</p>
      </div>
    </div>
  );

  const stepProps = { formData, errors, handleChange, handleArrayAdd, handleArrayRemove, setNestedValue, handleFileChange, handleFileRemove };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary-900">Edit Business</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
          <Button size="sm" loading={loading} onClick={handleSubmit}>Save Changes</Button>
        </div>
      </div>

      <div className="flex max-w-[1400px] mx-auto min-h-[calc(100vh-72px)]">
        {/* Simple Sidebar Navigation */}
        <aside className="w-80 bg-white border-r border-secondary-200 p-8 hidden lg:block">
          <div className="space-y-1">
            {STEPS.map((step) => {
              const active = currentStep === step.id;
              const done = currentStep > step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => (done || validateStep(currentStep)) && setCurrentStep(step.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${active ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${active ? 'border-primary-500 bg-white' : done ? 'border-primary-500 bg-primary-500 text-white' : 'border-secondary-200'}`}>
                    {done ? <FaCheck size={12} /> : step.id}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${active ? 'text-primary-900' : 'text-secondary-600'}`}>{step.title}</p>
                    <p className="text-[11px] uppercase tracking-wider font-semibold opacity-60">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {currentStep === 1 && <BasicInfoStep {...stepProps} />}
            {currentStep === 2 && <LocationContactStep {...stepProps} />}
            {currentStep === 3 && <CategoryTagsStep {...stepProps} />}
            {currentStep === 4 && <MediaSocialStep {...stepProps} />}
            {currentStep === 5 && <LegalRegistrationStep {...stepProps} />}
            {currentStep === 6 && <PaymentBankingStep {...stepProps} />}
            {currentStep === 7 && <CapacityFeaturesStep {...stepProps} />}
            {currentStep === 8 && (
              <BusinessHoursStep
                {...stepProps}
                holidayInput={holidayInput}
                setHolidayInput={setHolidayInput}
                handleAddHoliday={() => {
                  if (holidayInput.name && holidayInput.date) {
                    handleArrayAdd("holidays", holidayInput);
                    setHolidayInput({ name: "", date: "" });
                  }
                }}
                handleRemoveHoliday={(i) => handleArrayRemove("holidays", i)}
              />
            )}
            {currentStep === 9 && <AppointmentSettingsStep {...stepProps} />}
            {currentStep === 10 && (
              <AdditionalSettingsStep
                {...stepProps}
                customFieldInput={customFieldInput}
                setCustomFieldInput={setCustomFieldInput}
                handleAddCustomField={() => {
                  if (customFieldInput.key && customFieldInput.value) {
                    handleArrayAdd("customFields", customFieldInput);
                    setCustomFieldInput({ key: "", value: "" });
                  }
                }}
                handleRemoveCustomField={(i) => handleArrayRemove("customFields", i)}
              />
            )}

            {/* Navigation Controls */}
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-secondary-200">
              <button
                onClick={() => setCurrentStep(p => p - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 text-secondary-600 font-bold hover:text-primary-600 disabled:opacity-0 transition-all"
              >
                Back
              </button>

              <div className="flex gap-4">
                {currentStep < STEPS.length ? (
                  <button
                    onClick={handleNext}
                    className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-all"
                  >
                    Continue
                  </button>
                ) : (
                  <Button loading={loading} onClick={handleSubmit} className="px-10">Save Changes</Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditBusiness;
