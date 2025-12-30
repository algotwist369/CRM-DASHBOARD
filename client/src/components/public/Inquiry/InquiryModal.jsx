import React from 'react';
import Modal from '../../common/Modal/Modal';
import InquiryForm from './InquiryForm';

const InquiryModal = ({ isOpen, onClose, businessId, businessName, businessLink }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Enquiry"
            size="md"
            draggable={false}
        >
            <InquiryForm
                businessId={businessId}
                businessName={businessName}
                businessLink={businessLink}
                onCancel={onClose}
                onSuccess={() => {
                }}
            />
        </Modal>
    );
};

export default InquiryModal;
