import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineInformationCircle } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const CampaignTemplateForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    category: 'marketing',
    subject: '',
    content: '',
    isActive: true,
    isFeatured: false
  });

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = mode === 'create'
        ? await adminService.createCampaignTemplate(formData)
        : await adminService.updateCampaignTemplate(id, formData);
      
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
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setFormData({
      ...formData,
      content: before + placeholder + after
    });
    
    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const placeholders = [
    { label: 'Customer Name', value: '[NAME]' },
    { label: 'Business Name', value: '[BUSINESS_NAME]' },
    { label: 'Date', value: '[DATE]' },
    { label: 'Time', value: '[TIME]' },
    { label: 'Service', value: '[SERVICE]' },
    { label: 'Price', value: '[PRICE]' },
    { label: 'Discount', value: '[DISCOUNT]' },
    { label: 'Loyalty Points', value: '[POINTS]' },
    { label: 'Link', value: '[LINK]' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/campaigns/templates')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Templates
          </button>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Welcome Email, Birthday Wishes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Briefly describe what this template is for"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="marketing">Marketing</option>
                      <option value="transactional">Transactional</option>
                      <option value="promotional">Promotional</option>
                      <option value="announcement">Announcement</option>
                      <option value="seasonal">Seasonal</option>
                    </select>
                  </div>
                </div>

                {(formData.type === 'email') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line {formData.type === 'email' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required={formData.type === 'email'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter email subject line"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Enter your message content here. Use placeholders like [NAME], [DATE], etc."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use placeholders from the sidebar to personalize your message
                  </p>
                </div>

                <div className="flex items-center gap-6">
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Template</span>
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
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineSave className="w-5 h-5" />
              {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
            </button>
          </div>
        </div>

        {/* Sidebar - Placeholders & Help */}
        <div className="lg:col-span-1 space-y-6">
          {/* Placeholders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Available Placeholders</h3>
            <p className="text-xs text-gray-600 mb-4">Click to insert into your message</p>
            <div className="space-y-2">
              {placeholders.map((placeholder) => (
                <button
                  key={placeholder.value}
                  type="button"
                  onClick={() => insertPlaceholder(placeholder.value)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <span className="font-medium text-gray-900">{placeholder.label}</span>
                  <span className="text-gray-500 ml-2 font-mono text-xs">{placeholder.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Template Tips</h3>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>• Use placeholders to personalize messages</li>
                  <li>• Keep subject lines under 50 characters</li>
                  <li>• SMS messages should be under 160 characters</li>
                  <li>• Test your template before using it</li>
                  <li>• Include a clear call-to-action</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {formData.type === 'email' && formData.subject && (
                <div className="mb-3 pb-3 border-b border-gray-300">
                  <p className="text-xs text-gray-500">Subject:</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formData.subject}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mb-2">Message:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {formData.content || 'Your message will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignTemplateForm;

