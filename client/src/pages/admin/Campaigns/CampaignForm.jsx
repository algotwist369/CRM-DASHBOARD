import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft, HiOutlineSave, HiOutlineUserGroup, HiOutlineMail,
  HiOutlineCalendar, HiOutlineTag, HiOutlineInformationCircle, HiOutlineEye
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const CampaignForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingAudienceCount, setLoadingAudienceCount] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);

  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    description: '',
    type: 'promotional',
    channels: ['email'],
    targetAudience: 'all',
    targetCustomers: [],
    segmentFilters: {
      customerType: [],
      membershipTier: [],
      minTotalSpent: '',
      maxTotalSpent: '',
      minVisits: '',
      maxVisits: '',
      lastVisitAfter: '',
      lastVisitBefore: '',
      tags: [],
      hasEmail: false,
      hasPhone: false,
      marketingConsent: {
        email: false,
        sms: false,
        whatsapp: false
      }
    },
    message: {
      subject: '',
      body: ''
    },
    offer: {
      hasOffer: false,
      offerType: 'percentage',
      offerValue: '',
      promoCode: '',
      validFrom: '',
      validUntil: '',
      termsAndConditions: ''
    },
    scheduledDate: '',
    scheduledTime: '',
    isRecurring: false
  });

  // Load template if template ID is in query params
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const loadTemplate = async () => {
        try {
          setLoading(true);
          const response = await adminService.getCampaignTemplate(templateId);
          if (response.success && response.data) {
            const template = response.data;

            // Pre-populate form with template data
            setFormData(prev => ({
              ...prev,
              name: `${template.name} - Campaign`,
              description: template.description || '',
              type: template.campaignType || 'promotional',
              channels: template.defaultChannels || ['email'],
              message: {
                subject: template.message?.subject || '',
                body: template.message?.body || ''
              },
              offer: template.defaultOffer || prev.offer
            }));

            toast.success('Template loaded successfully!');
          } else {
            toast.error('Failed to load template');
          }
        } catch (error) {
          console.error('Failed to load template:', error);
          toast.error('Failed to load template');
        } finally {
          setLoading(false);
        }
      };
      loadTemplate();
    }
  }, [searchParams]);

  // Fetch businesses on mount
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

  // Fetch customers when business is selected
  useEffect(() => {
    const fetchCustomers = async () => {
      if (formData.businessId) {
        const response = await adminService.getCustomers({ businessId: formData.businessId });
        if (response.success) {
          setCustomers(response.data || []);
        }
      }
    };
    fetchCustomers();
  }, [formData.businessId]);

  // Calculate audience count
  const calculateAudienceCount = useCallback(async () => {
    if (!formData.businessId) return;

    setLoadingAudienceCount(true);
    try {
      const payload = {
        businessId: formData.businessId,
        targetAudience: formData.targetAudience,
        targetCustomers: formData.targetCustomers,
        segmentFilters: formData.segmentFilters
      };

      // This would call a backend endpoint to get the count
      // For now, we'll calculate locally
      if (formData.targetAudience === 'all') {
        setAudienceCount(customers.length);
      } else if (formData.targetAudience === 'specific') {
        setAudienceCount(formData.targetCustomers.length);
      } else {
        // For segment, would need backend calculation
        setAudienceCount(0);
      }
    } finally {
      setLoadingAudienceCount(false);
    }
  }, [formData.businessId, formData.targetAudience, formData.targetCustomers, formData.segmentFilters, customers]);

  useEffect(() => {
    calculateAudienceCount();
  }, [calculateAudienceCount]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
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

    if (formData.channels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.createCampaign(formData);

      if (response.success) {
        toast.success('Campaign created successfully!');
        navigate('/admin/campaigns');
      } else {
        toast.error(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <BackButton />
        <h1 className="text-2xl font-bold text-gray-900">Create Marketing Campaign</h1>
        <p className="text-gray-600 mt-1">Design and launch targeted marketing campaigns</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Business Selection */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Business</h2>
            <select
              value={formData.businessId}
              onChange={(e) => handleChange('businessId', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a business</option>
              {businesses.map(business => (
                <option key={business._id} value={business._id}>{business.name}</option>
              ))}
            </select>
          </div>

          {/* Campaign Information */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description of the campaign"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                >
                  <option value="promotional">Promotional</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="loyalty">Loyalty</option>
                  <option value="reactivation">Reactivation</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="referral">Referral</option>
                  <option value="feedback">Feedback</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channels <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {['email', 'sms', 'whatsapp', 'push_notification', 'in_app'].map(channel => (
                  <label key={channel} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel)}
                      onChange={() => handleChannelToggle(channel)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {channel.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineUserGroup className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Target Audience</h2>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  checked={formData.targetAudience === 'all'}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">All Customers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="specific"
                  checked={formData.targetAudience === 'specific'}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">Specific Customers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="segment"
                  checked={formData.targetAudience === 'segment'}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">Segment</span>
              </label>
            </div>

            {formData.targetAudience === 'segment' && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-sm font-semibold text-gray-900">Segment Filters</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                    <select
                      multiple
                      value={formData.segmentFilters.customerType}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        handleNestedChange('segmentFilters', 'customerType', selected);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      size="4"
                    >
                      <option value="new">New</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Membership Tier</label>
                    <select
                      multiple
                      value={formData.segmentFilters.membershipTier}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        handleNestedChange('segmentFilters', 'membershipTier', selected);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      size="4"
                    >
                      <option value="none">None</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Total Spent</label>
                    <input
                      type="number"
                      value={formData.segmentFilters.minTotalSpent}
                      onChange={(e) => handleNestedChange('segmentFilters', 'minTotalSpent', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Total Spent</label>
                    <input
                      type="number"
                      value={formData.segmentFilters.maxTotalSpent}
                      onChange={(e) => handleNestedChange('segmentFilters', 'maxTotalSpent', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Visits</label>
                    <input
                      type="number"
                      value={formData.segmentFilters.minVisits}
                      onChange={(e) => handleNestedChange('segmentFilters', 'minVisits', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Visits</label>
                    <input
                      type="number"
                      value={formData.segmentFilters.maxVisits}
                      onChange={(e) => handleNestedChange('segmentFilters', 'maxVisits', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.segmentFilters.hasEmail}
                      onChange={(e) => handleNestedChange('segmentFilters', 'hasEmail', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Has Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.segmentFilters.hasPhone}
                      onChange={(e) => handleNestedChange('segmentFilters', 'hasPhone', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Has Phone</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineMail className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Message Content</h2>
            </div>

            {formData.channels.includes('email') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.message.subject}
                  onChange={(e) => handleNestedChange('message', 'subject', e.target.value)}
                  required={formData.channels.includes('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  placeholder="Your email subject line"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message.body}
                onChange={(e) => handleNestedChange('message', 'body', e.target.value)}
                required
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Your message content here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.channels.includes('sms') && `${formData.message.body.length}/160 characters`}
              </p>
            </div>
          </div>

          {/* Offer Configuration */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineTag className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Offer (Optional)</h2>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.offer.hasOffer}
                onChange={(e) => handleNestedChange('offer', 'hasOffer', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Include an offer or discount</span>
            </label>

            {formData.offer.hasOffer && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                    <select
                      value={formData.offer.offerType}
                      onChange={(e) => handleNestedChange('offer', 'offerType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    >
                      <option value="percentage">Percentage Discount</option>
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
                      onChange={(e) => handleNestedChange('offer', 'offerValue', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder={formData.offer.offerType === 'percentage' ? '10' : '100'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                    <input
                      type="text"
                      value={formData.offer.promoCode}
                      onChange={(e) => handleNestedChange('offer', 'promoCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={formData.offer.validUntil}
                      onChange={(e) => handleNestedChange('offer', 'validUntil', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineCalendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleChange('scheduledTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Leave empty to send immediately after creation
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/campaigns')}
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
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>

        {/* Sidebar - Preview & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Audience Preview */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineEye className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900">Audience Preview</h3>
            </div>
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-primary-600">
                {loadingAudienceCount ? '...' : audienceCount}
              </p>
              <p className="text-sm text-gray-600 mt-2">Estimated Recipients</p>
            </div>
            {formData.channels.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Selected Channels:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.channels.map(channel => (
                    <span
                      key={channel}
                      className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded capitalize"
                    >
                      {channel.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded p-6">
            <div className="flex items-start gap-3">
              <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Campaign Tips</h3>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>• Choose the right channel for your audience</li>
                  <li>• Keep email subjects under 50 characters</li>
                  <li>• SMS messages work best under 160 characters</li>
                  <li>• Test your message before launching</li>
                  <li>• Include a clear call-to-action</li>
                  <li>• Schedule campaigns for optimal times</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
