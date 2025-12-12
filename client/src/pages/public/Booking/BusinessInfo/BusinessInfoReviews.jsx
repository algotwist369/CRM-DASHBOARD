import React from 'react'
import { FaStar } from 'react-icons/fa'
import toast from 'react-hot-toast'

const BusinessInfoReviews = ({ business }) => {
    return (
        <div className="mt-8 lg:mt-12 bg-white   border border-gray-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span>Reviews & Ratings</span>
                </h2>
                <button
                    onClick={() => toast.success("Review submission feature coming soon!")}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold  transition-colors flex items-center gap-2"
                >
                    <FaStar className="text-sm" />
                    Write a Review
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="lg:col-span-1 bg-gray-50  p-6 h-fit">
                    <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{business.ratings?.average?.toFixed(1) || '0.0'}</div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`${star <= Math.round(business.ratings?.average || 0)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        } text-xl`}
                                />
                            ))}
                        </div>
                        <div className="text-gray-500 text-sm">{business.ratings?.totalReviews || 0} reviews</div>
                    </div>

                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="font-medium text-gray-700 w-3">{star}</span>
                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${Math.random() * 100}%` }} // Dummy percentage
                                    ></div>
                                </div>
                                <span className="text-gray-500 w-8 text-right">0%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                        U{review}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">User Name {review}</div>
                                        <div className="text-xs text-gray-500">2 days ago</div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar key={star} className="text-yellow-400 text-sm" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    ))}

                    <button className="w-full py-3 text-primary-600 font-medium hover:bg-primary-50  transition-colors border border-dashed border-primary-200">
                        View All Reviews
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BusinessInfoReviews
