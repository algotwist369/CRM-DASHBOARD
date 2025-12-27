import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser, FaPhoneAlt, FaPaperPlane, FaLock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import inquiryService from '../../../services/public/inquiryService';

const InquiryForm = ({ businessId, businessName, onSuccess, onCancel }) => {
    const [step, setStep] = useState('input'); // 'input', 'otp', 'success'
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(0);

    const [formData, setFormData] = useState({
        user_name: '',
        phone: '',
        inquiry_type: 'General Inquiry',
        otp: ''
    });

    const [errors, setErrors] = useState({});

    // Countdown timer for OTP resend
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const validateInput = () => {
        const newErrors = {};
        if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!validateInput()) return;

        setLoading(true);
        try {
            const response = await inquiryService.sendOTP(formData.phone);
            if (response.success) {
                toast.success('OTP sent successfully!');
                setStep('otp');
                setTimer(60);
            } else {
                toast.error(response.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP Error:', error);
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0 || resending) return;

        setResending(true);
        try {
            const response = await inquiryService.sendOTP(formData.phone);
            if (response.success) {
                toast.success('OTP resent successfully!');
                setTimer(60);
            } else {
                toast.error(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    const handleSubmitInquiry = async (e) => {
        e.preventDefault();
        if (!formData.otp || formData.otp.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                business_id: businessId,
                user_name: formData.user_name,
                phone: formData.phone,
                inquiry_type: formData.inquiry_type,
                otp: formData.otp
            };

            const response = await inquiryService.createInquiry(payload);
            if (response.success) {
                setStep('success');
                if (onSuccess) onSuccess(response.data);
            } else {
                toast.error(response.message || 'Failed to submit inquiry');
            }
        } catch (error) {
            console.error('Submit Inquiry Error:', error);
            toast.error(error.message || 'Failed to submit inquiry');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <FaCheckCircle className="text-4xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Thank you for reaching out to <span className="font-semibold text-primary-600">{businessName}</span>.
                    The business will contact you shortly using the phone number provided.
                </p>
                <button
                    onClick={onCancel}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="p-1">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Inquire with {businessName}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {step === 'input'
                        ? 'Fill in your details and we\'ll send you a verification code.'
                        : `Enter the 6-digit code sent to ${formData.phone}`}
                </p>
            </div>

            {step === 'input' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                required
                                className={`block w-full pl-10 pr-3 py-2.5 border ${errors.user_name ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                                placeholder="John Doe"
                                value={formData.user_name}
                                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                            />
                        </div>
                        {errors.user_name && <p className="mt-1 text-xs text-red-600">{errors.user_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhoneAlt className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="tel"
                                required
                                className={`block w-full pl-10 pr-3 py-2.5 border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                                placeholder="10 digit number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What are you inquiring about?</label>
                        <select
                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            value={formData.inquiry_type}
                            onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                        >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Pricing">Pricing & Services</option>
                            <option value="Availability">Availability</option>
                            <option value="Special Offer">Special Offers</option>
                            <option value="Corporate Booking">Corporate Booking</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-100"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-sm" />}
                            Send Verification OTP
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                required
                                autoFocus
                                className="block w-full pl-10 pr-3 py-4 text-center text-2xl font-bold tracking-[0.5em] border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="000000"
                                maxLength={6}
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/[^0-9]/g, '') })}
                            />
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={timer > 0 || resending}
                                className={`text-sm font-medium ${timer > 0 || resending ? 'text-gray-400' : 'text-primary-600 hover:text-primary-700'}`}
                            >
                                {resending ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep('input')}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.otp.length < 4}
                            className="flex-[2] py-3 px-4 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-100"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : 'Confirm & Submit'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InquiryForm;
