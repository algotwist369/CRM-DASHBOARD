import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineInformationCircle } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const CampaignTemplateForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'promotional',
    campaignType: 'promotional',
    message: {
      subject: '',
      body: '',
      variables: []
    },
    emailContent: {
      htmlBody: '',
      previewText: ''
    },
    defaultChannels: ['email'],
    defaultOffer: {
      hasOffer: false,
      offerType: 'percentage',
      offerValue: 0,
      validityDays: 7
    },
    suggestedAudience: {
      customerType: [],
      membershipTier: []
    },
    businessId: '',
    isPublic: true,
    isActive: true,
    tags: []
  });

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const response = await adminService.getCampaignTemplate(id);
          if (response.success) {
            setFormData(response.data);
          } else {
            toast.error(response.error || 'Failed to fetch template');
            navigate('/admin/campaigns/templates');
          }
        } catch (error) {
          console.error('Failed to fetch template:', error);
          toast.error('Failed to fetch template');
          navigate('/admin/campaigns/templates');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTemplate();
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

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      defaultChannels: prev.defaultChannels.includes(channel)
        ? prev.defaultChannels.filter(c => c !== channel)
        : [...prev.defaultChannels, channel]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract used variables from message body
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...formData.message.body.matchAll(variableRegex)];
    const variables = [...new Set(matches.map(m => m[1]))];

    const submitData = {
      ...formData,
      message: {
        ...formData.message,
        variables
      },
      businessId: formData.businessId || undefined
    };

    try {
      setLoading(true);
      const response = mode === 'create'
        ? await adminService.createCampaignTemplate(submitData)
        : await adminService.updateCampaignTemplate(id, submitData);

      if (response.success) {
        toast.success(`Template ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        navigate('/admin/campaigns/templates');
      } else {
        toast.error(response.error || `Failed to ${mode} template`);
      }
    } catch (error) {
      console.error(`Failed to ${mode} template:`, error);
      toast.error(`Failed to ${mode} template`);
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('messageBody');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.message.body;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    handleNestedChange('message', 'body', before + placeholder + after);

    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const placeholders = [
    { label: 'Customer Name', value: '{{customerName}}' },
    { label: 'Business Name', value: '{{businessName}}' },
    { label: 'Date', value: '{{date}}' },
    { label: 'Time', value: '{{time}}' },
    { label: 'Service', value: '{{serviceName}}' },
    { label: 'Price', value: '{{price}}' },
    { label: 'Discount', value: '{{discountAmount}}' },
    { label: 'Offer Value', value: '{{offerValue}}' },
    { label: 'Promo Code', value: '{{promoCode}}' },
    { label: 'Loyalty Points', value: '{{loyaltyPoints}}' },
    { label: 'Link', value: '{{link}}' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Campaign Template' : 'Edit Campaign Template'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'create' ? 'Create a reusable template for your campaigns' : 'Update template information'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Welcome Email, Birthday Wishes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Briefly describe what this template is for"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="welcome">Welcome</option>
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="promotional">Promotional</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="retention">Retention</option>
                      <option value="reactivation">Reactivation</option>
                      <option value="feedback">Feedback</option>
                      <option value="thank_you">Thank You</option>
                      <option value="review_request">Review Request</option>
                      <option value="appointment_reminder">Appointment Reminder</option>
                      <option value="loyalty">Loyalty</option>
                      <option value="referral">Referral</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="campaignType"
                      value={formData.campaignType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    Business (Optional)
                  </label>
                  <select
                    name="businessId"
                    value={formData.businessId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">System-wide template</option>
                    {businesses.map(business => (
                      <option key={business._id} value={business._id}>{business.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for system-wide templates available to all businesses
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Channels <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['email', 'sms', 'whatsapp', 'push_notification'].map(channel => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.defaultChannels.includes(channel)}
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

                {formData.defaultChannels.includes('email') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.message.subject}
                      onChange={(e) => handleNestedChange('message', 'subject', e.target.value)}
                      required={formData.defaultChannels.includes('email')}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter email subject line (use {{variables}})"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="messageBody"
                    value={formData.message.body}
                    onChange={(e) => handleNestedChange('message', 'body', e.target.value)}
                    required
                    rows="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Enter your message content here. Use placeholders like {{customerName}}, {{date}}, etc."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use {'{{variable}}'} format for placeholders. Click buttons on the right to insert.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Public Template</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/campaigns/templates')}
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
            </button>
          </div>
        </div>

        {/* Sidebar - Placeholders & Help */}
        <div className="lg:col-span-1 space-y-6">
          {/* Placeholders */}
          <div className="bg-white border border-gray-200 rounded p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Available Placeholders</h3>
            <p className="text-xs text-gray-600 mb-4">Click to insert into your message</p>
            <div className="space-y-2">
              {placeholders.map((placeholder) => (
                <button
                  key={placeholder.value}
                  type="button"
                  onClick={() => insertPlaceholder(placeholder.value)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                >
                  <span className="font-medium text-gray-900">{placeholder.label}</span>
                  <span className="text-gray-500 ml-2 font-mono text-xs">{placeholder.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Template Tips</h3>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>• Use {'{{variable}}'} format for dynamic content</li>
                  <li>• Keep subject lines under 50 characters</li>
                  <li>• SMS messages should be under 160 characters</li>
                  <li>• Test your template before using it in campaigns</li>
                  <li>• Include a clear call-to-action</li>
                  <li>• Public templates are available to all businesses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              {formData.defaultChannels.includes('email') && formData.message.subject && (
                <div className="mb-3 pb-3 border-b border-gray-300">
                  <p className="text-xs text-gray-500">Subject:</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formData.message.subject}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mb-2">Message:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {formData.message.body || 'Your message will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignTemplateForm;
