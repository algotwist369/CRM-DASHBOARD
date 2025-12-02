import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineStar, HiOutlineCheck, HiOutlineX, HiOutlineReply } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const ReviewDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const response = await adminService.getReview(id);
        if (response.success) {
          setReview(response.data);
        } else {
          toast.error(response.error || 'Failed to fetch review');
          navigate('/admin/reviews');
        }
      } catch (error) {
        console.error('Failed to fetch review:', error);
        toast.error('Failed to fetch review');
        navigate('/admin/reviews');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReview();
    }
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this review?')) return;
    
    try {
      setActionLoading('approve');
      const response = await adminService.approveReview(id);
      if (response.success) {
        toast.success('Review approved successfully');
        // Refresh review data
        const refreshResponse = await adminService.getReview(id);
        if (refreshResponse.success) {
          setReview(refreshResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to approve review');
      }
    } catch (error) {
      toast.error('Failed to approve review');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setActionLoading('reject');
      const response = await adminService.rejectReview(id, reason.trim());
      if (response.success) {
        toast.success('Review rejected successfully');
        // Refresh review data
        const refreshResponse = await adminService.getReview(id);
        if (refreshResponse.success) {
          setReview(refreshResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to reject review');
      }
    } catch (error) {
      toast.error('Failed to reject review');
    } finally {
      setActionLoading('');
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setActionLoading('response');
      const response = await adminService.addResponseToReview(id, { response: responseText.trim() });
      if (response.success) {
        toast.success('Response added successfully');
        setResponseText('');
        setShowResponseForm(false);
        // Refresh review data
        const refreshResponse = await adminService.getReview(id);
        if (refreshResponse.success) {
          setReview(refreshResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to add response');
      }
    } catch (error) {
      toast.error('Failed to add response');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!review) {
    return <div className="text-center py-12">Review not found</div>;
  }

  const customerName = review.customer
    ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || 'N/A'
    : review.customerSnapshot?.name || 'N/A';
  const customerEmail = review.customer?.email || review.customerSnapshot?.email || 'N/A';
  const reviewDate = review.createdAt ? new Date(review.createdAt) : new Date();
  const rating = review.rating || 0;
  const comment = review.review || 'No comment';
  const status = review.status || 'pending';
  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    flagged: 'bg-orange-100 text-orange-800'
  };

  const canApprove = status === 'pending';
  const canReject = status === 'pending';
  const canRespond = status === 'approved';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/admin/reviews')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <HiOutlineArrowLeft className="w-5 h-5" />Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
        <p className="text-gray-600 mt-1">Review ID: {review._id || review.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Information */}
        <div className="bg-white   border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Customer</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{customerName}</dd>
              {customerEmail && customerEmail !== 'N/A' && (
                <dd className="text-xs text-gray-500 mt-1">{customerEmail}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-gray-600">Service</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{review.service?.name || 'N/A'}</dd>
            </div>
            {review.staff && (
              <div>
                <dt className="text-sm text-gray-600">Staff</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{review.staff.name || 'N/A'}</dd>
              </div>
            )}
            {review.appointment && (
              <div>
                <dt className="text-sm text-gray-600">Appointment</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {review.appointment.bookingNumber || 'N/A'} - {review.appointment.appointmentDate ? new Date(review.appointment.appointmentDate).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-600">Date</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{reviewDate.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Rating</dt>
              <dd className="mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar
                      key={i}
                      className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || statusColors.pending}`}>
                  {status}
                </span>
              </dd>
            </div>
            {review.title && (
              <div>
                <dt className="text-sm text-gray-600">Title</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{review.title}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-600">Review</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{comment}</dd>
            </div>
            {review.isEdited && (
              <div>
                <dt className="text-sm text-gray-600">Edited</dt>
                <dd className="text-sm text-gray-500 mt-1">
                  {review.editedAt ? new Date(review.editedAt).toLocaleString() : 'Yes'}
                </dd>
              </div>
            )}
            {review.source && (
              <div>
                <dt className="text-sm text-gray-600">Source</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1 capitalize">{review.source}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions and Response */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading === 'approve'}
                  className="w-full px-4 py-2 border border-green-300  text-green-600 hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HiOutlineCheck className="w-5 h-5" />
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve Review'}
                </button>
              )}
              {canReject && (
                <button
                  onClick={handleReject}
                  disabled={actionLoading === 'reject'}
                  className="w-full px-4 py-2 border border-red-300  text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HiOutlineX className="w-5 h-5" />
                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Review'}
                </button>
              )}
              {status === 'approved' && (
                <div className="p-4 bg-green-50 border border-green-200 ">
                  <p className="text-sm text-green-800">This review has been approved and is published.</p>
                </div>
              )}
              {status === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 ">
                  <p className="text-sm text-red-800">This review has been rejected.</p>
                  {review.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {review.rejectionReason}</p>
                  )}
                </div>
              )}
              {status === 'flagged' && (
                <div className="p-4 bg-orange-50 border border-orange-200 ">
                  <p className="text-sm text-orange-800">This review has been flagged for moderation.</p>
                  {review.flagReason && (
                    <p className="text-xs text-orange-600 mt-1">Reason: {review.flagReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          {canRespond && (
            <div className="bg-white   border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Business Response</h3>
                {!showResponseForm && !review.response && (
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 flex items-center gap-2 text-sm"
                  >
                    <HiOutlineReply className="w-4 h-4" />
                    Add Response
                  </button>
                )}
              </div>
              
              {review.response ? (
                <div className="p-4 bg-gray-50 ">
                  <p className="text-sm text-gray-900">{review.response.response}</p>
                  {review.response.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on {new Date(review.response.respondedAt).toLocaleString()}
                    </p>
                  )}
                  {review.response.respondedBy && (
                    <p className="text-xs text-gray-500">
                      by {review.response.respondedBy.name || review.response.respondedBy.firstName || 'Admin'}
                    </p>
                  )}
                </div>
              ) : showResponseForm ? (
                <div className="space-y-3">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="4"
                    placeholder="Write a response to this review..."
                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddResponse}
                      disabled={actionLoading === 'response' || !responseText.trim()}
                      className="px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <HiOutlineReply className="w-4 h-4" />
                      {actionLoading === 'response' ? 'Saving...' : 'Submit Response'}
                    </button>
                    <button
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseText('');
                      }}
                      className="px-4 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;

