import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import { FormCheckboxGroup } from "../../../../../components/forms/FormCheckbox/FormCheckbox";

const AppointmentSettingsStep = ({ formData, handleChange }) => {
    const reminderOptions = [
        { label: "SMS Reminder", value: "sendSMSReminder" },
        { label: "Email Reminder", value: "sendEmailReminder" },
        { label: "WhatsApp Reminder", value: "sendWhatsappReminder" }
    ];

    const handleReminderChange = (selectedValues) => {
        const updated = {
            ...formData.settings.appointmentSettings.reminderSettings,
            sendSMSReminder: selectedValues.includes("sendSMSReminder"),
            sendEmailReminder: selectedValues.includes("sendEmailReminder"),
            sendWhatsappReminder: selectedValues.includes("sendWhatsappReminder")
        };
        handleChange({ target: { name: "settings.appointmentSettings.reminderSettings", value: updated } });
    };

    const activeReminders = Object.keys(formData.settings.appointmentSettings.reminderSettings).filter(
        k => formData.settings.appointmentSettings.reminderSettings[k] === true
    );

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Appointments</h2>
                <p className="text-secondary-500 font-medium">Configure how customers book and cancel appointments.</p>
            </div>

            <div className="space-y-10">
                {/* Booking Rules */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Booking Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            label="Slot Duration (Minutes)"
                            name="settings.appointmentSettings.slotDuration"
                            type="number"
                            value={formData.settings.appointmentSettings.slotDuration}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.slotDuration", value: parseInt(val) } })}
                            helperText="Standard time per service slot."
                        />
                        <FormField
                            label="Buffer Time (Minutes)"
                            name="settings.appointmentSettings.bufferTime"
                            type="number"
                            value={formData.settings.appointmentSettings.bufferTime}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.bufferTime", value: parseInt(val) } })}
                            helperText="Gap between bookings."
                        />
                        <FormField
                            label="Min Advance Booking (Hours)"
                            name="settings.appointmentSettings.minAdvanceBookingHours"
                            type="number"
                            value={formData.settings.appointmentSettings.minAdvanceBookingHours}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.minAdvanceBookingHours", value: parseInt(val) } })}
                        />
                        <FormField
                            label="Max Advance Booking (Days)"
                            name="settings.appointmentSettings.advanceBookingDays"
                            type="number"
                            value={formData.settings.appointmentSettings.advanceBookingDays}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.advanceBookingDays", value: parseInt(val) } })}
                        />
                    </div>
                </div>

                {/* Online Capabilities */}
                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Online Capability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <label className="flex items-center gap-4 p-4 bg-secondary-50 rounded-2xl border border-secondary-200 cursor-pointer">
                            <input
                                type="checkbox"
                                name="settings.appointmentSettings.allowOnlineBooking"
                                checked={formData.settings.appointmentSettings.allowOnlineBooking}
                                onChange={(e) => handleChange({ target: { name: "settings.appointmentSettings.allowOnlineBooking", value: e.target.checked } })}
                                className="w-5 h-5 text-primary-500 rounded"
                            />
                            <div>
                                <span className="block font-bold text-secondary-900">Enable Online Bookings</span>
                                <span className="text-xs text-secondary-500">Allow customers to book via your link.</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-4 p-4 bg-secondary-50 rounded-2xl border border-secondary-200 cursor-pointer">
                            <input
                                type="checkbox"
                                name="settings.appointmentSettings.requireAdvancePayment"
                                checked={formData.settings.appointmentSettings.requireAdvancePayment}
                                onChange={(e) => handleChange({ target: { name: "settings.appointmentSettings.requireAdvancePayment", value: e.target.checked } })}
                                className="w-5 h-5 text-primary-500 rounded"
                            />
                            <div>
                                <span className="block font-bold text-secondary-900">Require Pre-payment</span>
                                <span className="text-xs text-secondary-500">Collect partial payment upfront.</span>
                            </div>
                        </label>
                    </div>
                    {formData.settings.appointmentSettings.requireAdvancePayment && (
                        <div className="mt-4 max-w-xs">
                            <FormField
                                label="Payment Percentage (%)"
                                name="settings.appointmentSettings.advancePaymentPercentage"
                                type="number"
                                value={formData.settings.appointmentSettings.advancePaymentPercentage}
                                onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.advancePaymentPercentage", value: parseInt(val) } })}
                            />
                        </div>
                    )}
                </div>

                {/* Cancellation Policy */}
                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Cancellation Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <label className="flex items-center gap-4 p-4 bg-secondary-50 rounded-2xl border border-secondary-200 cursor-pointer">
                            <input
                                type="checkbox"
                                name="settings.appointmentSettings.cancellationPolicy.allowCancellation"
                                checked={formData.settings.appointmentSettings.cancellationPolicy.allowCancellation}
                                onChange={(e) => handleChange({ target: { name: "settings.appointmentSettings.cancellationPolicy.allowCancellation", value: e.target.checked } })}
                                className="w-5 h-5 text-primary-500 rounded"
                            />
                            <span className="font-bold text-secondary-900">Allow Cancellation</span>
                        </label>
                        <FormField
                            label="Notice Required (Hours)"
                            name="settings.appointmentSettings.cancellationPolicy.minCancellationHours"
                            type="number"
                            value={formData.settings.appointmentSettings.cancellationPolicy.minCancellationHours}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.cancellationPolicy.minCancellationHours", value: parseInt(val) } })}
                            disabled={!formData.settings.appointmentSettings.cancellationPolicy.allowCancellation}
                        />
                        <FormField
                            label="Refund Percentage (%)"
                            name="settings.appointmentSettings.cancellationPolicy.refundPercentage"
                            type="number"
                            value={formData.settings.appointmentSettings.cancellationPolicy.refundPercentage}
                            onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.cancellationPolicy.refundPercentage", value: parseInt(val) } })}
                            disabled={!formData.settings.appointmentSettings.cancellationPolicy.allowCancellation}
                        />
                    </div>
                </div>

                {/* Reminders */}
                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Communication</h3>
                    <div className="space-y-6">
                        <div className="p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                            <FormCheckboxGroup
                                label="Automated Reminders"
                                name="reminderSettings"
                                options={reminderOptions}
                                value={activeReminders}
                                onChange={handleReminderChange}
                                direction="horizontal"
                            />
                        </div>
                        <div className="max-w-xs">
                            <FormField
                                label="Lead Time (Hours)"
                                name="settings.appointmentSettings.reminderSettings.reminderHours"
                                type="number"
                                value={formData.settings.appointmentSettings.reminderSettings.reminderHours}
                                onChange={(val) => handleChange({ target: { name: "settings.appointmentSettings.reminderSettings.reminderHours", value: parseInt(val) } })}
                                helperText="Send reminder X hours before."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentSettingsStep;
