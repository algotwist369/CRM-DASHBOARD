import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";

const LegalRegistrationStep = ({ formData, errors, handleChange }) => {
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Compliance</h2>
                <p className="text-secondary-500 font-medium">Official registration and legal documentation details.</p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="GSTIN Number"
                        name="registration.gstNumber"
                        value={formData.registration.gstNumber}
                        onChange={(val) => handleChange({ target: { name: "registration.gstNumber", value: val } })}
                        placeholder="e.g. 29AAAAA0000A1Z5"
                    />
                    <FormField
                        label="PAN Number"
                        name="registration.panNumber"
                        value={formData.registration.panNumber}
                        onChange={(val) => handleChange({ target: { name: "registration.panNumber", value: val } })}
                        placeholder="e.g. ABCDE1234F"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        label="Trade License Number"
                        name="registration.licenseNumber"
                        value={formData.registration.licenseNumber}
                        onChange={(val) => handleChange({ target: { name: "registration.licenseNumber", value: val } })}
                        placeholder="Official license ID"
                    />
                    <FormField
                        label="Company Reg. Number"
                        name="registration.registrationNumber"
                        value={formData.registration.registrationNumber}
                        onChange={(val) => handleChange({ target: { name: "registration.registrationNumber", value: val } })}
                        placeholder="Registration ID"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <FormField
                        label="Issue Date"
                        name="registration.registrationDate"
                        type="date"
                        value={formData.registration.registrationDate}
                        onChange={(val) => handleChange({ target: { name: "registration.registrationDate", value: val } })}
                    />
                    <FormField
                        label="Expiry Date"
                        name="registration.expiryDate"
                        type="date"
                        value={formData.registration.expiryDate}
                        onChange={(val) => handleChange({ target: { name: "registration.expiryDate", value: val } })}
                    />
                </div>
            </div>
        </div>
    );
};

export default LegalRegistrationStep;
