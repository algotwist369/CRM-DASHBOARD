import React from "react";
import FormField from "../../../../../components/forms/FormField/FormField";
import { FormCheckboxGroup } from "../../../../../components/forms/FormCheckbox/FormCheckbox";
import { FaQrcode } from "react-icons/fa"; // Added missing icon

const PaymentBankingStep = ({ formData, handleChange }) => {
    const paymentOptions = [
        { label: "Cash", value: "cash" },
        { label: "Card", value: "card" },
        { label: "UPI", value: "upi" },
        { label: "Net Banking", value: "netBanking" },
        // { label: "Digital Wallet", value: "wallet" }
    ];

    const handleCheckboxChange = (selectedValues) => {
        const updatedMethods = {
            cash: selectedValues.includes("cash"),
            card: selectedValues.includes("card"),
            upi: selectedValues.includes("upi"),
            netBanking: selectedValues.includes("netBanking"),
            wallet: selectedValues.includes("wallet")
        };
        handleChange({ target: { name: "paymentMethods", value: updatedMethods } });
    };

    const activeMethods = Object.keys(formData.paymentMethods).filter(k => formData.paymentMethods[k]);

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-secondary-900 mb-3">Finance</h2>
                <p className="text-secondary-500 font-medium">How you receive payments and handle bank settlements.</p>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Accepted Payment Modes</h3>
                    <div className="p-6 bg-secondary-50 rounded-2xl border border-secondary-200">
                        <FormCheckboxGroup
                            name="paymentMethods"
                            options={paymentOptions}
                            value={activeMethods}
                            onChange={handleCheckboxChange}
                            direction="horizontal"
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-secondary-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-400 mb-6 font-display">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                            label="Account Holder Name"
                            name="bankDetails.accountName"
                            value={formData.bankDetails.accountName}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.accountName", value: val } })}
                            placeholder="Full Name"
                        />
                        <FormField
                            label="Account Number"
                            name="bankDetails.accountNumber"
                            value={formData.bankDetails.accountNumber}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.accountNumber", value: val } })}
                            placeholder="Bank Account ID"
                        />
                        <FormField
                            label="Bank Name"
                            name="bankDetails.bankName"
                            value={formData.bankDetails.bankName}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.bankName", value: val } })}
                            placeholder="e.g. HDFC Bank"
                        />
                        <FormField
                            label="IFSC Code"
                            name="bankDetails.ifscCode"
                            value={formData.bankDetails.ifscCode}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.ifscCode", value: val } })}
                            placeholder="e.g. HDFC0001234"
                        />
                        <FormField
                            label="Business UPI ID"
                            name="bankDetails.upiId"
                            value={formData.bankDetails.upiId}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.upiId", value: val } })}
                            placeholder="business@upi"
                        />
                        <FormField
                            label="UPI QR Code (URL)"
                            name="bankDetails.qrCode"
                            value={formData.bankDetails.qrCode}
                            onChange={(val) => handleChange({ target: { name: "bankDetails.qrCode", value: val } })}
                            placeholder="https://..."
                            icon={<FaQrcode />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentBankingStep;
