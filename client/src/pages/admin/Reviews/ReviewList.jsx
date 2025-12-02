import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineStar, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white   border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
    </div>
  </div>
));

const ReviewRow = memo(({ review, onView, onApprove, onReject }) => {
  const statusColors = { 
    approved: 'bg-green-100 text-green-800', 
    pending: 'bg-yellow-100 text-yellow-800', 
    rejected: 'bg-red-100 text-red-800',
    flagged: 'bg-orange-100 text-orange-800'
  };

  const customerName = review.customer 
    ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'N/A'
    : review.customerSnapshot?.name || 'N/A';
  const reviewDate = review.createdAt ? new Date(review.createdAt) : review.date ? new Date(review.date) : new Date();
  const rating = review.rating || 0;
  const comment = review.review || review.comment || 'No comment';
  const status = review.status || 'pending';
  const serviceName = review.service?.name || 'N/A';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{customerName}</div>
        <div className="text-sm text-gray-500">{reviewDate.toLocaleDateString()}</div>
        {serviceName && serviceName !== 'N/A' && (
          <div className="text-xs text-gray-400">{serviceName}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 line-clamp-2">{comment}</div>
        {review.title && (
          <div className="text-xs font-medium text-gray-700 mt-1">{review.title}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <HiOutlineStar 
              key={i} 
              className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">{rating}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || statusColors.pending}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(review._id)} className="text-blue-600 hover:text-blue-900 mr-2">
          <HiOutlineEye className="w-5 h-5" />
        </button>
        {status === 'pending' && (
          <>
            <button onClick={() => onApprove(review._id)} className="text-green-600 hover:text-green-900 mr-2">
              <HiOutlineCheck className="w-5 h-5" />
            </button>
            <button onClick={() => onReject(review._id)} className="text-red-600 hover:text-red-900">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </>
        )}
      </td>
    </tr>
  );
});

const ReviewList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, avgRating: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
        if (!selectedBusinessId && response.data && response.data.length > 0) {
          const firstBusinessId = response.data[0]._id;
          setSelectedBusinessId(firstBusinessId);
          localStorage.setItem('selectedBusinessId', firstBusinessId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  }, [selectedBusinessId]);

  const fetchReviews = useCallback(async () => {
    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null' || selectedBusinessId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusinessId,
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        rating: ratingFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const [reviewsRes, statsRes] = await Promise.all([
        adminService.getReviews(params),
        adminService.getReviewStats({ businessId: selectedBusinessId })
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.data || []);
        setTotalPages(reviewsRes.pagination?.pages || 1);
      } else {
        toast.error(reviewsRes.error || 'Failed to fetch reviews');
        setReviews([]);
      }

      if (statsRes.success) {
        const statsData = statsRes.data || {};
        setStats({
          total: statsData.total || statsData.totalReviews || 0,
          approved: statsData.approved || statsData.approvedReviews || 0,
          pending: statsData.pending || statsData.pendingReviews || 0,
          avgRating: statsData.averageRating || statsData.avgRating || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, currentPage, statusFilter, ratingFilter]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchReviews();
    }
  }, [fetchReviews, selectedBusinessId]);

  const handleApprove = async (id) => {
    try {
      const response = await adminService.approveReview(id);
      if (response.success) {
        toast.success('Review approved successfully');
        fetchReviews();
      } else {
        toast.error(response.error || 'Failed to approve review');
      }
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      const response = await adminService.rejectReview(id, reason.trim());
      if (response.success) {
        toast.success('Review rejected successfully');
        fetchReviews();
      } else {
        toast.error(response.error || 'Failed to reject review');
      }
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineStar className="text-primary-600" />Reviews & Ratings</h1><p className="text-gray-600 mt-1">Manage customer reviews</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard key="total" title="Total Reviews" value={stats.total} icon={<HiOutlineStar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard key="approved" title="Approved" value={stats.approved} icon={<HiOutlineCheck className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard key="pending" title="Pending" value={stats.pending} icon={<HiOutlineStar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard key="avgRating" title="Avg Rating" value={stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'} icon={<HiOutlineStar className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200  p-4">
          <div className="flex items-center gap-3">
            <HiOutlineStar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => {
                  setSelectedBusinessId(e.target.value);
                  localStorage.setItem('selectedBusinessId', e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchReviews();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <button onClick={fetchReviews} className="px-4 py-2 border border-gray-300  hover:bg-gray-50 flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white   border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><HiOutlineStar className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No reviews found</p></td></tr>
              ) : (
                reviews.map((review, index) => (
                  <ReviewRow 
                    key={review._id || review.id || `review-${index}`} 
                    review={review} 
                    onView={(id) => navigate(`/admin/reviews/${id}`)} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;

