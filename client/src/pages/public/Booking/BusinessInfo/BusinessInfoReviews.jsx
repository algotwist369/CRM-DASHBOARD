import React, { useState } from 'react'
import { FaStar, FaTimes, FaSpinner, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import appointmentService from '../../../../services/public/appointmentService' // Check relative path
import { format } from 'date-fns'

const BusinessInfoReviews = ({ business }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        review: ''
    })
    const queryClient = useQueryClient()

    // Query for reviews
    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['businessReviews', business?._id],
        queryFn: async () => {
            if (!business?._id) return { data: [], pagination: {} }
            const res = await appointmentService.getBusinessReviews(business._id)
            if (!res.success) throw new Error(res.error)
            return res.data
        },
        enabled: !!business?._id
    })

    const reviews = reviewsData?.data || []
    const totalReviews = reviewsData?.pagination?.total || 0

    // Mutation for adding review
    const addReviewMutation = useMutation({
        mutationFn: async (data) => {
            const res = await appointmentService.addBusinessReview(business._id, data)
            if (!res.success) throw new Error(res.error)
            return res.data
        },
        onSuccess: () => {
            toast.success('Review submitted successfully!')
            setIsModalOpen(false)
            setFormData({ name: '', email: '', rating: 5, review: '' })
            // Invalidate queries to refresh list and business info
            queryClient.invalidateQueries(['businessReviews', business?._id])
            queryClient.invalidateQueries(['businessInfo']) // To refresh average rating
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to submit review')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.review) {
            toast.error('Please fill in all fields')
            return
        }
        addReviewMutation.mutate(formData)
    }

    // Stars breakdown logic (using real data or business stats)
    const ratings = business?.ratings || { average: 0, totalReviews: 0, fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStar: 0 }
    const totalStars = (ratings.fiveStars || 0) + (ratings.fourStars || 0) + (ratings.threeStars || 0) + (ratings.twoStars || 0) + (ratings.oneStar || 0)

    const getPercentage = (count) => {
        if (!totalStars) return 0
        return Math.round((count / totalStars) * 100) || 0
    }

    return (
        <div className="mt-8 lg:mt-12 bg-white border border-gray-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span>Reviews & Ratings</span>
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors flex items-center gap-2 rounded-lg"
                >
                    <FaStar className="text-sm" />
                    Write a Review
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="lg:col-span-1 bg-gray-50 p-6 h-fit rounded-lg">
                    <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{ratings.average?.toFixed(1) || '0.0'}</div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`${star <= Math.round(ratings.average || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                        } text-xl`}
                                />
                            ))}
                        </div>
                        <div className="text-gray-500 text-sm">{ratings.totalReviews || 0} reviews</div>
                    </div>

                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratings[["oneStar", "twoStars", "threeStars", "fourStars", "fiveStars"][star - 1]] || 0; // Assuming key mapping or direct access if easier
                            // Actually business.ratings keys are fiveStars, oneStar...
                            const keyMap = { 5: 'fiveStars', 4: 'fourStars', 3: 'threeStars', 2: 'twoStars', 1: 'oneStar' }
                            const starCount = ratings[keyMap[star]] || 0
                            return (
                                <div key={star} className="flex items-center gap-3 text-sm">
                                    <span className="font-medium text-gray-700 w-3">{star}</span>
                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${getPercentage(starCount)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-gray-500 w-8 text-right">{getPercentage(starCount)}%</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <FaSpinner className="animate-spin text-primary-600 text-2xl" />
                        </div>
                    ) : reviews.length > 0 ? (
                        <>
                            {reviews.map((review, idx) => (
                                <div key={review._id || idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                <FaUser />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{review.guestName || review.name || 'Anonymous'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : 'Recently'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {review.review}
                                    </p>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            No reviews yet. Be the first to review!
                        </div>
                    )}
                </div>
            </div>

            {/* Write Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                        >
                                            <FaStar />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder="Share your experience..."
                                    value={formData.review}
                                    onChange={e => setFormData({ ...formData, review: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={addReviewMutation.isPending}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {addReviewMutation.isPending ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessInfoReviews
