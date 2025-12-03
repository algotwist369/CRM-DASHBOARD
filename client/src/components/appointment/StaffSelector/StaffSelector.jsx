import React, { useState, useMemo } from 'react'
import { Badge, Input, Dropdown } from '../../common'
import { FiCheck, FiMail, FiPhone, FiUser } from 'react-icons/fi'

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

  const getStaffId = (member) => member?._id || member?.id || member?.staffId || member?.email || member?.name

  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set()
    staff.forEach(member => member.specialties?.forEach(specialty => specialties.add(specialty)))
    return Array.from(specialties)
  }, [staff])

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const lowerTerm = searchTerm.toLowerCase()
      const nameMatch = member.name?.toLowerCase().includes(lowerTerm)
      const specialtyMatch = member.specialties?.some(s => s.toLowerCase().includes(lowerTerm))
      const matchesSearch = !searchTerm || nameMatch || specialtyMatch
      const matchesSpecialty = !filterSpecialty || member.specialties?.includes(filterSpecialty)
      return matchesSearch && matchesSpecialty
    })
  }, [staff, searchTerm, filterSpecialty])

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
    const isSelected = getStaffId(selectedStaff) === getStaffId(staffMember)
    const availability = getAvailabilityStatus(staffMember)
    const baseClasses = 'w-full p-4 text-left border  transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
    
    if (disabled || availability.status === 'unavailable') {
      return `${baseClasses} bg-gray-50 border-gray-200 cursor-not-allowed opacity-60`
    }
    
    if (isSelected) {
      return `${baseClasses} bg-gray-900 text-white border-gray-900 shadow-lg focus-visible:ring-gray-700`
    }
    
    return `${baseClasses} bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-500`
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

  return (
    <div className={`space-y-6 ${className}`}>
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
        
        {showSpecialties && uniqueSpecialties.length > 0 && (
          <Dropdown
            options={[
              { label: 'All Specialties', value: '' },
              ...uniqueSpecialties.map(specialty => ({
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
            const isSelected = getStaffId(selectedStaff) === getStaffId(staffMember)

            return (
              <button
                key={getStaffId(staffMember)}
                onClick={() => handleStaffSelect(staffMember)}
                className={getStaffClasses(staffMember)}
                disabled={disabled || availability.status === 'unavailable'}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      {staffMember.avatar ? (
                        <img
                          src={staffMember.avatar}
                          alt={staffMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {staffMember.name}
                      </h4>
                      {staffMember.title && (
                        <p className="text-sm text-gray-600">
                          {staffMember.title}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <FiCheck className="text-primary-600 text-lg" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    {showSpecialties && staffMember.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {staffMember.specialties.map((specialty, index) => (
                          <Badge key={index} variant="default" size="sm">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                      {staffMember.phone && (
                        <span className="inline-flex items-center gap-1">
                          <FiPhone className="text-gray-400" />
                          {staffMember.phone}
                        </span>
                      )}
                      {staffMember.email && (
                        <span className="inline-flex items-center gap-1">
                          <FiMail className="text-gray-400" />
                          {staffMember.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                      {showRating && staffMember.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {renderStars(staffMember.rating)}
                          </div>
                          <span className="text-gray-600 text-xs sm:text-sm">
                            {staffMember.rating} ({staffMember.reviewCount || 0})
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
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 ">
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
