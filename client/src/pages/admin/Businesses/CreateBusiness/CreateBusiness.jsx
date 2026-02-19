import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import businessService from "../../../../services/admin/businessService";
import { Button } from "../../../../../../../ankit pathak/PM_A/client/src/components/common";
import useBusinessForm from "../../../../hooks/business/useBusinessForm";

// Step Components
import BasicInfoStep from "./components/BasicInfoStep";
import LocationContactStep from "./components/LocationContactStep";
import CategoryTagsStep from "./components/CategoryTagsStep";
import MediaSocialStep from "./components/MediaSocialStep";
import LegalRegistrationStep from "./components/LegalRegistrationStep";
import PaymentBankingStep from "./components/PaymentBankingStep";
import CapacityFeaturesStep from "./components/CapacityFeaturesStep";
import BusinessHoursStep from "./components/BusinessHoursStep";
import AdditionalSettingsStep from "./components/AdditionalSettingsStep";
import AppointmentSettingsStep from "./components/AppointmentSettingsStep";

const INITIAL_STATE = {
  type: "", name: "", branch: "", description: "",
  address: "", city: "", state: "", country: "India", zipCode: "",
  phone: "", alternatePhone: "", email: "", website: "", googleMapsUrl: "",
  category: "", subCategory: "", tags: [], specialties: [], languages: [],
  google360ImageUrl: [],
  videos: [],
  images: { logo: "", banner: "", thumbnail: "", gallery: [] },
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

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [holidayInput, setHolidayInput] = useState({ name: "", date: "" });
  const [customFieldInput, setCustomFieldInput] = useState({ key: "", value: "" });

  const {
    formData,
    errors,
    setErrors,
    handleChange,
    handleArrayAdd,
    handleArrayRemove,
    setNestedValue,
    clearForm
  } = useBusinessForm(INITIAL_STATE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.type) newErrors.type = "Required";
      if (!formData.name) newErrors.name = "Required";
    }
    if (step === 2) {
      if (!formData.address) newErrors.address = "Required";
      if (!formData.phone) newErrors.phone = "Required";
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
      const res = await businessService.createBusiness(formData);
      if (res.success) {
        toast.success("Business Created!");
        clearForm();
        navigate("/admin/businesses");
      }
    } catch (e) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };


  const stepProps = { formData, errors, handleChange, handleArrayAdd, handleArrayRemove, setNestedValue };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary-900">Create Business</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
          {currentStep === STEPS.length ? (
            <Button size="sm" loading={loading} onClick={handleSubmit}>Publish</Button>
          ) : (
            <Button size="sm" onClick={handleNext}>Continue</Button>
          )}
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
                  onClick={() => done && setCurrentStep(step.id)}
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

            {/* Simple Dynamic Navigation Controls */}
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-secondary-200">
              <button
                onClick={() => setCurrentStep(p => p - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 text-secondary-600 font-bold hover:text-primary-600 disabled:opacity-0 transition-all"
              >
                <FaChevronLeft /> Back
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-all"
                >
                  Continue
                </button>
              ) : (
                <Button loading={loading} onClick={handleSubmit} className="px-10">Launch Business</Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateBusiness;
