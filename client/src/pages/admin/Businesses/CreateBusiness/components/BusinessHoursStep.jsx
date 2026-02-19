import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import { FormCheckboxGroup } from "../../../../../components/forms/FormCheckbox/FormCheckbox";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";

const BusinessHoursStep = ({ formData, handleChange, handleArrayAdd, handleArrayRemove, handleAddHoliday, handleRemoveHoliday, holidayInput, setHolidayInput }) => {
    const daysOptions = [
        { label: "Mon", value: "monday" },
        { label: "Tue", value: "tuesday" },
        { label: "Wed", value: "wednesday" },
        { label: "Thu", value: "thursday" },
        { label: "Fri", value: "friday" },
        { label: "Sat", value: "saturday" },
        { label: "Sun", value: "sunday" }
    ];

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Operations</h2>
                <p className="text-secondary-500 font-medium">Define your standard operating schedule and specific closures.</p>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Regular Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <FormField
                            label="Opening Time"
                            name="settings.workingHours.open"
                            type="time"
                            value={formData.settings.workingHours.open}
                            onChange={(val) => handleChange({ target: { name: "settings.workingHours.open", value: val } })}
                        />
                        <FormField
                            label="Closing Time"
                            name="settings.workingHours.close"
                            type="time"
                            value={formData.settings.workingHours.close}
                            onChange={(val) => handleChange({ target: { name: "settings.workingHours.close", value: val } })}
                        />
                    </div>
                    <div className="p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                        <FormCheckboxGroup
                            label="Working Days"
                            name="settings.workingHours.days"
                            options={daysOptions}
                            value={formData.settings.workingHours.days}
                            onChange={(val) => handleChange({ target: { name: "settings.workingHours.days", value: val } })}
                            direction="horizontal"
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <MultiInput
                        label="Weekly Off Days"
                        value={formData.daysOff}
                        onChange={(val) => handleArrayAdd("daysOff", val)}
                        onRemove={(idx) => handleArrayRemove("daysOff", idx)}
                        placeholder="e.g. Sunday"
                        badgeColor="bg-red-50 text-red-700 border-red-200"
                    />

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-secondary-700">Planned Holidays</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Holiday Name"
                                value={holidayInput.name}
                                onChange={(e) => setHolidayInput({ ...holidayInput, name: e.target.value })}
                                className="flex-1 px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none text-sm"
                            />
                            <input
                                type="date"
                                value={holidayInput.date}
                                onChange={(e) => setHolidayInput({ ...holidayInput, date: e.target.value })}
                                className="w-32 px-3 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddHoliday}
                                className="px-4 py-2 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {formData.holidays.map((h, i) => (
                                <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-secondary-200 rounded-lg text-xs font-bold text-secondary-700 shadow-sm">
                                    {h.name} - {new Date(h.date).toLocaleDateString()}
                                    <button type="button" onClick={() => handleRemoveHoliday(i)} className="text-secondary-400 hover:text-red-500 text-sm ml-1">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessHoursStep;
