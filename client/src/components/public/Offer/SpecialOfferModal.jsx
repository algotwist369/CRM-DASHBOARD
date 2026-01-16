import React, { useEffect } from 'react';
import { FaGift, FaClock, FaArrowRight, FaTimes } from 'react-icons/fa';
import Modal from '../../common/Modal/Modal';

const SpecialOfferModal = ({ isOpen, onClose, onBookNow }) => {
    // Auto-close after 30 seconds if no action
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(onClose, 30000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="md"
            draggable={false}
            hideHeader={true} // Custom header for visual impact
        >
            <div className="relative overflow-hidden">
                {/* Close Button (Custom placement) */}
                {/* <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 text-white bg-white/20 backdrop-blur-sm rounded-full text-gray-500 hover:text-gray-800 hover:bg-white/40 transition-all"
                >
                    <FaTimes />
                </button> */}

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-600 to-primary-800 rounded-b-[50%] scale-x-150 -translate-y-10 z-0" />

                <div className="relative z-10 pt-8 pb-6 px-6 text-center">
                    {/* Icon Badge */}
                    <div className="mx-auto w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 border-4 border-primary-50 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                        <FaGift className="text-4xl text-primary-600 animate-pulse" />
                    </div>

                    {/* Headline */}
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Wait! <span className="text-primary-600">40% OFF</span>
                    </h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Exclusive offer for your first booking today!
                    </p>

                    {/* Offer Details Box */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-orange-700 font-bold mb-1">
                            <FaClock className="text-orange-500" />
                            <span>Limited Time Offer</span>
                        </div>
                        <p className="text-sm text-orange-600/80">
                            Valid for the next 4 hours only
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onBookNow}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            Claim 40% OFF Now
                            <FaArrowRight className="text-sm" />
                        </button>

                        <button
                            onClick={onBookNow}
                            className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors py-2"
                        >
                            No thanks, I'll pay full price
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SpecialOfferModal;
