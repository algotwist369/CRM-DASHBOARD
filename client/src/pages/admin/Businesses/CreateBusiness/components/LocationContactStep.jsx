import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import FormTextArea from "../../../../../components/forms/FormTextArea/FormTextArea";

const LocationContactStep = ({ formData, errors, handleChange }) => {
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Location</h2>
                <p className="text-secondary-500 font-medium">Provide physical and digital coordinates for your business.</p>
            </div>

            <div className="space-y-8">
                <FormTextArea
                    label="Physical Address"
                    name="address"
                    value={formData.address}
                    onChange={(val) => handleChange({ target: { name: "address", value: val } })}
                    placeholder="Complete street address, floor, suite..."
                    required
                    rows={3}
                    error={errors.address}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={(val) => handleChange({ target: { name: "city", value: val } })}
                        placeholder="e.g. Mumbai"
                        required
                    />
                    <FormField
                        label="State / Province"
                        name="state"
                        value={formData.state}
                        onChange={(val) => handleChange({ target: { name: "state", value: val } })}
                        placeholder="e.g. Maharashtra"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Zip / Postal Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={(val) => handleChange({ target: { name: "zipCode", value: val } })}
                        placeholder="6-digit code"
                    />
                    <FormField
                        label="Primary Contact Number"
                        name="phone"
                        value={formData.phone}
                        onChange={(val) => handleChange({ target: { name: "phone", value: val } })}
                        placeholder="+91 XXXXX XXXXX"
                        required
                        error={errors.phone}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Public Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                        placeholder="hello@business.com"
                    />
                    <FormField
                        label="Official Website"
                        name="website"
                        value={formData.website}
                        onChange={(val) => handleChange({ target: { name: "website", value: val } })}
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>
    );
};

export default LocationContactStep;
