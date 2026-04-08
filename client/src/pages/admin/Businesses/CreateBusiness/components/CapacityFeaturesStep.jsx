import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import MultiInput from "../../../../../components/forms/MultiInput/MultiInput";

const CapacityFeaturesStep = ({ formData, handleChange, handleArrayAdd, handleArrayRemove }) => {
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Facility</h2>
                <p className="text-secondary-500 font-medium">Physical characteristics and on-site amenities.</p>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6">Space Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormField
                            label="Total Area (sq ft)"
                            name="capacity.totalArea"
                            value={formData.capacity.totalArea}
                            onChange={(val) => handleChange({ target: { name: "capacity.totalArea", value: val } })}
                            placeholder="e.g. 1,200"
                        />
                        <FormField
                            label="Seating Capacity"
                            name="capacity.seatingCapacity"
                            type="number"
                            value={formData.capacity.seatingCapacity}
                            onChange={(val) => handleChange({ target: { name: "capacity.seatingCapacity", value: val } })}
                            placeholder="Total seats"
                        />
                        <FormField
                            label="Parking Spaces"
                            name="capacity.parkingSpaces"
                            type="number"
                            value={formData.capacity.parkingSpaces}
                            onChange={(val) => handleChange({ target: { name: "capacity.parkingSpaces", value: val } })}
                            placeholder="Vehicle limit"
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6">Features & Amenities</h3>
                    <div className="space-y-12">
                        <MultiInput
                            label="Key Features"
                            value={formData.features}
                            onChange={(val) => handleArrayAdd("features", val)}
                            onRemove={(idx) => handleArrayRemove("features", idx)}
                            placeholder="e.g. Central Cooling"
                            badgeColor="bg-primary-50 text-primary-700 border-primary-200"
                        />
                        <MultiInput
                            label="Service Amenities"
                            value={formData.amenities}
                            onChange={(val) => handleArrayAdd("amenities", val)}
                            onRemove={(idx) => handleArrayRemove("amenities", idx)}
                            placeholder="e.g. Free WiFi, Coffee"
                            badgeColor="bg-secondary-100 text-secondary-800 border-secondary-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapacityFeaturesStep;
