import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";

const CategoryTagsStep = ({ formData, errors, handleChange, handleArrayAdd, handleArrayRemove }) => {
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Service Details</h2>
                <p className="text-secondary-500 font-medium">Categorize your business and add keywords for better discovery.</p>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Primary Category"
                        name="category"
                        value={formData.category}
                        onChange={(val) => handleChange({ target: { name: "category", value: val } })}
                        placeholder="e.g. Hair Care"
                    />
                    <FormField
                        label="Sub-Category"
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={(val) => handleChange({ target: { name: "subCategory", value: val } })}
                        placeholder="e.g. Luxury Salon"
                    />
                </div>

                <div className="space-y-12">
                    <MultiInput
                        label="Discovery Tags"
                        value={formData.tags}
                        onChange={(val) => handleArrayAdd("tags", val)}
                        onRemove={(idx) => handleArrayRemove("tags", idx)}
                        placeholder="Type tag and press Enter"
                        badgeColor="bg-primary-50 text-primary-700 border-primary-200"
                    />

                    <MultiInput
                        label="Key Specialties"
                        value={formData.specialties}
                        onChange={(val) => handleArrayAdd("specialties", val)}
                        onRemove={(idx) => handleArrayRemove("specialties", idx)}
                        placeholder="e.g. Keratin Treatment"
                        badgeColor="bg-secondary-100 text-secondary-800 border-secondary-300"
                    />

                    <MultiInput
                        label="Spoken Languages"
                        value={formData.languages}
                        onChange={(val) => handleArrayAdd("languages", val)}
                        onRemove={(idx) => handleArrayRemove("languages", idx)}
                        placeholder="e.g. English"
                        badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryTagsStep;
