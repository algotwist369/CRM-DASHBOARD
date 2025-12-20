import React, { useState, useEffect, useRef } from 'react'
import { FaStar, FaTimes, FaSpinner, FaUser, FaThumbsUp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
    const observerRef = useRef()
    const loadMoreRef = useRef()

    // Infinite Query for reviews
    const {
        data: reviewsData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['businessReviews', business?._id],
        queryFn: async ({ pageParam = 1 }) => {
            if (!business?._id) return { data: [], pagination: {} }
            const res = await appointmentService.getBusinessReviews(business._id, { page: pageParam, limit: 10 })
            if (!res.success) throw new Error(res.error)
            return res // Return full object { data, pagination }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, pages } = lastPage.pagination || {}
            // If current page is less than total pages, return next page number
            return (page && pages && page < pages) ? page + 1 : undefined
        },
        enabled: !!business?._id
    })

    const reviews = reviewsData?.pages?.flatMap(page => page.data) || []
    // Get stats from the first page of data or fallback
    const totalReviews = reviewsData?.pages?.[0]?.pagination?.total || 0

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.5 }
        )

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current)
            }
        }
    }, [hasNextPage, fetchNextPage])

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

    const markHelpfulMutation = useMutation({
        mutationFn: async (reviewId) => {
            const res = await appointmentService.markReviewHelpful(reviewId)
            if (!res.success) throw new Error(res.error)
            return res.data
        },
        onSuccess: () => {
            toast.success('Marked as helpful')
            queryClient.invalidateQueries(['businessReviews', business?._id])
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to mark as helpful')
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
        <div className="mt-6 bg-white border border-gray-100  p-4 sm:p-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    Reviews & Ratings
                </h2>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white  font-semibold flex items-center justify-center gap-2 hover:bg-primary-700"
                >
                    <FaStar className="text-sm" />
                    Write Review
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Rating Summary – Mobile Left / Right Layout */}
                <div className="bg-gray-50  p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">

                        {/* LEFT: Average Rating */}
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                                {ratings.average?.toFixed(1) || '0.0'}
                            </div>

                            <div className="flex justify-center gap-0.5 my-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={
                                            star <= Math.round(ratings.average || 0)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }
                                        size={14}
                                    />
                                ))}
                            </div>

                            <div className="text-xs text-gray-500">
                                {ratings.totalReviews || 0} reviews
                            </div>
                        </div>

                        {/* RIGHT: Rating Distribution */}
                        <div className="col-span-1 sm:col-span-2 space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const keyMap = {
                                    5: 'fiveStars',
                                    4: 'fourStars',
                                    3: 'threeStars',
                                    2: 'twoStars',
                                    1: 'oneStar',
                                };

                                const count = ratings[keyMap[star]] || 0;

                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 text-gray-700">{star}</span>

                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400"
                                                style={{ width: `${getPercentage(count)}%` }}
                                            />
                                        </div>

                                        <span className="w-8 text-right text-gray-500">
                                            {getPercentage(count)}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div
                    className="
        lg:col-span-2
        max-h-[320px] sm:max-h-[380px]
        overflow-y-auto
        pr-2
        space-y-3
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
    "
                >
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <FaSpinner className="animate-spin text-primary-600 text-lg" />
                        </div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                            <div
                                key={review._id || idx}
                                className="flex gap-3 border-b last:border-0 pb-3"
                            >
                                {/* LEFT: Name + Review */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm truncate">
                                        {review.guestName || review.name || 'Anonymous'}
                                    </p>

                                    <p className="text-xs sm:text-sm text-gray-600 leading-snug line-clamp-3">
                                        {review.review}
                                    </p>

                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => markHelpfulMutation.mutate(review._id)}
                                            disabled={markHelpfulMutation.isPending}
                                            className="text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-1.5 text-[10px] sm:text-xs group"
                                            title="Mark as helpful"
                                        >
                                            <FaThumbsUp className="group-hover:scale-110 transition-transform" />
                                            <span>Helpful</span>
                                        </button>

                                        {review.helpfulPercentage > 0 && (
                                            <p className="text-[10px] text-gray-400">
                                                {review.helpfulPercentage}% found this helpful
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: Rating + Date */}
                                <div className="flex flex-col items-end text-right flex-shrink-0 min-w-[64px]">
                                    <div className="flex gap-0.5 mb-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={
                                                    star <= review.rating
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                                size={10}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                        {review.createdAt
                                            ? format(new Date(review.createdAt), 'MMM dd')
                                            : 'Recent'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 bg-gray-50  py-6 text-sm">
                            No reviews yet. Be the first to review!
                        </div>
                    )}

                    {/* Infinite Scroll Loader / Trigger */}
                    {(hasNextPage || isFetchingNextPage) && (
                        <div ref={loadMoreRef} className="py-4 flex justify-center w-full">
                            {isFetchingNextPage ? (
                                <FaSpinner className="animate-spin text-primary-600 text-sm" />
                            ) : (
                                <span className="h-4 block" /> // Invisible trigger
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Write Review Modal – Mobile Bottom Sheet */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm: p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Write a Review</h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                required
                                placeholder="Your Name"
                                className="w-full border  px-3 py-2"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />

                            <input
                                required
                                type="email"
                                placeholder="Email"
                                className="w-full border  px-3 py-2"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />

                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className={`text-2xl ${formData.rating >= star
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    >
                                        <FaStar />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                required
                                rows={3}
                                placeholder="Your review..."
                                className="w-full border  px-3 py-2 resize-none"
                                value={formData.review}
                                onChange={e => setFormData({ ...formData, review: e.target.value })}
                            />

                            <button
                                type="submit"
                                disabled={addReviewMutation.isPending}
                                className="w-full py-3 bg-primary-600 text-white  font-bold"
                            >
                                {addReviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>

    )
}

export default BusinessInfoReviews
