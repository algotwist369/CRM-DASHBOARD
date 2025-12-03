import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineMail, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineTemplate,
  HiOutlineDuplicate, HiOutlineStar
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white border border-gray-200 rounded p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
));

const TemplateCard = memo(({ template, onView, onEdit, onDelete, onUse }) => {
  const getChannelBadge = (channel) => {
    const badges = {
      email: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800',
      whatsapp: 'bg-emerald-100 text-emerald-800',
      push_notification: 'bg-purple-100 text-purple-800'
    };
    return badges[channel] || badges.email;
  };

  const getCategoryBadge = (category) => {
    const badges = {
      welcome: 'bg-blue-100 text-blue-800',
      birthday: 'bg-pink-100 text-pink-800',
      anniversary: 'bg-purple-100 text-purple-800',
      promotional: 'bg-orange-100 text-orange-800',
      seasonal: 'bg-red-100 text-red-800',
      retention: 'bg-indigo-100 text-indigo-800',
      reactivation: 'bg-yellow-100 text-yellow-800',
      feedback: 'bg-teal-100 text-teal-800',
      thank_you: 'bg-green-100 text-green-800',
      review_request: 'bg-cyan-100 text-cyan-800',
      appointment_reminder: 'bg-violet-100 text-violet-800',
      loyalty: 'bg-amber-100 text-amber-800',
      referral: 'bg-lime-100 text-lime-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return badges[category] || badges.promotional;
  };

  return (
    <div className="bg-white rounded border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              {template.stats?.timesUsed > 10 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <HiOutlineStar className="w-3 h-3" />
                  Popular
                </span>
              )}
              {template.isPublic && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Public
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(template.category)}`}>
            {template.category.replace('_', ' ')}
          </span>
          {template.defaultChannels?.slice(0, 2).map(channel => (
            <span key={channel} className={`px-2 py-1 text-xs font-semibold rounded-full ${getChannelBadge(channel)}`}>
              {channel.replace('_', ' ')}
            </span>
          ))}
          {template.defaultChannels?.length > 2 && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              +{template.defaultChannels.length - 2}
            </span>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded p-4 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">PREVIEW:</p>
          {template.message?.subject && (
            <p className="text-xs font-semibold text-gray-700 mb-1">{template.message.subject}</p>
          )}
          <p className="text-sm text-gray-700 line-clamp-3">
            {template.message?.body || 'No content preview available'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Used</p>
            <p className="text-lg font-semibold text-gray-900">{template.stats?.timesUsed || 0}x</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Open Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {template.stats?.avgOpenRate ? `${template.stats.avgOpenRate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUse(template._id)}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <HiOutlineDuplicate className="w-4 h-4" />
            Use Template
          </button>
          <button
            onClick={() => onView(template._id)}
            className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            title="View"
          >
            <HiOutlineEye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(template._id)}
            className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            title="Edit"
          >
            <HiOutlinePencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(template._id)}
            className="px-3 py-2 border border-red-300 rounded text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

const CampaignTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [stats, setStats] = useState({ total: 0, popular: 0, public: 0, avgUsage: 0 });

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await adminService.getCampaignTemplates({
        search: searchTerm,
        type: filterType,
        category: filterCategory
      });

      if (response.success) {
        const templateData = response.data || [];
        setTemplates(templateData);

        // Calculate stats
        const popular = templateData.filter(t => (t.stats?.timesUsed || 0) > 10).length;
        const publicTemplates = templateData.filter(t => t.isPublic).length;
        const totalUsage = templateData.reduce((sum, t) => sum + (t.stats?.timesUsed || 0), 0);

        setStats({
          total: templateData.length,
          popular,
          public: publicTemplates,
          avgUsage: templateData.length > 0 ? Math.round(totalUsage / templateData.length) : 0
        });
      } else {
        toast.error(response.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleUseTemplate = (id) => {
    // Navigate to create campaign with template pre-filled
    navigate(`/admin/campaigns/create?template=${id}`);
  };

  const handleView = (id) => {
    // Navigate to template details/preview
    navigate(`/admin/campaigns/templates/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/campaigns/templates/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const response = await adminService.deleteCampaignTemplate(id);
      if (response.success) {
        toast.success('Template deleted successfully!');
        fetchTemplates(); // Reload templates
      } else {
        toast.error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineTemplate className="text-primary-600" />
            Campaign Templates
          </h1>
          <p className="text-gray-600 mt-1">Reusable templates for your marketing campaigns</p>
        </div>
        <button
          onClick={() => navigate('/admin/campaigns/templates/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Templates"
          value={stats.total}
          icon={<HiOutlineTemplate className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
        />
        <StatsCard
          title="Popular"
          value={stats.popular}
          icon={<HiOutlineStar className="w-6 h-6 text-yellow-600" />}
          color="text-yellow-600"
        />
        <StatsCard
          title="Public"
          value={stats.public}
          icon={<HiOutlineMail className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
        />
        <StatsCard
          title="Avg Usage"
          value={stats.avgUsage}
          icon={<HiOutlineDuplicate className="w-6 h-6 text-green-600" />}
          color="text-green-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="push_notification">Push Notification</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
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

          {/* Refresh Button */}
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-12 text-center">
          <HiOutlineTemplate className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first campaign template.</p>
          <button
            onClick={() => navigate('/admin/campaigns/templates/create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignTemplates;
