import React from "react";
import FormSelect from "../../../../../components/forms/FormSelect/FormSelect";
import FormField from "../../../../../components/forms/FormField/FormField";
import FormTextArea from "../../../../../components/forms/FormTextArea/FormTextArea";

const PLACEHOLDERS = {
    spa: {
        name: "e.g. Tranquil Zen Spa",
        branch: "e.g. South Extension",
        description: "Experience deep relaxation with our premium aromatherapy and therapeutic massages..."
    },
    salon: {
        name: "e.g. Urban Edge Salon",
        branch: "e.g. Main Market",
        description: "Expert hair styling, grooming, and personal care services for a modern look..."
    },
    beauty: {
        name: "e.g. Radiant Glow Beauty Studio",
        branch: "e.g. Sky Mall",
        description: "Professional skincare, makeup, and beauty treatments to enhance your natural glow..."
    },
    default: {
        name: "e.g. Business Name",
        branch: "e.g. Downtown SF",
        description: "Tell your customers what makes your business unique..."
    }
};

const BasicInfoStep = ({ formData, errors, handleChange }) => {
    const businessTypes = [
        { value: "", label: "Select Category" },
        { value: "spa", label: "Spa & Wellness" },
        { value: "salon", label: "Salon & Grooming" },
        { value: "beauty", label: "Beauty & Personal Care" },
    ];

    const placeholders = PLACEHOLDERS[formData.type] || PLACEHOLDERS.default;

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Identity</h2>
                <p className="text-secondary-500 font-medium">Define clear and accurate information about your business instance.</p>
            </div>

            <div className="space-y-8">
                <FormSelect
                    label="Business Category Type"
                    name="type"
                    value={formData.type}
                    onChange={(val) => handleChange({ target: { name: "type", value: val } })}
                    options={businessTypes}
                    required
                    error={errors.type}
                    placeholder="What type of business is this?"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <FormField
                        label="Formal Business Name"
                        name="name"
                        value={formData.name}
                        onChange={(val) => handleChange({ target: { name: "name", value: val } })}
                        placeholder={placeholders.name}
                        required
                        error={errors.name}
                    />

                    <FormField
                        label="Branch / Location Name"
                        name="branch"
                        value={formData.branch}
                        onChange={(val) => handleChange({ target: { name: "branch", value: val } })}
                        placeholder={placeholders.branch}
                        required
                        error={errors.branch}
                    />
                </div>

                <FormTextArea
                    label="Public Description"
                    name="description"
                    value={formData.description}
                    onChange={(val) => handleChange({ target: { name: "description", value: val } })}
                    placeholder={placeholders.description}
                    rows={5}
                />
            </div>
        </div>
    );
};

export default BasicInfoStep;
