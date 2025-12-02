import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HiOutlineSave, HiOutlineInformationCircle } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const AutomatedCampaignForm = ({ mode = 'create' }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [templates, setTemplates] = useState([]);

    const [formData, setFormData] = useState({
        businessId: searchParams.get('businessId') || '',
        name: '',
        description: '',
        triggerType: 'customer_birthday',
        triggerConfig: {
            days: '',
            executionTime: '10:00',
            customerType: [],
            membershipTier: [],
            minTotalSpent: '',
            tags: []
        },
        useTemplate: false,
        template: '',
        message: {
            subject: '',
            body: ''
        },
        channels: ['email'],
        offer: {
            hasOffer: false,
            offerType: 'percentage',
            offerValue: '',
            promoCode: '',
            validityDays: 7
        },
        frequencyControl: {
            maxPerCustomer: 1,
            cooldownDays: 30,
            checkLastSent: true
        },
        isActive: true,
        schedule: {
            startDate: '',
            endDate: ''
        }
    });

    // Fetch businesses
    useEffect(() => {
        const fetchBusinesses = async () => {
            const response = await adminService.getBusinesses();
            if (response.success) {
                setBusinesses(response.data || []);
                if (response.data?.length === 1) {
                    setFormData(prev => ({ ...prev, businessId: response.data[0]._id }));
                }
            }
        };
        fetchBusinesses();
    }, []);

    // Fetch templates when business is selected
    useEffect(() => {
        const fetchTemplates = async () => {
            if (formData.businessId) {
                const response = await adminService.getCampaignTemplates({ businessId: formData.businessId });
                if (response.success) {
                    setTemplates(response.data || []);
                }
            }
        };
        fetchTemplates();
    }, [formData.businessId]);

    // Fetch campaign data for edit mode
    useEffect(() => {
        const fetchCampaign = async () => {
            if (mode === 'edit' && id) {
                try {
                    setLoading(true);
                    const response = await adminService.getAutomatedCampaign(id);
                    if (response.success) {
                        setFormData(response.data);
                    } else {
                        toast.error('Failed to load campaign');
                        navigate('/admin/campaigns/automated');
                    }
                } catch (error) {
                    toast.error('Failed to load campaign');
                    navigate('/admin/campaigns/automated');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCampaign();
    }, [mode, id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleArrayToggle = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: prev[parent][field].includes(value)
                    ? prev[parent][field].filter(v => v !== value)
                    : [...prev[parent][field], value]
            }
        }));
    };

    const handleChannelToggle = (channel) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.businessId) {
            toast.error('Please select a business');
            return;
        }

        try {
            setLoading(true);
            const response = mode === 'create'
                ? await adminService.createAutomatedCampaign(formData)
                : await adminService.updateAutomatedCampaign(id, formData);

            if (response.success) {
                toast.success(`Automated campaign ${mode === 'create' ? 'created' : 'updated'} successfully!`);
                navigate('/admin/campaigns/automated');
            } else {
                toast.error(response.error || `Failed to ${mode} campaign`);
            }
        } catch (error) {
            console.error(`Failed to ${mode} campaign:`, error);
            toast.error(`Failed to ${mode} campaign`);
        } finally {
            setLoading(false);
        }
    };

    const getTriggerConfigFields = () => {
        const { triggerType } = formData;

        switch (triggerType) {
            case 'customer_birthday':
            case 'customer_anniversary':
            case 'new_customer_signup':
                return null; // No additional config needed

            case 'days_since_last_visit':
            case 'days_of_inactivity':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Days <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 7"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {triggerType === 'days_since_last_visit'
                                ? 'Trigger campaign X days after customer\'s last visit'
                                : 'Trigger campaign for customers inactive for X days'}
                        </p>
                    </div>
                );

            case 'after_appointment':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days After Appointment <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Send follow-up campaign X days after completed appointment</p>
                    </div>
                );

            case 'after_purchase':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days After Purchase <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 7"
                        />
                        <p className="text-xs text-gray-500 mt-1">Send thank you or feedback request X days after purchase</p>
                    </div>
                );

            case 'first_purchase':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days After First Purchase (Optional)
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Welcome first-time buyers (leave empty for immediate trigger)</p>
                    </div>
                );

            case 'abandoned_cart':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days Since Cart Updated <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Remind customers about items left in cart</p>
                    </div>
                );

            case 'review_request':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days After Service <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.days}
                            onChange={(e) => handleNestedChange('triggerConfig', 'days', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Request review X days after appointment completion</p>
                    </div>
                );

            case 'points_expiring':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days Before Expiry <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.daysBeforeExpiry}
                            onChange={(e) => handleNestedChange('triggerConfig', 'daysBeforeExpiry', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 7"
                        />
                        <p className="text-xs text-gray-500 mt-1">Notify customers before their loyalty points expire</p>
                    </div>
                );

            case 'subscription_expiring':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days Before Expiration <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.triggerConfig.daysBeforeExpiration}
                            onChange={(e) => handleNestedChange('triggerConfig', 'daysBeforeExpiration', parseInt(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., 7"
                        />
                        <p className="text-xs text-gray-500 mt-1">Remind customers to renew before subscription expires</p>
                    </div>
                );

            case 'loyalty_tier_upgrade':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Tier</label>
                            <select
                                value={formData.triggerConfig.fromTier}
                                onChange={(e) => handleNestedChange('triggerConfig', 'fromTier', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Any</option>
                                <option value="bronze">Bronze</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Tier <span className="text-red-500">*</span></label>
                            <select
                                value={formData.triggerConfig.toTier}
                                onChange={(e) => handleNestedChange('triggerConfig', 'toTier', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select tier</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <BackButton />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Create Automated Campaign' : 'Edit Automated Campaign'}
                </h1>
                <p className="text-gray-600 mt-1">
                    Set up trigger-based automated marketing campaigns
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                        {/* Business Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="businessId"
                                value={formData.businessId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Business</option>
                                {businesses.map(business => (
                                    <option key={business._id} value={business._id}>{business.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Campaign Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g., Birthday Wishes Campaign"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                placeholder="Brief description of this automated campaign"
                            />
                        </div>
                    </div>

                    {/* Trigger Configuration */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Trigger Configuration</h2>

                        {/* Trigger Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trigger Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="triggerType"
                                value={formData.triggerType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="customer_birthday">Customer Birthday</option>
                                <option value="customer_anniversary">Customer Anniversary</option>
                                <option value="days_since_last_visit">Days Since Last Visit</option>
                                <option value="days_of_inactivity">Days of Inactivity</option>
                                <option value="after_appointment">After Appointment</option>
                                <option value="after_purchase">After Purchase</option>
                                <option value="loyalty_tier_upgrade">Loyalty Tier Upgrade</option>
                                <option value="points_expiring">Points Expiring</option>
                                <option value="subscription_expiring">Subscription Expiring</option>
                                <option value="new_customer_signup">New Customer Signup</option>
                                <option value="first_purchase">First Purchase</option>
                                <option value="abandoned_cart">Abandoned Cart</option>
                                <option value="review_request">Review Request</option>
                            </select>
                        </div>

                        {/* Dynamic Trigger Config Fields */}
                        {getTriggerConfigFields()}

                        {/* Execution Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Execution Time (daily check)
                            </label>
                            <input
                                type="time"
                                value={formData.triggerConfig.executionTime}
                                onChange={(e) => handleNestedChange('triggerConfig', 'executionTime', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Customer Type Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Customer Type (optional)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['new', 'regular', 'vip', 'inactive'].map(type => (
                                    <label key={type} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.triggerConfig.customerType.includes(type)}
                                            onChange={() => handleArrayToggle('triggerConfig', 'customerType', type)}
                                            className="rounded"
                                        />
                                        <span className="text-sm capitalize">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Membership Tier Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Membership Tier (optional)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['bronze', 'silver', 'gold', 'platinum'].map(tier => (
                                    <label key={tier} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.triggerConfig.membershipTier.includes(tier)}
                                            onChange={() => handleArrayToggle('triggerConfig', 'membershipTier', tier)}
                                            className="rounded"
                                        />
                                        <span className="text-sm capitalize">{tier}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Min Total Spent */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Total Spent (optional)
                            </label>
                            <input
                                type="number"
                                value={formData.triggerConfig.minTotalSpent}
                                onChange={(e) => handleNestedChange('triggerConfig', 'minTotalSpent', parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Message Content</h2>

                        {/* Use Template or Custom */}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={!formData.useTemplate}
                                    onChange={() => setFormData(prev => ({ ...prev, useTemplate: false }))}
                                    className="rounded-full"
                                />
                                <span className="text-sm font-medium">Custom Message</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={formData.useTemplate}
                                    onChange={() => setFormData(prev => ({ ...prev, useTemplate: true }))}
                                    className="rounded-full"
                                />
                                <span className="text-sm font-medium">Use Template</span>
                            </label>
                        </div>

                        {formData.useTemplate ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Template <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.template}
                                    onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                                    required={formData.useTemplate}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select a template</option>
                                    {templates.map(template => (
                                        <option key={template._id} value={template._id}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.message.subject}
                                        onChange={(e) => handleNestedChange('message', 'subject', e.target.value)}
                                        required={!formData.useTemplate}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., Happy Birthday!"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Body <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.message.body}
                                        onChange={(e) => handleNestedChange('message', 'body', e.target.value)}
                                        required={!formData.useTemplate}
                                        rows="6"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                        placeholder="Use {{customerName}}, {{businessName}}, etc."
                                    />
                                </div>
                            </>
                        )}

                        {/* Channels */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Channels <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['email', 'sms', 'whatsapp', 'push_notification'].map(channel => (
                                    <label key={channel} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.channels.includes(channel)}
                                            onChange={() => handleChannelToggle(channel)}
                                            className="rounded"
                                        />
                                        <span className="text-sm capitalize">{channel.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Offer Configuration */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Offer Configuration</h2>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.offer.hasOffer}
                                    onChange={(e) => handleNestedChange('offer', 'hasOffer', e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">Include Offer</span>
                            </label>
                        </div>

                        {formData.offer.hasOffer && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                                        <select
                                            value={formData.offer.offerType}
                                            onChange={(e) => handleNestedChange('offer', 'offerType', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                            <option value="free_service">Free Service</option>
                                            <option value="loyalty_points">Loyalty Points</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Offer Value</label>
                                        <input
                                            type="number"
                                            value={formData.offer.offerValue}
                                            onChange={(e) => handleNestedChange('offer', 'offerValue', parseFloat(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                                        <input
                                            type="text"
                                            value={formData.offer.promoCode}
                                            onChange={(e) => handleNestedChange('offer', 'promoCode', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g., BIRTHDAY10"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Validity Days</label>
                                        <input
                                            type="number"
                                            value={formData.offer.validityDays}
                                            onChange={(e) => handleNestedChange('offer', 'validityDays', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                            placeholder="7"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Frequency Control */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Frequency Control</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Per Customer
                                </label>
                                <input
                                    type="number"
                                    value={formData.frequencyControl.maxPerCustomer}
                                    onChange={(e) => handleNestedChange('frequencyControl', 'maxPerCustomer', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cooldown Days
                                </label>
                                <input
                                    type="number"
                                    value={formData.frequencyControl.cooldownDays}
                                    onChange={(e) => handleNestedChange('frequencyControl', 'cooldownDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white rounded border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Schedule (Optional)</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.schedule.startDate}
                                    onChange={(e) => handleNestedChange('schedule', 'startDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.schedule.endDate}
                                    onChange={(e) => handleNestedChange('schedule', 'endDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/campaigns/automated')}
                            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <HiOutlineSave className="w-5 h-5" />
                            {loading ? 'Saving...' : mode === 'create' ? 'Create Campaign' : 'Update Campaign'}
                        </button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Status</h3>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="rounded"
                            />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                            {formData.isActive ? 'Campaign will trigger automatically' : 'Campaign is paused'}
                        </p>
                    </div>

                    {/* Help */}
                    <div className="bg-blue-50 rounded border border-blue-200 p-6">
                        <div className="flex items-start gap-3">
                            <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">Automation Tips</h3>
                                <ul className="text-xs text-blue-800 space-y-2">
                                    <li>• Test triggers manually before activating</li>
                                    <li>• Set appropriate cooldown to avoid spam</li>
                                    <li>• Use templates for consistency</li>
                                    <li>• Monitor stats regularly</li>
                                    <li>• Schedule campaigns for specific periods</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AutomatedCampaignForm;
