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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let cleanedValue = value;

        if (name === 'phone') {
            cleanedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        } else if (name === 'otp') {
            cleanedValue = value.replace(/[^0-9]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const validateInput = useCallback(() => {
        const newErrors = {};
        if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.user_name, formData.phone]);

    const handleSendOTP = useCallback(async (e) => {
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
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }, [formData.phone, validateInput]);

    const handleResendOTP = useCallback(async () => {
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
    }, [formData.phone, timer, resending]);

    const handleSubmitInquiry = useCallback(async (e) => {
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
            toast.error(error.message || 'Failed to submit inquiry');
        } finally {
            setLoading(false);
        }
    }, [businessId, formData, onSuccess]);

    if (step === 'success') {
        return (
            <div className="py-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                    <FaCheckCircle className="text-3xl text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-sm text-gray-500 mb-6 px-4">
                    Your inquiry for <span className="font-semibold text-gray-700">{businessName || 'Business'}</span> has been received.
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 max-w-[280px] mx-auto text-center">
                    <p className="text-gray-900 font-bold text-lg leading-tight mb-1">
                        We'll connect with you within 30 min.
                    </p>
                    <p className="text-xs text-gray-500">
                        Check your phone {formData.phone}
                    </p>
                </div>

                <button
                    onClick={onCancel}
                    className="w-full max-w-[200px] py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all active:scale-[0.98] shadow-sm"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="p-1">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Inquire with {businessName || 'Business'}</h2>
                <p className="text-xs text-gray-500 mt-1">
                    {step === 'input'
                        ? 'Submit your details to get a callback.'
                        : `Enter the code sent to ${formData.phone}`}
                </p>
            </div>

            {step === 'input' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 ml-1">Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400 text-[10px]" />
                            </div>
                            <input
                                type="text"
                                name="user_name"
                                required
                                className={`block w-full pl-8 pr-3 py-2 border ${errors.user_name ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:border-primary-500 transition-all outline-none text-sm`}
                                placeholder="Enter your name"
                                value={formData.user_name}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.user_name && <p className="mt-1 text-[10px] text-red-600 ml-1">{errors.user_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 ml-1">Mobile Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhoneAlt className="text-gray-400 text-[10px]" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                inputMode="tel"
                                pattern="[0-9]{10}"
                                className={`block w-full pl-8 pr-3 py-2 border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:border-primary-500 transition-all outline-none text-sm`}
                                placeholder="10 digit number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-[10px] text-red-600 ml-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 ml-1">Reason</label>
                        <select
                            name="inquiry_type"
                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 transition-all outline-none bg-white text-sm"
                            value={formData.inquiry_type}
                            onChange={handleChange}
                        >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Pricing & Services">Pricing & Services</option>
                            <option value="Special Offers">Special Offers</option>
                            <option value="Membership Packages">Membership Packages</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98] text-sm"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="text-xs" />}
                            Send Request
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-[180px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400 text-[10px]" />
                            </div>
                            <input
                                type="text"
                                name="otp"
                                required
                                autoFocus
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="block w-full pl-8 pr-3 py-2.5 text-center text-xl font-bold tracking-[0.2em] border border-gray-200 rounded-lg focus:border-primary-500 transition-all outline-none bg-gray-50/50"
                                placeholder="••••"
                                maxLength={6}
                                value={formData.otp}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={timer > 0 || resending}
                            className={`mt-4 text-xs font-medium transition-colors ${timer > 0 || resending ? 'text-gray-300' : 'text-primary-600 hover:text-primary-700'}`}
                        >
                            {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setStep('input')}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.otp.length < 4}
                            className="flex-[2] py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98] text-sm"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : 'Confirm'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InquiryForm;
