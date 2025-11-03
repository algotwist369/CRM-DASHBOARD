import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineStar, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
    </div>
  </div>
));

const ReviewRow = memo(({ review, onView, onApprove, onReject }) => {
  const statusColors = { approved: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{review.customerName}</div>
        <div className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4"><div className="text-sm text-gray-900 line-clamp-2">{review.comment}</div></td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (<HiOutlineStar key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[review.status]}`}>{review.status}</span></td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(review._id)} className="text-blue-600 hover:text-blue-900 mr-2"><HiOutlineEye className="w-5 h-5" /></button>
        {review.status === 'pending' && (<><button onClick={() => onApprove(review._id)} className="text-green-600 hover:text-green-900 mr-2"><HiOutlineCheck className="w-5 h-5" /></button><button onClick={() => onReject(review._id)} className="text-red-600 hover:text-red-900"><HiOutlineX className="w-5 h-5" /></button></>)}
      </td>
    </tr>
  );
});

const ReviewList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, avgRating: 0 });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setReviews([
        { _id: '1', customerName: 'John Doe', comment: 'Excellent service! Very satisfied.', rating: 5, date: new Date(), status: 'approved' },
        { _id: '2', customerName: 'Jane Smith', comment: 'Good experience, would recommend.', rating: 4, date: new Date(), status: 'pending' },
      ]);
      setStats({ total: 324, approved: 298, pending: 26, avgRating: 4.5 });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineStar className="text-primary-600" />Reviews & Ratings</h1><p className="text-gray-600 mt-1">Manage customer reviews</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Reviews" value={stats.total} icon={<HiOutlineStar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard title="Approved" value={stats.approved} icon={<HiOutlineCheck className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard title="Pending" value={stats.pending} icon={<HiOutlineStar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard title="Avg Rating" value={stats.avgRating} icon={<HiOutlineStar className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
              ) : (
                reviews.map((review) => <ReviewRow key={review._id} review={review} onView={(id) => navigate(`/admin/reviews/${id}`)} onApprove={(id) => console.log('Approve:', id)} onReject={(id) => console.log('Reject:', id)} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;

