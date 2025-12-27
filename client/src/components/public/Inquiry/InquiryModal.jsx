import React from 'react';
import Modal from '../../common/Modal/Modal';
import InquiryForm from './InquiryForm';
 
const InquiryModal = ({ isOpen, onClose, businessId, businessName }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Inquiry"
            size="md"
            draggable={false}
        >
            <InquiryForm
                businessId={businessId}
                businessName={businessName}
                onCancel={onClose}
                onSuccess={() => {
                }}
            />
        </Modal>
    );
};

export default InquiryModal;
