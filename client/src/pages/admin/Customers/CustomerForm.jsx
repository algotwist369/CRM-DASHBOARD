import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';

import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';
const CustomerForm = ({ mode = 'create' }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        membershipTier: 'none',
        notes: '',
        preferredLanguage: 'en',
        source: 'walk-in',
        alternatePhone: '',
        anniversary: '',
        customerType: 'new',
        tags: '',
        marketingConsent: {
            email: false,
            sms: false,
            whatsapp: false,
            phone: false
        },
        isBlacklisted: false,
        isActive: true
    });
    const [formErrors, setFormErrors] = useState({});
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await adminService.getBusinesses();
                if (response.success) {
                    const fetchedBusinesses = response.data || [];
                    setBusinesses(fetchedBusinesses);


                    const currentId = localStorage.getItem('selectedBusinessId');
                    const isValid = fetchedBusinesses.some(b => b._id === currentId);

                    if (!currentId || !isValid) {
                        if (fetchedBusinesses.length > 0) {
                            const firstBusinessId = fetchedBusinesses[0]._id;
                            setSelectedBusinessId(firstBusinessId);
                            localStorage.setItem('selectedBusinessId', firstBusinessId);
                        } else {
                            setSelectedBusinessId('');
                        }
                    } else {
                        setSelectedBusinessId(currentId);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch businesses:', error);
            }
        };
        fetchBusinesses();
    }, []);
    useEffect(() => {
        const fetchCustomer = async () => {
            if (mode === 'edit' && id) {
                try {
                    setFetching(true);
                    const response = await adminService.getCustomer(id);
                    if (response.success) {
                        const customer = response.data;
                        setFormData({
                            firstName: customer.firstName || '',
                            lastName: customer.lastName || '',
                            email: customer.email || '',
                            phone: customer.phone || '',
                            dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
                            gender: customer.gender || '',
                            gender: customer.gender || '',
                            address: customer.address?.address || (typeof customer.address === 'string' ? customer.address : '') || '',
                            city: customer.address?.city || '',
                            state: customer.address?.state || '',
                            pincode: customer.address?.pincode || customer.address?.zipCode || '',
                            membershipTier: customer.membershipTier || 'none',
                            notes: customer.notes || '',
                            preferredLanguage: customer.preferredLanguage || 'en',
                            source: customer.source || 'walk-in',
                            alternatePhone: customer.alternatePhone || '',
                            anniversary: customer.anniversary ? new Date(customer.anniversary).toISOString().split('T')[0] : '',
                            customerType: customer.customerType || 'new',
                            tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : (customer.tags || ''),
                            marketingConsent: customer.marketingConsent || { email: false, sms: false, whatsapp: false, phone: false },
                            isBlacklisted: customer.isBlacklisted || false,
                            isActive: customer.isActive !== undefined ? customer.isActive : true
                        });
                        if (customer.business?._id) {
                            setSelectedBusinessId(customer.business._id);
                        }
                        setStep(2); // Skip to step 2 for edit mode
                    } else {
                        toast.error(response.error || 'Failed to fetch customer');
                        navigate('/admin/customers');
                    }
                } catch (error) {
                    console.error('Failed to fetch customer:', error);
                    toast.error('Failed to fetch customer');
                    navigate('/admin/customers');
                } finally {
                    setFetching(false);
                }
            }
        };
        fetchCustomer();
    }, [mode, id, navigate]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.phone.trim()) errors.phone = 'Phone is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setFormErrors({ ...formErrors, phone: 'Please enter a valid phone number' });
            return;
        }

        // Validate business ID
        let businessIdToUse = selectedBusinessId;

        // Check if selectedBusinessId is valid (24 char hex string)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(businessIdToUse);

        if (!businessIdToUse || !isValidObjectId) {
            // Try to recover by finding a valid business
            if (businesses.length > 0) {
                businessIdToUse = businesses[0]._id;
                setSelectedBusinessId(businessIdToUse);
                localStorage.setItem('selectedBusinessId', businessIdToUse);
            } else {
                toast.error('Please select a valid business');
                return;
            }
        }

        setCheckingPhone(true);
        try {
            const response = await adminService.lookupCustomer(formData.phone, businessIdToUse);
            if (response.success && response.data) {
                const customer = response.data;
                setFormData({
                    ...formData,
                    firstName: customer.firstName || '',
                    lastName: customer.lastName || '',
                    email: customer.email || '',
                    dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: customer.gender || '',
                    gender: customer.gender || '',
                    address: customer.address?.address || (typeof customer.address === 'string' ? customer.address : '') || '',
                    city: customer.address?.city || '',
                    state: customer.address?.state || '',
                    pincode: customer.address?.pincode || customer.address?.zipCode || '',
                    membershipTier: customer.membershipTier || 'none',
                    notes: customer.notes || '',
                    preferredLanguage: customer.preferredLanguage || 'en',
                    source: customer.source || 'walk-in',
                    alternatePhone: customer.alternatePhone || '',
                    anniversary: customer.anniversary ? new Date(customer.anniversary).toISOString().split('T')[0] : '',
                    customerType: customer.customerType || 'new',
                    tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : (customer.tags || ''),
                    marketingConsent: customer.marketingConsent || { email: false, sms: false, whatsapp: false, phone: false },
                    isBlacklisted: customer.isBlacklisted || false,
                    isActive: customer.isActive !== undefined ? customer.isActive : true
                });
                toast.success('Customer found! Details auto-filled.');
            } else {
                // Clear form but keep phone
                setFormData(prev => ({
                    ...prev,
                    firstName: '',
                    lastName: '',
                    email: '',
                    dateOfBirth: '',
                    gender: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    membershipTier: 'none',
                    membershipTier: 'none',
                    notes: '',
                    preferredLanguage: 'en',
                    source: 'walk-in',
                    alternatePhone: '',
                    anniversary: '',
                    customerType: 'new',
                    tags: '',
                    marketingConsent: { email: false, sms: false, whatsapp: false, phone: false },
                    isBlacklisted: false,
                    isActive: true
                }));
                toast.success('New customer! Please fill in details.');
            }
            setStep(2);
        } catch (error) {
            // Customer not found (404), treat as new
            setFormData(prev => ({
                ...prev,
                firstName: '',
                lastName: '',
                email: '',
                dateOfBirth: '',
                gender: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                membershipTier: 'none',
                membershipTier: 'none',
                notes: '',
                preferredLanguage: 'en',
                source: 'walk-in',
                alternatePhone: '',
                anniversary: '',
                customerType: 'new',
                tags: '',
                marketingConsent: { email: false, sms: false, whatsapp: false, phone: false },
                isBlacklisted: false,
                isActive: true
            }));
            toast.success('New customer! Please fill in details.');
            setStep(2);
        } finally {
            setCheckingPhone(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }
        if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null') {
            toast.error('Please select a business');
            return;
        }
        setLoading(true);

        try {
            const payload = {
                businessId: selectedBusinessId,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim(),
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender || undefined,
                address: formData.address ? {
                    address: formData.address.trim(),
                    city: formData.city.trim() || undefined,
                    state: formData.state.trim() || undefined,
                    pincode: formData.pincode.trim() || undefined
                } : undefined,
                membershipTier: formData.membershipTier !== 'none' ? formData.membershipTier : undefined,
                notes: formData.notes.trim() || undefined,
                preferredLanguage: formData.preferredLanguage || undefined,
                source: formData.source || undefined,
                alternatePhone: formData.alternatePhone.trim() || undefined,
                anniversary: formData.anniversary || undefined,
                customerType: formData.customerType || 'new',
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                marketingConsent: formData.marketingConsent,
                isBlacklisted: formData.isBlacklisted,
                isActive: formData.isActive
            };
            // Remove undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined || (typeof payload[key] === 'object' && Object.keys(payload[key] || {}).length === 0)) {
                    delete payload[key];
                }
            });
            let response;
            if (mode === 'create') {
                response = await adminService.createCustomer(payload);
            } else {
                response = await adminService.updateCustomer(id, payload);
            }
            if (response.success) {
                toast.success(response.message || `Customer ${mode === 'create' ? 'created' : 'updated'} successfully!`);
                navigate('/admin/customers');
            } else {
                toast.error(response.error || `Failed to ${mode === 'create' ? 'create' : 'update'} customer`);
            }
        } catch (error) {
            console.error('Failed to save customer:', error);
            toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} customer`);
        } finally {
            setLoading(false);
        }
    };
    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <BackButton />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {mode === 'create' ? 'Create a new customer profile' : 'Update customer information'}
                    </p>
                </div>
            </div>

            {/* Step 1: Phone Entry */}
            {step === 1 && (
                <div className="bg-white border border-gray-200 p-6 max-w-2xl mx-auto">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Step 1: Enter Customer Phone</h2>

                    {/* Business Selector */}
                    {businesses.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedBusinessId}
                                onChange={(e) => setSelectedBusinessId(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            >
                                <option value="">Select a business</option>
                                {businesses.map((business) => (
                                    <option key={business._id} value={business._id}>
                                        {business.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                            required
                            className={`w-full px-4 py-2 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+91 98765 43210"
                            autoFocus
                        />
                        {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                        <p className="text-xs text-gray-500 mt-2">Enter phone number to check if customer already exists.</p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleNextStep}
                            disabled={checkingPhone}
                            className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {checkingPhone ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Checking...
                                </>
                            ) : (
                                'Next'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Full Form */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
                            {mode === 'create' && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Change Phone Number
                                </button>
                            )}
                        </div>

                        {/* Basic Details (Personal + Address) */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Row 1 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={mode === 'create'}
                                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter first name"
                                    />
                                    {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter last name"
                                    />
                                </div>

                                {/* Row 2 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter email"
                                    />
                                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alternate Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="alternatePhone"
                                        value={formData.alternatePhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter alternate phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Row 3 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Anniversary
                                    </label>
                                    <input
                                        type="date"
                                        name="anniversary"
                                        value={formData.anniversary}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Membership Tier
                                    </label>
                                    <select
                                        name="membershipTier"
                                        value={formData.membershipTier}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="none">None</option>
                                        <option value="bronze">Bronze</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="platinum">Platinum</option>
                                    </select>
                                </div>

                                {/* Address Row */}
                                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Enter address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Enter pincode"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CRM Settings */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">CRM Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer Type
                                    </label>
                                    <select
                                        name="customerType"
                                        value={formData.customerType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                    >
                                        <option value="new">New</option>
                                        <option value="regular">Regular</option>
                                        <option value="vip">VIP</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Source
                                    </label>
                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                    >
                                        <option value="walk-in">Walk-in</option>
                                        <option value="referral">Referral</option>
                                        <option value="online">Online</option>
                                        <option value="social-media">Social Media</option>
                                        <option value="advertisement">Advertisement</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Language
                                    </label>
                                    <select
                                        name="preferredLanguage"
                                        value={formData.preferredLanguage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                        placeholder="e.g. loyal, high-spender"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Marketing Consent
                                    </label>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {['email', 'sms', 'whatsapp', 'phone'].map((channel) => (
                                            <label key={channel} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.marketingConsent[channel]}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        marketingConsent: {
                                                            ...formData.marketingConsent,
                                                            [channel]: e.target.checked
                                                        }
                                                    })}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{channel}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pt-4 border-t border-gray-200">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">Active Account</span>
                                </label>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isBlacklisted}
                                        onChange={(e) => setFormData({ ...formData, isBlacklisted: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">Blacklisted</span>
                                </label>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Add any notes about this customer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/customers')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <HiOutlineSave className="w-5 h-5" />
                            {loading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
export default CustomerForm;
