import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import FormTextArea from "../../../../../components/forms/FormTextArea/FormTextArea";
import { FormCheckboxGroup } from "../../../../../components/forms/FormCheckbox/FormCheckbox";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";

const AdditionalSettingsStep = ({
    formData,
    handleChange,
    handleArrayAdd,
    handleArrayRemove,
    handleAddCustomField,
    handleRemoveCustomField,
    customFieldInput,
    setCustomFieldInput
}) => {
    const notificationOptions = [
        { label: "Email", value: "emailNotifications" },
        { label: "SMS", value: "smsNotifications" },
        { label: "WhatsApp", value: "whatsappNotifications" },
        { label: "Push", value: "pushNotifications" }
    ];

    const handleNotifChange = (selectedValues) => {
        const updated = {
            emailNotifications: selectedValues.includes("emailNotifications"),
            smsNotifications: selectedValues.includes("smsNotifications"),
            whatsappNotifications: selectedValues.includes("whatsappNotifications"),
            pushNotifications: selectedValues.includes("pushNotifications")
        };
        handleChange({ target: { name: "notificationPreferences", value: updated } });
    };

    const activeNotifs = Object.keys(formData.notificationPreferences).filter(k => formData.notificationPreferences[k]);

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Advanced</h2>
                <p className="text-secondary-500 font-medium">Fine-tune SEO, communication habits, and custom data points.</p>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">SEO & Visibility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            label="Meta Page Title"
                            name="seo.metaTitle"
                            value={formData.seo.metaTitle}
                            onChange={(val) => handleChange({ target: { name: "seo.metaTitle", value: val } })}
                            placeholder="Primary search result title"
                        />
                        <FormField
                            label="Social (OG) Image URL"
                            name="seo.ogImage"
                            value={formData.seo.ogImage}
                            onChange={(val) => handleChange({ target: { name: "seo.ogImage", value: val } })}
                            placeholder="Thumbnail for link sharing"
                        />
                    </div>
                    <div className="mt-8 space-y-6">
                        <MultiInput
                            label="SEO Keywords"
                            value={formData.seo.keywords}
                            onChange={(val) => handleArrayAdd("seo.keywords", val)}
                            onRemove={(idx) => handleArrayRemove("seo.keywords", idx)}
                            placeholder="Press Enter to add tag"
                        />
                        <FormTextArea
                            label="SEO Meta Description"
                            name="seo.metaDescription"
                            value={formData.seo.metaDescription}
                            onChange={(val) => handleChange({ target: { name: "seo.metaDescription", value: val } })}
                            placeholder="Brief summary for search indexing..."
                            rows={2}
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Direct Notifications</h3>
                    <div className="p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                        <FormCheckboxGroup
                            name="notificationPreferences"
                            options={notificationOptions}
                            value={activeNotifs}
                            onChange={handleNotifChange}
                            direction="horizontal"
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Custom Metadata</h3>
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Property Key"
                            value={customFieldInput.key}
                            onChange={(e) => setCustomFieldInput({ ...customFieldInput, key: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={customFieldInput.value}
                            onChange={(e) => setCustomFieldInput({ ...customFieldInput, value: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-secondary-200 focus:border-primary-500 outline-none text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomField}
                            className="px-6 py-2 bg-secondary-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                        >
                            Append
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.customFields.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-secondary-200 rounded-xl shadow-sm">
                                <div>
                                    <span className="font-bold text-secondary-400 uppercase text-[10px] block mb-1 tracking-wider">{f.key}</span>
                                    <span className="text-secondary-900 font-semibold">{f.value}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveCustomField(i)} className="text-secondary-300 hover:text-red-500">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalSettingsStep;
