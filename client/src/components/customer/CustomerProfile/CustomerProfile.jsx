import React, { useState } from 'react'
import { Card, Button, Badge, Tabs, Modal, Alert } from '../../common'

const CustomerProfile = ({
    customer,
    onEdit,
    onDelete,
    onBookAppointment,
    onSendMessage,
    className = ''
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    if (!customer) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-lg font-medium">No customer selected</p>
                    <p className="text-sm">Select a customer to view their profile</p>
                </div>
            </div>
        )
    }

    const {
        name,
        email,
        phone,
        avatar,
        address,
        dateOfBirth,
        gender,
        totalAppointments,
        totalSpent,
        lastVisit,
        status,
        preferredServices,
        notes,
        emergencyContact,
        allergies,
        medicalConditions,
        createdAt,
        appointments = [],
        transactions = []
    } = customer

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0)
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success'
            case 'inactive': return 'danger'
            case 'vip': return 'warning'
            case 'new': return 'info'
            default: return 'default'
        }
    }

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const handleDelete = () => {
        onDelete(customer)
        setShowDeleteModal(false)
    }

    const tabs = [
        { label: 'Overview', content: 'overview' },
        { label: 'Appointments', content: 'appointments' },
        { label: 'Transactions', content: 'transactions' },
        { label: 'Medical Info', content: 'medical' }
    ]

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <p className="text-sm text-gray-900">{name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-sm text-gray-900">{email || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <p className="text-sm text-gray-900">{phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <p className="text-sm text-gray-900">
                                {formatDate(dateOfBirth)}
                                {dateOfBirth && ` (${calculateAge(dateOfBirth)} years old)`}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <p className="text-sm text-gray-900">{gender || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <Badge variant={getStatusColor(status)}>
                                {status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                        </div>
                    </div>
                    {address && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <p className="text-sm text-gray-900">{address}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{totalAppointments || 0}</p>
                        <p className="text-sm text-gray-600">Total Appointments</p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalSpent)}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{formatDate(lastVisit)}</p>
                        <p className="text-sm text-gray-600">Last Visit</p>
                    </div>
                </Card>
            </div>

            {/* Preferred Services */}
            {preferredServices && preferredServices.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Services</h3>
                        <div className="flex flex-wrap gap-2">
                            {preferredServices.map((service, index) => (
                                <Badge key={index} variant="primary">
                                    {service}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Notes */}
            {notes && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                    </div>
                </Card>
            )}

            {/* Emergency Contact */}
            {emergencyContact && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-sm text-gray-900">{emergencyContact.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-sm text-gray-900">{emergencyContact.phone}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                <p className="text-sm text-gray-900">{emergencyContact.relationship}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )

    const renderAppointments = () => (
        <div className="space-y-4">
            {appointments.length > 0 ? (
                appointments.map((appointment, index) => (
                    <Card key={index}>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">{appointment.service}</h4>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(appointment.date)} at {appointment.time}
                                    </p>
                                    <p className="text-sm text-gray-600">with {appointment.staff}</p>
                                </div>
                                <Badge variant={appointment.status === 'completed' ? 'success' : 'warning'}>
                                    {appointment.status}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No appointments found</p>
                </div>
            )}
        </div>
    )

    const renderTransactions = () => (
        <div className="space-y-4">
            {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                    <Card key={index}>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">{transaction.service}</h4>
                                    <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                                    <Badge variant={transaction.status === 'paid' ? 'success' : 'warning'}>
                                        {transaction.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <p>No transactions found</p>
                </div>
            )}
        </div>
    )

    const renderMedicalInfo = () => (
        <div className="space-y-6">
            {/* Allergies */}
            {allergies && allergies.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                            {allergies.map((allergy, index) => (
                                <Badge key={index} variant="danger">
                                    {allergy}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Medical Conditions */}
            {medicalConditions && medicalConditions.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                            {medicalConditions.map((condition, index) => (
                                <Badge key={index} variant="warning">
                                    {condition}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {(!allergies || allergies.length === 0) && (!medicalConditions || medicalConditions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No medical information recorded</p>
                </div>
            )}
        </div>
    )

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-xl">
                            {getInitials(name)}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                        <p className="text-gray-600">Customer since {formatDate(createdAt)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {onBookAppointment && (
                        <Button
                            variant="primary"
                            onClick={() => onBookAppointment(customer)}
                        >
                            Book Appointment
                        </Button>
                    )}
                    {onSendMessage && (
                        <Button
                            variant="outline"
                            onClick={() => onSendMessage(customer)}
                        >
                            Send Message
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            variant="outline"
                            onClick={() => onEdit(customer)}
                        >
                            Edit Profile
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Customer
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                defaultActiveTab={0}
            >
                {renderOverview()}
                {renderAppointments()}
                {renderTransactions()}
                {renderMedicalInfo()}
            </Tabs>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Customer"
                size="md"
            >
                <div className="space-y-4">
                    <Alert type="error">
                        This action cannot be undone. This will permanently delete the customer
                        and all associated data including appointments and transaction history.
                    </Alert>

                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>{name}</strong>?
                    </p>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="flex-1"
                        >
                            Delete Customer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default CustomerProfile
