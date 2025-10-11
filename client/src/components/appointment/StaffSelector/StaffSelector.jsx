import React, { useState } from 'react'
import { Badge, Input, Dropdown } from '../../common'

const StaffSelector = ({ 
  staff = [],
  selectedStaff,
  onStaffSelect,
  selectedDate,
  selectedTime,
  showAvailability = true,
  showSpecialties = true,
  showRating = true,
  disabled = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = !filterSpecialty || member.specialties?.includes(filterSpecialty)
    return matchesSearch && matchesSpecialty
  })

  const handleStaffSelect = (staffMember) => {
    if (disabled) return
    onStaffSelect(staffMember)
  }

  const getAvailabilityStatus = (staffMember) => {
    if (!showAvailability || !selectedDate || !selectedTime) {
      return { status: 'unknown', text: 'Availability unknown' }
    }

    // Check if staff member is available for the selected time
    const isAvailable = staffMember.availability?.some(slot => 
      slot.date === selectedDate && 
      slot.timeSlots?.includes(selectedTime)
    )

    if (isAvailable) {
      return { status: 'available', text: 'Available' }
    } else {
      return { status: 'unavailable', text: 'Not available' }
    }
  }

  const getStaffClasses = (staffMember) => {
    const isSelected = selectedStaff?.id === staffMember.id
    const availability = getAvailabilityStatus(staffMember)
    const baseClasses = 'w-full p-4 text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    if (disabled || availability.status === 'unavailable') {
      return `${baseClasses} bg-gray-50 border-gray-200 cursor-not-allowed opacity-60`
    }
    
    if (isSelected) {
      return `${baseClasses} bg-primary-50 border-primary-300 ring-2 ring-primary-200`
    }
    
    return `${baseClasses} bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 focus:ring-primary-500`
  }

  const getAvailabilityBadgeColor = (status) => {
    switch (status) {
      case 'available': return 'success'
      case 'unavailable': return 'danger'
      default: return 'default'
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    return stars
  }

  const getUniqueSpecialties = () => {
    const specialties = new Set()
    staff.forEach(member => {
      member.specialties?.forEach(specialty => specialties.add(specialty))
    })
    return Array.from(specialties)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select Staff Member
        </h3>
        {selectedStaff && (
          <p className="text-sm text-gray-600">
            Selected: {selectedStaff.name}
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <Input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {showSpecialties && getUniqueSpecialties().length > 0 && (
          <Dropdown
            options={[
              { label: 'All Specialties', value: '' },
              ...getUniqueSpecialties().map(specialty => ({
                label: specialty,
                value: specialty
              }))
            ]}
            value={filterSpecialty}
            onChange={setFilterSpecialty}
            placeholder="Filter by specialty"
            optionLabel="label"
            optionValue="value"
          />
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid gap-3">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>No staff members found</p>
          </div>
        ) : (
          filteredStaff.map((staffMember) => {
            const availability = getAvailabilityStatus(staffMember)
            const isSelected = selectedStaff?.id === staffMember.id

            return (
              <button
                key={staffMember.id}
                onClick={() => handleStaffSelect(staffMember)}
                className={getStaffClasses(staffMember)}
                disabled={disabled || availability.status === 'unavailable'}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {staffMember.avatar ? (
                        <img
                          src={staffMember.avatar}
                          alt={staffMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 truncate">
                          {staffMember.name}
                        </h4>
                        {staffMember.title && (
                          <p className="text-sm text-gray-600">
                            {staffMember.title}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Specialties */}
                    {showSpecialties && staffMember.specialties && staffMember.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {staffMember.specialties.map((specialty, index) => (
                          <Badge key={index} variant="default" size="sm">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Rating and Availability */}
                    <div className="flex items-center gap-4 text-sm">
                      {showRating && staffMember.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {renderStars(staffMember.rating)}
                          </div>
                          <span className="text-gray-600">
                            {staffMember.rating} ({staffMember.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                      
                      {showAvailability && (
                        <Badge variant={getAvailabilityBadgeColor(availability.status)} size="sm">
                          {availability.text}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Selected Staff Summary */}
      {selectedStaff && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              {selectedStaff.avatar ? (
                <img
                  src={selectedStaff.avatar}
                  alt={selectedStaff.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-medium text-primary-800">
                {selectedStaff.name}
              </h4>
              {selectedStaff.title && (
                <p className="text-sm text-primary-600">
                  {selectedStaff.title}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffSelector
