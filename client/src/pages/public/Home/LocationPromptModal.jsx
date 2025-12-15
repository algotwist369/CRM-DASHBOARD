import React, { memo } from 'react'
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa'

/**
 * Memoized Location Prompt Modal Component
 * Only re-renders when loading state changes
 */
const LocationPromptModal = memo(({
    onAllow,
    onDeny,
    loading
}) => {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 xs:p-4 sm:p-4"
            onClick={onDeny}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 xs:p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-5 xs:mb-6">
                    <div className="w-14 h-14 xs:w-16 xs:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                        <FaMapMarkerAlt className="text-primary-600 text-xl xs:text-2xl" />
                    </div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        Enable Location Access
                    </h3>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                        Allow us to access your location to show nearby businesses and help you find the best services in your area.
                    </p>
                </div>

                <div className="space-y-2.5 xs:space-y-3">
                    <button
                        onClick={onAllow}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 xs:px-4 py-3 xs:py-3 bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-primary-700 active:bg-primary-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-base xs:text-base" />
                                <span className="text-sm xs:text-sm sm:text-base">Getting location...</span>
                            </>
                        ) : (
                            <>
                                <FaMapMarkerAlt className="text-base xs:text-base flex-shrink-0" />
                                <span className="text-sm xs:text-sm sm:text-base">Allow Location Access</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onDeny}
                        disabled={loading}
                        className="w-full px-4 xs:px-4 py-3 xs:py-3 text-gray-700 font-medium border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                    >
                        <span className="text-sm xs:text-sm sm:text-base">Not Now</span>
                    </button>
                </div>

                <p className="text-xs xs:text-xs text-gray-500 text-center mt-4 xs:mt-4 px-2">
                    You can enable this later from your browser settings
                </p>
            </div>
        </div>
    )
})

LocationPromptModal.displayName = 'LocationPromptModal'

export default LocationPromptModal
